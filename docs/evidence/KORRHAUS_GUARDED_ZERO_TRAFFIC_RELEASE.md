# KORRHAUS guarded zero-traffic release evidence

Date: 27 August 2026

Status: `PASS_ZERO_TRAFFIC_NOT_LIVE`

This record covers the approved two-revision verification of the final guarded
CoDesign candidate inside the existing KORRHAUS Shopify Sock Designer. The QA
and production-candidate revisions use one immutable image and receive zero
ordinary traffic. This is deployment evidence, not production activation or
live-Shopify WebMCP verification.

## One-live-Designer topology

- The existing Shopify Sock Designer remains the only live KORRHAUS Designer.
- There is no second hosted or public KORRHAUS Sock Designer.
- The public studio tote is the sole standalone runnable example.
- Ordinary storefront traffic remains `100%` on
  `korrhaus-admin-app-sock-logo-v2`.
- That live rollback revision has the WebMCP feature flag set to `false`.
- Neither guarded revision below receives ordinary traffic.

## Immutable build identity

| Item | Exact value |
|---|---|
| Cloud Build | `4d51ae1b-5594-4e18-8696-16f27da8cdf8` |
| Image digest | `sha256:aa9c591b5efbe945d68cb1edbfd5b7c39ab5bc524b041b82d3bc7682bdcb5c4e` |
| Embedded public core SHA-256 | `e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324` |
| Designer minified JavaScript SHA-256 | `1d1f53c9447bcdf0bf15a244224d188432d5593c7583f313bb3d47b10272b970` |
| Designer minified CSS SHA-256 | `d044d25feb31bf4419824071542dbae6730d304b7921652a3cd646e2829c9e57` |
| Designer asset cache key | `v=20260827-8` |

The final local source and regression identity is recorded in
[`KORRHAUS_GUARDED_LOCAL_CANDIDATE.md`](./KORRHAUS_GUARDED_LOCAL_CANDIDATE.md).

## Tagged acceptance QA revision

| Field | Verified value |
|---|---|
| Revision | `korrhaus-admin-app-codesign-qa3` |
| Tag | `codesign-guarded-qa` |
| Runtime | `acceptance` |
| Storefront feature | enabled |
| Acceptance fixtures | `true` |
| WebMCP proposals | `true` |
| Ordinary traffic | `0%` |
| Cloud Run Ready | `True` |
| Cloud Run ContainerHealthy | `True` |

The tagged QA revision served the exact immutable digest and the exact core,
minified JavaScript, and minified CSS hashes above.

### Actual in-app WebMCP verification

The WebMCP-capable in-app browser discovered exactly five page tools:

1. `codesign_read_configuration`
2. `codesign_list_options`
3. `codesign_propose_configuration`
4. `codesign_create_design`
5. `codesign_validate_configuration`

The browser run proved this exact sequence:

1. Read the one-design, 20-pair baseline.
2. Attempt a single-design allocation of 60 pairs against a 120-pair total; the
   coupled quantity rule rejected it atomically.
3. Stage the first 60-pair North Form colourway.
4. Create a second, visibly different 60-pair colourway inside the same
   temporary proposal.
5. Validate two designs and 120 pairs total.

The successful proposal remained visibly staged in the same Designer. Both
proposal-changing tool results reported `persisted: false`. Validation returned
`productionReady: false` with only `FINAL_LOGO_ARTWORK_REQUIRED` outstanding.
No browser errors were observed.

The visible review-panel Revert control restored the exact baseline:

- revision `korrhaus-3fe7f8ed`;
- one design;
- 20 pairs total; and
- pending proposal `null`.

No Keep, quote, upload, order, checkout, customer-data, or other commercial
action was performed during the deployed QA verification.

## Fixtures-off production candidate

| Field | Verified value |
|---|---|
| Revision | `korrhaus-admin-app-codesign-prod2` |
| Tag | `codesign-guarded-prod` |
| Image digest | Exact immutable digest above |
| Runtime | `production` |
| Storefront feature | `true` |
| Acceptance fixtures | `false` |
| WebMCP proposals | `true` |
| Ordinary traffic | `0%` |
| Cloud Run Ready | `True` |
| Cloud Run ContainerHealthy | `True` |
| Root HTTP | `200` |
| Synthetic acceptance preview | `404`, as required |
| Severity-`ERROR` log entries | `0` |

The candidate served the exact core, minified JavaScript, and minified CSS
hashes above. It was not tested through the public Shopify route because it has
not received production traffic.

## Service-template safety hold

After the `prod2` checks passed, the Cloud Run service-template default was
explicitly reset to `CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED=false` using
zero-traffic revision `korrhaus-admin-app-codesign-hold1` from the same immutable
image. The untagged hold revision received no traffic and was immediately
retired; it is not a customer or judge surface.

The service template now fails safe for an unrelated future deployment instead
of inheriting WebMCP enabled by default. The verified
`korrhaus-admin-app-codesign-prod2` revision and `codesign-guarded-prod` tag
remain ready at `0%` ordinary traffic.

## Live rollback baseline and closed gate

Cloud Run still routes `100%` of ordinary traffic to
`korrhaus-admin-app-sock-logo-v2`, whose WebMCP feature flag is `false`. It is
the current rollback baseline, and the service-template default is also
explicitly WebMCP-off. The deployed guarded candidates therefore have not
changed customer behavior.

Production promotion remains a separate explicit owner approval gate. If
approved later, the next required evidence is actual supported-browser
verification on the real English Shopify Sock Designer, followed by immediate
rollback to `korrhaus-admin-app-sock-logo-v2` if a critical check fails.

The earlier `korrhaus-admin-app-codesign-prod1` candidate remains obsolete and
must never be promoted.
