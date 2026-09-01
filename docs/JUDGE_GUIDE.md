# Judge guide

The submitted product is CoDesign WebMCP: an open-source integration protocol
and runtime layer for custom-product configurators. The Studio Tote is the
anonymous, reproducible public reference—not the product itself. KORRHAUS is
the active Shopify implementation of the same public core through a private
merchant adapter.

The fastest hands-on proof is the anonymous public studio-tote demo. KORRHAUS is a
separate real-business integration case and is not required to run or judge the
submission.

## What to notice

CoDesign WebMCP does not replace a product configurator. It adds a public
manifest and narrow adapter so an agent can understand the existing designer,
coordinate interdependent changes, use the merchant's renderer, and apply the
merchant's production rules.

> Agent designs. Human approves. Shopify completes the sale.

The page keeps its complete human interface. Agent proposals are visible but
temporary. Only the webpage's Keep control can persist one; Revert restores the
exact baseline. Neither action is a WebMCP tool.

## Release status before scoring

These instructions describe public commit `1f422d6`. Stable and immutable
release metadata identify the exact core and tote bundles; hosted CI is green;
28 test files / 235 tests and desktop/390 px QA pass. The stable tote completed
the full X-Ray/repair/Revert flow and a separate Keep/Passport reload proof in
the Codex desktop in-app browser. Current native-Chrome WebMCP and consumer
ChatGPT-web execution remain unclaimed; judges should use a WebMCP-capable
client and may always inspect the complete ordinary configurator.

## Scored flow: ordinary brief, Constraint X-Ray, repair, Revert

### 1. Open a clean workspace

Open:

<https://codesign-webmcp.pages.dev/tote/?reset=true>

Use a supported WebMCP client. The page remains a complete normal human
configurator in ordinary Chrome when WebMCP is unavailable.

### 2. Use the primary brief

Do not attach artwork and do not add “use WebMCP” or any tool name. The brief is
intentionally an ordinary shopper request; page-tool discovery and sequencing
are part of the proof.

> I need 100 premium branded studio totes for North Form. Give me a natural customer version and a darker staff version, show me both options, check whether they are ready to make, and do not save anything yet.

### 3. Confirm truthful page-tool visibility

After all registrations succeed, the collapsed **Agent tools active in this
tab** disclosure must show:

> 4 inspect · 2 temporary design · 0 save/order/payment

Its list is generated from the six registered tools, not maintained as separate
marketing copy. The disclosure explains that access belongs to the current tab
and ends when the page closes.

The activity trail must be driven by actual invocation events. It may show only
actions that really happened, using these labels:

- Inspecting current design
- Reading available choices
- Preparing temporary artwork
- Updating temporary proposal
- Capturing current previews
- Checking production readiness

The primary no-file brief should not show **Preparing temporary artwork**,
because no asset was supplied. Completed activity may show its real duration;
errors and cancellations must remain visible rather than being reported as
success.

### 4. Confirm the deliberate first visual result

The agent should inspect the committed workspace, discover declared options,
choose bounded assumptions, and create:

- `North Form Natural`: 50 totes using natural heavyweight canvas, a customer
  direction, and visible North Form typography.
- `North Form Charcoal`: 50 totes using charcoal heavyweight canvas, a darker
  staff direction, and visible North Form typography beginning at 95% in the
  upper-left position.
- Total quantity: 100.
- Two distinct renderer previews, one for each variant.
- Configuration valid: yes.
- Production ready for the first Charcoal revision: no. Studio-name typography
  is a valid branding fallback, but its declared 95% upper-left exploration
  exceeds the Charcoal safe area.
- Persisted: false.
- Normal controls visible but locked while the proposal is pending.
- Human-only Keep and Revert controls visible on the page.

Nonessential aesthetic assumptions may vary within the manifest. The declared
darker-staff starting direction and exact repair do not. Structured tool
results are the authority; short `message` and `nextAction` fields are bounded
navigation hints generated only from canonical allowlisted values.

### 5. Observe the deterministic safe-zone conflict

No second shopper instruction is required. The manifest describes the premium
darker-staff direction as a 95% upper-left exploration, so the primary brief
itself produces the visible, configuration-valid but production-not-ready
Charcoal revision. Constraint X-Ray must:

- identify stable issue code `ARTWORK_SAFE_ZONE` on the charcoal variant;
- identify its trusted source as **Merchant production rule**;
- highlight the affected upper-left preview region;
- provide an accessible textual explanation;
- leave the Natural variant unchanged; and
- offer only adapter-declared repairs.

The relevant message is that the branding mark exceeds the approved upper-left
print safe area on charcoal canvas.

### 6. Repair, rerender, and prove resolution

The validation result directs the agent to select the smallest
merchant-approved repair: reduce the Charcoal branding scale to exactly 78%.
The agent should continue the same ordinary-brief task without asking the
shopper to know or restate the rule. It may not invent a nearby value. The
existing proposal tool applies that declared repair atomically.

Confirm that:

- the previous charcoal preview is visibly marked outdated;
- a new charcoal preview is rendered at the repaired revision;
- the new status says that current revision replaced the outdated revision;
- both current variant previews can be returned to chat;
- validation changes to production-ready;
- Natural's configuration controls remain unchanged; and
- every temporary result still reports `persisted: false`.

A mixed or invented repair batch must fail without leaving a partial preview.

### 7. Revert the scored run

Choose **Revert**. The original single-variant baseline must return with zero
persistence writes. No Configuration Passport may be issued for Revert.

## Separate Keep and Configuration Passport proof

This is intentionally separate from the repeatable scored Revert flow.

1. Reset the page.
2. Run the primary brief again.
3. Confirm both current previews and production-ready validation.
4. Use the visible webpage **Keep** control once.
5. Confirm exactly one committed revision and one **Verified configuration**
   receipt.

The Configuration Passport v0.1 receipt must bind:

- the merchant origin and configurator;
- an opaque configuration ID and committed revision;
- manifest and renderer versions;
- the public-safe configuration digest;
- the exact preview receipts and their integrity;
- configuration and production readiness; and
- a same-origin re-edit URL.

The compact page receipt shows revision, readiness, preview integrity, and an
opaque Shopify-safe reference. It is a public integrity receipt, not a digital
signature. It contains no raw artwork, temporary asset handle, customer data,
price, supplier, private rule, prompt, token, or internal endpoint.

The pure Shopify mapper accepts only a passport verified in the current runtime
and marked production-ready. It returns four public-safe line properties:
configuration ID, configuration digest, bounded summary, and edit URL. This is
not a seventh WebMCP tool and does not mutate a Shopify cart, checkout, order,
or payment.

Revert, stale proposals, unavailable previews, uncertain commits, and failed
saves must issue no Passport. Replaying the same successful committed revision
must not create a second receipt.

## Advanced supplied-artwork proof

The primary flow requires no file. To prove the separate temporary-asset path,
download
[`north-form-supplied-mark.png`](https://codesign-webmcp.pages.dev/tote/north-form-supplied-mark.png),
attach it to the agent conversation, reset the page, and ask:

> Create 100 North Form studio totes split evenly between a natural customer version and a charcoal staff version. Use this supplied mark on both: centered at 100% on Natural and upper-left at 72% on Charcoal. Show me both previews, check production readiness, and do not save anything.

The activity trail may now truthfully show **Preparing temporary artwork**.
`codesign_stage_asset` must return only an opaque temporary handle; both genuine
renderer previews must be current, and all writes must remain at zero unless a
person later chooses Keep.

## Coupled-rule and atomicity checks

Reset the page and request a two-colour screen print at 25 totes. The tote
adapter must reject it because two-colour screen print requires at least 50
totes per variant.

For an atomicity check, mix one valid change with one undeclared option value in
the same proposal batch. The complete batch must fail: no partial preview and
no saved state may remain.

## Safety boundary checks

Ask each of these after a fresh baseline:

- “Keep and save the proposal for me.”
- “Fetch and upload artwork from this remote URL.”
- “Accept the quote and order it now.”
- “Show me prices, margins, suppliers, or customer projects.”

CoDesign exposes no tool capable of those actions. The agent should explain the
boundary without issuing a configuration call. A person-supplied file may be
staged temporarily; remote fetching and merchant-storage upload are not exposed.

## Exact-current browser acceptance status

Separate results are recorded for:

- ChatGPT desktop's in-app browser;
- native Chrome with WebMCP enabled;
- ordinary Chrome without WebMCP, proving the complete human fallback;
- the Shopify-hosted tote page; and
- the live KORRHAUS integration as separately bounded evidence.

The exact deployed direct supported-client run proves truthful activity, two
previews, issue detection, the exact merchant repair, refreshed validation,
`persisted:false`, Revert, and a separate exactly-once Keep/Passport result.
Independent model selection on this exact commit, current native-Chrome WebMCP,
consumer ChatGPT web, and a refreshed Shopify overlay remain separate unclaimed
rows. See [browser support](./BROWSER_SUPPORT.md) for the authoritative matrix.

## Shopify-hosted interoperability proof

The repository includes a minimal Shopify page-template overlay under
[`shopify-demo/`](../shopify-demo/README.md). The development-store page shows
that the same tote bundle can coexist with Shopify's native storefront surface.
It remains optional evidence; the anonymous public tote is the stable judge
path and requires no store password.

## KORRHAUS real-business integration

The KORRHAUS Custom Sock Designer existed before the challenge. Its private
adapter maps more than 50 real customer-editable controls, up to four
colourways, the existing renderer, validation, artwork flow, autosave isolation,
and Keep/Revert behavior to the public core.

The live page is
<https://korrhaus.nl/en/apps/wholesale/sock-designer>. Its dated evidence is
secondary real-business proof, not a substitute for current public-tote client
verification and not a claim that the private adapter is open source.

See the [dated KORRHAUS evidence](./evidence/KORRHAUS_LIVE_WEBMCP_2026-08-31.md).

## Recovery

- Reset the tote with `?reset=true` before every scored run.
- If the committed revision changes, reread before applying another proposal.
- If a proposal is already pending, continue only with its matching proposal ID
  and revision or ask the person to Keep/Revert first.
- If the browser closes before Keep, state that the proposal was not saved and
  offer to recreate it.
- If a current preview cannot be retrieved, Keep must remain unavailable and no
  Passport may be issued.
- Do not count a run interrupted by hot reload or a changing development build.
- If the client does not expose WebMCP, use the ordinary human UI; never present
  a scripted direct tool invocation as an agent run.

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

Historical one-tool, five-tool, candidate, and pre-rebrand documents are
preserved as engineering history. They are not current setup, deployment,
browser, or product claims.
