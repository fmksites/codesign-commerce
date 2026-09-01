import {
  validateOptionValue,
  type CommitMetadata,
  type CommitResult,
  type AssetResolver,
  type AvailabilityRequest,
  type AvailabilityResult,
  type ConfigurationState,
  type ConfiguratorAdapter,
  type ConfiguratorManifest,
  type CreateDesignDraftRequest,
  type CreateDesignDraftResult,
  type JsonPrimitive,
  type ProposalContext,
  type ProposalEndReason,
  type OptionRequest,
  type OptionResult,
  type ValidationIssue,
  type ValidationResult,
  type WorkspaceAdapter,
  type WorkspaceState,
  type WorkspaceValidationResult,
} from "@codesign-webmcp/core";
import type {
  StudioToteAssetProofStore,
  StudioToteAssetStageInput,
  StudioToteResolvedAsset,
} from "./asset-proof";

export const TOTE_ARTWORK_SAFE_ZONE = {
  code: "ARTWORK_SAFE_ZONE",
  maximumUpperLeftScale: 0.78,
  repairScale: 0.78,
  surfaceId: "product-preview",
  normalizedPreviewRegion: { x: 0.32, y: 0.39, width: 0.14, height: 0.14 },
} as const;

export const toteManifest: ConfiguratorManifest = {
  schemaVersion: "2.0",
  id: "codesign.studio-tote-reference",
  version: "2.1.0",
  displayName: "Studio tote public reference",
  productType: "custom-canvas-studio-tote",
  controls: [
    {
      id: "canvas.weight",
      label: "Canvas",
      agentDescription: "Choose the public canvas weight for this tote variant.",
      scope: "variant",
      kind: "enum",
      agentWritable: true,
      requirement: "configuration",
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
      scope: "variant",
      kind: "enum",
      agentWritable: true,
      requirement: "configuration",
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
      scope: "variant",
      kind: "enum",
      agentWritable: true,
      requirement: "configuration",
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
      scope: "variant",
      kind: "enum",
      agentWritable: true,
      requirement: "configuration",
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
      agentDescription: "Choose the public front decoration position. The merchant's premium darker staff direction starts upper-left so production validation can assess its safe area.",
      scope: "variant",
      kind: "enum",
      agentWritable: true,
      requirement: "configuration",
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
      scope: "variant",
      kind: "boolean",
      agentWritable: true,
      requirement: "configuration",
      affectedPreviewRegion: "handle attachment construction",
    },
    {
      id: "design.name",
      label: "Variant name",
      agentDescription: "Give this tote variant a short public name.",
      scope: "variant",
      kind: "text",
      role: "variant-name",
      agentWritable: true,
      requirement: "configuration",
      maximumLength: 60,
    },
    {
      id: "design.quantity",
      label: "Variant quantity",
      agentDescription: "Allocate the number of totes for this variant.",
      scope: "variant",
      kind: "integer",
      role: "variant-quantity",
      agentWritable: true,
      requirement: "configuration",
      minimum: 25,
      maximum: 5_000,
    },
    {
      id: "order.total_quantity",
      label: "Order quantity",
      agentDescription: "Set the total number of totes across all variants.",
      scope: "workspace",
      kind: "integer",
      role: "workspace-total",
      agentWritable: true,
      requirement: "configuration",
      minimum: 25,
      maximum: 5_000,
    },
    {
      id: "branding.artwork_ref",
      label: "Staged print artwork",
      agentDescription: "Attach an opaque temporary handle returned by codesign_stage_asset to this tote variant.",
      scope: "variant",
      kind: "asset",
      agentWritable: true,
      requirement: "production-readiness",
      assetSlotId: "print-artwork",
      affectedPreviewRegion: "front decoration artwork",
    },
    {
      id: "branding.text",
      label: "Studio name",
      agentDescription: "Set the visible studio or collection name used when no supplied artwork is attached.",
      scope: "variant",
      kind: "text",
      agentWritable: true,
      requirement: "configuration",
      maximumLength: 32,
      affectedPreviewRegion: "front decoration typography",
    },
    {
      id: "branding.typeface",
      label: "Typography",
      agentDescription: "Choose the public typography direction for the studio-name fallback.",
      scope: "variant",
      kind: "enum",
      agentWritable: true,
      requirement: "configuration",
      affectedPreviewRegion: "front decoration typography",
      values: [
        { id: "grotesk", label: "Grotesk bold" },
        { id: "editorial", label: "Editorial serif" },
        { id: "mono", label: "Studio mono" },
      ],
    },
    {
      id: "branding.ink_color",
      label: "Branding colour",
      agentDescription: "Choose the visible single-colour ink used for studio-name typography.",
      scope: "variant",
      kind: "color",
      agentWritable: true,
      requirement: "configuration",
      affectedPreviewRegion: "front decoration colour",
      values: [
        { id: "ink", label: "Ink black" },
        { id: "cobalt", label: "Studio blue" },
        { id: "canvas", label: "Canvas white" },
      ],
    },
    {
      id: "branding.scale",
      label: "Branding scale",
      agentDescription: "Scale the visible branding between 50 and 140 percent of its standard size. The merchant's premium darker staff direction starts at 95 percent; use only validation-declared repairs if that exploration is not production-ready.",
      scope: "variant",
      kind: "scale",
      agentWritable: true,
      requirement: "configuration",
      minimum: 0.5,
      maximum: 1.4,
      affectedPreviewRegion: "front decoration size",
    },
    {
      id: "branding.rotation",
      label: "Branding rotation",
      agentDescription: "Rotate the visible branding between minus 30 and plus 30 degrees.",
      scope: "variant",
      kind: "rotation",
      agentWritable: true,
      requirement: "configuration",
      minimum: -30,
      maximum: 30,
      affectedPreviewRegion: "front decoration rotation",
    },
    {
      id: "branding.artwork_status",
      label: "Print artwork",
      agentDescription: "Read whether final production print artwork is available for this tote variant.",
      scope: "variant",
      kind: "enum",
      agentWritable: false,
      requirement: "production-readiness",
      values: [
        { id: "missing", label: "Missing" },
        { id: "placeholder", label: "Placeholder" },
        { id: "ready", label: "Ready" },
      ],
    },
  ],
  assetSlots: [{
    id: "print-artwork",
    label: "Print artwork",
    agentDescription: "Public artwork for the tote's front decoration.",
    scope: "variant",
    sourceKinds: ["data-url"],
    mediaTypes: ["image/png", "image/jpeg", "image/webp"],
    maximumSourceCharacters: 400_000,
    maximumBytes: 250_000,
  }],
  variantPolicy: {
    minimumVariants: 1,
    maximumVariants: 3,
    operations: ["duplicate", "set-active"],
  },
  previewSurfaces: [{
    id: "product-preview",
    label: "Tote product preview",
    scope: "variant",
    mediaTypes: ["image/webp", "image/png"],
    maximumBytes: 300_000,
  }],
  dependencyDescriptions: [
    {
      id: "variant-quantities-match-total",
      description: "Variant quantities must add up to the order total.",
      controlIds: ["order.total_quantity", "design.quantity"],
    },
    {
      id: "embroidery-needs-substantial-canvas",
      description: "Embroidery requires 12 oz or 16 oz canvas.",
      controlIds: ["canvas.weight", "print.method"],
    },
    {
      id: "extra-heavy-needs-reinforcement",
      description: "16 oz canvas requires reinforced handle construction.",
      controlIds: ["canvas.weight", "construction.reinforced"],
    },
    {
      id: "two-colour-minimum",
      description: "Two-colour screen print requires at least 50 totes per variant.",
      controlIds: ["print.method", "design.quantity"],
    },
    {
      id: "artwork-before-production",
      description: "A non-empty studio-name treatment or final supplied print artwork is required before production.",
      controlIds: ["branding.text", "branding.artwork_status"],
    },
    {
      id: "upper-left-artwork-safe-zone",
      description: "An upper-left branding mark on charcoal canvas must use the merchant-approved 78 percent safe-area scale.",
      controlIds: ["bag.color", "print.position", "branding.scale"],
    },
    {
      id: "premium-darker-staff-direction",
      description: "For this public tote's premium darker staff direction, begin with charcoal canvas, short handles, upper-left studio-name branding at 95 percent, then use only a repair returned by merchant validation.",
      controlIds: ["bag.color", "handles.length", "print.position", "branding.text", "branding.scale"],
    },
  ],
  approval: { mode: "explicit-human", persistencePath: "page-keep-controller" },
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
      "branding.text": "NORTH FORM",
      "branding.typeface": "grotesk",
      "branding.ink_color": "ink",
      "branding.scale": 1,
      "branding.rotation": 0,
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

const hydrateConfigurationState = (initialState: ConfigurationState): ConfigurationState => {
  const hydrated = clone(initialState);
  hydrated.configuratorId = toteManifest.id;
  hydrated.manifestVersion = toteManifest.version;
  for (const design of hydrated.designs) {
    design.selections["branding.text"] ??= "NORTH FORM";
    design.selections["branding.typeface"] ??= "grotesk";
    design.selections["branding.ink_color"] ??= "ink";
    design.selections["branding.scale"] ??= 1;
    design.selections["branding.rotation"] ??= 0;
  }
  return hydrated;
};

export function configurationToWorkspace(state: ConfigurationState): WorkspaceState {
  return {
    configuratorId: toteManifest.id,
    manifestVersion: toteManifest.version,
    committedRevision: state.revision,
    activeVariantId: state.activeDesignId,
    workspaceControls: { "order.total_quantity": state.order.totalQuantity },
    variants: state.designs.map((design) => ({
      id: design.id,
      name: design.name,
      controls: {
        ...clone(design.selections),
        "design.quantity": design.quantity,
        "branding.artwork_status": design.assets.find((asset) => asset.slot === "print-artwork")?.status ?? "missing",
      },
      elements: [],
    })),
  };
}

export function workspaceToConfiguration(workspace: WorkspaceState): ConfigurationState {
  return {
    configuratorId: toteManifest.id,
    manifestVersion: toteManifest.version,
    revision: workspace.committedRevision,
    activeDesignId: workspace.activeVariantId,
    order: { totalQuantity: Number(workspace.workspaceControls["order.total_quantity"]) },
    designs: workspace.variants.map((variant) => {
      const quantity = Number(variant.controls["design.quantity"]);
      const status = variant.controls["branding.artwork_status"];
      const selections: Record<string, JsonPrimitive> = {};
      for (const [controlId, value] of Object.entries(variant.controls)) {
        if (controlId === "design.quantity" || controlId === "branding.artwork_status" || (typeof value === "object" && value !== null)) continue;
        selections[controlId] = value;
      }
      return {
        id: variant.id,
        name: variant.name,
        quantity,
        selections,
        assets: [{ slot: "print-artwork", status: status === "ready" || status === "missing" ? status : "placeholder", agentWritable: false }],
      };
    }),
  };
}

export class StudioToteAdapter implements ConfiguratorAdapter<ToteSnapshot>, WorkspaceAdapter<ToteSnapshot, StudioToteResolvedAsset> {
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
    const hydrated = hydrateConfigurationState(initialState);
    this.#committed = hydrated;
    this.#visible = clone(hydrated);
    const revisionSuffix = Number(initialState.revision.match(/(\d+)$/)?.[1]);
    if (Number.isInteger(revisionSuffix) && revisionSuffix > 0) this.#revisionNumber = revisionSuffix;
    this.#persist = persist;
    this.#assetStore = assetStore;
  }

  get visibleState(): ConfigurationState { return clone(this.#visible); }
  get committedState(): ConfigurationState { return clone(this.#committed); }

  async readState(): Promise<ConfigurationState> { return this.committedState; }

  async readWorkspace(): Promise<WorkspaceState> { return configurationToWorkspace(this.committedState); }

  async listAvailability(request: AvailabilityRequest): Promise<AvailabilityResult> {
    const result = await this.listOptions({
      ...(request.variantId === undefined ? {} : { designId: request.variantId }),
      ...(request.controlIds === undefined ? {} : { optionIds: request.controlIds }),
    });
    return {
      committedRevision: result.revision,
      controls: result.options.map((option) => ({
        controlId: option.optionId,
        available: option.allowed,
        ...(option.values === undefined ? {} : { values: option.values }),
        ...(option.reason === undefined ? {} : { reason: option.reason }),
      })),
    };
  }

  async listOptions(request: OptionRequest): Promise<OptionResult> {
    const requested = request.optionIds ? new Set(request.optionIds) : null;
    const designExists = request.designId === undefined || this.#visible.designs.some((design) => design.id === request.designId);
    return {
      revision: this.#committed.revision,
      options: toteManifest.controls
        .filter((option) => !requested || requested.has(option.id))
        .map((option) => ({
          optionId: option.id,
          allowed: option.scope === "workspace" || designExists,
          ...(option.values ? { values: clone(option.values) } : {}),
          ...(option.scope !== "workspace" && !designExists ? { reason: "Unknown design" } : {}),
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
  async beginProposalMode(_context: ProposalContext): Promise<void> {}
  async endProposalMode(_reason: ProposalEndReason): Promise<void> { this.#assetStore?.setProposalAssetResolver(null); }

  async previewState(state: ConfigurationState): Promise<void> {
    this.counters.previewCalls += 1;
    this.#visible = clone(state);
  }

  async previewWorkspace(workspace: WorkspaceState, assets?: AssetResolver<StudioToteResolvedAsset>): Promise<void> {
    this.#assetStore?.setProposalAssetResolver(assets ?? null);
    await this.previewState(workspaceToConfiguration(workspace));
  }

  validateVisibleState(): ValidationResult {
    return this.#validateState(this.visibleState);
  }

  async validateState(state: ConfigurationState): Promise<ValidationResult> {
    return this.#validateState(state);
  }

  #validateState(state: ConfigurationState): ValidationResult {
    const issues: ValidationIssue[] = [];
    const quantitySum = state.designs.reduce((total, design) => total + design.quantity, 0);
    if (quantitySum !== state.order.totalQuantity) {
      issues.push({
        code: "QUANTITY_TOTAL_MISMATCH",
        severity: "constraint-error",
        source: "merchant-rule",
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
          source: "merchant-rule",
          message: "Embroidery requires 12 oz or 16 oz canvas",
          optionIds: ["print.method", "canvas.weight"],
          designIds: [design.id],
        });
      }
      if (weight === "16oz" && reinforced !== true) {
        issues.push({
          code: "EXTRA_HEAVY_REQUIRES_REINFORCEMENT",
          severity: "constraint-error",
          source: "merchant-rule",
          message: "16 oz canvas requires reinforced handle construction",
          optionIds: ["canvas.weight", "construction.reinforced"],
          designIds: [design.id],
        });
      }
      if (method === "screen-2" && design.quantity < 50) {
        issues.push({
          code: "TWO_COLOUR_PRINT_MINIMUM",
          severity: "constraint-error",
          source: "merchant-rule",
          message: "Two-colour screen print requires at least 50 totes per variant",
          optionIds: ["print.method", "design.quantity"],
          designIds: [design.id],
        });
      }
      const colour = design.selections["bag.color"];
      const position = design.selections["print.position"];
      const scale = Number(design.selections["branding.scale"] ?? 1);
      const studioName = design.selections["branding.text"];
      const hasStudioName = typeof studioName === "string" && studioName.trim().length > 0;
      const artworkReference = design.selections["branding.artwork_ref"];
      const stagedArtworkAvailable = artworkReference !== undefined && (this.#assetStore?.resolve(artworkReference) ?? null) !== null;
      const committedArtworkReady = design.assets.some((asset) => asset.slot === "print-artwork" && asset.status === "ready");
      const hasBrandingMark = hasStudioName || stagedArtworkAvailable || committedArtworkReady;
      if (hasBrandingMark && colour === "charcoal" && position === "upper-left" && scale > TOTE_ARTWORK_SAFE_ZONE.maximumUpperLeftScale) {
        issues.push({
          issueId: `artwork-safe-zone.${design.id}`,
          code: TOTE_ARTWORK_SAFE_ZONE.code,
          severity: "decision-required",
          source: "merchant-rule",
          message: "Branding mark exceeds the approved upper-left print safe area on charcoal canvas",
          optionIds: ["bag.color", "print.position", "branding.scale"],
          designIds: [design.id],
          surfaceId: TOTE_ARTWORK_SAFE_ZONE.surfaceId,
          normalizedPreviewRegion: { ...TOTE_ARTWORK_SAFE_ZONE.normalizedPreviewRegion },
          repairable: true,
          merchantApprovedRepairs: [{
            id: "reduce-artwork-to-safe-scale",
            label: "Reduce branding mark scale to 78%",
            operations: [{
              type: "set-control",
              target: { scope: "variant", variantId: design.id },
              controlId: "branding.scale",
              value: TOTE_ARTWORK_SAFE_ZONE.repairScale,
            }],
          }],
        });
      }
      if (artworkReference !== undefined && !this.#assetStore?.resolve(artworkReference)) {
        issues.push({
          code: "ARTWORK_HANDLE_UNAVAILABLE",
          severity: "constraint-error",
          source: "current-configuration",
          message: "The staged print artwork is no longer available",
          optionIds: ["branding.artwork_ref"],
          designIds: [design.id],
        });
      }
    }
    const missingBranding = state.designs.filter((design) => {
      const studioName = design.selections["branding.text"];
      const hasStudioName = typeof studioName === "string" && studioName.trim().length > 0;
      const artworkReference = design.selections["branding.artwork_ref"];
      const stagedArtworkAvailable = artworkReference !== undefined && (this.#assetStore?.resolve(artworkReference) ?? null) !== null;
      const committedArtworkReady = design.assets.some((asset) => asset.slot === "print-artwork" && asset.status === "ready");
      return !hasStudioName && !stagedArtworkAvailable && !committedArtworkReady;
    });
    if (missingBranding.length > 0) {
      issues.push({
        code: "FINAL_PRINT_ARTWORK_REQUIRED",
        severity: "decision-required",
        source: "merchant-rule",
        message: "Final branding mark required: add a studio name or supplied print artwork",
        optionIds: ["branding.text", "branding.artwork_status"],
        designIds: missingBranding.map((design) => design.id),
      });
    }
    const configurationValid = !issues.some((issue) => issue.severity === "constraint-error");
    return {
      configurationValid,
      productionReady: configurationValid && !issues.some((issue) => issue.severity === "decision-required"),
      issues,
      assumptions: [],
    };
  }

  async validateWorkspace(workspace: WorkspaceState, assets?: AssetResolver<StudioToteResolvedAsset>): Promise<WorkspaceValidationResult> {
    this.#assetStore?.setProposalAssetResolver(assets ?? null);
    const result = await this.validateState(workspaceToConfiguration(workspace));
    return {
      configurationValid: result.configurationValid,
      productionReady: result.productionReady,
      issues: result.issues.map((issue) => ({
        issueId: issue.issueId ?? `${issue.code.toLowerCase()}.${issue.designIds?.join(".") ?? "workspace"}`,
        code: issue.code,
        severity: issue.severity,
        ...(issue.source === undefined ? {} : { source: issue.source }),
        message: issue.message,
        ...(issue.optionIds === undefined ? {} : { controlIds: issue.optionIds }),
        ...(issue.designIds === undefined ? {} : { variantIds: issue.designIds }),
        ...(issue.surfaceId === undefined ? {} : { surfaceId: issue.surfaceId }),
        ...(issue.normalizedPreviewRegion === undefined ? {} : { normalizedPreviewRegion: issue.normalizedPreviewRegion }),
        repairable: issue.repairable ?? false,
        ...(issue.merchantApprovedRepairs === undefined ? {} : { merchantApprovedRepairs: issue.merchantApprovedRepairs }),
      })),
      assumptions: [...result.assumptions],
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

  async commitWorkspace(workspace: WorkspaceState, metadata: CommitMetadata, assets?: AssetResolver<StudioToteResolvedAsset>): Promise<CommitResult> {
    this.#assetStore?.setProposalAssetResolver(assets ?? null);
    return this.commitState(workspaceToConfiguration(workspace), metadata);
  }

  subscribeToExternalChanges(listener: (revision: string) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  synchronizeExternalState(state: ConfigurationState): boolean {
    const incoming = hydrateConfigurationState(state);
    if (JSON.stringify(incoming) === JSON.stringify(this.#committed)) return false;
    this.#committed = incoming;
    this.#visible = clone(incoming);
    const revisionSuffix = Number(incoming.revision.match(/(\d+)$/)?.[1]);
    if (Number.isInteger(revisionSuffix) && revisionSuffix > this.#revisionNumber) this.#revisionNumber = revisionSuffix;
    for (const listener of this.#listeners) listener(incoming.revision);
    return true;
  }

  applyHumanChange(designId: string, optionId: string, value: JsonPrimitive): boolean {
    const option = toteManifest.controls.find((candidate) => candidate.id === optionId);
    if (!option || validateOptionValue(option, value)) return false;
    const next = this.committedState;
    if (option.scope === "workspace") {
      next.order.totalQuantity = Number(value);
    } else {
      const design = next.designs.find((candidate) => candidate.id === designId);
      if (!design) return false;
      if (option.role === "variant-name") design.name = String(value);
      else if (option.role === "variant-quantity") {
        design.quantity = Number(value);
        next.order.totalQuantity = next.designs.reduce((total, candidate) => total + candidate.quantity, 0);
      }
      else design.selections[option.id] = value;
    }
    this.#setHumanState(next);
    return true;
  }

  setHumanActiveVariant(designId: string): boolean {
    const next = this.committedState;
    if (!next.designs.some((design) => design.id === designId)) return false;
    next.activeDesignId = designId;
    this.#setHumanState(next);
    return true;
  }

  async applyHumanArtwork(designId: string, input: StudioToteAssetStageInput): Promise<boolean> {
    if (!this.#assetStore) return false;
    const next = this.committedState;
    const design = next.designs.find((candidate) => candidate.id === designId);
    if (!design) return false;
    const receipt = await this.#assetStore.stage(input);
    design.selections["branding.artwork_ref"] = receipt.assetHandle;
    design.assets = design.assets.map((asset) => asset.slot === "print-artwork" ? { ...asset, status: "ready" } : asset);
    this.#setHumanState(this.#assetStore.commitState(next));
    return true;
  }

  removeHumanArtwork(designId: string): boolean {
    const next = this.committedState;
    const design = next.designs.find((candidate) => candidate.id === designId);
    if (!design) return false;
    delete design.selections["branding.artwork_ref"];
    design.assets = design.assets.map((asset) => asset.slot === "print-artwork" ? { ...asset, status: "placeholder" } : asset);
    this.#setHumanState(this.#assetStore?.commitState(next) ?? next);
    return true;
  }

  addHumanVariant(sourceDesignId: string): string | null {
    const next = this.committedState;
    if (next.designs.length >= toteManifest.variantPolicy.maximumVariants) return null;
    const source = next.designs.find((design) => design.id === sourceDesignId);
    if (!source || source.quantity < 50) return null;
    const designId = `tote-${next.designs.length + 1}-${Date.now()}`;
    const createdQuantity = Math.max(25, Math.floor((source.quantity / 2) / 25) * 25);
    source.quantity = Math.max(25, source.quantity - createdQuantity);
    const created = {
      ...clone(source),
      id: designId,
      name: `Tote variant ${next.designs.length + 1}`,
      quantity: createdQuantity,
    };
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
