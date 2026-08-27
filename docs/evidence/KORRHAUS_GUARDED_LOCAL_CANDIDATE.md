# KORRHAUS guarded local candidate evidence

Date: 27 August 2026

Status: `PASS_LOCAL_MATCHED_TO_IMMUTABLE_IMAGE`

This record covers the final merged CoDesign integration candidate inside the
existing private KORRHAUS Shopify Sock Designer. It is not a second Sock
Designer. These exact bytes passed local regression and were subsequently built
into the immutable image recorded in
[`KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md`](./KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md).
This evidence does not claim production traffic, live-Shopify WebMCP, quote or
order automation, public judge-site hosting, or submission.

## Binding topology and safety boundary

- The existing KORRHAUS Shopify Sock Designer is the only live
  sock-configurator surface.
- The public studio tote is the sole standalone runnable example.
- The normal human Designer remains unchanged when WebMCP is unavailable or
  disabled.
- The five CoDesign tools register only on the supported fully-custom Route 02
  state with catalog-backed choices.
- Every tool call is zero-write. An agent proposal never starts an autosave.
- An already-scheduled normal human autosave may finish before a secure baseline
  is captured; without that confirmed baseline, the proposal is declined.
- Proposals update the same visible Designer preview but remain temporary.
- Revert writes nothing. Only the visible human Keep control may enter the
  existing normal save path.

## Exact final local snapshot hashes

These hashes identify the tested private working-tree bytes. The private
application has no useful committed source history for this integration, so the
matching immutable container digest is the deployment identity.

| Private candidate file | SHA-256 |
|---|---|
| Embedded public core `codesign-commerce.js` | `e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324` |
| Designer source JavaScript | `41e49ee9d3a26e1cc7112f7f6279262b20d8524172ed2a2f947e7fbb2abc6688` |
| Designer minified JavaScript | `1d1f53c9447bcdf0bf15a244224d188432d5593c7583f313bb3d47b10272b970` |
| Designer source CSS | `709ed9481889cd93ab57b94e5d6ad333e2af9b8248b800b19165389fd915c3b9` |
| Designer minified CSS | `d044d25feb31bf4419824071542dbae6730d304b7921652a3cd646e2829c9e57` |
| Designer page server | `5eec74454aea4e6b88b64b4a3505d8537b3177775da7e783a5426d92e996be2e` |
| Designer page unit test | `2fd7ba551e11162ec4c44d91a49343edc84aa50bf3daaaa8634aac76eda0d699` |
| Designer browser specification | `5e156c15f20641099b2bffe2d33f51512aa120aafd549c1b2a88049b148ac76c` |

The Designer JavaScript and CSS references use cache key `v=20260827-8`.

## Final local verification results

| Gate | Result |
|---|---|
| JavaScript syntax | `PASS` — `node --check` |
| Focused ESLint | `PASS` |
| Private deterministic suite | `PASS` — 40 files, 194 tests |
| Private strict typecheck | `PASS` |
| Private production build | `PASS` |
| Complete private Designer browser suite | `PASS` — 138 total, 137 passed, 1 expected skip, 0 failures |
| Focused exact WebMCP desktop/mobile slice | `PASS` — 18/18 |

The full Playwright run covered the normal human experience and guarded
CoDesign behavior across its configured desktop and mobile projects. The one
skip is expected project-specific coverage, not a failed scenario.

The focused and full coverage prove:

- an ordinary browser never loads or mounts the CoDesign runtime;
- the supported Route 02 registers exactly five bounded tools;
- exact/custom-colour editing removes the tools until a catalog-backed state is
  restored;
- partial or delayed registration fails closed without locking normal editing;
- production-catalog output excludes private and producer-only data;
- an agent proposal never initiates a baseline save;
- staging and Revert perform no local or server persistence write;
- Keep is a visible human-review action, is not exposed as a WebMCP tool, and
  commits only allowlisted fields through the existing normal save boundary;
- hidden private Designer fields survive an allowlisted Keep;
- coupled auto-accent changes require an explicit coordinated choice;
- durable final artwork is required for production readiness;
- lifecycle teardown cannot revive a stale proposal;
- the two-colourway North Form flow works through all five tools; and
- unsafe uploaded-image markup never reaches the rendered preview.

## Immutable-image match and remaining boundary

Cloud Build `4d51ae1b-5594-4e18-8696-16f27da8cdf8` produced image digest
`sha256:aa9c591b5efbe945d68cb1edbfd5b7c39ab5bc524b041b82d3bc7682bdcb5c4e`.
The QA and fixtures-off zero-traffic revisions served the exact expected core,
minified JavaScript, and minified CSS hashes. Their deployment and actual
in-app-browser evidence are recorded separately.

Ordinary traffic remains entirely on
`korrhaus-admin-app-sock-logo-v2`, where the WebMCP feature flag is false. The
guarded production candidate has not received ordinary traffic, and the real
English Shopify route has not been live-verified with WebMCP. Production
promotion remains a separate explicit owner approval gate.

The earlier `codesign-prod1` candidate is obsolete and must never be promoted.
