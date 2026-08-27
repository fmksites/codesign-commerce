# CoDesign Commerce 2.0 pre-implementation baseline

Captured on 27 August 2026 after Felix explicitly authorized implementation in
the public challenge repository and before any CoDesign Commerce 2.0 source
change.

## Authority and isolation

- Public working repository: `/Users/felixkramer/Desktop/KORRHAUS WebMCP Challenge`
- Guarded branch: `codex/codesign-commerce-v2`
- Starting branch/revision: `main` at
  `e986e12b9448491c2e34b302c1c4ddcf12320047`
- Starting commit timestamp: `2026-08-27T16:19:25+02:00`
- Private KORRHAUS repository: not inspected or modified for this item
- Deployments, traffic, public publication, npm publication, and Devpost:
  not performed and not authorized by this milestone

The only pre-existing working-tree additions at branch creation were the
guided-build state and planning documents under `docs/hackathon-build/`. They
were preserved without resetting or discarding any file.

## Pre-existing implementation surface

The starting implementation is the earlier narrow prototype. It registers
exactly these five WebMCP tools:

1. `codesign_read_configuration`
2. `codesign_list_options`
3. `codesign_propose_configuration`
4. `codesign_create_design`
5. `codesign_validate_configuration`

Its manifest uses schema version `1.0` with order/design option groups. The
studio-tote example can render and review temporary multi-design proposals,
validate its current narrow option surface, and route Keep/Revert through the
existing review controller.

This is retained only as a technical baseline. It does not satisfy the revised
product because it lacks:

- Manifest 2.0 and an enforceable human-control parity inventory.
- The approved six-tool workspace/asset/preview contract.
- A writable supplied-artwork pathway and temporary asset handles.
- Position, scale, rotation, typography, and full creative-control parity.
- Per-variant preview artifacts bound to proposal revisions.
- Proven inline visual previews in ChatGPT.
- Proven native Chrome WebMCP execution for the revised contracts.
- The complete chat-confirmed page-Keep flow for the revised experience.

Historical evidence in this repository remains historical and must not be
presented as proof that the revised product already works.

## Toolchain and reproducible hashes

- Node: `v24.9.0`
- npm: `11.6.0`
- Package version: `0.1.0`
- Package-lock SHA-256:
  `5ecbde6f2a5ee1d2947665d8b48fb59b18b9835a45cffe00ad603c9f5ac376d6`
- Core browser bundle SHA-256:
  `e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`
- Studio-tote built entry SHA-256:
  `96d76d016a18ba84881ffd09ebee0672d19518a536eff60e883883a041e07193`
- Assembled judge-site entry SHA-256:
  `efb67d202026895a4be061e46fc4f8e4a8d73cc7386fafb6d9c89e32d546f052`

Build output is ignored and reproducible from the recorded source revision; it
is not committed as source evidence.

## Baseline verification

All commands ran from the guarded branch before any 2.0 implementation source
change.

| Command | Result |
|---|---|
| `npm test` | PASS - 8 files, 95 tests |
| `npm run typecheck` | PASS - core, tote, and strict core tests |
| `npm run build` | PASS - core ESM/types, Chrome 149 IIFE, tote, and judge site |
| `npm run check:public-boundary` | PASS - 118 public candidates |
| `npm run check:docs` | PASS - 50 Markdown files |
| `npm run check:judge-site` | PASS - revision and bundle hash matched |
| `npm run check:evals` | PASS - 24 cases across 6 categories; scorer self-test only |
| `git diff --check` | PASS |

These results prove a green local starting point. They do not prove the four
new feasibility gates, actual ChatGPT behavior, native Chrome WebMCP behavior,
deployed behavior, or KORRHAUS production safety.

## Next evidence gate

Item 2 must now add only the smallest removable public-tote proof needed to
test an actual inline ChatGPT preview and native Chrome `document.modelContext`
execution. Broader Manifest 2.0 and tote work remains blocked until Items 2
and 3 pass their actual-host gates.
