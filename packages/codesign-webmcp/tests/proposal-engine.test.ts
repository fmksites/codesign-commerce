import { describe, expect, test } from "vitest";
import {
  ProposalEngine,
  type AvailabilityResult,
  type CommitMetadata,
  type CommitResult,
  type ProposalContext,
  type ProposalEndReason,
  type WorkspaceAdapter,
  type WorkspaceState,
  type WorkspaceValidationResult,
} from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

type HookName = "quiesce" | "read" | "capture" | "begin" | "validate" | "preview";
type Hook = () => void | Promise<void>;
interface TestSnapshot { committed: WorkspaceState; visible: WorkspaceState }

class TestWorkspaceAdapter implements WorkspaceAdapter<TestSnapshot> {
  committed = structuredClone(workspaceTestState);
  visible = structuredClone(workspaceTestState);
  proposalMode = false;
  hooks: Partial<Record<HookName, Hook>> = {};
  listeners = new Set<(revision: string) => void>();
  commits = new Map<string, string>();
  serverFailuresRemaining = 0;
  restoreFailuresRemaining = 0;
  unknownCommitOutcome = false;
  externalCounter = 0;
  counters = {
    quiesce: 0, read: 0, capture: 0, begin: 0, validate: 0, preview: 0, restore: 0,
    commit: 0, localWrites: 0, serverAttempts: 0, end: 0,
  };
  endReasons: ProposalEndReason[] = [];

  async #hook(name: HookName) { await this.hooks[name]?.(); }

  async readWorkspace(): Promise<WorkspaceState> {
    this.counters.read += 1;
    await this.#hook("read");
    return structuredClone(this.committed);
  }

  async listAvailability(): Promise<AvailabilityResult> {
    return { committedRevision: this.committed.committedRevision, controls: [] };
  }

  async quiescePersistence(): Promise<void> {
    this.counters.quiesce += 1;
    await this.#hook("quiesce");
  }

  async captureSnapshot(): Promise<TestSnapshot> {
    this.counters.capture += 1;
    const snapshot = { committed: structuredClone(this.committed), visible: structuredClone(this.visible) };
    await this.#hook("capture");
    return snapshot;
  }

  async beginProposalMode(_context: ProposalContext): Promise<void> {
    this.counters.begin += 1;
    this.proposalMode = true;
    await this.#hook("begin");
  }

  async validateWorkspace(workspace: WorkspaceState): Promise<WorkspaceValidationResult> {
    this.counters.validate += 1;
    await this.#hook("validate");
    const total = workspace.workspaceControls["order.total_quantity"];
    const allocated = workspace.variants.reduce((sum, variant) => sum + Number(variant.controls["design.quantity"]), 0);
    const configurationValid = total === allocated;
    return {
      configurationValid,
      productionReady: configurationValid,
      issues: configurationValid ? [] : [{
        code: "QUANTITY_TOTAL_MISMATCH",
        severity: "constraint-error",
        message: "Variant quantities must equal the workspace total",
        controlIds: ["order.total_quantity", "design.quantity"],
      }],
      assumptions: [],
    };
  }

  async previewWorkspace(workspace: WorkspaceState): Promise<void> {
    this.counters.preview += 1;
    this.visible = structuredClone(workspace);
    await this.#hook("preview");
  }

  async restoreSnapshot(snapshot: TestSnapshot): Promise<void> {
    this.counters.restore += 1;
    if (this.restoreFailuresRemaining > 0) {
      this.restoreFailuresRemaining -= 1;
      throw new Error("private restore failure");
    }
    this.visible = structuredClone(snapshot.visible);
  }

  async commitWorkspace(workspace: WorkspaceState, metadata: CommitMetadata): Promise<CommitResult> {
    this.counters.commit += 1;
    let revision = this.commits.get(metadata.proposalId);
    if (!revision) {
      if (this.committed.committedRevision !== metadata.baseRevision) {
        return { revision: this.committed.committedRevision, localPersisted: false, serverPersisted: false, errorCode: "STALE_REVISION" };
      }
      revision = `workspace-revision-${this.commits.size + 2}`;
      this.commits.set(metadata.proposalId, revision);
      this.committed = { ...structuredClone(workspace), committedRevision: revision };
      this.visible = structuredClone(this.committed);
      this.counters.localWrites += 1;
      for (const listener of this.listeners) listener(revision);
    }
    if (this.unknownCommitOutcome) throw new Error("private stack");
    this.counters.serverAttempts += 1;
    if (this.serverFailuresRemaining > 0) {
      this.serverFailuresRemaining -= 1;
      return { revision, localPersisted: true, serverPersisted: false, errorCode: "SAVE_RETRY" };
    }
    return { revision, localPersisted: true, serverPersisted: true };
  }

  async endProposalMode(reason: ProposalEndReason): Promise<void> {
    this.counters.end += 1;
    this.endReasons.push(reason);
    this.proposalMode = false;
  }

  subscribeToExternalChanges(listener: (revision: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  externalChange(): void {
    this.externalCounter += 1;
    const revision = `external-revision-${this.externalCounter}`;
    this.committed = {
      ...structuredClone(this.committed),
      committedRevision: revision,
      variants: this.committed.variants.map((variant, index) => index === 0
        ? { ...variant, controls: { ...variant.controls, "body.color": "rose" } }
        : variant),
    };
    this.visible = structuredClone(this.committed);
    for (const listener of this.listeners) listener(revision);
  }
}

const firstInput = (operationId = "first-direction") => ({
  baseRevision: "workspace-revision-1",
  operationId,
  operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
});

describe("Manifest 2 proposal transaction engine", () => {
  test("opens proposal mode, previews without writes, and Reverts exactly", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const proposed = await engine.apply(firstInput());
    expect(proposed).toMatchObject({ ok: true, persisted: false, proposalRevision: 1 });
    expect(engine.status).toBe("reviewable");
    expect(adapter.proposalMode).toBe(true);
    expect(adapter.visible.variants[0]!.controls["body.color"]).toBe("navy");
    expect(adapter.committed.variants[0]!.controls["body.color"]).toBe("cream");
    expect(adapter.counters).toMatchObject({ quiesce: 1, read: 1, capture: 1, begin: 1, validate: 1, preview: 1, localWrites: 0, commit: 0 });
    await expect(engine.revert()).resolves.toEqual({ reverted: true, persisted: false });
    expect(adapter.visible).toEqual(workspaceTestState);
    expect(adapter.counters.restore).toBe(1);
    expect(adapter.endReasons).toEqual(["reverted"]);
    expect(engine.status).toBe("idle");
  });

  test("invalid first proposals restore baseline; invalid refinements retain the last proposal", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const invalidFirst = await engine.apply({
      baseRevision: "workspace-revision-1",
      operationId: "invalid-total",
      operations: [{ type: "set-control", target: { scope: "workspace" }, controlId: "order.total_quantity", value: 100 }],
    });
    expect(invalidFirst).toMatchObject({
      ok: false,
      error: {
        code: "INVALID_VALUE",
        message: expect.stringContaining("QUANTITY_TOTAL_MISMATCH"),
      },
      validation: {
        configurationValid: false,
        issues: [expect.objectContaining({ code: "QUANTITY_TOTAL_MISMATCH", severity: "constraint-error" })],
      },
    });
    expect(engine.status).toBe("idle");
    expect(adapter.counters.restore).toBe(1);
    expect(adapter.endReasons).toEqual(["invalid"]);

    const first = await engine.apply(firstInput("valid-first"));
    if (!first.ok) throw new Error("expected proposal");
    const inspected = structuredClone(adapter.visible);
    const invalidRefinement = await engine.apply({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "invalid-refinement",
      operations: [{ type: "set-control", target: { scope: "element", variantId: "variant-1", elementId: "missing" }, controlId: "mark.scale", value: 1.2 }],
    });
    expect(invalidRefinement).toMatchObject({ ok: false, error: { code: "UNKNOWN_ELEMENT" } });
    expect(engine.status).toBe("reviewable");
    expect(adapter.visible).toEqual(inspected);
  });

  test("a partially failing begin hook still restores the captured baseline", async () => {
    const adapter = new TestWorkspaceAdapter();
    adapter.hooks.begin = () => { throw new Error("private begin failure"); };
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await expect(engine.apply(firstInput())).resolves.toMatchObject({ ok: false, error: { code: "ADAPTER_FAILURE" } });
    expect(adapter.counters).toMatchObject({ capture: 1, begin: 1, restore: 1, end: 1, localWrites: 0 });
    expect(adapter.visible).toEqual(workspaceTestState);
    expect(adapter.endReasons).toEqual(["invalid"]);
    expect(engine.status).toBe("idle");
  });

  test("a failed exact restore quarantines the proposal until committed state is resynchronized", async () => {
    const adapter = new TestWorkspaceAdapter();
    adapter.restoreFailuresRemaining = 1;
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const result = await engine.apply({
      baseRevision: "workspace-revision-1",
      operationId: "invalid-needs-restore",
      operations: [{ type: "set-control", target: { scope: "workspace" }, controlId: "order.total_quantity", value: 100 }],
    });
    expect(result).toMatchObject({ ok: false, error: { code: "ADAPTER_FAILURE" } });
    expect(engine.status).toBe("stale");
    await expect(engine.resynchronize()).resolves.toEqual({ resynchronized: true, persisted: false, revision: "workspace-revision-1" });
    expect(adapter.visible).toEqual(adapter.committed);
    expect(engine.status).toBe("idle");
  });

  test.each<HookName>(["quiesce", "read", "capture", "begin", "validate", "preview"])("detects an external revision after the %s boundary", async (boundary) => {
    const adapter = new TestWorkspaceAdapter();
    adapter.hooks[boundary] = () => adapter.externalChange();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const result = await engine.apply(firstInput(`external-${boundary}`));
    expect(result).toMatchObject({ ok: false, error: { code: "STALE_REVISION" } });
    expect(engine.status).toBe("idle");
    expect(adapter.counters.commit).toBe(0);
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.visible).toEqual(adapter.committed);
  });

  test.each<HookName>(["quiesce", "read", "capture", "begin", "validate", "preview"])("cancels and restores safely after the %s boundary", async (boundary) => {
    const adapter = new TestWorkspaceAdapter();
    const controller = new AbortController();
    adapter.hooks[boundary] = () => controller.abort();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const result = await engine.apply(firstInput(`cancel-${boundary}`), { signal: controller.signal });
    expect(result).toMatchObject({ ok: false, error: { code: "CANCELLED" } });
    expect(engine.status).toBe("idle");
    expect(adapter.counters.localWrites).toBe(0);
    expect(adapter.visible).toEqual(adapter.committed);
  });

  test("preserves a reviewable proposal when a refinement is cancelled during preview", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const first = await engine.apply(firstInput());
    if (!first.ok) throw new Error("expected proposal");
    const inspected = structuredClone(adapter.visible);
    const controller = new AbortController();
    adapter.hooks.preview = () => controller.abort();
    const result = await engine.apply({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "cancel-refinement",
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "accent.color", value: "berry" }],
    }, { signal: controller.signal });
    expect(result).toMatchObject({ ok: false, error: { code: "CANCELLED" } });
    expect(engine.status).toBe("reviewable");
    expect(adapter.visible).toEqual(inspected);

    // The cancelled operation ID was never accepted, so an exact retry may
    // still become the next proposal revision.
    delete adapter.hooks.preview;
    await expect(engine.apply({
      baseRevision: first.baseRevision,
      proposalId: first.proposalId,
      proposalRevision: first.proposalRevision,
      operationId: "cancel-refinement",
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "accent.color", value: "berry" }],
    })).resolves.toMatchObject({ ok: true, proposalRevision: 2, deduplicated: false });
  });

  test("deduplicates an exact retry of the initial operation without proposal identity", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const input = firstInput("lost-first-response");
    const first = await engine.apply(input);
    expect(first).toMatchObject({ ok: true, proposalRevision: 1, deduplicated: false });

    const retry = await engine.apply(input);
    expect(retry).toMatchObject({
      ok: true,
      proposalId: first.ok ? first.proposalId : undefined,
      proposalRevision: 1,
      deduplicated: true,
    });
    expect(adapter.counters).toMatchObject({ validate: 1, preview: 1, localWrites: 0 });
  });

  test("rejects a conflicting reuse of the initial operation identifier", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await expect(engine.apply(firstInput("conflicting-first-response"))).resolves.toMatchObject({ ok: true });

    await expect(engine.apply({
      ...firstInput("conflicting-first-response"),
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "rose" }],
    })).resolves.toMatchObject({ ok: false, error: { code: "OPERATION_ID_CONFLICT" } });
    expect(engine.status).toBe("reviewable");
    expect(adapter.visible.variants[0]!.controls["body.color"]).toBe("navy");
  });

  test("does not expose raw rejected identifiers in public errors", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const secret = "private.customer_record_8821";
    const result = await engine.apply({
      baseRevision: "workspace-revision-1",
      operationId: "safe-error",
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: secret, value: "x" }],
    });
    expect(result).toMatchObject({ ok: false, error: { code: "UNKNOWN_CONTROL" } });
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  test("allows only one mutating operation in flight", async () => {
    const adapter = new TestWorkspaceAdapter();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    adapter.hooks.validate = () => gate;
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    const first = engine.apply(firstInput());
    while (adapter.counters.validate === 0) await Promise.resolve();
    const concurrent = await engine.apply(firstInput("concurrent"));
    expect(concurrent).toMatchObject({ ok: false, error: { code: "OPERATION_IN_PROGRESS" } });
    release();
    await expect(first).resolves.toMatchObject({ ok: true });
  });

  test("Keep commits once through compare-and-swap and closes proposal mode", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await expect(engine.apply(firstInput())).resolves.toMatchObject({ ok: true });
    await expect(engine.keep()).resolves.toEqual({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: true });
    expect(adapter.counters).toMatchObject({ commit: 1, localWrites: 1, serverAttempts: 1 });
    expect(adapter.committed.variants[0]!.controls["body.color"]).toBe("navy");
    expect(adapter.endReasons).toEqual(["kept"]);
    expect(engine.status).toBe("idle");
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "NO_PROPOSAL" } });
    expect(adapter.counters.commit).toBe(1);
  });

  test("concurrent duplicate Keep requests cannot cross the commit boundary twice", async () => {
    const adapter = new TestWorkspaceAdapter();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await engine.apply(firstInput());
    adapter.hooks.read = () => gate;
    const firstKeep = engine.keep();
    while (adapter.counters.read < 2) await Promise.resolve();
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "OPERATION_IN_PROGRESS" } });
    release();
    await expect(firstKeep).resolves.toMatchObject({ localPersisted: true, serverPersisted: true });
    expect(adapter.counters).toMatchObject({ commit: 1, localWrites: 1, serverAttempts: 1 });
  });

  test("a failed pre-commit revision read stays retryable without entering commit-uncertain", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await engine.apply(firstInput());
    adapter.hooks.read = () => { throw new Error("private read failure"); };
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "ADAPTER_FAILURE", retryable: true } });
    expect(engine.status).toBe("reviewable");
    expect(adapter.counters).toMatchObject({ commit: 0, localWrites: 0 });
    delete adapter.hooks.read;
    await expect(engine.keep()).resolves.toMatchObject({ localPersisted: true, serverPersisted: true });
    expect(adapter.counters.commit).toBe(1);
  });

  test("expected server failure retries without repeating the local write", async () => {
    const adapter = new TestWorkspaceAdapter();
    adapter.serverFailuresRemaining = 1;
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await engine.apply(firstInput());
    await expect(engine.keep()).resolves.toEqual({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: false, errorCode: "SAVE_RETRY" });
    expect(engine.status).toBe("commit-retry");
    await expect(engine.keep()).resolves.toEqual({ revision: "workspace-revision-2", localPersisted: true, serverPersisted: true });
    expect(adapter.counters).toMatchObject({ commit: 2, localWrites: 1, serverAttempts: 2 });
    expect(engine.status).toBe("idle");
  });

  test("unknown commit outcome never auto-retries or claims success", async () => {
    const adapter = new TestWorkspaceAdapter();
    adapter.unknownCommitOutcome = true;
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await engine.apply(firstInput());
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "COMMIT_STATUS_UNKNOWN", outcome: "unknown" } });
    expect(engine.status).toBe("commit-uncertain");
    expect(adapter.counters).toMatchObject({ commit: 1, localWrites: 1 });
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "COMMIT_STATUS_UNKNOWN" } });
    expect(adapter.counters.commit).toBe(1);
  });

  test("external changes block Keep and restore the latest committed workspace", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await engine.apply(firstInput());
    adapter.externalChange();
    expect(engine.status).toBe("stale");
    await expect(engine.keep()).resolves.toMatchObject({ ok: false, error: { code: "STALE_REVISION" } });
    expect(adapter.counters.commit).toBe(0);
    expect(adapter.visible).toEqual(adapter.committed);
    expect(adapter.endReasons).toEqual(["stale"]);
    expect(engine.status).toBe("idle");
  });

  test("teardown restores a temporary proposal and never saves", async () => {
    const adapter = new TestWorkspaceAdapter();
    const engine = new ProposalEngine(workspaceTestManifest, adapter);
    await engine.apply(firstInput());
    await engine.destroy();
    expect(adapter.visible).toEqual(workspaceTestState);
    expect(adapter.counters).toMatchObject({ restore: 1, commit: 0, localWrites: 0 });
    expect(adapter.endReasons).toEqual(["teardown"]);
    expect(engine.status).toBe("idle");
  });
});
