import { describe, expect, it } from "vitest";
import type { PreviewArtifactReceipt, ProposalEngineSuccessResult, WorkspaceValidationResult } from "@codesign-webmcp/core";
import { configurationToWorkspace, toteInitialState } from "./configurator";
import {
  projectTotePublicConfiguration,
  TotePassportCoordinator,
  verifyStoredTotePassport,
  type ToteCommittedReadinessValidator,
} from "./configuration-passport";

const clone = <T>(value: T): T => structuredClone(value);

const proposedState = () => {
  const state = clone(toteInitialState);
  state.designs[0]!.selections["branding.artwork_ref"] = "asset-private-proposal-handle";
  state.designs[0]!.assets = [{ slot: "print-artwork", status: "ready", agentWritable: false }];
  return state;
};

const validation = (productionReady = true): WorkspaceValidationResult => ({
  configurationValid: true,
  productionReady,
  issues: productionReady ? [] : [{
    issueId: "branding-missing.tote-1",
    code: "FINAL_PRINT_ARTWORK_REQUIRED",
    severity: "decision-required",
    message: "Untrusted adapter prose that must not enter the Passport",
    controlIds: ["branding.artwork_ref", "branding.artwork_status"],
    variantIds: ["tote-1"],
    repairable: false,
  }],
  assumptions: ["Untrusted assumption that must not enter the Passport"],
});

const authoritativeValidator = (productionReady = true): ToteCommittedReadinessValidator =>
  async () => validation(productionReady);

const review = (productionReady = true): ProposalEngineSuccessResult => {
  const workspace = configurationToWorkspace(proposedState());
  return {
    ok: true,
    proposalId: "proposal-11111111-1111-4111-8111-111111111111",
    proposalRevision: 3,
    baseRevision: "tote-revision-1",
    persisted: false,
    appliedOperations: 1,
    deduplicated: false,
    workspace,
    diff: {
      controlChanges: [],
      createdVariants: [],
      removedVariants: [],
      orderBefore: ["tote-1"],
      orderAfter: ["tote-1"],
      activeVariantBefore: "tote-1",
      activeVariantAfter: "tote-1",
    },
    validation: validation(productionReady),
    previewStatus: "ready-for-capture",
    confirmation: { required: true, choices: ["keep", "revert"], message: "Choose Keep or Revert on the page." },
  };
};

const receipts = (): PreviewArtifactReceipt[] => [{
  artifactId: "preview-22222222-2222-4222-8222-222222222222",
  proposalId: "proposal-11111111-1111-4111-8111-111111111111",
  proposalRevision: 3,
  baseRevision: "tote-revision-1",
  variantId: "tote-1",
  surfaceId: "product-preview",
  mediaType: "image/webp",
  width: 640,
  height: 640,
  integrity: `sha256:${"a".repeat(64)}`,
}];

const committedState = () => {
  const state = proposedState();
  state.revision = "tote-revision-2";
  state.designs[0]!.selections["branding.artwork_ref"] = "saved-private-artwork-handle";
  return state;
};

const context = {
  merchantOrigin: "https://merchant.example",
  editUrl: "https://merchant.example/tote/?reset=true&customer=buyer%40example.com#session-token",
};

describe("studio tote Configuration Passport Keep boundary", () => {
  it("issues nothing before successful Keep and nothing after discarded temporary evidence", async () => {
    const coordinator = new TotePassportCoordinator(authoritativeValidator(), () => "configuration-1");
    expect(await coordinator.confirmSuccessfulKeep(committedState(), "tote-revision-2", context)).toBeNull();

    coordinator.captureBeforeKeep(review(), receipts());
    coordinator.discardPending();
    expect(await coordinator.confirmSuccessfulKeep(committedState(), "tote-revision-2", context)).toBeNull();
    expect(coordinator.issuedCount).toBe(0);
  });

  it("issues exactly once after confirmed Keep, strips artwork handles, and creates Shopify-safe metadata", async () => {
    let idCalls = 0;
    const coordinator = new TotePassportCoordinator(authoritativeValidator(), () => {
      idCalls += 1;
      return "configuration-1";
    });
    coordinator.captureBeforeKeep(review(false), receipts());

    const first = await coordinator.confirmSuccessfulKeep(committedState(), "tote-revision-2", context);
    const second = await coordinator.confirmSuccessfulKeep(committedState(), "tote-revision-2", context);

    expect(first).not.toBeNull();
    expect(second?.passport).toEqual(first?.passport);
    expect(second?.verified).not.toBe(first?.verified);
    expect(idCalls).toBe(1);
    expect(coordinator.issuedCount).toBe(1);
    expect(first?.passport).toMatchObject({
      committedRevision: "tote-revision-2",
      readiness: { configurationValid: true, productionReady: true },
      editUrl: "https://merchant.example/tote/",
    });
    expect(JSON.stringify(first)).not.toMatch(/buyer@example\.com|session-token|reset=true|customer=/i);
    expect(first?.shopifyLineMetadata).toMatchObject({
      _codesign_configuration_id: "configuration-1",
      Design: "100 units · 1 variant · Production ready",
    });
    expect(JSON.stringify(first)).not.toMatch(/asset-private|saved-private|artwork_ref|Untrusted adapter prose|Untrusted assumption/i);
  });

  it("issues a verified saved-draft receipt but no Shopify metadata when production readiness is false", async () => {
    const coordinator = new TotePassportCoordinator(authoritativeValidator(false), () => "configuration-2");
    coordinator.captureBeforeKeep(review(true), receipts());

    const result = await coordinator.confirmSuccessfulKeep(committedState(), "tote-revision-2", context);

    expect(result?.passport.safeSummary.status).toBe("saved-draft");
    expect(result?.shopifyLineMetadata).toBeNull();
    expect(JSON.stringify(result?.passport)).not.toMatch(/artwork_ref|Untrusted adapter prose/i);
  });

  it("fails closed for stale previews, missing variant previews, or a committed state that differs from the proof", async () => {
    const stale = new TotePassportCoordinator(authoritativeValidator(), () => "configuration-3");
    expect(() => stale.captureBeforeKeep(review(), [{ ...receipts()[0]!, proposalRevision: 2 }])).toThrow(/exact kept proposal revision/);

    const changed = new TotePassportCoordinator(authoritativeValidator(), () => "configuration-4");
    changed.captureBeforeKeep(review(), receipts());
    const differentState = committedState();
    differentState.designs[0]!.selections["bag.color"] = "charcoal";
    await expect(changed.confirmSuccessfulKeep(differentState, "tote-revision-2", context)).rejects.toThrow(/differs from the previewed proposal/);
  });

  it("projects only manifest-declared non-asset controls into the public digest input", () => {
    const projected = projectTotePublicConfiguration(committedState());
    expect(projected.variants[0]?.controls).not.toHaveProperty("branding.artwork_ref");
    expect(projected.variants[0]?.controls).toMatchObject({
      "bag.color": "natural",
      "branding.artwork_status": "ready",
      "branding.text": "NORTH FORM",
    });
  });

  it("recomputes current merchant readiness when restoring a stored receipt", async () => {
    const coordinator = new TotePassportCoordinator(authoritativeValidator(), () => "configuration-5");
    coordinator.captureBeforeKeep(review(), receipts());
    const issued = await coordinator.confirmSuccessfulKeep(committedState(), "tote-revision-2", context);
    expect(issued?.passport.readiness.productionReady).toBe(true);

    const restored = await verifyStoredTotePassport(
      issued?.passport,
      committedState(),
      context,
      authoritativeValidator(true),
    );
    expect(restored.shopifyLineMetadata?._codesign_configuration_id).toBe("configuration-5");

    await expect(verifyStoredTotePassport(
      issued?.passport,
      committedState(),
      context,
      authoritativeValidator(false),
    )).rejects.toMatchObject({ code: "READINESS_MISMATCH" });
  });
});
