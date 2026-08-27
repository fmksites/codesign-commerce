import { afterEach, describe, expect, test, vi } from "vitest";
import {
  AssetSandbox,
  CODESIGN_TOOL_NAMES,
  createCoDesignTools,
  PreviewBridge,
  ProposalEngine,
  registerCoDesignTools,
  type WebMcpTool,
} from "../src/index.js";
import { workspaceTestManifest } from "./workspace-fixtures.js";
import { tinyPng, V2TestAdapter } from "./v2-test-adapter.js";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function setup() {
  const adapter = new V2TestAdapter();
  const assetSandbox = new AssetSandbox(workspaceTestManifest, adapter);
  const previewBridge = new PreviewBridge(workspaceTestManifest, adapter);
  const engine = new ProposalEngine(workspaceTestManifest, adapter, { assetSandbox, previewBridge });
  const tools = createCoDesignTools({ engine });
  return { adapter, engine, tools };
}

function applyInput(operationId = "change-colour") {
  return {
    baseRevision: "workspace-revision-1",
    operationId,
    operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
  };
}

function assertClosedObjects(schema: unknown): void {
  if (!isRecord(schema)) return;
  if (schema.type === "object") expect(schema.additionalProperties).toBe(false);
  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) value.forEach(assertClosedObjects);
    else assertClosedObjects(value);
  }
}

describe("CoDesign WebMCP six-tool surface", () => {
  afterEach(() => vi.restoreAllMocks());

  test("exposes exactly the six reusable tools and no persistence or commerce tool", () => {
    const { tools } = setup();
    expect(tools.map((tool) => tool.name)).toEqual([...CODESIGN_TOOL_NAMES]);
    expect(tools.map((tool) => tool.annotations.readOnlyHint)).toEqual([true, true, false, false, true, true]);
    expect(tools.every((tool) => tool.annotations.untrustedContentHint)).toBe(true);
    expect(tools.map((tool) => tool.name).join(" ")).not.toMatch(/keep|revert|save|upload|quote|checkout|order|payment/);
    tools.forEach((tool) => assertClosedObjects(tool.inputSchema));
  });

  test("reads a sanitized committed workspace and bounded proposal metadata", async () => {
    const { tools } = setup();
    const read = await tools[0]!.execute({});
    expect(read).toMatchObject({
      ok: true,
      persisted: false,
      configurator: { id: workspaceTestManifest.id, version: workspaceTestManifest.version },
      workspace: { committedRevision: "workspace-revision-1", activeVariantId: "variant-1" },
      pendingProposal: null,
    });
    expect(JSON.stringify(read)).not.toMatch(/price|margin|supplier|customer|token/i);
  });

  test("lists filtered controls, variants, assets, previews, and dependencies", async () => {
    const { tools } = setup();
    const result = await tools[1]!.execute({
      variantId: "variant-1",
      controlIds: ["body.color", "mark.artwork"],
      categories: ["controls", "variants", "assets", "previews", "dependencies"],
    });
    expect(result).toMatchObject({
      ok: true,
      persisted: false,
      target: { variantId: "variant-1", elementId: null },
      controls: [{ controlId: "body.color", available: true }, { controlId: "mark.artwork", available: true }],
      variantPolicy: { maximumVariants: 5 },
      assetSlots: [{ id: "mark-artwork" }],
      previewSurfaces: [{ id: "product-preview" }],
    });
    expect(await tools[1]!.execute({ variantId: "missing" })).toMatchObject({ ok: false, error: { code: "UNKNOWN_TARGET" } });
  });

  test("applies atomic visible changes with zero writes and reports a cumulative diff", async () => {
    const { adapter, tools } = setup();
    const result = await tools[3]!.execute(applyInput());
    expect(result).toMatchObject({
      ok: true,
      persisted: false,
      proposalRevision: 1,
      diff: { controlChanges: [{ controlId: "body.color", before: "cream", after: "navy" }] },
      confirmation: { required: true, choices: ["keep", "revert"] },
    });
    expect(adapter.visible.variants[0]!.controls["body.color"]).toBe("navy");
    expect(adapter.committed.variants[0]!.controls["body.color"]).toBe("cream");
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("creates and coordinates a second variant inside the same temporary proposal", async () => {
    const { adapter, tools } = setup();
    const result = await tools[3]!.execute({
      baseRevision: "workspace-revision-1",
      operationId: "two-directions",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "design.quantity", value: 30 },
        { type: "duplicate-variant", sourceVariantId: "variant-1", variantId: "variant-2", name: "Rose direction", initialControls: { "design.quantity": 30, "body.color": "rose", "accent.color": "berry" } },
        { type: "set-active-variant", variantId: "variant-2" },
      ],
      assumptions: ["Studio-name typography is temporary until final artwork is supplied."],
    });
    expect(result).toMatchObject({
      ok: true,
      persisted: false,
      workspace: { activeVariantId: "variant-2", variants: [{ id: "variant-1" }, { id: "variant-2", name: "Rose direction" }] },
      diff: { createdVariants: [{ variantId: "variant-2", name: "Rose direction" }], activeVariantAfter: "variant-2" },
    });
    expect(adapter.visible.variants.map((variant) => variant.controls["design.quantity"])).toEqual([30, 30]);
    expect(adapter.counters.localWrites).toBe(0);
  });

  test("stages opaque temporary artwork, renders it, and captures the exact proposal preview", async () => {
    const { adapter, tools } = setup();
    const staged = await tools[2]!.execute({
      baseRevision: "workspace-revision-1",
      slotId: "mark-artwork",
      source: { kind: "data-url", data: tinyPng },
      filename: "north-form.png",
      altText: "North Form NF mark",
    });
    expect(staged).toMatchObject({ ok: true, persisted: false, asset: { slotId: "mark-artwork", mediaType: "image/png" } });
    if (!isRecord(staged) || !isRecord(staged.asset)) throw new Error("expected staged asset");
    expect(JSON.stringify(staged)).not.toContain(tinyPng);

    const proposal = await tools[3]!.execute({
      baseRevision: "workspace-revision-1",
      operationId: "attach-artwork",
      operations: [{ type: "attach-asset", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.artwork", assetHandle: staged.asset.assetHandle }],
    });
    if (!isRecord(proposal) || proposal.ok !== true) throw new Error("expected proposal");
    const previews = await tools[4]!.execute({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision });
    expect(previews).toMatchObject({
      ok: true,
      persisted: false,
      previewStatus: "available",
      proposalRevision: 1,
      artifacts: [{ variantId: "variant-1", surfaceId: "product-preview", mediaType: "image/webp" }],
      validation: { configurationValid: true, productionReady: true },
    });
    expect(adapter.counters).toMatchObject({ stage: 1, preview: 1, capturePreview: 1, localWrites: 0, serverWrites: 0 });
  });

  test("validates committed or exact proposed state without persistence", async () => {
    const { adapter, tools } = setup();
    expect(await tools[5]!.execute({})).toMatchObject({ ok: true, source: "committed", persisted: false });
    const proposal = await tools[3]!.execute(applyInput("validate-proposal"));
    if (!isRecord(proposal) || proposal.ok !== true) throw new Error("expected proposal");
    expect(await tools[5]!.execute({ proposalId: proposal.proposalId, proposalRevision: proposal.proposalRevision })).toMatchObject({ ok: true, source: "proposal", persisted: false });
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("rejects nested extras, hostile keys, oversized input, and stale targets before writes", async () => {
    const { adapter, tools } = setup();
    const extra = await tools[3]!.execute({
      ...applyInput("nested-extra"),
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1", rawPath: "private.token" }, controlId: "body.color", value: "navy" }],
    });
    const hostile = await tools[3]!.execute({ ...applyInput("hostile"), rawPath: "private.token" });
    const oversized = await tools[3]!.execute({ ...applyInput("oversized"), operations: Array.from({ length: 81 }, () => applyInput().operations[0]) });
    expect(extra).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(hostile).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(oversized).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(adapter.counters.quiesce).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
  });

  test("maps internal errors to generic public codes and never leaks adapter messages", async () => {
    const { adapter, tools } = setup();
    adapter.failRead = true;
    const failedRead = await tools[0]!.execute({});
    expect(failedRead).toMatchObject({ ok: false, error: { code: "ADAPTER_FAILURE" } });
    expect(JSON.stringify(failedRead)).not.toMatch(/PRIVATE_TOKEN|merchant-adapter|stack/i);
    adapter.failRead = false;
    const stale = await tools[3]!.execute({ ...applyInput("stale"), baseRevision: "old-revision" });
    expect(stale).toMatchObject({ ok: false, error: { code: "STALE_COMMITTED_REVISION" } });
  });

  test("honours cancellation without opening a persistent proposal", async () => {
    const { adapter, engine, tools } = setup();
    const controller = new AbortController();
    controller.abort();
    expect(await tools[3]!.execute(applyInput("cancelled"), { signal: controller.signal })).toMatchObject({ ok: false, error: { code: "CANCELLED" } });
    expect(engine.status).toBe("idle");
    expect(adapter.visible).toEqual(adapter.committed);
    expect(adapter.counters.localWrites).toBe(0);
  });

  test("registers all six tools with one lifecycle signal and fails closed", async () => {
    const { engine } = setup();
    const registered: Array<{ tool: WebMcpTool; signal?: AbortSignal }> = [];
    const registration = registerCoDesignTools({ modelContext: { registerTool(tool, options) { registered.push({ tool, ...(options?.signal ? { signal: options.signal } : {}) }); } } }, { engine });
    await registration.ready;
    expect(registration.supported).toBe(true);
    expect(registration.toolNames).toEqual([...CODESIGN_TOOL_NAMES]);
    expect(registered).toHaveLength(6);
    expect(new Set(registered.map((entry) => entry.signal)).size).toBe(1);
    registration.unregister();
    expect(registered.every((entry) => entry.signal?.aborted)).toBe(true);

    const unsupported = registerCoDesignTools({}, { engine: setup().engine });
    expect(unsupported).toMatchObject({ supported: false, reason: "unsupported-host", toolNames: [] });
    const disabled = registerCoDesignTools({ modelContext: { registerTool() {} } }, { engine: setup().engine, enabled: false });
    expect(disabled).toMatchObject({ supported: false, reason: "disabled", toolNames: [] });
  });

  test("aborts every registration when one host registration fails", async () => {
    const { engine } = setup();
    const signals: AbortSignal[] = [];
    let call = 0;
    const registration = registerCoDesignTools({ modelContext: { registerTool(_tool, options) {
      if (options?.signal) signals.push(options.signal);
      call += 1;
      if (call === 3) throw new Error("private host failure");
    } } }, { engine });
    await expect(registration.ready).rejects.toThrow("WebMCP tool registration failed");
    expect(signals).toHaveLength(6);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });
});
