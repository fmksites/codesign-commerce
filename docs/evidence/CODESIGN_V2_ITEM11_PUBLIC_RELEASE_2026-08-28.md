# CoDesign Commerce V2 — Item 11 public release evidence

Date: 28 August 2026  
Stable URL: <https://codesign-commerce.pages.dev/>  
Immutable URL: <https://966f9e17.codesign-commerce.pages.dev/>  
Public source: <https://github.com/fmksites/codesign-commerce>  
Served commit before this evidence-only follow-up: `a0bb6c89bf3f6bc11f59588c36a30fec75db5ba5`  
Browser bundle SHA-256: `7a26da66b510b52acc4e358dd39cecabcf3fd474559adf055a2e507c6491ce27`

## Release state

- The public repository contains the real Manifest 2.0 package, tote adapter,
  browser bundle, tests, English documentation, Apache-2.0 license and static
  judge artifact.
- Cloudflare Pages serves the judge landing and the single runnable product
  reference at `/tote/`.
- `/korrhaus/` and unknown routes return the explicit public `404` page. The
  release does not contain a second Sock Designer.
- The KORRHAUS flagship URL is absent from release metadata because no live
  KORRHAUS WebMCP release has been approved or verified.
- No private KORRHAUS deployment, feature enablement or traffic change occurred.

## Exact deployed WebMCP journey

The Codex in-app browser opened the stable public tote URL and discovered these
six page tools after a clean reset:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

There is no WebMCP Keep, Revert, save, upload, order, quote, checkout, payment,
pricing, customer, supplier or administration tool. Keep and Revert are visible
page-owned controls.

The actual deployed North Form journey then passed:

- Read the deterministic `tote-revision-1` baseline with one 100-unit natural
  tote.
- Applied a Foundation proposal creating two 50-unit variants: natural long
  handles and charcoal short handles.
- Rejected an intentionally future proposal revision with
  `STALE_PROPOSAL_REVISION`, marked retryable, and left the page unchanged.
- Re-read the current proposal and successfully applied the branding refinement.
- Staged the public 214,745-byte supplied PNG temporarily with SHA-256
  `593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`.
- Attached that asset to both variants and rendered two distinct 640 by 640 WebP
  previews bound to proposal revision 3.
- Displayed both previews inline in the OpenAI-hosted conversation surface.
- Validated the exact proposal as configuration-valid and production-ready.
- Reverted once and restored the original baseline with zero local writes, zero
  server writes, zero commits and one temporary-asset release.
- Rejected `bag.color = red` as `INVALID_VALUE` without creating a proposal or
  mutating the baseline.
- Recreated the complete proposal and clicked visible Keep once. The audit
  changed from zero persistence to exactly one local write, one simulated server
  write and one configuration commit. A subsequent page navigation reread the
  saved two-variant design and both imported artwork references.
- Reset the public page to the clean single-variant baseline before handoff.

Preview integrity values from the saved two-variant proposal:

- Natural: `97b2a3c78c403b598d1999c87f8b5c410f2fc04715beeb6708aeaf3404ec45df`
- Charcoal: `f20662404aa8333684ef5e1aa02137f5b6191c6b5c9ea7862e771de09aaadd26`

## Ordinary-browser and visual verification

- Desktop ordinary-browser testing changed every major design group, attached
  the actual PNG, created two variants, and verified the live renderer and saved
  state across navigation.
- A 390 by 844 mobile pass remained usable with
  `documentElement.scrollWidth === innerWidth === 390`.
- Reset restored one `Canvas tote` variant, quantity 100 and the typography
  fallback.
- Final deployed console inspection found zero errors and zero warnings.
- Chrome ordinary-browser testing changed colour, handles, quantity, studio
  name and print method, duplicated a variant, verified the live canvas, then
  reset cleanly with no console warnings or errors.

Screenshots:

- `docs/evidence/screenshots/item11-live-tote-desktop.png`
- `docs/evidence/screenshots/item11-live-tote-mobile-390.png`

## Public transport and security checks

- `/` and `/tote/` return `200`.
- `/korrhaus/` and an unknown route return `404`.
- The public pages return a restrictive Content Security Policy, deny framing,
  disable camera/geolocation/microphone, use `no-referrer`, and set
  `X-Content-Type-Options: nosniff`.
- The deployed `site-metadata.json` reports package `0.1.0`, the exact public
  commit, the browser-bundle digest, the public repository URL,
  `releaseBuild: true`, `flagshipUrl: null`, and `flagshipVerified: false`.
- The judge landing, repository link, judge guide, tote route, favicon and
  explicit 404 were checked on the stable release.

## Chrome claim boundary

The final connected ordinary Chrome instance rendered and edited the immutable
release correctly, but it did not expose `document.modelContext`; therefore a
native Chrome WebMCP repeat cannot be claimed on that browser instance. Earlier
dated evidence records a successful Chrome 151 native-WebMCP run on the same
browser bundle. The current public claim is deliberately narrower: normal Chrome
works as a complete human configurator, and the exact deployed six-tool flow is
verified in the Codex in-app browser.

## Remaining external acceptance gates

Item 11 is technically complete except for the participant-owned literal normal
ChatGPT desktop conversation repeat that was explicitly deferred, and the
mandatory public YouTube video. The repository, deployment and automated/runtime
evidence do not substitute for those two external submission requirements.
