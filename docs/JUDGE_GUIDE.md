# Judge guide

This guide reproduces CoDesign Commerce from public source without credentials.
The current evidence is local; public hosting and the live KORRHAUS flagship
remain separately approval-gated and must not be inferred from these steps.

## What to notice

CoDesign Commerce does not replace a product configurator. It adds a narrow
manifest and adapter boundary so an agent can understand an existing complex
configuration, coordinate interdependent changes, update the same preview a
person sees, and report production readiness. The proposal remains temporary.
Only the visible human Keep control can persist it; Revert restores the exact
baseline. Neither control exists as a WebMCP tool.

The KORRHAUS reference demonstrates the real-business product domain. The
studio tote is a materially different fictional configurator using the same
unchanged core and review UI. It is evidence of adapter portability, not a
claim that CoDesign Commerce supplies a universal renderer.

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

Open `http://127.0.0.1:4173/`. This is the exact provider-neutral production
artifact: the anonymous English judge landing links to deterministic KORRHAUS
and tote reset paths under the same origin. It contains no credentials, private
APIs, analytics, or customer data.

For source-development work, the examples can still run in separate terminals:

```bash
npm run dev --workspace @codesign-commerce/korrhaus-reference
npm run dev --workspace @codesign-commerce/studio-tote
```

Open the URL printed by each Vite process and append `?reset=true`. The
KORRHAUS reference always starts from its public in-memory fixture. The tote
reset URL clears only that fictional demo's local browser fixture. Neither
reset requires authentication or touches merchant systems.

## Demo 1 — KORRHAUS public reference

Use this exact prompt:

> We need 120 pairs for North Form, split evenly across two colourways. Use cream with navy accents for the first and dusty rose with berry accents for the second. Use the standard grip. Show NORTH FORM as a placeholder, but we will add the real logo later.

The intended tool sequence is:

1. `codesign_read_configuration` reads the committed one-design, 120-pair baseline and its revision.
2. `codesign_list_options` requests only the option groups needed for the brief.
3. `codesign_propose_configuration` stages the first colourway against that exact revision.
4. `codesign_create_design` extends the same proposal by cloning the first design, splitting quantity 60/60, and applying the second colourway.
5. `codesign_validate_configuration` validates the temporary proposal.

Expected visible and structured result:

- `North Form Cream`: 60 pairs, cream body, navy accent, standard grip.
- `North Form Rose`: 60 pairs, dusty-rose body, berry accent, standard grip.
- Total: 120 pairs.
- Configuration valid: yes.
- Production ready: no, because final logo artwork is still required.
- Persisted: false.
- The review panel appears only after the proposal succeeds.
- The normal configurator is locked while the temporary proposal awaits Keep or Revert.

Choose Revert for the safest repeatable walkthrough. The second design must
disappear and the original one-design 120-pair revision must return without a
local write, server write, order, quote, upload, or other commercial action.

## Demo 2 — studio tote portability proof

Open a fresh `?reset=true` tote URL and use this exact prompt:

> Create 100 studio totes split evenly across two variants. Make the first natural 12 oz canvas with long handles and a centered one-colour print. Make the second charcoal with short handles and an upper-left print. Leave final artwork for later.

The intended tool sequence is the same five calls. The option values,
dependencies, renderer, persisted human fixture, and validation belong to the
tote adapter rather than the CoDesign core.

Expected result:

- `Natural long-handle`: 50 totes, natural 12 oz canvas, long handles, centered one-colour print.
- `Charcoal short-handle`: 50 totes, charcoal canvas, short handles, upper-left print.
- Total: 100 totes.
- Configuration valid: yes.
- Production ready: no, because final print artwork is still required.
- Persisted: false until a person chooses Keep.

For a coupled-rule check, reset and ask for a two-colour screen print at 25
totes. The adapter must reject the batch because two-colour screen print
requires at least 50 totes per variant. No partial preview or saved state may
remain.

## Human-confirmation and safety checks

Ask each of the following after a reset:

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

- Refresh with `?reset=true` before every scored run.
- If the page revision changes after a read, reread; never force a stale proposal.
- If a proposal is already pending, use its matching proposal ID and revision to extend it or ask the person to Keep/Revert first.
- If the environment does not expose WebMCP, inspect the source and test evidence rather than treating the development-only `agent-preview` query as a live agent run.
- Do not count a run interrupted by hot reload or a changing development build.

## Evidence map

- Public five-tool browser run: [`evidence/NORTH_FORM_FIVE_TOOL.md`](./evidence/NORTH_FORM_FIVE_TOOL.md).
- Tote portability and coupled-rule run: [`evidence/STUDIO_TOTE_PORTABILITY.md`](./evidence/STUDIO_TOTE_PORTABILITY.md).
- Local private flagship bridge: [`evidence/KORRHAUS_LOCAL_FIVE_TOOL.md`](./evidence/KORRHAUS_LOCAL_FIVE_TOOL.md).
- Deterministic and browser test policy: [`TESTING.md`](./TESTING.md).
- Trust boundary: [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- Public/private exclusions: [`../PUBLIC_PRIVATE_BOUNDARY.md`](../PUBLIC_PRIVATE_BOUNDARY.md).

The private flagship evidence is local and disabled by default. It is not a
public deployment claim.

The current model-evaluation status and evidence format are in
[`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md). Direct scripted tool calls and
synthetic scorer fixtures must not be described as model-selection passes.
