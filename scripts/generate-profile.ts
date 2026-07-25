import { mkdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { loadData, rootDirectory, writeIfChanged } from "./lib/io.js";
import { renderArchitectureMap } from "./render-architecture-map.js";
import { renderContributionSwarm } from "./render-contribution-swarm.js";
import { renderHero } from "./render-hero.js";
import { renderOpenSourceMarkdown } from "./render-open-source.js";
import { renderProjectsMarkdown } from "./render-projects.js";

function capabilityTable(
  groups: Array<{ name: string; evidence: string[] }>,
  language: "en" | "zh-CN" = "en"
) {
  const heading = language === "en" ? "Domain" : "领域";
  const proof = language === "en" ? "Verified working vocabulary" : "真实工程能力";
  return `| ${heading} | ${proof} |
|---|---|
${groups.map((group) => `| **${group.name}** | ${group.evidence.join(" · ")} |`).join("\n")}`;
}

function systemSignature(signature: Array<{ title: string; detail: string }>) {
  return `| System | Operating evidence |
|---|---|
${signature.map((item) => `| **${item.title}** | ${item.detail} |`).join("\n")}`;
}

export async function buildReadme(): Promise<string> {
  const { profile, projects, capabilities, generated } = await loadData();
  const template = await readFile(resolve(rootDirectory, "README.template.md"), "utf8");
  const replacements: Record<string, string> = {
    "{{HERO}}": `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/generated/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/generated/hero-light.svg">
  <img alt="Nicholas Xiong — Agentic Systems Engineer" src="assets/generated/hero-dark.svg" width="100%">
</picture>`,
    "{{SIGNATURE}}": systemSignature(profile.signature),
    "{{FLAGSHIPS}}": renderProjectsMarkdown(projects),
    "{{OPEN_SOURCE}}": renderOpenSourceMarkdown(generated.recentMergedPullRequests),
    "{{CAPABILITIES}}": capabilityTable(capabilities.groups),
    "{{NOW_BUILDING}}": profile.currentFocus.map((item) => `- ${item}`).join("\n"),
    "{{EMAIL}}": profile.contact.email
  };
  return Object.entries(replacements).reduce(
    (content, [key, value]) => content.replaceAll(key, value),
    template
  );
}

export async function generateProfile(checkOnly = false): Promise<string[]> {
  const { generated } = await loadData();
  await mkdir(resolve(rootDirectory, "assets/generated"), { recursive: true });
  const outputs = new Map<string, string>([
    ["assets/generated/hero-dark.svg", renderHero("dark")],
    ["assets/generated/hero-light.svg", renderHero("light")],
    ["assets/generated/architecture-map-dark.svg", renderArchitectureMap("dark")],
    ["assets/generated/architecture-map-light.svg", renderArchitectureMap("light")],
    [
      "assets/generated/contribution-swarm-dark.svg",
      renderContributionSwarm(generated, "dark")
    ],
    [
      "assets/generated/contribution-swarm-light.svg",
      renderContributionSwarm(generated, "light")
    ],
    ["README.md", await buildReadme()]
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
