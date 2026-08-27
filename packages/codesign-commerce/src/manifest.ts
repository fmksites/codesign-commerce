import type {
  AssetMediaType,
  AssetSourceKind,
  ConfiguratorManifest,
  ControlDefinition,
  JsonPrimitive,
  VariantOperation,
} from "./types.js";

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;
const UNSAFE_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);
const CONTROL_SCOPES = new Set(["workspace", "variant", "element"]);
const CONTROL_KINDS = new Set(["enum", "color", "integer", "number", "boolean", "text", "asset", "position-2d", "scale", "rotation"]);
const CONTROL_ROLES = new Set(["selection", "variant-quantity", "variant-name", "workspace-total"]);
const CONTROL_REQUIREMENTS = new Set(["configuration", "production-readiness", "optional"]);
const ASSET_SOURCE_KINDS = new Set<AssetSourceKind>(["data-url", "https-url"]);
const ASSET_MEDIA_TYPES = new Set<AssetMediaType>(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const PREVIEW_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const VARIANT_OPERATIONS = new Set<VariantOperation>(["create", "duplicate", "remove", "reorder", "set-active"]);
const MAX_CONTROLS = 120;
const MAX_CONTROL_VALUES = 200;
const MAX_ASSET_SLOTS = 20;
const MAX_PREVIEW_SURFACES = 20;
const MAX_DEPENDENCIES = 100;

export class ManifestValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid configurator manifest: ${issues.join("; ")}`);
    this.name = "ManifestValidationError";
    this.issues = issues;
  }
}

export function isSafeIdentifier(value: string): boolean {
  return SAFE_ID.test(value) && !value.split(".").some((segment) => UNSAFE_SEGMENTS.has(segment));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function boundedString(value: unknown, maximum: number): boolean {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateControlStructure(value: unknown, index: number, issues: string[]): void {
  const path = `controls[${index}]`;
  if (!isRecord(value)) {
    issues.push(`${path} must be an object`);
    return;
  }
  if (!hasOnlyKeys(value, [
    "id", "label", "agentDescription", "scope", "kind", "role", "agentWritable", "requirement", "targetType",
    "values", "minimum", "maximum", "maximumLength", "xMinimum", "xMaximum", "yMinimum", "yMaximum",
    "assetSlotId", "availabilityGroupIds", "affectedPreviewRegion",
  ])) issues.push(`${path} contains unknown fields`);
  for (const field of ["id", "label", "agentDescription", "scope", "kind", "requirement"] as const) {
    if (typeof value[field] !== "string") issues.push(`${path}.${field} must be a string`);
  }
  if (value.role !== undefined && typeof value.role !== "string") issues.push(`${path}.role must be a string`);
  if (typeof value.agentWritable !== "boolean") issues.push(`${path}.agentWritable must be boolean`);
  for (const field of ["targetType", "assetSlotId", "affectedPreviewRegion"] as const) {
    if (value[field] !== undefined && typeof value[field] !== "string") issues.push(`${path}.${field} must be a string`);
  }
  for (const field of ["minimum", "maximum", "maximumLength", "xMinimum", "xMaximum", "yMinimum", "yMaximum"] as const) {
    if (value[field] !== undefined && typeof value[field] !== "number") issues.push(`${path}.${field} must be numeric`);
  }
  if (value.availabilityGroupIds !== undefined && (!Array.isArray(value.availabilityGroupIds)
    || value.availabilityGroupIds.length > 20
    || !value.availabilityGroupIds.every((entry) => typeof entry === "string"))) issues.push(`${path}.availabilityGroupIds must be a bounded string array`);
  if (value.values !== undefined) {
    if (!Array.isArray(value.values)) {
      issues.push(`${path}.values must be an array`);
    } else {
      if (value.values.length > MAX_CONTROL_VALUES) issues.push(`${path}.values contains too many entries`);
      for (const [choiceIndex, choice] of value.values.entries()) {
        if (!isRecord(choice)) {
          issues.push(`${path}.values[${choiceIndex}] must be an object`);
          continue;
        }
        if (!hasOnlyKeys(choice, ["id", "label", "description"])) issues.push(`${path}.values[${choiceIndex}] contains unknown fields`);
        if (typeof choice.id !== "string") issues.push(`${path}.values[${choiceIndex}].id must be a string`);
        if (typeof choice.label !== "string") issues.push(`${path}.values[${choiceIndex}].label must be a string`);
        if (choice.description !== undefined && typeof choice.description !== "string") issues.push(`${path}.values[${choiceIndex}].description must be a string`);
      }
    }
  }
}

function validateManifestStructure(input: unknown): string[] {
  if (!isRecord(input)) return ["manifest must be a plain object"];
  const issues: string[] = [];
  if (!hasOnlyKeys(input, [
    "schemaVersion", "id", "version", "displayName", "productType", "controls", "assetSlots",
    "variantPolicy", "previewSurfaces", "dependencyDescriptions", "approval",
  ])) issues.push("manifest contains unknown top-level fields");
  for (const field of ["schemaVersion", "id", "version", "displayName", "productType"] as const) {
    if (typeof input[field] !== "string") issues.push(`${field} must be a string`);
  }

  if (!Array.isArray(input.controls)) {
    issues.push("controls must be an array");
  } else {
    if (input.controls.length < 1 || input.controls.length > MAX_CONTROLS) issues.push(`controls must contain between 1 and ${MAX_CONTROLS} entries`);
    input.controls.forEach((control, index) => validateControlStructure(control, index, issues));
  }

  if (!Array.isArray(input.assetSlots)) {
    issues.push("assetSlots must be an array");
  } else {
    if (input.assetSlots.length > MAX_ASSET_SLOTS) issues.push(`assetSlots must contain at most ${MAX_ASSET_SLOTS} entries`);
    for (const [index, slot] of input.assetSlots.entries()) {
      const path = `assetSlots[${index}]`;
      if (!isRecord(slot)) {
        issues.push(`${path} must be an object`);
        continue;
      }
      if (!hasOnlyKeys(slot, ["id", "label", "agentDescription", "scope", "sourceKinds", "mediaTypes", "maximumSourceCharacters", "maximumBytes"])) issues.push(`${path} contains unknown fields`);
      for (const field of ["id", "label", "agentDescription", "scope"] as const) if (typeof slot[field] !== "string") issues.push(`${path}.${field} must be a string`);
      if (!Array.isArray(slot.sourceKinds) || !slot.sourceKinds.every((entry) => typeof entry === "string")) issues.push(`${path}.sourceKinds must be an array`);
      if (!Array.isArray(slot.mediaTypes) || !slot.mediaTypes.every((entry) => typeof entry === "string")) issues.push(`${path}.mediaTypes must be an array`);
      for (const field of ["maximumSourceCharacters", "maximumBytes"] as const) if (typeof slot[field] !== "number") issues.push(`${path}.${field} must be numeric`);
    }
  }

  if (!isRecord(input.variantPolicy)) {
    issues.push("variantPolicy must be an object");
  } else {
    if (!hasOnlyKeys(input.variantPolicy, ["minimumVariants", "maximumVariants", "operations"])) issues.push("variantPolicy contains unknown fields");
    if (!Number.isInteger(input.variantPolicy.minimumVariants)) issues.push("variantPolicy.minimumVariants must be an integer");
    if (!Number.isInteger(input.variantPolicy.maximumVariants)) issues.push("variantPolicy.maximumVariants must be an integer");
    if (!Array.isArray(input.variantPolicy.operations) || !input.variantPolicy.operations.every((entry) => typeof entry === "string")) issues.push("variantPolicy.operations must be an array");
  }

  if (!Array.isArray(input.previewSurfaces)) {
    issues.push("previewSurfaces must be an array");
  } else {
    if (input.previewSurfaces.length < 1 || input.previewSurfaces.length > MAX_PREVIEW_SURFACES) issues.push(`previewSurfaces must contain between 1 and ${MAX_PREVIEW_SURFACES} entries`);
    for (const [index, surface] of input.previewSurfaces.entries()) {
      const path = `previewSurfaces[${index}]`;
      if (!isRecord(surface)) {
        issues.push(`${path} must be an object`);
        continue;
      }
      if (!hasOnlyKeys(surface, ["id", "label", "scope", "mediaTypes", "maximumBytes"])) issues.push(`${path} contains unknown fields`);
      for (const field of ["id", "label", "scope"] as const) if (typeof surface[field] !== "string") issues.push(`${path}.${field} must be a string`);
      if (!Array.isArray(surface.mediaTypes) || !surface.mediaTypes.every((entry) => typeof entry === "string")) issues.push(`${path}.mediaTypes must be an array`);
      if (typeof surface.maximumBytes !== "number") issues.push(`${path}.maximumBytes must be numeric`);
    }
  }

  if (!Array.isArray(input.dependencyDescriptions)) {
    issues.push("dependencyDescriptions must be an array");
  } else {
    if (input.dependencyDescriptions.length > MAX_DEPENDENCIES) issues.push(`dependencyDescriptions must contain at most ${MAX_DEPENDENCIES} entries`);
    for (const [index, dependency] of input.dependencyDescriptions.entries()) {
      const path = `dependencyDescriptions[${index}]`;
      if (!isRecord(dependency)) {
        issues.push(`${path} must be an object`);
        continue;
      }
      if (!hasOnlyKeys(dependency, ["id", "description", "controlIds"])) issues.push(`${path} contains unknown fields`);
      if (typeof dependency.id !== "string") issues.push(`${path}.id must be a string`);
      if (typeof dependency.description !== "string") issues.push(`${path}.description must be a string`);
      if (!Array.isArray(dependency.controlIds) || dependency.controlIds.length < 1 || dependency.controlIds.length > 30 || !dependency.controlIds.every((entry) => typeof entry === "string")) issues.push(`${path}.controlIds must contain between 1 and 30 string control IDs`);
    }
  }

  if (!isRecord(input.approval)) {
    issues.push("approval must be an object");
  } else {
    if (!hasOnlyKeys(input.approval, ["mode", "persistencePath"])) issues.push("approval contains unknown fields");
    if (typeof input.approval.mode !== "string") issues.push("approval.mode must be a string");
    if (typeof input.approval.persistencePath !== "string") issues.push("approval.persistencePath must be a string");
  }
  return issues;
}

function validateControl(control: ControlDefinition, assetSlots: ReadonlyMap<string, { scope: string }>, issues: string[]): void {
  if (!isSafeIdentifier(control.id)) issues.push(`control id ${control.id} is unsafe or invalid`);
  if (!boundedString(control.label, 120)) issues.push(`control ${control.id} requires a bounded label`);
  if (!boundedString(control.agentDescription, 500)) issues.push(`control ${control.id} requires a bounded agent description`);
  if (!CONTROL_SCOPES.has(control.scope)) issues.push(`control ${control.id} has invalid scope`);
  if (!CONTROL_KINDS.has(control.kind)) issues.push(`control ${control.id} has invalid kind`);
  if (control.role !== undefined && !CONTROL_ROLES.has(control.role)) issues.push(`control ${control.id} has invalid role`);
  if (!CONTROL_REQUIREMENTS.has(control.requirement)) issues.push(`control ${control.id} has invalid requirement`);
  if (control.targetType !== undefined && !isSafeIdentifier(control.targetType)) issues.push(`control ${control.id} has invalid targetType`);
  if (control.scope === "element" && control.targetType === undefined) issues.push(`element control ${control.id} requires targetType`);
  if (control.scope !== "element" && control.targetType !== undefined) issues.push(`non-element control ${control.id} cannot declare targetType`);
  if (control.affectedPreviewRegion !== undefined && !boundedString(control.affectedPreviewRegion, 200)) issues.push(`control ${control.id} has invalid preview-region label`);

  const availabilityIds = new Set<string>();
  for (const groupId of control.availabilityGroupIds ?? []) {
    if (!isSafeIdentifier(groupId)) issues.push(`control ${control.id} has invalid availability group ${groupId}`);
    if (availabilityIds.has(groupId)) issues.push(`control ${control.id} repeats availability group ${groupId}`);
    availabilityIds.add(groupId);
  }

  const valueIds = new Set<string>();
  for (const value of control.values ?? []) {
    if (!isSafeIdentifier(value.id)) issues.push(`value id ${value.id} for ${control.id} is unsafe or invalid`);
    if (valueIds.has(value.id)) issues.push(`duplicate value ${value.id} for ${control.id}`);
    valueIds.add(value.id);
    if (!boundedString(value.label, 120)) issues.push(`value ${value.id} for ${control.id} requires a bounded label`);
    if (value.description !== undefined && !boundedString(value.description, 300)) issues.push(`value ${value.id} for ${control.id} has an invalid description`);
  }

  const numericFields = [control.minimum, control.maximum, control.xMinimum, control.xMaximum, control.yMinimum, control.yMaximum];
  if (numericFields.some((value) => value !== undefined && !finiteNumber(value))) issues.push(`control ${control.id} requires finite numeric bounds`);
  if (control.minimum !== undefined && control.maximum !== undefined && control.minimum > control.maximum) issues.push(`control ${control.id} minimum exceeds maximum`);

  if (control.role === "variant-quantity" && (control.scope !== "variant" || control.kind !== "integer")) issues.push(`variant-quantity control ${control.id} must be a variant-scoped integer`);
  if (control.role === "variant-name" && (control.scope !== "variant" || control.kind !== "text")) issues.push(`variant-name control ${control.id} must be variant-scoped text`);
  if (control.role === "workspace-total" && (control.scope !== "workspace" || control.kind !== "integer")) issues.push(`workspace-total control ${control.id} must be a workspace-scoped integer`);

  if (control.kind === "enum" || control.kind === "color") {
    if (!control.values?.length) issues.push(`control ${control.id} requires values`);
    if ([control.minimum, control.maximum, control.maximumLength, control.xMinimum, control.xMaximum, control.yMinimum, control.yMaximum, control.assetSlotId].some((value) => value !== undefined)) issues.push(`control ${control.id} has incompatible bounds or asset slot`);
  } else if (control.values !== undefined) {
    issues.push(`control ${control.id} cannot declare values for kind ${control.kind}`);
  }

  if (control.kind === "integer" && ((control.minimum !== undefined && !Number.isInteger(control.minimum)) || (control.maximum !== undefined && !Number.isInteger(control.maximum)) || control.maximumLength !== undefined)) issues.push(`integer control ${control.id} requires integer bounds`);
  if (["number", "scale", "rotation"].includes(control.kind) && control.maximumLength !== undefined) issues.push(`numeric control ${control.id} cannot declare maximumLength`);
  if (control.kind === "scale" && control.minimum !== undefined && control.minimum < 0) issues.push(`scale control ${control.id} cannot have a negative minimum`);
  if (control.kind === "text" && (control.minimum !== undefined || control.maximum !== undefined || control.assetSlotId !== undefined)) issues.push(`text control ${control.id} has incompatible bounds or asset slot`);
  if (control.kind === "text" && (control.maximumLength === undefined || !Number.isInteger(control.maximumLength) || control.maximumLength < 1 || control.maximumLength > 1000)) issues.push(`text control ${control.id} requires maximumLength between 1 and 1000`);
  if (control.kind === "boolean" && [control.minimum, control.maximum, control.maximumLength, control.assetSlotId].some((value) => value !== undefined)) issues.push(`boolean control ${control.id} has incompatible fields`);
  if (control.kind === "asset") {
    if (!control.assetSlotId || !assetSlots.has(control.assetSlotId)) issues.push(`asset control ${control.id} requires a declared asset slot`);
    else if (assetSlots.get(control.assetSlotId)?.scope !== control.scope) issues.push(`asset control ${control.id} scope must match its asset slot`);
    if (!control.agentWritable) issues.push(`asset control ${control.id} must be agent-writable`);
  } else if (control.assetSlotId !== undefined) {
    issues.push(`non-asset control ${control.id} cannot declare an asset slot`);
  }
  if (control.kind === "position-2d") {
    if (![control.xMinimum, control.xMaximum, control.yMinimum, control.yMaximum].every(finiteNumber)) issues.push(`position-2d control ${control.id} requires finite x/y bounds`);
    if (finiteNumber(control.xMinimum) && finiteNumber(control.xMaximum) && control.xMinimum > control.xMaximum) issues.push(`position-2d control ${control.id} x minimum exceeds maximum`);
    if (finiteNumber(control.yMinimum) && finiteNumber(control.yMaximum) && control.yMinimum > control.yMaximum) issues.push(`position-2d control ${control.id} y minimum exceeds maximum`);
  } else if ([control.xMinimum, control.xMaximum, control.yMinimum, control.yMaximum].some((value) => value !== undefined)) {
    issues.push(`non-position control ${control.id} cannot declare x/y bounds`);
  }
}

export function validateManifest(input: unknown): ConfiguratorManifest {
  const structureIssues = validateManifestStructure(input);
  if (structureIssues.length > 0) throw new ManifestValidationError(structureIssues);
  const manifest = input as ConfiguratorManifest;
  const issues: string[] = [];

  if (manifest.schemaVersion !== "2.0") issues.push("schemaVersion must be 2.0");
  if (!isSafeIdentifier(manifest.id)) issues.push("manifest id is unsafe or invalid");
  if (!boundedString(manifest.version, 80)) issues.push("manifest version is required and bounded");
  if (!boundedString(manifest.displayName, 120)) issues.push("displayName is required and bounded");
  if (!boundedString(manifest.productType, 120)) issues.push("productType is required and bounded");

  const assetSlotIds = new Set<string>();
  const assetSlots = new Map<string, { scope: string }>();
  for (const slot of manifest.assetSlots) {
    if (!isSafeIdentifier(slot.id)) issues.push(`asset slot id ${slot.id} is unsafe or invalid`);
    if (assetSlotIds.has(slot.id)) issues.push(`duplicate asset slot ${slot.id}`);
    assetSlotIds.add(slot.id);
    assetSlots.set(slot.id, { scope: slot.scope });
    if (!boundedString(slot.label, 120) || !boundedString(slot.agentDescription, 500)) issues.push(`asset slot ${slot.id} requires bounded labels`);
    if (!CONTROL_SCOPES.has(slot.scope)) issues.push(`asset slot ${slot.id} has invalid scope`);
    if (slot.sourceKinds.length < 1 || new Set(slot.sourceKinds).size !== slot.sourceKinds.length || slot.sourceKinds.some((kind) => !ASSET_SOURCE_KINDS.has(kind))) issues.push(`asset slot ${slot.id} has invalid source kinds`);
    if (slot.mediaTypes.length < 1 || new Set(slot.mediaTypes).size !== slot.mediaTypes.length || slot.mediaTypes.some((type) => !ASSET_MEDIA_TYPES.has(type))) issues.push(`asset slot ${slot.id} has invalid media types`);
    if (!Number.isInteger(slot.maximumSourceCharacters) || slot.maximumSourceCharacters < 32 || slot.maximumSourceCharacters > 5_000_000) issues.push(`asset slot ${slot.id} has invalid source-character limit`);
    if (!Number.isInteger(slot.maximumBytes) || slot.maximumBytes < 1 || slot.maximumBytes > 5_000_000) issues.push(`asset slot ${slot.id} has invalid byte limit`);
  }

  const controlIds = new Set<string>();
  for (const control of manifest.controls) {
    if (controlIds.has(control.id)) issues.push(`duplicate control id ${control.id}`);
    controlIds.add(control.id);
    validateControl(control, assetSlots, issues);
  }
  if (manifest.controls.filter((control) => control.role === "workspace-total").length !== 1) issues.push("manifest requires exactly one workspace-total control");
  if (manifest.controls.filter((control) => control.role === "variant-quantity").length !== 1) issues.push("manifest requires exactly one variant-quantity control");
  if (manifest.controls.filter((control) => control.role === "variant-name").length > 1) issues.push("manifest permits at most one variant-name control");

  const { minimumVariants, maximumVariants, operations } = manifest.variantPolicy;
  if (!Number.isInteger(minimumVariants) || minimumVariants < 1 || minimumVariants > 20) issues.push("minimumVariants must be an integer between 1 and 20");
  if (!Number.isInteger(maximumVariants) || maximumVariants < minimumVariants || maximumVariants > 20) issues.push("maximumVariants must be between minimumVariants and 20");
  if (operations.length > VARIANT_OPERATIONS.size || new Set(operations).size !== operations.length || operations.some((operation) => !VARIANT_OPERATIONS.has(operation))) issues.push("variantPolicy.operations contains invalid or duplicate operations");
  if (maximumVariants === 1 && operations.some((operation) => operation === "create" || operation === "duplicate")) issues.push("single-variant manifests cannot create or duplicate variants");
  if (minimumVariants === maximumVariants && operations.includes("remove")) issues.push("fixed-count manifests cannot remove variants");

  const previewIds = new Set<string>();
  for (const surface of manifest.previewSurfaces) {
    if (!isSafeIdentifier(surface.id)) issues.push(`preview surface id ${surface.id} is unsafe or invalid`);
    if (previewIds.has(surface.id)) issues.push(`duplicate preview surface ${surface.id}`);
    previewIds.add(surface.id);
    if (!boundedString(surface.label, 120)) issues.push(`preview surface ${surface.id} requires a bounded label`);
    if (surface.scope !== "workspace" && surface.scope !== "variant") issues.push(`preview surface ${surface.id} has invalid scope`);
    if (surface.mediaTypes.length < 1 || new Set(surface.mediaTypes).size !== surface.mediaTypes.length || surface.mediaTypes.some((type) => !PREVIEW_MEDIA_TYPES.has(type))) issues.push(`preview surface ${surface.id} has invalid media types`);
    if (!Number.isInteger(surface.maximumBytes) || surface.maximumBytes < 1 || surface.maximumBytes > 5_000_000) issues.push(`preview surface ${surface.id} has invalid byte limit`);
  }

  const dependencyIds = new Set<string>();
  for (const dependency of manifest.dependencyDescriptions) {
    if (!isSafeIdentifier(dependency.id)) issues.push(`dependency id ${dependency.id} is unsafe or invalid`);
    if (dependencyIds.has(dependency.id)) issues.push(`duplicate dependency id ${dependency.id}`);
    dependencyIds.add(dependency.id);
    if (!boundedString(dependency.description, 500)) issues.push(`dependency ${dependency.id} requires a bounded description`);
    const references = new Set<string>();
    for (const controlId of dependency.controlIds) {
      if (references.has(controlId)) issues.push(`dependency ${dependency.id} repeats control ${controlId}`);
      references.add(controlId);
      if (!controlIds.has(controlId)) issues.push(`dependency ${dependency.id} references unknown control ${controlId}`);
    }
  }

  if (manifest.approval.mode !== "explicit-human") issues.push("approval mode must be explicit-human");
  if (manifest.approval.persistencePath !== "page-keep-controller") issues.push("persistencePath must be page-keep-controller");

  if (issues.length > 0) throw new ManifestValidationError(issues);
  return structuredClone(manifest);
}

export function validateOptionValue(control: ControlDefinition, value: JsonPrimitive): string | null {
  if (!control.agentWritable) return `Control ${control.id} is not agent-writable`;

  switch (control.kind) {
    case "enum":
    case "color":
      if (typeof value !== "string" || !control.values?.some((entry) => entry.id === value)) return `Value is not allowed for ${control.id}`;
      break;
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value)) return `Value for ${control.id} must be an integer`;
      if (control.minimum !== undefined && value < control.minimum) return `Value for ${control.id} is below the minimum`;
      if (control.maximum !== undefined && value > control.maximum) return `Value for ${control.id} exceeds the maximum`;
      break;
    case "number":
    case "scale":
    case "rotation":
      if (typeof value !== "number" || !Number.isFinite(value)) return `Value for ${control.id} must be a finite number`;
      if (control.minimum !== undefined && value < control.minimum) return `Value for ${control.id} is below the minimum`;
      if (control.maximum !== undefined && value > control.maximum) return `Value for ${control.id} exceeds the maximum`;
      break;
    case "boolean":
      if (typeof value !== "boolean") return `Value for ${control.id} must be boolean`;
      break;
    case "text":
      if (typeof value !== "string") return `Value for ${control.id} must be text`;
      if (control.maximumLength !== undefined && value.length > control.maximumLength) return `Value for ${control.id} is too long`;
      if (/(?:^|[\s("'=])(?:https?:\/\/|ftp:\/\/|file:\/\/|data:|javascript:|blob:|\/\/[a-z0-9.-]+\.[a-z]{2,}(?:[\/:?#]|$)|www\.)/iu.test(value)) return `External references are not allowed for ${control.id}`;
      break;
    case "asset":
      if (typeof value !== "string" || !isSafeIdentifier(value)) return `Value for ${control.id} must be an opaque asset handle`;
      break;
    case "position-2d":
      return `Control ${control.id} requires a typed position operation`;
  }
  return null;
}
