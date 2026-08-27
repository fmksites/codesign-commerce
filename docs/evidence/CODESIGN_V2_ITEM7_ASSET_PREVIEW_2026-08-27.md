# CoDesign Commerce Item 7 — temporary asset sandbox and preview bridge

Date: 27 August 2026

Branch: `codex/codesign-commerce-v2`

Starting commit: `64f7d80b1ffacad6b380608b9be078901d7e6ae3`

## Result

Item 7 passed locally. The public core now provides a manifest-governed temporary asset sandbox, opaque revision-bound asset resolvers, merchant-owned staging/release hooks, and a static-first preview bridge that verifies one current artifact for every requested variant/surface. `ProposalEngine` integrates both resources and blocks Keep until the exact current preview is available.

The studio tote's transitional feasibility tools now route real artwork and proposal preview output through these generalized modules. The tote does not yet use the final Manifest 2.0 six-tool registry or unified `ProposalEngine`; those migrations remain checklist Items 8 and 9.

No private KORRHAUS file was inspected or modified. Nothing was deployed, published, promoted, or submitted.

## Asset boundary

The sandbox now enforces:

- Strict stage input with unknown-field rejection, manifest slot/source/media policy, bounded source characters, decoded bytes, filename, and alt text.
- PNG, JPEG, WebP, and conservative SVG magic/content checks before the merchant adapter runs.
- Opaque random handles and separate source/sanitized SHA-256 receipts without raw bytes or private adapter fields.
- One base-workspace binding, optional proposal/revision binding, deliberate revision advance, 30-minute default expiry, 20-asset session cap, and 5 MB session cap.
- Adapter-owned product sanitization and private-resource release on stage failure, Revert, stale proposal, Keep completion, expiry sweep, and page teardown.
- HTTPS-only remote sources with no credentials/referrer/cache, manual redirect rejection, literal local/private-network rejection, and a mandatory host-supplied DNS-aware/allowlist callback before fetch. Without that callback, remote staging fails closed.

The core's SVG inspection is intentionally only a prefilter. Merchant adapters remain responsible for complete SVG sanitization or rasterization and product-specific print preparation.

## Preview boundary

The preview bridge now:

- Accepts only exact proposal ID, proposal revision, committed base revision, known variants, and manifest preview surfaces.
- Requires the complete requested variant/surface matrix and rejects missing, extra, duplicate, malformed, or wrong-media candidates.
- Reconstructs adapter candidates and strips private extras.
- Bounds and verifies dimensions, alt text, decoded bytes, raster magic bytes, SHA-256 integrity, and transport.
- Supports verified inline data URLs and bounded same-origin URLs with opaque query fields and optional short expiry.
- Invalidates prior receipts before a replacement capture, so a failed recapture cannot leave an older image eligible for Keep.
- Invalidates all artifacts after a successful proposal refinement.

No same-origin preview endpoint was added. The renderer-generated inline WebP passed the actual OpenAI in-app-browser and native Chrome proof, so static transport remains sufficient.

## Proposal-engine integration

`ProposalEngine` now exposes resource operations for staging and capturing while preserving the page-owned persistence boundary:

- Asset staging before a first proposal verifies the committed base revision.
- Asset staging during a proposal requires the current proposal identity and revision.
- Validation, visible rendering, preview capture, and commit receive only an exact opaque `AssetResolver`.
- Successful operations bind/advance asset handles and clear prior preview receipts.
- Capture failure moves the same proposal to `preview-unavailable`; retry uses the same proposal revision and performs no save.
- Keep is rejected with `PREVIEW_REQUIRED` until exact current artifacts exist.
- Commit metadata records final proposal revision and public preview receipt IDs/integrity values.
- Revert, stale resynchronization, successful Keep, and teardown clean resources without adding a WebMCP save tool.

## Deterministic coverage

The asset, preview, and proposal-resource suites cover:

- Real decoded bytes, opaque receipt reconstruction, sanitized filename, and private-field stripping.
- Base/proposal/revision binding and deliberate revision advance.
- Expiry, Revert cleanup, successful Keep import, and teardown cleanup of an unbound staged asset.
- HTTP, credentials, localhost, private IPv4/IPv6, link-local, redirect, oversized, malformed bytes, unsupported media, obvious active SVG, and malformed adapter output.
- Required host network policy for HTTPS fetches and credential-free fetch options.
- Exact one- and two-variant preview matrices, stale revisions, duplicate/omitted artifacts, wrong media, bad bytes/integrity, oversized artifacts, URL expiry, cross-origin/private-query rejection, and adapter-output stripping.
- Prior-artifact invalidation before failed replacement capture.
- Asset-backed validation/render/capture/Keep, current-preview Keep gate, retry after capture failure, refinement invalidation, external change during capture, and zero-write Revert.

## Actual OpenAI in-app-browser proof

URL: `http://127.0.0.1:5174/?item7-generalized=true`

Source: the real public PNG `examples/studio-tote/public/north-form-supplied-mark.png`, 214,745 bytes.

Source SHA-256: `593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`.

The generalized `codesign_stage_asset` path returned opaque handle `asset-5791c401-dad0-4658-8e70-effdbd5e3d3e` with matching source/staged integrity and `persisted: false`. The proposal changed the visible tote to charcoal, placed the supplied NF mark upper-left, and captured 640 by 640 WebP artifact `preview-86f0781c-7d7e-4b10-9392-efc75332684d` for proposal revision 1. Artifact integrity was `sha256:19705b131f8770a68c7ce95619c06f4c3620a582ff8e96b072f36f6562e0ea7b`; the OpenAI host displayed the actual rendered image inline.

Before Revert, counters were one temporary stage, one preview render/capture, zero local writes, zero server writes, zero commits, and zero asset imports. After visible Revert, the original natural tote returned, the review controls closed, restore count became one, release count became one, and all write/commit/import counts remained zero.

This is the Codex in-app-browser host proof. The checklist's separate literal normal-ChatGPT-conversation verification remains explicitly deferred to Item 11; no broader ChatGPT compatibility claim is made here.

## Native Chrome proof

Browser: Google Chrome `151.0.7922.174`.

URL: `http://127.0.0.1:5174/?reset=true&native-asset-proof=1&item7-generalized=true`

The development-only page harness used `document.modelContext.getTools()` and `executeTool()`—not a direct call into the store—to run the same generalized stage/proposal/preview route. It loaded the real 214,745-byte public North Form PNG, then recorded:

- Temporary handle: `asset-3f257856-a99d-4594-8d19-5d6c73083fe2`.
- Asset/source integrity: `sha256:593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`.
- Proposal: `2663bf90-60cc-4887-9ab5-8a5d12f95847`, revision 1, `persisted: false`.
- Preview: `preview-5be96946-3143-4aed-b2fc-9f123c6f227d`, 640 by 640 WebP, 52,267 data-URL characters.
- Preview integrity: `sha256:19705b131f8770a68c7ce95619c06f4c3620a582ff8e96b072f36f6562e0ea7b`.

The live Chrome canvas visibly showed the white NF artwork on the upper-left of the charcoal tote. Before Revert, persistence counters were quiesce 1, preview 1, restore 0, local writes 0, server writes 0, commit 0; asset counters were stage 1, import 0, release 0. After page Revert, the original tote returned and counters were restore 1, local writes 0, server writes 0, commit 0, import 0, release 1.

The existing OS file-chooser path was already exercised during Item 3. Because this host was locked during the Item 7 repeat, the native development harness also exposes the same repository PNG as a public fixture button. That button exists only with the development query flag; the generalized asset sandbox itself is not fixture-specific.

## Ordinary-browser regression

The ordinary tote was reloaded without proof query flags in the OpenAI in-app browser. It retained its title and visual configurator, exposed 20 ordinary interactive controls, showed neither a proposal panel nor the native proof harness, and had no horizontal overflow at 1280 pixels. The newest console entries contained only the Vite connection; earlier logged development errors predated the rebuilt bundle and were not reproduced.

## Full local verification

- Full Vitest suite: 20 files / 183 tests passed.
- Strict workspace typecheck: passed.
- Production core, studio-tote, and judge-site builds: passed.
- Browser-bundle verification: passed.
- Public-boundary scan: passed for 154 candidates.
- Tote control parity: 16/16 inventory entries accounted for.
- Documentation link check: passed for 60 files.
- Judge-site hash check: passed.
- Eval corpus and scorer self-test: passed for 24 cases.
- `git diff --check`: passed.

Release-candidate artifact hashes before the Item 7 commit:

- Core browser bundle: `sha256:3736b1c110445bb64646d599f61422172eb687691df8eb0623dbb8d3adc0f13b`.
- Current tote JavaScript bundle: `sha256:1fea3531902853b2dc90e06acef3bc3008f8c69fc4a433a9e4a7d1823ce94901`.
- North Form supplied PNG: `sha256:593cf3b82185b91ee8a1e5dbfa9169b4e4b66713fe0c3828e2378751a856a3c5`.

## Defects found and fixed during Item 7

1. The first tote adapter conversion tried to spread all 214,745 decoded bytes into one `String.fromCharCode` call and failed on the real image. It now converts in bounded chunks.
2. A replacement preview capture could initially have left an older receipt available if the new renderer call failed. Capture now removes prior proposal receipts before invoking the adapter, and a deterministic regression test locks that rule.
3. HTTPS syntax/private-literal checks did not address DNS rebinding. HTTPS staging now requires a host-supplied network policy before fetch and sanitizes callback failure.
4. Teardown coverage initially exercised only active proposals. A new test proves an unbound staged asset is released when the page session ends without ever opening or saving a proposal.
