# Project Scope

**Project:** CoDesign WebMCP
**Stage:** Challenge scope approved for PRD development; not implementation authorization
**Scope date:** 27 August 2026
**Build posture:** Use all useful build time available before the challenge deadline, but protect one coherent end-to-end experience from feature sprawl.

## Project Name History

- **CoDesign Commerce** — selected as the original 27 August working name. Superseded by the final 28 August rebrand below.
- Agentic Product Configurator — accurate but generic; rejected as the primary name.
- Shopify CoDesigner — clear but too dependent on a platform trademark and too close to a single assistant feature.

Final 28 August naming structure:

- Technology: **CoDesign WebMCP**.
- Descriptor: **WebMCP for Custom Products on Shopify**.
- Commercial promise: **Make your Shopify product configurator agent-ready.**
- Service: **Agent-Ready Configurator Pilot**.
- Repository: `codesign-webmcp`.

## One-Line Summary

CoDesign WebMCP is an open-source WebMCP integration layer that lets an AI agent turn a shopper's natural-language brief into a live, editable design inside an existing Shopify product customizer.

The longer-term ambition is to become a standard way for compatible agents to interact with customizable Shopify products. The challenge version proves the foundation rather than claiming that universal platform has already been completed.

## Scope Decision

The challenge entry will prove one focused proposition:

> A merchant can keep its existing Shopify customizer, visual renderer, human interface, and product rules while adding a reusable agentic layer through which a shopper can create and refine the product conversationally.

The public studio-tote integration is the stable, reproducible submission demo. The real KORRHAUS Custom Sock Designer is the evolving commercial proof that the same public layer can work inside an operating Shopify business.

CoDesign WebMCP is neither the Sock Designer nor the tote renderer. It is the reusable contract, proposal transaction, WebMCP tool layer, preview bridge, safety boundary, and integration pattern shared by both.

## Target User

### Primary shopper

A studio owner, brand owner, team, community, or small business that wants a customized physical product but does not want to learn a complex product designer.

The shopper should be able to begin with intent rather than configuration vocabulary:

> I need custom grip socks for my Pilates studio.

or:

> Create 100 studio totes for our opening, with a natural version and a darker staff version.

The shopper describes goals and gives conversational art direction. The agent translates that intent into the merchant's actual available product options.

### Primary merchant integrator

A developer responsible for an existing Shopify product customizer. The developer wants agent access without replacing the current UI, renderer, state model, validation rules, persistence backend, or commercial workflows.

The challenge integration promise is deliberately technical rather than zero-code:

1. Install the CoDesign WebMCP package.
2. Describe the customer-editable capabilities through a versioned manifest.
3. Connect a narrow adapter to existing state, rendering, validation, snapshot, restore, and confirmed persistence functions.
4. Register the generated WebMCP tools.
5. Keep the ordinary human interface working when no agent is present.

### Merchant product owner

A merchant who wants fewer abandoned or low-quality custom-design journeys, more useful agent traffic, and a better path from product interest to a coherent design—without handing confidential pricing, customer data, or operational systems to an agent.

### Challenge judge

A technically informed evaluator who must be able to understand within 15 seconds that this is not another standalone configurator. The judge should see natural language become a real visual product through non-trivial WebMCP behavior, then see that the same core can be integrated into a different merchant experience.

## Problem

### Shopper problem

Custom products impose a design and configuration burden before the shopper can buy or even request the next commercial step. The shopper must understand colors, materials, print methods, placement, quantities, dependencies, production constraints, artwork status, and multiple design variants. A visual configurator helps, but the shopper still has to operate it correctly.

### Merchant problem

Merchants have already invested in specialized customizers. Those systems contain valuable rendering logic, product constraints, persistence behavior, and operational integrations. Rebuilding each one as an agent-native experience would be expensive and risky.

Generic shopping-agent tools can help discover products and perform ordinary storefront actions, but a configurable made-to-order product is not a normal SKU selection. Its choices are interdependent and must remain synchronized with the merchant's visual renderer and production rules.

### Ecosystem gap

There is no credible reusable challenge solution if the code only hard-codes KORRHAUS fields. Conversely, claiming a universal renderer or no-code adapter would be implausible. The useful middle layer is a manifest-and-adapter protocol that turns a merchant's existing capabilities into agent-usable tools while leaving product-specific visuals and rules with the merchant.

## Product Principles

1. **Chat is the primary creation interface.** The shopper should be able to direct a normal design journey without manually operating the customizer controls.
2. **The merchant's page remains the visual workspace.** The agent updates the same renderer and product state the shopper would otherwise use.
3. **Visual output returns to chat.** After each coherent proposal or revision, the conversation receives a meaningful fresh visual preview. A text-only change report is insufficient.
4. **Live means coherent live design, not frame spam.** The browser canvas changes while the agent works. Chat receives a preview after each meaningful proposal or conversational revision, not after every low-level field mutation.
5. **Full creative/configuration parity is integration-specific.** For each claimed integration, every customer-editable creative or configuration control in the versioned capability inventory must be agent-proposable. Hidden administration and forbidden commercial actions are not customer design controls.
6. **The agent proposes; the human authorizes persistence.** Proposals remain temporary until explicit, action-time human confirmation. The exact confirmation surface will be resolved in the PRD and security specification, but it must support a chat-first journey and retain a visible page fallback.
7. **Existing human behavior remains intact.** Normal browsing, editing, rendering, autosave, drafts, uploads, and merchant workflows must continue to work when no agent proposal is active.
8. **Merchant rules remain authoritative.** The agent does not invent allowed values, bypass dependencies, or pretend that an incomplete design is production-ready.
9. **The reusable layer is public; private merchant logic stays private.** The package receives only sanitized canonical state and narrow adapter functions.
10. **Claims follow evidence.** Compatibility is claimed only for tested browsers, agent hosts, and merchant integrations.

## Core Workflow

### 1. Start with a shopping/design need

The shopper begins in ChatGPT or another compatible agent client with a natural-language brief. The challenge does not build a merchant marketplace or ranking engine. The agent may already know or be given the relevant KORRHAUS or tote surface.

### 2. Open the appropriate merchant customizer

The agent opens the known Shopify customizer or public reference demo. The page exposes CoDesign WebMCP tools only when the capability is enabled and supported.

### 3. Read the live context

The agent reads a sanitized canonical representation of:

- Current product configuration.
- Customer-visible designs or variants.
- Current quantities.
- Agent-writable capability groups.
- Allowed values and public dependency information.
- Current proposal and revision status.
- Public-safe production-readiness signals.

It does not receive the merchant's raw state object, private APIs, customer records, pricing formulas, or administrative data.

### 4. Create a complete first direction

Unless an essential decision makes a credible proposal impossible, the agent creates a strong complete first design rather than interrogating the shopper field by field. It coordinates all relevant controls atomically.

Depending on the integration, this includes:

- Product material and construction choices.
- Colors, yarns, handles, components, and finishes.
- Patterns, text, typography, motifs, and artwork slots.
- Placement, scale, orientation, and other visual layout controls.
- Grip, print, embroidery, packaging, or comparable product-specific choices.
- Quantities and multiple designs or colourways.
- Customer-visible names and personalization fields.

### 5. Render the proposal live without persisting it

The adapter stages a proposal against the confirmed current revision and updates the merchant's existing visual renderer. Proposal isolation prevents current autosave or other normal persistence paths from treating the temporary design as committed state.

### 6. Return a visual result to the conversation

After the coherent proposal renders, the agent returns a meaningful visual preview to chat together with a concise summary of choices, assumptions, validation findings, and missing decisions.

This is an early feasibility gate: the supported host must be shown returning an actual useful visual result, not merely a textual statement that the page changed.

### 7. Iterate conversationally

The shopper can say:

- Make it feel more premium.
- Use less pink.
- Make the logo smaller.
- Move the artwork to the upper left.
- Make a darker staff version.
- Split 120 pairs evenly across two colourways.

The agent rereads when needed, applies a coherent revision, updates the same page, and returns the refreshed visual result to chat.

### 8. Validate configuration and readiness

The system distinguishes:

- Invalid or impossible combinations, which are rejected atomically.
- Coherent drafts with missing decisions, which may still be reviewed.
- Warnings or production notes.
- Production-ready designs.

No partial invalid proposal should remain visible or saved after a failed operation.

### 9. Human decision

The shopper explicitly chooses to keep or revert the staged work. Persistence requires action-time human confirmation and must be attributable to the pending proposal and current revision. Revert restores the exact baseline without a write.

### 10. Stop at the challenge commercial boundary

The challenge experience does not submit an order, accept a quote, take payment, expose private prices, or enter merchant administration. Those actions remain outside the public WebMCP scope under the current project rules.

## What We Are Building

### A. Reusable CoDesign WebMCP package

A real open-source TypeScript implementation containing:

- Canonical configuration and capability types.
- A versioned manifest contract.
- Manifest validation and semantic option identifiers.
- A sanitized merchant adapter interface.
- WebMCP tool registration and lifecycle handling.
- Coordinated proposal creation and revision behavior.
- Revision and stale-state protection.
- Proposal diff normalization.
- Constraint, decision-required, warning, and readiness results.
- Preview-result support for both the page and conversation.
- Explicit human-confirmation hooks for Keep/Revert.
- Autosave/persistence isolation contracts.
- Sanitized errors and cancellation behavior.
- Framework-neutral integration and review primitives.
- Deterministic contract tests.

The core must remain product-agnostic. Product values, rendering, complex production rules, and private persistence stay in the adapter.

### B. Manifest and adapter integration model

The public contract must let a merchant describe:

- Customer-editable capability groups.
- Allowed values, bounds, labels, and agent descriptions.
- Visibility, dependencies, and coupled constraints.
- Preview regions and design/variant scope.
- Multi-design and cloning support.
- Artwork or asset slots and allowed agent operations.
- Validation and readiness hooks.
- Snapshot, preview, restore, and confirmed commit behavior.
- Human confirmation requirements.

The reference documentation must make the integration credible from a clean clone. It does not have to make integration zero-code.

### C. Stable public studio-tote submission demo

The studio tote is the official reproducible challenge surface. It must be a genuine creative customizer, not merely a form followed by a text review.

The agent must be able to propose every customer-editable control exposed in the tote UI, including the final versioned inventory of:

- Tote material or canvas weight.
- Tote color.
- Handle style and any exposed handle color.
- Print or decoration method.
- Text content and exposed typography choices.
- Motif or artwork slot.
- Placement, scale, and orientation controls that the human UI exposes.
- Quantity.
- Multiple variants and quantity splits.
- Variant names or other customer-visible personalization fields.

The tote must use the same core transaction, validation, preview, and confirmation behavior as KORRHAUS. Tote-specific behavior belongs in the tote manifest, adapter, renderer, and validation hooks.

### D. Real KORRHAUS commercial proof

The existing Shopify Sock Designer is the only KORRHAUS integration. No second public Sock Designer will be submitted.

At the version chosen for integration, create a customer-facing capability inventory and require proposal parity for every current human-editable creative/configuration control. This includes all applicable:

- Design and colourway creation.
- Quantity and allocation controls.
- Yarn, color, accent, pattern, cuff, grip, or construction choices.
- Text, name, logo, artwork, packaging, and personalization controls.
- Placement, scale, rotation, transformation, and other visible asset controls.
- Any additional customer-editable control found in the versioned inventory.

KORRHAUS remains free to continue normal development. The challenge evidence must identify the tested version, capability inventory, public package version, and verification date. The mutable KORRHAUS site is supporting live proof, not the only required judge URL.

### E. Visual result contract

The challenge must prove two synchronized outputs:

1. The live merchant/customizer preview changes visibly.
2. Chat receives a fresh useful visual preview after each coherent proposal or revision.

The PRD/spec phase must define the supported image/result format, lifecycle, size limits, accessibility text, failure fallback, and host-specific verification method.

### F. Safety and human control

- Agent proposals do not trigger normal autosave.
- Proposal batches are atomic.
- External state changes invalidate stale proposals.
- Revert performs no write and restores the exact confirmed baseline.
- Keep or confirmed persistence happens once and only after explicit human confirmation.
- The agent cannot bypass confirmation through another tool.
- Errors never expose private raw state or implementation details.
- Normal human editing remains available when proposal mode is absent.

### G. Evidence and reproducibility

- Public source with a visible open-source license.
- Clean-clone runnable tote instructions.
- Integration guide and minimal merchant adapter walkthrough.
- Manifest and adapter examples.
- Deterministic unit and contract tests.
- Negative safety and invalid-constraint cases.
- Actual supported-browser verification.
- Timestamped distinction between pre-existing KORRHAUS work and challenge work.
- Version/hash evidence linking the public core, tote build, and tested KORRHAUS integration.

## What We Are Not Building

### Product and platform exclusions

- A merchant marketplace, comparison engine, recommendation system, or general product-discovery service.
- A replacement Shopify catalog, cart, checkout, or order system.
- A universal visual renderer.
- A universal manufacturing-rule language.
- A zero-code Shopify App Store installer.
- Automatic adapter generation for arbitrary customizers.
- A merchant onboarding dashboard or manifest authoring studio.
- Guaranteed compatibility with every Shopify customizer.
- A third product demo.
- A second or synthetic public KORRHAUS Sock Designer.
- A general-purpose image-generation model or asset-editing service. CoDesign may transport and apply an asset created by the shopper or agent, but it does not become the generator itself.

### Commercial and private-data exclusions

Under the current project rules, WebMCP will not:

- Submit an order.
- Start or complete payment.
- Accept a quote or production proof.
- Submit a wholesale application.
- Expose confidential pricing, margins, discounts, or formulas.
- Expose customer records or unrelated saved projects.
- Expose supplier, production, authentication, or administrative data.
- Invoke private merchant workflows unrelated to configuring and safely persisting the customer's current design.

The architecture may preserve a separately governed future extension point, but these actions are not part of the challenge implementation or claims.

### Claim exclusions

- Do not call CoDesign WebMCP a universal protocol adopted by Shopify merchants; call it a reusable open-source foundation or integration layer.
- Do not claim Claude, ChatGPT, or another client works unless that exact client and workflow has been verified.
- Do not claim KORRHAUS production behavior from a local, synthetic, mocked, zero-traffic, or stale deployment.
- Do not present a text summary as proof of an in-chat visual preview.
- Do not present source inspection or automated tests alone as proof of the final user experience.

## Inspiration And References

### Canva/Figma-style conversational co-creation

The relevant quality is not their feature set; it is the interaction model: the user gives art direction while a shared visual canvas changes. CoDesign applies that spirit to a real commerce surface owned by a merchant.

### Shopify's agentic commerce direction

Shopify's existing agent capabilities establish that agents can help shoppers discover and transact around products. CoDesign focuses on the specialized gap between arriving at a customizable product and completing a coherent made-to-order design.

### Adapter-driven infrastructure

The integration should feel like a focused developer protocol: stable public types and lifecycle rules on one side, merchant-specific callbacks on the other. Merchants do not surrender their renderer or private backend to gain interoperability.

### KORRHAUS operational reality

KORRHAUS makes the impact case credible. Its existing Sock Designer has real customer-facing controls, autosave behavior, visual rendering, artwork concerns, production rules, and an evolving commercial application. The challenge layer must enhance that system without freezing or replacing it.

## Demo Path

### Submitted studio-tote journey

1. Begin in ChatGPT with a natural-language brief such as:

   > Create 100 studio totes for North Form. Make 60 natural canvas totes with long handles and a centered, understated NORTH FORM mark. Make 40 charcoal staff totes with short handles and a smaller upper-left mark. Keep the decoration suitable for a one-colour print and make the overall result feel premium.

2. The agent opens the public studio-tote customizer.
3. The agent reads the live configuration and only the relevant manifest capabilities.
4. The agent creates two coordinated variants with the requested 60/40 quantity split.
5. The existing tote renderer visibly updates while the proposal remains temporary.
6. Chat receives a visual preview plus a concise explanation of choices, assumptions, and production-readiness findings.
7. The shopper says:

   > Make the staff version less severe, reduce the mark by 15%, and use the longer handles after all.

8. The agent updates the same variant, the browser renderer changes, and chat receives the refreshed preview.
9. The validator reports any missing final artwork or production decision without pretending the design is complete.
10. The human explicitly keeps or reverts the proposal.
11. A negative case requests an invalid quantity/print combination; the batch is rejected atomically and neither preview nor persisted state is partially changed.

### KORRHAUS live-proof journey

1. Start with an intent-led custom grip-sock brief.
2. Open the real KORRHAUS Shopify Sock Designer.
3. Have the agent create a complete first direction using the current customer-editable capability inventory.
4. Show live visual changes for multiple coordinated controls and, where applicable, multiple colourways.
5. Refine the design conversationally, including text, logo/artwork treatment, placement, quantities, grip, and packaging choices supported by the current UI.
6. Return the resulting sock preview to chat.
7. Demonstrate validation and explicit human confirmation without exposing or invoking forbidden commercial/private workflows.

KORRHAUS may appear in the video and documentation as real-business evidence, but the stable tote URL and public source remain sufficient for reproducible judging.

### First-15-seconds judge moment

The judge should see a shopper type one normal sentence in chat and then see a real product design appear or materially transform—not a dashboard, tool log, or wall of proposal text.

The message is:

> Chat is now the creation interface for customizable Shopify products.

## Submission Story

### Product narrative

1. Shopify merchants already have specialized visual customizers.
2. Shoppers still have to learn those interfaces and coordinate many dependent choices.
3. Agents can understand intent, but merchants should not rebuild their designers for every agent client.
4. CoDesign WebMCP exposes the merchant's real capabilities through a reusable WebMCP manifest and adapter.
5. The agent creates and refines the product in the existing live renderer.
6. The visual result also returns to chat.
7. Merchant validation and human confirmation preserve trust.
8. The public tote proves reproducibility; KORRHAUS proves commercial relevance.

### Shopify “aha”

> Shopify gets the shopper to the customizable product. CoDesign WebMCP helps the shopper actually design it.

### Judging-criteria alignment

**WebMCP Leverage**

- Multiple real webpage-registered tools generated from merchant capabilities.
- Read, propose, revise, validate, preview, and confirmation-aware lifecycle behavior.
- Non-trivial state, revision, cancellation, error, and safety handling.
- Actual browser/agent verification rather than a simulated chatbot.

**Execution**

- A stable public tote experience with live visual output and conversational iteration.
- A real KORRHAUS integration showing the layer inside an operating Shopify business.
- Normal human UI, deterministic tests, negative cases, and reproducible instructions.

**Potential Impact**

- Saves shoppers from learning a specialized designer.
- Lets merchants reuse their current visual and production investment.
- Creates a credible developer path for the long tail of made-to-order Shopify products.

**Creativity & Ambition**

- Joins commerce discovery, conversational art direction, live product rendering, and production-aware configuration.
- Treats the merchant customizer as an agent-operable creative workspace instead of replacing it with a generic chat form.
- Demonstrates portability without making a false universal-renderer claim.

## Scope Acceptance Criteria

The scope is satisfied only when evidence shows:

1. A shopper can start in chat and produce a complete first tote proposal without manually operating the tote controls.
2. Every customer-editable tote control in the versioned capability inventory is agent-proposable.
3. The tote browser canvas visibly updates for a coherent multi-control proposal.
4. Chat receives an actual useful visual preview after the proposal and after a conversational refinement.
5. A second variant can be created and quantities remain internally consistent.
6. Invalid coupled rules reject atomically with no partial preview or write.
7. Proposal preview does not trigger normal autosave or persistence.
8. Revert restores the exact baseline without a write.
9. Confirmed Keep persists exactly once through the authorized path.
10. The same public core runs the tote and the versioned KORRHAUS integration without product-specific changes to the core.
11. KORRHAUS exposes proposal parity for the agreed versioned inventory of current customer-editable creative/configuration controls.
12. Normal non-agent browsing and editing remain functional.
13. A clean clone can build, test, and run the public tote demo.
14. Public evidence distinguishes challenge work from the pre-existing KORRHAUS application.
15. No forbidden private or commercial data/action becomes available through WebMCP.
16. The final experience is verified through the supported agent/browser surface rather than inferred from source or automated tests.

## Feasibility Gates And Assumptions

### Gate 1 — true in-chat visual preview

Before expanding polish, prove the supported host can receive and display a useful image or equivalent visual result from the WebMCP workflow. If the host cannot support this exact path, the limitation must be surfaced immediately and the product decision revisited; it must not be disguised with text.

### Gate 2 — versioned control inventories

Create explicit inventories for tote and KORRHAUS. “Full parity” is tested against those inventories, not against an undefined claim.

### Gate 3 — asset pathway

Prove a public-safe pathway for a user-provided or agent-created motif/artwork to enter a temporary proposal, render, and be reverted without contaminating normal uploads or persistence. CoDesign does not need to generate the artwork itself.

### Gate 4 — KORRHAUS autosave isolation

Temporary agent work must remain isolated from existing drafts, autosave, logo uploads, notifications, and customer activity. KORRHAUS customer traffic cannot be used as an uncontrolled experiment.

### Gate 5 — host and client claims

The long-term protocol is intended to be agent-client neutral. Challenge claims remain limited to the exact ChatGPT/browser and any additional clients actually verified.

## Scope-Cut Order

If time or browser support forces reductions, cut in this order:

1. Claims and verification for additional agent clients beyond the primary supported host.
2. Additional merchant onboarding polish beyond the package, manifest, adapter, and integration guide.
3. Non-essential landing-page animation, marketing polish, and extra demo variants.
4. Additional declarative rule-language features; keep complex rules in adapter hooks.
5. Optional KORRHAUS showcase branches that are not needed to prove the versioned parity inventory.

Do not cut:

- The stable public tote submission.
- The reusable manifest and adapter contract.
- Live visual changes in the merchant renderer.
- Meaningful visual previews returned to chat.
- Conversational revision.
- Full tote control parity.
- KORRHAUS as real-business evidence.
- Proposal isolation and explicit human confirmation.
- Actual-browser verification.

## Existing Work: Retained Versus Superseded

### Retain

- The public/private adapter boundary.
- Sanitized canonical state.
- Manifest-driven capabilities.
- Revision-aware proposal transactions.
- Autosave isolation.
- Atomic validation and rollback.
- Keep/Revert safety principles.
- The tote/KORRHAUS two-surface strategy.
- Deterministic and actual-browser evidence discipline.

### Supersede as the finish line

- A narrow handful of hard-coded sock fields.
- An eight-option model presented as merchant parity.
- Read-only artwork status with no creative asset pathway.
- A text-heavy review panel as the primary experience.
- Browser-only visual feedback with no meaningful in-chat preview.
- A scripted two-colourway prompt as the entire product ambition.
- Any claim that the existing narrow prototype already satisfies the revised product scope.

The existing transaction and safety work may be a useful technical foundation, but it does not by itself constitute the newly scoped product.

## Approval Boundary

This scope document authorizes the next planning step: a user-facing PRD. It does not authorize implementation, deployment, publication, Devpost submission, or modification of the private production KORRHAUS project.

Implementation may begin only after the revised PRD, technical specification, architecture, security boundaries, and checklist have been reviewed against the current `AGENTS.md` approval gate and explicitly approved by Felix.
