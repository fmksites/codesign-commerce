import { describe, expect, test } from "vitest";
import { AtomicOperationReducer, OperationValidationError } from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

const reducer = () => new AtomicOperationReducer(workspaceTestManifest);

describe("atomic typed proposal operations", () => {
  test("applies a mixed variant, transform, asset, quantity, and activation batch", () => {
    const result = reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "foundation-branding-variants",
      operations: [
        { type: "set-control", target: { scope: "workspace" }, controlId: "order.total_quantity", value: 120 },
        { type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "design.quantity", value: 60 },
        { type: "set-control", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.position", value: { x: 0.35, y: 0.4 } },
        { type: "attach-asset", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.artwork", assetHandle: "asset-north-form" },
        { type: "duplicate-variant", sourceVariantId: "variant-1", variantId: "variant-2", name: "Rose direction", initialControls: { "design.quantity": 60, "body.color": "rose", "accent.color": "cream" } },
        { type: "set-active-variant", variantId: "variant-2" },
      ],
      assumptions: ["Split the collection evenly."],
    });
    expect(result.deduplicated).toBe(false);
    expect(result.appliedOperations).toBe(6);
    expect(result.state.workspaceControls["order.total_quantity"]).toBe(120);
    expect(result.state.activeVariantId).toBe("variant-2");
    expect(result.state.variants).toHaveLength(2);
    expect(result.state.variants[0]!.elements[0]!.controls["mark.artwork"]).toBe("asset-north-form");
    expect(result.state.variants[1]).toMatchObject({ name: "Rose direction", controls: { "design.quantity": 60, "body.color": "rose" } });
  });

  test("supports complete create, reorder, remove, and active-variant operations when declared", () => {
    const result = reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "variant-lifecycle",
      operations: [
        {
          type: "create-variant",
          index: 0,
          variant: {
            id: "variant-created",
            name: "Created direction",
            controls: { "body.color": "navy", "accent.color": "cream", "design.quantity": 40 },
            elements: [{ id: "mark-created", type: "artwork", controls: { "mark.position": { x: 0.5, y: 0.5 }, "mark.scale": 1 } }],
          },
        },
        { type: "set-active-variant", variantId: "variant-created" },
        { type: "reorder-variant", variantId: "variant-1", index: 0 },
        { type: "remove-variant", variantId: "variant-created" },
      ],
    });
    expect(result.state.variants.map((variant) => variant.id)).toEqual(["variant-1"]);
    expect(result.state.activeVariantId).toBe("variant-1");
  });

  test("is atomic when a later operation has an invalid value or target", () => {
    const original = JSON.stringify(workspaceTestState);
    expect(() => reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "invalid-atomic-batch",
      operations: [
        { type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" },
        { type: "set-control", target: { scope: "element", variantId: "variant-1", elementId: "missing" }, controlId: "mark.scale", value: 1.2 },
      ],
    })).toThrowError(expect.objectContaining({ code: "UNKNOWN_ELEMENT", operationIndex: 1 }));
    expect(JSON.stringify(workspaceTestState)).toBe(original);

    expect(() => reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "invalid-transform",
      operations: [{ type: "set-control", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.scale", value: Number.NaN }],
    })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));
    expect(JSON.stringify(workspaceTestState)).toBe(original);
  });

  test("deduplicates identical retries and rejects conflicting operation IDs", () => {
    const engine = reducer();
    const input = {
      baseRevision: "workspace-revision-1",
      operationId: "idempotent-batch",
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "navy" }],
    } as const;
    const first = engine.apply(workspaceTestState, input);
    const second = engine.apply(first.state, input);
    expect(second.deduplicated).toBe(true);
    expect(second.state).toEqual(first.state);

    expect(() => engine.apply(first.state, {
      ...input,
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-1" }, controlId: "body.color", value: "rose" }],
    })).toThrowError(expect.objectContaining({ code: "OPERATION_ID_CONFLICT" }));
  });

  test("keeps an untargeted variant byte-equivalent during a refinement", () => {
    const seed = reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "seed-second-variant",
      operations: [{ type: "duplicate-variant", sourceVariantId: "variant-1", variantId: "variant-2", name: "Second" }],
    }).state;
    const untouched = JSON.stringify(seed.variants[0]);
    const refined = reducer().apply(seed, {
      baseRevision: "workspace-revision-1",
      operationId: "target-second-only",
      operations: [{ type: "set-control", target: { scope: "variant", variantId: "variant-2" }, controlId: "body.color", value: "navy" }],
    }).state;
    expect(JSON.stringify(refined.variants[0])).toBe(untouched);
    expect(refined.variants[1]!.controls["body.color"]).toBe("navy");
  });

  test("rejects stale revisions, forbidden asset writes, and unavailable operations", () => {
    expect(() => reducer().apply(workspaceTestState, {
      baseRevision: "old",
      operationId: "stale",
      operations: [{ type: "set-active-variant", variantId: "variant-1" }],
    })).toThrowError(expect.objectContaining({ code: "STALE_REVISION" }));

    expect(() => reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "asset-through-wrong-operation",
      operations: [{ type: "set-control", target: { scope: "element", variantId: "variant-1", elementId: "mark-1" }, controlId: "mark.artwork", value: "asset-test" }],
    })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));

    const restricted = structuredClone(workspaceTestManifest);
    restricted.variantPolicy.operations = ["set-active"];
    expect(() => new AtomicOperationReducer(restricted).apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "forbidden-duplicate",
      operations: [{ type: "duplicate-variant", sourceVariantId: "variant-1", variantId: "variant-2" }],
    })).toThrowError(expect.objectContaining({ code: "VARIANT_OPERATION_UNAVAILABLE" }));
  });

  test("rejects unknown fields and prototype-pollution operation maps", () => {
    const polluted = JSON.parse(`{
      "baseRevision":"workspace-revision-1",
      "operationId":"pollution-check",
      "operations":[{
        "type":"duplicate-variant",
        "sourceVariantId":"variant-1",
        "variantId":"variant-2",
        "initialControls":{"__proto__":"polluted"}
      }]
    }`);
    expect(() => reducer().apply(workspaceTestState, polluted)).toThrowError(OperationValidationError);
    expect(({} as { polluted?: unknown }).polluted).toBeUndefined();

    expect(() => reducer().apply(workspaceTestState, {
      baseRevision: "workspace-revision-1",
      operationId: "unknown-field",
      operations: [{ type: "set-active-variant", variantId: "variant-1", privatePath: "/secret" }],
    })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));

    const unknownCreatedControl = {
      baseRevision: "workspace-revision-1",
      operationId: "unknown-created-control",
      operations: [{
        type: "create-variant",
        variant: {
          id: "variant-unknown",
          name: "Unknown",
          controls: { "design.quantity": 20, "private.margin": 0.8 },
          elements: [],
        },
      }],
    };
    expect(() => reducer().apply(workspaceTestState, unknownCreatedControl)).toThrowError(expect.objectContaining({ code: "UNKNOWN_CONTROL" }));
  });

  test("caps successful operations across one reducer/proposal ledger", () => {
    const engine = reducer();
    const operations = Array.from({ length: 80 }, (_, index) => ({
      type: "set-control" as const,
      target: { scope: "variant" as const, variantId: "variant-1" },
      controlId: "design.name",
      value: `Direction ${index}`,
    }));
    const first = engine.apply(workspaceTestState, { baseRevision: "workspace-revision-1", operationId: "eighty-operations", operations });
    expect(first.appliedOperations).toBe(80);
    expect(() => engine.apply(first.state, {
      baseRevision: "workspace-revision-1",
      operationId: "one-too-many",
      operations: [{ type: "set-active-variant", variantId: "variant-1" }],
    })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));
  });
});
