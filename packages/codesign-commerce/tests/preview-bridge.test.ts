import { describe, expect, test, vi } from "vitest";
import {
  PreviewBridge,
  type AssetResolver,
  type PreviewArtifactCandidate,
  type PreviewCaptureAdapter,
  type PreviewCaptureRequest,
} from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

const webpBytes = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const webpDataUrl = `data:image/webp;base64,${btoa(String.fromCharCode(...webpBytes))}`;
const noAssets: AssetResolver<never> = { resolve: () => null };

function candidate(overrides: Partial<PreviewArtifactCandidate> = {}): PreviewArtifactCandidate {
  return {
    variantId: "variant-1",
    surfaceId: "product-preview",
    mediaType: "image/webp",
    width: 640,
    height: 640,
    altText: "Cream direction with navy artwork mark",
    transport: { kind: "data-url", value: webpDataUrl },
    ...overrides,
  };
}

const request = (overrides: Record<string, unknown> = {}) => ({
  proposalId: "proposal-preview",
  proposalRevision: 1,
  baseRevision: "workspace-revision-1",
  variantIds: ["variant-1"],
  surfaceIds: ["product-preview"],
  ...overrides,
});

class TestPreviewAdapter implements PreviewCaptureAdapter<never> {
  calls: PreviewCaptureRequest[] = [];
  results: PreviewArtifactCandidate[] = [candidate()];
  failure = false;
  async capturePreviews(input: PreviewCaptureRequest): Promise<PreviewArtifactCandidate[]> {
    this.calls.push(structuredClone(input));
    if (this.failure) throw new Error("private renderer failure");
    return structuredClone(this.results);
  }
}

describe("revision-bound preview bridge", () => {
  test("captures one renderer artifact for the exact proposal revision", async () => {
    const adapter = new TestPreviewAdapter();
    const bridge = new PreviewBridge(workspaceTestManifest, adapter);
    const artifacts = await bridge.capture(request(), workspaceTestState, noAssets);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]).toMatchObject({
      proposalId: "proposal-preview",
      proposalRevision: 1,
      baseRevision: "workspace-revision-1",
      variantId: "variant-1",
      surfaceId: "product-preview",
      mediaType: "image/webp",
      width: 640,
      height: 640,
      transport: { kind: "data-url", value: webpDataUrl },
    });
    expect(artifacts[0]!.artifactId).toMatch(/^preview-[0-9a-f-]{36}$/);
    expect(artifacts[0]!.integrity).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(adapter.calls[0]).toEqual(request());
    expect(bridge.getCurrent(request(), workspaceTestState)).toEqual(artifacts);
  });

  test("requires and receipts one artifact for every requested variant and surface", async () => {
    const state = structuredClone(workspaceTestState);
    state.variants.push({
      ...structuredClone(state.variants[0]!),
      id: "variant-2",
      name: "Charcoal direction",
      elements: [{ ...structuredClone(state.variants[0]!.elements[0]!), id: "mark-2" }],
    });
    const adapter = new TestPreviewAdapter();
    adapter.results = [candidate(), candidate({ variantId: "variant-2", altText: "Charcoal direction with supplied artwork mark" })];
    const captureRequest = request({ variantIds: ["variant-1", "variant-2"] });
    const bridge = new PreviewBridge(workspaceTestManifest, adapter);
    const artifacts = await bridge.capture(captureRequest, state, noAssets);
    expect(artifacts.map(({ variantId, surfaceId }) => ({ variantId, surfaceId }))).toEqual([
      { variantId: "variant-1", surfaceId: "product-preview" },
      { variantId: "variant-2", surfaceId: "product-preview" },
    ]);
    expect(bridge.getCurrent(captureRequest, state)).toHaveLength(2);
  });

  test("reconstructs artifacts and strips untrusted adapter extras", async () => {
    const adapter = new TestPreviewAdapter();
    adapter.results = [{ ...candidate(), privateUrl: "https://private.invalid/artwork", rawState: { margin: 0.8 } } as never];
    const artifacts = await new PreviewBridge(workspaceTestManifest, adapter).capture(request(), workspaceTestState, noAssets);
    expect(JSON.stringify(artifacts)).not.toContain("privateUrl");
    expect(JSON.stringify(artifacts)).not.toContain("margin");
  });

  test("rejects stale, unknown, additional, and duplicate request filters before capture", async () => {
    const adapter = new TestPreviewAdapter();
    const bridge = new PreviewBridge(workspaceTestManifest, adapter);
    await expect(bridge.capture(request({ baseRevision: "old" }), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_STALE" });
    await expect(bridge.capture(request({ variantIds: ["missing"] }), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "UNKNOWN_TARGET" });
    await expect(bridge.capture(request({ surfaceIds: ["missing"] }), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "CAPABILITY_UNAVAILABLE" });
    await expect(bridge.capture(request({ privateField: true }), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(bridge.capture(request({ variantIds: ["variant-1", "variant-1"] }), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(adapter.calls).toHaveLength(0);
  });

  test("fails closed on omitted, duplicate, wrong-media, malformed, and oversized artifacts", async () => {
    const adapter = new TestPreviewAdapter();
    const bridge = new PreviewBridge(workspaceTestManifest, adapter);
    adapter.results = [];
    await expect(bridge.capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED", retryable: true });
    adapter.results = [candidate(), candidate()];
    await expect(bridge.capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });
    adapter.results = [candidate({ mediaType: "image/png" })];
    await expect(bridge.capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });
    adapter.results = [candidate({ transport: { kind: "data-url", value: "data:image/webp;base64,aGVsbG8=" } })];
    await expect(bridge.capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });

    const smallManifest = structuredClone(workspaceTestManifest);
    smallManifest.previewSurfaces[0]!.maximumBytes = 8;
    await expect(new PreviewBridge(smallManifest, new TestPreviewAdapter()).capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });
  });

  test("rejects mismatched integrity and sanitizes renderer failures", async () => {
    const adapter = new TestPreviewAdapter();
    adapter.results = [candidate({ integrity: `sha256:${"0".repeat(64)}` })];
    await expect(new PreviewBridge(workspaceTestManifest, adapter).capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });
    adapter.failure = true;
    let caught: unknown;
    try { await new PreviewBridge(workspaceTestManifest, adapter).capture(request(), workspaceTestState, noAssets); } catch (error) { caught = error; }
    expect(caught).toMatchObject({ code: "PREVIEW_FAILED", retryable: true });
    expect(JSON.stringify(caught)).not.toContain("private renderer failure");
  });

  test("discards a prior receipt before a failed replacement capture", async () => {
    const adapter = new TestPreviewAdapter();
    const bridge = new PreviewBridge(workspaceTestManifest, adapter);
    await bridge.capture(request(), workspaceTestState, noAssets);
    expect(bridge.getCurrent(request(), workspaceTestState)).toHaveLength(1);

    adapter.failure = true;
    await expect(bridge.capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });
    expect(() => bridge.getCurrent(request(), workspaceTestState)).toThrowError(expect.objectContaining({ code: "PREVIEW_STALE" }));
  });

  test("supports bounded same-origin URL artifacts with opaque references", async () => {
    const now = Date.UTC(2026, 7, 27);
    const adapter = new TestPreviewAdapter();
    adapter.results = [candidate({
      integrity: `sha256:${"a".repeat(64)}`,
      transport: { kind: "same-origin-url", value: "/previews/pv_abc123.webp?id=pv_abc123", expiresAt: new Date(now + 60_000).toISOString() },
    })];
    const bridge = new PreviewBridge(workspaceTestManifest, adapter, { origin: "https://demo.example", now: () => now });
    await expect(bridge.capture(request(), workspaceTestState, noAssets)).resolves.toMatchObject([{
      integrity: `sha256:${"a".repeat(64)}`,
      transport: { kind: "same-origin-url", value: "https://demo.example/previews/pv_abc123.webp?id=pv_abc123", expiresAt: "2026-08-27T00:01:00.000Z" },
    }]);
  });

  test.each([
    ["cross-origin", "https://other.example/preview.webp?id=pv_1"],
    ["private query", "/preview.webp?customer=123"],
    ["embedded state", "/preview.webp?ref=%7Bstate%7D"],
  ])("rejects %s URL transports", async (_label, value) => {
    const adapter = new TestPreviewAdapter();
    adapter.results = [candidate({ integrity: `sha256:${"a".repeat(64)}`, transport: { kind: "same-origin-url", value } })];
    await expect(new PreviewBridge(workspaceTestManifest, adapter, { origin: "https://demo.example" }).capture(request(), workspaceTestState, noAssets)).rejects.toMatchObject({ code: "PREVIEW_FAILED" });
  });

  test("expires URL artifacts and never returns an old proposal revision as current", async () => {
    let now = Date.UTC(2026, 7, 27);
    const adapter = new TestPreviewAdapter();
    adapter.results = [candidate({
      integrity: `sha256:${"b".repeat(64)}`,
      transport: { kind: "same-origin-url", value: "/preview.webp?id=pv_2", expiresAt: new Date(now + 1_000).toISOString() },
    })];
    const bridge = new PreviewBridge(workspaceTestManifest, adapter, { origin: "https://demo.example", now: () => now });
    await bridge.capture(request(), workspaceTestState, noAssets);
    expect(() => bridge.getCurrent(request({ proposalRevision: 2 }), workspaceTestState)).toThrowError(expect.objectContaining({ code: "PREVIEW_STALE" }));
    now += 1_001;
    expect(() => bridge.getCurrent(request(), workspaceTestState)).toThrowError(expect.objectContaining({ code: "PREVIEW_STALE" }));
    bridge.releaseProposal("proposal-preview");
    expect(() => bridge.getCurrent(request(), workspaceTestState)).toThrowError(expect.objectContaining({ code: "PREVIEW_STALE" }));
  });

  test("passes the opaque asset resolver to the merchant capture adapter", async () => {
    const resolver: AssetResolver<{ marker: string }> = { resolve: vi.fn().mockReturnValue(null) };
    const capturePreviews = vi.fn().mockResolvedValue([candidate()]);
    const bridge = new PreviewBridge(workspaceTestManifest, { capturePreviews });
    await bridge.capture(request(), workspaceTestState, resolver);
    expect(capturePreviews).toHaveBeenCalledWith(request(), resolver);
  });
});
