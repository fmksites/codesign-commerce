# Provider-neutral judge-site release candidate

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
