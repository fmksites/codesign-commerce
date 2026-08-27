# Submission checklist

Status meanings: `PASS` is evidenced, `PENDING` needs work, and `APPROVAL` cannot
proceed without the owner.

## Local engineering

- `PASS` — reusable public core and exactly five webpage tools.
- `PASS` — KORRHAUS public reference and materially different studio tote.
- `PASS` — local disabled-by-default private flagship bridge.
- `PASS` — 95 deterministic tests, typecheck, builds, boundary/docs checks.
- `PASS` — repository security scan findings remediated.
- `PASS` — actual in-app-browser discovery and core flows on all three surfaces.
- `PASS` — final hostile-input, stale/conflict recovery, navigation cleanup, and
  private feature-off fallback browser checks.
- `PASS` — complete private Designer E2E on the final bundle: 95 passed and 1
  intentionally skipped desktop duplicate of a mobile-only overflow case.
- `PASS` — five consecutive frozen-build KORRHAUS North Form WebMCP rehearsals;
  each restored the exact baseline through human Revert with no console output.
- `PASS` — frozen public artifact normal-browser fallback in connected native
  Chrome: baseline UI and assets render, review controls stay hidden, clean
  console; this was not a feature-enabled Chrome WebMCP pass.
- `CUT` — API-backed 78-run model eval; optional tooling retained, but the
  owner removed it as a submission gate on 27 August 2026.
- `PASS` — clean clone of submission-evidence commit `8d3b5dd` passes all local
  public gates with the exact final browser-bundle digest.

## Public release

- `APPROVAL` — create and publish the public remote repository.
- `PENDING` — confirm Apache-2.0 detection in repository About.
- `APPROVAL` — choose hosting provider and deploy public examples.
- `PENDING` — verify the public URL logged out in ChatGPT's in-app browser;
  additionally repeat in Chrome 149+ if its WebMCP testing flag is configured.
- `PENDING` — record final public commit, bundle hash, screenshots, and links.

## KORRHAUS flagship

- `APPROVAL` — deploy a zero-traffic Cloud Run revision.
- `PENDING` — verify revision health, logs, HTML, bundle hash, and browser flow.
- `APPROVAL` — promote production traffic.
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
