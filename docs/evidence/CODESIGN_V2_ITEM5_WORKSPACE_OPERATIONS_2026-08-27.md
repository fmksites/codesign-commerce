# CoDesign Commerce Item 5 — canonical workspace and atomic typed operations

Date: 27 August 2026

Branch: `codex/codesign-commerce-v2`

Starting commit: `f168d34714fe5f2cccec80edaeefb096ac010fc4`

## Result

Item 5 passed locally. The public core now contains the Manifest 2.0 canonical workspace boundary and a product-neutral atomic operation reducer. These modules are deliberately independent of persistence; checklist Item 6 will migrate the guarded adapter and proposal transaction onto them.

## Canonical workspace boundary

`sanitizeWorkspaceState()` reconstructs only:

- Manifest/configurator identity and opaque committed revision.
- Active variant identity.
- Declared workspace controls.
- Bounded variants with public names and declared controls.
- Bounded elements with allowlisted target types, declared controls, and optional opaque asset handles.

Control values are finite primitives or exact finite `{x, y}` positions and are then narrowed by the manifest kind/bounds. The guard drops undeclared safe adapter fields and controls, but rejects:

- Unsafe/prototype-pollution keys.
- Manifest/configurator mismatches.
- Duplicate or unsafe variant/element IDs.
- Unknown element types.
- Unknown enum values and malformed/nonnumeric transforms.
- Invalid asset handles.
- Missing unconditional configuration controls.
- Oversized variants/elements.

Adapter stack traces and raw offending objects are not part of the canonical return value.

## Typed operation reducer

The runtime-validated union supports:

- `set-control`
- `create-variant`
- `duplicate-variant`
- `remove-variant`
- `reorder-variant`
- `set-active-variant`
- `attach-asset`
- `remove-asset`

All mutations name an explicit workspace, variant, or element target. Element controls must match the manifest `targetType`. Assets use dedicated attach/remove operations. Create/duplicate operations can carry complete initial controls. Unsupported operations, unknown targets, wrong control scopes/types, unsafe IDs, invalid values, variant-limit violations, and stale revisions fail closed.

The reducer sanitizes and clones the baseline, applies the complete batch to the detached candidate, and sanitizes the complete result. A failed batch never mutates its input. Untargeted variants remain byte-equivalent.

The batch `operationId` is the idempotency key. An identical retry returns the stored result with `deduplicated: true`; a different payload under the same ID returns `OPERATION_ID_CONFLICT`. A proposal ledger accepts at most 80 successful operations before it must be cleared.

## Deterministic coverage

Focused workspace/operation/manifest coverage passed 3 files / 24 tests, including:

- Mixed workspace, variant, element transform, asset, duplicate, and activation batches.
- Complete create/reorder/remove lifecycle.
- Invalid later-operation atomicity and unchanged source bytes.
- Unaffected-variant byte equivalence.
- Exact retry deduplication and conflicting-ID rejection.
- Stale revision, forbidden asset write, unavailable variant operation, and operation limit.
- Unknown fields, unknown created controls, malformed nested values, unsafe handles, and prototype-pollution keys.
- Deterministic malformed-value corpus and collection boundaries.

## Full verification

- Full Vitest suite: 15 files / 119 tests passed.
- Strict workspace typecheck: passed.
- Production build: passed.
- Generated public declarations expose `WorkspaceState`, `ProposalOperation`, `AtomicOperationReducer`, and `OperationValidationError`.
- Browser bundle verification: passed.
- Public-boundary scan: passed for 141 candidates after adding this evidence file.
- Documentation link check: passed for 56 files after adding this evidence file.
- Judge-site check: passed.
- Eval corpus/scorer self-test: passed for 24 cases.
- Tote control parity: 16/16 entries accounted for.
- Product-branch scan of `workspace.ts` and `operations.ts`: no tote, sock, canvas, yarn, or grip branch.
- `git diff --check`: passed.

Artifact hashes before the Item 5 commit:

- Core browser bundle: `sha256:17ed4b12e0a2f22ef91f560eefbdf6972f4b9aa97c3a67f7f5f7be2a945e40e4`
- Tote JavaScript bundle: `sha256:7894b2f7bb24c099a5ec4580f091e2ca48e81d00bc072ab4934e8526435992b8`

The actual in-app browser reloaded the normal local tote after the new core build: 20 controls were present, no proposal panel appeared without an agent proposal, no horizontal overflow was present, and the page title/render remained intact.

No private KORRHAUS file was inspected or modified. Nothing was deployed, published, promoted, or submitted.
