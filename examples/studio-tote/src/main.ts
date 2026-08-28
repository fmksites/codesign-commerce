import {
  AssetSandbox,
  mountProposalReview,
  PreviewBridge,
  ProposalEngine,
  ProposalReviewController,
  registerCoDesignTools,
  reviewLocksHumanControls,
  type ConfigurationDesign,
  type ConfigurationState,
  type DocumentWithModelContext,
  type JsonPrimitive,
  type PreviewArtifactCandidate,
  type PreviewCaptureRequest,
} from "@codesign-commerce/core";
import { StudioToteAdapter, toteInitialState, toteManifest, type ToteSnapshot } from "./configurator";
import { syncRangeControl } from "./range-controls";
import {
  StudioToteAssetProofStore,
  type StudioToteResolvedAsset,
} from "./asset-proof";
import {
  PreviewProofError,
  type StudioTotePreviewArtifact,
  type StudioTotePreviewRequest,
} from "./preview-proof";
import { mountNativeAssetProof } from "./native-asset-proof";
import "./styles.css";

const publicAsset = (name: string): string => `${import.meta.env.BASE_URL}${name}`;

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Studio tote app root is missing");

app.innerHTML = `
  <div class="app-shell">
    <header class="site-header">
      <div class="brand-lockup"><strong>CoDesign Commerce</strong><span>Studio tote reference</span></div>
      <div class="header-status" data-save-tone="saved" role="status" aria-live="polite" aria-atomic="true"><span class="status-dot" aria-hidden="true"></span><span data-save-status>Saved in this browser only</span></div>
    </header>

    <main class="designer-layout" aria-label="Studio tote reference configurator">
      <aside class="inspector" aria-label="Design controls">
        <div class="inspector-title">
          <div><h1>Design your collection</h1><p>Every choice stays in the merchant's real visual workspace.</p></div>
          <div class="product-card"><button type="button" data-reset-design>Reset</button></div>
        </div>

        <nav class="section-nav" aria-label="Design control sections">
          <button class="active" type="button" data-step-target="collection">Collection</button>
          <button type="button" data-step-target="materials">Materials</button>
          <button type="button" data-step-target="branding">Branding</button>
          <button type="button" data-step-target="variants">Variants</button>
        </nav>

        <fieldset class="controls" data-human-controls>
          <section class="control-section" id="collection">
            <div class="section-heading"><strong>Collection</strong><span data-total-quantity>100 totes total</span></div>
            <label class="field-label">Variant name<input data-variant-name maxlength="60" /></label>
            <label class="field-label">Variant quantity<input type="number" min="25" max="5000" step="25" data-option="design.quantity" /></label>
          </section>

          <section class="control-section" id="materials">
            <div class="section-heading"><strong>Materials</strong><span>Merchant-valid choices</span></div>
            <span class="micro-label">Canvas weight</span>
            <div class="choice-grid weight-grid" data-choice-group="canvas.weight">
              <button type="button" data-option="canvas.weight" data-value="8oz"><b>8 oz</b><span>Light</span></button>
              <button type="button" data-option="canvas.weight" data-value="12oz"><b>12 oz</b><span>Heavy</span></button>
              <button type="button" data-option="canvas.weight" data-value="16oz"><b>16 oz</b><span>Extra</span></button>
            </div>
            <span class="micro-label">Bag colour</span>
            <div class="colour-grid" data-choice-group="bag.color">
              <button type="button" data-option="bag.color" data-value="natural"><i style="--colour:#e8dfd0"></i><span>Natural</span></button>
              <button type="button" data-option="bag.color" data-value="charcoal"><i style="--colour:#262927"></i><span>Charcoal</span></button>
            </div>
            <span class="micro-label">Handle length</span>
            <div class="choice-grid handle-grid" data-choice-group="handles.length">
              <button type="button" data-option="handles.length" data-value="short"><b>Short</b><span>33 cm</span></button>
              <button type="button" data-option="handles.length" data-value="long"><b>Long</b><span>66 cm</span></button>
            </div>
            <label class="check-row"><input type="checkbox" data-option="construction.reinforced" />Reinforced cross-stitch</label>
          </section>

          <section class="control-section" id="branding">
            <div class="section-heading"><strong>Branding</strong><span>Text or supplied artwork</span></div>
            <label class="field-label">Studio name<input data-option="branding.text" maxlength="32" /></label>
            <label class="field-label">Typography<select data-option="branding.typeface"><option value="grotesk">Grotesk bold</option><option value="editorial">Editorial serif</option><option value="mono">Studio mono</option></select></label>
            <div class="artwork-control">
              <div><span class="micro-label">Artwork file</span><strong data-artwork-name>Use studio-name typography</strong></div>
              <div class="artwork-actions"><label class="file-action">Choose<input type="file" accept="image/png,image/jpeg,image/webp" data-artwork-file /></label><button type="button" data-artwork-remove hidden>Remove</button></div>
            </div>
            <label class="field-label">Print method<select data-option="print.method"><option value="screen-1">Screen print · 1 colour</option><option value="screen-2">Screen print · 2 colours</option><option value="embroidery">Embroidery</option></select></label>
            <label class="field-label">Placement<select data-option="print.position"><option value="front-center">Front center</option><option value="upper-left">Upper left</option></select></label>
            <span class="micro-label">Artwork colour</span>
            <div class="ink-grid" data-choice-group="branding.ink_color">
              <button type="button" aria-label="Ink black" data-option="branding.ink_color" data-value="ink" style="--ink:#1c222b"></button>
              <button type="button" aria-label="Studio blue" data-option="branding.ink_color" data-value="cobalt" style="--ink:#1d56d8"></button>
              <button type="button" aria-label="Canvas white" data-option="branding.ink_color" data-value="canvas" style="--ink:#f5f1e8"></button>
            </div>
            <label class="range-field"><span>Scale <output data-scale-output>100%</output></span><input type="range" min="0.5" max="1.4" step="0.01" aria-label="Artwork scale" data-option="branding.scale" /></label>
            <label class="range-field"><span>Rotation <output data-rotation-output>0°</output></span><input type="range" min="-30" max="30" step="1" aria-label="Artwork rotation" data-option="branding.rotation" /></label>
          </section>

          <section class="control-section variant-section" id="variants">
            <div class="section-heading"><strong>Variants</strong><span>Up to three</span></div>
            <div class="variant-list" role="tablist" aria-label="Tote variants" data-variant-tabs></div>
          </section>
        </fieldset>
      </aside>

      <section class="canvas-column" aria-labelledby="canvas-title">
        <div class="mobile-variant-tabs" role="tablist" aria-label="Mobile tote variants" data-mobile-variant-tabs></div>
        <div class="canvas-toolbar"><div><span>Live product canvas</span><strong id="canvas-title" data-canvas-title>North Form Natural</strong></div><span data-canvas-mode>Human editing</span></div>
        <div class="proof-stage">
          <img src="${publicAsset("tote-natural-long.png")}" alt="Natural canvas studio tote with long handles" data-tote-preview />
          <span class="print-mark" data-print-mark>NORTH FORM</span>
          <img class="artwork-mark" data-artwork-mark alt="" hidden />
        </div>
        <div class="canvas-footer"><span>Front</span><span data-canvas-spec>Natural · 12 oz · long handles</span><span>100%</span></div>
        <output data-persistence-audit hidden aria-hidden="true"></output>
        <output data-asset-audit hidden aria-hidden="true"></output>
      </section>

      <aside class="review-rail" aria-label="Proposal and preview review">
        <section class="reload-notice" data-reload-notice role="status" aria-live="polite" hidden>
          <strong>Previous proposal was not saved</strong>
          <p>The temporary agent preview ended when this page reloaded. Ask the agent to recreate it before choosing Keep.</p>
        </section>
        <section class="progress-panel" data-proposal-progress hidden>
          <div class="rail-heading"><strong>Proposal progress</strong><span data-progress-count>1 of 3</span></div>
          <ol><li data-pass="foundation"><i></i><span>Foundation</span></li><li data-pass="branding"><i></i><span>Branding</span></li><li data-pass="variants"><i></i><span>Variants</span></li></ol>
        </section>
        <div id="proposal-review" class="proposal-slot"></div>
        <section class="preview-panel">
          <div class="rail-heading"><strong>Variant previews</strong><span data-preview-count>1 design</span></div>
          <div class="preview-list" data-variant-previews></div>
        </section>
        <section class="readiness-panel">
          <div class="readiness-icon" aria-hidden="true">!</div>
          <div><strong>Production readiness</strong><p class="production-note"><span>Final print artwork is still required.</span></p></div>
        </section>
        <p class="review-boundary">Agent work stays temporary. Keep is the only save boundary; Revert restores the previous design.</p>
      </aside>
    </main>
  </div>
`;

const STORAGE_KEY = "codesign-studio-tote";
const PENDING_PROPOSAL_KEY = "codesign-studio-tote-pending-proposal";
const query = new URLSearchParams(window.location.search);
const resetRequested = query.has("reset");
if (resetRequested) {
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(PENDING_PROPOSAL_KEY);
  query.delete("reset");
  const cleanUrl = new URL(window.location.href);
  cleanUrl.search = query.toString();
  window.history.replaceState(null, "", cleanUrl);
}

const parseStoredDraft = (value: string | null): { state: ConfigurationState; assets: unknown } | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    const record = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
    const candidate = record && "state" in record ? record.state : parsed;
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) return null;
    const state = candidate as Partial<ConfigurationState>;
    if (typeof state.revision !== "string"
      || typeof state.activeDesignId !== "string"
      || !Array.isArray(state.designs)
      || typeof state.order !== "object"
      || state.order === null
      || !state.designs.every((design) => typeof design === "object"
        && design !== null
        && "selections" in design
        && typeof design.selections === "object"
        && design.selections !== null
        && "assets" in design
        && Array.isArray(design.assets))) return null;
    return { state: candidate as ConfigurationState, assets: record?.assets ?? [] };
  } catch {
    return null;
  }
};

const storedDraft = parseStoredDraft(window.localStorage.getItem(STORAGE_KEY));
let seed = structuredClone(toteInitialState);
let committedAssets: unknown = [];
if (storedDraft) {
  seed = storedDraft.state;
  committedAssets = storedDraft.assets;
}
let interruptedProposal = !resetRequested && window.sessionStorage.getItem(PENDING_PROPOSAL_KEY) === "true";
let onDraftPersisted = (): void => {};
const assetStore = new StudioToteAssetProofStore(committedAssets);
const adapter = new StudioToteAdapter(seed, (state) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    state,
    assets: assetStore.exportCommitted(),
  }));
  onDraftPersisted();
}, assetStore);
assetStore.setBaseRevisionProvider(() => adapter.committedState.revision);
let engine: ProposalEngine<ToteSnapshot, StudioToteResolvedAsset>;
let controller: ProposalReviewController<ToteSnapshot, StudioToteResolvedAsset>;

const reviewContainer = document.querySelector<HTMLElement>("#proposal-review");
const tabs = document.querySelector<HTMLElement>("[data-variant-tabs]");
const nameInput = document.querySelector<HTMLInputElement>("[data-variant-name]");
const saveStatus = document.querySelector<HTMLElement>("[data-save-status]");
const preview = document.querySelector<HTMLImageElement>("[data-tote-preview]");
const mark = document.querySelector<HTMLElement>("[data-print-mark]");
const artworkMark = document.querySelector<HTMLImageElement>("[data-artwork-mark]");
const controls = document.querySelector<HTMLFieldSetElement>("[data-human-controls]");
const audit = document.querySelector<HTMLOutputElement>("[data-persistence-audit]");
const assetAudit = document.querySelector<HTMLOutputElement>("[data-asset-audit]");
const productionNote = document.querySelector<HTMLElement>(".production-note span");
const totalQuantity = document.querySelector<HTMLElement>("[data-total-quantity]");
const canvasTitle = document.querySelector<HTMLElement>("[data-canvas-title]");
const canvasMode = document.querySelector<HTMLElement>("[data-canvas-mode]");
const canvasSpec = document.querySelector<HTMLElement>("[data-canvas-spec]");
const progressPanel = document.querySelector<HTMLElement>("[data-proposal-progress]");
const progressCount = document.querySelector<HTMLElement>("[data-progress-count]");
const previewList = document.querySelector<HTMLElement>("[data-variant-previews]");
const previewCount = document.querySelector<HTMLElement>("[data-preview-count]");
const mobileTabs = document.querySelector<HTMLElement>("[data-mobile-variant-tabs]");
const artworkName = document.querySelector<HTMLElement>("[data-artwork-name]");
const artworkFile = document.querySelector<HTMLInputElement>("[data-artwork-file]");
const artworkRemove = document.querySelector<HTMLButtonElement>("[data-artwork-remove]");
const scaleOutput = document.querySelector<HTMLOutputElement>("[data-scale-output]");
const rotationOutput = document.querySelector<HTMLOutputElement>("[data-rotation-output]");
const resetButton = document.querySelector<HTMLButtonElement>("[data-reset-design]");
const reloadNotice = document.querySelector<HTMLElement>("[data-reload-notice]");
const headerStatus = saveStatus?.closest<HTMLElement>(".header-status");
if (!reviewContainer || !tabs || !nameInput || !saveStatus || !headerStatus || !preview || !mark || !artworkMark || !controls || !audit || !assetAudit || !productionNote || !totalQuantity || !canvasTitle || !canvasMode || !canvasSpec || !progressPanel || !progressCount || !previewList || !previewCount || !mobileTabs || !artworkName || !artworkFile || !artworkRemove || !scaleOutput || !rotationOutput || !resetButton || !reloadNotice) {
  throw new Error("Studio tote configurator markup is incomplete");
}

const setSaveStatus = (message: string, tone: "saved" | "temporary" | "stale"): void => {
  saveStatus.textContent = message;
  headerStatus.dataset.saveTone = tone;
};

const clearInterruptedProposalNotice = (): void => {
  interruptedProposal = false;
  window.sessionStorage.removeItem(PENDING_PROPOSAL_KEY);
  reloadNotice.hidden = true;
};
onDraftPersisted = clearInterruptedProposalNotice;
reloadNotice.hidden = !interruptedProposal;
if (interruptedProposal) setSaveStatus("Previous temporary proposal was not saved", "temporary");

let activeDesignId = adapter.visibleState.activeDesignId;

const activeDesign = (): ConfigurationDesign => {
  const state = adapter.visibleState;
  return state.designs.find((design) => design.id === activeDesignId) ?? state.designs[0]!;
};

const selection = (design: ConfigurationDesign, optionId: string, fallback: JsonPrimitive): JsonPrimitive =>
  design.selections[optionId] ?? fallback;

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
};

const capturePreviewProof = async (
  request: StudioTotePreviewRequest,
): Promise<StudioTotePreviewArtifact> => {
  const proposal = engine.snapshot;
  if (request.proposalId !== undefined && request.proposalId !== proposal.proposalId) {
    throw new PreviewProofError("PREVIEW_STALE", "The requested proposal is no longer current.");
  }
  if (request.proposalRevision !== undefined && request.proposalRevision !== proposal.proposalRevision) {
    throw new PreviewProofError("PREVIEW_STALE", "The requested proposal revision is no longer current.");
  }

  const state = adapter.visibleState;
  const design = state.designs.find((candidate) => candidate.id === (request.variantId ?? activeDesignId));
  if (!design) throw new PreviewProofError("UNKNOWN_TARGET", "The requested tote variant is not visible.");
  if (design.id !== activeDesignId) {
    activeDesignId = design.id;
    render();
  }

  if (!preview.complete || preview.naturalWidth === 0) await preview.decode();
  const width = 640;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new PreviewProofError("PREVIEW_FAILED", "The browser could not create a tote preview canvas.");

  context.fillStyle = "#f5f1e9";
  context.fillRect(0, 0, width, height);
  context.filter = getComputedStyle(preview).filter || "none";
  context.drawImage(preview, 0, 0, width, height);
  context.filter = "none";

  const upperLeft = selection(design, "print.position", "front-center") === "upper-left";
  const artwork = assetStore.resolve(selection(design, "branding.artwork_ref", null));
  const scale = Number(selection(design, "branding.scale", 1));
  const rotation = Number(selection(design, "branding.rotation", 0));
  const typeface = String(selection(design, "branding.typeface", "grotesk"));
  context.fillStyle = inkColour(design);
  const markX = upperLeft ? 250 : 320;
  const markY = upperLeft ? 300 : 360;
  context.save();
  context.translate(markX, markY);
  context.rotate(rotation * Math.PI / 180);
  if (artwork) {
    if (!artworkMark.complete || artworkMark.naturalWidth === 0) await artworkMark.decode();
    const artworkSize = (upperLeft ? 170 : 210) * scale;
    const artworkCanvas = document.createElement("canvas");
    artworkCanvas.width = Math.max(1, Math.round(artworkSize));
    artworkCanvas.height = Math.max(1, Math.round(artworkSize));
    const artworkContext = artworkCanvas.getContext("2d");
    if (!artworkContext) throw new PreviewProofError("PREVIEW_FAILED", "The browser could not prepare the artwork layer.");
    artworkContext.drawImage(artworkMark, 0, 0, artworkCanvas.width, artworkCanvas.height);
    artworkContext.globalCompositeOperation = "source-in";
    artworkContext.fillStyle = inkColour(design);
    artworkContext.fillRect(0, 0, artworkCanvas.width, artworkCanvas.height);
    context.drawImage(artworkCanvas, -artworkSize / 2, -artworkSize / 2, artworkSize, artworkSize);
  } else {
    const fontFamily = typeface === "editorial" ? "Georgia, serif" : typeface === "mono" ? "monospace" : "Arial, sans-serif";
    context.font = `${typeface === "editorial" ? "600" : "700"} ${Math.round(30 * scale)}px ${fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const words = String(selection(design, "branding.text", "STUDIO NAME")).trim().split(/\s+/u);
    const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : words;
    const lineHeight = 36 * scale;
    lines.forEach((line, index) => context.fillText(line, 0, (index - (lines.length - 1) / 2) * lineHeight));
  }
  context.restore();

  const dataUrl = canvas.toDataURL("image/webp", 0.82);
  if (!dataUrl.startsWith("data:image/webp;base64,") || dataUrl.length > 400_000) {
    throw new PreviewProofError("PREVIEW_FAILED", "The tote preview exceeded the bounded inline transport.");
  }
  const integrity = await sha256(dataUrl);
  const identity = proposal.proposalId === null
    ? `committed-${state.revision}`
    : `${proposal.proposalId}-${proposal.proposalRevision}`;
  return {
    artifactId: `preview-${identity}-${design.id}`,
    proposalId: proposal.proposalId,
    proposalRevision: proposal.proposalId === null ? null : proposal.proposalRevision,
    workspaceRevision: state.revision,
    variantId: design.id,
    mediaType: "image/webp",
    width,
    height,
    altText: `${preview.alt}; ${design.name}; ${artwork ? artwork.altText : "studio-name typography"}; temporary proposal ${proposal.proposalId === null ? "not active" : "active"}`,
    integrity,
    transport: { kind: "data-url", value: dataUrl },
  };
};

const assetSandbox = new AssetSandbox(toteManifest, assetStore);
const previewBridge = new PreviewBridge<StudioToteResolvedAsset>(toteManifest, {
  async capturePreviews(request: PreviewCaptureRequest, assets): Promise<PreviewArtifactCandidate[]> {
    assetStore.setProposalAssetResolver(assets);
    render(true);
    const variantIds = request.variantIds ?? [adapter.visibleState.activeDesignId];
    const surfaceId = request.surfaceIds?.[0] ?? "product-preview";
    const results: PreviewArtifactCandidate[] = [];
    for (const variantId of variantIds) {
      const artifact = await capturePreviewProof({ proposalId: request.proposalId, proposalRevision: request.proposalRevision, variantId });
      results.push({
        variantId: artifact.variantId,
        surfaceId,
        mediaType: artifact.mediaType,
        width: artifact.width,
        height: artifact.height,
        altText: artifact.altText,
        transport: artifact.transport,
      });
    }
    return results;
  },
});
engine = new ProposalEngine(toteManifest, adapter, { assetSandbox, previewBridge });
controller = new ProposalReviewController(toteManifest, engine);

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
    const tabName = document.createElement("span");
    tabName.textContent = design.name;
    const tabQuantity = document.createElement("small");
    tabQuantity.textContent = `${design.quantity} totes`;
    tab.append(tabName, tabQuantity);
    tab.addEventListener("click", () => {
      activeDesignId = design.id;
      if (engine.status === "idle") adapter.setHumanActiveVariant(design.id);
      render();
    });
    tabs.append(tab);
  }
  const add = document.createElement("button");
  add.type = "button";
  add.className = "add-variant";
  add.setAttribute("aria-label", "Add tote variant");
  add.textContent = "+ Duplicate active variant";
  const source = state.designs.find((design) => design.id === activeDesignId);
  add.disabled = engine.status !== "idle" || state.designs.length >= toteManifest.variantPolicy.maximumVariants || (source?.quantity ?? 0) < 50;
  if ((source?.quantity ?? 0) < 50) add.title = "A variant needs at least 50 totes before it can be split into two valid variants.";
  add.addEventListener("click", () => {
    const created = adapter.addHumanVariant(activeDesignId);
    if (created) { activeDesignId = created; render(); }
  });
  tabs.append(add);
};

const toteAssetFor = (design: ConfigurationDesign): { src: string; filtered: boolean } => {
  const colour = String(selection(design, "bag.color", "natural"));
  const handles = String(selection(design, "handles.length", "long"));
  return {
    src: handles === "short"
      ? publicAsset("tote-natural-short.png")
      : colour === "charcoal" ? publicAsset("tote-charcoal-long.png") : publicAsset("tote-natural-long.png"),
    filtered: colour === "charcoal" && handles === "short",
  };
};

const inkColour = (design: ConfigurationDesign): string => {
  const colour = String(selection(design, "branding.ink_color", "ink"));
  return colour === "cobalt" ? "#1d56d8" : colour === "canvas" ? "#f5f1e8" : "#1c222b";
};

const renderVariantPreviews = (state: ConfigurationState): void => {
  previewList.replaceChildren();
  previewCount.textContent = `${state.designs.length} ${state.designs.length === 1 ? "design" : "designs"}`;
  for (const design of state.designs) {
    const asset = toteAssetFor(design);
    const artwork = assetStore.resolve(selection(design, "branding.artwork_ref", null));
    const button = document.createElement("button");
    button.type = "button";
    button.className = `preview-card${design.id === activeDesignId ? " active" : ""}`;
    button.setAttribute("aria-label", `Show ${design.name}`);
    const visual = document.createElement("span");
    visual.className = "preview-card-visual";
    const image = document.createElement("img");
    image.src = asset.src;
    image.alt = "";
    image.classList.toggle("filtered-charcoal", asset.filtered);
    visual.append(image);
    if (artwork) {
      const art = document.createElement("img");
      art.src = artwork.dataUrl;
      art.alt = "";
      art.className = "preview-card-art";
      art.dataset.ink = String(selection(design, "branding.ink_color", "ink"));
      visual.append(art);
    } else {
      const text = document.createElement("i");
      text.textContent = String(selection(design, "branding.text", "STUDIO NAME"));
      text.style.color = inkColour(design);
      visual.append(text);
    }
    const copy = document.createElement("span");
    copy.className = "preview-card-copy";
    const title = document.createElement("strong");
    title.textContent = design.name;
    const meta = document.createElement("small");
    meta.textContent = `${design.quantity} totes · ${String(selection(design, "bag.color", "natural"))}`;
    copy.append(title, meta);
    button.append(visual, copy);
    button.addEventListener("click", () => {
      activeDesignId = design.id;
      if (engine.status === "idle") adapter.setHumanActiveVariant(design.id);
      render();
    });
    previewList.append(button);
  }
};

const renderMobileVariantTabs = (state: ConfigurationState): void => {
  mobileTabs.replaceChildren();
  for (const design of state.designs) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(design.id === activeDesignId));
    button.classList.toggle("active", design.id === activeDesignId);
    button.textContent = design.name;
    button.addEventListener("click", () => {
      activeDesignId = design.id;
      if (engine.status === "idle") adapter.setHumanActiveVariant(design.id);
      render();
    });
    mobileTabs.append(button);
  }
};

const renderProgress = (): void => {
  const proposal = engine.snapshot;
  const active = proposal.proposalId !== null;
  progressPanel.hidden = !active;
  canvasMode.textContent = active ? "Agent proposal · not saved" : "Human editing";
  if (!active) return;
  const completed = proposal.previewStatus === "available" ? 3 : Math.min(3, Math.max(1, proposal.proposalRevision));
  progressCount.textContent = proposal.previewStatus === "available" ? "Preview ready" : `${completed} of 3`;
  const passes = [...progressPanel.querySelectorAll<HTMLElement>("[data-pass]")];
  passes.forEach((pass, index) => {
    pass.classList.toggle("complete", index < completed);
    pass.classList.toggle("active", index === completed && completed < 3);
  });
};

const render = (followVisible = false) => {
  renderTabs(followVisible);
  const design = activeDesign();
  const colour = String(selection(design, "bag.color", "natural"));
  const handles = String(selection(design, "handles.length", "long"));
  const toteAsset = toteAssetFor(design);
  preview.src = toteAsset.src;
  preview.classList.toggle("filtered-charcoal", toteAsset.filtered);
  preview.alt = `${colour === "charcoal" ? "Charcoal" : "Natural"} canvas studio tote with ${handles} handles`;
  const upperLeft = selection(design, "print.position", "front-center") === "upper-left";
  const artwork = assetStore.resolve(selection(design, "branding.artwork_ref", null));
  const scale = Number(selection(design, "branding.scale", 1));
  const rotation = Number(selection(design, "branding.rotation", 0));
  const typeface = String(selection(design, "branding.typeface", "grotesk"));
  const transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
  mark.hidden = artwork !== null;
  artworkMark.hidden = artwork === null;
  mark.textContent = String(selection(design, "branding.text", "STUDIO NAME"));
  mark.dataset.typeface = typeface;
  mark.style.color = inkColour(design);
  mark.style.transform = transform;
  artworkMark.style.transform = transform;
  if (artwork) {
    artworkMark.src = artwork.dataUrl;
    artworkMark.alt = artwork.altText;
    artworkMark.dataset.ink = String(selection(design, "branding.ink_color", "ink"));
  } else {
    artworkMark.removeAttribute("src");
    artworkMark.alt = "";
    delete artworkMark.dataset.ink;
  }
  mark.classList.toggle("upper-left", upperLeft);
  mark.classList.toggle("light", colour === "charcoal");
  artworkMark.classList.toggle("upper-left", upperLeft);
  const validation = adapter.validateVisibleState();
  const blockingMessages = validation.issues
    .filter((issue) => issue.severity === "constraint-error")
    .map((issue) => issue.message);
  productionNote.textContent = blockingMessages.length > 0
    ? blockingMessages.join(". ")
    : artwork
      ? "Artwork is attached and ready for review."
      : "Studio-name typography is shown; production artwork can be supplied later.";
  artworkName.textContent = artwork?.filename ?? (artwork ? "Supplied artwork" : "Use studio-name typography");
  artworkRemove.hidden = artwork === null;
  nameInput.value = design.name;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-option][data-value]")) {
    button.classList.toggle("selected", selection(design, button.dataset.option ?? "", "") === button.dataset.value);
  }
  for (const control of document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("select[data-option], input[data-option]")) {
    const optionId = control.dataset.option ?? "";
    const value = optionId === "design.quantity" ? design.quantity : selection(design, optionId, false);
    if (control instanceof HTMLInputElement && control.type === "checkbox") control.checked = value === true;
    else if (control instanceof HTMLInputElement && control.type === "range") syncRangeControl(control, optionId, value);
    else control.value = String(value);
  }
  scaleOutput.value = `${Math.round(scale * 100)}%`;
  rotationOutput.value = `${rotation}°`;
  totalQuantity.textContent = `${adapter.visibleState.order.totalQuantity} totes total`;
  canvasTitle.textContent = design.name;
  canvasSpec.textContent = `${colour === "charcoal" ? "Charcoal" : "Natural"} · ${String(selection(design, "canvas.weight", "12oz")).replace("oz", " oz")} · ${handles} handles`;
  renderVariantPreviews(adapter.visibleState);
  renderMobileVariantTabs(adapter.visibleState);
  renderProgress();
  audit.value = JSON.stringify(adapter.counters);
  assetAudit.value = JSON.stringify(assetStore.counters);
};

mountProposalReview(reviewContainer, controller, {
  formatSummary: ({ variantCount, activeVariantName }) => `${variantCount} ${variantCount === 1 ? "variant" : "variants"} · ${activeVariantName} · ${adapter.visibleState.order.totalQuantity} totes`,
});

controller.subscribe((state) => {
  const locked = reviewLocksHumanControls(state);
  for (const control of controls.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>("button, input, select")) control.disabled = locked;
  nameInput.disabled = locked;
  resetButton.disabled = locked;
  if (["temporary", "busy", "stale", "commit-retry", "commit-uncertain"].includes(state.kind)) {
    interruptedProposal = true;
    window.sessionStorage.setItem(PENDING_PROPOSAL_KEY, "true");
    reloadNotice.hidden = true;
    setSaveStatus(state.kind === "stale" ? "Proposal expired · not saved" : "Temporary proposal not saved", state.kind === "stale" ? "stale" : "temporary");
  } else if (["committed", "reverted"].includes(state.kind)) {
    clearInterruptedProposalNotice();
    setSaveStatus(state.kind === "committed" ? "Proposal kept on this device" : "Proposal reverted · draft unchanged", "saved");
  } else if (!interruptedProposal) {
    setSaveStatus("Saved in this browser only", "saved");
  }
  if (state.kind === "reverted") assetStore.releaseTemporary();
  render(true);
});
window.addEventListener("pagehide", () => assetStore.releaseTemporary(), { once: true });

window.addEventListener("storage", (event) => {
  if (event.storageArea !== window.localStorage || event.key !== STORAGE_KEY) return;
  const external = event.newValue === null
    ? { state: structuredClone(toteInitialState), assets: [] as unknown }
    : parseStoredDraft(event.newValue);
  if (!external) return;
  assetStore.replaceCommitted(external.assets);
  let externalState = external.state;
  const currentState = adapter.committedState;
  if (externalState.revision === currentState.revision && JSON.stringify(externalState) !== JSON.stringify(currentState)) {
    externalState = { ...structuredClone(externalState), revision: `tote-revision-${Date.now()}` };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      state: externalState,
      assets: assetStore.exportCommitted(),
    }));
  }
  if (!adapter.synchronizeExternalState(externalState)) return;
  activeDesignId = adapter.visibleState.activeDesignId;
  reloadNotice.hidden = true;
  setSaveStatus(
    engine.status === "stale" ? "Proposal expired after another tab changed the draft" : "Draft updated in another tab",
    engine.status === "stale" ? "stale" : "saved",
  );
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
    if (control instanceof HTMLInputElement && (control.type === "number" || control.type === "range")) value = Number(control.value);
    if (adapter.applyHumanChange(activeDesignId, optionId, value)) render();
  });
}

nameInput.addEventListener("change", () => {
  if (adapter.applyHumanChange(activeDesignId, "design.name", nameInput.value.trim() || "Untitled tote")) render();
});

const fileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Artwork could not be read.")), { once: true });
  reader.addEventListener("error", () => reject(new Error("Artwork could not be read.")), { once: true });
  reader.readAsDataURL(file);
});

artworkFile.addEventListener("change", () => {
  void (async () => {
    const file = artworkFile.files?.[0];
    if (!file) return;
    artworkFile.disabled = true;
    artworkName.textContent = "Checking artwork…";
    try {
      const imported = await adapter.applyHumanArtwork(activeDesignId, {
        slotId: "print-artwork",
        source: { kind: "data-url", data: await fileAsDataUrl(file) },
        filename: file.name.slice(0, 120),
        altText: `${activeDesign().name} supplied artwork`,
      });
      if (!imported) throw new Error("Artwork could not be attached to this variant.");
      render();
    } catch (error) {
      artworkName.textContent = error instanceof Error ? error.message : "Artwork could not be attached.";
    } finally {
      artworkFile.value = "";
      artworkFile.disabled = false;
    }
  })();
});

artworkRemove.addEventListener("click", () => {
  if (adapter.removeHumanArtwork(activeDesignId)) render();
});

resetButton.addEventListener("click", () => {
  window.localStorage.removeItem(STORAGE_KEY);
  clearInterruptedProposalNotice();
  const url = new URL(window.location.href);
  url.searchParams.set("reset", "true");
  window.location.assign(url);
});

for (const step of document.querySelectorAll<HTMLButtonElement>("[data-step-target]")) {
  step.addEventListener("click", () => {
    for (const candidate of document.querySelectorAll<HTMLButtonElement>("[data-step-target]")) {
      candidate.classList.toggle("active", candidate === step);
    }
    document.getElementById(step.dataset.stepTarget ?? "")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const webMcpDocument = import.meta.env.DEV && query.has("disable-webmcp")
  ? {} as DocumentWithModelContext
  : document as DocumentWithModelContext;
const registration = registerCoDesignTools(webMcpDocument, { engine });
const allToolsReady = registration.ready;
void allToolsReady;
if (import.meta.env.DEV) document.documentElement.dataset.webmcpRegistration = registration.supported ? "supported" : "unsupported";
window.addEventListener("pagehide", () => {
  registration.unregister();
  controller.destroy();
}, { once: true });

render();

if (import.meta.env.DEV && query.has("native-asset-proof")) {
  const parent = document.querySelector<HTMLElement>("main");
  if (!parent) throw new Error("Native asset proof parent is missing");
  mountNativeAssetProof({
    document: document as Document & DocumentWithModelContext,
    parent,
    adapter,
    assetStore,
    ready: allToolsReady,
    fixtureUrl: publicAsset("north-form-supplied-mark.png"),
  });
}

if (import.meta.env.DEV && query.has("native-webmcp-proof")) {
  const proof = document.createElement("section");
  proof.setAttribute("aria-label", "Native Chrome WebMCP proof");
  proof.style.cssText = "max-width:1180px;margin:0 auto 32px;padding:20px;border:2px solid #20201d;background:#fff";
  proof.innerHTML = `
    <h2 style="margin:0 0 8px">Native Chrome WebMCP proof</h2>
    <p>This development-only panel calls <code>document.modelContext.getTools()</code> and <code>executeTool()</code>. It creates a temporary proposal and never activates Keep.</p>
    <button type="button" data-native-webmcp-run>Run native WebMCP proof</button>
    <pre data-native-webmcp-result style="white-space:pre-wrap"></pre>
    <img data-native-webmcp-preview alt="Native WebMCP tote preview" style="display:none;max-width:360px;width:100%;height:auto" />
  `;
  document.querySelector("main")?.append(proof);

  const runButton = proof.querySelector<HTMLButtonElement>("[data-native-webmcp-run]");
  const resultNode = proof.querySelector<HTMLElement>("[data-native-webmcp-result]");
  const proofImage = proof.querySelector<HTMLImageElement>("[data-native-webmcp-preview]");
  if (!runButton || !resultNode || !proofImage) throw new Error("Native WebMCP proof panel is incomplete");

  const asRecord = (value: unknown): Record<string, unknown> => {
    if (typeof value === "string") {
      try { return JSON.parse(value) as Record<string, unknown>; } catch { return { raw: value }; }
    }
    return typeof value === "object" && value !== null ? value as Record<string, unknown> : { raw: value };
  };

  runButton.addEventListener("click", () => {
    void (async () => {
      runButton.disabled = true;
      resultNode.textContent = "Discovering native tools…";
      proof.dataset.status = "running";
      try {
        await registration.ready;
        const modelContext = (document as DocumentWithModelContext & {
          modelContext?: {
            getTools(): Promise<Array<{ name: string }>>;
            executeTool(tool: { name: string }, input: unknown): Promise<unknown>;
          };
        }).modelContext;
        if (!modelContext?.getTools || !modelContext.executeTool) throw new Error("document.modelContext invocation APIs are unavailable");

        const tools = await modelContext.getTools();
        const findTool = (name: string) => {
          const tool = tools.find((candidate) => candidate.name === name);
          if (!tool) throw new Error(`Native Chrome did not discover ${name}`);
          return tool;
        };
        const executeTool = async (tool: { name: string }, input: unknown) => {
          try { return await modelContext.executeTool(tool, input); }
          catch (error) {
            if (typeof input !== "string") return modelContext.executeTool(tool, JSON.stringify(input));
            throw error;
          }
        };
        const read = asRecord(await executeTool(findTool("codesign_read_workspace"), {}));
        const state = asRecord(read.workspace);
        const baseRevision = state.committedRevision;
        if (typeof baseRevision !== "string") throw new Error("Native configuration read returned no revision");

        const proposal = asRecord(await executeTool(
          findTool("codesign_apply_proposal"),
          {
            baseRevision,
            operationId: "chrome-native-preview-proof",
            operations: [
              { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "design.name", value: "Chrome native proof" },
              { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "bag.color", value: "charcoal" },
              { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "print.position", value: "upper-left" },
            ],
            assumptions: ["This is a temporary native Chrome feasibility proof."],
          },
        ));
        if (proposal.ok !== true || typeof proposal.proposalId !== "string" || typeof proposal.proposalRevision !== "number") {
          throw new Error(`Native proposal failed: ${JSON.stringify(proposal)}`);
        }

        const previewResult = asRecord(await executeTool(
          findTool("codesign_get_previews"),
          { proposalId: proposal.proposalId, proposalRevision: proposal.proposalRevision, baseRevision, variantIds: ["tote-1"], surfaceIds: ["product-preview"] },
        ));
        const artifacts = Array.isArray(previewResult.artifacts) ? previewResult.artifacts : [];
        const artifact = asRecord(artifacts[0]);
        const transport = asRecord(artifact.transport);
        if (previewResult.ok !== true || transport.kind !== "data-url" || typeof transport.value !== "string") {
          throw new Error(`Native preview failed: ${JSON.stringify(previewResult)}`);
        }

        proofImage.src = transport.value;
        proofImage.style.display = "block";
        const evidence = {
          api: "document.modelContext",
          userAgent: window.navigator.userAgent,
          discoveredTools: tools.map((tool) => tool.name).sort(),
          proposalId: proposal.proposalId,
          proposalRevision: proposal.proposalRevision,
          persisted: proposal.persisted,
          preview: {
            artifactId: artifact.artifactId,
            mediaType: artifact.mediaType,
            width: artifact.width,
            height: artifact.height,
            integrity: artifact.integrity,
            dataUrlCharacters: transport.value.length,
          },
          persistenceCounters: adapter.counters,
        };
        resultNode.textContent = JSON.stringify(evidence, null, 2);
        proof.dataset.status = "passed";
      } catch (error) {
        proof.dataset.status = "failed";
        resultNode.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        runButton.disabled = false;
      }
    })();
  });
}

if (import.meta.env.DEV && query.has("agent-preview")) {
  void (async () => {
    const first = await engine.apply({
      baseRevision: adapter.committedState.revision,
      operationId: "tote-visual-foundation",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "design.name", value: "North Form Natural" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "canvas.weight", value: "12oz" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "bag.color", value: "natural" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "handles.length", value: "long" },
      ],
      assumptions: ["Use the merchant's 12 oz canvas and reinforced long-handle construction."],
    });
    if (!first.ok) return;
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const artworkResponse = await fetch(publicAsset("north-form-supplied-mark.png"));
    const artworkFile = new File([await artworkResponse.blob()], "north-form-supplied-mark.png", { type: "image/png" });
    const staged = await engine.stageAsset({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      slotId: "print-artwork",
      source: { kind: "data-url", data: await fileAsDataUrl(artworkFile) },
      filename: artworkFile.name,
      altText: "North Form supplied geometric mark",
    });
    if (!staged.ok) return;
    const branded = await engine.apply({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "tote-visual-branding",
      operations: [
        { type: "attach-asset", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.artwork_ref", assetHandle: staged.asset.assetHandle },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.text", value: "NORTH FORM" },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.scale", value: 1.05 },
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "branding.rotation", value: 0 },
      ],
      assumptions: ["Apply the supplied artwork as the collection's shared front mark."],
    });
    if (!branded.ok) return;
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const variants = await engine.apply({
      baseRevision: branded.baseRevision,
      proposalId: branded.proposalId,
      proposalRevision: branded.proposalRevision,
      operationId: "tote-visual-variants",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "tote-1" }, controlId: "design.quantity", value: 50 },
        { type: "duplicate-variant", sourceVariantId: "tote-1", variantId: "tote-2", name: "North Form Charcoal", initialControls: { "design.quantity": 50, "bag.color": "charcoal", "handles.length": "short", "print.position": "upper-left", "branding.scale": .82, "branding.rotation": -6 } },
      ],
      assumptions: ["Split the 100-tote collection evenly across two visibly distinct variants."],
    });
    if (!variants.ok) return;
    await engine.capturePreviews({
      baseRevision: variants.baseRevision,
      proposalId: variants.proposalId,
      proposalRevision: variants.proposalRevision,
      variantIds: ["tote-1", "tote-2"],
      surfaceIds: ["product-preview"],
    });
  })();
}
