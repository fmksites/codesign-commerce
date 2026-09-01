import {
  CONFIGURATION_PASSPORT_VERSION,
  canonicalizePublicSafeConfiguration,
  createConfigurationPassport,
  toShopifyLineMetadata,
  verifyConfigurationPassport,
  type ConfigurationPassportIssue,
  type ConfigurationPassportReadiness,
  type ConfigurationPassportV01,
  type ConfigurationState,
  type PreviewArtifactReceipt,
  type ProposalEngineSuccessResult,
  type PublicSafeConfiguration,
  type ShopifyLineMetadata,
  type VerifiedConfigurationPassport,
  type WorkspaceState,
  type WorkspaceValidationResult,
} from "@codesign-webmcp/core";
import { configurationToWorkspace, toteManifest } from "./configurator";

export const TOTE_RENDERER_VERSION = "studio-tote-renderer-2026.09.01" as const;

export interface TotePassportContext {
  merchantOrigin: string;
  editUrl: string;
}

export interface TotePassportOutcome {
  passport: ConfigurationPassportV01;
  verified: VerifiedConfigurationPassport;
  shopifyLineMetadata: Readonly<ShopifyLineMetadata> | null;
}

const verificationPolicy = (
  merchantOrigin: string,
  authoritativeReadiness: ConfigurationPassportReadiness,
) => ({
  merchantOrigin,
  configuratorId: toteManifest.id,
  manifestVersion: toteManifest.version,
  rendererVersion: TOTE_RENDERER_VERSION,
  authoritativeReadiness,
});

export type ToteCommittedReadinessValidator = (
  workspace: WorkspaceState,
) => Promise<WorkspaceValidationResult>;

interface PendingTotePassportEvidence {
  proposalId: string;
  proposalRevision: number;
  baseRevision: string;
  workspace: WorkspaceState;
  previewReceipts: PreviewArtifactReceipt[];
}

const clone = <T>(value: T): T => structuredClone(value);

const publicControlIds = new Set(
  toteManifest.controls
    .filter((control) => control.kind !== "asset")
    .map((control) => control.id),
);

const publicControls = (controls: Record<string, unknown>): Record<string, never> | Record<string, string | number | boolean | null | { x: number; y: number }> =>
  Object.fromEntries(Object.entries(controls).filter(([controlId]) => publicControlIds.has(controlId))) as Record<string, never>;

function projectWorkspace(workspace: WorkspaceState, committedRevision = workspace.committedRevision): PublicSafeConfiguration {
  return {
    configuratorId: workspace.configuratorId,
    manifestVersion: workspace.manifestVersion,
    committedRevision,
    activeVariantId: workspace.activeVariantId,
    workspaceControls: publicControls(workspace.workspaceControls),
    variants: workspace.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      controls: publicControls(variant.controls),
      elements: variant.elements.map((element) => ({
        id: element.id,
        type: element.type,
        controls: publicControls(element.controls),
      })),
    })),
  };
}

/** Manifest-aware public projection: opaque asset controls never enter the Passport digest. */
export function projectTotePublicConfiguration(state: ConfigurationState): PublicSafeConfiguration {
  return projectWorkspace(configurationToWorkspace(state));
}

/** Revalidates a stored receipt against the exact currently committed tote. */
export async function verifyStoredTotePassport(
  value: unknown,
  committedState: ConfigurationState,
  context: TotePassportContext,
  validateCommittedReadiness: ToteCommittedReadinessValidator,
): Promise<TotePassportOutcome> {
  const publicConfiguration = projectTotePublicConfiguration(committedState);
  const authoritativeReadiness = await readAuthoritativeReadiness(committedState, validateCommittedReadiness);
  const verified = await verifyConfigurationPassport(
    value,
    publicConfiguration,
    verificationPolicy(context.merchantOrigin, authoritativeReadiness),
  );
  return {
    passport: clone(verified.passport) as ConfigurationPassportV01,
    verified,
    shopifyLineMetadata: verified.passport.readiness.productionReady ? toShopifyLineMetadata(verified) : null,
  };
}

function passportIssue(issue: WorkspaceValidationResult["issues"][number]): ConfigurationPassportIssue {
  const safeControlIds = issue.controlIds?.filter((controlId) => publicControlIds.has(controlId));
  return {
    code: issue.code,
    severity: issue.severity,
    ...(safeControlIds && safeControlIds.length > 0 ? { controlIds: safeControlIds } : {}),
    ...(issue.variantIds === undefined ? {} : { variantIds: [...issue.variantIds] }),
    ...(issue.elementIds === undefined ? {} : { elementIds: [...issue.elementIds] }),
  };
}

async function readAuthoritativeReadiness(
  committedState: ConfigurationState,
  validateCommittedReadiness: ToteCommittedReadinessValidator,
): Promise<ConfigurationPassportReadiness> {
  const validation = await validateCommittedReadiness(configurationToWorkspace(clone(committedState)));
  return {
    configurationValid: validation.configurationValid,
    productionReady: validation.productionReady,
    issues: validation.issues.map(passportIssue),
  };
}

function assertPreviewEvidence(evidence: PendingTotePassportEvidence): void {
  if (evidence.previewReceipts.length < 1) throw new TypeError("A kept Configuration Passport requires current preview receipts");
  if (evidence.previewReceipts.some((receipt) => receipt.proposalId !== evidence.proposalId
    || receipt.proposalRevision !== evidence.proposalRevision
    || receipt.baseRevision !== evidence.baseRevision)) {
    throw new TypeError("Configuration Passport previews must belong to the exact kept proposal revision");
  }
}

function cleanConfigurationEditUrl(value: string): string {
  const url = new URL(value);
  url.search = "";
  url.hash = "";
  return url.href;
}

/**
 * Coordinates the page-owned Keep boundary. Capturing is read-only; a Passport
 * is created only when confirmSuccessfulKeep receives a confirmed committed revision.
 */
export class TotePassportCoordinator {
  #pending: PendingTotePassportEvidence | null = null;
  #issued = new Map<string, TotePassportOutcome>();
  #configurationIdFactory: () => string;
  #validateCommittedReadiness: ToteCommittedReadinessValidator;

  constructor(
    validateCommittedReadiness: ToteCommittedReadinessValidator,
    configurationIdFactory: () => string = () => `configuration-${crypto.randomUUID()}`,
  ) {
    this.#validateCommittedReadiness = validateCommittedReadiness;
    this.#configurationIdFactory = configurationIdFactory;
  }

  get hasPendingEvidence(): boolean { return this.#pending !== null; }
  get issuedCount(): number { return this.#issued.size; }

  captureBeforeKeep(review: ProposalEngineSuccessResult, previewReceipts: PreviewArtifactReceipt[]): void {
    const evidence: PendingTotePassportEvidence = {
      proposalId: review.proposalId,
      proposalRevision: review.proposalRevision,
      baseRevision: review.baseRevision,
      workspace: clone(review.workspace),
      previewReceipts: clone(previewReceipts),
    };
    assertPreviewEvidence(evidence);
    this.#pending = evidence;
  }

  discardPending(): void { this.#pending = null; }

  async confirmSuccessfulKeep(
    committedState: ConfigurationState,
    committedRevision: string,
    context: TotePassportContext,
  ): Promise<TotePassportOutcome | null> {
    if (committedState.revision !== committedRevision) throw new TypeError("The confirmed Keep revision does not match the committed tote state");

    const publicConfiguration = projectTotePublicConfiguration(committedState);
    const authoritativeReadiness = await readAuthoritativeReadiness(committedState, this.#validateCommittedReadiness);
    const policy = verificationPolicy(context.merchantOrigin, authoritativeReadiness);
    const existing = this.#issued.get(committedRevision);
    if (existing) {
      const verified = await verifyConfigurationPassport(existing.passport, publicConfiguration, policy);
      const outcome: TotePassportOutcome = {
        passport: clone(verified.passport) as ConfigurationPassportV01,
        verified,
        shopifyLineMetadata: verified.passport.readiness.productionReady ? toShopifyLineMetadata(verified) : null,
      };
      this.#issued.set(committedRevision, outcome);
      return outcome;
    }
    const evidence = this.#pending;
    if (!evidence) return null;
    this.#pending = null;
    const proposedPublicConfiguration = projectWorkspace(evidence.workspace, committedRevision);
    if (canonicalizePublicSafeConfiguration(publicConfiguration) !== canonicalizePublicSafeConfiguration(proposedPublicConfiguration)) {
      throw new TypeError("The confirmed committed tote differs from the previewed proposal");
    }

    const passport = await createConfigurationPassport({
      passportVersion: CONFIGURATION_PASSPORT_VERSION,
      merchantOrigin: context.merchantOrigin,
      configuratorId: toteManifest.id,
      configurationId: this.#configurationIdFactory(),
      committedRevision,
      manifestVersion: toteManifest.version,
      rendererVersion: TOTE_RENDERER_VERSION,
      previewReceipts: evidence.previewReceipts,
      readiness: {
        configurationValid: authoritativeReadiness.configurationValid,
        productionReady: authoritativeReadiness.productionReady,
        issues: authoritativeReadiness.issues,
      },
      safeSummary: {
        itemCount: committedState.order.totalQuantity,
        variantCount: committedState.designs.length,
        status: authoritativeReadiness.productionReady ? "production-ready" : "saved-draft",
      },
      editUrl: cleanConfigurationEditUrl(context.editUrl),
      publicConfiguration,
    });
    const verified = await verifyConfigurationPassport(passport, publicConfiguration, policy);
    const outcome: TotePassportOutcome = {
      passport,
      verified,
      shopifyLineMetadata: passport.readiness.productionReady ? toShopifyLineMetadata(verified) : null,
    };
    this.#issued.set(committedRevision, outcome);
    return outcome;
  }
}
