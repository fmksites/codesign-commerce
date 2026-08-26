import { describe, expect, test } from "vitest";
import { InMemoryConfiguratorAdapter, type CommitMetadata } from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

const metadata: CommitMetadata = {
  proposalId: "contract-proposal-1",
  baseRevision: "revision-1",
  operationIds: ["contract-operation-1"],
  trigger: "agent_proposal_keep",
};

describe("ConfiguratorAdapter contract", () => {
  test("returns detached canonical state rather than a mutable raw reference", async () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
    const first = await adapter.readState();
    first.designs[0]!.name = "Mutated outside adapter";
    expect((await adapter.readState()).designs[0]!.name).toBe("Design 1");
  });

  test("preview and restore never write local or server persistence", async () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
    const snapshot = await adapter.captureSnapshot();
    const draft = await adapter.readState();
    draft.designs[0]!.selections["body.color"] = "navy";

    await adapter.previewState(draft);
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("navy");
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);

    await adapter.restoreSnapshot(snapshot);
    expect(adapter.visibleState).toEqual(testState);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("commit is idempotent for one proposal ID", async () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
    const draft = await adapter.readState();
    draft.designs[0]!.selections["body.color"] = "navy";

    const first = await adapter.commitState(draft, metadata);
    const repeated = await adapter.commitState(draft, metadata);
    expect(first).toEqual(repeated);
    expect(adapter.counters.commitCalls).toBe(2);
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("compare-and-swap rejects a stale base revision before any write", async () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
    const draft = await adapter.readState();
    draft.designs[0]!.selections["body.color"] = "navy";
    adapter.simulateExternalRevision("revision-external");

    const result = await adapter.commitState(draft, metadata);
    expect(result).toEqual({
      revision: "revision-external",
      localPersisted: false,
      serverPersisted: false,
      errorCode: "STALE_REVISION",
    });
    expect(adapter.committedState.designs[0]!.selections["body.color"]).toBe("cream");
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("expected server failure is explicit and retry does not repeat the local write", async () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
    const draft = await adapter.readState();
    draft.designs[0]!.selections["accent.color"] = "berry";
    adapter.failServerSave = true;

    const failed = await adapter.commitState(draft, metadata);
    expect(failed).toMatchObject({ localPersisted: true, serverPersisted: false, errorCode: "SYNTHETIC_SERVER_SAVE_FAILED" });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(0);

    adapter.failServerSave = false;
    const retried = await adapter.commitState(draft, metadata);
    expect(retried).toMatchObject({ localPersisted: true, serverPersisted: true });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("notifies and unsubscribes external revision listeners", () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
    const revisions: string[] = [];
    const unsubscribe = adapter.subscribeToExternalChanges((revision) => revisions.push(revision));
    adapter.simulateExternalRevision("revision-2");
    unsubscribe();
    adapter.simulateExternalRevision("revision-3");
    expect(revisions).toEqual(["revision-2"]);
  });

  test("creates a detached draft clone without preview or persistence side effects", async () => {
    const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState), structuredClone(testManifest));
    const committed = await adapter.readState();
    const result = await adapter.createDesignDraft(committed, {
      sourceDesignId: "design-1",
      operationId: "adapter-clone-1",
    });

    expect(result).toMatchObject({ designId: "design-2", state: { activeDesignId: "design-2" } });
    expect(result.state.designs).toHaveLength(2);
    expect(result.state.designs[1]).toMatchObject({ id: "design-2", name: "Design 1 copy" });
    expect(adapter.visibleState).toEqual(testState);
    expect(adapter.committedState).toEqual(testState);
    expect(adapter.counters.previewCalls).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });
});
