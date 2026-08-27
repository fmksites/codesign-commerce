import { describe, expect, test } from "vitest";
import {
  AssetSandbox,
  PreviewBridge,
  ProposalEngine,
  type AdapterAssetStageRequest,
  type AssetResolver,
  type CommitMetadata,
  type CommitResult,
  type PreviewArtifactCandidate,
  type PreviewCaptureRequest,
  type ProposalContext,
  type ProposalEndReason,
  type WorkspaceAdapter,
  type WorkspaceState,
  type WorkspaceValidationResult,
} from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const webpBytes = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const webpDataUrl = `data:image/webp;base64,${btoa(String.fromCharCode(...webpBytes))}`;

interface PrivateAsset { bytes: Uint8Array; integrity: string; released: boolean }
interface Snapshot { committed: WorkspaceState; visible: WorkspaceState }

class ResourceAdapter implements WorkspaceAdapter<Snapshot, PrivateAsset> {
  committed = structuredClone(workspaceTestState);
  visible = structuredClone(workspaceTestState);
  listeners = new Set<(revision: string) => void>();
  commits = new Map<string, string>();
  staged: PrivateAsset[] = [];
  importedIntegrity: string | null = null;
  captureFailure = false;
  externalDuringCapture = false;
  metadata: CommitMetadata | null = null;
  counters = { stage: 0, release: 0, validate: 0, preview: 0, capture: 0, restore: 0, commit: 0, localWrites: 0 };

  async readWorkspace() { return structuredClone(this.committed); }
  async listAvailability() { return { committedRevision: this.committed.committedRevision, controls: [] }; }
  async quiescePersistence() {}
  async captureSnapshot() { return { committed: structuredClone(this.committed), visible: structuredClone(this.visible) }; }
  async beginProposalMode(_context: ProposalContext) {}
  async endProposalMode(_reason: ProposalEndReason) {}

  async stageAsset(request: AdapterAssetStageRequest) {
    this.counters.stage += 1;
    const privateAsset = { bytes: request.bytes.slice(), integrity: request.sourceIntegrity, released: false };
    this.staged.push(privateAsset);
    return { privateAsset, mediaType: request.declaredMediaType, byteLength: request.bytes.byteLength, width: 1, height: 1, integrity: request.sourceIntegrity };
  }

  async releaseAsset(privateAsset: PrivateAsset) {
    privateAsset.released = true;
    this.counters.release += 1;
  }

  #artwork(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>) {
    const handle = workspace.variants[0]!.elements[0]!.controls["mark.artwork"];
    return typeof handle === "string" ? assets?.resolve(handle) ?? null : null;
  }

  async validateWorkspace(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>): Promise<WorkspaceValidationResult> {
    this.counters.validate += 1;
    const artworkValid = this.#artwork(workspace, assets) !== null;
    return {
      configurationValid: artworkValid,
      productionReady: artworkValid,
      issues: artworkValid ? [] : [{ code: "ARTWORK_UNAVAILABLE", severity: "constraint-error", message: "Artwork is unavailable", controlIds: ["mark.artwork"] }],
      assumptions: [],
    };
  }

  async previewWorkspace(workspace: WorkspaceState, assets?: AssetResolver<PrivateAsset>) {
    this.counters.preview += 1;
    const handle = workspace.variants[0]!.elements[0]!.controls["mark.artwork"];
    if (typeof handle === "string" && !assets?.resolve(handle) && !handle.startsWith("saved-")) throw new Error("private asset unavailable");
    this.visible = structuredClone(workspace);
  }

  async capturePreviews(_request: PreviewCaptureRequest, assets: AssetResolver<PrivateAsset>): Promise<PreviewArtifactCandidate[]> {
    this.counters.capture += 1;
    if (this.externalDuringCapture) this.externalChange();
    if (this.captureFailure) throw new Error("private capture failure");
    const resolved = this.#artwork(this.visible, assets);
    if (!resolved) throw new Error("private preview asset unavailable");
    return [{
      variantId: "variant-1",
      surfaceId: "product-preview",
      mediaType: "image/webp",
      width: 640,
      height: 640,
      altText: "Cream direction with the supplied North Form artwork",
      transport: { kind: "data-url", value: webpDataUrl },
    }];
  }

  async restoreSnapshot(snapshot: Snapshot) {
    this.counters.restore += 1;
    this.visible = structuredClone(snapshot.visible);
  }

  async commitWorkspace(workspace: WorkspaceState, metadata: CommitMetadata, assets?: AssetResolver<PrivateAsset>): Promise<CommitResult> {
    this.counters.commit += 1;
    this.metadata = structuredClone(metadata);
    const prior = this.commits.get(metadata.proposalId);
    if (prior) return { revision: prior, localPersisted: true, serverPersisted: true };
    if (this.committed.committedRevision !== metadata.baseRevision) return { revision: this.committed.committedRevision, localPersisted: false, serverPersisted: false, errorCode: "STALE_REVISION" };
    const next = structuredClone(workspace);
    const temporaryHandle = next.variants[0]!.elements[0]!.controls["mark.artwork"];
    if (typeof temporaryHandle !== "string") throw new Error("missing asset handle");
    const resolved = assets?.resolve(temporaryHandle);
    if (!resolved) throw new Error("private asset unavailable at Keep");
    this.importedIntegrity = resolved.receipt.integrity;
    next.variants[0]!.elements[0]!.controls["mark.artwork"] = `saved-${resolved.receipt.integrity.slice(7, 31)}`;
    const revision = "workspace-revision-2";
    this.commits.set(metadata.proposalId, revision);
    this.committed = { ...next, committedRevision: revision };
    this.visible = structuredClone(this.committed);
    this.counters.localWrites += 1;
    for (const listener of this.listeners) listener(revision);
    return { revision, localPersisted: true, serverPersisted: true };
  }

  subscribeToExternalChanges(listener: (revision: string) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  externalChange() {
    this.committed = { ...structuredClone(this.committed), committedRevision: "external-revision" };
    this.visible = structuredClone(this.committed);
    for (const listener of this.listeners) listener(this.committed.committedRevision);
  }
}

function setup() {
  const adapter = new ResourceAdapter();
  const assets = new AssetSandbox(workspaceTestManifest, adapter);
  const previews = new PreviewBridge(workspaceTestManifest, adapter);
  const engine = new ProposalEngine(workspaceTestManifest, adapter, { assetSandbox: assets, previewBridge: previews });
  return { adapter, assets, previews, engine };
}

async function stageAndPropose(engine: ProposalEngine<Snapshot, PrivateAsset>) {
  const staged = await engine.stageAsset({
    baseRevision: "workspace-revision-1",
    slotId: "mark-artwork",
    source: { kind: "data-url", data: tinyPng },
    filename: "north-form.png",
    altText: "North Form NF mark",
  });
  if (!staged.ok) throw new Error("expected staged asset");
  const proposal = await engine.apply({
    baseRevision: "workspace-revision-1",
    operationId: "attach-north-form",
    operations: [{ type: "attach-asset", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.artwork", assetHandle: staged.asset.assetHandle }],
  });
  if (!proposal.ok) throw new Error("expected proposal");
  return { staged, proposal };
}

describe("proposal asset and preview integration", () => {
  test("stages, renders, captures, and imports the exact asset only at Keep", async () => {
    const { adapter, assets, engine } = setup();
    const { staged, proposal } = await stageAndPropose(engine);
    expect(adapter.counters).toMatchObject({ stage: 1, validate: 1, preview: 1, capture: 0, commit: 0, localWrites: 0 });
    expect(engine.snapshot).toMatchObject({ proposalId: proposal.proposalId, proposalRevision: 1, previewStatus: "ready-for-capture" });
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "PREVIEW_REQUIRED" } });
    const captured = await engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision });
    expect(captured).toMatchObject({ ok: true, persisted: false, previewStatus: "available" });
    if (!captured.ok) throw new Error("expected previews");
    expect(captured.artifacts).toHaveLength(1);
    expect(adapter.counters.localWrites).toBe(0);
    await expect(engine.keep()).resolves.toEqual({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: true });
    expect(adapter.importedIntegrity).toBe(staged.asset.integrity);
    expect(adapter.committed.variants[0]!.elements[0]!.controls["mark.artwork"]).toMatch(/^saved-/);
    expect(adapter.counters).toMatchObject({ commit: 1, localWrites: 1, release: 1 });
    expect(adapter.metadata).toMatchObject({
      finalProposalRevision: 1,
      previewReceipts: [{ artifactId: captured.artifacts[0]!.artifactId, variantId: "variant-1", surfaceId: "product-preview", integrity: captured.artifacts[0]!.integrity }],
      trigger: "confirmed_page_keep",
    });
    expect(assets.size).toBe(0);
    expect(adapter.staged[0]!.released).toBe(true);
  });

  test("Revert releases temporary artwork with zero writes", async () => {
    const { adapter, assets, engine } = setup();
    await stageAndPropose(engine);
    await expect(engine.revert()).resolves.toEqual({ reverted: true, persisted: false });
    expect(adapter.counters).toMatchObject({ restore: 1, commit: 0, localWrites: 0, release: 1 });
    expect(adapter.visible).toEqual(workspaceTestState);
    expect(assets.size).toBe(0);
  });

  test("page teardown releases an unbound staged asset without opening or saving a proposal", async () => {
    const { adapter, assets, engine } = setup();
    await expect(engine.stageAsset({
      baseRevision: "workspace-revision-1",
      slotId: "mark-artwork",
      source: { kind: "data-url", data: tinyPng },
      filename: "north-form.png",
      altText: "North Form NF mark",
    })).resolves.toMatchObject({ ok: true, persisted: false });
    expect(assets.size).toBe(1);

    await engine.destroy();
    expect(adapter.counters).toMatchObject({ stage: 1, release: 1, commit: 0, localWrites: 0 });
    expect(assets.size).toBe(0);
  });

  test("capture failure blocks Keep and retry captures the same proposal without saving", async () => {
    const { adapter, engine } = setup();
    const { proposal } = await stageAndPropose(engine);
    adapter.captureFailure = true;
    await expect(engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision })).resolves.toMatchObject({ ok: false, error: { code: "PREVIEW_FAILED" } });
    expect(engine.snapshot).toMatchObject({ proposalId: proposal.proposalId, proposalRevision: 1, previewStatus: "unavailable" });
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "PREVIEW_REQUIRED" } });
    expect(adapter.counters).toMatchObject({ commit: 0, localWrites: 0 });
    adapter.captureFailure = false;
    await expect(engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision })).resolves.toMatchObject({ ok: true, proposalId: proposal.proposalId, proposalRevision: 1 });
    expect(adapter.counters.capture).toBe(2);
    expect(adapter.counters.localWrites).toBe(0);
  });

  test("a refinement invalidates old artifacts and advances bound asset revisions", async () => {
    const { adapter, engine } = setup();
    const { proposal } = await stageAndPropose(engine);
    await engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision });
    const refined = await engine.apply({
      baseRevision: proposal.baseRevision,
      proposalId: proposal.proposalId,
      proposalRevision: 1,
      operationId: "move-artwork",
      operations: [{ type: "set-control", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.position", value: { x: 0.35, y: 0.4 } }],
    });
    expect(refined).toMatchObject({ ok: true, proposalRevision: 2, previewStatus: "ready-for-capture" });
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "PREVIEW_REQUIRED" } });
    await expect(engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision })).resolves.toMatchObject({ ok: false, error: { code: "STALE_PROPOSAL_REVISION" } });
    await expect(engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 2, baseRevision: proposal.baseRevision })).resolves.toMatchObject({ ok: true, proposalRevision: 2 });
    expect(adapter.counters.localWrites).toBe(0);
  });

  test("an external change during capture discards resources and blocks Keep", async () => {
    const { adapter, assets, engine } = setup();
    const { proposal } = await stageAndPropose(engine);
    adapter.externalDuringCapture = true;
    await expect(engine.capturePreviews({ proposalId: proposal.proposalId, proposalRevision: 1, baseRevision: proposal.baseRevision })).resolves.toMatchObject({ ok: false, error: { code: "STALE_REVISION" } });
    expect(engine.status).toBe("idle");
    expect(adapter.counters).toMatchObject({ commit: 0, localWrites: 0, release: 1 });
    expect(assets.size).toBe(0);
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "NO_PROPOSAL" } });
  });
});
