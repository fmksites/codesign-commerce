# Pre-challenge KORRHAUS baseline

Captured on 26 August 2026 before CoDesign Commerce implementation began.

## Existing product

KORRHAUS already operated a production Custom Sock Designer before the challenge implementation window. Its existing capabilities included a visual sock preview, multiple designs and quantities, yarn colours and patterns, logo and cuff choices, grip-sole choices, packaging, validation, and project persistence.

The challenge work does not claim those features as new. The post-start work is the public CoDesign Commerce transaction engine, manifest and adapter contract, webpage WebMCP registrations, temporary proposal review, autosave isolation, portability example, tests, and evidence.

## Immutable production reference

The pre-start Cloud Run reference recorded during planning was:

- Revision: `korrhaus-admin-app-00312-qvx`
- Created: `2026-08-24T19:53:48.243558Z`
- Image digest: `sha256:e839cd0c28b6b11d8c3be6608c66ede02e1b56cec9aa490f91a096747972bd80`

This digest predates the challenge implementation. It must be rechecked against the deployment platform before final submission evidence is published.

## Existing remote MCP separation

KORRHAUS already exposed a separate read-only remote MCP planning service at `https://agents.korrhaus.nl/mcp`. That service is not the webpage WebMCP implementation submitted by this project. It intentionally excludes pricing, margins, customer data, suppliers, quotes, orders, and payments.

## Webpage WebMCP baseline

Read-only source inspection before implementation found no custom Sock Designer registration using `document.modelContext.registerTool(...)`. The post-start public Git history begins with commit `abf2a7829fdd188c2f2492e9c9d53a247a6ede7f`, committed at `2026-08-26T19:24:42+02:00` after user authorization.

## Live reachability observed during planning

The live KORRHAUS designer route and the existing remote MCP endpoint both returned HTTP 200 during the 26 August planning inspection. HTTP reachability alone is not end-to-end proof. Actual supported-browser verification and recorded network/storage evidence remain required after integration.
