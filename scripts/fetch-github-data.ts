import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { Octokit } from "@octokit/rest";
import { generatedSchema, type GeneratedData, type MergedPullRequest } from "./lib/schema.js";
import { readJson, stableJson, writeIfChanged } from "./lib/io.js";

type SearchItem = {
  html_url: string;
  number: number;
  title: string;
  repository_url: string;
  pull_request?: { merged_at?: string | null };
};

export function classifyContribution(title: string): MergedPullRequest["category"] {
  const normalized = title.toLowerCase();
  const rules: Array<[readonly string[], MergedPullRequest["category"]]> = [
    [["stock", "tushare", "finance", "news relevance", "外股", "股票"], "Finance"],
    [["i18n", "ui", "web", "modal", "toast", "carousel", "composer"], "Frontend"],
    [["gateway", "provider", "openai", "image edits", "byok"], "AI Gateway"],
    [["daemon", "docker", "installer", "persistence", "deploy"], "Infrastructure"],
    [["docs", "readme", "documentation"], "Documentation"],
    [["test", "coverage", "spec"], "Testing"],
    [["security", "auth", "permission", "vulnerability"], "Security"],
    [["agent", "runtime", "tool call"], "Agent Runtime"],
    [["api", "server", "database", "mongo"], "Backend"]
  ];
  return rules.find(([keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[1] ?? "Engineering";
}

export function filterMergedExternalPullRequests(
  items: SearchItem[],
  username: string
): MergedPullRequest[] {
  const seen = new Set<string>();
  const result: MergedPullRequest[] = [];
  for (const item of items) {
    const match = item.repository_url.match(/repos\/([^/]+)\/([^/]+)$/);
    const mergedAt = item.pull_request?.merged_at;
    if (!match || !mergedAt) continue;
    const [, owner, repositoryName] = match;
    if (!owner || !repositoryName || owner.toLowerCase() === username.toLowerCase()) continue;
    if (seen.has(item.html_url)) continue;
    seen.add(item.html_url);
    result.push({
      repository: `${owner}/${repositoryName}`,
      number: item.number,
      title: item.title,
      category: classifyContribution(item.title),
      url: item.html_url,
      state: "MERGED",
      mergedAt
    });
  }
  return result.slice(0, 6);
}

function streaks(days: Array<{ date: string; count: number }>) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longestStreak = 0;
  let running = 0;
  for (const day of sorted) {
    running = day.count > 0 ? running + 1 : 0;
    longestStreak = Math.max(longestStreak, running);
  }
  let currentStreak = 0;
  for (const day of [...sorted].reverse()) {
    if (day.count === 0) {
      if (currentStreak === 0) continue;
      break;
    }
    currentStreak += 1;
  }
  return { currentStreak, longestStreak };
}

export function mergeLastKnownGood(
  cache: GeneratedData,
  fresh: Partial<GeneratedData>
): GeneratedData {
  const pullRequests =
    fresh.recentMergedPullRequests && fresh.recentMergedPullRequests.length > 0
      ? fresh.recentMergedPullRequests
      : cache.recentMergedPullRequests;
  const weeks = fresh.contributionSummary?.weeks;
  const contributionSummary =
    weeks && weeks.length > 0 ? fresh.contributionSummary : cache.contributionSummary;
  const repositorySummary =
    fresh.repositorySummary && fresh.repositorySummary.length > 0
      ? fresh.repositorySummary
      : cache.repositorySummary;
  return generatedSchema.parse({
    ...cache,
    ...fresh,
    recentMergedPullRequests: pullRequests,
    contributionSummary,
    repositorySummary,
    previousSuccessfulGeneration: {
      generatedAt: fresh.generatedAt ?? cache.generatedAt,
      recordCount: pullRequests.length
    }
  });
}

async function fetchPullRequests(octokit: Octokit, username: string) {
  const search = await octokit.rest.search.issuesAndPullRequests({
    q: `author:${username} is:pr is:merged`,
    sort: "updated",
    order: "desc",
    per_page: 30
  });
  const detailed: Array<SearchItem | undefined> = await Promise.all(
    search.data.items.map(async (item) => {
      const match = item.repository_url.match(/repos\/([^/]+)\/([^/]+)$/);
      if (!match) return undefined;
      const [, owner, repo] = match;
      if (!owner || !repo || owner.toLowerCase() === username.toLowerCase()) return undefined;
      const pull = await octokit.rest.pulls.get({ owner, repo, pull_number: item.number });
      return {
        html_url: item.html_url,
        number: item.number,
        title: item.title,
        repository_url: item.repository_url,
        pull_request: { merged_at: pull.data.merged_at }
      };
    })
  );
  return filterMergedExternalPullRequests(
    detailed.filter((item): item is SearchItem => item !== undefined),
    username
  );
}

async function fetchContributions(octokit: Octokit, username: string) {
  const response = await octokit.graphql<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
            }>;
          }>;
        };
      };
    };
  }>(
    `query ContributionCalendar($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }`,
    { login: username }
  );
  const calendar = response.user.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks.map((week) => ({
    days: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: day.contributionLevel
    }))
  }));
  const days = weeks.flatMap((week) => week.days);
  const { currentStreak, longestStreak } = streaks(days);
  return {
    totalContributions: calendar.totalContributions,
    activeDays: days.filter((day) => day.count > 0).length,
    currentStreak,
    longestStreak,
    weeks
  };
}

async function fetchRepositories(octokit: Octokit, repositories: string[]) {
  return Promise.all(
    repositories.map(async (repository) => {
      const [owner, repo] = repository.split("/");
      if (!owner || !repo) throw new Error(`Invalid repository: ${repository}`);
      const response = await octokit.rest.repos.get({ owner, repo });
      const hasCI = await octokit.rest.repos
        .getContent({ owner, repo, path: ".github/workflows" })
        .then(() => true)
        .catch(() => false);
      return {
        repository,
        defaultBranch: response.data.default_branch,
        isFork: response.data.fork,
        license: response.data.license?.spdx_id ?? null,
        hasReadme: response.data.size > 0,
        hasCI,
        hasDemo: Boolean(response.data.homepage)
      };
    })
  );
}

export async function refreshGitHubData(): Promise<GeneratedData> {
  const cache = await readJson("data/generated.json", generatedSchema);
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    process.stderr.write("GITHUB_TOKEN is not set; retaining the last-known-good cache.\n");
    return cache;
  }
  const octokit = new Octokit({ auth: token });
  const username = "xxiaoxiong";
  const repositories = [
    "xxiaoxiong/3DHomepage",
    "xxiaoxiong/learn-hermes-agent",
    "xxiaoxiong/awesome-multi-agent-projects",
    "xxiaoxiong/MegaDeepagents",
    "xxiaoxiong/general-agent-frame",
    "xxiaoxiong/AI-GeneralPlat",
    "xxiaoxiong/AI-Agent-Orchestration",
    "xxiaoxiong/AI-DocReviewer",
    "xxiaoxiong/Deepwiki-Local",
    "xxiaoxiong/AI-ComputerRAG",
    "xxiaoxiong/AI-DatabaseQuery"
  ];
  const fresh: Partial<GeneratedData> = {
    generatedAt: new Date().toISOString()
  };
  const failures: string[] = [];
  await Promise.all([
    fetchPullRequests(octokit, username)
      .then((value) => {
        if (value.length > 0) fresh.recentMergedPullRequests = value;
      })
      .catch((error: unknown) => failures.push(`pull requests: ${String(error)}`)),
    fetchContributions(octokit, username)
      .then((value) => {
        if (value.weeks.length > 0) fresh.contributionSummary = value;
      })
      .catch((error: unknown) => failures.push(`contributions: ${String(error)}`)),
    fetchRepositories(octokit, repositories)
      .then((value) => {
        if (value.length > 0) fresh.repositorySummary = value;
      })
      .catch((error: unknown) => failures.push(`repositories: ${String(error)}`))
  ]);
  if (failures.length > 0) {
    process.stderr.write(`GitHub API degraded; using cached sections: ${failures.join("; ")}\n`);
  }
  return mergeLastKnownGood(cache, fresh);
}

async function main() {
  const updated = await refreshGitHubData();
  await writeIfChanged("data/generated.json", stableJson(updated));
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  });
}
