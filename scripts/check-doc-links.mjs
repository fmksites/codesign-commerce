import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const listed = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "*.md"], { encoding: "utf8" });
if (listed.status !== 0) {
  process.stderr.write(listed.stderr || "Unable to enumerate Markdown files.\n");
  process.exit(1);
}

const markdownFiles = listed.stdout.split("\0").filter(Boolean);
const failures = [];
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
let scannedFileCount = 0;

for (const file of markdownFiles) {
  if (file.startsWith("docs/archive/")) continue;
  if (!existsSync(file)) continue;
  scannedFileCount += 1;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(linkPattern)) {
    const target = match[1]?.trim();
    if (!target || target.startsWith("http://") || target.startsWith("https://") || target.startsWith("#") || target.startsWith("mailto:")) continue;
    const path = target.split("#", 1)[0];
    if (!existsSync(resolve(dirname(file), path))) failures.push(`${file}: missing ${target}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`Documentation link check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Documentation link check passed for ${scannedFileCount} files.\n`);
