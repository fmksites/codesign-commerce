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
- Operation-ID payload binding and cumulative proposal limits.
- Concurrent-operation serialization.
- Cancellation before and after preview begins.
- External-state invalidation before Keep.
- Zero persistence on preview and Revert.
- Exactly one local and one server write on successful Keep.
- One local write across an expected failed server save and human retry.
- Unknown commit outcome fails closed and cannot Revert or retry automatically.
- Framework-neutral review states and human actions.
- Shadow-DOM review rendering, hidden-by-default activation, sanitized text, focus, and native Keep/Revert controls.
- WebMCP schemas, annotations, lifecycle unregistration, and runtime input checks.
- Exact five-tool registration with no Keep, Revert, save, upload, quote, checkout, order, or payment capability.
- Public option discovery with bounded option IDs and dependency descriptions.
- Atomic, idempotent second-design creation with maximum-design and clone-invariant guards.
- Standalone committed/proposal validation with accumulated proposal assumptions.
- Adapter detached reads, preview/restore behavior, commits, retries, and subscriptions.
- Studio-tote manifest portability, ordinary human persistence, coupled
  canvas/print constraints, second-variant creation, zero-write Revert, and
  exactly-once Keep.
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

- Discover exactly the intended five tools in a supported actual browser.
- Execute the North Form 120-pair/two-colourway scenario.
- Run negative prompts for ordering, quote acceptance, upload, customer data, pricing, margins, suppliers, arbitrary paths, and unsafe keys.
- Verify keyboard, focus, ARIA live status, mobile layout, reload, navigation, and browser-without-WebMCP fallback.
- Repeat critical proof against immutable build identifiers and record screenshots plus sanitized traces.

The latest local reproducibility evidence is recorded in
[evidence/LOCAL_VERIFICATION.md](./evidence/LOCAL_VERIFICATION.md). The public
tote portability proof is recorded in
[evidence/STUDIO_TOTE_PORTABILITY.md](./evidence/STUDIO_TOTE_PORTABILITY.md).
The current guarded KORRHAUS Designer candidate is recorded in
[evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md](./evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md).
The earlier five-tool actual-browser run remains historical evidence in
[evidence/KORRHAUS_LOCAL_FIVE_TOOL.md](./evidence/KORRHAUS_LOCAL_FIVE_TOOL.md).
The older
[zero-traffic release](./evidence/KORRHAUS_ZERO_TRAFFIC_RELEASE.md) is explicitly
superseded and must never be promoted; a fresh guarded candidate is required.
The deployable landing-plus-tote artifact is verified in
[evidence/JUDGE_SITE_RELEASE_CANDIDATE.md](./evidence/JUDGE_SITE_RELEASE_CANDIDATE.md).
The older public-reference browser documents remain dated synthetic-harness
history, not an active submission surface.

## Optional agent evaluation corpus

`evals/cases.json` fixes 24 selection, end-to-end, ambiguity, safety,
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
