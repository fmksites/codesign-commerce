import { describe, expect, test } from "vitest";
import { validateHumanControlInventory } from "@codesign-commerce/core";
import { toteManifest } from "./configurator";
import { toteHumanControlInventory } from "./control-inventory";

describe("studio tote human-control parity", () => {
  test("maps or publicly excludes every inventoried human control", () => {
    const { report } = validateHumanControlInventory(toteHumanControlInventory, toteManifest);
    expect(report).toEqual({
      integrationId: "codesign.studio-tote-reference.web",
      manifestId: toteManifest.id,
      mappedControls: 14,
      mappedVariantOperations: 4,
      mappedAssetSlots: 1,
      excludedControls: 6,
      totalHumanControls: 25,
    });
  });
});
