# Security policy and public data boundary

CoDesign WebMCP is designed around a narrow webpage capability boundary, not broad access to a merchant application.

## In scope for WebMCP

- Allowlisted canonical configuration state.
- Public option IDs and allowed values.
- Temporary visible proposals.
- Public validation outcomes, warnings, and missing decisions.

## Never exposed through WebMCP

- Authentication tokens, API URLs, raw boot objects, or raw merchant state.
- Customer records or project enumeration.
- Exact pricing, wholesale terms, margins, suppliers, or production administration.
- Uploaded file contents.
- Quote acceptance, checkout, orders, payments, or commercial commitments.
- Keep, Revert, Save, or upload tools.

Inputs use bounded JSON schemas with `additionalProperties: false`, semantic IDs, fixed counts and lengths, and prototype-pollution guards. Outputs and error messages are sanitized. Text that may originate with a user is marked untrusted.

The Manifest 2 contract is bounded to 120 controls, 200 values per control, 20
asset slots, 20 preview surfaces, and 100 dependency descriptions. Enum/color,
integer, number, text, asset, position, scale, and rotation bounds must match
their declared control kind. Malformed or oversized manifests fail before any
tool is registered.

One Manifest 2 proposal batch accepts at most 80 typed operations, and one
temporary proposal accepts at most 240 successful operations across coherent
refinements plus 20 unique assumptions. Every operation ID is bound to the
exact operation kind and payload that first used it; reusing the ID with
different changes fails closed without another preview or write. The exported
legacy proposal-session helper retains its independent 20-operation limit and
is not the current tote or KORRHAUS Manifest 2 path.

Merchant adapter output is untrusted at runtime even when the adapter is
written in TypeScript. The core reconstructs canonical state, option,
validation, clone, and commit results field by field. Undeclared nested fields
are dropped. Unknown values, invalid references, oversized collections, and
malformed results fail closed without returning the offending value or an
adapter stack trace.

Temporary proposal rendering must perform zero storage or network writes. A human Keep action crosses the local commit boundary once. An ambiguous server save is never retried automatically; the page exposes a human retry state instead.

Keep uses optimistic concurrency twice: the core re-reads the committed
revision before calling the adapter, and `commitState()` receives the original
`baseRevision` for an immediate compare-and-swap before its first local write.
An intervening committed change yields `STALE_REVISION`, performs zero writes,
discards the temporary proposal, and restores the latest committed state.

## Reporting a vulnerability

Do not include credentials, customer data, or production exploit details in a public issue. Use the repository owner's private security-reporting channel once the public repository is available.
