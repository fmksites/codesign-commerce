import type {
  PreviewArtifactReceipt,
  ProposalEngineSnapshot,
} from "@codesign-webmcp/core";

export interface VariantPreviewEvidence {
  capturedRevision: number;
  replacedRevision?: number;
}

export type VariantPreviewEvidenceMap = Readonly<Record<string, VariantPreviewEvidence>>;

export type PreviewFreshnessTone = "current" | "outdated" | "refreshing" | "pending" | "unavailable";

export interface PreviewFreshnessViewModel {
  tone: PreviewFreshnessTone;
  label: string;
  description: string;
}

export function recordPreviewEvidence(
  current: VariantPreviewEvidenceMap,
  receipts: readonly PreviewArtifactReceipt[],
): VariantPreviewEvidenceMap {
  const next: Record<string, VariantPreviewEvidence> = structuredClone(current);
  for (const receipt of receipts) {
    const previous = next[receipt.variantId];
    next[receipt.variantId] = {
      capturedRevision: receipt.proposalRevision,
      ...(previous && previous.capturedRevision !== receipt.proposalRevision
        ? { replacedRevision: previous.capturedRevision }
        : previous?.replacedRevision === undefined ? {} : { replacedRevision: previous.replacedRevision }),
    };
  }
  return next;
}

export function previewFreshnessForVariant(
  snapshot: Readonly<ProposalEngineSnapshot>,
  evidence: VariantPreviewEvidence | undefined,
): PreviewFreshnessViewModel | null {
  if (snapshot.proposalId === null) return null;
  if (snapshot.status === "capturing-preview") {
    return {
      tone: "refreshing",
      label: "Checking updated preview…",
      description: `Capturing a preview for current proposal revision ${snapshot.proposalRevision}.`,
    };
  }
  if (snapshot.previewStatus === "unavailable") {
    return {
      tone: "unavailable",
      label: "Preview unavailable",
      description: "The current proposal cannot be kept until a preview can be inspected.",
    };
  }
  if (snapshot.previewStatus === "available" && evidence?.capturedRevision === snapshot.proposalRevision) {
    const replacement = evidence.replacedRevision === undefined
      ? ""
      : ` It replaces outdated revision ${evidence.replacedRevision}.`;
    return {
      tone: "current",
      label: `Current preview · revision ${snapshot.proposalRevision}`,
      description: `This preview is verified for current proposal revision ${snapshot.proposalRevision}.${replacement}`,
    };
  }
  if (evidence && evidence.capturedRevision < snapshot.proposalRevision) {
    return {
      tone: "outdated",
      label: `Outdated preview · revision ${evidence.capturedRevision}`,
      description: `The design changed in revision ${snapshot.proposalRevision}. Capture a new preview before Keep is available.`,
    };
  }
  return {
    tone: "pending",
    label: `Preview not checked · revision ${snapshot.proposalRevision}`,
    description: `Capture and inspect a preview for current proposal revision ${snapshot.proposalRevision} before Keep is available.`,
  };
}
