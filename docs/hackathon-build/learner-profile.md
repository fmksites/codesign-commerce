# Learner Profile

## Participant

- Name: Felix Kramer
- Background: KORRHAUS operator and product owner; Codex power user
- What brought them to the hackathon: Build a genuinely useful, reusable agent layer for visual Shopify product customizers and prove it in a real operating business.

## Project Idea

- Initial idea: CoDesign WebMCP lets an agent operate every design control that a customer can currently operate in an existing Shopify customizer. The public studio tote proves portability; the existing KORRHAUS Sock Designer proves real commercial use.
- Intended journey: The customer starts entirely in ChatGPT. The agent finds and opens the appropriate product customizer, creates a complete first design, and supports conversational art direction without requiring the customer to operate the page first.
- Creative parity: Logos and artwork are in scope, including customer-provided assets, generated motifs, background removal or transformation, positioning, scaling, rotation, and coordinated application across product and packaging.
- Commercial continuation: In authenticated merchant experiences, the agent may read customer-visible prices and progress through order submission. A human must still confirm immediately before the order is actually submitted; payment is not currently part of the KORRHAUS flow.
- First-15-seconds promise: This should look like the beginning of an agentic foundation for Shopify product customizers, not another standalone configurator. A natural-language request should visibly become a custom product.
- Desired product category: “Chat to custom design of products on Shopify.” The chat is the primary creation interface; the merchant's existing customizer remains the visual renderer and source of product rules.
- Live collaboration: The customer should watch the design evolve while the agent works rather than wait for a hidden batch operation and static reveal.
- Preview surfaces: The visual result should update in the Shopify customizer and also be returned to the ChatGPT conversation, because some customers will let the browser work in the background instead of watching it.
- Personal success test: Felix should no longer need to operate the designer for a normal design journey. He should be able to describe what he wants, see the agent create and refine it, and receive the intended result through conversation. Other Shopify merchants with custom product designers should be able to install the reusable layer without replacing their renderer.

## Technical Experience

- Experience level: Codex power user; direct language/framework experience not yet specified
- Languages/frameworks known: Not yet specified
- AI coding tools used before: Codex, extensively
- Prior experience planning before coding: Extensive iterative planning and long-running Codex execution; expects plans to produce visible product value.

## Build Preferences

- Preferred pace: Decisive, outcome-driven, and visually verifiable
- Likely support needs: Codex should own technical translation and implementation detail while making product tradeoffs explicit.
- Notes for downstream commands: Do not reduce the ambition to a few hard-coded fields or a text-heavy review panel. Full parity means every creative control available to the human in the merchant UI must be expressible as an agent proposal. Preserve human approval before persistence and commercial actions unless Felix explicitly changes that boundary.
- Interaction preference: Produce a strong complete first proposal immediately, then accept natural-language direction such as “more premium,” “less pink,” or “make the logo smaller.” Ask only when a missing decision materially prevents a credible proposal.
- Product-experience preference: Live, visual, and conversational. The browser customizer and in-chat previews should stay synchronized enough that the user can direct the work from chat alone.
- Policy issue for scope: The desired authenticated order-submission journey conflicts with the current repository rule forbidding WebMCP order actions. Treat order submission as unresolved and out of implementation scope unless the project rule is deliberately revised; design the creative/configuration architecture so a separately governed commercial action could be added later.
