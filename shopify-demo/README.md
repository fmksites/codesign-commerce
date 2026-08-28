# Shopify-hosted tote demo

This overlay proves that CoDesign WebMCP can run inside a normal Shopify Online Store page while preserving Shopify's own storefront runtime.

It intentionally contains only an alternate page template and its assets. Apply it to a copied or unpublished theme; do not overwrite a merchant's production theme.

## Assemble the overlay

```bash
npm run build:shopify-demo
```

The generated files are written to `dist/shopify-theme-demo/`:

- `templates/page.codesign-tote.liquid`
- `assets/codesign-tote.js`
- `assets/codesign-tote.css`
- the four public tote demonstration images

The Liquid template includes `content_for_header`, so Shopify can keep supplying its native storefront capabilities. It also maps the reference renderer's public images to Shopify CDN URLs before the CoDesign bundle starts.

Create a normal Online Store page, assign the `codesign-tote` template, and open its handle. The current password-protected development-store proof is:

```text
https://korrhaus-development.myshopify.com/pages/codesign-webmcp-tote-demo
```

No product, cart, checkout, order, customer or price data is created by this demo.

The Shopify-hosted page complements the stable public challenge URL; it does not replace the clean-clone/static deployment required for reproducible judging.
