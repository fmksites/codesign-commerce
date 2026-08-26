import type { ConfigurationState, ConfiguratorManifest } from "../src/index.js";

export const testManifest: ConfiguratorManifest = {
  schemaVersion: "1.0",
  id: "codesign.test-configurator",
  version: "1.0.0",
  displayName: "Test configurator",
  productType: "test-product",
  capabilities: {
    multipleDesigns: true,
    maximumDesigns: 4,
    cloning: true,
  },
  optionGroups: [
    {
      id: "body.color",
      label: "Body colour",
      agentDescription: "Choose the main body colour.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      values: [
        { id: "cream", label: "Cream" },
        { id: "navy", label: "Navy" },
        { id: "rose", label: "Dusty rose" },
      ],
    },
    {
      id: "accent.color",
      label: "Accent colour",
      agentDescription: "Choose the accent colour.",
      scope: "design",
      kind: "enum",
      agentWritable: true,
      values: [
        { id: "navy", label: "Navy" },
        { id: "berry", label: "Berry" },
        { id: "cream", label: "Cream" },
      ],
    },
    {
      id: "design.quantity",
      label: "Design quantity",
      agentDescription: "Set the pair quantity for one design.",
      scope: "design",
      kind: "integer",
      role: "design-quantity",
      agentWritable: true,
      minimum: 20,
      maximum: 10000,
    },
    {
      id: "order.total_quantity",
      label: "Order quantity",
      agentDescription: "Set the total quantity across all designs.",
      scope: "order",
      kind: "integer",
      role: "order-total",
      agentWritable: true,
      minimum: 20,
      maximum: 10000,
    },
    {
      id: "branding.artwork_status",
      label: "Artwork status",
      agentDescription: "Read whether final artwork is ready.",
      scope: "design",
      kind: "asset-status",
      agentWritable: false,
    },
  ],
  dependencyRules: [],
  approval: {
    mode: "explicit-human",
    persistence: "keep-only",
  },
};

export const testState: ConfigurationState = {
  configuratorId: testManifest.id,
  manifestVersion: testManifest.version,
  revision: "revision-1",
  activeDesignId: "design-1",
  order: { totalQuantity: 60 },
  designs: [
    {
      id: "design-1",
      name: "Design 1",
      quantity: 60,
      selections: {
        "body.color": "cream",
        "accent.color": "navy",
      },
      assets: [{ slot: "logo", status: "missing", agentWritable: false }],
    },
  ],
};
