# CoDesign Commerce

CoDesign Commerce is an open-source WebMCP layer for existing complex product configurators. It lets an agent read an allowlisted configuration, propose coordinated changes in the merchant's own visible preview, and validate coupled product rules without silently saving anything. A person must explicitly Keep or Revert the temporary proposal.

The 2026 WebMCP Challenge entry will use KORRHAUS's existing Custom Sock Designer as its flagship real-world proof. CoDesign Commerce is not the Sock Designer itself, and it does not replace a merchant's renderer or production rules.

## Current status

The public package and studio-tote reference now use Manifest 2.0 end to end:

- A field-by-field guarded `WorkspaceState` with typed workspace, variant, element, asset, and transform controls.
- An atomic operation reducer with proposal/base revisions, operation-ID idempotency, variants, validation, stale recovery, and exact Revert.
- A bounded temporary-asset sandbox and revision-bound renderer preview bridge.
- Exactly six webpage tools: `codesign_read_workspace`, `codesign_list_capabilities`, `codesign_stage_asset`, `codesign_apply_proposal`, `codesign_get_previews`, and `codesign_validate_proposal`.
- No WebMCP Keep, Revert, save, order, quote, checkout, payment, upload, customer, pricing, supplier, or administration tool.
- One accessible page review controller. Ordinary controls stay visible and lock only while a proposal is open; Keep stays disabled until the current visual preview exists.
- A materially different studio-tote adapter using its existing visual renderer, real supplied artwork, coupled production rules, deterministic reset, browser-local Keep, and zero-write temporary proposals.
- Deterministic unit, schema, lifecycle, safety, review, asset, and preview tests. Native Chrome 151 and the Codex in-app browser both discovered the exact six tools and executed a visible proposal/preview/Revert flow with zero writes.

This is local implementation evidence, not a release claim. The complete tote
product pass is implemented and locally verified; the private KORRHAUS Manifest
2 adapter, public deployment/publication, literal ChatGPT release validation,
production traffic, and Devpost submission remain incomplete or separately
approval-gated. The optional model-evaluation corpus and scorer are quality
tooling, not proof of an actual model run.

## Local verification

Requirements: Node.js 22.12 or newer and npm.

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run verify:browser-bundle
npm run check:judge-site
npm run check:public-boundary
npm run check:docs
npm run check:evals
```

`npm run build` also assembles one provider-neutral static judge artifact at
`dist/judge-site/`: the English landing is `/` and the sole standalone runnable
example is `/tote/`. Every KORRHAUS call to action is populated from release
metadata and opens the real Shopify Sock Designer; the artifact does not contain
a second sock configurator. Preview the exact production output:

```bash
npm run preview:judge-site
```

The landing shows package `v0.1.0`, the exact source commit and browser-bundle
digest. Public repository and live-flagship links remain visibly disabled in a
local build. A release build fails closed unless the working tree is clean, the
repository URL is present, the exact English Shopify Designer URL is present,
and the real route has already passed live verification:

```bash
CODESIGN_PUBLIC_REPOSITORY_URL=https://github.com/fmksites/codesign-commerce \
CODESIGN_FLAGSHIP_URL=https://korrhaus.nl/en/apps/wholesale/sock-designer \
CODESIGN_FLAGSHIP_VERIFIED=true \
npm run build:release
```

Run the public portability example from the repository root:

```bash
npm run dev --workspace @codesign-commerce/studio-tote
```

The tote accepts `?reset=true` for a deterministic anonymous baseline and
`?reset=true&agent-preview=true` for a local visual-QA proposal. The preview
query is development-only and is not the agent or judge path.

## Safety boundary

WebMCP does not expose tools for Keep, Revert, saving, uploads, quotes, checkout, orders, payments, customer data, exact pricing, margins, suppliers, or internal workflows. Merchant-private state stays inside a narrow adapter and is reduced to the public canonical model through an allowlist.

See:

- [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) for the approved plan and current evidence log.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for runtime, transaction, and trust boundaries.
- [docs/MANIFEST_AND_ADAPTER.md](./docs/MANIFEST_AND_ADAPTER.md) for merchant integration obligations.
- [docs/WORKSPACE_AND_OPERATIONS.md](./docs/WORKSPACE_AND_OPERATIONS.md) for the Manifest 2.0 canonical state guard and atomic operation model.
- [docs/WEBMCP_TOOLS.md](./docs/WEBMCP_TOOLS.md) for the exact six tools, schemas, review boundary, and browser lifecycle.
- [docs/KORRHAUS_BRIDGE_MAPPING.md](./docs/KORRHAUS_BRIDGE_MAPPING.md) for the private flagship integration map and safety boundary.
- [docs/AGENT_DISCOVERY_AND_DISTRIBUTION.md](./docs/AGENT_DISCOVERY_AND_DISTRIBUTION.md) for the distinction between on-page WebMCP capability and traffic acquisition.
- [docs/evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md](./docs/evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md)
  for the historical `v=20260827-8` guarded snapshot and local regression.
- [docs/evidence/KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md](./docs/evidence/KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md)
  for the historical guarded image proof.
- [docs/evidence/KORRHAUS_READ_ONLY_COLOURWAY_QA.md](./docs/evidence/KORRHAUS_READ_ONLY_COLOURWAY_QA.md)
  for the current immutable QA image, read-only proposed-colourway UX, exact
  zero-write browser evidence, unchanged live traffic, and owner-test gate.
- [examples/studio-tote/README.md](./examples/studio-tote/README.md) for the public portability example.
- [docs/TESTING.md](./docs/TESTING.md) for deterministic and browser evidence requirements.
- [docs/JUDGE_GUIDE.md](./docs/JUDGE_GUIDE.md) for exact prompts, expected tool calls, reset, and recovery.
- [docs/EVALUATION_REPORT.md](./docs/EVALUATION_REPORT.md) for the exact
  distinction between verified evidence and the optional model eval that was
  intentionally not run.
- [docs/evidence/JUDGE_SITE_RELEASE_CANDIDATE.md](./docs/evidence/JUDGE_SITE_RELEASE_CANDIDATE.md)
  for the corrected local topology checks and clearly marked superseded
  two-subpath history.
- [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) for the gated public
  and flagship release sequence.
- [docs/SUBMISSION_COPY.md](./docs/SUBMISSION_COPY.md) for the English Devpost
  draft.
- [docs/VIDEO_SCRIPT.md](./docs/VIDEO_SCRIPT.md) for the human-owned recording
  plan.
- [docs/SUBMISSION_CHECKLIST.md](./docs/SUBMISSION_CHECKLIST.md) for the final
  evidence and approval checklist.
- [PUBLIC_PRIVATE_BOUNDARY.md](./PUBLIC_PRIVATE_BOUNDARY.md) for the repository boundary.
