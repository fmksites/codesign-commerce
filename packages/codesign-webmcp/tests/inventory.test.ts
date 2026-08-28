import { describe, expect, test } from "vitest";
import { validateHumanControlInventory, type HumanControlInventory } from "../src/index.js";
import { testManifest } from "./fixtures.js";

const validInventory = (): HumanControlInventory => ({
  schemaVersion: "1.0",
  integrationId: "test.web",
  manifestId: testManifest.id,
  inventoryVersion: "2026-08-27.1",
  auditedAt: "2026-08-27",
  controls: [
    { id: "body.color", label: "Body colour", selector: "[data-body]", kind: "button", mapping: { kind: "control", controlId: "body.color" } },
    { id: "variant.add", label: "Add variant", selector: "[data-add]", kind: "button", mapping: { kind: "variant-operation", operation: "duplicate" } },
    { id: "navigation.next", label: "Next", selector: "[data-next]", kind: "button", mapping: { kind: "excluded", category: "navigation", reason: "This button only moves focus to the next section." } },
  ],
});

describe("human-control parity inventory", () => {
  test("accepts explicit mappings and exclusions", () => {
    const result = validateHumanControlInventory(validInventory(), testManifest);
    expect(result.report).toEqual({
      integrationId: "test.web",
      manifestId: testManifest.id,
      mappedControls: 1,
      mappedVariantOperations: 1,
      mappedAssetSlots: 0,
      excludedControls: 1,
      totalHumanControls: 3,
    });
  });

  test("rejects unmapped, unknown, unsafe, and duplicate entries", () => {
    const unmapped = validInventory() as unknown as { controls: unknown[] };
    unmapped.controls.push({ id: "mystery", label: "Mystery", selector: "button" });
    expect(() => validateHumanControlInventory(unmapped, testManifest)).toThrow(/mapping is required/);

    const unknown = validInventory();
    unknown.controls[0]!.mapping = { kind: "control", controlId: "private.margin" };
    expect(() => validateHumanControlInventory(unknown, testManifest)).toThrow(/unknown manifest control/);

    const unsafe = validInventory();
    unsafe.controls[0]!.id = "__proto__";
    expect(() => validateHumanControlInventory(unsafe, testManifest)).toThrow(/unsafe or invalid/);

    const duplicate = validInventory();
    duplicate.controls.push(structuredClone(duplicate.controls[0]!));
    expect(() => validateHumanControlInventory(duplicate, testManifest)).toThrow(/duplicate inventory control/);
  });

  test("requires an explanatory public exclusion", () => {
    const inventory = validInventory();
    inventory.controls[2]!.mapping = { kind: "excluded", category: "navigation", reason: "" };
    expect(() => validateHumanControlInventory(inventory, testManifest)).toThrow(/public-safe exclusion reason/);
  });
});
