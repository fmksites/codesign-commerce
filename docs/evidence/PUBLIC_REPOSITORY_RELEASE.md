# Public repository release evidence

> Topology status: this file records an earlier successful public-source release
> that still included the synthetic KORRHAUS reference. The corrected
> landing-plus-tote topology is local and has not been pushed. Do not use the
> commit or CI run below as final submission-release evidence; append a new exact
> commit and hosted-CI result after the correction is approved for push.

Date: 27 August 2026

## Published surface

- Repository: <https://github.com/fmksites/codesign-commerce>
- Owner: `fmksites`
- Visibility: `PUBLIC`
- Default branch: `main`
- Published commit: `1c58b37bcd4cbc764ac4b0c436aaa8d649cccb0f`
- License detected by GitHub: `Apache License 2.0` (`apache-2.0`)
- Hosted CI run: <https://github.com/fmksites/codesign-commerce/actions/runs/33047195545>
- CI result: `success` on the published commit above

## Pre-publication gate

Immediately before publication, the local release candidate passed:

- 95 deterministic tests across 8 files;
- strict workspace and test typechecking;
- all workspace builds and judge-site assembly;
- the 113-file public-boundary check;
- the 38-file documentation-link check;
- judge-site artifact verification;
- the 24-case, 6-category eval-corpus/scorer self-test; and
- exact browser-bundle verification at
  `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`.

The worktree was clean at the published commit.

## Public-access verification

Unauthenticated HTTPS requests returned `200` for:

- the repository page;
- the raw `README.md`; and
- the raw root `LICENSE`.

The raw public source at
`packages/codesign-commerce/src/webmcp.ts` exposes the five intended tool names
and contains the real `document.modelContext.registerTool(...)` registration
path. GitHub's public contents API exposes the adapter, manifest, proposal,
review, and WebMCP source files.

## Boundary

This evidence proves public source publication, license detection, reproducible
CI, and unauthenticated source availability. It does not prove or authorize a
hosted judge site, KORRHAUS Cloud Run deployment, production traffic, video
publication, or Devpost submission.
