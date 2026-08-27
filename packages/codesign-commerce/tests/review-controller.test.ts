import { describe, expect, test } from "vitest";
import { PreviewBridge, ProposalEngine, ProposalReviewController, reviewLocksHumanControls } from "../src/index.js";
import { workspaceTestManifest } from "./workspace-fixtures.js";
import { V2TestAdapter } from "./v2-test-adapter.js";

function setup() {
  const adapter = new V2TestAdapter();
  const previewBridge = new PreviewBridge(workspaceTestManifest, adapter);
  const engine = new ProposalEngine(workspaceTestManifest, adapter, { previewBridge });
  const review = new ProposalReviewController(workspaceTestManifest, engine);
  return { adapter, engine, review };
}

const proposalInput = (operationId = "review-direction") => ({
  baseRevision: "workspace-revision-1",
  operationId,
  operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
  assumptions: ["Logo artwork will be supplied later."],
});

async function capture(engine: ProposalEngine<any, any>) {
  const snapshot = engine.snapshot;
  if (!snapshot.proposalId || !snapshot.baseRevision) throw new Error("expected proposal");
  return engine.capturePreviews({ proposalId: snapshot.proposalId, proposalRevision: snapshot.proposalRevision, baseRevision: snapshot.baseRevision });
}

describe("ProposalReviewController", () => {
  test("stays hidden until the first proposal is visibly applied", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    class SlowAdapter extends V2TestAdapter { override async quiescePersistence() { await gate; return super.quiescePersistence(); } }
    const adapter = new SlowAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const review = new ProposalReviewController(workspaceTestManifest, engine);
    const pending = engine.apply(proposalInput("slow-proposal"));
    await Promise.resolve();
    expect(engine.status).toBe("building");
    expect(review.state).toEqual({ kind: "hidden" });
    release();
    await pending;
    expect(review.state.kind).toBe("temporary");
  });

  test("presents cumulative human-readable changes and blocks Keep until preview proof exists", async () => {
    const { adapter, engine, review } = setup();
    await engine.apply(proposalInput());
    expect(review.state).toMatchObject({
      kind: "temporary",
      heading: "Temporary agent proposal — not saved.",
      variantCount: 1,
      activeVariantName: "Cream direction",
      changes: [{ targetLabel: "Cream direction", label: "Body colour", before: "Cream", after: "Navy" }],
      assumptions: ["Logo artwork will be supplied later."],
      productionReady: false,
      previewReady: false,
      canKeep: false,
      keepDisabledReason: "Waiting for a current visual preview.",
    });
    expect(reviewLocksHumanControls(review.state)).toBe(true);
    expect(await review.keep()).toMatchObject({ ok: false, error: { code: "PREVIEW_REQUIRED" } });
    expect(adapter.counters.localWrites).toBe(0);

    await capture(engine);
    expect(review.state).toMatchObject({ kind: "temporary", previewReady: true, canKeep: true });
    await review.keep();
    expect(review.state).toMatchObject({ kind: "committed", revision: "workspace-revision-2" });
    expect(reviewLocksHumanControls(review.state)).toBe(false);
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("summarizes created variants from the full proposal diff", async () => {
    const { engine, review } = setup();
    await engine.apply({
      baseRevision: "workspace-revision-1",
      operationId: "create-variant-review",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "design.quantity", value: 30 },
        { type: "duplicate-variant", sourceVariantId: "variant-1", variantId: "variant-2", name: "Rose direction", initialControls: { "design.quantity": 30, "body.color": "rose" } },
      ],
    });
    expect(review.state).toMatchObject({ kind: "temporary", variantCount: 2, createdVariants: [{ variantId: "variant-2", name: "Rose direction" }] });
  });

  test("Revert restores the exact baseline with zero writes", async () => {
    const { adapter, engine, review } = setup();
    await engine.apply(proposalInput("review-revert"));
    await review.revert();
    expect(review.state).toEqual({ kind: "reverted", message: "Agent proposal reverted. Nothing was saved." });
    expect(adapter.visible).toEqual(adapter.committed);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("removes Revert after the local commit boundary and offers retry", async () => {
    const { adapter, engine, review } = setup();
    await engine.apply(proposalInput("review-retry"));
    await capture(engine);
    adapter.failServerSave = true;
    await review.keep();
    expect(review.state).toEqual({ kind: "commit-retry", message: "Kept on this device; secure save failed.", retryLabel: "Retry save" });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(0);
    adapter.failServerSave = false;
    await review.retrySave();
    expect(review.state).toMatchObject({ kind: "committed", revision: "workspace-revision-2" });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("shows stale state and restores the latest committed revision", async () => {
    const { adapter, engine, review } = setup();
    await engine.apply(proposalInput("review-stale"));
    adapter.externalChange("revision-external");
    expect(review.state).toMatchObject({ kind: "stale", refreshLabel: "Restore latest" });
    expect(await review.restoreLatest()).toMatchObject({ resynchronized: true, revision: "revision-external" });
    expect(review.state).toEqual({ kind: "hidden" });
    expect(adapter.visible.committedRevision).toBe("revision-external");
  });

  test("requires reload when commit status is unknown", async () => {
    const { adapter, engine, review } = setup();
    await engine.apply(proposalInput("review-uncertain"));
    await capture(engine);
    adapter.throwDuringCommit = true;
    await review.keep();
    expect(review.state).toEqual({ kind: "commit-uncertain", message: "Save status could not be verified. Reload before continuing." });
    expect(adapter.counters.localWrites).toBe(0);
  });
});
