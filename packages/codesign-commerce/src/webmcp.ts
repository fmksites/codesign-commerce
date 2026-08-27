import type { ProposalSession } from "./proposal-session.js";
import { validateManifest } from "./manifest.js";
import type {
  ConfigurationChange,
  ConfiguratorAdapter,
  ConfiguratorManifest,
  CreateDesignInput,
  JsonPrimitive,
  OptionRequest,
  ProposalInput,
  ValidateConfigurationInput,
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
  unregister(): void;
  ready: Promise<void>;
}

export interface CoDesignToolDependencies<Snapshot = unknown> {
  manifest: ConfiguratorManifest;
  adapter: ConfiguratorAdapter<Snapshot>;
  session: ProposalSession<Snapshot>;
}

const EMPTY_OBJECT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

const VALUE_SCHEMA: JsonSchema = {
  oneOf: [
    { type: "string", maxLength: 1000 },
    { type: "integer" },
    { type: "boolean" },
    { type: "null" },
  ],
};

function proposalInputSchema(manifest: ConfiguratorManifest): JsonSchema {
  const writableOptionIds = manifest.optionGroups.filter((option) => option.agentWritable).map((option) => option.id);
  return {
    type: "object",
    properties: {
      baseRevision: { type: "string", minLength: 1, maxLength: 200 },
      proposalId: { type: "string", minLength: 1, maxLength: 200 },
      proposalRevision: { type: "integer", minimum: 1 },
      operationId: { type: "string", minLength: 1, maxLength: 80, pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]*$" },
      changes: {
        type: "array",
        minItems: 1,
        maxItems: 40,
        items: {
          type: "object",
          properties: {
            designId: { type: "string", minLength: 1, maxLength: 128 },
            optionId: { type: "string", enum: writableOptionIds },
            value: VALUE_SCHEMA,
          },
          required: ["optionId", "value"],
          additionalProperties: false,
        },
      },
      assumptions: {
        type: "array",
        maxItems: 20,
        items: { type: "string", maxLength: 500 },
      },
    },
    required: ["baseRevision", "operationId", "changes"],
    additionalProperties: false,
  };
}

function optionRequestSchema(manifest: ConfiguratorManifest): JsonSchema {
  return {
    type: "object",
    properties: {
      designId: { type: "string", minLength: 1, maxLength: 128 },
      optionIds: {
        type: "array",
        minItems: 1,
        maxItems: 30,
        uniqueItems: true,
        items: { type: "string", enum: manifest.optionGroups.map((option) => option.id) },
      },
    },
    additionalProperties: false,
  };
}

function createDesignInputSchema(manifest: ConfiguratorManifest): JsonSchema {
  const writableOptionIds = manifest.optionGroups.filter((option) => option.agentWritable).map((option) => option.id);
  const writableDesignOptionIds = manifest.optionGroups
    .filter((option) => option.agentWritable && option.scope === "design")
    .map((option) => option.id);
  return {
    type: "object",
    properties: {
      baseRevision: { type: "string", minLength: 1, maxLength: 200 },
      proposalId: { type: "string", minLength: 1, maxLength: 200 },
      proposalRevision: { type: "integer", minimum: 1 },
      operationId: { type: "string", minLength: 1, maxLength: 80, pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]*$" },
      sourceDesignId: { type: "string", minLength: 1, maxLength: 128 },
      changes: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          properties: {
            designId: { type: "string", minLength: 1, maxLength: 128 },
            optionId: { type: "string", enum: writableOptionIds },
            value: VALUE_SCHEMA,
          },
          required: ["optionId", "value"],
          additionalProperties: false,
        },
      },
      newDesignChanges: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          properties: {
            optionId: { type: "string", enum: writableDesignOptionIds },
            value: VALUE_SCHEMA,
          },
          required: ["optionId", "value"],
          additionalProperties: false,
        },
      },
      assumptions: {
        type: "array",
        maxItems: 20,
        items: { type: "string", maxLength: 500 },
      },
    },
    required: ["baseRevision", "operationId", "sourceDesignId", "newDesignChanges"],
    additionalProperties: false,
  };
}

const VALIDATE_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    proposalId: { type: "string", minLength: 1, maxLength: 200 },
    proposalRevision: { type: "integer", minimum: 1 },
  },
  additionalProperties: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isJsonPrimitive(value: unknown): value is JsonPrimitive {
  return value === null || typeof value === "string" || (typeof value === "number" && Number.isFinite(value)) || typeof value === "boolean";
}

function parseProposalInput(value: unknown): ProposalInput | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["baseRevision", "proposalId", "proposalRevision", "operationId", "changes", "assumptions"])) return null;
  if (typeof value.baseRevision !== "string" || value.baseRevision.length < 1 || value.baseRevision.length > 200) return null;
  if (typeof value.operationId !== "string" || value.operationId.length < 1 || value.operationId.length > 80) return null;
  if (value.proposalId !== undefined && (typeof value.proposalId !== "string" || value.proposalId.length < 1 || value.proposalId.length > 200)) return null;
  if (value.proposalRevision !== undefined && (!Number.isInteger(value.proposalRevision) || (value.proposalRevision as number) < 1)) return null;
  if (!Array.isArray(value.changes) || value.changes.length < 1 || value.changes.length > 40) return null;

  const changes: ConfigurationChange[] = [];
  for (const candidate of value.changes) {
    if (!isRecord(candidate) || !hasOnlyKeys(candidate, ["designId", "optionId", "value"])) return null;
    if (candidate.designId !== undefined && (typeof candidate.designId !== "string" || candidate.designId.length < 1 || candidate.designId.length > 128)) return null;
    if (typeof candidate.optionId !== "string" || !isJsonPrimitive(candidate.value)) return null;
    changes.push({
      ...(candidate.designId === undefined ? {} : { designId: candidate.designId }),
      optionId: candidate.optionId,
      value: candidate.value,
    });
  }

  let assumptions: string[] | undefined;
  if (value.assumptions !== undefined) {
    if (!Array.isArray(value.assumptions) || value.assumptions.length > 20 || !value.assumptions.every((entry) => typeof entry === "string" && entry.length <= 500)) return null;
    assumptions = value.assumptions;
  }

  return {
    baseRevision: value.baseRevision,
    operationId: value.operationId,
    changes,
    ...(value.proposalId === undefined ? {} : { proposalId: value.proposalId as string }),
    ...(value.proposalRevision === undefined ? {} : { proposalRevision: value.proposalRevision as number }),
    ...(assumptions === undefined ? {} : { assumptions }),
  };
}

function parseOptionRequest(value: unknown, manifest: ConfiguratorManifest): OptionRequest | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["designId", "optionIds"])) return null;
  if (value.designId !== undefined && (typeof value.designId !== "string" || value.designId.length < 1 || value.designId.length > 128)) return null;
  const knownOptions = new Set(manifest.optionGroups.map((option) => option.id));
  if (
    value.optionIds !== undefined
    && (
      !Array.isArray(value.optionIds)
      || value.optionIds.length < 1
      || value.optionIds.length > 30
      || new Set(value.optionIds).size !== value.optionIds.length
      || !value.optionIds.every((entry) => typeof entry === "string" && knownOptions.has(entry))
    )
  ) return null;
  return {
    ...(value.designId === undefined ? {} : { designId: value.designId as string }),
    ...(value.optionIds === undefined ? {} : { optionIds: value.optionIds as string[] }),
  };
}

function parseChanges(value: unknown, includeDesignId: boolean): ConfigurationChange[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const changes: ConfigurationChange[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate) || !hasOnlyKeys(candidate, includeDesignId ? ["designId", "optionId", "value"] : ["optionId", "value"])) return null;
    if (includeDesignId && candidate.designId !== undefined && (typeof candidate.designId !== "string" || candidate.designId.length < 1 || candidate.designId.length > 128)) return null;
    if (typeof candidate.optionId !== "string" || !isJsonPrimitive(candidate.value)) return null;
    changes.push({
      ...(includeDesignId && candidate.designId !== undefined ? { designId: candidate.designId as string } : {}),
      optionId: candidate.optionId,
      value: candidate.value,
    });
  }
  return changes;
}

function parseCreateDesignInput(value: unknown, manifest: ConfiguratorManifest): CreateDesignInput | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["baseRevision", "proposalId", "proposalRevision", "operationId", "sourceDesignId", "changes", "newDesignChanges", "assumptions"])) return null;
  if (typeof value.baseRevision !== "string" || value.baseRevision.length < 1 || value.baseRevision.length > 200) return null;
  if (typeof value.operationId !== "string" || value.operationId.length < 1 || value.operationId.length > 80) return null;
  if (typeof value.sourceDesignId !== "string" || value.sourceDesignId.length < 1 || value.sourceDesignId.length > 128) return null;
  if (value.proposalId !== undefined && (typeof value.proposalId !== "string" || value.proposalId.length < 1 || value.proposalId.length > 200)) return null;
  if (value.proposalRevision !== undefined && (!Number.isInteger(value.proposalRevision) || (value.proposalRevision as number) < 1)) return null;
  const changes = value.changes === undefined ? [] : parseChanges(value.changes, true);
  const newDesignChanges = parseChanges(value.newDesignChanges, false);
  if (!changes || !newDesignChanges || changes.length + newDesignChanges.length > 40) return null;
  const writableOptions = new Set(manifest.optionGroups.filter((option) => option.agentWritable).map((option) => option.id));
  const writableDesignOptions = new Set(manifest.optionGroups.filter((option) => option.agentWritable && option.scope === "design").map((option) => option.id));
  if (changes.some((change) => !writableOptions.has(change.optionId)) || newDesignChanges.some((change) => !writableDesignOptions.has(change.optionId))) return null;

  let assumptions: string[] | undefined;
  if (value.assumptions !== undefined) {
    if (!Array.isArray(value.assumptions) || value.assumptions.length > 20 || !value.assumptions.every((entry) => typeof entry === "string" && entry.length <= 500)) return null;
    assumptions = value.assumptions;
  }
  return {
    baseRevision: value.baseRevision,
    operationId: value.operationId,
    sourceDesignId: value.sourceDesignId,
    newDesignChanges,
    ...(changes.length === 0 ? {} : { changes }),
    ...(value.proposalId === undefined ? {} : { proposalId: value.proposalId as string }),
    ...(value.proposalRevision === undefined ? {} : { proposalRevision: value.proposalRevision as number }),
    ...(assumptions === undefined ? {} : { assumptions }),
  };
}

function parseValidateInput(value: unknown): ValidateConfigurationInput | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["proposalId", "proposalRevision"])) return null;
  if (value.proposalId !== undefined && (typeof value.proposalId !== "string" || value.proposalId.length < 1 || value.proposalId.length > 200)) return null;
  if (value.proposalRevision !== undefined && (!Number.isInteger(value.proposalRevision) || (value.proposalRevision as number) < 1)) return null;
  return {
    ...(value.proposalId === undefined ? {} : { proposalId: value.proposalId as string }),
    ...(value.proposalRevision === undefined ? {} : { proposalRevision: value.proposalRevision as number }),
  };
}

function invalidInput(message: string) {
  return {
    ok: false,
    persisted: false,
    error: { code: "INVALID_INPUT", message, retryable: false, affectedOptions: [] },
  };
}

function adapterFailure(message: string) {
  return {
    ok: false,
    persisted: false,
    error: { code: "ADAPTER_FAILURE", message, retryable: true, affectedOptions: [] },
  };
}

export function createCoDesignTools<Snapshot>(dependencies: CoDesignToolDependencies<Snapshot>): WebMcpTool[] {
  const { session } = dependencies;
  const manifest = validateManifest(structuredClone(session.manifest));
  const adapter = session.adapter;

  const readTool: WebMcpTool = {
    name: "codesign_read_configuration",
    title: "Read product configuration",
    description: "Read the current allowlisted made-to-order configuration and revision before proposing changes. This tool never saves, orders, quotes, or exposes pricing.",
    inputSchema: EMPTY_OBJECT_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      if (!isRecord(input) || Object.keys(input).length !== 0) {
        return { ok: false, persisted: false, error: { code: "INVALID_INPUT", message: "This tool does not accept arguments", retryable: false } };
      }
      try {
        const state = await adapter.readState();
        return {
          ok: true,
          state,
          capabilities: manifest.capabilities,
          pendingProposal: session.proposalId === null
            ? null
            : {
                proposalId: session.proposalId,
                proposalRevision: session.proposalRevision,
                status: session.status,
                persisted: false,
              },
        };
      } catch {
        return adapterFailure("The public configuration could not be read safely");
      }
    },
  };

  const listOptionsTool: WebMcpTool = {
    name: "codesign_list_options",
    title: "List configuration options",
    description: "List allowlisted option values, public dependencies, and current availability for the visible made-to-order configuration. This tool never saves or exposes pricing.",
    inputSchema: optionRequestSchema(manifest),
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      const parsed = parseOptionRequest(input, manifest);
      if (!parsed) return invalidInput("The option request did not match the bounded public schema");
      try {
        const state = session.proposedState ?? await adapter.readState();
        if (parsed.designId && !state.designs.some((design) => design.id === parsed.designId)) {
          return {
            ok: false,
            persisted: false,
            currentRevision: state.revision,
            error: { code: "UNKNOWN_DESIGN", message: `Unknown design ${parsed.designId}`, retryable: false, affectedOptions: parsed.optionIds ?? [] },
          };
        }
        const dynamic = await adapter.listOptions(parsed);
        const availability = new Map(dynamic.options.map((option) => [option.optionId, option]));
        const requested = parsed.optionIds ? new Set(parsed.optionIds) : null;
        return {
          ok: true,
          revision: dynamic.revision,
          designId: parsed.designId ?? null,
          options: manifest.optionGroups
            .filter((option) => !requested || requested.has(option.id))
            .map((option) => {
              const current = availability.get(option.id);
              return {
                optionId: option.id,
                label: option.label,
                agentDescription: option.agentDescription,
                scope: option.scope,
                kind: option.kind,
                role: option.role ?? "selection",
                agentWritable: option.agentWritable,
                allowed: current?.allowed ?? true,
                values: current?.values ?? option.values ?? [],
                ...(current?.reason === undefined ? {} : { reason: current.reason }),
                ...(option.minimum === undefined ? {} : { minimum: option.minimum }),
                ...(option.maximum === undefined ? {} : { maximum: option.maximum }),
                ...(option.maximumLength === undefined ? {} : { maximumLength: option.maximumLength }),
              };
            }),
          dependencies: manifest.dependencyRules,
        };
      } catch {
        return adapterFailure("The public option list could not be read safely");
      }
    },
  };

  const proposeTool: WebMcpTool = {
    name: "codesign_propose_configuration",
    title: "Propose product configuration changes",
    description: "Temporarily apply one atomic batch of allowlisted changes to existing designs in the merchant's visible preview. Nothing is saved; a person must choose Keep or Revert in the page.",
    inputSchema: proposalInputSchema(manifest),
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) {
      const parsed = parseProposalInput(input);
      if (!parsed) return invalidInput("The proposal input did not match the bounded public schema");
      return session.propose(parsed, options?.signal === undefined ? {} : { signal: options.signal });
    },
  };

  const createDesignTool: WebMcpTool = {
    name: "codesign_create_design",
    title: "Create a design or colourway",
    description: "Clone one existing design inside the current temporary proposal and apply coordinated, allowlisted overrides. This does not create a Shopify product or save anything; a person must choose Keep or Revert in the page.",
    inputSchema: createDesignInputSchema(manifest),
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input, options) {
      const parsed = parseCreateDesignInput(input, manifest);
      if (!parsed) return invalidInput("The design creation input did not match the bounded public schema");
      return session.createDesign(parsed, options?.signal === undefined ? {} : { signal: options.signal });
    },
  };

  const validateTool: WebMcpTool = {
    name: "codesign_validate_configuration",
    title: "Validate product configuration",
    description: "Validate the current committed configuration or open temporary proposal for consistency and production readiness. This tool never saves, orders, quotes, or accepts a proof.",
    inputSchema: VALIDATE_INPUT_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      const parsed = parseValidateInput(input);
      if (!parsed) return invalidInput("The validation request did not match the bounded public schema");
      return session.validateConfiguration(parsed);
    },
  };

  return [readTool, listOptionsTool, proposeTool, createDesignTool, validateTool];
}

export function registerCoDesignTools<Snapshot>(document: DocumentWithModelContext, dependencies: CoDesignToolDependencies<Snapshot>): WebMcpRegistration {
  const controller = new AbortController();
  const tools = createCoDesignTools(dependencies);
  if (!document.modelContext?.registerTool) {
    return { supported: false, toolNames: [], unregister: () => controller.abort(), ready: Promise.resolve() };
  }

  const ready = Promise.all(tools.map((tool) => document.modelContext!.registerTool(tool, { signal: controller.signal }))).then(() => undefined);
  return {
    supported: true,
    toolNames: tools.map((tool) => tool.name),
    unregister: () => controller.abort(),
    ready,
  };
}
