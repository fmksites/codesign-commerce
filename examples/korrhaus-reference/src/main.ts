import {
  InMemoryConfiguratorAdapter,
  mountProposalReview,
  ProposalReviewController,
  ProposalSession,
  registerCoDesignTools,
  type ConfigurationState,
  type ConfiguratorManifest,
  type DocumentWithModelContext,
  type ValidationResult,
} from "@codesign-commerce/core";
import "./styles.css";

const manifest: ConfiguratorManifest = {
  schemaVersion: "1.0",
  id: "codesign.korrhaus-reference",
  version: "1.0.0",
  displayName: "KORRHAUS public sock reference",
  productType: "custom-grip-sock",
  capabilities: { multipleDesigns: true, maximumDesigns: 4, cloning: true },
  optionGroups: [
    {
      id: "body.color",
      label: "Body colour",
      agentDescription: "Choose the main sock yarn colour.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "side sock proof",
      values: [
        { id: "cream", label: "Cream" },
        { id: "navy", label: "Navy" },
        { id: "dusty-rose", label: "Dusty rose" },
      ],
    },
    {
      id: "accent.color",
      label: "Accent",
      agentDescription: "Choose the accent yarn used for knit details and the placeholder mark.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "accent and placeholder mark",
      values: [
        { id: "navy", label: "Navy" },
        { id: "berry", label: "Berry" },
        { id: "cream", label: "Cream" },
      ],
    },
    {
      id: "grip.plate",
      label: "Grip",
      agentDescription: "Choose an approved public grip treatment.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "grip bottom",
      values: [{ id: "standard", label: "Standard grip" }],
    },
    {
      id: "design.quantity",
      label: "Design quantity",
      agentDescription: "Set the number of pairs for one colourway.",
      scope: "design",
      kind: "integer",
      role: "design-quantity",
      agentWritable: true,
      minimum: 20,
      maximum: 10_000,
    },
    {
      id: "order.total_quantity",
      label: "Order quantity",
      agentDescription: "Set the total number of pairs across all colourways.",
      scope: "order",
      kind: "integer",
      role: "order-total",
      agentWritable: true,
      minimum: 20,
      maximum: 10_000,
    },
    {
      id: "branding.artwork_status",
      label: "Logo artwork",
      agentDescription: "Read whether production-ready logo artwork is available.",
      scope: "design",
      kind: "asset-status",
      agentWritable: false,
    },
  ],
  dependencyRules: [
    { id: "quantities-match-total", description: "Colourway quantities must add up to the order total." },
    { id: "artwork-before-production", description: "A placeholder may be kept as a draft, but final artwork is required before production." },
  ],
  approval: { mode: "explicit-human", persistence: "keep-only" },
};

const initialState: ConfigurationState = {
  configuratorId: manifest.id,
  manifestVersion: manifest.version,
  revision: "reference-revision-1",
  activeDesignId: "design-1",
  order: { totalQuantity: 120 },
  designs: [
    {
      id: "design-1",
      name: "Design 1",
      quantity: 60,
      selections: { "body.color": "cream", "accent.color": "navy", "grip.plate": "standard" },
      assets: [{ slot: "logo", status: "placeholder", agentWritable: false }],
    },
    {
      id: "design-2",
      name: "Design 2",
      quantity: 60,
      selections: { "body.color": "cream", "accent.color": "navy", "grip.plate": "standard" },
      assets: [{ slot: "logo", status: "placeholder", agentWritable: false }],
    },
  ],
};

class KorrhausReferenceAdapter extends InMemoryConfiguratorAdapter {
  override async validateState(state: ConfigurationState): Promise<ValidationResult> {
    const base = await super.validateState(state);
    const missingArtwork = state.designs.filter((design) => design.assets.some((asset) => asset.slot === "logo" && asset.status !== "ready"));
    return {
      configurationValid: base.configurationValid,
      productionReady: base.configurationValid && missingArtwork.length === 0,
      issues: [
        ...base.issues,
        ...(missingArtwork.length === 0 ? [] : [{
          code: "FINAL_LOGO_ARTWORK_REQUIRED",
          severity: "decision-required" as const,
          message: "Final logo artwork",
          optionIds: ["branding.artwork_status"],
          designIds: missingArtwork.map((design) => design.id),
        }]),
      ],
      assumptions: [...base.assumptions],
    };
  }
}

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Reference app root is missing");

app.innerHTML = `
  <div class="announcement">KORRHAUS public reference · powered by CoDesign Commerce</div>
  <header class="site-header">
    <img src="/korr-logo.png" alt="KORRHAUS" class="brand" />
    <span>Custom sock reference</span>
  </header>
  <main class="page-shell">
    <section class="intro">
      <p class="overline">Wholesale & studio partnerships</p>
      <h1>Custom grip socks for your <em>studio</em></h1>
      <p>Configure a public reference proof. Agent proposals remain temporary until you Keep or Revert them.</p>
    </section>

    <section class="route-card" aria-label="Selected route">
      <div><span>Selected route</span><strong>Fully custom studio sock</strong></div>
      <button type="button">Change</button>
    </section>

    <section class="designer" aria-label="KORRHAUS custom sock reference configurator">
      <div class="design-toolbar">
        <div class="tabs" role="tablist" aria-label="Colourways">
          <button type="button" class="tab active" role="tab" aria-selected="true" data-design-tab="design-1">Design 1</button>
          <button type="button" class="tab" role="tab" aria-selected="false" data-design-tab="design-2">Design 2</button>
          <button type="button" class="add-design" aria-label="Add design">+</button>
        </div>
        <p>Draft saved on this device</p>
      </div>
      <label class="design-name">Design name <input value="Design 1" data-design-name maxlength="60" /></label>
      <nav class="steps" aria-label="Sock design progress">
        <button class="active" type="button"><span>01</span>Colors</button>
        <button type="button"><span>02</span>Pattern</button>
        <button type="button"><span>03</span>Logo</button>
        <button type="button"><span>04</span>Cuff</button>
        <button type="button"><span>05</span>Grip</button>
        <button type="button"><span>06</span>Packaging</button>
      </nav>

      <div id="proposal-review" class="proposal-slot"></div>
      <output data-persistence-audit hidden aria-hidden="true"></output>

      <div class="builder-grid">
        <fieldset class="controls" data-controls>
          <legend><span>01 — Main colour</span><strong data-current-colour>Cream</strong></legend>
          <p>Twelve studio favourites — the reference keeps this public palette deliberately small.</p>
          <div class="swatches" aria-label="Main colour">
            <button type="button" data-human-colour="cream" class="selected"><span style="--swatch:#e9e4d8"></span>Cream</button>
            <button type="button" data-human-colour="navy"><span style="--swatch:#1c2945"></span>Navy</button>
            <button type="button" data-human-colour="dusty-rose"><span style="--swatch:#c99aaa"></span>Dusty rose</button>
            <button type="button"><span style="--swatch:#748171"></span>Sage</button>
            <button type="button"><span style="--swatch:#252525"></span>Premium black</button>
            <button type="button"><span style="--swatch:#963552"></span>Berry</button>
          </div>
          <div class="control-divider"></div>
          <legend class="secondary-legend"><span>Accent colour</span><strong data-current-accent>Navy</strong></legend>
          <div class="swatches compact" aria-label="Accent colour">
            <button type="button" class="selected"><span style="--swatch:#1c2945"></span>Navy</button>
            <button type="button"><span style="--swatch:#963552"></span>Berry</button>
            <button type="button"><span style="--swatch:#e9e4d8"></span>Cream</button>
          </div>
        </fieldset>

        <aside class="proof-column" aria-labelledby="proof-title">
          <div class="proof-heading"><span id="proof-title">Live sock proof</span><span>Visible proposal preview</span></div>
          <div class="proof-stage">
            <img src="/sock-cream.svg" alt="Cream custom sock preview" data-sock-preview />
            <span class="placeholder-mark" data-placeholder-mark>NORTH FORM</span>
          </div>
          <div class="proof-footer"><strong>Grip bottom — Standard dots + k.o.r.r.</strong><span>Molded silicone</span></div>
        </aside>
      </div>
    </section>
  </main>
`;

const adapter = new KorrhausReferenceAdapter(structuredClone(initialState));
const session = new ProposalSession(manifest, adapter);
const controller = new ProposalReviewController(manifest, session);
const reviewContainer = document.querySelector<HTMLElement>("#proposal-review");
const controls = document.querySelector<HTMLFieldSetElement>("[data-controls]");
const preview = document.querySelector<HTMLImageElement>("[data-sock-preview]");
const currentColour = document.querySelector<HTMLElement>("[data-current-colour]");
const currentAccent = document.querySelector<HTMLElement>("[data-current-accent]");
const placeholder = document.querySelector<HTMLElement>("[data-placeholder-mark]");
const persistenceAudit = document.querySelector<HTMLOutputElement>("[data-persistence-audit]");
if (!reviewContainer || !controls || !preview || !currentColour || !currentAccent || !placeholder || !persistenceAudit) {
  throw new Error("Reference configurator markup is incomplete");
}

let activeDesignId = "design-1";
const bodyLabels = new Map([["cream", "Cream"], ["navy", "Navy"], ["dusty-rose", "Dusty rose"]]);
const accentLabels = new Map([["navy", "Navy"], ["berry", "Berry"], ["cream", "Cream"]]);
const bodyAssets = new Map([["cream", "/sock-cream.svg"], ["navy", "/sock-navy.svg"], ["dusty-rose", "/sock-rose.svg"]]);
const accentColours = new Map([["navy", "#1c2945"], ["berry", "#963552"], ["cream", "#e9e4d8"]]);

const renderPreview = () => {
  const design = adapter.visibleState.designs.find((candidate) => candidate.id === activeDesignId) ?? adapter.visibleState.designs[0];
  if (!design) return;
  const body = String(design.selections["body.color"] ?? "cream");
  const accent = String(design.selections["accent.color"] ?? "navy");
  preview.src = bodyAssets.get(body) ?? "/sock-cream.svg";
  preview.alt = `${bodyLabels.get(body) ?? body} custom sock preview`;
  currentColour.textContent = bodyLabels.get(body) ?? body;
  currentAccent.textContent = accentLabels.get(accent) ?? accent;
  placeholder.style.color = accentColours.get(accent) ?? "#1c2945";
};

mountProposalReview(reviewContainer, controller, {
  formatSummary: ({ designCount, totalQuantity }) => `${designCount} ${designCount === 1 ? "design" : "designs"} · ${totalQuantity} pairs`,
});

controller.subscribe((state) => {
  controls.disabled = state.kind === "temporary" || state.kind === "busy" || state.kind === "invalidated" || state.kind === "commit-retry" || state.kind === "commit-uncertain";
  renderPreview();
  persistenceAudit.value = JSON.stringify(adapter.counters);
});

for (const tab of document.querySelectorAll<HTMLButtonElement>("[data-design-tab]")) {
  tab.addEventListener("click", () => {
    activeDesignId = tab.dataset.designTab ?? "design-1";
    for (const candidate of document.querySelectorAll<HTMLButtonElement>("[data-design-tab]")) {
      const selected = candidate === tab;
      candidate.classList.toggle("active", selected);
      candidate.setAttribute("aria-selected", String(selected));
    }
    const design = adapter.visibleState.designs.find((candidate) => candidate.id === activeDesignId);
    const nameInput = document.querySelector<HTMLInputElement>("[data-design-name]");
    if (design && nameInput) nameInput.value = design.name;
    renderPreview();
  });
}

for (const swatch of document.querySelectorAll<HTMLButtonElement>("[data-human-colour]")) {
  swatch.addEventListener("click", () => {
    const colour = swatch.dataset.humanColour;
    if (!colour) return;
    preview.src = bodyAssets.get(colour) ?? "/sock-cream.svg";
    currentColour.textContent = bodyLabels.get(colour) ?? colour;
    for (const candidate of document.querySelectorAll<HTMLButtonElement>("[data-human-colour]")) candidate.classList.toggle("selected", candidate === swatch);
  });
}

const registration = registerCoDesignTools(document as DocumentWithModelContext, { manifest, adapter, session });
void registration.ready;

renderPreview();

// Local visual-QA entry point only. Vite removes this branch from production builds.
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("agent-preview")) {
  void session.propose({
    baseRevision: adapter.committedState.revision,
    operationId: "local-visual-qa-proposal",
    changes: [
      { designId: "design-1", optionId: "body.color", value: "navy" },
      { designId: "design-1", optionId: "accent.color", value: "berry" },
      { designId: "design-2", optionId: "body.color", value: "dusty-rose" },
      { designId: "design-2", optionId: "accent.color", value: "berry" },
    ],
    assumptions: ["Logo will be added later."],
  }).then(renderPreview);
}
