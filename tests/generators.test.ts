import { describe, expect, it } from "vitest";
import {
  filterMergedExternalPullRequests,
  mergeLastKnownGood
} from "../scripts/fetch-github-data.js";
import { loadData } from "../scripts/lib/io.js";
import { renderContributionSwarm } from "../scripts/render-contribution-swarm.js";
import { renderHero } from "../scripts/render-hero.js";

describe("GitHub data safety", () => {
  it("keeps only merged external pull requests", () => {
    const result = filterMergedExternalPullRequests(
      [
        {
          html_url: "https://github.com/example/project/pull/7",
          number: 7,
          title: "fix: API behavior",
          repository_url: "https://api.github.com/repos/example/project",
          pull_request: { merged_at: "2026-07-25T00:00:00.000Z" }
        },
        {
          html_url: "https://github.com/xxiaoxiong/project/pull/8",
          number: 8,
          title: "internal change",
          repository_url: "https://api.github.com/repos/xxiaoxiong/project",
          pull_request: { merged_at: "2026-07-25T00:00:00.000Z" }
        },
        {
          html_url: "https://github.com/example/project/pull/9",
          number: 9,
          title: "unmerged change",
          repository_url: "https://api.github.com/repos/example/project",
          pull_request: { merged_at: null }
        }
      ],
      "xxiaoxiong"
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.state).toBe("MERGED");
    expect(result[0]?.repository).toBe("example/project");
  });

  it("does not let an empty API response overwrite good cached data", async () => {
    const { generated } = await loadData();
    const merged = mergeLastKnownGood(generated, {
      generatedAt: "2026-07-25T04:00:00.000Z",
      recentMergedPullRequests: []
    });
    expect(merged.recentMergedPullRequests).toEqual(generated.recentMergedPullRequests);
    expect(merged.contributionSummary).toEqual(generated.contributionSummary);
  });
});

describe("SVG renderers", () => {
  it("are deterministic and contain accessible static fallbacks", async () => {
    const { profile, generated } = await loadData();
    expect(renderHero(profile, "dark")).toBe(renderHero(profile, "dark"));
    expect(renderHero(profile, "dark")).toContain("BUILD · EXPLAIN · MAP");
    const swarm = renderContributionSwarm(generated, "dark");
    const englishSwarm = renderContributionSwarm(generated, "dark", "en");
    const activeDays = generated.contributionSummary.weeks
      .flatMap((week) => week.days)
      .filter((day) => day.count > 0).length;
    const hasVerifiedCalendar = activeDays > 1;
    expect(swarm).toContain("<title");
    expect(swarm).toContain("<desc");
    expect(swarm).toContain(
      hasVerifiedCalendar ? "已验证的 GitHub 公共数据" : "等待首次公共数据刷新"
    );
    expect(englishSwarm).toContain(
      hasVerifiedCalendar ? "VERIFIED PUBLIC API DATA" : "VERIFIED DATA REFRESH PENDING"
    );
    expect(swarm).not.toMatch(/\b(undefined|null|NaN)\b/);
  });
});
