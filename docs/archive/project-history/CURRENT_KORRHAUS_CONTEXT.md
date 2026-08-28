# Current KORRHAUS Context

Snapshot date: 26 August 2026. Reverify before implementation.

## Private Production Project

Path:

`/Users/felixkramer/Desktop/KORRHAUS Shopify Developer`

Relevant application:

`apps/korrhaus-admin-app`

Relevant designer route:

`apps/korrhaus-admin-app/app/routes/apps.wholesale.sock-designer.tsx`

Main browser implementation:

`apps/korrhaus-admin-app/public/custom-socks/designer-claude.js`

Existing E2E coverage:

`apps/korrhaus-admin-app/tests/e2e/custom-sock-designer.spec.ts`

## Existing Designer Capabilities

- Live visual configuration.
- Route selection between stock and custom paths.
- Quantity and multiple-design handling.
- Yarn colours and patterns.
- Logo, cuff, grip sole and packaging choices.
- Validation and project persistence.
- English, Dutch, German and Polish storefront support.

## Existing Remote MCP

Path:

`apps/korrhaus-agent-service`

Public endpoint:

`https://agents.korrhaus.nl/mcp`

The remote MCP currently provides read-only planning, recommendation and handoff capabilities. It intentionally excludes monetary pricing, margins, customer data, supplier data, quotes, orders and payments.

This remote MCP is separate from the challenge's webpage-registered WebMCP work.

## Current WebMCP Status

No custom Sock Designer tools were registered through `document.modelContext.registerTool(...)` when inspected before challenge implementation.

## Critical Implementation Constraint

The current designer autosaves normal changes. Agent changes should not call the existing persistence path immediately. A safe WebMCP integration should:

1. Snapshot the current state.
2. Apply agent changes locally to the visible preview.
3. Display a clear Keep/Revert control.
4. Persist only after human confirmation.

## Pre-Challenge Evidence

An immutable pre-start Cloud Run deployment was identified:

- Revision: `korrhaus-admin-app-00312-qvx`
- Created: `2026-08-24T19:53:48.243558Z`
- Image digest: `sha256:e839cd0c28b6b11d8c3be6608c66ede02e1b56cec9aa490f91a096747972bd80`

Reconfirm and document this evidence before relying on it in the submission.
