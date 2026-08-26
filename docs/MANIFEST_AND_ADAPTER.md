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

## Adapter obligations

`ConfiguratorAdapter` has nine responsibilities:

1. `readState()` returns a detached canonical committed state.
2. `listOptions()` returns public availability and reasons.
3. `quiescePersistence()` flushes or awaits recent human saves before snapshotting.
4. `captureSnapshot()` keeps a private exact raw snapshot inside the adapter.
5. `previewState()` updates the existing visible renderer with zero storage/network writes.
6. `validateState()` applies public and merchant-specific rules without leaking private explanations.
7. `restoreSnapshot()` performs an exact zero-write Revert.
8. `commitState()` crosses local persistence once and securely saves idempotently per proposal ID.
9. `subscribeToExternalChanges()` invalidates stale proposals.

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

## KORRHAUS adapter rule

The private KORRHAUS bridge must live inside the existing designer closure or receive an equivalently narrow internal interface. It must never give the generic package the broad boot/configuration object. DOM clicking is not an acceptable primary adapter because it cannot reliably quiesce or suppress the existing autosave paths.
