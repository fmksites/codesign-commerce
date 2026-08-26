# KORRHAUS public reference

This is a public, synthetic reference configurator for the CoDesign Commerce challenge. It uses KORRHAUS-owned public branding and sock artwork to demonstrate a credible business context, but it contains no customer data, confidential prices, margins, suppliers, credentials, private APIs, or administrative logic.

It is not the production KORRHAUS Custom Sock Designer. The example deliberately implements only the surface needed to reproduce the proposal transaction against the public package.

## Run locally

From the repository root:

```bash
npm ci
npm run dev --workspace @codesign-commerce/korrhaus-reference
```

Open the URL printed by Vite in a browser that supports the current imperative WebMCP API. A normal page load shows no proposal review panel.

Ask the agent to handle this brief:

> Create 120 pairs across two colourways. Make the first navy with berry accents and the second dusty rose with berry accents. Keep standard grip and leave the logo for later.

The agent should read the one-colourway baseline, list only the relevant options, propose the first colourway, create the second through the same proposal, and validate the result. The visible reference should show two 60-pair tabs, cream/navy and dusty-rose/berry previews, standard grip, the missing final artwork decision, and `persisted: false`. The person must choose Revert or Keep proposal in the page. Neither action is exposed as a WebMCP tool.

For local visual QA in a browser without WebMCP support, append `?agent-preview=1` while the Vite development server is running. That development-only branch is removed from the production bundle and is not an agent or judge path.

## Build

```bash
npm run build --workspace @codesign-commerce/korrhaus-reference
```

The generated `dist/` directory is intentionally ignored. Rebuild it from source.
