# Studio tote final control and recovery QA

**Date:** 28 August 2026  
**Implementation candidate:** `a8a734044f24524776b767c1b005d7a8db087de1`

**Verified public release:** `1150c40703816f3729ec9f8de6f93db9e172a5e1`

**Immutable release:** <https://26193628.codesign-commerce.pages.dev/>

**Core WebMCP browser bundle:**
`sha256:0bcf250f6d61bec30988840f338a16c521b8b72eb3b10b4d367d6c0601b4fcde`

**Tote application bundle:**
`sha256:c6fd8b068c94d3ab521e83132b1670e53e5031950a949d2244a56c652c2da0eb`

**Release state:** public and verified

## Why this checkpoint exists

The first public release proved the exact-six WebMCP flow, but final product QA
needed to answer a stricter question: can an agent control every supported tote
customization, receive useful production-rule failures, recover safely, and
leave persistence under visible human control?

This checkpoint combines an exact deployed journey, a broad deployed control
matrix, fixes for the two defects found by that matrix, an independent local
Codex-task regression, ordinary Chrome testing, and a clean-clone release run.

## Exact deployed North Form journey

An existing Codex task operated the deployed tote through its webpage tools and
created the requested temporary 100-unit workspace:

- `North Form Natural`: 50 units, natural 12 oz canvas, long handles,
  reinforced, supplied artwork centered in black at 105 percent and 0 degrees.
- `North Form Charcoal`: 50 units, charcoal 12 oz canvas, short handles,
  reinforced, supplied artwork upper-left in white at 82 percent and -6
  degrees.
- Two distinct renderer-generated 640 by 640 WebP previews were returned to the
  agent conversation and visually inspected.
- Production validation returned ready.
- `persisted` remained false and the committed baseline remained unchanged.
- No Keep, save, order, quote, cart, checkout, payment or other commercial tool
  was exposed.

## Exhaustive deployed control and safety matrix

The same task exercised the release beyond the happy path:

- all 23 ordinary human mutation controls were disabled while a proposal was
  open;
- all material weights, colours, handles, reinforcement choices, typography,
  print methods, placements, ink colours, scale and rotation limits;
- variant duplicate, remove and active-variant operations through the maximum
  of three variants;
- unknown control, invalid enum, out-of-range transform, stale revision, fourth
  variant and unsupported-asset rejection;
- atomic failure: every rejected request retained the previous valid revision
  and caused zero persistence writes;
- exact final state restoration with `persisted: false`.

The matrix found two real contract defects:

1. Coupled product-rule failures returned only a generic `INVALID_VALUE`
   result, without the rule-specific issue needed for agent recovery.
2. The 80-operation safety budget was cumulative for the entire proposal, so a
   valid later refinement could fail after earlier successful batches.

## Candidate fixes

Commit `1c8bcb5d35d6fc14bb7542df175cbcb26824e9be` made the visible production
readiness panel use the same coupled validation rules as the agent contract.

Commit `a8a734044f24524776b767c1b005d7a8db087de1` then:

- retained an 80-operation maximum per tool call;
- introduced an explicit 240-successful-operation proposal-session ceiling;
- advertised both limits through read and capability results;
- returned sanitized rule-specific validation issues while preserving atomic
  rejection;
- added deterministic regression coverage for both behaviors.

The visible page and tool response now identify these rule codes when relevant:

- `EMBROIDERY_REQUIRES_SUBSTANTIAL_CANVAS`
- `EXTRA_HEAVY_REQUIRES_REINFORCEMENT`
- `TWO_COLOUR_PRINT_MINIMUM`
- `QUANTITY_TOTAL_MISMATCH`

## Independent local Codex-task regression

The existing Codex task repeated the focused checks against
`http://127.0.0.1:5174/?reset=true`:

- read and capability tools advertised `80` per batch and `240` per proposal;
- all four coupled-rule cases returned their rule-specific issue/control IDs;
- every invalid request retained the prior valid revision and `persisted:
  false`;
- a fresh 30-operation batch succeeded;
- a later two-operation refinement also succeeded;
- exactly six tools were present and no persistence or commerce tool appeared.

## Ordinary Chrome coverage

Chrome was tested independently as a normal shopper browser on the deployed
and local tote:

- every option family and transform boundary changed the shared visual canvas;
- a real PNG rendered on the product;
- two and three-variant workspaces, active-variant switching and the maximum
  variant guard worked;
- unsupported SVG and over-limit image inputs were visibly rejected;
- local persistence survived navigation when `reset=true` was absent;
- the 390 by 844 layout had no document-level horizontal overflow;
- the visible coupled production-rule messages passed on the local candidate;
- no browser-console errors were observed.

After Chrome's official `enable-webmcp-testing` flag was enabled and Chrome was
relaunched, the current source passed its native main-world proof through
`document.modelContext.getTools()` and `executeTool()`:

- Chrome 151 discovered the exact six names;
- a temporary proposal produced a visible 640 by 640 WebP;
- the real 214,745-byte North Form PNG staged through
  `codesign_stage_asset`, rendered on the tote, and produced a distinct preview;
- all proposal, preview and asset results remained temporary;
- local writes, server-simulation writes, imports and commits all remained zero;
- no browser-console warnings or errors occurred.

The browser-control inspection realm does not expose nonstandard page globals,
so native execution was measured by the page's development-only main-world
proof harness rather than inferred from `evaluate()`. The exact immutable
public release was independently exercised through the Codex agent host as
described below. A literal consumer ChatGPT conversation remains separate.

## Exact clean-clone verification

A `--no-local` clone of `a8a734044f24524776b767c1b005d7a8db087de1`
was installed and tested in an isolated temporary directory:

| Check | Result |
| --- | --- |
| `npm ci --offline` | PASS — 128 packages, 0 reported vulnerabilities |
| `npm run build:release` | PASS with the required public repository URL |
| `npm test` | PASS — 20 files / 177 tests |
| `npm run typecheck` | PASS |
| `npm run verify:browser-bundle` | PASS |
| `npm run check:judge-site` | PASS |
| `npm run check:public-boundary` | PASS — 175 candidates |
| `npm run check:docs` | PASS — 69 files before this evidence note |
| `npm run check:evals` | PASS — 25 cases / 6 categories plus scorer self-test |
| `npm run check:parity` | PASS — 25/25 tote surfaces |

The first release-build invocation intentionally failed because the required
`CODESIGN_PUBLIC_REPOSITORY_URL` was omitted. Supplying the documented release
variable produced the passing release artifact above.

## Honest release boundary

## Final public release regression

Felix approved public publication. GitHub `main`, stable Cloudflare Pages and
the immutable deployment were first advanced to the corrected candidate. The
release regression then found an evidence defect: metadata named the reusable
core bundle digest, while only the separately bundled Vite application file was
publicly fetchable.

Commit `1150c40703816f3729ec9f8de6f93db9e172a5e1` fixed that boundary by
publishing and clearly labelling both files. Stable and immutable downloads now
independently match metadata:

| Published artifact | SHA-256 |
| --- | --- |
| `assets/codesign-commerce.js` | `0bcf250f6d61bec30988840f338a16c521b8b72eb3b10b4d367d6c0601b4fcde` |
| `tote/assets/index-B_RMWorF.js` | `c6fd8b068c94d3ab521e83132b1670e53e5031950a949d2244a56c652c2da0eb` |

An exact clean clone of that release passed 20 files / 177 tests, strict
typecheck, release build, browser-bundle, judge-site, public-boundary,
documentation, eval and 25/25 parity checks with zero reported dependency
vulnerabilities. Public GitHub CI also passed.

The final immutable agent journey recreated both exact 50-unit North Form
variants, returned two real 640 by 640 previews, validated configuration and
production readiness, advertised limits 80/240, and exposed exactly six tools.
An invalid embroidery-on-8-oz request returned
`EMBROIDERY_REQUIRES_SUBSTANTIAL_CANVAS` while revision 3 remained valid and
unchanged. The isolated proposal was discarded without Keep or a persistence
write.

The engineering release is ready for submission use. The literal consumer
ChatGPT run, public video, legal attestations and final Devpost submission
remain participant-owned gates.
