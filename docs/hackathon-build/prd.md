# Product Requirements Document

**Product:** CoDesign Commerce
**Document stage:** User-facing requirements for technical specification
**Date:** 27 August 2026
**Authority:** Expands `scope.md`; does not authorize implementation or production changes

## Product Summary

CoDesign Commerce makes chat the primary creation interface for customizable products sold through Shopify merchants.

A shopper begins with a normal need:

> I need custom grip socks for my Pilates studio.

The agent first presents suitable customizable-product options. After the shopper chooses a merchant/product, the agent opens that merchant's existing customizer, creates a complete first design, updates the live visual renderer, returns useful visual previews to chat, accepts conversational art direction, checks the merchant's real constraints, and saves only after explicit human confirmation.

The merchant does not replace its visual experience. CoDesign Commerce adds an agentic interaction layer around the customizer the merchant already owns.

### Product promise to shoppers

> Describe what you want, see it designed, refine it in conversation, and save it without learning the designer.

### Product promise to merchants

> Make your existing custom-product designer operable by compatible agents without publishing your private renderer, backend, customer data, or commercial logic.

### Challenge proposition

The challenge version proves that this can be both:

- A reusable open-source integration model.
- A complete, coherent visual product experience.
- Safe around temporary state and persistence.
- Credible inside a real operating Shopify merchant.

It does not claim universal adoption, zero-code installation, or support for every customizer.

## Two Product Surfaces, One Shared Layer

The tote and KORRHAUS are intentionally different. They must never be presented as duplicate websites, competing demos, or two versions of the same Sock Designer.

### Studio tote website

- A fictional public reference merchant/customizer.
- The stable, versioned Devpost judge surface.
- Fully reproducible from the public repository.
- Safe to freeze for challenge judging.
- Contains only public demonstration data.
- Includes its own tote-specific human UI, renderer, product options, and rules.
- Demonstrates every customer-editable control exposed by that reference UI.
- Does not claim to be a real merchant or a universal renderer.
- Does not share KORRHAUS branding, customer data, business logic, or backend.

### KORRHAUS

- The real operating Shopify merchant and Custom Sock Designer.
- The commercial proof that CoDesign Commerce can enhance an existing customizer.
- Continues normal business and product development.
- Is not frozen as the sole challenge URL.
- Keeps its renderer, raw state, persistence, customer access, pricing, artwork backend, and operational logic private.
- Consumes the public CoDesign layer through a narrow merchant adapter.
- Demonstrates proposal parity against a versioned inventory of current customer-editable controls.
- Appears in challenge evidence as an actual live integration, with version and verification date stated honestly.

### Shared CoDesign behavior

Both surfaces use the same product-level contract for:

- Reading customer-visible configuration.
- Describing available customer-editable capabilities.
- Creating coordinated proposals.
- Rendering proposals in the merchant's existing visual surface.
- Returning meaningful visual previews to chat.
- Conversational revision.
- Validation and readiness messaging.
- Temporary-state isolation.
- Human confirmation before persistence.
- Recovery from stale, interrupted, or failed proposals.

The two surfaces do not share product-specific controls, visuals, data, or business rules.

## Product Goals

### Shopper goals

1. Let a shopper begin with intent rather than configuration terminology.
2. Show suitable customizable-product options before opening a merchant site.
3. Create a credible complete first design with minimal questioning.
4. Let the shopper art-direct the result in ordinary language.
5. Keep visual results visible in chat as well as on the merchant page.
6. Let the shopper compare and refine multiple variants without learning the customizer.
7. Make assumptions, warnings, and missing inputs understandable.
8. Save only the exact design the shopper has seen and confirmed.

### Merchant goals

1. Add agent participation without replacing the existing customizer.
2. Preserve the existing non-agent customer journey.
3. Preserve merchant-owned rendering and rules.
4. Prevent temporary proposals from contaminating autosave or normal drafts.
5. Expose only customer-safe, configuration-relevant capabilities.
6. Provide a credible developer integration path through a package, manifest, adapter, and guide.
7. Demonstrate parity with the merchant's declared customer-editable controls.

### Challenge goals

1. Make the judge understand the product in the first 15 seconds.
2. Show non-trivial WebMCP use through a working visual flow.
3. Prove a stable public demo and a real commercial integration.
4. Prove portability without claiming universality.
5. Provide repeatable evidence from a clean clone and supported browser.

## Non-Goals

The challenge product does not:

- Build a merchant marketplace or recommendation engine.
- Replace the host agent's normal product discovery capabilities.
- Build a universal visual renderer.
- Provide zero-code installation.
- Automatically adapt arbitrary customizers.
- Build a merchant onboarding dashboard.
- Build a general-purpose artwork generator.
- Submit orders.
- Accept quotes.
- Start or complete payment.
- Submit wholesale applications.
- Accept production proofs.
- Expose confidential prices, price formulas, margins, discounts, customer records, supplier data, or administrative systems.
- Guarantee support for agent clients that were not verified.
- Create a second public KORRHAUS Sock Designer.

## Target User

### Shopper: studio owner

A Pilates, yoga, fitness, dance, or creative-studio owner who wants branded products for a studio, team, opening, event, or retail corner.

Typical needs:

- Does not know the merchant's full option vocabulary.
- Has a brand feeling but may not have final artwork.
- Wants to see a strong direction quickly.
- May need multiple colourways or staff/member variants.
- Wants the agent to handle configuration detail.
- Wants to stay in chat while the browser works in the background.

### Shopper: small brand or community

A founder, team, club, or community creating made-to-order merchandise without a specialist designer.

Typical needs:

- Starts from a written brief or logo.
- Wants rapid visual alternatives.
- Gives subjective direction such as “more premium” or “less severe.”
- Needs merchant rules translated into plain language.

### Merchant developer

A developer maintaining a custom product experience inside or adjacent to Shopify.

Typical needs:

- Keep the current UI and renderer.
- Keep product-specific logic private.
- Expose a clear capability inventory.
- Map safe configuration reads, previews, validation, restore, and confirmed save behavior.
- Test that every intended customer control is represented.
- Verify that ordinary human use remains unchanged.

### Merchant product owner

A merchant operator deciding whether CoDesign Commerce is useful and safe.

Typical needs:

- More useful agent-originated traffic.
- Less shopper friction in complex product design.
- No interference with existing customer activity.
- No exposure of confidential operations.
- A clear view of which controls and actions the agent can access.

### Challenge judge

A reviewer with limited time who needs immediate proof of:

- Real WebMCP behavior.
- A visual and coherent experience.
- Reusable open-source work.
- Real-world relevance.
- Safe boundaries and honest claims.

## Experience Principles

### Chat-first, not chat-only theater

The shopper should be able to direct the normal journey from chat. The agent must actually operate the merchant's live customizer rather than merely describing what it would change.

### Visual before verbose

The visual product result is primary. Explanations should be short, useful, and subordinate to the preview.

### Complete first direction

The agent should create a strong complete proposal from the available brief. It asks a question only if the missing answer genuinely prevents a credible design.

### Merchant-valid creativity

The agent may choose and combine any state the merchant's normal human customizer can represent. It must not invent limitations that the merchant has not declared.

### Visible assumptions

Tasteful defaults are welcome. Material assumptions that affected the result must be stated after the proposal, not hidden.

### Human-owned saving

The shopper must explicitly confirm saving the exact proposal they inspected. A conversational refinement or casual “looks good” must not save implicitly.

### Normal human UI survives

The customizer remains usable without an agent. Agent mode must not make the ordinary experience dependent on WebMCP.

## Core User Journey

### Phase 1 — express intent

The shopper tells ChatGPT what they need in their own words.

Example:

> I need grip socks for my reformer studio. Something warm and premium, probably two colourways for members and instructors.

Expected user experience:

- ChatGPT acknowledges the goal.
- ChatGPT does not immediately open a random designer.
- The shopper does not need to know yarn, pattern, grip, or production terminology.

### Phase 2 — review suitable options

ChatGPT presents suitable customizable products or merchants using its existing discovery capabilities.

Expected user experience:

- Options appear before any customizer is operated.
- Each option is understandable in normal shopping language.
- The customer chooses which merchant/product to use.
- CoDesign Commerce is not represented as the discovery engine.
- The challenge demo may use a known KORRHAUS or tote choice without building a marketplace.

### Phase 3 — open the selected customizer

After selection, ChatGPT opens the matching customizable-product page.

Expected user experience:

- The agent states which product is being opened.
- The webpage opens in the foreground or background according to the host experience.
- The shopper may remain in chat.
- If the page cannot be opened or is not compatible, chat explains the issue without pretending design work began.

### Phase 4 — read context and show progress

The agent reads the selected customizer's customer-visible state and capabilities.

Expected progress updates:

- “Opening the selected customizer.”
- “Creating your first direction.”
- “Checking the available options and design rules.”

Progress language must:

- Stay short.
- Avoid tool names and implementation logs.
- Never imply saving has occurred.
- Stop if the page or session is unavailable.

### Phase 5 — create the complete first proposal

The agent turns the brief into a coherent design using the selected merchant's actual controls.

Expected user experience:

- A vague brief receives tasteful defaults.
- The proposal uses every relevant control needed for a coherent direction.
- The agent asks only when blocked.
- If no logo exists, the studio/customer name becomes the temporary identity.
- Final logo artwork may be described as an optional later improvement rather than a reason to stop.
- When the brief asks for multiple designs, all requested variants are created coherently.
- Quantity splits are internally consistent.
- Proposal changes remain temporary.

### Phase 6 — show live visual results

The merchant's existing renderer visibly updates while the proposal is staged.

Expected user experience:

- The product visibly changes, rather than only a text panel appearing.
- Multiple designs/colourways can be inspected individually.
- The browser page indicates that the design is a temporary agent proposal.
- The shopper can understand which variant is being viewed.
- Normal merchant branding and visual context remain intact.

### Phase 7 — return the result to chat

ChatGPT presents a meaningful visual result after the coherent proposal is ready.

The chat result contains:

- One useful visual preview for each design or colourway.
- A short creative-direction explanation.
- Important assumptions.
- Merchant-declared warnings or missing decisions.
- A clear statement that the design is not yet saved.
- An invitation to refine it conversationally.

The chat result does not lead with:

- Raw tool output.
- Long configuration tables.
- Internal IDs.
- A wall of validation text.
- Claims that the result is saved or ordered.

### Phase 8 — refine conversationally

The shopper gives normal-language direction.

Examples:

- Make the staff version less severe.
- Reduce the logo by 15%.
- Use long handles on both.
- Keep the first colourway but make the second darker.
- Move the name to the upper left.
- Give the sock more contrast at the cuff.

Expected user experience:

- The agent understands which design the instruction refers to when context is clear.
- If the target is ambiguous, the agent asks which design to change.
- Unaffected designs remain unchanged.
- The browser renderer updates the relevant design.
- Chat receives a refreshed preview.
- The revised proposal remains temporary.

### Phase 9 — review readiness and warnings

The agent explains merchant-provided design/production information.

Expected user experience:

- Representable designs are allowed.
- Merchant-declared production considerations appear as warnings when they do not prevent design.
- Missing final artwork does not block a named temporary direction.
- Truly invalid or unavailable states are not partially applied.
- The agent does not invent minimums, restrictions, or readiness claims.

### Phase 10 — save or discard

The primary save decision happens in ChatGPT.

Expected save flow:

1. The shopper says they want to keep the proposal.
2. ChatGPT identifies the exact pending proposal/design set.
3. ChatGPT asks for explicit action-time confirmation to save it.
4. The shopper confirms.
5. The design saves once.
6. Chat returns the final preview and a clear “Saved as a design” confirmation.

Expected discard flow:

1. The shopper asks to revert or discard.
2. The exact pre-proposal design is restored.
3. Chat confirms that the temporary proposal was discarded and not saved.

The webpage retains visible Keep/Revert controls as a fallback for customers already viewing the page or recovering from a chat limitation.

### Phase 11 — continue without ordering

After saving, the shopper may continue refining the design conversationally.

The challenge experience does not move into order, quote, checkout, or payment actions.

## Product States

### No product selected

- Chat presents suitable options.
- No merchant page is controlled.
- No CoDesign proposal exists.

### Product selected, customizer unopened

- Chat states the selected product.
- The agent is preparing to open the merchant page.
- No design claims are made yet.

### Customizer ready

- The page is open and compatible.
- Customer-visible state is readable.
- No proposal is pending.
- Normal human editing remains possible.

### Proposal in progress

- Chat shows short progress language.
- The page may visibly update as a coherent proposal is applied.
- The result is not saved.
- Save confirmation is unavailable until an inspectable preview exists.

### Proposal ready for review

- Browser preview is visible.
- Chat visual preview is available.
- Assumptions and warnings are shown.
- The proposal is explicitly marked temporary.
- Refinement, confirmed save, or discard are available.

### Proposal stale

- A newer human or external change has occurred.
- The agent does not overwrite it.
- Chat asks whether to incorporate the newer change.
- Saving the stale proposal is unavailable.

### Proposal interrupted

- The browser closed, refreshed incompatibly, or lost its temporary state.
- Chat says the proposal was not saved.
- The shopper may ask to recreate it from the conversation.

### Preview unavailable

- A page change may have occurred, but chat cannot show an inspectable result.
- Saving remains unavailable.
- Chat explains that the preview could not be retrieved.
- The shopper may retry or inspect the webpage.

### Save confirmation required

- Chat identifies the exact design/proposal.
- The action and consequence are stated plainly.
- No saving occurs until confirmation.

### Saved

- Chat shows the final preview.
- Chat clearly confirms the saved design.
- Further refinement remains possible.
- Ordering/payment do not begin.

### Reverted

- The exact baseline is visible again.
- Chat confirms that no proposal was saved.

## Epics And User Stories

### Epic 1: Choose the right customizable product

#### Story 1.1 — see options before navigation

- As a shopper, I want to see suitable customizable-product options before a merchant page opens so that I remain in control of where the design journey happens.

Acceptance criteria:

- Chat responds to an intent-led request with understandable options.
- No customizer is opened before the shopper selects an option.
- Options identify the product and merchant clearly enough to choose.
- CoDesign Commerce is not described as the product search engine.
- The challenge experience can begin from a known selected option without claiming a merchant marketplace was built.

#### Story 1.2 — select a compatible option

- As a shopper, I want my selection to open the matching customizer so that the agent works in the correct merchant experience.

Acceptance criteria:

- The selected product is repeated back before navigation.
- The opened page matches the selected product.
- A failure to open is reported before design progress is claimed.
- An unsupported page produces an honest compatibility message.

### Epic 2: Understand what the agent is doing

#### Story 2.1 — receive concise progress

- As a shopper, I want short progress updates so that I know the agent is working without reading technical logs.

Acceptance criteria:

- Chat shows two or three meaningful progress updates during a normal first proposal.
- Progress mentions the customer task, not WebMCP tool names.
- Progress never says “saved,” “ordered,” or “complete” before those states exist.
- Repeated internal operations do not flood the conversation.

#### Story 2.2 — understand temporary status

- As a shopper, I want to know that the design is a temporary proposal so that I do not mistake a preview for saved work.

Acceptance criteria:

- Chat labels the first visual result as not yet saved.
- The webpage visibly communicates temporary proposal status.
- Save and discard choices are understandable without reading documentation.

### Epic 3: Receive a complete first design

#### Story 3.1 — start from a vague brief

- As a shopper, I want the agent to make tasteful choices from a vague brief so that I receive something useful without answering a long questionnaire.

Acceptance criteria:

- A brief containing audience, desired feeling, and product type is sufficient to create a first proposal when the merchant supports the necessary options.
- The agent selects merchant-valid defaults.
- Material assumptions appear after the visual result.
- The agent asks only when a credible design cannot otherwise be made.

#### Story 3.2 — use a studio name without a logo

- As a shopper without final artwork, I want the agent to use my studio name so that the design journey can continue.

Acceptance criteria:

- The provided studio/customer name appears in the visual proposal.
- The result does not invent a claim that final artwork was uploaded.
- The agent may state that a final logo can be added later.
- Missing artwork does not block saving a merchant-valid draft.

#### Story 3.3 — apply all relevant controls

- As a shopper, I want the agent to operate every customer-editable design control available for the selected integration so that I do not need to finish the design manually.

Acceptance criteria:

- Each integration has a versioned customer-control inventory.
- Every creative/configuration control in the inventory is agent-proposable.
- Hidden administration is not counted as a customer control.
- The acceptance test compares the agent capability inventory with the actual visible human controls.
- Missing parity is reported as an incomplete integration, not concealed.

#### Story 3.4 — create multiple designs

- As a shopper, I want the agent to create multiple variants or colourways so that a collection can be designed in one conversation.

Acceptance criteria:

- A brief requesting two variants produces two distinct named designs.
- Requested quantities are distributed consistently.
- Each variant receives its own visual preview.
- The shopper can refer to each variant by its visible name.
- A later change to one variant does not alter the other unless requested.

### Epic 4: See the design live

#### Story 4.1 — watch the merchant renderer update

- As a shopper viewing the page, I want the existing product preview to change so that the agent's work feels real and inspectable.

Acceptance criteria:

- A coherent proposal materially changes the visible product.
- The agent does not replace the merchant experience with a generic text panel.
- Variant switching shows the correct proposed variant.
- The page remains recognizably the merchant's customizer.

#### Story 4.2 — receive previews in chat

- As a shopper staying in chat, I want visual previews returned to the conversation so that I do not have to monitor the browser tab.

Acceptance criteria:

- Chat receives a useful visual preview after the first proposal.
- Chat receives an updated visual preview after a refinement.
- Each requested variant is represented.
- Previews are large/clear enough to inspect the requested design difference.
- Useful accessibility text identifies product, variant, and major direction.
- A text-only success message does not satisfy this story.

#### Story 4.3 — prioritize visuals over configuration text

- As a shopper, I want the result to lead with the design so that the experience feels creative rather than administrative.

Acceptance criteria:

- The visual preview appears before long explanations.
- The accompanying explanation is concise.
- Raw option codes, internal IDs, and tool traces are absent.
- Warnings do not visually overwhelm the product unless the design is truly invalid.

### Epic 5: Refine by conversation

#### Story 5.1 — give subjective art direction

- As a shopper, I want to say “more premium” or “less pink” so that I can refine the result naturally.

Acceptance criteria:

- The agent translates subjective direction into merchant-valid changes.
- The changed design visibly differs in the requested direction.
- The agent briefly explains the interpretation when it materially affected the result.
- The result remains temporary until confirmed.

#### Story 5.2 — target one named variant

- As a shopper, I want to change one variant by name so that the rest of the collection remains stable.

Acceptance criteria:

- A named-variant instruction changes only that variant.
- Unchanged variants retain their prior state and preview.
- Chat returns the changed preview and enough context to identify it.

#### Story 5.3 — resolve ambiguous targets

- As a shopper, I want the agent to ask which design I mean when the target is unclear so that it does not guess destructively.

Acceptance criteria:

- Ambiguous multi-variant instructions trigger one focused clarification.
- No variant is modified before clarification.
- The question names the available variants.

#### Story 5.4 — position and transform creative elements

- As a shopper, I want to direct text, motifs, and artwork placement so that visual design is not reduced to color selection.

Acceptance criteria:

- Any placement, scale, rotation, typography, or transformation control visible in the selected integration is agent-proposable.
- The preview visibly reflects the requested transformation.
- Unsupported transformations are reported honestly.
- Asset changes remain part of the temporary proposal until confirmed.

### Epic 6: Receive merchant-authoritative guidance

#### Story 6.1 — allow anything the human designer can represent

- As a shopper, I want the agent to use the same creative possibility space as the human customizer so that it does not invent arbitrary restrictions.

Acceptance criteria:

- A state accepted by the merchant's human interface may be proposed by the agent.
- CoDesign does not create additional minimums or constraints without merchant declaration.
- Merchant-provided production notes may still be shown.

#### Story 6.2 — distinguish invalid from cautionary

- As a shopper, I want invalid designs and production advice explained differently so that warnings do not unnecessarily block creativity.

Acceptance criteria:

- Unknown/unavailable controls, broken totals, stale state, or merchant-declared invalid combinations block the proposal.
- Production considerations that do not prevent design appear as warnings.
- Missing final artwork can remain a follow-up note when the named design is otherwise representable.
- Chat states whether the design is invalid, valid with notes, or ready according to merchant-provided status.

#### Story 6.3 — reject invalid changes atomically

- As a shopper, I want a failed request to leave my design intact so that I do not have to repair a half-applied proposal.

Acceptance criteria:

- An invalid coordinated request does not leave partial visible changes.
- Previously inspected proposal state remains intact or the exact baseline is restored.
- Chat identifies the invalid part in plain language.
- The agent may suggest representable alternatives without applying one silently.

### Epic 7: Protect human and merchant state

#### Story 7.1 — prevent proposal autosave

- As a merchant, I want agent proposals to remain temporary so that experimentation does not contaminate customer drafts or operational workflows.

Acceptance criteria:

- Creating and refining a proposal does not save the design.
- Proposal preview does not trigger ordinary autosave.
- The browser and chat both state that the result is temporary.
- Existing customer drafts remain unchanged until confirmation.

#### Story 7.2 — respect newer human changes

- As a shopper, I want my manual edits protected so that the agent does not overwrite work I made while it was active.

Acceptance criteria:

- A newer page change makes the pending proposal stale.
- The agent rereads the current design.
- Chat asks whether the shopper wants the human change incorporated.
- Saving the stale proposal is unavailable.
- No silent overwrite occurs.

#### Story 7.3 — recover from a closed browser

- As a shopper, I want to know whether an interrupted proposal was saved so that I do not rely on lost work.

Acceptance criteria:

- Closing or losing the browser before confirmation produces a clear “not saved” message.
- Chat offers to recreate the proposal from the conversation.
- The agent does not claim the page still contains the temporary state.

#### Story 7.4 — preserve normal non-agent use

- As a normal site visitor, I want the original customizer behavior so that CoDesign does not degrade ordinary browsing.

Acceptance criteria:

- The customizer works without WebMCP.
- No proposal review UI appears when no proposal exists.
- Human controls behave normally when proposal mode is inactive.
- Existing merchant persistence behavior remains authoritative outside proposal mode.

### Epic 8: Confirm and save safely from chat

#### Story 8.1 — inspect before saving

- As a shopper, I want to see the exact design before saving so that I understand what will be persisted.

Acceptance criteria:

- Save confirmation is unavailable until an inspectable visual result exists in chat or an explicitly acknowledged webpage fallback.
- The confirmation identifies the pending design or collection.
- Warnings still relevant to the save are visible.

#### Story 8.2 — confirm explicitly in chat

- As a shopper, I want to save from ChatGPT after clear confirmation so that I do not have to switch to the customizer.

Acceptance criteria:

- “Keep it” starts a confirmation step rather than immediately saving.
- Chat states the action: save the named pending design(s).
- Only an explicit confirmation performs the save.
- Ambiguous praise such as “nice” or “looks good” does not save.
- A duplicate confirmation does not create duplicate saves.

#### Story 8.3 — use page controls as fallback

- As a shopper already viewing the customizer, I want visible Keep/Revert controls so that I can recover if chat confirmation is unavailable.

Acceptance criteria:

- Keep/Revert are visible only while a proposal awaits review.
- Page Keep saves the same pending proposal once.
- Page Revert restores the exact baseline without a save.
- A decision on one surface is reflected on the other.

#### Story 8.4 — receive post-save proof

- As a shopper, I want chat to show what was saved so that the outcome is unambiguous.

Acceptance criteria:

- Chat shows the final saved preview.
- Chat clearly states “Saved as a design” or merchant-appropriate equivalent.
- Chat does not say “ordered,” “paid,” or “submitted.”
- Further design refinement remains available.

#### Story 8.5 — discard safely

- As a shopper, I want to discard a proposal so that experimentation remains reversible.

Acceptance criteria:

- Revert restores the exact pre-proposal visual state.
- No persistence occurs.
- Chat confirms the temporary proposal was discarded.
- The normal customizer remains usable afterward.

### Epic 9: Handle preview failures honestly

#### Story 9.1 — block saving an unseen result

- As a shopper, I want saving disabled when the preview cannot be inspected so that I do not commit unknown changes.

Acceptance criteria:

- A failed chat-preview result is reported clearly.
- Saving remains unavailable.
- The agent offers retry or webpage inspection.
- The agent does not claim completion merely because the page operation returned success.

#### Story 9.2 — recover after retry

- As a shopper, I want to retry preview generation without losing the proposal so that a display failure does not force a redesign.

Acceptance criteria:

- A retry can return the same pending proposal's current preview.
- No new save is created.
- The visual result is tied to the current proposal rather than a stale version.

### Epic 10: Give merchants a credible integration path

#### Story 10.1 — understand what to connect

- As a merchant developer, I want a clear integration guide so that I know which parts of my customizer remain mine and which parts CoDesign supplies.

Acceptance criteria:

- Documentation distinguishes public core, merchant manifest, merchant adapter, merchant renderer, and private backend.
- The guide explains read, preview, validate, restore, and confirmed save responsibilities.
- The guide does not require publishing private renderer or business logic.
- A clean-clone developer can run the tote reference.

#### Story 10.2 — declare the customer-control inventory

- As a merchant developer, I want to enumerate customer-editable controls so that agent parity can be tested rather than claimed vaguely.

Acceptance criteria:

- The integration has a versioned inventory.
- Each visible human design/configuration control maps to an agent capability.
- Controls intentionally outside the design surface are identified separately.
- Missing mappings fail the parity acceptance check.

#### Story 10.3 — keep the existing human interface

- As a merchant product owner, I want CoDesign added around my customizer so that customers still recognize and trust my experience.

Acceptance criteria:

- The merchant renderer remains the visual source.
- Merchant branding remains visible.
- CoDesign does not replace the product page with a generic standalone form.
- Non-agent customers use the original flow.

#### Story 10.4 — understand the safety boundary

- As a merchant product owner, I want a clear list of exposed and forbidden capabilities so that I can evaluate risk.

Acceptance criteria:

- The public capability list is documented.
- Customer records, confidential prices, margins, supplier data, administration, order, payment, quote, and proof actions are absent.
- The integration evidence shows that proposal previews do not trigger autosave.
- The merchant can disable or withhold the agent layer without breaking human use.

### Epic 11: Deliver the stable studio-tote reference

#### Story 11.1 — use the tote as the official judge surface

- As a judge, I want a stable public demo so that I can reproduce the complete experience after submission.

Acceptance criteria:

- The tote URL remains tied to a versioned public build.
- The public repository can reproduce the tote experience.
- Demo data is fictional and safe.
- The tote does not depend on KORRHAUS private services.
- KORRHAUS changes do not break the official tote URL.

#### Story 11.2 — prove creative control parity

- As a judge, I want the agent to operate all tote controls so that the result is more than a hard-coded prompt trick.

Acceptance criteria:

- The versioned tote inventory includes every visible customer control.
- The agent can set material, color, handles, print/decorative choices, text, exposed typography, motif/artwork, placement, scale, orientation, quantities, variants, and visible names when those controls exist in the final tote UI.
- Manual and agent-created states render through the same tote preview.
- A conversational revision changes a visible creative element.

#### Story 11.3 — prove a coherent first proposal

- As a judge, I want one natural-language brief to create a convincing collection so that the WebMCP leverage is immediately apparent.

Acceptance criteria:

- The brief creates at least two visibly different tote variants.
- Quantities match the requested total.
- Studio name appears as the temporary identity.
- The browser changes and chat receives previews.
- The proposal remains unsaved until confirmed.

### Epic 12: Demonstrate KORRHAUS as real-business proof

#### Story 12.1 — operate the real existing Sock Designer

- As a judge or merchant, I want to see CoDesign inside the real KORRHAUS customizer so that commercial relevance is credible.

Acceptance criteria:

- The evidence uses the real Shopify Sock Designer, not a rebuilt public copy.
- The tested KORRHAUS version and date are stated.
- The integration uses the public CoDesign layer through a narrow private adapter.
- Existing private code and data remain private.

#### Story 12.2 — match the selected KORRHAUS control inventory

- As a KORRHAUS shopper, I want the agent to propose every design choice I could make in the selected version so that chat can replace normal control operation.

Acceptance criteria:

- A versioned control inventory is created from the real customer UI.
- Every visible creative/configuration control is agent-proposable.
- This includes applicable designs/colourways, quantities, yarns/colors, patterns, cuff, grip, text/name, logo/artwork, packaging, positioning, scale, rotation, transformation, and any additional visible control.
- Any missing mapping blocks a full-parity claim.

#### Story 12.3 — protect live customers

- As KORRHAUS, I want agent work isolated and gated so that real customer usage is not disrupted.

Acceptance criteria:

- Normal production traffic is not used as an uncontrolled test surface.
- Proposal preview does not affect ordinary drafts, autosave, uploads, notifications, or customer projects.
- Real-environment activation is approval-gated.
- The mutable live site is supporting evidence rather than the only required judge dependency.

### Epic 13: Make the challenge story immediately legible

#### Story 13.1 — deliver the first-15-seconds moment

- As a judge, I want to see a normal sentence become a visual product quickly so that I understand the product before reviewing architecture.

Acceptance criteria:

- The opening focuses on chat and visible product change.
- Tool lists, repository trees, and long explanations do not precede the visual moment.
- The first message communicates: chat can create customizable Shopify products.

#### Story 13.2 — prove reuse without confusing the surfaces

- As a judge, I want to understand why there are two examples so that I see portability rather than duplication.

Acceptance criteria:

- Tote is labeled public reproducible reference.
- KORRHAUS is labeled real live merchant proof.
- No second Sock Designer appears.
- The shared CoDesign core is identified separately from both renderers.

## Edge Cases

### No suitable product option is found

- Chat says no suitable compatible customizable product was found.
- No browser designer is opened.
- CoDesign does not invent a merchant or claim compatibility.

### The shopper selects a product without CoDesign support

- Chat explains that the selected page is not currently agent-operable through this layer.
- Normal browsing may continue.
- No design proposal is fabricated.

### The customizer cannot open

- Progress stops.
- Chat states that the merchant page could not be opened.
- No page state or save claim is made.

### The customizer opens but capabilities are unavailable

- Chat states that automated design is unavailable on that page/session.
- The ordinary human customizer remains usable.
- No hidden fallback scrapes or modifies arbitrary page state.

### The brief contains too little information

- The agent uses tasteful defaults when a coherent proposal is still possible.
- The agent asks one focused question only when a credible direction cannot be created.

### No logo or artwork is supplied

- The studio/customer name is used as the temporary identity.
- Final artwork may be noted as a later enhancement.
- The design journey continues.

### A supplied asset cannot be used

- The agent reports the failed asset clearly.
- Existing proposal state remains safe.
- The studio name may be used as a fallback only if the shopper accepts or the brief already permits it.
- No private asset content appears in logs or unrelated responses.

### The shopper requests more variants than the merchant supports

- The merchant limit is explained.
- No partial unexpected collection is saved.
- The agent offers a valid collection shape.

### Quantities do not add up

- The inconsistency is explained.
- The agent may suggest an even or proportional split.
- No inconsistent proposal is saved.
- A proposed assumption must be visible before confirmation.

### The shopper refers to an ambiguous variant

- The agent asks which visible variant they mean.
- No design changes occur until clarified.

### A requested state is representable but has a production note

- The design is allowed.
- The production note appears as a warning.
- The warning does not masquerade as an invalid state.

### A requested state is truly invalid

- No partial application remains.
- Chat explains the invalid element.
- Representable alternatives may be suggested but are not silently chosen.

### A manual edit occurs during a proposal

- The agent detects a newer state.
- It asks whether to incorporate the human change.
- The stale proposal cannot be saved.

### The browser closes before confirmation

- Chat says the proposal was not saved.
- The proposal may be recreated from conversation.
- No persistence claim is made.

### The chat preview cannot be retrieved

- Saving is unavailable.
- Chat offers retry or webpage inspection.
- Success is not claimed from page state alone.

### The customer confirms saving twice

- The design saves once.
- Chat returns one final confirmation.
- No duplicate design or write is created.

### The customer says “looks good”

- The agent treats it as feedback, not save authorization.
- Chat asks explicitly whether the shopper wants to save the named proposal.

### The customer asks to order after saving

- Chat explains that challenge CoDesign stops at saved design.
- No order, quote, checkout, or payment action is exposed.

### The agent session or supported host becomes unavailable

- The customizer remains usable by a person.
- Temporary status is explained honestly where possible.
- No silent persistence occurs.

### A non-agent visitor opens the page

- No proposal UI appears.
- The original human experience behaves normally.

### KORRHAUS changes after challenge verification

- The public tote remains the stable judge surface.
- KORRHAUS evidence remains tied to its verification date/version.
- Old evidence is not presented as proof of unverified current behavior.

## What We Are Building

### Essential challenge product

- Chat-first shopper journey after product selection.
- Short progress updates.
- Complete first proposals from vague briefs.
- Full tote control parity.
- Versioned KORRHAUS control-parity target.
- Multiple designs/variants.
- Live merchant renderer changes.
- Meaningful visual previews in chat.
- Conversational refinement.
- Studio-name fallback when artwork is absent.
- Merchant-authoritative validation and warnings.
- Atomic failure behavior.
- Temporary proposal isolation.
- Concurrent human-change protection.
- Explicit save confirmation in chat.
- Visible page Keep/Revert fallback.
- Post-save visual confirmation.
- Stable public tote reference.
- Real KORRHAUS commercial evidence.
- Public merchant integration guide.
- Graceful ordinary human experience without WebMCP.

### Essential evidence

- A clean-clone runnable tote.
- Actual supported-agent/browser proof.
- A visible first proposal and refinement in chat.
- A verified unsaved state before confirmation.
- A verified saved-once outcome after confirmation.
- A verified revert/no-write outcome.
- A verified manual-change/stale-proposal recovery.
- A verified preview-failure safety behavior.
- A verified full tote control inventory.
- A versioned KORRHAUS inventory and dated live proof.
- Public/private boundary documentation.
- Clear pre-existing-versus-challenge work evidence.

## What We Would Add With More Time

### Merchant onboarding product

- Shopify App Store installation flow.
- Guided manifest builder.
- Adapter diagnostics dashboard.
- Capability-parity inspector.
- Deployment and health monitoring.

These are excluded because the package, contract, reference adapter, and guide are sufficient to prove the challenge proposition.

### Wider agent-client verification

- Dedicated Claude/browser verification.
- Additional browser-agent hosts.
- Compatibility certification matrix.

The architecture may aim for client neutrality, but challenge claims remain limited to tested clients.

### Merchant discovery ecosystem

- Searchable directory of CoDesign-enabled merchants.
- Capability-aware product matching.
- Cross-merchant comparison.

This is excluded because discovery is already handled by the host agent and would distract from the configurator problem.

### Extended commercial continuation

- Quote request.
- Authenticated pricing handoff.
- Order submission.
- Checkout or payment.

These remain outside the challenge under the current safety rules and would require a separate product/security decision.

### Richer creative tooling

- Built-in asset generation.
- Advanced image editing.
- Reusable brand kits.
- Cross-product collection generation.
- Collaborative team review.

CoDesign may accept and position assets produced elsewhere, but it does not need to become the creative model itself.

## Submission Proof Points

### WebMCP leverage

The submission must visibly prove:

- The tools belong to the webpage/customizer.
- The agent reads live merchant state.
- A natural-language request causes coordinated visual changes.
- The agent creates and updates multiple variants.
- Merchant capabilities and validation affect behavior.
- Temporary state, revision handling, and confirmation are real.
- Errors and stale state are handled coherently.
- The experience is not a scripted chat mockup.

### Execution

The submission must visibly prove:

- The public tote works from a stable live URL.
- The experience begins in chat.
- The browser customizer updates visibly.
- Chat receives actual useful previews.
- The shopper can refine and save without operating the designer controls.
- Non-agent use still works.
- The repository builds and runs from documented instructions.

### Potential impact

The submission must make credible that:

- Shoppers save time and configuration effort.
- Merchants preserve their existing customizer investment.
- The approach can extend to socks, bags, shirts, and other customizable products through merchant adapters.
- KORRHAUS is a real operating proof rather than a fictional impact claim.

### Creativity and ambition

The submission must make visible that:

- Chat controls a real merchant-owned visual canvas.
- The agent creates rather than merely filters products.
- Conversational art direction changes the physical product configuration.
- The solution joins shopping intent, visual design, merchant rules, and safe persistence.

## Judge Demonstration Requirements

### Opening moment

Within the first 15 seconds:

- A shopper's normal sentence is visible.
- A product option is selected or already established.
- The audience understands that ChatGPT will create the custom product.
- The product preview begins to transform before architecture explanation dominates.

### Tote proof

- Show the stable public tote URL.
- Show at least two variants created from one brief.
- Show a visible text/motif identity.
- Show a layout/placement or comparable creative refinement.
- Show progress updates in chat.
- Show visual previews in chat.
- Show temporary status.
- Show explicit save or revert.

### KORRHAUS proof

- Clearly label the real live merchant integration.
- Show the actual Sock Designer, not a duplicate demo.
- Show a meaningful multi-control design change.
- Show that KORRHAUS can keep evolving independently.
- State the tested version/date honestly.

### Portability proof

- Show that tote and KORRHAUS use the same CoDesign product behavior.
- Show that their controls and renderers differ.
- Show the public manifest/adapter integration model.
- Avoid suggesting the tote and KORRHAUS are connected stores or competing merchants in one marketplace.

## Product Acceptance Summary

The PRD is satisfied only if all of these are true:

1. The shopper sees product options before the agent opens a customizer.
2. The shopper can remain in ChatGPT for the normal design journey.
3. The agent creates a complete first proposal from a reasonable vague brief.
4. The browser renderer visibly changes.
5. Chat receives clear previews for every design/variant.
6. The agent supports conversational art direction beyond color selection.
7. Every visible tote control is agent-proposable.
8. The selected KORRHAUS version has a complete control inventory and parity evidence.
9. Anything representable in the merchant's human designer can be proposed unless the merchant explicitly marks it invalid.
10. Missing logo artwork can use the studio/customer name and does not stop the journey.
11. Production considerations are warnings unless the merchant declares a blocking rule.
12. Invalid changes leave no partial state.
13. Agent proposals do not trigger normal autosave.
14. Newer human changes are detected and never overwritten silently.
15. A closed browser produces an honest not-saved state.
16. An unseen preview cannot be saved.
17. Saving requires explicit action-time confirmation in chat.
18. Page Keep/Revert remains an equivalent fallback.
19. Saving happens once and returns final visual proof.
20. Revert restores the exact baseline without a write.
21. Normal non-agent customizer use remains intact.
22. The tote remains the stable public submission surface.
23. KORRHAUS remains the real evolving business proof.
24. No second Sock Designer is created or submitted.
25. No forbidden commercial or private capability is exposed.
26. Actual browser/agent evidence verifies the user experience.

## Product Risks To Resolve In The Technical Specification

These are not open product-direction questions; the desired behavior is fixed, but the implementation method must be proven next.

### In-chat visual transport

The specification must determine how the selected supported host receives and renders useful visual previews, including multiple variants, failure reporting, accessibility text, and retry behavior.

### Chat confirmation and page synchronization

The specification must determine how explicit chat confirmation and page Keep/Revert refer to the same proposal, prevent duplicate saves, and update each other.

### Artwork and studio-name pathway

The specification must determine how user-provided or agent-created artwork enters a temporary proposal safely, while studio-name fallback remains available and normal merchant uploads remain unaffected.

### Full-control inventory and parity

The specification must define how tote and KORRHAUS inventories are generated, reviewed, versioned, and tested against visible human controls.

### Live state and autosave isolation

The specification must prove how preview, stale-state detection, manual edits, browser interruption, revert, and confirmed save work without contaminating existing persistence.

### Client claim boundary

The specification must separate standards-based intent from exact agent/browser combinations actually verified for the submission.

## Approval Boundary

This PRD authorizes the technical specification stage only.

It does not authorize:

- Public implementation changes.
- Private KORRHAUS modifications.
- Deployment or traffic changes.
- Publication or repository pushes.
- Devpost submission.
- Order, quote, checkout, payment, or customer-data capabilities.

Implementation requires explicit approval after the technical specification and sequenced checklist are complete and reconciled with `AGENTS.md`.
