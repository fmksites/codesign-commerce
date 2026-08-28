# CoDesign Commerce Item 11 — local release-readiness checkpoint

**Date:** 28 August 2026

**State:** local preparation only; Item 11 remains open at public
publication/deployment and final supported-client gates

## Decision made

The submitted working live URL is the public landing plus studio-tote demo.
KORRHAUS is the real-business integration but is not a dependency for publishing
or judging the tote. The release builder now supports both honest states:

- repository plus live tote, with the KORRHAUS link withheld; and
- repository plus tote plus KORRHAUS link only after exact live-route
  verification is explicitly attested.

This prevents the challenge release from being blocked by a separate production
promotion and prevents a local or zero-traffic KORRHAUS result from being called
live.

## Official-rule check

The [official rules](https://webmcp.devpost.com/rules) were reread on 28 August
2026. The binding submission artifacts are:

- one working live URL that judges can access with ChatGPT's in-app browser or
  Chrome with WebMCP enabled;
- a public repository with functional source/assets/instructions and a visible
  open-source license;
- English submission text covering WebMCP fit, user experience, joint
  human-agent work and implementation;
- a public YouTube video with audio, a clear functioning demo and duration
  under three minutes;
- dated evidence separating pre-existing KORRHAUS work from WebMCP work added
  during the submission period.

The deadline is 3 September 2026 at 1:00 PM PT. Test access must remain available
through 21 September 2026 at 5:00 PM PT.

## Clean-clone checkpoint

An offline `--no-local` clone of public commit
`afa8b598e1af5ddb6d82afd90f18430a99d81326` passed:

| Check | Result |
| --- | --- |
| `npm ci --offline` | PASS — 128 packages, 0 reported vulnerabilities |
| `npm test` | PASS — 20 files / 175 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run verify:browser-bundle` | PASS |
| `npm run check:judge-site` | PASS |
| `npm run check:public-boundary` | PASS — 166 candidates |
| `npm run check:docs` | PASS — 65 files |
| `npm run check:evals` | PASS — 25 cases / 6 categories plus scorer self-test |
| `npm run check:parity` | PASS — 25/25 tote surfaces |
| `git diff --check` and final status | PASS — clean |

Bundle digest:
`7a26da66b510b52acc4e358dd39cecabcf3fd474559adf055a2e507c6491ce27`.

## Release-builder checkpoint

The current release-preparation tree was copied without Git metadata, generated
dependencies, build output or unrelated `research/`, committed inside an
isolated temporary repository, and tested as a clean release input.

| Case | Result |
| --- | --- |
| Exact public repository, no KORRHAUS variables | PASS — release built; KORRHAUS URL withheld |
| KORRHAUS URL without live attestation | EXPECTED FAIL |
| Live attestation without KORRHAUS URL | EXPECTED FAIL |
| Exact public repository + exact KORRHAUS URL + live attestation | PASS |
| Judge-site verifier for both valid release states | PASS |

The positive tote-only build generated valid release metadata with a public
repository URL, `flagshipUrl: null`, `flagshipVerified: false`, the exact commit
and bundle digest. No external network write occurred.

## Visual checkpoint

The updated local landing makes the tote the primary runnable call to action,
shows six tools and 175 deterministic tests, labels KORRHAUS as an integration,
and disables its live link until verified.

- Desktop Chromium: 1440 px content width, no horizontal overflow, clean
  console, every reveal section inspected.
- Mobile Chromium: 390 px content width, no horizontal overflow, clean console,
  all product, safety and repository sections readable.
- The primary hero action resolves to `./tote/?reset=true`.
- Every KORRHAUS action is disabled in the non-release build.

Screenshots:

- [`screenshots/judge-landing-desktop.png`](./screenshots/judge-landing-desktop.png)
- [`screenshots/judge-landing-mobile.png`](./screenshots/judge-landing-mobile.png)

## Public-state check

Read-only `git ls-remote` found the existing public repository at
`https://github.com/fmksites/codesign-commerce` with `main` still at historical
baseline `e986e12b9448491c2e34b302c1c4ddcf12320047`. The Manifest 2.0 work and
Items 1–10 remain local. Nothing was pushed, deployed, published or submitted.

## Remaining approval gates

1. Approve pushing the current source/history to the public repository.
2. Verify anonymous clone, visible license and hosted CI on the exact pushed
   commit.
3. Approve a hosting provider and public deployment of `dist/judge-site/`.
4. Verify the exact deployed tote in ordinary desktop/mobile, normal ChatGPT
   desktop and native Chrome WebMCP.
5. Separately decide whether to deploy KORRHAUS at zero traffic. The challenge
   tote does not depend on this decision.
6. Felix records and uploads the mandatory video, completes entrant/IP
   attestations, and separately approves Devpost submission.
