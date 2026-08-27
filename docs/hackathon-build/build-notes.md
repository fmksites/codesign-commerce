# Guided Build Notes

## 27 August 2026 — onboarding round 1

- Project direction: a reusable WebMCP layer for existing Shopify product customizers, demonstrated by a public studio tote and the live KORRHAUS Sock Designer.
- Non-negotiable capability: “everything the user can change himself now” must also be agent-proposable.
- Participant calibration: Codex power user; prefers product-level decisions and visible verification over framework discussion.
- Active shaping: Felix rejected the current narrow two-colourway/text-review experience as underwhelming and redirected the product toward full creative-control parity.
- Deepening rounds completed: 0; onboarding remains active.

## 27 August 2026 — onboarding round 2

- Entry point: the customer begins entirely in ChatGPT; the agent opens and operates the relevant Shopify customizer.
- Asset scope: customer-provided and generated artwork, transformations, placement, scale, rotation, and cross-surface application are all in scope.
- Collaboration loop: complete first proposal first, then conversational art direction; clarification is reserved for true blockers.
- Commercial scope change: authenticated customer-visible pricing and order submission may be agent-operated. Human action-time confirmation remains required immediately before submitting an order. KORRHAUS currently has no payment step.
- Active shaping: Felix explicitly expanded the former no-order WebMCP boundary; downstream scope and threat modeling must treat this as a deliberate change rather than silently retaining the old non-goal.
- Deepening rounds completed: 0; onboarding remains active.

## 27 August 2026 — onboarding round 3

- Judge-facing ambition: within 15 seconds, the entry should read as a foundation for agentic Shopify customizers, not as another product configurator.
- Product shorthand: “Chat to custom design of products on Shopify.”
- Visual behavior: show the design evolving live while the agent works.
- Surface strategy: keep ChatGPT as the control surface, update the merchant's real customizer as the visual workspace, and return useful visual previews into the conversation for customers who do not keep the browser foregrounded.
- Personal success criterion: “If I don't have to use the designer anymore and can just chat and get what I want.” The reusable layer must also be easy for other Shopify merchants with existing custom product designers to install.
- Active shaping: Felix rejected a browser-only interpretation. In-chat previews are part of the desired core experience, not optional demo polish.
- Scope warning: the current `AGENTS.md` forbids WebMCP ordering, while round 2 expressed a desire for confirmed authenticated order submission. The scope phase must resolve this explicitly. Until then, no commercial action is authorized.
- Deepening rounds completed: 0; onboarding complete and ready for scope.

## 27 August 2026 — scope interview round 1

- Platform ambition: CoDesign Commerce should become the standard interaction layer through which agents operate customizable products on Shopify merchant sites.
- Merchant outcome: a Shopify merchant with an existing product designer adopts CoDesign Commerce to expose its real controls, renderer, product rules, and safe actions to ChatGPT, Claude, or another capable agent.
- Shopper outcome: a customer starts with a product need, such as custom grip socks for a studio, and completes the creative journey conversationally rather than learning and manually operating the merchant's designer.
- Journey model: the agent helps identify the relevant merchant/product, opens that merchant's web customizer, drives its live visual canvas, and keeps conversation as the user's primary control surface.
- Product intersection: commerce discovery, custom-product design, and agentic web interaction are one connected journey.
- Inspiration reaction: closest to a Canva/Figma-style conversational copilot, but embedded in a real shopping journey and running through the merchant's existing web experience.
- Scope budget: maximize useful, competition-quality output within the remaining calendar; long-running Codex work is acceptable. This is not permission to scatter effort—scope must still prioritize one coherent, demonstrably reusable workflow.
- Active shaping: Felix elevated the product from a KORRHAUS feature to a merchant protocol intended to work across agent clients and custom-product categories.
- Mandatory beats completed: brain dump, inspiration/reaction, and time-budget intent. Sharpening gaps and scope cuts remain.

## 27 August 2026 — scope interview round 2

- Proof-surface decision: use both the public studio tote and the real KORRHAUS website to explain the product, but make the tote the stable, reproducible Devpost submission demo.
- KORRHAUS role: evolving live-business proof that CoDesign Commerce can enhance a real merchant customizer. KORRHAUS may continue normal product development and is not the sole required judge URL.
- Tote role: versioned, runnable reference integration that judges and other merchants can reproduce even if KORRHAUS changes after submission.
- Discovery cut: do not build a merchant-comparison or recommendation engine for the challenge. Demonstrate a customer brief reaching the appropriate known demo surface, then spend the experience on agentic design.
- Active shaping: Felix explicitly prioritized continued KORRHAUS development over freezing the commercial site for a month.
- Mandatory beats completed: discovery ambiguity resolved. Live-preview semantics, integration promise, and final scope cuts are being converted into explicit scope assumptions.

## 27 August 2026 — scope interview round 3

- Live-preview contract confirmed: the merchant's browser canvas visibly updates as the agent applies a coherent proposal or conversational revision.
- Chat-preview contract confirmed: after each coherent proposal or revision, the agent returns a fresh meaningful visual preview to the conversation. The system does not need to send a screenshot after every low-level option mutation.
- Scope rationale: this preserves the feeling of live co-creation without flooding the conversation with transient intermediate frames.
- Mandatory beats completed: live-preview ambiguity resolved. Final scope cut is ready for documentation once Felix chooses whether to deepen further.

## 27 August 2026 — scope interview round 4

- Merchant-install promise confirmed: install the package, describe the customizer with a manifest, connect a narrow adapter to existing state/render/validation functions, and retain the merchant's existing human UI.
- Challenge inclusion: the public package, manifest contract, adapter interface, runnable tote integration, and credible integration guide are part of the challenge build because they prove reuse beyond KORRHAUS.
- Challenge exclusion: a zero-code Shopify app installer, universal adapter generation, arbitrary-customizer compatibility, and a production-grade merchant onboarding dashboard are not part of the challenge build.
- Scope rationale: without a real reusable contract the submission would be only a KORRHAUS feature; without cutting universal installation the build would become an unfocused platform project.
- Mandatory beats completed: integration ambiguity and core scope cuts resolved. Scope is ready to write or deepen.

## 27 August 2026 — scope document completed

- Created `docs/hackathon-build/scope.md` from the mandatory scope interview and the prior detailed execution plan.
- Mandatory beats completed: brain dump, inspiration/reaction, time-budget intent, ambiguity sharpening, and explicit scope cuts.
- Deepening rounds completed: 0. Felix chose to write the scope after the mandatory rounds.
- Selected product definition: an open-source WebMCP integration layer that turns chat into the creation interface for customizable Shopify products while retaining the merchant's existing renderer and UI.
- Stable submission topology: studio tote is the reproducible public judge demo; the live KORRHAUS Sock Designer is evolving real-business evidence.
- Required experience: live browser rendering, meaningful visual previews returned to chat, complete first proposals, conversational refinement, validation, and explicit human confirmation.
- Reuse proof: package, manifest, adapter, tote integration, and integration documentation are in challenge scope; zero-code installation and universal rendering are not.
- Active shaping preserved: the old narrow text-led proposal is explicitly treated as a technical baseline, not completion of the revised product.
- Commercial boundary: orders, payment, quotes, confidential pricing, customer data, and private operations remain out of challenge scope under the current `AGENTS.md`.
- Next guided-build stage: PRD.

## 27 August 2026 — PRD interview round 1

- Entry behavior: ChatGPT first presents suitable product or merchant options in conversation. The customer selects the relevant option before the agent opens and operates that customizer.
- Product boundary: discovering and presenting options may use the agent's existing shopping/web capabilities; CoDesign Commerce becomes responsible once a compatible customizable product is selected.
- Work visibility: chat shows two or three short, user-friendly progress updates while the browser customizer is being read, designed, rendered, and validated. Tool names and low-level logs remain hidden.
- Result presentation confirmed: one visual preview per design/colourway, a short creative-direction explanation, important assumptions, missing decisions or production warnings, and an invitation to refine conversationally.
- Open clarification: Felix did not yet understand the proposed Keep/Revert surface. Explain the temporary-versus-saved distinction in plain language before recording a decision.
- Mandatory beats in progress: first-run behavior and result presentation clarified; persistence confirmation, acceptance criteria, and edge cases remain.

## 27 August 2026 — PRD interview round 2

- Persistence decision: the primary Keep flow happens in ChatGPT after explicit action-time confirmation. The customer does not need to switch to or manually operate the merchant customizer to save a proposal.
- Page fallback: the customizer may continue to show visible Keep/Revert controls for transparency, recovery, and customers already watching the page.
- Safety behavior: a casual refinement or ambiguous phrase does not save. Chat must clearly ask whether the named pending design should be saved, and persistence occurs only after the customer confirms that exact action.
- Mandatory beats in progress: confirmation behavior resolved; vague briefs, assets, multi-design interaction, error recovery, and post-save feedback remain to sharpen.

## 27 August 2026 — PRD interview round 3

- Vague-brief behavior confirmed: choose tasteful merchant-valid defaults, create a complete first direction, and list material assumptions; ask only when a credible proposal is genuinely blocked.
- Missing-logo behavior confirmed: use the studio or customer name as the temporary visible identity rather than stopping the design journey. The result may still note that final artwork can be added later.
- Validation correction: do not invent arbitrary production blockers. If the merchant's current human designer can represent a design, CoDesign may propose it.
- Blocking errors are limited to states the selected customizer itself cannot represent or explicitly declares invalid, such as unknown values, broken totals, stale state, or an unavailable control.
- Production considerations that do not prevent the visual design remain warnings or follow-up notes rather than blockers.
- Mandatory beats in progress: primary design behavior clarified; external-change, interrupted-session, preview-failure, and post-save edge cases remain.

## 27 August 2026 — PRD interview round 4

- Concurrent human change: the agent detects and rereads the changed design, then asks whether the customer wants the manual change incorporated. It never silently overwrites a newer human edit.
- Interrupted proposal: if the browser closes before confirmation, chat states that the proposal was not saved and offers to recreate it from the conversational brief.
- Preview failure: if ChatGPT cannot present an inspectable visual result, saving remains unavailable. The customer is told what failed and may retry or inspect the webpage; the agent does not claim an unseen result is ready.
- Post-save feedback: chat returns the final preview, clearly confirms that the design was saved, and keeps conversational refinement available. It does not continue into ordering or payment under the current challenge boundary.
- Mandatory beats completed: precise primary journey, user stories, visible acceptance behavior, recovery edges, and time-budget scope guard are sufficiently covered to draft the PRD.

## 27 August 2026 — PRD document completed

- Created `docs/hackathon-build/prd.md` from the approved scope and four mandatory PRD interview rounds.
- Deepening rounds completed: 0. Felix chose “next” after confirming the surface distinction, which was treated as authorization to write the PRD.
- The PRD is intentionally more substantial than the scope and converts the product direction into observable user stories, acceptance criteria, states, edge cases, evidence requirements, and product risks for the technical specification.
- Two-surface distinction made explicit: the studio tote is the fictional, stable, public, reproducible judge surface; KORRHAUS is the real, private-backed, evolving commercial proof.
- Shopper behavior fixed: options before navigation, concise progress, complete first design, browser and chat previews, conversational refinement, studio-name fallback, merchant-authoritative validation, explicit confirmation in chat, page fallback, and final saved preview.
- Safety behavior fixed: no invented merchant blockers, no partial invalid state, no proposal autosave, no silent overwrite of human edits, no save of unseen previews, and honest not-saved recovery after interruption.
- Merchant behavior fixed: preserve existing UI/renderer/backend, publish only package/manifest/adapter contract and documentation, and test parity against versioned control inventories.
- Challenge boundary retained: no order, payment, quote, application, proof acceptance, confidential pricing, customer data, supplier data, or private administrative operations.
- Next guided-build stage: technical specification.

## 27 August 2026 — technical specification interview round 1

- Stack decision: preserve the existing TypeScript, Vite, and npm-workspace foundation and reuse the proven proposal transaction where it still fits.
- Contract decision: manifest, asset, preview, tool, and confirmation contracts may be replaced or versioned where the revised full-creative-parity experience requires it.
- Deployment decision: one stable public deployment contains the tote reference, judge explanation, and public documentation. The real KORRHAUS Shopify site remains a separate live-business proof surface.
- Distribution decision: satisfy the challenge with a public repository, clean-clone installation, runnable instructions, and the real source. Publishing an npm package is not a required finish-line dependency.
- Research finding: current official OpenAI guidance limits WebMCP site tools to a live page open in the ChatGPT desktop app's built-in browser; ordinary Chrome is not the primary supported site-tools host.
- Research finding: the current WebMCP contract allows arbitrary serializable tool results but does not standardize an MCP-style image-content result. The specification therefore needs a host-verified preview-artifact bridge rather than assuming that returning image bytes automatically creates an in-chat preview.
- Deepening rounds completed: 0; specification mandatory beats remain in progress.

## 27 August 2026 — technical specification interview round 2

- Required client decision: Chrome must work as well as the ChatGPT desktop built-in browser.
- Chrome interpretation: the ordinary human customizer remains a progressive enhancement and must work in normal modern Chrome; the WebMCP layer must additionally be verified in Chrome 149+ through the official origin trial or local testing flag and a compatible WebMCP agent/inspector.
- Claim boundary: current OpenAI guidance says ChatGPT site tools are not available inside ordinary Chrome. The submission may claim WebMCP-in-Chrome and ChatGPT-desktop-site-tools separately, but must not call that unsupported combination “ChatGPT site tools in Chrome.”
- Journey confirmation: “entirely in ChatGPT” permits ChatGPT to open and operate the merchant page in a background browser tab. The customer should not have to operate the customizer controls.
- Deepening rounds completed: 0; specification mandatory beats remain in progress.

## 27 August 2026 — technical specification interview round 3

- Persistence decision confirmed: the customer explicitly confirms the exact proposal in chat, after which the agent activates the webpage's existing visible Keep controller.
- WebMCP boundary: no separate save/commit WebMCP tool. All site tools remain read, capability, temporary-proposal, asset-staging, preview, or validation operations.
- Single-path rationale: page Keep and the chat-directed agent action converge on the same controller and idempotent adapter commit, avoiding separate persistence implementations.
- Confirmation limitation recorded: current WebMCP passes only an `AbortSignal` into tool callbacks and provides no page-verifiable chat-confirmation proof. The hard persistence boundary therefore remains the merchant page's existing Keep controller.
- Deepening rounds completed: 0; specification mandatory beats remain in progress.

## 27 August 2026 — technical specification interview round 4

- Contract version decision confirmed: replace the narrow manifest `1.0` with a cleaner `2.0` public contract and a concise migration note; do not spend challenge time maintaining compatibility for unfinished prototype APIs.
- Integration declaration decision confirmed: merchants explicitly describe customer-editable controls through a typed manifest rather than automatic DOM scraping.
- Parity enforcement: each integration pairs its manifest with a versioned human-control inventory, and a contract test fails when a declared customer control lacks an agent mapping.
- Public/private split confirmed: core owns manifest, sanitized state, proposals, assets, previews, WebMCP registration, review coordination, guards, and contract tests; each adapter owns merchant mapping, renderer, validation, autosave isolation, capture, restore, external-change detection, and Keep persistence.
- Deepening rounds completed: 0; specification mandatory beats remain in progress.

## 27 August 2026 — technical specification interview round 5

- WebMCP surface confirmed: six stable public tools—read workspace, list capabilities, stage asset, apply proposal, get previews, and validate proposal.
- No product-field tools: merchant controls are expressed through manifest-generated schemas and typed operations rather than one tool per field.
- No opaque single action: read, capability discovery, temporary mutation, preview, and validation remain separately inspectable and independently testable.
- Atomic batch semantics confirmed: one coherent batch may coordinate controls, variants, assets, and transformations; failed batches leave the last inspected proposal unchanged.
- Lifecycle confirmed: coherent batches render visibly, chat previews follow coherent revisions, external changes stale the proposal, preview failure blocks Keep, and persistence remains outside WebMCP.
- Deepening rounds completed: 0; exact file structure and end-to-end data lifecycle remain before the specification can be drafted.

## 27 August 2026 — technical specification interview round 6

- File topology confirmed: keep the public core compact and modular around manifest, inventory, adapter, operations, proposal engine, asset sandbox, preview bridge, review controller, WebMCP, public errors, and reusable testing.
- Tote topology confirmed: a distinct public manifest, inventory, state, adapter, renderer, preview capture, normal UI, and browser test surface consume the shared core.
- Data residence confirmed: open proposals, raw snapshots, temporary assets, and preview handles remain session-local; committed design storage remains merchant-owned.
- Static-first deployment confirmed: the public tote begins as a fully static deployment using local storage for the fictional saved design.
- Preview escalation rule: add a minimal same-origin preview endpoint only if actual ChatGPT verification proves that bounded static preview artifacts cannot produce the required in-chat result.
- Mandatory specification beats completed: stack, deployment, current official API research, PRD-to-component architecture, file structure, and end-to-end data lifecycle.
- Deepening rounds completed: 0. The specification is ready to write or to receive an optional architecture stress-test round.

## 27 August 2026 — technical specification deepening round 1 started

- Felix approved the optional architecture stress-test round before drafting the specification.
- This round will resolve only remaining execution ambiguities: the exact Chrome claim, what qualifies as an in-chat preview, staged visual progress, asset-proof expectations, and human-control behavior while a proposal is open.
- Product direction remains fixed; this round does not reopen the two-surface strategy, full creative parity, proposal isolation, or explicit confirmation boundary.
- Deepening rounds completed: 0; round 1 is active.

## 27 August 2026 — technical specification deepening round 1 completed

- Browser targets confirmed: both the ChatGPT desktop built-in-browser shopper journey and Chrome's native WebMCP implementation must work. Ordinary Chrome without WebMCP support must retain the complete human customizer.
- Claim boundary retained: the build will not falsely call Chrome's native WebMCP verification “ChatGPT site tools in Chrome” while OpenAI documents that combination as unavailable.
- Preview acceptance confirmed: a renderer-exported image or genuine browser screenshot qualifies only when displayed inline in chat; text and bare links do not.
- Progressive visual behavior confirmed: the first proposal evolves through two or three coherent atomic passes, such as foundation, branding, and variant creation.
- Artwork evidence confirmed: the tote judge journey stages and visibly renders an actual supplied image asset; studio-name typography is the no-asset fallback.
- Human-control behavior confirmed: controls remain visible but locked during an open agent proposal; another-tab or external change makes the proposal stale and prevents Keep.
- Deepening rounds completed: 1. No unresolved product-authority decision remains; exact bounded payloads, error codes, security mechanics, and test matrices can be authored in the specification from these decisions.

## 27 August 2026 — technical specification completed

- Created `docs/hackathon-build/spec.md` from six mandatory specification interview rounds and one completed deepening/stress-test round.
- The specification preserves the existing TypeScript/npm-workspace foundation but replaces the narrow manifest `1.0`, read-only asset model, and five-tool finish line with a manifest `2.0` architecture and six stable WebMCP tools.
- Browser claim made executable: full ChatGPT desktop built-in-browser journey, Chrome 149+ native WebMCP verification, and ordinary non-WebMCP Chrome regression coverage are separate required tracks.
- Public/private split made executable: public core, tote, contracts, tests, and documentation remain reproducible; KORRHAUS supplies only a private adapter and versioned private inventory.
- Preview and asset risks moved to Phase 0 gates: actual inline ChatGPT visual output and a real supplied asset must work before broad implementation proceeds.
- Persistence remains one page-owned path: explicit confirmation happens in chat, the agent activates the visible page Keep controller, and the adapter commits idempotently once. No WebMCP save tool is added.
- Added exact file structure, conceptual TypeScript contracts, proposal state machine, tool inputs/results, public error codes, recovery matrix, security controls, deterministic/eval/browser plans, demo flow, evidence package, and checklist build order.
- Active shaping preserved: Felix required both browsers, actual artwork, visible staged creation, and inline visual previews rather than a narrow text-led proposal.
- Deepening rounds completed: 1.
- Approval boundary: the specification authorizes only the checklist stage. It does not authorize implementation, KORRHAUS modification, deployment, publication, or submission.
- Next guided-build stage: implementation checklist.

## 27 August 2026 — checklist preferences confirmed

- Plan ownership: Felix handed sequencing and verification-checkpoint design to Codex.
- Future build mode: autonomous once implementation is explicitly approved; the choice locks when `$build-project` starts.
- Routine pauses: none. Codex should continue through safe local work and report completed evidence rather than ask for comprehension checks.
- Required stops: a feasibility gate fails and requires a product decision; before private KORRHAUS modification; before deployment/traffic changes; before public repository publication; before Devpost submission.
- Verification: continuous automated checks plus actual ChatGPT, Chrome, ordinary-browser, visual, and safety evidence at the relevant items.
- Git cadence: one clean, scoped commit after each completed and verified checklist item, with no commit for a failed/incomplete item.
- Check-in cadence: speed-run/autonomous, with concise milestone reports and approval-gate requests only.
- Submission wow moment retained from the PRD: one normal chat brief visibly creates a complete tote collection through staged design changes, real artwork, and inline chat previews before architecture explanation.
- Checklist design path: hand-off; no checklist deepening interview. Felix will gut-check the completed draft before it is locked for `$build-project`.

## 27 August 2026 — implementation checklist drafted

- Created `docs/hackathon-build/checklist.md` with 12 dependency-ordered, five-field execution items.
- Risk-first sequence: establish a truthful baseline, then prove inline ChatGPT preview/native Chrome WebMCP and real artwork/chat-confirmed page Keep before broad refactoring.
- Public build sequence: manifest/inventory, canonical state/operations, adapter/proposal engine, assets/previews, six tools/review controller, and the complete tote experience.
- Private/external gates preserved: explicit authority is required before KORRHAUS edits; deployment, traffic, publication, and submission remain separate later approvals.
- Final two items cover cross-host verification/release evidence and the mandatory Devpost handoff.
- Deepening rounds completed: 0 on the hand-off checklist path, as directed by the skill. The participant gut-check is pending before the checklist is locked.

## 27 August 2026 — implementation checklist locked

- Felix approved the amount and ordering of work without changes.
- Locked `docs/hackathon-build/checklist.md` at 12 items with Codex-owned sequencing, autonomous future build mode, continuous verification, one verified commit per item, and no routine pauses.
- Risk order remains fixed: prove ChatGPT inline preview, Chrome native WebMCP, real asset transport, and chat-confirmed page Keep before broad manifest/tote/KORRHAUS work.
- Mandatory stops remain fixed: failed feasibility gate needing a decision; private KORRHAUS mutation; deployment/traffic; public publication; Devpost submission.
- Deepening rounds completed: 0 on the hand-off path.
- Planning status: checklist complete; implementation remains unauthorized until the next-stage build-start approval boundary is satisfied.
- Next guided-build stage: autonomous build execution.

## 27 August 2026 — build stage entered; implementation approval pending

- Felix advanced to `$build-project` by saying “next.”
- The guided-build state now points to autonomous build execution with Item 1 as the first unchecked item.
- No implementation source, Git branch, deployment, public repository, or private KORRHAUS mutation occurred on stage entry.
- Item 1 and `AGENTS.md` require explicit implementation authorization before local public challenge source changes begin.

## 27 August 2026 — implementation approved and Item 1 completed

- Felix explicitly replied “start,” authorizing local implementation changes in the public challenge repository under the previously stated boundary.
- This authorization did not extend to the private KORRHAUS repository, deployment or traffic changes, public publication, npm publication, or Devpost submission.
- Created guarded branch `codex/codesign-commerce-v2` from `e986e12b9448491c2e34b302c1c4ddcf12320047` without resetting or discarding the untracked guided-build documents.
- Recorded the five-tool Manifest 1.0/tote baseline and its limitations in `docs/evidence/CODESIGN_V2_PRE_IMPLEMENTATION_BASELINE_2026-08-27.md`.
- Baseline verification passed: 8 test files / 95 tests, strict typecheck, full build, 118-candidate public-boundary scan, 50-file documentation check, judge-site hash check, and 24-case eval-corpus check.
- No private KORRHAUS inspection or mutation and no external deployment, traffic, publication, or submission action occurred.
- Item 1 is complete. Item 2 is the next dependency: the smallest removable proof for actual inline ChatGPT previews and native Chrome WebMCP.
