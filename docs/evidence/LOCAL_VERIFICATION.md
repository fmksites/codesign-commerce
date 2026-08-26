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
