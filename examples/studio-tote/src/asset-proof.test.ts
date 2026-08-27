import { describe, expect, it, vi } from "vitest";
import {
  createStudioToteAssetProofTool,
  registerStudioToteAssetProof,
  StudioToteAssetProofStore,
} from "./asset-proof";
import { toteInitialState } from "./configurator";

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

describe("studio tote temporary asset feasibility proof", () => {
  it("stages real raster bytes and returns only an opaque receipt", async () => {
    const store = new StudioToteAssetProofStore();
    const tool = createStudioToteAssetProofTool(store);
    const result = await tool.execute({
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      filename: "North Form mark.png",
      altText: "North Form NF mark",
    }) as Record<string, any>;

    expect(result).toMatchObject({
      ok: true,
      persisted: false,
      asset: {
        slotId: "print-artwork",
        mediaType: "image/png",
        filename: "North-Form-mark.png",
        altText: "North Form NF mark",
        temporary: true,
      },
    });
    expect(result.asset.assetHandle).toMatch(/^asset-[0-9a-f-]{36}$/);
    expect(result.asset.integrity).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(JSON.stringify(result)).not.toContain(tinyPng);
    expect(store.resolve(result.asset.assetHandle)?.dataUrl).toBe(tinyPng);
    expect(store.counters).toEqual({ stageCalls: 1, importCalls: 0, releasedAssets: 0 });
  });

  it("imports the exact staged asset only at Keep and replaces the temporary handle", async () => {
    const store = new StudioToteAssetProofStore();
    const staged = await store.stage({
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      altText: "North Form NF mark",
    });
    const proposal = structuredClone(toteInitialState);
    proposal.designs[0]!.selections["branding.artwork_ref"] = staged.assetHandle;

    const committed = store.commitState(proposal);
    const savedReference = committed.designs[0]!.selections["branding.artwork_ref"];
    expect(savedReference).toMatch(/^saved-[0-9a-f]{24}$/);
    expect(savedReference).not.toBe(staged.assetHandle);
    expect(committed.designs[0]!.assets[0]).toMatchObject({ slot: "print-artwork", status: "ready" });
    expect(store.resolve(staged.assetHandle)).toBeNull();
    expect(store.resolve(savedReference)?.dataUrl).toBe(tinyPng);
    expect(store.counters.importCalls).toBe(1);

    const duplicate = store.commitState(committed);
    expect(duplicate).toEqual(committed);
    expect(store.counters.importCalls).toBe(1);
  });

  it("restores approved artwork with the saved design after a page reopen", async () => {
    const store = new StudioToteAssetProofStore();
    const staged = await store.stage({
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      altText: "North Form NF mark",
    });
    const proposal = structuredClone(toteInitialState);
    proposal.designs[0]!.selections["branding.artwork_ref"] = staged.assetHandle;
    const committed = store.commitState(proposal);
    const savedReference = committed.designs[0]!.selections["branding.artwork_ref"];

    const reopened = new StudioToteAssetProofStore(store.exportCommitted());
    expect(reopened.resolve(savedReference)).toMatchObject({
      assetHandle: savedReference,
      dataUrl: tinyPng,
      temporary: false,
    });
    expect(new StudioToteAssetProofStore([{ assetHandle: "saved-invalid" }]).exportCommitted()).toEqual([]);
  });

  it("releases temporary bytes on Revert without importing them", async () => {
    const store = new StudioToteAssetProofStore();
    const staged = await store.stage({
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      altText: "Temporary mark",
    });
    store.releaseTemporary();
    expect(store.resolve(staged.assetHandle)).toBeNull();
    expect(store.counters).toEqual({ stageCalls: 1, importCalls: 0, releasedAssets: 1 });
  });

  it("rejects unsupported, malformed and additional input before staging", async () => {
    const store = new StudioToteAssetProofStore();
    const tool = createStudioToteAssetProofTool(store);
    await expect(tool.execute({
      slotId: "print-artwork",
      source: { kind: "data-url", data: "data:image/svg+xml;base64,PHN2Zy8+" },
      altText: "Unsafe vector",
    } as never)).resolves.toMatchObject({ ok: false, persisted: false });
    await expect(tool.execute({
      slotId: "print-artwork",
      source: { kind: "data-url", data: tinyPng },
      altText: "North Form",
      rawPath: "/private/logo.png",
    } as never)).resolves.toMatchObject({ ok: false, error: { code: "INVALID_INPUT" } });
    expect(store.counters.stageCalls).toBe(0);
  });

  it("progressively registers only when WebMCP exists", async () => {
    const store = new StudioToteAssetProofStore();
    expect(registerStudioToteAssetProof({}, store)).toMatchObject({ supported: false, toolNames: [] });
    const registerTool = vi.fn();
    const registration = registerStudioToteAssetProof({ modelContext: { registerTool } }, store);
    await registration.ready;
    expect(registration).toMatchObject({ supported: true, toolNames: ["codesign_stage_asset"] });
    expect(registerTool).toHaveBeenCalledWith(
      expect.objectContaining({ name: "codesign_stage_asset", inputSchema: expect.objectContaining({ additionalProperties: false }) }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
