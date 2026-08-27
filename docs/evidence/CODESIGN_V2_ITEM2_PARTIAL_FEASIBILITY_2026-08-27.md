# CoDesign Commerce 2.0 — Item 2 Partial Feasibility Evidence

**Date:** 27 August 2026

**Checklist item:** 2 — inline ChatGPT previews and native Chrome WebMCP

**State:** Native Chrome and OpenAI Codex in-app-browser feasibility passed. On 27 August 2026 the participant explicitly approved deferring the literal normal-ChatGPT-conversation check to Item 11 release verification.

## Tested implementation

- Branch: `codex/codesign-commerce-v2`
- Baseline commit: `7ede06a1f12541512e2892c338f4cbca4180175c`
- Core module build SHA-256: `0efdf5be84bddbb9f03e412c07a487f182dce524a3982fd42089fab801327493`
- Tote production JavaScript SHA-256: `2e9d0fb3a6c0bb15a095f5e264426d1b4c4548b9ab64d97608f21c86ac3cf828`
- Local proof URL: `http://127.0.0.1:5173/?reset=true&native-webmcp-proof=1&evidence=final`
- Chrome: `151.0.7922.174`
- Chrome local-state flag: `enable-webmcp-testing@1`

## Native Chrome result — passed

The development-only proof panel invoked the official `document.modelContext.getTools()` and `document.modelContext.executeTool()` APIs in the page itself. It did not use DOM automation as a substitute for WebMCP execution.

Chrome discovered these six registered proof-stage tools:

1. `codesign_create_design`
2. `codesign_get_previews`
3. `codesign_list_options`
4. `codesign_propose_configuration`
5. `codesign_read_configuration`
6. `codesign_validate_configuration`

The clean evidence run:

- read revision-bound public configuration;
- proposed the temporary name `Chrome native proof`, charcoal canvas and upper-left print;
- returned `persisted: false` at proposal revision 1;
- visibly changed the real tote renderer;
- returned a visible 640 × 640 `image/webp` preview;
- returned a 53,999-character bounded data URL;
- returned integrity `sha256:7729b9102b697f3804295edb1fe12e42496bab6f7b0a30efcb2437bae493221b`;
- produced zero local writes, zero server writes and zero commit calls;
- produced no console errors on the clean run.

While the proposal was open, ordinary controls were disabled and the page visibly showed `TEMPORARY · NOT SAVED`, Keep and Revert. Activating Revert restored `Canvas tote`, natural canvas and the original preview with one restore call and still zero persistence writes. An ordinary human charcoal selection worked after Revert.

## OpenAI Codex in-app-browser result — passed

The fixed build was independently exercised through the OpenAI Codex in-app browser's page-defined WebMCP capability at `http://127.0.0.1:5173/?reset=true&iab-evidence=final`.

The host discovered the same six tools and then:

- read committed revision `tote-revision-1`;
- created temporary proposal `d7a8a016-92c5-453f-8108-638ec72f40df`, revision 1;
- renamed the tote `OpenAI inline proof`, changed it to charcoal and moved the print upper-left;
- returned `persisted: false` and explicit Keep/Revert confirmation metadata;
- returned artifact `preview-d7a8a016-92c5-453f-8108-638ec72f40df-1-tote-1` bound to that exact proposal and revision;
- displayed the returned 640 × 640 WebP image inline in the Codex conversation rather than showing only text or a link;
- locked ordinary controls while the proposal was open;
- restored the natural `Canvas tote` through visible page Revert;
- recorded one quiesce, one preview and one restore with zero local writes, zero server writes and zero commit calls;
- allowed an ordinary human charcoal selection after Revert;
- produced no browser errors.

The in-app artifact integrity and bounded transport exactly matched the native Chrome result: `sha256:7729b9102b697f3804295edb1fe12e42496bab6f7b0a30efcb2437bae493221b`, 53,999 data-URL characters.

## Ordinary Chrome without WebMCP registration — passed

The same Chrome build loaded `http://127.0.0.1:5173/?reset=true&disable-webmcp=1&human-evidence=final`, a development-only feature-detection lane that supplies no `modelContext` host to either registration function. The page reported registration `unsupported`, rendered no agent-proposal panel, allowed the ordinary charcoal control, updated the live tote image and produced no browser errors. Unit coverage separately verifies that both registration functions return the unsupported progressive-enhancement path when `modelContext` is absent.

## Compatibility defect found and fixed

The first native execution exposed that Chrome calls `execute(input)` without a second options object. The proof prototype had accessed `options.signal` unconditionally, causing native execution to fail. The WebMCP tool contract now makes options optional and proposal/create handlers use `options?.signal`. A regression test calls the proposal tool with no options object.

## Local verification

- Focused WebMCP/preview tests: 2 files, 26 tests passed.
- Full Vitest suite: 9 files, 98 tests passed.
- Workspace typecheck: passed.
- Production build: passed.
- Public-boundary scan: passed for 121 candidates.
- `git diff --check`: passed before the final evidence run.

## Actual ChatGPT release verification — explicitly deferred

The Codex in-app browser can discover the same six tools, execute the temporary proposal and display the returned image inline, but that is not being represented as an actual ChatGPT conversation. The only installed OpenAI desktop application available to this task is the currently running Codex application, which desktop automation is prohibited from controlling recursively.

The following remains mandatory before the release is represented as ChatGPT-compatible, but no longer blocks the pre-refactor feasibility sequence:

1. Open `http://127.0.0.1:5173/?reset=true` in ChatGPT's built-in browser.
2. Ask ChatGPT to read the tote, temporarily rename it `ChatGPT preview proof`, change it to charcoal and move the print upper-left.
3. Ask it to call `codesign_get_previews` for the exact proposal revision and display the returned image inline in the conversation.
4. Do not activate Keep. Confirm the page says temporary/not saved and use Revert.
5. Capture the chat image, proposal/revision correlation and the restored page.

The Item 2 commit may proceed once the remaining ordinary unflagged-browser verification passes. The release may not make an actual ChatGPT compatibility claim until the Item 11 check above passes.
