import type { ProposalEngine } from "./proposal-engine.js";
import type {
  CommitResult,
  ConfiguratorManifest,
  ControlValue,
  ProposalEngineErrorResult,
  ProposalEngineSnapshot,
  ProposalEngineSuccessResult,
  WorkspaceValidationIssue,
} from "./types.js";

export type ReviewState =
  | { kind: "hidden" }
  | {
      kind: "temporary";
      heading: "Temporary agent proposal — not saved.";
      proposalId: string;
      proposalRevision: number;
      variantCount: number;
      activeVariantName: string;
      createdVariants: Array<{ variantId: string; name: string }>;
      removedVariants: Array<{ variantId: string; name: string }>;
      changes: ReviewChange[];
      assumptions: string[];
      hardErrors: WorkspaceValidationIssue[];
      missingDecisions: WorkspaceValidationIssue[];
      warnings: WorkspaceValidationIssue[];
      safeToKeepAsDraft: true;
      productionReady: boolean;
      previewReady: boolean;
      canKeep: boolean;
      keepDisabledReason?: string;
    }
  | { kind: "busy"; action: "applying" | "staging-asset" | "capturing-preview" | "reverting" | "committing"; message: string }
  | { kind: "stale"; message: "Configuration changed elsewhere. Discard this proposal and restore the latest version."; refreshLabel: "Restore latest" }
  | { kind: "commit-retry"; message: "Kept on this device; secure save failed."; retryLabel: "Retry save" }
  | { kind: "commit-uncertain"; message: "Save status could not be verified. Reload before continuing." }
  | { kind: "committed"; message: "Agent proposal kept."; revision: string }
  | { kind: "reverted"; message: "Agent proposal reverted. Nothing was saved." };

export interface ReviewChange {
  targetLabel: string;
  controlId: string;
  label: string;
  before: string;
  after: string;
}

function displayValue(manifest: ConfiguratorManifest, controlId: string, value: ControlValue | undefined): string {
  if (value === undefined) return "Not set";
  if (value === null) return "None";
  const control = manifest.controls.find((candidate) => candidate.id === controlId);
  if (control?.kind === "asset") return "Artwork attached";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return `x ${value.x.toFixed(2)}, y ${value.y.toFixed(2)}`;
  const labelledValue = control?.values?.find((candidate) => candidate.id === value);
  return labelledValue?.label ?? String(value);
}

function groupIssues(issues: WorkspaceValidationIssue[]) {
  return {
    hardErrors: issues.filter((issue) => issue.severity === "constraint-error"),
    missingDecisions: issues.filter((issue) => issue.severity === "decision-required"),
    warnings: issues.filter((issue) => issue.severity === "warning" || issue.severity === "information"),
  };
}

type ReviewChangeTarget = ProposalEngineSuccessResult["diff"]["controlChanges"][number]["target"];

function targetLabel(result: ProposalEngineSuccessResult, target: ReviewChangeTarget): string {
  if (target.scope === "workspace") return "Product";
  const variant = result.workspace.variants.find((candidate) => candidate.id === target.variantId);
  if (target.scope === "variant") return variant?.name ?? "Variant";
  return `${variant?.name ?? "Variant"} · design element`;
}

/** True while ordinary configurator controls must not race a temporary proposal. */
export function reviewLocksHumanControls(state: ReviewState): boolean {
  return state.kind === "temporary"
    || state.kind === "busy"
    || state.kind === "stale"
    || state.kind === "commit-retry"
    || state.kind === "commit-uncertain";
}

export class ProposalReviewController<Snapshot = unknown, PrivateAsset = unknown> {
  readonly manifest: ConfiguratorManifest;
  readonly engine: ProposalEngine<Snapshot, PrivateAsset>;

  #state: ReviewState = { kind: "hidden" };
  #listeners = new Set<(state: ReviewState) => void>();
  #unsubscribeEngine: () => void;

  constructor(manifest: ConfiguratorManifest, engine: ProposalEngine<Snapshot, PrivateAsset>) {
    this.manifest = manifest;
    this.engine = engine;
    this.#unsubscribeEngine = engine.subscribe((snapshot) => this.#sync(snapshot));
  }

  get state(): ReviewState { return structuredClone(this.#state); }

  subscribe(listener: (state: ReviewState) => void): () => void {
    this.#listeners.add(listener);
    listener(this.state);
    return () => this.#listeners.delete(listener);
  }

  async keep(): Promise<CommitResult | ProposalEngineErrorResult> {
    if (this.#state.kind !== "temporary") {
      return {
        ok: false,
        persisted: false,
        error: { code: "NO_PROPOSAL", message: "There is no reviewable proposal to keep", retryable: false },
      };
    }
    if (!this.#state.canKeep) {
      return {
        ok: false,
        persisted: false,
        error: { code: "PREVIEW_REQUIRED", message: "Keep is unavailable until the current visual preview is ready", retryable: true },
      };
    }
    const result = await this.engine.keep();
    if ("revision" in result && result.serverPersisted) this.#publish({ kind: "committed", message: "Agent proposal kept.", revision: result.revision });
    return result;
  }

  async retrySave(): Promise<CommitResult | ProposalEngineErrorResult> {
    if (this.#state.kind !== "commit-retry") {
      return { ok: false, persisted: false, error: { code: "NO_PROPOSAL", message: "There is no failed secure save to retry", retryable: false } };
    }
    const result = await this.engine.keep();
    if ("revision" in result && result.serverPersisted) this.#publish({ kind: "committed", message: "Agent proposal kept.", revision: result.revision });
    return result;
  }

  async revert(): Promise<{ reverted: true; persisted: false } | ProposalEngineErrorResult> {
    const result = await this.engine.revert();
    if ("reverted" in result) this.#publish({ kind: "reverted", message: "Agent proposal reverted. Nothing was saved." });
    return result;
  }

  async restoreLatest(): Promise<{ resynchronized: true; persisted: false; revision: string } | ProposalEngineErrorResult> {
    return this.engine.resynchronize();
  }

  dismissOutcome(): void {
    if (this.#state.kind === "committed" || this.#state.kind === "reverted") this.#publish({ kind: "hidden" });
  }

  destroy(): void {
    this.#unsubscribeEngine();
    this.#listeners.clear();
  }

  #sync(snapshot: ProposalEngineSnapshot): void {
    const review = this.engine.currentReview;
    if (["building", "validating", "rendering"].includes(snapshot.status)) {
      if (!review) return this.#publish({ kind: "hidden" });
      return this.#publish({ kind: "busy", action: "applying", message: "Updating the temporary proposal…" });
    }
    if (snapshot.status === "staging-asset") {
      if (!review) return this.#publish({ kind: "hidden" });
      return this.#publish({ kind: "busy", action: "staging-asset", message: "Preparing temporary artwork…" });
    }
    if (snapshot.status === "capturing-preview") return this.#publish({ kind: "busy", action: "capturing-preview", message: "Preparing the current visual preview…" });
    if (snapshot.status === "reverting") return this.#publish({ kind: "busy", action: "reverting", message: "Restoring the original configuration…" });
    if (snapshot.status === "committing") return this.#publish({ kind: "busy", action: "committing", message: "Keeping the proposal…" });
    if (snapshot.status === "commit-retry") return this.#publish({ kind: "commit-retry", message: "Kept on this device; secure save failed.", retryLabel: "Retry save" });
    if (snapshot.status === "commit-uncertain") return this.#publish({ kind: "commit-uncertain", message: "Save status could not be verified. Reload before continuing." });
    if (snapshot.status === "stale") return this.#publish({ kind: "stale", message: "Configuration changed elsewhere. Discard this proposal and restore the latest version.", refreshLabel: "Restore latest" });
    if ((snapshot.status === "reviewable" || snapshot.status === "preview-unavailable") && review) return this.#publish(this.#temporaryState(review, snapshot));
    if (snapshot.status === "idle" && this.#state.kind !== "committed" && this.#state.kind !== "reverted") this.#publish({ kind: "hidden" });
  }

  #temporaryState(result: ProposalEngineSuccessResult, snapshot: ProposalEngineSnapshot): ReviewState {
    const labels = new Map(this.manifest.controls.map((control) => [control.id, control.label]));
    const activeVariant = result.workspace.variants.find((variant) => variant.id === result.workspace.activeVariantId);
    const previewReady = this.engine.previewBridge === null || snapshot.previewStatus === "available";
    return {
      kind: "temporary",
      heading: "Temporary agent proposal — not saved.",
      proposalId: result.proposalId,
      proposalRevision: result.proposalRevision,
      variantCount: result.workspace.variants.length,
      activeVariantName: activeVariant?.name ?? "Current variant",
      createdVariants: result.diff.createdVariants.map((variant) => ({ ...variant })),
      removedVariants: result.diff.removedVariants.map((variant) => ({ ...variant })),
      changes: result.diff.controlChanges.map((change) => ({
        targetLabel: targetLabel(result, change.target),
        controlId: change.controlId,
        label: labels.get(change.controlId) ?? change.controlId,
        before: displayValue(this.manifest, change.controlId, change.before),
        after: displayValue(this.manifest, change.controlId, change.after),
      })),
      assumptions: [...result.validation.assumptions],
      ...groupIssues(result.validation.issues),
      safeToKeepAsDraft: true,
      productionReady: result.validation.productionReady,
      previewReady,
      canKeep: previewReady,
      ...(previewReady ? {} : { keepDisabledReason: "Waiting for a current visual preview." }),
    };
  }

  #publish(state: ReviewState): void {
    this.#state = structuredClone(state);
    for (const listener of this.#listeners) {
      try { listener(this.state); } catch { /* A view cannot interrupt confirmation behavior. */ }
    }
  }
}
