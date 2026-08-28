# Tote final public release evidence

**Date:** 28 August 2026  
**Deployed implementation commit:** `ceec9fd3eab9d5c0959b6f5618c61863d562fad0`  
**Stable site:** <https://codesign-commerce.pages.dev/>  
**Stable tote:** <https://codesign-commerce.pages.dev/tote/?reset=true>  
**Immutable site:** <https://0e840311.codesign-commerce.pages.dev/>  
**Public source:** <https://github.com/fmksites/codesign-commerce>

## Verdict

**PASS — no release-blocking tote defect remains in the tested build.** The
stable and immutable authorities serve the same release metadata and exact
bundle bytes. The complete black-box agent flow, browser fallback, transaction
recovery and usability checks passed. Both tested fixtures were finally reset
to revision 1 with no pending proposal and `persisted: false`.

This evidence is limited to the public studio-tote reference. It neither
deploys nor claims a live WebMCP-enabled KORRHAUS production route.

## Exact release identity

| Artifact | SHA-256 |
| --- | --- |
| Reusable browser bundle, `assets/codesign-commerce.js` | `03c98c4be01c9928dfd70b119d2567061ca30cdf6d4a4d1195c3bb1d429becc0` |
| Tote application bundle, `tote/assets/index-BrYlMoBA.js` | `8025f8544513b2fac1a848ff11276dd77cbbd32ba1d41ff5a8cb807fb9f34274` |

Independent downloads from both stable and immutable authorities matched both
hashes. `site-metadata.json` identifies package `0.1.0`, the exact commit and
the same two digests. The tote route returns HTTP 200; an unknown route returns
an explicit HTTP 404 with `Cache-Control: no-store`.

Observed security headers include a restrictive Content Security Policy,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`, and disabled camera, geolocation and microphone
permissions.

## Reproducibility gate

A fresh anonymous public clone at the deployed commit completed:

- offline `npm ci` with zero reported vulnerabilities;
- 20 test files / 180 tests;
- strict TypeScript checks;
- release build plus browser-bundle and judge-site verification;
- public-boundary check for 178 candidates;
- documentation link check for 71 files;
- 25-case evaluation corpus and scorer self-test;
- 25/25 tote human-surface parity.

The release was assembled with the public repository URL and without a
KORRHAUS flagship URL. The builder correctly reports that the flagship is
withheld pending separate live verification.

## Final stable/immutable black-box regression

The existing Codex agent task exercised the public pages as black boxes:

1. Discovered exactly six tools: read workspace, list capabilities, stage
   asset, apply proposal, get previews and validate proposal.
2. Confirmed limits of 80 operations per batch and 240 per proposal.
3. Staged the real supplied North Form PNG without persisting it.
4. Created a 100-tote, 50/50 natural/charcoal collection in coherent
   foundation and branding passes.
5. Returned two real renderer previews and validated both variants as
   production-ready with zero issues.
6. Refined only the charcoal variant; its preview hash changed while the
   natural preview remained byte-identical.
7. Rejected a mixed request containing scale `1.41` with `INVALID_VALUE` and
   no partial state change.
8. Reverted to revision 1 with no pending proposal.
9. Deduplicated an exact initial retry and rejected a changed payload using the
   same operation ID with `OPERATION_ID_CONFLICT`.
10. Reloaded before Keep and truthfully reported that the proposal was not
    saved, with recreation guidance.
11. Kept a complete production-ready proposal, reloaded and retained both
    variants plus artwork locally.
12. Detected a normal human change from another tab, removed Keep, rejected a
    stale refinement with `STALE_COMMITTED_REVISION`, and restored the latest
    committed draft.
13. Matched normalized tool contracts, validation and both renderer hashes
    across stable and immutable authorities.
14. Recorded empty console logs and finally reset both authorities.

Renderer evidence:

- Natural: `sha256:74e1d748d287e861696bdf23239e7d0b7b0ddb60eba37c4b314e64b0f6b73df7`
- Charcoal: `sha256:7c5b4bd5230f03039ad581a4c430fda2102cf4240708b43a5d911028c73c85a3`
- Refined charcoal: `sha256:ca2358179cd9bf6b4407f337ee4c1bc667495a4be39ac84216772a8b97ab51f8`

The sanitized local evidence package contains a Markdown report, structured
JSON and 19 screenshots. For custody verification:

- report SHA-256: `3be22bcd0da1c2721d5eeda090a81a1d1cbf62b130f17251f5ff7dd657b9c31b`
- results SHA-256: `e1c764163bf4ded448ff1e723219ae4a73670d088885692592684f86fc0b5c94`

## Browser and usability verification

At 390 by 844 CSS pixels the complete proposal had no horizontal overflow;
Keep, Revert and variant targets exceeded 44 pixels and exposed visible focus.
The final ordinary-Chrome smoke also passed with no overflow or console errors.
All four desktop section-navigation buttons measured exactly 44 pixels high,
and the fresh status states `Saved in this browser only`.

A separate post-polish smoke repeated the exact six-tool contract, metadata,
temporary review, Revert, console and final-reset checks on both final
authorities. It produced five screenshots; its local report digest is
`f9988428c759f0c4951ceff8d8ee212ae66c480eba343018fb8958e9b9bd7432`
and structured-results digest is
`1debe6073c350dee7839c92a330bc7b233dc35ca8423bfbef1ba60749bf54f77`.

The connected exact-final Chrome instance did not expose
`document.modelContext`. Native Chrome WebMCP is therefore not claimed for this
exact release. This does not invalidate the public implementation: the exact
six tools and full transaction flow passed through the Codex WebMCP-capable
agent host, while ordinary Chrome preserved the complete human configurator.

The consumer ChatGPT website in ordinary Chrome is also not claimed: the
tested client exposed no webpage-tool surface. The separate ChatGPT desktop
site-tools path remains untested and must not be inferred from either result.

## Candid remaining usability opportunities

No item below blocks the challenge release:

- the desktop review rail is intentionally compact, so two-variant comparison
  is less prominent than the central live canvas;
- the complete mobile flow is long and would benefit from a future sticky
  review/comparison summary;
- production-readiness and reload explanations could be visually stronger;
- progress labels could map more directly to product, artwork and variants.

## Remaining human submission gates

- Record and publicly upload the mandatory sub-three-minute video.
- Verify repository, demo and video URLs while logged out.
- Complete entrant, eligibility, IP and third-party authorization attestations.
- Explicitly approve and perform the final Devpost submission.

KORRHAUS zero-traffic deployment, production traffic and feature enablement
remain separate optional approval gates and are not required for the public
tote submission to remain runnable.
