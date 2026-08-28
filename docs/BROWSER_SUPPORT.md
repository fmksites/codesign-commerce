# Browser and agent support

WebMCP is experimental and page-scoped. CoDesign Commerce therefore separates
ordinary configurator support from agent-client claims and records the exact
build used for every actual-browser check.

## Current matrix

| Surface | Current state | What is evidenced | Release requirement |
| --- | --- | --- | --- |
| Ordinary Chrome/Chromium, desktop | Verified on deployed final tote | Human configurator loaded without overflow or console errors; browser-only save scope is explicit and all desktop section targets are at least 44 px. KORRHAUS remains a separate private/local claim | Repeat only for any separately promoted KORRHAUS route |
| Ordinary 390 px mobile browser | Verified on deployed final tote | Responsive human and proposal UI, no horizontal overflow, visible keyboard focus and at least 44 px critical targets | Complete for the tote release |
| Codex desktop in-app browser | Verified on stable and immutable final tote | Exact-six discovery, real artwork, two renderer previews, validation, targeted refinement, Revert, Keep/reload, atomicity, idempotency and cross-tab recovery | Complete for the tote release |
| ChatGPT desktop in-app browser | Not tested on the final release | Official site-tool guidance describes a page-scoped desktop-app path, but this exact final release has not been run there | Claim only after a separately documented final-release run |
| Chrome 149+ native WebMCP | Historical contract verified; exact final release blocked in the connected instance | Chrome 151 discovered and executed the exact six tools under the official testing path on the Item 8 build. The connected Chrome used for the exact final deployed smoke exposed no `document.modelContext`; its ordinary UI still passed | Repeat on the exact deployed final build with WebMCP testing/origin support enabled before making a current native-Chrome claim |
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
- The KORRHAUS feature must not be called live until its separately approved
  production route and feature flag are verified.

## Official references

- [WebMCP Challenge official rules](https://webmcp.devpost.com/rules)
- [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Using site tools in the ChatGPT desktop app](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app)
