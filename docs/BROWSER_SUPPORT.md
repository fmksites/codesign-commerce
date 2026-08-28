# Browser and agent support

WebMCP is experimental and page-scoped. CoDesign Commerce therefore separates
ordinary configurator support from agent-client claims and records the exact
build used for every actual-browser check.

## Current matrix

| Surface | Current state | What is evidenced | Release requirement |
| --- | --- | --- | --- |
| Ordinary Chrome/Chromium, desktop | Verified locally | Complete human tote and KORRHAUS UI; no tools or proposal panel when `document.modelContext` is absent | Repeat on the deployed tote URL and any promoted KORRHAUS route |
| Ordinary 390 px mobile browser | Verified locally | Responsive human UI, no horizontal overflow, proposal review fallback | Repeat on the deployed tote URL |
| Codex desktop in-app browser | Verified locally | Exact-six discovery, visible proposals, real artwork, renderer previews, zero-write Revert and exactly-once page Keep | Repeat against the immutable deployed tote build |
| ChatGPT desktop in-app browser | Pending final release test | Earlier feasibility work proved inline renderer images and page Keep behavior, but the final normal ChatGPT conversation/permission journey was explicitly deferred | Required before claiming the full chat-first experience |
| Chrome 149+ native WebMCP | Contract verified, final release repeat pending | Chrome 151 discovered and executed the exact six tools under the official testing path on the Item 8 build | Repeat on the exact deployed tote build with WebMCP testing/origin support enabled |
| ChatGPT website running in ordinary Chrome | Not claimed | The normal website remains usable, but OpenAI site-tool availability is not inferred from Chrome alone | Claim only if OpenAI documents and an actual run proves this client path |
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
- The KORRHAUS feature must not be called live until its separately approved
  production route and feature flag are verified.

## Official references

- [WebMCP Challenge official rules](https://webmcp.devpost.com/rules)
- [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Using site tools in the ChatGPT desktop app](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app)
