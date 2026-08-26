import { validateManifest, validateOptionValue } from "./manifest.js";
import type {
  CommitResult,
  ConfigurationDiff,
  ConfigurationState,
  ConfiguratorAdapter,
  ConfiguratorManifest,
  JsonPrimitive,
  ProposalErrorCode,
  ProposalErrorResult,
  ProposalInput,
  ProposalExecutionOptions,
  ProposalResult,
  ProposalSessionStatus,
  ProposalSessionSnapshot,
  ProposeResult,
} from "./types.js";

class ProposalCancelledError extends Error {
  constructor() {
    super("Proposal execution was cancelled");
    this.name = "ProposalCancelledError";
  }
}

interface ActiveProposal<Snapshot> {
  id: string;
  baseRevision: string;
  revision: number;
  snapshot: Snapshot;
  state: ConfigurationState;
  diff: ConfigurationDiff[];
  operationIds: string[];
  resultsByOperation: Map<string, ProposalResult>;
}

function cloneState<T>(value: T): T {
  return structuredClone(value);
}

function createProposalId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `proposal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function errorResult(code: ProposalErrorCode, message: string, retryable: boolean, affectedOptions: string[] = [], currentRevision?: string): ProposalErrorResult {
  return {
    ok: false,
    persisted: false,
    ...(currentRevision === undefined ? {} : { currentRevision }),
    error: { code, message, retryable, affectedOptions },
  };
}

export class ProposalSession<Snapshot = unknown> {
  readonly manifest: ConfiguratorManifest;
  readonly adapter: ConfiguratorAdapter<Snapshot>;

  #status: ProposalSessionStatus = "idle";
  #active: ActiveProposal<Snapshot> | null = null;
  #unsubscribe: (() => void) | null = null;
  #externalRevision: string | null = null;
  #listeners = new Set<(snapshot: ProposalSessionSnapshot) => void>();

  constructor(manifest: ConfiguratorManifest, adapter: ConfiguratorAdapter<Snapshot>) {
    this.manifest = validateManifest(manifest);
    this.adapter = adapter;
    this.#unsubscribe = adapter.subscribeToExternalChanges((revision) => {
      this.#externalRevision = revision;
    });
  }

  get status(): ProposalSessionStatus {
    return this.#status;
  }

  get proposalId(): string | null {
    return this.#active?.id ?? null;
  }

  get proposalRevision(): number | null {
    return this.#active?.revision ?? null;
  }

  get proposedState(): ConfigurationState | null {
    return this.#active ? cloneState(this.#active.state) : null;
  }

  get snapshot(): ProposalSessionSnapshot {
    return {
      status: this.#status,
      proposalId: this.#active?.id ?? null,
      proposalRevision: this.#active?.revision ?? null,
      result: this.#active?.operationIds.length
        ? cloneState(this.#active.resultsByOperation.get(this.#active.operationIds.at(-1)!) ?? null)
        : null,
    };
  }

  subscribe(listener: (snapshot: ProposalSessionSnapshot) => void): () => void {
    this.#listeners.add(listener);
    listener(this.snapshot);
    return () => this.#listeners.delete(listener);
  }

  async propose(input: ProposalInput, execution: ProposalExecutionOptions = {}): Promise<ProposeResult> {
    if (execution.signal?.aborted) return errorResult("CANCELLED", "The proposal was cancelled before it started", true);
    if (this.#status === "applying" || this.#status === "committing" || this.#status === "reverting") {
      return errorResult("OPERATION_IN_PROGRESS", "Another proposal operation is still in progress", true);
    }
    if (this.#status === "commit-retry") {
      return errorResult("COMMIT_ALREADY_STARTED", "Retry the secure save before starting another proposal", false);
    }
    if (!input.operationId || input.operationId.length > 80) {
      return errorResult("INVALID_VALUE", "operationId is required and must be at most 80 characters", false);
    }
    if (input.changes.length < 1 || input.changes.length > 40) {
      return errorResult("INVALID_VALUE", "A proposal must contain between 1 and 40 changes", false);
    }

    if (this.#active) {
      const prior = this.#active.resultsByOperation.get(input.operationId);
      if (prior) return cloneState(prior);
      if (input.proposalId !== this.#active.id) {
        return errorResult("PROPOSAL_PENDING", "Another proposal is awaiting Keep or Revert", true, [], this.#active.baseRevision);
      }
      if (input.proposalRevision !== this.#active.revision) {
        return errorResult("STALE_PROPOSAL_REVISION", "The proposal changed. Read it again before extending it.", true, [], this.#active.baseRevision);
      }
      if (input.baseRevision !== this.#active.baseRevision) {
        return errorResult("STALE_REVISION", "The proposal is based on a different committed revision", true, [], this.#active.baseRevision);
      }
    }

    this.#setStatus("applying");
    let openedProposal = false;
    try {
      if (!this.#active) {
        await this.adapter.quiescePersistence();
        this.#throwIfCancelled(execution.signal);
        const committed = await this.adapter.readState();
        this.#throwIfCancelled(execution.signal);
        if (committed.revision !== input.baseRevision) {
          this.#setStatus("idle");
          return errorResult("STALE_REVISION", "The visible configuration changed. Read it again before proposing.", true, [], committed.revision);
        }
        const snapshot = await this.adapter.captureSnapshot();
        this.#throwIfCancelled(execution.signal);
        this.#active = {
          id: createProposalId(),
          baseRevision: committed.revision,
          revision: 0,
          snapshot,
          state: cloneState(committed),
          diff: [],
          operationIds: [],
          resultsByOperation: new Map(),
        };
        openedProposal = true;
        this.#externalRevision = null;
      }

      if (this.#externalRevision && this.#externalRevision !== this.#active.baseRevision) {
        await this.#restoreAndClear();
        return errorResult("STALE_REVISION", "The committed configuration changed while the proposal was open", true, [], this.#externalRevision);
      }

      const nextState = cloneState(this.#active.state);
      const nextDiff = [...this.#active.diff];
      const validationError = this.#applyChanges(nextState, nextDiff, input.changes);
      if (validationError) {
        if (openedProposal) await this.#restoreAndClear();
        else this.#setStatus("awaiting-human");
        return validationError;
      }

      const validation = await this.adapter.validateState(nextState);
      this.#throwIfCancelled(execution.signal);
      if (!validation.configurationValid) {
        const result = errorResult(
          "INVALID_VALUE",
          "The proposal violates a configuration constraint",
          false,
          validation.issues.flatMap((issue) => issue.optionIds ?? []),
          this.#active.baseRevision,
        );
        if (openedProposal) await this.#restoreAndClear();
        else this.#setStatus("awaiting-human");
        return result;
      }

      await this.adapter.previewState(nextState);
      this.#throwIfCancelled(execution.signal);
      this.#active.state = nextState;
      this.#active.diff = nextDiff;
      this.#active.revision += 1;
      this.#active.operationIds.push(input.operationId);
      if (input.assumptions) validation.assumptions = [...validation.assumptions, ...input.assumptions];

      const result: ProposalResult = {
        ok: true,
        proposalId: this.#active.id,
        proposalRevision: this.#active.revision,
        baseRevision: this.#active.baseRevision,
        persisted: false,
        diff: cloneState(this.#active.diff),
        validation,
      };
      this.#active.resultsByOperation.set(input.operationId, cloneState(result));
      this.#setStatus("awaiting-human");
      return result;
    } catch (error) {
      if (this.#active) {
        try {
          await this.#restoreAndClear();
        } catch {
          this.#clear();
        }
      }
      this.#setStatus("idle");
      if (error instanceof ProposalCancelledError) {
        return errorResult("CANCELLED", "The proposal was cancelled and the original configuration was restored", true);
      }
      return errorResult("ADAPTER_FAILURE", "The proposal could not be applied safely", true);
    }
  }

  async revert(): Promise<{ reverted: true; persisted: false } | ProposalErrorResult> {
    if (!this.#active) return errorResult("NO_PROPOSAL", "There is no proposal to revert", false);
    if (this.#status === "commit-retry" || this.#status === "committing") {
      return errorResult(
        "COMMIT_ALREADY_STARTED",
        "The local commit boundary has been crossed; retry the secure save instead",
        false,
      );
    }
    if (this.#status !== "awaiting-human") {
      return errorResult("OPERATION_IN_PROGRESS", "The proposal is not ready to revert", true);
    }
    this.#setStatus("reverting");
    try {
      await this.adapter.restoreSnapshot(this.#active.snapshot);
      this.#clear();
      return { reverted: true, persisted: false };
    } catch {
      this.#setStatus("awaiting-human");
      return errorResult("ADAPTER_FAILURE", "The original configuration could not be restored", true);
    }
  }

  async keep(): Promise<CommitResult | ProposalErrorResult> {
    if (!this.#active) return errorResult("NO_PROPOSAL", "There is no proposal to keep", false);
    if (this.#status !== "awaiting-human" && this.#status !== "commit-retry") {
      return errorResult("OPERATION_IN_PROGRESS", "The proposal is not ready to keep", true);
    }
    this.#setStatus("committing");
    try {
      const result = await this.adapter.commitState(this.#active.state, {
        proposalId: this.#active.id,
        operationIds: [...this.#active.operationIds],
        trigger: "agent_proposal_keep",
      });
      this.#clear();
      return result;
    } catch {
      this.#setStatus("commit-retry");
      let currentRevision = this.#active.baseRevision;
      try {
        currentRevision = (await this.adapter.readState()).revision;
      } catch {
        // The public error remains sanitized even if the adapter cannot report its local revision.
      }
      return errorResult("ADAPTER_FAILURE", "The proposal was kept locally but the secure save did not complete", true, [], currentRevision);
    }
  }

  destroy(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }

  #applyChanges(state: ConfigurationState, diff: ConfigurationDiff[], changes: ProposalInput["changes"]): ProposalErrorResult | null {
    const options = new Map(this.manifest.optionGroups.map((option) => [option.id, option]));

    for (const change of changes) {
      const option = options.get(change.optionId);
      if (!option) return errorResult("UNKNOWN_OPTION", `Unknown option ${change.optionId}`, false, [change.optionId], state.revision);
      if (!option.agentWritable) return errorResult("OPTION_NOT_WRITABLE", `Option ${change.optionId} is not agent-writable`, false, [change.optionId], state.revision);
      const invalid = validateOptionValue(option, change.value);
      if (invalid) return errorResult("INVALID_VALUE", invalid, false, [change.optionId], state.revision);

      if (option.scope === "design") {
        const design = state.designs.find((candidate) => candidate.id === change.designId);
        if (!design) return errorResult("UNKNOWN_DESIGN", `Unknown design ${change.designId ?? ""}`, false, [change.optionId], state.revision);
        let before: JsonPrimitive | undefined;
        if (option.role === "design-quantity") {
          before = design.quantity;
          design.quantity = change.value as number;
        } else if (option.role === "design-name") {
          before = design.name;
          design.name = change.value as string;
        } else {
          before = design.selections[change.optionId];
          design.selections[change.optionId] = change.value;
        }
        diff.push({ designId: design.id, optionId: option.id, before, after: change.value });
      } else {
        if (option.role !== "order-total") return errorResult("INVALID_MANIFEST", `Order option ${option.id} has no supported canonical role`, false, [option.id], state.revision);
        const before = state.order.totalQuantity;
        state.order.totalQuantity = change.value as number;
        diff.push({ optionId: option.id, before, after: change.value });
      }
    }
    return null;
  }

  async #restoreAndClear(): Promise<void> {
    if (this.#active) await this.adapter.restoreSnapshot(this.#active.snapshot);
    this.#clear();
  }

  #clear(): void {
    this.#active = null;
    this.#externalRevision = null;
    this.#setStatus("idle");
  }

  #throwIfCancelled(signal: AbortSignal | undefined): void {
    if (signal?.aborted) throw new ProposalCancelledError();
  }

  #setStatus(status: ProposalSessionStatus): void {
    this.#status = status;
    const snapshot = this.snapshot;
    for (const listener of this.#listeners) {
      try {
        listener(snapshot);
      } catch {
        // Review listeners cannot break transaction safety.
      }
    }
  }
}
