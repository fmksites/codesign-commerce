# Studio tote portability example

This fictional public configurator proves that the same CoDesign WebMCP core
and review UI can adapt a made-to-order canvas tote with different options,
assets, renderer behavior, and coupled production rules.

From the repository root:

```sh
npm ci
npm run dev --workspace @codesign-webmcp/studio-tote
```

Open the printed local URL. Add `?reset=true` for the documented anonymous
baseline. The normal page supports every shipped customer choice: materials,
variant names and quantities, studio-name typography, supplied artwork, print
method and placement, ink colour, scale, rotation, and up to three variants.

For implementation-only visual QA, `?reset=true&agent-preview=true` creates a
three-pass temporary proposal with two 50-tote variants and the repository's
real North Form artwork. That query is not the WebMCP judge path. In either
case, the review remains temporary until a person chooses Keep or Revert.

The example contains no prices, checkout, ordering, customer data,
confidential merchant data, or production actions. Supplied artwork can be
staged temporarily for a proposal, but is not uploaded or persisted by a
WebMCP tool. This is a portability proof, not a universal renderer or claimed
live merchant deployment.

For the primary reproducible agent run, open a fresh `?reset=true` page and use
ordinary shopper language—no protocol or tool names and no supplied artwork:

> I need 100 premium branded studio totes for North Form. Give me a natural customer version and a darker staff version, show me both options, check whether they are ready to make, and do not save anything yet.

Studio-name typography is the production-safe fallback, so the agent does not
need a file. The manifest's declared “darker staff” direction intentionally
starts Charcoal at 95% in the upper-left position while Natural stays centered.
That first Charcoal result is visible and configuration-valid, but the
merchant's safe-area rule marks it production-not-ready.

The page highlights the affected region and exposes an accessible explanation
plus a bounded repair. The agent may apply only the returned merchant-approved
78% scale batch through the existing proposal tool. That repair advances the
revision, invalidates the old preview, rerenders Charcoal without changing
Natural, and requires fresh previews plus readiness validation. The entire
problem/repair/proof loop follows from the single ordinary brief, and every
agent step remains `persisted: false`.

For the optional supplied-artwork proof, attach
[`public/north-form-supplied-mark.png`](./public/north-form-supplied-mark.png)
to the conversation and ask the agent to replace the studio-name treatment on
one or both temporary variants. The PNG is staged behind a session-only opaque
handle, rendered by the same tote canvas, and released on Revert.

The tote registers the exact six reusable WebMCP tools documented in
[`docs/WEBMCP_TOOLS.md`](../../docs/WEBMCP_TOOLS.md). Agent changes are applied
to the existing renderer while the activity rail reports only truthful tool
events: inspection, capability reading, temporary artwork preparation,
temporary proposal updates, preview capture, and readiness checks. Its
collapsed disclosure is generated from the actual registration: four inspect,
two temporary-design, and zero save/order/payment capabilities. There is no
WebMCP save tool; only the visible page Keep control can persist a reviewed
proposal.

After a confirmed Keep—and never after Revert, stale state, failed save, or an
uncertain outcome—the page can show Configuration Passport v0.1. It binds the
committed revision to public-safe configuration and exact preview receipts,
while stripping artwork/asset and private data. The Passport is an unsigned
integrity receipt, not a signature. Keep and reload verification recompute
readiness from the exact current committed tote and fail closed if it differs
from the receipt. The public edit URL contains no query or fragment data. Its
Shopify mapper accepts only that runtime-verified, production-ready result,
returns reference metadata only, and performs no cart write.

The complete live-flagship and tote walkthrough, expected tool sequence, safety
checks, and recovery instructions are in
[`docs/JUDGE_GUIDE.md`](../../docs/JUDGE_GUIDE.md).
