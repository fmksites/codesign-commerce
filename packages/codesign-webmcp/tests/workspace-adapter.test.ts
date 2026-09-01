import { describe, expect, test } from "vitest";
import {
  GuardedWorkspaceAdapter,
  assertMerchantApprovedRepairBatch,
  MerchantApprovedRepairError,
  WorkspaceAdapterBoundaryError,
  selectMerchantApprovedRepair,
  type CommitMetadata,
  type WorkspaceAdapter,
  type WorkspaceValidationResult,
} from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

function rawAdapter(): WorkspaceAdapter<{ privateSnapshot: string }> {
  return {
    async readWorkspace() { return structuredClone(workspaceTestState); },
    async listAvailability() {
      return {
        committedRevision: workspaceTestState.committedRevision,
        controls: [{ controlId: "body.color", available: true, values: [{ id: "navy", label: "UNTRUSTED" }] }],
      };
    },
    async quiescePersistence() {},
    async captureSnapshot() { return { privateSnapshot: "private" }; },
    async beginProposalMode() {},
    async validateWorkspace(): Promise<WorkspaceValidationResult> {
      return { configurationValid: true, productionReady: false, issues: [], assumptions: [] };
    },
    async previewWorkspace() {},
    async restoreSnapshot() {},
    async commitWorkspace() { return { revision: "workspace-revision-2", localPersisted: true, serverPersisted: true }; },
    async endProposalMode() {},
    subscribeToExternalChanges() { return () => {}; },
  };
}

describe("guarded Manifest 2 workspace adapter", () => {
  test("reconstructs state, availability, validation, and commit outputs", async () => {
    const raw = rawAdapter();
    raw.readWorkspace = async () => ({ ...structuredClone(workspaceTestState), privatePricing: "HIDDEN" } as typeof workspaceTestState);
    raw.listAvailability = async () => ({
      committedRevision: "workspace-revision-1",
      privateField: "HIDDEN",
      controls: [{ controlId: "body.color", available: true, privateField: "HIDDEN", values: [{ id: "navy", label: "HIDDEN", privateField: "HIDDEN" }] }],
    } as never);
    raw.validateWorkspace = async () => ({
      configurationValid: true,
      productionReady: false,
      privateField: "HIDDEN",
      issues: [{ issueId: "artwork-required.variant-1", code: "ARTWORK_REQUIRED", severity: "decision-required", message: "Artwork is required", variantIds: ["variant-1"], repairable: false, privateField: "HIDDEN" }],
      assumptions: [],
    } as never);
    raw.commitWorkspace = async () => ({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: true, privateField: "HIDDEN" } as never);
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);
    const metadata: CommitMetadata = { proposalId: "proposal-test", baseRevision: "workspace-revision-1", operationIds: ["operation-test"], trigger: "confirmed_page_keep" };
    const output = {
      workspace: await guarded.readWorkspace(),
      availability: await guarded.listAvailability({ controlIds: ["body.color"] }),
      validation: await guarded.validateWorkspace(workspaceTestState),
      commit: await guarded.commitWorkspace(workspaceTestState, metadata),
    };
    expect(output.workspace).toEqual(workspaceTestState);
    expect(output.availability.controls[0]!.values).toEqual([{ id: "navy", label: "Navy" }]);
    expect(output.validation.issues[0]).toEqual({ issueId: "artwork-required.variant-1", code: "ARTWORK_REQUIRED", severity: "decision-required", message: "Artwork is required", variantIds: ["variant-1"], repairable: false });
    expect(output.commit).toEqual({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: true });
    expect(JSON.stringify(output)).not.toContain("HIDDEN");
    expect(JSON.stringify(output)).not.toContain("privateField");
  });

  test("migrates legacy validation issues to stable non-repairable public issues", async () => {
    const raw = rawAdapter();
    raw.validateWorkspace = async () => ({
      configurationValid: true,
      productionReady: false,
      issues: [{ code: "ARTWORK_REQUIRED", severity: "decision-required", message: "Artwork is required", variantIds: ["variant-1"] }],
      assumptions: [],
    });
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);

    await expect(guarded.validateWorkspace(workspaceTestState)).resolves.toMatchObject({
      issues: [{
        issueId: "legacy-1-ARTWORK_REQUIRED",
        code: "ARTWORK_REQUIRED",
        repairable: false,
      }],
    });
  });

  test("fails closed on malformed nested adapter data", async () => {
    const raw = rawAdapter();
    raw.readWorkspace = async () => ({ ...structuredClone(workspaceTestState), variants: [{ ...workspaceTestState.variants[0]!, controls: { "body.color": "secret-color" } }] });
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);
    await expect(guarded.readWorkspace()).rejects.toBeInstanceOf(WorkspaceAdapterBoundaryError);
  });

  test("sanitizes expected server failure without broadening the contract", async () => {
    const raw = rawAdapter();
    raw.commitWorkspace = async () => ({ revision: "workspace-revision-local", localPersisted: true, serverPersisted: false, errorCode: "SAVE_RETRY", stack: "HIDDEN" } as never);
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);
    await expect(guarded.commitWorkspace(workspaceTestState, {
      proposalId: "proposal-test", baseRevision: "workspace-revision-1", operationIds: ["operation-test"], trigger: "confirmed_page_keep",
    })).resolves.toEqual({ revision: "workspace-revision-local", localPersisted: true, serverPersisted: false, errorCode: "SAVE_RETRY" });
  });

  test("reconstructs a localized issue with one bounded merchant-approved repair", async () => {
    const raw = rawAdapter();
    raw.validateWorkspace = async () => ({
      configurationValid: true,
      productionReady: false,
      issues: [{
        issueId: "safe-zone.variant-1",
        code: "SAFE_ZONE",
        severity: "decision-required",
        source: "merchant-rule",
        message: "The mark exceeds the merchant safe area",
        controlIds: ["body.color"],
        variantIds: ["variant-1"],
        surfaceId: "product-preview",
        normalizedPreviewRegion: { x: 0.2, y: 0.25, width: 0.3, height: 0.35, privateField: "HIDDEN" },
        repairable: true,
        merchantApprovedRepairs: [{
          id: "use-navy",
          label: "Use navy",
          operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
          privateField: "HIDDEN",
        }],
        privateField: "HIDDEN",
      }],
      assumptions: [],
    } as never);
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);

    const result = await guarded.validateWorkspace(workspaceTestState);
    expect(result).toEqual({
      configurationValid: true,
      productionReady: false,
      issues: [{
        issueId: "safe-zone.variant-1",
        code: "SAFE_ZONE",
        severity: "decision-required",
        source: "merchant-rule",
        message: "The mark exceeds the merchant safe area",
        controlIds: ["body.color"],
        variantIds: ["variant-1"],
        surfaceId: "product-preview",
        normalizedPreviewRegion: { x: 0.2, y: 0.25, width: 0.3, height: 0.35 },
        repairable: true,
        merchantApprovedRepairs: [{
          id: "use-navy",
          label: "Use navy",
          operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
        }],
      }],
      assumptions: [],
    });
    const issue = result.issues[0]!;
    const approved = issue.merchantApprovedRepairs![0]!;
    expect(selectMerchantApprovedRepair(issue, approved.id, approved.operations)).toEqual(approved.operations);
    expect(() => selectMerchantApprovedRepair(issue, approved.id, [{
      type: "set-control",
      target: { scope: "variant", variantId: "variant-1" },
      controlId: "body.color",
      value: "rose",
    }])).toThrow(MerchantApprovedRepairError);
    expect(() => selectMerchantApprovedRepair(issue, "invented-repair", approved.operations)).toThrow(MerchantApprovedRepairError);
  });

  test("fails closed when an adapter invents an untrusted validation source", async () => {
    const raw = rawAdapter();
    raw.validateWorkspace = async () => ({
      configurationValid: true,
      productionReady: false,
      issues: [{
        issueId: "safe-zone.variant-1",
        code: "SAFE_ZONE",
        severity: "decision-required",
        source: "supplier-private-system",
        message: "The mark exceeds the merchant safe area",
        variantIds: ["variant-1"],
        repairable: false,
      }],
      assumptions: [],
    } as never);
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);

    await expect(guarded.validateWorkspace(workspaceTestState)).rejects.toBeInstanceOf(WorkspaceAdapterBoundaryError);
  });

  test("requires an exact standalone merchant repair batch when affected controls are touched", () => {
    const issue = {
      issueId: "safe-zone.variant-1",
      code: "SAFE_ZONE",
      severity: "decision-required" as const,
      message: "The mark exceeds the safe area",
      controlIds: ["body.color"],
      variantIds: ["variant-1"],
      repairable: true,
      merchantApprovedRepairs: [{
        id: "use-navy",
        label: "Use navy",
        operations: [{
          type: "set-control" as const,
          target: { scope: "variant" as const, variantId: "variant-1" },
          controlId: "body.color",
          value: "navy",
        }],
      }],
    };
    const validation = { configurationValid: true, productionReady: false, issues: [issue], assumptions: [] };

    expect(() => assertMerchantApprovedRepairBatch(validation, issue.merchantApprovedRepairs[0]!.operations)).not.toThrow();
    expect(() => assertMerchantApprovedRepairBatch(validation, [{
      type: "set-control",
      target: { scope: "variant", variantId: "variant-1" },
      controlId: "body.color",
      value: "rose",
    }])).toThrow(MerchantApprovedRepairError);
    expect(() => assertMerchantApprovedRepairBatch(validation, [
      ...issue.merchantApprovedRepairs[0]!.operations,
      { type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "accent.color", value: "cream" },
    ])).toThrow(MerchantApprovedRepairError);
    expect(() => assertMerchantApprovedRepairBatch(validation, [{
      type: "set-control",
      target: { scope: "variant", variantId: "variant-1" },
      controlId: "accent.color",
      value: "cream",
    }])).not.toThrow();
    expect(() => assertMerchantApprovedRepairBatch(validation, [{
      type: "remove-variant",
      variantId: "variant-1",
    }])).toThrow(MerchantApprovedRepairError);
    expect(() => assertMerchantApprovedRepairBatch(validation, [{
      type: "duplicate-variant",
      sourceVariantId: "variant-1",
      variantId: "variant-copy",
    }])).toThrow(MerchantApprovedRepairError);
    expect(() => assertMerchantApprovedRepairBatch(validation, [{
      type: "remove-variant",
      variantId: "variant-2",
    }])).not.toThrow();
  });

  test("cannot bypass a repair allowlist through workspace or asset operations", () => {
    const workspaceIssue = {
      issueId: "quantity.variant-1",
      code: "QUANTITY_LIMIT",
      severity: "decision-required" as const,
      message: "The quantity needs a merchant-approved repair",
      controlIds: ["order.total_quantity"],
      variantIds: ["variant-1"],
      repairable: true,
      merchantApprovedRepairs: [{
        id: "set-safe-total",
        label: "Use the safe total",
        operations: [{
          type: "set-control" as const,
          target: { scope: "workspace" as const },
          controlId: "order.total_quantity",
          value: 100,
        }],
      }],
    };
    const assetIssue = {
      issueId: "artwork.variant-1",
      code: "ARTWORK_REPAIR",
      severity: "decision-required" as const,
      message: "The artwork needs a merchant-approved repair",
      controlIds: ["mark.artwork"],
      variantIds: ["variant-1"],
      elementIds: ["mark-1"],
      repairable: true,
      merchantApprovedRepairs: [{
        id: "clear-artwork-state",
        label: "Clear the artwork state",
        operations: [{
          type: "set-control" as const,
          target: { scope: "element" as const, variantId: "variant-1", elementId: "mark-1" },
          controlId: "mark.artwork",
          value: null,
        }],
      }],
    };

    expect(() => assertMerchantApprovedRepairBatch(
      { configurationValid: true, productionReady: false, issues: [workspaceIssue], assumptions: [] },
      [{ type: "set-control", target: { scope: "workspace" }, controlId: "order.total_quantity", value: 99 }],
    )).toThrow(MerchantApprovedRepairError);
    expect(() => assertMerchantApprovedRepairBatch(
      { configurationValid: true, productionReady: false, issues: [assetIssue], assumptions: [] },
      [{
        type: "attach-asset",
        target: { scope: "element", variantId: "variant-1", elementId: "mark-1" },
        controlId: "mark.artwork",
        assetHandle: "asset-new",
      }],
    )).toThrow(MerchantApprovedRepairError);
    expect(() => assertMerchantApprovedRepairBatch(
      { configurationValid: true, productionReady: false, issues: [assetIssue], assumptions: [] },
      [{
        type: "remove-asset",
        target: { scope: "element", variantId: "variant-1", elementId: "mark-1" },
        controlId: "mark.artwork",
      }],
    )).toThrow(MerchantApprovedRepairError);
  });

  test("fails closed when a declared repair reaches outside the issue controls", async () => {
    const raw = rawAdapter();
    raw.validateWorkspace = async () => ({
      configurationValid: true,
      productionReady: false,
      issues: [{
        issueId: "safe-zone.variant-1",
        code: "SAFE_ZONE",
        severity: "decision-required",
        message: "The mark exceeds the merchant safe area",
        controlIds: ["body.color"],
        variantIds: ["variant-1"],
        repairable: true,
        merchantApprovedRepairs: [{
          id: "change-unrelated-accent",
          label: "Change unrelated accent",
          operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "accent.color", value: "cream" }],
        }],
      }],
      assumptions: [],
    } as never);
    const guarded = new GuardedWorkspaceAdapter(workspaceTestManifest, raw);

    await expect(guarded.validateWorkspace(workspaceTestState)).rejects.toBeInstanceOf(WorkspaceAdapterBoundaryError);
  });
});
