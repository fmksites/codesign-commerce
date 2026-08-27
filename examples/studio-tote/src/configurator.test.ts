import { describe, expect, it } from "vitest";
import { ProposalSession, validateManifest, type ConfigurationState } from "@codesign-commerce/core";
import { StudioToteAdapter, toteInitialState, toteManifest } from "./configurator";

const clone = <T>(value: T): T => structuredClone(value);

describe("studio tote portability adapter", () => {
  it("uses a valid, materially different public manifest", () => {
    expect(validateManifest(toteManifest)).toEqual(toteManifest);
    expect(toteManifest.id).toBe("codesign.studio-tote-reference");
    expect(toteManifest.productType).toBe("custom-canvas-studio-tote");
    expect(toteManifest.controls.map((option) => option.id)).toContain("canvas.weight");
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
});
