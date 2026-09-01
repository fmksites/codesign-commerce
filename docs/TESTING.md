# Testing and evidence guide

## Deterministic local gates

Run the complete deterministic suite from the repository root:

```bash
npm ci
npm run verify
```

Individual scripts remain available when diagnosing one gate. `npm run verify`
runs tests, strict typecheck, the standalone and Shopify-overlay builds, browser
bundle verification, judge-site verification, the public-boundary scan,
documentation links, eval structure, and tote control parity.

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
- Exact registration order plus post-`unregister()` observer silence.
- Canonical success `message`/`nextAction` envelopes, including non-ready
  routing to refinement and rejection of untrusted labels, assumptions, and
  validation prose from trusted guidance.
- Privacy-safe invocation events containing only tool name, phase, effect,
  timestamp, and duration; observer exceptions cannot alter tool outcomes.
- Supported-only tool disclosure generated from the actual registered tools,
  with four inspect and two temporary-change capabilities and no persistence or
  commerce capability.
- Natural-language routing metadata for the read, capability, artwork,
  proposal, preview, and validation sequence, without a WebMCP incantation.
- Exact six-tool registration with no Keep, Revert, save, quote, checkout,
  order, payment, customer-data, supplier-data, or merchant-storage import
  capability. Asset staging accepts only bounded session-local proposal inputs.
- Public option discovery with bounded option IDs and dependency descriptions.
- Atomic, idempotent second-design creation with maximum-design and clone-invariant guards.
- Standalone committed/proposal validation with accumulated proposal assumptions.
- Localized validation issues with stable IDs, preview-surface/normalized-region
  targeting, closed-enum provenance, accessible text equivalents, rejection of
  invented sources, and legacy deterministic IDs that default to nonrepairable.
- Exact merchant-approved repair selection and engine enforcement: partial,
  approximate, mixed, and invented repairs leave the proposal revision and
  visible state unchanged; an accepted repair invalidates prior previews.
- Adapter detached reads, preview/restore behavior, commits, retries, and subscriptions.
- Studio-tote manifest portability, ordinary human persistence, coupled
  canvas/print constraints, typography and actual-artwork paths, ink/scale/
  rotation transforms, named variant selection, quantity-preserving variant
  creation, targeted one-variant refinement, zero-write Revert, and exactly-once
  Keep.
- Studio-name typography as the no-artwork production-ready fallback, plus the
  charcoal upper-left Constraint X-Ray from problem highlight through exact 78%
  repair, rerender, fresh preview, and production-ready revalidation.
- Revision-aware preview freshness: current receipts match the exact proposal
  revision, a subsequent design change marks them outdated, and a new capture
  records which old revision it replaced. Pending, capturing, unavailable, and
  ordinary human states remain distinct.
- Configuration Passport v0.1 issuance only after confirmed Keep; no receipt on
  Revert, stale, failed, uncertain, or preview-unavailable paths; public
  projection strips asset/private fields; tampering and unexpected origin,
  configurator, manifest, or renderer versions fail closed.
- The pure Shopify mapper rejects unverified/non-production-ready Passports and
  returns reference metadata without a cart write.
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
6. The activity rail is driven by actual invocation events and contains no
   inputs, results, artwork, shopper text, configuration values, or URLs.
7. A localized Constraint X-Ray highlights the affected preview region, exposes
   an accessible explanation, accepts only a declared repair, invalidates the
   old preview, and returns to production-ready after fresh capture/validation.
8. No Passport exists before Keep; a successful exactly-once Keep creates one
   unsigned integrity receipt bound to the committed revision and current
   previews. Runtime verification recomputes merchant readiness from the kept
   state, rejects any self-asserted readiness mismatch, and strips/rejects all
   query and fragment data from edit URLs. A changed or unknown-version receipt
   fails verification.

Before submission-ready handoff:

- Discover exactly the intended six tools in every client named as supported.
  Public commit `1f422d6` passes the direct page-tool flow in the Codex desktop
  in-app browser and has historical native Chrome evidence. Current native
  Chrome remains unclaimed because the connected instance exposed no
  `document.modelContext` or WebMCP capability; consumer ChatGPT web remains
  recorded as unavailable in the tested session.
- Execute the North Form 120-pair/two-colourway scenario.
- Execute the ordinary 100-tote/two-variant scenario without supplied artwork;
  studio-name typography must remain production-ready.
- Refine the darker variant to an oversized upper-left branding mark, observe
  the production-not-ready Constraint X-Ray, apply exactly the returned repair,
  recapture previews, and revalidate production-ready while the other variant
  remains unchanged. Every WebMCP result must still report `persisted: false`.
- Execute at least one ordinary shopper brief that contains no protocol name,
  tool name, tool-call instruction, or preselected option IDs. The agent must
  discover and sequence the appropriate page tools from metadata alone. The
  local release candidate passed this gate in a separate Codex task on 28
  August 2026: read, capabilities, apply, previews, validate, and reread were
  selected from the ordinary North Form brief, two 50-unit variants and two
  renderer previews were returned, and nothing was persisted.
- Run negative prompts for ordering, quote acceptance, upload, customer data, pricing, margins, suppliers, arbitrary paths, and unsafe keys.
- Verify keyboard, focus, ARIA live status, mobile layout, reload, navigation, and browser-without-WebMCP fallback.
- Verify the collapsed capability disclosure appears only after successful
  registration and its privacy-safe activity stream stops on page teardown.
- Run a separate Keep proof for exactly-once persistence and Passport issuance;
  verify that Shopify line metadata is pure output and causes no cart/network
  write.
- Repeat critical proof against immutable build identifiers and record screenshots plus sanitized traces.

The final tote inventory must report all 25 shipped customer and review
surfaces accounted for: 14 manifest-control mappings, four variant-operation
mappings, one asset-slot mapping, and six explicit non-configurational or
human-confirmation exclusions.

The current public tote evidence is recorded in
[evidence/CODESIGN_V2_ITEM9_STUDIO_TOTE_2026-08-27.md](./evidence/CODESIGN_V2_ITEM9_STUDIO_TOTE_2026-08-27.md).
The exact final public release regression is recorded in
[evidence/TOTE_FINAL_PUBLIC_RELEASE_2026-08-28.md](./evidence/TOTE_FINAL_PUBLIC_RELEASE_2026-08-28.md).
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
The current public release record is
[evidence/CODESIGN_INTEGRITY_RELEASE_2026-09-01.md](./evidence/CODESIGN_INTEGRITY_RELEASE_2026-09-01.md).

## Optional agent evaluation corpus

`evals/cases.json` fixes 26 selection, end-to-end, ambiguity, safety,
adversarial-data, and recovery expectations across the live sock integration
and public tote example.
The validator rejects shopper prompts containing `WebMCP`, CoDesign tool names,
or tool-call wording, so the corpus cannot accidentally pass by teaching the
agent the implementation vocabulary.
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
