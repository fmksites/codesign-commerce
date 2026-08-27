# Judge-site release evidence

## Current topology correction — 27 August 2026

The active release topology is one English landing, one internal `/tote/`
portability demo, and metadata-bound links to the real KORRHAUS Shopify
Designer. The synthetic `/korrhaus/` configurator described below has been
retired from the package and artifact.

The correction was verified locally on the working tree above base commit
`6cdad175e035756b15b85f11e6f42dc380101f91`. This is not yet an immutable
release commit or clean-clone result.

| Gate | Result |
|---|---|
| `npm ci` | PASS — 128 packages |
| `npm test` | PASS — 95 tests across 8 files |
| `npm run typecheck` | PASS — core, core tests, and studio tote |
| `npm run build` | PASS — core, studio tote, and root-plus-tote judge artifact |
| `npm run verify:browser-bundle` | PASS — `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324` |
| `npm run check:judge-site` | PASS — no synthetic route, metadata-bound flagship links, tote bundle and release metadata |
| `npm run check:public-boundary` | PASS — 108 current public candidates |
| `npm run check:docs` | PASS — 41 current Markdown files |
| `npm run check:evals` | PASS — 24-case corpus plus scorer self-test; no model run claimed |

Current fail-closed behavior also passed:

- a normal non-release build withheld repository and flagship URLs even when
  valid-looking release environment variables and the verification flag were
  injected;
- generated non-release metadata remained `repositoryUrl: null`,
  `flagshipUrl: null`, `releaseBuild: false`, and `flagshipVerified: false`;
- a release build requires a clean working tree, the exact repository and
  Shopify URLs, and `CODESIGN_FLAGSHIP_VERIFIED=true`; a successful current
  release build remains pending until the guarded KORRHAUS route is live and
  verified;
- the generated artifact contains ten files under `/` and `/tote/` only;
- root and tote returned HTTP `200`, while the retired `/korrhaus/` path returned
  `404`;
- no QA tag, Cloud Run candidate URL, `/korrhaus/` asset path, or synthetic
  KORRHAUS-reference label remained in the artifact; and
- all three rendered KORRHAUS CTA slots remained disabled rather than exposing
  an unverified destination.

The corrected landing rendered at 1280 × 720 and 390 × 844 with all four images
loaded, no horizontal overflow, and a clean browser console. The tote loaded at
`/tote/?reset=true`, exposed exactly the five intended CoDesign tools, and
completed the five-tool portability flow. It rejected an invalid intermediate
quantity-only change atomically, then staged two 50-unit variants, validated a
coherent draft with final artwork still required, and human-Reverted to the
exact one-variant `tote-revision-1` baseline. Every proposal result reported
`persisted: false`; the console remained clean. A fresh immutable commit, clean
clone, hosted CI, and public deployment remain separate gates.

## Superseded historical candidate

The remainder of this document records the immutable `10a02ee` development
artifact as history. It is not the current release candidate and must not be
deployed or presented as the challenge topology.

Date: 27 August 2026
Implementation commit: `10a02ee40e1f6310157aaf925e4097e3faa75a69`
Package: `@codesign-commerce/core` `v0.1.0`
Browser bundle: `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`

## Gap closed

The execution plan requires one anonymous English judge landing that links the
KORRHAUS reference, studio-tote portability example, live flagship, repository,
judge guide, exact prompts, browser guidance, reset controls, package version,
commit, and unsupported-browser fallback. The two configurators existed, but
that landing and a single deployable artifact did not.

Commit `10a02ee` adds:

- a responsive editorial landing under `judge-site/`;
- package version `0.1.0` and exact build metadata;
- relative production asset paths for both existing configurators;
- one assembled `dist/judge-site/` output with `/`, `/korrhaus/`, and `/tote/`;
- a dependency-free local preview command;
- a deterministic assembled-site verifier in local and hosted CI; and
- a fail-closed release builder that requires verified HTTPS repository and
  flagship URLs before publication.

The local build intentionally leaves the repository, judge-guide, and live-
flagship links visibly disabled. `npm run build:release` failed as expected
without both URLs and passed with synthetic HTTPS URLs during verifier QA. No
synthetic URL is retained in the final local artifact.

## Clean-clone result

The implementation commit was cloned without local-object shortcuts into
`/private/tmp/codesign-judge-site.ZaeCJC/repo`. From an empty dependency and
build state:

| Gate | Result |
|---|---|
| `npm ci` | PASS — 129 packages |
| `npm test` | PASS — 95 tests across 8 files |
| `npm run typecheck` | PASS — core and both examples |
| `npm run build` | PASS — core, both examples, and assembled judge site |
| `npm run verify:browser-bundle` | PASS — exact digest above |
| `npm run check:judge-site` | PASS — version, commit, digest, links, subpaths, and assets |
| `npm run check:public-boundary` | PASS — 110 public candidates before this evidence file |
| `npm run check:docs` | PASS — 37 Markdown files before this evidence file |
| `npm run check:evals` | PASS — 24-case policy and scorer self-test only |
| Final clean-clone Git status | PASS — empty |

The assembled artifact contains 18 files. The unoptimized total is 5.8 MB,
primarily the three owned tote product PNGs; only the active product asset is
loaded by each page.

## Exact artifact identifiers

| Artifact | SHA-256 |
|---|---|
| Landing HTML | `08e7d15ec1e35428cd2f06bb62fcc727b66a8ed353df5260399230f00df3ad03` |
| Landing CSS | `aa2ccb9b180fd0f1cad5ba1da07d84a61df1e64b418bceb0891379a4bb5a7d39` |
| Landing JavaScript | `8febc08f0229d4649977d15008cb8cd30f095c270c5a1808712387af768e34df` |
| Local metadata | `431f4bf40b0c4690803190c70adfb00b81760708ffbd04189a67594f11846ca4` |
| KORRHAUS app JavaScript | `b15154380970ae515abaa7a2a39846cac6494dee5169a5266f6298080f5b8a6b` |
| Tote app JavaScript | `95421603285b0c9dd1048fd18202a6635b0649e846c34d8a2b90d2ac8eae7cfa` |

## Actual supported-browser verification

The exact clean-clone artifact was served through the repository's documented
preview command and opened in the WebMCP-capable in-app browser.

Landing result:

- package `0.1.0`, commit `10a02ee40e1f`, and bundle `e3f95e6e51bb6b60`
  were visible;
- all four product images loaded;
- the Site-tools status correctly reported support;
- pending external links were disabled rather than pointing at placeholders;
- the KORRHAUS and tote reset links were relative and functional;
- desktop and 390 × 844 mobile layouts had no horizontal overflow; and
- the browser console contained no warnings or errors.

KORRHAUS subpath result:

- exactly five tools were discovered;
- review controls were hidden on `reference-revision-1` before proposal;
- the 60/60 North Form proposal and colourway creation returned
  `persisted: false`;
- validation was coherent and not production-ready because
  `FINAL_LOGO_ARTWORK_REQUIRED` remained;
- both human Keep and Revert controls appeared; and
- human Revert restored one `Design 1`, exact `reference-revision-1`, and no
  pending proposal with a clean console.

Tote subpath result:

- exactly five tools were discovered;
- review controls were hidden on `tote-revision-1` before proposal;
- the 50/50 natural and charcoal variants returned `persisted: false`;
- validation was coherent and not production-ready because
  `FINAL_PRINT_ARTWORK_REQUIRED` remained;
- the charcoal short-handle preview loaded with the intended visual treatment;
  and
- human Revert restored one `Canvas tote`, exact `tote-revision-1`, and no
  pending proposal with a clean console.

## Visual evidence

- [Desktop judge landing](./screenshots/judge-landing-desktop.png)
- [Mobile judge landing](./screenshots/judge-landing-mobile.png)

## Boundary

This is a local, immutable release candidate. It does not prove or authorize a
public repository, hosted URL, KORRHAUS deployment, production traffic, video
publication, or Devpost submission.
