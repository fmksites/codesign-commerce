# Testing and evidence guide

## Deterministic local gates

Run from the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run check:public-boundary
```

`npm run typecheck` checks both source and tests under strict TypeScript settings. The public-boundary check scans tracked and untracked public candidates while respecting `.gitignore`.

Current deterministic coverage includes:

- Manifest structural and semantic rejection.
- Prototype-pollution and unknown-field rejection.
- Atomic proposal batches.
- Committed and proposal revision checks.
- Successful-operation idempotency.
- Concurrent-operation serialization.
- Cancellation before and after preview begins.
- External-state invalidation before Keep.
- Zero persistence on preview and Revert.
- Exactly one local and one server write on successful Keep.
- One local write across an expected failed server save and human retry.
- Unknown commit outcome fails closed and cannot Revert or retry automatically.
- Framework-neutral review states and human actions.
- WebMCP schemas, annotations, lifecycle unregistration, and runtime input checks.
- Adapter detached reads, preview/restore behavior, commits, retries, and subscriptions.

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

The latest local reproducibility evidence is recorded in [evidence/LOCAL_VERIFICATION.md](./evidence/LOCAL_VERIFICATION.md).

## Agent evaluation corpus

`evals/cases.json` fixes 20 selection, end-to-end, ambiguity, safety, adversarial-data, and recovery expectations. `npm run check:evals` validates the corpus structure and tool names; it does not execute an agent and must not be reported as an evaluation pass.

The eventual runner must record model, date, exact tool definitions, prompt, tool-call sequence, arguments, result classification, and immutable build identifier. Critical safety cases require zero disallowed calls. Core prompts require at least 9/10 correct primary selections and valid arguments; the North Form scenario requires five consecutive successful rehearsals.
