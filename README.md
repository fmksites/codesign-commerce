# CoDesign WebMCP

**WebMCP for Custom Products on Shopify**

> **Make your Shopify product configurator agent-ready.**

## What is being submitted

**CoDesign WebMCP is the product:** an open-source integration protocol and
runtime layer built on WebMCP for existing custom-product configurators.

- **Studio Tote is the public reference implementation.** It runs on
  Cloudflare so judges can use it without an account and developers can
  reproduce the complete integration.
- **KORRHAUS is the live Shopify implementation.** The same public core is
  actively connected to KORRHAUS's existing Custom Sock Designer through a
  private merchant adapter.

The tote is the demonstration—not the product. KORRHAUS proves the protocol can
work inside a real Shopify business without publishing private application
logic, customer data, pricing, suppliers, or internal endpoints.

[![CI](https://github.com/fmksites/codesign-webmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/fmksites/codesign-webmcp/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

[Try the live tote demo](https://codesign-webmcp.pages.dev/tote/?reset=true) ·
[Open the judge landing](https://codesign-webmcp.pages.dev/) ·
[Follow the 60-second judge guide](./START_HERE.md) ·
[View passing CI](https://github.com/fmksites/codesign-webmcp/actions)

CoDesign WebMCP connects AI agents to an existing custom-product designer. An
agent can read the public configuration, discover valid choices, stage artwork,
coordinate multiple designs, update the merchant's own visual renderer, and
check production readiness. The proposal stays temporary until a person chooses
**Keep** or **Revert** on the webpage.

It complements Shopify's catalog, navigation, cart, checkout, and order tools.
CoDesign handles the difficult work that happens *inside* a made-to-order
configurator before a product is cart-ready.

> **Agent designs. Human approves. Shopify completes the sale.**

**Current public release (1 September 2026):** commit `1f422d6` ships the
activity observer, Constraint X-Ray repair loop, revision-aware preview
freshness, and Configuration Passport described below. The complete release
verification passes 28 test files / 235 tests, strict typecheck, builds,
boundary/docs/eval checks, 25/25 parity, deployed desktop and 390 px QA, the
exact deployed WebMCP repair/Revert flow, and a separate Keep/Passport reload
proof. Current native Chrome WebMCP and consumer ChatGPT web are not claimed.

## Try it in 60 seconds

The shopper does not need to know the words WebMCP, tool, schema, or adapter.
Once the agent has opened the tote page, an ordinary design request is the
intended interface: the six tool descriptions tell the client when to inspect,
discover choices, create a temporary design, return previews, and validate it.
WebMCP is page-scoped, so a client must visit the configurator before it can
discover those tools; finding and opening the right merchant page remains a
browser, search, catalog, or commerce-navigation responsibility.

1. Open the
   [deterministic tote demo](https://codesign-webmcp.pages.dev/tote/?reset=true)
   in a supported WebMCP client.
2. Ask the agent:

   > I need 100 premium branded studio totes for North Form. Give me a natural
   > customer version and a darker staff version, show me both options, check
   > whether they are ready to make, and do not save anything yet.

Expected result: the agent translates the declared “natural customer” and
“darker staff” directions into two named 50-tote variants. Natural stays
centered; Charcoal deliberately begins at 95% in the upper-left position. Both
appear in the merchant renderer and every agent result remains
`persisted: false`.

That same ordinary brief therefore completes the whole Constraint X-Ray loop:
the first Charcoal preview remains configuration-valid but is not
production-ready; the page attributes the conflict to a **Merchant production
rule**, localizes its preview region, and exposes an accessible explanation;
the agent may select only the merchant-declared 78% repair. After the change,
the old preview is visibly marked outdated until a revision-matched capture
replaces it; fresh status and validation then prove production readiness while
Natural remains untouched. The page shows the actual invocation trail rather
than inferred design phases.
Choose **Revert** to restore the deterministic baseline with zero writes.

Supplied artwork is an optional advanced proof. Attach the
[demo artwork](https://codesign-webmcp.pages.dev/tote/north-form-supplied-mark.png)
and ask the agent to replace the text mark to exercise the temporary-asset tool
without using the normal upload/save path.

The complete prompts, negative tests, recovery steps, and expected tool order
are in [docs/JUDGE_GUIDE.md](./docs/JUDGE_GUIDE.md).

## What is implemented

The reusable TypeScript package registers exactly six webpage tools:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

The core provides:

- a Manifest 2.0 contract for controls, variants, assets, dependencies, preview
  surfaces, and human-confirmation rules;
- atomic, revision-aware proposals with idempotency and stale-state protection;
- temporary asset staging and revision-bound raster previews;
- canonical success `message`/`nextAction` routing plus a privacy-safe
  invocation observer that sees only tool, phase, effect, timestamp, and
  duration;
- localized merchant validation and an exact merchant-approved atomic repair
  gate without exposing private application state;
- an accessible page-owned review controller with exact Keep/Revert behavior;
- optional Configuration Passport v0.1 after confirmed Keep, with a public-safe
  configuration digest, exact preview receipts, and fail-closed version/origin
  verification; and
- a pure verified-Passport-to-Shopify metadata mapper that performs no cart
  mutation.

There is deliberately no WebMCP tool for Keep, Revert, save, upload, quote,
checkout, order, payment, customer data, pricing, margins, suppliers, or
administration.

## Two proof surfaces, one submitted protocol

### Studio Tote: public reference implementation

The tote is the anonymous, reproducible challenge demo. Its current public
release uses the
same core package with its own manifest, adapter, renderer, artwork handling,
variant logic, coupled production rules, truthful activity trail, deterministic
Constraint X-Ray, and post-Keep Passport. It proves portability without claiming
a universal renderer.

### KORRHAUS: live Shopify implementation

KORRHAUS's Custom Sock Designer existed before the challenge. A private
Manifest 2 adapter now maps the reusable package to its real customer controls,
renderer, validation, artwork pipeline, and autosave boundary. That integration
is now live on KORRHAUS's existing Shopify storefront. Supported agents discover
the same exact six CoDesign tools alongside Shopify's native storefront tools,
while ordinary visitors retain the unchanged Designer. The adapter and all
customer, pricing, persistence, and operational logic remain private.

The submission improvement does not change or publish the private KORRHAUS
adapter. KORRHAUS remains the real-business proof; the tote remains the complete
public implementation judges can inspect and reproduce.

[Open the live KORRHAUS Sock Designer](https://korrhaus.nl/en/apps/wholesale/sock-designer) ·
[Read the bounded live evidence](./docs/evidence/KORRHAUS_LIVE_WEBMCP_2026-08-31.md)

An additional password-protected Shopify development-store page proves that the
tote bundle can run alongside Shopify's native storefront WebMCP tools. It is
interoperability evidence, not the anonymous judge path. See
[shopify-demo/README.md](./shopify-demo/README.md).

## Run and verify locally

Requirements: Node.js 22.12 or newer and npm.

```bash
git clone https://github.com/fmksites/codesign-webmcp.git
cd codesign-webmcp
npm ci
npm run verify
```

Start the tote configurator:

```bash
npm run dev --workspace @codesign-webmcp/studio-tote
```

Start the assembled judge site:

```bash
npm run build
npm run preview:judge-site
```

`npm run verify` runs the deterministic tests, strict typecheck, builds, browser
bundle check, judge-site check, public-boundary scan, documentation check,
evaluation-corpus validation, and tote control-parity check.

## Integrate an existing configurator

CoDesign is an adapter integration, not a zero-code Shopify app and not a
replacement renderer. A merchant:

1. inventories the existing customer-editable controls;
2. declares the public-safe manifest;
3. maps a narrow adapter to existing state, render, validate, restore, and
   commit functions;
4. mounts the review controller; and
5. registers the six tools behind a feature flag.

Start with [docs/INTEGRATION_QUICKSTART.md](./docs/INTEGRATION_QUICKSTART.md).

## Repository map

| Path | Purpose |
| --- | --- |
| `packages/codesign-webmcp/` | Reusable Manifest 2 core and WebMCP registration |
| `examples/studio-tote/` | Complete public portability example |
| `shopify-demo/` | Minimal Shopify Liquid/CDN deployment overlay |
| `judge-site/` | Source for the public challenge landing |
| `docs/` | Current architecture, integration, testing, and judge documentation |
| `docs/evidence/` | Dated verification records, with current/historical status indexed |
| `evals/` | Optional tool-selection and safety evaluation corpus |
| `scripts/` | Build and verification tooling |

## Current evidence

- Public GitHub repository with a detected [Apache-2.0 license](./LICENSE).
- Public commit `1f422d634cf07d8c4d8cf01165e3eeff89a5ab61`, hosted
  CI, stable release metadata, and immutable deployment
  `0b0603b6.codesign-webmcp.pages.dev` identify the current release.
- The release passes 28 files / 235 tests covering exact-six
  registration, privacy-safe activity, canonical result guidance, Constraint
  X-Ray provenance/localization and exact repair, revision-aware preview
  freshness, post-Keep Passport issuance/tamper rejection, and the pure
  Shopify mapper.
- The exact stable deployment completed the two-variant X-Ray repair and
  zero-write Revert path, plus a separate exactly-once Keep/Passport reload
  proof in the Codex desktop in-app browser. Ordinary Chrome rendered the full
  fallback without errors; its current connection exposed no native WebMCP, so
  no current native-Chrome execution claim is made.
- The Shopify development-store proof has run CoDesign's six tools alongside
  Shopify's native catalog and cart tools.
- Browser/client claims are kept precise in
  [docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md).

## Documentation

- [START_HERE.md](./START_HERE.md) — fastest route for judges and reviewers.
- [docs/PRODUCT_DIRECTION_AND_ROADMAP.md](./docs/PRODUCT_DIRECTION_AND_ROADMAP.md) — current product direction, locally implemented integrity layer, and gated release sequence.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — runtime and trust boundaries.
- [docs/WEBMCP_TOOLS.md](./docs/WEBMCP_TOOLS.md) — exact tool contracts.
- [docs/INTEGRATION_QUICKSTART.md](./docs/INTEGRATION_QUICKSTART.md) — merchant integration path.
- [docs/TESTING.md](./docs/TESTING.md) — deterministic and actual-browser evidence policy.
- [docs/PUBLIC_PRIVATE_BOUNDARY.md](./docs/PUBLIC_PRIVATE_BOUNDARY.md) — public package versus private merchant responsibilities.
- [docs/evidence/README.md](./docs/evidence/README.md) — current evidence and historical archive map.
- [docs/evidence/CODESIGN_INTEGRITY_RELEASE_2026-09-01.md](./docs/evidence/CODESIGN_INTEGRITY_RELEASE_2026-09-01.md) — exact current public release, repair, Revert, Keep, and browser evidence.
- [ASSET_NOTICES.md](./ASSET_NOTICES.md) — code, brand, and demo-asset rights.
- [SECURITY.md](./SECURITY.md) — security and data boundary.

The required challenge video and final Devpost submission are separate human
submission steps and are not represented as completed in this repository.
