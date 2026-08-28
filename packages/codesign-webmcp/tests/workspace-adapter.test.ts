import { describe, expect, test } from "vitest";
import {
  GuardedWorkspaceAdapter,
  WorkspaceAdapterBoundaryError,
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
      issues: [{ code: "ARTWORK_REQUIRED", severity: "decision-required", message: "Artwork is required", variantIds: ["variant-1"], privateField: "HIDDEN" }],
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
    expect(output.validation.issues[0]).toEqual({ code: "ARTWORK_REQUIRED", severity: "decision-required", message: "Artwork is required", variantIds: ["variant-1"] });
    expect(output.commit).toEqual({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: true });
    expect(JSON.stringify(output)).not.toContain("HIDDEN");
    expect(JSON.stringify(output)).not.toContain("privateField");
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
});
