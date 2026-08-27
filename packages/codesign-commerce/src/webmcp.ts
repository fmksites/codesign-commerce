import { isSafeIdentifier, validateManifest } from "./manifest.js";
import type { ProposalEngine } from "./proposal-engine.js";
import type {
  CapabilityCategory,
  ConfiguratorManifest,
  ControlDefinition,
  ListCapabilitiesInput,
  WorkspaceState,
} from "./types.js";

export interface JsonSchema {
  [key: string]: unknown;
}

export interface WebMcpExecuteOptions {
  signal?: AbortSignal;
}

export interface WebMcpTool<Input = unknown, Output = unknown> {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: {
    readOnlyHint: boolean;
    untrustedContentHint?: boolean;
  };
  execute(input: Input, options?: WebMcpExecuteOptions): Promise<Output>;
}

export interface ModelContextLike {
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): Promise<unknown> | unknown;
}

export interface DocumentWithModelContext {
  modelContext?: ModelContextLike;
}

export interface WebMcpRegistration {
  supported: boolean;
  toolNames: string[];
  reason?: "disabled" | "unsupported-host" | "invalid-manifest";
  unregister(): void;
  ready: Promise<void>;
}

export interface CoDesignToolDependencies<Snapshot = unknown, PrivateAsset = unknown> {
  engine: ProposalEngine<Snapshot, PrivateAsset>;
  enabled?: boolean;
}

export const CODESIGN_TOOL_NAMES = [
  "codesign_read_workspace",
  "codesign_list_capabilities",
  "codesign_stage_asset",
  "codesign_apply_proposal",
  "codesign_get_previews",
  "codesign_validate_proposal",
] as const;

const EMPTY_OBJECT_SCHEMA: JsonSchema = { type: "object", properties: {}, additionalProperties: false };
const SAFE_ID_SCHEMA: JsonSchema = { type: "string", minLength: 1, maxLength: 200, pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]*$" };
const REVISION_SCHEMA: JsonSchema = { type: "string", minLength: 1, maxLength: 200 };
const POSITION_SCHEMA: JsonSchema = {
  type: "object",
  properties: { x: { type: "number" }, y: { type: "number" } },
  required: ["x", "y"],
  additionalProperties: false,
};
const CONTROL_VALUE_SCHEMA: JsonSchema = {
  oneOf: [
    { type: "string", maxLength: 1_000 },
    { type: "number", minimum: -1_000_000_000, maximum: 1_000_000_000 },
    { type: "boolean" },
    { type: "null" },
    POSITION_SCHEMA,
  ],
};
const TARGET_SCHEMA: JsonSchema = {
  oneOf: [
    { type: "object", properties: { scope: { type: "string", const: "workspace" } }, required: ["scope"], additionalProperties: false },
    { type: "object", properties: { scope: { type: "string", const: "variant" }, variantId: SAFE_ID_SCHEMA }, required: ["scope", "variantId"], additionalProperties: false },
    { type: "object", properties: { scope: { type: "string", const: "element" }, variantId: SAFE_ID_SCHEMA, elementId: SAFE_ID_SCHEMA }, required: ["scope", "variantId", "elementId"], additionalProperties: false },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  const keys = new Set(allowed);
  return Object.keys(value).every((key) => keys.has(key));
}

function safeId(value: unknown): value is string {
  return typeof value === "string" && isSafeIdentifier(value);
}

function controlRecordSchema(controls: ControlDefinition[]): JsonSchema {
  return {
    type: "object",
    properties: Object.fromEntries(controls.map((control) => [control.id, CONTROL_VALUE_SCHEMA])),
    additionalProperties: false,
    maxProperties: controls.length,
  };
}

function variantSchema(manifest: ConfiguratorManifest): JsonSchema {
  const variantControls = manifest.controls.filter((control) => control.scope === "variant" && control.role !== "variant-name");
  const elementControls = manifest.controls.filter((control) => control.scope === "element");
  return {
    type: "object",
    properties: {
      id: SAFE_ID_SCHEMA,
      name: { type: "string", maxLength: 1_000 },
      controls: controlRecordSchema(variantControls),
      elements: {
        type: "array",
        maxItems: 100,
        items: {
          type: "object",
          properties: {
            id: SAFE_ID_SCHEMA,
            type: SAFE_ID_SCHEMA,
            controls: controlRecordSchema(elementControls),
            assetHandle: SAFE_ID_SCHEMA,
          },
          required: ["id", "type", "controls"],
          additionalProperties: false,
        },
      },
    },
    required: ["id", "name", "controls", "elements"],
    additionalProperties: false,
  };
}

function operationSchema(manifest: ConfiguratorManifest): JsonSchema {
  const writable = manifest.controls.filter((control) => control.agentWritable);
  const valueControls = writable.filter((control) => control.kind !== "asset").map((control) => control.id);
  const assetControls = writable.filter((control) => control.kind === "asset").map((control) => control.id);
  const variantValueControls = writable.filter((control) => control.scope === "variant" && control.kind !== "asset" && control.role !== "variant-name");
  const operations: JsonSchema[] = [];
  if (valueControls.length > 0) operations.push({
    type: "object",
    properties: { type: { type: "string", const: "set-control" }, target: TARGET_SCHEMA, controlId: { type: "string", enum: valueControls }, value: CONTROL_VALUE_SCHEMA },
    required: ["type", "target", "controlId", "value"],
    additionalProperties: false,
  });
  if (assetControls.length > 0) {
    operations.push({
      type: "object",
      properties: { type: { type: "string", const: "attach-asset" }, target: TARGET_SCHEMA, controlId: { type: "string", enum: assetControls }, assetHandle: SAFE_ID_SCHEMA },
      required: ["type", "target", "controlId", "assetHandle"],
      additionalProperties: false,
    });
    operations.push({
      type: "object",
      properties: { type: { type: "string", const: "remove-asset" }, target: TARGET_SCHEMA, controlId: { type: "string", enum: assetControls } },
      required: ["type", "target", "controlId"],
      additionalProperties: false,
    });
  }
  if (manifest.variantPolicy.operations.includes("create")) operations.push({
    type: "object",
    properties: { type: { type: "string", const: "create-variant" }, variant: variantSchema(manifest), index: { type: "integer", minimum: 0, maximum: 20 } },
    required: ["type", "variant"],
    additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("duplicate")) operations.push({
    type: "object",
    properties: {
      type: { type: "string", const: "duplicate-variant" }, sourceVariantId: SAFE_ID_SCHEMA, variantId: SAFE_ID_SCHEMA,
      name: { type: "string", maxLength: 1_000 }, index: { type: "integer", minimum: 0, maximum: 20 },
      initialControls: controlRecordSchema(variantValueControls),
    },
    required: ["type", "sourceVariantId", "variantId"],
    additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("remove")) operations.push({
    type: "object", properties: { type: { type: "string", const: "remove-variant" }, variantId: SAFE_ID_SCHEMA }, required: ["type", "variantId"], additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("reorder")) operations.push({
    type: "object", properties: { type: { type: "string", const: "reorder-variant" }, variantId: SAFE_ID_SCHEMA, index: { type: "integer", minimum: 0, maximum: 20 } }, required: ["type", "variantId", "index"], additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("set-active")) operations.push({
    type: "object", properties: { type: { type: "string", const: "set-active-variant" }, variantId: SAFE_ID_SCHEMA }, required: ["type", "variantId"], additionalProperties: false,
  });
  return { oneOf: operations.length > 0 ? operations : [{ type: "object", maxProperties: 0, additionalProperties: false }] };
}

function applyProposalSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    properties: {
      baseRevision: REVISION_SCHEMA, proposalId: SAFE_ID_SCHEMA, proposalRevision: { type: "integer", minimum: 1 }, operationId: SAFE_ID_SCHEMA,
      operations: { type: "array", minItems: 1, maxItems: 80, items: operationSchema(manifest) },
      assumptions: { type: "array", maxItems: 20, items: { type: "string", maxLength: 500 } },
    },
    required: ["baseRevision", "operationId", "operations"],
    additionalProperties: false,
  };
}

function stageAssetSchema(manifest: ConfiguratorManifest): JsonSchema {
  const slots = manifest.assetSlots;
  const sourceKinds = new Set(slots.flatMap((slot) => slot.sourceKinds));
  const maximumSource = Math.max(1, ...slots.map((slot) => slot.maximumSourceCharacters));
  const sources: JsonSchema[] = [];
  if (sourceKinds.has("data-url")) sources.push({
    type: "object", properties: { kind: { type: "string", const: "data-url" }, data: { type: "string", minLength: 32, maxLength: maximumSource } }, required: ["kind", "data"], additionalProperties: false,
  });
  if (sourceKinds.has("https-url")) sources.push({
    type: "object", properties: { kind: { type: "string", const: "https-url" }, url: { type: "string", minLength: 9, maxLength: Math.min(maximumSource, 2_048) } }, required: ["kind", "url"], additionalProperties: false,
  });
  return {
    type: "object",
    properties: {
      baseRevision: REVISION_SCHEMA, proposalId: SAFE_ID_SCHEMA, proposalRevision: { type: "integer", minimum: 1 },
      slotId: slots.length > 0 ? { type: "string", enum: slots.map((slot) => slot.id) } : { type: "string", maxLength: 0 },
      source: { oneOf: sources.length > 0 ? sources : [{ type: "object", maxProperties: 0, additionalProperties: false }] },
      filename: { type: "string", minLength: 1, maxLength: 120 }, altText: { type: "string", minLength: 1, maxLength: 300 },
    },
    required: ["baseRevision", "slotId", "source", "altText"],
    additionalProperties: false,
  };
}

function previewSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    properties: {
      proposalId: SAFE_ID_SCHEMA, proposalRevision: { type: "integer", minimum: 1 }, baseRevision: REVISION_SCHEMA,
      variantIds: { type: "array", minItems: 1, maxItems: 20, uniqueItems: true, items: SAFE_ID_SCHEMA },
      surfaceIds: { type: "array", minItems: 1, maxItems: 20, uniqueItems: true, items: { type: "string", enum: manifest.previewSurfaces.map((surface) => surface.id) } },
    },
    required: ["proposalId", "proposalRevision", "baseRevision"],
    additionalProperties: false,
  };
}

const VALIDATE_SCHEMA: JsonSchema = {
  type: "object", properties: { proposalId: SAFE_ID_SCHEMA, proposalRevision: { type: "integer", minimum: 1 } }, additionalProperties: false,
};

function capabilitiesSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    properties: {
      variantId: SAFE_ID_SCHEMA, elementId: SAFE_ID_SCHEMA,
      controlIds: { type: "array", minItems: 1, maxItems: 50, uniqueItems: true, items: { type: "string", enum: manifest.controls.map((control) => control.id) } },
      categories: { type: "array", minItems: 1, maxItems: 5, uniqueItems: true, items: { type: "string", enum: ["controls", "variants", "assets", "previews", "dependencies"] } },
    },
    additionalProperties: false,
  };
}

function invalidInput(message: string) {
  return { ok: false, persisted: false, error: { code: "INVALID_INPUT", message, retryable: false } };
}

function adapterFailure(message: string) {
  return { ok: false, persisted: false, error: { code: "ADAPTER_FAILURE", message, retryable: true } };
}

const PUBLIC_ERROR_CODES: Record<string, string> = {
  STALE_REVISION: "STALE_COMMITTED_REVISION", UNKNOWN_VARIANT: "UNKNOWN_TARGET", UNKNOWN_ELEMENT: "UNKNOWN_TARGET",
  UNKNOWN_ASSET: "UNKNOWN_TARGET", UNKNOWN_ASSET_SLOT: "UNKNOWN_TARGET", ASSET_BINDING_MISMATCH: "UNKNOWN_TARGET",
  CONTROL_NOT_WRITABLE: "UNAVAILABLE_CONTROL", VARIANT_OPERATION_UNAVAILABLE: "CAPABILITY_UNAVAILABLE", VARIANT_LIMIT: "CAPABILITY_UNAVAILABLE",
  DUPLICATE_ID: "INVALID_VALUE", ASSET_STAGE_FAILED: "ADAPTER_FAILURE", ASSET_EXPIRED: "ASSET_SOURCE_REJECTED",
  PREVIEW_REQUIRED: "PREVIEW_FAILED", COMMIT_ALREADY_STARTED: "COMMIT_IN_PROGRESS", COMMIT_STATUS_UNKNOWN: "COMMIT_UNCERTAIN",
};

function publicResult<T>(result: T): T {
  if (!isRecord(result) || result.ok !== false || !isRecord(result.error) || typeof result.error.code !== "string") return result;
  return { ...result, error: { ...result.error, code: PUBLIC_ERROR_CODES[result.error.code] ?? result.error.code } } as T;
}

function parseCapabilities(value: unknown, manifest: ConfiguratorManifest): ListCapabilitiesInput | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["variantId", "elementId", "controlIds", "categories"])) return null;
  if (value.variantId !== undefined && !safeId(value.variantId)) return null;
  if (value.elementId !== undefined && (!safeId(value.elementId) || value.variantId === undefined)) return null;
  const knownControls = new Set(manifest.controls.map((control) => control.id));
  if (value.controlIds !== undefined && (!Array.isArray(value.controlIds) || value.controlIds.length < 1 || value.controlIds.length > 50 || new Set(value.controlIds).size !== value.controlIds.length || !value.controlIds.every((entry) => typeof entry === "string" && knownControls.has(entry)))) return null;
  const knownCategories = new Set<CapabilityCategory>(["controls", "variants", "assets", "previews", "dependencies"]);
  if (value.categories !== undefined && (!Array.isArray(value.categories) || value.categories.length < 1 || value.categories.length > 5 || new Set(value.categories).size !== value.categories.length || !value.categories.every((entry) => knownCategories.has(entry as CapabilityCategory)))) return null;
  return {
    ...(value.variantId === undefined ? {} : { variantId: value.variantId as string }),
    ...(value.elementId === undefined ? {} : { elementId: value.elementId as string }),
    ...(value.controlIds === undefined ? {} : { controlIds: value.controlIds as string[] }),
    ...(value.categories === undefined ? {} : { categories: value.categories as CapabilityCategory[] }),
  };
}

function targetExists(workspace: WorkspaceState, input: ListCapabilitiesInput): boolean {
  if (!input.variantId) return true;
  const variant = workspace.variants.find((candidate) => candidate.id === input.variantId);
  if (!variant) return false;
  return !input.elementId || variant.elements.some((element) => element.id === input.elementId);
}

function controlCapability(control: ControlDefinition, availability: Map<string, { available: boolean; values?: unknown; reason?: string }>) {
  const current = availability.get(control.id);
  return {
    controlId: control.id, label: control.label, agentDescription: control.agentDescription, scope: control.scope, kind: control.kind,
    agentWritable: control.agentWritable, requirement: control.requirement, available: current?.available ?? true,
    ...(current?.values === undefined && control.values === undefined ? {} : { values: current?.values ?? control.values }),
    ...(current?.reason === undefined ? {} : { reason: current.reason }),
    ...(control.minimum === undefined ? {} : { minimum: control.minimum }), ...(control.maximum === undefined ? {} : { maximum: control.maximum }),
    ...(control.maximumLength === undefined ? {} : { maximumLength: control.maximumLength }),
    ...(control.xMinimum === undefined ? {} : { xMinimum: control.xMinimum, xMaximum: control.xMaximum, yMinimum: control.yMinimum, yMaximum: control.yMaximum }),
    ...(control.assetSlotId === undefined ? {} : { assetSlotId: control.assetSlotId }), ...(control.targetType === undefined ? {} : { targetType: control.targetType }),
    ...(control.affectedPreviewRegion === undefined ? {} : { affectedPreviewRegion: control.affectedPreviewRegion }),
  };
}

export function createCoDesignTools<Snapshot, PrivateAsset>(dependencies: CoDesignToolDependencies<Snapshot, PrivateAsset>): WebMcpTool[] {
  const engine = dependencies.engine;
  const manifest = validateManifest(structuredClone(engine.manifest));

  const readTool: WebMcpTool = {
    name: "codesign_read_workspace", title: "Read custom product workspace",
    description: "Read the sanitized committed custom-product workspace and any temporary proposal metadata. Never returns pricing, customer data, private snapshots, or raw artwork.",
    inputSchema: EMPTY_OBJECT_SCHEMA, annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options) {
      if (!isRecord(input) || Object.keys(input).length !== 0) return invalidInput("This tool does not accept arguments");
      if (options?.signal?.aborted) return { ok: false, persisted: false, error: { code: "CANCELLED", message: "The workspace read was cancelled", retryable: true } };
      try {
        const workspace = await engine.adapter.readWorkspace();
        if (options?.signal?.aborted) return { ok: false, persisted: false, error: { code: "CANCELLED", message: "The workspace read was cancelled", retryable: true } };
        const snapshot = engine.snapshot;
        return {
          ok: true, persisted: false,
          configurator: { id: manifest.id, version: manifest.version, displayName: manifest.displayName, productType: manifest.productType }, workspace,
          pendingProposal: snapshot.proposalId === null ? null : { proposalId: snapshot.proposalId, proposalRevision: snapshot.proposalRevision, baseRevision: snapshot.baseRevision, status: snapshot.status, previewStatus: snapshot.previewStatus, persisted: false },
          capabilities: { variantOperations: [...manifest.variantPolicy.operations], assetSlots: manifest.assetSlots.map((slot) => slot.id), previewSurfaces: manifest.previewSurfaces.map((surface) => surface.id) },
        };
      } catch { return adapterFailure("The public workspace could not be read safely"); }
    },
  };

  const capabilitiesTool: WebMcpTool = {
    name: "codesign_list_capabilities", title: "List customizer capabilities",
    description: "List declared customer controls, current availability, variants, temporary asset slots, preview surfaces, and public dependencies for the current customizer.",
    inputSchema: capabilitiesSchema(manifest), annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options) {
      const parsed = parseCapabilities(input, manifest);
      if (!parsed) return invalidInput("The capability request did not match the bounded public schema");
      if (options?.signal?.aborted) return { ok: false, persisted: false, error: { code: "CANCELLED", message: "The capability read was cancelled", retryable: true } };
      try {
        const workspace = engine.proposedWorkspace ?? await engine.adapter.readWorkspace();
        if (!targetExists(workspace, parsed)) return { ok: false, persisted: false, error: { code: "UNKNOWN_TARGET", message: "The requested visible target is unavailable", retryable: false } };
        const categories = new Set(parsed.categories ?? ["controls", "variants", "assets", "previews", "dependencies"] as CapabilityCategory[]);
        const dynamic = categories.has("controls")
          ? await engine.adapter.listAvailability({ ...(parsed.variantId ? { variantId: parsed.variantId } : {}), ...(parsed.elementId ? { elementId: parsed.elementId } : {}), ...(parsed.controlIds ? { controlIds: parsed.controlIds } : {}) })
          : { committedRevision: workspace.committedRevision, controls: [] };
        const availability = new Map(dynamic.controls.map((control) => [control.controlId, control]));
        const requested = parsed.controlIds ? new Set(parsed.controlIds) : null;
        return {
          ok: true, persisted: false, committedRevision: dynamic.committedRevision,
          target: { variantId: parsed.variantId ?? null, elementId: parsed.elementId ?? null },
          ...(categories.has("controls") ? { controls: manifest.controls.filter((control) => !requested || requested.has(control.id)).map((control) => controlCapability(control, availability)) } : {}),
          ...(categories.has("variants") ? { variantPolicy: structuredClone(manifest.variantPolicy) } : {}),
          ...(categories.has("assets") ? { assetSlots: structuredClone(manifest.assetSlots) } : {}),
          ...(categories.has("previews") ? { previewSurfaces: structuredClone(manifest.previewSurfaces) } : {}),
          ...(categories.has("dependencies") ? { dependencies: structuredClone(manifest.dependencyDescriptions) } : {}),
        };
      } catch { return adapterFailure("The public capabilities could not be listed safely"); }
    },
  };

  const stageTool: WebMcpTool = {
    name: "codesign_stage_asset", title: "Stage temporary product artwork",
    description: "Stage one bounded asset for a declared customizer slot. Returns an opaque temporary handle; it does not create a normal upload or save the product.",
    inputSchema: stageAssetSchema(manifest), annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) { return publicResult(await engine.stageAsset(input, options?.signal ? { signal: options.signal } : {})); },
  };

  const applyTool: WebMcpTool = {
    name: "codesign_apply_proposal", title: "Apply a temporary custom-product proposal",
    description: "Apply one atomic batch of typed customer changes to the merchant's visible renderer. Nothing persists until a person uses the visible page Keep control.",
    inputSchema: applyProposalSchema(manifest), annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) { return publicResult(await engine.apply(input, options?.signal ? { signal: options.signal } : {})); },
  };

  const previewsTool: WebMcpTool = {
    name: "codesign_get_previews", title: "Get current proposal previews",
    description: "Capture verified renderer images for the exact current proposal revision and requested variants. A stale image is never returned as current.",
    inputSchema: previewSchema(manifest), annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options) {
      const result = await engine.capturePreviews(input, options?.signal ? { signal: options.signal } : {});
      if (!result.ok) return publicResult(result);
      const validation = await engine.validate({ proposalId: result.proposalId, proposalRevision: result.proposalRevision }, options?.signal ? { signal: options.signal } : {});
      if (!validation.ok) return publicResult(validation);
      return { ...result, validation: validation.validation };
    },
  };

  const validateTool: WebMcpTool = {
    name: "codesign_validate_proposal", title: "Validate custom-product readiness",
    description: "Validate the committed workspace or one exact temporary proposal with merchant-authoritative configuration and production-readiness rules. This never persists changes.",
    inputSchema: VALIDATE_SCHEMA, annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input, options) { return publicResult(await engine.validate(input, options?.signal ? { signal: options.signal } : {})); },
  };

  return [readTool, capabilitiesTool, stageTool, applyTool, previewsTool, validateTool];
}

export function registerCoDesignTools<Snapshot, PrivateAsset>(document: DocumentWithModelContext, dependencies: CoDesignToolDependencies<Snapshot, PrivateAsset>): WebMcpRegistration {
  const controller = new AbortController();
  if (dependencies.enabled === false) return { supported: false, toolNames: [], reason: "disabled", unregister: () => controller.abort(), ready: Promise.resolve() };
  let tools: WebMcpTool[];
  try { tools = createCoDesignTools(dependencies); } catch {
    return { supported: false, toolNames: [], reason: "invalid-manifest", unregister: () => controller.abort(), ready: Promise.resolve() };
  }
  if (!document.modelContext?.registerTool) return { supported: false, toolNames: [], reason: "unsupported-host", unregister: () => controller.abort(), ready: Promise.resolve() };
  const ready = Promise.all(tools.map((tool) => Promise.resolve().then(() => document.modelContext!.registerTool(tool, { signal: controller.signal }))))
    .then(() => undefined)
    .catch(() => { controller.abort(); throw new Error("WebMCP tool registration failed"); });
  let unregistered = false;
  return {
    supported: true,
    toolNames: tools.map((tool) => tool.name),
    unregister() {
      if (unregistered) return;
      unregistered = true;
      controller.abort();
      void dependencies.engine.destroy();
    },
    ready,
  };
}
