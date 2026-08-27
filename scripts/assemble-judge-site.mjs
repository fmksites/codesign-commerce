import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist", "judge-site");
const requireReleaseLinks = process.argv.includes("--require-release-links");
const verifiedRepositoryUrl = "https://github.com/fmksites/codesign-commerce";
const verifiedFlagshipUrl =
  "https://korrhaus.nl/en/apps/wholesale/sock-designer";

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

const requestedRepositoryUrl = readHttpsUrl("CODESIGN_PUBLIC_REPOSITORY_URL");
const requestedFlagshipUrl = readHttpsUrl("CODESIGN_FLAGSHIP_URL");
const flagshipVerified =
  process.env.CODESIGN_FLAGSHIP_VERIFIED?.trim().toLowerCase() === "true";
if (requireReleaseLinks && (!requestedRepositoryUrl || !requestedFlagshipUrl)) {
  throw new Error("Release builds require CODESIGN_PUBLIC_REPOSITORY_URL and CODESIGN_FLAGSHIP_URL");
}
if (requireReleaseLinks && requestedRepositoryUrl !== verifiedRepositoryUrl) {
  throw new Error(
    `Release builds require the verified public repository URL: ${verifiedRepositoryUrl}`,
  );
}
if (requireReleaseLinks && requestedFlagshipUrl !== verifiedFlagshipUrl) {
  throw new Error(
    `Release builds require the verified KORRHAUS flagship URL: ${verifiedFlagshipUrl}`,
  );
}

const repositoryUrl = requireReleaseLinks ? requestedRepositoryUrl : null;
const flagshipUrl = requireReleaseLinks ? requestedFlagshipUrl : null;
if (requireReleaseLinks && !flagshipVerified) {
  throw new Error(
    "Release builds require CODESIGN_FLAGSHIP_VERIFIED=true after the live Shopify route passes production verification",
  );
}
if (requireReleaseLinks) {
  const worktreeStatus = execFileSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all"],
    { cwd: root, encoding: "utf8" },
  ).trim();
  if (worktreeStatus.length > 0) {
    throw new Error(
      "Release builds require a clean working tree so site-metadata.json identifies the exact public bytes",
    );
  }
}

const commitSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const packageJson = JSON.parse(await readFile(path.join(root, "packages", "codesign-commerce", "package.json"), "utf8"));
const browserBundle = await readFile(path.join(root, "packages", "codesign-commerce", "dist", "browser", "codesign-commerce.js"));
const browserBundleSha256 = createHash("sha256").update(browserBundle).digest("hex");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "judge-site"), output, { recursive: true });
await cp(path.join(root, "examples", "studio-tote", "dist"), path.join(output, "tote"), { recursive: true });

const metadata = {
  product: "CoDesign Commerce",
  packageVersion: packageJson.version,
  commitSha,
  browserBundleSha256,
  repositoryUrl,
  flagshipUrl,
  releaseBuild: requireReleaseLinks,
  flagshipVerified: requireReleaseLinks && flagshipVerified,
};
await writeFile(path.join(output, "site-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

console.log(`Judge site assembled at ${path.relative(root, output)}`);
console.log(`Commit: ${commitSha}`);
console.log(`Browser bundle: sha256:${browserBundleSha256}`);
console.log(
  repositoryUrl && flagshipUrl
    ? "Release links: configured"
    : "Release links: withheld until verified release build",
);
