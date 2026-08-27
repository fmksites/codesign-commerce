// @vitest-environment happy-dom

import { afterEach, describe, expect, test, vi } from "vitest";
import { mountProposalReview, PreviewBridge, ProposalEngine, ProposalReviewController } from "../src/index.js";
import { workspaceTestManifest } from "./workspace-fixtures.js";
import { V2TestAdapter } from "./v2-test-adapter.js";

function setup() {
  const container = document.createElement("div");
  document.body.append(container);
  const adapter = new V2TestAdapter();
  const previewBridge = new PreviewBridge(workspaceTestManifest, adapter);
  const engine = new ProposalEngine(workspaceTestManifest, adapter, { previewBridge });
  const controller = new ProposalReviewController(workspaceTestManifest, engine);
  const view = mountProposalReview(container, controller, {
    formatSummary: ({ variantCount, activeVariantName }) => `${variantCount} ${variantCount === 1 ? "design" : "designs"} · ${activeVariantName}`,
  });
  return { adapter, container, controller, engine, view };
}

const proposalInput = (operationId = "view-direction", assumptions?: string[]) => ({
  baseRevision: "workspace-revision-1",
  operationId,
  operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
  ...(assumptions ? { assumptions } : {}),
});

async function capture(engine: ProposalEngine<any, any>) {
  const snapshot = engine.snapshot;
  if (!snapshot.proposalId || !snapshot.baseRevision) throw new Error("expected proposal");
  await engine.capturePreviews({ proposalId: snapshot.proposalId, proposalRevision: snapshot.proposalRevision, baseRevision: snapshot.baseRevision });
}

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

async function waitFor(check: () => void): Promise<void> { await vi.waitFor(check, { timeout: 1_000, interval: 5 }); }

describe("mountProposalReview", () => {
  test("stays hidden during ordinary use and reveals a successful agent proposal", async () => {
    const { engine, view } = setup();
    expect(view.element.hidden).toBe(true);
    await engine.apply(proposalInput("view-visible", ["Logo artwork will be supplied later."]));
    const root = view.element.shadowRoot!;
    expect(view.element.hidden).toBe(false);
    expect(root.textContent).toContain("Temporary · Not saved");
    expect(root.textContent).toContain("Agent proposal");
    expect(root.textContent).toContain("1 design · Cream direction");
    expect(root.textContent).toContain("Cream direction · Body colour");
    expect(root.textContent).toContain("Cream");
    expect(root.textContent).toContain("Navy");
    expect(root.textContent).toContain("Assumption: Logo artwork will be supplied later.");
    expect(root.textContent).toContain("Waiting for a current visual preview.");
    expect((root.querySelector("button.primary") as HTMLButtonElement).disabled).toBe(true);
  });

  test("renders untrusted proposal text as text rather than HTML", async () => {
    const { engine, view } = setup();
    const payload = `<img src=x onerror="globalThis.compromised=true">`;
    await engine.apply(proposalInput("view-safe-text", [payload]));
    const root = view.element.shadowRoot!;
    expect(root.querySelector("img")).toBeNull();
    expect(root.textContent).toContain(payload);
  });

  test("shows a newly created variant in the review surface", async () => {
    const { engine, view } = setup();
    await engine.apply({
      baseRevision: "workspace-revision-1",
      operationId: "view-created-variant",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "design.quantity", value: 30 },
        { type: "duplicate-variant", sourceVariantId: "variant-1", variantId: "variant-2", name: "North Form Rose", initialControls: { "design.quantity": 30, "body.color": "rose" } },
      ],
    });
    const text = view.element.shadowRoot!.textContent;
    expect(text).toContain("2 designs · Cream direction");
    expect(text).toContain("New colourway");
    expect(text).toContain("North Form Rose");
  });

  test("Revert restores the preview without persistence", async () => {
    const { adapter, engine, view } = setup();
    await engine.apply(proposalInput("view-revert"));
    const revert = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Revert") as HTMLButtonElement;
    revert.click();
    await waitFor(() => expect(view.element.shadowRoot!.textContent).toContain("Proposal reverted"));
    expect(adapter.visible).toEqual(adapter.committed);
    expect(adapter.counters.localWrites).toBe(0);
  });

  test("Keep becomes available only after preview capture and persists once", async () => {
    const { adapter, engine, view } = setup();
    await engine.apply(proposalInput("view-keep"));
    let keep = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Keep proposal") as HTMLButtonElement;
    expect(keep.disabled).toBe(true);
    await capture(engine);
    keep = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Keep proposal") as HTMLButtonElement;
    expect(keep.disabled).toBe(false);
    keep.click();
    await waitFor(() => expect(view.element.shadowRoot!.textContent).toContain("Proposal kept"));
    expect(adapter.counters.localWrites).toBe(1);
    expect(adapter.counters.serverWrites).toBe(1);
  });

  test("shows a retry without Revert after a partial save", async () => {
    const { adapter, engine, view } = setup();
    await engine.apply(proposalInput("view-retry"));
    await capture(engine);
    adapter.failServerSave = true;
    const keep = [...view.element.shadowRoot!.querySelectorAll("button")].find((candidate) => candidate.textContent === "Keep proposal") as HTMLButtonElement;
    keep.click();
    await waitFor(() => expect(view.element.shadowRoot!.textContent).toContain("Save needs attention"));
    expect(view.element.shadowRoot!.textContent).toContain("Retry save");
    expect(view.element.shadowRoot!.textContent).not.toContain("Revert");
    expect(adapter.counters.localWrites).toBe(1);
  });

  test("destroy removes the host and subscription", () => {
    const { container, view } = setup();
    expect(container.contains(view.element)).toBe(true);
    view.destroy();
    expect(container.contains(view.element)).toBe(false);
  });
});
