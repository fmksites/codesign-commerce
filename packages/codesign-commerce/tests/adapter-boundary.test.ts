import { describe, expect, test } from "vitest";
import {
  AdapterBoundaryError,
  createCoDesignTools,
  GuardedConfiguratorAdapter,
  InMemoryConfiguratorAdapter,
  ProposalSession,
  sanitizeConfigurationState,
  type CommitMetadata,
  type ConfigurationState,
  type OptionResult,
  type ValidationResult,
} from "../src/index.js";
import { testManifest, testState } from "./fixtures.js";

const HIDDEN_SENTINEL = "DO_NOT_EXPOSE";

function setup() {
  const raw = new InMemoryConfiguratorAdapter(structuredClone(testState), structuredClone(testManifest));
  const session = new ProposalSession(structuredClone(testManifest), raw);
  const tools = createCoDesignTools({ manifest: testManifest, adapter: raw, session });
  return { raw, session, tools };
}

describe("public adapter boundary", () => {
  test("reconstructs canonical state and drops undeclared adapter fields recursively", () => {
    const raw = {
      ...structuredClone(testState),
      hiddenField: HIDDEN_SENTINEL,
      order: { ...testState.order, hiddenField: HIDDEN_SENTINEL },
      designs: testState.designs.map((design) => ({
        ...structuredClone(design),
        hiddenField: HIDDEN_SENTINEL,
        selections: { ...design.selections, hiddenField: HIDDEN_SENTINEL },
        assets: design.assets.map((asset) => ({ ...asset, hiddenField: HIDDEN_SENTINEL })),
      })),
    };

    const sanitized = sanitizeConfigurationState(raw, testManifest);
    expect(sanitized).toEqual(testState);
    expect(JSON.stringify(sanitized)).not.toContain(HIDDEN_SENTINEL);
  });

  test("preserves an allowed empty design name while rejecting a non-public option value", () => {
    const blankName = structuredClone(testState);
    blankName.designs[0]!.name = "";
    expect(sanitizeConfigurationState(blankName, testManifest).designs[0]!.name).toBe("");

    const invalid = structuredClone(testState);
    invalid.designs[0]!.selections["body.color"] = "unlisted-value";
    expect(() => sanitizeConfigurationState(invalid, testManifest)).toThrow(AdapterBoundaryError);
  });

  test("strips undeclared read, option, validation, and commit fields before returning them", async () => {
    const { raw, session, tools } = setup();
    const originalRead = raw.readState.bind(raw);
    const originalCommit = raw.commitState.bind(raw);

    raw.readState = async () => ({
      ...await originalRead(),
      hiddenField: HIDDEN_SENTINEL,
    } as ConfigurationState);
    raw.listOptions = async () => ({
      revision: "revision-1",
      hiddenField: HIDDEN_SENTINEL,
      options: [{
        optionId: "body.color",
        allowed: true,
        hiddenField: HIDDEN_SENTINEL,
        values: [{ id: "navy", label: HIDDEN_SENTINEL, hiddenField: HIDDEN_SENTINEL }],
      }],
    } as unknown as OptionResult);
    raw.validateState = async () => ({
      configurationValid: true,
      productionReady: false,
      hiddenField: HIDDEN_SENTINEL,
      issues: [{
        code: "ARTWORK_REQUIRED",
        severity: "decision-required",
        message: "Final artwork is still required.",
        designIds: ["design-1"],
        hiddenField: HIDDEN_SENTINEL,
      }],
      assumptions: [],
    } as unknown as ValidationResult);
    raw.commitState = async (state, metadata) => ({
      ...await originalCommit(state, metadata),
      hiddenField: HIDDEN_SENTINEL,
    });

    const read = await tools[0]!.execute({}, {});
    const options = await tools[1]!.execute({ designId: "design-1", optionIds: ["body.color"] }, {});
    const validation = await tools[4]!.execute({}, {});
    const guarded = session.adapter as GuardedConfiguratorAdapter;
    const metadata: CommitMetadata = {
      proposalId: "boundary-commit-1",
      baseRevision: "revision-1",
      operationIds: ["boundary-operation-1"],
      trigger: "agent_proposal_keep",
    };
    const committed = await guarded.commitState(structuredClone(testState), metadata);
    const serialized = JSON.stringify({ read, options, validation, committed });

    expect(read).toMatchObject({ ok: true, state: testState });
    expect(options).toMatchObject({
      ok: true,
      options: [{ optionId: "body.color", values: [{ id: "navy", label: "Navy" }] }],
    });
    expect(validation).toMatchObject({
      ok: true,
      validation: { issues: [{ code: "ARTWORK_REQUIRED", designIds: ["design-1"] }] },
    });
    expect(committed).toEqual({ revision: "revision-2", localPersisted: true, serverPersisted: true });
    expect(serialized).not.toContain(HIDDEN_SENTINEL);
    expect(serialized).not.toContain("hiddenField");
  });

  test("fails closed with a generic public error when adapter output is malformed", async () => {
    const { raw, tools } = setup();
    raw.readState = async () => ({
      ...structuredClone(testState),
      designs: [{ ...structuredClone(testState.designs[0]!), quantity: "sixty", hiddenField: HIDDEN_SENTINEL }],
    } as unknown as ConfigurationState);

    const result = await tools[0]!.execute({}, {});
    expect(result).toMatchObject({ ok: false, persisted: false, error: { code: "ADAPTER_FAILURE" } });
    expect(JSON.stringify(result)).not.toContain(HIDDEN_SENTINEL);
    expect(JSON.stringify(result)).not.toContain("sixty");
  });

  test("uses the session's validated manifest instead of an untrusted dependency reference", async () => {
    const { raw, session } = setup();
    const dependencyManifest = {
      ...structuredClone(testManifest),
      hiddenField: HIDDEN_SENTINEL,
      capabilities: { ...testManifest.capabilities, hiddenField: HIDDEN_SENTINEL },
      dependencyRules: [{ id: "hidden-rule", description: HIDDEN_SENTINEL }],
    };
    const tools = createCoDesignTools({
      manifest: dependencyManifest as typeof testManifest,
      adapter: raw,
      session,
    });

    const read = await tools[0]!.execute({}, {});
    const options = await tools[1]!.execute({}, {});
    const serialized = JSON.stringify({ read, options });
    expect(serialized).not.toContain(HIDDEN_SENTINEL);
    expect(serialized).not.toContain("hiddenField");
  });
});
