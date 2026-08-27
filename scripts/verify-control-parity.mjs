import { build } from "esbuild";

const entry = `
  import { validateHumanControlInventory } from "./packages/codesign-commerce/src/index.ts";
  import { toteManifest } from "./examples/studio-tote/src/configurator.ts";
  import { toteHumanControlInventory } from "./examples/studio-tote/src/control-inventory.ts";
  export default validateHumanControlInventory(toteHumanControlInventory, toteManifest).report;
`;

const result = await build({
  absWorkingDir: process.cwd(),
  stdin: { contents: entry, resolveDir: process.cwd(), loader: "ts" },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  write: false,
  logLevel: "silent",
});

const bundled = result.outputFiles[0]?.text;
if (!bundled) throw new Error("Control-parity bundle was not produced");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(bundled).toString("base64")}`;
const { default: report } = await import(moduleUrl);
if (report.totalHumanControls !== report.mappedControls + report.mappedVariantOperations + report.mappedAssetSlots + report.excludedControls) {
  throw new Error("Control-parity report left one or more human controls unmapped");
}
console.log(JSON.stringify({ ok: true, report }, null, 2));
