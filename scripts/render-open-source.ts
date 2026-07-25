import type { MergedPullRequest } from "./lib/schema.js";

export function renderOpenSourceMarkdown(
  pullRequests: MergedPullRequest[],
  language: "en" | "zh-CN" = "zh-CN"
): string {
  if (pullRequests.length === 0) {
    return language === "zh-CN"
      ? "_GitHub 公共数据等待首次刷新；系统会自动保留最近一次有效缓存。_"
      : "_GitHub API refresh pending. The last known-good non-empty cache is retained automatically._";
  }
  const rows = pullRequests.slice(0, 4).map(
    (pullRequest) =>
      `| [${pullRequest.repository} #${pullRequest.number}](${pullRequest.url}) | ${pullRequest.title.replaceAll("|", "\\|")} | ${pullRequest.category} |`
  );
  const headings =
    language === "zh-CN"
      ? ["仓库 / PR", "贡献", "领域"]
      : ["Repository / PR", "Contribution", "Field"];
  return `| ${headings.join(" | ")} |
|---|---|---|
${rows.join("\n")}`;
}
