import type { MergedPullRequest } from "./lib/schema.js";

export function renderOpenSourceMarkdown(pullRequests: MergedPullRequest[]): string {
  if (pullRequests.length === 0) {
    return "_GitHub API refresh pending. The last known-good non-empty cache is retained automatically._";
  }
  const rows = pullRequests.slice(0, 6).map(
    (pullRequest) =>
      `| [${pullRequest.repository} #${pullRequest.number}](${pullRequest.url}) | ${pullRequest.title.replaceAll("|", "\\|")} | ${pullRequest.category} | \`${pullRequest.state}\` |`
  );
  return `| Repository / PR | Contribution | Field | State |
|---|---|---|---|
${rows.join("\n")}`;
}
