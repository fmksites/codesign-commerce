# Manifest and adapter guide

For a concrete five-step implementation sequence and wiring example, start with
[`INTEGRATION_QUICKSTART.md`](./INTEGRATION_QUICKSTART.md), then use this guide
as the contract reference.

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
interface WorkspaceState {
  configuratorId: string;
  manifestVersion: string;
  committedRevision: string;
  activeVariantId: string;
  workspaceControls: Record<string, ControlValue>;
  variants: Array<{
    id: string;
    name: string;
    controls: Record<string, ControlValue>;
    elements: Array<{
      id: string;
      type: string;
      controls: Record<string, ControlValue>;
      assetHandle?: string;
    }>;
  }>;
}
```

The committed revision is opaque. It must change whenever committed public state changes and must not encode confidential values. `ControlValue` is restricted to primitive manifest values or an exact finite `{x, y}` position.

`sanitizeWorkspaceState()` reconstructs this contract field by field, drops undeclared safe adapter fields and controls, and rejects unsafe keys, malformed IDs, duplicate variants/elements, unknown element types, invalid values/assets/transforms, oversized arrays, and manifest identity mismatches.

The guarded adapter wraps every merchant adapter at runtime. Its workspace,
availability, validation, preview, and commit results are reconstructed field
by field into the canonical public contract. Unknown fields are dropped;
malformed values fail closed with a generic `ADAPTER_FAILURE`. TypeScript types
alone are not treated as a data boundary.

## Public validation issue contract

Merchant validation can return a localized, actionable issue without exposing
private production logic:

```ts
interface WorkspaceValidationIssue {
  issueId: string;
  code: string;
  severity: "constraint-error" | "decision-required" | "warning" | "information";
  message: string;
  controlIds?: string[];
  variantIds?: string[];
  elementIds?: string[];
  surfaceId?: string;
  normalizedPreviewRegion?: { x: number; y: number; width: number; height: number };
  repairable: boolean;
  merchantApprovedRepairs?: Array<{
    id: string;
    label: string;
    operations: SetControlOperation[];
  }>;
}
```

Coordinates are normalized to the declared preview surface and must stay
inside `[0, 1]`. A repairable issue must name affected controls and supply a
bounded, fully validated set-control batch. Repair operations may reference
only affected, agent-writable controls and exact declared targets/values. The
agent may select one returned repair; it may not invent a production fix.

The guarded adapter also provides a migration-safe default for existing
adapters: when `issueId` is absent it derives a stable-in-result-order
`legacy-<index>-<code>` identifier, and when `repairable` is absent it defaults
to `false`. Legacy issues therefore remain visible and localizable at the
result level but do not gain repair authority. Merchants should add permanent
domain IDs before relying on cross-revision issue identity.

## Adapter obligations

`WorkspaceAdapter` has eleven responsibilities:

1. `readWorkspace()` returns a detached canonical committed workspace.
2. `listAvailability()` returns public control availability and reasons.
3. `quiescePersistence()` flushes or awaits recent human saves before snapshotting.
4. `captureSnapshot()` keeps a private exact raw snapshot inside the adapter.
5. `beginProposalMode()` isolates agent rendering from normal autosave.
6. `validateWorkspace()` applies public and merchant-specific rules without leaking private explanations.
7. `previewWorkspace()` updates the existing visible renderer with zero storage/network writes.
8. `restoreSnapshot()` performs an exact zero-write Revert.
9. `commitWorkspace()` compares `metadata.baseRevision` with the adapter's current
   committed revision immediately before its first local write, then crosses
   local persistence once and securely saves idempotently per proposal ID.
10. `endProposalMode()` unlocks the human interface and releases proposal-only state.
11. `subscribeToExternalChanges()` invalidates stale proposals.

Variant creation, duplication, removal, reordering, activation, control edits,
asset binding, and transforms are expressed as one bounded atomic operations
batch. The core applies that batch to detached canonical state, rejects any
invalid intermediate result, and previews only the fully validated outcome.

If current validation exposes a repairable issue, a subsequent operation batch
that touches that issue must be byte-for-byte equivalent after canonicalization
to one whole `merchantApprovedRepairs[].operations` batch. The core rejects a
different value, partial repair, repair mixed with another change, or
undeclared repair before calling the merchant preview. Unrelated refinements
remain allowed.

Any accepted refinement—including an approved repair—advances the proposal
revision and invalidates its old preview receipts. New merchant-rendered
previews and validation are required before Keep.

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

The challenge submission improvements do not change this private adapter. The
new public validation fields use the legacy-ID/nonrepairable defaults until a
merchant integration deliberately adopts localized repairs. No KORRHAUS
mapping, rule, renderer, or persistence implementation is copied into this
repository.

## Post-Keep public projection and Passport

Configuration Passport v0.1 is optional integration output after a confirmed
Keep, not part of `WorkspaceAdapter.commitWorkspace()` and not a WebMCP tool.
The integration must project the newly committed workspace through a
manifest-aware public allowlist. Asset-kind controls, opaque asset handles, raw
artwork, URLs, temporary transports, prices, customers, suppliers, prompts,
tokens, private rules, and internal endpoints must not enter the projection or
Passport.

Creation binds the committed revision, exact pre-Keep preview receipts,
configuration/production readiness, a structured bounded summary, and a
same-origin public re-edit URL. Verification must be given the expected
merchant origin, configurator ID, manifest version, renderer version, and
public-safe readiness freshly recomputed by the merchant from the exact current
committed state. Verification compares readiness exactly and fails closed for
unknown/mismatched values or digest changes. The public re-edit URL must contain
no query or fragment data. The integrity
hash is unsigned tamper evidence only; it is not a merchant signature.

`toShopifyLineMetadata()` is a pure reference conversion for an already
runtime-verified, current-readiness-bound, production-ready Passport. It returns only the opaque
configuration ID, digest, canonical summary, and edit URL. The merchant still
owns any later Shopify cart operation; this mapper performs no write.

## Studio-tote portability proof

`examples/studio-tote/` implements the same contract with a different product
vocabulary and renderer:

- `canvas.weight`, `bag.color`, and `handles.length` replace sock yarn and grip
  options.
- Print method, placement, reinforcement, and branding status introduce tote
  production dependencies.
- The adapter rejects embroidery on 8 oz canvas, unreinforced 16 oz canvas, and
  two-colour screen printing below 50 units per variant.
- A non-empty studio-name treatment is the ordinary production-ready branding
  fallback; supplied artwork remains an optional advanced proof.
- An oversized upper-left branding mark on charcoal produces a localized
  Constraint X-Ray issue and one exact 78% merchant-approved repair batch.
- Real tote raster assets and a dynamic print layer replace the sock renderer.

No tote branch or tote-specific rule exists in `packages/codesign-webmcp/`.
This is the intended portability model: reuse the transaction and tool surface,
but keep product semantics, validation, preview, and persistence inside the
merchant adapter.
