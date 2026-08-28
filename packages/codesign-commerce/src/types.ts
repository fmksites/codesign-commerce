export type JsonPrimitive = string | number | boolean | null;

export type AssetStatus = "missing" | "placeholder" | "ready";

export interface ConfigurationAsset {
  slot: string;
  status: AssetStatus;
  agentWritable: false;
}

export interface ConfigurationDesign {
  id: string;
  name: string;
  quantity: number;
  selections: Record<string, JsonPrimitive>;
  assets: ConfigurationAsset[];
}

export interface ConfigurationState {
  configuratorId: string;
  manifestVersion: string;
  revision: string;
  activeDesignId: string;
  order: {
    totalQuantity: number;
  };
  designs: ConfigurationDesign[];
}

export type ControlScope = "workspace" | "variant" | "element";
export type ControlKind = "enum" | "color" | "integer" | "number" | "boolean" | "text" | "asset" | "position-2d" | "scale" | "rotation";
export type CanonicalRole = "selection" | "variant-quantity" | "variant-name" | "workspace-total";
export type ControlRequirement = "configuration" | "production-readiness" | "optional";

export interface ControlChoice {
  id: string;
  label: string;
  description?: string;
}

export interface ControlDefinition {
  id: string;
  label: string;
  agentDescription: string;
  scope: ControlScope;
  kind: ControlKind;
  role?: CanonicalRole;
  agentWritable: boolean;
  requirement: ControlRequirement;
  targetType?: string;
  values?: ControlChoice[];
  minimum?: number;
  maximum?: number;
  maximumLength?: number;
  xMinimum?: number;
  xMaximum?: number;
  yMinimum?: number;
  yMaximum?: number;
  assetSlotId?: string;
  availabilityGroupIds?: string[];
  affectedPreviewRegion?: string;
}

export type AssetSourceKind = "data-url" | "https-url";
export type AssetMediaType = "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";

export interface AssetSlotDefinition {
  id: string;
  label: string;
  agentDescription: string;
  scope: "workspace" | "variant" | "element";
  sourceKinds: AssetSourceKind[];
  mediaTypes: AssetMediaType[];
  maximumSourceCharacters: number;
  maximumBytes: number;
}

export type AssetSource =
  | { kind: "data-url"; data: string }
  | { kind: "https-url"; url: string };

export interface StageAssetInput {
  baseRevision: string;
  proposalId?: string;
  proposalRevision?: number;
  slotId: string;
  source: AssetSource;
  filename?: string;
  altText: string;
}

export interface AdapterAssetStageRequest {
  slotId: string;
  sourceKind: AssetSourceKind;
  declaredMediaType: AssetMediaType;
  bytes: Uint8Array;
  sourceIntegrity: string;
  filename?: string;
  altText: string;
}

export interface AdapterStagedAsset<PrivateAsset = unknown> {
  privateAsset: PrivateAsset;
  mediaType: AssetMediaType;
  byteLength: number;
  width?: number;
  height?: number;
  integrity: string;
}

export interface StagedAssetReceipt {
  assetHandle: string;
  slotId: string;
  mediaType: AssetMediaType;
  byteLength: number;
  width?: number;
  height?: number;
  filename?: string;
  altText: string;
  integrity: string;
  sourceIntegrity: string;
  temporary: true;
  expiresAt: string;
  persisted: false;
}

export interface ResolvedTemporaryAsset<PrivateAsset = unknown> {
  privateAsset: PrivateAsset;
  receipt: StagedAssetReceipt;
}

export interface AssetResolver<PrivateAsset = unknown> {
  resolve(assetHandle: string): ResolvedTemporaryAsset<PrivateAsset> | null;
}

export interface AssetStagingAdapter<PrivateAsset = unknown> {
  stageAsset(request: AdapterAssetStageRequest): Promise<AdapterStagedAsset<PrivateAsset>>;
  releaseAsset(privateAsset: PrivateAsset): Promise<void>;
}

export interface AssetBindingContext {
  baseRevision: string;
  proposalId?: string;
  proposalRevision?: number;
}

export interface PreviewCaptureRequest {
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  variantIds?: string[];
  surfaceIds?: string[];
}

export type PreviewTransport =
  | { kind: "data-url"; value: string }
  | { kind: "same-origin-url"; value: string; expiresAt?: string };

export interface PreviewArtifactCandidate {
  variantId: string;
  surfaceId: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  altText: string;
  integrity?: string;
  transport: PreviewTransport;
}

export interface PreviewArtifact {
  artifactId: string;
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  variantId: string;
  surfaceId: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  altText: string;
  integrity: string;
  transport: PreviewTransport;
}

export interface PreviewCaptureAdapter<PrivateAsset = unknown> {
  capturePreviews(
    request: PreviewCaptureRequest,
    assets: AssetResolver<PrivateAsset>,
  ): Promise<PreviewArtifactCandidate[]>;
}

export type AssetSandboxErrorCode =
  | "INVALID_INPUT"
  | "UNKNOWN_ASSET_SLOT"
  | "ASSET_SOURCE_REJECTED"
  | "ASSET_FETCH_FAILED"
  | "ASSET_DECODE_FAILED"
  | "ASSET_TOO_LARGE"
  | "ASSET_STAGE_FAILED"
  | "ASSET_EXPIRED"
  | "UNKNOWN_ASSET"
  | "ASSET_BINDING_MISMATCH";

export type PreviewBridgeErrorCode =
  | "INVALID_INPUT"
  | "UNKNOWN_TARGET"
  | "CAPABILITY_UNAVAILABLE"
  | "PREVIEW_FAILED"
  | "PREVIEW_STALE";

export type VariantOperation = "create" | "duplicate" | "remove" | "reorder" | "set-active";

export interface VariantPolicy {
  minimumVariants: number;
  maximumVariants: number;
  operations: VariantOperation[];
}

export interface PreviewSurfaceDefinition {
  id: string;
  label: string;
  scope: "workspace" | "variant";
  mediaTypes: Array<"image/png" | "image/jpeg" | "image/webp">;
  maximumBytes: number;
}

export interface DependencyDescription {
  id: string;
  description: string;
  controlIds: string[];
}

export interface ConfiguratorManifest {
  schemaVersion: "2.0";
  id: string;
  version: string;
  displayName: string;
  productType: string;
  controls: ControlDefinition[];
  assetSlots: AssetSlotDefinition[];
  variantPolicy: VariantPolicy;
  previewSurfaces: PreviewSurfaceDefinition[];
  dependencyDescriptions: DependencyDescription[];
  approval: {
    mode: "explicit-human";
    persistencePath: "page-keep-controller";
  };
}

export interface Position2DValue {
  x: number;
  y: number;
}

export type ControlValue = JsonPrimitive | Position2DValue;

export interface ElementState {
  id: string;
  type: string;
  controls: Record<string, ControlValue>;
  assetHandle?: string;
}

export interface VariantState {
  id: string;
  name: string;
  controls: Record<string, ControlValue>;
  elements: ElementState[];
}

export interface WorkspaceState {
  configuratorId: string;
  manifestVersion: string;
  committedRevision: string;
  activeVariantId: string;
  workspaceControls: Record<string, ControlValue>;
  variants: VariantState[];
}

export type ControlTarget =
  | { scope: "workspace" }
  | { scope: "variant"; variantId: string }
  | { scope: "element"; variantId: string; elementId: string };

export interface SetControlOperation {
  type: "set-control";
  target: ControlTarget;
  controlId: string;
  value: ControlValue;
}

export interface CreateVariantOperation {
  type: "create-variant";
  variant: VariantState;
  index?: number;
}

export interface DuplicateVariantOperation {
  type: "duplicate-variant";
  sourceVariantId: string;
  variantId: string;
  name?: string;
  index?: number;
  initialControls?: Record<string, ControlValue>;
}

export interface RemoveVariantOperation {
  type: "remove-variant";
  variantId: string;
}

export interface ReorderVariantOperation {
  type: "reorder-variant";
  variantId: string;
  index: number;
}

export interface SetActiveVariantOperation {
  type: "set-active-variant";
  variantId: string;
}

export interface AttachAssetOperation {
  type: "attach-asset";
  target: ControlTarget;
  controlId: string;
  assetHandle: string;
}

export interface RemoveAssetOperation {
  type: "remove-asset";
  target: ControlTarget;
  controlId: string;
}

export type ProposalOperation =
  | SetControlOperation
  | CreateVariantOperation
  | DuplicateVariantOperation
  | RemoveVariantOperation
  | ReorderVariantOperation
  | SetActiveVariantOperation
  | AttachAssetOperation
  | RemoveAssetOperation;

export interface ApplyOperationsInput {
  baseRevision: string;
  proposalId?: string;
  proposalRevision?: number;
  operationId: string;
  operations: ProposalOperation[];
  assumptions?: string[];
}

export interface OperationBatchResult {
  state: WorkspaceState;
  operationId: string;
  appliedOperations: number;
  deduplicated: boolean;
}

export type OperationErrorCode =
  | "INVALID_INPUT"
  | "UNKNOWN_CONTROL"
  | "CONTROL_NOT_WRITABLE"
  | "INVALID_VALUE"
  | "INVALID_TARGET"
  | "UNKNOWN_VARIANT"
  | "UNKNOWN_ELEMENT"
  | "VARIANT_OPERATION_UNAVAILABLE"
  | "VARIANT_LIMIT"
  | "DUPLICATE_ID"
  | "STALE_REVISION"
  | "OPERATION_ID_CONFLICT"
  | "OPERATION_LIMIT";

export interface AvailabilityRequest {
  variantId?: string;
  elementId?: string;
  controlIds?: string[];
}

export interface ControlAvailability {
  controlId: string;
  available: boolean;
  values?: ControlChoice[];
  reason?: string;
}

export interface AvailabilityResult {
  committedRevision: string;
  controls: ControlAvailability[];
}

export interface WorkspaceValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  controlIds?: string[];
  variantIds?: string[];
  elementIds?: string[];
}

export interface WorkspaceValidationResult {
  configurationValid: boolean;
  productionReady: boolean;
  issues: WorkspaceValidationIssue[];
  assumptions: string[];
}

export interface ProposalContext {
  proposalId: string;
  baseRevision: string;
}

export type ProposalEndReason = "kept" | "reverted" | "invalid" | "cancelled" | "stale" | "teardown";

export interface WorkspaceAdapter<Snapshot = unknown, PrivateAsset = unknown> {
  readWorkspace(): Promise<WorkspaceState>;
  listAvailability(request: AvailabilityRequest): Promise<AvailabilityResult>;
  quiescePersistence(): Promise<void>;
  captureSnapshot(): Promise<Snapshot>;
  beginProposalMode(context: ProposalContext): Promise<void>;
  validateWorkspace(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>): Promise<WorkspaceValidationResult>;
  previewWorkspace(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>): Promise<void>;
  restoreSnapshot(snapshot: Snapshot): Promise<void>;
  commitWorkspace(workspace: WorkspaceState, metadata: CommitMetadata, assets?: AssetResolver<PrivateAsset>): Promise<CommitResult>;
  endProposalMode(reason: ProposalEndReason): Promise<void>;
  subscribeToExternalChanges(listener: (revision: string) => void): () => void;
}

export type ProposalEngineStatus =
  | "idle"
  | "building"
  | "validating"
  | "rendering"
  | "reviewable"
  | "staging-asset"
  | "capturing-preview"
  | "preview-unavailable"
  | "stale"
  | "reverting"
  | "committing"
  | "commit-retry"
  | "commit-uncertain";

export interface ProposalEngineSnapshot {
  status: ProposalEngineStatus;
  proposalId: string | null;
  proposalRevision: number;
  baseRevision: string | null;
  committedRevision: string | null;
  previewStatus: "none" | "ready-for-capture" | "available" | "unavailable";
}

export type ProposalEngineErrorCode =
  | OperationErrorCode
  | AssetSandboxErrorCode
  | PreviewBridgeErrorCode
  | "PROPOSAL_PENDING"
  | "STALE_PROPOSAL_REVISION"
  | "NO_PROPOSAL"
  | "OPERATION_IN_PROGRESS"
  | "CANCELLED"
  | "ADAPTER_FAILURE"
  | "PREVIEW_REQUIRED"
  | "COMMIT_ALREADY_STARTED"
  | "COMMIT_STATUS_UNKNOWN";

export interface ProposalEngineErrorResult {
  ok: false;
  persisted: false;
  error: {
    code: ProposalEngineErrorCode;
    message: string;
    retryable: boolean;
    outcome?: "unknown";
  };
  currentRevision?: string;
  validation?: WorkspaceValidationResult;
}

export interface ProposalEngineSuccessResult {
  ok: true;
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  persisted: false;
  appliedOperations: number;
  deduplicated: boolean;
  workspace: WorkspaceState;
  diff: WorkspaceDiff;
  validation: WorkspaceValidationResult;
  previewStatus: "ready-for-capture";
  confirmation: HumanConfirmationRequirement;
}

export interface WorkspaceControlChange {
  target: ControlTarget;
  controlId: string;
  before?: ControlValue;
  after?: ControlValue;
}

export interface WorkspaceVariantSummary {
  variantId: string;
  name: string;
}

export interface WorkspaceDiff {
  controlChanges: WorkspaceControlChange[];
  createdVariants: WorkspaceVariantSummary[];
  removedVariants: WorkspaceVariantSummary[];
  orderBefore: string[];
  orderAfter: string[];
  activeVariantBefore: string;
  activeVariantAfter: string;
}

export interface AssetStageSuccessResult {
  ok: true;
  persisted: false;
  asset: StagedAssetReceipt;
}

export interface PreviewCaptureSuccessResult {
  ok: true;
  persisted: false;
  previewStatus: "available";
  proposalId: string;
  proposalRevision: number;
  artifacts: PreviewArtifact[];
}

export interface ProposalValidationInput {
  proposalId?: string;
  proposalRevision?: number;
}

export interface ProposalValidationSuccessResult {
  ok: true;
  persisted: false;
  source: "committed" | "proposal";
  baseRevision: string;
  proposalId: string | null;
  proposalRevision: number;
  validation: WorkspaceValidationResult;
}

export type CapabilityCategory = "controls" | "variants" | "assets" | "previews" | "dependencies";

export interface ListCapabilitiesInput extends AvailabilityRequest {
  categories?: CapabilityCategory[];
}

export type ValidationSeverity = "constraint-error" | "decision-required" | "warning" | "information";

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  optionIds?: string[];
  designIds?: string[];
}

export interface ValidationResult {
  configurationValid: boolean;
  productionReady: boolean;
  issues: ValidationIssue[];
  assumptions: string[];
}

export interface OptionRequest {
  designId?: string;
  optionIds?: string[];
}

export interface OptionAvailability {
  optionId: string;
  allowed: boolean;
  values?: ControlChoice[];
  reason?: string;
}

export interface OptionResult {
  revision: string;
  options: OptionAvailability[];
}

export interface CreateDesignDraftRequest {
  sourceDesignId: string;
  operationId: string;
}

export interface CreateDesignDraftResult {
  state: ConfigurationState;
  designId: string;
}

export interface CommitMetadata {
  proposalId: string;
  baseRevision: string;
  operationIds: string[];
  finalProposalRevision?: number;
  previewReceipts?: Array<Pick<PreviewArtifact, "artifactId" | "variantId" | "surfaceId" | "integrity">>;
  trigger: "confirmed_page_keep";
}

export type CommitResult =
  | {
      revision: string;
      localPersisted: true;
      serverPersisted: true;
    }
  | {
      revision: string;
      localPersisted: true;
      serverPersisted: false;
      errorCode: string;
    }
  | {
      revision: string;
      localPersisted: false;
      serverPersisted: false;
      errorCode: "STALE_REVISION";
    };

export interface ConfiguratorAdapter<Snapshot = unknown> {
  readState(): Promise<ConfigurationState>;
  listOptions(request: OptionRequest): Promise<OptionResult>;
  createDesignDraft?(state: ConfigurationState, request: CreateDesignDraftRequest): Promise<CreateDesignDraftResult>;
  quiescePersistence(): Promise<void>;
  captureSnapshot(): Promise<Snapshot>;
  previewState(state: ConfigurationState): Promise<void>;
  validateState(state: ConfigurationState): Promise<ValidationResult>;
  restoreSnapshot(snapshot: Snapshot): Promise<void>;
  commitState(state: ConfigurationState, metadata: CommitMetadata): Promise<CommitResult>;
  subscribeToExternalChanges(listener: (revision: string) => void): () => void;
}

export interface ConfigurationChange {
  designId?: string;
  optionId: string;
  value: JsonPrimitive;
}

export interface ProposalInput {
  baseRevision: string;
  proposalId?: string;
  proposalRevision?: number;
  operationId: string;
  changes: ConfigurationChange[];
  assumptions?: string[];
}

export interface NewDesignChange {
  optionId: string;
  value: JsonPrimitive;
}

export interface CreateDesignInput {
  baseRevision: string;
  proposalId?: string;
  proposalRevision?: number;
  operationId: string;
  sourceDesignId: string;
  changes?: ConfigurationChange[];
  newDesignChanges: NewDesignChange[];
  assumptions?: string[];
}

export interface ConfigurationDiff {
  designId?: string;
  optionId: string;
  before: JsonPrimitive | undefined;
  after: JsonPrimitive;
}

export interface CreatedDesign {
  designId: string;
  sourceDesignId: string;
  name: string;
}

export interface HumanConfirmationRequirement {
  required: true;
  choices: ["keep", "revert"];
  message: string;
}

export interface ProposalResult {
  ok: true;
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  persisted: false;
  diff: ConfigurationDiff[];
  createdDesigns: CreatedDesign[];
  validation: ValidationResult;
  confirmation: HumanConfirmationRequirement;
}

export type ProposalErrorCode =
  | "INVALID_MANIFEST"
  | "UNKNOWN_OPTION"
  | "OPTION_NOT_WRITABLE"
  | "CAPABILITY_UNAVAILABLE"
  | "INVALID_VALUE"
  | "UNKNOWN_DESIGN"
  | "STALE_REVISION"
  | "STALE_PROPOSAL_REVISION"
  | "PROPOSAL_PENDING"
  | "OPERATION_ID_CONFLICT"
  | "OPERATION_IN_PROGRESS"
  | "COMMIT_ALREADY_STARTED"
  | "COMMIT_STATUS_UNKNOWN"
  | "CANCELLED"
  | "NO_PROPOSAL"
  | "ADAPTER_FAILURE";

export interface ProposalErrorResult {
  ok: false;
  persisted: false | "unknown";
  currentRevision?: string;
  error: {
    code: ProposalErrorCode;
    message: string;
    retryable: boolean;
    affectedOptions: string[];
  };
}

export type ProposeResult = ProposalResult | ProposalErrorResult;

export interface ValidateConfigurationInput {
  proposalId?: string;
  proposalRevision?: number;
}

export interface ValidationInspectionResult {
  ok: true;
  persisted: false;
  source: "committed" | "proposal";
  revision: string;
  proposalId?: string;
  proposalRevision?: number;
  validation: ValidationResult;
}

export type ValidateConfigurationResult = ValidationInspectionResult | ProposalErrorResult;

export type ProposalSessionStatus = "idle" | "applying" | "awaiting-human" | "invalidated" | "reverting" | "committing" | "commit-retry" | "commit-uncertain";

export interface ProposalExecutionOptions {
  signal?: AbortSignal;
}

export interface ProposalSessionSnapshot {
  status: ProposalSessionStatus;
  proposalId: string | null;
  proposalRevision: number | null;
  result: ProposalResult | null;
}
