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
- A narrow private bridge that connects the same public runtime to KORRHAUS's existing Sock Designer; the current guarded integration has passed local verification while production remains unchanged. Earlier zero-traffic evidence is superseded by this newer candidate until it is repeated.
- A materially different studio-tote example with its own manifest, adapter,
  renderer, real product assets, coupled canvas/print rules, anonymous reset,
  and the same unchanged five-tool core and review UI.
- 95 deterministic public tests and prior clean-clone proof; the current guarded
  private integration also passes 192 unit tests and the complete 128-case
  desktop/mobile Designer run with 127 passes and one intentional desktop skip.
  Exact-bundle feature-on/off evidence and five frozen-build North Form
  rehearsals remain clearly identified as historical where they predate the
  latest private hardening.

The repository is public and licensed under Apache-2.0. The corrected
landing-plus-tote topology is locally verified but not yet pushed. Public
hosting, KORRHAUS production promotion, video publication, and Devpost
submission remain incomplete or approval-gated. The API-backed 78-run model
evaluation was explicitly removed as a submission gate; its corpus and scorer
remain optional quality tooling.

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
- [docs/KORRHAUS_BRIDGE_MAPPING.md](./docs/KORRHAUS_BRIDGE_MAPPING.md) for the read-only flagship integration map.
- [docs/evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md](./docs/evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md)
  for the current private integration hashes, regressions, and explicit
  no-deployment boundary.
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
