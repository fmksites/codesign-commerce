import type { ProposalSession } from "./proposal-session.js";
import type {
  ConfigurationChange,
  ConfiguratorAdapter,
  ConfiguratorManifest,
  JsonPrimitive,
  ProposalInput,
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
  execute(input: Input, options: WebMcpExecuteOptions): Promise<Output>;
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

export function createCoDesignTools<Snapshot>(dependencies: CoDesignToolDependencies<Snapshot>): WebMcpTool[] {
  const { adapter, manifest, session } = dependencies;

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
      if (!parsed) {
        return {
          ok: false,
          persisted: false,
          error: {
            code: "INVALID_INPUT",
            message: "The proposal input did not match the bounded public schema",
            retryable: false,
            affectedOptions: [],
          },
        };
      }
      return session.propose(parsed, options.signal === undefined ? {} : { signal: options.signal });
    },
  };

  return [readTool, proposeTool];
}

export function registerCoDesignTools<Snapshot>(documentLike: DocumentWithModelContext, dependencies: CoDesignToolDependencies<Snapshot>): WebMcpRegistration {
  const controller = new AbortController();
  const tools = createCoDesignTools(dependencies);
  if (!documentLike.modelContext?.registerTool) {
    return { supported: false, toolNames: [], unregister: () => controller.abort(), ready: Promise.resolve() };
  }

  const ready = Promise.all(tools.map((tool) => documentLike.modelContext!.registerTool(tool, { signal: controller.signal }))).then(() => undefined);
  return {
    supported: true,
    toolNames: tools.map((tool) => tool.name),
    unregister: () => controller.abort(),
    ready,
  };
}
