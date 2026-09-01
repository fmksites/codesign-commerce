# Build Checklist

**Project:** CoDesign WebMCP
**Source of truth:** `scope.md`, `prd.md`, and `spec.md` dated 27 August 2026
**Status:** Locked by participant and explicitly authorized for public-repository implementation on 27 August 2026

## Build Preferences

- **Plan ownership:** Codex-designed from the approved specification
- **Build mode:** Autonomous once explicitly approved; locked when `$build-project` begins
- **Comprehension checks:** N/A
- **Git:** One scoped commit after each completed and verified item; failed or incomplete items are not committed
- **Verification:** Yes — continuous automated checks plus actual browser/agent evidence
- **Check-in cadence:** Speed-run; concise milestone reports, no routine pauses
- **Required stops:** Failed feasibility gate needing a product decision; before private KORRHAUS modification; before deployment/traffic changes; before public publication; before Devpost submission
- **Approval boundary:** This checklist does not itself authorize implementation, deployment, publication, private-repository mutation, or submission
- **Lock:** Ordering and build preferences are fixed for `$build-project`; a material scope/order change requires an explicit checklist revision
- **Approved feasibility deferral (27 August 2026):** After native Chrome and the OpenAI Codex in-app browser both executed the Item 2 preview flow successfully, the participant explicitly approved moving the literal normal-ChatGPT-conversation checks from the pre-refactor feasibility sequence (Items 2 and 3) to the exact release verification in Item 11. This deferral changes validation timing only; it does not authorize a ChatGPT compatibility claim before those final checks pass.

## Execution Rules

- Execute items in order unless a documented dependency forces a change.
- Do not begin broad manifest/tote/KORRHAUS work until Items 2 and 3 pass all four Phase 0 feasibility gates.
- Preserve unrelated user changes and never infer ownership from a dirty Git index.
- Keep the tote and KORRHAUS roles distinct: tote is the public reproducible reference; KORRHAUS is private-backed live-business proof.
- Do not add a WebMCP save, order, quote, checkout, payment, application, proof-acceptance, customer-enumeration, pricing, supplier, or administrative tool.
- Treat a failed ChatGPT/Chrome user-surface check as a failed item even when source inspection and automated tests are green.
- At every external gate, report the exact tested build/revision and requested action before asking for approval.

## Checklist

- [x] **1. Establish the implementation baseline and guarded work branch**
  Spec ref: `spec.md > Build Order For Checklist > Phase 0 — feasibility gates before expansion`
  What to build: After explicit implementation approval, inspect the shared working tree without discarding user changes, create the scoped implementation branch/worktree strategy, record the current public package/tote behavior and hashes, run the complete existing local verification suite, and create a dated pre-change baseline. Do not touch the private KORRHAUS repository or any deployment. Commit only the planning documents and verified baseline that belong to this project.
  Acceptance: The exact starting revision/build, pre-existing narrow tool surface, existing tote behavior, and known limitations are recorded; all runnable baseline checks have a truthful pass/fail result; unrelated changes are preserved; the branch and commit history can distinguish work performed after 25 August 2026.
  Verify: Run `git status --short`, `npm test`, `npm run typecheck`, `npm run build`, `npm run check:public-boundary`, `npm run check:docs`, `npm run check:judge-site`, and `npm run check:evals`; review the dated baseline evidence and `git diff --check` before the item commit.

- [x] **2. Prove inline OpenAI-host previews and native Chrome WebMCP before refactoring**
  Spec ref: `spec.md > Risks And Verification > Critical feasibility gates > Gate 0A — inline ChatGPT preview` and `Gate 0C — Chrome native WebMCP`
  What to build: Add the smallest isolated, removable proof inside the public tote needed to register a bounded preview tool through `document.modelContext`, capture one real tote renderer image, and expose the same contract to ChatGPT's built-in browser and Chrome 149+ native WebMCP. Keep the ordinary human tote working when WebMCP is absent. Do not begin manifest 2.0 or broad UI work in this item.
  Acceptance: An actual renderer export or genuine browser screenshot is displayed inline by the OpenAI Codex in-app browser and matched to the current proposal/preview revision; Chrome discovers and executes the tool through the official origin-trial/testing path; ordinary Chrome without WebMCP remains functional; a text result or bare link does not count as passing. The identical normal-ChatGPT-conversation check remains mandatory but is explicitly deferred to Item 11 release verification.
  Verify: Run the focused unit/browser proof tests, execute the page tool through `document.modelContext` in Chrome 149+ with the official testing flag/inspector, capture the OpenAI Codex in-app-browser inline visual flow, and verify the human experience in an unflagged browser. Record URL, build hash, browser versions, tool result, inline visual evidence, required host permissions, and the pending Item 11 ChatGPT release check.

- [x] **3. Prove real artwork transport and chat-confirmed page Keep**
  Spec ref: `spec.md > Risks And Verification > Critical feasibility gates > Gate 0B — ChatGPT asset transport` and `Gate 0D — page Keep from confirmed chat`
  What to build: Extend only the feasibility slice so a real user/agent-supplied supported image reaches a temporary session asset handle, renders in the tote without normal persistence, reverts with zero writes, and commits only when the shopper explicitly confirms in chat and the agent activates the existing visible page Keep controller. Keep save outside WebMCP and measure all preview/restore/write/commit calls.
  Acceptance: The supplied image—not a hard-coded logo—appears in the live tote and inline OpenAI Codex chat preview; proposal/revert causes zero persistence writes; explicit chat confirmation precedes page Keep activation; one Keep produces exactly one saved local state and reread preview; duplicate activation is idempotent; failed asset transport or confirmation stops the broader build for a user decision. The identical normal-ChatGPT-conversation asset/Keep check remains mandatory but is explicitly deferred to Item 11 release verification.
  Verify: Run focused asset/Keep tests and inspect test counters; exercise stage, preview, Revert, confirmation, Keep, duplicate Keep, and browser-close cases through the OpenAI Codex in-app browser and native Chrome path; record exact source type, sanitized metadata, proposal revision, commit count, final saved revision, and the pending Item 11 ChatGPT release check.

- [x] **4. Replace manifest 1.0 with manifest 2.0 and enforce control parity**
  Spec ref: `spec.md > Components And Responsibilities > Manifest 2.0` and `Versioned human-control inventory`
  What to build: Implement strict manifest 2.0 types/runtime validation, finite control kinds/scopes, asset slots, variant policy, preview surfaces, public dependency descriptions, fixed page-Keep approval mode, the versioned human-control inventory, and a reusable parity harness. Add a concise migration note from the unfinished 1.0 prototype without maintaining a runtime compatibility layer.
  Acceptance: Valid manifests and complete inventories pass; unknown fields, duplicate/unsafe IDs, invalid bounds, unsupported control/slot combinations, oversized schemas, and unmapped visible controls fail closed; every shipped tote control is either mapped or explicitly excluded with a legitimate public-safe reason.
  Verify: Run focused manifest/inventory tests plus `npm test -- manifest inventory`, `npm run typecheck`, `npm run build`, the parity script, and `git diff --check`; inspect generated public types and migration documentation before commit.

- [x] **5. Implement canonical workspace guards and atomic typed operations**
  Spec ref: `spec.md > Components And Responsibilities > Canonical workspace state` and `Typed proposal operations`
  What to build: Implement field-by-field public workspace reconstruction, finite control values, variant/element targets, asset-handle references, operation schemas/reducer, mixed atomic batches, create/duplicate/remove/reorder/set-active variant operations, transform controls, operation limits, and operation-ID idempotency/conflict detection.
  Acceptance: Valid mixed batches create complete detached candidates; invalid values/targets/operations leave the prior state byte-equivalent; adapter extras and malformed nested data cannot cross the public boundary; identical retries deduplicate and conflicting operation IDs fail; no product-specific tote or sock branch enters the core.
  Verify: Run canonical-state, operation, fuzz/boundary, prototype-pollution, idempotency, and unchanged-state tests; run `npm test`, `npm run typecheck`, `npm run build`, `npm run check:public-boundary`, and `git diff --check` before commit.

- [x] **6. Build the guarded adapter and proposal transaction engine**
  Spec ref: `spec.md > Components And Responsibilities > Guarded merchant adapter` and `Proposal engine`
  What to build: Implement the manifest 2.0 adapter contract, runtime output guards, persistence quiescence, private snapshot lifecycle, explicit proposal mode, external-revision subscription, detached validation/preview, exact restore, compare-and-swap Keep metadata, proposal states/revisions, cancellation, stale handling, retryable commit, and commit-uncertain behavior. Migrate only proven transaction logic from the current implementation.
  Acceptance: One proposal is active; every async boundary rechecks revisions; invalid first proposals restore baseline; invalid refinements preserve the last inspected proposal; preview/Revert perform zero writes; external changes block Keep; duplicate Keep saves once; expected server failure does not repeat the local write; unknown outcome never auto-retries or claims success.
  Verify: Run adapter-contract and proposal-engine suites covering all state-machine branches, injected delays/external changes at every async boundary, cancellation, local/server counters, and commit outcomes; then run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.

- [x] **7. Implement the production-safe asset sandbox and preview bridge**
  Spec ref: `spec.md > Components And Responsibilities > Temporary asset sandbox` and `Preview bridge`
  What to build: Turn the feasibility proof into the bounded public asset-handle lifecycle and adapter-owned staging contract; implement source/media/size/private-host policy, cleanup, product-specific sanitizer hooks, exact Keep import, per-variant preview capture, artifact receipts, integrity/revision binding, static-first transport, preview-unavailable state, and retry. Add a same-origin preview endpoint only if Item 2 proved it necessary and that separate architecture/action has been approved.
  Acceptance: Allowed supplied images stage, render, transform, expire, revert, and commit correctly; disallowed/oversized/private-network/malformed sources fail without changing the proposal; raw bytes/private URLs never leak; current previews correlate with exact variants/revisions; stale/capture failures block Keep and retry without creating a proposal or save.
  Verify: Run asset/preview unit, malicious fixture, cleanup, stale artifact, integrity, retry, and Keep-once tests; repeat actual ChatGPT and Chrome visual transport with the generalized code; run `npm test`, `npm run typecheck`, `npm run build`, security/boundary checks, and `git diff --check`.

  Build note (27 August 2026): Completed locally in the public repository. Added the manifest-governed `AssetSandbox`, mandatory host network policy for HTTPS sources, adapter-owned temporary staging/release, revision-bound resolvers, `PreviewBridge`, exact artifact matrix/integrity checks, preview-unavailable retry behavior, and proposal-engine resource integration. A real 214,745-byte North Form PNG rendered visibly through the generalized path in the Codex in-app browser and native Chrome `document.modelContext`; Revert released the asset with zero writes/imports/commits. The literal normal-ChatGPT-conversation repeat remains at the already approved Item 11 release gate. Evidence: `docs/evidence/CODESIGN_V2_ITEM7_ASSET_PREVIEW_2026-08-27.md`.

- [x] **8. Register the six WebMCP tools and unify page review control**
  Spec ref: `spec.md > Components And Responsibilities > Six WebMCP tools` and `Page review and confirmation controller`
  What to build: Implement exactly `codesign_read_workspace`, `codesign_list_capabilities`, `codesign_stage_asset`, `codesign_apply_proposal`, `codesign_get_previews`, and `codesign_validate_proposal` with manifest-generated bounded schemas, runtime validation, sanitized results, annotations, and shared abort lifecycle. Replace the old narrow tools/review assumptions; wire visible Keep/Revert to the single review controller; keep ordinary controls visible but locked only during a proposal.
  Acceptance: The exact six tools register only on supported/enabled pages; schemas reject additional/oversized/unsafe input; outputs contain no private data; no save/commercial/private tool exists; coherent revisions render visibly; Keep is disabled when stale/busy/preview-unavailable; direct and chat-directed page activation share one idempotent commit path; non-agent UI shows no proposal panel.
  Verify: Run WebMCP schema/lifecycle/tool-selection/review-controller tests, inspect the live Chrome tool list and descriptions, exercise abort/unregister, scan for forbidden tool names/actions, then run `npm test`, `npm run typecheck`, `npm run build`, public-boundary/docs checks, and `git diff --check`.

  Build note (27 August 2026): Completed locally in the public repository. The exact six tools now wrap the Manifest 2.0 proposal engine, asset sandbox, preview bridge, and one review controller. Codex in-app browser and native Chrome 151 discovered the same six names, rendered coherent proposals, captured revision-bound 640 by 640 WebP previews, and verified zero-write Revert plus exactly-once visible Keep. A real 214,745-byte North Form PNG was staged, visibly rendered, captured with distinct preview integrity, and released on Revert without import or persistence. Ordinary browsing remained unlocked with no proposal UI. Literal normal-ChatGPT-conversation repetition remains the approved Item 11 release check. Evidence: `docs/evidence/CODESIGN_V2_ITEM8_SIX_TOOLS_2026-08-27.md`.

- [x] **9. Deliver the complete public studio-tote product experience**
  Spec ref: `spec.md > Components And Responsibilities > Tote reference integration` and `Demo And Submission Flow > Stable tote judge flow`
  What to build: Refactor the tote into the final public manifest/inventory/state/adapter/renderer/asset/preview/UI modules; expose every final human control; support actual artwork, typography, placement, scale, rotation, multiple variants, quantity allocation, subjective named-variant revision, two/three visible atomic passes, responsive review controls, local-storage Keep, deterministic reset, and a visual-first judge journey. Do not reuse KORRHAUS branding or renderer logic.
  Acceptance: One natural-language North Form brief creates two visibly distinct named variants with correct totals, real supplied artwork, all customer controls mapped, live staged changes, one inline preview per variant, concise assumptions/warnings, targeted refinement, Keep/save-once, Revert/no-write, and unchanged human operation without WebMCP on desktop and mobile.
  Verify: Run tote parity/configurator/browser/visual/accessibility suites; manually inspect desktop and 390px mobile; execute the complete ChatGPT and Chrome flows; compare browser render to inline chat preview by revision; run the full local quality suite and archive dated screenshots/results before commit.

  Build note (27 August 2026): Completed locally in the public repository. The final tote now exposes materials, names/quantities, studio typography, real artwork import/remove, print method/placement, ink, scale, rotation, and multi-variant controls through one merchant-owned renderer. Its 25-surface inventory is fully accounted for (14 controls, 4 variant operations, 1 asset slot, 6 legitimate exclusions). The North Form QA journey visibly performs Foundation, Branding, and Variants passes with the real 214,745-byte PNG, two named 50-tote designs, and two current previews. Actual in-app-browser Revert restored the baseline with zero writes; one visible Keep produced one configuration commit. Native 390 by 844 and 1280 by 720 inspection passed after fixing a four-pixel mobile overflow. Full verification passed 20 files / 175 tests, strict typecheck, build, exact-six discovery, 25/25 parity, 164-candidate public-boundary scan, 64-file docs check, 25-case eval validation/scorer self-test, judge-site check, browser-bundle verification and `git diff --check`. The literal normal-ChatGPT and final immutable-build native-Chrome repeats remain the explicitly deferred Item 11 release checks; the current connected Chrome rendered the final shell but did not expose `document.modelContext`, so no unsupported current Chrome tool-run claim is made. Evidence: `docs/evidence/CODESIGN_V2_ITEM9_STUDIO_TOTE_2026-08-27.md`.

- [x] **10. Integrate the public core into the real KORRHAUS Sock Designer**
  Spec ref: `spec.md > Components And Responsibilities > KORRHAUS private integration`
  What to build: Stop and obtain explicit authority before private edits. Then perform/read the versioned real customer-control inventory, map every current human-editable creative/configuration control through a narrow private adapter, connect existing renderer/autosave/artwork/validation/snapshot/restore/Keep functions, and keep the WebMCP feature disabled by default. Work locally with synthetic/non-customer fixtures first; do not deploy or change traffic in this item.
  Acceptance: The selected KORRHAUS build has a complete versioned control inventory and proposal parity; all proposals/assets/previews are temporary; normal drafts, autosave, uploads, notifications, customer projects, pricing, and operations remain unaffected; no private state/logic enters the public package; full local regression and actual-browser synthetic flows pass.
  Verify: Run the private application's focused and full lint/typecheck/unit/build/Playwright suites tied to the exact build; execute synthetic actual-browser design, asset, variant, validation, stale, Keep, Revert, non-agent, mobile, and autosave-isolation checks; review the public diff/boundary scan and dated private evidence before the item commit.

  Build note (28 August 2026): Completed locally after explicit owner approval, without deployment or traffic changes. The real Route 02 Designer now consumes the identical public CoDesign browser bundle through a private Manifest 2.0 adapter, exposes the exact six non-commercial tools, maps more than 50 existing creative/configuration controls plus four-colourway operations, stages artwork temporarily, and captures the existing sock/grip/packaging proof as revision-bound WebP artifacts. Synthetic actual-browser evidence created two visible 60-pair colourways, produced distinct previews, and proved zero-write Revert; staged SVG artwork imported and saved once only after visible Keep. Ordinary browsing and human autosave remain on their prior path, and the feature stays disabled by default. Changed-file lint, 43 files / 220 unit tests, typecheck, build, 8 active CoDesign V2 browser tests, 6 localization tests, and the complete active 107-test Playwright suite passed. Full lint still reports one pre-existing unrelated `no-explicit-any` in `app/about-you/about-you.test.ts:76`. Evidence: `docs/evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md`.

- [x] **11. Complete cross-host verification, documentation, and approval-gated releases**
  Spec ref: `spec.md > Risks And Verification`, `External APIs And Dependencies`, and `Build Order For Checklist > Phase 3` through `Phase 6`
  What to build: Finish deterministic/model/safety evals, Playwright and visual coverage, integration/manifest/browser/security/testing/judge documentation, pre-existing-versus-challenge evidence, release hashes, and one static tote/judge release candidate. Stop for approval before public deployment/publication and separately before any KORRHAUS isolated/zero-traffic deployment or production traffic change. After approval, deploy with no traffic where applicable, verify exact hashes/config/logs/URLs, then request any promotion separately.
  Acceptance: Clean clone builds/tests/runs; public boundary scan is clean; the explicitly deferred literal normal-ChatGPT-conversation check plus native Chrome, ordinary-browser, mobile, asset, inline-preview, stale, invalid, Keep/Revert, and forbidden-action evidence pass on the exact release; stable tote URL is reproducible; KORRHAUS evidence is versioned and honest; deployed, public, and live states are never conflated.
  Verify: Run the complete documented release command suite from a clean clone, inspect all dependency/doc links, execute final actual-host journeys, compare served/local hashes, check runtime logs/security headers/feature flags, and complete the submission checklist with explicit evidence links. Record every approval and release state before commit/tag.

  Local checkpoint (28 August 2026): Clean-clone verification passed at `afa8b598e1af5ddb6d82afd90f18430a99d81326` with 175 tests, strict typecheck, build, bundle, judge, boundary, docs, eval-structure and 25/25 tote parity checks. The release builder now permits the required public tote release without claiming a live KORRHAUS flagship, while rejecting an unverified flagship URL. Desktop 1440 px and mobile 390 px landing inspection passed with no overflow or console errors. Official rules reconfirm a working public URL, public licensed source, English copy and a public sub-three-minute YouTube demo. Item 11 remains open at the explicit public push/deployment gate and final normal-ChatGPT/native-Chrome release checks. Evidence: `docs/evidence/CODESIGN_V2_ITEM11_LOCAL_RELEASE_READINESS_2026-08-28.md`.

  Public checkpoint (28 August 2026): Public source and CI were published at the then-current `fmksites/codesign-commerce`; Cloudflare Pages serves the release at `https://codesign-commerce.pages.dev/` with an immutable fallback. The exact deployed six-tool North Form flow passed read, capabilities, staged real PNG, three coherent proposal revisions, distinct inline previews, production validation, stale retry, invalid-value rejection, zero-write Revert and exactly-once visible Keep. Desktop and 390 px ordinary-browser passes, persistence/reset, zero console errors, restrictive headers and explicit 404s passed. Ordinary Chrome also completed a human edit/duplicate/reset flow, but the connected release-test Chrome did not expose `document.modelContext`, so no native-WebMCP repeat is claimed for that instance. Item 11 remains open only for the explicitly deferred participant-owned literal normal-ChatGPT desktop conversation. The mandatory public video remains an Item 12 submission gate. Evidence: `docs/evidence/CODESIGN_V2_ITEM11_PUBLIC_RELEASE_2026-08-28.md`.

  Final-control checkpoint (28 August 2026): An exhaustive deployed control and
  atomic-failure matrix found two contract defects: generic coupled-rule errors
  and an unintended proposal-lifetime 80-operation ceiling. Candidate
  `a8a734044f24524776b767c1b005d7a8db087de1` now exposes rule-specific
  validation diagnostics, documents 80 operations per batch and 240 per
  proposal, and uses the same coupled validator in the visible readiness panel.
  An independent Codex-task regression and an exact clean clone passed 177
  tests, all release checks, 25/25 parity and zero reported dependency
  vulnerabilities. Exhaustive ordinary Chrome behavior passed; final-candidate
  native WebMCP remains blocked until the testing flag/origin-trial path is
  enabled. The candidate is not yet pushed or deployed. Evidence:
  `docs/evidence/TOTE_FINAL_CONTROL_QA_2026-08-28.md`.

  Final-release checkpoint (28 August 2026): Felix approved the public push and
  Cloudflare deployment. Chrome 151 with the official testing flag discovered
  the current exact-six tool surface through `document.modelContext`, executed
  temporary proposal and supplied-artwork paths, rendered 640 by 640 previews,
  and recorded zero writes/imports/commits. Final immutable public regression
  recreated both exact North Form variants, validated production, advertised
  limits 80/240, and proved rule-specific atomic rejection. That run also found
  that release metadata advertised the reusable core digest without publishing
  the standalone file. Commit `1150c40703816f3729ec9f8de6f93db9e172a5e1`
  now publishes and labels both the core and tote application bundles; stable
  and immutable downloads independently match both hashes. Clean-clone QA and
  hosted CI pass. Item 11's engineering scope is complete; consumer ChatGPT
  compatibility and the participant-owned video/submission fields remain Item
  12 gates. Evidence:
  `docs/evidence/TOTE_FINAL_CONTROL_QA_2026-08-28.md`.

  Transaction-repair release checkpoint (28 August 2026): The public repair
  now protects exact initial retries, rejects changed operation-ID payloads,
  invalidates proposals after external-tab changes, preserves visible Keep
  across reload, and truthfully reports unsaved proposals after reload. The
  exact final deploy is commit `ceec9fd3eab9d5c0959b6f5618c61863d562fad0`
  at `https://codesign-commerce.pages.dev/` with immutable authority
  `https://0e840311.codesign-commerce.pages.dev/`. A clean clone passes 180
  tests and every release check. The full stable/immutable black-box regression
  passed exact-six discovery, two real previews, production validation,
  targeted refinement, Revert, Keep/reload, atomicity, idempotency, stale
  recovery, 390 px behavior, console checks and final reset. The remaining
  challenge gates are the participant-owned video, legal attestations and
  explicit Devpost submission approval. Evidence:
  `docs/evidence/TOTE_FINAL_PUBLIC_RELEASE_2026-08-28.md`.

  Technical-hardening checkpoint (28 August 2026): A final usability review
  fixed the remaining proposal-review and asset-lifecycle defects before the
  submission phase. Newly created variants now disclose every agent-writable
  setting in the human review, scale and rotation values render in human units,
  and the tote preserves exact hundredth-scale values with accessible range
  metadata. Proposal assets now transition atomically between revisions, so an
  adapter-held resolver cannot lose artwork between visible rendering and
  preview capture. The public repository also includes a concrete merchant
  integration quick start. Final local verification passed 21 files / 184
  tests, strict typecheck, production build, exact-six discovery, two distinct
  640 by 640 WebP previews, 25/25 parity, public-boundary, documentation,
  judge-site, eval and browser-bundle checks. Ordinary Chrome rendered and
  edited the exact 82 percent control without warnings; its automation bridge
  did not expose native WebMCP invocation, so no unsupported Chrome tool-call
  claim is made. Item 11's technical scope is complete. Item 12 remains the
  deliberately deferred video and Devpost handoff.

- [x] **11A. Prove zero-incantation natural-language tool selection**
  Spec ref: `spec.md > Components And Responsibilities > WebMCP registration`, `prd.md > Primary User Journey`
  What to build: Make the exact-six titles, descriptions, and input schemas route ordinary shopper design intent without requiring “use WebMCP,” a tool name, copied option IDs, or technical instructions. Preserve page-scoped discovery, the existing human UI, exact Keep/Revert boundary, and all commerce exclusions. Add one subjective tote brief to the repeated core evaluation policy and fail corpus validation if a shopper prompt contains implementation vocabulary.
  Acceptance: After a supported client has visited the tote page, “I need 100 premium branded studio totes for North Form. Give me a natural customer version and a darker staff version, use the studio name for the branding, show me both options, and tell me if they are ready to make. Do not save anything yet” selects read, capabilities, proposal, previews, and validation without staging an absent asset or invoking a commerce action. Two visible temporary variants and current previews appear, validation is reported, and no write occurs. Documentation states the honest limitation that WebMCP cannot advertise tools from an unvisited page.
  Verify: Run focused metadata/schema and eval validation tests, the complete deterministic release suite, desktop/mobile rendered browser checks, and a natural-language selection attempt in a current supported agent host or Chrome Model Context Tool Inspector. Record tool sequence, arguments, visible previews, validation, zero-write state, exact build identity, and any client limitation without broadening the claim.

  Local checkpoint (28 August 2026): Rewrote the six titles, descriptions and routing-critical JSON Schema descriptions around ordinary shopper intent, sequencing, supplied-artwork gating, inline previews, validation and commerce exclusions. Added the subjective no-artwork North Form brief to the repeated core policy and made eval validation reject protocol names, CoDesign tool names and explicit tool-call wording in every shopper prompt. A rebuilt local in-app-browser page exposed the new metadata and directly completed read, capabilities, a 29-operation atomic proposal, two distinct 640 by 640 WebP previews, validation, desktop/mobile review and zero-write Revert with no warnings or overflow. Merchant-authored labels and descriptions remain untrusted result data and cannot enter routing metadata. The full candidate passes 22 files / 189 tests, strict typecheck, production and Shopify-overlay builds, bundle, judge, boundary, docs, 26-case eval structure/scorer and 25/25 parity.

  Independent-selection checkpoint (28 August 2026): A separate Codex agent received only the ordinary shopper brief and the local page URL. The prompt contained no protocol name, tool name, option ID, or tool-call instruction. The agent independently discovered and invoked `codesign_read_workspace`, `codesign_list_capabilities`, `codesign_apply_proposal`, `codesign_get_previews`, `codesign_validate_proposal`, and a final reread. It created “North Form Customer” and “North Form Staff” at 50 units each, received two genuine 640 by 640 renderer previews, reported configuration-valid but production-not-ready because final print artwork was still required, and left `persisted: false` with no errors. This satisfies Item 11A's supported-agent selection gate on the local candidate. Native Chrome automation remains separately unclaimed: Chrome 152, the installed extension, and the native host passed diagnostics, but the extension transport did not return an open-tab list even after a fresh Profile 1 window. No push, deployment, Shopify change or submission occurred.

  Live checkpoint (28 August 2026): Commit `ae5e93a28dc735b0f8bb08596fb3ab8c22f7a2f5` was pushed to public `main`, passed hosted CI, and was deployed to stable `codesign-webmcp.pages.dev` plus immutable `30415c02.codesign-webmcp.pages.dev`. A separate Codex task received the ordinary 100-tote North Form brief with no protocol name, tool name, option ID, or tool-call instruction. On both the public tote and the Shopify development-store tote it independently selected read, capabilities, apply, previews, validate, and final reread; produced two 50-unit variants; displayed two genuine 640 by 640 renderer previews in chat; reported configuration-valid but production-not-ready because final artwork was absent; and kept the committed workspace at `tote-revision-1` with no Keep, save, or tool error. Desktop/mobile UI, console, human colour edit, Reset, clean-clone verification, and hosted CI passed. The connected Chrome rendered the release correctly but still exposed no `document.modelContext`, so no current native-Chrome tool execution is claimed. Evidence: `docs/evidence/CODESIGN_ZERO_INCANTATION_LIVE_QA_2026-08-28.md`.

  Refreshed Shopify checkpoint (28 August 2026): After explicit owner approval, the current CoDesign overlay was pushed only to active theme `205741359446` on the password-protected development store, using `--nodelete` and an exact seven-file list. A scoped pullback matched all seven local files byte for byte; Shopify Theme Check passed all seven. The refreshed page exposed Shopify's native storefront tools beside the six shopper-oriented CoDesign tools, rendered and reset correctly on desktop and 390 px mobile without console errors or overflow, and passed another independent ordinary-language test. The separate task was not told to use WebMCP, but selected the exact six-call flow, created two temporary 50-unit variants, displayed two genuine previews, truthfully identified missing final artwork, and saved nothing. Production KORRHAUS was untouched.

  Final supported-client checkpoint (31 August 2026): Stable public commit `a3b7c1fc38578b0a3a3bcb78f1c62242020b1f0b` and immutable deployment `a8e2b6b7.codesign-webmcp.pages.dev` reported the same core and tote bundle hashes. The Codex desktop in-app browser discovered exactly six tools on the stable tote, created two temporary 50-unit North Form variants, displayed two genuine 640 by 640 renderer previews, returned configuration-valid but production-not-ready validation pending final artwork, and then used the visible Revert control. The committed workspace remained the original one-variant `tote-revision-1`, `pendingProposal` returned to `null`, `persisted` remained false, and the browser recorded no warnings or errors. Current native Chrome and consumer ChatGPT web remain unclaimed. Evidence: `docs/evidence/CODESIGN_FINAL_SUPPORTED_CLIENT_RELEASE_2026-08-31.md`.

- [ ] **12. Prepare Devpost handoff**
  Spec ref: `spec.md > Demo And Submission Flow` and `prd.md > Submission Proof Points`
  What to build: Gather the verified product story, first-15-seconds tote sequence, judge instructions, stable demo URL, public repository link, exact commit/build hashes, screenshots or officially required media, clean-clone commands, browser-support limitations, test/eval evidence, public/private architecture explanation, pre-existing KORRHAUS distinction, real-business proof, Codex/AI usage summary, license, and learning documents. Draft only from verified facts and stop before Devpost submission for explicit approval.
  Acceptance: The handoff clearly communicates “chat to custom design of products on Shopify,” proves non-trivial WebMCP and a coherent visual product, distinguishes tote from KORRHAUS, contains no unsupported compatibility/win claims, and provides everything `$prepare-submission` needs without exposing private data.
  Verify: Review every handoff statement against the repository, stable URL, official challenge requirements, dated evidence, and public-boundary scan; confirm all required links are public and functional; confirm the next command is `$prepare-submission` and that nothing has been submitted without explicit approval.

  Draft checkpoint (28 August 2026): Live Devpost requirements, judging criteria and dates were fetched while authenticated and registered. `devpost-submission.md` now contains the verified product story, runtime/AI/Codex explanation, exact test prompt and commands, public and immutable URLs, release commit and bundle hash, five-shot evidence plan, known limitations, Built With list, judging-criteria alignment, and every current official form field. The literal consumer ChatGPT website check was performed in ordinary Chrome and is recorded as blocked by that client's unavailable webpage-tool surface; it is not presented as a CoDesign pass. The packet is deliberately still a draft because the public narrated YouTube video, thumbnail choice, Felix's submitter/country/app-status confirmations, legal attestations and final Devpost approval remain open. Nothing was sent to Devpost.

- [x] **13. Make WebMCP activity visible and model-legible**
  Improvement-plan ref: `CoDesign WebMCP Submission Improvement Plan > 1. Make WebMCP Visible and Model-Legible`
  What to build: Preserve the exact six tools while adding a privacy-safe invocation observer, canonical bounded `message` and `nextAction` fields on every successful result, an actual-activity UI, and a generated six-tool disclosure. Never record arguments, results, artwork, shopper text, configuration values, URLs, or customer data.
  Acceptance: Registration order/count remain unchanged; every successful result has an allowlisted summary of no more than 500 characters and a supported next action; actual start/success/error/cancelled events drive the tote activity trail; the disclosure truthfully reports four inspect tools, two temporary-change tools, and zero persistence/commerce tools; page teardown clears the observer and performs no persistence.
  Verify: Focused WebMCP schema/lifecycle/privacy tests, malicious-string fixtures, exact-six assertions, browser teardown coverage, typecheck, and the complete repository verification suite.

  Local checkpoint (1 September 2026): The exact six/order remain unchanged.
  Successful results now carry canonical bounded `message`/`nextAction`
  guidance. The optional observer exposes only tool, phase, effect, timestamp,
  and duration; observer failure cannot alter execution and teardown suppresses
  later events. The tote activity rail and collapsed disclosure are driven by
  the real registrations/events, not inferred design phases. Focused tests pass;
  complete final verification and deployed-client evidence remain Item 16.

- [x] **14. Deliver one deterministic Constraint X-Ray repair loop**
  Improvement-plan ref: `CoDesign WebMCP Submission Improvement Plan > 2. Create the Submission's Visual Wow Moment`
  What to build: Extend public-safe validation issues with stable identity, target/surface localization, optional normalized regions, repairability and bounded merchant-approved repairs. Add one tote rule in which oversized upper-left artwork is visible and configuration-valid but production-not-ready, highlight it accessibly, and resolve it through an allowed existing proposal operation without adding tools.
  Acceptance: The affected Charcoal variant is localized; Natural remains byte-equivalent; only declared repairs are accepted; repair invalidates old previews, rerenders, captures a current preview, and changes production readiness to true; all proposal results remain `persisted: false`; truly invalid batches remain atomic.
  Verify: Validation/runtime-guard tests, allowed/undeclared repair tests, revision/preview invalidation tests, accessible UI checks, Revert zero-write, Keep exactly-once regression, desktop/mobile browser QA, and the complete repository verification suite.

  Local checkpoint (1 September 2026): The primary ordinary brief maps the
  merchant-declared darker-staff direction to an exact 95% charcoal upper-left
  branding exploration. It is visible and configuration-valid above the
  safe-zone limit but not production-ready. The page localizes it on the preview and
  exposes accessible text. Only the exact merchant-declared 78% set-control
  batch is accepted; invented, partial, broader, or mixed repairs leave the current reviewable
  proposal unchanged. The accepted repair advances the revision, invalidates
  old previews, rerenders, and requires fresh preview/validation while Natural
  remains untouched. Studio-name typography is now the valid no-artwork
  branding fallback; its placement and scale remain production-rule inputs.

- [x] **15. Add Configuration Passport v0.1 and Shopify-safe mapping**
  Improvement-plan ref: `CoDesign WebMCP Submission Improvement Plan > 3. Add a Thin Shopify Integrity Proof`
  What to build: Issue one strict public-safe passport only after successful page Keep, bind it to the committed revision, manifest/renderer versions, canonical safe configuration digest and exact preview receipts, and add a pure `toShopifyLineMetadata()` mapper. Do not add a tool, cart mutation, checkout, order, payment, customer, pricing, supplier, or private workflow.
  Acceptance: Revert, stale/preview-unavailable states, failed/uncertain commits and pre-Keep state issue no passport; one successful Keep issues one verifiable passport; tampering, unknown versions/fields, unsafe URLs and private/artwork leakage fail closed; the Shopify mapper accepts only verified production-ready passports and returns only the opaque ID, digest, bounded safe summary and edit URL.
  Verify: Deterministic canonicalization/tamper/leakage tests, Keep/retry/idempotency integration tests, reload/readback behavior, strict mapper tests, public-boundary scan, typecheck, and the complete repository verification suite.

  Local checkpoint (1 September 2026): Passport v0.1 is created only after the
  controller confirms Keep and binds the committed revision, safe configuration
  digest, exact preview receipts, readiness, versions, bounded summary, and
  same-origin edit URL. All non-success paths issue nothing. The projection
  strips artwork/asset and private data; expected origin/configurator/manifest/
  renderer, freshly recomputed merchant readiness, and both hashes fail closed.
  Re-edit URLs contain no query or fragment data. The receipt is explicitly unsigned and
  is not authentication or authorization. `toShopifyLineMetadata()` accepts
  only a runtime-verified, current-readiness-bound, production-ready Passport and performs no cart or
  network mutation.

- [x] **16. Reframe and verify the judge experience on the exact release candidate**
  Improvement-plan ref: `CoDesign WebMCP Submission Improvement Plan > 4. Judge Experience and Submission Narrative` and `5. Verification and Release Gates`
  What to build: Make the ordinary-language prompt primary, replace inferred progress and stale test counts, add genuine problem/repaired visuals and the line “Agent designs. Human approves. Shopify completes the sale.” Update current docs/evals only from verified behavior. Do not push, deploy, change Shopify/KORRHAUS, or submit without the existing separate approvals.
  Acceptance: Local judge/tote surfaces tell one coherent story; current claims match the final local test/build output; desktop and 390px QA pass; exact six, X-Ray repair, `persisted:false`, Revert, Keep/passport, progressive enhancement and public/private boundaries are all verified locally. External supported-client verification remains explicitly gated until deployment approval.
  Verify: `npm run verify`, focused Playwright/browser checks, desktop/mobile visual/accessibility review, `git diff --check`, public/private scan, and a claim-by-claim documentation review.

  Local checkpoint (1 September 2026): The primary route now uses the exact
  ordinary brief “I need 100 premium branded studio totes for North Form. Give
  me a natural customer version and a darker staff version, show me both
  options, check whether they are ready to make, and do not save anything yet.”
  Complete local verification now passes 28 files / 235 tests, strict
  typecheck, production and overlay builds, boundary/docs/eval checks, and
  25/25 parity. Desktop and 390-pixel QA pass. Push/deployment and exact
  deployed ChatGPT desktop/native-Chrome verification remain open. No release
  action is authorized by this checkpoint.

  Competitor-learning checkpoint (1 September 2026): Added a closed-enum,
  adapter-sanitized source to public validation issues so the page can state
  whether a finding comes from a merchant production rule, the current design,
  renderer evidence, or the shopper brief without exposing internal rule text.
  Added per-variant preview freshness derived from exact proposal receipts:
  the previous revision becomes visibly outdated after a repair, Keep remains
  gated, and a fresh capture identifies the revision it replaced. The local
  integrity walkthrough is available only in development as
  `?agent-preview=integrity`. Full verification passes 28 files / 235 tests;
  desktop 1440 px, X-Ray 1280 px, and mobile 390 px rendered QA pass with no
  overflow or browser warnings/errors. Revert restored one variant with zero
  local/server/commit writes and released the temporary asset. Push,
  deployment, Shopify changes, and Devpost submission remain separately gated.

  Public checkpoint (1 September 2026): Commit
  `1f422d634cf07d8c4d8cf01165e3eeff89a5ab61` was pushed to public `main`,
  passed hosted CI, and deployed to stable `codesign-webmcp.pages.dev` plus
  immutable `0b0603b6.codesign-webmcp.pages.dev`. Stable/immutable metadata and
  downloaded bundles matched core
  `460aa40ade9b4cb42491a3028032ba970d8db4ce35febd7d646962890c13880b`
  and tote
  `edc44d53d107fed84a01fd78f3a027549c56f81c452ffbc457b2402d446f85d4`.
  The exact deployed direct WebMCP run completed two variants, two 640 by 640
  previews, merchant-rule X-Ray, only the returned 78% repair, outdated-to-
  current preview transition, ready revalidation, `persisted:false`, and
  visible Revert. A separate Keep advanced one revision, issued one
  Configuration Passport, removed the Keep control, and survived reload.
  Deployed 390 px and ordinary Chrome fallback QA passed with no overflow or
  warnings/errors. The connected Chrome did not expose native WebMCP, so no
  current native-Chrome or consumer ChatGPT-web claim is made. Evidence:
  `docs/evidence/CODESIGN_INTEGRITY_RELEASE_2026-09-01.md`.
