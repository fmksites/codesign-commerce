import { describe, expect, it } from "vitest";
import { ProposalSession, validateManifest, type ConfigurationState } from "@codesign-webmcp/core";
import { StudioToteAssetProofStore } from "./asset-proof";
import { StudioToteAdapter, toteInitialState, toteManifest } from "./configurator";

const clone = <T>(value: T): T => structuredClone(value);

describe("studio tote portability adapter", () => {
  it("uses a valid, materially different public manifest", () => {
    expect(validateManifest(toteManifest)).toEqual(toteManifest);
    expect(toteManifest.id).toBe("codesign.studio-tote-reference");
    expect(toteManifest.productType).toBe("custom-canvas-studio-tote");
    expect(toteManifest.controls.map((option) => option.id)).toContain("canvas.weight");
    expect(toteManifest.controls.map((option) => option.id)).toEqual(expect.arrayContaining([
      "branding.artwork_ref",
      "branding.text",
      "branding.typeface",
      "branding.ink_color",
      "branding.scale",
      "branding.rotation",
    ]));
    expect(toteManifest.controls.map((option) => option.id)).not.toContain("body.color");
  });

  it("keeps a coherent draft valid while final print artwork is missing", async () => {
    const result = await new StudioToteAdapter().validateState(clone(toteInitialState));
    expect(result).toMatchObject({
      configurationValid: true,
      productionReady: false,
      issues: [{ code: "FINAL_PRINT_ARTWORK_REQUIRED", severity: "decision-required" }],
    });
  });

  it.each([
    ["8oz", "embroidery", true, 100, "EMBROIDERY_REQUIRES_SUBSTANTIAL_CANVAS"],
    ["16oz", "screen-1", false, 100, "EXTRA_HEAVY_REQUIRES_REINFORCEMENT"],
    ["12oz", "screen-2", true, 25, "TWO_COLOUR_PRINT_MINIMUM"],
  ])("enforces coupled canvas and print rules", async (weight, method, reinforced, quantity, code) => {
    const state = clone(toteInitialState);
    state.designs[0]!.selections["canvas.weight"] = weight;
    state.designs[0]!.selections["print.method"] = method;
    state.designs[0]!.selections["construction.reinforced"] = reinforced;
    state.designs[0]!.quantity = quantity;
    state.order.totalQuantity = quantity;
    const result = await new StudioToteAdapter().validateState(state);
    expect(result.configurationValid).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code })]));
  });

  it("exposes the current visible validation result for the human readiness panel", () => {
    const invalid = clone(toteInitialState);
    invalid.designs[0]!.selections["canvas.weight"] = "8oz";
    invalid.designs[0]!.selections["print.method"] = "embroidery";
    const adapter = new StudioToteAdapter(invalid);

    expect(adapter.validateVisibleState()).toMatchObject({
      configurationValid: false,
      issues: expect.arrayContaining([expect.objectContaining({
        code: "EMBROIDERY_REQUIRES_SUBSTANTIAL_CANVAS",
        message: "Embroidery requires 12 oz or 16 oz canvas",
      })]),
    });
  });

  it("creates two temporary variants, reverts without writes, and keeps once", async () => {
    const adapter = new StudioToteAdapter();
    const session = new ProposalSession(toteManifest, adapter);
    const first = await session.propose({
      baseRevision: toteInitialState.revision,
      operationId: "tote-test-first",
      changes: [{ designId: "tote-1", optionId: "design.name", value: "Natural long-handle" }],
      assumptions: ["Final print artwork will be supplied later."],
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const created = await session.createDesign({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "tote-test-second",
      sourceDesignId: "tote-1",
      changes: [{ designId: "tote-1", optionId: "design.quantity", value: 50 }],
      newDesignChanges: [
        { optionId: "design.name", value: "Charcoal short-handle" },
        { optionId: "design.quantity", value: 50 },
        { optionId: "bag.color", value: "charcoal" },
        { optionId: "handles.length", value: "short" },
      ],
    });
    expect(created).toMatchObject({ ok: true, persisted: false, proposalRevision: 2 });
    expect(adapter.visibleState.designs).toHaveLength(2);
    await session.revert();
    expect(adapter.committedState).toEqual(toteInitialState);
    expect(adapter.counters).toMatchObject({ localWrites: 0, serverWrites: 0, restoreCalls: 1 });

    const retry = await session.propose({
      baseRevision: toteInitialState.revision,
      operationId: "tote-test-keep",
      changes: [{ designId: "tote-1", optionId: "design.name", value: "Kept tote" }],
    });
    expect(retry.ok).toBe(true);
    await session.keep();
    expect(adapter.counters).toMatchObject({ localWrites: 1, serverWrites: 1, commitCalls: 1 });
  });

  it("does not expose private or commercial fields", async () => {
    const state: ConfigurationState = await new StudioToteAdapter().readState();
    const serialized = JSON.stringify({ manifest: toteManifest, state });
    for (const marker of ["price", "margin", "supplier", "customer", "token", "checkout", "quote"]) {
      expect(serialized.toLowerCase()).not.toContain(marker);
    }
  });

  it("keeps ordinary human editing functional outside proposal mode", () => {
    const seeded = clone(toteInitialState);
    seeded.revision = "tote-revision-7";
    const persisted: ConfigurationState[] = [];
    const adapter = new StudioToteAdapter(seeded, (state) => persisted.push(state));
    expect(adapter.applyHumanChange("tote-1", "bag.color", "charcoal")).toBe(true);
    expect(adapter.applyHumanChange("tote-1", "design.quantity", 50)).toBe(true);
    expect(adapter.committedState).toMatchObject({
      revision: "tote-revision-9",
      order: { totalQuantity: 50 },
      designs: [{ quantity: 50, selections: { "bag.color": "charcoal" } }],
    });
    expect(persisted).toHaveLength(2);
  });

  it("synchronizes an authoritative draft from another browser tab", () => {
    const adapter = new StudioToteAdapter();
    const revisions: string[] = [];
    adapter.subscribeToExternalChanges((revision) => revisions.push(revision));
    const external = clone(toteInitialState);
    external.revision = "tote-revision-4";
    external.designs[0]!.selections["bag.color"] = "charcoal";

    expect(adapter.synchronizeExternalState(external)).toBe(true);
    expect(adapter.committedState).toEqual(external);
    expect(adapter.visibleState).toEqual(external);
    expect(revisions).toEqual(["tote-revision-4"]);
    expect(adapter.synchronizeExternalState(external)).toBe(false);

    expect(adapter.applyHumanChange("tote-1", "handles.length", "short")).toBe(true);
    expect(adapter.committedState.revision).toBe("tote-revision-5");
  });

  it("keeps the human path complete for typography, transforms, variants, and artwork", async () => {
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const store = new StudioToteAssetProofStore();
    const persisted: ConfigurationState[] = [];
    const adapter = new StudioToteAdapter(toteInitialState, (state) => persisted.push(state), store);
    expect(adapter.applyHumanChange("tote-1", "branding.text", "NORTH FORM STUDIO")).toBe(true);
    expect(adapter.applyHumanChange("tote-1", "branding.typeface", "editorial")).toBe(true);
    expect(adapter.applyHumanChange("tote-1", "branding.scale", 1.25)).toBe(true);
    expect(adapter.applyHumanChange("tote-1", "branding.rotation", -8)).toBe(true);
    const secondId = adapter.addHumanVariant("tote-1");
    expect(secondId).toBeTruthy();
    expect(adapter.committedState.designs.map((design) => design.quantity)).toEqual([50, 50]);
    expect(adapter.committedState.order.totalQuantity).toBe(100);
    expect(adapter.setHumanActiveVariant(secondId!)).toBe(true);
    expect(await adapter.applyHumanArtwork(secondId!, {
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      filename: "north-form.png",
      altText: "North Form supplied artwork",
    })).toBe(true);
    const savedReference = adapter.committedState.designs[1]!.selections["branding.artwork_ref"];
    expect(savedReference).toMatch(/^saved-[0-9a-f]{24}$/);
    expect(store.resolve(savedReference)?.dataUrl).toBe(tinyPng);
    expect(adapter.removeHumanArtwork(secondId!)).toBe(true);
    expect(adapter.committedState.designs[1]!.selections["branding.artwork_ref"]).toBeUndefined();
    expect(store.exportCommitted()).toHaveLength(0);
    expect(persisted.length).toBeGreaterThanOrEqual(8);
  });

  it("does not duplicate a minimum-quantity variant by inflating the collection total", () => {
    const minimumState = clone(toteInitialState);
    minimumState.designs[0]!.quantity = 25;
    minimumState.order.totalQuantity = 25;
    const adapter = new StudioToteAdapter(minimumState);

    expect(adapter.addHumanVariant("tote-1")).toBeNull();
    expect(adapter.committedState.designs).toHaveLength(1);
    expect(adapter.committedState.order.totalQuantity).toBe(25);
  });
});
