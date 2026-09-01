import { describe, expect, test } from "vitest";
import {
  CONFIGURATION_PASSPORT_VERSION,
  createConfigurationPassport,
  toShopifyLineMetadata,
  verifyConfigurationPassport,
  type CreateConfigurationPassportInput,
  type PublicSafeConfiguration,
  type VerifiedConfigurationPassport,
} from "../src/index.js";

const configuration: PublicSafeConfiguration = {
  configuratorId: "codesign.studio-tote-reference",
  manifestVersion: "2.1.0",
  committedRevision: "tote-revision-2",
  activeVariantId: "tote-1",
  workspaceControls: { "order.total_quantity": 100 },
  variants: [{
    id: "tote-1",
    name: "North Form tote",
    controls: { "design.quantity": 100, "branding.artwork_status": "ready" },
    elements: [],
  }],
};

const verificationPolicy = (productionReady: boolean) => ({
  merchantOrigin: "https://merchant.example",
  configuratorId: configuration.configuratorId,
  manifestVersion: configuration.manifestVersion,
  rendererVersion: "renderer-2026.09.01",
  authoritativeReadiness: {
    configurationValid: true,
    productionReady,
    issues: productionReady ? [] : [{
      code: "FINAL_PRINT_ARTWORK_REQUIRED",
      severity: "decision-required" as const,
      variantIds: ["tote-1"],
    }],
  },
});

const input = (productionReady: boolean): CreateConfigurationPassportInput => ({
  passportVersion: CONFIGURATION_PASSPORT_VERSION,
  merchantOrigin: "https://merchant.example",
  configuratorId: configuration.configuratorId,
  configurationId: "configuration-42",
  committedRevision: configuration.committedRevision,
  manifestVersion: configuration.manifestVersion,
  rendererVersion: "renderer-2026.09.01",
  previewReceipts: [{
    artifactId: "preview-11111111-1111-4111-8111-111111111111",
    proposalId: "proposal-22222222-2222-4222-8222-222222222222",
    proposalRevision: 1,
    baseRevision: "tote-revision-1",
    variantId: "tote-1",
    surfaceId: "front",
    mediaType: "image/webp",
    width: 640,
    height: 640,
    integrity: `sha256:${"a".repeat(64)}`,
  }],
  readiness: {
    configurationValid: true,
    productionReady,
    issues: productionReady ? [] : [{
      code: "FINAL_PRINT_ARTWORK_REQUIRED",
      severity: "decision-required",
      variantIds: ["tote-1"],
    }],
  },
  safeSummary: { itemCount: 100, variantCount: 1, status: productionReady ? "production-ready" : "saved-draft" },
  editUrl: "https://merchant.example/designs/configuration-42",
  publicConfiguration: configuration,
});

describe("Shopify Configuration Passport handoff", () => {
  test("maps only the four public-safe line-item properties from a verified production-ready passport", async () => {
    const passport = await createConfigurationPassport(input(true));
    const verified = await verifyConfigurationPassport(passport, configuration, verificationPolicy(true));

    const metadata = toShopifyLineMetadata(verified);

    expect(metadata).toEqual({
      _codesign_configuration_id: "configuration-42",
      _codesign_configuration_digest: passport.configurationDigest,
      Design: "100 units · 1 variant · Production ready",
      _codesign_edit_url: "https://merchant.example/designs/configuration-42",
    });
    expect(Object.keys(metadata)).toEqual([
      "_codesign_configuration_id",
      "_codesign_configuration_digest",
      "Design",
      "_codesign_edit_url",
    ]);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(JSON.stringify(metadata)).not.toMatch(/artwork|customer|price|supplier|token|proposal|renderer/i);
  });

  test("rejects a structurally valid passport that was not verified in this runtime", async () => {
    const passport = await createConfigurationPassport(input(true));
    const forged = { passport, publicConfiguration: configuration } as unknown as VerifiedConfigurationPassport;

    expect(() => toShopifyLineMetadata(forged)).toThrowError(expect.objectContaining({ code: "UNVERIFIED_PASSPORT" }));
  });

  test("keeps valid saved drafts out of the Shopify cart handoff", async () => {
    const passport = await createConfigurationPassport(input(false));
    const verified = await verifyConfigurationPassport(passport, configuration, verificationPolicy(false));

    expect(() => toShopifyLineMetadata(verified)).toThrowError(expect.objectContaining({ code: "NOT_PRODUCTION_READY" }));
  });

  test("rejects a self-asserted ready receipt when current merchant validation is blocked", async () => {
    const passport = await createConfigurationPassport(input(true));

    await expect(verifyConfigurationPassport(passport, configuration, verificationPolicy(false)))
      .rejects.toMatchObject({ code: "READINESS_MISMATCH" });
  });
});
