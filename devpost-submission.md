# Title

CoDesign WebMCP

### ⏳ Not submitted yet

An editable public Devpost project exists at
<https://devpost.com/software/codesign-webmcp>. Its current release copy was
refreshed on 1 September 2026, but the WebMCP Challenge entry still has
`submitted_at: null`: it has **not** been submitted for judging.

**WebMCP for Custom Products on Shopify**

> **Make your Shopify product configurator agent-ready.**

## One-line Summary

AI agents turn a shopper's brief into a validated visual design inside an
existing Shopify product configurator.

## Problem

Shopify's emerging agent tools are strong at catalog discovery, navigation,
cart, checkout, and orders. They do not solve the difficult work inside a
made-to-order configurator: dozens of coupled options, multiple coordinated
designs, customer artwork, a merchant-owned visual renderer, production rules,
and state that must not be saved accidentally.

Today a studio owner who wants custom grip socks, totes, shirts, uniforms, or
packaging still has to learn each merchant's designer and manually translate a
plain-language brief into every control. Merchants cannot simply replace those
customizers: they contain valuable product knowledge, renderer logic, and
operational rules.

## Solution

CoDesign WebMCP adds a reusable browser-side WebMCP transaction layer to an
existing product customizer. A shopper can start with a sentence, let the agent
open the appropriate merchant page, watch that page's real canvas change, and
receive current renderer previews back in chat.

The agent reads only an allowlisted workspace, discovers declared controls and
dependencies, stages temporary artwork, applies atomic multi-control proposals,
captures revision-bound previews, and asks the merchant adapter to validate
configuration and production readiness. The proposal remains temporary. The
webpage—not WebMCP—owns visible Keep and Revert controls.

The current public release also makes that work legible. A
privacy-safe trail shows actual inspection, capability reading, temporary
changes, preview capture, and validation. A deterministic Constraint X-Ray
turns the ordinary darker-staff direction into a credible first Charcoal
preview at 95% upper-left, localizes the resulting production issue, exposes
only merchant-approved repair operations, rerenders, captures fresh previews,
and proves that readiness has changed. Studio-name typography is the
production-safe fallback, so the primary journey does not require an artwork
attachment.

After—and only after—a successful page Keep, Configuration Passport v0.1 binds
the committed revision to a public-safe configuration digest and exact preview
receipts. It is an unsigned integrity receipt, not a signature, identity proof,
or authorization token. A pure Shopify mapper can turn a verified,
production-ready Passport into opaque line metadata, but performs no cart,
checkout, order, or payment mutation.

The public studio-tote reference proves that this is a complete runnable product,
not a chat mockup. The same unchanged public core is also live in KORRHAUS's
pre-existing Shopify Custom Sock Designer through a private adapter that maps
more than 50 real customer-editable controls and preserves its renderer and
autosave path.

## Why This Matters

For shoppers, chat becomes the creation interface: describe the collection,
watch a real product take shape, refine it conversationally, and decide whether
to keep it without learning a complex designer.

For merchants, the integration is intentionally narrow: install the package,
declare the public control surface in a manifest, and connect an adapter to the
existing state, renderer, validation, preview, and persistence functions. The
merchant does not replace its visual experience or adopt a universal renderer.

The potential audience is the long tail of Shopify merchants selling products
that do not fit a normal variant picker: apparel programs, teamwear, packaging,
furniture, uniforms, promotional goods, and other production-aware custom work.

## How We Used AI

At runtime, the shopper's agent performs the judgment-heavy orchestration that
is difficult to hard-code: it interprets a natural-language brief, selects the
relevant declared capabilities, chooses merchant-valid values, groups changes
into coherent visual passes, creates coordinated variants, explains assumptions,
uses current visual previews, and turns subjective feedback such as “make only
the charcoal version feel bolder” into targeted typed operations.

The AI does not invent product rules or bypass the merchant. Structured WebMCP
schemas bound its calls; the merchant manifest and adapter remain authoritative
for allowed values, dependencies, rendering, and production validation. No
ordering, quote, payment, customer-data, pricing, supplier, or administrative
tool exists in the public WebMCP surface.

## How We Used Codex

Codex was the primary build partner from product framing through release. We
used a guided Scope → PRD → Technical Spec → Checklist → Build process, with
explicit pushback when the first implementation was too text-heavy and too
KORRHAUS-specific. That changed the product direction to full customer-control
parity, live visual creation, real artwork transport, a reusable six-tool
contract, and a materially different tote reference.

Codex then implemented and reviewed the TypeScript core, manifest and adapter
contracts, proposal state machine, temporary-asset sandbox, revision-bound
preview bridge, review controller, tote integration, tests, documentation,
public/private boundary checks, CI, and Cloudflare release. It drove actual
desktop, 390 px mobile, Codex in-app browser, and native Chrome verification.
Browser and deployed testing found issues that source-only checks missed,
including an explicit-404 gap, stale link labels, a favicon 404, inconsistent
visible production validation, generic agent recovery errors, an unintended
proposal-lifetime operation limit, and an unverifiable release-bundle label.

We used deterministic tool-selection cases and a scorer self-test to design the
evaluation corpus. We did not run the optional model-evaluation corpus against a
paid model, so no synthetic or scripted result is presented as model evidence.

## Key Features

- Exactly six reusable webpage tools: read workspace, list capabilities, stage
  temporary asset, apply proposal, get previews, and validate proposal.
- Manifest 2.0 contract for typed controls, values, dependencies, variants,
  assets, preview surfaces, and confirmation requirements.
- Atomic proposals with committed revision, proposal revision, bounded
  operation IDs, idempotent retries, and stale-state protection.
- Real temporary PNG artwork rendered on two different product variants without
  using the ordinary upload/save path.
- Merchant-owned, revision-bound 640 by 640 WebP previews returned inline to the
  agent surface.
- A privacy-safe actual invocation trail generated from the six registered
  tools, plus canonical bounded `message` and `nextAction` fields on successful
  results. No arguments, results, shopper text, artwork, configuration values,
  URLs, or customer data enter the observer.
- A localized charcoal safe-zone Constraint X-Ray. Only the declared 78% repair
  batch is accepted; repair invalidates old previews and requires fresh
  rendering and validation.
- Studio-name typography as the ordinary valid branding fallback, with
  placement/scale still subject to production rules and supplied artwork
  retained as an advanced temporary-asset proof.
- Human-owned Keep/Revert; current preview is required before Keep is enabled.
- Zero-write Revert and exactly-once Keep, verified with persistence counters.
- Configuration Passport v0.1 only after confirmed Keep, with fail-closed
  expected origin/configurator/manifest/renderer verification and a public
  projection that excludes artwork and private data.
- A pure verified-Passport-to-Shopify line-metadata mapper with no cart write.
- Ordinary desktop/mobile/Chrome human UI remains fully functional when WebMCP
  is absent.
- Public studio-tote control parity: 14 mapped controls, four variant operations,
  one asset slot, and six documented exclusions across 25 UI surfaces.
- Coupled merchant validation, including minimum quantities and print-method
  constraints.
- Public/private architecture boundary that prevents customer data, pricing,
  margins, suppliers, internal snapshots, and private logic from entering the
  public package.

## Architecture

```text
Agent
  → document.modelContext.registerTool(...)
  → six CoDesign WebMCP handlers
  → ProposalEngine + Manifest 2.0
  → GuardedWorkspaceAdapter
  → merchant adapter
  → existing customizer state, renderer, validation and persistence
```

The generic core never receives merchant raw state. The guarded adapter rebuilds
public results field by field and fails closed on malformed output. Mutating
batches are reduced and validated against a detached workspace before the
merchant renderer changes. Every preview is bound to the exact proposal,
revision, variant, surface, and workspace hash. A newer human edit makes the
proposal stale instead of being silently overwritten.

## Testing Instructions

### Fast judge path

These are the verified instructions for public commit `1f422d6`.

1. Open <https://codesign-webmcp.pages.dev/tote/?reset=true> in a WebMCP-capable
   ChatGPT in-app browser.
2. Ask in ordinary shopper language:

   > I need 100 premium branded studio totes for North Form. Give me a natural
   > customer version and a darker staff version, show me both options, check
   > whether they are ready to make, and do not save anything yet.

3. No tool name, option ID, or WebMCP instruction is required. Expect the page
   to show the actual invocation sequence: inspect workspace, read available
   choices, update the temporary proposal, capture current previews, and check
   production readiness. Asset staging is correctly omitted because no artwork
   was supplied.
4. Expect two visible 50-unit variants and two renderer previews. The declared
   darker-staff direction begins Charcoal at 95% upper-left while Natural stays
   centered. The first Charcoal result remains configuration-valid but is
   visibly production-not-ready with an accessible localized safe-zone issue.
5. Without a second shopper instruction, expect the agent to choose only the
   returned merchant-approved 78% repair. It must leave Natural unchanged,
   invalidate the old Charcoal preview, capture two fresh previews, restore
   production readiness, and continue reporting `persisted: false`.
6. Use visible Revert for a repeatable walkthrough. It must restore the original
   one-variant baseline without a persistence write.

For the supplied-artwork path, download `north-form-supplied-mark.png` from the
public site, attach it to the conversation, and ask the agent to apply it. That
path exercises `codesign_stage_asset`, real placement/scale/rotation controls,
and the same production-readiness rules. It is an advanced proof, not a primary
setup dependency.

### Local clean-clone verification

Requirements: Node.js 22.12 or newer and npm.

```bash
git clone https://github.com/fmksites/codesign-webmcp.git
cd codesign-webmcp
npm ci
npm test
npm run typecheck
npm run build
npm run verify:browser-bundle
npm run check:judge-site
npm run check:public-boundary
npm run check:docs
npm run check:evals
npm run check:parity
```

Current verification passes 28 test files / 235 tests, strict typecheck,
production and Shopify-overlay builds, browser-bundle, judge-site,
public-boundary, documentation, 27-case eval/scorer, and 25/25 parity gates.
The rebuilt local hashes are core
`460aa40ade9b4cb42491a3028032ba970d8db4ce35febd7d646962890c13880b`
and tote
`edc44d53d107fed84a01fd78f3a027549c56f81c452ffbc457b2402d446f85d4`.
Public commit `1f422d634cf07d8c4d8cf01165e3eeff89a5ab61`, stable
release metadata, and immutable deployment
<https://0b0603b6.codesign-webmcp.pages.dev/> identify this exact build.

## Public Demo Link

Primary judge URL: <https://codesign-webmcp.pages.dev/tote/?reset=true>

Current status: this URL serves the verified 1 September integrity release.

Project overview: <https://codesign-webmcp.pages.dev/>

Release identity: open
<https://codesign-webmcp.pages.dev/site-metadata.json> to verify the exact
deployed commit and bundle digests. Cloudflare also returns a unique deployment
URL for each release; retain that URL in the submission handoff rather than
hard-coding a self-referential deployment into source.

## Public Repository Link

<https://github.com/fmksites/codesign-webmcp>

Current verified release source: public `main` at
`1f422d634cf07d8c4d8cf01165e3eeff89a5ab61`. Hosted CI passed and deployed
`site-metadata.json` reports that exact commit and both expected bundle hashes.

License: Apache-2.0

## Demo Video

`TODO: add the final public YouTube URL. The required video must include audio,
show the working product, and remain under three minutes.`

Target script: `docs/VIDEO_SCRIPT.md` (2 minutes 40 seconds).

## Screenshot Shot List

1. First 15 seconds: natural-language brief beside the clean tote canvas.
2. Actual invocation trail beside the temporary two-variant proposal and two
   merchant-rendered previews.
3. Constraint X-Ray problem state, declared 78% repair, refreshed preview, and
   production-ready resolution while the natural variant remains unchanged.
4. Visible human Keep/Revert boundary, followed in a separate Keep run by the
   post-commit Configuration Passport receipt.
5. Architecture/repository proof showing the exact six tools, Manifest 2.0,
   Apache-2.0 license, and the final verified local test count.

Existing public-repository captures:

- `docs/evidence/screenshots/item11-live-tote-desktop.png`
- `docs/evidence/screenshots/item11-live-tote-mobile-390.png`
- `docs/evidence/screenshots/item9-studio-tote-desktop.png`
- `docs/evidence/screenshots/korrhaus-private-local-codesign-v2-two-colourway.png`

## Submission Readiness Notes

- Public repository and stable demo: current release `1f422d6` is anonymously
  accessible; hosted CI, stable metadata, immutable metadata, and downloaded
  bundle bytes agree on its identity.
- Current release: exact six, canonical result envelopes,
  privacy-safe activity, Constraint X-Ray, text-branding fallback, post-Keep
  Passport, trusted validation provenance, revision-aware preview freshness,
  and pure Shopify mapper are implemented; 28 files / 235 tests and
  the complete verification suite pass.
- Deployed supported-client gate: the exact stable URL completed the two-
  variant X-Ray repair, two fresh previews, production-ready revalidation,
  `persisted:false`, and visible Revert path in the Codex desktop in-app
  browser. A separate deployed Keep issued one Passport and survived reload.
- Chrome: the ordinary human UI passed on the exact public release with no
  overflow or warnings/errors. Historical native Chrome 151 exact-six and
  supplied-artwork paths passed with the official testing flag; the current
  connected Chrome exposed no `document.modelContext` or WebMCP capability, so
  no current native-Chrome execution claim is made.
- Release integrity: independently fetched stable/immutable core and tote
  bundles match their separately labelled metadata digests for commit
  `1f422d6`.
- KORRHAUS: the real private integration is live on the existing Shopify
  storefront and is used as secondary real-business proof. Its current evidence
  is scoped to the tested Codex browser, not consumer ChatGPT or native Chrome.
- Consumer ChatGPT website result: tested in ordinary Chrome on 28 August 2026;
  that client searched plugins for `WebMCP`, returned an empty result and did
  not expose the webpage's tools. This path is not claimed as supported.
- Still required: final video recording in a verified WebMCP-capable host,
  public YouTube upload, thumbnail choice, entrant attestations, and explicit
  final Devpost approval.
- An editable public Devpost project exists at
  <https://devpost.com/software/codesign-webmcp>. It is associated with The
  WebMCP Challenge, but its live challenge record has `submitted_at: null` and
  has not been submitted for judging.

## Known Limitations

- WebMCP is experimental and requires a compatible host. Chrome native testing
  currently requires its official flag or origin-trial path. Historical native
  Chrome evidence remains dated; the connected Chrome used for the current
  release exposed no native WebMCP capability.
- A literal consumer ChatGPT website journey was performed in ordinary Chrome
  on the deployed build and failed at client capability discovery: ChatGPT
  searched its plugin directory for `WebMCP`, found none, and could not invoke
  the page. The separate ChatGPT desktop-app in-app-browser route remains
  untested. Neither result is mislabeled as the passing Codex/native-Chrome
  evidence.
- CoDesign WebMCP is not a universal renderer or zero-code integration. A
  merchant must supply a manifest and a small adapter to its real functions.
- The public release stops at saved design. It deliberately exposes no ordering,
  quote, payment, upload, pricing, customer-data, supplier, or admin tool.
- Configuration Passport v0.1 is unsigned integrity evidence only. It does not
  authenticate the merchant, authorize a purchase, prove physical colour/scale,
  or replace production approval.
- `toShopifyLineMetadata()` is a pure mapper. Actual Shopify cart continuation
  remains merchant/Shopify scope and is not implemented or claimed here.
- The live KORRHAUS production route is a secondary integration example; the
  anonymous tote remains the reproducible submitted product URL.
- The optional model eval corpus has structure and scorer tests but no paid-model
  execution result.

## Official Form Field Status

Official fields most recently fetched from Devpost on 1 September 2026:

- **Submitter Type (required):** Saved as `Individual` after Felix's explicit
  confirmation.
- **Country of residence (required):** Saved as `Netherlands` after Felix's
  explicit confirmation.
- **Organization name (optional):** Left blank because the entry is individual.
- **App Status (required):** Saved as `New`. CoDesign WebMCP was built during
  the challenge; the KORRHAUS Sock Designer is clearly disclosed as a
  pre-existing integration surface.
- **If Existing, what changed:** Not applicable because `New` is selected. The
  “What was created during the challenge” section below still makes the
  pre-existing KORRHAUS boundary explicit.
- **Live URL (required):** Saved as
  <https://codesign-webmcp.pages.dev/tote/?reset=true>
- **Testing instructions (optional):** Refresh the saved field with the ordinary
  North Form brief, visible X-Ray, exact 78% repair, fresh-preview requirement,
  `persisted:false`, and Revert behavior from the current release.
- **Public code repository (required):** Saved as
  <https://github.com/fmksites/codesign-webmcp>
- **Agents/clients tested (required):** Refresh as Codex desktop in-app browser,
  page-scoped exact-six WebMCP on the current deployed public release; historical
  native Chrome 151 exact-six plus real supplied artwork using the official
  testing flag; and ordinary Chrome on the public configurator. The consumer
  ChatGPT website was also tested in ordinary Chrome, but that client did not
  expose the webpage tools; it is explicitly not claimed as supported. Current
  native Chrome and the separate consumer ChatGPT desktop-app route remain
  unclaimed without a matching current test.
- **AI tools leveraged (required):** Saved as OpenAI Codex for product framing,
  architecture, implementation, testing, browser verification, release QA, and
  documentation. Shopper runtime is provider-neutral and uses the agent host
  invoking WebMCP; no paid-model eval result is claimed.
- **Learning derived (required):** Saved as `Significant`.
- **AI value usable in career (required):** Saved as `Yes`.
- **Video URL (required deliverable):** `TODO public YouTube URL`.

### What was created during the challenge

The KORRHAUS Custom Sock Designer existed before 25 August 2026. During the
submission period we created the reusable CoDesign WebMCP package, six-tool
WebMCP layer, Manifest 2.0 and adapter contract, proposal transaction and human
review boundary, temporary-asset and preview systems, complete studio-tote
reference, private KORRHAUS adapter, deterministic and browser tests, eval
corpus, documentation, public repository, and hosted judge experience. The
timestamped history and `docs/evidence/PRE_CHALLENGE_BASELINE.md` separate the
pre-existing product from challenge work.

## Built With

TypeScript, WebMCP, Vite, Vitest, Playwright, HTML, CSS, Cloudflare Pages,
GitHub Actions, OpenAI Codex

## Judging Criteria Alignment

- **WebMCP Leverage:** six bounded tools cover state, capabilities, assets,
  atomic visual proposals, renderer previews, and merchant validation with real
  revision, stale, invalid, Keep, and Revert behavior. Canonical result routing
  and truthful activity make the non-trivial WebMCP sequence visible.
- **Execution:** a stable public URL delivers a coherent visual configurator,
  two variants, studio-name or real-artwork branding, a deterministic localized
  repair, responsive ordinary browsing, extensive tests, clean-clone
  instructions, green CI, and reproducible judge steps on the current public
  release.
- **Potential Impact:** merchants can make existing high-investment customizers
  agent-ready without rebuilding their renderer; KORRHAUS supplies credible
  real-business integration evidence.
- **Creativity & Ambition:** the project joins shopping intent, conversational
  art direction, a live merchant-owned product canvas, physical-production
  rules, visible self-repair, safe human persistence, and a public-safe
  post-Keep configuration receipt rather than building another catalog or cart
  agent.
