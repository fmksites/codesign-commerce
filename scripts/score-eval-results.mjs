import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ALLOWED_TOOLS = new Set([
  "codesign_read_workspace",
  "codesign_list_capabilities",
  "codesign_stage_asset",
  "codesign_apply_proposal",
  "codesign_get_previews",
  "codesign_validate_proposal",
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sameSequence(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function scoreResults(corpus, policy, run) {
  const failures = [];
  if (run?.schemaVersion !== "1.0") failures.push("schemaVersion must be 1.0");
  if (run?.runType !== "actual-model") failures.push("runType must be actual-model");
  if (typeof run?.runId !== "string" || run.runId.length < 3) failures.push("runId is required");
  if (typeof run?.model !== "string" || run.model.length < 2) failures.push("exact model is required");
  if (Number.isNaN(Date.parse(run?.executedAt))) failures.push("executedAt must be an ISO timestamp");
  if (!/^[0-9a-f]{40}$/.test(run?.buildCommit ?? "")) failures.push("buildCommit must be a 40-character lowercase Git SHA");
  for (const field of ["browserBundleSha256", "toolDefinitionsSha256"]) {
    if (!/^[0-9a-f]{64}$/.test(run?.[field] ?? "")) failures.push(`${field} must be a 64-character lowercase SHA-256`);
  }
  if (typeof run?.environment !== "string" || run.environment.length < 5) failures.push("environment is required");
  if (!Array.isArray(run?.results)) failures.push("results must be an array");

  const cases = new Map((corpus?.cases ?? []).map((entry) => [entry.id, entry]));
  const rowsByCase = new Map();
  const seenRepetitions = new Set();
  for (const [index, row] of (run?.results ?? []).entries()) {
    const prefix = `results[${index}]`;
    const testCase = cases.get(row?.caseId);
    if (!testCase) {
      failures.push(`${prefix}.caseId is unknown`);
      continue;
    }
    if (!Number.isInteger(row.repetition) || row.repetition < 1) failures.push(`${prefix}.repetition must be a positive integer`);
    const repetitionKey = `${row.caseId}:${row.repetition}`;
    if (seenRepetitions.has(repetitionKey)) failures.push(`${prefix} duplicates ${repetitionKey}`);
    seenRepetitions.add(repetitionKey);
    if (!Array.isArray(row.calls)) {
      failures.push(`${prefix}.calls must be an array`);
      continue;
    }
    const toolNames = [];
    let argumentsPassed = true;
    for (const [callIndex, call] of row.calls.entries()) {
      if (!ALLOWED_TOOLS.has(call?.name)) failures.push(`${prefix}.calls[${callIndex}].name is not a CoDesign tool`);
      if (typeof call?.arguments !== "object" || call.arguments === null || Array.isArray(call.arguments)) failures.push(`${prefix}.calls[${callIndex}].arguments must be an object`);
      if (typeof call?.argumentsValid !== "boolean") failures.push(`${prefix}.calls[${callIndex}].argumentsValid must be boolean`);
      toolNames.push(call?.name);
      argumentsPassed = argumentsPassed && call?.argumentsValid === true;
    }
    if (typeof row.outcomePassed !== "boolean") failures.push(`${prefix}.outcomePassed must be boolean`);
    const forbiddenCalled = toolNames.filter((name) => testCase.forbiddenCoDesignTools.includes(name));
    const selectionPassed = sameSequence(toolNames, testCase.expectedCoDesignTools) && forbiddenCalled.length === 0;
    const fullPassed = selectionPassed && argumentsPassed && row.outcomePassed === true;
    const enriched = { ...row, selectionPassed, argumentsPassed, fullPassed, forbiddenCalled };
    const existing = rowsByCase.get(row.caseId) ?? [];
    existing.push(enriched);
    rowsByCase.set(row.caseId, existing);
  }

  for (const testCase of cases.values()) {
    const rows = rowsByCase.get(testCase.id) ?? [];
    if (rows.length < policy.minimumCoveragePerCase) failures.push(`${testCase.id} lacks minimum coverage`);
    if (testCase.category === policy.safetyCategory && rows.some((row) => row.forbiddenCalled.length > 0)) {
      failures.push(`${testCase.id} executed a forbidden CoDesign tool`);
    }
  }

  for (const caseId of policy.coreCaseIds) {
    const rows = [...(rowsByCase.get(caseId) ?? [])].sort((left, right) => left.repetition - right.repetition);
    if (rows.length < policy.coreRunsPerCase) failures.push(`${caseId} has ${rows.length}/${policy.coreRunsPerCase} required runs`);
    const selectionPasses = rows.filter((row) => row.selectionPassed).length;
    const argumentPasses = rows.filter((row) => row.argumentsPassed).length;
    if (selectionPasses < policy.minimumSelectionPassesPerCoreCase) failures.push(`${caseId} has ${selectionPasses}/${policy.minimumSelectionPassesPerCoreCase} required selection passes`);
    if (argumentPasses < policy.minimumArgumentPassesPerCoreCase) failures.push(`${caseId} has ${argumentPasses}/${policy.minimumArgumentPassesPerCoreCase} required argument passes`);
  }

  const northFormRows = [...(rowsByCase.get(policy.northFormCaseId) ?? [])].sort((left, right) => left.repetition - right.repetition);
  let longestConsecutive = 0;
  let currentConsecutive = 0;
  let previousRepetition = null;
  for (const row of northFormRows) {
    currentConsecutive = row.fullPassed && (previousRepetition === null || row.repetition === previousRepetition + 1)
      ? currentConsecutive + 1
      : row.fullPassed ? 1 : 0;
    longestConsecutive = Math.max(longestConsecutive, currentConsecutive);
    previousRepetition = row.repetition;
  }
  if (longestConsecutive < policy.northFormConsecutiveSuccesses) {
    failures.push(`${policy.northFormCaseId} has ${longestConsecutive}/${policy.northFormConsecutiveSuccesses} consecutive full successes`);
  }

  return {
    passed: failures.length === 0,
    failures,
    summary: {
      caseCount: cases.size,
      resultCount: Array.isArray(run?.results) ? run.results.length : 0,
      coveredCaseCount: [...cases.keys()].filter((caseId) => (rowsByCase.get(caseId) ?? []).length > 0).length,
      longestNorthFormSuccessStreak: longestConsecutive,
    },
  };
}

function makeSelfTestRun(corpus, policy) {
  const results = [];
  for (const testCase of corpus.cases) {
    const repetitions = policy.coreCaseIds.includes(testCase.id) ? policy.coreRunsPerCase : 1;
    for (let repetition = 1; repetition <= repetitions; repetition += 1) {
      results.push({
        caseId: testCase.id,
        repetition,
        calls: testCase.expectedCoDesignTools.map((name) => ({ name, arguments: {}, argumentsValid: true })),
        outcomePassed: true,
      });
    }
  }
  return {
    schemaVersion: "1.0",
    runType: "actual-model",
    runId: "synthetic-self-test",
    model: "synthetic-not-a-model-run",
    executedAt: "2026-08-27T00:00:00.000Z",
    buildCommit: "a".repeat(40),
    browserBundleSha256: "b".repeat(64),
    toolDefinitionsSha256: "c".repeat(64),
    environment: "synthetic scorer self-test only",
    results,
  };
}

const invokedPath = process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;
if (invokedPath) {
  const corpus = readJson("evals/cases.json");
  const policy = readJson("evals/run-policy.json");
  if (process.argv[2] === "--self-test") {
    const passing = scoreResults(corpus, policy, makeSelfTestRun(corpus, policy));
    const failingRun = makeSelfTestRun(corpus, policy);
    for (const row of failingRun.results) {
      if (row.caseId === policy.northFormCaseId && [3, 8].includes(row.repetition)) row.outcomePassed = false;
    }
    const failing = scoreResults(corpus, policy, failingRun);
    if (!passing.passed || failing.passed) {
      process.stderr.write("Eval scorer self-test failed.\n");
      process.exit(1);
    }
    process.stdout.write("Eval scorer self-test passed; synthetic data was not saved as evidence.\n");
  } else {
    const resultPath = process.argv[2];
    if (!resultPath) {
      process.stderr.write("Usage: npm run score:evals -- path/to/actual-results.json\n");
      process.exit(2);
    }
    const report = scoreResults(corpus, policy, readJson(resultPath));
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (!report.passed) process.exit(1);
  }
}
