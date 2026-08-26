# Proposed Public And Private Boundary

This boundary is a proposal and requires approval before implementation.

## Public Challenge Repository

Proposed contents:

```text
packages/
  configurator-core/
  shopify-adapter/
examples/
  grip-sock-designer/
  second-merch-example/
docs/
  challenge-brief.md
  pre-existing-baseline.md
  architecture.md
tests/
LICENSE
README.md
```

The public project should include:

- Generic WebMCP registration and tool schemas.
- State-adapter interfaces.
- Proposal, confirmation and rollback behavior.
- Validation hooks.
- A reproducible KORRHAUS-branded demo using public-safe fixtures.
- A small second manifest only if it materially proves reuse.
- Deterministic tests and agent evaluation prompts.
- Setup, deployment and judging instructions.

## Private Production Repository

Keep private:

- Customer and project records.
- Wholesale prices, margins and exact commercial logic.
- Supplier and production data.
- Authentication and administrative routes.
- Shopify credentials and deployment secrets.
- Quote, order and payment functionality.

## Integration Model

The public package defines the reusable contract. The private KORRHAUS application implements a narrow adapter against its existing designer state and rendering functions.

The same public package must power the judged demonstration and the production integration. Do not create a disconnected toy implementation solely for the video.

## Scope Warning

Do not claim to render every form of merchandise. The reusable layer should connect WebMCP to an existing configurator. Each merchant remains responsible for its own visual renderer, product rules and backend.
