import {
  mountProposalReview,
  ProposalReviewController,
  ProposalSession,
  registerCoDesignTools,
  type ConfigurationDesign,
  type ConfigurationState,
  type DocumentWithModelContext,
  type JsonPrimitive,
} from "@codesign-commerce/core";
import { StudioToteAdapter, toteInitialState, toteManifest } from "./configurator";
import "./styles.css";

const publicAsset = (name: string): string => `${import.meta.env.BASE_URL}${name}`;

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Studio tote app root is missing");

app.innerHTML = `
  <div class="announcement">Studio Tote reference · powered by CoDesign Commerce</div>
  <header class="site-header">
    <strong>STUDIO TOTE</strong>
    <span>Public portability example</span>
  </header>
  <main class="page-shell">
    <section class="top-grid">
      <div class="intro">
        <h1>Build a tote <em>for your studio</em></h1>
        <p>Configure canvas, handles and print placement. Agent proposals stay temporary until you Keep or Revert them.</p>
      </div>
      <div class="product-row">
        <span>Selected product</span>
        <strong>Canvas studio tote</strong>
        <button type="button">Change</button>
      </div>
    </section>

    <section class="designer" aria-label="Studio tote reference configurator">
      <div class="variant-toolbar">
        <div class="variant-tabs" role="tablist" aria-label="Tote variants" data-variant-tabs></div>
        <span data-save-status>Draft saved on this device</span>
      </div>
      <label class="variant-name">Variant name <input data-variant-name maxlength="60" /></label>
      <nav class="steps" aria-label="Tote design progress">
        <button class="active" type="button" data-step-target="canvas"><span>1</span>Canvas</button>
        <button type="button" data-step-target="colour"><span>2</span>Colour</button>
        <button type="button" data-step-target="handles"><span>3</span>Handles</button>
        <button type="button" data-step-target="print"><span>4</span>Print</button>
        <button type="button" data-step-target="quantity"><span>5</span>Quantity</button>
      </nav>

      <div id="proposal-review" class="proposal-slot"></div>
      <output data-persistence-audit hidden aria-hidden="true"></output>

      <div class="builder-grid">
        <fieldset class="controls" data-human-controls>
          <section class="control-section" id="canvas">
            <div class="section-heading"><strong>Canvas</strong><span>Canvas weight</span></div>
            <div class="choice-grid weight-grid" data-choice-group="canvas.weight">
              <button type="button" data-option="canvas.weight" data-value="8oz"><b>8 oz</b><span>Lightweight</span></button>
              <button type="button" data-option="canvas.weight" data-value="12oz"><b>12 oz</b><span>Heavyweight</span></button>
              <button type="button" data-option="canvas.weight" data-value="16oz"><b>16 oz</b><span>Extra heavyweight</span></button>
            </div>
          </section>

          <section class="control-section" id="colour">
            <div class="section-heading"><strong>Colour</strong><span>Stocked canvas</span></div>
            <div class="colour-grid" data-choice-group="bag.color">
              <button type="button" data-option="bag.color" data-value="natural"><i style="--colour:#e8dfd0"></i><span>Natural</span></button>
              <button type="button" data-option="bag.color" data-value="charcoal"><i style="--colour:#262927"></i><span>Charcoal</span></button>
            </div>
          </section>

          <section class="control-section" id="handles">
            <div class="section-heading"><strong>Handles</strong><span>Carry style</span></div>
            <div class="choice-grid handle-grid" data-choice-group="handles.length">
              <button type="button" data-option="handles.length" data-value="short"><b>Short tote</b><span>33 cm hand carry</span></button>
              <button type="button" data-option="handles.length" data-value="long"><b>Long shoulder</b><span>66 cm shoulder carry</span></button>
            </div>
            <label class="reinforced"><input type="checkbox" data-option="construction.reinforced" />Reinforced cross-stitch at stress points</label>
          </section>
        </fieldset>

        <aside class="proof-column" aria-labelledby="proof-title">
          <div class="proof-heading"><span id="proof-title">Live tote proof</span><span>Visible proposal preview</span></div>
          <div class="proof-stage">
            <img src="${publicAsset("tote-natural-long.png")}" alt="Natural canvas studio tote with long handles" data-tote-preview />
            <span class="print-mark" data-print-mark>STUDIO<br />MARK</span>
          </div>
          <div class="proof-specs" id="print">
            <label>Print placement
              <select data-option="print.position">
                <option value="front-center">Front center</option>
                <option value="upper-left">Upper left</option>
              </select>
            </label>
            <label>Print method
              <select data-option="print.method">
                <option value="screen-1">Screen print · 1 colour</option>
                <option value="screen-2">Screen print · 2 colours</option>
                <option value="embroidery">Embroidery</option>
              </select>
            </label>
            <label id="quantity">Variant quantity
              <input type="number" min="25" max="5000" step="25" data-option="design.quantity" />
            </label>
            <div class="production-note"><span>Production note</span><strong>Final print artwork is still required.</strong></div>
          </div>
        </aside>
      </div>
    </section>
  </main>
`;

const query = new URLSearchParams(window.location.search);
if (query.has("reset")) window.localStorage.removeItem("codesign-studio-tote");
const persisted = window.localStorage.getItem("codesign-studio-tote");
let seed = structuredClone(toteInitialState);
if (persisted) {
  try { seed = JSON.parse(persisted) as ConfigurationState; } catch { /* keep public fixture */ }
}
const adapter = new StudioToteAdapter(seed, (state) => {
  window.localStorage.setItem("codesign-studio-tote", JSON.stringify(state));
});
const session = new ProposalSession(toteManifest, adapter);
const controller = new ProposalReviewController(toteManifest, session);

const reviewContainer = document.querySelector<HTMLElement>("#proposal-review");
const tabs = document.querySelector<HTMLElement>("[data-variant-tabs]");
const nameInput = document.querySelector<HTMLInputElement>("[data-variant-name]");
const saveStatus = document.querySelector<HTMLElement>("[data-save-status]");
const preview = document.querySelector<HTMLImageElement>("[data-tote-preview]");
const mark = document.querySelector<HTMLElement>("[data-print-mark]");
const controls = document.querySelector<HTMLFieldSetElement>("[data-human-controls]");
const audit = document.querySelector<HTMLOutputElement>("[data-persistence-audit]");
if (!reviewContainer || !tabs || !nameInput || !saveStatus || !preview || !mark || !controls || !audit) {
  throw new Error("Studio tote configurator markup is incomplete");
}

let activeDesignId = adapter.visibleState.activeDesignId;

const activeDesign = (): ConfigurationDesign => {
  const state = adapter.visibleState;
  return state.designs.find((design) => design.id === activeDesignId) ?? state.designs[0]!;
};

const selection = (design: ConfigurationDesign, optionId: string, fallback: JsonPrimitive): JsonPrimitive =>
  design.selections[optionId] ?? fallback;

const renderTabs = (followVisible = false) => {
  const state = adapter.visibleState;
  if (followVisible || !state.designs.some((design) => design.id === activeDesignId)) activeDesignId = state.activeDesignId;
  tabs.replaceChildren();
  for (const design of state.designs) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `variant-tab${design.id === activeDesignId ? " active" : ""}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(design.id === activeDesignId));
    tab.textContent = `${design.name} · ${design.quantity}`;
    tab.addEventListener("click", () => { activeDesignId = design.id; render(); });
    tabs.append(tab);
  }
  const add = document.createElement("button");
  add.type = "button";
  add.className = "add-variant";
  add.setAttribute("aria-label", "Add tote variant");
  add.textContent = "+";
  add.disabled = session.status !== "idle" || state.designs.length >= toteManifest.capabilities.maximumDesigns;
  add.addEventListener("click", () => {
    const created = adapter.addHumanVariant(activeDesignId);
    if (created) { activeDesignId = created; render(); }
  });
  tabs.append(add);
};

const render = (followVisible = false) => {
  renderTabs(followVisible);
  const design = activeDesign();
  const colour = String(selection(design, "bag.color", "natural"));
  const handles = String(selection(design, "handles.length", "long"));
  const asset = handles === "short"
    ? publicAsset("tote-natural-short.png")
    : colour === "charcoal" ? publicAsset("tote-charcoal-long.png") : publicAsset("tote-natural-long.png");
  preview.src = asset;
  preview.classList.toggle("filtered-charcoal", colour === "charcoal" && handles === "short");
  preview.alt = `${colour === "charcoal" ? "Charcoal" : "Natural"} canvas studio tote with ${handles} handles`;
  mark.classList.toggle("upper-left", selection(design, "print.position", "front-center") === "upper-left");
  mark.classList.toggle("light", colour === "charcoal");
  nameInput.value = design.name;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-option][data-value]")) {
    button.classList.toggle("selected", selection(design, button.dataset.option ?? "", "") === button.dataset.value);
  }
  for (const control of document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("select[data-option], input[data-option]")) {
    const optionId = control.dataset.option ?? "";
    const value = optionId === "design.quantity" ? design.quantity : selection(design, optionId, false);
    if (control instanceof HTMLInputElement && control.type === "checkbox") control.checked = value === true;
    else control.value = String(value);
  }
  audit.value = JSON.stringify(adapter.counters);
};

mountProposalReview(reviewContainer, controller, {
  formatSummary: ({ designCount, totalQuantity }) => `${designCount} ${designCount === 1 ? "variant" : "variants"} · ${totalQuantity} totes`,
});

controller.subscribe((state) => {
  const locked = ["temporary", "busy", "invalidated", "commit-retry", "commit-uncertain"].includes(state.kind);
  for (const control of controls.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>("button, input, select")) control.disabled = locked;
  nameInput.disabled = locked;
  saveStatus.textContent = ["temporary", "busy", "invalidated"].includes(state.kind)
    ? "Temporary proposal not saved"
    : "Draft saved on this device";
  render(true);
});

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-option][data-value]")) {
  button.addEventListener("click", () => {
    const optionId = button.dataset.option;
    const value = button.dataset.value;
    if (optionId && value && adapter.applyHumanChange(activeDesignId, optionId, value)) render();
  });
}

for (const control of document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("select[data-option], input[data-option]")) {
  control.addEventListener("change", () => {
    const optionId = control.dataset.option;
    if (!optionId) return;
    let value: JsonPrimitive = control.value;
    if (control instanceof HTMLInputElement && control.type === "checkbox") value = control.checked;
    if (control instanceof HTMLInputElement && control.type === "number") value = Number(control.value);
    if (adapter.applyHumanChange(activeDesignId, optionId, value)) render();
  });
}

nameInput.addEventListener("change", () => {
  if (adapter.applyHumanChange(activeDesignId, "design.name", nameInput.value.trim() || "Untitled tote")) render();
});

for (const step of document.querySelectorAll<HTMLButtonElement>("[data-step-target]")) {
  step.addEventListener("click", () => {
    for (const candidate of document.querySelectorAll<HTMLButtonElement>("[data-step-target]")) {
      candidate.classList.toggle("active", candidate === step);
    }
    document.getElementById(step.dataset.stepTarget ?? "")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const registration = registerCoDesignTools(document as DocumentWithModelContext, {
  manifest: toteManifest,
  adapter,
  session,
});
void registration.ready;

render();

if (import.meta.env.DEV && query.has("agent-preview")) {
  void (async () => {
    const first = await session.propose({
      baseRevision: adapter.committedState.revision,
      operationId: "tote-visual-first",
      changes: [
        { designId: "tote-1", optionId: "design.name", value: "Natural long-handle" },
        { designId: "tote-1", optionId: "canvas.weight", value: "12oz" },
        { designId: "tote-1", optionId: "bag.color", value: "natural" },
        { designId: "tote-1", optionId: "handles.length", value: "long" },
      ],
      assumptions: ["Split the 100 totes evenly across two variants.", "Final print artwork will be supplied later."],
    });
    if (!first.ok) return;
    await session.createDesign({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "tote-visual-second",
      sourceDesignId: "tote-1",
      changes: [{ designId: "tote-1", optionId: "design.quantity", value: 50 }],
      newDesignChanges: [
        { optionId: "design.name", value: "Charcoal short-handle" },
        { optionId: "design.quantity", value: 50 },
        { optionId: "bag.color", value: "charcoal" },
        { optionId: "handles.length", value: "short" },
        { optionId: "print.position", value: "upper-left" },
      ],
    });
  })();
}
