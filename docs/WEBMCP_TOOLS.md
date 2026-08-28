# Six WebMCP tools and page confirmation

CoDesign WebMCP exposes one product-neutral tool surface for existing visual customizers. The merchant manifest supplies the vocabulary and bounds; the merchant adapter supplies real state, rules, rendering, temporary assets, and persistence. The package does not infer DOM paths or replace the customizer.

## Exact public surface

`registerCoDesignTools()` registers these six tools, in this order, only when the page is enabled and `document.modelContext.registerTool` exists:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

All six registrations share one `AbortController`. Page teardown aborts every tool and destroys the proposal engine, which restores an unsaved preview and releases temporary resources. A disabled page, unsupported browser, or invalid manifest registers no partial tool set and leaves the normal human customizer usable.

There is deliberately no WebMCP Keep, Revert, save, retry, upload, quote, checkout, order, payment, customer, pricing, supplier, or administrative tool.

## Tool responsibilities

### Read workspace

`codesign_read_workspace` returns the field-by-field sanitized committed `WorkspaceState`, public configurator identity, high-level capabilities, and bounded pending-proposal metadata. It never returns the adapter snapshot, raw artwork, private storage references, customer data, or persistence internals.

### List capabilities

`codesign_list_capabilities` can filter by variant, element, control IDs, and capability categories. Its output combines the validated manifest with guarded current availability. It can describe controls, finite values and bounds, variant operations, asset slots, preview surfaces, and public dependency descriptions. Unknown targets and undeclared filters fail closed.

### Stage asset

`codesign_stage_asset` accepts only a manifest-declared slot and bounded source. The core verifies the source policy, bytes, media type, limits, and adapter result. It returns an opaque expiring handle plus sanitized metadata and `persisted: false`; the source data is not echoed. A staged asset is a proposal resource, not a normal merchant upload.

### Apply proposal

`codesign_apply_proposal` accepts one atomic batch of typed operations against an opaque committed revision. Refinements also require the exact proposal ID and revision. The reducer can set controls; attach or remove asset handles; and perform only manifest-declared create, duplicate, remove, reorder, or activate variant operations. A valid candidate is merchant-validated and rendered visibly with zero writes. The result contains a cumulative public diff, validation, current proposal identity, and an explicit page Keep/Revert requirement.

### Get previews

`codesign_get_previews` captures the merchant's existing renderer for the exact pending proposal revision. It returns a complete bounded variant/surface artifact matrix with integrity receipts and current validation. Old, missing, duplicate, malformed, or failed artifacts are unavailable; Keep remains disabled until a current capture succeeds.

### Validate proposal

`codesign_validate_proposal` validates either committed state or one exact proposal revision. It distinguishes configuration validity from production readiness and returns only public constraint errors, decisions required, warnings, information, and assumptions. It is read-only.

## Schema and runtime boundary

Tool JSON Schemas are generated from the validated manifest. Every object schema uses `additionalProperties: false`; IDs, arrays, text, operations, assets, transforms, variants, and preview filters are bounded. Browser schema enforcement is not trusted as the only defense: every handler and engine entry point validates again at runtime.

Merchant outputs pass through guarded field-by-field reconstruction. Unknown safe fields are dropped; malformed structures fail as generic public adapter errors. Raw values and private exceptions are never interpolated into public error messages.

Tool annotations are:

| Tool | `readOnlyHint` | `untrustedContentHint` |
|---|---:|---:|
| Read workspace | true | true |
| List capabilities | true | true |
| Stage asset | false | true |
| Apply proposal | false | true |
| Get previews | true | true |
| Validate proposal | true | true |

Preview capture is marked read-only because it creates no merchant persistence; internal ephemeral artifact receipts remain bound to the current proposal.

## Page-owned Keep and Revert

`ProposalReviewController` is the single confirmation boundary for direct shopper clicks and chat-directed browser activation. It appears only after a proposal has rendered successfully. The merchant's ordinary controls remain visible but are locked while proposal work could race them.

The panel shows cumulative changes, created/removed variants, assumptions, public validation issues, and production readiness. Revert remains available while the proposal is reviewable. Keep is unavailable while applying, capturing, stale, preview-unavailable, reverting, or committing. When previews are configured, Keep becomes enabled only after the exact current preview receipts exist.

Keep calls the proposal engine once with `trigger: "confirmed_page_keep"`. The engine rechecks the committed revision immediately before the adapter's compare-and-swap write. A retryable server failure cannot repeat the local write; an unknown outcome cannot retry or claim success. Revert restores the opaque merchant snapshot without invoking the commit adapter.

The page cannot cryptographically inspect a host conversation. Host confirmation behavior therefore remains an end-to-end release test, while the site security boundary stays concrete: no site tool can persist, and the only persistence path is the visible page controller.

## Verified local behavior

On 27 August 2026, native Chrome 151 and the Codex in-app browser independently discovered the same exact six tools from the local tote origin. Both executed `read -> apply -> preview`, visibly changed the existing tote renderer, returned a 640 × 640 WebP artifact, and left local/server/commit counters at zero. Visible Revert restored the baseline with one restore and zero writes. A separate supplied-artwork run staged a real 214,745-byte PNG, rendered it on the tote, returned a different current preview integrity, and released it on Revert with zero imports or commits.

These are local Item 8 facts. They do not constitute a public deployment, normal-ChatGPT compatibility, or KORRHAUS production claim.
