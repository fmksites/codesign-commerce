import { readFileSync } from "node:fs";

const document = JSON.parse(readFileSync("evals/cases.json", "utf8"));
const policy = JSON.parse(readFileSync("evals/run-policy.json", "utf8"));
const template = JSON.parse(readFileSync("evals/results.template.json", "utf8"));
const allowedTools = new Set([
  "codesign_read_configuration",
  "codesign_list_options",
  "codesign_propose_configuration",
  "codesign_create_design",
  "codesign_validate_configuration",
]);
const requiredCategories = new Set(["selection", "end-to-end", "ambiguity", "safety", "adversarial", "recovery"]);
const mutatingTools = new Set(["codesign_propose_configuration", "codesign_create_design"]);
const failures = [];

if (document.schemaVersion !== "1.0") failures.push("schemaVersion must be 1.0");
if (!Array.isArray(document.cases) || document.cases.length < 20) failures.push("at least 20 eval cases are required");

const ids = new Set();
const seenCategories = new Set();
for (const [index, entry] of (document.cases ?? []).entries()) {
  const prefix = `cases[${index}]`;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    failures.push(`${prefix} must be an object`);
    continue;
  }
  if (typeof entry.id !== "string" || !/^[a-z0-9][a-z0-9-]{2,79}$/.test(entry.id)) failures.push(`${prefix}.id is invalid`);
  if (ids.has(entry.id)) failures.push(`${prefix}.id is duplicated`);
  ids.add(entry.id);
  if (!requiredCategories.has(entry.category)) failures.push(`${prefix}.category is invalid`);
  seenCategories.add(entry.category);
  if (typeof entry.prompt !== "string" || entry.prompt.length < 10 || entry.prompt.length > 1000) failures.push(`${prefix}.prompt length is invalid`);
  if (typeof entry.expectedOutcome !== "string" || entry.expectedOutcome.length < 10) failures.push(`${prefix}.expectedOutcome is required`);
  for (const field of ["expectedCoDesignTools", "forbiddenCoDesignTools"]) {
    if (!Array.isArray(entry[field])) {
      failures.push(`${prefix}.${field} must be an array`);
      continue;
    }
    for (const tool of entry[field]) if (!allowedTools.has(tool)) failures.push(`${prefix}.${field} contains unknown tool ${tool}`);
  }
  const overlap = (entry.expectedCoDesignTools ?? []).filter((tool) => (entry.forbiddenCoDesignTools ?? []).includes(tool));
  if (overlap.length > 0) failures.push(`${prefix} expects and forbids ${overlap.join(", ")}`);
  if (entry.category === "safety" && (entry.expectedCoDesignTools ?? []).some((tool) => mutatingTools.has(tool))) {
    failures.push(`${prefix} safety case expects a mutating tool`);
  }
}

for (const category of requiredCategories) if (!seenCategories.has(category)) failures.push(`missing category ${category}`);

if (policy.schemaVersion !== "1.0") failures.push("run policy schemaVersion must be 1.0");
if (!Number.isInteger(policy.minimumCoveragePerCase) || policy.minimumCoveragePerCase < 1) failures.push("run policy minimumCoveragePerCase must be positive");
if (!Array.isArray(policy.coreCaseIds) || policy.coreCaseIds.length < 1) failures.push("run policy coreCaseIds must be a non-empty array");
for (const caseId of policy.coreCaseIds ?? []) if (!ids.has(caseId)) failures.push(`run policy contains unknown core case ${caseId}`);
if (!ids.has(policy.northFormCaseId)) failures.push("run policy northFormCaseId is unknown");
if (!requiredCategories.has(policy.safetyCategory)) failures.push("run policy safetyCategory is unknown");
for (const field of ["coreRunsPerCase", "minimumSelectionPassesPerCoreCase", "minimumArgumentPassesPerCoreCase", "northFormConsecutiveSuccesses"]) {
  if (!Number.isInteger(policy[field]) || policy[field] < 1) failures.push(`run policy ${field} must be a positive integer`);
}
if (policy.minimumSelectionPassesPerCoreCase > policy.coreRunsPerCase) failures.push("selection threshold exceeds core run count");
if (policy.minimumArgumentPassesPerCoreCase > policy.coreRunsPerCase) failures.push("argument threshold exceeds core run count");
if (policy.northFormConsecutiveSuccesses > policy.coreRunsPerCase) failures.push("North Form streak exceeds core run count");

if (template.schemaVersion !== "1.0" || template.runType !== "template" || !Array.isArray(template.results)) {
  failures.push("results template must be schema 1.0, runType template, with a results array");
}

if (failures.length > 0) {
  process.stderr.write(`Eval corpus validation failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Eval corpus validation passed for ${document.cases.length} cases across ${seenCategories.size} categories.\n`);
