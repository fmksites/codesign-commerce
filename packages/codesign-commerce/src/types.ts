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

export type OptionScope = "order" | "design";
export type OptionKind = "enum" | "color" | "integer" | "boolean" | "text" | "asset-status";
export type CanonicalRole = "selection" | "design-quantity" | "design-name" | "order-total";

export interface OptionValue {
  id: string;
  label: string;
  description?: string;
}

export interface OptionGroup {
  id: string;
  label: string;
  agentDescription: string;
  scope: OptionScope;
  kind: OptionKind;
  role?: CanonicalRole;
  agentWritable: boolean;
  values?: OptionValue[];
  minimum?: number;
  maximum?: number;
  maximumLength?: number;
  affectedPreviewRegion?: string;
}

export interface DependencyRule {
  id: string;
  description: string;
}

export interface ConfiguratorManifest {
  schemaVersion: "1.0";
  id: string;
  version: string;
  displayName: string;
  productType: string;
  capabilities: {
    multipleDesigns: boolean;
    maximumDesigns: number;
    cloning: boolean;
  };
  optionGroups: OptionGroup[];
  dependencyRules: DependencyRule[];
  approval: {
    mode: "explicit-human";
    persistence: "keep-only";
  };
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
  values?: OptionValue[];
  reason?: string;
}

export interface OptionResult {
  revision: string;
  options: OptionAvailability[];
}

export interface CommitMetadata {
  proposalId: string;
  operationIds: string[];
  trigger: "agent_proposal_keep";
}

export interface CommitResult {
  revision: string;
  localPersisted: boolean;
  serverPersisted: boolean;
}

export interface ConfiguratorAdapter<Snapshot = unknown> {
  readState(): Promise<ConfigurationState>;
  listOptions(request: OptionRequest): Promise<OptionResult>;
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

export interface ConfigurationDiff {
  designId?: string;
  optionId: string;
  before: JsonPrimitive | undefined;
  after: JsonPrimitive;
}

export interface ProposalResult {
  ok: true;
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  persisted: false;
  diff: ConfigurationDiff[];
  validation: ValidationResult;
}

export type ProposalErrorCode =
  | "INVALID_MANIFEST"
  | "UNKNOWN_OPTION"
  | "OPTION_NOT_WRITABLE"
  | "INVALID_VALUE"
  | "UNKNOWN_DESIGN"
  | "STALE_REVISION"
  | "STALE_PROPOSAL_REVISION"
  | "PROPOSAL_PENDING"
  | "COMMIT_ALREADY_STARTED"
  | "CANCELLED"
  | "NO_PROPOSAL"
  | "ADAPTER_FAILURE";

export interface ProposalErrorResult {
  ok: false;
  persisted: false;
  currentRevision?: string;
  error: {
    code: ProposalErrorCode;
    message: string;
    retryable: boolean;
    affectedOptions: string[];
  };
}

export type ProposeResult = ProposalResult | ProposalErrorResult;

export type ProposalSessionStatus = "idle" | "applying" | "awaiting-human" | "committing" | "commit-retry";

export interface ProposalExecutionOptions {
  signal?: AbortSignal;
}
