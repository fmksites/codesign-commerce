import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const toteDist = join(root, "dist", "judge-site", "tote");
const output = join(root, "dist", "shopify-theme-demo");
const outputAssets = join(output, "assets");
const outputTemplates = join(output, "templates");

await rm(output, { recursive: true, force: true });
await mkdir(outputAssets, { recursive: true });
await mkdir(outputTemplates, { recursive: true });

const bundleFiles = await readdir(join(toteDist, "assets"));
const javascript = bundleFiles.find((name) => /^index-.*\.js$/.test(name));
const stylesheet = bundleFiles.find((name) => /^index-.*\.css$/.test(name));
if (!javascript || !stylesheet) {
  throw new Error("Build the studio tote before assembling the Shopify theme overlay.");
}

const copies = [
  [join(toteDist, "assets", javascript), join(outputAssets, "codesign-tote.js")],
  [join(toteDist, "assets", stylesheet), join(outputAssets, "codesign-tote.css")],
  [join(toteDist, "tote-natural-long.png"), join(outputAssets, "codesign-tote-natural-long.png")],
  [join(toteDist, "tote-natural-short.png"), join(outputAssets, "codesign-tote-natural-short.png")],
  [join(toteDist, "tote-charcoal-long.png"), join(outputAssets, "codesign-tote-charcoal-long.png")],
  [join(toteDist, "north-form-supplied-mark.png"), join(outputAssets, "codesign-tote-north-form-supplied-mark.png")],
  [join(root, "shopify-demo", "templates", "page.codesign-tote.liquid"), join(outputTemplates, "page.codesign-tote.liquid")],
];

await Promise.all(copies.map(([source, destination]) => copyFile(source, destination)));

console.log(`Shopify demo overlay assembled at ${output}`);
