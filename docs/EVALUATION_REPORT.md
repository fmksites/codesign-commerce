# Evaluation report

**Current local evidence date:** 28 August 2026

This report distinguishes deterministic tests, direct native-tool execution,
actual agent-browser evidence, clean-clone reproducibility and still-pending
release checks. None is used as a substitute for another.

## Public core and tote

The newest unreleased local repair candidate is based on commit
`8a5d3e175d5977d8689fb22d779d3dc592b4af3e`. Its working-tree changes are not
yet an immutable commit or public release:

- `npm ci --offline` completed from a fresh `--no-local` clone and reported
  zero dependency vulnerabilities.
- 20 test files / 180 tests passed.
- Strict TypeScript checks passed for the core and studio tote.
- The package, browser bundle, tote and combined judge artifact built.
- The public-boundary check passed for 216 public candidates.
- Documentation links passed for 73 files.
- The 25-case corpus across six categories and its synthetic scorer self-test
  passed structural validation.
- Tote parity accounted for all 25 human surfaces: 14 manifest controls, four
  variant operations, one asset slot and six legitimate exclusions.
- The judge artifact bound package `0.1.0`, browser bundle
  `sha256:03c98c4be01c9928dfd70b119d2567061ca30cdf6d4a4d1195c3bb1d429becc0`
  and tote application bundle
  `sha256:dd3e5cfaa87fdc272ab9b0e7512881ce4c5730118ba784f0b9e3e25bd4d40d01`.

Deterministic coverage includes strict Manifest 2.0 validation; public-state
reconstruction; prototype/unknown-field rejection; atomic mixed operations;
revision and operation-ID conflict handling; cancellation; external-change
staleness; asset source/size/network policy; preview integrity; zero-write
Revert; exactly-once Keep and retry/uncertain outcomes; exact-six WebMCP schemas
and lifecycle; forbidden-action absence; complete tote controls; actual
artwork; variants; coupled production rules; responsive review UI; and
ordinary-browser fallback.

The current tote flow has also run in the Codex in-app browser with two named
variants, real supplied artwork, live merchant-renderer changes, distinct
revision-bound WebP previews, zero-write Revert and one page-owned Keep commit.
Native Chrome 151 discovered and executed the same exact-six contract, and the
exact immutable public release completed the North Form flow through the Codex
agent host. Those are actual runtime results. The later consumer ChatGPT
website run is separately recorded as blocked by that client's unavailable
webpage-tool surface; the ChatGPT desktop-app path remains untested.

The latest focused repair regression additionally passed exact initial-request
deduplication, changed-payload conflict, two-tab stale invalidation, Keep across
reload, truthful unsaved-reload recovery, narrow-rail review details, 390 px
mobile focus/target checks and an empty console. See
[`evidence/TOTE_TRANSACTION_REPAIR_QA_2026-08-28.md`](./evidence/TOTE_TRANSACTION_REPAIR_QA_2026-08-28.md).

The connected ordinary Chrome used for the final local smoke exposed no
`document.modelContext`. Historical Chrome 151 native proof remains valid for
its named older build, but is not substituted for a native-WebMCP pass on this
unreleased repair bundle.

## Private KORRHAUS integration

The exact-six Manifest 2.0 adapter is integrated locally into the existing
private Route 02 Designer at page asset version `20260827-16`. It consumes the
same public browser-bundle digest as the tote and maps more than 50 current
customer-editable controls plus four-colourway operations.

Final local evidence:

- changed integration/test files pass ESLint;
- 43 Vitest files / 220 tests pass;
- strict typecheck and production build pass;
- 8 active CoDesign V2 Playwright tests pass, with four intentional
  project/device skips;
- 6 localization regressions pass;
- the complete active Playwright suite passes 107 tests with five intentional
  device skips;
- a fresh desktop visual repeat creates two 60-pair colourways, changes the
  existing sock/grip/packaging proof, returns two distinct WebP previews and
  Reverts with zero writes;
- a supplied SVG remains temporary and imports/saves exactly once after page
  Keep;
- invalid, stale, ordinary-browser, mobile and autosave-isolation cases pass.

Full private lint still reports one unrelated pre-existing
`@typescript-eslint/no-explicit-any` issue in
`app/about-you/about-you.test.ts:76`. It is not a CoDesign failure and has not
been hidden or modified.

This KORRHAUS result is local only. No exact-six image or revision has been
deployed, production traffic is unchanged and the feature remains disabled by
default. Earlier five-tool zero-traffic revisions are historical evidence and
must not be promoted or called current.

## Optional model-evaluation tooling

The fixed corpus is `evals/cases.json`; thresholds are in
`evals/run-policy.json`; the evidence format is documented in
`evals/RESULTS_FORMAT.md`. Structural validation and scorer self-tests do not
execute a model and are not reported as model-selection success.

The owner removed the API-backed 78-run evaluation as a submission gate on 27
August 2026. No key or model spend is required. If separately authorized, an
actual run must identify the model, date, exact tool definitions, immutable
build, prompt, tool calls, arguments and classification, then score with:

```bash
npm run score:evals -- path/to/actual-results.json
```

No result file will be fabricated from direct scripted calls or synthetic
fixtures.

## Remaining binding release checks

Before submission claims are final:

1. Publish the current local source to the public repository after approval and
   verify anonymous clean-clone instructions and hosted CI on the exact commit.
2. Deploy the static landing plus tote after approval and verify the exact
   served hashes, links, headers, desktop/mobile ordinary UI and WebMCP tools.
3. Run each consumer client intended for a compatibility claim on that deployed
   build. The 28 August ChatGPT website run in ordinary Chrome is recorded as
   blocked by its unavailable webpage-tool surface; the separate ChatGPT
   desktop-app path remains untested and unclaimed.
4. Repeat the native Chrome WebMCP flow on the same deployed build.
5. Treat KORRHAUS zero-traffic deployment, production traffic and live-route
   verification as separate optional flagship gates; the tote release does not
   depend on them.

See [`BROWSER_SUPPORT.md`](./BROWSER_SUPPORT.md) and
[`evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md`](./evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md).
