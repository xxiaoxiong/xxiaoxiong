import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildReadme } from "../scripts/generate-profile.js";
import { rootDirectory } from "../scripts/lib/io.js";

describe("README generation", () => {
  it("is idempotent for fixed inputs", async () => {
    expect(await buildReadme()).toBe(await buildReadme());
  });

  it("contains the required information architecture", async () => {
    const readme = await buildReadme();
    for (const heading of [
      "核心项目",
      "能力轨道",
      "开源脉冲",
      "联系我"
    ]) {
      expect(readme).toContain(`## ${heading}`);
    }
    expect(readme).toContain("README.en.md");
    expect(readme).toContain("3DHomepage");
    expect(readme).toContain("learn-hermes-agent");
    expect(readme).toContain("general-agent-frame");
    const orderedProjects = [
      "3DHomepage",
      "Learn Hermes Agent",
      "Awesome Multi-Agent Projects",
      "MegaDeepagents",
      "General Agent Frame",
      "AI-GeneralPlat"
    ];
    const projectPositions = orderedProjects.map((project) =>
      readme.indexOf(`· ${project}**`)
    );
    expect(projectPositions.every((position) => position >= 0)).toBe(true);
    expect(projectPositions).toEqual([...projectPositions].sort((a, b) => a - b));
    expect(readme).not.toContain("{{");
    expect(readme.length).toBeLessThan(15_000);
    const english = await buildReadme("en");
    expect(english).toContain("## Core Projects");
    expect(english).toContain("README.md");
    expect(english).not.toContain("{{");
  });

  it("contains no invalid tokens, leaked private repositories or unstable card services", async () => {
    const readme = await buildReadme();
    expect(readme).not.toMatch(/\b(undefined|null|NaN)\b/);
    expect(readme).not.toContain("JiLiang_ReportReview");
    expect(readme).not.toContain("github-readme-stats");
    expect(readme).not.toContain("readme-typing-svg");
    expect(readme).not.toMatch(/sk-[A-Za-z0-9_-]{20,}/);
  });

  it("has all theme-aware assets", async () => {
    const assets = [
      "hero-dark.svg",
      "hero-light.svg",
      "hero-en-dark.svg",
      "hero-en-light.svg",
      "project-showcase-dark.svg",
      "project-showcase-light.svg",
      "project-showcase-en-dark.svg",
      "project-showcase-en-light.svg",
      "capability-orbit-dark.svg",
      "capability-orbit-light.svg",
      "capability-orbit-en-dark.svg",
      "capability-orbit-en-light.svg",
      "architecture-map-dark.svg",
      "architecture-map-light.svg",
      "contribution-swarm-dark.svg",
      "contribution-swarm-light.svg",
      "contribution-swarm-en-dark.svg",
      "contribution-swarm-en-light.svg"
    ];
    await Promise.all(
      assets.map((asset) => access(resolve(rootDirectory, "assets/generated", asset)))
    );
    const chinese = await readFile(resolve(rootDirectory, "README.md"), "utf8");
    expect(chinese).toContain("智能体系统工程师");
    const english = await readFile(resolve(rootDirectory, "README.en.md"), "utf8");
    expect(english).toContain("Agentic Systems Engineer");
  });
});
