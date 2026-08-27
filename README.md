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
- A materially different studio-tote example with its own manifest, adapter,
  renderer, real product assets, coupled canvas/print rules, anonymous reset,
  and the same unchanged five-tool core and review UI.
- 95 deterministic public tests, a clean-clone proof, complete private Designer
  regression coverage, exact-bundle feature-on/off browser evidence, and five
  consecutive frozen-build North Form runtime rehearsals.

The repository is licensed under Apache-2.0. The local implementation and
submission drafts are advanced, but this is not yet a published or live
submission: the public remote, public deployment, production
deployment/promotion, video publication, and Devpost submission remain
incomplete or approval-gated. The API-backed 78-run model evaluation was
explicitly removed as a submission gate; its corpus and scorer remain optional
quality tooling.

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
`dist/judge-site/`: the English landing is `/`, the KORRHAUS reference is
`/korrhaus/`, and the tote is `/tote/`. Preview that exact production output:

```bash
npm run preview:judge-site
```

The landing shows package `v0.1.0`, the exact source commit and browser-bundle
digest. Public repository and live-flagship links remain visibly disabled in a
local build. A release build fails closed unless both verified HTTPS links are
provided:

```bash
CODESIGN_PUBLIC_REPOSITORY_URL=https://github.com/OWNER/codesign-commerce \
CODESIGN_FLAGSHIP_URL=https://example.com/custom-sock-designer \
npm run build:release
```

Run either public example from the repository root:

```bash
npm run dev --workspace @codesign-commerce/korrhaus-reference
npm run dev --workspace @codesign-commerce/studio-tote
```

Both examples accept `?reset=true` for a deterministic anonymous baseline and
`?reset=true&agent-preview=true` for a local visual-QA proposal. The preview
query is development-only and is not the agent or judge path.

## Safety boundary

WebMCP does not expose tools for Keep, Revert, saving, uploads, quotes, checkout, orders, payments, customer data, exact pricing, margins, suppliers, or internal workflows. Merchant-private state stays inside a narrow adapter and is reduced to the public canonical model through an allowlist.

See:

- [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) for the approved plan and current evidence log.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for runtime, transaction, and trust boundaries.
- [docs/MANIFEST_AND_ADAPTER.md](./docs/MANIFEST_AND_ADAPTER.md) for merchant integration obligations.
- [docs/KORRHAUS_BRIDGE_MAPPING.md](./docs/KORRHAUS_BRIDGE_MAPPING.md) for the read-only flagship integration map.
- [examples/studio-tote/README.md](./examples/studio-tote/README.md) for the public portability example.
- [docs/TESTING.md](./docs/TESTING.md) for deterministic and browser evidence requirements.
- [docs/JUDGE_GUIDE.md](./docs/JUDGE_GUIDE.md) for exact prompts, expected tool calls, reset, and recovery.
- [docs/EVALUATION_REPORT.md](./docs/EVALUATION_REPORT.md) for the exact
  distinction between verified evidence and the optional model eval that was
  intentionally not run.
- [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) for the gated public
  and flagship release sequence.
- [docs/SUBMISSION_COPY.md](./docs/SUBMISSION_COPY.md) for the English Devpost
  draft.
- [docs/VIDEO_SCRIPT.md](./docs/VIDEO_SCRIPT.md) for the human-owned recording
  plan.
- [docs/SUBMISSION_CHECKLIST.md](./docs/SUBMISSION_CHECKLIST.md) for the final
  evidence and approval checklist.
- [PUBLIC_PRIVATE_BOUNDARY.md](./PUBLIC_PRIVATE_BOUNDARY.md) for the repository boundary.
