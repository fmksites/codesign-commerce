// @vitest-environment happy-dom

import { afterEach, describe, expect, test, vi } from "vitest";
import {
  InMemoryConfiguratorAdapter,
  mountProposalReview,
  ProposalReviewController,
  ProposalSession,
} from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

function setup() {
  const container = document.createElement("div");
  document.body.append(container);
  const adapter = new InMemoryConfiguratorAdapter(structuredClone(testState));
  const session = new ProposalSession(structuredClone(testManifest), adapter);
  const controller = new ProposalReviewController(testManifest, session);
  const view = mountProposalReview(container, controller, {
    formatSummary: ({ designCount, totalQuantity }) => `${designCount} ${designCount === 1 ? "design" : "designs"} · ${totalQuantity} pairs`,
  });
  return { adapter, container, controller, session, view };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

async function waitFor(check: () => void): Promise<void> {
  await vi.waitFor(check, { timeout: 1_000, interval: 5 });
}

describe("mountProposalReview", () => {
  test("stays hidden during ordinary page use and reveals only a ready agent proposal", async () => {
    const { session, view } = setup();

    expect(view.element.hidden).toBe(true);
    expect(view.element.shadowRoot?.querySelector(".panel")).toBeNull();

    await session.propose({
      baseRevision: "revision-1",
      operationId: "view-visible-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
      assumptions: ["Logo artwork will be supplied later."],
    });

    const root = view.element.shadowRoot!;
    expect(view.element.hidden).toBe(false);
    expect(root.textContent).toContain("Temporary · Not saved");
    expect(root.textContent).toContain("Agent proposal");
    expect(root.textContent).toContain("1 design · 60 pairs");
    expect(root.textContent).toContain("Body colour");
    expect(root.textContent).toContain("Cream");
    expect(root.textContent).toContain("Navy");
    expect(root.textContent).toContain("Assumption: Logo artwork will be supplied later.");
    expect(root.textContent).toContain("Not production ready");
    expect(root.activeElement).toBe(root.querySelector(".panel"));
  });

  test("renders untrusted proposal text as text rather than HTML", async () => {
    const { session, view } = setup();
    const payload = `<img src=x onerror="globalThis.compromised=true">`;

    await session.propose({
      baseRevision: "revision-1",
      operationId: "view-safe-text-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
      assumptions: [payload],
    });

    const root = view.element.shadowRoot!;
    expect(root.querySelector("img")).toBeNull();
    expect(root.textContent).toContain(payload);
  });

  test("Revert restores the preview without persistence and publishes the outcome", async () => {
    const { adapter, session, view } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "view-revert-1",
      changes: [{ designId: "design-1", optionId: "accent.color", value: "berry" }],
    });

    const revert = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Revert");
    expect(revert).toBeDefined();
    (revert as HTMLButtonElement).click();

    await waitFor(() => expect(view.element.shadowRoot!.textContent).toContain("Proposal reverted"));
    expect(adapter.visibleState).toEqual(adapter.committedState);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("Keep is a visible page action and persists exactly once", async () => {
    const { adapter, session, view } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "view-keep-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });

    const keep = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Keep proposal");
    expect(keep).toBeDefined();
    (keep as HTMLButtonElement).click();

    await waitFor(() => expect(view.element.shadowRoot!.textContent).toContain("Proposal kept"));
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("shows a human retry after an expected server-save failure", async () => {
    const { adapter, session, view } = setup();
    await session.propose({
      baseRevision: "revision-1",
      operationId: "view-retry-1",
      changes: [{ designId: "design-1", optionId: "body.color", value: "navy" }],
    });
    adapter.failServerSave = true;

    const keep = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Keep proposal");
    (keep as HTMLButtonElement).click();

    await waitFor(() => expect(view.element.shadowRoot!.textContent).toContain("Save needs attention"));
    expect(view.element.shadowRoot!.textContent).toContain("Retry save");
    expect(view.element.shadowRoot!.textContent).not.toContain("Revert");
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(0);
  });

  test("destroy removes the host and subscription", () => {
    const { container, view } = setup();
    expect(container.contains(view.element)).toBe(true);
    view.destroy();
    expect(container.contains(view.element)).toBe(false);
  });
});
