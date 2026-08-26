import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const bundlePath = "packages/codesign-commerce/dist/browser/codesign-commerce.js";
const source = readFileSync(bundlePath, "utf8");
const context = vm.createContext({
  AbortController,
  crypto,
  structuredClone,
  console,
});
vm.runInContext(source, context, { filename: bundlePath });

const api = context.CoDesignCommerce;
const requiredExports = [
  "InMemoryConfiguratorAdapter",
  "ProposalReviewController",
  "ProposalSession",
  "createCoDesignTools",
  "registerCoDesignTools",
  "validateManifest",
];
const missing = requiredExports.filter((name) => typeof api?.[name] !== "function");
if (missing.length > 0) {
  process.stderr.write(`Browser bundle is missing exports: ${missing.join(", ")}\n`);
  process.exit(1);
}

const forbidden = ["__KORRHAUS_SOCK_DESIGNER__", "shpat_", "sk_live_"];
const leaked = forbidden.filter((value) => source.includes(value));
if (leaked.length > 0) {
  process.stderr.write(`Browser bundle contains forbidden private markers: ${leaked.join(", ")}\n`);
  process.exit(1);
}

const digest = createHash("sha256").update(source).digest("hex");
process.stdout.write(`Browser bundle verified: sha256:${digest}\n`);
