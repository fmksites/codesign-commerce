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
