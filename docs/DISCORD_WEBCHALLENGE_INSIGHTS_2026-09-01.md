# WebMCP Challenge Discord research

**Research date:** 1 September 2026
**Evidence window:** 25 August through 1 September 2026
**Status:** Research and product-shaping input. This file does not claim that
planned functionality is implemented, and it does not authorize a push,
deployment, Shopify change, private KORRHAUS change, or submission.

## Purpose and method

The OpenAI Discord channels webmcp-chat and webmcp-challenge were reviewed
read-only from their visible channel history. The review looked for official
guidance, recurring implementation failures, public competitor patterns, and
evidence that should change CoDesign WebMCP's product and submission plan.

No messages were sent, no reactions were added, and no direct messages or
unrelated channels were inspected. Community statements are treated as
anecdotal unless separately supported by an official source or the linked
project itself.

Discord is useful for current field evidence, but it is not the authority for
rules or deadlines. The current Devpost rules and official challenge pages
remain authoritative.

## Sources

- [OpenAI webmcp-chat channel](https://discord.com/channels/974519864045756446/1197212842265415782)
- [OpenAI webmcp-challenge announcements](https://discord.com/channels/974519864045756446/1084601369475948635)
- [Official OpenAI WebMCP Challenge page](https://openai.com/webmcp-challenge/)
- [Official Devpost resources](https://webmcp.devpost.com/resources)
- [HowToPC](https://devpost.com/software/howtopc)
- [MCPencil](https://devpost.com/software/mcpencil)
- [Respira WebMCP field report](https://www.respira.press/blog/webmcp-and-preview-links)
- [FrameGuard](https://github.com/488315/frameguard)
- [2D WebMCP](https://devpost.com/software/screen-readers-webmcp)

## Executive conclusion

The Discord evidence strengthens the Shopify direction, but it raises the bar.

The following ideas are already represented by other challenge projects:

- a human and agent sharing one live application state;
- deterministic constraint checking;
- visual or spatial work in a browser;
- temporary changes, human review, rollback, and review receipts; and
- reusable adapters that add WebMCP to an existing application.

CoDesign therefore cannot rely on “the agent can operate a configurator”,
shared state, or Keep/Revert as its main differentiation. Those are table
stakes.

The strongest defensible gap is a **configuration integrity layer for custom
Shopify products**:

1. The agent designs inside the merchant's existing live configurator.
2. The merchant's renderer and production rules remain authoritative.
3. Validation is visible, localized, and repairable.
4. The person reviews and Keeps the exact rendered configuration.
5. A bounded Configuration Passport records what was approved.
6. Shopify's native commerce path carries that configuration reference into
   cart, checkout, order, and production systems.

In one sentence:

> Shopify makes standard products agent-buyable. CoDesign makes customizable
> products agent-designable and keeps the approved design intact when commerce
> resumes.

## Evidence and implications

| Signal | Evidence classification | Direct observation | Product implication | Decision |
| --- | --- | --- | --- | --- |
| People and agents should use the web together | Official OpenAI | The challenge announcement asks for a web app people and agents can use together. The official page says an app should become meaningfully better when both participate. | The agent must operate the same merchant session and renderer the shopper sees, not a parallel chat-only model. | Adopted |
| Existing applications are valid challenge surfaces | Official OpenAI | The launch announcement and FAQ explicitly allow adding WebMCP to an existing app. | KORRHAUS is legitimate live-business proof. The public tote still provides the reproducible open-source implementation. | Already satisfied |
| Shared live state is becoming common | Competitor projects | HowToPC, MCPencil, Cograph, cooperative games, and visual builders all emphasize a human and agent acting in one running workspace. | Shared state is required but no longer a unique headline. CoDesign must show a Shopify-specific outcome beyond collaboration itself. | Adopt as baseline |
| Deterministic validation is not unique | Competitor project | HowToPC uses the same canonical builder, compatibility engine, resource accounting, and geometry checks for people and agents. | “The agent cannot create invalid combinations” is necessary, but CoDesign needs production localization, repair, and commerce integrity to stand apart. | Raise ambition |
| Draft, approval, rollback, and receipts already exist | Competitor projects | Respira stages WordPress edits for approval and rollback. FrameGuard provides human review, apply, undo, and a review receipt. | Keep/Revert is a safety requirement, not the principal innovation. The CoDesign receipt must be product- and commerce-specific. | Raise ambition |
| Tool quantity has a practical budget | Competitor field report | Respira reports that registering roughly 296 page tools disabled WebMCP without a useful error; a curated page-scoped set worked. Builders also discussed optimizing tool calls rather than exposing every action. | Preserve six high-level CoDesign tools. Express every merchant control through the manifest and typed operations rather than one tool per button. | Adopted |
| Critical information needs model-facing wording as well as fields | Competitor field report | Respira reports that an agent ignored the correct structured preview field and relayed the wrong URL until the important result also appeared in a concise message. | Every tool result should retain canonical structured fields and add a short, generated summary of the important state and next safe action. | Add to plan |
| Pacing determines whether the experience feels real | Competitor project and participant reports | MCPencil improved only after reducing action latency and adding visual inspection. Channel participants generally attributed delay to inference rather than JavaScript tool execution. | Use coherent atomic batches, two or three visible design passes, bounded results, and few round trips. Measure time to first preview and complete proposal. | Add to plan |
| Client support remains fragmented | Official OpenAI plus participant reports | OpenAI staff confirmed the desktop built-in browser and ChatGPT Sites, and said the mobile Work cloud browser was not supported at that time. Builders reported differences between the in-app browser, Chrome's native flag, and the ChatGPT Chrome extension. | Maintain an exact support matrix. Guarantee only verified clients. Do not describe native Chrome evidence as ChatGPT-in-Chrome evidence, and do not promise mobile. | Already policy; strengthen evidence |
| Top-level document registration matters | Participant report | One builder reported modelContext on the top-level page but not an embedded cross-origin frame. | The judge and Shopify proof must register tools in the top-level merchant page. An iframe may render content, but cannot be the only WebMCP host. | Add release gate |
| Authentication and browser context cause silent failures | Competitor field report | Respira documents cookie, nonce, CSRF, URL encoding, and frozen modelContext failures that each presented as missing or broken tools. | Add explicit registration diagnostics, same-origin auth tests, and real-client tests. Source tests alone do not prove discovery. | Add release gate |
| Public reproducibility is a real judging risk | Community discussion plus official rules | Multiple builders discovered late that a public repository and open-source license were required, especially when their main product was private. | Keep the complete reusable core, tote adapter, tests, and instructions public. Treat the private KORRHAUS adapter as supporting proof, never the only inspectable implementation. | Already satisfied |
| Visual proof should be accessible and targetable | Competitor project | 2D WebMCP uses structured focus and deep links to help blind users verify changes in complex visual interfaces. | Constraint X-Ray must identify a variant, control, element, and preview surface in text, with optional focusable regions. Do not rely on color overlays alone. | Add to plan |
| Builders need their own conformance tooling | Participant reports and project patterns | Builders discussed WebMCP evaluation analytics, in-app testing tools, action logs, and debug invocation surfaces. | Add a privacy-safe Conformance Flight Recorder outside the six shopper tools. It should show tool order, revisions, previews, validation, writes, and recovery. | Add to plan |
| Agent invitation helps onboarding | Competitor project | MCPencil copies a room link and ordinary-language invitation for an agent. | CoDesign should offer a plain “Design this with my agent” handoff and example brief, but users must not need to say “use WebMCP”. Tool discovery remains automatic once the page is open. | Investigate |
| Browser-local capabilities are where WebMCP is strongest | Competitor project | The Chip hardware project uses the browser-owned Web Serial connection rather than pretending a remote server has the cable. | CoDesign's equivalent advantage is access to the live renderer, authenticated Shopify session, current configuration, and merchant autosave boundary. Keep these page-local. | Reinforces architecture |

## Closest competitive projects

### HowToPC

HowToPC is the closest conceptual competitor. It offers ten WebMCP tools over
one canonical PC-building session, deterministic compatibility and resource
checks, an explicit unknown state, and a parametric visual twin.

What it proves:

- shared human-agent state is credible and already well demonstrated;
- deterministic domain rules should remain outside the language model;
- a visual configurator plus constraints is not by itself a unique category;
  and
- a strong challenge entry needs deep real data and honest uncertainty.

CoDesign's required differentiation:

- it retrofits existing merchant configurators rather than owning one PC
  builder;
- it stages zero-write proposals instead of treating each agent mutation as
  the accepted configuration;
- it specializes in artwork, variants, visual production surfaces, and
  made-to-order readiness; and
- it returns an approved configuration to Shopify commerce and production
  systems.

### Respira

Respira adds WebMCP to existing WordPress sites and uses staged edits, approval,
rollback, authenticated page context, and an open-source browser bridge.

The most important lesson is tool curation. A huge exhaustive catalog broke
page registration; a smaller page-specific catalog worked. A second lesson is
agent-response design: important output should appear in concise model-facing
language as well as structured fields.

CoDesign must therefore avoid claiming that “adapter for an existing app” or
“human approval” is novel on its own.

### FrameGuard

FrameGuard provides protected elements, a provisional visual proposal,
per-change approval, apply, undo, and a review receipt.

CoDesign's Configuration Passport cannot be merely another receipt. It must
bind the custom product, configuration revision, exact previews, production
readiness, merchant origin, and Shopify handoff reference.

### MCPencil and cooperative games

These projects demonstrate the emotional WebMCP advantage: the agent feels like
a participant rather than an automation script. Their strongest lessons are
pacing, constrained high-level actions, visual feedback, and a simple
invitation into the shared session.

CoDesign should borrow that immediacy without becoming a novelty demo.

## What changes in the CoDesign plan

### Keep

- The six high-level public tools.
- The manifest and narrow merchant adapter.
- One live shared configurator and renderer.
- Temporary proposals, zero-write Revert, and page-owned Keep.
- Public tote plus private-backed KORRHAUS proof.
- Shopify-native ownership of catalog, cart, checkout, order, and payment.

### Add

1. **Constraint X-Ray**
   - Localize each issue to a variant, control, element, and preview surface.
   - Explain the merchant rule in customer language.
   - Return bounded merchant-approved repair options.
   - Rerender and revalidate after the smallest valid repair.
   - Provide both visual and accessible textual proof.

2. **Configuration Passport v0.1**
   - Issue only after page-owned Keep succeeds.
   - Bind configuration revision, manifest version, renderer version, preview
     receipts, readiness, safe summary, merchant origin, and integrity digest.
   - Give Shopify an opaque configuration reference rather than raw artwork or
     private production data.
   - Invalidate on stale or mismatched revisions.

3. **Conformance Flight Recorder**
   - Observe the six-tool journey without becoming a seventh shopper tool.
   - Record tool order, proposal and preview revisions, write counters,
     validation issue lifecycle, human Keep/Revert, and handoff state.
   - Publish deterministic fixtures and one honest actual-client trace.

4. **Agent-result ergonomics**
   - Keep machine-readable canonical fields.
   - Add concise bounded summaries generated from those fields.
   - Make persistence state, readiness, preview freshness, and next safe action
     difficult for an agent to misreport.

5. **Client and topology gates**
   - Top-level registration.
   - ChatGPT desktop built-in browser verification.
   - Chrome 149+ native WebMCP verification.
   - Ordinary-browser regression.
   - No unsupported mobile, iframe, or ChatGPT-Chrome-extension claim.

### Do not add

- one tool per visible option;
- a generic “do everything” prompt tool;
- a CoDesign save, cart, checkout, order, payment, or customer-data tool;
- a universal renderer;
- automatic private-rule extraction;
- a browser extension required for the submitted experience; or
- unverified “works with every agent and browser” language.

## Deadline discrepancy

The initial Discord announcement text referenced a 5 p.m. PT deadline, while
the current official OpenAI page and Devpost rules show **3 September 2026 at
1 p.m. PT**. The plan must use the Devpost rules as the authority and treat
1 p.m. PT as the deadline.

## Research limitations

- Discord community reports are anecdotal and may reflect specific accounts,
  browser builds, deployment environments, or bugs that later change.
- The office-hours stage audio was not available as a transcript in the
  channels reviewed.
- Public competitor pages may continue changing until the submission freeze.
- The review establishes competitive pressure and implementation risks; it
  does not prove that no other product has attempted a Shopify configuration
  passport.
