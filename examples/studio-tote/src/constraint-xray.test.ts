import { describe, expect, it } from "vitest";
import type { ValidationResult } from "@codesign-webmcp/core";
import {
  constraintXRayExplanation,
  constraintXRayForVariant,
  normalizedRegionStyles,
} from "./constraint-xray";

const validation: ValidationResult = {
  configurationValid: true,
  productionReady: false,
  issues: [{
    issueId: "artwork-safe-zone.tote-2",
    code: "ARTWORK_SAFE_ZONE",
    severity: "decision-required",
    source: "merchant-rule",
    message: "Artwork exceeds the approved upper-left print safe area on charcoal canvas",
    optionIds: ["bag.color", "print.position", "branding.scale"],
    designIds: ["tote-2"],
    surfaceId: "product-preview",
    normalizedPreviewRegion: { x: 0.32, y: 0.39, width: 0.14, height: 0.14 },
    repairable: true,
    merchantApprovedRepairs: [{
      id: "reduce-artwork-to-safe-scale",
      label: "Reduce artwork scale to 78%",
      operations: [{
        type: "set-control",
        target: { scope: "variant", variantId: "tote-2" },
        controlId: "branding.scale",
        value: 0.78,
      }],
    }],
  }],
  assumptions: [],
};

describe("studio tote Constraint X-Ray view model", () => {
  it("localizes the merchant issue and declared repair to only the affected variant", () => {
    expect(constraintXRayForVariant(validation, "tote-1")).toBeNull();
    const xray = constraintXRayForVariant(validation, "tote-2");
    expect(xray).toMatchObject({
      issueId: "artwork-safe-zone.tote-2",
      variantId: "tote-2",
      surfaceId: "product-preview",
      source: "merchant-rule",
      repair: {
        id: "reduce-artwork-to-safe-scale",
        operations: [{ controlId: "branding.scale", value: 0.78 }],
      },
    });
    expect(constraintXRayExplanation("North Form Charcoal", xray!)).toContain("Merchant production rule");
    expect(constraintXRayExplanation("North Form Charcoal", xray!)).toContain("Merchant-approved repair: Reduce artwork scale to 78%");
  });

  it("converts normalized coordinates into deterministic preview percentages", () => {
    expect(normalizedRegionStyles(validation.issues[0]!.normalizedPreviewRegion!)).toEqual({
      left: "32%",
      top: "39%",
      width: "14%",
      height: "14%",
    });
  });
});
