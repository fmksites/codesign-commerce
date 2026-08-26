import { describe, expect, test } from "vitest";
import {
  createCoDesignTools,
  InMemoryConfiguratorAdapter,
  ProposalSession,
  registerCoDesignTools,
  type WebMcpTool,
} from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

function setup() {
  const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
  const session = new ProposalSession(structuredClone(testManifest), adapter);
  const tools = createCoDesignTools({ manifest: testManifest, adapter, session });
  return { adapter, session, tools };
}

describe("CoDesign WebMCP tools", () => {
  test("exposes only the first two approved vertical-slice tools", () => {
    const { tools } = setup();
    expect(tools.map((tool) => tool.name)).toEqual([
      "codesign_read_configuration",
      "codesign_propose_configuration",
    ]);
    expect(tools[0]!.annotations).toMatchObject({ readOnlyHint: true, untrustedContentHint: true });
    expect(tools[1]!.annotations).toMatchObject({ readOnlyHint: false, untrustedContentHint: true });
    expect(tools[1]!.inputSchema).toMatchObject({ additionalProperties: false });
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
    const result = await tools[1]!.execute({
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
    const result = await tools[1]!.execute({
      baseRevision: "revision-1",
      operationId: "unsafe-input-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy", rawPath: "state.secret" }],
    }, {});
    expect(result).toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(adapter.counters.quiesceCalls).toBe(0);
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
    expect(registered).toHaveLength(2);
    expect(registered.every((entry) => entry.signal?.aborted === false)).toBe(true);
    registration.unregister();
    expect(registered.every((entry) => entry.signal?.aborted === true)).toBe(true);

    const unsupported = registerCoDesignTools({}, { manifest: testManifest, adapter, session });
    expect(unsupported).toMatchObject({ supported: false, toolNames: [] });
  });
});
