import { isSafeIdentifier } from "./manifest.js";
import type { ConfiguratorManifest, VariantOperation } from "./types.js";

export type HumanControlKind = "button" | "input" | "select" | "checkbox" | "tablist" | "file-input";
export type ExclusionCategory = "navigation" | "commercial" | "administrative" | "non-configurational" | "human-confirmation" | "development-only";

export type HumanControlMapping =
  | { kind: "control"; controlId: string }
  | { kind: "variant-operation"; operation: VariantOperation }
  | { kind: "asset-slot"; slotId: string }
  | { kind: "excluded"; category: ExclusionCategory; reason: string };

export interface HumanControlInventoryEntry {
  id: string;
  label: string;
  selector: string;
  kind: HumanControlKind;
  mapping: HumanControlMapping;
}

export interface HumanControlInventory {
  schemaVersion: "1.0";
  integrationId: string;
  manifestId: string;
  inventoryVersion: string;
  auditedAt: string;
  controls: HumanControlInventoryEntry[];
}

export interface ControlParityReport {
  integrationId: string;
  manifestId: string;
  mappedControls: number;
  mappedVariantOperations: number;
  mappedAssetSlots: number;
  excludedControls: number;
  totalHumanControls: number;
}

const HUMAN_KINDS = new Set<HumanControlKind>(["button", "input", "select", "checkbox", "tablist", "file-input"]);
const EXCLUSION_CATEGORIES = new Set<ExclusionCategory>(["navigation", "commercial", "administrative", "non-configurational", "human-confirmation", "development-only"]);
const MAPPING_KINDS = new Set(["control", "variant-operation", "asset-slot", "excluded"]);
const MAX_CONTROLS = 250;

export class HumanControlInventoryError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid human-control inventory: ${issues.join("; ")}`);
    this.name = "HumanControlInventoryError";
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function boundedString(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}

export function validateHumanControlInventory(
  input: unknown,
  manifest: ConfiguratorManifest,
): { inventory: HumanControlInventory; report: ControlParityReport } {
  const issues: string[] = [];
  if (!isRecord(input)) throw new HumanControlInventoryError(["inventory must be a plain object"]);
  if (!hasOnlyKeys(input, ["schemaVersion", "integrationId", "manifestId", "inventoryVersion", "auditedAt", "controls"])) issues.push("inventory contains unknown top-level fields");
  if (input.schemaVersion !== "1.0") issues.push("schemaVersion must be 1.0");
  if (!boundedString(input.integrationId, 128) || !isSafeIdentifier(input.integrationId)) issues.push("integrationId is unsafe or invalid");
  if (input.manifestId !== manifest.id) issues.push("manifestId must match the manifest");
  if (!boundedString(input.inventoryVersion, 80)) issues.push("inventoryVersion is required and bounded");
  if (typeof input.auditedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.auditedAt)) issues.push("auditedAt must be an ISO date");
  if (!Array.isArray(input.controls) || input.controls.length < 1 || input.controls.length > MAX_CONTROLS) {
    issues.push(`controls must contain between 1 and ${MAX_CONTROLS} entries`);
  }

  const controlIds = new Set(manifest.controls.map((control) => control.id));
  const operations = new Set(manifest.variantPolicy.operations);
  const slotIds = new Set(manifest.assetSlots.map((slot) => slot.id));
  const inventoryIds = new Set<string>();
  let mappedControls = 0;
  let mappedVariantOperations = 0;
  let mappedAssetSlots = 0;
  let excludedControls = 0;

  if (Array.isArray(input.controls)) {
    for (const [index, value] of input.controls.entries()) {
      const path = `controls[${index}]`;
      if (!isRecord(value)) {
        issues.push(`${path} must be an object`);
        continue;
      }
      if (!hasOnlyKeys(value, ["id", "label", "selector", "kind", "mapping"])) issues.push(`${path} contains unknown fields`);
      if (!boundedString(value.id, 128) || !isSafeIdentifier(value.id)) issues.push(`${path}.id is unsafe or invalid`);
      if (typeof value.id === "string") {
        if (inventoryIds.has(value.id)) issues.push(`duplicate inventory control ${value.id}`);
        inventoryIds.add(value.id);
      }
      if (!boundedString(value.label, 160)) issues.push(`${path}.label is required and bounded`);
      if (!boundedString(value.selector, 300)) issues.push(`${path}.selector is required and bounded`);
      if (typeof value.kind !== "string" || !HUMAN_KINDS.has(value.kind as HumanControlKind)) issues.push(`${path}.kind is invalid`);
      if (!isRecord(value.mapping)) {
        issues.push(`${path}.mapping is required`);
        continue;
      }
      if (typeof value.mapping.kind !== "string" || !MAPPING_KINDS.has(value.mapping.kind)) {
        issues.push(`${path}.mapping.kind is invalid`);
        continue;
      }
      switch (value.mapping.kind) {
        case "control":
          if (!hasOnlyKeys(value.mapping, ["kind", "controlId"])) issues.push(`${path}.mapping contains unknown fields`);
          if (typeof value.mapping.controlId !== "string" || !controlIds.has(value.mapping.controlId)) issues.push(`${path} maps to an unknown manifest control`);
          else mappedControls += 1;
          break;
        case "variant-operation":
          if (!hasOnlyKeys(value.mapping, ["kind", "operation"])) issues.push(`${path}.mapping contains unknown fields`);
          if (typeof value.mapping.operation !== "string" || !operations.has(value.mapping.operation as VariantOperation)) issues.push(`${path} maps to an unavailable variant operation`);
          else mappedVariantOperations += 1;
          break;
        case "asset-slot":
          if (!hasOnlyKeys(value.mapping, ["kind", "slotId"])) issues.push(`${path}.mapping contains unknown fields`);
          if (typeof value.mapping.slotId !== "string" || !slotIds.has(value.mapping.slotId)) issues.push(`${path} maps to an unknown asset slot`);
          else mappedAssetSlots += 1;
          break;
        case "excluded":
          if (!hasOnlyKeys(value.mapping, ["kind", "category", "reason"])) issues.push(`${path}.mapping contains unknown fields`);
          if (typeof value.mapping.category !== "string" || !EXCLUSION_CATEGORIES.has(value.mapping.category as ExclusionCategory)) issues.push(`${path} has an invalid exclusion category`);
          if (!boundedString(value.mapping.reason, 300)) issues.push(`${path} requires a public-safe exclusion reason`);
          else excludedControls += 1;
          break;
      }
    }
  }

  if (issues.length > 0) throw new HumanControlInventoryError(issues);
  const inventory = structuredClone(input) as unknown as HumanControlInventory;
  return {
    inventory,
    report: {
      integrationId: inventory.integrationId,
      manifestId: manifest.id,
      mappedControls,
      mappedVariantOperations,
      mappedAssetSlots,
      excludedControls,
      totalHumanControls: inventory.controls.length,
    },
  };
}
