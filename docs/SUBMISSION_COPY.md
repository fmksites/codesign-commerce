# Devpost submission copy — draft

This is an English draft. Replace bracketed URLs and identifiers only after
their corresponding deployment or publication has been verified.

## Project name

CoDesign Commerce

## One-line summary

An open-source WebMCP layer that lets agents safely collaborate inside an
existing made-to-order product configurator while the merchant keeps its own
visual UI, rules, and human approval boundary.

## Description

Shopify already gives browser agents structured tools for catalog browsing,
product inspection, navigation, cart management, checkout, orders, and store
information. The difficult gap is what happens inside a complex made-to-order
configurator: dozens of interdependent choices, a merchant-owned visual
preview, production rules, and decisions that should not be saved silently.

CoDesign Commerce adds a reusable browser-side WebMCP layer to that existing
experience. A shopper can ask for 120 custom grip socks across two colourways.
The agent reads only the public, allowlisted configuration; lists the relevant
options and dependencies; proposes coordinated changes; creates a second
colourway; visibly updates the same preview the shopper sees; and validates
configuration consistency and production readiness.

The result is a temporary proposal. It can report that the 60/60 quantity split
is valid while the final logo is still missing, but it cannot save itself. The
person must choose Keep or Revert in the webpage. CoDesign exposes no WebMCP
tool for saving, ordering, checkout, quote acceptance, uploads, customer data,
prices, margins, suppliers, or private workflows.

KORRHAUS's real Custom Sock Designer is the flagship merchant integration. A
second, materially different studio-tote configurator uses the same unchanged
core package with its own manifest, adapter, renderer, and coupled print/canvas
rules. This demonstrates portability without claiming that CoDesign Commerce
is a universal renderer.

## Why WebMCP

The value comes from combining structured agent calls with a page the person is
already using. WebMCP gives the agent semantic option IDs, bounded values,
revision-aware operations, and structured validation instead of asking it to
guess through DOM clicks. The person simultaneously sees every proposed change
in the merchant's real preview and retains the only persistence decision.

## Implementation

The TypeScript core registers exactly five imperative webpage tools:
`codesign_read_configuration`, `codesign_list_options`,
`codesign_propose_configuration`, `codesign_create_design`, and
`codesign_validate_configuration`. A manifest declares public option groups,
values, dependencies, capabilities, and confirmation rules. A narrow merchant
adapter maps between private configurator state and a canonical public model.

The proposal engine uses committed and proposal revisions, payload-bound
operation IDs, bounded batches, detached validation, optimistic concurrency,
zero-write preview/restore methods, and an explicit human Keep/Revert state
machine. Runtime guards reconstruct adapter outputs field by field and fail
closed on malformed or oversized data. Browsers without WebMCP keep the normal
human interface.

## What is new during the challenge

The KORRHAUS Sock Designer existed before 25 August 2026. The reusable CoDesign
Commerce package, five webpage tools, manifest/adapter contract, staged proposal
transaction, review UI, public KORRHAUS reference, studio-tote example, tests,
eval corpus, and challenge documentation were created during the submission
period. Timestamped Git history and `docs/evidence/PRE_CHALLENGE_BASELINE.md`
separate the prior product from challenge work.

## Links

- Live judge app: `[PUBLIC_JUDGE_URL]`
- KORRHAUS flagship: `[VERIFIED_FLAGSHIP_URL]`
- Public source: `[PUBLIC_REPOSITORY_URL]`
- Video: `[PUBLIC_YOUTUBE_URL]`
