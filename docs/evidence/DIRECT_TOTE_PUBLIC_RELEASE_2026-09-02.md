# Direct-tote public release verification

**Date:** 2 September 2026  
**Public commit:** `14cbe14410195774285180255189282e0c2b054d`  
**Stable demo:** <https://codesign-webmcp.pages.dev/tote/?reset=true>  
**Immutable deployment:** <https://80f00a8d.codesign-webmcp.pages.dev/>  
**Scope:** public repository and Cloudflare Pages release only; no KORRHAUS or Devpost mutation

## Release identity

Public GitHub `main` was fast-forwarded to the verified commit. Hosted CI run
[`33608572523`](https://github.com/fmksites/codesign-webmcp/actions/runs/33608572523)
completed successfully for that exact SHA.

Stable and immutable `site-metadata.json` both report:

- core browser bundle SHA-256:
  `460aa40ade9b4cb42491a3028032ba970d8db4ce35febd7d646962890c13880b`;
- tote application bundle SHA-256:
  `edc44d53d107fed84a01fd78f3a027549c56f81c452ffbc457b2402d446f85d4`;
- verified repository URL: <https://github.com/fmksites/codesign-webmcp>;
- verified live Shopify example:
  <https://korrhaus.nl/en/apps/wholesale/sock-designer>; and
- `releaseBuild:true` and `flagshipVerified:true`.

The stable bundles were downloaded independently and matched both digests.

## Direct route

Both stable and immutable deployment roots return HTTP 302 with
`Location: /tote/?reset=true`. The target returns HTTP 200 with the intended
content-security, permissions, referrer, MIME-sniffing, and frame policies.
There is no separate marketing or judge homepage in the public artifact.

## Exact deployed WebMCP acceptance

The Codex desktop in-app browser opened the stable root, followed the redirect,
and discovered the six page-scoped CoDesign tools. Direct tool invocation then:

1. read clean committed revision `tote-revision-1` with `persisted:false`;
2. discovered 16 public control descriptions and their merchant-bounded values;
3. created `North Form Natural` and `North Form Charcoal`, 50 units each, as one
   temporary proposal;
4. returned two distinct 640 by 640 WebP previews for proposal revision 1;
5. localized merchant issue `artwork-safe-zone.tote-2` and exposed only the
   approved “Reduce branding mark scale to 78%” repair;
6. applied that repair only to Charcoal while Natural remained at 105%;
7. returned two fresh revision-2 previews, with repaired Charcoal integrity
   `sha256:6b275ee79abb9e6054f351aa5950276e52841c4d7ed60362e7c75a9b6b12a61e`;
8. revalidated `configurationValid:true`, `productionReady:true`, no issues,
   `nextAction:human-review`, and `persisted:false`; and
9. used the visible page-owned Revert control to restore the original single
   100-unit `Canvas tote`, unchanged committed revision, no pending proposal,
   and `persisted:false`.

The visible activity list reflected the actual calls. The disclosure read
`4 inspect · 2 temporary design · 0 save/order/payment`. Keep and Revert were
both available at human review. Browser warnings and errors were empty.

This proves the deployed page contract and visible product behavior. It is not
relabelled as independent model tool selection, consumer ChatGPT-web evidence,
or native-Chrome WebMCP execution.

## Verification boundary

The core and tote application bundle hashes are unchanged from the 1 September
integrity release, whose separate Keep/Passport, mobile and ordinary-Chrome
checks remain dated supporting evidence. This release specifically proves the
new direct-root experience and repeats the complete temporary X-Ray/repair/
fresh-preview/Revert path on the exact deployed commit.
