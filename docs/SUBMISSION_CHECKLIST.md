# Submission checklist

Status meanings: `PASS` is evidenced, `PENDING` needs work, and `APPROVAL` cannot
proceed without the owner.

## Local engineering

- `PASS` — reusable public core and exactly five webpage tools.
- `PASS` — materially different studio tote as the sole standalone public demo.
- `CUT` — synthetic public KORRHAUS reference retired from the package and judge
  artifact; the existing Shopify Designer is the only KORRHAUS proof surface.
- `PASS` — local anonymous English judge landing and provider-neutral
  root-plus-`/tote/` artifact verified with three release-gated KORRHAUS CTA
  slots, verified non-release URL withholding, and a `404` for the retired
  `/korrhaus/` route.
- `PASS` — local disabled-by-default private flagship bridge.
- `PASS` — 95 deterministic public tests and the current local public
  typecheck/build/boundary/docs checks.
- `PASS` — repository security scan findings remediated.
- `PASS` — corrected non-release landing rendered at desktop and mobile with
  disabled KORRHAUS CTA slots and a clean console; the sole tote demo exposed
  exactly five tools, completed the temporary two-variant flow, and Reverted to
  its exact baseline with a clean console.
- `PASS` — final hostile-input, stale/conflict recovery, navigation cleanup, and
  private feature-off fallback browser checks.
- `PASS` — current guarded private candidate: production build and typecheck,
  40 unit files/192 tests, and the complete 128-case Designer browser run with
  127 passes and 1 intentionally skipped desktop duplicate of a mobile-only
  overflow case. See `docs/evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md`.
- `HISTORICAL` — five consecutive North Form rehearsals and the connected-native-
  Chrome fallback passed on the retired synthetic harness. They remain runtime
  evidence, not current public-surface or live-flagship proof.
- `CUT` — API-backed 78-run model eval; optional tooling retained, but the
  owner removed it as a submission gate on 27 August 2026.
- `SUPERSEDED` — clean-clone evidence for judge-site commit `10a02ee` covered the
  retired `/korrhaus/` subpath and remains historical only.
- `PASS` — corrected topology commit `e137a3b` passed a fresh `--no-local`
  clone: 95 tests, typecheck, build, bundle/judge/boundary/docs/eval checks,
  `git diff --check`, exact non-release metadata, and an empty final status.

## Public release

- `PASS` — public repository exists at
  <https://github.com/fmksites/codesign-commerce>.
- `PASS` — GitHub detects the root license as Apache-2.0.
- `PENDING` — publish the corrected topology and its evidence commit, rerun
  hosted CI on the exact final commit, and repeat unauthenticated
  repository/source checks.
- `APPROVAL` — after the fresh guarded zero-traffic proof, separately approved
  production promotion, and live-route verification, choose a hosting provider
  and deploy `dist/judge-site/`.
- `PENDING` — verify the public URL logged out in ChatGPT's in-app browser;
  additionally repeat in Chrome 149+ if its WebMCP testing flag is configured.
- `PENDING` — record final public commit, bundle hash, screenshots, and links.

## KORRHAUS flagship

- `SUPERSEDED` — the earlier two-revision zero-traffic sequence is preserved in
  `docs/evidence/KORRHAUS_ZERO_TRAFFIC_RELEASE.md`, but its `codesign-prod1`
  candidate predates the current safety fixes and must never be promoted.
- `PASS` — the replacement guarded candidate is complete and fully verified
  locally in `docs/evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md`.
- `PENDING` — deploy the current bytes as a fresh tagged QA revision and then
  the exact same immutable image as a fixtures-off zero-traffic candidate;
  verify identity, health, logs, HTTP, privacy boundary, five tools, Revert,
  fallback, and unchanged production traffic.
- `APPROVAL` — promote production traffic only after that fresh zero-traffic
  evidence passes.
- `PENDING` — verify the actual public English route and normal human fallback.

## Submission materials

- `PASS` — English Devpost copy draft.
- `PASS` — exact judge prompts and recovery guide.
- `PASS` — human-owned sub-three-minute script and shot list.
- `PENDING` — entrant/representative and eligibility confirmation.
- `PENDING` — final asset/IP and third-party integration authorization review.
- `PENDING` — human recording and narration.
- `APPROVAL` — public YouTube upload.
- `PENDING` — logged-out check of repository, app, flagship, and video URLs.
- `APPROVAL` — legal attestations and final Devpost submission.

## Availability

- `PENDING` — monitoring/ownership plan through 21 September 2026, 5:00 PM PT.
- `PENDING` — rollback owner and immutable fallback URL recorded.
- `PENDING` — final submission completed before the binding earlier deadline:
  3 September 2026, 1:00 PM PT / 22:00 CEST.
