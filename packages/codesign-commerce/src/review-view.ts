import type { ProposalReviewController, ReviewState } from "./review-controller.js";

export interface ProposalReviewSummary {
  designCount: number;
  totalQuantity: number;
}

export interface ProposalReviewViewOptions {
  formatSummary?: (summary: ProposalReviewSummary) => string;
  keepLabel?: string;
  revertLabel?: string;
  className?: string;
}

export interface ProposalReviewViewHandle {
  readonly element: HTMLElement;
  destroy(): void;
}

const stylesheet = String.raw`
  :host {
    --codesign-review-surface: #fffdfb;
    --codesign-review-text: #191817;
    --codesign-review-muted: #716b67;
    --codesign-review-border: #b9afa8;
    --codesign-review-divider: #ddd6d0;
    --codesign-review-accent: #9c3b5b;
    --codesign-review-action: #171717;
    --codesign-review-action-text: #ffffff;
    --codesign-review-radius: 8px;
    --codesign-review-font: Inter, Helvetica, Arial, sans-serif;
    --codesign-review-motion: 160ms ease;
    display: block;
    color: var(--codesign-review-text);
    font-family: var(--codesign-review-font);
  }

  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .panel {
    width: 100%;
    border: 1px solid var(--codesign-review-border);
    border-radius: var(--codesign-review-radius);
    background: var(--codesign-review-surface);
    color: var(--codesign-review-text);
    padding: 22px 18px;
    outline: none;
  }

  .panel:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--codesign-review-accent) 28%, transparent);
  }

  .temporary {
    display: grid;
    grid-template-columns: minmax(190px, 0.8fr) minmax(260px, 1.4fr) minmax(260px, 1.2fr) auto;
    align-items: center;
    gap: 24px;
  }

  .status-line {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0 0 10px;
    color: var(--codesign-review-accent);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.08em;
    line-height: 1.25;
    text-transform: uppercase;
  }

  .status-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 9px;
    border-radius: 999px;
    background: var(--codesign-review-accent);
  }

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 520;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .summary {
    margin: 6px 0 0;
    color: var(--codesign-review-muted);
    font-size: 15px;
    line-height: 1.45;
  }

  .changes,
  .review-details {
    min-width: 0;
    border-left: 1px solid var(--codesign-review-divider);
    padding-left: 24px;
  }

  .change-list,
  .detail-list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .change-row {
    display: grid;
    grid-template-columns: minmax(90px, 1fr) auto auto auto;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .change-label {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--codesign-review-muted);
  }

  .change-before { color: var(--codesign-review-muted); }
  .change-after { font-weight: 650; }
  .change-arrow { color: var(--codesign-review-muted); }

  .detail-list {
    color: var(--codesign-review-text);
    font-size: 13px;
    line-height: 1.45;
  }

  .detail-label { font-weight: 650; }
  .detail-error { color: #8a2139; }
  .readiness { color: var(--codesign-review-muted); }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--codesign-review-text);
    border-radius: 7px;
    padding: 10px 20px;
    background: transparent;
    color: var(--codesign-review-text);
    font: 560 15px/1.2 var(--codesign-review-font);
    cursor: pointer;
    transition: background var(--codesign-review-motion), color var(--codesign-review-motion), opacity var(--codesign-review-motion);
  }

  button.primary {
    border-color: var(--codesign-review-action);
    background: var(--codesign-review-action);
    color: var(--codesign-review-action-text);
  }

  button:hover:not(:disabled) { background: color-mix(in srgb, var(--codesign-review-action) 8%, transparent); }
  button.primary:hover:not(:disabled) { background: color-mix(in srgb, var(--codesign-review-action) 88%, white); }
  button:focus-visible { outline: 3px solid color-mix(in srgb, var(--codesign-review-accent) 35%, transparent); outline-offset: 2px; }
  button:disabled { cursor: wait; opacity: 0.55; }

  .outcome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .outcome-copy p { margin: 6px 0 0; color: var(--codesign-review-muted); line-height: 1.45; }
  .busy-copy { margin: 0; font-size: 16px; line-height: 1.5; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

  @media (max-width: 899px) {
    .panel { padding: 22px; }
    .temporary { grid-template-columns: 1fr; gap: 20px; }
    .changes,
    .review-details { border-left: 0; border-top: 1px solid var(--codesign-review-divider); padding: 18px 0 0; }
    .actions { border-top: 1px solid var(--codesign-review-divider); padding-top: 18px; }
  }

  @media (max-width: 759px) {
    .panel { padding: 22px; }
    h2 { font-size: 24px; }
    .summary { font-size: 16px; }
    .change-list { gap: 0; }
    .change-row {
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      grid-template-areas:
        "label label label"
        "before arrow after";
      min-height: 48px;
      padding: 12px 0;
      border-bottom: 1px solid var(--codesign-review-divider);
      font-size: 16px;
    }
    .change-label { grid-area: label; font-size: 13px; }
    .change-before { grid-area: before; min-width: 0; overflow-wrap: anywhere; }
    .change-arrow { grid-area: arrow; }
    .change-after { grid-area: after; min-width: 0; overflow-wrap: anywhere; text-align: right; }
    .change-row:last-child { border-bottom: 0; }
    .detail-list { gap: 10px; font-size: 15px; }
    .actions { display: grid; grid-template-columns: 1fr 1.25fr; }
    button { width: 100%; min-height: 54px; font-size: 16px; }
    .outcome { align-items: stretch; flex-direction: column; }
  }

  @media (max-width: 419px) {
    .panel { padding: 18px; }
  }

  @media (prefers-reduced-motion: reduce) {
    button { transition: none; }
  }
`;

function defaultSummary(summary: ProposalReviewSummary): string {
  const designLabel = summary.designCount === 1 ? "design" : "designs";
  const unitLabel = summary.totalQuantity === 1 ? "unit" : "units";
  return `${summary.designCount} ${designLabel} · ${summary.totalQuantity} ${unitLabel}`;
}

function element(document: Document, tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(document: Document, label: string, className: string, action: () => void): HTMLButtonElement {
  const node = document.createElement("button");
  node.type = "button";
  node.className = className;
  node.textContent = label;
  node.addEventListener("click", action);
  return node;
}

export function mountProposalReview<Snapshot = unknown>(
  container: HTMLElement,
  controller: ProposalReviewController<Snapshot>,
  options: ProposalReviewViewOptions = {},
): ProposalReviewViewHandle {
  const document = container.ownerDocument;
  const host = document.createElement("div");
  host.hidden = true;
  host.dataset.codesignReview = "";
  if (options.className) host.className = options.className;
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = stylesheet;
  root.append(style);
  const live = element(document, "div", "sr-only");
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  root.append(live);
  container.append(host);

  let lastFocusedProposal = "";

  const run = (action: () => Promise<unknown>) => {
    void action().catch(() => {
      // The controller owns sanitized recovery states. Never leak raw failures to the host page.
    });
  };

  const renderTemporary = (state: Extract<ReviewState, { kind: "temporary" }>): HTMLElement => {
    const panel = element(document, "section", "panel temporary");
    panel.setAttribute("part", "panel");
    panel.tabIndex = -1;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", "codesign-review-heading");

    const identity = element(document, "div", "identity");
    const status = element(document, "p", "status-line");
    status.append(element(document, "span", "status-dot"), document.createTextNode("Temporary · Not saved"));
    const heading = element(document, "h2", undefined, "Agent proposal");
    heading.id = "codesign-review-heading";
    const summary = options.formatSummary?.({ designCount: state.designCount, totalQuantity: state.totalQuantity })
      ?? defaultSummary({ designCount: state.designCount, totalQuantity: state.totalQuantity });
    identity.append(status, heading, element(document, "p", "summary", summary));

    const changes = element(document, "div", "changes");
    changes.setAttribute("aria-label", "Proposed changes");
    const changeList = element(document, "ul", "change-list");
    for (const created of state.createdDesigns) {
      const row = element(document, "li", "change-row");
      row.append(
        element(document, "span", "change-label", "New colourway"),
        element(document, "span", "change-before", "Clone"),
        element(document, "span", "change-arrow", "→"),
        element(document, "span", "change-after", created.name),
      );
      changeList.append(row);
    }
    for (const change of state.changes) {
      const row = element(document, "li", "change-row");
      row.append(
        element(document, "span", "change-label", change.label),
        element(document, "span", "change-before", change.before),
        element(document, "span", "change-arrow", "→"),
        element(document, "span", "change-after", change.after),
      );
      changeList.append(row);
    }
    changes.append(changeList);

    const details = element(document, "div", "review-details");
    const detailList = element(document, "ul", "detail-list");
    const addDetails = (label: string, messages: string[], className = "") => {
      for (const message of messages) {
        const item = element(document, "li", className);
        item.append(element(document, "span", "detail-label", `${label}: `), document.createTextNode(message));
        detailList.append(item);
      }
    };
    addDetails("Blocking error", state.hardErrors.map((issue) => issue.message), "detail-error");
    addDetails("Assumption", state.assumptions);
    addDetails("Missing decision", state.missingDecisions.map((issue) => issue.message));
    addDetails("Warning", state.warnings.map((issue) => issue.message));
    const readiness = element(document, "li", "readiness");
    readiness.textContent = state.productionReady
      ? "Safe to keep as a draft · Production ready"
      : "Safe to keep as a draft · Not production ready";
    detailList.append(readiness);
    details.append(detailList);

    const actions = element(document, "div", "actions");
    actions.append(
      button(document, options.revertLabel ?? "Revert", "secondary", () => run(() => controller.revert())),
      button(document, options.keepLabel ?? "Keep proposal", "primary", () => run(() => controller.keep())),
    );
    panel.append(identity, changes, details, actions);
    return panel;
  };

  const renderOutcome = (headingText: string, message: string, action?: { label: string; run: () => Promise<unknown> }): HTMLElement => {
    const panel = element(document, "section", "panel outcome");
    panel.setAttribute("part", "panel");
    panel.tabIndex = -1;
    const copy = element(document, "div", "outcome-copy");
    copy.append(element(document, "h2", undefined, headingText), element(document, "p", undefined, message));
    panel.append(copy);
    if (action) panel.append(button(document, action.label, "primary", () => run(action.run)));
    return panel;
  };

  const render = (state: ReviewState) => {
    for (const child of [...root.children]) {
      if (child !== style && child !== live) child.remove();
    }
    if (state.kind === "hidden") {
      host.hidden = true;
      live.textContent = "";
      return;
    }

    host.hidden = false;
    let panel: HTMLElement;
    if (state.kind === "temporary") {
      panel = renderTemporary(state);
      live.textContent = `${state.heading} Review the proposed changes, then choose Keep proposal or Revert.`;
    } else if (state.kind === "busy") {
      panel = renderOutcome("Agent proposal", state.message);
      panel.setAttribute("aria-busy", "true");
      live.textContent = state.message;
    } else if (state.kind === "invalidated") {
      panel = renderOutcome("Proposal expired", state.message, { label: state.refreshLabel, run: () => controller.restoreLatest() });
      live.textContent = state.message;
    } else if (state.kind === "commit-retry") {
      panel = renderOutcome("Save needs attention", state.message, { label: state.retryLabel, run: () => controller.retrySave() });
      live.textContent = state.message;
    } else if (state.kind === "commit-uncertain") {
      panel = renderOutcome("Save needs checking", state.message);
      panel.setAttribute("role", "alert");
      live.textContent = state.message;
    } else if (state.kind === "committed") {
      panel = renderOutcome("Proposal kept", state.message);
      live.textContent = state.message;
    } else {
      panel = renderOutcome("Proposal reverted", state.message);
      live.textContent = state.message;
    }
    root.append(panel);

    if (state.kind === "temporary") {
      const focusKey = `${state.proposalId}:${state.proposalRevision}`;
      if (focusKey !== lastFocusedProposal) {
        lastFocusedProposal = focusKey;
        panel.focus({ preventScroll: true });
      }
    }
  };

  const unsubscribe = controller.subscribe(render);
  return {
    element: host,
    destroy() {
      unsubscribe();
      host.remove();
    },
  };
}
