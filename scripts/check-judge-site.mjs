import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "dist", "judge-site");

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "favicon.svg",
  "site-metadata.json",
  "korrhaus/index.html",
  "korrhaus/korr-logo.png",
  "korrhaus/sock-cream.svg",
  "tote/index.html",
  "tote/tote-natural-long.png",
];
await Promise.all(requiredFiles.map((file) => access(path.join(site, file))));

const [landingHtml, landingJs, korrhausHtml, toteHtml, metadataText] = await Promise.all([
  readFile(path.join(site, "index.html"), "utf8"),
  readFile(path.join(site, "app.js"), "utf8"),
  readFile(path.join(site, "korrhaus", "index.html"), "utf8"),
  readFile(path.join(site, "tote", "index.html"), "utf8"),
  readFile(path.join(site, "site-metadata.json"), "utf8"),
]);
const metadata = JSON.parse(metadataText);

const requiredLandingText = [
  "Try the flagship proof",
  "KORRHAUS public reference",
  "Fictional studio tote",
  "The agent never gets the last click",
  "We need 120 pairs for North Form",
  "Create 100 studio totes split evenly",
];
for (const marker of requiredLandingText) {
  if (!landingHtml.includes(marker)) throw new Error(`Judge landing is missing required text: ${marker}`);
}
if (!landingJs.includes("document.modelContext?.registerTool")) throw new Error("Judge landing lacks the WebMCP fallback check");
if (!landingHtml.includes('./korrhaus/?reset=true') || !landingHtml.includes('./tote/?reset=true')) {
  throw new Error("Judge landing lacks deterministic relative demo links");
}
if (/\b(?:src|href)="\/(?!\/)/.test(korrhausHtml) || /\b(?:src|href)="\/(?!\/)/.test(toteHtml)) {
  throw new Error("A configurator build still contains a root-absolute HTML asset URL");
}
if (!/^\d+\.\d+\.\d+$/.test(metadata.packageVersion)) throw new Error("Judge metadata lacks a semantic package version");
if (!/^[a-f0-9]{40}$/.test(metadata.commitSha)) throw new Error("Judge metadata lacks an exact Git commit");
if (!/^[a-f0-9]{64}$/.test(metadata.browserBundleSha256)) throw new Error("Judge metadata lacks a browser-bundle digest");

for (const name of ["korrhaus", "tote"]) {
  const assets = await readdir(path.join(site, name, "assets"));
  if (!assets.some((asset) => asset.endsWith(".js")) || !assets.some((asset) => asset.endsWith(".css"))) {
    throw new Error(`${name} build is missing bundled JavaScript or CSS`);
  }
}

console.log(`Judge site verification passed for commit ${metadata.commitSha.slice(0, 12)}.`);
console.log(`Package v${metadata.packageVersion}; browser bundle sha256:${metadata.browserBundleSha256}.`);
