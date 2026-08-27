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
import {
  registerStudioToteAssetProof,
  StudioToteAssetProofStore,
} from "./asset-proof";
import {
  PreviewProofError,
  registerStudioTotePreviewProof,
  type StudioTotePreviewArtifact,
  type StudioTotePreviewRequest,
} from "./preview-proof";
import { mountNativeAssetProof } from "./native-asset-proof";
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
      <output data-asset-audit hidden aria-hidden="true"></output>

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
            <img class="artwork-mark" data-artwork-mark alt="" hidden />
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
let committedAssets: unknown = [];
if (persisted) {
  try {
    const parsed = JSON.parse(persisted) as unknown;
    if (typeof parsed === "object" && parsed !== null && "state" in parsed) {
      seed = (parsed as { state: ConfigurationState }).state;
      committedAssets = (parsed as { assets?: unknown }).assets ?? [];
    } else {
      seed = parsed as ConfigurationState;
    }
  } catch { /* keep public fixture */ }
}
const assetStore = new StudioToteAssetProofStore(committedAssets);
const adapter = new StudioToteAdapter(seed, (state) => {
  window.localStorage.setItem("codesign-studio-tote", JSON.stringify({
    schemaVersion: 1,
    state,
    assets: assetStore.exportCommitted(),
  }));
}, assetStore);
assetStore.setBaseRevisionProvider(() => adapter.committedState.revision);
const session = new ProposalSession(toteManifest, adapter);
const controller = new ProposalReviewController(toteManifest, session);

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
const productionNote = document.querySelector<HTMLElement>(".production-note strong");
if (!reviewContainer || !tabs || !nameInput || !saveStatus || !preview || !mark || !artworkMark || !controls || !audit || !assetAudit || !productionNote) {
  throw new Error("Studio tote configurator markup is incomplete");
}

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
  const proposal = session.snapshot;
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

  const colour = String(selection(design, "bag.color", "natural"));
  const upperLeft = selection(design, "print.position", "front-center") === "upper-left";
  const artwork = assetStore.resolve(selection(design, "branding.artwork_ref", null));
  context.fillStyle = colour === "charcoal" ? "#f6f0e6" : "#20201d";
  const markX = upperLeft ? 250 : 320;
  const markY = upperLeft ? 300 : 360;
  if (artwork) {
    if (!artworkMark.complete || artworkMark.naturalWidth === 0) await artworkMark.decode();
    const artworkSize = upperLeft ? 170 : 210;
    context.drawImage(artworkMark, markX - artworkSize / 2, markY - artworkSize / 2, artworkSize, artworkSize);
  } else {
    context.font = "700 30px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("STUDIO", markX, markY - 18);
    context.fillText("MARK", markX, markY + 18);
  }

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
    proposalRevision: proposal.proposalRevision,
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
  add.disabled = session.status !== "idle" || state.designs.length >= toteManifest.variantPolicy.maximumVariants;
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
  const upperLeft = selection(design, "print.position", "front-center") === "upper-left";
  const artwork = assetStore.resolve(selection(design, "branding.artwork_ref", null));
  mark.hidden = artwork !== null;
  artworkMark.hidden = artwork === null;
  if (artwork) {
    artworkMark.src = artwork.dataUrl;
    artworkMark.alt = artwork.altText;
  } else {
    artworkMark.removeAttribute("src");
    artworkMark.alt = "";
  }
  mark.classList.toggle("upper-left", upperLeft);
  mark.classList.toggle("light", colour === "charcoal");
  artworkMark.classList.toggle("upper-left", upperLeft);
  productionNote.textContent = artwork ? "Supplied artwork staged for this design." : "Final print artwork is still required.";
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
  assetAudit.value = JSON.stringify(assetStore.counters);
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
  if (state.kind === "reverted") assetStore.releaseTemporary();
  render(true);
});
window.addEventListener("pagehide", () => assetStore.releaseTemporary(), { once: true });

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

const webMcpDocument = import.meta.env.DEV && query.has("disable-webmcp")
  ? {} as DocumentWithModelContext
  : document as DocumentWithModelContext;
const registration = registerCoDesignTools(webMcpDocument, {
  manifest: toteManifest,
  adapter,
  session,
});
const previewRegistration = registerStudioTotePreviewProof(webMcpDocument, {
  capture: capturePreviewProof,
});
const assetRegistration = registerStudioToteAssetProof(webMcpDocument, assetStore);
const allToolsReady = Promise.all([registration.ready, previewRegistration.ready, assetRegistration.ready]);
void allToolsReady;
if (import.meta.env.DEV) document.documentElement.dataset.webmcpRegistration = registration.supported ? "supported" : "unsupported";

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
        await Promise.all([registration.ready, previewRegistration.ready]);
        const modelContext = (document as DocumentWithModelContext & {
          modelContext?: {
            getTools(): Promise<Array<{ name: string }>>;
            executeTool(tool: { name: string }, input: string): Promise<unknown>;
          };
        }).modelContext;
        if (!modelContext?.getTools || !modelContext.executeTool) throw new Error("document.modelContext invocation APIs are unavailable");

        const tools = await modelContext.getTools();
        const findTool = (name: string) => {
          const tool = tools.find((candidate) => candidate.name === name);
          if (!tool) throw new Error(`Native Chrome did not discover ${name}`);
          return tool;
        };
        const read = asRecord(await modelContext.executeTool(findTool("codesign_read_configuration"), "{}"));
        const state = asRecord(read.state);
        const baseRevision = state.revision;
        if (typeof baseRevision !== "string") throw new Error("Native configuration read returned no revision");

        const proposal = asRecord(await modelContext.executeTool(
          findTool("codesign_propose_configuration"),
          JSON.stringify({
            baseRevision,
            operationId: "chrome-native-preview-proof",
            changes: [
              { designId: "tote-1", optionId: "design.name", value: "Chrome native proof" },
              { designId: "tote-1", optionId: "bag.color", value: "charcoal" },
              { designId: "tote-1", optionId: "print.position", value: "upper-left" },
            ],
            assumptions: ["This is a temporary native Chrome feasibility proof."],
          }),
        ));
        if (proposal.ok !== true || typeof proposal.proposalId !== "string" || typeof proposal.proposalRevision !== "number") {
          throw new Error(`Native proposal failed: ${JSON.stringify(proposal)}`);
        }

        const previewResult = asRecord(await modelContext.executeTool(
          findTool("codesign_get_previews"),
          JSON.stringify({ proposalId: proposal.proposalId, proposalRevision: proposal.proposalRevision, variantId: "tote-1" }),
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
