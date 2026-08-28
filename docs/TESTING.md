# Testing and evidence guide

## Deterministic local gates

Run from the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run verify:browser-bundle
npm run check:judge-site
npm run check:public-boundary
```

`npm run typecheck` checks both source and tests under strict TypeScript settings. The public-boundary check scans tracked and untracked public candidates while respecting `.gitignore`.

Current deterministic coverage includes:

- Manifest structural and semantic rejection.
- Prototype-pollution and unknown-field rejection.
- Atomic proposal batches.
- Committed and proposal revision checks.
- Successful-operation idempotency.
- Lost-response retry of the first successful operation without proposal
  identity, with changed-payload operation-ID conflict rejection.
- Operation-ID payload binding and cumulative proposal limits.
- Concurrent-operation serialization.
- Cancellation before and after preview begins.
- External-state invalidation before Keep.
- Cross-tab storage synchronization, visible stale recovery, and blocked Keep.
- Zero persistence on preview and Revert.
- Exactly one local and one server write on successful Keep.
- Keep persistence across reload after a deterministic reset entry, plus
  truthful discard/recreation guidance when reload happens before Keep.
- One local write across an expected failed server save and human retry.
- Unknown commit outcome fails closed and cannot Revert or retry automatically.
- Framework-neutral review states and human actions.
- Shadow-DOM review rendering, hidden-by-default activation, sanitized text, focus, and native Keep/Revert controls.
- WebMCP schemas, annotations, lifecycle unregistration, and runtime input checks.
- Exact six-tool registration with no Keep, Revert, save, quote, checkout,
  order, payment, customer-data, supplier-data, or merchant-storage import
  capability. Asset staging accepts only bounded session-local proposal inputs.
- Public option discovery with bounded option IDs and dependency descriptions.
- Atomic, idempotent second-design creation with maximum-design and clone-invariant guards.
- Standalone committed/proposal validation with accumulated proposal assumptions.
- Adapter detached reads, preview/restore behavior, commits, retries, and subscriptions.
- Studio-tote manifest portability, ordinary human persistence, coupled
  canvas/print constraints, typography and actual-artwork paths, ink/scale/
  rotation transforms, named variant selection, quantity-preserving variant
  creation, targeted one-variant refinement, zero-write Revert, and exactly-once
  Keep.
- Provider-neutral judge-site assembly, semantic package version, exact commit
  and browser-bundle metadata, a deterministic relative tote link, a
  metadata-bound HTTPS live-flagship link, subpath-safe assets, and an explicit
  assertion that no synthetic `/korrhaus/` configurator is shipped.

## Evidence strength

Different checks prove different things:

| Evidence | What it proves | What it does not prove |
|---|---|---|
| Unit/contract tests | Deterministic transaction logic | Real renderer, browser, storage, or network behavior |
| Strict typecheck/build | Source and test consistency | Runtime correctness |
| Clean clone | Reproducible local install/build | Hosted CI or live availability |
| Browser automation | Rendered UI and page behavior | Agent tool selection quality unless an agent runs |
| Storage/network trace | Autosave isolation on that build | Other builds or routes |
| Actual ChatGPT/Chrome run | Tool discovery and real interaction | Long-term site availability |

Never use a narrower green check to claim a broader gate.

## Required browser scenarios

Before the transaction vertical slice may pass:

1. A tool changes the visible preview.
2. Local-storage and network instrumentation record zero proposal writes.
3. Revert restores the exact prior rendered and canonical state with zero writes.
4. Keep records exactly one local write and one secure save.
5. Normal human editing still autosaves outside proposal mode.

Before submission-ready handoff:

- Discover exactly the intended six tools in every client named as supported.
  The deployed release passes in the Codex agent host and has historical native
  Chrome evidence. The new unreleased repair candidate must repeat native
  Chrome because the connected repair-test instance exposed no
  `document.modelContext`; the consumer ChatGPT website run remains recorded as
  blocked by that client's unavailable page-tool surface.
- Execute the North Form 120-pair/two-colourway scenario.
- Run negative prompts for ordering, quote acceptance, upload, customer data, pricing, margins, suppliers, arbitrary paths, and unsafe keys.
- Verify keyboard, focus, ARIA live status, mobile layout, reload, navigation, and browser-without-WebMCP fallback.
- Repeat critical proof against immutable build identifiers and record screenshots plus sanitized traces.

The final tote inventory must report all 25 shipped customer and review
surfaces accounted for: 14 manifest-control mappings, four variant-operation
mappings, one asset-slot mapping, and six explicit non-configurational or
human-confirmation exclusions.

The current public tote evidence is recorded in
[evidence/CODESIGN_V2_ITEM9_STUDIO_TOTE_2026-08-27.md](./evidence/CODESIGN_V2_ITEM9_STUDIO_TOTE_2026-08-27.md).
The current local exact-six KORRHAUS integration is recorded in
[evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md](./evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md).
All earlier five-tool KORRHAUS local, tagged-QA and zero-traffic documents are
historical only; none identifies a current deployable candidate.
The deployable landing-plus-tote artifact is verified in
[evidence/JUDGE_SITE_RELEASE_CANDIDATE.md](./evidence/JUDGE_SITE_RELEASE_CANDIDATE.md).
The older public-reference browser documents remain dated synthetic-harness
history, not an active submission surface.

The exact client/browser claim matrix and final-release repeats are tracked in
[BROWSER_SUPPORT.md](./BROWSER_SUPPORT.md).

## Optional agent evaluation corpus

`evals/cases.json` fixes 25 selection, end-to-end, ambiguity, safety,
adversarial-data, and recovery expectations across the live sock integration
and public tote example.
`evals/run-policy.json` fixes the coverage and pass thresholds, while
`evals/RESULTS_FORMAT.md` defines the evidence-bearing result format and scorer.
`npm run check:evals` validates the corpus, policy, template, and scorer with
synthetic fixtures; it does not execute an agent and must not be reported as an
evaluation pass. Score a real run with
`npm run score:evals -- path/to/actual-results.json`.

The owner removed the API-backed 78-run evaluation as a submission gate on 27
August 2026. No key or model spend is required for the current goal. If the
optional runner is authorized later, it must record model, date, exact tool
definitions, prompt, tool-call sequence, arguments, result classification, and
immutable build identifier. The retained thresholds then require zero
disallowed calls in critical safety cases and at least 9/10 correct selection
and valid arguments for core prompts. Separate operator rehearsals on the
frozen browser build remain part of video readiness but are not represented as
independent probabilistic evaluation.
