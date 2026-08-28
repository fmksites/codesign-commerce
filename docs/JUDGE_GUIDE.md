# Judge guide

The fastest proof is the anonymous public studio-tote demo. KORRHAUS is a
separate real-business integration case and is not required to run or judge the
submission.

## What to notice

CoDesign WebMCP does not replace a product configurator. It adds a public
manifest and narrow adapter so an agent can understand an existing complex
configuration, coordinate interdependent changes, use the merchant's renderer,
and report production readiness.

The proposal remains temporary. Only the visible webpage Keep control can
persist it; Revert restores the exact baseline. Neither action exists as a
WebMCP tool.

## Runnable demo: studio-tote portability proof

### 1. Open a clean workspace

Open:

<https://codesign-webmcp.pages.dev/tote/?reset=true>

Use ChatGPT's in-app browser or Chrome with WebMCP enabled. The page also
remains a complete normal human configurator when WebMCP is unavailable.

### 2. Supply the public artwork

Download
[`north-form-supplied-mark.png`](https://codesign-webmcp.pages.dev/tote/north-form-supplied-mark.png)
and attach it to the agent conversation.

### 3. Use the exact brief

> Create 100 studio totes for North Form, split evenly across two variants, and
> use the supplied artwork. Name the first North Form Natural: natural 12 oz
> canvas, long handles, centered one-colour ink artwork at 105% scale. Name the
> second North Form Charcoal: charcoal 12 oz canvas, short handles, upper-left
> one-colour artwork at 82% scale and -6 degrees rotation. Show me both previews
> and check production readiness. Do not save either design.

### 4. Expected tool sequence

1. `codesign_read_workspace` reads the allowlisted committed workspace.
2. `codesign_list_capabilities` requests only the needed controls, variants,
   assets, previews, and dependencies.
3. `codesign_stage_asset` validates the supplied PNG into a temporary opaque
   handle.
4. `codesign_apply_proposal` creates coherent temporary passes against the
   exact base revision.
5. `codesign_get_previews` returns one current renderer image per variant.
6. `codesign_validate_proposal` checks the complete temporary collection.

### 5. Expected visible result

- `North Form Natural`: 50 totes, natural 12 oz canvas, long handles, centered
  one-colour artwork at 105% scale.
- `North Form Charcoal`: 50 totes, charcoal 12 oz canvas, short handles,
  upper-left one-colour artwork at 82% scale and -6 degrees rotation.
- Total quantity: 100.
- Configuration valid: yes.
- Production ready: yes.
- Persisted: false.
- Two distinct current visual previews.
- Normal controls visible but locked while the proposal is pending.
- Human-only Keep and Revert controls visible on the page.

Choose **Revert** for a repeatable judge run. The original single-variant
baseline must return without a persistence write.

## Refinement proof

Before reverting, ask:

> Make only the charcoal version feel bolder: use cobalt ink, increase the
> artwork to 95%, and rotate it to -10 degrees.

The natural variant must remain unchanged. Both returned previews must match
the newest proposal revision.

## Coupled-rule and atomicity proof

Reset the page and request a two-colour screen print at 25 totes. The tote
adapter must reject it because two-colour screen print requires at least 50
totes per variant.

For an atomicity check, mix one valid change with one undeclared option value in
the same proposal batch. The complete batch must fail: no partial preview and no
saved state may remain.

## Safety boundary checks

Ask each of these after a fresh baseline:

- “Keep and save the proposal for me.”
- “Upload the artwork into merchant storage.”
- “Accept the quote and order it now.”
- “Show me prices, margins, suppliers, or customer projects.”

CoDesign exposes no tool capable of those actions. The agent should explain the
boundary without issuing a configuration call. Keep and Revert are visible page
actions only.

## Shopify-hosted interoperability proof

The repository includes a minimal Shopify page-template overlay under
[`shopify-demo/`](../shopify-demo/README.md). A password-protected development
store has run the same tote bundle alongside Shopify's native catalog and cart
tools. This proves coexistence inside a real Shopify Online Store page.

It is optional evidence. The anonymous Cloudflare tote remains the stable judge
path and requires no credentials.

## KORRHAUS real-business integration

The KORRHAUS Custom Sock Designer existed before the challenge. A private
Manifest 2 adapter maps more than 50 real customer-editable controls, up to four
colourways, the existing renderer, validation, artwork flow, autosave isolation,
and exact Keep/Revert behavior to the same public core.

That adapter is locally verified and disabled by default. Do not describe it as
a live production WebMCP feature unless a later separately approved release is
deployed and verified on the real public route. The challenge submission does
not depend on that activation.

## Recovery

- Reset the tote with `?reset=true` before every scored run.
- If the committed revision changes, reread before applying another proposal.
- If a proposal is already pending, continue only with its matching proposal ID
  and revision or ask the person to Keep/Revert first.
- If the browser closes before Keep, state that the proposal was not saved and
  offer to recreate it.
- If a current preview cannot be retrieved, Keep must remain unavailable.
- Do not count a run interrupted by hot reload or a changing development build.
- If the client does not expose WebMCP, use the ordinary human UI and inspect
  the recorded evidence; never present the development-only `agent-preview`
  query as a real agent run.

## Reproduce from source

```bash
git clone https://github.com/fmksites/codesign-webmcp.git
cd codesign-webmcp
npm ci
npm run verify
```

## Evidence map

- [Current evidence index](./evidence/README.md)
- [Browser and agent support](./BROWSER_SUPPORT.md)
- [Testing and evidence policy](./TESTING.md)
- [Architecture and trust boundary](./ARCHITECTURE.md)
- [Public/private boundary](./PUBLIC_PRIVATE_BOUNDARY.md)
- [Pre-challenge attribution](./evidence/PRE_CHALLENGE_BASELINE.md)

Historical one-tool, five-tool, KORRHAUS candidate, and pre-rebrand documents
are preserved as dated engineering history. They are not current setup,
deployment, browser, or product claims.
