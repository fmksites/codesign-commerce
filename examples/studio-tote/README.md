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
baseline, or `?reset=true&agent-preview=true` for a local visual-QA proposal
that creates two 50-tote variants. The review remains temporary until a person
chooses Keep or Revert.

The example contains no prices, checkout, ordering, upload, customer data,
confidential merchant data, or production actions. It is a portability proof,
not a universal renderer or claimed live merchant deployment.

Use this exact judge brief:

> Create 100 studio totes split evenly across two variants. Make the first natural 12 oz canvas with long handles and a centered one-colour print. Make the second charcoal with short handles and an upper-left print. Leave final artwork for later.

The tote registers the exact six reusable WebMCP tools documented in
[`docs/WEBMCP_TOOLS.md`](../../docs/WEBMCP_TOOLS.md). Agent changes are applied
as coherent temporary passes, actual supplied artwork can be staged and shown
in the tote renderer, and revision-bound WebP previews can be returned to the
conversation. There is no WebMCP save tool; only the visible page Keep control
can persist a reviewed proposal.

The complete live-flagship and tote walkthrough, expected tool sequence, safety
checks, and recovery instructions are in
[`docs/JUDGE_GUIDE.md`](../../docs/JUDGE_GUIDE.md).
