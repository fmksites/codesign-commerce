# Live KORRHAUS WebMCP verification — 31 August 2026

This record documents the real-business integration separately from the
anonymous studio-tote submission path.

## Surface and boundary

- Live storefront: <https://korrhaus.nl/en/apps/wholesale/sock-designer>
- Product: the pre-existing KORRHAUS Custom Sock Designer.
- Challenge work: a private Manifest 2 adapter connecting the unchanged public
  CoDesign WebMCP core to KORRHAUS's existing state, renderer, validation,
  artwork, autosave-isolation, preview, restore, and human Keep boundary.
- Public core browser-bundle SHA-256:
  `c0fc462e099c380432d6d28971dba686d0f5f258ab7d5d368b1a6cd3110d1b56`.
- Public contract version reported by the private integration: `2026-08-29.5`.

The private adapter, authenticated state, pricing, customer records, storage,
orders, quotes, supplier data, and persistence implementation are not part of
this repository.

## Live browser result

A supported Codex browser opened the real Shopify route and discovered sixteen
page tools: Shopify's ten native storefront tools plus CoDesign's exact six:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

The CoDesign capability inventory reported more than 50 customer-editable
controls, four colourway operations, an artwork slot, a current product-preview
surface, and coupled production dependencies.

The live proposal run:

- read an allowlisted workspace without returning customer identifiers, pricing,
  credentials, private endpoints, or administrative state;
- created a temporary 120-pair collection across two colourways;
- visibly updated the existing KORRHAUS renderer;
- returned two distinct current 640 by 640 WebP renderer previews;
- reported authoritative configuration and production-readiness information;
- remained `persisted:false`; and
- used Revert to restore the original four-colourway committed workspace without
  changing its committed revision.

The review interface stayed hidden during ordinary browsing and appeared only
for the active agent proposal. Normal visitors retained the existing Designer.

## Persistence evidence and qualification

The live run deliberately did not press Keep on a real customer draft.
Exactly-once Keep, stale-state rejection, artwork import after confirmation,
autosave isolation, and retry/uncertain outcomes passed the private isolated
test suites. Reported private release verification comprised 259 unit tests,
109 browser tests, and 41 agent-service tests, plus lint, typecheck, and
production builds.

This evidence proves a current live Shopify business integration in the tested
Codex browser. It does not claim that the same run occurred in consumer ChatGPT
or the current connected native-Chrome instance. The anonymous studio tote
remains the reproducible judge path.
