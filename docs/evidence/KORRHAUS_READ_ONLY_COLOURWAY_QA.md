# KORRHAUS read-only colourway review QA

Date: 27 August 2026

Status: `PASS_ZERO_TRAFFIC_USER_QA_READY_NOT_LIVE`

This record covers the UX refinement requested before any KORRHAUS production
promotion: a person can switch between colourway tabs while an agent proposal
is waiting for review and see each proposal in the existing live product
renderer. The proposal remains temporary, all edit and upload controls remain
locked, and no customer traffic reaches this revision.

This is the existing private KORRHAUS Shopify Sock Designer, not a second
public sock example. The studio tote remains the sole standalone public
portability example.

## Exact interaction boundary

During `awaiting-human` only the existing `[data-tab]` colourway buttons are
exempt from the proposal mutation lock. A tab click:

- selects an already-staged design from the in-memory proposal;
- re-renders the same KORRHAUS sock, sole and packaging proof with persistence
  explicitly skipped;
- preserves the visible `Temporary proposal not saved` status; and
- does not unlock name, colour, pattern, logo, cuff, grip, packaging,
  duplication, reordering, removal, upload or save controls.

Invalid tab indexes are rejected. Tabs are not exempt while a proposal is
applying, reverting, committing, invalidated or awaiting a save retry. Keep and
Revert remain human-only controls in the review panel and are not WebMCP tools.

## Exact local candidate

| Item | Exact value |
|---|---|
| Embedded public core SHA-256 | `e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324` |
| Designer source JavaScript SHA-256 | `fd132b0f6cd3b5dd2950886e41b3eed22e392146a2b4788c39fa80aa1125d454` |
| Designer minified JavaScript SHA-256 | `160aa32869721b5893be3a960c78d4c3f625d21f3556032c0d17a77807df0c2c` |
| Designer minified CSS SHA-256 | `d044d25feb31bf4419824071542dbae6730d304b7921652a3cd646e2829c9e57` |
| Designer asset cache key | `v=20260827-10` |

The exact source passed:

- JavaScript syntax and focused ESLint;
- 41 Vitest files and 199 tests;
- strict typecheck;
- production build; and
- the complete 142-case desktop/mobile Playwright run: 141 passed, one
  expected desktop-only skip, zero failures.

The two-colourway regression explicitly checks both tab switches, two visibly
different sole colours, the persistent temporary-status text, disabled
mutation/upload controls, unchanged local storage, zero project and artwork
requests, zero proposal persistence counters, exact Revert, and exactly one
normal save after a later human Keep.

## Immutable corrected QA image

| Item | Exact value |
|---|---|
| Successful Cloud Build | `2985b639-7524-4a09-85ac-f367b78865e7` |
| Image digest | `sha256:1819173fc2bbc57cf778a0c9ad4d8361f3aa1072b10fb978c67a9973bb7d9e3c` |
| QA revision | `korrhaus-admin-app-codesign-review-qa2` |
| Stable engineering tag | `codesign-review-qa` |
| Fresh user-test tag | `codesign-user-qa` |
| Runtime / fixtures | `acceptance` / `true` |
| WebMCP proposals | `true` |
| Ordinary traffic | `0%` |
| Ready / ContainerHealthy | `True` / `True` |

One earlier build of the same corrected source,
`6b9994b5-890c-40cd-81b5-6b9b96cbe759`, failed during `npm ci` because the npm
registry connection reset. It did not produce or deploy an image. Retrying the
same source succeeded in the build above.

The tagged revision serves cache key `v=20260827-10`. Its downloaded minified
JavaScript hash exactly matches the locally tested file. No severity-`ERROR`
Cloud Run entry was present after deployment checks.

After QA deployment, untagged zero-traffic revision
`korrhaus-admin-app-codesign-review-hold2` restored the Cloud Run service
template to production runtime, fixtures off and
`CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED=false`. It was retired without traffic.

## Actual in-app ChatGPT/WebMCP proof

The fresh-origin user QA surface is:

<https://codesign-user-qa---korrhaus-admin-app-lblmz3rt7q-ew.a.run.app/custom-sock-designer-preview?authenticated=true&webmcp=true&codesign_browser_baseline=true&fallback=20260827>

The actual in-app browser discovered exactly five page tools. It then:

1. read one committed design and 20 pairs;
2. listed eight bounded public option groups and their coupled dependencies;
3. proposed North Form Cream with studio-blue top stripes and the standard
   KORRHAUS grip;
4. created North Form Rose with berry accents in the same proposal;
5. allocated 60 pairs to each colourway and 120 pairs total; and
6. validated the proposal.

Both proposal-changing results returned `persisted: false`. Validation returned
`configurationValid: true`, `productionReady: false`, with only
`FINAL_LOGO_ARTWORK_REQUIRED` outstanding.

The deployed UI then proved:

| Check | Result |
|---|---|
| Cream and Rose tabs | both enabled |
| Rose proof sole colour | `#b98f88` |
| Cream proof sole colour | `#e7dfce` |
| Preview changed between tabs | yes |
| Status after Rose → Cream → Rose | `Temporary proposal not saved` throughout |
| First mutation control | disabled throughout |
| Logo upload control | disabled throughout |
| Fresh committed-state read | still one design, 20 pairs, same revision |
| Pending proposal | revision 2, `awaiting-human`, `persisted: false` |
| Browser console errors or warnings | none |

The temporary two-colourway proposal was intentionally left staged on the
fresh user-test tab so the owner can inspect both renders and exercise the
visible Keep/Revert decision. No Keep, quote, upload, order, checkout or real
customer-data action was performed by Codex.

## Superseded and still-closed paths

- `korrhaus-admin-app-codesign-review-qa1` and cache key `v=20260827-9` are
  superseded because a real visual check found that a tab switch restored the
  misleading default `Draft saved on this device` label.
- The older fixtures-off `codesign-prod2` candidate remains historical and
  must not be promoted because it predates this UX refinement.
- A new fixtures-off candidate must be created from exact image digest
  `181917…d9e3c` only after the owner completes the hands-on QA check.
- Ordinary customer traffic remains `100%` on
  `korrhaus-admin-app-sock-logo-v2`, whose WebMCP flag is off.
- No live-Shopify WebMCP claim, judge-site release, quote, order or checkout
  automation is made by this evidence.

