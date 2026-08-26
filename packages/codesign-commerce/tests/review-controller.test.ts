import { describe, expect, test } from "vitest";
import { InMemoryConfiguratorAdapter, ProposalReviewController, ProposalSession } from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

function setup() {
  const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
  const session = new ProposalSession(structuredClone(testManifest), adapter);
  const review = new ProposalReviewController(testManifest, session);
  return { adapter, session, review };
}

describe("ProposalReviewController", () => {
  test("presents a human-readable temporary proposal and keeps only through its UI action", async () => {
    const { adapter, session, review } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "review-keep-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
      assumptions: ["Logo artwork will be supplied later."],
    });

    expect(review.state).toMatchObject({
      kind: "temporary",
      heading: "Temporary agent proposal — not saved.",
      changes: [{ label: "Body colour", before: "cream", after: "navy" }],
      assumptions: ["Logo artwork will be supplied later."],
      safeToKeepAsDraft: true,
      productionReady: false,
    });
    expect(adapter.counters.localWrites).toBe(0);

    await review.keep();
    expect(review.state).toMatchObject({ kind: "committed", revision: "revision-2" });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("reverts with zero writes and publishes an explicit outcome", async () => {
    const { adapter, session, review } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "review-revert-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
    });

    await review.revert();
    expect(review.state).toEqual({ kind: "reverted", message: "Agent proposal reverted. Nothing was saved." });
    expect(adapter.visibleState).toEqual(adapter.committedState);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("removes Revert after the local commit boundary and offers human retry", async () => {
    const { adapter, session, review } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "review-retry-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.failServerSave = true;

    await review.keep();
    expect(review.state).toEqual({
      kind: "commit-retry",
      message: "Kept on this device; secure save failed.",
      retryLabel: "Retry save",
    });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(0);

    adapter.failServerSave = false;
    await review.retrySave();
    expect(review.state).toMatchObject({ kind: "committed", revision: "revision-2" });
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("shows an invalidation state and restores the latest committed revision", async () => {
    const { adapter, session, review } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "review-invalidated-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.simulateExternalRevision("revision-external");

    expect(review.state).toMatchObject({ kind: "invalidated", refreshLabel: "Restore latest" });
    const restored = await review.restoreLatest();
    expect(restored).toMatchObject({ resynchronized: true, revision: "revision-external" });
    expect(review.state).toEqual({ kind: "hidden" });
    expect(adapter.visibleState.revision).toBe("revision-external");
  });

  test("requires reload when commit status is unknown", async () => {
    const { adapter, session, review } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "review-uncertain-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.throwDuringCommit = true;

    await review.keep();
    expect(review.state).toEqual({ kind: "commit-uncertain", message: "Save status could not be verified. Reload before continuing." });
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });
});
