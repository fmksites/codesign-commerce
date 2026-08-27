# KORRHAUS zero-traffic deployment preflight

> **SUPERSEDED PREFLIGHT.** The hashes and candidate sequence below belong to an
> older private integration. Retain them as dated history, but do not deploy or
> promote from this file. The latest guarded source requires a new immutable
> image, QA revision, fixtures-off zero-traffic candidate, and fresh evidence.

Date: 27 August 2026

Historical status: approved and executed for the superseded image. Historical
evidence is in `docs/evidence/KORRHAUS_ZERO_TRAFFIC_RELEASE.md`.

## Current production baseline

- Google Cloud project: `korrhaus-blog-studio-2026`
- Cloud Run service: `korrhaus-admin-app`
- Region: `europe-west1`
- Current 100% traffic revision: `korrhaus-admin-app-00353-rag`
- Current immutable image digest:
  `sha256:9678c2bf5c9f2f979e08fad2a91f6965e8bb07706e361febe3271890d908adfe`
- Custom Sock runtime: `production`
- Storefront: enabled
- Acceptance fixtures: disabled
- `CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED`: absent, therefore disabled

The existing revision is the rollback baseline. No traffic, DNS, Shopify app
configuration, or production environment setting changed during this preflight.

## Build-context safety gate

The initial Cloud Build upload inventory contained 474 files and incorrectly
included historical QA screenshots, generated production packages, PDFs, tests,
and other local output. The private `.gcloudignore` was tightened before any
deployment so these categories cannot enter the Cloud Build context:

- `artifacts/`
- `output/`
- `outputs/`
- `tests/`
- `docs/`
- local development and environment files already covered by the ignore policy

The resulting inventory contains 296 source/configuration files. A negative
path audit found none of the excluded categories or local environment files.

## Exact local candidate verification

- Focused private CoDesign integration tests: 13 passed.
- Strict private typecheck: passed.
- Private production build: passed.
- CoDesign browser bundle:
  `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`
- CoDesign source map:
  `sha256:de627487e16297310a3499a6ab3020361a28fbee6a33af033f7c2f4e4deece1a`
- Designer source:
  `sha256:37a3ef0c516d4e31eaf1d2405f7aca7eb4a7a75c4f6ef425816005101ac6906b`
- Designer production JavaScript:
  `sha256:795ad0c74c71e8e8bc0daa0d5aab570d4a7441f2e4e675f2f839af2025d38ba5`
- Designer source CSS:
  `sha256:5acf01a12ed30907bf1698e63d2c0a857d5aea4fe91ca7ac3cb7a6c7355010b8`
- Designer production CSS:
  `sha256:b1bdf864db192a5381370ddeec6fe3c70b5f09713371dfce62a8f207ffd`

These match the already completed local browser and 96-case regression evidence.

## Proposed zero-traffic sequence

This sequence requires explicit owner approval before execution.

1. Build the current allowlisted private source into a tagged Cloud Run QA
   revision with zero production traffic.
2. Enable `CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED=true` and synthetic
   `CUSTOM_SOCK_ACCEPTANCE_FIXTURES=true` only on that QA revision.
3. Verify the revision URL, image digest, health, logs, static asset hash,
   exactly five tools, complete North Form proposal/create/validate/Revert flow,
   and normal no-WebMCP fallback.
4. Deploy the exact same immutable image digest as a second tagged, zero-traffic
   production candidate with acceptance fixtures disabled and the WebMCP flag
   enabled.
5. Verify the production candidate's identity, configuration, health, logs,
   asset hash, and that revision `00353-rag` still receives 100% of ordinary
   traffic.
6. Stop and present the evidence. Do not promote traffic without a separate
   written approval.

The two-revision sequence is deliberate: the tagged QA revision makes the full
browser flow testable without routing real storefront traffic, while the
production candidate cannot expose synthetic acceptance fixtures.

## Boundary

Approval for this sequence would authorize Cloud Build image creation and two
tagged zero-traffic Cloud Run revisions. It would not authorize production
traffic, DNS changes, Shopify app configuration changes, customer-data access,
the public judge-site deployment, YouTube publication, or Devpost submission.
