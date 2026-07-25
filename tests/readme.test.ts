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
      "System Signature",
      "Flagship Systems",
      "Open-Source Fieldwork",
      "Architecture Map",
      "Capability Matrix",
      "Agent Swarm Contribution Map",
      "Now Building",
      "Collaboration"
    ]) {
      expect(readme).toContain(`## ${heading}`);
    }
    expect(readme).toContain("README.zh-CN.md");
    expect(readme).not.toContain("{{");
    expect(readme.length).toBeLessThan(100_000);
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
      "architecture-map-dark.svg",
      "architecture-map-light.svg",
      "contribution-swarm-dark.svg",
      "contribution-swarm-light.svg"
    ];
    await Promise.all(
      assets.map((asset) => access(resolve(rootDirectory, "assets/generated", asset)))
    );
    const chinese = await readFile(resolve(rootDirectory, "README.zh-CN.md"), "utf8");
    expect(chinese).toContain("智能体系统工程师");
  });
});
