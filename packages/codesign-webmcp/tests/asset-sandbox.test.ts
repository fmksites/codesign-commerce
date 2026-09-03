import { describe, expect, test, vi } from "vitest";
import {
  AssetSandbox,
  AssetSandboxError,
  type AdapterAssetStageRequest,
  type AssetStagingAdapter,
  type ConfiguratorManifest,
} from "../src/index.js";
import { workspaceTestManifest } from "./workspace-fixtures.js";

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

interface PrivateAsset { dataUrl: string; sourceIntegrity: string }

class TestAssetAdapter implements AssetStagingAdapter<PrivateAsset> {
  stages: AdapterAssetStageRequest[] = [];
  releases: PrivateAsset[] = [];
  malformed = false;

  async stageAsset(request: AdapterAssetStageRequest) {
    this.stages.push({ ...request, bytes: request.bytes.slice() });
    const privateAsset = { dataUrl: tinyPng, sourceIntegrity: request.sourceIntegrity };
    if (this.malformed) return { privateAsset, mediaType: "image/svg+xml", byteLength: 0, integrity: "private" } as never;
    return {
      privateAsset,
      mediaType: request.declaredMediaType,
      byteLength: request.bytes.byteLength,
      width: 1,
      height: 1,
      integrity: request.sourceIntegrity,
      privateField: "HIDDEN",
    } as const;
  }

  async releaseAsset(privateAsset: PrivateAsset) { this.releases.push(privateAsset); }
}

const input = (overrides: Record<string, unknown> = {}) => ({
  baseRevision: "workspace-revision-1",
  slotId: "mark-artwork",
  source: { kind: "data-url", data: tinyPng },
  filename: "North Form mark.png",
  altText: "North Form NF mark",
  ...overrides,
});

describe("production-safe temporary asset sandbox", () => {
  test("stages bounded real bytes and returns only an opaque expiring receipt", async () => {
    const adapter = new TestAssetAdapter();
    const sandbox = new AssetSandbox(workspaceTestManifest, adapter, { now: () => Date.UTC(2026, 7, 27), ttlMs: 60_000 });
    const receipt = await sandbox.stage(input());
    expect(receipt).toMatchObject({
      slotId: "mark-artwork",
      mediaType: "image/png",
      width: 1,
      height: 1,
      filename: "North-Form-mark.png",
      altText: "North Form NF mark",
      temporary: true,
      persisted: false,
      expiresAt: "2026-08-27T00:01:00.000Z",
    });
    expect(receipt.assetHandle).toMatch(/^asset-[0-9a-f-]{36}$/);
    expect(receipt.integrity).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(receipt.sourceIntegrity).toBe(receipt.integrity);
    expect(JSON.stringify(receipt)).not.toContain(tinyPng);
    expect(JSON.stringify(receipt)).not.toContain("privateField");
    expect(adapter.stages).toHaveLength(1);
    expect(adapter.stages[0]).toMatchObject({ slotId: "mark-artwork", sourceKind: "data-url", declaredMediaType: "image/png", altText: "North Form NF mark" });
    expect(adapter.stages[0]!.bytes[0]).toBe(0x89);
  });

  test("binds handles to one workspace/proposal revision and advances only deliberately", async () => {
    const adapter = new TestAssetAdapter();
    const sandbox = new AssetSandbox(workspaceTestManifest, adapter);
    const receipt = await sandbox.stage(input());
    expect(sandbox.createResolver({ baseRevision: "workspace-revision-1" }, true).resolve(receipt.assetHandle)?.privateAsset.dataUrl).toBe(tinyPng);
    expect(sandbox.createResolver({ baseRevision: "other" }, true).resolve(receipt.assetHandle)).toBeNull();
    sandbox.bindHandles([receipt.assetHandle], { baseRevision: "workspace-revision-1", proposalId: "proposal-one", proposalRevision: 1 });
    expect(sandbox.createResolver({ baseRevision: "workspace-revision-1", proposalId: "proposal-one", proposalRevision: 1 }).resolve(receipt.assetHandle)).not.toBeNull();
    expect(sandbox.createResolver({ baseRevision: "workspace-revision-1", proposalId: "proposal-two", proposalRevision: 1 }).resolve(receipt.assetHandle)).toBeNull();
    sandbox.advanceProposalRevision("proposal-one", 1, 2);
    expect(sandbox.createResolver({ baseRevision: "workspace-revision-1", proposalId: "proposal-one", proposalRevision: 1 }).resolve(receipt.assetHandle)).toBeNull();
    expect(sandbox.createResolver({ baseRevision: "workspace-revision-1", proposalId: "proposal-one", proposalRevision: 2 }).resolve(receipt.assetHandle)).not.toBeNull();
  });

  test("transitions existing and newly attached handles to the next proposal revision atomically", async () => {
    const sandbox = new AssetSandbox(workspaceTestManifest, new TestAssetAdapter());
    const existing = await sandbox.stage(input({ filename: "existing.png" }));
    const attached = await sandbox.stage(input({ filename: "attached.png" }));
    sandbox.bindHandles([existing.assetHandle], {
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-transition",
      proposalRevision: 1,
    });

    sandbox.transitionProposalRevision(
      "workspace-revision-1",
      "proposal-transition",
      1,
      2,
      [attached.assetHandle],
    );

    const current = sandbox.createResolver({
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-transition",
      proposalRevision: 2,
    });
    expect(current.resolve(existing.assetHandle)).not.toBeNull();
    expect(current.resolve(attached.assetHandle)).not.toBeNull();
    expect(sandbox.createResolver({
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-transition",
      proposalRevision: 1,
    }).resolve(existing.assetHandle)).toBeNull();
  });

  test("does not partially transition when an attached handle belongs elsewhere", async () => {
    const sandbox = new AssetSandbox(workspaceTestManifest, new TestAssetAdapter());
    const existing = await sandbox.stage(input({ filename: "existing.png" }));
    const foreign = await sandbox.stage(input({ filename: "foreign.png" }));
    sandbox.bindHandles([existing.assetHandle], {
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-transition",
      proposalRevision: 1,
    });
    sandbox.bindHandles([foreign.assetHandle], {
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-foreign",
      proposalRevision: 1,
    });

    expect(() => sandbox.transitionProposalRevision(
      "workspace-revision-1",
      "proposal-transition",
      1,
      2,
      [foreign.assetHandle],
    )).toThrowError(expect.objectContaining({ code: "ASSET_BINDING_MISMATCH" }));

    expect(sandbox.createResolver({
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-transition",
      proposalRevision: 1,
    }).resolve(existing.assetHandle)).not.toBeNull();
    expect(sandbox.createResolver({
      baseRevision: "workspace-revision-1",
      proposalId: "proposal-transition",
      proposalRevision: 2,
    }).resolve(existing.assetHandle)).toBeNull();
  });

  test("expires and releases temporary merchant resources", async () => {
    let now = 1_000_000;
    const adapter = new TestAssetAdapter();
    const sandbox = new AssetSandbox(workspaceTestManifest, adapter, { now: () => now, ttlMs: 1_000 });
    const receipt = await sandbox.stage(input());
    now += 1_001;
    expect(sandbox.getReceipt(receipt.assetHandle)).toBeNull();
    expect(() => sandbox.assertHandles([receipt.assetHandle], { baseRevision: "workspace-revision-1" }, true)).toThrowError(expect.objectContaining({ code: "ASSET_EXPIRED" }));
    await expect(sandbox.sweepExpired()).resolves.toBe(1);
    expect(adapter.releases).toHaveLength(1);
    expect(sandbox.size).toBe(0);
  });

  test("releases every asset bound to Revert without importing or persisting", async () => {
    const adapter = new TestAssetAdapter();
    const sandbox = new AssetSandbox(workspaceTestManifest, adapter);
    const first = await sandbox.stage(input());
    const second = await sandbox.stage(input({ filename: "second.png" }));
    sandbox.bindHandles([first.assetHandle, second.assetHandle], { baseRevision: "workspace-revision-1", proposalId: "proposal-revert", proposalRevision: 1 });
    await sandbox.releaseProposal("proposal-revert");
    expect(adapter.releases).toHaveLength(2);
    expect(sandbox.size).toBe(0);
  });

  test.each([
    ["http scheme", "http://example.com/logo.png"],
    ["credentials", "https://user:pass@example.com/logo.png"],
    ["localhost", "https://localhost/logo.png"],
    ["loopback", "https://127.0.0.1/logo.png"],
    ["private IPv4", "https://192.168.1.10/logo.png"],
    ["link local", "https://169.254.169.254/latest/meta-data"],
    ["private IPv6", "https://[::1]/logo.png"],
  ])("rejects %s remote sources before fetch", async (_label, url) => {
    const manifest = structuredClone(workspaceTestManifest);
    manifest.assetSlots[0]!.sourceKinds = ["data-url", "https-url"];
    const fetchSpy = vi.fn();
    const sandbox = new AssetSandbox(manifest, new TestAssetAdapter(), { fetch: fetchSpy as typeof fetch });
    await expect(sandbox.stage(input({ source: { kind: "https-url", url } }))).rejects.toMatchObject({ code: "ASSET_SOURCE_REJECTED" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("fetches a public HTTPS image without credentials or redirects", async () => {
    const manifest = structuredClone(workspaceTestManifest);
    manifest.assetSlots[0]!.sourceKinds = ["https-url"];
    const pngBytes = Uint8Array.from(atob(tinyPng.split(",")[1]!), (character) => character.charCodeAt(0));
    const fetchSpy = vi.fn().mockResolvedValue(new Response(pngBytes, { status: 200, headers: { "content-type": "image/png", "content-length": String(pngBytes.byteLength) } }));
    const validateRemoteUrl = vi.fn();
    const sandbox = new AssetSandbox(manifest, new TestAssetAdapter(), { fetch: fetchSpy as typeof fetch, validateRemoteUrl });
    await expect(sandbox.stage(input({ source: { kind: "https-url", url: "https://assets.example.com/north-form.png" } }))).resolves.toMatchObject({ mediaType: "image/png", persisted: false });
    expect(fetchSpy).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ credentials: "omit", redirect: "manual", referrerPolicy: "no-referrer", cache: "no-store" }));
    expect(validateRemoteUrl).toHaveBeenCalledWith(expect.objectContaining({ hostname: "assets.example.com" }));
  });

  test("fails closed before fetch when an HTTPS slot has no host network policy", async () => {
    const manifest = structuredClone(workspaceTestManifest);
    manifest.assetSlots[0]!.sourceKinds = ["https-url"];
    const fetchSpy = vi.fn();
    const sandbox = new AssetSandbox(manifest, new TestAssetAdapter(), { fetch: fetchSpy as typeof fetch });
    await expect(sandbox.stage(input({ source: { kind: "https-url", url: "https://assets.example.com/north-form.png" } }))).rejects.toMatchObject({ code: "ASSET_SOURCE_REJECTED" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects redirects, oversized responses, mismatched bytes, and adapter metadata", async () => {
    const manifest = structuredClone(workspaceTestManifest);
    manifest.assetSlots[0]!.sourceKinds = ["data-url", "https-url"];
    const allowRemote = () => undefined;
    const redirect = new AssetSandbox(manifest, new TestAssetAdapter(), { fetch: vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: "https://other.example/logo.png" } })) as typeof fetch, validateRemoteUrl: allowRemote });
    await expect(redirect.stage(input({ source: { kind: "https-url", url: "https://assets.example.com/logo.png" } }))).rejects.toMatchObject({ code: "ASSET_SOURCE_REJECTED" });

    const oversized = new AssetSandbox(manifest, new TestAssetAdapter(), { fetch: vi.fn().mockResolvedValue(new Response(null, { status: 200, headers: { "content-type": "image/png", "content-length": "70001" } })) as typeof fetch, validateRemoteUrl: allowRemote });
    await expect(oversized.stage(input({ source: { kind: "https-url", url: "https://assets.example.com/logo.png" } }))).rejects.toMatchObject({ code: "ASSET_TOO_LARGE" });

    await expect(new AssetSandbox(manifest, new TestAssetAdapter()).stage(input({ source: { kind: "data-url", data: "data:image/png;base64,aGVsbG8=" } }))).rejects.toMatchObject({ code: "ASSET_DECODE_FAILED" });

    const malformedAdapter = new TestAssetAdapter();
    malformedAdapter.malformed = true;
    await expect(new AssetSandbox(manifest, malformedAdapter).stage(input())).rejects.toMatchObject({ code: "ASSET_STAGE_FAILED" });
    expect(malformedAdapter.releases).toHaveLength(1);
  });

  test("rejects obvious active SVG content before invoking the merchant sanitizer", async () => {
    const manifest = structuredClone(workspaceTestManifest) as ConfiguratorManifest;
    manifest.assetSlots[0]!.mediaTypes = ["image/svg+xml"];
    const unsafe = btoa(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`);
    const adapter = new TestAssetAdapter();
    const sandbox = new AssetSandbox(manifest, adapter);
    await expect(sandbox.stage(input({ source: { kind: "data-url", data: `data:image/svg+xml;base64,${unsafe}` } }))).rejects.toMatchObject({ code: "ASSET_DECODE_FAILED" });
    expect(adapter.stages).toHaveLength(0);
  });

  test("rejects unknown fields and never echoes them through an error", async () => {
    const sandbox = new AssetSandbox(workspaceTestManifest, new TestAssetAdapter());
    const fixturePath = "/private/customer/logo.png";
    let caught: unknown;
    try { await sandbox.stage({ ...input(), privatePath: fixturePath }); } catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(AssetSandboxError);
    expect(JSON.stringify(caught)).not.toContain(fixturePath);
  });
});
