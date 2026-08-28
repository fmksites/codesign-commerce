# Submission checklist

**Current status:** final public tote implementation is pushed, deployed and
black-box verified; consumer ChatGPT web is blocked by that client, while the
participant-owned video and human submission gates remain, 28 August 2026

Status meanings: `PASS` is evidenced on the named build, `PENDING` needs work,
`BLOCKED BY CLIENT` needs a compatible external client, and `APPROVAL` is an
external action that cannot proceed without Felix.

## Official requirements

Verified against the [WebMCP Challenge official rules](https://webmcp.devpost.com/rules)
on 28 August 2026:

- `PASS` — project uses `document.modelContext.registerTool(...)` and is a
  non-trivial WebMCP implementation.
- `PASS` — working rebranded URL at <https://codesign-webmcp.pages.dev/> passed
  the exact six-tool Codex in-app-browser flow and ordinary Chrome QA.
- `PASS` — current source and history publicly available with all runnable
  code, assets and instructions.
- `PASS` — visible Apache-2.0 `LICENSE` exists in the public repository.
- `PASS` — explicit `ASSET_NOTICES.md` distinguishes Apache-2.0 code,
  KORRHAUS-owned marks/assets, fictional North Form demo material and merchant
  asset responsibilities.
- `PASS` — English text draft explains WebMCP fit, user experience, joint
  human-agent work and implementation.
- `PENDING` — public YouTube demonstration with audio, clearly functioning and
  shorter than three minutes. This is mandatory even though recording is not a
  useful Codex-only engineering task.
- `PASS` — clear final evidence distinguishing the pre-existing KORRHAUS
  Designer from work added after 25 August 2026.
- `PENDING` — entrant/representative, eligibility, IP and third-party
  authorization attestations by Felix.

Binding submission deadline: **3 September 2026, 1:00 PM PT**. The project and
test access must remain available through **21 September 2026, 5:00 PM PT**.

## Local public implementation

- `PASS` — reusable Manifest 2.0 core and exactly six webpage tools.
- `PASS` — no WebMCP Keep, Revert, save, upload, quote, checkout, order,
  payment, customer, supplier, margin or administrative tool.
- `PASS` — complete public studio-tote reference with 25/25 surface parity,
  actual supplied artwork, typography, transform controls, two named variants,
  coupled production rules, live renderer previews and page-owned Keep/Revert.
- `PASS` — local tote actual-browser flows cover staged changes, distinct
  previews, targeted refinement, zero-write Revert, one-state-commit Keep,
  ordinary human fallback, desktop and 390 px mobile.
- `PASS` — the released repair passes initial-request retry,
  cross-tab stale protection, Keep-after-reload, unsaved-reload recovery,
  visible narrow-rail details and mobile keyboard/target-size checks.
- `PASS` — two audit-driven polish changes clarify browser-only persistence and
  make every desktop section-navigation target at least 44 px.
- `PASS` — clean public release clone of deployed commit `8322698e3b1a`:
  offline `npm ci`, zero reported vulnerabilities, 21 files / 184 tests,
  typecheck, build, bundle, judge,
  boundary, docs, parity and eval-structure checks.
- `PASS` — public core WebMCP bundle digest
  `aa195de70a5c0a2a7db0a929e038212f485d70db309f0538914dad7c1da7371f`.
- `PASS` — public tote application bundle digest
  `28ccc028f0ed455e5606570b159d67e4ff297958f249bcba6d3305af04a8a18a`.
- `PASS` — exhaustive tool/control matrix found and locally verified fixes for
  visible coupled-rule validation, rule-specific agent diagnostics, and
  per-batch versus per-proposal operation limits.
- `PASS` — retired public synthetic KORRHAUS configurator is absent; `/tote/`
  is the sole standalone product demo.
- `PASS` — current release builder can publish the tote honestly without
  requiring or claiming a live KORRHAUS deployment; a flagship link is exposed
  only after separate live verification.

## Public release

- `PASS` — public repository is renamed to
  <https://github.com/fmksites/codesign-webmcp>, with current description,
  homepage, public visibility, detected Apache-2.0 license and passing hosted
  CI on commit `8322698e3b1a`.
- `PASS` — verify anonymous clone, visible Apache-2.0 license, source tree,
  README and hosted CI on the exact pushed commit.
- `PASS` — Cloudflare Pages serves `dist/judge-site/` at
  <https://codesign-webmcp.pages.dev/> with deployment URL
  <https://78c60433.codesign-webmcp.pages.dev/>. The pre-rebrand project
  remains historical evidence and rollback continuity.
- `PASS` — public tote verified logged out on desktop/mobile ordinary browsers,
  the Codex in-app browser exact-six flow, and ordinary Chrome.
- `PASS` — final public exact-six agent regression created both North Form
  variants with supplied artwork, returned two real previews, validated
  production, refined only the requested variant, proved atomic rejection,
  Revert, Keep/reload, idempotency and cross-tab recovery, then reset both
  authorities to revision 1.
- `PASS` — record exact served commit, bundle hash, asset hashes, headers,
  screenshots and functional links.
- `PASS` — both advertised bundle paths are public and their independently
  downloaded stable/immutable bytes match release metadata.

## Local KORRHAUS integration

- `PASS` — exact-six Manifest 2.0 adapter integrated locally into the existing
  private Route 02 Designer, not a second sock designer.
- `PASS` — versioned inventory maps more than 50 existing customer-editable
  creative/configuration controls plus up to four colourways.
- `PASS` — temporary PNG/JPEG/WebP/SVG, existing proof-board WebP previews,
  zero-write Revert, exactly-once Keep, stale protection, non-agent fallback,
  autosave isolation and mobile behavior.
- `PASS` — changed-file lint, 43 files / 220 unit tests, typecheck, production
  build, 8 active CoDesign V2 tests, 6 localization tests and 107-test complete
  active Playwright suite. Full lint retains one unrelated pre-existing ABOUT
  YOU test error.
- `PASS` — feature remains disabled by default; no exact-six deployment or
  traffic change occurred.
- `APPROVAL` — optional new isolated/zero-traffic KORRHAUS deployment.
- `PENDING` — if approved, verify exact image/config/hash/logs and the same
  normal-human plus exact-six synthetic flow without ordinary traffic.
- `APPROVAL` — any production traffic or feature enablement, separately after
  zero-traffic proof.
- `PENDING` — actual public English Shopify route verification before calling
  KORRHAUS a live WebMCP flagship.

The public tote release does not depend on KORRHAUS production promotion.

## Browser and agent evidence

- `PASS` — ordinary desktop/mobile browser fallback.
- `PASS` — Codex in-app browser exact-six runtime evidence on the deployed tote
  product.
- `PASS` — native Chrome 151 with the official testing flag discovered the exact
  six current tools through `document.modelContext`, executed temporary
  proposal and real-artwork paths, produced real previews, and recorded zero
  writes/imports/commits.
- `PENDING CLIENT RELAUNCH` — repeat native Chrome on the current rebranded
  release. The connected Chrome passed ordinary desktop/mobile QA but exposed
  no `document.modelContext`, so the historical native pass is not relabeled as
  current.
- `PASS` — the current rebranded public release completed the exact-six
  contract through the Codex in-app browser. Chrome native proof and Codex
  in-app-browser proof are recorded separately rather than conflated.
- `BLOCKED BY CLIENT` — a literal ChatGPT website run in ordinary Chrome on 28
  August 2026 reached the public tote and artwork, but ChatGPT only searched its
  plugin directory for `WebMCP`, received an empty result, exposed no webpage
  tools, created no proposal and returned no previews. This is evidence about
  that consumer client, not a tote implementation failure.
- `NOT TESTED` — the separate ChatGPT desktop-app in-app-browser path on the
  current rebranded release. It must not be inferred from either the failed ChatGPT
  website run or the passing Codex/native-Chrome evidence.
- `PASS` — the existing Codex task independently executed the exact two-variant
  North Form flow and the focused final diagnostics/operation-limit regression;
  this is strong engineering evidence and is kept distinct from the blocked
  consumer ChatGPT website check above.
- `NOT CLAIMED` — Claude and other clients until separately documented and
  actually verified.

## Submission materials

- `PASS` — English Devpost copy draft.
- `PASS` — exact judge prompt and recovery guide.
- `PASS` — mandatory sub-three-minute video script and shot list updated to
  tote-first exact-six behavior.
- `PASS` — final deployed desktop and mobile screenshots captured; thumbnail
  selection remains part of the Devpost handoff.
- `PENDING` — human recording and narration.
- `APPROVAL` — public YouTube upload.
- `PENDING` — logged-out check of repository, app and video URLs.
- `APPROVAL` — legal attestations and final Devpost submission.

## Availability and rollback

- `PENDING` — monitoring/ownership plan through 21 September 2026, 5:00 PM PT.
- `PASS` — immutable public fallback URL recorded; deployment owner is Felix.
- `PENDING` — submit before 3 September 2026, 1:00 PM PT.
