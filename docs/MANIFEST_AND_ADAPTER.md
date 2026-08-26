# Manifest and adapter guide

## Manifest responsibility

A manifest describes the safe, semantic surface an agent may understand. It does not expose raw state paths or implement the merchant's visual renderer.

Required top-level fields:

- `schemaVersion`: currently exactly `1.0`.
- `id` and `version`: stable safe identifiers and an adapter-controlled version.
- `displayName` and `productType`: public human-readable context.
- `capabilities`: multiple-design, maximum-design, and cloning behavior.
- `optionGroups`: allowlisted semantic options.
- `dependencyRules`: public descriptions of dependencies.
- `approval`: exactly `explicit-human` with `keep-only` persistence.

Unknown top-level and nested fields are rejected. This prevents accidental private-data pass-through and forces explicit contract evolution.

## Option groups

Each option has:

- A stable semantic ID such as `body.color` or `design.quantity`.
- A human label and agent-oriented description.
- Scope: `design` or `order`.
- Kind: `enum`, `color`, `integer`, `boolean`, bounded `text`, or read-only `asset-status`.
- `agentWritable`, with asset status always read-only.
- Static values or numeric/text bounds where applicable.
- An optional public preview-region label.

Canonical roles connect an option to non-selection state:

| Role | Required scope and kind | Meaning |
|---|---|---|
| `design-quantity` | design integer | Quantity allocated to one design |
| `design-name` | design text | Human-readable colourway/design name |
| `order-total` | order integer | Total quantity across designs |
| `selection` or omitted | normally design option | Entry in the public selections map |

Version 1 requires exactly one `design-quantity` and one `order-total` option. Unsafe IDs containing `__proto__`, `prototype`, or `constructor` are rejected.

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
3. Optional `createDesignDraft()` clones one design in detached draft state, assigns a safe unique public ID, makes it active, and performs no preview or persistence side effect. It is required when the manifest advertises cloning.
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
