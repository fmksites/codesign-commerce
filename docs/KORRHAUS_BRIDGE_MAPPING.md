# KORRHAUS integration mapping

KORRHAUS is the active real-business implementation of the same public
CoDesign WebMCP core demonstrated by the anonymous Studio Tote. The existing
Custom Sock Designer and its merchant adapter remain private; this repository
contains the reusable contracts and runtime, not a second sock designer.

## Current public contract

The merchant adapter connects the existing designer to exactly these six
page-scoped tools:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

The [dated live verification](./evidence/KORRHAUS_LIVE_WEBMCP_2026-08-31.md)
records discovery of those six tools on the public storefront, a visible
temporary two-colourway proposal, current previews, validation, and a
zero-write human Revert. It deliberately does not claim a Keep on a real
customer draft or compatibility with an untested client.

## Narrow adapter boundary

| Public CoDesign responsibility | Merchant-owned responsibility |
| --- | --- |
| Versioned manifest and bounded public option IDs | Raw product catalogue and manufacturing identifiers |
| Detached public workspace projection | Authenticated customer and project state |
| Atomic temporary proposal state | Existing visual designer and renderer |
| Session-local asset handles | Artwork processing and private storage |
| Revision-bound preview receipts | Merchant preview capture implementation |
| Sanitized validation results | Full production rules and internal diagnostics |
| Page-owned Keep/Revert controller contract | Persistence, retry, and external-change handling |

The adapter returns only allowlisted configuration semantics. Private source
paths, endpoints, credentials, deployment coordinates, feature controls,
customer identifiers, storage references, pricing, margins, suppliers,
quotes, orders, and administrative behavior do not belong in this repository.

## Human and commerce boundary

Agent calls can inspect configuration, stage bounded temporary artwork, change
a visible proposal, request previews, and validate that proposal. Every
proposal result remains `persisted:false` until the person uses the webpage's
own Keep control. There is no CoDesign tool for Keep, Revert, save, upload,
quote acceptance, cart, checkout, order, payment, customer data, supplier
data, or merchant administration.

The public Studio Tote remains the reproducible judge path and runs without a
KORRHAUS account. See the [public/private boundary](./PUBLIC_PRIVATE_BOUNDARY.md)
and [integration quickstart](./INTEGRATION_QUICKSTART.md) for the reusable
architecture.
