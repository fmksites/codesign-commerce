# CoDesign WebMCP architecture

## Purpose

CoDesign WebMCP adds a safe agent-collaboration transaction to an existing complex product configurator. The merchant keeps its renderer, controls, rules, and persistence. The public package contributes a canonical manifest, webpage WebMCP tools, proposal coordination, human review state, and adapter contract.

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
    │ canonical message/nextAction envelope
    │ privacy-safe invocation observer
    │ revisions, operation IDs, one active proposal
    ▼
ProposalEngine ──────── ConfiguratorManifest 2.0
    │                         │
    │ canonical workspace     └── typed controls, assets, variants, previews
    ▼
GuardedWorkspaceAdapter
    │ field-by-field reconstruction; malformed output fails closed
    ▼
Merchant adapter
    ├── allowlisted workspace mapping
    ├── typed variant operations
    ├── persistence quiescence
    ├── private raw snapshot
    ├── zero-write preview and restore
    ├── merchant rule validation
    ├── localized issues + declared repair batches
    └── idempotent Keep commit
             │
             ▼
Existing configurator UI, renderer, and persistence
```

The generic core never reads merchant raw state. A private snapshot may contain raw state, but it stays inside the adapter. The core receives only a field-by-field reconstructed `WorkspaceState` and opaque temporary asset handles.

## Proposal transaction

```text
IDLE ─► BUILDING ─► VALIDATING ─► RENDERING ─► REVIEWABLE
                                                │
                                  capture exact current previews
                                                │
                                                ▼
                                      HUMAN KEEP / REVERT
  ├── Revert ───────────────────────► zero-write restore ─► IDLE
  ├── external revision ────────────► STALE ─► restore latest ─► IDLE
  └── visible page Keep
         ▼
     COMMITTING
       ├── local + server success ────────────────► IDLE
       ├── local success, expected server failure ► COMMIT RETRY
       └── adapter throws / unknown outcome ──────► COMMIT UNCERTAIN
```

Rules enforced by the core:

- One proposal session at a time.
- Every mutating operation names its committed base revision.
- A refinement also names the current proposal ID and proposal revision.
- Operation IDs are bounded safe identifiers and deduplicate successful retries.
- Every typed operation batch is validated on a detached workspace before any preview update.
- A refinement that touches a repairable issue must exactly equal one complete
  merchant-approved repair batch. An approximate, broadened, mixed, or invented
  repair fails before the visible proposal changes.
- External changes are rechecked after every asynchronous draft, validation,
  and preview boundary.
- Current renderer artifacts are bound to the exact proposal, revision, variant, surface, and workspace hash; stale or failed capture blocks Keep.
- Keep and Revert are controller methods used only by visible page controls; they are not WebMCP tools.
- Keep is rejected when another operation is in flight or the committed state changed.
- Keep passes the proposal's base revision to the adapter, which must compare it
  with current committed state immediately before the first local write.
- An expected server failure is an explicit adapter result. Retrying uses the same proposal ID and does not repeat the local write.
- If an adapter throws during commit, persistence is reported as `unknown`; the UI must require reload rather than guessing or automatically retrying.

## WebMCP lifecycle

`registerCoDesignTools()` feature-detects `document.modelContext`. A browser
without WebMCP receives the unchanged normal interface. When supported, all
page tools are registered with a shared `AbortController`; aborting it
unregisters the page tools, stops observer delivery, and destroys the temporary
proposal session. A page should disclose the tools only after the registration
promise resolves, so a failed or incomplete registration is never presented as
active.

The complete public runtime registers exactly:

- `codesign_read_workspace` — read-only committed workspace plus bounded proposal metadata.
- `codesign_list_capabilities` — read-only controls, availability, variant operations, asset slots, preview surfaces, and public dependencies.
- `codesign_stage_asset` — stage one bounded temporary asset and return only an opaque handle.
- `codesign_apply_proposal` — apply an atomic typed operation batch to the existing visible renderer with zero writes.
- `codesign_get_previews` — capture current revision-bound renderer images and validation.
- `codesign_validate_proposal` — read-only configuration and production-readiness validation for committed or proposed state.

Variant creation is a typed `codesign_apply_proposal` operation. It creates a temporary customizer variant, never a Shopify catalog variant. The core reduces the complete batch on a detached workspace, validates it, and only then invokes the merchant renderer.

Every successful tool result preserves its complete structured result and adds
two model-legible routing fields. `message` is selected from fixed canonical
copy, never composed from shopper, adapter, validation, label, or artwork text,
and is capped at 500 characters. `nextAction` is one of
`inspect-capabilities`, `apply-proposal`, `capture-previews`,
`refine-proposal`, `human-review`, or `none`. The structured state remains the
authority; these fields are bounded navigation hints.

An optional invocation observer receives only `toolName`, `phase`
(`start | success | error | cancelled`), `effect`
(`inspect | temporary-change`), `timestamp`, and `duration`. It never receives
arguments, results, configuration values, shopper text, artwork, or URLs. The
studio-tote activity rail and its “4 inspect · 2 temporary design · 0
save/order/payment” disclosure are derived from these actual registrations and
events, rather than inferred UI progress.

## Localized validation and repair

A public validation issue can locate a problem by stable issue ID and code,
affected control/variant/element, preview surface, and optional normalized
preview region. It may also declare a bounded list of merchant-approved repair
batches. Legacy adapter issues without the new fields receive a deterministic
`legacy-<index>-<code>` issue ID and default to `repairable: false`; they do not
silently gain repair authority.

The studio tote uses this contract for its Constraint X-Ray: an oversized
upper-left branding mark on charcoal canvas is configuration-valid and
visible, but not production-ready. The renderer highlights the affected region
and the adapter offers the exact 78% scale batch. Applying that batch creates a
new proposal revision, invalidates prior preview receipts, rerenders only the
affected proposal state, and requires fresh preview capture and validation.
Studio-name typography is a valid production branding fallback, so supplied
artwork is optional rather than a prerequisite for the ordinary shopper flow.

## Configuration Passport v0.1

After—and only after—the page-owned Keep completes successfully, an
integration may issue Configuration Passport v0.1. Revert, stale proposals,
missing preview evidence, failed commits, or uncertain commit outcomes issue
nothing. The Passport binds the merchant origin and configurator, opaque
configuration ID, committed revision, manifest and renderer versions,
public-safe configuration digest, exact preview receipts, readiness, bounded
summary, and same-origin re-edit URL.

The Passport is an **unsigned deterministic integrity receipt**, not a digital
signature, proof of merchant identity, or portable authorization token. Its
SHA-256 fields detect changes when the verifier also has the public-safe
configuration and an expected origin/configurator/manifest/renderer policy.
That policy must also carry public-safe readiness freshly recomputed by the
merchant from the current committed state; verification compares it exactly
with the receipt and brands the result only when they match. Re-edit URLs carry
no query or fragment data. Verification fails closed on a mismatch or unknown version. The public
configuration projection excludes asset handles and data, private controls,
prices, customer/supplier data, prompts, tokens, and internal endpoints.

`toShopifyLineMetadata()` is a pure reference mapper. It accepts only a
runtime-verified, production-ready Passport whose readiness was bound to that
current merchant validation, and returns an opaque configuration ID,
configuration digest, canonical safe summary, and re-edit URL. It performs no
Shopify cart, checkout, order, or payment write and is not a seventh WebMCP
tool.

The implementation follows the current imperative API documented by [Chrome](https://developer.chrome.com/docs/ai/webmcp/imperative-api) and the [WebMCP Community Group specification](https://webmachinelearning.github.io/webmcp/). WebMCP remains experimental, so actual supported-browser verification is a release gate.

## Trust model

Tool inputs are untrusted even when a browser is expected to enforce their JSON Schema. Handlers repeat essential structural checks at runtime. Schemas use `additionalProperties: false` throughout and reject arbitrary paths, undeclared sources, HTML, unbounded arrays, and oversized text or assets.

Tool output is an allowlist, not a redacted raw object. A runtime adapter guard
rebuilds every public workspace, availability, validation, preview, and commit result from
declared canonical fields; extra nested fields never pass through and malformed
results become generic failures. The tool factory uses the proposal engine's
detached, validated manifest rather than accepting a second caller-supplied
reference. User-originated names, text, assumptions, or selections are marked
with `untrustedContentHint: true`. Errors use public codes and never return
stack traces.

The following are absent by design:

- WebMCP Keep, Revert, Save, Retry, Upload, Quote, Checkout, Order, or Payment tools.
- Customer/project enumeration.
- Exact pricing, wholesale terms, margins, suppliers, or private production logic.
- Tokens, raw API locations, broad application boot objects, or uploaded file contents.
- Remote proposal history or full natural-language-brief logging.

See [SECURITY.md](../SECURITY.md) and [PUBLIC_PRIVATE_BOUNDARY.md](./PUBLIC_PRIVATE_BOUNDARY.md).

## Package layout

The challenge uses one TypeScript package:

```text
packages/codesign-webmcp/
  src/
    types.ts                 canonical contracts
    manifest.ts              structural and semantic validation
    workspace.ts             canonical workspace reconstruction
    operations.ts            atomic typed-operation reducer
    workspace-adapter.ts     runtime output reconstruction and fail-closed guards
    proposal-engine.ts       transaction, resources, and concurrency rules
    asset-sandbox.ts         bounded temporary-asset lifecycle
    preview-bridge.ts        revision-bound renderer artifacts
    review-controller.ts     framework-neutral human-review state
    review-view.ts           accessible Keep/Revert web component
    webmcp.ts                exact six-tool registry and shared lifecycle
    configuration-passport.ts post-Keep public receipt and verification
    shopify-handoff.ts       pure verified Passport-to-line-metadata mapper
    in-memory-adapter.ts     deterministic reference adapter
  tests/
    workspace-adapter.test.ts
    proposal-engine.test.ts
    proposal-resources.test.ts
    manifest.test.ts
    review-controller.test.ts
    review-view.test.ts
    webmcp.test.ts
    configuration-passport.test.ts
    shopify-handoff.test.ts

examples/studio-tote/
  src/configurator.ts        tote manifest, adapter, and production rules
  src/main.ts                human UI, renderer, review, and WebMCP wiring
  src/agent-activity.ts      truthful privacy-safe invocation presentation
  src/constraint-xray.ts     localized issue and repair presentation
  src/configuration-passport.ts post-Keep tote projection/coordinator
  src/styles.css             distinct responsive tote visual system
  public/                    generated public-safe tote product cutouts
```

The studio tote is the sole standalone public example. KORRHAUS consumes the
same package through a narrow adapter inside the existing private Shopify
application, so judges see the actual merchant Designer rather than a synthetic
copy. This challenge improvement does not change or publish the private
KORRHAUS adapter. The tote adds no core condition, option ID, renderer behavior, or product
rule: all tote-specific work stays under `examples/studio-tote/`.
Merchant-specific mapping must not be added to the core.
