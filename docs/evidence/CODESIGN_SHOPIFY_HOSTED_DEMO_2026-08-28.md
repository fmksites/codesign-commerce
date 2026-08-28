# CoDesign WebMCP Shopify-hosted demo evidence — 28 August 2026

## Scope and safety boundary

- Target: `korrhaus-development.myshopify.com`, a password-protected Shopify development store.
- Stable page: `https://korrhaus-development.myshopify.com/pages/codesign-webmcp-tote-demo`.
- Theme: `CoDesign WebMCP Demo` (`205741359446`).
- Rollback theme: `Prod Parity Mirror` (`195779232086`), retained unpublished and unchanged.
- `korrhaus.nl`, the production KORRHAUS theme, customer traffic, orders, products, customers, checkout, prices and private application data were not modified.

## What was deployed

The development-store theme is a clone of the previous development-store theme with one alternate page template and six assets added:

- `templates/page.codesign-tote.liquid`
- `assets/codesign-tote.js`
- `assets/codesign-tote.css`
- three tote renderer images
- one public North Form artwork fixture

The page template includes Shopify's `content_for_header`, maps renderer assets to Shopify CDN URLs, and starts the same production tote bundle used by the public challenge demo. The repository command `npm run build:shopify-demo` reproducibly assembles this overlay.

All six binary/text assets were pulled back from theme `205741359446` and
matched the tested local files byte for byte. Shopify's pull API normalized the
Liquid template by adding one trailing newline; its executable/template content
otherwise matched the repository source. The deployed JavaScript bundle digest
is:

```text
sha256:4f115aee2d97895a715495d842ec0830e5470d033570699613599074686b304b
```

## Shopify and CoDesign coexistence

The rendered top-level page contained all of the following simultaneously:

- Shopify's official `/storefront/webmcp/webmcp-0.1.1.js` module.
- Shopify's `standard-actions.js` module.
- Shopify's inline MCP enablement/adapter bootstrap supplied through `content_for_header`.
- The Shopify-CDN-hosted `codesign-tote.js` module.
- The CoDesign visual configurator and its existing exact-six registration code.

This proves that the CoDesign layer can be hosted inside Shopify without replacing Shopify's native storefront capability scripts or the merchant renderer.

The connected Chrome 152 session still returned `undefined` for `document.modelContext`. Therefore this checkpoint does **not** claim a native Chrome exact-six execution on the Shopify page. The exact-six implementation remains covered by deterministic tests and the already-recorded supported-client evidence; a current-release native Chrome invocation must be repeated when the browser exposes that API.

## Current deployed WebMCP runtime cross-check

The public tote deployment was reset and exercised through the Codex in-app
browser's page-scoped WebMCP client after the Shopify overlay was built. This
was a real invocation of the deployed webpage tools, not direct calls to local
TypeScript functions:

- Exactly six CoDesign tools were discovered.
- The clean workspace was `tote-revision-1`, one natural 12 oz tote, 100 units,
  no pending proposal and `persisted: false`.
- A public 214,745-byte PNG fixture was staged temporarily with integrity
  `sha256:593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`.
- Two atomic passes produced `North Form Natural` and `North Form Charcoal`,
  50 units each, with distinct colour, handles, placement, scale and rotation.
- The renderer returned two distinct 640 x 640 WebP artifacts with integrity
  `sha256:74e1d748d287e861696bdf23239e7d0b7b0ddb60eba37c4b314e64b0f6b73df7`
  and `sha256:7c5b4bd5230f03039ad581a4c430fda2102cf4240708b43a5d911028c73c85a3`.
- Validation returned `configurationValid: true`, `productionReady: true`, no
  issues and `persisted: false`.
- The visible page showed disabled ordinary controls plus human-only
  `Keep proposal` and `Revert` buttons. Both variant preview cards updated the
  same live product canvas.
- Revert restored the single-variant `tote-revision-1` baseline with no pending
  proposal and no persisted write.
- A mixed batch containing one valid name change and one undeclared colour was
  rejected with `INVALID_VALUE`; the valid first operation was not partially
  applied.
- No browser console errors were recorded. At a 390 px viewport there was no
  horizontal overflow and the sampled critical controls were at least 44 px
  high.

The Shopify page serves the same `codesign-tote.js` application digest as this
verified public runtime. This establishes code identity and Shopify coexistence,
but it is deliberately not relabelled as a native Shopify-page agent invocation.

## Actual-browser verification

The published page was exercised as a top-level Shopify storefront page:

- Initial natural, 12 oz, long-handle canvas loaded from the Shopify theme CDN.
- Charcoal colour, short handles, editorial typography, upper-left placement and embroidery changed the same live renderer.
- The visible design persisted across a reload and Reset restored the deterministic natural/12 oz/long-handle baseline.
- The page had no horizontal overflow at 1453 px.
- Shopify's 375 px theme-preview mode showed the mobile variant strip, live canvas, preview card and production-readiness panel without horizontal overflow.
- No browser console warnings or errors were recorded during the final top-level load, interaction, reload and reset sequence.
- The page remained password-protected and was not added to store navigation.

## Repository verification

After adding the Shopify asset boundary and deployment overlay:

- `npm test`: 22 files, 186 tests passed.
- `npm run typecheck`: passed for core and studio tote.
- `npm run build:shopify-demo`: passed.
- Public-boundary scan: 229 candidates passed.
- Documentation links: 80 files passed.
- Judge-site verification: passed.
- Tote parity: 14 controls, 4 variant operations, 1 asset slot and 6 legitimate exclusions passed.
- Eval corpus: 25 cases across 6 categories passed structural validation; scorer self-test passed without saving synthetic evidence.
- Browser bundle verification: passed.
- Deployed public exact-six invocation, two previews, validation, atomic
  rejection and zero-write Revert: passed.

Shopify Theme Check also reported two pre-existing missing translation entries and nine pre-existing warnings in the cloned theme. It reported no finding in the CoDesign template or assets. Those unrelated theme defects were deliberately not changed.
