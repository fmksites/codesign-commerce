import type {
  AdapterAssetStageRequest,
  AssetResolver,
  AvailabilityRequest,
  AvailabilityResult,
  CommitMetadata,
  CommitResult,
  PreviewArtifactCandidate,
  PreviewCaptureRequest,
  ProposalContext,
  ProposalEndReason,
  WorkspaceAdapter,
  WorkspaceState,
  WorkspaceValidationResult,
} from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

export const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const tinyWebp = `data:image/webp;base64,${btoa(String.fromCharCode(...Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x04, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])))}`;

export interface TestPrivateAsset { bytes: Uint8Array; integrity: string; released: boolean }
export interface TestWorkspaceSnapshot { committed: WorkspaceState; visible: WorkspaceState }

export class V2TestAdapter implements WorkspaceAdapter<TestWorkspaceSnapshot, TestPrivateAsset> {
  committed = structuredClone(workspaceTestState);
  visible = structuredClone(workspaceTestState);
  listeners = new Set<(revision: string) => void>();
  commits = new Map<string, string>();
  staged: TestPrivateAsset[] = [];
  proposalMode = false;
  failRead = false;
  failCapture = false;
  failServerSave = false;
  throwDuringCommit = false;
  importedIntegrity: string | null = null;
  counters = {
    read: 0, availability: 0, quiesce: 0, captureSnapshot: 0, begin: 0, validate: 0,
    preview: 0, restore: 0, commit: 0, localWrites: 0, serverWrites: 0, end: 0,
    stage: 0, release: 0, capturePreview: 0,
  };

  async readWorkspace(): Promise<WorkspaceState> {
    this.counters.read += 1;
    if (this.failRead) throw new Error("PRIVATE_TOKEN at merchant-adapter.ts:999");
    return structuredClone(this.committed);
  }

  async listAvailability(request: AvailabilityRequest): Promise<AvailabilityResult> {
    this.counters.availability += 1;
    const requested = new Set(request.controlIds ?? workspaceTestManifest.controls.map((control) => control.id));
    return {
      committedRevision: this.committed.committedRevision,
      controls: workspaceTestManifest.controls
        .filter((control) => requested.has(control.id))
        .map((control) => ({ controlId: control.id, available: control.agentWritable, ...(control.values ? { values: structuredClone(control.values) } : {}) })),
    };
  }

  async quiescePersistence() { this.counters.quiesce += 1; }
  async captureSnapshot() {
    this.counters.captureSnapshot += 1;
    return { committed: structuredClone(this.committed), visible: structuredClone(this.visible) };
  }
  async beginProposalMode(_context: ProposalContext) { this.counters.begin += 1; this.proposalMode = true; }
  async endProposalMode(_reason: ProposalEndReason) { this.counters.end += 1; this.proposalMode = false; }

  async stageAsset(request: AdapterAssetStageRequest) {
    this.counters.stage += 1;
    const privateAsset = { bytes: request.bytes.slice(), integrity: request.sourceIntegrity, released: false };
    this.staged.push(privateAsset);
    return { privateAsset, mediaType: request.declaredMediaType, byteLength: request.bytes.byteLength, width: 1, height: 1, integrity: request.sourceIntegrity };
  }

  async releaseAsset(asset: TestPrivateAsset) { asset.released = true; this.counters.release += 1; }

  #asset(workspace: WorkspaceState, assets?: AssetResolver<TestPrivateAsset>) {
    const handle = workspace.variants[0]?.elements[0]?.controls["mark.artwork"];
    return typeof handle === "string" ? assets?.resolve(handle) ?? null : null;
  }

  async validateWorkspace(workspace: WorkspaceState, assets?: AssetResolver<TestPrivateAsset>): Promise<WorkspaceValidationResult> {
    this.counters.validate += 1;
    const total = Number(workspace.workspaceControls["order.total_quantity"]);
    const allocated = workspace.variants.reduce((sum, variant) => sum + Number(variant.controls["design.quantity"]), 0);
    const configurationValid = total === allocated;
    const hasArtwork = this.#asset(workspace, assets) !== null || workspace.variants.every((variant) => {
      const handle = variant.elements[0]?.controls["mark.artwork"];
      return typeof handle === "string" && handle.startsWith("saved-");
    });
    return {
      configurationValid,
      productionReady: configurationValid && hasArtwork,
      issues: configurationValid
        ? (hasArtwork ? [] : [{ issueId: "artwork-required.variant-1", code: "ARTWORK_REQUIRED", severity: "decision-required", message: "Final artwork is still required", controlIds: ["mark.artwork"], repairable: false }])
        : [{ issueId: "quantity-total-mismatch.workspace", code: "QUANTITY_TOTAL_MISMATCH", severity: "constraint-error", message: "Variant quantities must equal the workspace total", controlIds: ["order.total_quantity", "design.quantity"], repairable: false }],
      assumptions: [],
    };
  }

  async previewWorkspace(workspace: WorkspaceState, assets?: AssetResolver<TestPrivateAsset>) {
    this.counters.preview += 1;
    const handle = workspace.variants[0]?.elements[0]?.controls["mark.artwork"];
    if (typeof handle === "string" && !handle.startsWith("saved-") && !assets?.resolve(handle)) throw new Error("private asset unavailable");
    this.visible = structuredClone(workspace);
  }

  async capturePreviews(request: PreviewCaptureRequest, assets: AssetResolver<TestPrivateAsset>): Promise<PreviewArtifactCandidate[]> {
    this.counters.capturePreview += 1;
    if (this.failCapture) throw new Error("PRIVATE renderer failure");
    const variantIds = request.variantIds ?? [this.visible.activeVariantId];
    return variantIds.map((variantId) => ({
      variantId,
      surfaceId: request.surfaceIds?.[0] ?? "product-preview",
      mediaType: "image/webp" as const,
      width: 640,
      height: 640,
      altText: `${this.visible.variants.find((variant) => variant.id === variantId)?.name ?? "Variant"} product preview`,
      transport: { kind: "data-url" as const, value: tinyWebp },
    }));
  }

  async restoreSnapshot(snapshot: TestWorkspaceSnapshot) { this.counters.restore += 1; this.visible = structuredClone(snapshot.visible); }

  async commitWorkspace(workspace: WorkspaceState, metadata: CommitMetadata, assets?: AssetResolver<TestPrivateAsset>): Promise<CommitResult> {
    this.counters.commit += 1;
    const prior = this.commits.get(metadata.proposalId);
    if (prior) {
      if (this.failServerSave) return { revision: prior, localPersisted: true, serverPersisted: false, errorCode: "SAVE_RETRY" };
      this.counters.serverWrites += 1;
      return { revision: prior, localPersisted: true, serverPersisted: true };
    }
    if (this.committed.committedRevision !== metadata.baseRevision) return { revision: this.committed.committedRevision, localPersisted: false, serverPersisted: false, errorCode: "STALE_REVISION" };
    if (this.throwDuringCommit) throw new Error("PRIVATE uncertain commit");
    const next = structuredClone(workspace);
    const temporaryHandle = next.variants[0]?.elements[0]?.controls["mark.artwork"];
    if (typeof temporaryHandle === "string" && !temporaryHandle.startsWith("saved-")) {
      const resolved = assets?.resolve(temporaryHandle);
      if (!resolved) throw new Error("private asset unavailable at Keep");
      this.importedIntegrity = resolved.receipt.integrity;
      next.variants[0]!.elements[0]!.controls["mark.artwork"] = `saved-${resolved.receipt.integrity.slice(7, 31)}`;
    }
    const revision = `workspace-revision-${this.commits.size + 2}`;
    this.commits.set(metadata.proposalId, revision);
    this.committed = { ...next, committedRevision: revision };
    this.visible = structuredClone(this.committed);
    this.counters.localWrites += 1;
    for (const listener of this.listeners) listener(revision);
    if (this.failServerSave) return { revision, localPersisted: true, serverPersisted: false, errorCode: "SAVE_RETRY" };
    this.counters.serverWrites += 1;
    return { revision, localPersisted: true, serverPersisted: true };
  }

  subscribeToExternalChanges(listener: (revision: string) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  externalChange(revision = "external-revision") {
    this.committed = { ...structuredClone(this.committed), committedRevision: revision };
    this.visible = structuredClone(this.committed);
    for (const listener of this.listeners) listener(revision);
  }
}
