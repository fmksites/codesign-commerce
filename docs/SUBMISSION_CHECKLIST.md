# Submission checklist

**Current status:** local release preparation, 28 August 2026

Status meanings: `PASS` is evidenced on the named build, `PENDING` needs work,
and `APPROVAL` is an external action that cannot proceed without Felix.

## Official requirements

Verified against the [WebMCP Challenge official rules](https://webmcp.devpost.com/rules)
on 28 August 2026:

- `PASS` — project uses `document.modelContext.registerTool(...)` and is a
  non-trivial WebMCP implementation.
- `PENDING` — working live URL accessible to judges in ChatGPT's in-app browser
  or Chrome with WebMCP enabled.
- `PENDING` — current source and history publicly available with all runnable
  code, assets and instructions.
- `PASS` — visible Apache-2.0 `LICENSE` exists locally.
- `PASS` — English text draft explains WebMCP fit, user experience, joint
  human-agent work and implementation.
- `PENDING` — public YouTube demonstration with audio, clearly functioning and
  shorter than three minutes. This is mandatory even though recording is not a
  useful Codex-only engineering task.
- `PENDING` — clear final evidence distinguishing the pre-existing KORRHAUS
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
- `PASS` — clean `--no-local` clone of commit
  `afa8b598e1af5ddb6d82afd90f18430a99d81326`: offline `npm ci`, zero reported
  vulnerabilities, 20 files / 175 tests, typecheck, build, bundle, judge,
  boundary, docs, parity and eval-structure checks.
- `PASS` — browser bundle digest
  `7a26da66b510b52acc4e358dd39cecabcf3fd474559adf055a2e507c6491ce27`.
- `PASS` — retired public synthetic KORRHAUS configurator is absent; `/tote/`
  is the sole standalone product demo.
- `PASS` — current release builder can publish the tote honestly without
  requiring or claiming a live KORRHAUS deployment; a flagship link is exposed
  only after separate live verification.

## Public release

- `PASS` — repository URL exists at
  <https://github.com/fmksites/codesign-commerce> and currently exposes
  historical baseline commit `e986e12b9448491c2e34b302c1c4ddcf12320047` on
  `main`.
- `APPROVAL` — push the current local branch/history. No current Manifest 2.0
  commit is public yet.
- `PENDING` — verify anonymous clone, visible Apache-2.0 license, source tree,
  README and hosted CI on the exact pushed commit.
- `APPROVAL` — choose a hosting provider and deploy `dist/judge-site/`.
- `PENDING` — verify the public tote URL logged out, on desktop/mobile ordinary
  browsers, in normal ChatGPT desktop and in native Chrome WebMCP.
- `PENDING` — record exact served commit, bundle hash, asset hashes, headers,
  screenshots and functional links.

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
- `PASS` — Codex in-app browser exact-six runtime evidence on the final local
  tote product.
- `PASS` — native Chrome 151 exact-six runtime evidence on the Item 8 build.
- `PENDING` — native Chrome repeat on the immutable deployed tote build.
- `PENDING` — literal normal ChatGPT desktop conversation on the deployed tote,
  including artwork transport, inline image previews, refinement and explicit
  action-time Keep confirmation.
- `NOT CLAIMED` — ChatGPT website in ordinary Chrome, Claude and other clients
  until separately documented and actually verified.

## Submission materials

- `PASS` — English Devpost copy draft.
- `PASS` — exact judge prompt and recovery guide.
- `PASS` — mandatory sub-three-minute video script and shot list updated to
  tote-first exact-six behavior.
- `PENDING` — final screenshots and thumbnail/cover selection.
- `PENDING` — human recording and narration.
- `APPROVAL` — public YouTube upload.
- `PENDING` — logged-out check of repository, app and video URLs.
- `APPROVAL` — legal attestations and final Devpost submission.

## Availability and rollback

- `PENDING` — monitoring/ownership plan through 21 September 2026, 5:00 PM PT.
- `PENDING` — immutable public fallback URL and rollback owner.
- `PENDING` — submit before 3 September 2026, 1:00 PM PT.
