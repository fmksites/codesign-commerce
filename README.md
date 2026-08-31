# CoDesign WebMCP

**WebMCP for Custom Products on Shopify**

> **Make your Shopify product configurator agent-ready.**

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

## Try it in 60 seconds

The shopper does not need to know the words WebMCP, tool, schema, or adapter.
Once the agent has opened the tote page, an ordinary design request is the
intended interface: the six tool descriptions tell the client when to inspect,
discover choices, create a temporary design, return previews, and validate it.
WebMCP is page-scoped, so a client must visit the configurator before it can
discover those tools; finding and opening the right merchant page remains a
browser, search, catalog, or commerce-navigation responsibility.

1. Open the [deterministic tote demo](https://codesign-webmcp.pages.dev/tote/?reset=true)
   in ChatGPT's in-app browser or Chrome with WebMCP enabled.
2. Download and attach the
   [demo artwork](https://codesign-webmcp.pages.dev/tote/north-form-supplied-mark.png).
3. Ask the agent:

   > Create 100 studio totes for North Form, split evenly across two variants,
   > and use the supplied artwork. Name the first North Form Natural: natural
   > 12 oz canvas, long handles, centered one-colour ink artwork at 105% scale.
   > Name the second North Form Charcoal: charcoal 12 oz canvas, short handles,
   > upper-left one-colour artwork at 82% scale and -6 degrees rotation. Show me
   > both previews and check production readiness. Do not save either design.

Expected result: two named 50-tote variants, two distinct renderer previews,
valid and production-ready status, and `persisted: false`. The ordinary design
controls remain visible but lock while the proposal awaits the person's decision.
Choose **Revert** to restore the deterministic baseline without a write.

A shorter, deliberately non-technical prompt is also part of the evaluation
corpus: “I need 100 premium branded studio totes for North Form. Give me a
natural customer version and a darker staff version, use the studio name for
the branding, show me both options, and tell me if they are ready to make. Do
not save anything yet.”

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
- merchant validation without exposing private application state; and
- an accessible page-owned review controller with exact Keep/Revert behavior.

There is deliberately no WebMCP tool for Keep, Revert, save, upload, quote,
checkout, order, payment, customer data, pricing, margins, suppliers, or
administration.

## Two proof surfaces, two different purposes

### Public studio-tote reference

The tote is the submitted, anonymous, reproducible challenge demo. It uses the
same core package with its own manifest, adapter, renderer, artwork handling,
variant logic, and coupled production rules. It proves portability without
claiming a universal renderer.

### KORRHAUS real-business integration

KORRHAUS's Custom Sock Designer existed before the challenge. A private
Manifest 2 adapter now maps the reusable package to its real customer controls,
renderer, validation, artwork pipeline, and autosave boundary. That integration
is now live on KORRHAUS's existing Shopify storefront. Supported agents discover
the same exact six CoDesign tools alongside Shopify's native storefront tools,
while ordinary visitors retain the unchanged Designer. The adapter and all
customer, pricing, persistence, and operational logic remain private.

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
- Hosted CI verifies a clean install, 22 test files / 189 tests, strict
  typecheck, release build, exact-six bundle, public boundary, docs, eval
  structure, and 25/25 tote surface parity.
- The public tote has passed deployed page-scoped WebMCP proposal, real-artwork,
  two-preview, validation, refinement, rejection, Revert, and Keep/reload tests.
- The Shopify development-store proof has run CoDesign's six tools alongside
  Shopify's native catalog and cart tools.
- Browser/client claims are kept precise in
  [docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md).

## Documentation

- [START_HERE.md](./START_HERE.md) — fastest route for judges and reviewers.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — runtime and trust boundaries.
- [docs/WEBMCP_TOOLS.md](./docs/WEBMCP_TOOLS.md) — exact tool contracts.
- [docs/INTEGRATION_QUICKSTART.md](./docs/INTEGRATION_QUICKSTART.md) — merchant integration path.
- [docs/TESTING.md](./docs/TESTING.md) — deterministic and actual-browser evidence policy.
- [docs/PUBLIC_PRIVATE_BOUNDARY.md](./docs/PUBLIC_PRIVATE_BOUNDARY.md) — public package versus private merchant responsibilities.
- [docs/evidence/README.md](./docs/evidence/README.md) — current evidence and historical archive map.
- [ASSET_NOTICES.md](./ASSET_NOTICES.md) — code, brand, and demo-asset rights.
- [SECURITY.md](./SECURITY.md) — security and data boundary.

The required challenge video and final Devpost submission are separate human
submission steps and are not represented as completed in this repository.
