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

  test("rejects missing IDs and unsupported schema versions", () => {
    const missingId = structuredClone(testManifest);
    missingId.id = "";
    expect(() => validateManifest(missingId)).toThrow(/manifest id is unsafe or invalid/);

    const unsupported = { ...structuredClone(testManifest), schemaVersion: "2.0" };
    expect(() => validateManifest(unsupported)).toThrow(/schemaVersion must be 1.0/);
  });

  test("rejects duplicate and unsafe declared values", () => {
    const duplicated = structuredClone(testManifest);
    const body = duplicated.optionGroups.find((option) => option.id === "body.color")!;
    body.values!.push(structuredClone(body.values![0]!));
    expect(() => validateManifest(duplicated)).toThrow(/duplicate value/);

    const unsafe = structuredClone(testManifest);
    unsafe.optionGroups.find((option) => option.id === "body.color")!.values![0]!.id = "constructor";
    expect(() => validateManifest(unsafe)).toThrow(/unsafe or invalid/);
  });

  test("rejects incompatible, non-finite, and oversized bounds", () => {
    const nonFinite = structuredClone(testManifest);
    nonFinite.optionGroups.find((option) => option.id === "design.quantity")!.maximum = Number.POSITIVE_INFINITY;
    expect(() => validateManifest(nonFinite)).toThrow(/finite integer bounds/);

    const incompatible = structuredClone(testManifest);
    incompatible.optionGroups.find((option) => option.id === "body.color")!.minimum = 1;
    expect(() => validateManifest(incompatible)).toThrow(/incompatible bounds/);

    const oversized = structuredClone(testManifest);
    oversized.optionGroups.find((option) => option.id === "design.name")!.maximumLength = 1_001;
    expect(() => validateManifest(oversized)).toThrow(/maximumLength must be between 1 and 1000/);
  });

  test("requires dependency rules to reference declared option IDs exactly once", () => {
    const unknown = structuredClone(testManifest);
    unknown.dependencyRules = [{
      id: "unknown-option-rule",
      description: "Invalid reference for test",
      optionIds: ["private.raw.path"],
    }];
    expect(() => validateManifest(unknown)).toThrow(/references unknown option private.raw.path/);

    const repeated = structuredClone(testManifest);
    repeated.dependencyRules = [{
      id: "duplicate-option-rule",
      description: "Duplicate reference for test",
      optionIds: ["body.color", "body.color"],
    }];
    expect(() => validateManifest(repeated)).toThrow(/repeats option body.color/);
  });

  test("rejects oversized manifest collections", () => {
    const manifest = structuredClone(testManifest);
    manifest.optionGroups = Array.from({ length: 101 }, (_, index) => ({
      ...structuredClone(testManifest.optionGroups[0]!),
      id: `option-${index}`,
    }));
    expect(() => validateManifest(manifest)).toThrow(/optionGroups must contain between 1 and 100 entries/);
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
