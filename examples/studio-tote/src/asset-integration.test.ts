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
    return (request.variantIds ?? ["tote-1"]).map((variantId) => ({
      variantId,
      surfaceId: "product-preview",
      mediaType: "image/webp" as const,
      width: 640,
      height: 640,
      altText: "Studio tote with supplied North Form artwork",
      transport: { kind: "data-url" as const, value: tinyWebp },
    }));
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

  it("builds in three coherent passes, previews both variants, and refines only the named target", async () => {
    const store = new StudioToteAssetProofStore();
    const adapter = new StudioToteAdapter(structuredClone(toteInitialState), undefined, store);
    const sandbox = new AssetSandbox(toteManifest, store);
    const previews = new PreviewBridge(toteManifest, { async capturePreviews(request) {
      return (request.variantIds ?? ["tote-1"]).map((variantId) => ({
        variantId,
        surfaceId: "product-preview",
        mediaType: "image/webp" as const,
        width: 640,
        height: 640,
        altText: `${variantId} tote preview with supplied artwork`,
        transport: { kind: "data-url" as const, value: tinyWebp },
      }));
    } });
    const engine = new ProposalEngine(toteManifest, adapter, { assetSandbox: sandbox, previewBridge: previews });
    const controller = new ProposalReviewController(toteManifest, engine);

    const foundation = await engine.apply({
      baseRevision: toteInitialState.revision,
      operationId: "judge-foundation",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "design.name", value: "North Form Natural" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "canvas.weight", value: "12oz" },
      ],
      assumptions: ["Use the merchant's heavyweight studio canvas."],
    });
    expect(foundation).toMatchObject({ ok: true, proposalRevision: 1, persisted: false });
    if (!foundation.ok) return;

    const staged = await engine.stageAsset({
      baseRevision: foundation.baseRevision,
      proposalId: foundation.proposalId,
      proposalRevision: foundation.proposalRevision,
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      filename: "north-form.png",
      altText: "North Form supplied mark",
    });
    expect(staged.ok).toBe(true);
    if (!staged.ok) return;
    const branding = await engine.apply({
      baseRevision: foundation.baseRevision,
      proposalId: foundation.proposalId,
      proposalRevision: foundation.proposalRevision,
      operationId: "judge-branding",
      operations: [
        { type: "attach-asset", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.artwork_ref", assetHandle: staged.asset.assetHandle },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.scale", value: 1.05 },
      ],
    });
    expect(branding).toMatchObject({ ok: true, proposalRevision: 2, persisted: false });
    if (!branding.ok) return;
    expect(adapter.validateVisibleState().issues).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "ARTWORK_HANDLE_UNAVAILABLE" }),
    ]));

    const variants = await engine.apply({
      baseRevision: branding.baseRevision,
      proposalId: branding.proposalId,
      proposalRevision: branding.proposalRevision,
      operationId: "judge-variants",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "design.quantity", value: 50 },
        { type: "duplicate-variant", sourceVariantId: "tote-1", variantId: "tote-2", name: "North Form Charcoal", initialControls: { "design.quantity": 50, "bag.color": "charcoal", "handles.length": "short", "print.position": "upper-left", "branding.scale": .82, "branding.rotation": -6 } },
      ],
    });
    expect(variants).toMatchObject({ ok: true, proposalRevision: 3, persisted: false, validation: { productionReady: true } });
    if (!variants.ok) return;
    const naturalBefore = structuredClone(variants.workspace.variants.find((variant) => variant.id === "tote-1"));
    const initialPreviews = await engine.capturePreviews({
      baseRevision: variants.baseRevision,
      proposalId: variants.proposalId,
      proposalRevision: variants.proposalRevision,
      variantIds: ["tote-1", "tote-2"],
      surfaceIds: ["product-preview"],
    });
    expect(initialPreviews).toMatchObject({ ok: true, persisted: false, artifacts: [{ variantId: "tote-1" }, { variantId: "tote-2" }] });

    const refined = await engine.apply({
      baseRevision: variants.baseRevision,
      proposalId: variants.proposalId,
      proposalRevision: variants.proposalRevision,
      operationId: "judge-refine-charcoal",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "tote-2" }, controlId: "design.name", value: "North Form Night" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-2" }, controlId: "branding.ink_color", value: "canvas" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-2" }, controlId: "branding.scale", value: .7 },
        { type: "set-control", target: { scope: "variant", variantId: "tote-2" }, controlId: "branding.rotation", value: 12 },
      ],
      assumptions: ["Make only the charcoal direction quieter and more premium."],
    });
    expect(refined).toMatchObject({ ok: true, proposalRevision: 4, persisted: false });
    if (!refined.ok) return;
    expect(refined.workspace.variants.find((variant) => variant.id === "tote-1")).toEqual(naturalBefore);
    expect(refined.workspace.variants.find((variant) => variant.id === "tote-2")).toMatchObject({
      name: "North Form Night",
      controls: {
      "branding.ink_color": "canvas",
      "branding.scale": .7,
      "branding.rotation": 12,
      },
    });
    expect(controller.state).toMatchObject({ kind: "temporary", activeVariantName: "North Form Natural", previewReady: false, canKeep: false });
    if (controller.state.kind === "temporary") {
      expect(controller.state.createdVariants).toEqual([{ variantId: "tote-2", name: "North Form Night" }]);
      expect(controller.state.changes).toEqual(expect.arrayContaining([
        expect.objectContaining({ targetLabel: "North Form Night", label: "Body colour", before: "Not set", after: "Charcoal" }),
        expect.objectContaining({ targetLabel: "North Form Night", label: "Handles", before: "Not set", after: "Short tote · 33 cm" }),
        expect.objectContaining({ targetLabel: "North Form Night", label: "Print placement", before: "Not set", after: "Upper left" }),
        expect.objectContaining({ targetLabel: "North Form Night", label: "Artwork scale", before: "Not set", after: "70%" }),
        expect.objectContaining({ targetLabel: "North Form Night", label: "Artwork rotation", before: "Not set", after: "12°" }),
      ]));
    }
    await expect(controller.revert()).resolves.toEqual({ reverted: true, persisted: false });
    expect(adapter.committedState).toEqual(toteInitialState);
    expect(adapter.counters).toMatchObject({ localWrites: 0, serverWrites: 0, commitCalls: 0 });
  });
});
