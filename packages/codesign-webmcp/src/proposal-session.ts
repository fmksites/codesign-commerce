import { isSafeIdentifier, validateManifest, validateOptionValue } from "./manifest.js";
import { GuardedConfiguratorAdapter } from "./adapter-boundary.js";
import type {
  CommitResult,
  ConfigurationDiff,
  ConfigurationState,
  ConfiguratorAdapter,
  ConfiguratorManifest,
  CreateDesignDraftResult,
  CreateDesignInput,
  CreatedDesign,
  JsonPrimitive,
  ProposalErrorCode,
  ProposalErrorResult,
  ProposalInput,
  ProposalExecutionOptions,
  ProposalResult,
  ProposalSessionStatus,
  ProposalSessionSnapshot,
  ProposeResult,
  ValidateConfigurationInput,
  ValidateConfigurationResult,
  ValidationResult,
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
  createdDesigns: CreatedDesign[];
  assumptions: string[];
  operationIds: string[];
  resultsByOperation: Map<string, { fingerprint: string; result: ProposalResult }>;
}

const MAX_PROPOSAL_OPERATIONS = 20;
const MAX_PROPOSAL_ASSUMPTIONS = 20;

function cloneState<T>(value: T): T {
  return structuredClone(value);
}

function createProposalId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `proposal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function operationFingerprint(
  input: ProposalInput | CreateDesignInput,
  creation: { sourceDesignId: string; newDesignChanges: CreateDesignInput["newDesignChanges"] } | null,
): string {
  return JSON.stringify({
    kind: creation ? "create-design" : "propose",
    baseRevision: input.baseRevision,
    changes: input.changes ?? [],
    assumptions: input.assumptions ?? [],
    ...(creation === null ? {} : creation),
  });
}

function errorResult(
  code: ProposalErrorCode,
  message: string,
  retryable: boolean,
  affectedOptions: string[] = [],
  currentRevision?: string,
  persisted: false | "unknown" = false,
): ProposalErrorResult {
  return {
    ok: false,
    persisted,
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
    this.manifest = validateManifest(cloneState(manifest));
    this.adapter = new GuardedConfiguratorAdapter(this.manifest, adapter);
    this.#unsubscribe = this.adapter.subscribeToExternalChanges((revision) => {
      this.#externalRevision = revision;
      if (this.#active && this.#status === "awaiting-human" && revision !== this.#active.baseRevision) {
        this.#setStatus("invalidated");
      }
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
        ? cloneState(this.#active.resultsByOperation.get(this.#active.operationIds.at(-1)!)?.result ?? null)
        : null,
    };
  }

  subscribe(listener: (snapshot: ProposalSessionSnapshot) => void): () => void {
    this.#listeners.add(listener);
    listener(this.snapshot);
    return () => this.#listeners.delete(listener);
  }

  async propose(input: ProposalInput, execution: ProposalExecutionOptions = {}): Promise<ProposeResult> {
    return this.#runOperation(input, null, execution);
  }

  async createDesign(input: CreateDesignInput, execution: ProposalExecutionOptions = {}): Promise<ProposeResult> {
    return this.#runOperation(input, { sourceDesignId: input.sourceDesignId, newDesignChanges: input.newDesignChanges }, execution);
  }

  async validateConfiguration(input: ValidateConfigurationInput = {}): Promise<ValidateConfigurationResult> {
    if (this.#status === "applying" || this.#status === "committing" || this.#status === "reverting") {
      return errorResult("OPERATION_IN_PROGRESS", "Another proposal operation is still in progress", true);
    }
    if (this.#status === "commit-uncertain") {
      return errorResult("COMMIT_STATUS_UNKNOWN", "Commit status is unknown. Reload before continuing.", false, [], undefined, "unknown");
    }
    if (this.#status === "invalidated") {
      return errorResult(
        "STALE_REVISION",
        "The committed configuration changed while the proposal was open",
        true,
        [],
        this.#externalRevision ?? this.#active?.baseRevision,
      );
    }

    try {
      if (this.#active) {
        if (input.proposalId !== undefined && input.proposalId !== this.#active.id) {
          return errorResult("PROPOSAL_PENDING", "Another proposal is awaiting Keep or Revert", true, [], this.#active.baseRevision);
        }
        if (input.proposalRevision !== undefined && input.proposalRevision !== this.#active.revision) {
          return errorResult("STALE_PROPOSAL_REVISION", "The proposal changed. Read it again before validating it.", true, [], this.#active.baseRevision);
        }
        const validation = this.#mergeAssumptions(await this.adapter.validateState(cloneState(this.#active.state)), this.#active.assumptions);
        return {
          ok: true,
          persisted: false,
          source: "proposal",
          revision: this.#active.baseRevision,
          proposalId: this.#active.id,
          proposalRevision: this.#active.revision,
          validation,
        };
      }

      if (input.proposalId !== undefined || input.proposalRevision !== undefined) {
        return errorResult("NO_PROPOSAL", "There is no proposal to validate", false);
      }
      const state = await this.adapter.readState();
      return {
        ok: true,
        persisted: false,
        source: "committed",
        revision: state.revision,
        validation: await this.adapter.validateState(cloneState(state)),
      };
    } catch {
      return errorResult("ADAPTER_FAILURE", "The configuration could not be validated safely", true);
    }
  }

  async #runOperation(
    input: ProposalInput | CreateDesignInput,
    creation: { sourceDesignId: string; newDesignChanges: CreateDesignInput["newDesignChanges"] } | null,
    execution: ProposalExecutionOptions,
  ): Promise<ProposeResult> {
    if (execution.signal?.aborted) return errorResult("CANCELLED", "The proposal was cancelled before it started", true);
    if (this.#status === "invalidated") {
      const currentRevision = this.#externalRevision ?? this.#active?.baseRevision;
      const resynchronized = await this.resynchronize();
      if ("ok" in resynchronized) return resynchronized;
      return errorResult("STALE_REVISION", "The committed configuration changed while the proposal was open", true, [], currentRevision);
    }
    if (this.#status === "applying" || this.#status === "committing" || this.#status === "reverting") {
      return errorResult("OPERATION_IN_PROGRESS", "Another proposal operation is still in progress", true);
    }
    if (this.#status === "commit-retry" || this.#status === "commit-uncertain") {
      return errorResult("COMMIT_ALREADY_STARTED", "Retry the secure save before starting another proposal", false);
    }
    if (!input.operationId || input.operationId.length > 80 || !isSafeIdentifier(input.operationId)) {
      return errorResult("INVALID_VALUE", "operationId must be a safe identifier with at most 80 characters", false);
    }
    if (input.proposalId !== undefined && (input.proposalId.length > 200 || !isSafeIdentifier(input.proposalId))) {
      return errorResult("INVALID_VALUE", "proposalId must be a safe identifier with at most 200 characters", false);
    }
    if (input.assumptions && (input.assumptions.length > MAX_PROPOSAL_ASSUMPTIONS || input.assumptions.some((entry) => entry.length > 500))) {
      return errorResult("INVALID_VALUE", "Assumptions must contain at most 20 bounded text entries", false);
    }
    const changes = input.changes ?? [];
    const totalChanges = changes.length + (creation?.newDesignChanges.length ?? 0);
    if ((!creation && changes.length < 1) || totalChanges > 40) {
      return errorResult("INVALID_VALUE", "A proposal must contain between 1 and 40 changes", false);
    }
    if (creation && (!isSafeIdentifier(creation.sourceDesignId) || creation.newDesignChanges.length > 20)) {
      return errorResult("INVALID_VALUE", "The design creation input is invalid", false);
    }
    const changeInputError = this.#validateChangeInputs(changes, false)
      ?? (creation ? this.#validateChangeInputs(creation.newDesignChanges, true) : null);

    const fingerprint = operationFingerprint(input, creation);
    if (this.#active) {
      const prior = this.#active.resultsByOperation.get(input.operationId);
      if (prior) {
        if (prior.fingerprint !== fingerprint) {
          return errorResult(
            "OPERATION_ID_CONFLICT",
            "operationId was already used for a different proposal operation",
            false,
            [],
            this.#active.baseRevision,
          );
        }
        return cloneState(prior.result);
      }
      if (input.proposalId !== this.#active.id) {
        return errorResult("PROPOSAL_PENDING", "Another proposal is awaiting Keep or Revert", true, [], this.#active.baseRevision);
      }
      if (input.proposalRevision !== this.#active.revision) {
        return errorResult("STALE_PROPOSAL_REVISION", "The proposal changed. Read it again before extending it.", true, [], this.#active.baseRevision);
      }
      if (input.baseRevision !== this.#active.baseRevision) {
        return errorResult("STALE_REVISION", "The proposal is based on a different committed revision", true, [], this.#active.baseRevision);
      }
      if (this.#active.operationIds.length >= MAX_PROPOSAL_OPERATIONS) {
        return errorResult(
          "CAPABILITY_UNAVAILABLE",
          `A proposal may contain at most ${MAX_PROPOSAL_OPERATIONS} successful operations`,
          false,
          [],
          this.#active.baseRevision,
        );
      }
      const accumulatedAssumptions = new Set([...this.#active.assumptions, ...(input.assumptions ?? [])]);
      if (accumulatedAssumptions.size > MAX_PROPOSAL_ASSUMPTIONS) {
        return errorResult(
          "INVALID_VALUE",
          `A proposal may contain at most ${MAX_PROPOSAL_ASSUMPTIONS} unique assumptions`,
          false,
          [],
          this.#active.baseRevision,
        );
      }
    }
    if (changeInputError) return changeInputError;

    this.#setStatus("applying");
    let openedProposal = false;
    try {
      if (!this.#active) {
        this.#externalRevision = null;
        await this.adapter.quiescePersistence();
        this.#throwIfCancelled(execution.signal);
        const committed = await this.adapter.readState();
        this.#throwIfCancelled(execution.signal);
        if (committed.revision !== input.baseRevision) {
          this.#setStatus("idle");
          return errorResult("STALE_REVISION", "The visible configuration changed. Read it again before proposing.", true, [], committed.revision);
        }
        if (this.#externalRevision && this.#externalRevision !== committed.revision) {
          const currentRevision = this.#externalRevision;
          this.#externalRevision = null;
          this.#setStatus("idle");
          return errorResult("STALE_REVISION", "The visible configuration changed. Read it again before proposing.", true, [], currentRevision);
        }
        const snapshot = await this.adapter.captureSnapshot();
        this.#throwIfCancelled(execution.signal);
        if (this.#externalRevision && this.#externalRevision !== committed.revision) {
          const currentRevision = this.#externalRevision;
          this.#externalRevision = null;
          this.#setStatus("idle");
          return errorResult("STALE_REVISION", "The visible configuration changed. Read it again before proposing.", true, [], currentRevision);
        }
        this.#active = {
          id: createProposalId(),
          baseRevision: committed.revision,
          revision: 0,
          snapshot,
          state: cloneState(committed),
          diff: [],
          createdDesigns: [],
          assumptions: [],
          operationIds: [],
          resultsByOperation: new Map(),
        };
        openedProposal = true;
        if (this.#externalRevision === committed.revision) this.#externalRevision = null;
      }

      if (this.#externalRevision && this.#externalRevision !== this.#active.baseRevision) {
        return this.#discardStaleProposal(this.#externalRevision);
      }

      let nextState = cloneState(this.#active.state);
      const nextDiff = [...this.#active.diff];
      const nextCreatedDesigns = cloneState(this.#active.createdDesigns);
      let operationChanges = changes;

      if (creation) {
        if (!this.manifest.variantPolicy.operations.includes("duplicate")) {
          const result = errorResult("CAPABILITY_UNAVAILABLE", "This configurator does not support design cloning", false);
          if (openedProposal) await this.#restoreAndClear();
          else this.#setStatus("awaiting-human");
          return result;
        }
        if (nextState.designs.length >= this.manifest.variantPolicy.maximumVariants) {
          const result = errorResult("CAPABILITY_UNAVAILABLE", "The configurator has reached its design limit", false);
          if (openedProposal) await this.#restoreAndClear();
          else this.#setStatus("awaiting-human");
          return result;
        }
        if (!nextState.designs.some((design) => design.id === creation.sourceDesignId)) {
          const result = errorResult("UNKNOWN_DESIGN", `Unknown design ${creation.sourceDesignId}`, false);
          if (openedProposal) await this.#restoreAndClear();
          else this.#setStatus("awaiting-human");
          return result;
        }
        if (!this.adapter.createDesignDraft) {
          const result = errorResult("CAPABILITY_UNAVAILABLE", "The adapter does not implement design cloning", false);
          if (openedProposal) await this.#restoreAndClear();
          else this.#setStatus("awaiting-human");
          return result;
        }

        const created = await this.adapter.createDesignDraft(cloneState(nextState), {
          sourceDesignId: creation.sourceDesignId,
          operationId: input.operationId,
        });
        if (this.#externalRevision && this.#externalRevision !== this.#active.baseRevision) {
          return this.#discardStaleProposal(this.#externalRevision);
        }
        const cloneError = this.#validateCreatedDraft(nextState, created, creation.sourceDesignId);
        if (cloneError) {
          if (openedProposal) await this.#restoreAndClear();
          else this.#setStatus("awaiting-human");
          return cloneError;
        }
        nextState = cloneState(created.state);
        const newDesign = nextState.designs.find((design) => design.id === created.designId)!;
        nextCreatedDesigns.push({ designId: newDesign.id, sourceDesignId: creation.sourceDesignId, name: newDesign.name });
        operationChanges = [
          ...changes,
          ...creation.newDesignChanges.map((change) => ({ ...change, designId: created.designId })),
        ];
      }

      const validationError = this.#applyChanges(nextState, nextDiff, operationChanges);
      if (validationError) {
        if (openedProposal) await this.#restoreAndClear();
        else this.#setStatus("awaiting-human");
        return validationError;
      }

      const validation = await this.adapter.validateState(nextState);
      this.#throwIfCancelled(execution.signal);
      if (this.#externalRevision && this.#externalRevision !== this.#active.baseRevision) {
        return this.#discardStaleProposal(this.#externalRevision);
      }
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
      if (this.#externalRevision && this.#externalRevision !== this.#active.baseRevision) {
        return this.#discardStaleProposal(this.#externalRevision);
      }
      this.#active.state = nextState;
      this.#active.diff = nextDiff;
      this.#active.createdDesigns = nextCreatedDesigns.map((created) => {
        const design = nextState.designs.find((candidate) => candidate.id === created.designId);
        return design ? { ...created, name: design.name } : created;
      });
      this.#active.revision += 1;
      this.#active.operationIds.push(input.operationId);
      this.#active.assumptions = [...new Set([...this.#active.assumptions, ...(input.assumptions ?? [])])];
      const enrichedValidation = this.#mergeAssumptions(validation, this.#active.assumptions);

      const result: ProposalResult = {
        ok: true,
        proposalId: this.#active.id,
        proposalRevision: this.#active.revision,
        baseRevision: this.#active.baseRevision,
        persisted: false,
        diff: cloneState(this.#active.diff),
        createdDesigns: cloneState(this.#active.createdDesigns),
        validation: enrichedValidation,
        confirmation: {
          required: true,
          choices: ["keep", "revert"],
          message: "A person must choose Keep proposal or Revert in the page. Nothing has been saved.",
        },
      };
      this.#active.resultsByOperation.set(input.operationId, { fingerprint, result: cloneState(result) });
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
    if (this.#status === "commit-retry" || this.#status === "commit-uncertain" || this.#status === "committing") {
      return errorResult(
        "COMMIT_ALREADY_STARTED",
        "The local commit boundary has been crossed; retry the secure save instead",
        false,
      );
    }
    if (this.#status === "invalidated") {
      const result = await this.resynchronize();
      if ("ok" in result) return result;
      return { reverted: true, persisted: false };
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
    if (this.#status === "invalidated") {
      const currentRevision = this.#externalRevision ?? this.#active.baseRevision;
      const result = await this.resynchronize();
      if ("ok" in result) return result;
      return errorResult("STALE_REVISION", "The proposal was discarded because the committed configuration changed", true, [], currentRevision);
    }
    if (this.#status === "commit-uncertain") {
      return errorResult("COMMIT_STATUS_UNKNOWN", "Commit status is unknown. Reload before continuing.", false, [], undefined, "unknown");
    }
    if (this.#status !== "awaiting-human" && this.#status !== "commit-retry") {
      return errorResult("OPERATION_IN_PROGRESS", "The proposal is not ready to keep", true);
    }
    const retryingServerSave = this.#status === "commit-retry";
    if (!retryingServerSave && this.#externalRevision && this.#externalRevision !== this.#active.baseRevision) {
      return this.#discardStaleProposal(this.#externalRevision);
    }
    this.#setStatus("committing");
    try {
      if (!retryingServerSave) {
        const committed = await this.adapter.readState();
        if (committed.revision !== this.#active.baseRevision || (this.#externalRevision && this.#externalRevision !== this.#active.baseRevision)) {
          return this.#discardStaleProposal(this.#externalRevision ?? committed.revision);
        }
      }
      const result = await this.adapter.commitState(this.#active.state, {
        proposalId: this.#active.id,
        baseRevision: this.#active.baseRevision,
        operationIds: [...this.#active.operationIds],
        trigger: "confirmed_page_keep",
      });
      if (!result.localPersisted) {
        return this.#discardStaleProposal(result.revision);
      }
      if (!result.serverPersisted) {
        this.#setStatus("commit-retry");
        return result;
      }
      this.#clear();
      return result;
    } catch {
      this.#setStatus("commit-uncertain");
      let currentRevision = this.#active.baseRevision;
      try {
        currentRevision = (await this.adapter.readState()).revision;
      } catch {
        // The public error remains sanitized even if the adapter cannot report its local revision.
      }
      return errorResult(
        "COMMIT_STATUS_UNKNOWN",
        "Commit status could not be verified. Reload before continuing.",
        false,
        [],
        currentRevision,
        "unknown",
      );
    }
  }

  async resynchronize(): Promise<{ resynchronized: true; persisted: false; revision: string } | ProposalErrorResult> {
    if (!this.#active || this.#status !== "invalidated") {
      return errorResult("NO_PROPOSAL", "There is no invalidated proposal to resynchronize", false);
    }
    try {
      const committed = await this.adapter.readState();
      await this.adapter.previewState(committed);
      this.#clear();
      return { resynchronized: true, persisted: false, revision: committed.revision };
    } catch {
      this.#setStatus("invalidated");
      return errorResult("ADAPTER_FAILURE", "The latest committed configuration could not be restored", true);
    }
  }

  destroy(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }

  #validateChangeInputs(changes: ProposalInput["changes"], designOnly: boolean): ProposalErrorResult | null {
    const options = new Map(this.manifest.controls.map((option) => [option.id, option]));
    for (const change of changes) {
      const option = options.get(change.optionId);
      if (!option) return errorResult("UNKNOWN_OPTION", `Unknown option ${change.optionId}`, false, [change.optionId]);
      if (!option.agentWritable) return errorResult("OPTION_NOT_WRITABLE", `Option ${change.optionId} is not agent-writable`, false, [change.optionId]);
      if (designOnly && option.scope !== "variant" && option.scope !== "element") {
        return errorResult("INVALID_VALUE", `Option ${change.optionId} cannot be applied to a new design`, false, [change.optionId]);
      }
      const invalid = validateOptionValue(option, change.value);
      if (invalid) return errorResult("INVALID_VALUE", invalid, false, [change.optionId]);
    }
    return null;
  }

  #applyChanges(state: ConfigurationState, diff: ConfigurationDiff[], changes: ProposalInput["changes"]): ProposalErrorResult | null {
    const options = new Map(this.manifest.controls.map((option) => [option.id, option]));

    for (const change of changes) {
      const option = options.get(change.optionId);
      if (!option) return errorResult("UNKNOWN_OPTION", `Unknown option ${change.optionId}`, false, [change.optionId], state.revision);
      if (!option.agentWritable) return errorResult("OPTION_NOT_WRITABLE", `Option ${change.optionId} is not agent-writable`, false, [change.optionId], state.revision);
      const invalid = validateOptionValue(option, change.value);
      if (invalid) return errorResult("INVALID_VALUE", invalid, false, [change.optionId], state.revision);

      if (option.scope === "variant" || option.scope === "element") {
        const design = state.designs.find((candidate) => candidate.id === change.designId);
        if (!design) return errorResult("UNKNOWN_DESIGN", `Unknown design ${change.designId ?? ""}`, false, [change.optionId], state.revision);
        let before: JsonPrimitive | undefined;
        if (option.role === "variant-quantity") {
          before = design.quantity;
          design.quantity = change.value as number;
        } else if (option.role === "variant-name") {
          before = design.name;
          design.name = change.value as string;
        } else {
          before = design.selections[change.optionId];
          design.selections[change.optionId] = change.value;
        }
        this.#recordDiff(diff, { designId: design.id, optionId: option.id, before, after: change.value });
      } else {
        if (option.role !== "workspace-total") return errorResult("INVALID_MANIFEST", `Workspace control ${option.id} has no supported canonical role`, false, [option.id], state.revision);
        const before = state.order.totalQuantity;
        state.order.totalQuantity = change.value as number;
        this.#recordDiff(diff, { optionId: option.id, before, after: change.value });
      }
    }
    return null;
  }

  #recordDiff(diff: ConfigurationDiff[], change: ConfigurationDiff): void {
    const index = diff.findIndex((candidate) => candidate.optionId === change.optionId && candidate.designId === change.designId);
    if (index === -1) {
      if (!Object.is(change.before, change.after)) diff.push(change);
      return;
    }
    const existing = diff[index]!;
    if (Object.is(existing.before, change.after)) {
      diff.splice(index, 1);
    } else {
      diff[index] = { ...existing, after: change.after };
    }
  }

  #validateCreatedDraft(
    before: ConfigurationState,
    created: CreateDesignDraftResult,
    sourceDesignId: string,
  ): ProposalErrorResult | null {
    const state = created?.state;
    if (!state || typeof created.designId !== "string" || !isSafeIdentifier(created.designId)) {
      return errorResult("ADAPTER_FAILURE", "The adapter returned an invalid design clone", false);
    }
    if (
      state.configuratorId !== before.configuratorId
      || state.manifestVersion !== before.manifestVersion
      || state.revision !== before.revision
      || state.order.totalQuantity !== before.order.totalQuantity
      || state.designs.length !== before.designs.length + 1
      || state.activeDesignId !== created.designId
      || before.designs.some((design) => !state.designs.some((candidate) => candidate.id === design.id && JSON.stringify(candidate) === JSON.stringify(design)))
    ) {
      return errorResult("ADAPTER_FAILURE", "The adapter returned an unsafe design clone", false);
    }

    const matching = state.designs.filter((design) => design.id === created.designId);
    if (
      matching.length !== 1
      || before.designs.some((design) => design.id === created.designId)
      || !state.designs.some((design) => design.id === sourceDesignId)
      || matching[0]!.assets.some((asset) => asset.agentWritable !== false)
    ) {
      return errorResult("ADAPTER_FAILURE", "The adapter returned an unsafe design clone", false);
    }
    return null;
  }

  #mergeAssumptions(validation: ValidationResult, assumptions: string[]): ValidationResult {
    const merged = [...new Set([...validation.assumptions, ...assumptions])];
    if (merged.length > MAX_PROPOSAL_ASSUMPTIONS) {
      throw new Error("The public assumption limit was exceeded");
    }
    return {
      ...cloneState(validation),
      assumptions: merged,
    };
  }

  async #restoreAndClear(): Promise<void> {
    if (this.#active) await this.adapter.restoreSnapshot(this.#active.snapshot);
    this.#clear();
  }

  async #discardStaleProposal(currentRevision: string): Promise<ProposalErrorResult> {
    try {
      const committed = await this.adapter.readState();
      await this.adapter.previewState(committed);
      this.#clear();
      return errorResult(
        "STALE_REVISION",
        "The committed configuration changed while the proposal was open",
        true,
        [],
        committed.revision,
      );
    } catch {
      this.#externalRevision = currentRevision;
      this.#setStatus("invalidated");
      return errorResult("ADAPTER_FAILURE", "The latest committed configuration could not be restored", true, [], currentRevision);
    }
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
