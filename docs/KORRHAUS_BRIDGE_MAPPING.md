# KORRHAUS bridge mapping

This document maps the private flagship integration without copying private state, commerce rules, credentials, or administrative behavior into the public package.

## Pre-migration local spike

Read-only inspection on 26 August 2026 found a feature-flagged, post-start safety spike already present in the private designer. It registered one direct tool for a temporary main-yarn, accent-yarn, and pattern proposal. It is useful baseline evidence, but it was not the reusable CoDesign Commerce integration.

The spike already demonstrates several sound private-side techniques:

- It waits for pending normal saves and confirms a committed baseline.
- It holds a cloned proposal outside canonical persisted state.
- The renderer reads the proposal clone while it is active.
- Rendering accepts a skip-persistence mode.
- Build controls are locked while Keep/Revert remain available.
- Revert drops the clone and rerenders with zero writes.
- Keep verifies a baseline fingerprint and then enters the normal save path once.
- Playwright tests instrument project requests, artwork requests, and local storage.

It remains insufficient for the entry because it has one KORRHAUS-specific tool, one design, three fields, no reusable manifest/adapter, no revision/operation envelope, no structured validation, and no second-colourway path.

The private application directory has no useful committed Git history: its relevant files are currently untracked. The following local hashes preserve the inspected pre-migration spike state but are not a substitute for immutable deployment or public Git evidence:

| File role | Modified | SHA-256 |
|---|---|---|
| Designer source | 2026-08-26 16:52:55 CEST | `0f6aeedabc8a994c345c5b29f0137758fd075747ffb181056d81892cb03ebc0b` |
| Designer stylesheet | 2026-08-26 16:52:55 CEST | `fdd252dab27333b2ea383f83a132708520ce3d2bad0627b240d90aa05f87cc9c` |
| Page renderer | 2026-08-26 16:44:26 CEST | `c1b4457416c1786b5f8e512aae776415401dd42705fc1a372adf9700d9b7d06e` |
| Designer E2E suite | 2026-08-26 16:52:55 CEST | `3ff9ada7e126e0020a0bdb5b683a59124ab80685f015f8f2e8be6cd450de8697` |

## Exact private seams

The guarded adapter remains inside the existing browser closure and reuses these narrow behaviors:

| Adapter responsibility | Existing seam | Integration rule |
|---|---|---|
| Read raw current state | Canonical design accessor plus design list/order state | Map through an explicit public allowlist; never return the broad boot object. |
| Quiesce persistence | Save timer, queued server-save promise, pending count, dirty flag, committed fingerprint | Wait for an already-scheduled normal autosave and the existing queue; never start a save for an agent proposal. Decline if no securely confirmed baseline exists. |
| Capture snapshot | JSON-safe canonical project/design state plus active index | Keep the raw clone private. Do not include URLs, tokens, server project, pricing, or access state. |
| Temporary preview | Existing proposal-overlay accessor and render skip-persistence option | Expand the overlay from one design to a complete draft state; do not replace state through DOM clicks. |
| Restore | Drop the overlay and render with persistence skipped | Revert writes neither local storage nor network. |
| Validate | Existing option catalog plus review-blocker rules | Convert impossible values to constraint errors; convert missing final logo into a decision-required issue for a keepable draft. |
| Commit | Existing persist/save-server queue | Write locally once and invoke one secure save with `confirmed_page_keep`; model expected server failure explicitly. |
| External change | Committed project fingerprint and server-project application path | Invalidate an open proposal and resynchronize; never Keep a stale draft. |
| Lock controls | Existing root proposal-active marker and input/click guards | Preserve tab/preview inspection where safe; block all mutation and upload paths. |

## Guarded bridge implementation

After explicit owner approval, the public runtime was connected to the existing
private Designer behind its guarded WebMCP feature flag. The old direct
KORRHAUS-specific tool/session spike was replaced with the pinned public
CoDesign Commerce browser bundle plus a narrow private adapter.

The bridge now:

- Registers the exact six Manifest 2.0 tools: `codesign_read_workspace`,
  `codesign_list_capabilities`, `codesign_stage_asset`,
  `codesign_apply_proposal`, `codesign_get_previews`, and
  `codesign_validate_proposal`.
- Uses the public `ProposalEngine`, `AssetSandbox`, `PreviewBridge`, review
  controller, operation reducer and tool-registration runtime.
- Keeps the private canonical project clone, save queue, API routes, pricing, access state, and renderer implementation private.
- Shows the review host only after an agent proposal succeeds.
- Waits for already-scheduled human autosave work without initiating a save for
  an agent proposal.
- Stages PNG, JPEG, WebP or SVG artwork temporarily, captures the existing
  combined proof board as one WebP per colourway, and imports artwork only
  after the visible human Keep control.
- Preserves zero-write staging and Revert; one Keep enters the existing local
  and secure-save paths exactly once.
- Invalidates open proposals when canonical state changes externally.
- Leaves the normal Designer unchanged when the feature flag is off or no agent proposal exists.

The current local exact-six snapshot and complete regression are recorded in
[`evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md`](./evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md).
It has not been deployed. Earlier five-tool guarded snapshots and zero-traffic
revisions remain dated history only and must not be promoted or described as
the current integration.

## Public canonical mapping

The versioned private inventory `2026-08-27.1` maps every current Route 02
customer-editable creative/configuration surface through more than 50 bounded
Manifest 2.0 controls. The groups include names and quantities; product;
stocked and exact body/accent colours; pattern and trim; studio typography or
supplied artwork; logo finish, colour, scale and position; cuff construction,
colour and label; grip plate, colour, motif, density, text and directions; and
all editable custom-packaging paper, ink, symbol and copy fields.

Duplicate, remove, reorder and set-active operations are exposed for up to four
colourways. UI-only route/accordion/search/zoom state, sample requests, prices,
quotes, applications, orders, proofs, customers, projects, suppliers, margins,
tokens and administration remain excluded. Private product/yarn identifiers
are translated inside the adapter and never returned.

## Second-colourway behavior

The existing human UI duplicates the active design and caps the project at four
designs. The adapter exposes the equivalent typed draft-only operation without
invoking the button or saving:

1. Clone the selected draft design internally.
2. Generate a collision-resistant public design ID.
3. Clear or preserve private artwork references according to the manifest policy; never return them publicly.
4. Apply the new colourway changes and quantity allocation in the same atomic operation.
5. Validate the design count and total quantity before rendering.
6. Rerender the full draft with the new design active and zero writes.

For the North Form scenario, the expected canonical result is two designs at 60 pairs each, total 120, visibly different body/accent choices, standard grip preserved, and missing final artwork reported as decision-required rather than a hard constraint.

## Bundle consumption

The public package builds a browser IIFE at
`packages/codesign-commerce/dist/browser/codesign-commerce.js` and verifies its
global API and SHA-256. The private app currently consumes the exact Item 9
bundle `sha256:7a26da66b510b52acc4e358dd39cecabcf3fd474559adf055a2e507c6491ce27`
only
after WebMCP capability is detected and instantiates:

- `ProposalEngine`.
- `AssetSandbox` and `PreviewBridge`.
- `ProposalReviewController`.
- `registerCoDesignTools`.
- The private adapter defined inside the designer closure.

The generated asset must carry its public source commit and hash in integration evidence. The private app must not fork or reimplement the public transaction engine.

## Current release boundary

The exact-six adapter source and browser assets passed the complete local
regression at private page asset version `20260827-16`. They have not been
built into or deployed as a new Cloud Run revision. The feature still requires
`CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED=true`; false remains the default.

Earlier five-tool zero-traffic revisions are historical and incompatible with
the current contract. The current local bytes must receive a new isolated
deployment and exact-hash verification after separate approval. Any production
traffic change and live-Shopify claim require another explicit approval and
actual-route verification.

## Migration checklist result

1. Preserved the pre-migration spike hashes and E2E baseline: **done**.
2. Added the pinned public browser bundle to the private asset build: **done locally**.
3. Replaced the direct tool/session logic with a narrow adapter over the existing safe seams: **done locally**.
4. Bound the approved review view to `ProposalReviewController`: **done locally**.
5. Retained and expanded the existing Playwright storage/network assertions: **done**.
6. Replaced the spike with exact-six Manifest 2.0 discovery, assets, atomic
   proposals, previews and validation across the full control inventory:
   **done locally**.
7. Added regression coverage proving that proposal staging never initiates a
   baseline save, Revert remains zero-write, and only the visible human Keep
   control uses the authorized normal save path: **done**.
8. Built and verified a new exact-six immutable image and zero-traffic
   candidate: **pending separate deployment approval**.
9. Production traffic promotion and live-Shopify WebMCP verification:
   **pending separate owner approval after step 8**.
