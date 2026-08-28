# CoDesign WebMCP zero-incantation live QA — 28 August 2026

## Outcome

The current public release proved that an ordinary shopper does not need to
know the term WebMCP, name a tool, copy option IDs, or instruct the agent how to
call tools. After opening the product page, a separate Codex task independently
discovered and selected the page-defined CoDesign tools from the shopper's
request.

This is page-scoped evidence. The compatible product page still has to be
visited before its tools can be discovered. It is not a claim that a website
can advertise WebMCP tools to an agent before the page is opened.

## Public release identity

- Repository: <https://github.com/fmksites/codesign-webmcp>
- Commit: `ae5e93a28dc735b0f8bb08596fb3ab8c22f7a2f5`
- Stable tote: <https://codesign-webmcp.pages.dev/tote/?reset=true>
- Immutable deployment: <https://30415c02.codesign-webmcp.pages.dev/>
- Core browser bundle SHA-256:
  `c0fc462e099c380432d6d28971dba686d0f5f258ab7d5d368b1a6cd3110d1b56`
- Tote application bundle SHA-256:
  `4058d70e3b7250c11edd51931ba21bc23d698d8cd58000a046915a07bc1d582e`
- Hosted CI: <https://github.com/fmksites/codesign-webmcp/actions/runs/33205514576>

The stable and immutable deployments returned the same source commit and
bundle digests. Root and tote routes returned HTTP 200 with the expected CSP,
permissions, referrer, frame-denial, and `nosniff` headers.

## Ordinary shopper prompt

The separate task received only this request:

> Open https://codesign-webmcp.pages.dev/tote/?reset=true. I need 100 premium
> branded studio totes for North Form. Make one natural customer version and
> one darker staff version, split the quantity evenly, use the studio name as
> the branding, show me both visual options in this chat, and tell me if they
> are ready to make. Do not save anything.

The prompt contained no protocol name, CoDesign tool name, option ID, or
tool-call instruction.

## Independent public-page result

The separate task independently invoked:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_apply_proposal`
4. `codesign_get_previews`
5. `codesign_validate_proposal`
6. `codesign_read_workspace`

It created two temporary variants:

- `North Form Customer`: 50 natural 16 oz reinforced totes, long handles,
  centered one-colour editorial `NORTH FORM` branding at 105 percent.
- `North Form Staff`: 50 charcoal 16 oz reinforced totes, short handles,
  upper-left one-colour mono `NORTH FORM` branding at 90 percent.

The merchant renderer returned and the chat displayed two distinct 640 by 640
previews:

- `sha256:86e7ef83971a941440a867aa364e5ad4ffb9e13b9ad66aa1b66c1c0fbb7e6f03`
- `sha256:179c0a385b999ced3fe7e1ca7aa0a699393d76ea02fe667d256cbe07d80e4a30`

Validation returned `configuration_valid: true` and
`production_ready: false`. The only decision was the truthful
`FINAL_PRINT_ARTWORK_REQUIRED` issue because the shopper had not supplied final
artwork. The committed workspace stayed at `tote-revision-1`; Keep was not
invoked, nothing was saved, the proposal remained reviewable, and no tool error
occurred.

## Independent Shopify-origin result

The same ordinary brief was then sent to the password-protected Shopify
development-store page:

<https://korrhaus-development.myshopify.com/pages/codesign-webmcp-tote-demo?reset=true>

Again, the prompt contained no WebMCP term, tool name, option ID, or tool-call
instruction. The separate task independently selected the same six-call
sequence, produced the same two 50-unit design directions, displayed two
genuine 640 by 640 Shopify-origin renderer previews, reported the same honest
missing-final-artwork decision, and left `persisted: false`, `saved: false`,
and `keep_invoked: false` at `tote-revision-1`. No tool errors occurred.

This Shopify page simultaneously exposed Shopify's native storefront tools and
the six CoDesign tools. The direct page inspection confirmed both Shopify's
official storefront WebMCP script and the Shopify-CDN-hosted CoDesign bundle.
No product, cart, order, customer, checkout, price, or production KORRHAUS state
was changed.

After explicit owner approval, the current seven-file CoDesign overlay was
uploaded to active theme `205741359446` on the password-protected development
store. The push used `--nodelete` and an exact `--only` list, so no unrelated
theme file was replaced or deleted. A scoped pullback then matched all seven
local files byte for byte. The deployed tote application bundle SHA-256 is
`4058d70e3b7250c11edd51931ba21bc23d698d8cd58000a046915a07bc1d582e`.

A separate Codex task then received only this ordinary shopper request:

> Open
> https://korrhaus-development.myshopify.com/pages/codesign-webmcp-tote-demo?reset=true.
> I need 100 premium branded studio totes for North Form. Make one natural
> customer version and one darker staff version, split the quantity evenly,
> use the studio name as the branding, show me both visual options in this chat,
> and tell me if they are ready to make. Do not save anything.

Without being told to use WebMCP, it independently selected read, capabilities,
apply, previews, validate, and final reread. It created two 50-unit temporary
variants and displayed two genuine 640 by 640 renderer previews:

- `sha256:02373901e18cbdbc5022c2dd140da129697877d46f4c29552b7ee44eb8dee77f`
- `sha256:91a357897fc3e5396441f0fc9e860366e1da4a4e17598f22a83b2bdfb81060f1`

Validation was configuration-valid but production-not-ready because studio-name
typography is not final print artwork. The proposal remained temporary at
committed revision `tote-revision-1`; Keep was not invoked and nothing was
saved. No tool errors occurred.

## Rendered browser QA

The public and Shopify-hosted pages both passed:

- correct page identity and meaningful rendered content;
- no framework error overlay;
- no console warnings or errors;
- normal human colour selection updating the live tote renderer;
- Reset restoring the deterministic natural, 12 oz, long-handle baseline;
- desktop visual inspection; and
- 390 px mobile inspection without horizontal overflow.

The public page measured 390 px client and scroll width. The refreshed Shopify
page also measured 390 px client and scroll width, without horizontal overflow.

## Clean-clone and hosted verification

A fresh clone of public `main` resolved to
`ae5e93a28dc735b0f8bb08596fb3ab8c22f7a2f5`. `npm ci --offline` reported zero
vulnerabilities and `npm run verify` passed:

- 22 test files / 189 tests;
- strict typecheck;
- production and Shopify-overlay builds;
- browser-bundle and judge-site checks;
- 195-candidate public-boundary scan;
- 74-file documentation-link check;
- 26 eval cases across six categories plus scorer self-test; and
- 25/25 tote parity with 14 mapped controls, four variant operations, one asset
  slot, and six intentional exclusions.

GitHub Actions independently passed the same public commit.

## Chrome boundary

Ordinary Chrome rendered the current public tote without overflow, warnings, or
errors. The connected Chrome instance did not expose
`document.modelContext`, so this checkpoint does not claim a current native
Chrome WebMCP execution. Historical Chrome 151 evidence remains historical.
The current live zero-incantation claim is limited to the separately exercised
Codex in-app-browser agent host and the Shopify origin reached by that host.

The consumer ChatGPT website inside ordinary Chrome is also not claimed as a
site-tools host.
