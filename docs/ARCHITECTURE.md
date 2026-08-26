# CoDesign Commerce architecture

## Purpose

CoDesign Commerce adds a safe agent-collaboration transaction to an existing complex product configurator. The merchant keeps its renderer, controls, rules, and persistence. The public package contributes a canonical manifest, webpage WebMCP tools, proposal coordination, human review state, and adapter contract.

It is intentionally not a universal product renderer, Shopify cart replacement, remote MCP server, quote engine, or autonomous ordering system.

## Runtime boundary

```text
Browser agent
    │ discovers and invokes webpage tools
    ▼
document.modelContext.registerTool(...)
    │ bounded schemas and sanitized results
    ▼
CoDesign tool handlers
    │ revisions, operation IDs, one active proposal
    ▼
ProposalSession ─────── ConfiguratorManifest
    │                         │
    │ canonical state         └── semantic options and public constraints
    ▼
Runtime adapter guard
    │ field-by-field reconstruction; malformed output fails closed
    ▼
Merchant adapter
    ├── allowlisted state mapping
    ├── public-safe draft design cloning
    ├── persistence quiescence
    ├── private raw snapshot
    ├── zero-write preview and restore
    ├── merchant rule validation
    └── idempotent Keep commit
             │
             ▼
Existing configurator UI, renderer, and persistence
```

The generic core never reads merchant raw state. A private snapshot may contain raw state, but it stays inside the adapter. The core receives only serializable canonical values.

## Proposal transaction

```text
IDLE
  │ propose against current committed revision
  ▼
APPLYING ── failure/cancel ──► restore snapshot ──► IDLE
  │ zero-write preview
  ▼
AWAITING HUMAN
  ├── Revert ────────────────► zero-write restore ──► IDLE
  ├── external revision ─────► INVALIDATED ─────────► restore latest ─► IDLE
  └── Keep
         ▼
     COMMITTING
       ├── local + server success ────────────────► IDLE
       ├── local success, expected server failure ► COMMIT RETRY
       └── adapter throws / unknown outcome ──────► COMMIT UNCERTAIN
```

Rules enforced by the core:

- One proposal session at a time.
- Every mutating operation names its committed base revision.
- An extension also names the current proposal ID and proposal revision.
- Operation IDs are bounded safe identifiers and deduplicate successful retries.
- Every batch is validated on a detached copy before any preview update.
- External changes are rechecked after every asynchronous draft, validation,
  and preview boundary.
- Keep and Revert are controller methods intended only for visible page controls; they are not WebMCP tools.
- Keep is rejected when another operation is in flight or the committed state changed.
- Keep passes the proposal's base revision to the adapter, which must compare it
  with current committed state immediately before the first local write.
- An expected server failure is an explicit adapter result. Retrying uses the same proposal ID and does not repeat the local write.
- If an adapter throws during commit, persistence is reported as `unknown`; the UI must require reload rather than guessing or automatically retrying.

## WebMCP lifecycle

`registerCoDesignTools()` feature-detects `document.modelContext`. A browser without WebMCP receives the unchanged normal interface. When supported, all page tools are registered with a shared `AbortController`; aborting it unregisters the page tools without exposing them outside the configurator lifecycle.

The complete public runtime registers exactly:

- `codesign_read_configuration` — read-only canonical state and proposal metadata.
- `codesign_list_options` — read-only public option values, availability, bounds, and dependency descriptions.
- `codesign_propose_configuration` — a temporary, visible, zero-write change to existing designs.
- `codesign_create_design` — a zero-write clone inside the same proposal, with coordinated source, order, and new-design changes.
- `codesign_validate_configuration` — read-only consistency and production-readiness validation for the committed state or open proposal.

`codesign_create_design` does not create a Shopify product or catalog variant. The adapter supplies a detached canonical clone, the core verifies clone invariants, applies all changes atomically, validates the complete state, and only then renders the temporary preview.

The implementation follows the current imperative API documented by [Chrome](https://developer.chrome.com/docs/ai/webmcp/imperative-api) and the [WebMCP Community Group specification](https://webmachinelearning.github.io/webmcp/). WebMCP remains experimental, so actual supported-browser verification is a release gate.

## Trust model

Tool inputs are untrusted even when a browser is expected to enforce their JSON Schema. Handlers repeat essential structural checks at runtime. Schemas reject additional properties, arbitrary paths, URLs, HTML, file content, and unbounded arrays or text.

Tool output is an allowlist, not a redacted raw object. A runtime adapter guard
rebuilds every public state, option, validation, clone, and commit result from
declared canonical fields; extra nested fields never pass through and malformed
results become generic failures. The tool factory uses the proposal session's
detached, validated manifest rather than trusting a second caller-supplied
reference. User-originated names, text, assumptions, or selections are marked
with `untrustedContentHint: true`. Errors use public codes and never return
stack traces.

The following are absent by design:

- WebMCP Keep, Revert, Save, Retry, Upload, Quote, Checkout, Order, or Payment tools.
- Customer/project enumeration.
- Exact pricing, wholesale terms, margins, suppliers, or private production logic.
- Tokens, raw API locations, broad application boot objects, or uploaded file contents.
- Remote proposal history or full natural-language-brief logging.

See [SECURITY.md](../SECURITY.md) and [PUBLIC_PRIVATE_BOUNDARY.md](../PUBLIC_PRIVATE_BOUNDARY.md).

## Package layout

The challenge uses one TypeScript package:

```text
packages/codesign-commerce/
  src/
    types.ts                 canonical contracts
    manifest.ts              structural and semantic validation
    adapter-boundary.ts      runtime output reconstruction and fail-closed guards
    proposal-session.ts      transaction and concurrency rules
    review-controller.ts     framework-neutral human-review state
    review-view.ts           accessible Keep/Revert web component
    webmcp.ts                tool definitions and page lifecycle
    in-memory-adapter.ts     deterministic reference adapter
  tests/
    adapter-contract.test.ts
    adapter-boundary.test.ts
    manifest.test.ts
    proposal-session.test.ts
    review-controller.test.ts
    review-view.test.ts
    webmcp.test.ts

examples/korrhaus-reference/
  src/main.ts                public manifest, adapter, and renderer wiring
  src/styles.css             reproducible KORRHAUS reference surface
  public/                    KORRHAUS-owned public-safe visual assets

examples/studio-tote/
  src/configurator.ts        tote manifest, adapter, and production rules
  src/main.ts                human UI, renderer, review, and WebMCP wiring
  src/styles.css             distinct responsive tote visual system
  public/                    generated public-safe tote product cutouts
```

Both public examples consume the same package and review view. The tote adds no
core condition, option ID, renderer behavior, or product rule: all tote-specific
work stays under `examples/studio-tote/`. Merchant-specific mapping must not be
added to the core.
