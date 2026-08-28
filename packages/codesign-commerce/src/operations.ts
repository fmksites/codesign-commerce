import { isSafeIdentifier, validateManifest } from "./manifest.js";
import { controlValueError, sanitizeWorkspaceState } from "./workspace.js";
import type {
  ApplyOperationsInput,
  ConfiguratorManifest,
  ControlDefinition,
  ControlTarget,
  ControlValue,
  OperationBatchResult,
  OperationErrorCode,
  Position2DValue,
  ProposalOperation,
  VariantState,
  WorkspaceState,
} from "./types.js";

export const MAX_OPERATIONS_PER_BATCH = 80;
export const MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL = 240;
const MAX_ASSUMPTIONS = 20;

export class OperationValidationError extends Error {
  readonly code: OperationErrorCode;
  readonly operationIndex: number | undefined;

  constructor(code: OperationErrorCode, message: string, operationIndex?: number) {
    super(message);
    this.name = "OperationValidationError";
    this.code = code;
    this.operationIndex = operationIndex;
  }
}

function fail(code: OperationErrorCode, message: string, operationIndex?: number): never {
  throw new OperationValidationError(code, message, operationIndex);
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

function safeId(value: unknown, label: string, operationIndex?: number): string {
  if (typeof value !== "string" || !isSafeIdentifier(value)) fail("INVALID_INPUT", `${label} is unsafe or invalid`, operationIndex);
  return value;
}

function boundedText(value: unknown, label: string, maximum: number, operationIndex?: number, allowEmpty = false): string {
  if (typeof value !== "string" || value.length > maximum || (!allowEmpty && value.length === 0)) fail("INVALID_INPUT", `${label} must be bounded text`, operationIndex);
  return value;
}

function isPosition(value: unknown): value is Position2DValue {
  return isRecord(value)
    && hasOnlyKeys(value, ["x", "y"])
    && typeof value.x === "number"
    && Number.isFinite(value.x)
    && typeof value.y === "number"
    && Number.isFinite(value.y);
}

function copyControlValue(value: unknown, operationIndex: number): ControlValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (isPosition(value)) return { x: value.x as number, y: value.y as number };
  return fail("INVALID_INPUT", "Control values must use the finite public value types", operationIndex);
}

function copyControlMap(value: unknown, operationIndex: number): Record<string, ControlValue> {
  if (!isRecord(value)) fail("INVALID_INPUT", "Initial controls must be a plain object", operationIndex);
  const result: Record<string, ControlValue> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!isSafeIdentifier(key)) fail("INVALID_INPUT", `Initial control key ${key} is unsafe`, operationIndex);
    result[key] = copyControlValue(raw, operationIndex);
  }
  return result;
}

function parseTarget(value: unknown, operationIndex: number, workspaceAllowed = true): ControlTarget {
  if (!isRecord(value) || typeof value.scope !== "string") fail("INVALID_INPUT", "Operation target is invalid", operationIndex);
  if (value.scope === "workspace") {
    if (!workspaceAllowed || !hasOnlyKeys(value, ["scope"])) fail("INVALID_INPUT", "Workspace target is unavailable here", operationIndex);
    return { scope: "workspace" };
  }
  if (value.scope === "variant") {
    if (!hasOnlyKeys(value, ["scope", "variantId"])) fail("INVALID_INPUT", "Variant target contains unknown fields", operationIndex);
    return { scope: "variant", variantId: safeId(value.variantId, "variantId", operationIndex) };
  }
  if (value.scope === "element") {
    if (!hasOnlyKeys(value, ["scope", "variantId", "elementId"])) fail("INVALID_INPUT", "Element target contains unknown fields", operationIndex);
    return {
      scope: "element",
      variantId: safeId(value.variantId, "variantId", operationIndex),
      elementId: safeId(value.elementId, "elementId", operationIndex),
    };
  }
  return fail("INVALID_INPUT", "Operation target scope is invalid", operationIndex);
}

function parseVariant(value: unknown, operationIndex: number): VariantState {
  if (!isRecord(value) || !hasOnlyKeys(value, ["id", "name", "controls", "elements"]) || !Array.isArray(value.elements)) {
    fail("INVALID_INPUT", "Created variant must contain only id, name, controls, and elements", operationIndex);
  }
  const elements = value.elements.map((element) => {
    if (!isRecord(element) || !hasOnlyKeys(element, ["id", "type", "controls", "assetHandle"])) fail("INVALID_INPUT", "Created element contains unknown fields", operationIndex);
    return {
      id: safeId(element.id, "element id", operationIndex),
      type: safeId(element.type, "element type", operationIndex),
      controls: copyControlMap(element.controls, operationIndex),
      ...(element.assetHandle === undefined ? {} : { assetHandle: safeId(element.assetHandle, "element asset handle", operationIndex) }),
    };
  });
  return {
    id: safeId(value.id, "variant id", operationIndex),
    name: boundedText(value.name, "variant name", 1_000, operationIndex, true),
    controls: copyControlMap(value.controls, operationIndex),
    elements,
  };
}

function optionalIndex(value: unknown, operationIndex: number): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 20) fail("INVALID_INPUT", "Variant index is invalid", operationIndex);
  return value as number;
}

function parseOperation(value: unknown, operationIndex: number): ProposalOperation {
  if (!isRecord(value) || typeof value.type !== "string") fail("INVALID_INPUT", "Proposal operation must be an object with a type", operationIndex);
  switch (value.type) {
    case "set-control":
      if (!hasOnlyKeys(value, ["type", "target", "controlId", "value"])) fail("INVALID_INPUT", "set-control contains unknown fields", operationIndex);
      return { type: "set-control", target: parseTarget(value.target, operationIndex), controlId: safeId(value.controlId, "controlId", operationIndex), value: copyControlValue(value.value, operationIndex) };
    case "create-variant": {
      if (!hasOnlyKeys(value, ["type", "variant", "index"])) fail("INVALID_INPUT", "create-variant contains unknown fields", operationIndex);
      const index = optionalIndex(value.index, operationIndex);
      return { type: "create-variant", variant: parseVariant(value.variant, operationIndex), ...(index === undefined ? {} : { index }) };
    }
    case "duplicate-variant": {
      if (!hasOnlyKeys(value, ["type", "sourceVariantId", "variantId", "name", "index", "initialControls"])) fail("INVALID_INPUT", "duplicate-variant contains unknown fields", operationIndex);
      const index = optionalIndex(value.index, operationIndex);
      const name = value.name === undefined ? undefined : boundedText(value.name, "variant name", 1_000, operationIndex, true);
      const initialControls = value.initialControls === undefined ? undefined : copyControlMap(value.initialControls, operationIndex);
      return {
        type: "duplicate-variant",
        sourceVariantId: safeId(value.sourceVariantId, "sourceVariantId", operationIndex),
        variantId: safeId(value.variantId, "variantId", operationIndex),
        ...(name === undefined ? {} : { name }),
        ...(index === undefined ? {} : { index }),
        ...(initialControls === undefined ? {} : { initialControls }),
      };
    }
    case "remove-variant":
      if (!hasOnlyKeys(value, ["type", "variantId"])) fail("INVALID_INPUT", "remove-variant contains unknown fields", operationIndex);
      return { type: "remove-variant", variantId: safeId(value.variantId, "variantId", operationIndex) };
    case "reorder-variant":
      if (!hasOnlyKeys(value, ["type", "variantId", "index"])) fail("INVALID_INPUT", "reorder-variant contains unknown fields", operationIndex);
      if (value.index === undefined) fail("INVALID_INPUT", "reorder-variant requires an index", operationIndex);
      return { type: "reorder-variant", variantId: safeId(value.variantId, "variantId", operationIndex), index: optionalIndex(value.index, operationIndex)! };
    case "set-active-variant":
      if (!hasOnlyKeys(value, ["type", "variantId"])) fail("INVALID_INPUT", "set-active-variant contains unknown fields", operationIndex);
      return { type: "set-active-variant", variantId: safeId(value.variantId, "variantId", operationIndex) };
    case "attach-asset":
      if (!hasOnlyKeys(value, ["type", "target", "controlId", "assetHandle"])) fail("INVALID_INPUT", "attach-asset contains unknown fields", operationIndex);
      return {
        type: "attach-asset",
        target: parseTarget(value.target, operationIndex),
        controlId: safeId(value.controlId, "controlId", operationIndex),
        assetHandle: safeId(value.assetHandle, "assetHandle", operationIndex),
      };
    case "remove-asset":
      if (!hasOnlyKeys(value, ["type", "target", "controlId"])) fail("INVALID_INPUT", "remove-asset contains unknown fields", operationIndex);
      return {
        type: "remove-asset",
        target: parseTarget(value.target, operationIndex),
        controlId: safeId(value.controlId, "controlId", operationIndex),
      };
    default:
      return fail("INVALID_INPUT", `Unsupported operation type ${value.type}`, operationIndex);
  }
}

export function validateApplyOperationsInput(value: unknown): ApplyOperationsInput {
  if (!isRecord(value) || !hasOnlyKeys(value, ["baseRevision", "proposalId", "proposalRevision", "operationId", "operations", "assumptions"])) {
    fail("INVALID_INPUT", "Proposal batch contains unknown or missing fields");
  }
  const baseRevision = boundedText(value.baseRevision, "baseRevision", 200);
  const operationId = safeId(value.operationId, "operationId");
  if ((value.proposalId === undefined) !== (value.proposalRevision === undefined)) fail("INVALID_INPUT", "proposalId and proposalRevision must be supplied together");
  const proposalId = value.proposalId === undefined ? undefined : safeId(value.proposalId, "proposalId");
  const proposalRevision = value.proposalRevision === undefined ? undefined : value.proposalRevision;
  if (proposalRevision !== undefined && (!Number.isInteger(proposalRevision) || (proposalRevision as number) < 1)) fail("INVALID_INPUT", "proposalRevision must be a positive integer");
  if (!Array.isArray(value.operations) || value.operations.length < 1 || value.operations.length > MAX_OPERATIONS_PER_BATCH) fail("INVALID_INPUT", `operations must contain between 1 and ${MAX_OPERATIONS_PER_BATCH} entries`);
  const operations = value.operations.map(parseOperation);
  let assumptions: string[] | undefined;
  if (value.assumptions !== undefined) {
    if (!Array.isArray(value.assumptions) || value.assumptions.length > MAX_ASSUMPTIONS) fail("INVALID_INPUT", `assumptions must contain at most ${MAX_ASSUMPTIONS} entries`);
    assumptions = value.assumptions.map((assumption) => boundedText(assumption, "assumption", 500, undefined, true));
  }
  return {
    baseRevision,
    operationId,
    operations,
    ...(proposalId === undefined ? {} : { proposalId }),
    ...(proposalRevision === undefined ? {} : { proposalRevision: proposalRevision as number }),
    ...(assumptions === undefined ? {} : { assumptions }),
  };
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function findControl(manifest: ConfiguratorManifest, controlId: string, operationIndex: number): ControlDefinition {
  const control = manifest.controls.find((candidate) => candidate.id === controlId);
  if (!control) fail("UNKNOWN_CONTROL", `Unknown control ${controlId}`, operationIndex);
  if (!control.agentWritable) fail("CONTROL_NOT_WRITABLE", `Control ${controlId} is not agent-writable`, operationIndex);
  return control;
}

function resolveControlMap(
  state: WorkspaceState,
  target: ControlTarget,
  control: ControlDefinition,
  operationIndex: number,
): { map: Record<string, ControlValue>; variant?: VariantState } {
  if (target.scope !== control.scope) fail("INVALID_TARGET", `Control ${control.id} does not match target scope ${target.scope}`, operationIndex);
  if (target.scope === "workspace") return { map: state.workspaceControls };
  const variant = state.variants.find((candidate) => candidate.id === target.variantId);
  if (!variant) fail("UNKNOWN_VARIANT", `Unknown variant ${target.variantId}`, operationIndex);
  if (target.scope === "variant") return { map: variant.controls, variant };
  const element = variant.elements.find((candidate) => candidate.id === target.elementId);
  if (!element) fail("UNKNOWN_ELEMENT", `Unknown element ${target.elementId}`, operationIndex);
  if (control.targetType !== element.type) fail("INVALID_TARGET", `Control ${control.id} cannot target element type ${element.type}`, operationIndex);
  return { map: element.controls, variant };
}

function requireVariantOperation(manifest: ConfiguratorManifest, operation: "create" | "duplicate" | "remove" | "reorder" | "set-active", operationIndex: number): void {
  if (!manifest.variantPolicy.operations.includes(operation)) fail("VARIANT_OPERATION_UNAVAILABLE", `Variant operation ${operation} is unavailable`, operationIndex);
}

function insertionIndex(index: number | undefined, length: number, operationIndex: number): number {
  if (index === undefined) return length;
  if (index > length) fail("INVALID_INPUT", "Variant insertion index is outside the workspace", operationIndex);
  return index;
}

function validateCreatedVariantInput(variant: VariantState, manifest: ConfiguratorManifest, operationIndex: number): void {
  const variantControls = new Map(manifest.controls.filter((control) => control.scope === "variant" && control.role !== "variant-name").map((control) => [control.id, control]));
  for (const [controlId, value] of Object.entries(variant.controls)) {
    const control = variantControls.get(controlId);
    if (!control) fail("UNKNOWN_CONTROL", `Unknown variant control ${controlId}`, operationIndex);
    if (!control.agentWritable) fail("CONTROL_NOT_WRITABLE", `Control ${controlId} is not agent-writable`, operationIndex);
    const issue = controlValueError(control, value);
    if (issue) fail("INVALID_VALUE", issue, operationIndex);
  }
  for (const element of variant.elements) {
    const elementControls = new Map(manifest.controls.filter((control) => control.scope === "element" && control.targetType === element.type).map((control) => [control.id, control]));
    if (elementControls.size === 0) fail("INVALID_TARGET", `Unknown element type ${element.type}`, operationIndex);
    for (const [controlId, value] of Object.entries(element.controls)) {
      const control = elementControls.get(controlId);
      if (!control) fail("UNKNOWN_CONTROL", `Unknown element control ${controlId}`, operationIndex);
      if (!control.agentWritable) fail("CONTROL_NOT_WRITABLE", `Control ${controlId} is not agent-writable`, operationIndex);
      const issue = controlValueError(control, value);
      if (issue) fail("INVALID_VALUE", issue, operationIndex);
    }
  }
}

function applyOperation(state: WorkspaceState, operation: ProposalOperation, manifest: ConfiguratorManifest, operationIndex: number): void {
  switch (operation.type) {
    case "set-control": {
      const control = findControl(manifest, operation.controlId, operationIndex);
      if (control.kind === "asset") fail("INVALID_INPUT", `Asset control ${control.id} requires attach-asset or remove-asset`, operationIndex);
      const issue = controlValueError(control, operation.value);
      if (issue) fail("INVALID_VALUE", issue, operationIndex);
      const target = resolveControlMap(state, operation.target, control, operationIndex);
      if (control.role === "variant-name") target.variant!.name = operation.value as string;
      else target.map[control.id] = structuredClone(operation.value);
      return;
    }
    case "create-variant": {
      requireVariantOperation(manifest, "create", operationIndex);
      if (state.variants.length >= manifest.variantPolicy.maximumVariants) fail("VARIANT_LIMIT", "The workspace has reached its variant maximum", operationIndex);
      if (state.variants.some((variant) => variant.id === operation.variant.id)) fail("DUPLICATE_ID", `Variant ${operation.variant.id} already exists`, operationIndex);
      validateCreatedVariantInput(operation.variant, manifest, operationIndex);
      state.variants.splice(insertionIndex(operation.index, state.variants.length, operationIndex), 0, structuredClone(operation.variant));
      return;
    }
    case "duplicate-variant": {
      requireVariantOperation(manifest, "duplicate", operationIndex);
      if (state.variants.length >= manifest.variantPolicy.maximumVariants) fail("VARIANT_LIMIT", "The workspace has reached its variant maximum", operationIndex);
      const source = state.variants.find((variant) => variant.id === operation.sourceVariantId);
      if (!source) fail("UNKNOWN_VARIANT", `Unknown source variant ${operation.sourceVariantId}`, operationIndex);
      if (state.variants.some((variant) => variant.id === operation.variantId)) fail("DUPLICATE_ID", `Variant ${operation.variantId} already exists`, operationIndex);
      const duplicate = structuredClone(source);
      duplicate.id = operation.variantId;
      if (operation.name !== undefined) duplicate.name = operation.name;
      state.variants.splice(insertionIndex(operation.index, state.variants.length, operationIndex), 0, duplicate);
      for (const [controlId, value] of Object.entries(operation.initialControls ?? {})) {
        const control = findControl(manifest, controlId, operationIndex);
        if (control.scope !== "variant" || control.role === "variant-name" || control.kind === "asset") fail("INVALID_TARGET", `Initial control ${controlId} is not a variant value control`, operationIndex);
        const issue = controlValueError(control, value);
        if (issue) fail("INVALID_VALUE", issue, operationIndex);
        duplicate.controls[controlId] = structuredClone(value);
      }
      return;
    }
    case "remove-variant": {
      requireVariantOperation(manifest, "remove", operationIndex);
      const index = state.variants.findIndex((variant) => variant.id === operation.variantId);
      if (index === -1) fail("UNKNOWN_VARIANT", `Unknown variant ${operation.variantId}`, operationIndex);
      if (state.variants.length <= manifest.variantPolicy.minimumVariants) fail("VARIANT_LIMIT", "The workspace must retain its minimum variant count", operationIndex);
      state.variants.splice(index, 1);
      if (state.activeVariantId === operation.variantId) state.activeVariantId = state.variants[Math.min(index, state.variants.length - 1)]!.id;
      return;
    }
    case "reorder-variant": {
      requireVariantOperation(manifest, "reorder", operationIndex);
      const currentIndex = state.variants.findIndex((variant) => variant.id === operation.variantId);
      if (currentIndex === -1) fail("UNKNOWN_VARIANT", `Unknown variant ${operation.variantId}`, operationIndex);
      if (operation.index >= state.variants.length) fail("INVALID_INPUT", "Variant reorder index is outside the workspace", operationIndex);
      const [variant] = state.variants.splice(currentIndex, 1);
      state.variants.splice(operation.index, 0, variant!);
      return;
    }
    case "set-active-variant":
      requireVariantOperation(manifest, "set-active", operationIndex);
      if (!state.variants.some((variant) => variant.id === operation.variantId)) fail("UNKNOWN_VARIANT", `Unknown variant ${operation.variantId}`, operationIndex);
      state.activeVariantId = operation.variantId;
      return;
    case "attach-asset": {
      const control = findControl(manifest, operation.controlId, operationIndex);
      if (control.kind !== "asset") fail("INVALID_TARGET", `Control ${control.id} is not an asset control`, operationIndex);
      const issue = controlValueError(control, operation.assetHandle);
      if (issue) fail("INVALID_VALUE", issue, operationIndex);
      resolveControlMap(state, operation.target, control, operationIndex).map[control.id] = operation.assetHandle;
      return;
    }
    case "remove-asset": {
      const control = findControl(manifest, operation.controlId, operationIndex);
      if (control.kind !== "asset") fail("INVALID_TARGET", `Control ${control.id} is not an asset control`, operationIndex);
      delete resolveControlMap(state, operation.target, control, operationIndex).map[control.id];
      return;
    }
  }
}

interface StoredOperationResult {
  fingerprint: string;
  result: OperationBatchResult;
}

export class AtomicOperationReducer {
  readonly manifest: ConfiguratorManifest;
  #results = new Map<string, StoredOperationResult>();
  #successfulOperations = 0;

  constructor(manifest: ConfiguratorManifest) {
    this.manifest = validateManifest(structuredClone(manifest));
  }

  /**
   * Creates an isolated ledger for a candidate batch. The caller promotes the
   * fork only after merchant validation and rendering both succeed, so a
   * rejected or cancelled refinement cannot consume an operation ID or budget.
   */
  fork(): AtomicOperationReducer {
    const fork = new AtomicOperationReducer(this.manifest);
    fork.#successfulOperations = this.#successfulOperations;
    for (const [operationId, stored] of this.#results) {
      fork.#results.set(operationId, structuredClone(stored));
    }
    return fork;
  }

  apply(current: WorkspaceState, rawInput: unknown): OperationBatchResult {
    const input = validateApplyOperationsInput(rawInput);
    const fingerprint = canonical(input);
    const prior = this.#results.get(input.operationId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) fail("OPERATION_ID_CONFLICT", `Operation ID ${input.operationId} was reused with a different payload`);
      return { ...structuredClone(prior.result), deduplicated: true };
    }
    if (this.#successfulOperations + input.operations.length > MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL) {
      fail("OPERATION_LIMIT", `A proposal may contain at most ${MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL} successful operations`);
    }
    const baseline = sanitizeWorkspaceState(current, this.manifest);
    if (baseline.committedRevision !== input.baseRevision) fail("STALE_REVISION", "The proposal base revision is stale");
    const next = structuredClone(baseline);
    input.operations.forEach((operation, index) => applyOperation(next, operation, this.manifest, index));
    const state = sanitizeWorkspaceState(next, this.manifest);
    const result: OperationBatchResult = {
      state,
      operationId: input.operationId,
      appliedOperations: input.operations.length,
      deduplicated: false,
    };
    this.#results.set(input.operationId, { fingerprint, result: structuredClone(result) });
    this.#successfulOperations += input.operations.length;
    return structuredClone(result);
  }

  clear(): void {
    this.#results.clear();
    this.#successfulOperations = 0;
  }
}
