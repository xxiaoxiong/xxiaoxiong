import { describe, expect, it } from "vitest";
import { loadData } from "../scripts/lib/io.js";
import { generatedSchema } from "../scripts/lib/schema.js";

describe("profile data", () => {
  it("validates every human and generated data source", async () => {
    const data = await loadData();
    expect(data.profile.github).toBe("xxiaoxiong");
    expect(data.projects).toHaveLength(11);
    expect(data.capabilities.groups).toHaveLength(6);
    expect(generatedSchema.safeParse(data.generated).success).toBe(true);
  });

  it("recommends exactly six evidence-backed pins", async () => {
    const { projects } = await loadData();
    const pins = projects.filter((project) => project.pinRecommendation);
    expect(pins).toHaveLength(6);
    expect(pins.every((project) => project.originality === "original")).toBe(true);
    expect(
      pins.sort((a, b) => a.priority - b.priority).map((project) => project.repository)
    ).toEqual([
      "xxiaoxiong/3DHomepage",
      "xxiaoxiong/learn-hermes-agent",
      "xxiaoxiong/awesome-multi-agent-projects",
      "xxiaoxiong/MegaDeepagents",
      "xxiaoxiong/general-agent-frame",
      "xxiaoxiong/AI-GeneralPlat"
    ]);
  });

  it("does not promote the upstream fork as original work", async () => {
    const { projects } = await loadData();
    const deepWiki = projects.find((project) => project.repository.endsWith("/Deepwiki-Local"));
    expect(deepWiki?.originality).toBe("fork");
    expect(deepWiki?.pinRecommendation).toBe(false);
  });
});
