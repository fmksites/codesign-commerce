# Working Rules

## Approval Gate

The initial phase is research, concept refinement and architecture only. Do not implement, deploy, publish, create a public repository, or modify the production KORRHAUS project until the user explicitly approves the final concept and architecture.

## Project Boundaries

- Treat this directory as the future public challenge repository.
- Treat `/Users/felixkramer/Desktop/KORRHAUS Shopify Developer` as the private production repository.
- The production repository may be inspected read-only during planning.
- Do not copy secrets, credentials, customer records, wholesale prices, margins, supplier data or private administrative logic into this project.
- Later production integration should consume the public package through a narrow adapter.

## Product Standard

- Solve a real configurable-commerce problem rather than demonstrating WebMCP for its own sake.
- Preserve a normal human UI for browsers without WebMCP.
- Let agents propose visible configuration changes, but require human confirmation before persistence or commercial actions.
- Do not let WebMCP tools submit applications, accept quotes, order products, charge customers or expose confidential information.
- Verify the actual deployed user experience, not only source code or automated tests.

## Challenge Evidence

- Clearly distinguish the pre-existing KORRHAUS Sock Designer from work created after 25 August 2026.
- Keep a clean, timestamped Git history once implementation begins.
- The public repository must contain the real WebMCP implementation, a visible open-source license, runnable instructions, tests and a reproducible demonstration.
