# Project Brief

## Objective

Build a credible entry for the 2026 WebMCP Challenge that improves the KORRHAUS Custom Sock Designer for agents while creating a reusable open-source contribution for configurable commerce.

The commercial goal is to increase KORRHAUS authority and visibility. The product goal is to let a studio owner and an agent configure a manufacturable product together in the same live browser state.

## Current Recommended Direction

Working concept:

> An open-source WebMCP configuration layer for complex Shopify product customizers, demonstrated through the real KORRHAUS Custom Sock Designer.

Working title only:

> CoDesign Commerce

The title and scope are not approved yet.

## Why This Direction

Shopify already provides native WebMCP tools for catalog search, navigation, cart management and checkout. The opportunity is the missing layer for made-to-order products where multiple options interact and production rules matter.

KORRHAUS provides a credible flagship because the designer already handles colours, quantities, multiple designs, cuffs, grip soles, branding, packaging and production validation for real studio customers.

## Options To Challenge

1. Submit the KORRHAUS Sock Designer as a focused vertical product.
2. Build a generic merchandise personalizer.
3. Build a reusable configurator layer with KORRHAUS as the flagship implementation.

The current recommendation is option 3. Do not accept it without testing its novelty, feasibility and judging strength.

## Candidate Shared Tools

- `get_configuration`
- `list_product_options`
- `propose_configuration`
- `create_variant_design`
- `validate_configuration`
- `discard_proposal`

Names and schemas remain subject to review against the current WebMCP specification and evaluation guidance.

## Intended Human-Agent Experience

The agent reads the live configuration, translates a natural-language studio brief into structured changes, creates colourways and validates constraints. Changes update the visible preview but remain temporary until the human chooses Keep or Revert.

Logo upload, quote requests, ordering, payments and other consequential actions remain human-controlled.

## Questions The New Task Must Resolve

- Is the reusable framework meaningfully novel compared with existing WebMCP showcase projects?
- What is the smallest credible generic abstraction?
- Is a second merchandise example necessary to prove reuse?
- Should the judged live URL be the production designer, a public challenge deployment, or both?
- How can the public repository be fully functional without exposing private KORRHAUS systems?
- What exact post-25-August work will be judged?
- What can be built and tested to a high standard before the deadline?
