import { describe, expect, it } from "vitest";
import { AssetSandbox, PreviewBridge, ProposalEngine, ProposalReviewController } from "@codesign-commerce/core";
import { StudioToteAssetProofStore } from "./asset-proof";
import { StudioToteAdapter, toteInitialState, toteManifest } from "./configurator";

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const tinyWebp = `data:image/webp;base64,${btoa(String.fromCharCode(...Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x04, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])))}`;

async function setupAssetProposal() {
  const store = new StudioToteAssetProofStore();
  const adapter = new StudioToteAdapter(structuredClone(toteInitialState), undefined, store);
  const sandbox = new AssetSandbox(toteManifest, store);
  const previews = new PreviewBridge(toteManifest, { async capturePreviews(request) {
    return [{
      variantId: request.variantIds?.[0] ?? "tote-1",
      surfaceId: "product-preview",
      mediaType: "image/webp" as const,
      width: 640,
      height: 640,
      altText: "Studio tote with supplied North Form artwork",
      transport: { kind: "data-url" as const, value: tinyWebp },
    }];
  } });
  const engine = new ProposalEngine(toteManifest, adapter, { assetSandbox: sandbox, previewBridge: previews });
  const controller = new ProposalReviewController(toteManifest, engine);
  const staged = await engine.stageAsset({
    baseRevision: toteInitialState.revision,
    slotId: "print-artwork",
    source: { kind: "data-url", data: tinyPng },
    filename: "north-form.png",
    altText: "North Form NF mark",
  });
  if (!staged.ok) throw new Error("expected staged asset");
  const proposal = await engine.apply({
    baseRevision: toteInitialState.revision,
    operationId: "asset-proof-proposal",
    operations: [
      { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "bag.color", value: "charcoal" },
      { type: "attach-asset", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.artwork_ref", assetHandle: staged.asset.assetHandle },
    ],
  });
  return { store, adapter, engine, controller, staged: staged.asset, proposal };
}

async function capture(engine: ProposalEngine<any, any>) {
  const snapshot = engine.snapshot;
  if (!snapshot.proposalId || !snapshot.baseRevision) throw new Error("expected proposal");
  return engine.capturePreviews({ proposalId: snapshot.proposalId, proposalRevision: snapshot.proposalRevision, baseRevision: snapshot.baseRevision });
}

describe("studio tote supplied-artwork proposal lifecycle", () => {
  it("renders an outer-sandbox handle as a production-ready proposal and Reverts without import", async () => {
    const { store, adapter, controller, staged, proposal } = await setupAssetProposal();
    expect(proposal).toMatchObject({ ok: true, persisted: false, validation: { configurationValid: true, productionReady: true } });
    expect(adapter.visibleState.designs[0]!.selections["branding.artwork_ref"]).toBe(staged.assetHandle);
    expect(adapter.counters).toMatchObject({ previewCalls: 1, localWrites: 0, serverWrites: 0, commitCalls: 0 });
    await expect(controller.revert()).resolves.toEqual({ reverted: true, persisted: false });
    expect(adapter.committedState).toEqual(toteInitialState);
    expect(store.resolve(staged.assetHandle)).toBeNull();
    expect(store.counters.importCalls).toBe(0);
    expect(adapter.counters).toMatchObject({ restoreCalls: 1, localWrites: 0, serverWrites: 0, commitCalls: 0 });
  });

  it("imports and saves once through the page controller, then rejects duplicate Keep", async () => {
    const { store, adapter, engine, controller, staged, proposal } = await setupAssetProposal();
    expect(proposal).toMatchObject({ ok: true, persisted: false });
    await capture(engine);
    await expect(controller.keep()).resolves.toEqual({ revision: "tote-revision-2", localPersisted: true, serverPersisted: true });
    const savedReference = adapter.committedState.designs[0]!.selections["branding.artwork_ref"];
    expect(savedReference).toMatch(/^saved-[0-9a-f]{24}$/);
    expect(savedReference).not.toBe(staged.assetHandle);
    expect(adapter.committedState.designs[0]!.assets[0]).toMatchObject({ status: "ready" });
    expect(store.resolve(savedReference)?.dataUrl).toBe(tinyPng);
    expect(store.counters.importCalls).toBe(1);
    expect(adapter.counters).toMatchObject({ commitCalls: 1, localWrites: 1, serverWrites: 1 });
    await expect(controller.keep()).resolves.toMatchObject({ ok: false, error: { code: "NO_PROPOSAL" } });
    expect(store.counters.importCalls).toBe(1);
    expect(adapter.counters.commitCalls).toBe(1);
    await expect(engine.validate({})).resolves.toMatchObject({ ok: true, source: "committed", baseRevision: "tote-revision-2", validation: { productionReady: true } });
  });
});
