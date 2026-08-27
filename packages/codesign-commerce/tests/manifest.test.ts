import { describe, expect, test } from "vitest";
import { validateManifest, type ConfiguratorManifest } from "../src/index.js";
import { testManifest } from "./fixtures.js";

const clone = (): ConfiguratorManifest => structuredClone(testManifest);

describe("Manifest 2.0 validation", () => {
  test("accepts and clones the canonical manifest", () => {
    const manifest = clone();
    const validated = validateManifest(manifest);
    expect(validated).toEqual(manifest);
    expect(validated).not.toBe(manifest);
  });

  test("rejects duplicate controls and old schemas", () => {
    const duplicated = clone();
    duplicated.controls.push(structuredClone(duplicated.controls[0]!));
    expect(() => validateManifest(duplicated)).toThrow(/duplicate control id/);
    expect(() => validateManifest({ ...clone(), schemaVersion: "1.0" })).toThrow(/schemaVersion must be 2.0/);
  });

  test("rejects unsafe identifiers and duplicate values", () => {
    const duplicated = clone();
    const body = duplicated.controls.find((control) => control.id === "body.color")!;
    body.values!.push(structuredClone(body.values![0]!));
    expect(() => validateManifest(duplicated)).toThrow(/duplicate value/);

    const unsafe = clone();
    unsafe.controls.find((control) => control.id === "body.color")!.values![0]!.id = "constructor";
    expect(() => validateManifest(unsafe)).toThrow(/unsafe or invalid/);
  });

  test("rejects non-finite, contradictory, and incompatible bounds", () => {
    const nonFinite = clone();
    nonFinite.controls.find((control) => control.id === "design.quantity")!.maximum = Number.POSITIVE_INFINITY;
    expect(() => validateManifest(nonFinite)).toThrow(/finite numeric bounds/);

    const contradictory = clone();
    const quantity = contradictory.controls.find((control) => control.id === "design.quantity")!;
    quantity.minimum = 100;
    quantity.maximum = 20;
    expect(() => validateManifest(contradictory)).toThrow(/minimum exceeds maximum/);

    const incompatible = clone();
    incompatible.controls.find((control) => control.id === "body.color")!.minimum = 1;
    expect(() => validateManifest(incompatible)).toThrow(/incompatible bounds/);

    const oversized = clone();
    oversized.controls.find((control) => control.id === "design.name")!.maximumLength = 1_001;
    expect(() => validateManifest(oversized)).toThrow(/maximumLength between 1 and 1000/);
  });

  test("rejects unknown and repeated dependency references", () => {
    const unknown = clone();
    unknown.dependencyDescriptions = [{ id: "unknown-reference", description: "Unknown", controlIds: ["private.margin"] }];
    expect(() => validateManifest(unknown)).toThrow(/references unknown control/);

    const repeated = clone();
    repeated.dependencyDescriptions = [{ id: "repeated-reference", description: "Repeated", controlIds: ["body.color", "body.color"] }];
    expect(() => validateManifest(repeated)).toThrow(/repeats control/);
  });

  test("enforces bounded collections and safe control IDs", () => {
    const manifest = clone();
    manifest.controls = Array.from({ length: 121 }, (_, index) => ({ ...structuredClone(testManifest.controls[0]!), id: `body.color.${index}` }));
    expect(() => validateManifest(manifest)).toThrow(/controls must contain between 1 and 120 entries/);

    const unsafe = clone();
    unsafe.controls[0]!.id = "body.__proto__.color";
    expect(() => validateManifest(unsafe)).toThrow(/unsafe or invalid/);
  });

  test("enforces canonical roles and fixed page Keep approval", () => {
    const missingTotal = clone();
    delete missingTotal.controls.find((control) => control.id === "order.total_quantity")!.role;
    expect(() => validateManifest(missingTotal)).toThrow(/exactly one workspace-total/);
    expect(() => validateManifest({ ...clone(), approval: { mode: "explicit-human", persistencePath: "agent-save" } })).toThrow(/persistencePath must be page-keep-controller/);
  });

  test("enforces variant operation policy", () => {
    const duplicateOperation = clone();
    duplicateOperation.variantPolicy.operations = ["duplicate", "duplicate"];
    expect(() => validateManifest(duplicateOperation)).toThrow(/invalid or duplicate operations/);

    const invalidMaximum = clone();
    invalidMaximum.variantPolicy.maximumVariants = 0;
    expect(() => validateManifest(invalidMaximum)).toThrow(/maximumVariants/);
  });

  test("requires asset controls to reference a declared bounded slot", () => {
    const missingSlot = clone();
    missingSlot.controls.push({
      id: "branding.artwork_ref", label: "Artwork", agentDescription: "Attach staged artwork.", scope: "variant",
      kind: "asset", agentWritable: true, requirement: "production-readiness", assetSlotId: "print-artwork",
    });
    expect(() => validateManifest(missingSlot)).toThrow(/requires a declared asset slot/);

    missingSlot.assetSlots.push({
      id: "print-artwork", label: "Artwork", agentDescription: "Public print artwork.", scope: "variant",
      sourceKinds: ["data-url"], mediaTypes: ["image/png"], maximumSourceCharacters: 1_000, maximumBytes: 500,
    });
    expect(() => validateManifest(missingSlot)).not.toThrow();
  });

  test("rejects unknown fields and malformed incomplete input", () => {
    expect(() => validateManifest({ ...clone(), privatePricing: true })).toThrow(/unknown top-level fields/);
    expect(() => validateManifest({ id: "incomplete" })).toThrow(/controls must be an array/);
  });
});
