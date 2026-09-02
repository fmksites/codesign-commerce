# CoDesign WebMCP product direction and roadmap

**Decision date:** 1 September 2026
**Status:** Current strategic and implementation source of truth. The activity
observer, Constraint X-Ray, preview freshness, and Configuration Passport v0.1
are public in commit `14cbe14` and have exact deployed direct-client evidence.
This document does not authorize a Shopify theme change, private KORRHAUS
change, production promotion, video, or final Devpost submission.

## The product

**CoDesign WebMCP is the collaborative configuration and integrity layer
between Shopify commerce and an existing custom-product designer.**

It lets an agent enter the merchant's real configurator, understand every
customer-editable choice, create and refine a visual proposal, apply the
merchant's production rules, and return a human-approved configuration to
Shopify without replacing the merchant's renderer or normal customer
experience.

Commercial promise:

> Make your Shopify product configurator agent-ready.

Shopify relationship:

> Shopify makes standard products agent-buyable. CoDesign makes customizable
> products agent-designable and keeps the approved design intact when commerce
> resumes.

## Why this direction

The current product already proves meaningful WebMCP:

- six high-level webpage tools;
- a reusable Manifest 2 contract and merchant adapter;
- one shared live renderer and configuration state;
- complete temporary proposals with artwork and multiple variants;
- real preview capture and merchant validation;
- canonical success routing and a privacy-safe actual invocation trail;
- one localized, deterministic merchant-approved repair loop;
- explicit page-owned Keep/Revert with autosave isolation;
- a post-Keep public-safe Configuration Passport and pure Shopify reference
  mapper;
- a public reproducible tote;
- a Shopify-hosted interoperability surface; and
- a live private-backed KORRHAUS integration.

However, challenge research shows that shared state, deterministic validation,
visual collaboration, staged changes, approval, rollback, and review receipts
already appear in other entries. They remain mandatory, but they do not make
CoDesign exceptional on their own.

The unfilled Shopify-specific gap is the integrity of a bespoke configuration
across this boundary:

    shopper intent
        → merchant customizer
        → rendered proposal
        → production validation
        → human approval
        → Shopify cart and order
        → merchant production workflow

CoDesign should own the configuration, review, and integrity contract. Shopify
should continue owning discovery, catalog, cart, checkout, order, and payment.

## Product thesis

A configured product is not just a SKU plus options. It is a versioned
agreement between:

- the shopper's intent;
- the merchant's allowed controls and dependencies;
- the exact visual artifacts the shopper reviewed;
- the merchant's production-readiness result; and
- the commerce reference that survives cart, order, and fulfillment.

CoDesign turns that agreement into a safe shared workflow and, after Keep, a
portable Configuration Passport.

## Runtime story

| Stage | Owner | CoDesign responsibility | Status |
| --- | --- | --- | --- |
| Discover merchant and product | Shopify, search, or browser agent | Publish an understandable destination and compatibility signal | Partly implemented; distribution remains external |
| Open live customizer | Merchant and browser | Register six page-scoped WebMCP tools on the top-level page | Implemented |
| Read and design | CoDesign plus merchant adapter | Read canonical state, list choices, stage assets, apply atomic proposal operations | Implemented |
| Render and validate | Merchant renderer and rules | Return revision-bound previews and structured readiness | Implemented |
| Explain and repair constraints | CoDesign plus merchant rules | Localize issues, select only a declared repair, rerender, recapture, revalidate | Public and deployed direct-client verified |
| Human review | Merchant page | Keep or Revert the visible proposal | Implemented |
| Issue Configuration Passport | Merchant page plus CoDesign contract | Bind the kept revision, exact previews, readiness, and handoff reference | Public; deployed Keep/reload verified |
| Prepare Shopify reference | CoDesign pure mapper | Map a verified production-ready Passport to opaque safe line metadata | Public and deterministically verified; no cart write |
| Resume commerce | Shopify native capabilities | Carry the opaque configuration reference into cart, checkout, and order | Deferred merchant/Shopify integration |
| Produce and support | Merchant systems | Resolve the reference to private production state | Private merchant responsibility |

## What the judge should understand

Within the first 15 seconds:

> “I need 100 premium branded studio totes for North Form. Give me a natural
> customer version and a darker staff version, show me both options, check
> whether they are ready to make, and do not save anything yet.”

The shopper never says “use WebMCP” and never has to operate the form. The page
shows the real invocation trail: inspecting the workspace, reading choices,
updating a temporary proposal, capturing previews, and checking readiness.
The merchant-declared darker-staff direction itself starts Charcoal at 95%
upper-left. No second shopper instruction is required to reach the production
constraint and its bounded repair.

Within the first minute:

1. The agent creates two coherent visual variants using studio-name typography
   as the production-safe branding fallback.
2. The page and chat show the deliberate 95% upper-left Charcoal preview while
   Natural stays centered.
3. The credible production conflict is localized on that product preview.
4. Without requiring another shopper incantation, the agent explains the
   merchant rule, applies the smallest permitted repair,
   rerenders, and proves the issue is resolved.
5. The proposal is still temporary and reports persisted: false.
6. The person chooses Keep or Revert on the existing page.

The complete Shopify “aha”:

1. Keep commits exactly once through the merchant's normal path.
2. The page issues a Configuration Passport for that exact revision.
3. The pure mapper produces only the opaque configuration reference, digest,
   safe display summary, and re-edit URL.
4. A future merchant/Shopify handoff can place that metadata into Shopify's
   native commerce path without reconstructing the design from chat text,
   screenshots, or loose option fields. The current challenge slice performs
   no cart mutation.

KORRHAUS then proves that this is not a tote-only prototype: the same public
contract can sit behind a real, evolving Shopify custom-product business while
the private adapter remains private.

## Product pillars

### 1. Same session, two interfaces

The human sees the merchant's normal designer. The agent receives a compact,
semantic interface appropriate for planning and repetition. Both operate on
the same session, renderer, revisions, validation, and review state.

There is no agent-only replica and no second hidden configuration that must be
synchronized.

### 2. Six semantic tools, not dozens of buttons

The exact public surface remains:

1. codesign_read_workspace
2. codesign_list_capabilities
3. codesign_stage_asset
4. codesign_apply_proposal
5. codesign_get_previews
6. codesign_validate_proposal

Every customer-editable merchant control is represented through the typed
manifest and atomic operations. The six tools are verbs over a configuration
transaction, not a partial list of UI controls.

This is both an architectural choice and a practical WebMCP constraint.
Competitor field evidence shows that an exhaustive per-page catalog can exceed
client tool budgets and disable discovery.

### 3. Merchant-authoritative visual production

The model proposes. The merchant decides what is representable and valid.

The merchant adapter remains authoritative for:

- allowed values and dependencies;
- artwork slots and transforms;
- variants and quantity coupling;
- the actual visible renderer;
- production rules;
- preview capture;
- stale-state detection;
- autosave isolation; and
- Keep persistence.

The language model never invents compatibility or production truth.

### 4. Constraint X-Ray

Validation is now visual, actionable, and self-correcting rather than only a
text report at the end.

The public issue contract supports:

| Field | Purpose |
| --- | --- |
| issueId and code | Stable identity for repair and evaluation |
| severity and blocking state | Distinguish warning, decision, and blocker |
| variantIds | Identify the affected designs |
| controlIds or elementIds | Connect to the merchant's editable surfaces |
| surfaceId | Identify the affected renderer preview |
| normalizedPreviewRegion, optional | Highlight a safe approximate area without exposing private geometry |
| message | Accessible customer-language cause grounded in the merchant rule |
| repairable | State whether a bounded repair is allowed |
| merchantApprovedRepairs | Exact merchant-approved operation batches, never model-invented values |

The repair loop is:

    detect
        → localize
        → explain
        → choose an allowed repair
        → apply one atomic revision
        → capture fresh previews
        → revalidate
        → show resolved evidence

The visual highlight must have a textual and focusable equivalent for
accessibility.

The deterministic tote rule is deliberately narrow: the ordinary “darker
staff” direction begins with a 95% upper-left Charcoal mark. A mark over 78%
in the upper-left position on charcoal canvas remains visible and
configuration-valid but becomes production-not-ready. The only declared repair
sets that mark to exactly 78%. A different, partial, broadened, or mixed batch
fails atomically. An accepted repair advances the proposal revision,
invalidates the old preview receipts, captures fresh previews, and revalidates.
The natural variant remains untouched.

### 5. Configuration Passport

The page issues Passport v0.1 only after the existing Keep path succeeds.
Revert, stale state, missing previews, failed saves, and uncertain commits issue
nothing.

Implemented public-safe fields:

| Field | Meaning |
| --- | --- |
| passportVersion | Version of the public handoff contract |
| merchantOrigin | Origin that owns the configuration |
| configuratorId | Public configurator identity |
| configurationId | Opaque merchant-owned identifier |
| committedRevision | Exact kept revision |
| configurationDigest | Integrity hash of the safe canonical configuration |
| manifestVersion | Control contract used during review |
| rendererVersion | Renderer build that produced the previews |
| passportIntegrity | Integrity hash covering the public Passport fields and receipts |
| previewReceipts | Surface, variant, dimensions, MIME, digest, and exact proposal revision |
| readiness | Configuration-valid and production-ready states |
| issues | Remaining safe customer-visible warnings |
| safeSummary | Bounded cart and support description |
| editUrl | Merchant-owned route for reopening the design |

The passport excludes:

- raw artwork bytes or private asset URLs;
- opaque temporary asset handles and asset-kind controls;
- customer data;
- exact pricing, margins, or supplier data;
- private production rules;
- administrative endpoints; and
- any proof that the browser cannot actually establish.

The configuration digest and Passport integrity value are deterministic,
unsigned tamper-evidence receipts. They are not a signature, merchant identity
proof, authorization token, or independently verifiable attestation. A verifier
must also possess the public-safe configuration and an expected merchant
origin, configurator ID, manifest version, and renderer version; unknown or
mismatched values fail closed. The hashes do not prove color accuracy, physical
scale, manufacturability, or legal consent. Those claims remain with merchant
systems and human review.

### 6. Shopify-native continuation

CoDesign does not add a cart, order, checkout, or payment tool.

After Keep, the implemented pure `toShopifyLineMetadata()` helper maps a
verified, production-ready Passport to an opaque configuration ID, digest,
canonical safe summary, and same-origin re-edit URL. It does not access Shopify
and performs no cart mutation. A merchant integration may later place that
output into Shopify's normal cart line metadata or existing custom-product
handoff; Shopify's own agent and storefront capabilities would then continue
the transaction.

The minimum interoperability proof should demonstrate:

1. no passport before Keep;
2. one passport for one committed revision;
3. stale or mismatched passports rejected;
4. the pure mapper returns only the opaque reference, digest, summary, and edit
   URL; and
5. mapper execution causes no storage, network, cart, checkout, or order write.

Actual Shopify cart readback and ordinary checkout regression remain deferred
merchant-integration work, not challenge-release claims.

This is a configuration-integrity bridge, not a claim that Shopify has adopted
a new CoDesign protocol.

### 7. Page activity observer and future Conformance Flight Recorder

The implemented page observer is intentionally smaller than a conformance
recorder. It receives only `toolName`, `phase`, `effect`, `timestamp`, and
`duration`. It never receives arguments, results, shopper text, artwork,
configuration values, URLs, or customer data. The tote turns those events into
truthful visible activity and derives its “4 inspect · 2 temporary design · 0
save/order/payment” disclosure from the actual six registrations. Registration
teardown stops observer delivery.

A fuller Conformance Flight Recorder remains optional development/evidence
tooling, not a seventh shopper tool.

It should capture privacy-safe events:

- detected tool surface and tool descriptions;
- an operator-supplied case identifier rather than the full shopper brief;
- tool selection and privacy-safe target summaries rather than raw arguments;
- base, proposal, preview, and committed revisions;
- changed targets;
- preview receipt freshness;
- configuration and production-readiness state;
- issue detection and repair;
- persistence counters;
- human Keep/Revert;
- passport issuance; and
- Shopify handoff readback.

It must not capture customer identity, raw arguments/results, shopper text, raw
artwork, configuration values, private state, prices, URLs, tokens, full
natural-language briefs, or internal endpoints.

The public output is an interoperability report, not a certification program
until independent merchants and clients participate.

## Tool-result ergonomics

Structured fields remain the authority. Every successful result now also
contains fixed canonical `message` guidance and one bounded `nextAction`.

`nextAction` is exactly one of `inspect-capabilities`, `apply-proposal`,
`capture-previews`, `refine-proposal`, `human-review`, or `none`.
`human-review` appears only when both configuration validity and production
readiness are true and the current preview exists. The canonical message is
selected from allowlisted fixed copy, capped at 500 characters, and never
interpolates proposal names, customer text, labels, assumptions, validation
prose, artwork, URLs, or adapter values. The complete structured revision,
preview, readiness, issue, repair, and `persisted` fields remain authoritative.

## Public and private boundary

### Public

- the six-tool core;
- manifest, canonical state, and typed operation contracts;
- proposal, preview, validation, and passport schemas;
- adapter interface;
- review controller;
- Constraint X-Ray UI and accessibility behavior;
- conformance fixtures and deterministic tests;
- the complete studio-tote adapter and renderer;
- the Shopify handoff reference example; and
- integration and security documentation.

### Private merchant adapter

- raw KORRHAUS state and identifiers;
- customer, price, margin, supplier, quote, and order data;
- artwork storage and production files;
- persistence and notification endpoints;
- private production logic;
- authentication and administrative workflows; and
- merchant-specific mapping to Shopify and internal systems.

KORRHAUS remains flagship evidence, not the only inspectable implementation.

## Client and topology policy

Release claims require separate evidence for:

1. ChatGPT desktop's built-in browser;
2. Chrome 149+ with native WebMCP enabled;
3. ordinary Chrome without WebMCP; and
4. the complete human UI when no modelContext exists.

Additional rules:

- Register tools on the top-level merchant document.
- Do not depend on a cross-origin iframe to expose modelContext.
- Test authenticated cookies, nonces, CSP, route transitions, and teardown in
  the actual hosted environment.
- Do not equate the ChatGPT Chrome extension with ChatGPT's built-in site-tool
  environment.
- Do not promise mobile Work cloud-browser support without new evidence.
- Fail visibly when registration or preview capture is unavailable.
- Keep current support claims in docs/BROWSER_SUPPORT.md.

## Delivery plan

### Phase 0 — planning and evidence alignment

**Goal:** Preserve current release truth while adopting the stronger direction.

**Status:** Complete.

Deliverables:

- this roadmap;
- the dated Discord research record;
- an explicit competitor and differentiation statement;
- a current-versus-planned capability table; and
- no changes to release claims until implementation and verification pass.

Acceptance:

- historical execution and guided-build documents remain untouched;
- current README links to this roadmap without claiming planned features;
- no public or private runtime change occurs.

### Phase 1 — Constraint X-Ray contract

**Goal:** Turn validation into a visible repair loop without adding tools.

**Status:** Implemented, deterministically tested, public, and verified through
the exact deployed X-Ray/repair/Revert flow.

Implementation order:

1. Extend public validation issue types with target, surface, repairability, and
   bounded allowed-repair metadata.
2. Update runtime allowlists and fail-closed guards.
3. Extend tote rules with one credible localized conflict and permitted repairs.
4. Add accessible X-Ray highlighting and proposal activity.
5. Teach apply, preview, and validation results to return concise canonical
   messages.
6. Add deterministic, adversarial, accessibility, stale-state, and zero-write
   tests.

Acceptance:

- a normal brief can trigger one deterministic issue;
- the affected variant and surface are visible and textually identified;
- the agent chooses only a merchant-declared repair;
- one atomic refinement resolves the issue;
- new previews match the repaired revision;
- productionReady changes only after revalidation;
- Revert still writes nothing;
- Keep remains unavailable for unseen, stale, or blocked previews; and
- the exact tool count remains six.

### Phase 2 — Configuration Passport v0.1

**Goal:** Bind the exact kept design to a public-safe Shopify handoff.

**Status:** Implemented and deterministically tested; the exact public release
completed page-owned Keep, Passport display, and reload readback.

Implementation order:

1. Define and runtime-validate the passport schema.
2. Canonicalize and hash the public-safe kept configuration and preview
   receipts.
3. Issue the passport only after successful page-owned Keep.
4. Reject stale, mismatched, incomplete, tampered, or unknown-version passports.
5. Add a deterministic reference resolver and re-edit path to the tote.
6. Add negative tests for pre-Keep issuance, duplicate Keep, changed preview,
   changed renderer, unknown commit, tampering, and private-field leakage.

Acceptance:

- no WebMCP tool can issue or commit a passport;
- Revert produces no passport;
- one successful Keep produces one revision-bound passport;
- the configuration digest and Passport integrity hash covering the exact
  preview receipts verify;
- a changed byte or revision fails verification;
- no raw artwork or private merchant data appears; and
- reload or re-edit resolves the same safe configuration.

### Phase 3 — Shopify handoff slice

**Goal:** Demonstrate complementarity with Shopify, not a parallel commerce
stack.

**Status:** The pure verified-Passport-to-line-metadata mapper is implemented
locally. Actual Shopify cart mutation/readback is explicitly deferred and is
not submission-critical.

Implementation order:

1. Add a public reference mapping from a verified passport to Shopify-safe line
   metadata. **Implemented.**
2. Prove the mapper rejects unverified and non-production-ready Passports and
   performs no mutation. **Implemented locally.**
3. Exercise actual cart continuation/readback on the password-protected Shopify
   development store only as separately authorized post-challenge work.

Acceptance:

- the agent designs without a WebMCP cart tool;
- page Keep is still the only CoDesign commitment action;
- the mapper returns only public-safe metadata;
- stale or unknown references fail closed;
- mapper execution causes no cart, payment, order, customer, or price write;
  and
- any future test-store theme/cart change requires separate owner approval.

### Phase 4 — Conformance Flight Recorder and evals

**Goal:** Make the architecture inspectable and regression-testable.

**Status:** The privacy-safe page invocation observer and visible activity are
implemented locally. A broader exported conformance report and new
current-model client traces remain deferred to the release/evidence gate.

Implementation order:

1. Add privacy-safe trace events to the reference harness.
2. Add ordinary-language tool-selection cases.
3. Add negative sequences: premature Keep, stale proposal, mismatched preview,
   invalid repair, missing artwork, unavailable modelContext, interrupted
   commit, and invalid passport.
4. Add a mixed CoDesign plus Shopify trace.
5. Run one honest current-model trace in each supported client.

Acceptance:

- deterministic tests assert every state transition and write count;
- the report distinguishes tool discovery from successful completion;
- client, browser, build, URL, and release hash are recorded;
- failures remain visible rather than normalized into a pass;
- private KORRHAUS evidence is clearly bounded; and
- the recorder is not registered as a shopper-facing WebMCP tool.

### Phase 5 — actual-browser release gate

**Goal:** Prove the complete deployed experience before changing submission
claims.

**Status:** Current public release gate passed on commit `14cbe14`: 28 test
files / 235 tests, strict typecheck, builds, boundary/docs/eval checks, 25/25
parity, exact stable/immutable bundle identity, deployed direct WebMCP
X-Ray/Revert, separate Keep/Passport reload, 390 px QA, and ordinary Chrome
fallback. Independent model selection on this commit and current native Chrome
WebMCP remain unclaimed.

Required tracks:

- ChatGPT desktop built-in browser;
- Chrome 149+ native WebMCP;
- ordinary Chrome progressive enhancement;
- desktop and 390-pixel mobile human UI;
- top-level Shopify page;
- public tote clean reset;
- real artwork;
- two variants and two previews;
- issue, repair, rerender, and readiness;
- Revert zero writes;
- Keep one write and one passport; and
- Shopify reference readback.

Only after all applicable tracks pass may current architecture, judge, and
submission documents describe the new functionality.

Push, deployment, Shopify theme mutation, private KORRHAUS integration, and
production promotion each retain their own explicit approval gate.

## Recommended challenge scope

### Submission-critical

- Preserve the exact six tools.
- Ship the implemented concise canonical result guidance and privacy-safe
  activity observer.
- Ship the implemented deterministic Constraint X-Ray repair loop.
- Ship the implemented Configuration Passport v0.1 after Keep.
- Ship the pure Shopify reference mapper without adding a cart mutation.
- Publish deterministic fixtures and actual-client evidence only after the
  exact deployed candidate passes.

### Valuable but not submission-critical

- Point-and-speak selection of a preview region.
- A customer-facing “Design this with my agent” handoff.
- Multiple merchant passport resolvers.
- A broader UCP custom-product profile proposal.
- Signed design mandates or long-lived cryptographic attestation.

### Post-challenge North Star

**Brand-to-Collection Compiler:** a shopper describes a brand and campaign once;
the agent finds compatible Shopify merchants and produces a coherent
collection of custom socks, totes, apparel, packaging, and other products while
every merchant retains its own renderer, rules, approval, and production
system.

That future requires discovery standards, portable brand assets,
cross-merchant policy, consent, identity, and commerce contracts. It is a
roadmap, not a challenge claim.

## Explicit non-goals

- A universal renderer.
- Zero-code support for arbitrary configurators.
- Automatic scraping of merchant controls or private rules.
- One WebMCP tool per option.
- A single opaque “design everything” tool.
- CoDesign-owned catalog, cart, checkout, order, payment, pricing, or customer
  systems.
- Automatic saving or ordering without the merchant's normal gates.
- Publishing the private KORRHAUS adapter.
- Claiming every browser, mobile surface, or agent client works.
- Treating an integrity hash as proof of physical production correctness.

## Current decision and authorization gates

The smallest complete local path—localized issue → exact declared repair →
fresh previews → revalidation → page Keep → Configuration Passport—is now
implemented in the public tote while preserving six tools and the zero-write
proposal boundary.

The technical release sequence is now complete for the public tote:

1. public commit and immutable deployment identity are recorded;
2. the exact stable build passed direct supported-client X-Ray/Revert and
   separate Keep/Passport proofs;
3. responsive and ordinary-Chrome fallback passed; and
4. claims and release identifiers are synchronized to that evidence.

Still separate: independently selected model execution on this exact commit,
current native-Chrome WebMCP, any Shopify theme refresh, video/media, legal
attestations, and final Devpost Submit. Shopify cart mutation and further
private KORRHAUS work remain outside this challenge release unless separately
authorized.

## Research basis

- [Discord research record](./DISCORD_WEBCHALLENGE_INSIGHTS_2026-09-01.md)
- [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/)
- [Devpost resources](https://webmcp.devpost.com/resources)
- [Current architecture](./ARCHITECTURE.md)
- [Public/private boundary](./PUBLIC_PRIVATE_BOUNDARY.md)
- [Agent discovery and distribution](./AGENT_DISCOVERY_AND_DISTRIBUTION.md)
- [Browser support](./BROWSER_SUPPORT.md)
- [Testing policy](./TESTING.md)
