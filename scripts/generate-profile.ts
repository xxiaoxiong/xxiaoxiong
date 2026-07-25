import { mkdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { loadData, rootDirectory, writeIfChanged } from "./lib/io.js";
import { renderArchitectureMap } from "./render-architecture-map.js";
import { renderCapabilityOrbit } from "./render-capability-orbit.js";
import { renderContributionSwarm } from "./render-contribution-swarm.js";
import { renderHero } from "./render-hero.js";
import { renderOpenSourceMarkdown } from "./render-open-source.js";
import { renderProjectShowcase } from "./render-project-showcase.js";
import type { Project } from "./lib/schema.js";

function picture(name: string, alt: string, language: "en" | "zh-CN") {
  const suffix = language === "en" ? "-en" : "";
  return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/generated/${name}${suffix}-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/generated/${name}${suffix}-light.svg">
  <img alt="${alt}" src="assets/generated/${name}${suffix}-dark.svg" width="100%">
</picture>`;
}

function projectLinks(projects: Project[]) {
  const flagship = [...projects].sort((a, b) => a.priority - b.priority).slice(0, 6);
  const link = (project: Project) =>
    `[**${String(project.priority).padStart(2, "0")} · ${project.title}**](${project.repositoryUrl})`;
  return `| ${flagship.slice(0, 3).map(link).join(" | ")} |
|${flagship.slice(0, 3).map(() => ":---:").join("|")}|
| ${flagship.slice(3, 6).map(link).join(" | ")} |`;
}

export async function buildReadme(language: "en" | "zh-CN" = "zh-CN"): Promise<string> {
  const { profile, projects, generated } = await loadData();
  const templateName = language === "zh-CN" ? "README.template.md" : "README.en.template.md";
  const template = await readFile(resolve(rootDirectory, templateName), "utf8");
  const replacements: Record<string, string> = {
    "{{HERO}}": picture(
      "hero",
      language === "zh-CN"
        ? "Nicholas Xiong——智能体系统工程师"
        : "Nicholas Xiong — Agentic Systems Engineer",
      language
    ),
    "{{PROJECTS_VISUAL}}": picture(
      "project-showcase",
      language === "zh-CN" ? "六个核心项目的视觉化总览" : "Visual overview of six core projects",
      language
    ),
    "{{PROJECT_LINKS}}": projectLinks(projects),
    "{{CAPABILITY_VISUAL}}": picture(
      "capability-orbit",
      language === "zh-CN" ? "AI 系统工程能力轨道" : "AI systems engineering capability orbit",
      language
    ),
    "{{CONTRIBUTION_VISUAL}}": picture(
      "contribution-swarm",
      language === "zh-CN" ? "基于 GitHub 公共数据的开源贡献脉冲" : "Open-source contribution pulse from public GitHub data",
      language
    ),
    "{{OPEN_SOURCE}}": renderOpenSourceMarkdown(generated.recentMergedPullRequests, language),
    "{{EMAIL}}": profile.contact.email
  };
  return Object.entries(replacements).reduce(
    (content, [key, value]) => content.replaceAll(key, value),
    template
  );
}

export async function generateProfile(checkOnly = false): Promise<string[]> {
  const { projects, capabilities, generated } = await loadData();
  await mkdir(resolve(rootDirectory, "assets/generated"), { recursive: true });
  const outputs = new Map<string, string>([
    ["assets/generated/hero-dark.svg", renderHero("dark", "zh-CN")],
    ["assets/generated/hero-light.svg", renderHero("light", "zh-CN")],
    ["assets/generated/hero-en-dark.svg", renderHero("dark", "en")],
    ["assets/generated/hero-en-light.svg", renderHero("light", "en")],
    [
      "assets/generated/project-showcase-dark.svg",
      renderProjectShowcase(projects, "dark", "zh-CN")
    ],
    [
      "assets/generated/project-showcase-light.svg",
      renderProjectShowcase(projects, "light", "zh-CN")
    ],
    [
      "assets/generated/project-showcase-en-dark.svg",
      renderProjectShowcase(projects, "dark", "en")
    ],
    [
      "assets/generated/project-showcase-en-light.svg",
      renderProjectShowcase(projects, "light", "en")
    ],
    [
      "assets/generated/capability-orbit-dark.svg",
      renderCapabilityOrbit(capabilities, "dark", "zh-CN")
    ],
    [
      "assets/generated/capability-orbit-light.svg",
      renderCapabilityOrbit(capabilities, "light", "zh-CN")
    ],
    [
      "assets/generated/capability-orbit-en-dark.svg",
      renderCapabilityOrbit(capabilities, "dark", "en")
    ],
    [
      "assets/generated/capability-orbit-en-light.svg",
      renderCapabilityOrbit(capabilities, "light", "en")
    ],
    ["assets/generated/architecture-map-dark.svg", renderArchitectureMap("dark")],
    ["assets/generated/architecture-map-light.svg", renderArchitectureMap("light")],
    [
      "assets/generated/contribution-swarm-dark.svg",
      renderContributionSwarm(generated, "dark", "zh-CN")
    ],
    [
      "assets/generated/contribution-swarm-light.svg",
      renderContributionSwarm(generated, "light", "zh-CN")
    ],
    [
      "assets/generated/contribution-swarm-en-dark.svg",
      renderContributionSwarm(generated, "dark", "en")
    ],
    [
      "assets/generated/contribution-swarm-en-light.svg",
      renderContributionSwarm(generated, "light", "en")
    ],
    ["README.md", await buildReadme("zh-CN")],
    ["README.en.md", await buildReadme("en")]
  ]);
  const changed: string[] = [];
  for (const [path, content] of outputs) {
    if (await writeIfChanged(path, content, checkOnly)) changed.push(path);
  }
  return changed;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const changed = await generateProfile(checkOnly);
  if (!checkOnly && changed.length > 0) {
    process.stdout.write(`Generated ${changed.join(", ")}\n`);
  }
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
