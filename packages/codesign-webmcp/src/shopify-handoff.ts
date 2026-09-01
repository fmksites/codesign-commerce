import { formatConfigurationPassportSafeSummary, isVerifiedConfigurationPassport, type VerifiedConfigurationPassport } from "./configuration-passport.js";

export type ShopifyHandoffErrorCode = "UNVERIFIED_PASSPORT" | "NOT_PRODUCTION_READY";

export class ShopifyHandoffError extends Error {
  constructor(readonly code: ShopifyHandoffErrorCode, message: string) {
    super(message);
    this.name = "ShopifyHandoffError";
  }
}

export interface ShopifyLineMetadata {
  _codesign_configuration_id: string;
  _codesign_configuration_digest: string;
  Design: string;
  _codesign_edit_url: string;
}

/**
 * Maps an already verified, production-ready passport to Shopify line-item
 * properties. This function performs no cart write and exposes no catalog,
 * price, customer, artwork, or merchant-private data.
 */
export function toShopifyLineMetadata(value: VerifiedConfigurationPassport): Readonly<ShopifyLineMetadata> {
  if (!isVerifiedConfigurationPassport(value) || value.readinessBinding !== "merchant-authoritative-current") {
    throw new ShopifyHandoffError("UNVERIFIED_PASSPORT", "Shopify metadata requires a passport bound to current merchant validation in this runtime");
  }
  const { passport } = value;
  if (!passport.readiness.configurationValid || !passport.readiness.productionReady) {
    throw new ShopifyHandoffError("NOT_PRODUCTION_READY", "Shopify metadata is unavailable until the kept configuration is production-ready");
  }
  return Object.freeze({
    _codesign_configuration_id: passport.configurationId,
    _codesign_configuration_digest: passport.configurationDigest,
    Design: formatConfigurationPassportSafeSummary(passport.safeSummary),
    _codesign_edit_url: passport.editUrl,
  });
}
