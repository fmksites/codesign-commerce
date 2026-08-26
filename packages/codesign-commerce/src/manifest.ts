import type { ConfiguratorManifest, JsonPrimitive, OptionGroup } from "./types.js";

const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;
const UNSAFE_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

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

export function validateManifest(manifest: ConfiguratorManifest): ConfiguratorManifest {
  const issues: string[] = [];

  if (manifest.schemaVersion !== "1.0") issues.push("schemaVersion must be 1.0");
  if (!isSafeIdentifier(manifest.id)) issues.push("manifest id is unsafe or invalid");
  if (!manifest.version.trim()) issues.push("manifest version is required");
  if (!manifest.displayName.trim()) issues.push("displayName is required");
  if (!manifest.productType.trim()) issues.push("productType is required");
  if (!Number.isInteger(manifest.capabilities.maximumDesigns) || manifest.capabilities.maximumDesigns < 1 || manifest.capabilities.maximumDesigns > 20) {
    issues.push("maximumDesigns must be an integer between 1 and 20");
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
    if ((option.kind === "enum" || option.kind === "color") && (!option.values || option.values.length === 0)) {
      issues.push(`option ${option.id} requires values`);
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

  const dependencyIds = new Set<string>();
  for (const rule of manifest.dependencyRules) {
    if (!isSafeIdentifier(rule.id)) issues.push(`dependency id ${rule.id} is unsafe or invalid`);
    if (dependencyIds.has(rule.id)) issues.push(`duplicate dependency id ${rule.id}`);
    dependencyIds.add(rule.id);
    if (!rule.description.trim()) issues.push(`dependency ${rule.id} requires a description`);
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
