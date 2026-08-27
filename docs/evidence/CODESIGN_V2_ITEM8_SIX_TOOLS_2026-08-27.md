# Item 8 evidence — exact six WebMCP tools and unified review control

Date: 27 August 2026  
Scope: public CoDesign Commerce repository and fictional studio-tote reference  
Release state: local only; not deployed or published

## Outcome

The studio tote now consumes the Manifest 2.0 proposal engine, asset sandbox,
preview bridge, and one page-owned review controller through exactly these six
WebMCP tools:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

There is no WebMCP Keep, Revert, save, upload-to-merchant-storage, quote,
checkout, order, payment, customer-data, pricing, margin, supplier, or private
workflow tool. `codesign_stage_asset` creates only a bounded session-local
temporary handle. Only the visible page Keep controller can cross the adapter's
persistence boundary.

## Contract and lifecycle checks

- All six tools use strict schemas with `additionalProperties: false`, bounded
  strings and arrays, safe identifiers, and runtime reconstruction.
- Tool results contain canonical public workspace/capability/proposal/preview/
  validation data only.
- Registration is feature- and host-gated, returns one lifecycle disposer, and
  shares an `AbortController` across all callbacks.
- Synchronous callback failures are converted to sanitized async error results.
- The review controller reads one `ProposalEngine` state machine. Controls lock
  only while a temporary proposal is active, and Keep remains unavailable until
  an inspectable preview exists.
- Revert restores the exact adapter snapshot without writes. Keep delegates to
  the same idempotent page controller whether a person clicks it directly or an
  agent activates it after explicit chat confirmation.

## Actual-browser proof

The proof ran against the Vite development origin in two independent hosts.

### Codex in-app browser

- Discovered the exact six names through the page's native WebMCP notification.
- Read the natural/front-centre baseline, applied a charcoal/upper-left
  proposal, and visibly changed the same tote preview the person sees.
- Captured a 640 by 640 WebP preview with proposal/revision identity and
  `sha256:82a92b24...01297` integrity.
- Recorded zero local writes, zero server-simulation writes, and zero commits
  before confirmation.
- Revert restored the natural/front-centre baseline with one adapter restore and
  zero persistence writes.

### Native Chrome 151

- Discovered the same exact six tools through `document.modelContext` and
  executed their callbacks with Chrome's native JSON-string argument form.
- Applied and rendered the same proposal; the page review panel became visible
  and controls locked while the proposal was pending.
- Revert restored the baseline with zero writes.
- In a separate repeat, the visible Keep button remained disabled until preview
  capture, then produced exactly one local write, one server-simulation write,
  and one adapter commit. The panel confirmed that the proposal was kept.

### Supplied-artwork proof

- Staged the real 214,745-byte `north-form-supplied-mark.png` through the final
  `codesign_stage_asset` implementation.
- Temporary asset integrity:
  `sha256:593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`.
- The actual artwork layer was visible in the tote renderer; the typography
  placeholder was hidden.
- The resulting 640 by 640 WebP changed to
  `sha256:19705b131f8770a68c7ce95619c06f4c3620a582ff8e96b072f36f6562e0ea7b`,
  proving the captured artifact corresponds to the supplied visual rather than
  a text-only result.
- Before confirmation: zero writes, zero imports, and zero commits.
- Revert released the temporary asset once, restored the baseline, and still
  recorded zero writes and zero merchant imports.

### Ordinary browser regression

A fresh `?reset=true` page with no agent proposal showed no review panel and no
locked controls. A normal human colour selection changed natural to charcoal,
remained usable, and caused no horizontal overflow. WebMCP therefore remains a
progressive enhancement rather than a replacement UI.

## Deterministic verification

The final local Item 8 suite passed:

- Vitest: 20 files, 172 tests.
- Strict workspace and test typecheck.
- Production module, browser, tote, and judge-site builds.
- Browser bundle verification:
  `sha256:74086bb3f5152f944053d52925078f6fd3e4b01cf609b9cc15a472fae8088e59`.
- Public-boundary scan: 156 candidates.
- Documentation link check: 61 files before this evidence file was added.
- Tote control parity: 16 of 16 accounted for at the Item 8 surface.
- Eval corpus validation/scorer self-test: 25 cases across 6 categories; this is
  deterministic corpus validation, not a claimed model evaluation run.
- Judge-site assembly check and `git diff --check`.

## Honest limitation and next dependency

The Codex in-app browser and native Chrome prove real host discovery, callbacks,
rendering, preview artifacts, Keep, Revert, and supplied artwork. The previously
approved literal normal-ChatGPT-conversation repeat remains a release check in
Item 11; no final ChatGPT compatibility claim is made from this Item 8 run.

Item 9 must now finish the public tote as a complete visual product: map every
customer control, add typography/placement/scale/rotation, polish multi-variant
and responsive behavior, and run the full judge journey.
