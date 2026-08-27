import { validateManifest, type ConfiguratorManifest, type WorkspaceState } from "../src/index.js";
import { testManifest } from "./fixtures.js";

export const workspaceTestManifest: ConfiguratorManifest = validateManifest({
  ...structuredClone(testManifest),
  version: "2.1.0-test",
  controls: [
    ...structuredClone(testManifest.controls),
    {
      id: "mark.position",
      label: "Mark position",
      agentDescription: "Place an artwork mark on the product canvas.",
      scope: "element",
      targetType: "artwork",
      kind: "position-2d",
      agentWritable: true,
      requirement: "configuration",
      xMinimum: 0,
      xMaximum: 1,
      yMinimum: 0,
      yMaximum: 1,
    },
    {
      id: "mark.scale",
      label: "Mark scale",
      agentDescription: "Scale an artwork mark on the product canvas.",
      scope: "element",
      targetType: "artwork",
      kind: "scale",
      agentWritable: true,
      requirement: "configuration",
      minimum: 0.25,
      maximum: 2,
    },
    {
      id: "mark.rotation",
      label: "Mark rotation",
      agentDescription: "Rotate an artwork mark on the product canvas.",
      scope: "element",
      targetType: "artwork",
      kind: "rotation",
      agentWritable: true,
      requirement: "optional",
      minimum: -180,
      maximum: 180,
    },
    {
      id: "mark.artwork",
      label: "Mark artwork",
      agentDescription: "Attach a staged artwork handle to the mark.",
      scope: "element",
      targetType: "artwork",
      kind: "asset",
      agentWritable: true,
      requirement: "production-readiness",
      assetSlotId: "mark-artwork",
    },
  ],
  assetSlots: [{
    id: "mark-artwork",
    label: "Mark artwork",
    agentDescription: "Public artwork for the configurable mark.",
    scope: "element",
    sourceKinds: ["data-url"],
    mediaTypes: ["image/png"],
    maximumSourceCharacters: 100_000,
    maximumBytes: 70_000,
  }],
  variantPolicy: {
    minimumVariants: 1,
    maximumVariants: 5,
    operations: ["create", "duplicate", "remove", "reorder", "set-active"],
  },
});

export const workspaceTestState: WorkspaceState = {
  configuratorId: workspaceTestManifest.id,
  manifestVersion: workspaceTestManifest.version,
  committedRevision: "workspace-revision-1",
  activeVariantId: "variant-1",
  workspaceControls: {
    "order.total_quantity": 60,
  },
  variants: [{
    id: "variant-1",
    name: "Cream direction",
    controls: {
      "body.color": "cream",
      "accent.color": "navy",
      "design.quantity": 60,
    },
    elements: [{
      id: "mark-1",
      type: "artwork",
      controls: {
        "mark.position": { x: 0.5, y: 0.5 },
        "mark.scale": 1,
      },
    }],
  }],
};
