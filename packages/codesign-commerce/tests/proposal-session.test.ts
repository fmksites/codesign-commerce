import { describe, expect, test } from "vitest";
import { InMemoryConfiguratorAdapter, ProposalSession } from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

function setup() {
  const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState), structuredClone(testManifest));
  const session = new ProposalSession(structuredClone(testManifest), adapter);
  return { adapter, session };
}

describe("ProposalSession", () => {
  test("previews without persistence and reverts exactly", async () => {
    const { adapter, session } = setup();
    const before = adapter.committedState;

    const proposed = await session.propose({
      baseRevision: "revision-1",
      operationId: "change-body-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });

    expect(proposed.ok).toBe(true);
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("navy");
    expect(adapter.committedState).toEqual(before);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);

    await session.revert();
    expect(adapter.visibleState).toEqual(before);
    expect(adapter.committedState).toEqual(before);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
    expect(adapter.counters.restoreCalls).toBe(1);
  });

  test("Keep crosses persistence once", async () => {
    const { adapter, session } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "change-accent-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
    });

    const kept = await session.keep();
    expect("revision" in kept && kept.revision).toBe("revision-2");
    expect(adapter.counters.commitCalls).toBe(1);
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
    expect(adapter.committedState.designs[0]!.selections["accent.color"]).toBe("berry");
  });

  test("rejects stale committed revisions before preview", async () => {
    const { adapter, session } = setup();
    const result = await session.propose({
      baseRevision: "revision-old",
      operationId: "stale-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });

    expect(result).toMatchObject({ ok: false, error: { code: "STALE_REVISION" } });
    expect(adapter.counters.previewCalls).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("rejects invalid batches atomically", async () => {
    const { adapter, session } = setup();
    const before = adapter.visibleState;
    const result = await session.propose({
      baseRevision: "revision-1",
      operationId: "invalid-1",
      changes: [
        { designId: "design-1", optionId: "body.color", value: "navy" },
        { designId: "design-1", optionId: "accent.color", value: "not-allowed" },
      ],
    });

    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_VALUE" } });
    expect(adapter.visibleState).toEqual(before);
    expect(adapter.counters.previewCalls).toBe(0);
    expect(session.status).toBe("idle");
    expect(session.proposalId).toBeNull();

    const next = await session.propose({
      baseRevision: "revision-1",
      operationId: "valid-after-invalid-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    expect(next.ok).toBe(true);
  });

  test("deduplicates a repeated operation", async () => {
    const { adapter, session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "repeat-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    expect(first.ok).toBe(true);
    if (!first.ok) throw new Error("Expected successful proposal");

    const repeated = await session.propose({
      baseRevision: "revision-1",
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "repeat-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });

    expect(repeated).toEqual(first);
    expect(adapter.counters.previewCalls).toBe(1);
  });

  test("binds an operation ID to its original payload", async () => {
    const { adapter, session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "bound-operation-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    if (!first.ok) throw new Error("Expected successful proposal");

    const conflicting = await session.propose({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "bound-operation-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
    });

    expect(conflicting).toMatchObject({ ok: false, error: { code: "OPERATION_ID_CONFLICT", retryable: false } });
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("navy");
    expect(adapter.visibleState.designs[0]!.selections["accent.color"]).toBe("navy");
    expect(adapter.counters.previewCalls).toBe(1);
  });

  test("caps cumulative assumptions before previewing an extension", async () => {
    const { adapter, session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "assumption-limit-first-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
      assumptions: Array.from({ length: 20 }, (_, index) => `Assumption ${index + 1}`),
    });
    if (!first.ok) throw new Error("Expected successful proposal");

    const overflow = await session.propose({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "assumption-limit-second-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
      assumptions: ["Assumption 21"],
    });

    expect(overflow).toMatchObject({ ok: false, error: { code: "INVALID_VALUE", retryable: false } });
    expect(session.status).toBe("awaiting-human");
    expect(adapter.visibleState.designs[0]!.selections["accent.color"]).toBe("navy");
    expect(adapter.counters.previewCalls).toBe(1);
  });

  test("caps successful operations in one proposal", async () => {
    const { adapter, session } = setup();
    let result = await session.propose({
      baseRevision: "revision-1",
      operationId: "bounded-operation-1",
      changes: [{ designId: "design-1", optionId: "design.name", value: "Name 1" }],
    });
    if (!result.ok) throw new Error("Expected successful proposal");

    for (let index = 2; index <= 20; index += 1) {
      result = await session.propose({
        baseRevision: result.baseRevision,
        proposalId: result.proposalId,
        proposalRevision: result.proposalRevision,
        operationId: `bounded-operation-${index}`,
        changes: [{ designId: "design-1", optionId: "design.name", value: `Name ${index}` }],
      });
      if (!result.ok) throw new Error(`Expected successful proposal operation ${index}`);
    }

    const overflow = await session.propose({
      baseRevision: result.baseRevision,
      proposalId: result.proposalId,
      proposalRevision: result.proposalRevision,
      operationId: "bounded-operation-21",
      changes: [{ designId: "design-1", optionId: "design.name", value: "Name 21" }],
    });

    expect(overflow).toMatchObject({ ok: false, error: { code: "CAPABILITY_UNAVAILABLE", retryable: false } });
    expect(session.proposalRevision).toBe(20);
    expect(adapter.visibleState.designs[0]!.name).toBe("Name 20");
    expect(adapter.counters.previewCalls).toBe(20);
  });

  test("rejects a quantity mismatch before preview", async () => {
    const { adapter, session } = setup();
    const result = await session.propose({
      baseRevision: "revision-1",
      operationId: "quantity-mismatch-1",
      changes: [{ designId: "design-1", optionId: "design.quantity", value: 40 }],
    });

    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_VALUE" } });
    expect(adapter.counters.previewCalls).toBe(0);
    expect(session.status).toBe("idle");
  });

  test("preserves an existing proposal when an extension is invalid", async () => {
    const { adapter, session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "valid-first-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    if (!first.ok) throw new Error("Expected successful proposal");

    const invalid = await session.propose({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "invalid-extension-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "not-allowed" }],
    });

    expect(invalid).toMatchObject({ ok: false, error: { code: "INVALID_VALUE" } });
    expect(session.status).toBe("awaiting-human");
    expect(session.proposalRevision).toBe(1);
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("navy");
    expect(adapter.visibleState.designs[0]!.selections["accent.color"]).toBe("navy");
    expect(adapter.counters.previewCalls).toBe(1);
  });

  test("coalesces repeated field changes against the original baseline", async () => {
    const { session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "coalesce-first-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    if (!first.ok) throw new Error("Expected first proposal");
    const returned = await session.propose({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "coalesce-return-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "cream" }],
    });
    expect(returned).toMatchObject({ ok: true, diff: [] });
  });

  test("crosses the local commit boundary once and retries only the server save", async () => {
    const { adapter, session } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "commit-retry-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.failServerSave = true;

    const failed = await session.keep();
    expect(failed).toMatchObject({
      revision: "revision-2",
      localPersisted: true,
      serverPersisted: false,
      errorCode: "SYNTHETIC_SERVER_SAVE_FAILED",
    });
    expect(session.status).toBe("commit-retry");
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(0);
    expect(adapter.committedState.designs[0]!.selections["body.color"]).toBe("navy");

    const revert = await session.revert();
    expect(revert).toMatchObject({ ok: false, error: { code: "COMMIT_ALREADY_STARTED" } });

    adapter.failServerSave = false;
    const retried = await session.keep();
    expect("revision" in retried && retried.revision).toBe("revision-2");
    expect(session.status).toBe("idle");
    expect(adapter.counters.commitCalls).toBe(2);
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("restores and invalidates a proposal after an external committed change", async () => {
    const { adapter, session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "external-change-first-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    if (!first.ok) throw new Error("Expected successful proposal");
    adapter.simulateExternalRevision("revision-external");

    expect(session.status).toBe("invalidated");
    const kept = await session.keep();
    expect(kept).toMatchObject({ ok: false, error: { code: "STALE_REVISION" } });
    expect(session.status).toBe("idle");
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("cream");
    expect(adapter.visibleState.revision).toBe("revision-external");
    expect(adapter.counters.commitCalls).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("discards a proposal when the committed revision changes during validation", async () => {
    const { adapter, session } = setup();
    const originalValidation = adapter.validateState.bind(adapter);
    let releaseValidation!: () => void;
    let validationStarted!: () => void;
    const started = new Promise<void>((resolve) => { validationStarted = resolve; });
    const gate = new Promise<void>((resolve) => { releaseValidation = resolve; });
    adapter.validateState = async (state) => {
      validationStarted();
      await gate;
      return originalValidation(state);
    };

    const proposal = session.propose({
      baseRevision: "revision-1",
      operationId: "external-during-validation-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    await started;
    adapter.simulateExternalRevision("revision-external");
    releaseValidation();

    expect(await proposal).toMatchObject({
      ok: false,
      currentRevision: "revision-external",
      error: { code: "STALE_REVISION" },
    });
    expect(session.status).toBe("idle");
    expect(session.proposalId).toBeNull();
    expect(adapter.visibleState).toEqual(adapter.committedState);
    expect(adapter.counters.commitCalls).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("adapter compare-and-swap closes an external-change race immediately before Keep writes", async () => {
    const { adapter, session } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "keep-race-proposal-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    const originalCommit = adapter.commitState.bind(adapter);
    adapter.commitState = async (state, commitMetadata) => {
      adapter.simulateExternalRevision("revision-external");
      return originalCommit(state, commitMetadata);
    };

    const result = await session.keep();
    expect(result).toMatchObject({
      ok: false,
      currentRevision: "revision-external",
      error: { code: "STALE_REVISION" },
    });
    expect(session.status).toBe("idle");
    expect(adapter.visibleState).toEqual(adapter.committedState);
    expect(adapter.committedState.designs[0]!.selections["body.color"]).toBe("cream");
    expect(adapter.counters.commitCalls).toBe(1);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("fails closed when an adapter throws before reporting commit status", async () => {
    const { adapter, session } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "uncertain-commit-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.throwDuringCommit = true;

    const result = await session.keep();
    expect(result).toMatchObject({
      ok: false,
      persisted: "unknown",
      error: { code: "COMMIT_STATUS_UNKNOWN", retryable: false },
    });
    expect(session.status).toBe("commit-uncertain");
    expect((await session.revert())).toMatchObject({ ok: false, error: { code: "COMMIT_ALREADY_STARTED" } });
    expect((await session.keep())).toMatchObject({ ok: false, error: { code: "COMMIT_STATUS_UNKNOWN" } });
  });

  test("serializes proposal operations while adapter validation is in flight", async () => {
    const { adapter, session } = setup();
    const originalValidation = adapter.validateState.bind(adapter);
    let releaseValidation!: () => void;
    let validationStarted!: () => void;
    const started = new Promise<void>((resolve) => { validationStarted = resolve; });
    const gate = new Promise<void>((resolve) => { releaseValidation = resolve; });
    adapter.validateState = async (state) => {
      validationStarted();
      await gate;
      return originalValidation(state);
    };

    const firstPromise = session.propose({
      baseRevision: "revision-1",
      operationId: "concurrent-first-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    await started;

    const second = await session.propose({
      baseRevision: "revision-1",
      operationId: "concurrent-second-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
    });
    const keep = await session.keep();
    expect(second).toMatchObject({ ok: false, error: { code: "OPERATION_IN_PROGRESS" } });
    expect(keep).toMatchObject({ ok: false, error: { code: "OPERATION_IN_PROGRESS" } });
    expect(adapter.counters.previewCalls).toBe(0);

    releaseValidation();
    expect(await firstPromise).toMatchObject({ ok: true, proposalRevision: 1 });
    expect(adapter.counters.previewCalls).toBe(1);
  });

  test("rejects unsafe operation identifiers before touching the adapter", async () => {
    const { adapter, session } = setup();
    const result = await session.propose({
      baseRevision: "revision-1",
      operationId: "constructor",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_VALUE" } });
    expect(adapter.counters.quiesceCalls).toBe(0);
  });

  test("creates and extends one proposal with a second design atomically", async () => {
    const { adapter, session } = setup();
    const first = await session.propose({
      baseRevision: "revision-1",
      operationId: "create-sequence-first-1",
      changes: [{ designId: "design-1", optionId: "design.name", value: "North Form Cream" }],
      assumptions: ["Final logo artwork will be supplied later."],
    });
    if (!first.ok) throw new Error("Expected first proposal");

    const created = await session.createDesign({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "create-sequence-second-1",
      sourceDesignId: "design-1",
      changes: [{ designId: "design-1", optionId: "design.quantity", value: 30 }],
      newDesignChanges: [
        { optionId: "design.name", value: "North Form Rose" },
        { optionId: "design.quantity", value: 30 },
        { optionId: "body.color", value: "rose" },
        { optionId: "accent.color", value: "berry" },
      ],
    });

    expect(created).toMatchObject({
      ok: true,
      proposalRevision: 2,
      persisted: false,
      createdDesigns: [{ designId: "design-2", sourceDesignId: "design-1", name: "North Form Rose" }],
    });
    expect(adapter.visibleState.designs.map((design) => [design.name, design.quantity])).toEqual([
      ["North Form Cream", 30],
      ["North Form Rose", 30],
    ]);
    expect(adapter.committedState.designs).toHaveLength(1);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);

    const validation = await session.validateConfiguration({
      proposalId: session.proposalId!,
      proposalRevision: session.proposalRevision!,
    });
    expect(validation).toMatchObject({
      ok: true,
      source: "proposal",
      validation: { configurationValid: true, assumptions: ["Final logo artwork will be supplied later."] },
    });
  });

  test("deduplicates create-design retries and never creates a third design", async () => {
    const { adapter, session } = setup();
    const input = {
      baseRevision: "revision-1",
      operationId: "create-dedup-1",
      sourceDesignId: "design-1",
      changes: [{ designId: "design-1", optionId: "design.quantity", value: 30 }],
      newDesignChanges: [{ optionId: "design.quantity", value: 30 }],
    };
    const first = await session.createDesign(input);
    if (!first.ok) throw new Error("Expected design creation");
    const repeated = await session.createDesign({
      ...input,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
    });
    expect(repeated).toEqual(first);
    expect(adapter.visibleState.designs).toHaveLength(2);
    expect(adapter.counters.createDesignDraftCalls).toBe(1);
    expect(adapter.counters.previewCalls).toBe(1);
  });

  test("rejects an invalid cloned batch without changing the visible baseline", async () => {
    const { adapter, session } = setup();
    const before = adapter.visibleState;
    const result = await session.createDesign({
      baseRevision: "revision-1",
      operationId: "create-invalid-1",
      sourceDesignId: "design-1",
      newDesignChanges: [{ optionId: "body.color", value: "not-allowed" }],
    });
    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_VALUE" } });
    expect(adapter.visibleState).toEqual(before);
    expect(adapter.counters.previewCalls).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
    expect(session.status).toBe("idle");
  });
});
