import type { ProposalSession } from "./proposal-session.js";
import type {
  CommitResult,
  ConfigurationDiff,
  ConfiguratorManifest,
  ProposalErrorResult,
  ProposalResult,
  ProposalSessionSnapshot,
  ValidationIssue,
} from "./types.js";

export type ReviewState =
  | { kind: "hidden" }
  | {
      kind: "temporary";
      heading: "Temporary agent proposal — not saved.";
      proposalId: string;
      proposalRevision: number;
      designCount: number;
      totalQuantity: number;
      createdDesigns: Array<{ designId: string; sourceDesignId: string; name: string }>;
      changes: ReviewChange[];
      assumptions: string[];
      hardErrors: ValidationIssue[];
      missingDecisions: ValidationIssue[];
      warnings: ValidationIssue[];
      safeToKeepAsDraft: true;
      productionReady: boolean;
    }
  | { kind: "busy"; action: "applying" | "reverting" | "committing"; message: string }
  | { kind: "invalidated"; message: "Configuration changed elsewhere. Discard this proposal and restore the latest version."; refreshLabel: "Restore latest" }
  | { kind: "commit-retry"; message: "Kept on this device; secure save failed."; retryLabel: "Retry save" }
  | { kind: "commit-uncertain"; message: "Save status could not be verified. Reload before continuing." }
  | { kind: "committed"; message: "Agent proposal kept."; revision: string }
  | { kind: "reverted"; message: "Agent proposal reverted. Nothing was saved." };

export interface ReviewChange {
  designId?: string;
  optionId: string;
  label: string;
  before: string;
  after: string;
}

function displayValue(
  manifest: ConfiguratorManifest,
  optionId: string,
  value: ConfigurationDiff["before"] | ConfigurationDiff["after"],
): string {
  if (value === undefined) return "Not set";
  if (value === null) return "None";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const option = manifest.controls.find((candidate) => candidate.id === optionId);
  const labelledValue = option?.values?.find((candidate) => candidate.id === value);
  if (labelledValue) return labelledValue.label;
  return String(value);
}

function groupIssues(issues: ValidationIssue[]) {
  return {
    hardErrors: issues.filter((issue) => issue.severity === "constraint-error"),
    missingDecisions: issues.filter((issue) => issue.severity === "decision-required"),
    warnings: issues.filter((issue) => issue.severity === "warning" || issue.severity === "information"),
  };
}

export class ProposalReviewController<Snapshot = unknown> {
  readonly manifest: ConfiguratorManifest;
  readonly session: ProposalSession<Snapshot>;

  #state: ReviewState = { kind: "hidden" };
  #listeners = new Set<(state: ReviewState) => void>();
  #unsubscribeSession: () => void;

  constructor(manifest: ConfiguratorManifest, session: ProposalSession<Snapshot>) {
    this.manifest = manifest;
    this.session = session;
    this.#unsubscribeSession = session.subscribe((snapshot) => this.#sync(snapshot));
  }

  get state(): ReviewState {
    return structuredClone(this.#state);
  }

  subscribe(listener: (state: ReviewState) => void): () => void {
    this.#listeners.add(listener);
    listener(this.state);
    return () => this.#listeners.delete(listener);
  }

  async keep(): Promise<CommitResult | ProposalErrorResult> {
    const result = await this.session.keep();
    if ("revision" in result && result.serverPersisted) this.#publish({ kind: "committed", message: "Agent proposal kept.", revision: result.revision });
    return result;
  }

  async retrySave(): Promise<CommitResult | ProposalErrorResult> {
    if (this.#state.kind !== "commit-retry") {
      return {
        ok: false,
        persisted: false,
        error: { code: "NO_PROPOSAL", message: "There is no failed secure save to retry", retryable: false, affectedOptions: [] },
      };
    }
    return this.keep();
  }

  async revert(): Promise<{ reverted: true; persisted: false } | ProposalErrorResult> {
    const result = await this.session.revert();
    if ("reverted" in result) this.#publish({ kind: "reverted", message: "Agent proposal reverted. Nothing was saved." });
    return result;
  }

  async restoreLatest(): Promise<{ resynchronized: true; persisted: false; revision: string } | ProposalErrorResult> {
    return this.session.resynchronize();
  }

  dismissOutcome(): void {
    if (this.#state.kind === "committed" || this.#state.kind === "reverted") this.#publish({ kind: "hidden" });
  }

  destroy(): void {
    this.#unsubscribeSession();
    this.#listeners.clear();
  }

  #sync(snapshot: ProposalSessionSnapshot): void {
    if (snapshot.status === "applying") {
      if (snapshot.proposalId === null) {
        this.#publish({ kind: "hidden" });
        return;
      }
      this.#publish({ kind: "busy", action: "applying", message: "Applying temporary proposal…" });
      return;
    }
    if (snapshot.status === "reverting") {
      this.#publish({ kind: "busy", action: "reverting", message: "Restoring the original configuration…" });
      return;
    }
    if (snapshot.status === "committing") {
      this.#publish({ kind: "busy", action: "committing", message: "Keeping the proposal…" });
      return;
    }
    if (snapshot.status === "commit-retry") {
      this.#publish({ kind: "commit-retry", message: "Kept on this device; secure save failed.", retryLabel: "Retry save" });
      return;
    }
    if (snapshot.status === "commit-uncertain") {
      this.#publish({ kind: "commit-uncertain", message: "Save status could not be verified. Reload before continuing." });
      return;
    }
    if (snapshot.status === "invalidated") {
      this.#publish({
        kind: "invalidated",
        message: "Configuration changed elsewhere. Discard this proposal and restore the latest version.",
        refreshLabel: "Restore latest",
      });
      return;
    }
    if (snapshot.status === "awaiting-human" && snapshot.result) {
      this.#publish(this.#temporaryState(snapshot.result));
      return;
    }
    if (snapshot.status === "idle" && this.#state.kind !== "committed" && this.#state.kind !== "reverted") {
      this.#publish({ kind: "hidden" });
    }
  }

  #temporaryState(result: ProposalResult): ReviewState {
    const labels = new Map(this.manifest.controls.map((option) => [option.id, option.label]));
    const proposedState = this.session.proposedState;
    return {
      kind: "temporary",
      heading: "Temporary agent proposal — not saved.",
      proposalId: result.proposalId,
      proposalRevision: result.proposalRevision,
      designCount: proposedState?.designs.length ?? 0,
      totalQuantity: proposedState?.order.totalQuantity ?? 0,
      createdDesigns: cloneCreatedDesigns(result.createdDesigns),
      changes: result.diff.map((change) => ({
        ...(change.designId === undefined ? {} : { designId: change.designId }),
        optionId: change.optionId,
        label: labels.get(change.optionId) ?? change.optionId,
        before: displayValue(this.manifest, change.optionId, change.before),
        after: displayValue(this.manifest, change.optionId, change.after),
      })),
      assumptions: [...result.validation.assumptions],
      ...groupIssues(result.validation.issues),
      safeToKeepAsDraft: true,
      productionReady: result.validation.productionReady,
    };
  }

  #publish(state: ReviewState): void {
    this.#state = structuredClone(state);
    for (const listener of this.#listeners) {
      try {
        listener(this.state);
      } catch {
        // A view listener cannot interrupt confirmation behavior.
      }
    }
  }
}

function cloneCreatedDesigns(createdDesigns: ProposalResult["createdDesigns"]): ProposalResult["createdDesigns"] {
  return createdDesigns.map((created) => ({ ...created }));
}
