import type { Project } from "./lib/schema.js";

function escapeMarkdown(value: string): string {
  return value.replaceAll("|", "\\|");
}

export function renderProjectsMarkdown(projects: Project[], language: "en" | "zh-CN" = "en"): string {
  const flagship = [...projects].sort((a, b) => a.priority - b.priority).slice(0, 3);
  return flagship
    .map((project, index) => {
      const evidence = project.evidence.map((item) => `- ${item}`).join("\n");
      const links = [
        `[Repository](${project.repositoryUrl})`,
        project.liveUrl ? `[Live system](${project.liveUrl})` : undefined
      ]
        .filter(Boolean)
        .join(" · ");
      const labels =
        language === "en"
          ? { problem: "Problem", system: "System / Architecture", evidence: "Evidence" }
          : { problem: "解决的问题", system: "系统 / 架构", evidence: "工程证据" };
      return `### 0${index + 1} / ${escapeMarkdown(project.title)}

> ${escapeMarkdown(project.description)}

**${labels.problem}.** ${escapeMarkdown(project.problem)}

**${labels.system}.** ${escapeMarkdown(project.architecture)}

**${labels.evidence}.**

${evidence}

${links}`;
    })
    .join("\n\n---\n\n");
}
