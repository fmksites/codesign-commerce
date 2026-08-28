# Local verification evidence

> Historical-record note: dated sections referring to a public KORRHAUS
> reference used a synthetic development harness retired from the active
> package and judge artifact on 27 August 2026. They are not live-flagship
> evidence.

## 26 August 2026 — public core clean clone

Source commit: `9ff2dfe` (`feat: add safe WebMCP proposal core`)

The repository was cloned with `git clone --no-local` into a new temporary directory. No existing `node_modules`, build output, or untracked workspace file was available to the clone.

Commands and outcomes:

| Command | Outcome |
|---|---|
| `npm ci` | PASS — 93 packages installed from the committed lockfile |
| `npm test` | PASS — 3 files, 19 tests |
| `npm run typecheck` | PASS — strict TypeScript project build |
| `npm run build` | PASS — `@codesign-commerce/core` compiled |
| `npm run check:public-boundary` | PASS — 30 tracked public candidates checked |

This proves local reproducibility for the source state at `9ff2dfe`. Hosted CI and later browser examples require separate evidence and must not be inferred from this result.

## 26 August 2026 — browser integration bundle clean clone

Source commit: `1e65f98` (`build: add verified browser integration bundle`)

A second `git clone --no-local` into a fresh temporary directory passed:

| Command | Outcome |
|---|---|
| `npm ci` | PASS — 120 packages installed from the committed lockfile |
| `npm test` | PASS — 5 files, 38 tests |
| `npm run typecheck` | PASS — source and tests checked strictly |
| `npm run build` | PASS — module and Chrome 149-targeted browser IIFE built |
| `npm run check:public-boundary` | PASS — 41 public candidates checked |
| `npm run check:docs` | PASS — 17 Markdown files checked |
| `npm run verify:browser-bundle` | PASS — required global API present and private markers absent |

Verified browser bundle digest:

`sha256:3d103e11996df8918bf752cf8356e53b6170206ed975313b45730f97fa2579c7`

The bundle is a build artifact and remains ignored by Git. It must be regenerated from the referenced source commit. This check does not prove real browser tool discovery or merchant-renderer integration.

## 26 August 2026 — accessible review surface and public KORRHAUS reference

Source commit: `98f347c` (`fix: typecheck reference from a clean clone`), containing review-surface commit `4898812`.

The repository was cloned with `git clone --no-local` into a new temporary directory after an initial clean-clone run exposed that the reference typecheck had accidentally relied on the core package's existing `dist/`. Commit `98f347c` maps the example typecheck to public core source. The second clean clone passed from an empty build state.

| Command or check | Outcome |
|---|---|
| `npm test` | PASS — 6 files, 44 tests |
| `npm run typecheck` | PASS — all workspaces plus strict core test project |
| `npm run build` | PASS — core module/browser bundles and Vite reference app |
| `npm run check:public-boundary` | PASS — 64 public candidates checked |
| `npm run check:docs` | PASS — 21 Markdown files checked |
| `npm run check:evals` | PASS — 20 corpus cases validated across 6 categories |
| `npm run verify:browser-bundle` | PASS — required global API present and private markers absent |
| Actual in-app browser tool discovery | PASS — two intended tools for this slice |
| Actual proposal preview | PASS — two colourways changed visibly, `persisted: false` |
| Revert persistence instrumentation | PASS — zero local writes, zero server writes |
| Keep persistence instrumentation | PASS — one local write, one server write, one commit |
| Native Chrome keyboard Revert | PASS — Enter restored baseline with zero writes |
| Desktop/mobile visual comparison | PASS — no unresolved P0, P1, or P2 issues |
| Browser console review | PASS — zero errors and zero warnings |
| Clean-clone working tree after all gates | PASS — empty `git status --short` |

Verified browser bundle digest:

`sha256:f4e5c0961e8d2289993ac5e228919d5cfc77cd6c0b6b1fa6b63f712ae9d3dd55`

Browser details, counters, limitations, and screenshots are in
`ACTUAL_BROWSER_REVIEW_UI.md`; the historical visual comparison is in
[`../archive/project-history/design-qa.md`](../archive/project-history/design-qa.md).

## 26 August 2026 — proposal-success visibility invariant and local flagship bridge

Source commit: `a79cdbb` (`fix: reveal review only after proposal succeeds`)

The shared review controller now remains hidden throughout initial proposal quiescence and becomes visible only after the proposal has been applied successfully. This directly enforces the owner-approved rule that normal page use and failed proposals must not reveal the agent review panel.

| Command or check | Outcome |
|---|---|
| `npm test` | PASS — 6 files, 45 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run check:public-boundary` | PASS — 65 tracked public candidates checked before adding this evidence file |
| `npm run check:docs` | PASS — 21 Markdown files before adding this evidence file |
| `npm run check:evals` | PASS — 20 corpus cases across 6 categories |
| `npm run verify:browser-bundle` | PASS |

Verified browser bundle digest:

`sha256:78ece1955a7416878c50a7f01325c702aa609974fb0cf816b1be3048e7f9819a`

The identical bundle was consumed by the approved local private KORRHAUS bridge. See `KORRHAUS_LOCAL_BRIDGE.md` for its independent actual-browser, persistence, regression, boundary, and hash evidence.

Evidence commit `f114581` was then cloned with `git clone --no-local` into `/private/tmp/codesign-commerce-clean.9Jftki`. From that clean clone:

| Command | Outcome |
|---|---|
| `npm ci` | PASS — 128 packages installed from the committed lockfile |
| `npm test` | PASS — 6 files, 45 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run check:public-boundary` | PASS — 66 tracked public candidates checked |
| `npm run check:docs` | PASS — 22 Markdown files checked |
| `npm run check:evals` | PASS — 20 cases across 6 categories |
| `npm run verify:browser-bundle` | PASS — digest matched `78ece195…9819a` |
| Clean-clone `git status --short` | PASS — empty |

This establishes clean-clone reproducibility for the public source and the committed Phase 3 evidence state. It still does not substitute for hosted CI or deployed-surface evidence.

## 26 August 2026 — complete public five-tool workflow

Source commit: `ea54e71` (`feat: complete five-tool configuration workflow`)

The core now registers exactly five tools, adds bounded option discovery, adapter-owned detached design cloning, atomic/idempotent second-colourway creation, standalone committed/proposal validation, accumulated assumptions, and explicit human-confirmation metadata. The public KORRHAUS reference starts with one 120-pair design so the judge scenario must genuinely create the second colourway.

Local source gates passed with 54 tests and browser bundle `sha256:3723b4937086323c1536406f2072efbd54da702ec63d7c2f94d32ea768f101f6`. The full actual-browser call sequence, outputs, Revert result, responsive correction, and screenshots are recorded in `NORTH_FORM_FIVE_TOOL.md`.

Evidence commit `37682a2` was cloned with `git clone --no-local` into
`/private/tmp/codesign-five-tool-clean.NbzukR`. The clone had no access to the
working repository's dependencies, ignored build output, or untracked files.

| Command or check | Outcome |
|---|---|
| `npm ci` | PASS — 128 packages installed from the committed lockfile |
| `npm test` | PASS — 7 files, 54 tests |
| `npm run typecheck` | PASS — workspaces and strict core test project |
| `npm run build` | PASS — core module/browser bundles and public reference |
| `npm run check:public-boundary` | PASS — 69 tracked public candidates checked |
| `npm run check:docs` | PASS — 23 Markdown files checked |
| `npm run check:evals` | PASS — 20 cases across 6 categories |
| `npm run verify:browser-bundle` | PASS — digest matched `3723b493…f101f6` |
| Clean-clone `git status --short` | PASS — empty |

This establishes clean-clone reproducibility for the complete public five-tool
workflow and its recorded browser evidence. Hosted CI, a public remote, and a
deployed judge surface remain separate approval-gated evidence.

## 26 August 2026 — private KORRHAUS five-tool flagship

The approved local, disabled-by-default private bridge consumed the public
bundle from commit `ea54e71` and completed the same five-tool North Form flow.
The private typecheck, production build, 12 focused page tests, focused
desktop/mobile five-tool E2E, and complete 96-case Designer E2E all passed; the
full result was 95 passed and 1 intentionally skipped.

The actual WebMCP-capable in-app browser independently discovered exactly five
tools on the private page. Before a successful proposal the review panel and
its controls were not visible. The browser then created two temporary 60-pair
colourways, reported the missing final artwork, exposed Keep/Revert, and
confirmed that the committed read remained the original one-design 20-pair
baseline with `persisted: false`. Selecting Revert restored that exact
revision and removed the proposed second colourway.

The full outputs, persistence assertions, source hashes, recovery observation,
and screenshot are recorded in `KORRHAUS_LOCAL_FIVE_TOOL.md`.

## 26 August 2026 — studio-tote portability clean clone

Implementation commit `9ab806c` adds a materially different studio-tote
manifest, adapter, renderer, real product assets, coupled rules, deterministic
tests, browser evidence, and four tote eval cases without changing the core.

The first fresh clone exposed a package-resolution dependency on a locally
prebuilt core `dist/` and failed. Commit `13a168d` fixed that by resolving
workspace tests directly to public source. A new clone at
`/private/tmp/codesign-tote-clean-final.9zavVo/repo` then passed from an empty
build state:

| Command or check | Outcome |
|---|---|
| `npm ci` | PASS — 129 packages installed from the committed lockfile |
| `npm test` | PASS — 7 files, 62 tests |
| `npm run typecheck` | PASS — all workspaces and strict core tests |
| `npm run build` | PASS — core module/browser bundles plus both examples |
| `npm run check:public-boundary` | PASS — 88 tracked public candidates |
| `npm run check:docs` | PASS — 27 Markdown files |
| `npm run check:evals` | PASS — 24 cases across 6 categories |
| `npm run verify:browser-bundle` | PASS — digest `3723b493…f101f6` unchanged |
| Clean-clone `git status --short` | PASS — empty |

Actual-browser option discovery, five-tool proposal/creation/validation,
zero-write Revert, coupled-rule failure, human editing, responsive comparison,
and console evidence are in `STUDIO_TOTE_PORTABILITY.md`.

## 26 August 2026 — anonymous judge walkthrough

Commit `b3a7634` aligns the KORRHAUS development preview with the exact North
Form brief, documents deterministic `?reset=true` entry points for both public
examples, and adds the complete two-demo judge walkthrough and safety prompts.

The root gate passed with 62 tests, strict typecheck, core and both public
example builds, unchanged verified browser bundle
`sha256:3723b4937086323c1536406f2072efbd54da702ec63d7c2f94d32ea768f101f6`,
89 public candidates, 28 Markdown files, and 24 eval cases. The actual
WebMCP-capable in-app browser independently opened the KORRHAUS reset URL,
showed the one-design baseline with no review controls, and exposed exactly the
five intended tools.

## 26 August 2026 — security remediation clean clone

The complete repository scan at `37b7dbc` reported two low-severity findings:
runtime adapter output was not reconstructed at the public boundary, and an
external revision during asynchronous proposal application could remain
eligible for Keep. Remediation commit `2f7235b` fixes both and adds operation-ID
payload binding plus cumulative proposal limits.

A fresh `git clone --no-local` at
`/private/tmp/codesign-security-clean.h0S6SB/repo` passed `npm ci`, 73 tests,
strict typecheck, the core and both example builds, the 91-file public-boundary
scan, the 28-file documentation check, the 24-case eval-corpus structural
check, browser-bundle verification, and an empty final status. The reproducible
bundle is
`sha256:dc8d6180ba6bcdd426d735abe7dc73a8854559b05950b91936f57ee10d33ee1b`.

The same bytes were pinned into the approved local private KORRHAUS bridge.
Thirteen focused page tests, private typecheck, and private production build
passed. An actual WebMCP-capable in-app-browser run confirmed five tools,
hidden pre-proposal review UI, a visible zero-write proposal, conflict rejection
for a reused operation ID, exact Revert to `korrhaus-e7beb274`, and no console
errors or warnings. Full detail is in `SECURITY_HARDENING.md`.

## 27 August 2026 — final contract limits and eval evidence tooling

Public source commit `c47cee0` adds bounded dependency references, option/value
collection limits, kind-specific manifest validation, the combined assumption
limit, cancellation/concurrency/hostile-input coverage, and an evidence-grade
model-eval result format and scorer.

The public workspace passed 90 tests, strict typecheck, all builds, the
public-boundary check, documentation-link check, 24-case eval corpus/policy
validation, scorer self-test, and whitespace check. The browser bundle is
`sha256:3ba5118ec8b4b4627a4cf09c180abff1acd394defe77b7414b83b2657c15f6db`.

The bundle was then pinned into the approved local private KORRHAUS bridge. Its
13 focused tests, typecheck, and production build pass. The actual in-app
browser found exactly five tools, confirmed dependency option references and
hidden pre-proposal review UI, completed the two-colourway temporary proposal,
and human-Reverted to the exact fresh-origin `korrhaus-8a39d439` baseline with
zero proposal/Revert server requests and a clean console. Full detail is in
`FINAL_LOCAL_CONTRACT_QA.md`.

Evidence commit `25e24a3` was then cloned without local-object shortcuts into
`/private/tmp/codesign-final-clean.HDp0ka/repo`. The fresh clone installed 129
packages and passed 90 tests, strict typecheck, all builds, bundle verification,
the 102-file boundary check, the 36-file documentation check, and the eval
policy/scorer check. The bundle hash matched `3ba5118e…f6db` and final Git status
was empty.

## 27 August 2026 — final external-reference and fallback hardening

An actual-browser negative call found that a URL-shaped text value could be
staged temporarily despite the documented external-reference boundary. Commit
`6fc7926` closes the mismatch before adapter access and adds five regression
cases. The resulting public suite passes 95 tests.

The exact production-built public bundle
`sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`
then passed actual-browser URL rejection, stale revision, pending proposal,
operation-ID conflict, stale proposal revision, human Revert, clean-console,
and page-navigation cleanup checks. Both public examples also smoke-tested the
normal temporary-proposal/Revert path against these bytes.

The same bundle was pinned locally into the disabled-by-default private bridge
as `codesign-commerce.js?v=e3f95e6e`. Thirteen focused page tests, private
typecheck, and private production build passed. With the feature flag explicitly
off, an actual browser found the normal KORRHAUS route, eight route controls,
and no CoDesign script, review host, WebMCP tools, or console errors.

The current byte-exact feature-enabled private bridge then passed the complete
Designer Playwright suite with 95 passes and one intentional desktop skip of a
mobile-only case. In the actual WebMCP-capable browser it exposed five tools,
kept review hidden until a successful proposal, staged two 60-pair North Form
colourways without persistence, reported the missing final artwork, and
human-Reverted to exact committed revision `korrhaus-8bbd9b55` with no pending
proposal, proposal/Revert server writes, or console output.

The frozen public KORRHAUS artifact also passed five consecutive
operator-driven North Form rehearsals. Each run returned `persisted: false`,
showed both colourways and human Keep/Revert, and restored exact baseline
`reference-revision-1`. These calls verify runtime repeatability and are not
represented as independent model-selection results.

Evidence commit `aeba23e` was cloned without local-object shortcuts into
`/private/tmp/codesign-final-hardened.bpqpg0/repo`. The fresh clone installed
129 packages and passed 95 tests, strict typecheck, all three builds, bundle
verification, the 103-file public-boundary check, the 37-file documentation
check, and the eval policy/scorer check. Both bundle hashes matched and the
final clean-clone Git status was empty. Full detail is in
`FINAL_BROWSER_SAFETY_QA.md` and `FINAL_LOCAL_CONTRACT_QA.md`.

## 27 August 2026 — submission-evidence clean clone

Submission-evidence commit `8d3b5dd35310dbbba34f69e323225215d154507f`
was cloned with `git clone --no-local` into
`/private/tmp/codesign-submission-ready.bQtJht/repo`. Starting without
dependencies or build output, it installed 129 packages and passed 95 tests,
strict typecheck, all three builds, exact browser-bundle verification, the
103-file public-boundary check, 37-file documentation check, and optional eval
policy/scorer self-test. The rebuilt browser bundle matched
`sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`.
The final clone status was empty.

## 27 August 2026 — provider-neutral judge-site clean clone

Implementation commit `10a02ee40e1f6310157aaf925e4097e3faa75a69` was
cloned without local-object shortcuts into
`/private/tmp/codesign-judge-site.ZaeCJC/repo`. From an empty state the clone
installed 129 packages, passed 95 tests, strict typecheck, the core and both
example builds, the new assembled judge-site build/verifier, exact browser-
bundle verification, the 110-file public-boundary check, the 37-file docs
check, the optional eval policy/scorer self-test, and an empty final status.

The exact clean-clone artifact displayed package `0.1.0`, commit `10a02ee40e1f`,
and bundle `e3f95e6e51bb6b60` in the actual WebMCP-capable browser. Its desktop
and 390 × 844 mobile landing layouts loaded all imagery without overflow or
console output. Both same-origin configurator subpaths discovered five tools,
completed their full two-design proposal and validation flows with
`persisted: false`, exposed human Keep/Revert, and Reverted to their exact
baselines. Full evidence is in `JUDGE_SITE_RELEASE_CANDIDATE.md`.

## 27 August 2026 — final guarded private candidate

After the older zero-traffic candidate and an intermediate guarded snapshot
were superseded, the final merged integration retained the unchanged public
CoDesign core bundle and passed:

- JavaScript syntax and focused ESLint;
- private production build and strict typecheck;
- 40 Vitest files and 194 tests;
- the exact focused WebMCP desktop/mobile slice, 18/18; and
- the complete 138-case Playwright run with 137 passes, one expected skip, and
  zero failures.

The final private Designer source is
`sha256:41e49ee9d3a26e1cc7112f7f6279262b20d8524172ed2a2f947e7fbb2abc6688`;
its rebuilt minified asset is
`sha256:1d1f53c9447bcdf0bf15a244224d188432d5593c7583f313bb3d47b10272b970`;
the source and minified CSS hashes are respectively
`sha256:709ed9481889cd93ab57b94e5d6ad333e2af9b8248b800b19165389fd915c3b9`
and
`sha256:d044d25feb31bf4419824071542dbae6730d304b7921652a3cd646e2829c9e57`;
and both Designer asset URLs use cache key `v=20260827-8`. The embedded public
core remains
`sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`.

Cloud Build `4d51ae1b-5594-4e18-8696-16f27da8cdf8` produced immutable image
`sha256:aa9c591b5efbe945d68cb1edbfd5b7c39ab5bc524b041b82d3bc7682bdcb5c4e`.
Tagged acceptance revision `codesign-qa3` passed the exact five-tool in-app
browser flow, and fixtures-off candidate `codesign-prod2` passed its
zero-traffic health, HTTP, exact-asset, and log checks from the same digest.
Ordinary traffic remains `100%` on feature-off `sock-logo-v2`; the public
Shopify route is not yet claimed as WebMCP-live. Full evidence is in
`KORRHAUS_GUARDED_LOCAL_CANDIDATE.md` and
`KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md`.

## 27 August 2026 — read-only colourway review candidate

The owner requested one additional UX gate before production: a person must be
able to inspect both proposed colourways in the same live renderer without
unlocking any mutation or persistence path. The corrected `20260827-10`
snapshot passed syntax, focused ESLint, 41 Vitest files/199 tests, strict
typecheck, production build, and the complete 142-case Playwright run with 141
passes, one expected desktop-only skip, and zero failures.

Cloud Build `2985b639-7524-4a09-85ac-f367b78865e7` produced immutable image
`sha256:1819173fc2bbc57cf778a0c9ad4d8361f3aa1072b10fb978c67a9973bb7d9e3c`.
Zero-traffic revision `codesign-review-qa2` serves the exact locally tested
minified JavaScript hash
`sha256:160aa32869721b5893be3a960c78d4c3f625d21f3556032c0d17a77807df0c2c`.

On the fresh `codesign-user-qa` origin, the actual in-app WebMCP browser read
one design/20 pairs, listed eight public option groups, proposed Cream, created
Rose, allocated 2 × 60, and validated the proposal with only final artwork
missing. Both tab switches changed the visible proof, retained `Temporary
proposal not saved`, and kept all mutation/upload controls disabled. A fresh
read still returned the unchanged one-design/20-pair committed state and an
`awaiting-human`, `persisted: false` proposal. The console was clean. Full
evidence is in `KORRHAUS_READ_ONLY_COLOURWAY_QA.md`.

The earlier `codesign-prod2` image is historical and must not be promoted. A
new fixtures-off candidate from exact image `181917…d9e3c` remains gated on
owner hands-on QA. Ordinary traffic remains `100%` on feature-off
`sock-logo-v2`.

## 27 August 2026 — corrected flagship topology clean clone

Commit `e137a3be4333aaded523626df493a6e38dd24a72` removes the retired synthetic
Sock Designer from the active repository and judge artifact. The resulting
topology contains one root judge landing, the studio tote at `/tote/`, and
release-gated links to the existing KORRHAUS Shopify Designer.

The commit was cloned with `git clone --no-local` into
`/private/tmp/codesign-topology.mseDWn/repo`. Starting without dependencies or
build output, the clone installed 128 packages and passed 95 tests across 8
files, strict typecheck, all builds, exact browser-bundle verification, the
108-candidate public-boundary check, 41-file documentation check, judge-site
check, 24-case eval policy/scorer self-test, `git diff --check`, and an empty
final Git status.

The rebuilt bundle matched
`sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`.
Generated metadata named the exact commit and correctly withheld both release
URLs with `releaseBuild: false` and `flagshipVerified: false`. This proves local
reproducibility; public push, hosted CI, KORRHAUS deployment, production
promotion, and judge-site hosting remain separately evidenced gates.
