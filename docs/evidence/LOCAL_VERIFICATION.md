# Local verification evidence

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

Browser details, counters, limitations, and screenshots are in `ACTUAL_BROWSER_REVIEW_UI.md`; the visual comparison is in the repository-root `design-qa.md`.

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
and no CoDesign script, review host, WebMCP tools, or console errors. The
feature-enabled private full-suite rerun remains pending.

Evidence commit `aeba23e` was cloned without local-object shortcuts into
`/private/tmp/codesign-final-hardened.bpqpg0/repo`. The fresh clone installed
129 packages and passed 95 tests, strict typecheck, all three builds, bundle
verification, the 103-file public-boundary check, the 37-file documentation
check, and the eval policy/scorer check. Both bundle hashes matched and the
final clean-clone Git status was empty. Full detail is in
`FINAL_BROWSER_SAFETY_QA.md` and `FINAL_LOCAL_CONTRACT_QA.md`.
