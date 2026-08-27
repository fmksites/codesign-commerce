# CoDesign Commerce 2.0 — Item 3 Asset And Keep Feasibility Evidence

**Date:** 27 August 2026

**Checklist item:** 3 — real artwork transport and chat-confirmed page Keep

**State:** OpenAI Codex in-app-browser Keep, browser-close recovery and native Chrome Revert passed. The literal normal-ChatGPT-conversation repetition remains explicitly deferred to Item 11 and no ChatGPT compatibility claim is made by this evidence.

## Tested implementation

- Branch: `codex/codesign-commerce-v2`
- Starting commit for Item 3: `a9fed9f`
- Local tote proof origin: `http://127.0.0.1:5174`
- Chrome: `151.0.7922.174`
- Chrome local testing flag: `enable-webmcp-testing@1`
- Core browser bundle SHA-256: `4fe305b4a7b14eee444b88a0ca531169022cd6ffc85b36a23a5b7758f3c58239`
- Tote production JavaScript SHA-256: `95dbf2bfd2420893329cb67c29ae4f81c231d10816920196bef4f231a8e22a93`
- Persistence boundary: visible page `Keep proposal` controller; no WebMCP save tool
- Asset source kind: bounded `data:image/png;base64,...`
- Source fixture: `examples/studio-tote/public/north-form-supplied-mark.png`
- Source size: 214,745 bytes
- Source media type: `image/png`
- Source integrity: `sha256:593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`
- Preview media type and size: 640 × 640 `image/webp`
- Preview integrity: `sha256:d2366c94f0f2173361684fd853cfc11bf60640dfe581cd31bcac49e20374365b`
- Preview transport length: 52,267 data-URL characters

The North Form PNG is a public fictional test asset. It was generated for the challenge, stored as a normal file and supplied to the running page at test time. Chrome selected it through a real file input; the in-app browser passed the same file bytes into the page-defined asset tool. The proposal code receives only the opaque handle returned by staging, so the visual result is not a hard-coded logo branch.

## Bounded asset contract

The feasibility slice registers `codesign_stage_asset` alongside the existing proof-stage tools. It accepts one declared `print-artwork` slot and data-URL sources for PNG, JPEG or WebP only.

The implementation:

- caps the encoded source at 400,000 characters;
- caps decoded bytes at 250,000;
- checks the declared MIME type against raster magic bytes;
- sanitizes the optional filename;
- hashes the decoded bytes;
- returns only an unguessable temporary handle and sanitized metadata;
- never returns the raw data URL through read, validation or proposal output;
- resolves raw bytes only inside the tote adapter/renderer;
- releases temporary bytes on Revert or page teardown;
- converts a staged handle to a deterministic saved handle only inside confirmed Keep.

The saved reference for the tested PNG is `saved-593cf3b82185b91ee8a1e5db`. This is an opaque demonstration handle derived from the public fixture integrity, not a private storage path.

## OpenAI Codex in-app-browser Keep — passed

The corrected final run opened `http://127.0.0.1:5174/?reset=true&iab-asset-evidence=persisted-fix` and discovered the page-defined tools through the browser's WebMCP capability.

The host then:

1. Read committed `tote-revision-1`.
2. Staged the real PNG as temporary handle `asset-220110df-5d5a-4685-b46e-ddd4eb47b7aa`.
3. Created temporary proposal `fb96a201-3f67-430c-8e31-261583e33364`, revision 1.
4. Renamed the variant `North Form supplied artwork`, changed the tote to charcoal, moved artwork upper-left and attached only the opaque handle.
5. Received `configurationValid: true`, `productionReady: true` and `persisted: false`.
6. Displayed the returned 640 × 640 WebP preview inline in the Codex conversation.
7. Waited for Felix's explicit instruction to Keep.
8. Activated the visible `Keep proposal` page button rather than invoking a save tool.

After Keep:

- committed revision became `tote-revision-2`;
- pending proposal became `null`;
- `localWrites: 1`;
- `serverWrites: 1`;
- `commitCalls: 1`;
- `stageCalls: 1`;
- `importCalls: 1`;
- `releasedAssets: 0`;
- the temporary handle became `saved-593cf3b82185b91ee8a1e5db`;
- the `print-artwork` asset status became `ready`;
- no second Keep button remained, so duplicate page activation was unavailable;
- deterministic duplicate-controller activation separately returned `NO_PROPOSAL` and kept all write/import counters at one.

The committed preview was reread as artifact `preview-committed-tote-revision-2-tote-1` with the same `sha256:d2366...365b` integrity and 52,267-character transport.

## Saved artwork reopen defect — found and fixed

The first browser-close run revealed that the saved state referenced the imported asset but the asset bytes were only in memory. Reopening could therefore retain the charcoal/name state while losing the NF mark.

The proof store now exports only approved committed assets to the merchant-owned saved payload, and the tote writes one versioned local-storage envelope containing both the committed canonical state and those approved assets. The loader accepts the older state-only fixture for migration but validates saved handles, declared media types, byte counts, data-URL structure and magic bytes before restoring artwork.

After the correction, reopening without reset returned:

- committed revision `tote-revision-2`;
- `North Form supplied artwork`;
- charcoal canvas and upper-left placement;
- saved handle `saved-593cf3b82185b91ee8a1e5db`;
- visible image alt text `White NF monogram supplied by North Form`;
- production note `Supplied artwork staged for this design.`;
- the identical committed preview artifact/integrity;
- no browser errors beyond Vite connection debug messages.

## Browser-close before Keep — passed

On the corrected build, a second real PNG handle was staged and proposal `e4683ba8-c0b5-4f35-a6c4-9713b3c9cbd2`, revision 1, temporarily changed the saved tote to a natural `Unsaved browser-close proof`.

Immediately before closing:

- `localWrites: 0`;
- `serverWrites: 0`;
- `commitCalls: 0`;
- proposal `persisted: false`.

The browser page was closed without Keep. Reopening returned no pending proposal and restored the prior committed `tote-revision-2` North Form design with its approved artwork visible. The unsaved name/color never reached committed state.

## Native Chrome real-file Revert — passed

The corrected final Chrome run used:

`http://127.0.0.1:5174/?reset=true&native-asset-proof=1&chrome-asset-evidence=corrected-final`

The development-only proof panel selected the real PNG through Chrome's file chooser and then invoked `document.modelContext.getTools()` and `document.modelContext.executeTool()` from the page. It did not substitute DOM manipulation for native WebMCP tool execution.

Chrome returned:

- selected file `north-form-supplied-mark.png`, 214,745 bytes, `image/png`;
- temporary handle `asset-21577599-644e-4ed3-bd86-bb617560f84b`;
- proposal `d2321485-f07c-4bbc-b862-ed05163c1c8f`, revision 1, `persisted: false`;
- preview artifact `preview-d2321485-f07c-4bbc-b862-ed05163c1c8f-1-tote-1`;
- the exact source and preview integrity values recorded above;
- one quiesce and one preview with zero writes/commits/imports before review.

The visible page showed the NF mark on a charcoal tote, `Temporary proposal not saved`, locked ordinary controls, and visible Revert/Keep controls. Activating visible Revert produced:

- `restoreCalls: 1`;
- `localWrites: 0`;
- `serverWrites: 0`;
- `commitCalls: 0`;
- `importCalls: 0`;
- `releasedAssets: 1`;
- the original natural `Canvas tote` preview;
- no remaining Keep button;
- no page errors; only Vite debug connection logs.

## Deterministic coverage

Focused asset tests verify:

- successful bounded raster staging and sanitized receipt;
- raw data absence from tool results;
- rejection of unsupported SVG, malformed/additional input and mismatched bytes;
- exact asset import only during Keep;
- deterministic saved-handle replacement;
- approved artwork restoration after page reopen;
- temporary release on Revert;
- WebMCP progressive registration;
- zero-write temporary rendering;
- page-controller Keep saves/imports once;
- duplicate Keep remains idempotent;
- committed validation reports production-ready state.

Final local verification passed:

- Vitest: 11 files, 106 tests;
- workspace strict typecheck;
- production core/tote/judge build;
- browser-bundle hash verification;
- public-boundary scan: 128 candidates;
- documentation-link check: 53 files;
- judge-site verification;
- 24-case eval-corpus validation and scorer self-test;
- `git diff --check`.

## Normal ChatGPT release check — explicitly deferred

This evidence proves the actual OpenAI Codex in-app browser and native Chrome paths. It is not represented as a normal ChatGPT conversation.

Before any final ChatGPT compatibility claim, Item 11 must repeat the exact release build in ChatGPT's built-in browser and prove:

1. A real supplied image reaches `codesign_stage_asset` from the supported conversation/attachment path.
2. The exact proposal preview displays inline.
3. The customer sees the named proposal and explicitly confirms Keep.
4. The agent activates the visible page Keep controller.
5. One commit/import occurs and the saved revision/preview is reread.
6. A separate Revert path performs zero writes.

The participant explicitly approved this validation-timing deferral on 27 August 2026. Failure at Item 11 blocks the ChatGPT claim and requires an honest architecture/product decision; it does not become a text-only fallback.
