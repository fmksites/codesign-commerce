# Ordinary-language agent run — 1 September 2026

## Scope

This is current-release evidence for the public tote at
<https://codesign-webmcp.pages.dev/tote/?reset=true>. The shopper brief named
neither WebMCP nor any CoDesign tool:

> I need 100 premium branded studio totes for North Form. Give me a natural
> customer version and a darker staff version, show me both options, check
> whether they are ready to make, and do not save anything yet.

The run was orchestrated by Codex in its in-app browser. It is evidence of an
agent interpreting an ordinary brief and selecting webpage tools. It is not
consumer ChatGPT-web or native-Chrome evidence.

## Observed result

1. The agent read the clean workspace and listed the merchant capabilities.
2. One atomic proposal created two 50-unit variants:
   - `North Form Natural`: natural 16 oz canvas, long handles, centered black
     studio-name typography at 105%;
   - `North Form Staff`: charcoal 16 oz canvas, short handles, upper-left white
     studio-name typography at 95%.
3. The first proposal remained configuration-valid but production-not-ready.
   Merchant validation returned `ARTWORK_SAFE_ZONE` for the staff variant and
   one bounded repair: reduce scale to 78%.
4. Both revision-1 renderer previews were returned at 640 by 640 pixels:
   - Natural:
     `sha256:86e7ef83971a941440a867aa364e5ad4ffb9e13b9ad66aa1b66c1c0fbb7e6f03`;
   - Staff:
     `sha256:271f6bf9a1220564980a7cb5713a3237993ae33bc91a774ff4226c9ac237ebec`.
5. The agent applied only the merchant-supplied 78% repair. Both revision-1
   receipts became visibly outdated before fresh evidence was requested.
6. The revision-2 validation result was `configurationValid:true`,
   `productionReady:true`, with no remaining issues.
7. Both fresh revision-2 previews were returned at 640 by 640 pixels:
   - Natural remained unchanged:
     `sha256:86e7ef83971a941440a867aa364e5ad4ffb9e13b9ad66aa1b66c1c0fbb7e6f03`;
   - Staff changed after repair:
     `sha256:4143f9c687031857338121e6304f9b6e3f12c300378c65597670a0527c10fdb9`.
8. The final workspace remained a reviewable temporary proposal with
   `persisted:false`. Keep was not invoked.

## Revert evidence boundary

The tool session used for this run ended after the final read, before a fresh
visible Revert result could be extracted into this record. Do not cite this
document alone as Revert proof. Zero-write Revert remains covered by the full
deterministic suite and the separately dated current-release browser evidence
in `CODESIGN_INTEGRITY_RELEASE_2026-09-01.md`.

A follow-up request sent to the older dedicated tote test task completed with
no readable output. It is deliberately not counted as evidence.

## Claim allowed

The current public tote can turn the ordinary North Form brief into two genuine
merchant-rendered previews, diagnose the declared production problem, apply the
only merchant-approved repair, refresh stale preview evidence, reach production
readiness, and remain unsaved. The passing client for this record is Codex
desktop's in-app browser.
