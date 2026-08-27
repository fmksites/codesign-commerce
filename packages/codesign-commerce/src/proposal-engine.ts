import { validateManifest } from "./manifest.js";
import { AtomicOperationReducer, OperationValidationError, validateApplyOperationsInput } from "./operations.js";
import { AssetSandbox, AssetSandboxError, validateStageAssetInput } from "./asset-sandbox.js";
import { PreviewBridge, PreviewBridgeError, validatePreviewCaptureRequest } from "./preview-bridge.js";
import { GuardedWorkspaceAdapter } from "./workspace-adapter.js";
import type {
  ApplyOperationsInput,
  AssetResolver,
  AssetStageSuccessResult,
  CommitResult,
  ConfiguratorManifest,
  PreviewArtifact,
  PreviewCaptureSuccessResult,
  ProposalEndReason,
  ProposalEngineErrorCode,
  ProposalEngineErrorResult,
  ProposalEngineSnapshot,
  ProposalEngineStatus,
  ProposalEngineSuccessResult,
  WorkspaceAdapter,
  WorkspaceState,
  WorkspaceValidationResult,
} from "./types.js";

const MAX_ASSUMPTIONS = 20;

const OPERATION_MESSAGES: Record<OperationValidationError["code"], string> = {
  INVALID_INPUT: "The operation batch did not match the public schema",
  UNKNOWN_CONTROL: "The operation references an unknown control",
  CONTROL_NOT_WRITABLE: "The operation references a control that agents cannot change",
  INVALID_VALUE: "The operation contains a value outside the declared public contract",
  INVALID_TARGET: "The operation target does not match the declared control",
  UNKNOWN_VARIANT: "The operation references an unknown variant",
  UNKNOWN_ELEMENT: "The operation references an unknown design element",
  VARIANT_OPERATION_UNAVAILABLE: "The requested variant operation is unavailable",
  VARIANT_LIMIT: "The requested operation exceeds the declared variant limit",
  DUPLICATE_ID: "The operation would create a duplicate public identifier",
  STALE_REVISION: "The committed workspace revision is stale",
  OPERATION_ID_CONFLICT: "The operation identifier was already used for different input",
};

class ProposalCancelledError extends Error {}
class ProposalStaleError extends Error {
  constructor(readonly revision: string) { super("stale"); }
}

interface StoredProposalOperation {
  result: ProposalEngineSuccessResult;
}

interface ActiveProposal<Snapshot> {
  id: string;
  revision: number;
  baseRevision: string;
  snapshot: Snapshot;
  state: WorkspaceState;
  validation: WorkspaceValidationResult | null;
  reducer: AtomicOperationReducer;
  operationIds: string[];
  results: Map<string, StoredProposalOperation>;
  previewStatus: "ready-for-capture" | "available" | "unavailable";
  previewArtifacts: PreviewArtifact[];
}

export interface ProposalEngineExecutionOptions {
  signal?: AbortSignal;
}

export interface ProposalEngineOptions<PrivateAsset = unknown> {
  assetSandbox?: AssetSandbox<PrivateAsset>;
  previewBridge?: PreviewBridge<PrivateAsset>;
}

const EMPTY_ASSET_RESOLVER: AssetResolver<never> = { resolve: () => null };

function errorResult(
  code: ProposalEngineErrorCode,
  message: string,
  retryable: boolean,
  currentRevision?: string,
  outcome?: "unknown",
): ProposalEngineErrorResult {
  return {
    ok: false,
    persisted: false,
    error: { code, message, retryable, ...(outcome === undefined ? {} : { outcome }) },
    ...(currentRevision === undefined ? {} : { currentRevision }),
  };
}

function createProposalId(): string {
  return `proposal-${crypto.randomUUID()}`;
}

export class ProposalEngine<Snapshot = unknown, PrivateAsset = unknown> {
  readonly manifest: ConfiguratorManifest;
  readonly adapter: GuardedWorkspaceAdapter<Snapshot, PrivateAsset>;
  readonly assetSandbox: AssetSandbox<PrivateAsset> | null;
  readonly previewBridge: PreviewBridge<PrivateAsset> | null;
  #active: ActiveProposal<Snapshot> | null = null;
  #status: ProposalEngineStatus = "idle";
  #externalRevision: string | null = null;
  #destroyed = false;
  #unsubscribe: (() => void) | null;
  #listeners = new Set<(snapshot: ProposalEngineSnapshot) => void>();

  constructor(
    manifest: ConfiguratorManifest,
    rawAdapter: WorkspaceAdapter<Snapshot, PrivateAsset>,
    options: ProposalEngineOptions<PrivateAsset> = {},
  ) {
    this.manifest = validateManifest(structuredClone(manifest));
    this.adapter = rawAdapter instanceof GuardedWorkspaceAdapter
      ? rawAdapter
      : new GuardedWorkspaceAdapter(this.manifest, rawAdapter);
    this.assetSandbox = options.assetSandbox ?? null;
    this.previewBridge = options.previewBridge ?? null;
    if (this.assetSandbox && this.assetSandbox.manifest.id !== this.manifest.id) throw new TypeError("Asset sandbox manifest does not match the proposal engine");
    if (this.previewBridge && this.previewBridge.manifest.id !== this.manifest.id) throw new TypeError("Preview bridge manifest does not match the proposal engine");
    this.#unsubscribe = this.adapter.subscribeToExternalChanges((revision) => {
      this.#externalRevision = revision;
      if (this.#active && revision !== this.#active.baseRevision && !["committing", "commit-retry", "commit-uncertain"].includes(this.#status)) {
        this.#setStatus("stale");
      }
    });
  }

  get status(): ProposalEngineStatus { return this.#status; }
  get proposedWorkspace(): WorkspaceState | null { return this.#active ? structuredClone(this.#active.state) : null; }
  get snapshot(): ProposalEngineSnapshot {
    return {
      status: this.#status,
      proposalId: this.#active?.id ?? null,
      proposalRevision: this.#active?.revision ?? 0,
      baseRevision: this.#active?.baseRevision ?? null,
      committedRevision: this.#externalRevision ?? this.#active?.baseRevision ?? null,
      previewStatus: this.#active?.previewStatus ?? "none",
    };
  }

  subscribe(listener: (snapshot: ProposalEngineSnapshot) => void): () => void {
    this.#listeners.add(listener);
    listener(this.snapshot);
    return () => this.#listeners.delete(listener);
  }

  async stageAsset(rawInput: unknown, execution: ProposalEngineExecutionOptions = {}): Promise<AssetStageSuccessResult | ProposalEngineErrorResult> {
    if (!this.assetSandbox) return errorResult("CAPABILITY_UNAVAILABLE", "Temporary asset staging is unavailable for this configurator", false);
    let input;
    try { input = validateStageAssetInput(rawInput); } catch (error) { return this.#assetError(error); }
    if (this.#destroyed) return errorResult("CANCELLED", "The proposal session has ended", false);
    if (!["idle", "reviewable", "preview-unavailable"].includes(this.#status)) {
      if (this.#status === "stale") return this.#discardStale(this.#externalRevision ?? this.#active?.baseRevision ?? input.baseRevision);
      return errorResult("OPERATION_IN_PROGRESS", "Another proposal operation is still in progress", true);
    }
    const previousStatus = this.#status;
    if (this.#active) {
      if (input.proposalId !== this.#active.id || input.proposalRevision !== this.#active.revision) {
        return errorResult("STALE_PROPOSAL_REVISION", "The proposal identity or revision is no longer current", true, this.#active.baseRevision);
      }
      if (input.baseRevision !== this.#active.baseRevision) return errorResult("STALE_REVISION", "The proposal base revision is stale", true, this.#active.baseRevision);
    } else if (input.proposalId !== undefined || input.proposalRevision !== undefined) {
      return errorResult("NO_PROPOSAL", "There is no open proposal for this staged asset", true);
    }
    let stagedHandle: string | null = null;
    this.#setStatus("staging-asset");
    try {
      if (!this.#active) {
        const committed = await this.adapter.readWorkspace();
        this.#checkBoundary(execution.signal, committed.committedRevision);
        if (committed.committedRevision !== input.baseRevision) {
          this.#setStatus("idle");
          return errorResult("STALE_REVISION", "The committed workspace changed before asset staging", true, committed.committedRevision);
        }
      }
      const receipt = await this.assetSandbox.stage(input);
      stagedHandle = receipt.assetHandle;
      this.#checkBoundary(execution.signal, input.baseRevision);
      this.#setStatus(previousStatus);
      return { ok: true, persisted: false, asset: receipt };
    } catch (error) {
      if (stagedHandle) await this.assetSandbox.releaseHandle(stagedHandle).catch(() => undefined);
      if (error instanceof ProposalStaleError) return this.#discardStale(error.revision);
      if (this.#externalRevision && this.#externalRevision !== input.baseRevision) return this.#discardStale(this.#externalRevision);
      if (error instanceof ProposalCancelledError) {
        this.#setStatus(previousStatus);
        return errorResult("CANCELLED", "Temporary asset staging was cancelled without changing the proposal", true);
      }
      this.#setStatus(previousStatus);
      return this.#assetError(error);
    }
  }

  async capturePreviews(rawInput: unknown, execution: ProposalEngineExecutionOptions = {}): Promise<PreviewCaptureSuccessResult | ProposalEngineErrorResult> {
    if (!this.previewBridge) return errorResult("CAPABILITY_UNAVAILABLE", "Preview capture is unavailable for this configurator", false);
    let input;
    try { input = validatePreviewCaptureRequest(rawInput); } catch (error) { return this.#previewError(error); }
    if (!this.#active) return errorResult("NO_PROPOSAL", "There is no proposal to capture", false);
    if (input.proposalId !== this.#active.id || input.proposalRevision !== this.#active.revision) {
      return errorResult("STALE_PROPOSAL_REVISION", "The requested proposal preview revision is no longer current", true, this.#active.baseRevision);
    }
    if (input.baseRevision !== this.#active.baseRevision) return errorResult("STALE_REVISION", "The preview base revision is stale", true, this.#active.baseRevision);
    if (this.#status === "stale") return this.#discardStale(this.#externalRevision ?? this.#active.baseRevision);
    if (!["reviewable", "preview-unavailable"].includes(this.#status)) return errorResult("OPERATION_IN_PROGRESS", "The proposal is not ready for preview capture", true);
    const active = this.#active;
    const previousStatus = this.#status;
    this.#setStatus("capturing-preview");
    try {
      const artifacts = await this.previewBridge.capture(input, active.state, this.#assetResolver(active, false));
      this.#checkBoundary(execution.signal, active.baseRevision);
      if (!this.#active || this.#active.id !== active.id || this.#active.revision !== active.revision) throw new ProposalStaleError(active.baseRevision);
      active.previewArtifacts = artifacts;
      active.previewStatus = "available";
      this.#setStatus("reviewable");
      return {
        ok: true,
        persisted: false,
        previewStatus: "available",
        proposalId: active.id,
        proposalRevision: active.revision,
        artifacts: structuredClone(artifacts),
      };
    } catch (error) {
      this.previewBridge.releaseProposal(active.id);
      active.previewArtifacts = [];
      if (error instanceof ProposalStaleError) return this.#discardStale(error.revision);
      if (this.#externalRevision && this.#externalRevision !== active.baseRevision) return this.#discardStale(this.#externalRevision);
      if (error instanceof ProposalCancelledError) {
        active.previewStatus = previousStatus === "preview-unavailable" ? "unavailable" : "ready-for-capture";
        this.#setStatus(previousStatus);
        return errorResult("CANCELLED", "Preview capture was cancelled without saving", true);
      }
      active.previewStatus = "unavailable";
      this.#setStatus("preview-unavailable");
      return this.#previewError(error);
    }
  }

  async apply(rawInput: unknown, execution: ProposalEngineExecutionOptions = {}): Promise<ProposalEngineSuccessResult | ProposalEngineErrorResult> {
    let input: ApplyOperationsInput;
    try {
      input = validateApplyOperationsInput(rawInput);
    } catch (error) {
      return this.#operationError(error);
    }
    if (this.#destroyed) return errorResult("CANCELLED", "The proposal session has ended", false);
    if (!["idle", "reviewable"].includes(this.#status)) {
      if (this.#status === "stale") return this.#discardStale(this.#externalRevision ?? this.#active?.baseRevision ?? input.baseRevision);
      if (["commit-retry", "commit-uncertain", "committing"].includes(this.#status)) {
        return errorResult("COMMIT_ALREADY_STARTED", "The proposal has already crossed the Keep boundary", false);
      }
      return errorResult("OPERATION_IN_PROGRESS", "Another proposal operation is still in progress", true);
    }
    if (this.#active) {
      if (input.proposalId !== this.#active.id || input.proposalRevision !== this.#active.revision) {
        return errorResult("STALE_PROPOSAL_REVISION", "The proposal identity or revision is no longer current", true, this.#active.baseRevision);
      }
      if (input.baseRevision !== this.#active.baseRevision) return errorResult("STALE_REVISION", "The proposal base revision is stale", true, this.#active.baseRevision);
    } else if (input.proposalId !== undefined || input.proposalRevision !== undefined) {
      return errorResult("NO_PROPOSAL", "There is no open proposal to refine", true);
    }

    const refining = this.#active !== null;
    let opened = false;
    this.#setStatus("building");
    try {
      if (!this.#active) {
        this.#externalRevision = null;
        await this.adapter.quiescePersistence();
        this.#checkBoundary(execution.signal, input.baseRevision);
        const committed = await this.adapter.readWorkspace();
        this.#checkBoundary(execution.signal, committed.committedRevision);
        if (committed.committedRevision !== input.baseRevision) {
          this.#setStatus("idle");
          return errorResult("STALE_REVISION", "The committed workspace changed. Read it again before proposing.", true, committed.committedRevision);
        }
        const snapshot = await this.adapter.captureSnapshot();
        this.#checkBoundary(execution.signal, committed.committedRevision);
        const proposalId = createProposalId();
        this.#active = {
          id: proposalId,
          revision: 0,
          baseRevision: committed.committedRevision,
          snapshot,
          state: committed,
          validation: null,
          reducer: new AtomicOperationReducer(this.manifest),
          operationIds: [],
          results: new Map(),
          previewStatus: "ready-for-capture",
          previewArtifacts: [],
        };
        opened = true;
        // Record the private snapshot before entering proposal mode so even a
        // partially failing merchant hook can be restored and closed.
        await this.adapter.beginProposalMode({ proposalId, baseRevision: committed.committedRevision });
        this.#checkBoundary(execution.signal, committed.committedRevision);
      }

      // The reducer owns the operation-id ledger. Apply on a fork and promote
      // it only after validation and preview succeed; failed refinements must
      // leave both visible state and idempotency state untouched.
      const candidateReducer = this.#active.reducer.fork();
      const reduced = candidateReducer.apply(this.#active.state, input);
      if (reduced.deduplicated) {
        const prior = this.#active.results.get(input.operationId);
        if (!prior) throw new Error("Missing idempotent proposal result");
        this.#setStatus("reviewable");
        return { ...structuredClone(prior.result), deduplicated: true };
      }

      const attachedHandles = input.operations
        .filter((operation) => operation.type === "attach-asset")
        .map((operation) => operation.assetHandle);
      const assetContext = this.#active.revision === 0
        ? { baseRevision: this.#active.baseRevision }
        : { baseRevision: this.#active.baseRevision, proposalId: this.#active.id, proposalRevision: this.#active.revision };
      if (attachedHandles.length > 0) {
        if (!this.assetSandbox) throw new AssetSandboxError("ASSET_SOURCE_REJECTED", "Temporary assets are unavailable");
        this.assetSandbox.assertHandles(attachedHandles, assetContext, true);
      }
      const assets = this.assetSandbox?.createResolver(assetContext, true) ?? EMPTY_ASSET_RESOLVER;

      this.#setStatus("validating");
      const validation = await this.adapter.validateWorkspace(reduced.state, assets as AssetResolver<PrivateAsset>);
      this.#checkBoundary(execution.signal, this.#active.baseRevision);
      if (!validation.configurationValid) {
        if (opened) {
          const restored = await this.#closeProposal("invalid", true);
          return restored
            ? errorResult("INVALID_VALUE", "The operation batch violates a public configuration constraint", false, input.baseRevision)
            : errorResult("ADAPTER_FAILURE", "The invalid proposal could not be restored safely", true, input.baseRevision);
        }
        this.#setStatus("reviewable");
        return errorResult("INVALID_VALUE", "The operation batch violates a public configuration constraint", false, this.#active.baseRevision);
      }

      this.#setStatus("rendering");
      await this.adapter.previewWorkspace(reduced.state, assets as AssetResolver<PrivateAsset>);
      this.#checkBoundary(execution.signal, this.#active.baseRevision);
      const assumptions = [...new Set([...validation.assumptions, ...(input.assumptions ?? [])])];
      if (assumptions.length > MAX_ASSUMPTIONS) throw new Error("Public assumption limit exceeded");
      const mergedValidation = { ...validation, assumptions };
      this.#active.state = reduced.state;
      this.#active.validation = mergedValidation;
      this.#active.reducer = candidateReducer;
      const previousRevision = this.#active.revision;
      this.#active.revision = previousRevision + 1;
      if (this.assetSandbox) {
        if (previousRevision > 0) this.assetSandbox.advanceProposalRevision(this.#active.id, previousRevision, this.#active.revision);
        if (attachedHandles.length > 0) this.assetSandbox.bindHandles(attachedHandles, {
          baseRevision: this.#active.baseRevision,
          proposalId: this.#active.id,
          proposalRevision: this.#active.revision,
        });
      }
      this.previewBridge?.releaseProposal(this.#active.id);
      this.#active.previewStatus = "ready-for-capture";
      this.#active.previewArtifacts = [];
      this.#active.operationIds.push(input.operationId);
      const result: ProposalEngineSuccessResult = {
        ok: true,
        proposalId: this.#active.id,
        proposalRevision: this.#active.revision,
        baseRevision: this.#active.baseRevision,
        persisted: false,
        appliedOperations: reduced.appliedOperations,
        deduplicated: false,
        workspace: structuredClone(this.#active.state),
        validation: structuredClone(mergedValidation),
        previewStatus: "ready-for-capture",
        confirmation: {
          required: true,
          choices: ["keep", "revert"],
          message: "A person must inspect the visible proposal and choose Keep or Revert in the page. Nothing has been saved.",
        },
      };
      this.#active.results.set(input.operationId, { result: structuredClone(result) });
      this.#setStatus("reviewable");
      return result;
    } catch (error) {
      if (error instanceof ProposalStaleError) return this.#discardStale(error.revision);
      if (error instanceof ProposalCancelledError) {
        const restored = refining ? await this.#restoreReviewablePreview() : await this.#closeProposal("cancelled", true);
        return restored
          ? errorResult("CANCELLED", "The operation was cancelled and the last inspected workspace was restored", true)
          : errorResult("ADAPTER_FAILURE", "The cancelled proposal could not be restored safely", true);
      }
      if (error instanceof AssetSandboxError) {
        const restored = opened ? await this.#closeProposal("invalid", true) : true;
        if (!opened) this.#setStatus("reviewable");
        return restored ? this.#assetError(error) : errorResult("ADAPTER_FAILURE", "The asset proposal could not be restored safely", true);
      }
      if (error instanceof OperationValidationError) {
        const restored = opened ? await this.#closeProposal("invalid", true) : true;
        if (!opened) this.#setStatus("reviewable");
        return restored ? this.#operationError(error) : errorResult("ADAPTER_FAILURE", "The invalid proposal could not be restored safely", true);
      }
      const restored = refining ? await this.#restoreReviewablePreview() : await this.#closeProposal("invalid", true);
      return restored
        ? errorResult("ADAPTER_FAILURE", "The proposal could not be applied safely", true)
        : errorResult("ADAPTER_FAILURE", "The proposal failed and its visible state could not be restored safely", true);
    }
  }

  async revert(): Promise<{ reverted: true; persisted: false } | ProposalEngineErrorResult> {
    if (!this.#active) return errorResult("NO_PROPOSAL", "There is no proposal to revert", false);
    if (this.#status === "stale") return this.#discardStale(this.#externalRevision ?? this.#active.baseRevision);
    if (["committing", "commit-retry", "commit-uncertain"].includes(this.#status)) {
      return errorResult("COMMIT_ALREADY_STARTED", "The proposal has already crossed the Keep boundary", false);
    }
    if (this.#status !== "reviewable" && this.#status !== "preview-unavailable") return errorResult("OPERATION_IN_PROGRESS", "The proposal is not ready to revert", true);
    this.#setStatus("reverting");
    const restored = await this.#closeProposal("reverted", true);
    return restored ? { reverted: true, persisted: false } : errorResult("ADAPTER_FAILURE", "The original workspace could not be restored", true);
  }

  async keep(): Promise<CommitResult | ProposalEngineErrorResult> {
    if (!this.#active) return errorResult("NO_PROPOSAL", "There is no proposal to keep", false);
    if (this.#status === "stale") return this.#discardStale(this.#externalRevision ?? this.#active.baseRevision);
    if (this.#status === "commit-uncertain") return errorResult("COMMIT_STATUS_UNKNOWN", "Commit status is unknown. Reload before continuing.", false, this.#active.baseRevision, "unknown");
    if (this.previewBridge && this.#active.previewStatus !== "available") {
      return errorResult("PREVIEW_REQUIRED", "Keep is unavailable until current visual previews have been captured successfully", true, this.#active.baseRevision);
    }
    if (this.#status !== "reviewable" && this.#status !== "commit-retry") return errorResult("OPERATION_IN_PROGRESS", "The proposal is not ready to keep", true);
    const retrying = this.#status === "commit-retry";
    const active = this.#active;
    if (this.previewBridge) {
      try {
        active.previewArtifacts = this.previewBridge.assertCurrent({
          proposalId: active.id,
          proposalRevision: active.revision,
          baseRevision: active.baseRevision,
        }, active.state);
      } catch (error) {
        active.previewStatus = "unavailable";
        this.#setStatus("preview-unavailable");
        return this.#previewError(error);
      }
    }
    this.#setStatus("committing");
    if (!retrying) {
      let committed: WorkspaceState;
      try {
        committed = await this.adapter.readWorkspace();
      } catch {
        if (this.#destroyed) return errorResult("CANCELLED", "The proposal session ended before Keep could begin", false);
        this.#setStatus("reviewable");
        return errorResult("ADAPTER_FAILURE", "The committed workspace could not be checked before Keep", true, active.baseRevision);
      }
      if (this.#destroyed) return errorResult("CANCELLED", "The proposal session ended before Keep could begin", false);
      if (committed.committedRevision !== active.baseRevision || (this.#externalRevision && this.#externalRevision !== active.baseRevision)) {
        return this.#discardStale(this.#externalRevision ?? committed.committedRevision);
      }
    }
    try {
      const result = await this.adapter.commitWorkspace(active.state, {
        proposalId: active.id,
        baseRevision: active.baseRevision,
        operationIds: [...active.operationIds],
        finalProposalRevision: active.revision,
        previewReceipts: active.previewArtifacts.map(({ artifactId, variantId, surfaceId, integrity }) => ({ artifactId, variantId, surfaceId, integrity })),
        trigger: "confirmed_page_keep",
      }, this.#assetResolver(active, false));
      if (!result.localPersisted) return this.#discardStale(result.revision);
      if (!result.serverPersisted) {
        this.#setStatus("commit-retry");
        return result;
      }
      try { await this.adapter.endProposalMode("kept"); } catch { /* commit outcome is already known */ }
      await this.#releaseResources(active.id).catch(() => undefined);
      this.#clear();
      return result;
    } catch {
      this.#setStatus("commit-uncertain");
      return errorResult("COMMIT_STATUS_UNKNOWN", "Commit status could not be verified. Reload before continuing.", false, active.baseRevision, "unknown");
    }
  }

  async resynchronize(): Promise<{ resynchronized: true; persisted: false; revision: string } | ProposalEngineErrorResult> {
    if (!this.#active || this.#status !== "stale") return errorResult("NO_PROPOSAL", "There is no stale proposal to resynchronize", false);
    const result = await this.#resynchronizeStale();
    return result ?? errorResult("ADAPTER_FAILURE", "The latest committed workspace could not be restored", true, this.#externalRevision ?? undefined);
  }

  async destroy(): Promise<void> {
    this.#destroyed = true;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    const active = this.#active;
    if (active && !["commit-retry", "commit-uncertain", "committing"].includes(this.#status)) {
      try { await this.adapter.restoreSnapshot(active.snapshot); } catch { /* teardown cannot save */ }
    }
    if (active) try { await this.adapter.endProposalMode("teardown"); } catch { /* page teardown continues */ }
    await this.assetSandbox?.releaseAll().catch(() => undefined);
    this.previewBridge?.releaseAll();
    this.#clear();
  }

  #checkBoundary(signal: AbortSignal | undefined, expectedRevision: string): void {
    if (this.#destroyed || signal?.aborted) throw new ProposalCancelledError();
    if (this.#externalRevision && this.#externalRevision !== expectedRevision) throw new ProposalStaleError(this.#externalRevision);
    if (this.#externalRevision === expectedRevision) this.#externalRevision = null;
  }

  #operationError(error: unknown): ProposalEngineErrorResult {
    if (!(error instanceof OperationValidationError)) return errorResult("INVALID_INPUT", "The operation batch did not match the public schema", false);
    return errorResult(error.code, OPERATION_MESSAGES[error.code], error.code === "STALE_REVISION");
  }

  #assetError(error: unknown): ProposalEngineErrorResult {
    if (!(error instanceof AssetSandboxError)) return errorResult("ASSET_STAGE_FAILED", "The temporary asset could not be staged safely", true);
    const messages = {
      INVALID_INPUT: "The asset request did not match the public schema",
      UNKNOWN_ASSET_SLOT: "The requested asset slot is unavailable",
      ASSET_SOURCE_REJECTED: "The supplied asset source is unavailable under this slot policy",
      ASSET_FETCH_FAILED: "The remote asset could not be fetched safely",
      ASSET_DECODE_FAILED: "The supplied asset could not be decoded safely",
      ASSET_TOO_LARGE: "The supplied asset exceeds a declared temporary limit",
      ASSET_STAGE_FAILED: "The merchant adapter could not stage the supplied asset safely",
      ASSET_EXPIRED: "The temporary asset expired before it could be used",
      UNKNOWN_ASSET: "The referenced temporary asset is unavailable",
      ASSET_BINDING_MISMATCH: "The temporary asset belongs to another workspace or proposal revision",
    } as const;
    return errorResult(error.code, messages[error.code], ["ASSET_FETCH_FAILED", "ASSET_STAGE_FAILED", "ASSET_EXPIRED"].includes(error.code));
  }

  #previewError(error: unknown): ProposalEngineErrorResult {
    if (!(error instanceof PreviewBridgeError)) return errorResult("PREVIEW_FAILED", "Current visual previews could not be captured safely", true);
    const messages = {
      INVALID_INPUT: "The preview request did not match the public schema",
      UNKNOWN_TARGET: "The preview request references an unknown visible target",
      CAPABILITY_UNAVAILABLE: "The requested preview capability is unavailable",
      PREVIEW_FAILED: "Current visual previews could not be captured safely",
      PREVIEW_STALE: "The requested preview no longer matches the current proposal revision",
    } as const;
    return errorResult(error.code, messages[error.code], error.retryable, this.#active?.baseRevision);
  }

  #assetResolver(active: ActiveProposal<Snapshot>, allowUnbound: boolean): AssetResolver<PrivateAsset> {
    if (!this.assetSandbox) return EMPTY_ASSET_RESOLVER as AssetResolver<PrivateAsset>;
    if (active.revision < 1) return this.assetSandbox.createResolver({ baseRevision: active.baseRevision }, allowUnbound);
    return this.assetSandbox.createResolver({
      baseRevision: active.baseRevision,
      proposalId: active.id,
      proposalRevision: active.revision,
    }, allowUnbound);
  }

  async #restoreReviewablePreview(): Promise<boolean> {
    if (!this.#active) {
      this.#setStatus("idle");
      return true;
    }
    try {
      await this.adapter.previewWorkspace(this.#active.state, this.#assetResolver(this.#active, false));
      this.#setStatus("reviewable");
      return true;
    } catch {
      this.#setStatus("stale");
      return false;
    }
  }

  async #closeProposal(reason: ProposalEndReason, restore: boolean): Promise<boolean> {
    const active = this.#active;
    if (!active) {
      this.#clear();
      return true;
    }
    let ok = true;
    if (restore) {
      try { await this.adapter.restoreSnapshot(active.snapshot); } catch { ok = false; }
    }
    try { await this.adapter.endProposalMode(reason); } catch { ok = false; }
    if (ok) {
      try { await this.#releaseResources(active.id); } catch { ok = false; }
    }
    if (ok) this.#clear();
    else this.#setStatus("stale");
    return ok;
  }

  async #discardStale(revision: string): Promise<ProposalEngineErrorResult> {
    if (!this.#active) {
      this.#externalRevision = null;
      this.#setStatus("idle");
      return errorResult("STALE_REVISION", "The committed workspace changed before proposal mode opened", true, revision);
    }
    const resynchronized = await this.#resynchronizeStale();
    return resynchronized
      ? errorResult("STALE_REVISION", "The committed workspace changed while the proposal was open", true, resynchronized.revision)
      : errorResult("ADAPTER_FAILURE", "The latest committed workspace could not be restored", true, revision);
  }

  async #resynchronizeStale(): Promise<{ resynchronized: true; persisted: false; revision: string } | null> {
    if (!this.#active) return null;
    this.#setStatus("stale");
    try {
      const committed = await this.adapter.readWorkspace();
      await this.adapter.previewWorkspace(committed);
      await this.adapter.endProposalMode("stale");
      const revision = committed.committedRevision;
      await this.#releaseResources(this.#active.id);
      this.#clear();
      return { resynchronized: true, persisted: false, revision };
    } catch {
      this.#setStatus("stale");
      return null;
    }
  }

  #clear(): void {
    this.#active = null;
    this.#externalRevision = null;
    this.#setStatus("idle");
  }

  async #releaseResources(proposalId: string): Promise<void> {
    this.previewBridge?.releaseProposal(proposalId);
    await this.assetSandbox?.releaseProposal(proposalId);
  }

  #setStatus(status: ProposalEngineStatus): void {
    this.#status = status;
    const snapshot = this.snapshot;
    for (const listener of this.#listeners) {
      try { listener(snapshot); } catch { /* listeners cannot break transaction safety */ }
    }
  }
}
