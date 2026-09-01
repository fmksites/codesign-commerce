# CoDesign integrity release verification

**Date:** 1 September 2026  
**Public commit:** `1f422d634cf07d8c4d8cf01165e3eeff89a5ab61`  
**Stable URL:** <https://codesign-webmcp.pages.dev/tote/?reset=true>  
**Immutable deployment:** <https://0b0603b6.codesign-webmcp.pages.dev/>  
**Scope:** public tote and judge site only; no Shopify theme or private KORRHAUS change

## Release identity

The approved commit was pushed to public `main`, built with the repository's
release command, and deployed to Cloudflare Pages. Stable and immutable
`site-metadata.json` returned the exact commit and the same bundle digests:

- core browser bundle SHA-256:
  `460aa40ade9b4cb42491a3028032ba970d8db4ce35febd7d646962890c13880b`;
- tote application bundle SHA-256:
  `edc44d53d107fed84a01fd78f3a027549c56f81c452ffbc457b2402d446f85d4`.

The downloaded stable bundles matched those digests. The deployed tote returned
HTTP 200 with the intended content-security, permissions, referrer, MIME-sniffing,
and frame policies. Hosted GitHub Actions CI completed successfully for the
same public commit.

## Exact deployed WebMCP flow

The Codex desktop in-app browser discovered exactly the six page tools from the
stable URL. Direct page-tool invocation then exercised the judge flow; this
proves the deployed contract and UI, but is not relabeled as independent model
tool selection or consumer ChatGPT-web evidence.

1. `codesign_read_workspace` returned the clean one-variant
   `tote-revision-1` baseline with `persisted:false`.
2. `codesign_list_capabilities` returned the declared controls, preview surface,
   variant operations, and merchant dependencies.
3. One atomic `codesign_apply_proposal` call created `North Form Natural` and
   `North Form Charcoal`, 50 units each. Charcoal began at the declared 95%
   upper-left direction. The proposal remained temporary.
4. `codesign_get_previews` returned two distinct 640 by 640 WebP artifacts bound
   to proposal revision 1.
5. `codesign_validate_proposal` returned `configurationValid:true`,
   `productionReady:false`, stable issue
   `artwork-safe-zone.tote-2`, source `merchant-rule`, a normalized preview
   region, and one merchant-approved repair: reduce `branding.scale` to 0.78.
6. The page visibly labelled the issue **Merchant production rule**, provided
   an accessible text equivalent, and showed both revision-1 previews as
   current.
7. Applying only the returned repair advanced the proposal to revision 2. The
   page immediately marked both prior receipts **Outdated preview · revision
   1**.
8. A new preview capture returned two revision-2 receipts. Natural retained
   integrity
   `sha256:acac0ea9ff9121c78553f37cd7617891bf4aa2b679a36d2a273639b8e4990e96`;
   repaired Charcoal returned
   `sha256:6b275ee79abb9e6054f351aa5950276e52841c4d7ed60362e7c75a9b6b12a61e`.
9. Revalidation returned `configurationValid:true`,
   `productionReady:true`, no issues, `nextAction:human-review`, and
   `persisted:false`.
10. The disclosure was generated from the actual registrations and read
    `4 inspect · 2 temporary design · 0 save/order/payment`.
11. Visible Revert restored the original single `Canvas tote`, quantity 100,
    cleared the pending proposal, preserved `tote-revision-1`, and left
    `persisted:false`. Browser warnings and errors were empty.

## Separate Keep and Passport proof

A separate clean deployed run created one production-ready Natural proposal,
captured its current preview, and validated it. The page-owned **Keep proposal**
control was enabled and used once.

- the committed revision advanced once to `tote-revision-2`;
- the pending proposal cleared;
- the Keep control disappeared;
- the page displayed **Verified configuration**, readiness, preview integrity,
  and a Shopify-safe reference; and
- after reload, the kept design and receipt remained visible and the workspace
  still had no pending proposal.

This is an isolated reference-demo persistence proof. It does not place an
order, mutate a Shopify cart, or authorize payment.

## Responsive and ordinary-Chrome checks

At 390 by 844 in the in-app browser, the deployed page had
`scrollWidth === clientWidth === 390`, retained its product heading and
tool-disclosure copy, and recorded no warnings or errors.

The same stable URL loaded in the connected native Chrome instance with the
complete human configurator, no horizontal overflow, the generated tool
disclosure, and no warnings or errors. That Chrome connection did **not** expose
`document.modelContext` or a WebMCP browser capability, so no current native-
Chrome tool-execution claim is made. Historical Chrome 151 evidence remains
dated evidence only.

## Claim boundary and remaining work

This release closes the public product, source, deployment, responsive UI,
direct supported-client flow, Constraint X-Ray, preview-freshness, Revert, and
Keep/Passport technical gates. It does not prove:

- independent ordinary-language model selection on this exact commit;
- consumer ChatGPT-web execution;
- current native-Chrome WebMCP execution;
- an updated Shopify development-store overlay; or
- any new private KORRHAUS behavior.

The required narrated public YouTube video, final media selection, human/legal
attestations, and final Devpost Submit action remain separate human-owned work.
