# Agent discovery and distribution

CoDesign Commerce improves what happens after a compatible browser agent is on
a supported configurator page. It does not by itself cause an agent, search
engine, or shopping surface to recommend that merchant.

OpenAI's current site-tools guidance is page-scoped: ChatGPT's in-app browser
discovers WebMCP tools provided by the page that is open, and those tools remain
available only while that page remains open. Chrome likewise describes WebMCP
as a contract the browser presents to an agent for the current origin. The
challenge should therefore claim reliable on-page collaboration, not automatic
traffic acquisition.

## KORRHAUS distribution path

1. **Make the real English Designer the destination.** Public challenge,
   documentation, and future campaign links should point to the existing
   Shopify route, not a replica or a separate WebMCP microsite.
2. **Keep the entry journey human-readable and crawlable.** The route chooser,
   made-to-order use case, minimum quantities, production context, and the value
   of assisted configuration must remain understandable without WebMCP.
3. **Keep reachability channels distinct.** Desktop site tools operate on the
   page a person opens in ChatGPT's in-app browser. Separately, if KORRHAUS
   chooses to support ChatGPT Work's Cloud browser, verify that Shopify, the app
   proxy, CDN, bot controls, and authentication boundary accept its signed Web
   Bot Auth traffic. Cloud-browser allowlisting is not a prerequisite for
   desktop site-tool discovery, and any allowlisting change remains a separate
   operational/security decision.
4. **Expose tools only in the supported state.** The current V1 registers five
   tools after Route 02 is open with catalog-supported choices. Route 01,
   unsupported exact-colour states, and ordinary browsers remain unchanged.
   All five tools—read, list options, propose, create design, and validate—are
   zero-write. None exposes Keep, Revert, or save: Revert writes nothing, and
   only the visible human Keep control may enter the existing Designer save
   path.
5. **Measure the funnel without customer data.** Recommended first-party events
   are capability available, proposal staged, proposal reverted, proposal kept,
   and proposal failed, plus aggregate referral/source reporting. Event payloads
   must not contain the brief, customer identity, artwork, tokens, prices, or
   private configuration data.
6. **Evaluate discovery separately from execution.** Track whether agent-origin
   visits increase, whether the five tools are actually discovered, whether a
   proposal is kept, and whether the visitor later completes the existing human
   lead/quote journey. Do not attribute traffic growth to WebMCP without this
   evidence.

## Public package distribution

The challenge repository, Apache-2.0 license, manifest/adapter documentation,
tests, and runnable studio-tote example are the reproducible developer path.
The tote demonstrates portability; it is not a KORRHAUS lead surface. A later
npm release may make installation more convenient, but it is not required to
prove the repository is runnable and reusable and should remain a separate
publication decision.

## Current official references

- [Using site tools in the ChatGPT desktop app](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app)
- [WebMCP and AI agents](https://developer.chrome.com/docs/ai/agents)
- [WebMCP Challenge](https://openai.com/webmcp-challenge/)
- [ChatGPT Work Cloud-browser allowlisting](https://help.openai.com/en/articles/11845367-chatgpt-agent-allowlisting)
