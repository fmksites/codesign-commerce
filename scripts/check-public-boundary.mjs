import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const tracked = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" });
if (tracked.status !== 0) {
  process.stderr.write(tracked.stderr || "Unable to enumerate tracked files.\n");
  process.exit(1);
}

const files = tracked.stdout.split("\0").filter(Boolean);
const forbiddenPaths = [
  /(^|\/)\.env($|\.)/,
  /(^|\/)reference\//,
  /(^|\/)\.agents\//,
  /(^|\/)\.codex\//,
  /\.(?:pem|p12|pfx|key)$/i,
];
const secretPatterns = [
  { label: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: "Shopify access token", pattern: /shpat_[A-Za-z0-9]{20,}/ },
  { label: "GitHub token", pattern: /gh[opusr]_[A-Za-z0-9]{20,}/ },
  { label: "Stripe live key", pattern: /sk_live_[A-Za-z0-9]{16,}/ },
  { label: "Google API key", pattern: /AIza[A-Za-z0-9_-]{30,}/ },
];
const textExtensions = new Set(["", ".cjs", ".css", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".toml", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);
const findings = [];
let scannedFileCount = 0;

for (const file of files) {
  if (!existsSync(file)) continue;
  scannedFileCount += 1;
  if (forbiddenPaths.some((pattern) => pattern.test(file))) findings.push(`${file}: forbidden public path`);
  const dot = file.lastIndexOf(".");
  const extension = dot === -1 ? "" : file.slice(dot).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const contents = readFileSync(file, "utf8");
  for (const check of secretPatterns) {
    if (check.pattern.test(contents)) findings.push(`${file}: possible ${check.label}`);
  }
}

if (findings.length > 0) {
  process.stderr.write(`Public-boundary check failed:\n${findings.map((finding) => `- ${finding}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Public-boundary check passed for ${scannedFileCount} public candidates.\n`);
