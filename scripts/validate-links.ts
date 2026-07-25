import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { rootDirectory } from "./lib/io.js";

const markdownLink = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const htmlSource = /(?:src|srcset)="([^"]+)"/g;

function isLocal(value: string) {
  return !/^(?:https?:|mailto:|#)/.test(value);
}

export async function validateLinks(files = ["README.md", "README.zh-CN.md"]) {
  for (const file of files) {
    const content = await readFile(resolve(rootDirectory, file), "utf8");
    const links = [
      ...Array.from(content.matchAll(markdownLink), (match) => match[1]),
      ...Array.from(content.matchAll(htmlSource), (match) => match[1])
    ].filter((value): value is string => value !== undefined);
    for (const link of links) {
      if (/\b(undefined|null|NaN)\b/.test(link)) throw new Error(`${file}: invalid link ${link}`);
      if (isLocal(link)) {
        const clean = link.split("#")[0];
        if (clean) await access(resolve(rootDirectory, clean));
      } else if (/^https?:/.test(link)) {
        new URL(link);
      }
    }
  }
}

validateLinks().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
