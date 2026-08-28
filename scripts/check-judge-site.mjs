import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "dist", "judge-site");
const verifiedRepositoryUrl = "https://github.com/fmksites/codesign-webmcp";
const verifiedFlagshipUrl =
  "https://korrhaus.nl/en/apps/wholesale/sock-designer";

const requiredFiles = [
  "index.html",
  "404.html",
  "styles.css",
  "app.js",
  "favicon.svg",
  "_headers",
  "site-metadata.json",
  "assets/codesign-webmcp.js",
  "assets/korrhaus-sock-cream.svg",
  "tote/index.html",
  "tote/favicon.svg",
  "tote/tote-natural-long.png",
  "tote/north-form-supplied-mark.png",
];
await Promise.all(requiredFiles.map((file) => access(path.join(site, file))));

const [landingHtml, notFoundHtml, landingJs, toteHtml, metadataText, headersText] = await Promise.all([
  readFile(path.join(site, "index.html"), "utf8"),
  readFile(path.join(site, "404.html"), "utf8"),
  readFile(path.join(site, "app.js"), "utf8"),
  readFile(path.join(site, "tote", "index.html"), "utf8"),
  readFile(path.join(site, "site-metadata.json"), "utf8"),
  readFile(path.join(site, "_headers"), "utf8"),
]);
const metadata = JSON.parse(metadataText);
const legacyKorrhausPathExists = await access(path.join(site, "korrhaus")).then(() => true).catch(() => false);

const requiredLandingText = [
  "CoDesign WebMCP",
  "WebMCP for Custom Products on Shopify",
  "Make your Shopify product configurator",
  "Agent-Ready Configurator Pilot",
  "Open the tote demo",
  "KORRHAUS private integration",
  "Fictional studio tote",
  "The agent never gets the last click",
  "We need 120 pairs for North Form",
  "Create 100 studio totes for North Form",
  "Download demo artwork",
];
for (const marker of requiredLandingText) {
  if (!landingHtml.includes(marker)) throw new Error(`Judge landing is missing required text: ${marker}`);
}
if (!landingJs.includes("document.modelContext?.registerTool")) throw new Error("Judge landing lacks the WebMCP fallback check");
if (!landingJs.includes('querySelectorAll(`[data-link="${name}"]`)')) {
  throw new Error("Judge landing does not update every metadata-bound release link");
}
for (const activeLabel of ["Open public repository", "Open judge guide"]) {
  if (!landingJs.includes(activeLabel)) {
    throw new Error(`Judge landing lacks its active release label: ${activeLabel}`);
  }
}
if (!landingHtml.includes('./tote/?reset=true')) {
  throw new Error("Judge landing lacks the deterministic tote demo link");
}
if (!landingHtml.includes('./tote/north-form-supplied-mark.png')) {
  throw new Error("Judge landing lacks the reproducible tote artwork link");
}
if (legacyKorrhausPathExists || landingHtml.includes("./korrhaus/") || landingHtml.includes("KORRHAUS public reference")) {
  throw new Error("Judge artifact still exposes the retired synthetic KORRHAUS configurator");
}
if (!notFoundHtml.includes("This route does not exist") || !notFoundHtml.includes("does not contain a second KORRHAUS Sock Designer")) {
  throw new Error("Judge artifact lacks an explicit static not-found boundary");
}
for (const requiredHeader of [
  "Content-Security-Policy:",
  "Permissions-Policy:",
  "Referrer-Policy: no-referrer",
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
]) {
  if (!headersText.includes(requiredHeader)) {
    throw new Error(`Judge artifact lacks required static security header: ${requiredHeader}`);
  }
}
const flagshipLinkCount = landingHtml.match(/data-link="flagship"/g)?.length ?? 0;
if (flagshipLinkCount < 1) {
  throw new Error("Judge landing lacks its release-gated KORRHAUS call to action");
}
if (/\b(?:src|href)="\/(?!\/)/.test(toteHtml)) {
  throw new Error("The tote build still contains a root-absolute HTML asset URL");
}
if (!/^\d+\.\d+\.\d+$/.test(metadata.packageVersion)) throw new Error("Judge metadata lacks a semantic package version");
if (!/^[a-f0-9]{40}$/.test(metadata.commitSha)) throw new Error("Judge metadata lacks an exact Git commit");
if (!/^[a-f0-9]{64}$/.test(metadata.browserBundleSha256)) throw new Error("Judge metadata lacks a browser-bundle digest");
if (metadata.browserBundlePath !== "assets/codesign-webmcp.js") {
  throw new Error("Judge metadata lacks the published core browser-bundle path");
}
if (!/^[a-f0-9]{64}$/.test(metadata.toteAppBundleSha256)) {
  throw new Error("Judge metadata lacks a tote application-bundle digest");
}
if (typeof metadata.toteAppBundlePath !== "string" || !/^tote\/assets\/index-.*\.js$/.test(metadata.toteAppBundlePath)) {
  throw new Error("Judge metadata lacks the published tote application-bundle path");
}
for (const name of ["repositoryUrl", "flagshipUrl"]) {
  if (metadata[name] !== null && (typeof metadata[name] !== "string" || !metadata[name].startsWith("https://"))) {
    throw new Error(`Judge metadata ${name} must be null or HTTPS`);
  }
}
if (typeof metadata.releaseBuild !== "boolean") {
  throw new Error("Judge metadata lacks an explicit release-build status");
}
if (typeof metadata.flagshipVerified !== "boolean") {
  throw new Error("Judge metadata lacks an explicit flagship-verification status");
}
if (
  metadata.flagshipUrl !== null &&
  metadata.flagshipUrl !== verifiedFlagshipUrl
) {
  throw new Error(
    `Judge metadata points to an unexpected KORRHAUS flagship URL: ${metadata.flagshipUrl}`,
  );
}
if (metadata.releaseBuild) {
  if (metadata.repositoryUrl !== verifiedRepositoryUrl) {
    throw new Error("Release judge metadata lacks the exact verified public repository URL");
  }
  if (metadata.flagshipVerified) {
    if (metadata.flagshipUrl !== verifiedFlagshipUrl) {
      throw new Error("Verified release metadata lacks the exact KORRHAUS flagship URL");
    }
  } else if (metadata.flagshipUrl !== null) {
    throw new Error("Unverified release metadata must withhold the KORRHAUS flagship URL");
  }
} else if (
  metadata.flagshipVerified ||
  metadata.flagshipUrl !== null ||
  metadata.repositoryUrl !== null
) {
  throw new Error(
    "A non-release judge artifact cannot expose release links or claim a verified live flagship",
  );
}

const assets = await readdir(path.join(site, "tote", "assets"));
if (!assets.some((asset) => asset.endsWith(".js")) || !assets.some((asset) => asset.endsWith(".css"))) {
  throw new Error("Tote build is missing bundled JavaScript or CSS");
}

const [publishedCoreBundle, publishedToteBundle] = await Promise.all([
  readFile(path.join(site, metadata.browserBundlePath)),
  readFile(path.join(site, metadata.toteAppBundlePath)),
]);
const publishedCoreDigest = createHash("sha256").update(publishedCoreBundle).digest("hex");
const publishedToteDigest = createHash("sha256").update(publishedToteBundle).digest("hex");
if (publishedCoreDigest !== metadata.browserBundleSha256) {
  throw new Error("Published core browser bundle does not match release metadata");
}
if (publishedToteDigest !== metadata.toteAppBundleSha256) {
  throw new Error("Published tote application bundle does not match release metadata");
}

console.log(`Judge site verification passed for commit ${metadata.commitSha.slice(0, 12)}.`);
console.log(`Package v${metadata.packageVersion}; browser bundle sha256:${metadata.browserBundleSha256}.`);
console.log(`Tote application bundle sha256:${metadata.toteAppBundleSha256}.`);
