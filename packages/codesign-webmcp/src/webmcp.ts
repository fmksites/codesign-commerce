import { isSafeIdentifier, validateManifest } from "./manifest.js";
import { MAX_OPERATIONS_PER_BATCH, MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL } from "./operations.js";
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

const EMPTY_OBJECT_SCHEMA: JsonSchema = {
  type: "object",
  description: "No input. Read the current custom-product workspace before planning a design or refinement.",
  properties: {},
  additionalProperties: false,
};
const SAFE_ID_SCHEMA: JsonSchema = { type: "string", minLength: 1, maxLength: 200, pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]*$" };
const REVISION_SCHEMA: JsonSchema = { type: "string", minLength: 1, maxLength: 200 };
const POSITION_SCHEMA: JsonSchema = {
  type: "object",
  properties: { x: { type: "number" }, y: { type: "number" } },
  required: ["x", "y"],
  additionalProperties: false,
};
const CONTROL_VALUE_SCHEMA: JsonSchema = {
  description: "The bounded value for the declared customer-editable control. Use codesign_list_capabilities to discover its kind, choices, and limits.",
  oneOf: [
    { type: "string", maxLength: 1_000 },
    { type: "number", minimum: -1_000_000_000, maximum: 1_000_000_000 },
    { type: "boolean" },
    { type: "null" },
    POSITION_SCHEMA,
  ],
};
const TARGET_SCHEMA: JsonSchema = {
  description: "The exact visible workspace, variant, or element to change, using IDs returned by codesign_read_workspace or codesign_list_capabilities.",
  oneOf: [
    { type: "object", description: "Target a workspace-wide customer control.", properties: { scope: { type: "string", const: "workspace" } }, required: ["scope"], additionalProperties: false },
    { type: "object", description: "Target one visible product variant.", properties: { scope: { type: "string", const: "variant" }, variantId: { ...SAFE_ID_SCHEMA, description: "A current visible variant ID." } }, required: ["scope", "variantId"], additionalProperties: false },
    { type: "object", description: "Target one visible element inside a product variant.", properties: { scope: { type: "string", const: "element" }, variantId: { ...SAFE_ID_SCHEMA, description: "A current visible variant ID." }, elementId: { ...SAFE_ID_SCHEMA, description: "A current element ID within variantId." } }, required: ["scope", "variantId", "elementId"], additionalProperties: false },
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
    description: "Initial values for declared customer-editable controls. Omit controls that should retain their current value.",
    properties: Object.fromEntries(controls.map((control) => [control.id, {
      ...CONTROL_VALUE_SCHEMA,
      description: `Initial value for declared control ${control.id}. Use codesign_list_capabilities to discover its current choices and bounds.`,
    }])),
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
    description: "Set one declared customer-editable control on the visible workspace, variant, or element.",
    properties: {
      type: { type: "string", const: "set-control" },
      target: TARGET_SCHEMA,
      controlId: { type: "string", enum: valueControls, description: "A currently available writable control ID returned by codesign_list_capabilities." },
      value: CONTROL_VALUE_SCHEMA,
    },
    required: ["type", "target", "controlId", "value"],
    additionalProperties: false,
  });
  if (assetControls.length > 0) {
    operations.push({
      type: "object",
      description: "Attach one already-staged temporary shopper asset to a declared visible artwork control.",
      properties: { type: { type: "string", const: "attach-asset" }, target: TARGET_SCHEMA, controlId: { type: "string", enum: assetControls, description: "A currently available artwork control returned by codesign_list_capabilities." }, assetHandle: { ...SAFE_ID_SCHEMA, description: "The opaque temporary handle returned by codesign_stage_asset." } },
      required: ["type", "target", "controlId", "assetHandle"],
      additionalProperties: false,
    });
    operations.push({
      type: "object",
      description: "Remove artwork from a declared visible artwork control in the temporary proposal.",
      properties: { type: { type: "string", const: "remove-asset" }, target: TARGET_SCHEMA, controlId: { type: "string", enum: assetControls, description: "A currently available artwork control returned by codesign_list_capabilities." } },
      required: ["type", "target", "controlId"],
      additionalProperties: false,
    });
  }
  if (manifest.variantPolicy.operations.includes("create")) operations.push({
    type: "object",
    description: "Create one complete additional visible design or colourway when the manifest permits it.",
    properties: { type: { type: "string", const: "create-variant" }, variant: { ...variantSchema(manifest), description: "The complete new visible variant using declared IDs and controls." }, index: { type: "integer", minimum: 0, maximum: 20, description: "Optional zero-based display position." } },
    required: ["type", "variant"],
    additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("duplicate")) operations.push({
    type: "object",
    description: "Duplicate an existing visible design or colourway, then optionally name and initialize the new variant.",
    properties: {
      type: { type: "string", const: "duplicate-variant" }, sourceVariantId: { ...SAFE_ID_SCHEMA, description: "The current visible variant to copy." }, variantId: { ...SAFE_ID_SCHEMA, description: "A new unique safe ID for the copied variant." },
      name: { type: "string", maxLength: 1_000, description: "Optional shopper-facing name for the copied variant." }, index: { type: "integer", minimum: 0, maximum: 20, description: "Optional zero-based display position." },
      initialControls: controlRecordSchema(variantValueControls),
    },
    required: ["type", "sourceVariantId", "variantId"],
    additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("remove")) operations.push({
    type: "object", description: "Remove one visible design or colourway from the temporary proposal.", properties: { type: { type: "string", const: "remove-variant" }, variantId: { ...SAFE_ID_SCHEMA, description: "The current visible variant to remove." } }, required: ["type", "variantId"], additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("reorder")) operations.push({
    type: "object", description: "Move one visible design or colourway to a new display position.", properties: { type: { type: "string", const: "reorder-variant" }, variantId: { ...SAFE_ID_SCHEMA, description: "The current visible variant to move." }, index: { type: "integer", minimum: 0, maximum: 20, description: "The new zero-based display position." } }, required: ["type", "variantId", "index"], additionalProperties: false,
  });
  if (manifest.variantPolicy.operations.includes("set-active")) operations.push({
    type: "object", description: "Make one current design or colourway active in the visible renderer.", properties: { type: { type: "string", const: "set-active-variant" }, variantId: { ...SAFE_ID_SCHEMA, description: "The current visible variant to activate." } }, required: ["type", "variantId"], additionalProperties: false,
  });
  return { oneOf: operations.length > 0 ? operations : [{ type: "object", maxProperties: 0, additionalProperties: false }] };
}

function applyProposalSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    description: "Create or refine one temporary visible custom-product proposal. Read the workspace and relevant capabilities first.",
    properties: {
      baseRevision: { ...REVISION_SCHEMA, description: "The committed revision returned by codesign_read_workspace." },
      proposalId: { ...SAFE_ID_SCHEMA, description: "The current temporary proposal ID. Omit only when starting a new proposal." },
      proposalRevision: { type: "integer", minimum: 1, description: "The current temporary proposal revision. Omit only when starting a new proposal." },
      operationId: { ...SAFE_ID_SCHEMA, description: "A unique idempotency key for this exact coherent batch of requested changes." },
      operations: {
        type: "array",
        minItems: 1,
        maxItems: MAX_OPERATIONS_PER_BATCH,
        description: "All coordinated changes for this visible pass. The complete batch succeeds or fails atomically.",
        items: operationSchema(manifest),
      },
      assumptions: {
        type: "array",
        maxItems: 20,
        description: "Bounded shopper-visible assumptions used to complete the proposal without unnecessary clarification.",
        items: { type: "string", maxLength: 500 },
      },
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
    description: "Stage shopper-supplied artwork temporarily for a declared customizer slot before attaching it to a proposal.",
    properties: {
      baseRevision: { ...REVISION_SCHEMA, description: "The committed revision returned by codesign_read_workspace." },
      proposalId: { ...SAFE_ID_SCHEMA, description: "The current temporary proposal ID when refining an existing proposal." },
      proposalRevision: { type: "integer", minimum: 1, description: "The current temporary proposal revision when refining an existing proposal." },
      slotId: slots.length > 0
        ? { type: "string", enum: slots.map((slot) => slot.id), description: "The declared artwork slot returned by codesign_list_capabilities." }
        : { type: "string", maxLength: 0, description: "This customizer exposes no temporary artwork slot." },
      source: {
        description: "The bounded shopper-supplied artwork source. Never invent or fetch an undeclared source.",
        oneOf: sources.length > 0 ? sources : [{ type: "object", maxProperties: 0, additionalProperties: false }],
      },
      filename: { type: "string", minLength: 1, maxLength: 120, description: "Optional display filename for the supplied artwork." },
      altText: { type: "string", minLength: 1, maxLength: 300, description: "A concise visual description of the supplied artwork." },
    },
    required: ["baseRevision", "slotId", "source", "altText"],
    additionalProperties: false,
  };
}

function previewSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    description: "Capture inspectable images from the merchant renderer for one exact current temporary proposal revision.",
    properties: {
      proposalId: { ...SAFE_ID_SCHEMA, description: "The temporary proposal ID returned by codesign_apply_proposal." },
      proposalRevision: { type: "integer", minimum: 1, description: "The exact current proposal revision to render." },
      baseRevision: { ...REVISION_SCHEMA, description: "The committed base revision returned with the proposal." },
      variantIds: { type: "array", minItems: 1, maxItems: 20, uniqueItems: true, description: "Optional visible variants to include. Omit to capture all current variants.", items: SAFE_ID_SCHEMA },
      surfaceIds: { type: "array", minItems: 1, maxItems: 20, uniqueItems: true, description: "Optional declared preview surfaces to capture.", items: { type: "string", enum: manifest.previewSurfaces.map((surface) => surface.id) } },
    },
    required: ["proposalId", "proposalRevision", "baseRevision"],
    additionalProperties: false,
  };
}

const VALIDATE_SCHEMA: JsonSchema = {
  type: "object",
  description: "Validate the committed custom product or one exact temporary proposal using merchant-authoritative rules.",
  properties: {
    proposalId: { ...SAFE_ID_SCHEMA, description: "The temporary proposal to validate. Omit both fields to validate committed state." },
    proposalRevision: { type: "integer", minimum: 1, description: "The exact current temporary proposal revision." },
  },
  additionalProperties: false,
};

function capabilitiesSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    description: "Discover the controls and rules needed to translate an ordinary shopper design request into valid customizer operations.",
    properties: {
      variantId: { ...SAFE_ID_SCHEMA, description: "Optional visible variant whose currently available controls are needed." },
      elementId: { ...SAFE_ID_SCHEMA, description: "Optional element within variantId whose currently available controls are needed." },
      controlIds: { type: "array", minItems: 1, maxItems: 50, uniqueItems: true, description: "Optional control IDs to inspect. Omit to discover all customer-editable controls.", items: { type: "string", enum: manifest.controls.map((control) => control.id) } },
      categories: { type: "array", minItems: 1, maxItems: 5, uniqueItems: true, description: "Optional capability groups. Omit to read controls, variants, assets, previews, and dependencies together.", items: { type: "string", enum: ["controls", "variants", "assets", "previews", "dependencies"] } },
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
  OPERATION_LIMIT: "CAPABILITY_UNAVAILABLE",
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
    name: "codesign_read_workspace", title: "Inspect the current custom product",
    description: "Use this first whenever a shopper asks to design, customize, personalize, inspect, or refine the product on this page. Reads sanitized design state and temporary proposal status; never pricing, customer data, private snapshots, or raw artwork.",
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
          capabilities: {
            variantOperations: [...manifest.variantPolicy.operations],
            assetSlots: manifest.assetSlots.map((slot) => slot.id),
            previewSurfaces: manifest.previewSurfaces.map((surface) => surface.id),
            operationLimits: { perBatch: MAX_OPERATIONS_PER_BATCH, perProposal: MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL },
          },
        };
      } catch { return adapterFailure("The public workspace could not be read safely"); }
    },
  };

  const capabilitiesTool: WebMcpTool = {
    name: "codesign_list_capabilities", title: "Discover available design choices",
    description: "Use after reading the workspace when translating a shopper's brief or subjective art direction into valid changes. Lists customer-editable controls, current choices, variants, artwork slots, preview surfaces, and public dependencies without changing the design.",
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
          operationLimits: { perBatch: MAX_OPERATIONS_PER_BATCH, perProposal: MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL },
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
    name: "codesign_stage_asset", title: "Prepare supplied artwork temporarily",
    description: "Use only when a shopper has supplied a logo or artwork for this custom product. Stage it in a declared temporary slot before attaching it with codesign_apply_proposal. This creates no merchant upload and saves nothing.",
    inputSchema: stageAssetSchema(manifest), annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) { return publicResult(await engine.stageAsset(input, options?.signal ? { signal: options.signal } : {})); },
  };

  const applyTool: WebMcpTool = {
    name: "codesign_apply_proposal", title: "Create or refine the visible product design",
    description: `Use after reading the workspace and relevant capabilities to create or refine the shopper's requested custom product in the current page's visible renderer. Applies one atomic batch of up to ${MAX_OPERATIONS_PER_BATCH} changes; the proposal supports up to ${MAX_SUCCESSFUL_OPERATIONS_PER_PROPOSAL} successful operations. It stays temporary until a person uses the visible Keep control. Do not use for catalog, cart, checkout, quote, order, or payment requests.`,
    inputSchema: applyProposalSchema(manifest), annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) { return publicResult(await engine.apply(input, options?.signal ? { signal: options.signal } : {})); },
  };

  const previewsTool: WebMcpTool = {
    name: "codesign_get_previews", title: "Show the current product design previews",
    description: "Use after every coherent proposal or refinement so the shopper can inspect the actual product result in chat. Captures verified merchant-renderer images for the exact current proposal revision and requested variants; never returns a stale image as current and never saves.",
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
    name: "codesign_validate_proposal", title: "Check design and production readiness",
    description: "Use after creating or refining a proposal, or whenever the shopper asks whether a custom design is possible or production-ready. Applies merchant-authoritative rules to committed state or one exact temporary proposal; never changes or saves the design.",
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
