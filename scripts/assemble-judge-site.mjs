import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist", "judge-site");
const requireReleaseLinks = process.argv.includes("--require-release-links");

const readHttpsUrl = (name) => {
  const value = process.env[name]?.trim() ?? "";
  if (value.length === 0) return null;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL`);
  }
  if (parsed.protocol !== "https:") throw new Error(`${name} must use HTTPS`);
  return parsed.href.replace(/\/$/, "");
};

const repositoryUrl = readHttpsUrl("CODESIGN_PUBLIC_REPOSITORY_URL");
const flagshipUrl = readHttpsUrl("CODESIGN_FLAGSHIP_URL");
if (requireReleaseLinks && (!repositoryUrl || !flagshipUrl)) {
  throw new Error("Release builds require CODESIGN_PUBLIC_REPOSITORY_URL and CODESIGN_FLAGSHIP_URL");
}

const commitSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const packageJson = JSON.parse(await readFile(path.join(root, "packages", "codesign-commerce", "package.json"), "utf8"));
const browserBundle = await readFile(path.join(root, "packages", "codesign-commerce", "dist", "browser", "codesign-commerce.js"));
const browserBundleSha256 = createHash("sha256").update(browserBundle).digest("hex");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "judge-site"), output, { recursive: true });
await cp(path.join(root, "examples", "korrhaus-reference", "dist"), path.join(output, "korrhaus"), { recursive: true });
await cp(path.join(root, "examples", "studio-tote", "dist"), path.join(output, "tote"), { recursive: true });

const metadata = {
  product: "CoDesign Commerce",
  packageVersion: packageJson.version,
  commitSha,
  browserBundleSha256,
  repositoryUrl,
  flagshipUrl,
};
await writeFile(path.join(output, "site-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

console.log(`Judge site assembled at ${path.relative(root, output)}`);
console.log(`Commit: ${commitSha}`);
console.log(`Browser bundle: sha256:${browserBundleSha256}`);
console.log(repositoryUrl && flagshipUrl ? "Release links: configured" : "Release links: pending external approval");
