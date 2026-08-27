# KORRHAUS zero-traffic release evidence

> **SUPERSEDED — NEVER PROMOTE THIS REVISION.** This file preserves historical
> evidence for `korrhaus-admin-app-codesign-prod1`. Later private safety changes
> changed the Designer bytes and asset key. A fresh QA revision and a fresh
> fixtures-off zero-traffic candidate from one new immutable image were required
> before any production-traffic decision. That later guarded proof is now
> recorded in
> [`KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md`](./KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md).

Date: 27 August 2026

## Outcome

The approved two-revision Cloud Run verification sequence passed. Ordinary
KORRHAUS storefront traffic remained unchanged throughout.

Production rollback baseline at the time of this historical verification:

- revision: `korrhaus-admin-app-00353-rag`
- ordinary traffic: `100%`
- pre-release image digest:
  `sha256:9678c2bf5c9f2f979e08fad2a91f6965e8bb07706e361febe3271890d908adfe`

Verified CoDesign image:

- immutable image digest:
  `sha256:bcae014be03e7991aa50111ba7b57fc1828e9c452cf1d40c3b300b941cd3763c`
- embedded CoDesign browser bundle:
  `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`

## Tagged synthetic QA revision

- revision: `korrhaus-admin-app-codesign-qa2`
- tag: `codesign-qa`
- tagged URL:
  <https://codesign-qa---korrhaus-admin-app-lblmz3rt7q-ew.a.run.app>
- ordinary traffic: `0%`
- runtime: `acceptance`
- acceptance fixtures: `true`
- WebMCP proposals: `true`
- Cloud Run Ready and ContainerHealthy conditions: `True`
- HTTP preview: `200`
- browser bundle: `200` with the exact expected hash
- Cloud Run severity-ERROR entries before and after browser testing: none

The first attempt, `korrhaus-admin-app-codesign-qa1`, retained runtime
`production` while fixtures were `true`. The acceptance preview correctly
failed closed with `404`. It was not used for evidence, has no traffic tag, and
never received ordinary traffic. The same image digest was reused in `qa2`
with the required `acceptance` runtime setting.

### Actual WebMCP browser result

ChatGPT/Codex's WebMCP-capable in-app browser discovered exactly:

1. `codesign_read_configuration`
2. `codesign_list_options`
3. `codesign_propose_configuration`
4. `codesign_create_design`
5. `codesign_validate_configuration`

The live tagged QA flow then:

- opened the fully custom Route 02 Designer;
- read one 20-pair baseline design at revision `korrhaus-ec1c291f`;
- listed all eight intended public option groups and dependencies;
- staged `North Form Cream` with Cream and Studio blue;
- created `North Form Rose` with Rose and Berry;
- allocated 60 pairs to each colourway and 120 pairs total;
- retained the standard KORRHAUS grip;
- returned `persisted:false` from proposal, create, and validation;
- reported `configurationValid:true` and `productionReady:false`;
- identified only `FINAL_LOGO_ARTWORK_REQUIRED` as the missing decision;
- displayed the two designs and 120-pair summary in the same visible Designer;
- displayed human-only `Revert` and `Keep proposal` actions; and
- kept the save status at `Temporary proposal not saved`.

Human Revert restored exactly:

- one `Design 1` colourway;
- 20 pairs total;
- no pending proposal; and
- the same baseline revision `korrhaus-ec1c291f`.

The deployed fallback HTML without `webmcp=true` contained
`"webMcpProposalEnabled":false`. The previously completed connected-Chrome
fallback test remains applicable because the deployed bundle hash is exact.

## Fixtures-off production candidate

- revision: `korrhaus-admin-app-codesign-prod1`
- tag: `codesign-prod`
- tagged URL:
  <https://codesign-prod---korrhaus-admin-app-lblmz3rt7q-ew.a.run.app>
- ordinary traffic: `0%`
- runtime: `production`
- storefront: `true`
- acceptance fixtures: `false`
- WebMCP proposals: `true`
- image digest: exactly the QA digest above
- Cloud Run Ready and ContainerHealthy conditions: `True`
- root HTTP: `200`
- browser-bundle HTTP: `200` with the exact expected hash
- synthetic acceptance preview: `404`, as required
- Cloud Run severity-ERROR entries: none

After this candidate became ready, Cloud Run still reported revision
`korrhaus-admin-app-00353-rag` at `100%` ordinary traffic. The public English
KORRHAUS Designer at
<https://korrhaus.nl/en/apps/wholesale/sock-designer> returned `200` and still
contained no CoDesign script, review host, or enabled WebMCP marker.

## Boundary and next gate

This historical evidence proves only the superseded image and zero-traffic
candidate described above. It does not authorize traffic promotion.
`korrhaus-admin-app-codesign-prod1` must never receive production traffic. The
later guarded two-revision proof is recorded separately; production promotion
remains an explicit owner gate.
