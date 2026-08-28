import { isSafeIdentifier, validateManifest } from "./manifest.js";
import type {
  AdapterAssetStageRequest,
  AdapterStagedAsset,
  AssetBindingContext,
  AssetMediaType,
  AssetResolver,
  AssetSandboxErrorCode,
  AssetSlotDefinition,
  AssetSourceKind,
  AssetStagingAdapter,
  ConfiguratorManifest,
  ResolvedTemporaryAsset,
  StageAssetInput,
  StagedAssetReceipt,
} from "./types.js";

const DATA_URL = /^data:(image\/(?:png|jpeg|webp)|image\/svg\+xml);base64,([A-Za-z0-9+/]+={0,2})$/;
const INTEGRITY = /^sha256:[0-9a-f]{64}$/;
const MAX_ASSETS_PER_SESSION = 20;
const MAX_TOTAL_TEMPORARY_BYTES = 5_000_000;
const DEFAULT_TTL_MS = 30 * 60 * 1_000;
const MAX_TTL_MS = 24 * 60 * 60 * 1_000;

interface AssetEntry<PrivateAsset> {
  receipt: StagedAssetReceipt;
  privateAsset: PrivateAsset;
  baseRevision: string;
  proposalId: string | null;
  proposalRevision: number | null;
  expiresAtMs: number;
}

interface LoadedAssetSource {
  sourceKind: AssetSourceKind;
  mediaType: AssetMediaType;
  bytes: Uint8Array;
}

export interface AssetSandboxOptions {
  fetch?: typeof fetch;
  now?: () => number;
  ttlMs?: number;
  validateRemoteUrl?: (url: URL) => void | Promise<void>;
}

export class AssetSandboxError extends Error {
  constructor(readonly code: AssetSandboxErrorCode, message: string) {
    super(message);
    this.name = "AssetSandboxError";
  }
}

function fail(code: AssetSandboxErrorCode, message: string): never {
  throw new AssetSandboxError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  const keys = new Set(allowed);
  return Object.keys(value).every((key) => keys.has(key));
}

function boundedText(value: unknown, maximum: number, allowEmpty = false): string {
  if (typeof value !== "string" || value.length > maximum || (!allowEmpty && value.trim().length === 0) || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    return fail("INVALID_INPUT", "The asset request contains invalid bounded text");
  }
  return value.trim();
}

function safeId(value: unknown): string {
  if (typeof value !== "string" || !isSafeIdentifier(value)) return fail("INVALID_INPUT", "The asset request contains an invalid identifier");
  return value;
}

function sanitizeFilename(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  const supplied = boundedText(value, 120);
  const normalized = supplied.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 120) || undefined;
}

export function validateStageAssetInput(value: unknown): StageAssetInput {
  if (!isRecord(value) || !hasOnlyKeys(value, ["baseRevision", "proposalId", "proposalRevision", "slotId", "source", "filename", "altText"])) {
    return fail("INVALID_INPUT", "The asset request did not match the public schema");
  }
  if ((value.proposalId === undefined) !== (value.proposalRevision === undefined)) {
    return fail("INVALID_INPUT", "Proposal identity and revision must be supplied together");
  }
  const proposalId = value.proposalId === undefined ? undefined : safeId(value.proposalId);
  const proposalRevision = value.proposalRevision;
  if (proposalRevision !== undefined && (!Number.isInteger(proposalRevision) || (proposalRevision as number) < 1)) {
    return fail("INVALID_INPUT", "The proposal revision must be a positive integer");
  }
  if (!isRecord(value.source) || typeof value.source.kind !== "string") {
    return fail("INVALID_INPUT", "The asset source did not match the public schema");
  }
  let source: StageAssetInput["source"];
  if (value.source.kind === "data-url" && hasOnlyKeys(value.source, ["kind", "data"])) {
    source = { kind: "data-url", data: boundedText(value.source.data, 7_000_000) };
  } else if (value.source.kind === "https-url" && hasOnlyKeys(value.source, ["kind", "url"])) {
    source = { kind: "https-url", url: boundedText(value.source.url, 2_048) };
  } else {
    return fail("INVALID_INPUT", "The asset source did not match the public schema");
  }
  const filename = sanitizeFilename(value.filename);
  return {
    baseRevision: boundedText(value.baseRevision, 200),
    ...(proposalId === undefined ? {} : { proposalId }),
    ...(proposalRevision === undefined ? {} : { proposalRevision: proposalRevision as number }),
    slotId: safeId(value.slotId),
    source,
    ...(filename === undefined ? {} : { filename }),
    altText: boundedText(value.altText, 300),
  };
}

function hasMagicBytes(mediaType: AssetMediaType, bytes: Uint8Array): boolean {
  if (mediaType === "image/png") {
    return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  }
  if (mediaType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mediaType === "image/webp") {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
      && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  const text = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 100_000))).trim().toLowerCase();
  if (!text.includes("<svg")) return false;
  return !/<script\b|<foreignobject\b|\son[a-z]+\s*=|javascript\s*:|(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/|data:text\/html)/i.test(text);
}

function decodeDataUrl(source: string, slot: AssetSlotDefinition): LoadedAssetSource {
  if (source.length > slot.maximumSourceCharacters) return fail("ASSET_TOO_LARGE", "The asset source exceeds the declared slot limit");
  const match = source.match(DATA_URL);
  if (!match) return fail("ASSET_DECODE_FAILED", "The data URL is not a supported base64 image");
  const mediaType = match[1] as AssetMediaType;
  if (!slot.mediaTypes.includes(mediaType)) return fail("ASSET_SOURCE_REJECTED", "The declared asset media type is unavailable for this slot");
  let decoded: string;
  try { decoded = atob(match[2]!); } catch { return fail("ASSET_DECODE_FAILED", "The asset source could not be decoded"); }
  if (decoded.length > slot.maximumBytes) return fail("ASSET_TOO_LARGE", "The decoded asset exceeds the declared slot limit");
  const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  if (!hasMagicBytes(mediaType, bytes)) return fail("ASSET_DECODE_FAILED", "The asset bytes do not match the declared media type or safe vector subset");
  return { sourceKind: "data-url", mediaType, bytes };
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return false;
  const [a = 0, b = 0] = parts.map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19))
    || (a === 255);
}

function assertRemoteUrlSafe(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { return fail("ASSET_SOURCE_REJECTED", "The remote asset URL is invalid"); }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    return fail("ASSET_SOURCE_REJECTED", "Remote assets require a credential-free HTTPS URL without a fragment");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || isPrivateIpv4(hostname)) {
    return fail("ASSET_SOURCE_REJECTED", "The remote asset host is unavailable");
  }
  if (hostname.includes(":")) {
    const normalized = hostname.toLowerCase();
    if (normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized) || normalized.startsWith("::ffff:")) {
      return fail("ASSET_SOURCE_REJECTED", "The remote asset host is unavailable");
    }
  }
  return url;
}

async function readResponseBytes(response: Response, maximumBytes: number): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) return fail("ASSET_TOO_LARGE", "The remote asset exceeds the declared slot limit");
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maximumBytes) return fail("ASSET_TOO_LARGE", "The remote asset exceeds the declared slot limit");
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        return fail("ASSET_TOO_LARGE", "The remote asset exceeds the declared slot limit");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof AssetSandboxError) throw error;
    return fail("ASSET_FETCH_FAILED", "The remote asset response could not be read");
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function sanitizeAdapterAsset<PrivateAsset>(value: unknown, slot: AssetSlotDefinition): AdapterStagedAsset<PrivateAsset> {
  if (!isRecord(value) || !Object.prototype.hasOwnProperty.call(value, "privateAsset")) {
    return fail("ASSET_STAGE_FAILED", "The merchant asset adapter returned an invalid result");
  }
  if (typeof value.mediaType !== "string" || !slot.mediaTypes.includes(value.mediaType as AssetMediaType)) {
    return fail("ASSET_STAGE_FAILED", "The merchant asset adapter returned an invalid media type");
  }
  if (!Number.isInteger(value.byteLength) || (value.byteLength as number) < 1 || (value.byteLength as number) > slot.maximumBytes || typeof value.integrity !== "string" || !INTEGRITY.test(value.integrity)) {
    return fail("ASSET_STAGE_FAILED", "The merchant asset adapter returned invalid bounded metadata");
  }
  const hasWidth = value.width !== undefined;
  const hasHeight = value.height !== undefined;
  if (hasWidth !== hasHeight || (hasWidth && (!Number.isInteger(value.width) || !Number.isInteger(value.height) || (value.width as number) < 1 || (value.height as number) < 1 || (value.width as number) > 16_384 || (value.height as number) > 16_384))) {
    return fail("ASSET_STAGE_FAILED", "The merchant asset adapter returned invalid dimensions");
  }
  return {
    privateAsset: value.privateAsset as PrivateAsset,
    mediaType: value.mediaType as AssetMediaType,
    byteLength: value.byteLength as number,
    ...(hasWidth ? { width: value.width as number, height: value.height as number } : {}),
    integrity: value.integrity,
  };
}

export class AssetSandbox<PrivateAsset = unknown> {
  readonly manifest: ConfiguratorManifest;
  readonly #adapter: AssetStagingAdapter<PrivateAsset>;
  readonly #fetch: typeof fetch | undefined;
  readonly #now: () => number;
  readonly #ttlMs: number;
  readonly #validateRemoteUrl: ((url: URL) => void | Promise<void>) | undefined;
  readonly #entries = new Map<string, AssetEntry<PrivateAsset>>();

  constructor(manifest: ConfiguratorManifest, adapter: AssetStagingAdapter<PrivateAsset>, options: AssetSandboxOptions = {}) {
    this.manifest = validateManifest(structuredClone(manifest));
    this.#adapter = adapter;
    this.#fetch = options.fetch ?? globalThis.fetch?.bind(globalThis);
    this.#now = options.now ?? Date.now;
    const ttl = options.ttlMs ?? DEFAULT_TTL_MS;
    if (!Number.isInteger(ttl) || ttl < 1_000 || ttl > MAX_TTL_MS) throw new TypeError("Asset sandbox TTL is invalid");
    this.#ttlMs = ttl;
    this.#validateRemoteUrl = options.validateRemoteUrl;
  }

  get size(): number { return this.#entries.size; }
  get temporaryBytes(): number { return [...this.#entries.values()].reduce((sum, entry) => sum + entry.receipt.byteLength, 0); }

  async stage(rawInput: unknown): Promise<StagedAssetReceipt> {
    const input = validateStageAssetInput(rawInput);
    const slot = this.manifest.assetSlots.find((candidate) => candidate.id === input.slotId);
    if (!slot) return fail("UNKNOWN_ASSET_SLOT", "The requested asset slot is unavailable");
    if (!slot.sourceKinds.includes(input.source.kind)) return fail("ASSET_SOURCE_REJECTED", "The requested asset source kind is unavailable for this slot");
    if (this.#entries.size >= MAX_ASSETS_PER_SESSION) return fail("ASSET_TOO_LARGE", "The temporary asset count limit has been reached");
    const loaded = input.source.kind === "data-url"
      ? decodeDataUrl(input.source.data, slot)
      : await this.#loadRemote(input.source.url, slot);
    if (this.temporaryBytes + loaded.bytes.byteLength > MAX_TOTAL_TEMPORARY_BYTES) return fail("ASSET_TOO_LARGE", "The temporary session byte limit has been reached");
    const sourceIntegrity = await sha256(loaded.bytes);
    const request: AdapterAssetStageRequest = {
      slotId: slot.id,
      sourceKind: loaded.sourceKind,
      declaredMediaType: loaded.mediaType,
      bytes: loaded.bytes.slice(),
      sourceIntegrity,
      ...(input.filename === undefined ? {} : { filename: input.filename }),
      altText: input.altText,
    };
    let rawResult: unknown;
    try {
      rawResult = await this.#adapter.stageAsset(request);
      const staged = sanitizeAdapterAsset<PrivateAsset>(rawResult, slot);
      if (this.temporaryBytes + staged.byteLength > MAX_TOTAL_TEMPORARY_BYTES) {
        return fail("ASSET_TOO_LARGE", "The sanitized temporary asset exceeds the session byte limit");
      }
      const now = this.#now();
      const expiresAtMs = now + this.#ttlMs;
      const assetHandle = `asset-${crypto.randomUUID()}`;
      const receipt: StagedAssetReceipt = {
        assetHandle,
        slotId: slot.id,
        mediaType: staged.mediaType,
        byteLength: staged.byteLength,
        ...(staged.width === undefined ? {} : { width: staged.width, height: staged.height! }),
        ...(input.filename === undefined ? {} : { filename: input.filename }),
        altText: input.altText,
        integrity: staged.integrity,
        sourceIntegrity,
        temporary: true,
        expiresAt: new Date(expiresAtMs).toISOString(),
        persisted: false,
      };
      this.#entries.set(assetHandle, {
        receipt,
        privateAsset: staged.privateAsset,
        baseRevision: input.baseRevision,
        proposalId: input.proposalId ?? null,
        proposalRevision: input.proposalRevision ?? null,
        expiresAtMs,
      });
      return structuredClone(receipt);
    } catch (error) {
      if (isRecord(rawResult) && Object.prototype.hasOwnProperty.call(rawResult, "privateAsset")) {
        await this.#adapter.releaseAsset(rawResult.privateAsset as PrivateAsset).catch(() => undefined);
      }
      if (error instanceof AssetSandboxError) throw error;
      return fail("ASSET_STAGE_FAILED", "The merchant asset adapter could not stage the supplied asset");
    }
  }

  getReceipt(assetHandle: string): StagedAssetReceipt | null {
    const entry = this.#entries.get(assetHandle);
    if (!entry || entry.expiresAtMs <= this.#now()) return null;
    return structuredClone(entry.receipt);
  }

  createResolver(context: AssetBindingContext, allowUnbound = false): AssetResolver<PrivateAsset> {
    const baseRevision = boundedText(context.baseRevision, 200);
    const proposalId = context.proposalId;
    const proposalRevision = context.proposalRevision;
    if ((proposalId === undefined) !== (proposalRevision === undefined) || (proposalId !== undefined && !isSafeIdentifier(proposalId)) || (proposalRevision !== undefined && (!Number.isInteger(proposalRevision) || proposalRevision < 1))) {
      return fail("INVALID_INPUT", "The asset resolver context is invalid");
    }
    return {
      resolve: (assetHandle) => {
        if (!isSafeIdentifier(assetHandle)) return null;
        const entry = this.#entries.get(assetHandle);
        if (!entry || entry.expiresAtMs <= this.#now() || entry.baseRevision !== baseRevision) return null;
        if (entry.proposalId === null) {
          if (!allowUnbound) return null;
        } else if (entry.proposalId !== proposalId || entry.proposalRevision !== proposalRevision) return null;
        return { privateAsset: entry.privateAsset, receipt: structuredClone(entry.receipt) } as ResolvedTemporaryAsset<PrivateAsset>;
      },
    };
  }

  assertHandles(assetHandles: readonly string[], context: AssetBindingContext, allowUnbound = false): void {
    const resolver = this.createResolver(context, allowUnbound);
    for (const handle of new Set(assetHandles)) {
      const entry = this.#entries.get(handle);
      if (!entry) return fail("UNKNOWN_ASSET", "A referenced temporary asset is unavailable");
      if (entry.expiresAtMs <= this.#now()) return fail("ASSET_EXPIRED", "A referenced temporary asset has expired");
      if (!resolver.resolve(handle)) return fail("ASSET_BINDING_MISMATCH", "A referenced temporary asset belongs to another workspace or proposal revision");
    }
  }

  bindHandles(assetHandles: readonly string[], context: Required<Pick<AssetBindingContext, "baseRevision" | "proposalId" | "proposalRevision">>): void {
    if (!isSafeIdentifier(context.proposalId) || !Number.isInteger(context.proposalRevision) || context.proposalRevision < 1 || context.baseRevision.length < 1 || context.baseRevision.length > 200) {
      return fail("INVALID_INPUT", "The asset binding context is invalid");
    }
    for (const handle of new Set(assetHandles)) {
      const entry = this.#entries.get(handle);
      if (!entry) return fail("UNKNOWN_ASSET", "A referenced temporary asset is unavailable");
      if (entry.expiresAtMs <= this.#now()) return fail("ASSET_EXPIRED", "A referenced temporary asset has expired");
      if (entry.baseRevision !== context.baseRevision) return fail("ASSET_BINDING_MISMATCH", "A referenced temporary asset belongs to another workspace revision");
      if (entry.proposalId !== null && (entry.proposalId !== context.proposalId || entry.proposalRevision !== context.proposalRevision)) {
        return fail("ASSET_BINDING_MISMATCH", "A referenced temporary asset belongs to another proposal revision");
      }
    }
    for (const handle of new Set(assetHandles)) {
      const entry = this.#entries.get(handle)!;
      entry.proposalId = context.proposalId;
      entry.proposalRevision = context.proposalRevision;
    }
  }

  advanceProposalRevision(proposalId: string, fromRevision: number, toRevision: number): void {
    if (!isSafeIdentifier(proposalId) || !Number.isInteger(fromRevision) || !Number.isInteger(toRevision) || fromRevision < 1 || toRevision <= fromRevision) {
      return fail("INVALID_INPUT", "The asset proposal revision transition is invalid");
    }
    for (const entry of this.#entries.values()) {
      if (entry.proposalId === proposalId && entry.proposalRevision === fromRevision) entry.proposalRevision = toRevision;
    }
  }

  transitionProposalRevision(
    baseRevision: string,
    proposalId: string,
    fromRevision: number,
    toRevision: number,
    attachedHandles: readonly string[],
  ): void {
    const base = boundedText(baseRevision, 200);
    if (!isSafeIdentifier(proposalId) || !Number.isInteger(fromRevision) || !Number.isInteger(toRevision) || fromRevision < 0 || toRevision !== fromRevision + 1) {
      return fail("INVALID_INPUT", "The asset proposal revision transition is invalid");
    }
    const handles = [...new Set(attachedHandles)];
    for (const handle of handles) {
      const entry = this.#entries.get(handle);
      if (!entry) return fail("UNKNOWN_ASSET", "A referenced temporary asset is unavailable");
      if (entry.expiresAtMs <= this.#now()) return fail("ASSET_EXPIRED", "A referenced temporary asset has expired");
      const belongsToCurrentProposal = fromRevision > 0 && entry.proposalId === proposalId && entry.proposalRevision === fromRevision;
      if (entry.baseRevision !== base || (entry.proposalId !== null && !belongsToCurrentProposal)) {
        return fail("ASSET_BINDING_MISMATCH", "A referenced temporary asset belongs to another workspace or proposal revision");
      }
    }
    for (const entry of this.#entries.values()) {
      if (fromRevision > 0 && entry.proposalId === proposalId && entry.proposalRevision === fromRevision) {
        entry.proposalRevision = toRevision;
      }
    }
    for (const handle of handles) {
      const entry = this.#entries.get(handle)!;
      entry.proposalId = proposalId;
      entry.proposalRevision = toRevision;
    }
  }

  async releaseProposal(proposalId: string): Promise<void> {
    const handles = [...this.#entries].filter(([, entry]) => entry.proposalId === proposalId).map(([handle]) => handle);
    await this.#releaseHandles(handles);
  }

  async releaseHandle(assetHandle: string): Promise<void> {
    if (!isSafeIdentifier(assetHandle)) return fail("INVALID_INPUT", "The temporary asset handle is invalid");
    await this.#releaseHandles([assetHandle]);
  }

  async releaseAll(): Promise<void> {
    await this.#releaseHandles([...this.#entries.keys()]);
  }

  async sweepExpired(): Promise<number> {
    const handles = [...this.#entries].filter(([, entry]) => entry.expiresAtMs <= this.#now()).map(([handle]) => handle);
    await this.#releaseHandles(handles);
    return handles.length;
  }

  async #loadRemote(source: string, slot: AssetSlotDefinition): Promise<LoadedAssetSource> {
    if (source.length > slot.maximumSourceCharacters) return fail("ASSET_TOO_LARGE", "The remote asset URL exceeds the declared slot limit");
    const url = assertRemoteUrlSafe(source);
    await this.#assertRemotePolicy(url);
    if (!this.#fetch) return fail("ASSET_FETCH_FAILED", "Remote asset fetching is unavailable in this host");
    let response: Response;
    try {
      response = await this.#fetch(url, { credentials: "omit", redirect: "manual", referrerPolicy: "no-referrer", cache: "no-store" });
    } catch {
      return fail("ASSET_FETCH_FAILED", "The remote asset could not be fetched");
    }
    if (response.status >= 300 && response.status < 400 || response.redirected) return fail("ASSET_SOURCE_REJECTED", "Remote asset redirects are unavailable");
    if (!response.ok) return fail("ASSET_FETCH_FAILED", "The remote asset request failed");
    if (response.url) {
      const finalUrl = assertRemoteUrlSafe(response.url);
      await this.#assertRemotePolicy(finalUrl);
    }
    const mediaType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() as AssetMediaType | undefined;
    if (!mediaType || !slot.mediaTypes.includes(mediaType)) return fail("ASSET_SOURCE_REJECTED", "The remote asset media type is unavailable for this slot");
    const bytes = await readResponseBytes(response, slot.maximumBytes);
    if (!hasMagicBytes(mediaType, bytes)) return fail("ASSET_DECODE_FAILED", "The remote asset bytes do not match the declared media type or safe vector subset");
    return { sourceKind: "https-url", mediaType, bytes };
  }

  async #assertRemotePolicy(url: URL): Promise<void> {
    if (!this.#validateRemoteUrl) {
      return fail("ASSET_SOURCE_REJECTED", "Remote asset staging requires a host-supplied network policy");
    }
    try {
      await this.#validateRemoteUrl(new URL(url));
    } catch (error) {
      if (error instanceof AssetSandboxError) throw error;
      return fail("ASSET_SOURCE_REJECTED", "The remote asset host is unavailable under the merchant network policy");
    }
  }

  async #releaseHandles(handles: readonly string[]): Promise<void> {
    const errors: unknown[] = [];
    for (const handle of handles) {
      const entry = this.#entries.get(handle);
      if (!entry) continue;
      this.#entries.delete(handle);
      try { await this.#adapter.releaseAsset(entry.privateAsset); } catch (error) { errors.push(error); }
    }
    if (errors.length > 0) return fail("ASSET_STAGE_FAILED", "One or more temporary merchant assets could not be released");
  }
}
