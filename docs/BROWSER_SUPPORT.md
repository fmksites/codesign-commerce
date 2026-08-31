# Browser and agent support

WebMCP is experimental and page-scoped. CoDesign WebMCP therefore separates
ordinary configurator support from agent-client claims and records the exact
build used for every actual-browser check.

## Current matrix

| Surface | Current state | What is evidenced | Release requirement |
| --- | --- | --- | --- |
| Ordinary Chrome/Chromium, desktop | Verified on current rebranded tote and live KORRHAUS Designer | Both human configurators render and remain usable without WebMCP. The final connected-Chrome check still exposed no `document.modelContext` | Repeat ordinary fallback after any runtime release; native WebMCP remains a separate gate |
| Ordinary 390 px mobile browser | Verified on current rebranded tote | No horizontal overflow, no browser errors and at least 44 px critical targets | Repeat for any later runtime release |
| Codex desktop in-app browser | Verified on current rebranded tote | Exact-six discovery plus an independent ordinary-language selection run with no protocol/tool vocabulary; two distinct 640 x 640 renderer previews, honest production validation, atomic invalid-value rejection and zero-save Revert | Complete for the current tote release; do not relabel as consumer ChatGPT web |
| Shopify development-store page | Verified through the Codex in-app WebMCP client | Password-protected top-level Online Store page independently routed the same ordinary brief through the exact six CoDesign tools alongside Shopify's native catalog/cart tools; two previews, honest production validation, mobile review controls, atomic rejection and zero-write Revert passed | Complete for this development-store release; do not relabel as consumer ChatGPT web or current native-Chrome evidence |
| ChatGPT desktop in-app browser | Not tested on the final release | Official site-tool guidance describes a page-scoped desktop-app path, but this exact final release has not been run there | Claim only after a separately documented final-release run |
| Chrome 149+ native WebMCP | Historical contract verified; current rebranded release pending relaunch | Chrome 151 previously discovered and executed the exact six tools. The connected Chrome used for the current rebranded release exposed no `document.modelContext`; its ordinary desktop/mobile UI passed | Relaunch Chrome with the testing flag enabled, then repeat native discovery and the current-release flow before making a current native-Chrome claim |
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
