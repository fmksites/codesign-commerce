# Title

CoDesign WebMCP

**WebMCP for Custom Products on Shopify**

> **Make your Shopify product configurator agent-ready.**

## One-line Summary

WebMCP for Custom Products on Shopify.

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

The public studio-tote reference proves that this is a complete runnable product,
not a chat mockup. The same unchanged public core is also integrated locally into
KORRHAUS's pre-existing Shopify Custom Sock Designer through a private adapter
that maps more than 50 real customer-editable controls and preserves its renderer
and autosave path.

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
- Visible staged progress: Foundation, Branding, and Variants rather than one
  opaque “do everything” tool call.
- Human-owned Keep/Revert; current preview is required before Keep is enabled.
- Zero-write Revert and exactly-once Keep, verified with persistence counters.
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

1. Open <https://codesign-webmcp.pages.dev/tote/?reset=true> in a WebMCP-capable
   ChatGPT in-app browser.
2. Download `north-form-supplied-mark.png` from the judge landing and attach it
   to the conversation.
3. Ask:

   > Create 100 studio totes for North Form, split evenly across two variants,
   > and use the supplied artwork. Name the first North Form Natural: natural
   > 12 oz canvas, long handles, centered one-colour ink artwork at 105% scale.
   > Name the second North Form Charcoal: charcoal 12 oz canvas, short handles,
   > upper-left one-colour artwork at 82% scale and -6 degrees rotation. Show me
   > both previews and check production readiness. Do not save either design.

4. Expect all six tools to be used, two visible 50-unit variants, two distinct
   current previews, total quantity 100, valid configuration, production-ready
   status, and `persisted: false`.
5. Ask: “Make only the charcoal version feel bolder: use cobalt ink, increase
   the artwork to 95%, and rotate it to -10 degrees.” The natural design should
   remain unchanged.
6. Use visible Revert for a repeatable walkthrough. It must restore the original
   one-variant baseline without a persistence write.

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

Expected deterministic result: 20 test files / 177 tests pass, strict typecheck
and build pass, the core WebMCP bundle matches SHA-256
`0bcf250f6d61bec30988840f338a16c521b8b72eb3b10b4d367d6c0601b4fcde`,
the tote application bundle matches SHA-256
`c6fd8b068c94d3ab521e83132b1670e53e5031950a949d2244a56c652c2da0eb`,
the public-boundary and documentation scans pass, and the tote inventory reports
25/25 accounted surfaces.

## Public Demo Link

<https://codesign-webmcp.pages.dev/>

Deterministic tote URL: <https://codesign-webmcp.pages.dev/tote/?reset=true>

Immutable verified deployment: <https://26193628.codesign-commerce.pages.dev/>

## Public Repository Link

<https://github.com/fmksites/codesign-webmcp>

Verified implementation release commit:
`1150c40703816f3729ec9f8de6f93db9e172a5e1`

License: Apache-2.0

## Demo Video

`TODO: add the final public YouTube URL. The required video must include audio,
show the working product, and remain under three minutes.`

Target script: `docs/VIDEO_SCRIPT.md` (2 minutes 35 seconds).

## Screenshot Shot List

1. First 15 seconds: natural-language brief beside the clean tote canvas.
2. Temporary two-variant proposal with both live product previews and the real
   North Form artwork visible.
3. Two inline renderer previews in the agent conversation plus production-ready
   validation.
4. Visible human Keep/Revert boundary while ordinary design controls are locked.
5. Architecture/repository proof showing the exact six tools, Manifest 2.0,
   Apache-2.0 license, and 175 passing tests.

Existing public-repository captures:

- `docs/evidence/screenshots/item11-live-tote-desktop.png`
- `docs/evidence/screenshots/item11-live-tote-mobile-390.png`
- `docs/evidence/screenshots/item9-studio-tote-desktop.png`
- `docs/evidence/screenshots/korrhaus-private-local-codesign-v2-two-colourway.png`

## Submission Readiness Notes

- Public repository: ready and anonymously accessible.
- Hosted CI: passing on release commit `1150c40`.
- Stable and immutable demo: byte-for-byte matched to the fresh public clone.
- WebMCP runtime: exact-six public flow verified in the Codex in-app browser.
- Chrome: ordinary UI plus native exact-six and supplied-artwork paths verified
  on the current source with the official testing flag.
- Release integrity: independently fetched stable/immutable core and tote
  bundles match their separately labelled metadata digests.
- KORRHAUS: real private integration is locally complete and feature-off; it is
  not claimed as a live WebMCP production release.
- Consumer ChatGPT website result: tested in ordinary Chrome on 28 August 2026;
  that client searched plugins for `WebMCP`, returned an empty result and did
  not expose the webpage's tools. This path is not claimed as supported.
- Still required: final video recording in a verified WebMCP-capable host,
  public YouTube upload, thumbnail choice, entrant attestations, and explicit
  final Devpost approval.
- Nothing has been sent to Devpost.

## Known Limitations

- WebMCP is experimental and requires a compatible host. Chrome native testing
  currently requires its official flag or origin-trial path. The final current
  source passed the testing-flag path; the immutable public exact-six flow was
  separately verified through the Codex agent host.
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
- The live KORRHAUS production route remains feature-off until a separate owner
  decision and production-safe release process.
- The optional model eval corpus has structure and scorer tests but no paid-model
  execution result.

## TODO Official Form Fields

Official fields fetched from Devpost on 28 August 2026:

- **Submitter Type (required):** `TODO Felix — choose Individual, Team of
  Individuals, or Organization.` Recommended: `Individual` if submitting only
  as Felix.
- **Country of residence (required):** `TODO Felix — confirm the exact country
  value.`
- **Organization name (optional):** `TODO only if Submitter Type is
  Organization.`
- **App Status (required):** Recommended: `New`. CoDesign WebMCP was built
  during the challenge; the KORRHAUS Sock Designer is clearly disclosed as a
  pre-existing integration surface.
- **If Existing, what changed:** Not applicable if `New` is selected. If Devpost
  treats the entry as existing, use the “What was created during the challenge”
  answer below.
- **Live URL (required):** <https://codesign-webmcp.pages.dev/>
- **Testing instructions (optional):** use the Fast judge path above.
- **Public code repository (required):**
  <https://github.com/fmksites/codesign-webmcp>
- **Agents/clients tested (required):** Codex desktop agent exact-six WebMCP on
  the final immutable public release; native Chrome 151 exact-six plus real
  supplied artwork on the current source using the official testing flag; and
  ordinary Chrome on the public configurator. The consumer ChatGPT website was
  also tested in ordinary Chrome, but its plugin search returned no `WebMCP`
  integration and no webpage tools; that path is explicitly not claimed as
  supported. The separate ChatGPT desktop-app route remains untested.
- **AI tools leveraged (required):** OpenAI Codex for product framing,
  architecture, implementation, testing, browser verification, release QA, and
  documentation. Shopper runtime is provider-neutral and uses the agent host
  invoking WebMCP; no paid-model eval result is claimed.
- **Learning derived (required):** Recommended: `Significant`.
- **AI value usable in career (required):** Recommended: `Yes`.
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
  revision, stale, invalid, Keep, and Revert behavior.
- **Execution:** a stable public URL delivers a coherent visual configurator,
  real artwork, two variants, responsive ordinary browsing, extensive tests,
  clean-clone instructions, CI, and reproducible judge steps.
- **Potential Impact:** merchants can make existing high-investment customizers
  agent-ready without rebuilding their renderer; KORRHAUS supplies credible
  real-business integration evidence.
- **Creativity & Ambition:** the project joins shopping intent, conversational
  art direction, a live merchant-owned product canvas, physical-production
  rules, and safe human persistence rather than building another catalog or
  cart agent.
