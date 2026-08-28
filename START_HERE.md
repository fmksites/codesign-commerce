# Start here

Choose the path that matches why you opened this repository.

## Judge or reviewer: see the product first

1. Open the [live tote demo](https://codesign-webmcp.pages.dev/tote/?reset=true)
   in ChatGPT's in-app browser or Chrome with WebMCP enabled.
2. Attach the
   [North Form demo artwork](https://codesign-webmcp.pages.dev/tote/north-form-supplied-mark.png).
3. Copy the exact prompt from [docs/JUDGE_GUIDE.md](./docs/JUDGE_GUIDE.md#runnable-demo-studio-tote-portability-proof).
4. Confirm that two variants and two visual previews appear, validation says
   production-ready, and the result remains temporary.
5. Choose **Revert** to restore the baseline without saving.

The prompt intentionally never tells the agent to “use WebMCP” or call named
tools. After the page is open, tool selection must follow from the shopper's
ordinary design intent. WebMCP cannot advertise tools from a page the client
has not visited, so initial merchant discovery remains a separate browser,
search, catalog, or commerce-navigation step.

Then inspect the six tools in
[packages/codesign-webmcp/src/webmcp.ts](./packages/codesign-webmcp/src/webmcp.ts)
and the architecture in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Merchant or integrator: understand the reusable layer

Read [docs/INTEGRATION_QUICKSTART.md](./docs/INTEGRATION_QUICKSTART.md). CoDesign
keeps your existing customer interface, renderer, and production rules. You
supply a public-safe manifest and a narrow adapter to your existing functions.
It is not a universal renderer or a zero-code installation.

## Developer: reproduce everything locally

```bash
git clone https://github.com/fmksites/codesign-webmcp.git
cd codesign-webmcp
npm ci
npm run verify
npm run dev --workspace @codesign-webmcp/studio-tote
```

Requirements: Node.js 22.12 or newer and npm. The tote also works as a normal
human configurator when `document.modelContext` is unavailable.

## Evidence and project history

- Current browser claims: [docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md)
- Current verification map: [docs/evidence/README.md](./docs/evidence/README.md)
- Pre-challenge attribution: [docs/evidence/PRE_CHALLENGE_BASELINE.md](./docs/evidence/PRE_CHALLENGE_BASELINE.md)
- Historical planning and superseded evidence: [docs/archive/README.md](./docs/archive/README.md)

Historical files may mention the former CoDesign Commerce name, earlier
five-tool prototypes, old URLs, or old test counts. They are retained only as
timestamped development evidence and are not current product instructions.
