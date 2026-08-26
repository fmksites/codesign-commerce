# CoDesign Commerce

CoDesign Commerce is an open-source WebMCP layer for existing complex product configurators. It lets an agent read an allowlisted configuration, propose coordinated changes in the merchant's own visible preview, and validate coupled product rules without silently saving anything. A person must explicitly Keep or Revert the temporary proposal.

The 2026 WebMCP Challenge entry will use KORRHAUS's existing Custom Sock Designer as its flagship real-world proof. CoDesign Commerce is not the Sock Designer itself, and it does not replace a merchant's renderer or production rules.

## Current status

Local implementation began on 26 August 2026 after explicit approval. The current implementation contains:

- A canonical, allowlisted configuration state.
- A bounded manifest contract and validation.
- An in-memory configurator adapter.
- A proposal transaction with revisions, retry IDs, temporary preview, Revert, and human Keep.
- Exactly five focused webpage tools registered through the current imperative WebMCP API: read configuration, list options, propose changes, create a design/colourway, and validate configuration.
- Atomic proposal extension and idempotent design cloning for multi-colourway briefs.
- Deterministic tests proving that proposal previews do not cross the persistence boundary.
- A framework-neutral, accessible Keep/Revert review component.
- A local public KORRHAUS reference surface that completes the 120-pair North Form scenario in an actual WebMCP-capable browser.

The repository is licensed under Apache-2.0 but is not published or submission-ready yet. Public hosting, production deployment or promotion, video publication, and Devpost submission remain approval-gated.

## Local verification

Requirements: Node.js 22.12 or newer and npm.

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run check:public-boundary
```

## Safety boundary

WebMCP does not expose tools for Keep, Revert, saving, uploads, quotes, checkout, orders, payments, customer data, exact pricing, margins, suppliers, or internal workflows. Merchant-private state stays inside a narrow adapter and is reduced to the public canonical model through an allowlist.

See:

- [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) for the approved plan and current evidence log.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for runtime, transaction, and trust boundaries.
- [docs/MANIFEST_AND_ADAPTER.md](./docs/MANIFEST_AND_ADAPTER.md) for merchant integration obligations.
- [docs/KORRHAUS_BRIDGE_MAPPING.md](./docs/KORRHAUS_BRIDGE_MAPPING.md) for the read-only flagship integration map.
- [docs/TESTING.md](./docs/TESTING.md) for deterministic and browser evidence requirements.
- [PUBLIC_PRIVATE_BOUNDARY.md](./PUBLIC_PRIVATE_BOUNDARY.md) for the repository boundary.
