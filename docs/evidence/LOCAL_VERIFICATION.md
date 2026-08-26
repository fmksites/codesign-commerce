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
