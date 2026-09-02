# Browser and agent support

WebMCP is experimental and page-scoped. CoDesign WebMCP therefore separates
ordinary configurator support from agent-client claims and records the exact
build used for every actual-browser check.

The current 2 September public release is commit
`14cbe14410195774285180255189282e0c2b054d`, immutable deployment
<https://80f00a8d.codesign-webmcp.pages.dev/>, core bundle
`460aa40ade9b4cb42491a3028032ba970d8db4ce35febd7d646962890c13880b`,
and tote bundle
`edc44d53d107fed84a01fd78f3a027549c56f81c452ffbc457b2402d446f85d4`.
Stable and immutable metadata plus downloaded bundles matched these values.

## Current matrix

| Surface | Current state | What is evidenced | Release requirement |
| --- | --- | --- | --- |
| Codex desktop in-app browser, current public release | Verified on commit `14cbe14` on 2 September 2026 | Exact-six direct page-tool flow created Natural and 95% upper-left Charcoal, returned two 640 x 640 previews, exposed the merchant-rule X-Ray, accepted only the returned 78% repair, returned two fresh revision-2 previews, revalidated ready with `persisted:false`, and Revert restored the baseline | Current direct supported-client evidence; do not relabel as independent model selection, consumer ChatGPT web, or native Chrome |
| Ordinary Chrome/Chromium, current public tote and live KORRHAUS | Current tote fallback verified; KORRHAUS remains dated evidence | The public tote rendered its complete human UI and generated disclosure with no overflow or browser warnings/errors. A human colour click produced a Charcoal renderer preview and Reset restored baseline. The current Chrome connection exposed no `document.modelContext` or WebMCP capability | Complete as ordinary-browser fallback; native WebMCP remains a separate unclaimed gate |
| Ordinary 390 px mobile browser | Verified on current public tote | `scrollWidth === clientWidth === 390`, complete heading/disclosure, and no browser warnings/errors | Repeat for any later runtime release |
| Codex desktop in-app browser, prior public release | Verified on public commit `a3b7c1f` on 31 August 2026 | Exact-six discovery; temporary two-variant proposal; two distinct 640 x 640 renderer previews; honest missing-artwork production decision; current reread; visible zero-save Revert; no browser warnings/errors. Earlier independent ordinary-language selection also passed on the same tote application bundle | Dated evidence only; repeat the improved flow after approved deployment and do not relabel as consumer ChatGPT web |
| Shopify development-store page | Verified through the Codex in-app WebMCP client | Password-protected top-level Online Store page independently routed the same ordinary brief through the exact six CoDesign tools alongside Shopify's native catalog/cart tools; two previews, honest production validation, mobile review controls, atomic rejection and zero-write Revert passed | Complete for this development-store release; do not relabel as consumer ChatGPT web or current native-Chrome evidence |
| ChatGPT desktop in-app browser | Not separately tested on the final release | Official site-tool guidance describes a page-scoped desktop-app path, but the final proof used Codex desktop's in-app browser capability | Claim only after a separately documented ChatGPT-desktop run |
| Chrome 149+ native WebMCP | Historical contract verified; current release unclaimed | Chrome 151 previously discovered and executed the exact six tools. The connected Chrome used for commit `1f422d6` exposed no `document.modelContext` or WebMCP capability; its ordinary UI passed | Repeat native discovery and tool execution in a Chrome instance that exposes the official API before making a current native-Chrome claim |
| Live KORRHAUS Shopify route in a WebMCP-capable Codex browser | Verified on 31 August 2026 | The page exposed Shopify's native storefront tools plus CoDesign's exact six; a temporary 120-pair/two-colourway proposal produced two current previews, validation, `persisted:false`, and zero-write Revert | Secondary live-business proof; do not relabel as consumer ChatGPT or native-Chrome evidence |
| ChatGPT website running in ordinary Chrome | Verified unavailable in the tested session | On 28 August 2026 the submitted prompt caused ChatGPT to search plugins for `WebMCP`; the result was empty, no webpage tool was exposed, no proposal ran, and no preview was returned | Do not use this path in the demo or claim it as supported unless OpenAI changes the client and a new run proves it |
| Claude or other agent clients | Not claimed | The protocol and manifest are client-neutral by design | Verify each named client before adding it to submission claims |

## Supported behavior

When `document.modelContext.registerTool` exists, a supported configurator may
register the exact six CoDesign tools for the current page lifecycle. The agent
can read the allowlisted workspace, discover bounded capabilities, stage a
temporary asset, apply an atomic proposal, retrieve revision-bound visual
previews, and validate the committed or proposed workspace.

When the API is absent, the merchant's ordinary interface remains the product.
No polyfill, remote MCP server or DOM-automation fallback is silently presented
as native WebMCP.

## Prior public-release checkpoint

The supported-client repeat on 31 August 2026 used stable public commit
`a3b7c1fc38578b0a3a3bcb78f1c62242020b1f0b` and immutable deployment
<https://a8e2b6b7.codesign-webmcp.pages.dev/>. Both authorities identify core
bundle
`c0fc462e099c380432d6d28971dba686d0f5f258ab7d5d368b1a6cd3110d1b56`
and tote bundle
`4058d70e3b7250c11edd51931ba21bc23d698d8cd58000a046915a07bc1d582e`.
The dated proof is
[`CODESIGN_FINAL_SUPPORTED_CLIENT_RELEASE_2026-08-31.md`](./evidence/CODESIGN_FINAL_SUPPORTED_CLIENT_RELEASE_2026-08-31.md).

## Current public-release checkpoint

Commit `14cbe14410195774285180255189282e0c2b054d` and immutable deployment
<https://80f00a8d.codesign-webmcp.pages.dev/> completed the deployed direct-root
redirect and exact-six X-Ray, preview-freshness, production-readiness, and
zero-write Revert checks described above. The evidence is
[`DIRECT_TOTE_PUBLIC_RELEASE_2026-09-02.md`](./evidence/DIRECT_TOTE_PUBLIC_RELEASE_2026-09-02.md).

## Claim discipline

- A Playwright run proves browser behavior, not independent model tool
  selection.
- A direct `document.modelContext` call proves the native page contract, not a
  complete ChatGPT conversation.
- A local or zero-traffic run does not prove the submitted public URL.
- A returned data URL proves preview transport only when the supported client
  actually displays the matching image inline.
- Native WebMCP support in Chrome does not automatically make the ChatGPT
  website inside that browser a WebMCP agent host. Those are separate clients
  and require separate evidence.
- KORRHAUS is a verified live secondary integration. Its Codex-browser evidence
  must not be relabeled as native Chrome or consumer ChatGPT evidence, and the
  anonymous tote remains the reproducible submission path.

## Official references

- [WebMCP Challenge official rules](https://webmcp.devpost.com/rules)
- [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Using site tools in the ChatGPT desktop app](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app)
