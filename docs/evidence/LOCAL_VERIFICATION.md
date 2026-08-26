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
