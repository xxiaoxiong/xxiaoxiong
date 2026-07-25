import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { XMLValidator } from "fast-xml-parser";
import { rootDirectory } from "./lib/io.js";

export async function validateSvgDirectory(relativeDirectory = "assets/generated") {
  const directory = resolve(rootDirectory, relativeDirectory);
  const files = (await readdir(directory)).filter((file) => file.endsWith(".svg"));
  if (files.length < 6) throw new Error("Expected at least six generated SVG assets.");
  for (const file of files) {
    const path = resolve(directory, file);
    const [content, metadata] = await Promise.all([readFile(path, "utf8"), stat(path)]);
    // fast-xml-parser still exposes its validator while the standalone successor matures.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const validation = XMLValidator.validate(content);
    if (validation !== true) throw new Error(`${file}: invalid XML`);
    if (metadata.size > 300 * 1024) throw new Error(`${file}: exceeds 300 KB`);
    for (const attribute of ["width=", "height=", "viewBox=", "<title", "<desc"]) {
      if (!content.includes(attribute)) throw new Error(`${file}: missing ${attribute}`);
    }
    if (/\b(undefined|null|NaN)\b/.test(content)) {
      throw new Error(`${file}: contains an invalid generated token`);
    }
    const withoutNamespace = content.replace('xmlns="http://www.w3.org/2000/svg"', "");
    if (/<script|javascript:|https?:\/\//i.test(withoutNamespace)) {
      throw new Error(`${file}: contains script or a remote dependency`);
    }
  }
}

validateSvgDirectory().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
