# Manifest and adapter guide

## Manifest responsibility

A manifest describes the safe, semantic surface an agent may understand. It does not expose raw state paths or implement the merchant's visual renderer.

Manifest 2.0 has these required top-level fields:

- `schemaVersion`: exactly `2.0`.
- `id` and `version`: a stable safe integration ID and merchant-controlled contract version.
- `displayName` and `productType`: public context that helps an agent choose and explain the configurator.
- `controls`: the complete allowlisted semantic control surface.
- `assetSlots`: bounded inputs for artwork and other public creative assets.
- `variantPolicy`: minimum/maximum variants plus the explicitly supported create, duplicate, remove, reorder and activate operations.
- `previewSurfaces`: the image outputs an adapter can return to an agent or conversation.
- `dependencyDescriptions`: public production/configuration rules with bounded references to control IDs.
- `approval`: exactly `explicit-human` through the page's `page-keep-controller`.

Unknown top-level and nested fields are rejected. This prevents accidental private-data pass-through and forces explicit contract evolution.

## Controls

Each control has:

- A stable semantic ID such as `body.color` or `design.quantity`.
- A human label and agent-oriented description.
- Scope: `workspace`, `variant`, or typed `element`.
- A finite kind: `enum`, `color`, `integer`, `number`, `boolean`, bounded `text`, `asset`, `position-2d`, `scale`, or `rotation`.
- A requirement classification: configuration, production readiness, or optional.
- `agentWritable`; read-only status controls can still help the agent explain missing production decisions.
- Static values or numeric/text bounds where applicable.
- An optional public preview-region label.

Canonical roles connect an option to non-selection state:

| Role | Required scope and kind | Meaning |
|---|---|---|
| `variant-quantity` | variant integer | Quantity allocated to one variant |
| `variant-name` | variant text | Human-readable colourway/design name |
| `workspace-total` | workspace integer | Total quantity across variants |
| `selection` or omitted | normally variant/element control | Entry in the public selections map |

Manifest 2 requires exactly one `variant-quantity` and one `workspace-total` control. Unsafe IDs containing `__proto__`, `prototype`, or `constructor` are rejected. Unknown nested fields, duplicate IDs, non-finite or contradictory bounds, unknown dependency references, undeclared asset slots, unsafe source types, and oversized collections all fail closed.

## Assets and previews

An asset control stores only an opaque temporary handle. Its `assetSlotId` must resolve to a declared slot that allowlists source transports, media types, source characters, and decoded bytes. The generic package never receives merchant storage credentials. The merchant adapter owns staging, visual rendering, import on Keep, and temporary-asset release on Revert.

A preview surface declares only public output constraints. The adapter owns the renderer and returns a bounded raster artifact with proposal/revision identity, accessible alt text, integrity, dimensions, media type, and transport. A text summary or URL alone is not a successful visual preview.

## Human-control inventory and parity

Each integration maintains a versioned inventory of its actual human controls. Every inventory entry must either map to a manifest control, variant operation, or asset slot, or carry a public-safe exclusion reason such as navigation, development-only diagnostics, or the human-only Keep/Revert boundary. Unknown targets, missing mappings, duplicate/unsafe IDs, unknown fields, and empty exclusion reasons fail the reusable parity validator.

For the tote reference, run:

```sh
npm run check:parity
```

This is an explicit review artifact, not a claim that the package can infer a merchant's customizer automatically.

## Migration from Manifest 1.0

Manifest 2.0 intentionally has no 1.0 runtime compatibility layer. Migrate deliberately:

| Manifest 1.0 | Manifest 2.0 |
|---|---|
| `optionGroups` | `controls` |
| design/order scopes | variant/workspace scopes |
| `design-name`, `design-quantity`, `order-total` | `variant-name`, `variant-quantity`, `workspace-total` |
| `capabilities.maximumDesigns` | `variantPolicy.maximumVariants` |
| `dependencyRules[].optionIds` | `dependencyDescriptions[].controlIds` |
| text artwork reference | `asset` control referencing an `assetSlot` |
| implicit renderer output | declared `previewSurfaces` |
| `keep-only` string | fixed `page-keep-controller` persistence path |

The migration should be accompanied by a fresh human-control inventory so control parity is reviewed rather than assumed.

## Canonical state

The adapter returns only:

```ts
interface ConfigurationState {
  configuratorId: string;
  manifestVersion: string;
  revision: string;
  activeDesignId: string;
  order: { totalQuantity: number };
  designs: Array<{
    id: string;
    name: string;
    quantity: number;
    selections: Record<string, string | number | boolean | null>;
    assets: Array<{
      slot: string;
      status: "missing" | "placeholder" | "ready";
      agentWritable: false;
    }>;
  }>;
}
```

The revision is opaque. It must change whenever committed public state changes and must not encode confidential values.

The core wraps every merchant adapter in a runtime guard. `readState()`,
`listOptions()`, `createDesignDraft()`, `validateState()`, and `commitState()`
are reconstructed field by field into the canonical public contract. Unknown
fields are dropped; malformed values fail closed with a generic
`ADAPTER_FAILURE`. TypeScript types alone are not treated as a data boundary.

## Adapter obligations

`ConfiguratorAdapter` has ten responsibilities:

1. `readState()` returns a detached canonical committed state.
2. `listOptions()` returns public availability and reasons.
3. Optional `createDesignDraft()` clones one variant in detached draft state, assigns a safe unique public ID, makes it active, and performs no preview or persistence side effect. It is required when `variantPolicy.operations` includes `duplicate`.
4. `quiescePersistence()` flushes or awaits recent human saves before snapshotting.
5. `captureSnapshot()` keeps a private exact raw snapshot inside the adapter.
6. `previewState()` updates the existing visible renderer with zero storage/network writes.
7. `validateState()` applies public and merchant-specific rules without leaking private explanations.
8. `restoreSnapshot()` performs an exact zero-write Revert.
9. `commitState()` compares `metadata.baseRevision` with the adapter's current
   committed revision immediately before its first local write, then crosses
   local persistence once and securely saves idempotently per proposal ID.
10. `subscribeToExternalChanges()` invalidates stale proposals.

The core rejects a draft clone if it changes the committed revision, order total, existing designs, configurator identity, or manifest version; fails to add exactly one uniquely identified design; exposes an agent-writable asset; or does not make the new design active. Source/order changes and new-design overrides are then applied and validated as one transaction.

Expected server-save failure is data, not an exception:

```ts
{
  revision: "opaque-local-revision",
  localPersisted: true,
  serverPersisted: false,
  errorCode: "SANITIZED_SAVE_CODE"
}
```

On retry with the same proposal ID, the adapter must not repeat the local write. It performs only the still-missing secure save. Exceptions are reserved for an outcome the adapter cannot verify; the core then enters `commit-uncertain` and requires reload.

If the committed revision no longer matches `metadata.baseRevision`, the
adapter must perform no write and return:

```ts
{
  revision: "current-opaque-revision",
  localPersisted: false,
  serverPersisted: false,
  errorCode: "STALE_REVISION"
}
```

This compare-and-swap check closes the interval between the core's final read
and the adapter's local write. The core also checks external-revision signals
after asynchronous clone, validation, and preview boundaries, discards the
temporary proposal, and restores the latest committed public state.

## KORRHAUS adapter rule

The private KORRHAUS bridge must live inside the existing designer closure or receive an equivalently narrow internal interface. It must never give the generic package the broad boot/configuration object. DOM clicking is not an acceptable primary adapter because it cannot reliably quiesce or suppress the existing autosave paths.

## Studio-tote portability proof

`examples/studio-tote/` implements the same contract with a different product
vocabulary and renderer:

- `canvas.weight`, `bag.color`, and `handles.length` replace sock yarn and grip
  options.
- Print method, placement, reinforcement, and artwork status introduce tote
  production dependencies.
- The adapter rejects embroidery on 8 oz canvas, unreinforced 16 oz canvas, and
  two-colour screen printing below 50 units per variant.
- Real tote raster assets and a dynamic print layer replace the sock renderer.

No tote branch or tote-specific rule exists in `packages/codesign-commerce/`.
This is the intended portability model: reuse the transaction and tool surface,
but keep product semantics, validation, preview, and persistence inside the
merchant adapter.
