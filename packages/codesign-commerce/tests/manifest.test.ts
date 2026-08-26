import { describe, expect, test } from "vitest";
import { ManifestValidationError, validateManifest } from "../src/index.js";
import { testManifest } from "./fixtures.js";

describe("manifest validation", () => {
  test("accepts the canonical test manifest", () => {
    expect(validateManifest(structuredClone(testManifest))).toEqual(testManifest);
  });

  test("rejects duplicate option ids", () => {
    const manifest = structuredClone(testManifest);
    manifest.optionGroups.push(structuredClone(manifest.optionGroups[0]!));
    expect(() => validateManifest(manifest)).toThrow(ManifestValidationError);
  });

  test("rejects prototype-polluting ids", () => {
    const manifest = structuredClone(testManifest);
    manifest.optionGroups[0]!.id = "body.__proto__.color";
    expect(() => validateManifest(manifest)).toThrow(/unsafe or invalid/);
  });

  test("rejects writable asset status", () => {
    const manifest = structuredClone(testManifest);
    manifest.optionGroups.at(-1)!.agentWritable = true;
    expect(() => validateManifest(manifest)).toThrow(/cannot be agent-writable/);
  });

  test("rejects incompatible canonical roles", () => {
    const manifest = structuredClone(testManifest);
    const quantity = manifest.optionGroups.find((option) => option.id === "design.quantity")!;
    quantity.scope = "order";
    expect(() => validateManifest(manifest)).toThrow(/design-scoped integer/);
  });

  test("requires one unambiguous quantity role at each scope", () => {
    const manifest = structuredClone(testManifest);
    delete manifest.optionGroups.find((option) => option.id === "order.total_quantity")!.role;
    expect(() => validateManifest(manifest)).toThrow(/exactly one order-total/);
  });

  test("rejects contradictory multiple-design capabilities", () => {
    const manifest = structuredClone(testManifest);
    manifest.capabilities.multipleDesigns = false;
    expect(() => validateManifest(manifest)).toThrow(/maximumDesigns must be 1/);
    expect(() => validateManifest(manifest)).toThrow(/cloning requires multipleDesigns/);
  });

  test("returns a sanitized validation error for structurally incomplete input", () => {
    expect(() => validateManifest({ id: "incomplete" })).toThrow(ManifestValidationError);
    expect(() => validateManifest({ id: "incomplete" })).toThrow(/optionGroups must be an array/);
  });

  test("rejects unknown fields instead of passing merchant-private data through", () => {
    const manifest = { ...structuredClone(testManifest), wholesalePrice: 2.75 };
    expect(() => validateManifest(manifest)).toThrow(/unknown top-level fields/);
  });

  test("rejects non-plain objects", () => {
    const manifest = Object.create({ inheritedSecret: "not-allowed" }) as Record<string, unknown>;
    Object.assign(manifest, testManifest);
    expect(() => validateManifest(manifest)).toThrow(/plain object/);
  });
});
