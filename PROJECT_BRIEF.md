# Project Brief

## Objective

Build a credible entry for the 2026 WebMCP Challenge that improves the KORRHAUS Custom Sock Designer for agents while creating a reusable open-source contribution for configurable commerce.

The commercial goal is to increase KORRHAUS authority and visibility. The product goal is to let a studio owner and an agent configure a manufacturable product together in the same live browser state.

## Approved direction

Product definition:

> An open-source WebMCP configuration layer for complex Shopify product customizers, demonstrated through the real KORRHAUS Custom Sock Designer.

Product name:

> CoDesign Commerce

The title and scope were approved for local implementation on 26 August 2026. Publication and production remain separately gated.

## Why This Direction

Shopify already provides native WebMCP tools for catalog search, navigation, cart management and checkout. The opportunity is the missing layer for made-to-order products where multiple options interact and production rules matter.

KORRHAUS provides a credible flagship because the designer already handles colours, quantities, multiple designs, cuffs, grip soles, branding, packaging and production validation for real studio customers.

## Options To Challenge

1. Submit the KORRHAUS Sock Designer as a focused vertical product.
2. Build a generic merchandise personalizer.
3. Build a reusable configurator layer with KORRHAUS as the flagship implementation.

The current recommendation is option 3. Do not accept it without testing its novelty, feasibility and judging strength.

## Planned WebMCP tools

- `codesign_read_configuration`
- `codesign_list_options`
- `codesign_propose_configuration`
- `codesign_create_design`
- `codesign_validate_configuration`

Keep and Revert are visible human controls and are intentionally not WebMCP tools.

## Intended Human-Agent Experience

The agent reads the live configuration, translates a natural-language studio brief into structured changes, creates colourways and validates constraints. Changes update the visible preview but remain temporary until the human chooses Keep or Revert.

Logo upload, quote requests, ordering, payments and other consequential actions remain human-controlled.

## Resolved implementation decisions

- Differentiate from Shopify's catalog/cart tools through coupled made-to-order configuration, merchant-owned visual preview, production-aware validation, and human approval.
- Keep the generic abstraction to a manifest, canonical state, adapter contract, proposal transaction, review UI, and five tools.
- Build a materially different studio-tote example only after the KORRHAUS autosave-isolation gate passes.
- Provide a reproducible public KORRHAUS reference; treat production integration and promotion as separate evidence and approval gates.
- Keep all private commerce and customer logic behind a narrow adapter.
- Attribute the pre-existing designer honestly and identify the post-25-August WebMCP implementation through timestamped Git and deployment evidence.
