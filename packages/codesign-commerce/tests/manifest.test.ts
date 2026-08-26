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
});
