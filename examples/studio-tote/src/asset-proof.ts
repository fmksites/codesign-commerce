import type {
  ConfigurationState,
  DocumentWithModelContext,
  WebMcpRegistration,
  WebMcpTool,
} from "@codesign-commerce/core";

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

async function sha256(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function sanitizedFilename(filename: string | undefined): string | undefined {
  if (filename === undefined) return undefined;
  const normalized = filename.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 120) || undefined;
}

export class StudioToteAssetProofStore {
  readonly counters: StudioToteAssetCounters = { stageCalls: 0, importCalls: 0, releasedAssets: 0 };
  #temporary = new Map<string, StudioToteResolvedAsset>();
  #committed = new Map<string, StudioToteResolvedAsset>();

  constructor(committedAssets: unknown = []) {
    if (!Array.isArray(committedAssets)) return;
    for (const candidate of committedAssets) {
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

  async stage(input: StudioToteAssetStageInput): Promise<StudioToteAssetReceipt> {
    const { mediaType, bytes } = decodeSource(input.source.data);
    const integrity = await sha256(bytes);
    const assetHandle = `asset-${crypto.randomUUID()}`;
    const filename = sanitizedFilename(input.filename);
    const asset: StudioToteResolvedAsset = {
      assetHandle,
      slotId: "print-artwork",
      mediaType,
      byteLength: bytes.byteLength,
      ...(filename === undefined ? {} : { filename }),
      altText: input.altText.trim(),
      integrity,
      temporary: true,
      dataUrl: input.source.data,
    };
    this.#temporary.set(assetHandle, asset);
    this.counters.stageCalls += 1;
    return this.#receipt(asset);
  }

  resolve(assetReference: unknown): StudioToteResolvedAsset | null {
    if (typeof assetReference !== "string") return null;
    const asset = this.#temporary.get(assetReference) ?? this.#committed.get(assetReference);
    return asset ? structuredClone(asset) : null;
  }

  commitState(state: ConfigurationState): ConfigurationState {
    const next = structuredClone(state);
    for (const design of next.designs) {
      const currentReference = design.selections["branding.artwork_ref"];
      if (typeof currentReference !== "string") continue;
      const temporary = this.#temporary.get(currentReference);
      const existing = temporary ?? this.#committed.get(currentReference);
      if (!existing) throw new AssetProofError("UNKNOWN_ASSET", "The temporary artwork was no longer available at Keep.");
      let committedReference = currentReference;
      if (temporary) {
        committedReference = `saved-${temporary.integrity.slice("sha256:".length, "sha256:".length + 24)}`;
        this.#committed.set(committedReference, { ...temporary, assetHandle: committedReference, temporary: false });
        this.#temporary.delete(currentReference);
        this.counters.importCalls += 1;
      }
      design.selections["branding.artwork_ref"] = committedReference;
      design.assets = design.assets.map((asset) => asset.slot === "print-artwork" ? { ...asset, status: "ready" } : asset);
    }
    return next;
  }

  releaseTemporary(): void {
    this.counters.releasedAssets += this.#temporary.size;
    this.#temporary.clear();
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
            code: error instanceof AssetProofError ? error.code : "ASSET_STAGE_FAILED",
            message: error instanceof Error ? error.message : "The artwork could not be staged.",
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
