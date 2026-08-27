# Canonical workspace and typed operations

Manifest 2.0 integrations exchange one detached, JSON-compatible public workspace. Merchant objects, renderer nodes, private snapshots, pricing, customer data, supplier fields, and arbitrary nested values never enter this contract.

## Workspace shape

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

`ControlValue` is limited to string, finite number, boolean, null, or an exact finite `{x, y}` position. The manifest control kind narrows that value further. Asset values are opaque safe handles, never bytes or storage paths.

`sanitizeWorkspaceState()` reconstructs every public field and control. It drops undeclared safe adapter fields/controls, but rejects unsafe keys, mismatched manifest identity, duplicate variant/element IDs, unknown element types, invalid allowlist values, invalid transforms, invalid asset handles, missing canonical quantity controls, and oversized arrays.

## Atomic operation batches

`AtomicOperationReducer` accepts runtime-validated batches of one to 80 operations:

- `set-control`
- `create-variant`
- `duplicate-variant`
- `remove-variant`
- `reorder-variant`
- `set-active-variant`
- `attach-asset`
- `remove-asset`

Every control mutation names a workspace, variant, or element target. Element controls must match the manifest's declared `targetType`. Position, scale, rotation, typography, color, and other product semantics stay ordinary manifest controls; the reducer contains no tote or sock branch.

A batch is applied only to a sanitized detached clone. Every operation and the complete resulting workspace must validate before the caller receives it. A failure leaves the supplied workspace byte-equivalent.

Batch-level `operationId` is the idempotency key. An identical retry returns the original result with `deduplicated: true`; reuse with a different payload fails with `OPERATION_ID_CONFLICT`. `clear()` starts a fresh proposal ledger.

This module is the canonical-state/operation foundation for the guarded adapter and proposal engine migration in checklist Item 6. It is not a persistence path and cannot Keep, save, quote, order, or upload anything.
