import type { ConfiguratorManifest, JsonPrimitive, OptionGroup } from "./types.js";

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;
const UNSAFE_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);
const OPTION_SCOPES = new Set(["order", "design"]);
const OPTION_KINDS = new Set(["enum", "color", "integer", "boolean", "text", "asset-status"]);
const OPTION_ROLES = new Set(["selection", "design-quantity", "design-name", "order-total"]);
const MAX_OPTION_GROUPS = 100;
const MAX_OPTION_VALUES = 200;
const MAX_DEPENDENCY_RULES = 100;

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

function validateManifestStructure(input: unknown): string[] {
  if (!isRecord(input)) return ["manifest must be a plain object"];
  const issues: string[] = [];
  if (!hasOnlyKeys(input, ["schemaVersion", "id", "version", "displayName", "productType", "capabilities", "optionGroups", "dependencyRules", "approval"])) {
    issues.push("manifest contains unknown top-level fields");
  }
  for (const field of ["schemaVersion", "id", "version", "displayName", "productType"] as const) {
    if (typeof input[field] !== "string") issues.push(`${field} must be a string`);
  }

  if (!isRecord(input.capabilities)) {
    issues.push("capabilities must be an object");
  } else {
    if (!hasOnlyKeys(input.capabilities, ["multipleDesigns", "maximumDesigns", "cloning"])) issues.push("capabilities contains unknown fields");
    if (typeof input.capabilities.multipleDesigns !== "boolean") issues.push("capabilities.multipleDesigns must be boolean");
    if (!Number.isInteger(input.capabilities.maximumDesigns)) issues.push("capabilities.maximumDesigns must be an integer");
    if (typeof input.capabilities.cloning !== "boolean") issues.push("capabilities.cloning must be boolean");
  }

  if (!Array.isArray(input.optionGroups)) {
    issues.push("optionGroups must be an array");
  } else {
    if (input.optionGroups.length < 1 || input.optionGroups.length > MAX_OPTION_GROUPS) {
      issues.push(`optionGroups must contain between 1 and ${MAX_OPTION_GROUPS} entries`);
    }
    for (const [index, value] of input.optionGroups.entries()) {
      if (!isRecord(value)) {
        issues.push(`optionGroups[${index}] must be an object`);
        continue;
      }
      if (!hasOnlyKeys(value, ["id", "label", "agentDescription", "scope", "kind", "role", "agentWritable", "values", "minimum", "maximum", "maximumLength", "affectedPreviewRegion"])) {
        issues.push(`optionGroups[${index}] contains unknown fields`);
      }
      if (typeof value.id !== "string") issues.push(`optionGroups[${index}].id must be a string`);
      if (typeof value.label !== "string") issues.push(`optionGroups[${index}].label must be a string`);
      if (typeof value.agentDescription !== "string") issues.push(`optionGroups[${index}].agentDescription must be a string`);
      if (typeof value.scope !== "string" || !OPTION_SCOPES.has(value.scope)) issues.push(`optionGroups[${index}].scope is invalid`);
      if (typeof value.kind !== "string" || !OPTION_KINDS.has(value.kind)) issues.push(`optionGroups[${index}].kind is invalid`);
      if (value.role !== undefined && (typeof value.role !== "string" || !OPTION_ROLES.has(value.role))) issues.push(`optionGroups[${index}].role is invalid`);
      if (typeof value.agentWritable !== "boolean") issues.push(`optionGroups[${index}].agentWritable must be boolean`);
      for (const field of ["minimum", "maximum", "maximumLength"] as const) {
        if (value[field] !== undefined && typeof value[field] !== "number") issues.push(`optionGroups[${index}].${field} must be numeric`);
      }
      if (value.affectedPreviewRegion !== undefined && typeof value.affectedPreviewRegion !== "string") {
        issues.push(`optionGroups[${index}].affectedPreviewRegion must be a string`);
      }
      if (value.values !== undefined) {
        if (!Array.isArray(value.values)) {
          issues.push(`optionGroups[${index}].values must be an array`);
        } else {
          if (value.values.length > MAX_OPTION_VALUES) issues.push(`optionGroups[${index}].values contains too many entries`);
          for (const [valueIndex, optionValue] of value.values.entries()) {
            if (!isRecord(optionValue)) {
              issues.push(`optionGroups[${index}].values[${valueIndex}] must be an object`);
              continue;
            }
            if (!hasOnlyKeys(optionValue, ["id", "label", "description"])) issues.push(`optionGroups[${index}].values[${valueIndex}] contains unknown fields`);
            if (typeof optionValue.id !== "string") issues.push(`optionGroups[${index}].values[${valueIndex}].id must be a string`);
            if (typeof optionValue.label !== "string") issues.push(`optionGroups[${index}].values[${valueIndex}].label must be a string`);
            if (optionValue.description !== undefined && typeof optionValue.description !== "string") issues.push(`optionGroups[${index}].values[${valueIndex}].description must be a string`);
          }
        }
      }
    }
  }

  if (!Array.isArray(input.dependencyRules)) {
    issues.push("dependencyRules must be an array");
  } else {
    if (input.dependencyRules.length > MAX_DEPENDENCY_RULES) issues.push("dependencyRules contains too many entries");
    for (const [index, rule] of input.dependencyRules.entries()) {
      if (!isRecord(rule)) {
        issues.push(`dependencyRules[${index}] must be an object`);
        continue;
      }
      if (!hasOnlyKeys(rule, ["id", "description", "optionIds"])) issues.push(`dependencyRules[${index}] contains unknown fields`);
      if (typeof rule.id !== "string") issues.push(`dependencyRules[${index}].id must be a string`);
      if (typeof rule.description !== "string") issues.push(`dependencyRules[${index}].description must be a string`);
      if (!Array.isArray(rule.optionIds) || rule.optionIds.length < 1 || rule.optionIds.length > 30 || !rule.optionIds.every((entry) => typeof entry === "string")) {
        issues.push(`dependencyRules[${index}].optionIds must contain between 1 and 30 string option IDs`);
      }
    }
  }

  if (!isRecord(input.approval)) {
    issues.push("approval must be an object");
  } else {
    if (!hasOnlyKeys(input.approval, ["mode", "persistence"])) issues.push("approval contains unknown fields");
    if (typeof input.approval.mode !== "string") issues.push("approval.mode must be a string");
    if (typeof input.approval.persistence !== "string") issues.push("approval.persistence must be a string");
  }
  return issues;
}

export function validateManifest(input: unknown): ConfiguratorManifest {
  const structureIssues = validateManifestStructure(input);
  if (structureIssues.length > 0) throw new ManifestValidationError(structureIssues);
  const manifest = input as ConfiguratorManifest;
  const issues: string[] = [];

  if (manifest.schemaVersion !== "1.0") issues.push("schemaVersion must be 1.0");
  if (!isSafeIdentifier(manifest.id)) issues.push("manifest id is unsafe or invalid");
  if (!manifest.version.trim()) issues.push("manifest version is required");
  if (!manifest.displayName.trim()) issues.push("displayName is required");
  if (!manifest.productType.trim()) issues.push("productType is required");
  if (!Number.isInteger(manifest.capabilities.maximumDesigns) || manifest.capabilities.maximumDesigns < 1 || manifest.capabilities.maximumDesigns > 20) {
    issues.push("maximumDesigns must be an integer between 1 and 20");
  }
  if (!manifest.capabilities.multipleDesigns && manifest.capabilities.maximumDesigns !== 1) {
    issues.push("maximumDesigns must be 1 when multipleDesigns is false");
  }
  if (!manifest.capabilities.multipleDesigns && manifest.capabilities.cloning) {
    issues.push("cloning requires multipleDesigns");
  }
  if (manifest.approval.mode !== "explicit-human") issues.push("approval mode must be explicit-human");
  if (manifest.approval.persistence !== "keep-only") issues.push("persistence must be keep-only");

  const optionIds = new Set<string>();
  for (const option of manifest.optionGroups) {
    if (!isSafeIdentifier(option.id)) issues.push(`option id ${option.id} is unsafe or invalid`);
    if (optionIds.has(option.id)) issues.push(`duplicate option id ${option.id}`);
    optionIds.add(option.id);
    if (!option.label.trim()) issues.push(`option ${option.id} requires a label`);
    if (!option.agentDescription.trim()) issues.push(`option ${option.id} requires an agent description`);
    if (option.kind === "asset-status" && option.agentWritable) issues.push(`asset-status option ${option.id} cannot be agent-writable`);
    if (option.role === "design-quantity" && (option.scope !== "design" || option.kind !== "integer")) {
      issues.push(`design-quantity option ${option.id} must be a design-scoped integer`);
    }
    if (option.role === "design-name" && (option.scope !== "design" || option.kind !== "text")) {
      issues.push(`design-name option ${option.id} must be design-scoped text`);
    }
    if (option.role === "order-total" && (option.scope !== "order" || option.kind !== "integer")) {
      issues.push(`order-total option ${option.id} must be an order-scoped integer`);
    }
    if (option.scope === "order" && option.agentWritable && option.role !== "order-total") {
      issues.push(`writable order option ${option.id} requires the order-total canonical role`);
    }
    if ((option.kind === "enum" || option.kind === "color") && (!option.values || option.values.length === 0)) {
      issues.push(`option ${option.id} requires values`);
    }
    if ((option.kind === "enum" || option.kind === "color") && (option.minimum !== undefined || option.maximum !== undefined || option.maximumLength !== undefined)) {
      issues.push(`option ${option.id} has incompatible bounds`);
    }
    if (option.kind === "integer" && (
      (option.minimum !== undefined && (!Number.isFinite(option.minimum) || !Number.isInteger(option.minimum)))
      || (option.maximum !== undefined && (!Number.isFinite(option.maximum) || !Number.isInteger(option.maximum)))
      || option.maximumLength !== undefined
    )) {
      issues.push(`integer option ${option.id} requires finite integer bounds`);
    }
    if (option.kind === "text" && (option.minimum !== undefined || option.maximum !== undefined)) {
      issues.push(`text option ${option.id} has incompatible numeric bounds`);
    }
    const valueIds = new Set<string>();
    for (const value of option.values ?? []) {
      if (!isSafeIdentifier(value.id)) issues.push(`value id ${value.id} for ${option.id} is unsafe or invalid`);
      if (valueIds.has(value.id)) issues.push(`duplicate value ${value.id} for ${option.id}`);
      valueIds.add(value.id);
    }
    if (option.minimum !== undefined && option.maximum !== undefined && option.minimum > option.maximum) {
      issues.push(`option ${option.id} minimum exceeds maximum`);
    }
    if (option.maximumLength !== undefined && (!Number.isInteger(option.maximumLength) || option.maximumLength < 1 || option.maximumLength > 1000)) {
      issues.push(`option ${option.id} maximumLength must be between 1 and 1000`);
    }
  }

  const orderTotals = manifest.optionGroups.filter((option) => option.role === "order-total");
  if (orderTotals.length !== 1) issues.push("manifest requires exactly one order-total option");
  const designQuantities = manifest.optionGroups.filter((option) => option.role === "design-quantity");
  if (designQuantities.length !== 1) issues.push("manifest requires exactly one design-quantity option");

  const dependencyIds = new Set<string>();
  for (const rule of manifest.dependencyRules) {
    if (!isSafeIdentifier(rule.id)) issues.push(`dependency id ${rule.id} is unsafe or invalid`);
    if (dependencyIds.has(rule.id)) issues.push(`duplicate dependency id ${rule.id}`);
    dependencyIds.add(rule.id);
    if (!rule.description.trim()) issues.push(`dependency ${rule.id} requires a description`);
    const references = new Set<string>();
    for (const optionId of rule.optionIds) {
      if (references.has(optionId)) issues.push(`dependency ${rule.id} repeats option ${optionId}`);
      references.add(optionId);
      if (!optionIds.has(optionId)) issues.push(`dependency ${rule.id} references unknown option ${optionId}`);
    }
  }

  if (issues.length > 0) throw new ManifestValidationError(issues);
  return manifest;
}

export function validateOptionValue(option: OptionGroup, value: JsonPrimitive): string | null {
  if (!option.agentWritable) return `Option ${option.id} is not agent-writable`;

  switch (option.kind) {
    case "enum":
    case "color":
      if (typeof value !== "string" || !option.values?.some((entry) => entry.id === value)) {
        return `Value is not allowed for ${option.id}`;
      }
      break;
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value)) return `Value for ${option.id} must be an integer`;
      if (option.minimum !== undefined && value < option.minimum) return `Value for ${option.id} is below the minimum`;
      if (option.maximum !== undefined && value > option.maximum) return `Value for ${option.id} exceeds the maximum`;
      break;
    case "boolean":
      if (typeof value !== "boolean") return `Value for ${option.id} must be boolean`;
      break;
    case "text":
      if (typeof value !== "string") return `Value for ${option.id} must be text`;
      if (option.maximumLength !== undefined && value.length > option.maximumLength) return `Value for ${option.id} is too long`;
      break;
    case "asset-status":
      return `Option ${option.id} is read-only`;
  }

  return null;
}
