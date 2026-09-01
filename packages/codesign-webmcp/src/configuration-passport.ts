import { isSafeIdentifier } from "./manifest.js";
import type { ControlValue } from "./types.js";

export const CONFIGURATION_PASSPORT_VERSION = "0.1" as const;

const SHA256_INTEGRITY = /^sha256:[0-9a-f]{64}$/;
const SAFE_OPAQUE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._~-]{0,199}$/;
const SAFE_REVISION = /^[a-zA-Z0-9][a-zA-Z0-9._~:+/-]{0,199}$/;
const SAFE_VERSION = /^[a-zA-Z0-9][a-zA-Z0-9._~+@:/-]{0,127}$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const URL_LIKE_VALUE = /(?:data:|blob:|https?:\/\/)/i;
const EMAIL_LIKE_VALUE = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;
const PRICE_LIKE_VALUE = /(?:[$€£¥]|\b(?:USD|EUR|GBP|JPY)\b)/i;
const PRIVATE_TEXT_VALUE = /\b(?:authorization|cookie|cost|customer|endpoint|margin|password|price|secret|session|supplier|token)\b/i;
const MAX_PREVIEW_RECEIPTS = 100;
const MAX_ISSUES = 100;
const MAX_VARIANTS = 100;
const MAX_ELEMENTS_PER_VARIANT = 200;
const MAX_CONTROLS_PER_SCOPE = 240;
const MAX_SAFE_CONFIGURATION_BYTES = 128 * 1024;
const MAX_PASSPORT_BYTES = 128 * 1024;
const PRIVATE_ENDPOINT_SEGMENTS = new Set(["admin", "internal", "private"]);

const PRIVATE_CONTROL_SEGMENTS = new Set([
  "admin",
  "auth",
  "authentication",
  "authorization",
  "cookie",
  "cost",
  "currency",
  "customer",
  "discount",
  "email",
  "endpoint",
  "internal",
  "margin",
  "password",
  "phone",
  "price",
  "private",
  "prompt",
  "secret",
  "session",
  "supplier",
  "tax",
  "token",
]);

export type ConfigurationPassportErrorCode =
  | "INVALID_PASSPORT"
  | "UNSUPPORTED_VERSION"
  | "INVALID_PUBLIC_CONFIGURATION"
  | "CONFIGURATION_BINDING_MISMATCH"
  | "READINESS_MISMATCH"
  | "DIGEST_MISMATCH";

export class ConfigurationPassportError extends Error {
  constructor(readonly code: ConfigurationPassportErrorCode, message: string) {
    super(message);
    this.name = "ConfigurationPassportError";
  }
}

export interface PublicSafeConfigurationElement {
  id: string;
  type: string;
  controls: Record<string, ControlValue>;
}

export interface PublicSafeConfigurationVariant {
  id: string;
  name: string;
  controls: Record<string, ControlValue>;
  elements: PublicSafeConfigurationElement[];
}

export interface PublicSafeConfiguration {
  configuratorId: string;
  manifestVersion: string;
  committedRevision: string;
  activeVariantId: string;
  workspaceControls: Record<string, ControlValue>;
  variants: PublicSafeConfigurationVariant[];
}

export interface ConfigurationPassportPreviewReceipt {
  artifactId: string;
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  variantId: string;
  surfaceId: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  integrity: string;
}

export type ConfigurationPassportIssueSeverity = "constraint-error" | "decision-required" | "warning" | "information";

export interface ConfigurationPassportIssue {
  code: string;
  severity: ConfigurationPassportIssueSeverity;
  controlIds?: string[];
  variantIds?: string[];
  elementIds?: string[];
}

export interface ConfigurationPassportReadiness {
  configurationValid: boolean;
  productionReady: boolean;
  issues: ConfigurationPassportIssue[];
}

export interface ConfigurationPassportSafeSummary {
  itemCount: number;
  variantCount: number;
  status: "production-ready" | "saved-draft";
}

export interface ConfigurationPassportVerificationPolicy {
  merchantOrigin: string;
  configuratorId: string;
  manifestVersion: string;
  rendererVersion: string;
  /** Current public-safe readiness recomputed by the merchant from the committed state. */
  authoritativeReadiness: ConfigurationPassportReadiness;
}

export interface ConfigurationPassportV01 {
  passportVersion: typeof CONFIGURATION_PASSPORT_VERSION;
  merchantOrigin: string;
  configuratorId: string;
  configurationId: string;
  committedRevision: string;
  manifestVersion: string;
  rendererVersion: string;
  configurationDigest: string;
  passportIntegrity: string;
  previewReceipts: ConfigurationPassportPreviewReceipt[];
  readiness: ConfigurationPassportReadiness;
  safeSummary: ConfigurationPassportSafeSummary;
  editUrl: string;
}

export type CreateConfigurationPassportInput = Omit<ConfigurationPassportV01, "configurationDigest" | "passportIntegrity"> & {
  publicConfiguration: unknown;
};

export interface VerifiedConfigurationPassport {
  readonly passport: Readonly<ConfigurationPassportV01>;
  readonly readinessBinding: "merchant-authoritative-current";
}

const verifiedPassports = new WeakSet<object>();

function fail(code: ConfigurationPassportErrorCode, message: string): never {
  throw new ConfigurationPassportError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function strictRecord(value: unknown, allowed: readonly string[], code: ConfigurationPassportErrorCode, message: string): Record<string, unknown> {
  if (!isRecord(value) || !hasOnlyKeys(value, allowed)) return fail(code, message);
  return value;
}

function boundedText(value: unknown, maximum: number, code: ConfigurationPassportErrorCode, message: string): string {
  if (typeof value !== "string" || value.length < 1 || value.length > maximum || value !== value.trim() || CONTROL_CHARACTERS.test(value)) {
    return fail(code, message);
  }
  return value.normalize("NFC");
}

function opaqueId(value: unknown, field: string): string {
  const id = boundedText(value, 200, "INVALID_PASSPORT", `The passport ${field} is invalid`);
  if (!SAFE_OPAQUE_ID.test(id)) return fail("INVALID_PASSPORT", `The passport ${field} is invalid`);
  return id;
}

function revision(value: unknown, code: ConfigurationPassportErrorCode, message: string): string {
  const result = boundedText(value, 200, code, message);
  if (!SAFE_REVISION.test(result) || URL_LIKE_VALUE.test(result)) return fail(code, message);
  return result;
}

function version(value: unknown, code: ConfigurationPassportErrorCode, message: string): string {
  const result = boundedText(value, 128, code, message);
  if (!SAFE_VERSION.test(result) || URL_LIKE_VALUE.test(result)) return fail(code, message);
  return result;
}

function safeIdentifier(value: unknown, code: ConfigurationPassportErrorCode, message: string): string {
  if (typeof value !== "string" || !isSafeIdentifier(value)) return fail(code, message);
  return value;
}

function canonicalOrigin(value: unknown): string {
  const input = boundedText(value, 512, "INVALID_PASSPORT", "The passport merchant origin is invalid");
  let url: URL;
  try { url = new URL(input); } catch { return fail("INVALID_PASSPORT", "The passport merchant origin is invalid"); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash || input !== url.origin || !isPublicMerchantHost(url)) {
    return fail("INVALID_PASSPORT", "The passport merchant origin must be a canonical HTTP origin");
  }
  return url.origin;
}

function isPublicMerchantHost(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  const localDevelopment = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  if (url.protocol === "http:" && !localDevelopment) return false;
  if (localDevelopment) return true;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname.endsWith(".lan")) return false;
  const ipv6 = hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
  if (ipv6.includes(":")) {
    if (ipv6 === "::" || /^(?:fc|fd)[0-9a-f]{2}:/i.test(ipv6) || /^fe[89ab][0-9a-f]:/i.test(ipv6) || /^ff[0-9a-f]{2}:/i.test(ipv6)) return false;
    // URL parsers canonicalize dotted IPv4-mapped forms to hexadecimal (for
    // example ::ffff:127.0.0.1 becomes ::ffff:7f00:1). Fail closed for the
    // entire mapped range; a public IPv4 merchant can use its ordinary IPv4
    // origin instead of an ambiguous IPv6 literal.
    if (/^::ffff:/i.test(ipv6)) return false;
    return true;
  }
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)?.slice(1).map(Number);
  if (!ipv4 || ipv4.some((part) => part < 0 || part > 255)) return true;
  const [first, second] = ipv4;
  return first !== 0
    && first !== 10
    && first !== 127
    && !(first === 169 && second === 254)
    && !(first === 172 && second !== undefined && second >= 16 && second <= 31)
    && !(first === 192 && second === 168);
}

function merchantEditUrl(value: unknown, merchantOrigin: string): string {
  const input = boundedText(value, 2_048, "INVALID_PASSPORT", "The passport re-edit URL is invalid");
  let url: URL;
  try { url = new URL(input); } catch { return fail("INVALID_PASSPORT", "The passport re-edit URL is invalid"); }
  if (!["https:", "http:"].includes(url.protocol) || url.origin !== merchantOrigin || url.username || url.password || url.search || url.hash || input !== url.href) {
    return fail("INVALID_PASSPORT", "The passport re-edit URL must be a canonical same-origin URL without query or fragment data");
  }
  let pathSegments: string[];
  try { pathSegments = url.pathname.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment).toLowerCase()); } catch {
    return fail("INVALID_PASSPORT", "The passport re-edit URL path is invalid");
  }
  if (pathSegments.some((segment) => PRIVATE_ENDPOINT_SEGMENTS.has(segment))) {
    return fail("INVALID_PASSPORT", "The passport re-edit URL cannot target a private merchant route");
  }
  return url.href;
}

function safeSummary(value: unknown): ConfigurationPassportSafeSummary {
  const summary = strictRecord(value, ["itemCount", "variantCount", "status"], "INVALID_PASSPORT", "The passport safe summary is invalid");
  if (!Number.isInteger(summary.itemCount) || (summary.itemCount as number) < 1 || (summary.itemCount as number) > 1_000_000) {
    return fail("INVALID_PASSPORT", "The passport safe item count is invalid");
  }
  if (!Number.isInteger(summary.variantCount) || (summary.variantCount as number) < 1 || (summary.variantCount as number) > MAX_VARIANTS) {
    return fail("INVALID_PASSPORT", "The passport safe variant count is invalid");
  }
  if (summary.status !== "production-ready" && summary.status !== "saved-draft") {
    return fail("INVALID_PASSPORT", "The passport safe readiness status is invalid");
  }
  return {
    itemCount: summary.itemCount as number,
    variantCount: summary.variantCount as number,
    status: summary.status,
  };
}

export function formatConfigurationPassportSafeSummary(summary: ConfigurationPassportSafeSummary): string {
  const safe = safeSummary(summary);
  return `${safe.itemCount} units · ${safe.variantCount} ${safe.variantCount === 1 ? "variant" : "variants"} · ${safe.status === "production-ready" ? "Production ready" : "Saved draft"}`;
}

function splitIdentifierSegments(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1.$2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isPrivateControlId(value: string): boolean {
  const segments = splitIdentifierSegments(value);
  if (segments.some((segment) => PRIVATE_CONTROL_SEGMENTS.has(segment))) return true;
  const joined = segments.join(".");
  return [
    "asset.handle",
    "asset.url",
    "asset.bytes",
    "asset.data",
    "artwork.ref",
    "artwork.url",
    "artwork.bytes",
    "artwork.data",
    "raw.artwork",
    "file.data",
  ].some((pattern) => joined.includes(pattern));
}

function safeConfigurationText(value: unknown, maximum: number, message: string): string {
  const result = boundedText(value, maximum, "INVALID_PUBLIC_CONFIGURATION", message);
  if (URL_LIKE_VALUE.test(result) || EMAIL_LIKE_VALUE.test(result)) return fail("INVALID_PUBLIC_CONFIGURATION", message);
  return result;
}

function sanitizeControlValue(value: unknown): ControlValue {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains a non-finite control value");
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value === "string") return safeConfigurationText(value, 500, "The public configuration contains unsafe text");
  const position = strictRecord(value, ["x", "y"], "INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an unsupported control value");
  if (typeof position.x !== "number" || !Number.isFinite(position.x) || typeof position.y !== "number" || !Number.isFinite(position.y)) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an invalid position");
  }
  return { x: Object.is(position.x, -0) ? 0 : position.x, y: Object.is(position.y, -0) ? 0 : position.y };
}

function sanitizeControls(value: unknown): Record<string, ControlValue> {
  if (!isRecord(value) || Object.keys(value).length > MAX_CONTROLS_PER_SCOPE) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains invalid or excessive controls");
  }
  const controls: Record<string, ControlValue> = {};
  for (const [controlId, controlValue] of Object.entries(value)) {
    if (!isSafeIdentifier(controlId) || isPrivateControlId(controlId)) {
      return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains a private or invalid control identifier");
    }
    controls[controlId] = sanitizeControlValue(controlValue);
  }
  return controls;
}

function sanitizeElement(value: unknown): PublicSafeConfigurationElement {
  const element = strictRecord(value, ["id", "type", "controls"], "INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an invalid element");
  return {
    id: safeIdentifier(element.id, "INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an invalid element identifier"),
    type: safeIdentifier(element.type, "INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an invalid element type"),
    controls: sanitizeControls(element.controls),
  };
}

function sanitizeVariant(value: unknown): PublicSafeConfigurationVariant {
  const variant = strictRecord(value, ["id", "name", "controls", "elements"], "INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an invalid variant");
  if (!Array.isArray(variant.elements) || variant.elements.length > MAX_ELEMENTS_PER_VARIANT) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains invalid or excessive elements");
  }
  const elements = variant.elements.map(sanitizeElement);
  if (new Set(elements.map((element) => element.id)).size !== elements.length) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains duplicate element identifiers");
  }
  return {
    id: safeIdentifier(variant.id, "INVALID_PUBLIC_CONFIGURATION", "The public configuration contains an invalid variant identifier"),
    name: safeConfigurationText(variant.name, 120, "The public configuration contains an invalid variant name"),
    controls: sanitizeControls(variant.controls),
    elements,
  };
}

export function validatePublicSafeConfiguration(value: unknown): PublicSafeConfiguration {
  const configuration = strictRecord(
    value,
    ["configuratorId", "manifestVersion", "committedRevision", "activeVariantId", "workspaceControls", "variants"],
    "INVALID_PUBLIC_CONFIGURATION",
    "The public configuration does not match the safe schema",
  );
  if (!Array.isArray(configuration.variants) || configuration.variants.length < 1 || configuration.variants.length > MAX_VARIANTS) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration must contain a bounded non-empty variant list");
  }
  const variants = configuration.variants.map(sanitizeVariant);
  if (new Set(variants.map((variant) => variant.id)).size !== variants.length) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration contains duplicate variant identifiers");
  }
  const result: PublicSafeConfiguration = {
    configuratorId: safeIdentifier(configuration.configuratorId, "INVALID_PUBLIC_CONFIGURATION", "The public configuration configurator identifier is invalid"),
    manifestVersion: version(configuration.manifestVersion, "INVALID_PUBLIC_CONFIGURATION", "The public configuration manifest version is invalid"),
    committedRevision: revision(configuration.committedRevision, "INVALID_PUBLIC_CONFIGURATION", "The public configuration committed revision is invalid"),
    activeVariantId: safeIdentifier(configuration.activeVariantId, "INVALID_PUBLIC_CONFIGURATION", "The public configuration active variant is invalid"),
    workspaceControls: sanitizeControls(configuration.workspaceControls),
    variants,
  };
  if (!variants.some((variant) => variant.id === result.activeVariantId)) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration active variant is unknown");
  }
  if (new TextEncoder().encode(canonicalJson(result)).byteLength > MAX_SAFE_CONFIGURATION_BYTES) {
    return fail("INVALID_PUBLIC_CONFIGURATION", "The public configuration exceeds the safe size limit");
  }
  return result;
}

function identifierArray(value: unknown, field: string, rejectPrivateControls = false): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return fail("INVALID_PASSPORT", `The passport issue ${field} is invalid`);
  const ids = value.map((candidate) => safeIdentifier(candidate, "INVALID_PASSPORT", `The passport issue ${field} is invalid`));
  if (rejectPrivateControls && ids.some(isPrivateControlId)) return fail("INVALID_PASSPORT", `The passport issue ${field} is private or invalid`);
  if (new Set(ids).size !== ids.length) return fail("INVALID_PASSPORT", `The passport issue ${field} contains duplicates`);
  return ids;
}

function sanitizeIssue(value: unknown): ConfigurationPassportIssue {
  const issue = strictRecord(value, ["code", "severity", "controlIds", "variantIds", "elementIds"], "INVALID_PASSPORT", "The passport contains an invalid readiness issue");
  if (!["constraint-error", "decision-required", "warning", "information"].includes(String(issue.severity))) {
    return fail("INVALID_PASSPORT", "The passport contains an invalid readiness severity");
  }
  const controlIds = identifierArray(issue.controlIds, "controlIds", true);
  const variantIds = identifierArray(issue.variantIds, "variantIds");
  const elementIds = identifierArray(issue.elementIds, "elementIds");
  const code = safeIdentifier(issue.code, "INVALID_PASSPORT", "The passport contains an invalid readiness issue code");
  if (isPrivateControlId(code)) return fail("INVALID_PASSPORT", "The passport contains a private readiness issue code");
  return {
    code,
    severity: issue.severity as ConfigurationPassportIssueSeverity,
    ...(controlIds === undefined ? {} : { controlIds }),
    ...(variantIds === undefined ? {} : { variantIds }),
    ...(elementIds === undefined ? {} : { elementIds }),
  };
}

function sanitizeReadiness(value: unknown): ConfigurationPassportReadiness {
  const readiness = strictRecord(value, ["configurationValid", "productionReady", "issues"], "INVALID_PASSPORT", "The passport readiness is invalid");
  if (typeof readiness.configurationValid !== "boolean" || typeof readiness.productionReady !== "boolean" || !Array.isArray(readiness.issues) || readiness.issues.length > MAX_ISSUES) {
    return fail("INVALID_PASSPORT", "The passport readiness is invalid");
  }
  const issues = readiness.issues.map(sanitizeIssue);
  if (readiness.productionReady && !readiness.configurationValid) return fail("INVALID_PASSPORT", "Production-ready configuration must also be configuration-valid");
  if (readiness.configurationValid && issues.some((issue) => issue.severity === "constraint-error")) {
    return fail("INVALID_PASSPORT", "Configuration-valid readiness cannot contain a constraint error");
  }
  if (readiness.productionReady && issues.some((issue) => issue.severity === "constraint-error" || issue.severity === "decision-required")) {
    return fail("INVALID_PASSPORT", "Production-ready readiness cannot contain a blocking issue");
  }
  return { configurationValid: readiness.configurationValid, productionReady: readiness.productionReady, issues };
}

function sanitizePreviewReceipt(value: unknown): ConfigurationPassportPreviewReceipt {
  const receipt = strictRecord(
    value,
    ["artifactId", "proposalId", "proposalRevision", "baseRevision", "variantId", "surfaceId", "mediaType", "width", "height", "integrity"],
    "INVALID_PASSPORT",
    "The passport contains an invalid preview receipt",
  );
  if (!Number.isInteger(receipt.proposalRevision) || (receipt.proposalRevision as number) < 1 || (receipt.proposalRevision as number) > 1_000_000) {
    return fail("INVALID_PASSPORT", "The passport preview proposal revision is invalid");
  }
  if (!["image/png", "image/jpeg", "image/webp"].includes(String(receipt.mediaType))) {
    return fail("INVALID_PASSPORT", "The passport preview media type is invalid");
  }
  if (!Number.isInteger(receipt.width) || !Number.isInteger(receipt.height) || (receipt.width as number) < 1 || (receipt.height as number) < 1 || (receipt.width as number) > 16_384 || (receipt.height as number) > 16_384) {
    return fail("INVALID_PASSPORT", "The passport preview dimensions are invalid");
  }
  if (typeof receipt.integrity !== "string" || !SHA256_INTEGRITY.test(receipt.integrity)) {
    return fail("INVALID_PASSPORT", "The passport preview integrity is invalid");
  }
  return {
    artifactId: safeIdentifier(receipt.artifactId, "INVALID_PASSPORT", "The passport preview artifact identifier is invalid"),
    proposalId: safeIdentifier(receipt.proposalId, "INVALID_PASSPORT", "The passport preview proposal identifier is invalid"),
    proposalRevision: receipt.proposalRevision as number,
    baseRevision: revision(receipt.baseRevision, "INVALID_PASSPORT", "The passport preview base revision is invalid"),
    variantId: safeIdentifier(receipt.variantId, "INVALID_PASSPORT", "The passport preview variant identifier is invalid"),
    surfaceId: safeIdentifier(receipt.surfaceId, "INVALID_PASSPORT", "The passport preview surface identifier is invalid"),
    mediaType: receipt.mediaType as ConfigurationPassportPreviewReceipt["mediaType"],
    width: receipt.width as number,
    height: receipt.height as number,
    integrity: receipt.integrity,
  };
}

function sanitizePreviewReceipts(value: unknown): ConfigurationPassportPreviewReceipt[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_PREVIEW_RECEIPTS) {
    return fail("INVALID_PASSPORT", "The passport must contain a bounded non-empty preview receipt list");
  }
  const receipts = value.map(sanitizePreviewReceipt);
  if (new Set(receipts.map((receipt) => receipt.artifactId)).size !== receipts.length) return fail("INVALID_PASSPORT", "The passport contains duplicate preview artifacts");
  if (new Set(receipts.map((receipt) => `${receipt.variantId}\u0000${receipt.surfaceId}`)).size !== receipts.length) return fail("INVALID_PASSPORT", "The passport contains duplicate preview targets");
  if (new Set(receipts.map((receipt) => receipt.proposalId)).size !== 1 || new Set(receipts.map((receipt) => receipt.proposalRevision)).size !== 1 || new Set(receipts.map((receipt) => receipt.baseRevision)).size !== 1) {
    return fail("INVALID_PASSPORT", "The passport preview receipts do not belong to one exact proposal revision");
  }
  return receipts;
}

const PASSPORT_KEYS = [
  "passportVersion",
  "merchantOrigin",
  "configuratorId",
  "configurationId",
  "committedRevision",
  "manifestVersion",
  "rendererVersion",
  "configurationDigest",
  "passportIntegrity",
  "previewReceipts",
  "readiness",
  "safeSummary",
  "editUrl",
] as const;

function sanitizePassport(value: unknown): ConfigurationPassportV01 {
  const passport = strictRecord(value, PASSPORT_KEYS, "INVALID_PASSPORT", "The Configuration Passport does not match the public schema");
  if (passport.passportVersion !== CONFIGURATION_PASSPORT_VERSION) return fail("UNSUPPORTED_VERSION", "The Configuration Passport version is unsupported");
  const merchantOrigin = canonicalOrigin(passport.merchantOrigin);
  if (typeof passport.configurationDigest !== "string" || !SHA256_INTEGRITY.test(passport.configurationDigest)) {
    return fail("INVALID_PASSPORT", "The passport configuration digest is invalid");
  }
  if (typeof passport.passportIntegrity !== "string" || !SHA256_INTEGRITY.test(passport.passportIntegrity)) {
    return fail("INVALID_PASSPORT", "The passport integrity receipt is invalid");
  }
  const result: ConfigurationPassportV01 = {
    passportVersion: CONFIGURATION_PASSPORT_VERSION,
    merchantOrigin,
    configuratorId: safeIdentifier(passport.configuratorId, "INVALID_PASSPORT", "The passport configurator identifier is invalid"),
    configurationId: opaqueId(passport.configurationId, "configuration identifier"),
    committedRevision: revision(passport.committedRevision, "INVALID_PASSPORT", "The passport committed revision is invalid"),
    manifestVersion: version(passport.manifestVersion, "INVALID_PASSPORT", "The passport manifest version is invalid"),
    rendererVersion: version(passport.rendererVersion, "INVALID_PASSPORT", "The passport renderer version is invalid"),
    configurationDigest: passport.configurationDigest,
    passportIntegrity: passport.passportIntegrity,
    previewReceipts: sanitizePreviewReceipts(passport.previewReceipts),
    readiness: sanitizeReadiness(passport.readiness),
    safeSummary: safeSummary(passport.safeSummary),
    editUrl: merchantEditUrl(passport.editUrl, merchantOrigin),
  };
  if (new TextEncoder().encode(canonicalJson(result)).byteLength > MAX_PASSPORT_BYTES) {
    return fail("INVALID_PASSPORT", "The Configuration Passport exceeds the safe size limit");
  }
  return result;
}

export function validateConfigurationPassport(value: unknown): ConfigurationPassportV01 {
  return structuredClone(sanitizePassport(value));
}

function assertConfigurationBinding(passport: ConfigurationPassportV01, configuration: PublicSafeConfiguration): void {
  if (passport.configuratorId !== configuration.configuratorId || passport.manifestVersion !== configuration.manifestVersion || passport.committedRevision !== configuration.committedRevision) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "The public configuration does not match the passport identity and revision");
  }
  const variants = new Set(configuration.variants.map((variant) => variant.id));
  if (passport.previewReceipts.some((receipt) => !variants.has(receipt.variantId))) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "A passport preview references an unknown configuration variant");
  }
  const issueVariantIds = passport.readiness.issues.flatMap((issue) => issue.variantIds ?? []);
  if (issueVariantIds.some((variantId) => !variants.has(variantId))) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "A passport readiness issue references an unknown configuration variant");
  }
  const previewVariantIds = new Set(passport.previewReceipts.map((receipt) => receipt.variantId));
  if (configuration.variants.some((variant) => !previewVariantIds.has(variant.id))) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "The passport must contain a preview receipt for every committed variant");
  }
  if (passport.safeSummary.variantCount !== configuration.variants.length) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "The passport safe variant count does not match the committed configuration");
  }
  const expectedStatus = passport.readiness.productionReady ? "production-ready" : "saved-draft";
  if (passport.safeSummary.status !== expectedStatus) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "The passport safe readiness status does not match its readiness result");
  }
  const declaredItemCount = configuration.workspaceControls["order.total_quantity"];
  if (typeof declaredItemCount === "number" && passport.safeSummary.itemCount !== declaredItemCount) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "The passport safe item count does not match the declared configuration total");
  }
}

type CanonicalJsonValue = null | boolean | number | string | CanonicalJsonValue[] | { [key: string]: CanonicalJsonValue };

function canonicalValue(value: unknown): CanonicalJsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Canonical JSON cannot contain non-finite numbers");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!isRecord(value)) throw new TypeError("Canonical JSON requires plain JSON values");
  const result: { [key: string]: CanonicalJsonValue } = {};
  for (const key of Object.keys(value).sort()) result[key] = canonicalValue(value[key]);
  return result;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function canonicalizePublicSafeConfiguration(value: unknown): string {
  return canonicalJson(validatePublicSafeConfiguration(value));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function withoutIntegrity(passport: ConfigurationPassportV01): Omit<ConfigurationPassportV01, "passportIntegrity"> {
  const { passportIntegrity: _passportIntegrity, ...rest } = passport;
  return rest;
}

async function computeConfigurationDigest(configuration: PublicSafeConfiguration): Promise<string> {
  return sha256(canonicalJson(configuration));
}

async function computePassportIntegrity(passport: Omit<ConfigurationPassportV01, "passportIntegrity">): Promise<string> {
  return sha256(canonicalJson(passport));
}

function assertVerificationPolicy(passport: ConfigurationPassportV01, rawPolicy: ConfigurationPassportVerificationPolicy): ConfigurationPassportReadiness {
  const policy = strictRecord(rawPolicy, ["merchantOrigin", "configuratorId", "manifestVersion", "rendererVersion", "authoritativeReadiness"], "INVALID_PASSPORT", "The passport verification policy is invalid");
  const expectedOrigin = canonicalOrigin(policy.merchantOrigin);
  const expectedConfigurator = safeIdentifier(policy.configuratorId, "INVALID_PASSPORT", "The passport verification configurator is invalid");
  const expectedManifest = version(policy.manifestVersion, "INVALID_PASSPORT", "The passport verification manifest version is invalid");
  const expectedRenderer = version(policy.rendererVersion, "INVALID_PASSPORT", "The passport verification renderer version is invalid");
  const authoritativeReadiness = sanitizeReadiness(policy.authoritativeReadiness);
  if (passport.manifestVersion !== expectedManifest || passport.rendererVersion !== expectedRenderer) {
    return fail("UNSUPPORTED_VERSION", "The Configuration Passport manifest or renderer version is unsupported");
  }
  if (passport.merchantOrigin !== expectedOrigin || passport.configuratorId !== expectedConfigurator) {
    return fail("CONFIGURATION_BINDING_MISMATCH", "The Configuration Passport does not match the expected merchant configurator");
  }
  return authoritativeReadiness;
}

export async function createConfigurationPassport(input: CreateConfigurationPassportInput): Promise<ConfigurationPassportV01> {
  const draft = strictRecord(
    input,
    [...PASSPORT_KEYS.filter((key) => key !== "configurationDigest" && key !== "passportIntegrity"), "publicConfiguration"],
    "INVALID_PASSPORT",
    "The Configuration Passport input does not match the public schema",
  );
  const configuration = validatePublicSafeConfiguration(draft.publicConfiguration);
  const { publicConfiguration: _publicConfiguration, ...passportFields } = draft;
  const placeholder = sanitizePassport({
    ...passportFields,
    configurationDigest: `sha256:${"0".repeat(64)}`,
    passportIntegrity: `sha256:${"0".repeat(64)}`,
  });
  assertConfigurationBinding(placeholder, configuration);
  const configurationDigest = await computeConfigurationDigest(configuration);
  const passportWithoutIntegrity = { ...withoutIntegrity(placeholder), configurationDigest };
  const passportIntegrity = await computePassportIntegrity(passportWithoutIntegrity);
  return { ...passportWithoutIntegrity, passportIntegrity };
}

export async function verifyConfigurationPassport(
  value: unknown,
  publicConfiguration: unknown,
  policy: ConfigurationPassportVerificationPolicy,
): Promise<VerifiedConfigurationPassport> {
  const passport = sanitizePassport(value);
  const configuration = validatePublicSafeConfiguration(publicConfiguration);
  assertConfigurationBinding(passport, configuration);
  const authoritativeReadiness = assertVerificationPolicy(passport, policy);
  if (canonicalJson(passport.readiness) !== canonicalJson(authoritativeReadiness)) {
    return fail("READINESS_MISMATCH", "The Configuration Passport readiness does not match the merchant's current validation");
  }
  const expectedConfigurationDigest = await computeConfigurationDigest(configuration);
  if (expectedConfigurationDigest !== passport.configurationDigest) return fail("DIGEST_MISMATCH", "The Configuration Passport configuration digest did not match the public configuration");
  const expectedPassportIntegrity = await computePassportIntegrity(withoutIntegrity(passport));
  if (expectedPassportIntegrity !== passport.passportIntegrity) return fail("DIGEST_MISMATCH", "The Configuration Passport integrity did not match its receipts and public metadata");
  const verified = deepFreeze({
    passport: structuredClone(passport),
    readinessBinding: "merchant-authoritative-current" as const,
  }) as VerifiedConfigurationPassport;
  verifiedPassports.add(verified);
  return verified;
}

export function isVerifiedConfigurationPassport(value: unknown): value is VerifiedConfigurationPassport {
  return typeof value === "object" && value !== null && verifiedPassports.has(value);
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  return Object.freeze(value);
}
