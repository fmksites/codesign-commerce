import { describe, expect, test } from "vitest";
import { InMemoryConfiguratorAdapter, ProposalSession } from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

function setup() {
  const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
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

  test("crosses the local commit boundary once and retries only the server save", async () => {
    const { adapter, session } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "commit-retry-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.failCommit = true;

    const failed = await session.keep();
    expect(failed).toMatchObject({
      ok: false,
      currentRevision: "revision-2",
      error: { code: "ADAPTER_FAILURE", retryable: true },
    });
    expect(session.status).toBe("commit-retry");
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(0);
    expect(adapter.committedState.designs[0]!.selections["body.color"]).toBe("navy");

    const revert = await session.revert();
    expect(revert).toMatchObject({ ok: false, error: { code: "COMMIT_ALREADY_STARTED" } });

    adapter.failCommit = false;
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

    const next = await session.propose({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "external-change-second-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
    });

    expect(next).toMatchObject({ ok: false, error: { code: "STALE_REVISION" } });
    expect(session.status).toBe("idle");
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("cream");
    expect(adapter.counters.restoreCalls).toBe(1);
  });
});
