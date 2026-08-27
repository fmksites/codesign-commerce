import {
  AssetSandbox,
  AssetSandboxError,
  type AdapterAssetStageRequest,
  type AssetResolver,
  type AssetStagingAdapter,
  ConfigurationState,
  DocumentWithModelContext,
  WebMcpRegistration,
  WebMcpTool,
} from "@codesign-commerce/core";
import { toteManifest } from "./configurator";

export type StudioToteProofMediaType = "image/png" | "image/jpeg" | "image/webp";

export interface StudioToteAssetStageInput {
  slotId: "print-artwork";
  source: { kind: "data-url"; data: string };
  filename?: string;
  altText: string;
}

export interface StudioToteAssetReceipt {
  assetHandle: string;
  slotId: "print-artwork";
  mediaType: StudioToteProofMediaType;
  byteLength: number;
  filename?: string;
  altText: string;
  integrity: string;
  temporary: boolean;
  sourceIntegrity?: string;
  expiresAt?: string;
  persisted?: false;
}

export interface StudioToteResolvedAsset extends StudioToteAssetReceipt {
  dataUrl: string;
}

export interface StudioToteAssetCounters {
  stageCalls: number;
  importCalls: number;
  releasedAssets: number;
}

const MAX_SOURCE_CHARACTERS = 400_000;
const MAX_DECODED_BYTES = 250_000;
const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    slotId: { type: "string", enum: ["print-artwork"] },
    source: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["data-url"] },
        data: { type: "string", minLength: 32, maxLength: MAX_SOURCE_CHARACTERS },
      },
      required: ["kind", "data"],
      additionalProperties: false,
    },
    filename: { type: "string", minLength: 1, maxLength: 120 },
    altText: { type: "string", minLength: 1, maxLength: 200 },
  },
  required: ["slotId", "source", "altText"],
  additionalProperties: false,
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isStageInput(value: unknown): value is StudioToteAssetStageInput {
  if (!isRecord(value) || !Object.keys(value).every((key) => ["slotId", "source", "filename", "altText"].includes(key))) return false;
  if (value.slotId !== "print-artwork" || !isRecord(value.source)) return false;
  if (!Object.keys(value.source).every((key) => ["kind", "data"].includes(key))) return false;
  if (value.source.kind !== "data-url" || typeof value.source.data !== "string" || value.source.data.length < 32 || value.source.data.length > MAX_SOURCE_CHARACTERS) return false;
  if (value.filename !== undefined && (typeof value.filename !== "string" || value.filename.length < 1 || value.filename.length > 120)) return false;
  return typeof value.altText === "string" && value.altText.length >= 1 && value.altText.length <= 200;
}

function hasMagicBytes(mediaType: StudioToteProofMediaType, bytes: Uint8Array): boolean {
  if (mediaType === "image/png") {
    return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  }
  if (mediaType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

function decodeSource(dataUrl: string): { mediaType: StudioToteProofMediaType; bytes: Uint8Array } {
  const match = dataUrl.match(DATA_URL);
  if (!match) throw new AssetProofError("UNSUPPORTED_ASSET", "The supplied artwork was not a supported base64 raster image.");
  let decoded: string;
  try { decoded = atob(match[2]!); } catch { throw new AssetProofError("INVALID_ASSET", "The supplied artwork could not be decoded."); }
  if (decoded.length > MAX_DECODED_BYTES) throw new AssetProofError("ASSET_TOO_LARGE", "The supplied artwork exceeded the temporary proof limit.");
  const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  const mediaType = match[1] as StudioToteProofMediaType;
  if (!hasMagicBytes(mediaType, bytes)) throw new AssetProofError("INVALID_ASSET", "The artwork bytes did not match the declared media type.");
  return { mediaType, bytes };
}

export class StudioToteAssetProofStore implements AssetStagingAdapter<StudioToteResolvedAsset> {
  readonly counters: StudioToteAssetCounters = { stageCalls: 0, importCalls: 0, releasedAssets: 0 };
  #temporary = new Map<string, StudioToteResolvedAsset>();
  #committed = new Map<string, StudioToteResolvedAsset>();
  #sandbox: AssetSandbox<StudioToteResolvedAsset>;
  #baseRevision = () => "tote-revision-1";
  #proposalAssets: AssetResolver<StudioToteResolvedAsset> | null = null;

  constructor(committedAssets: unknown = []) {
    this.#sandbox = new AssetSandbox(toteManifest, this);
    if (!Array.isArray(committedAssets)) committedAssets = [];
    for (const candidate of committedAssets as unknown[]) {
      if (!isRecord(candidate)
        || typeof candidate.assetHandle !== "string"
        || !/^saved-[0-9a-f]{24}$/.test(candidate.assetHandle)
        || candidate.slotId !== "print-artwork"
        || !["image/png", "image/jpeg", "image/webp"].includes(String(candidate.mediaType))
        || typeof candidate.byteLength !== "number"
        || typeof candidate.altText !== "string"
        || typeof candidate.integrity !== "string"
        || !/^sha256:[0-9a-f]{64}$/.test(candidate.integrity)
        || candidate.temporary !== false
        || typeof candidate.dataUrl !== "string") continue;
      if (candidate.filename !== undefined && typeof candidate.filename !== "string") continue;
      try {
        const decoded = decodeSource(candidate.dataUrl);
        if (decoded.mediaType !== candidate.mediaType || decoded.bytes.byteLength !== candidate.byteLength) continue;
      } catch {
        continue;
      }
      const asset = candidate as unknown as StudioToteResolvedAsset;
      this.#committed.set(asset.assetHandle, structuredClone(asset));
    }
  }

  setBaseRevisionProvider(provider: () => string): void {
    this.#baseRevision = provider;
  }

  setProposalAssetResolver(resolver: AssetResolver<StudioToteResolvedAsset> | null): void {
    this.#proposalAssets = resolver;
  }

  async stage(input: StudioToteAssetStageInput): Promise<StudioToteAssetReceipt> {
    const baseRevision = this.#baseRevision();
    const receipt = await this.#sandbox.stage({ ...input, baseRevision });
    const resolved = this.#sandbox.createResolver({ baseRevision }, true).resolve(receipt.assetHandle);
    if (!resolved) throw new AssetProofError("UNKNOWN_ASSET", "The temporary artwork was unavailable after staging.");
    const asset = resolved.privateAsset;
    asset.assetHandle = receipt.assetHandle;
    asset.sourceIntegrity = receipt.sourceIntegrity;
    asset.expiresAt = receipt.expiresAt;
    asset.persisted = false;
    this.#temporary.set(receipt.assetHandle, asset);
    return {
      assetHandle: receipt.assetHandle,
      slotId: "print-artwork",
      mediaType: receipt.mediaType as StudioToteProofMediaType,
      byteLength: receipt.byteLength,
      ...(receipt.filename === undefined ? {} : { filename: receipt.filename }),
      altText: receipt.altText,
      integrity: receipt.integrity,
      temporary: true,
      sourceIntegrity: receipt.sourceIntegrity,
      expiresAt: receipt.expiresAt,
      persisted: false,
    };
  }

  async stageAsset(request: AdapterAssetStageRequest) {
    let binary = "";
    for (let offset = 0; offset < request.bytes.length; offset += 8_192) {
      binary += String.fromCharCode(...request.bytes.subarray(offset, offset + 8_192));
    }
    const dataUrl = `data:${request.declaredMediaType};base64,${btoa(binary)}`;
    const asset: StudioToteResolvedAsset = {
      assetHandle: "pending",
      slotId: "print-artwork",
      mediaType: request.declaredMediaType as StudioToteProofMediaType,
      byteLength: request.bytes.byteLength,
      ...(request.filename === undefined ? {} : { filename: request.filename }),
      altText: request.altText,
      integrity: request.sourceIntegrity,
      temporary: true,
      dataUrl,
    };
    this.counters.stageCalls += 1;
    return {
      privateAsset: asset,
      mediaType: request.declaredMediaType,
      byteLength: request.bytes.byteLength,
      integrity: request.sourceIntegrity,
    };
  }

  async releaseAsset(privateAsset: StudioToteResolvedAsset): Promise<void> {
    if (privateAsset.assetHandle !== "pending") this.#temporary.delete(privateAsset.assetHandle);
    this.counters.releasedAssets += 1;
  }

  resolve(assetReference: unknown): StudioToteResolvedAsset | null {
    if (typeof assetReference !== "string") return null;
    const asset = this.#temporary.get(assetReference) ?? this.#committed.get(assetReference);
    if (asset) return structuredClone(asset);
    const resolved = this.#proposalAssets?.resolve(assetReference);
    if (!resolved) return null;
    return structuredClone({
      ...resolved.privateAsset,
      assetHandle: resolved.receipt.assetHandle,
      slotId: "print-artwork",
      mediaType: resolved.receipt.mediaType as StudioToteProofMediaType,
      byteLength: resolved.receipt.byteLength,
      ...(resolved.receipt.filename === undefined ? {} : { filename: resolved.receipt.filename }),
      altText: resolved.receipt.altText,
      integrity: resolved.receipt.integrity,
      temporary: true,
      sourceIntegrity: resolved.receipt.sourceIntegrity,
      expiresAt: resolved.receipt.expiresAt,
      persisted: false,
    });
  }

  commitState(state: ConfigurationState): ConfigurationState {
    const next = structuredClone(state);
    for (const design of next.designs) {
      const currentReference = design.selections["branding.artwork_ref"];
      if (typeof currentReference !== "string") continue;
      const temporary = this.#temporary.get(currentReference);
      const external = temporary ? null : this.#proposalAssets?.resolve(currentReference) ?? null;
      const externalAsset = external ? this.resolve(currentReference) : null;
      const existing = temporary ?? this.#committed.get(currentReference) ?? externalAsset;
      if (!existing) throw new AssetProofError("UNKNOWN_ASSET", "The temporary artwork was no longer available at Keep.");
      let committedReference = currentReference;
      if (temporary || externalAsset) {
        const imported = temporary ?? externalAsset!;
        committedReference = `saved-${imported.integrity.slice("sha256:".length, "sha256:".length + 24)}`;
        const { sourceIntegrity: _sourceIntegrity, expiresAt: _expiresAt, persisted: _persisted, ...persistable } = imported;
        this.#committed.set(committedReference, { ...persistable, assetHandle: committedReference, temporary: false });
        this.#temporary.delete(currentReference);
        this.counters.importCalls += 1;
        if (temporary) void this.#sandbox.releaseHandle(currentReference);
      }
      design.selections["branding.artwork_ref"] = committedReference;
      design.assets = design.assets.map((asset) => asset.slot === "print-artwork" ? { ...asset, status: "ready" } : asset);
    }
    return next;
  }

  releaseTemporary(): void {
    for (const handle of [...this.#temporary.keys()]) void this.#sandbox.releaseHandle(handle);
  }

  exportCommitted(): StudioToteResolvedAsset[] {
    return Array.from(this.#committed.values(), (asset) => structuredClone(asset));
  }

  #receipt(asset: StudioToteResolvedAsset): StudioToteAssetReceipt {
    const { dataUrl: _dataUrl, ...receipt } = asset;
    return structuredClone(receipt);
  }
}

export class AssetProofError extends Error {
  constructor(
    readonly code: "UNSUPPORTED_ASSET" | "INVALID_ASSET" | "ASSET_TOO_LARGE" | "UNKNOWN_ASSET",
    message: string,
  ) {
    super(message);
    this.name = "AssetProofError";
  }
}

export function createStudioToteAssetProofTool(store: StudioToteAssetProofStore): WebMcpTool<StudioToteAssetStageInput> {
  return {
    name: "codesign_stage_asset",
    title: "Stage temporary tote artwork",
    description: "Stage one bounded raster artwork source for the public tote's print-artwork slot. Returns only an opaque temporary handle and sanitized metadata. It never uploads, saves or exposes the raw artwork in later workspace reads.",
    inputSchema: INPUT_SCHEMA,
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input) {
      if (!isStageInput(input)) {
        return { ok: false, persisted: false, error: { code: "INVALID_INPUT", message: "The asset request did not match the bounded proof schema.", retryable: false } } as never;
      }
      try {
        return { ok: true, persisted: false, asset: await store.stage(input) } as never;
      } catch (error) {
        return {
          ok: false,
          persisted: false,
          error: {
            code: error instanceof AssetProofError ? error.code : error instanceof AssetSandboxError ? error.code : "ASSET_STAGE_FAILED",
            message: "The artwork could not be staged under the declared temporary asset policy.",
            retryable: false,
          },
        } as never;
      }
    },
  };
}

export function registerStudioToteAssetProof(
  document: DocumentWithModelContext,
  store: StudioToteAssetProofStore,
): WebMcpRegistration {
  const controller = new AbortController();
  const tool = createStudioToteAssetProofTool(store);
  if (!document.modelContext?.registerTool) {
    return { supported: false, toolNames: [], unregister: () => controller.abort(), ready: Promise.resolve() };
  }
  const ready = Promise.resolve(document.modelContext.registerTool(tool, { signal: controller.signal })).then(() => undefined);
  return { supported: true, toolNames: [tool.name], unregister: () => controller.abort(), ready };
}
