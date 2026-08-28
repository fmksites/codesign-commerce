import { isSafeIdentifier, validateManifest } from "./manifest.js";
import type {
  AssetResolver,
  ConfiguratorManifest,
  PreviewArtifact,
  PreviewArtifactCandidate,
  PreviewBridgeErrorCode,
  PreviewCaptureAdapter,
  PreviewCaptureRequest,
  PreviewSurfaceDefinition,
  WorkspaceState,
} from "./types.js";

const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;
const INTEGRITY = /^sha256:[0-9a-f]{64}$/;
const MAX_ARTIFACTS = 100;
const MAX_ALT_TEXT = 500;
const MAX_URL_CHARACTERS = 2_048;
const MAX_URL_EXPIRY_MS = 24 * 60 * 60 * 1_000;
const PRIVATE_QUERY_NAMES = /(?:state|config|customer|project|secret|token|auth|session|prompt|snapshot)/i;

export interface PreviewBridgeOptions {
  origin?: string;
  now?: () => number;
}

interface CapturePlan {
  request: PreviewCaptureRequest;
  keys: string[];
  surfaces: Map<string, PreviewSurfaceDefinition>;
}

export class PreviewBridgeError extends Error {
  constructor(readonly code: PreviewBridgeErrorCode, message: string, readonly retryable: boolean) {
    super(message);
    this.name = "PreviewBridgeError";
  }
}

function fail(code: PreviewBridgeErrorCode, message: string, retryable = false): never {
  throw new PreviewBridgeError(code, message, retryable);
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

function safeId(value: unknown): string {
  if (typeof value !== "string" || !isSafeIdentifier(value)) return fail("INVALID_INPUT", "The preview request contains an invalid identifier");
  return value;
}

function candidateSafeId(value: unknown): string {
  if (typeof value !== "string" || !isSafeIdentifier(value)) return fail("PREVIEW_FAILED", "The preview adapter returned an invalid public identifier", true);
  return value;
}

function boundedText(value: unknown, maximum: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maximum || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    return fail("PREVIEW_FAILED", "The preview adapter returned invalid bounded text", true);
  }
  return value.trim();
}

function optionalIdArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) return fail("INVALID_INPUT", "Preview filters must be bounded non-empty arrays");
  const ids = value.map(safeId);
  if (new Set(ids).size !== ids.length) return fail("INVALID_INPUT", "Preview filters must not contain duplicates");
  return ids;
}

export function validatePreviewCaptureRequest(value: unknown): PreviewCaptureRequest {
  if (!isRecord(value) || !hasOnlyKeys(value, ["proposalId", "proposalRevision", "baseRevision", "variantIds", "surfaceIds"])) {
    return fail("INVALID_INPUT", "The preview request did not match the public schema");
  }
  if (!Number.isInteger(value.proposalRevision) || (value.proposalRevision as number) < 1 || typeof value.baseRevision !== "string" || value.baseRevision.length < 1 || value.baseRevision.length > 200) {
    return fail("INVALID_INPUT", "The preview request contains an invalid revision");
  }
  const variantIds = optionalIdArray(value.variantIds);
  const surfaceIds = optionalIdArray(value.surfaceIds);
  return {
    proposalId: safeId(value.proposalId),
    proposalRevision: value.proposalRevision as number,
    baseRevision: value.baseRevision,
    ...(variantIds === undefined ? {} : { variantIds }),
    ...(surfaceIds === undefined ? {} : { surfaceIds }),
  };
}

function artifactKey(proposalId: string, proposalRevision: number, variantId: string, surfaceId: string): string {
  return `${proposalId}\u0000${proposalRevision}\u0000${variantId}\u0000${surfaceId}`;
}

function hasMagicBytes(mediaType: PreviewArtifact["mediaType"], bytes: Uint8Array): boolean {
  if (mediaType === "image/png") return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  if (mediaType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

function decodeDataUrl(value: string, mediaType: PreviewArtifact["mediaType"], maximumBytes: number): Uint8Array {
  const match = value.match(DATA_URL);
  if (!match || match[1] !== mediaType) return fail("PREVIEW_FAILED", "The preview transport media type is invalid", true);
  let decoded: string;
  try { decoded = atob(match[2]!); } catch { return fail("PREVIEW_FAILED", "The preview transport could not be decoded", true); }
  if (decoded.length > maximumBytes) return fail("PREVIEW_FAILED", "The preview artifact exceeds the declared surface limit", true);
  const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  if (!hasMagicBytes(mediaType, bytes)) return fail("PREVIEW_FAILED", "The preview bytes do not match the declared media type", true);
  return bytes;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function sanitizeSameOriginUrl(
  transport: Record<string, unknown>,
  origin: string | undefined,
  now: number,
): PreviewArtifact["transport"] {
  if (!origin) return fail("PREVIEW_FAILED", "Same-origin preview transport is unavailable without a declared origin", true);
  if (!hasOnlyKeys(transport, ["kind", "value", "expiresAt"]) || typeof transport.value !== "string" || transport.value.length < 1 || transport.value.length > MAX_URL_CHARACTERS) {
    return fail("PREVIEW_FAILED", "The same-origin preview transport is invalid", true);
  }
  let configuredOrigin: URL;
  let url: URL;
  try {
    configuredOrigin = new URL(origin);
    url = new URL(transport.value, configuredOrigin);
  } catch {
    return fail("PREVIEW_FAILED", "The same-origin preview URL is invalid", true);
  }
  if (url.origin !== configuredOrigin.origin || url.username || url.password || url.hash || !["https:", "http:"].includes(url.protocol)) {
    return fail("PREVIEW_FAILED", "The preview URL crossed the declared same-origin boundary", true);
  }
  if (url.pathname.length > 1_024 || /[{}<>\[\]"'\\]/.test(url.pathname)) return fail("PREVIEW_FAILED", "The preview URL path is unsafe", true);
  for (const [key, value] of url.searchParams) {
    if (!isSafeIdentifier(key) || PRIVATE_QUERY_NAMES.test(key) || value.length > 128 || !/^[a-zA-Z0-9._~-]*$/.test(value)) {
      return fail("PREVIEW_FAILED", "The preview URL query is not an opaque public reference", true);
    }
  }
  let expiresAt: string | undefined;
  if (transport.expiresAt !== undefined) {
    if (typeof transport.expiresAt !== "string") return fail("PREVIEW_FAILED", "The preview URL expiry is invalid", true);
    const expiry = Date.parse(transport.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= now || expiry - now > MAX_URL_EXPIRY_MS) return fail("PREVIEW_FAILED", "The preview URL expiry is invalid", true);
    expiresAt = new Date(expiry).toISOString();
  }
  return { kind: "same-origin-url", value: url.href, ...(expiresAt === undefined ? {} : { expiresAt }) };
}

export class PreviewBridge<PrivateAsset = unknown> {
  readonly manifest: ConfiguratorManifest;
  readonly #adapter: PreviewCaptureAdapter<PrivateAsset>;
  readonly #origin: string | undefined;
  readonly #now: () => number;
  readonly #artifacts = new Map<string, PreviewArtifact>();

  constructor(manifest: ConfiguratorManifest, adapter: PreviewCaptureAdapter<PrivateAsset>, options: PreviewBridgeOptions = {}) {
    this.manifest = validateManifest(structuredClone(manifest));
    this.#adapter = adapter;
    this.#origin = options.origin;
    this.#now = options.now ?? Date.now;
  }

  async capture(rawRequest: unknown, workspace: WorkspaceState, assets: AssetResolver<PrivateAsset>): Promise<PreviewArtifact[]> {
    const plan = this.#plan(rawRequest, workspace);
    // Once a capture starts, older receipts for this proposal are no longer
    // trustworthy. A failed replacement must leave no artifact that Keep can
    // accidentally treat as current.
    this.releaseProposal(plan.request.proposalId);
    let candidates: PreviewArtifactCandidate[];
    try {
      candidates = await this.#adapter.capturePreviews(structuredClone(plan.request), assets);
    } catch {
      return fail("PREVIEW_FAILED", "The merchant renderer could not capture the requested previews", true);
    }
    if (!Array.isArray(candidates) || candidates.length !== plan.keys.length || candidates.length > MAX_ARTIFACTS) {
      return fail("PREVIEW_FAILED", "The preview adapter returned incomplete or excessive artifacts", true);
    }
    const seen = new Set<string>();
    const artifacts: PreviewArtifact[] = [];
    for (const candidate of candidates) {
      const artifact = await this.#sanitizeCandidate(candidate, plan);
      const key = artifactKey(artifact.proposalId, artifact.proposalRevision, artifact.variantId, artifact.surfaceId);
      if (!plan.keys.includes(key) || seen.has(key)) return fail("PREVIEW_FAILED", "The preview adapter returned an unexpected or duplicate artifact", true);
      seen.add(key);
      artifacts.push(artifact);
    }
    if (seen.size !== plan.keys.length) return fail("PREVIEW_FAILED", "The preview adapter omitted a requested artifact", true);
    for (const artifact of artifacts) {
      this.#artifacts.set(artifactKey(artifact.proposalId, artifact.proposalRevision, artifact.variantId, artifact.surfaceId), structuredClone(artifact));
    }
    return structuredClone(artifacts);
  }

  getCurrent(rawRequest: unknown, workspace: WorkspaceState): PreviewArtifact[] {
    const plan = this.#plan(rawRequest, workspace);
    const artifacts = plan.keys.map((key) => this.#artifacts.get(key));
    if (artifacts.some((artifact) => !artifact || this.#isExpired(artifact))) return fail("PREVIEW_STALE", "Current preview artifacts are unavailable for this exact proposal revision", true);
    return structuredClone(artifacts as PreviewArtifact[]);
  }

  assertCurrent(rawRequest: unknown, workspace: WorkspaceState): PreviewArtifact[] {
    return this.getCurrent(rawRequest, workspace);
  }

  releaseProposal(proposalId: string): void {
    for (const [key, artifact] of this.#artifacts) {
      if (artifact.proposalId === proposalId) this.#artifacts.delete(key);
    }
  }

  releaseAll(): void { this.#artifacts.clear(); }

  #plan(rawRequest: unknown, workspace: WorkspaceState): CapturePlan {
    const request = validatePreviewCaptureRequest(rawRequest);
    if (workspace.committedRevision !== request.baseRevision) return fail("PREVIEW_STALE", "The preview base revision is stale", true);
    const knownVariants = new Set(workspace.variants.map((variant) => variant.id));
    const variantIds = request.variantIds ?? workspace.variants.map((variant) => variant.id);
    if (variantIds.some((id) => !knownVariants.has(id))) return fail("UNKNOWN_TARGET", "The preview request references an unknown variant");
    const knownSurfaces = new Map(this.manifest.previewSurfaces.map((surface) => [surface.id, surface]));
    const surfaceIds = request.surfaceIds ?? this.manifest.previewSurfaces.map((surface) => surface.id);
    if (surfaceIds.length === 0 || surfaceIds.some((id) => !knownSurfaces.has(id))) return fail("CAPABILITY_UNAVAILABLE", "The requested preview surface is unavailable");
    const keys: string[] = [];
    const surfaces = new Map<string, PreviewSurfaceDefinition>();
    for (const surfaceId of surfaceIds) {
      const surface = knownSurfaces.get(surfaceId)!;
      surfaces.set(surfaceId, surface);
      const targets = surface.scope === "variant" ? variantIds : [workspace.activeVariantId];
      for (const variantId of targets) keys.push(artifactKey(request.proposalId, request.proposalRevision, variantId, surfaceId));
    }
    if (keys.length < 1 || keys.length > MAX_ARTIFACTS) return fail("CAPABILITY_UNAVAILABLE", "The preview request exceeds the declared surface limit");
    return {
      request: {
        ...request,
        variantIds,
        surfaceIds,
      },
      keys,
      surfaces,
    };
  }

  async #sanitizeCandidate(candidate: unknown, plan: CapturePlan): Promise<PreviewArtifact> {
    if (!isRecord(candidate) || !isRecord(candidate.transport)) return fail("PREVIEW_FAILED", "The preview adapter returned an invalid artifact", true);
    const variantId = candidateSafeId(candidate.variantId);
    const surfaceId = candidateSafeId(candidate.surfaceId);
    const surface = plan.surfaces.get(surfaceId);
    if (!surface || typeof candidate.mediaType !== "string" || !surface.mediaTypes.includes(candidate.mediaType as PreviewArtifact["mediaType"])) {
      return fail("PREVIEW_FAILED", "The preview adapter returned an unavailable media type", true);
    }
    if (!Number.isInteger(candidate.width) || !Number.isInteger(candidate.height) || (candidate.width as number) < 1 || (candidate.height as number) < 1 || (candidate.width as number) > 16_384 || (candidate.height as number) > 16_384) {
      return fail("PREVIEW_FAILED", "The preview adapter returned invalid dimensions", true);
    }
    const mediaType = candidate.mediaType as PreviewArtifact["mediaType"];
    let transport: PreviewArtifact["transport"];
    let integrity: string;
    if (candidate.transport.kind === "data-url" && hasOnlyKeys(candidate.transport, ["kind", "value"]) && typeof candidate.transport.value === "string") {
      const bytes = decodeDataUrl(candidate.transport.value, mediaType, surface.maximumBytes);
      integrity = await sha256(bytes);
      transport = { kind: "data-url", value: candidate.transport.value };
      if (candidate.integrity !== undefined && candidate.integrity !== integrity) return fail("PREVIEW_FAILED", "The preview integrity did not match its bytes", true);
    } else if (candidate.transport.kind === "same-origin-url") {
      transport = sanitizeSameOriginUrl(candidate.transport, this.#origin, this.#now());
      if (typeof candidate.integrity !== "string" || !INTEGRITY.test(candidate.integrity)) return fail("PREVIEW_FAILED", "The URL preview requires a valid integrity receipt", true);
      integrity = candidate.integrity;
    } else {
      return fail("PREVIEW_FAILED", "The preview adapter returned an unsupported transport", true);
    }
    return {
      artifactId: `preview-${crypto.randomUUID()}`,
      proposalId: plan.request.proposalId,
      proposalRevision: plan.request.proposalRevision,
      baseRevision: plan.request.baseRevision,
      variantId,
      surfaceId,
      mediaType,
      width: candidate.width as number,
      height: candidate.height as number,
      altText: boundedText(candidate.altText, MAX_ALT_TEXT),
      integrity,
      transport,
    };
  }

  #isExpired(artifact: PreviewArtifact): boolean {
    return artifact.transport.kind === "same-origin-url"
      && artifact.transport.expiresAt !== undefined
      && Date.parse(artifact.transport.expiresAt) <= this.#now();
  }
}
