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

All seven uploaded files were pulled back from theme `205741359446` and matched their tested local SHA-256 hashes exactly. The deployed JavaScript bundle digest is:

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
- Public-boundary scan: 228 candidates passed.
- Documentation links: 79 files passed before this evidence file was added; rerun required after documentation changes.
- Judge-site verification: passed.
- Tote parity: 14 controls, 4 variant operations, 1 asset slot and 6 legitimate exclusions passed.
- Eval corpus: 25 cases across 6 categories passed structural validation; scorer self-test passed without saving synthetic evidence.
- Browser bundle verification: passed.

Shopify Theme Check also reported two pre-existing missing translation entries and nine pre-existing warnings in the cloned theme. It reported no finding in the CoDesign template or assets. Those unrelated theme defects were deliberately not changed.
