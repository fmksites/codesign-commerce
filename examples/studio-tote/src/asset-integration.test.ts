import { describe, expect, it } from "vitest";
import { ProposalReviewController, ProposalSession } from "@codesign-commerce/core";
import { StudioToteAssetProofStore } from "./asset-proof";
import { StudioToteAdapter, toteInitialState, toteManifest } from "./configurator";

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function setupAssetProposal() {
  const store = new StudioToteAssetProofStore();
  const adapter = new StudioToteAdapter(structuredClone(toteInitialState), undefined, store);
  const session = new ProposalSession(toteManifest, adapter);
  const controller = new ProposalReviewController(toteManifest, session);
  const staged = await store.stage({
    slotId: "print-artwork",
    source: { kind: "data-url", data: tinyPng },
    filename: "north-form.png",
    altText: "North Form NF mark",
  });
  const proposal = await session.propose({
    baseRevision: toteInitialState.revision,
    operationId: "asset-proof-proposal",
    changes: [
      { designId: "tote-1", optionId: "bag.color", value: "charcoal" },
      { designId: "tote-1", optionId: "branding.artwork_ref", value: staged.assetHandle },
    ],
  });
  return { store, adapter, session, controller, staged, proposal };
}

describe("studio tote supplied-artwork proposal lifecycle", () => {
  it("renders a staged handle as a production-ready zero-write proposal and Reverts without import", async () => {
    const { store, adapter, controller, staged, proposal } = await setupAssetProposal();
    expect(proposal).toMatchObject({ ok: true, persisted: false, validation: { configurationValid: true, productionReady: true } });
    expect(adapter.visibleState.designs[0]!.selections["branding.artwork_ref"]).toBe(staged.assetHandle);
    expect(adapter.counters).toMatchObject({ previewCalls: 1, localWrites: 0, serverWrites: 0, commitCalls: 0 });

    await expect(controller.revert()).resolves.toEqual({ reverted: true, persisted: false });
    store.releaseTemporary();
    expect(adapter.committedState).toEqual(toteInitialState);
    expect(store.resolve(staged.assetHandle)).toBeNull();
    expect(store.counters).toMatchObject({ importCalls: 0, releasedAssets: 1 });
    expect(adapter.counters).toMatchObject({ restoreCalls: 1, localWrites: 0, serverWrites: 0, commitCalls: 0 });
  });

  it("imports and saves once through the page controller, then rejects duplicate Keep", async () => {
    const { store, adapter, session, controller, staged, proposal } = await setupAssetProposal();
    expect(proposal).toMatchObject({ ok: true, persisted: false });

    await expect(controller.keep()).resolves.toEqual({
      revision: "tote-revision-2",
      localPersisted: true,
      serverPersisted: true,
    });
    const savedReference = adapter.committedState.designs[0]!.selections["branding.artwork_ref"];
    expect(savedReference).toMatch(/^saved-[0-9a-f]{24}$/);
    expect(savedReference).not.toBe(staged.assetHandle);
    expect(adapter.committedState.designs[0]!.assets[0]).toMatchObject({ status: "ready" });
    expect(store.resolve(savedReference)?.dataUrl).toBe(tinyPng);
    expect(store.counters.importCalls).toBe(1);
    expect(adapter.counters).toMatchObject({ commitCalls: 1, localWrites: 1, serverWrites: 1 });

    await expect(controller.keep()).resolves.toMatchObject({ ok: false, error: { code: "NO_PROPOSAL" } });
    expect(store.counters.importCalls).toBe(1);
    expect(adapter.counters).toMatchObject({ commitCalls: 1, localWrites: 1, serverWrites: 1 });

    await expect(session.validateConfiguration({})).resolves.toMatchObject({
      ok: true,
      source: "committed",
      revision: "tote-revision-2",
      validation: { productionReady: true },
    });
  });
});
