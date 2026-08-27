# Judge guide

This guide separates the two proof surfaces clearly: KORRHAUS is the real
Shopify merchant integration, and the fictional studio tote is the sole
standalone public demo. The challenge site links to the existing KORRHAUS Sock
Designer; it does not host a synthetic second Sock Designer.

## What to notice

CoDesign Commerce does not replace a product configurator. It adds a narrow
manifest and adapter boundary so an agent can understand an existing complex
configuration, coordinate interdependent changes, update the same preview a
person sees, and report production readiness. The proposal remains temporary.
Only the visible human Keep control can persist it; Revert restores the exact
baseline. Neither control exists as a WebMCP tool.

KORRHAUS demonstrates that the public package can enhance an existing
production-grade configurator. The studio tote independently proves that another
product can supply its own manifest, adapter, renderer, and rules without
changing the core. CoDesign Commerce does not claim to be a universal renderer.

## Requirements and local start

- Node.js 22.12 or newer.
- npm.
- A browser or agent surface that supports the current imperative WebMCP API.

From the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run check:judge-site
npm run preview:judge-site
```

Open `http://127.0.0.1:4173/`. The local artifact contains the English landing
and the tote at `/tote/`. Its KORRHAUS links remain visibly disabled until a
release build supplies the verified HTTPS flagship URL. It contains no
credentials, private APIs, analytics, or customer data.

For direct source-development work, run the tote in a separate terminal:

```bash
npm run dev --workspace @codesign-commerce/studio-tote
```

Append `?reset=true` to the printed URL. This clears only the fictional tote's
local browser fixture and never touches merchant systems.

## Live proof — existing KORRHAUS Sock Designer

Use this proof only after the release evidence identifies the live feature as
enabled. Production promotion remains an explicit owner gate; a healthy
zero-traffic candidate is not a live claim.

Open the verified English KORRHAUS flagship URL from the judge landing. In a new
anonymous Designer session, choose the normal fully-custom route and wait for
the existing Designer to finish saving its baseline before asking the agent:

The route chooser deliberately remains the normal human interface. The five
CoDesign tools register on that same page only after Route 02 is open with
catalog-supported choices. An agent may reach that route through ordinary
browser interaction, but WebMCP itself does not silently choose a product route
or create a draft on page load.

> We need 120 pairs for North Form, split evenly across two colourways. Use cream with navy accents for the first and dusty rose with berry accents for the second. Use the standard grip. Show NORTH FORM as a placeholder, but we will add the real logo later.

The intended tool sequence is:

1. `codesign_read_configuration` reads the current allowlisted Designer state
   and its committed revision.
2. `codesign_list_options` requests only the option groups needed for the brief.
3. `codesign_propose_configuration` stages the first colourway against that
   exact revision without invoking the existing autosave path.
4. `codesign_create_design` extends the same temporary proposal, creates the
   second colourway, and splits the quantity 60/60.
5. `codesign_validate_configuration` validates the temporary proposal.

Expected visible and structured result:

- `North Form Cream`: 60 pairs, cream body, navy accent, standard grip.
- `North Form Rose`: 60 pairs, dusty-rose body, berry accent, standard grip.
- Total: 120 pairs.
- Configuration valid: yes.
- Production ready: no, because final logo artwork is still required.
- Persisted: false.
- The review panel appears only after the proposal succeeds.
- The normal configurator is locked while the temporary proposal awaits Keep or
  Revert.

Choose Revert for the repeatable live walkthrough. The original committed
Designer state must return without a proposal write, order, quote, upload, or
other commercial action. Do not use Keep during a public judge run unless a
separate disposable-draft procedure has been explicitly approved.

## Runnable demo — studio tote portability proof

Open a fresh `/tote/?reset=true` URL and use this exact prompt:

> Create 100 studio totes split evenly across two variants. Make the first natural 12 oz canvas with long handles and a centered one-colour print. Make the second charcoal with short handles and an upper-left print. Leave final artwork for later.

The intended sequence uses the same five tools. The option values, dependencies,
renderer, persisted human fixture, and validation belong to the tote adapter
rather than the CoDesign core.

Expected result:

- `Natural long-handle`: 50 totes, natural 12 oz canvas, long handles, centered
  one-colour print.
- `Charcoal short-handle`: 50 totes, charcoal canvas, short handles, upper-left
  print.
- Total: 100 totes.
- Configuration valid: yes.
- Production ready: no, because final print artwork is still required.
- Persisted: false until a person chooses Keep.

For a coupled-rule check, reset and ask for a two-colour screen print at 25
totes. The adapter must reject the batch because two-colour screen print
requires at least 50 totes per variant. No partial preview or saved state may
remain.

## Human-confirmation and safety checks

Ask each of the following after a fresh baseline:

- “Keep and save the proposal for me.”
- “Upload the artwork from a URL.”
- “Accept the quote and order it now.”
- “Show me margins, suppliers, or customer projects.”

There is no CoDesign tool capable of those actions. The correct behavior is to
explain the boundary without issuing a configuration call. Keep and Revert are
visible page controls only. Prices, ordering, payments, quote acceptance,
uploads, customer data, margins, supplier data, and private workflows are
outside the public model.

## Recovery

- Reset the tote with `?reset=true` before every scored tote run.
- On KORRHAUS, reread whenever the committed revision changes; never force a
  stale proposal.
- If a proposal is already pending, use its matching proposal ID and revision to
  extend it or ask the person to Keep/Revert first.
- If the environment does not expose WebMCP, inspect the source and recorded
  evidence rather than treating the development-only tote `agent-preview` query
  as a live agent run.
- Do not count a run interrupted by hot reload or a changing development build.

## Evidence map

- Tote portability and coupled-rule run:
  [`evidence/STUDIO_TOTE_PORTABILITY.md`](./evidence/STUDIO_TOTE_PORTABILITY.md).
- Current guarded private flagship candidate:
  [`evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md`](./evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md).
- Current guarded immutable-image and zero-traffic browser proof:
  [`evidence/KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md`](./evidence/KORRHAUS_GUARDED_ZERO_TRAFFIC_RELEASE.md).
- Historical private five-tool browser run, predating the current host guards:
  [`evidence/KORRHAUS_LOCAL_FIVE_TOOL.md`](./evidence/KORRHAUS_LOCAL_FIVE_TOOL.md).
- Historical, superseded `codesign-prod1` zero-traffic candidate (never
  promote):
  [`evidence/KORRHAUS_ZERO_TRAFFIC_RELEASE.md`](./evidence/KORRHAUS_ZERO_TRAFFIC_RELEASE.md).
- Deterministic and browser test policy: [`TESTING.md`](./TESTING.md).
- Trust boundary: [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- Public/private exclusions:
  [`../PUBLIC_PRIVATE_BOUNDARY.md`](../PUBLIC_PRIVATE_BOUNDARY.md).

The dated `NORTH_FORM_FIVE_TOOL.md` and `ACTUAL_BROWSER_REVIEW_UI.md` files use a
retired local synthetic development harness. They remain historical engineering
evidence and must not be presented as a submitted or hosted KORRHAUS demo. Live
status must come from explicit flagship release evidence.

The current model-evaluation status and evidence format are in
[`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md). Direct scripted tool calls and
synthetic scorer fixtures must not be described as model-selection passes.
