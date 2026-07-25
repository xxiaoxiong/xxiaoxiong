import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { z } from "zod";
import {
  capabilitiesSchema,
  generatedSchema,
  profileSchema,
  projectsSchema
} from "./schema.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
export const rootDirectory = resolve(scriptDirectory, "../..");

export async function readYaml<T>(relativePath: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(resolve(rootDirectory, relativePath), "utf8");
  return schema.parse(parse(raw));
}

export async function readJson<T>(relativePath: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(resolve(rootDirectory, relativePath), "utf8");
  return schema.parse(JSON.parse(raw) as unknown);
}

export async function loadData() {
  const [profile, projects, capabilities, generated] = await Promise.all([
    readYaml("data/profile.yml", profileSchema),
    readYaml("data/projects.yml", projectsSchema),
    readYaml("data/capabilities.yml", capabilitiesSchema),
    readJson("data/generated.json", generatedSchema)
  ]);
  return { profile, projects: projects.projects, capabilities, generated };
}

export async function writeIfChanged(
  relativePath: string,
  content: string,
  checkOnly = false
): Promise<boolean> {
  const target = resolve(rootDirectory, relativePath);
  let previous: string | undefined;
  try {
    previous = await readFile(target, "utf8");
  } catch {
    previous = undefined;
  }
  if (previous === content) return false;
  if (checkOnly) {
    throw new Error(`${relativePath} is out of date. Run pnpm generate.`);
  }
  await writeFile(target, content, "utf8");
  return true;
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
