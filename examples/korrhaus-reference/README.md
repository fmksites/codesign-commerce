# KORRHAUS public reference

This is a public, synthetic reference configurator for the CoDesign Commerce challenge. It uses KORRHAUS-owned public branding and sock artwork to demonstrate a credible business context, but it contains no customer data, confidential prices, margins, suppliers, credentials, private APIs, or administrative logic.

It is not the production KORRHAUS Custom Sock Designer. The example deliberately implements only the surface needed to reproduce the proposal transaction against the public package.

## Run locally

From the repository root:

```bash
npm ci
npm run dev --workspace @codesign-commerce/korrhaus-reference
```

Open the URL printed by Vite in a browser that supports the current imperative WebMCP API. Append `?reset=true` for the canonical anonymous baseline. This reference keeps no saved state between page loads, so the reset URL and a normal fresh load both start with one 120-pair cream/navy design. No proposal review panel is visible.

Ask the agent to handle this brief:

> We need 120 pairs for North Form, split evenly across two colourways. Use cream with navy accents for the first and dusty rose with berry accents for the second. Use the standard grip. Show NORTH FORM as a placeholder, but we will add the real logo later.

The agent should read the one-colourway baseline, list only the relevant options, propose the first colourway, create the second through the same proposal, and validate the result. The visible reference should show two 60-pair tabs, cream/navy and dusty-rose/berry previews, standard grip, the missing final artwork decision, and `persisted: false`. The person must choose Revert or Keep proposal in the page. Neither action is exposed as a WebMCP tool.

For local visual QA in a browser without WebMCP support, append `?reset=true&agent-preview=true` while the Vite development server is running. That development-only branch is removed from the production bundle and is not an agent or judge path.

The complete two-example walkthrough, expected tool sequence, safety checks, and recovery instructions are in [`docs/JUDGE_GUIDE.md`](../../docs/JUDGE_GUIDE.md).

## Build

```bash
npm run build --workspace @codesign-commerce/korrhaus-reference
```

The generated `dist/` directory is intentionally ignored. Rebuild it from source.
