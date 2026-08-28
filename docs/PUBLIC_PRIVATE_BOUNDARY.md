# Public and private boundary

CoDesign WebMCP is the public reusable layer. Merchant applications remain
responsible for their own customer data, renderer, production rules, storage,
pricing, and commerce actions.

## Public repository

This repository contains:

- Manifest 2.0, canonical workspace, and inventory contracts;
- the atomic proposal engine and human review controller;
- temporary asset and preview interfaces;
- exactly six bounded webpage tools;
- the complete fictional studio-tote reference;
- a minimal Shopify page-template overlay;
- deterministic tests, browser-safe build tooling, and public evidence; and
- integration, security, judge, and deployment instructions.

## Merchant-owned integration

A merchant adapter stays inside the merchant application and owns:

- raw application and authenticated customer state;
- the existing product renderer and customer interface;
- real product and manufacturing rules;
- artwork conversion, private storage, and approved uploads;
- final persistence, quote, cart, checkout, order, and payment paths; and
- pricing, margins, suppliers, customer records, and administrative workflows.

The public core receives only allowlisted configuration semantics and sanitized
validation results. It never receives raw boot objects, private endpoints,
credentials, customer identifiers, commercial formulas, or merchant storage
references.

## Human confirmation boundary

Agents may create a visible temporary proposal and request current previews.
They cannot Keep, Revert, save, upload, quote, order, check out, pay, or access
private commercial data through CoDesign tools. The visible webpage owns Keep
and Revert. A merchant adapter may cross its normal persistence boundary only
after a person chooses Keep and the committed revision still matches.

## KORRHAUS status

The pre-existing KORRHAUS Custom Sock Designer remains in a private production
repository. Its Manifest 2 adapter is locally verified and disabled by default.
No private source, credential, customer record, pricing logic, or production
workflow is copied here. The public challenge demo does not depend on a live
KORRHAUS feature release.

## Scope

CoDesign does not claim to render every product. It makes an existing supported
configurator agent-ready through a manifest and narrow adapter while preserving
that merchant's visual experience and rules.
