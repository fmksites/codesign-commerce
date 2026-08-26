import { describe, expect, test } from "vitest";
import {
  createCoDesignTools,
  InMemoryConfiguratorAdapter,
  ProposalSession,
  registerCoDesignTools,
  type WebMcpTool,
} from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function setup() {
  const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState), structuredClone(testManifest));
  const session = new ProposalSession(structuredClone(testManifest), adapter);
  const tools = createCoDesignTools({ manifest: testManifest, adapter, session });
  return { adapter, session, tools };
}

describe("CoDesign WebMCP tools", () => {
  test("exposes exactly the five approved CoDesign tools", () => {
    const { tools } = setup();
    expect(tools.map((tool) => tool.name)).toEqual([
      "codesign_read_configuration",
      "codesign_list_options",
      "codesign_propose_configuration",
      "codesign_create_design",
      "codesign_validate_configuration",
    ]);
    expect(tools[0]!.annotations).toMatchObject({ readOnlyHint: true, untrustedContentHint: true });
    expect(tools[1]!.annotations).toMatchObject({ readOnlyHint: true, untrustedContentHint: true });
    expect(tools[2]!.annotations).toMatchObject({ readOnlyHint: false, untrustedContentHint: true });
    expect(tools[3]!.annotations).toMatchObject({ readOnlyHint: false, untrustedContentHint: true });
    expect(tools[4]!.annotations).toMatchObject({ readOnlyHint: true, untrustedContentHint: true });
    expect(tools.every((tool) => tool.inputSchema.additionalProperties === false)).toBe(true);
    expect(tools.map((tool) => tool.name).join(" ")).not.toMatch(/keep|revert|save|upload|quote|checkout|order|payment/);
  });

  test("reads only canonical configuration and pending proposal metadata", async () => {
    const { tools } = setup();
    const result = await tools[0]!.execute({}, {});
    expect(result).toMatchObject({
      ok: true,
      state: { configuratorId: "codesign.test-configurator", revision: "revision-1" },
      pendingProposal: null,
    });
    expect(JSON.stringify(result)).not.toContain("price");
    expect(JSON.stringify(result)).not.toContain("token");
  });

  test("proposes through the transaction engine with zero persistence", async () => {
    const { adapter, tools } = setup();
    const result = await tools[2]!.execute({
      baseRevision: "revision-1",
      operationId: "webmcp-proposal-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    }, {});
    expect(result).toMatchObject({ ok: true, persisted: false, proposalRevision: 1 });
    expect(adapter.visibleState.designs[0]!.selections["body.color"]).toBe("navy");
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("rejects extra properties even when called without browser schema enforcement", async () => {
    const { adapter, tools } = setup();
    const result = await tools[2]!.execute({
      baseRevision: "revision-1",
      operationId: "unsafe-input-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy", rawPath: "state.secret" }],
    }, {});
    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(adapter.counters.quiesceCalls).toBe(0);
    expect(adapter.counters.previewCalls).toBe(0);
  });

  test("lists bounded public options and dependency descriptions", async () => {
    const { tools } = setup();
    const result = await tools[1]!.execute({
      designId: "design-1",
      optionIds: ["body.color", "design.quantity", "branding.artwork_status"],
    }, {});
    expect(result).toMatchObject({
      ok: true,
      revision: "revision-1",
      designId: "design-1",
      options: [
        { optionId: "body.color", agentWritable: true, allowed: true },
        { optionId: "design.quantity", minimum: 20, maximum: 10000 },
        { optionId: "branding.artwork_status", agentWritable: false },
      ],
      dependencies: [],
    });
    expect(JSON.stringify(result)).not.toMatch(/price|token|supplier|margin/i);
  });

  test("creates a second colourway inside the same zero-write proposal and validates it", async () => {
    const { adapter, tools } = setup();
    const first = await tools[2]!.execute({
      baseRevision: "revision-1",
      operationId: "north-form-first-colourway",
      changes: [
        { designId: "design-1", optionId: "design.name", value: "North Form Cream" },
        { designId: "design-1", optionId: "body.color", value: "navy" },
      ],
      assumptions: ["Final logo artwork will be supplied later."],
    }, {});
    expect(first).toMatchObject({ ok: true, proposalRevision: 1 });
    if (!isRecord(first) || first.ok !== true) throw new Error("Expected first proposal");

    const created = await tools[3]!.execute({
      baseRevision: "revision-1",
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "north-form-second-colourway",
      sourceDesignId: "design-1",
      changes: [{ designId: "design-1", optionId: "design.quantity", value: 30 }],
      newDesignChanges: [
        { optionId: "design.name", value: "North Form Rose" },
        { optionId: "design.quantity", value: 30 },
        { optionId: "body.color", value: "rose" },
        { optionId: "accent.color", value: "berry" },
      ],
    }, {});

    expect(created).toMatchObject({
      ok: true,
      persisted: false,
      proposalRevision: 2,
      createdDesigns: [{ designId: "design-2", sourceDesignId: "design-1", name: "North Form Rose" }],
      confirmation: { required: true, choices: ["keep", "revert"] },
    });
    expect(adapter.visibleState.designs).toHaveLength(2);
    expect(adapter.visibleState.designs.map((design) => design.quantity)).toEqual([30, 30]);
    expect(adapter.counters.createDesignDraftCalls).toBe(1);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);

    if (!isRecord(created) || created.ok !== true) throw new Error("Expected created proposal");
    const validated = await tools[4]!.execute({
      proposalId: created.proposalId,
      proposalRevision: created.proposalRevision,
    }, {});
    expect(validated).toMatchObject({
      ok: true,
      persisted: false,
      source: "proposal",
      validation: {
        configurationValid: true,
        productionReady: false,
        assumptions: ["Final logo artwork will be supplied later."],
      },
    });
  });

  test("rejects private design-creation fields before touching the adapter", async () => {
    const { adapter, tools } = setup();
    const result = await tools[3]!.execute({
      baseRevision: "revision-1",
      operationId: "unsafe-create-1",
      sourceDesignId: "design-1",
      newDesignChanges: [{ optionId: "body.color", value: "rose", rawArtworkUrl: "https://invalid.test/private" }],
    }, {});
    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(adapter.counters.createDesignDraftCalls).toBe(0);
    expect(adapter.counters.previewCalls).toBe(0);
  });

  test("cancellation after preview begins restores the committed snapshot", async () => {
    const { adapter, session } = setup();
    const controller = new AbortController();
    const originalPreview = adapter.previewState.bind(adapter);
    adapter.previewState = async (state) => {
      await originalPreview(state);
      controller.abort();
    };

    const result = await session.propose({
      baseRevision: "revision-1",
      operationId: "cancel-preview-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    }, { signal: controller.signal });

    expect(result).toMatchObject({ ok: false, error: { code: "CANCELLED" } });
    expect(adapter.visibleState).toEqual(adapter.committedState);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
    expect(session.status).toBe("idle");
  });

  test("feature-detects registration and unregisters with one lifecycle signal", async () => {
    const { adapter, session } = setup();
    const registered: Array<{ tool: WebMcpTool; signal?: AbortSignal }> = [];
    const registration = registerCoDesignTools({
      modelContext: {
        registerTool(tool, options) {
          registered.push({ tool, ...(options?.signal ? { signal: options.signal } : {}) });
        },
      },
    }, { manifest: testManifest, adapter, session });

    await registration.ready;
    expect(registration.supported).toBe(true);
    expect(registered).toHaveLength(5);
    expect(registered.every((entry) => entry.signal?.aborted === false)).toBe(true);
    registration.unregister();
    expect(registered.every((entry) => entry.signal?.aborted === true)).toBe(true);

    const unsupported = registerCoDesignTools({}, { manifest: testManifest, adapter, session });
    expect(unsupported).toMatchObject({ supported: false, toolNames: [] });
  });
});
