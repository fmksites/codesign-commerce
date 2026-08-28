import { describe, expect, test } from "vitest";
import { sanitizeWorkspaceState, WorkspaceBoundaryError } from "../src/index.js";
import { workspaceTestManifest, workspaceTestState } from "./workspace-fixtures.js";

describe("canonical public workspace boundary", () => {
  test("reconstructs only declared public fields and controls", () => {
    const raw = {
      ...structuredClone(workspaceTestState),
      privatePricing: { margin: 0.8 },
      workspaceControls: { ...workspaceTestState.workspaceControls, "private.margin": 0.8 },
      variants: workspaceTestState.variants.map((variant) => ({
        ...structuredClone(variant),
        supplierCode: "secret",
        controls: { ...variant.controls, "private.yarn": "secret" },
        elements: variant.elements.map((element) => ({ ...element, privatePath: "/tmp/secret", controls: { ...element.controls, "private.transform": 10 } })),
      })),
    };
    const sanitized = sanitizeWorkspaceState(raw, workspaceTestManifest);
    expect(sanitized).toEqual(workspaceTestState);
    expect(JSON.stringify(sanitized)).not.toContain("private");
    expect(sanitized).not.toBe(raw);
  });

  test("rejects duplicate variants/elements and unknown values", () => {
    const duplicateVariant = structuredClone(workspaceTestState);
    duplicateVariant.variants.push(structuredClone(duplicateVariant.variants[0]!));
    expect(() => sanitizeWorkspaceState(duplicateVariant, workspaceTestManifest)).toThrow(/duplicate variant IDs/);

    const duplicateElement = structuredClone(workspaceTestState);
    duplicateElement.variants[0]!.elements.push(structuredClone(duplicateElement.variants[0]!.elements[0]!));
    expect(() => sanitizeWorkspaceState(duplicateElement, workspaceTestManifest)).toThrow(/duplicate element IDs/);

    const invalidValue = structuredClone(workspaceTestState);
    invalidValue.variants[0]!.controls["body.color"] = "internal-only";
    expect(() => sanitizeWorkspaceState(invalidValue, workspaceTestManifest)).toThrow(/outside its allowlist/);
  });

  test("rejects malformed transforms, asset handles, missing roles, and identity mismatches", () => {
    const transform = structuredClone(workspaceTestState) as unknown as { variants: Array<{ elements: Array<{ controls: Record<string, unknown> }> }> };
    transform.variants[0]!.elements[0]!.controls["mark.position"] = { x: 2, y: 0.5 };
    expect(() => sanitizeWorkspaceState(transform, workspaceTestManifest)).toThrow(/x exceeds its maximum/);

    const asset = structuredClone(workspaceTestState);
    asset.variants[0]!.elements[0]!.assetHandle = "../private/file";
    expect(() => sanitizeWorkspaceState(asset, workspaceTestManifest)).toThrow(/asset handle is unsafe/);

    const missingQuantity = structuredClone(workspaceTestState);
    delete missingQuantity.variants[0]!.controls["design.quantity"];
    expect(() => sanitizeWorkspaceState(missingQuantity, workspaceTestManifest)).toThrow(/missing required control design.quantity/);

    const identity = { ...structuredClone(workspaceTestState), manifestVersion: "wrong" };
    expect(() => sanitizeWorkspaceState(identity, workspaceTestManifest)).toThrow(/identity does not match/);

    const unknownType = structuredClone(workspaceTestState);
    unknownType.variants[0]!.elements[0]!.type = "private-shape";
    expect(() => sanitizeWorkspaceState(unknownType, workspaceTestManifest)).toThrow(/unknown type/);
  });

  test("rejects prototype-pollution keys and oversized element collections", () => {
    const polluted = structuredClone(workspaceTestState) as unknown as { workspaceControls: Record<string, unknown> };
    polluted.workspaceControls = JSON.parse('{"order.total_quantity":60,"__proto__":"polluted"}') as Record<string, unknown>;
    expect(() => sanitizeWorkspaceState(polluted, workspaceTestManifest)).toThrow(/unsafe control key/);
    expect(({} as { polluted?: unknown }).polluted).toBeUndefined();

    const oversized = structuredClone(workspaceTestState);
    oversized.variants[0]!.elements = Array.from({ length: 101 }, (_, index) => ({
      id: `mark-${index}`,
      type: "artwork",
      controls: { "mark.position": { x: 0.5, y: 0.5 }, "mark.scale": 1 },
    }));
    expect(() => sanitizeWorkspaceState(oversized, workspaceTestManifest)).toThrow(/too many elements/);
  });

  test("rejects a deterministic malformed-value corpus without mutating the source", () => {
    const invalidValues: unknown[] = [Number.NaN, Number.POSITIVE_INFINITY, {}, [], { x: 0.5 }, { x: 0.5, y: 0.5, z: 1 }, "javascript:alert(1)"];
    for (const invalid of invalidValues) {
      const candidate = structuredClone(workspaceTestState) as unknown as { variants: Array<{ elements: Array<{ controls: Record<string, unknown> }> }> };
      candidate.variants[0]!.elements[0]!.controls["mark.position"] = invalid;
      const before = structuredClone(candidate);
      expect(() => sanitizeWorkspaceState(candidate, workspaceTestManifest)).toThrow(WorkspaceBoundaryError);
      expect(candidate).toEqual(before);
    }
  });

  test("exposes only a generic boundary error type", () => {
    try {
      sanitizeWorkspaceState({ raw: "secret" }, workspaceTestManifest);
      throw new Error("expected boundary failure");
    } catch (error) {
      expect(error).toBeInstanceOf(WorkspaceBoundaryError);
      expect(String(error)).not.toContain("secret");
    }
  });
});
