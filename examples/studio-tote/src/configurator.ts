import {
  validateOptionValue,
  type CommitMetadata,
  type CommitResult,
  type ConfigurationState,
  type ConfiguratorAdapter,
  type ConfiguratorManifest,
  type CreateDesignDraftRequest,
  type CreateDesignDraftResult,
  type JsonPrimitive,
  type OptionRequest,
  type OptionResult,
  type ValidationIssue,
  type ValidationResult,
} from "@codesign-commerce/core";
import type { StudioToteAssetProofStore } from "./asset-proof";

export const toteManifest: ConfiguratorManifest = {
  schemaVersion: "1.0",
  id: "codesign.studio-tote-reference",
  version: "1.0.0",
  displayName: "Studio tote public reference",
  productType: "custom-canvas-studio-tote",
  capabilities: { multipleDesigns: true, maximumDesigns: 3, cloning: true },
  optionGroups: [
    {
      id: "canvas.weight",
      label: "Canvas",
      agentDescription: "Choose the public canvas weight for this tote variant.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "tote body and production construction",
      values: [
        { id: "8oz", label: "8 oz lightweight" },
        { id: "12oz", label: "12 oz heavyweight" },
        { id: "16oz", label: "16 oz extra heavyweight" },
      ],
    },
    {
      id: "bag.color",
      label: "Body colour",
      agentDescription: "Choose one public stocked canvas colour.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "tote body",
      values: [
        { id: "natural", label: "Natural" },
        { id: "charcoal", label: "Charcoal" },
      ],
    },
    {
      id: "handles.length",
      label: "Handles",
      agentDescription: "Choose short hand-carry or long shoulder handles.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "tote handles",
      values: [
        { id: "short", label: "Short tote · 33 cm" },
        { id: "long", label: "Long shoulder · 66 cm" },
      ],
    },
    {
      id: "print.method",
      label: "Print method",
      agentDescription: "Choose a public decoration method subject to canvas and quantity rules.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "front decoration",
      values: [
        { id: "screen-1", label: "Screen print · 1 colour" },
        { id: "screen-2", label: "Screen print · 2 colours" },
        { id: "embroidery", label: "Embroidery" },
      ],
    },
    {
      id: "print.position",
      label: "Print placement",
      agentDescription: "Choose the public front decoration position.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      affectedPreviewRegion: "front decoration position",
      values: [
        { id: "front-center", label: "Front center" },
        { id: "upper-left", label: "Upper left" },
      ],
    },
    {
      id: "construction.reinforced",
      label: "Reinforced construction",
      agentDescription: "Use reinforced cross-stitching at the handle stress points.",
      scope: "design",
      kind: "boolean",
      agentWritable: true,
      affectedPreviewRegion: "handle attachment construction",
    },
    {
      id: "design.name",
      label: "Variant name",
      agentDescription: "Give this tote variant a short public name.",
      scope: "design",
      kind: "text",
      role: "design-name",
      agentWritable: true,
      maximumLength: 60,
    },
    {
      id: "design.quantity",
      label: "Variant quantity",
      agentDescription: "Allocate the number of totes for this variant.",
      scope: "design",
      kind: "integer",
      role: "design-quantity",
      agentWritable: true,
      minimum: 25,
      maximum: 5_000,
    },
    {
      id: "order.total_quantity",
      label: "Order quantity",
      agentDescription: "Set the total number of totes across all variants.",
      scope: "order",
      kind: "integer",
      role: "order-total",
      agentWritable: true,
      minimum: 25,
      maximum: 5_000,
    },
    {
      id: "branding.artwork_ref",
      label: "Staged print artwork",
      agentDescription: "Attach an opaque temporary handle returned by codesign_stage_asset to this tote variant.",
      scope: "design",
      kind: "text",
      agentWritable: true,
      maximumLength: 128,
      affectedPreviewRegion: "front decoration artwork",
    },
    {
      id: "branding.artwork_status",
      label: "Print artwork",
      agentDescription: "Read whether final production print artwork is available for this tote variant.",
      scope: "design",
      kind: "asset-status",
      agentWritable: false,
    },
  ],
  dependencyRules: [
    {
      id: "variant-quantities-match-total",
      description: "Variant quantities must add up to the order total.",
      optionIds: ["order.total_quantity", "design.quantity"],
    },
    {
      id: "embroidery-needs-substantial-canvas",
      description: "Embroidery requires 12 oz or 16 oz canvas.",
      optionIds: ["canvas.weight", "print.method"],
    },
    {
      id: "extra-heavy-needs-reinforcement",
      description: "16 oz canvas requires reinforced handle construction.",
      optionIds: ["canvas.weight", "construction.reinforced"],
    },
    {
      id: "two-colour-minimum",
      description: "Two-colour screen print requires at least 50 totes per variant.",
      optionIds: ["print.method", "design.quantity"],
    },
    {
      id: "artwork-before-production",
      description: "A placeholder may be kept as a draft, but final print artwork is required before production.",
      optionIds: ["branding.artwork_status"],
    },
  ],
  approval: { mode: "explicit-human", persistence: "keep-only" },
};

export const toteInitialState: ConfigurationState = {
  configuratorId: toteManifest.id,
  manifestVersion: toteManifest.version,
  revision: "tote-revision-1",
  activeDesignId: "tote-1",
  order: { totalQuantity: 100 },
  designs: [{
    id: "tote-1",
    name: "Canvas tote",
    quantity: 100,
    selections: {
      "canvas.weight": "12oz",
      "bag.color": "natural",
      "handles.length": "long",
      "print.method": "screen-1",
      "print.position": "front-center",
      "construction.reinforced": true,
    },
    assets: [{ slot: "print-artwork", status: "placeholder", agentWritable: false }],
  }],
};

export interface ToteSnapshot { committed: ConfigurationState }

export interface ToteAdapterCounters {
  quiesceCalls: number;
  previewCalls: number;
  restoreCalls: number;
  localWrites: number;
  serverWrites: number;
  commitCalls: number;
  createDesignDraftCalls: number;
}

const clone = <T>(value: T): T => structuredClone(value);

export class StudioToteAdapter implements ConfiguratorAdapter<ToteSnapshot> {
  #committed: ConfigurationState;
  #visible: ConfigurationState;
  #revisionNumber = 1;
  #listeners = new Set<(revision: string) => void>();
  #commits = new Map<string, string>();
  #persist: ((state: ConfigurationState) => void) | undefined;
  #assetStore: StudioToteAssetProofStore | undefined;

  readonly counters: ToteAdapterCounters = {
    quiesceCalls: 0,
    previewCalls: 0,
    restoreCalls: 0,
    localWrites: 0,
    serverWrites: 0,
    commitCalls: 0,
    createDesignDraftCalls: 0,
  };

  constructor(
    initialState = toteInitialState,
    persist?: (state: ConfigurationState) => void,
    assetStore?: StudioToteAssetProofStore,
  ) {
    this.#committed = clone(initialState);
    this.#visible = clone(initialState);
    const revisionSuffix = Number(initialState.revision.match(/(\d+)$/)?.[1]);
    if (Number.isInteger(revisionSuffix) && revisionSuffix > 0) this.#revisionNumber = revisionSuffix;
    this.#persist = persist;
    this.#assetStore = assetStore;
  }

  get visibleState(): ConfigurationState { return clone(this.#visible); }
  get committedState(): ConfigurationState { return clone(this.#committed); }

  async readState(): Promise<ConfigurationState> { return this.committedState; }

  async listOptions(request: OptionRequest): Promise<OptionResult> {
    const requested = request.optionIds ? new Set(request.optionIds) : null;
    const designExists = request.designId === undefined || this.#visible.designs.some((design) => design.id === request.designId);
    return {
      revision: this.#committed.revision,
      options: toteManifest.optionGroups
        .filter((option) => !requested || requested.has(option.id))
        .map((option) => ({
          optionId: option.id,
          allowed: option.scope === "order" || designExists,
          ...(option.values ? { values: clone(option.values) } : {}),
          ...(option.scope === "design" && !designExists ? { reason: "Unknown design" } : {}),
        })),
    };
  }

  async createDesignDraft(state: ConfigurationState, request: CreateDesignDraftRequest): Promise<CreateDesignDraftResult> {
    this.counters.createDesignDraftCalls += 1;
    const source = state.designs.find((design) => design.id === request.sourceDesignId);
    if (!source) throw new Error("Unknown source design");
    let suffix = state.designs.length + 1;
    while (state.designs.some((design) => design.id === `tote-${suffix}`)) suffix += 1;
    const designId = `tote-${suffix}`;
    const created = {
      ...clone(source),
      id: designId,
      name: `Tote variant ${suffix}`,
      assets: source.assets.map((asset) => ({ ...asset, status: "placeholder" as const })),
    };
    return {
      designId,
      state: { ...clone(state), activeDesignId: designId, designs: [...clone(state.designs), created] },
    };
  }

  async quiescePersistence(): Promise<void> { this.counters.quiesceCalls += 1; }
  async captureSnapshot(): Promise<ToteSnapshot> { return { committed: this.committedState }; }

  async previewState(state: ConfigurationState): Promise<void> {
    this.counters.previewCalls += 1;
    this.#visible = clone(state);
  }

  async validateState(state: ConfigurationState): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const quantitySum = state.designs.reduce((total, design) => total + design.quantity, 0);
    if (quantitySum !== state.order.totalQuantity) {
      issues.push({
        code: "QUANTITY_TOTAL_MISMATCH",
        severity: "constraint-error",
        message: "Variant quantities must equal the order total",
        optionIds: ["design.quantity", "order.total_quantity"],
      });
    }
    for (const design of state.designs) {
      const weight = design.selections["canvas.weight"];
      const method = design.selections["print.method"];
      const reinforced = design.selections["construction.reinforced"];
      if (method === "embroidery" && weight === "8oz") {
        issues.push({
          code: "EMBROIDERY_REQUIRES_SUBSTANTIAL_CANVAS",
          severity: "constraint-error",
          message: "Embroidery requires 12 oz or 16 oz canvas",
          optionIds: ["print.method", "canvas.weight"],
          designIds: [design.id],
        });
      }
      if (weight === "16oz" && reinforced !== true) {
        issues.push({
          code: "EXTRA_HEAVY_REQUIRES_REINFORCEMENT",
          severity: "constraint-error",
          message: "16 oz canvas requires reinforced handle construction",
          optionIds: ["canvas.weight", "construction.reinforced"],
          designIds: [design.id],
        });
      }
      if (method === "screen-2" && design.quantity < 50) {
        issues.push({
          code: "TWO_COLOUR_PRINT_MINIMUM",
          severity: "constraint-error",
          message: "Two-colour screen print requires at least 50 totes per variant",
          optionIds: ["print.method", "design.quantity"],
          designIds: [design.id],
        });
      }
      const artworkReference = design.selections["branding.artwork_ref"];
      if (artworkReference !== undefined && !this.#assetStore?.resolve(artworkReference)) {
        issues.push({
          code: "ARTWORK_HANDLE_UNAVAILABLE",
          severity: "constraint-error",
          message: "The staged print artwork is no longer available",
          optionIds: ["branding.artwork_ref"],
          designIds: [design.id],
        });
      }
    }
    const missingArtwork = state.designs.filter((design) => {
      const artworkReference = design.selections["branding.artwork_ref"];
      const stagedArtworkAvailable = artworkReference !== undefined && (this.#assetStore?.resolve(artworkReference) ?? null) !== null;
      return !stagedArtworkAvailable && design.assets.some((asset) => asset.slot === "print-artwork" && asset.status !== "ready");
    });
    if (missingArtwork.length > 0) {
      issues.push({
        code: "FINAL_PRINT_ARTWORK_REQUIRED",
        severity: "decision-required",
        message: "Final print artwork",
        optionIds: ["branding.artwork_status"],
        designIds: missingArtwork.map((design) => design.id),
      });
    }
    const configurationValid = !issues.some((issue) => issue.severity === "constraint-error");
    return {
      configurationValid,
      productionReady: configurationValid && missingArtwork.length === 0,
      issues,
      assumptions: [],
    };
  }

  async restoreSnapshot(snapshot: ToteSnapshot): Promise<void> {
    this.counters.restoreCalls += 1;
    this.#visible = clone(snapshot.committed);
  }

  async commitState(state: ConfigurationState, metadata: CommitMetadata): Promise<CommitResult> {
    this.counters.commitCalls += 1;
    let revision = this.#commits.get(metadata.proposalId);
    if (!revision) {
      if (this.#committed.revision !== metadata.baseRevision) {
        return {
          revision: this.#committed.revision,
          localPersisted: false,
          serverPersisted: false,
          errorCode: "STALE_REVISION",
        };
      }
      const importedState = this.#assetStore?.commitState(state) ?? clone(state);
      this.#revisionNumber += 1;
      revision = `tote-revision-${this.#revisionNumber}`;
      this.#commits.set(metadata.proposalId, revision);
      this.#committed = { ...clone(importedState), revision };
      this.#visible = clone(this.#committed);
      this.counters.localWrites += 1;
      this.counters.serverWrites += 1;
      this.#persist?.(this.committedState);
      for (const listener of this.#listeners) listener(revision);
    }
    return { revision, localPersisted: true, serverPersisted: true };
  }

  subscribeToExternalChanges(listener: (revision: string) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  applyHumanChange(designId: string, optionId: string, value: JsonPrimitive): boolean {
    const option = toteManifest.optionGroups.find((candidate) => candidate.id === optionId);
    if (!option || validateOptionValue(option, value)) return false;
    const next = this.committedState;
    if (option.scope === "order") {
      next.order.totalQuantity = Number(value);
    } else {
      const design = next.designs.find((candidate) => candidate.id === designId);
      if (!design) return false;
      if (option.role === "design-name") design.name = String(value);
      else if (option.role === "design-quantity") {
        design.quantity = Number(value);
        next.order.totalQuantity = next.designs.reduce((total, candidate) => total + candidate.quantity, 0);
      }
      else design.selections[option.id] = value;
    }
    this.#setHumanState(next);
    return true;
  }

  addHumanVariant(sourceDesignId: string): string | null {
    const next = this.committedState;
    if (next.designs.length >= toteManifest.capabilities.maximumDesigns) return null;
    const source = next.designs.find((design) => design.id === sourceDesignId);
    if (!source) return null;
    const designId = `tote-${next.designs.length + 1}-${Date.now()}`;
    const created = { ...clone(source), id: designId, name: `Tote variant ${next.designs.length + 1}` };
    next.designs.push(created);
    next.activeDesignId = designId;
    next.order.totalQuantity = next.designs.reduce((total, design) => total + design.quantity, 0);
    this.#setHumanState(next);
    return designId;
  }

  #setHumanState(state: ConfigurationState): void {
    this.#revisionNumber += 1;
    this.#committed = { ...clone(state), revision: `tote-revision-${this.#revisionNumber}` };
    this.#visible = clone(this.#committed);
    this.#persist?.(this.committedState);
    for (const listener of this.#listeners) listener(this.#committed.revision);
  }
}
