# CoDesign WebMCP rebrand verification — 28 August 2026

## Approved naming structure

- Technology: **CoDesign WebMCP**
- Descriptor: **WebMCP for Custom Products on Shopify**
- Commercial promise: **Make your Shopify product configurator agent-ready.**
- Service: **Agent-Ready Configurator Pilot**
- Target repository: `codesign-webmcp`

## Implemented locally

- Renamed the public workspace package to `@codesign-webmcp/core` under
  `packages/codesign-webmcp/`.
- Renamed the browser global to `CoDesignWebMCP` and the published browser
  artifact to `codesign-webmcp.js`.
- Updated the judge landing, tote reference, repository documentation,
  integration guides, CI/release metadata, and Devpost drafts.
- Preserved all six public `codesign_*` WebMCP tool names so existing agent
  semantics and tool-selection behavior do not change.
- Preserved dated pre-rebrand evidence and deployment URLs as historical facts.

## Verification

- `npm test`: 21 files and 184 tests passed.
- `npm run typecheck`: public core, tote example, and core tests passed.
- `npm run build`: module, `CoDesignWebMCP` browser bundle, tote application,
  and static judge artifact passed.
- Browser bundle, judge-site, public-boundary, documentation-link, and
  evaluation-structure checks passed.
- Local in-app-browser desktop and 390 px mobile inspection passed with no
  horizontal overflow or browser errors.
- The tote exposed exactly the existing six tools after the rename and
  `codesign_read_workspace` returned `ok: true`.

## Deliberate exclusions

- No private KORRHAUS source, Cloud Run revision, production traffic, or
  Shopify behavior changed.
- The private KORRHAUS integration still consumes its previously verified
  pre-rebrand browser artifact. Migrating that artifact is a separate private
  adapter and regression gate.
- GitHub repository rename, public push, and hosting deployment remain external
  release actions and are not implied by this local verification.
