# Studio tote portability example

This fictional public configurator proves that the same CoDesign Commerce core
and review UI can adapt a made-to-order canvas tote with different options,
assets, renderer behavior, and coupled production rules.

From the repository root:

```sh
npm ci
npm run dev --workspace @codesign-commerce/studio-tote
```

Open the printed local URL. Add `?reset=true` for the documented anonymous
baseline. The normal page supports every shipped customer choice: materials,
variant names and quantities, studio-name typography, supplied artwork, print
method and placement, ink colour, scale, rotation, and up to three variants.

For implementation-only visual QA, `?reset=true&agent-preview=true` creates a
three-pass temporary proposal with two 50-tote variants and the repository's
real North Form artwork. That query is not the WebMCP judge path. In either
case, the review remains temporary until a person chooses Keep or Revert.

The example contains no prices, checkout, ordering, upload, customer data,
confidential merchant data, or production actions. It is a portability proof,
not a universal renderer or claimed live merchant deployment.

For a reproducible agent run, attach
[`public/north-form-supplied-mark.png`](./public/north-form-supplied-mark.png)
to the conversation, open a fresh `?reset=true` page, and use this judge brief:

> Create 100 studio totes for North Form, split evenly across two variants, and use the supplied artwork. Name the first North Form Natural: natural 12 oz canvas, long handles, centered one-colour ink artwork at 105% scale. Name the second North Form Charcoal: charcoal 12 oz canvas, short handles, upper-left one-colour artwork at 82% scale and -6 degrees rotation. Show me both previews and check production readiness. Do not save either design.

The tote registers the exact six reusable WebMCP tools documented in
[`docs/WEBMCP_TOOLS.md`](../../docs/WEBMCP_TOOLS.md). Agent changes are applied
as visible Foundation, Branding, and Variants passes. The supplied PNG is
staged into a temporary opaque handle, rendered in the same tote canvas, and
returned as one revision-bound WebP preview per variant. There is no WebMCP
save tool; only the visible page Keep control can persist a reviewed proposal.

The complete live-flagship and tote walkthrough, expected tool sequence, safety
checks, and recovery instructions are in
[`docs/JUDGE_GUIDE.md`](../../docs/JUDGE_GUIDE.md).
