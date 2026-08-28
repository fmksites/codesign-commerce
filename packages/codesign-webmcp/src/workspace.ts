import { isSafeIdentifier } from "./manifest.js";
import type {
  ConfiguratorManifest,
  ControlDefinition,
  ControlValue,
  ElementState,
  Position2DValue,
  VariantState,
  WorkspaceState,
} from "./types.js";

const MAX_ELEMENTS_PER_VARIANT = 100;
const MAX_REVISION_LENGTH = 200;
const EXTERNAL_REFERENCE = /(?:^|[\s("'=])(?:https?:\/\/|ftp:\/\/|file:\/\/|data:|javascript:|blob:|\/\/[a-z0-9.-]+\.[a-z]{2,}(?:[\/:?#]|$)|www\.)/iu;

export class WorkspaceBoundaryError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid public workspace: ${issues.join("; ")}`);
    this.name = "WorkspaceBoundaryError";
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPosition(value: unknown): value is Position2DValue {
  return isRecord(value)
    && Object.keys(value).length === 2
    && Object.prototype.hasOwnProperty.call(value, "x")
    && Object.prototype.hasOwnProperty.call(value, "y")
    && isFiniteNumber(value.x)
    && isFiniteNumber(value.y);
}

function numericBounds(control: ControlDefinition, value: number): string | null {
  if (control.minimum !== undefined && value < control.minimum) return `Control ${control.id} is below its minimum`;
  if (control.maximum !== undefined && value > control.maximum) return `Control ${control.id} exceeds its maximum`;
  return null;
}

export function controlValueError(control: ControlDefinition, value: unknown): string | null {
  switch (control.kind) {
    case "enum":
    case "color":
      return typeof value === "string" && control.values?.some((candidate) => candidate.id === value)
        ? null
        : `Control ${control.id} has a value outside its allowlist`;
    case "integer":
      if (!isFiniteNumber(value) || !Number.isInteger(value)) return `Control ${control.id} requires an integer`;
      return numericBounds(control, value);
    case "number":
    case "scale":
    case "rotation":
      if (!isFiniteNumber(value)) return `Control ${control.id} requires a finite number`;
      return numericBounds(control, value);
    case "boolean":
      return typeof value === "boolean" ? null : `Control ${control.id} requires a boolean`;
    case "text":
      if (typeof value !== "string") return `Control ${control.id} requires text`;
      if (value.length > (control.maximumLength ?? 1_000)) return `Control ${control.id} exceeds its text limit`;
      if (EXTERNAL_REFERENCE.test(value)) return `Control ${control.id} cannot contain an external reference`;
      return null;
    case "asset":
      return typeof value === "string" && isSafeIdentifier(value)
        ? null
        : `Control ${control.id} requires an opaque safe asset handle`;
    case "position-2d":
      if (!isPosition(value)) return `Control ${control.id} requires exactly finite x and y coordinates`;
      if (control.xMinimum !== undefined && value.x < control.xMinimum) return `Control ${control.id} x is below its minimum`;
      if (control.xMaximum !== undefined && value.x > control.xMaximum) return `Control ${control.id} x exceeds its maximum`;
      if (control.yMinimum !== undefined && value.y < control.yMinimum) return `Control ${control.id} y is below its minimum`;
      if (control.yMaximum !== undefined && value.y > control.yMaximum) return `Control ${control.id} y exceeds its maximum`;
      return null;
  }
}

function safeString(value: unknown, label: string, maximum: number, allowEmpty = false): string {
  if (typeof value !== "string" || value.length > maximum || (!allowEmpty && value.length === 0)) {
    throw new WorkspaceBoundaryError([`${label} must be bounded text`]);
  }
  return value;
}

function safeId(value: unknown, label: string): string {
  const parsed = safeString(value, label, 128);
  if (!isSafeIdentifier(parsed)) throw new WorkspaceBoundaryError([`${label} is unsafe or invalid`]);
  return parsed;
}

function assertControlMapKeys(value: Record<string, unknown>, label: string): void {
  const unsafe = Object.keys(value).find((key) => !isSafeIdentifier(key));
  if (unsafe) throw new WorkspaceBoundaryError([`${label} contains unsafe control key ${unsafe}`]);
}

function sanitizeControlMap(
  raw: unknown,
  controls: readonly ControlDefinition[],
  requiredIds: ReadonlySet<string>,
  label: string,
): Record<string, ControlValue> {
  if (!isRecord(raw)) throw new WorkspaceBoundaryError([`${label} must be a plain object`]);
  assertControlMapKeys(raw, label);
  const sanitized: Record<string, ControlValue> = {};
  for (const control of controls) {
    if (!Object.prototype.hasOwnProperty.call(raw, control.id)) {
      if (requiredIds.has(control.id)) throw new WorkspaceBoundaryError([`${label} is missing required control ${control.id}`]);
      continue;
    }
    const value = raw[control.id];
    const issue = controlValueError(control, value);
    if (issue) throw new WorkspaceBoundaryError([issue]);
    sanitized[control.id] = structuredClone(value) as ControlValue;
  }
  return sanitized;
}

function sanitizeElement(raw: unknown, manifest: ConfiguratorManifest): ElementState {
  if (!isRecord(raw)) throw new WorkspaceBoundaryError(["element must be a plain object"]);
  const id = safeId(raw.id, "element id");
  const type = safeId(raw.type, `element ${id} type`);
  const controls = manifest.controls.filter((control) => control.scope === "element" && control.targetType === type);
  if (controls.length === 0) throw new WorkspaceBoundaryError([`element ${id} has unknown type ${type}`]);
  const required = new Set(controls.filter((control) => control.requirement === "configuration").map((control) => control.id));
  const result: ElementState = {
    id,
    type,
    controls: sanitizeControlMap(raw.controls, controls, required, `element ${id} controls`),
  };
  if (raw.assetHandle !== undefined) result.assetHandle = safeId(raw.assetHandle, `element ${id} asset handle`);
  return result;
}

function sanitizeVariant(raw: unknown, manifest: ConfiguratorManifest): VariantState {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) throw new WorkspaceBoundaryError(["variant must contain a bounded element array"]);
  const id = safeId(raw.id, "variant id");
  if (raw.elements.length > MAX_ELEMENTS_PER_VARIANT) throw new WorkspaceBoundaryError([`variant ${id} has too many elements`]);
  const nameControl = manifest.controls.find((control) => control.role === "variant-name");
  const name = safeString(raw.name, `variant ${id} name`, nameControl?.maximumLength ?? 200, true);
  if (nameControl) {
    const issue = controlValueError(nameControl, name);
    if (issue) throw new WorkspaceBoundaryError([issue]);
  }
  const controls = manifest.controls.filter((control) => control.scope === "variant" && control.role !== "variant-name");
  const required = new Set(controls.filter((control) => control.requirement === "configuration" && !(control.availabilityGroupIds?.length)).map((control) => control.id));
  const elements = raw.elements.map((element) => sanitizeElement(element, manifest));
  if (new Set(elements.map((element) => element.id)).size !== elements.length) throw new WorkspaceBoundaryError([`variant ${id} contains duplicate element IDs`]);
  return {
    id,
    name,
    controls: sanitizeControlMap(raw.controls, controls, required, `variant ${id} controls`),
    elements,
  };
}

export function sanitizeWorkspaceState(input: unknown, manifest: ConfiguratorManifest): WorkspaceState {
  if (!isRecord(input) || !Array.isArray(input.variants)) throw new WorkspaceBoundaryError(["workspace must contain a variant array"]);
  if (input.configuratorId !== manifest.id || input.manifestVersion !== manifest.version) {
    throw new WorkspaceBoundaryError(["workspace manifest identity does not match"]);
  }
  const maximum = Math.min(manifest.variantPolicy.maximumVariants, 20);
  if (input.variants.length < manifest.variantPolicy.minimumVariants || input.variants.length > maximum) {
    throw new WorkspaceBoundaryError(["workspace variant count is outside the manifest policy"]);
  }
  const workspaceControls = manifest.controls.filter((control) => control.scope === "workspace");
  const requiredWorkspaceControls = new Set(workspaceControls.filter((control) => control.requirement === "configuration" && !(control.availabilityGroupIds?.length)).map((control) => control.id));
  const variants = input.variants.map((variant) => sanitizeVariant(variant, manifest));
  if (new Set(variants.map((variant) => variant.id)).size !== variants.length) throw new WorkspaceBoundaryError(["workspace contains duplicate variant IDs"]);
  const activeVariantId = safeId(input.activeVariantId, "activeVariantId");
  if (!variants.some((variant) => variant.id === activeVariantId)) throw new WorkspaceBoundaryError(["activeVariantId does not exist"]);
  return {
    configuratorId: manifest.id,
    manifestVersion: manifest.version,
    committedRevision: safeString(input.committedRevision, "committedRevision", MAX_REVISION_LENGTH),
    activeVariantId,
    workspaceControls: sanitizeControlMap(input.workspaceControls, workspaceControls, requiredWorkspaceControls, "workspace controls"),
    variants,
  };
}
