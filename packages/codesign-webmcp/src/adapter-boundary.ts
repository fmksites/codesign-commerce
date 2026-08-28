import { isSafeIdentifier } from "./manifest.js";
import type {
  AssetStatus,
  CommitMetadata,
  CommitResult,
  ConfigurationAsset,
  ConfigurationDesign,
  ConfigurationState,
  ConfiguratorAdapter,
  ConfiguratorManifest,
  CreateDesignDraftRequest,
  CreateDesignDraftResult,
  JsonPrimitive,
  ControlDefinition,
  OptionRequest,
  OptionResult,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

const ASSET_STATUSES = new Set<AssetStatus>(["missing", "placeholder", "ready"]);
const VALIDATION_SEVERITIES = new Set(["constraint-error", "decision-required", "warning", "information"]);
const MAX_STATE_DESIGNS = 20;
const MAX_ASSETS_PER_DESIGN = 20;
const MAX_VALIDATION_ISSUES = 100;
const MAX_ASSUMPTIONS = 20;

export class AdapterBoundaryError extends Error {
  constructor() {
    super("Adapter output did not match the public canonical contract");
    this.name = "AdapterBoundaryError";
  }
}

function fail(): never {
  throw new AdapterBoundaryError();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function stringValue(value: unknown, maximumLength: number, safeIdentifier = false, allowEmpty = false): string {
  if (typeof value !== "string" || (!allowEmpty && value.length < 1) || value.length > maximumLength) return fail();
  if (safeIdentifier && !isSafeIdentifier(value)) return fail();
  return value;
}

function integerValue(value: unknown, minimum?: number, maximum?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) return fail();
  if (minimum !== undefined && value < minimum) return fail();
  if (maximum !== undefined && value > maximum) return fail();
  return value;
}

function primitiveValue(value: unknown): JsonPrimitive {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return fail();
}

function publicOptionValue(option: ControlDefinition, value: unknown): JsonPrimitive {
  const primitive = primitiveValue(value);
  switch (option.kind) {
    case "enum":
    case "color":
      if (typeof primitive !== "string" || !option.values?.some((candidate) => candidate.id === primitive)) return fail();
      return primitive;
    case "integer":
      return integerValue(primitive, option.minimum, option.maximum);
    case "number":
    case "scale":
    case "rotation":
      if (typeof primitive !== "number" || !Number.isFinite(primitive)) return fail();
      if (option.minimum !== undefined && primitive < option.minimum) return fail();
      if (option.maximum !== undefined && primitive > option.maximum) return fail();
      return primitive;
    case "boolean":
      if (typeof primitive !== "boolean") return fail();
      return primitive;
    case "text":
      if (typeof primitive !== "string" || primitive.length > (option.maximumLength ?? 1_000)) return fail();
      return primitive;
    case "asset":
      if (typeof primitive !== "string" || !isSafeIdentifier(primitive)) return fail();
      return primitive;
    case "position-2d":
      return fail();
  }
}

function stringArray(
  value: unknown,
  maximumItems: number,
  maximumLength: number,
  allowed?: ReadonlySet<string>,
  safeIdentifiers = false,
  allowEmpty = false,
): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > maximumItems) return fail();
  const result: string[] = [];
  for (const entry of value) {
    const parsed = stringValue(entry, maximumLength, safeIdentifiers, allowEmpty);
    if (allowed && !allowed.has(parsed)) return fail();
    if (!result.includes(parsed)) result.push(parsed);
  }
  return result;
}

function sanitizeAsset(value: unknown): ConfigurationAsset {
  if (!isRecord(value)) return fail();
  const status = value.status;
  if (typeof status !== "string" || !ASSET_STATUSES.has(status as AssetStatus) || value.agentWritable !== false) return fail();
  return {
    slot: stringValue(value.slot, 128, true),
    status: status as AssetStatus,
    agentWritable: false,
  };
}

export function sanitizeConfigurationState(value: unknown, manifest: ConfiguratorManifest): ConfigurationState {
  if (!isRecord(value) || !isRecord(value.order) || !Array.isArray(value.designs)) return fail();
  if (value.designs.length < manifest.variantPolicy.minimumVariants || value.designs.length > Math.min(MAX_STATE_DESIGNS, manifest.variantPolicy.maximumVariants)) return fail();

  const totalOption = manifest.controls.find((option) => option.role === "workspace-total");
  const quantityOption = manifest.controls.find((option) => option.role === "variant-quantity");
  const nameOption = manifest.controls.find((option) => option.role === "variant-name");
  if (!totalOption || !quantityOption) return fail();
  const selectionOptions = manifest.controls.filter((option) => (option.scope === "variant" || option.scope === "element") && (option.role === undefined || option.role === "selection"));

  const designs: ConfigurationDesign[] = value.designs.map((candidate) => {
    if (!isRecord(candidate) || !isRecord(candidate.selections) || !Array.isArray(candidate.assets)) return fail();
    if (candidate.assets.length > MAX_ASSETS_PER_DESIGN) return fail();
    const selections: Record<string, JsonPrimitive> = {};
    for (const option of selectionOptions) {
      if (Object.prototype.hasOwnProperty.call(candidate.selections, option.id)) {
        selections[option.id] = publicOptionValue(option, candidate.selections[option.id]);
      }
    }
    return {
      id: stringValue(candidate.id, 128, true),
      name: stringValue(candidate.name, nameOption?.maximumLength ?? 1_000, false, true),
      quantity: integerValue(candidate.quantity, quantityOption.minimum, quantityOption.maximum),
      selections,
      assets: candidate.assets.map(sanitizeAsset),
    };
  });

  if (new Set(designs.map((design) => design.id)).size !== designs.length) return fail();
  const activeDesignId = stringValue(value.activeDesignId, 128, true);
  if (!designs.some((design) => design.id === activeDesignId)) return fail();
  if (value.configuratorId !== manifest.id || value.manifestVersion !== manifest.version) return fail();

  return {
    configuratorId: manifest.id,
    manifestVersion: manifest.version,
    revision: stringValue(value.revision, 200),
    activeDesignId,
    order: { totalQuantity: integerValue(value.order.totalQuantity, totalOption.minimum, totalOption.maximum) },
    designs,
  };
}

export function sanitizeOptionResult(value: unknown, manifest: ConfiguratorManifest): OptionResult {
  if (!isRecord(value) || !Array.isArray(value.options) || value.options.length > manifest.controls.length) return fail();
  const optionsById = new Map(manifest.controls.map((option) => [option.id, option]));
  const seen = new Set<string>();
  const options = value.options.map((candidate) => {
    if (!isRecord(candidate)) return fail();
    const optionId = stringValue(candidate.optionId, 128, true);
    const manifestOption = optionsById.get(optionId);
    if (!manifestOption || seen.has(optionId) || typeof candidate.allowed !== "boolean") return fail();
    seen.add(optionId);

    let values;
    if (candidate.values !== undefined) {
      if (!Array.isArray(candidate.values) || !manifestOption.values) return fail();
      const publicValues = new Map(manifestOption.values.map((entry) => [entry.id, entry]));
      const valueIds = candidate.values.map((entry) => {
        if (!isRecord(entry)) return fail();
        return stringValue(entry.id, 128, true);
      });
      if (new Set(valueIds).size !== valueIds.length || valueIds.some((id) => !publicValues.has(id))) return fail();
      values = valueIds.map((id) => ({ ...publicValues.get(id)! }));
    }

    return {
      optionId,
      allowed: candidate.allowed,
      ...(values === undefined ? {} : { values }),
      ...(candidate.reason === undefined ? {} : { reason: stringValue(candidate.reason, 500) }),
    };
  });
  return { revision: stringValue(value.revision, 200), options };
}

export function sanitizeValidationResult(
  value: unknown,
  manifest: ConfiguratorManifest,
  state?: ConfigurationState,
): ValidationResult {
  if (!isRecord(value) || typeof value.configurationValid !== "boolean" || typeof value.productionReady !== "boolean") return fail();
  if (value.productionReady && !value.configurationValid) return fail();
  if (!Array.isArray(value.issues) || value.issues.length > MAX_VALIDATION_ISSUES) return fail();
  const optionIds = new Set(manifest.controls.map((option) => option.id));
  const designIds = state ? new Set(state.designs.map((design) => design.id)) : undefined;
  const issues: ValidationIssue[] = value.issues.map((candidate) => {
    if (!isRecord(candidate) || typeof candidate.severity !== "string" || !VALIDATION_SEVERITIES.has(candidate.severity)) return fail();
    const affectedOptions = stringArray(candidate.optionIds, 30, 128, optionIds, true);
    const affectedDesigns = stringArray(candidate.designIds, 20, 128, designIds, true);
    return {
      code: stringValue(candidate.code, 128, true),
      severity: candidate.severity as ValidationIssue["severity"],
      message: stringValue(candidate.message, 1_000),
      ...(affectedOptions === undefined ? {} : { optionIds: affectedOptions }),
      ...(affectedDesigns === undefined ? {} : { designIds: affectedDesigns }),
    };
  });
  const assumptions = stringArray(value.assumptions, MAX_ASSUMPTIONS, 500, undefined, false, true);
  if (!assumptions) return fail();
  return {
    configurationValid: value.configurationValid,
    productionReady: value.productionReady,
    issues,
    assumptions,
  };
}

function sanitizeCommitResult(value: unknown): CommitResult {
  if (!isRecord(value) || typeof value.localPersisted !== "boolean" || typeof value.serverPersisted !== "boolean") return fail();
  const revision = stringValue(value.revision, 200);
  if (value.localPersisted && value.serverPersisted) return { revision, localPersisted: true, serverPersisted: true };
  if (value.localPersisted && !value.serverPersisted) {
    return { revision, localPersisted: true, serverPersisted: false, errorCode: stringValue(value.errorCode, 128, true) };
  }
  if (!value.localPersisted && !value.serverPersisted && value.errorCode === "STALE_REVISION") {
    return { revision, localPersisted: false, serverPersisted: false, errorCode: "STALE_REVISION" };
  }
  return fail();
}

export class GuardedConfiguratorAdapter<Snapshot = unknown> implements ConfiguratorAdapter<Snapshot> {
  readonly createDesignDraft?: (state: ConfigurationState, request: CreateDesignDraftRequest) => Promise<CreateDesignDraftResult>;
  readonly #manifest: ConfiguratorManifest;
  readonly #raw: ConfiguratorAdapter<Snapshot>;

  constructor(manifest: ConfiguratorManifest, raw: ConfiguratorAdapter<Snapshot>) {
    this.#manifest = manifest;
    this.#raw = raw;
    if (raw.createDesignDraft) {
      this.createDesignDraft = async (state, request) => {
        const result = await raw.createDesignDraft!(structuredClone(state), request);
        if (!isRecord(result)) return fail();
        return {
          designId: stringValue(result.designId, 128, true),
          state: sanitizeConfigurationState(result.state, this.#manifest),
        };
      };
    }
  }

  async readState(): Promise<ConfigurationState> {
    return sanitizeConfigurationState(await this.#raw.readState(), this.#manifest);
  }

  async listOptions(request: OptionRequest): Promise<OptionResult> {
    return sanitizeOptionResult(await this.#raw.listOptions(request), this.#manifest);
  }

  async quiescePersistence(): Promise<void> { await this.#raw.quiescePersistence(); }
  async captureSnapshot(): Promise<Snapshot> { return this.#raw.captureSnapshot(); }

  async previewState(state: ConfigurationState): Promise<void> {
    await this.#raw.previewState(structuredClone(state));
  }

  async validateState(state: ConfigurationState): Promise<ValidationResult> {
    return sanitizeValidationResult(await this.#raw.validateState(structuredClone(state)), this.#manifest, state);
  }

  async restoreSnapshot(snapshot: Snapshot): Promise<void> { await this.#raw.restoreSnapshot(snapshot); }

  async commitState(state: ConfigurationState, metadata: CommitMetadata): Promise<CommitResult> {
    return sanitizeCommitResult(await this.#raw.commitState(structuredClone(state), { ...metadata }));
  }

  subscribeToExternalChanges(listener: (revision: string) => void): () => void {
    return this.#raw.subscribeToExternalChanges((revision) => {
      if (typeof revision === "string" && revision.length > 0 && revision.length <= 200) listener(revision);
      else listener("invalid-adapter-revision");
    });
  }
}
