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

All six registrations share one `AbortController`. Page teardown aborts every
tool, stops invocation-observer delivery, and destroys the proposal engine,
which restores an unsaved preview and releases temporary resources. The page
waits for `registration.ready` before presenting the tools as active. A disabled
page, unsupported browser, invalid manifest, or failed registration therefore
registers no usable partial surface and leaves the normal human customizer
available.

There is deliberately no WebMCP Keep, Revert, save, retry, upload, quote, checkout, order, payment, customer, pricing, supplier, or administrative tool.

## Natural-language selection contract

The six registrations are a routing map, not an incantation API. A shopper
should say what they want to design in ordinary commerce language. The tool
titles, descriptions, annotations, and input-schema descriptions explicitly
tell a capable client to:

1. read first for any design, customization, inspection, or refinement intent;
2. discover current choices before translating subjective direction;
3. stage only artwork the shopper actually supplied;
4. create or refine the visible temporary product proposal;
5. return current previews after every coherent visual pass; and
6. validate production readiness after the proposal.

Commerce intents such as catalog search, cart, checkout, quote, order, and
payment are explicitly excluded from the design-mutation tool description so a
client can select Shopify or another commerce capability instead.

This contract begins after the client visits the configurator. WebMCP is
page-scoped and cannot make a closed page globally discoverable. Merchant
selection and navigation into the correct product designer belong to browser,
search, catalog, or storefront tooling; CoDesign owns the difficult structured
work inside the open designer.

## Tool responsibilities

### Read workspace

`codesign_read_workspace` returns the field-by-field sanitized committed `WorkspaceState`, public configurator identity, high-level capabilities, and bounded pending-proposal metadata. It never returns the adapter snapshot, raw artwork, private storage references, customer data, or persistence internals.

### List capabilities

`codesign_list_capabilities` can filter by variant, element, control IDs, and capability categories. Its output combines the validated manifest with guarded current availability. It can describe controls, finite values and bounds, variant operations, asset slots, preview surfaces, and public dependency descriptions. Unknown targets and undeclared filters fail closed.

### Stage asset

`codesign_stage_asset` accepts only a manifest-declared slot and bounded source. The core verifies the source policy, bytes, media type, limits, and adapter result. It returns an opaque expiring handle plus sanitized metadata and `persisted: false`; the source data is not echoed. A staged asset is a proposal resource, not a normal merchant upload.

### Apply proposal

`codesign_apply_proposal` accepts one atomic batch of typed operations against an opaque committed revision. Refinements also require the exact proposal ID and revision. The reducer can set controls; attach or remove asset handles; and perform only manifest-declared create, duplicate, remove, reorder, or activate variant operations. A valid candidate is merchant-validated and rendered visibly with zero writes. The result contains a cumulative public diff, validation, current proposal identity, and an explicit page Keep/Revert requirement.

When current validation marks an issue repairable, an operation batch touching
that issue must exactly equal one complete `merchantApprovedRepairs` batch
returned by the guarded adapter. The same proposal tool is used—there is no
privileged repair tool—but approximate values, extra operations, and invented
fixes fail atomically without changing the last reviewable preview.

### Get previews

`codesign_get_previews` captures the merchant's existing renderer for the exact pending proposal revision. It returns a complete bounded variant/surface artifact matrix with integrity receipts and current validation. Old, missing, duplicate, malformed, or failed artifacts are unavailable; Keep remains disabled until a current capture succeeds.

### Validate proposal

`codesign_validate_proposal` validates either committed state or one exact proposal revision. It distinguishes configuration validity from production readiness and returns only public constraint errors, decisions required, warnings, information, and assumptions. It is read-only.

Public issues carry a stable `issueId` and `code`, an optional closed-enum
`source` (`merchant-rule`, `current-configuration`, `renderer-evidence`, or
`customer-brief`), affected control/variant/element IDs, optional preview
`surfaceId` and normalized preview region,
`repairable`, and optional bounded merchant-approved repair batches. A legacy
issue without these additions receives a deterministic legacy ID and remains
nonrepairable. This compatibility default provides localization without
silently allowing old adapters to authorize repairs.

The tote renders the canonical source label beside the production result. It
also tracks preview evidence by proposal revision. A design change visibly
marks the prior receipt **Outdated preview**; Keep remains unavailable until a
new capture returns **Current preview** for the exact revision. The label is a
view of revision-bound receipts, not a timestamp or cosmetic loading state.

## Canonical success envelope

Every successful tool result retains its complete structured payload and adds:

- `message`: fixed canonical guidance selected from trusted result state,
  limited to 500 characters and never interpolated from shopper text, labels,
  assumptions, validation prose, artwork, URLs, or adapter values;
- `nextAction`: exactly `inspect-capabilities`, `apply-proposal`,
  `capture-previews`, `refine-proposal`, `human-review`, or `none`.

`human-review` is returned only when both configuration validity and production
readiness are true and a current preview exists. A visible-but-not-ready
proposal routes to `refine-proposal`; a non-ready committed state routes to
`apply-proposal`. Agents must still inspect the complete structured result—the
envelope is a deterministic routing aid, not a replacement for revisions,
issues, receipts, or `persisted`.

## Privacy-safe invocation observer

`createCoDesignTools()` and `registerCoDesignTools()` accept an optional
`onInvocation` callback. Each event contains only:

```ts
{
  toolName,
  phase: "start" | "success" | "error" | "cancelled",
  effect: "inspect" | "temporary-change",
  timestamp,
  duration,
}
```

Arguments, results, control values, shopper copy, validation messages, artwork,
URLs, and customer data are never included. Observer failures are ignored and
cannot change tool behavior. The registered lifecycle suppresses events after
`unregister()`.

The tote renders these real events as “Inspecting current design”, “Reading
available choices”, “Preparing temporary artwork”, “Updating temporary
proposal”, “Capturing current previews”, and “Checking production readiness”.
Its collapsed disclosure is generated from `toolDisclosures` after successful
registration and truthfully summarizes “4 inspect · 2 temporary design · 0
save/order/payment”. The disclosure explains that access belongs to the current
tab and ends when it closes.

## Schema and runtime boundary

Tool JSON Schemas are generated from the validated manifest. Every object schema uses `additionalProperties: false`; IDs, arrays, text, operations, assets, transforms, variants, and preview filters are bounded. Browser schema enforcement is not trusted as the only defense: every handler and engine entry point validates again at runtime.

Root inputs and routing-critical properties carry plain-language descriptions.
The eval validator rejects prompts containing `WebMCP`, CoDesign tool names,
or “tool call” wording, preventing technical hints from being counted as
normal shopper-intent coverage.

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

An integration may create Configuration Passport v0.1 only after that
successful Keep result. It receives the committed revision plus the exact
current preview receipts and a manifest-aware public configuration projection.
It issues nothing for Revert, stale, preview-unavailable, failed, or uncertain
paths. Asset controls and private values are stripped from the projection.

The Passport's configuration digest and passport-integrity hash are unsigned
tamper-evidence receipts, not a signature or authentication claim. Verification
requires the expected merchant origin, configurator ID, manifest version,
renderer version, and current public-safe readiness recomputed from the
committed state. Receipt readiness must match that merchant-authoritative
result exactly. Re-edit URLs contain no query or fragment data. A separate pure
`toShopifyLineMetadata()` helper accepts only a runtime-verified, current-
readiness-bound, production-ready
Passport. It creates reference metadata but never writes a cart or adds a
seventh WebMCP tool.

The page cannot cryptographically inspect a host conversation. Host confirmation behavior therefore remains an end-to-end release test, while the site security boundary stays concrete: no site tool can persist, and the only persistence path is the visible page controller.

## Verified local behavior

On 27 August 2026, native Chrome 151 and the Codex in-app browser independently discovered the same exact six tools from the local tote origin. Both executed `read -> apply -> preview`, visibly changed the existing tote renderer, returned a 640 × 640 WebP artifact, and left local/server/commit counters at zero. Visible Revert restored the baseline with one restore and zero writes. A separate supplied-artwork run staged a real 214,745-byte PNG, rendered it on the tote, returned a different current preview integrity, and released it on Revert with zero imports or commits.

These are local Item 8 facts. They do not constitute a public deployment, normal-ChatGPT compatibility, or KORRHAUS production claim.
