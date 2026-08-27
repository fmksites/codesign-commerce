import { isSafeIdentifier, validateManifest } from "./manifest.js";
import { sanitizeWorkspaceState } from "./workspace.js";
import type {
  AvailabilityRequest,
  AvailabilityResult,
  AssetResolver,
  CommitMetadata,
  CommitResult,
  ConfiguratorManifest,
  ControlChoice,
  ProposalContext,
  ProposalEndReason,
  WorkspaceAdapter,
  WorkspaceState,
  WorkspaceValidationIssue,
  WorkspaceValidationResult,
} from "./types.js";

const VALIDATION_SEVERITIES = new Set(["constraint-error", "decision-required", "warning", "information"]);
const MAX_ISSUES = 100;
const MAX_ASSUMPTIONS = 20;

export class WorkspaceAdapterBoundaryError extends Error {
  constructor() {
    super("Merchant adapter output did not match the public workspace contract");
    this.name = "WorkspaceAdapterBoundaryError";
  }
}

function fail(): never {
  throw new WorkspaceAdapterBoundaryError();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function boundedString(value: unknown, maximum: number, safe = false, allowEmpty = false): string {
  if (typeof value !== "string" || value.length > maximum || (!allowEmpty && value.length === 0)) return fail();
  if (safe && !isSafeIdentifier(value)) return fail();
  return value;
}

function boundedIdArray(value: unknown, maximum: number, allowed: ReadonlySet<string>): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > maximum) return fail();
  const result: string[] = [];
  for (const id of value) {
    const parsed = boundedString(id, 128, true);
    if (!allowed.has(parsed) || result.includes(parsed)) return fail();
    result.push(parsed);
  }
  return result;
}

export function sanitizeAvailabilityResult(value: unknown, manifest: ConfiguratorManifest): AvailabilityResult {
  if (!isRecord(value) || !Array.isArray(value.controls) || value.controls.length > manifest.controls.length) return fail();
  const controlsById = new Map(manifest.controls.map((control) => [control.id, control]));
  const seen = new Set<string>();
  const controls = value.controls.map((raw) => {
    if (!isRecord(raw) || typeof raw.available !== "boolean") return fail();
    const controlId = boundedString(raw.controlId, 128, true);
    const control = controlsById.get(controlId);
    if (!control || seen.has(controlId)) return fail();
    seen.add(controlId);
    let values: ControlChoice[] | undefined;
    if (raw.values !== undefined) {
      if (!Array.isArray(raw.values) || !control.values) return fail();
      const allowed = new Map(control.values.map((choice) => [choice.id, choice]));
      const ids = raw.values.map((candidate) => {
        if (!isRecord(candidate)) return fail();
        return boundedString(candidate.id, 128, true);
      });
      if (new Set(ids).size !== ids.length || ids.some((id) => !allowed.has(id))) return fail();
      values = ids.map((id) => structuredClone(allowed.get(id)!));
    }
    return {
      controlId,
      available: raw.available,
      ...(values === undefined ? {} : { values }),
      ...(raw.reason === undefined ? {} : { reason: boundedString(raw.reason, 500) }),
    };
  });
  return { committedRevision: boundedString(value.committedRevision, 200), controls };
}

export function sanitizeWorkspaceValidationResult(
  value: unknown,
  manifest: ConfiguratorManifest,
  workspace?: WorkspaceState,
): WorkspaceValidationResult {
  if (!isRecord(value) || typeof value.configurationValid !== "boolean" || typeof value.productionReady !== "boolean") return fail();
  if (value.productionReady && !value.configurationValid) return fail();
  if (!Array.isArray(value.issues) || value.issues.length > MAX_ISSUES || !Array.isArray(value.assumptions) || value.assumptions.length > MAX_ASSUMPTIONS) return fail();
  const controlIds = new Set(manifest.controls.map((control) => control.id));
  const variantIds = new Set(workspace?.variants.map((variant) => variant.id) ?? []);
  const elementIds = new Set(workspace?.variants.flatMap((variant) => variant.elements.map((element) => element.id)) ?? []);
  const issues: WorkspaceValidationIssue[] = value.issues.map((raw) => {
    if (!isRecord(raw) || typeof raw.severity !== "string" || !VALIDATION_SEVERITIES.has(raw.severity)) return fail();
    const affectedControls = boundedIdArray(raw.controlIds, 40, controlIds);
    const affectedVariants = boundedIdArray(raw.variantIds, 20, variantIds);
    const affectedElements = boundedIdArray(raw.elementIds, 100, elementIds);
    return {
      code: boundedString(raw.code, 128, true),
      severity: raw.severity as WorkspaceValidationIssue["severity"],
      message: boundedString(raw.message, 1_000),
      ...(affectedControls === undefined ? {} : { controlIds: affectedControls }),
      ...(affectedVariants === undefined ? {} : { variantIds: affectedVariants }),
      ...(affectedElements === undefined ? {} : { elementIds: affectedElements }),
    };
  });
  const assumptions = value.assumptions.map((assumption) => boundedString(assumption, 500, false, true));
  return { configurationValid: value.configurationValid, productionReady: value.productionReady, issues, assumptions };
}

export function sanitizeWorkspaceCommitResult(value: unknown): CommitResult {
  if (!isRecord(value) || typeof value.localPersisted !== "boolean" || typeof value.serverPersisted !== "boolean") return fail();
  const revision = boundedString(value.revision, 200);
  if (value.localPersisted && value.serverPersisted) return { revision, localPersisted: true, serverPersisted: true };
  if (value.localPersisted && !value.serverPersisted) {
    return { revision, localPersisted: true, serverPersisted: false, errorCode: boundedString(value.errorCode, 128, true) };
  }
  if (!value.localPersisted && !value.serverPersisted && value.errorCode === "STALE_REVISION") {
    return { revision, localPersisted: false, serverPersisted: false, errorCode: "STALE_REVISION" };
  }
  return fail();
}

export class GuardedWorkspaceAdapter<Snapshot = unknown, PrivateAsset = unknown> implements WorkspaceAdapter<Snapshot, PrivateAsset> {
  readonly manifest: ConfiguratorManifest;
  readonly #raw: WorkspaceAdapter<Snapshot, PrivateAsset>;

  constructor(manifest: ConfiguratorManifest, raw: WorkspaceAdapter<Snapshot, PrivateAsset>) {
    this.manifest = validateManifest(structuredClone(manifest));
    this.#raw = raw;
  }

  async readWorkspace(): Promise<WorkspaceState> {
    try { return sanitizeWorkspaceState(await this.#raw.readWorkspace(), this.manifest); } catch { return fail(); }
  }

  async listAvailability(request: AvailabilityRequest): Promise<AvailabilityResult> {
    try { return sanitizeAvailabilityResult(await this.#raw.listAvailability(structuredClone(request)), this.manifest); } catch { return fail(); }
  }

  async quiescePersistence(): Promise<void> {
    await this.#raw.quiescePersistence();
  }

  async captureSnapshot(): Promise<Snapshot> {
    return this.#raw.captureSnapshot();
  }

  async beginProposalMode(context: ProposalContext): Promise<void> {
    await this.#raw.beginProposalMode(structuredClone(context));
  }

  async validateWorkspace(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>): Promise<WorkspaceValidationResult> {
    try {
      const canonical = sanitizeWorkspaceState(workspace, this.manifest);
      return sanitizeWorkspaceValidationResult(await this.#raw.validateWorkspace(structuredClone(canonical), assets), this.manifest, canonical);
    } catch { return fail(); }
  }

  async previewWorkspace(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>): Promise<void> {
    await this.#raw.previewWorkspace(structuredClone(sanitizeWorkspaceState(workspace, this.manifest)), assets);
  }

  async restoreSnapshot(snapshot: Snapshot): Promise<void> {
    await this.#raw.restoreSnapshot(snapshot);
  }

  async commitWorkspace(workspace: WorkspaceState, metadata: CommitMetadata, assets?: AssetResolver<PrivateAsset>): Promise<CommitResult> {
    try {
      const canonical = sanitizeWorkspaceState(workspace, this.manifest);
      return sanitizeWorkspaceCommitResult(await this.#raw.commitWorkspace(structuredClone(canonical), structuredClone(metadata), assets));
    } catch { return fail(); }
  }

  async endProposalMode(reason: ProposalEndReason): Promise<void> {
    await this.#raw.endProposalMode(reason);
  }

  subscribeToExternalChanges(listener: (revision: string) => void): () => void {
    return this.#raw.subscribeToExternalChanges((revision) => {
      if (typeof revision !== "string" || revision.length < 1 || revision.length > 200) listener("invalid-adapter-revision");
      else listener(revision);
    });
  }
}
