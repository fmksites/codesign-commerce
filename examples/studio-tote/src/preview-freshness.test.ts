import { describe, expect, it } from "vitest";
import type { PreviewArtifactReceipt, ProposalEngineSnapshot } from "@codesign-webmcp/core";
import {
  previewFreshnessForVariant,
  recordPreviewEvidence,
} from "./preview-freshness";

const snapshot = (overrides: Partial<ProposalEngineSnapshot> = {}): ProposalEngineSnapshot => ({
  status: "reviewable",
  proposalId: "proposal-tote",
  proposalRevision: 3,
  baseRevision: "tote-revision-1",
  committedRevision: "tote-revision-1",
  previewStatus: "available",
  ...overrides,
});

const receipt = (proposalRevision: number, variantId = "tote-2"): PreviewArtifactReceipt => ({
  artifactId: `preview-${variantId}-${proposalRevision}`,
  proposalId: "proposal-tote",
  proposalRevision,
  baseRevision: "tote-revision-1",
  variantId,
  surfaceId: "product-preview",
  mediaType: "image/webp",
  width: 640,
  height: 640,
  integrity: `sha256:${"a".repeat(64)}`,
});

describe("studio tote preview freshness", () => {
  it("shows current evidence for the exact proposal revision", () => {
    const evidence = recordPreviewEvidence({}, [receipt(3)]);
    expect(previewFreshnessForVariant(snapshot(), evidence["tote-2"])).toEqual({
      tone: "current",
      label: "Current preview · revision 3",
      description: "This preview is verified for current proposal revision 3.",
    });
  });

  it("marks an earlier preview outdated after the proposal advances", () => {
    const evidence = recordPreviewEvidence({}, [receipt(3)]);
    expect(previewFreshnessForVariant(snapshot({ proposalRevision: 4, previewStatus: "ready-for-capture" }), evidence["tote-2"])).toEqual({
      tone: "outdated",
      label: "Outdated preview · revision 3",
      description: "The design changed in revision 4. Capture a new preview before Keep is available.",
    });
  });

  it("records which outdated revision a fresh capture replaced", () => {
    const before = recordPreviewEvidence({}, [receipt(3)]);
    const after = recordPreviewEvidence(before, [receipt(4)]);
    expect(previewFreshnessForVariant(snapshot({ proposalRevision: 4 }), after["tote-2"])).toEqual({
      tone: "current",
      label: "Current preview · revision 4",
      description: "This preview is verified for current proposal revision 4. It replaces outdated revision 3.",
    });
  });

  it("distinguishes first capture, active capture, unavailable evidence, and ordinary human mode", () => {
    expect(previewFreshnessForVariant(snapshot({ previewStatus: "ready-for-capture" }), undefined)?.tone).toBe("pending");
    expect(previewFreshnessForVariant(snapshot({ status: "capturing-preview", previewStatus: "ready-for-capture" }), undefined)?.tone).toBe("refreshing");
    expect(previewFreshnessForVariant(snapshot({ status: "preview-unavailable", previewStatus: "unavailable" }), undefined)?.tone).toBe("unavailable");
    expect(previewFreshnessForVariant(snapshot({ proposalId: null, proposalRevision: 0, previewStatus: "none" }), undefined)).toBeNull();
  });
});
