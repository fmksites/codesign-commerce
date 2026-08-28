# Submission checklist

Status meanings:

- `PASS` — evidenced on the named current source or public surface.
- `REPEAT AFTER FINAL DEPLOY` — implementation exists, but the final submitted
  deployment must be tested again.
- `HUMAN` — requires the participant's decision, recording, attestation, or
  external submission action.

Last official Devpost recheck: 28 August 2026. No organizer announcements were
available. Submission deadline: **3 September 2026, 1:00 PM PT / 22:00 CEST**.

## Product and WebMCP

- `PASS` — reusable Manifest 2 core with exactly six webpage tools.
- `PASS` — visible imperative `document.modelContext.registerTool(...)`
  implementation and lifecycle unregistration.
- `PASS` — complete anonymous studio-tote configurator with real artwork,
  multiple variants, live renderer previews, and coupled production rules.
- `PASS` — temporary proposals, exact Revert, page-owned Keep, optimistic
  concurrency, stale-state protection, and atomic invalid-batch rejection.
- `PASS` — no CoDesign tool for Keep, Revert, save, upload, quote, order,
  checkout, payment, customer data, pricing, margins, suppliers, or admin.
- `PASS` — ordinary desktop/mobile human experience remains functional without
  WebMCP.

## Public repository

- `PASS` — <https://github.com/fmksites/codesign-webmcp> is public.
- `PASS` — GitHub detects the Apache-2.0 license.
- `PASS` — source, public assets, tests, setup instructions, and reproducible
  tote example are included.
- `PASS` — hosted CI is green on current `main`.
- `PASS` — fresh public clone passes 22 test files / 186 tests, strict
  typecheck, build, browser-bundle verification, judge-site verification,
  public-boundary scan, documentation check, eval structure, and 25/25 tote
  surface parity.
- `PASS` — pre-challenge KORRHAUS work and post-25-August WebMCP work are
  separated by documentation and timestamped Git history.

## Public URL and browser evidence

- `PASS` — stable anonymous judge URL:
  <https://codesign-webmcp.pages.dev/tote/?reset=true>.
- `PASS` — public tote has completed deployed page-scoped exact-six flows with
  artwork, multiple proposal passes, two previews, validation, refinement,
  rejection, Revert, and Keep/reload evidence.
- `PASS` — Shopify development-store page has executed CoDesign tools alongside
  Shopify native catalog/cart tools.
- `REPEAT AFTER FINAL DEPLOY` — deploy the final repository commit so live
  metadata and source `main` identify the same release.
- `REPEAT AFTER FINAL DEPLOY` — repeat exact-six discovery and the judge flow in
  native Chrome with the WebMCP testing flag or ChatGPT's in-app browser.
- `REPEAT AFTER FINAL DEPLOY` — record the final immutable deployment URL,
  commit, core bundle hash, tote bundle hash, browser/client, and date.
- `PASS` — unsupported consumer ChatGPT website behavior is documented without
  being mislabeled as a supported client.
- `PASS` — Claude and other untested clients are not claimed.

## KORRHAUS and Shopify boundary

- `PASS` — the public tote is the sole anonymous standalone product demo.
- `PASS` — private KORRHAUS Manifest 2 integration is documented as locally
  verified, disabled by default, and not a live production claim.
- `PASS` — no private KORRHAUS source, credentials, customer records, pricing,
  supplier data, or administrative logic is included.
- `PASS` — the password-protected Shopify development-store proof is clearly
  optional interoperability evidence rather than the judge's required URL.

## Submission materials

- `PASS` — English Devpost copy draft and exact judge instructions exist.
- `PASS` — video script exists and targets less than three minutes.
- `HUMAN` — record a clear public YouTube demo with audio after the final
  deployment/client repeat.
- `HUMAN` — choose the final thumbnail and verify it uses current CoDesign
  WebMCP branding.
- `HUMAN` — choose submitter type and country, confirm eligibility, IP,
  third-party rights, and required Devpost answers.
- `HUMAN` — add the final public YouTube URL.
- `HUMAN` — submit the project before the deadline.

## Judging availability

- `HUMAN` — keep the public URL, repository, and video freely accessible
  through **21 September 2026, 5:00 PM PT**.
- `HUMAN` — avoid changing the submitted project after the deadline except as
  explicitly permitted by the official rules.

The official challenge website and rules remain authoritative:
<https://webmcp.devpost.com/rules>.
