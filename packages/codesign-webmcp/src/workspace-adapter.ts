import { isSafeIdentifier, validateManifest } from "./manifest.js";
import { AtomicOperationReducer, validateApplyOperationsInput } from "./operations.js";
import { sanitizeWorkspaceState } from "./workspace.js";
import type {
  AvailabilityRequest,
  AvailabilityResult,
  AssetResolver,
  CommitMetadata,
  CommitResult,
  ConfiguratorManifest,
  ControlChoice,
  MerchantApprovedRepair,
  NormalizedPreviewRegion,
  ProposalContext,
  ProposalEndReason,
  ProposalOperation,
  SetControlOperation,
  WorkspaceAdapter,
  WorkspaceState,
  WorkspaceValidationIssue,
  WorkspaceValidationResult,
} from "./types.js";

const VALIDATION_SEVERITIES = new Set(["constraint-error", "decision-required", "warning", "information"]);
const VALIDATION_ISSUE_SOURCES = new Set(["merchant-rule", "current-configuration", "renderer-evidence", "customer-brief"]);
const MAX_ISSUES = 100;
const MAX_ASSUMPTIONS = 20;
const MAX_REPAIRS_PER_ISSUE = 5;
const MAX_OPERATIONS_PER_REPAIR = 5;

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

function normalizedPreviewRegion(value: unknown): NormalizedPreviewRegion | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return fail();
  const coordinates = [value.x, value.y, value.width, value.height];
  if (coordinates.some((coordinate) => typeof coordinate !== "number" || !Number.isFinite(coordinate))) return fail();
  const [x, y, width, height] = coordinates as [number, number, number, number];
  if (x < 0 || y < 0 || width <= 0 || height <= 0 || x > 1 || y > 1 || x + width > 1 || y + height > 1) return fail();
  return { x, y, width, height };
}

function merchantApprovedRepairs(
  value: unknown,
  manifest: ConfiguratorManifest,
  workspace: WorkspaceState | undefined,
  affectedControls: string[] | undefined,
  affectedVariants: string[] | undefined,
  affectedElements: string[] | undefined,
): MerchantApprovedRepair[] {
  if (!workspace || !Array.isArray(value) || value.length < 1 || value.length > MAX_REPAIRS_PER_ISSUE || !affectedControls?.length) return fail();
  const seen = new Set<string>();
  return value.map((raw, repairIndex) => {
    if (!isRecord(raw) || !Array.isArray(raw.operations) || raw.operations.length < 1 || raw.operations.length > MAX_OPERATIONS_PER_REPAIR) return fail();
    const id = boundedString(raw.id, 128, true);
    if (seen.has(id)) return fail();
    seen.add(id);
    const parsed = validateApplyOperationsInput({
      baseRevision: workspace.committedRevision,
      operationId: `contract-repair-${repairIndex}`,
      operations: raw.operations,
    });
    if (parsed.operations.some((operation) => operation.type !== "set-control")) return fail();
    const operations = parsed.operations as SetControlOperation[];
    for (const operation of operations) {
      if (!affectedControls.includes(operation.controlId)) return fail();
      if (operation.target.scope === "variant" && !affectedVariants?.includes(operation.target.variantId)) return fail();
      if (operation.target.scope === "element" && (!affectedVariants?.includes(operation.target.variantId) || !affectedElements?.includes(operation.target.elementId))) return fail();
    }
    try {
      new AtomicOperationReducer(manifest).apply(workspace, {
        baseRevision: workspace.committedRevision,
        operationId: `contract-repair-${repairIndex}`,
        operations,
      });
    } catch {
      return fail();
    }
    return {
      id,
      label: boundedString(raw.label, 200),
      operations: structuredClone(operations),
    };
  });
}

function canonicalRepairValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalRepairValue).join(",")}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalRepairValue(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

export class MerchantApprovedRepairError extends Error {
  constructor(message = "The requested repair is not merchant-approved for this issue") {
    super(message);
    this.name = "MerchantApprovedRepairError";
  }
}

/**
 * Resolves a repair only when the caller supplies an exact operation match for
 * the merchant-declared repair ID. The returned operations can then be passed
 * through the ordinary atomic proposal tool; no separate privileged write path
 * is created for repairs.
 */
export function selectMerchantApprovedRepair(
  issue: WorkspaceValidationIssue,
  repairId: string,
  candidateOperations: unknown,
): SetControlOperation[] {
  try {
    if (!issue.repairable || !isSafeIdentifier(repairId)) throw new MerchantApprovedRepairError();
    const approved = issue.merchantApprovedRepairs?.find((repair) => repair.id === repairId);
    if (!approved) throw new MerchantApprovedRepairError();
    const parsed = validateApplyOperationsInput({
      baseRevision: "repair-selection",
      operationId: "repair-selection",
      operations: candidateOperations,
    });
    if (parsed.operations.some((operation) => operation.type !== "set-control")) throw new MerchantApprovedRepairError();
    const operations = parsed.operations as SetControlOperation[];
    if (canonicalRepairValue(operations) !== canonicalRepairValue(approved.operations)) throw new MerchantApprovedRepairError();
    return structuredClone(approved.operations);
  } catch (error) {
    if (error instanceof MerchantApprovedRepairError) throw error;
    throw new MerchantApprovedRepairError();
  }
}

function targetTouchesIssue(
  target: SetControlOperation["target"],
  controlId: string,
  issue: WorkspaceValidationIssue,
): boolean {
  if (!issue.controlIds?.includes(controlId)) return false;
  if (target.scope === "workspace") return true;
  if (issue.variantIds?.length && !issue.variantIds.includes(target.variantId)) return false;
  if (target.scope === "variant") return true;
  return !issue.elementIds?.length || issue.elementIds.includes(target.elementId);
}

function operationTouchesIssue(operation: ProposalOperation, issue: WorkspaceValidationIssue): boolean {
  switch (operation.type) {
    case "set-control":
    case "attach-asset":
    case "remove-asset":
      return targetTouchesIssue(operation.target, operation.controlId, issue);
    case "remove-variant":
      return !issue.variantIds?.length || issue.variantIds.includes(operation.variantId);
    case "duplicate-variant":
      return !issue.variantIds?.length || issue.variantIds.includes(operation.sourceVariantId);
    case "create-variant":
      return !issue.variantIds?.length;
    case "reorder-variant":
    case "set-active-variant":
      return false;
  }
}

/**
 * Fails closed when a refinement touches a repairable issue without using one
 * exact merchant-declared repair batch. Unrelated refinements remain possible,
 * but a repair cannot be broadened, approximated, or mixed with extra changes.
 */
export function assertMerchantApprovedRepairBatch(
  validation: WorkspaceValidationResult,
  operations: readonly ProposalOperation[],
): void {
  for (const issue of validation.issues.filter((candidate) => candidate.repairable)) {
    if (!operations.some((operation) => operationTouchesIssue(operation, issue))) continue;
    const approved = issue.merchantApprovedRepairs?.some((repair) => (
      canonicalRepairValue(operations) === canonicalRepairValue(repair.operations)
    ));
    if (!approved) throw new MerchantApprovedRepairError();
  }
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
  const surfaceIds = new Set(manifest.previewSurfaces.map((surface) => surface.id));
  const issueIds = new Set<string>();
  const issues: WorkspaceValidationIssue[] = value.issues.map((raw, issueIndex) => {
    if (!isRecord(raw) || typeof raw.severity !== "string" || !VALIDATION_SEVERITIES.has(raw.severity)) return fail();
    const code = boundedString(raw.code, 128, true);
    const source = raw.source === undefined ? undefined : boundedString(raw.source, 64, true);
    if (source !== undefined && !VALIDATION_ISSUE_SOURCES.has(source)) return fail();
    const issueId = raw.issueId === undefined
      ? boundedString(`legacy-${issueIndex + 1}-${code}`.slice(0, 128), 128, true)
      : boundedString(raw.issueId, 128, true);
    if (issueIds.has(issueId)) return fail();
    issueIds.add(issueId);
    const affectedControls = boundedIdArray(raw.controlIds, 40, controlIds);
    const affectedVariants = boundedIdArray(raw.variantIds, 20, variantIds);
    const affectedElements = boundedIdArray(raw.elementIds, 100, elementIds);
    const surfaceId = raw.surfaceId === undefined ? undefined : boundedString(raw.surfaceId, 128, true);
    if (surfaceId !== undefined && !surfaceIds.has(surfaceId)) return fail();
    const previewRegion = normalizedPreviewRegion(raw.normalizedPreviewRegion);
    if (previewRegion !== undefined && surfaceId === undefined) return fail();
    const repairable = raw.repairable ?? false;
    if (typeof repairable !== "boolean") return fail();
    const repairs = repairable
      ? merchantApprovedRepairs(raw.merchantApprovedRepairs, manifest, workspace, affectedControls, affectedVariants, affectedElements)
      : undefined;
    if (!repairable && raw.merchantApprovedRepairs !== undefined) return fail();
    const issue: WorkspaceValidationIssue = {
      issueId,
      code,
      severity: raw.severity as WorkspaceValidationIssue["severity"],
      message: boundedString(raw.message, 1_000),
      ...(affectedControls === undefined ? {} : { controlIds: affectedControls }),
      ...(affectedVariants === undefined ? {} : { variantIds: affectedVariants }),
      ...(affectedElements === undefined ? {} : { elementIds: affectedElements }),
      ...(surfaceId === undefined ? {} : { surfaceId }),
      ...(previewRegion === undefined ? {} : { normalizedPreviewRegion: previewRegion }),
      repairable,
      ...(repairs === undefined ? {} : { merchantApprovedRepairs: repairs }),
    };
    if (source !== undefined) issue.source = source as NonNullable<WorkspaceValidationIssue["source"]>;
    return issue;
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
