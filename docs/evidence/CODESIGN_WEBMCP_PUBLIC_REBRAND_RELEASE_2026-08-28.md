# CoDesign WebMCP public rebrand release — 28 August 2026

This is a verified working release, not the final challenge freeze. Development
may continue before the submission deadline; every later runtime change must
repeat the relevant release and browser gates.

## Public authorities

- Repository: <https://github.com/fmksites/codesign-webmcp>
- Stable site: <https://codesign-webmcp.pages.dev/>
- Deterministic tote: <https://codesign-webmcp.pages.dev/tote/?reset=true>
- Deployment URL: <https://78c60433.codesign-webmcp.pages.dev/>
- Deployed source commit: `8322698e3b1a8924f331e78d18c2750c784e9816`
- Hosted CI: <https://github.com/fmksites/codesign-webmcp/actions/runs/33179776521>

The previous `codesign-commerce.pages.dev` project remains untouched as
historical evidence and rollback continuity. It is not the current submission
URL. No Git tag or final immutable-release claim was created.

## Repository and release verification

- GitHub reports the repository as public and detects Apache-2.0.
- The repository About description is “WebMCP for Custom Products on Shopify.
  Make your Shopify product configurator agent-ready.”
- The About homepage points to the rebranded Cloudflare Pages site.
- `ASSET_NOTICES.md` distinguishes Apache-2.0 code, KORRHAUS-owned marks and
  assets, fictional challenge artwork, and merchant asset responsibilities.
- A clean no-local clone completed offline `npm ci` with zero reported
  vulnerabilities, 21 files / 184 tests, typecheck, release build, bundle,
  judge-site, public-boundary, documentation, eval-structure, and 25/25 control
  parity checks.
- Hosted GitHub CI repeated the same repository gates successfully.

Artifact identities:

| Artifact | SHA-256 |
| --- | --- |
| `assets/codesign-webmcp.js` | `aa195de70a5c0a2a7db0a929e038212f485d70db309f0538914dad7c1da7371f` |
| Tote application bundle | `28ccc028f0ed455e5606570b159d67e4ff297958f249bcba6d3305af04a8a18a` |
| Supplied North Form PNG | `593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5` |

The stable download of `assets/codesign-webmcp.js` matched the release digest.
The root and tote returned HTTP 200 with the expected restrictive CSP,
permissions policy, referrer policy, frame denial and nosniff headers.

## Exact-six deployed in-app-browser result

The deployed tote exposed exactly:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

The current Codex in-app browser then executed the complete North Form flow:

- read `tote-revision-1` and all required option/dependency metadata;
- applied coherent Foundation, Branding, and Variants passes;
- temporarily staged the real 214,745-byte supplied PNG;
- created `North Form Natural` and `North Form Charcoal`, 50 units each;
- returned two distinct 640 by 640 WebP previews with digests
  `74e1d748d287e861696bdf23239e7d0b7b0ddb60eba37c4b314e64b0f6b73df7`
  and
  `7c5b4bd5230f03039ad581a4c430fda2102cf4240708b43a5d911028c73c85a3`;
- visually showed the centered black 105 percent mark on the natural long-handle
  tote and the upper-left white 82 percent, -6 degree mark on the charcoal
  short-handle tote;
- returned configuration-valid and production-ready;
- kept all ordinary controls locked while the proposal was reviewable;
- exposed visible page-owned Keep and Revert controls but no persistence tool;
- used Revert and restored the single committed `Canvas tote` baseline at
  `tote-revision-1`, with `persisted: false` and no pending proposal;
- recorded no browser warnings or errors.

## Ordinary Chrome result and remaining native check

The same stable tote passed ordinary Chrome desktop and 390 px checks:

- rebranded title and human configurator loaded;
- no horizontal overflow or browser warnings/errors;
- visible critical targets measured at least 44 px;
- a human studio-name edit rendered and Reset restored `NORTH FORM`.

The connected Chrome instance did not expose `document.modelContext` on this
release, even though the testing flag had previously been selected. Therefore
this checkpoint does not claim a current native-Chrome WebMCP pass. Chrome must
be relaunched with `chrome://flags/#enable-webmcp-testing` enabled and the exact
six-tool flow or an equivalent current-release native regression repeated.

The official submission wording is alternative, not cumulative: the live URL
must work in ChatGPT's in-app browser **or** Google Chrome with WebMCP enabled.
This project still records each client precisely and does not relabel the Codex
in-app-browser run as a literal consumer ChatGPT website run.

## Exclusions

- No private KORRHAUS source, Shopify state, Cloud Run revision, feature flag,
  production traffic, customer data, pricing, or merchant workflow changed.
- No Keep, save, order, quote, checkout, payment, or Devpost submission ran.
- No video was created.
- The project was not frozen or tagged; further development remains allowed.
