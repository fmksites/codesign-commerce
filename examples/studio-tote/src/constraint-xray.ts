import type {
  MerchantApprovedRepair,
  NormalizedPreviewRegion,
  ValidationIssue,
  ValidationIssueSource,
  ValidationResult,
} from "@codesign-webmcp/core";
import { TOTE_ARTWORK_SAFE_ZONE } from "./configurator";

export interface ConstraintXRayViewModel {
  issueId: string;
  variantId: string;
  surfaceId: string;
  source: ValidationIssueSource | null;
  message: string;
  normalizedPreviewRegion: NormalizedPreviewRegion;
  repair: MerchantApprovedRepair;
}

export function constraintXRayForVariant(
  validation: ValidationResult,
  variantId: string,
): ConstraintXRayViewModel | null {
  const issue = validation.issues.find((candidate) => (
    candidate.code === TOTE_ARTWORK_SAFE_ZONE.code
    && candidate.designIds?.includes(variantId)
  ));
  if (!issue?.issueId || !issue.surfaceId || !issue.normalizedPreviewRegion || !issue.repairable) return null;
  const repair = issue.merchantApprovedRepairs?.[0];
  if (!repair) return null;
  return {
    issueId: issue.issueId,
    variantId,
    surfaceId: issue.surfaceId,
    source: issue.source ?? null,
    message: issue.message,
    normalizedPreviewRegion: { ...issue.normalizedPreviewRegion },
    repair: structuredClone(repair),
  };
}

export function firstConstraintXRay(
  validation: ValidationResult,
): ValidationIssue | null {
  return validation.issues.find((issue) => issue.code === TOTE_ARTWORK_SAFE_ZONE.code) ?? null;
}

export function constraintXRayExplanation(
  variantName: string,
  issue: Pick<ConstraintXRayViewModel, "source" | "message" | "repair">,
): string {
  const source = validationIssueSourceLabel(issue.source);
  return `${variantName}: ${source} — ${issue.message}. Merchant-approved repair: ${issue.repair.label}.`;
}

export function validationIssueSourceLabel(source: ValidationIssueSource | null | undefined): string {
  switch (source) {
    case "merchant-rule": return "Merchant production rule";
    case "current-configuration": return "Current design state";
    case "renderer-evidence": return "Current renderer evidence";
    case "customer-brief": return "Customer brief";
    default: return "Merchant validation";
  }
}

export function normalizedRegionStyles(region: NormalizedPreviewRegion): Record<"left" | "top" | "width" | "height", string> {
  const percentage = (value: number): string => `${Math.round(value * 1_000_000) / 10_000}%`;
  return {
    left: percentage(region.x),
    top: percentage(region.y),
    width: percentage(region.width),
    height: percentage(region.height),
  };
}
