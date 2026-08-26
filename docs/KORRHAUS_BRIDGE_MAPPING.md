# KORRHAUS bridge mapping

This document maps the private flagship integration without copying private state, commerce rules, credentials, or administrative behavior into the public package.

## Current local spike

Read-only inspection on 26 August 2026 found a feature-flagged, post-start safety spike already present in the private designer. It registers one direct tool for a temporary main-yarn, accent-yarn, and pattern proposal. It is useful evidence, but it is not the planned reusable CoDesign Commerce integration.

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

The private application directory has no useful committed Git history: its files are currently untracked. The following local hashes preserve the inspected spike state but are not a substitute for immutable deployment or public Git evidence:

| File role | Modified | SHA-256 |
|---|---|---|
| Designer source | 2026-08-26 16:52:55 CEST | `0f6aeedabc8a994c345c5b29f0137758fd075747ffb181056d81892cb03ebc0b` |
| Designer stylesheet | 2026-08-26 16:52:55 CEST | `fdd252dab27333b2ea383f83a132708520ce3d2bad0627b240d90aa05f87cc9c` |
| Page renderer | 2026-08-26 16:44:26 CEST | `c1b4457416c1786b5f8e512aae776415401dd42705fc1a372adf9700d9b7d06e` |
| Designer E2E suite | 2026-08-26 16:52:55 CEST | `3ff9ada7e126e0020a0bdb5b683a59124ab80685f015f8f2e8be6cd450de8697` |

## Exact private seams

The eventual adapter can remain inside the existing browser closure and reuse these narrow behaviors:

| Adapter responsibility | Existing seam | Integration rule |
|---|---|---|
| Read raw current state | Canonical design accessor plus design list/order state | Map through an explicit public allowlist; never return the broad boot object. |
| Quiesce persistence | Save timer, queued server-save promise, pending count, dirty flag, committed fingerprint | Flush recent human edits once and await the queue before snapshot. |
| Capture snapshot | JSON-safe canonical project/design state plus active index | Keep the raw clone private. Do not include URLs, tokens, server project, pricing, or access state. |
| Temporary preview | Existing proposal-overlay accessor and render skip-persistence option | Expand the overlay from one design to a complete draft state; do not replace state through DOM clicks. |
| Restore | Drop the overlay and render with persistence skipped | Revert writes neither local storage nor network. |
| Validate | Existing option catalog plus review-blocker rules | Convert impossible values to constraint errors; convert missing final logo into a decision-required issue for a keepable draft. |
| Commit | Existing persist/save-server queue | Write locally once and invoke one secure save with `agent_proposal_keep`; model expected server failure explicitly. |
| External change | Committed project fingerprint and server-project application path | Invalidate an open proposal and resynchronize; never Keep a stale draft. |
| Lock controls | Existing root proposal-active marker and input/click guards | Preserve tab/preview inspection where safe; block all mutation and upload paths. |

## Public canonical mapping

Initial KORRHAUS semantic options should be limited to the judge scenario:

| Public option | Private mapping | Agent behavior |
|---|---|---|
| `body.color` | Producer yarn code resolved to the private render colour | Writable enum/dynamic option; never expose raw object paths. |
| `accent.color` | Producer yarn code and explicit non-auto accent mode | Writable enum/dynamic option. |
| `pattern.id` | Public pattern ID | Writable enum/dynamic option. |
| `design.name` | Bounded design name | Writable bounded text. |
| `design.quantity` | Per-design quantity | Writable integer in production-supported increments. |
| `order.total_quantity` | Sum of design quantities | Writable integer; batch must reconcile design allocation. |
| `sole.grip_type` | Public grip plate/type ID | Writable only for approved public choices; the demo keeps the standard value. |
| `branding.artwork_status` | Derived missing/placeholder/ready status | Read-only; no upload contents or URLs. |

No price, quote, access, customer, project, supplier, margin, artwork-content, or API field is mapped.

## Second-colourway behavior

The existing human UI duplicates the active design and caps the project at four designs. The adapter should expose an equivalent draft-only clone operation without invoking the button or saving:

1. Clone the selected draft design internally.
2. Generate a collision-resistant public design ID.
3. Clear or preserve private artwork references according to the manifest policy; never return them publicly.
4. Apply the new colourway changes and quantity allocation in the same atomic operation.
5. Validate the design count and total quantity before rendering.
6. Rerender the full draft with the new design active and zero writes.

For the North Form scenario, the expected canonical result is two designs at 60 pairs each, total 120, visibly different body/accent choices, standard grip preserved, and missing final artwork reported as decision-required rather than a hard constraint.

## Bundle consumption

The public package now builds a browser IIFE at `packages/codesign-commerce/dist/browser/codesign-commerce.js` and verifies its global API and SHA-256. The private app should consume a pinned generated bundle before its designer script and instantiate only:

- `ProposalSession`.
- `ProposalReviewController`.
- `registerCoDesignTools`.
- The private adapter defined inside the designer closure.

The generated asset must carry its public source commit and hash in integration evidence. The private app must not fork or reimplement the public transaction engine.

## Required migration from the spike

Once visual approval is granted:

1. Preserve the current spike hashes and E2E evidence.
2. Add the pinned public browser bundle to the private asset build.
3. Replace only the direct tool/session logic with a narrow adapter over the existing safe seams.
4. Bind the approved review view to `ProposalReviewController`.
5. Retain and expand the existing Playwright storage/network assertions.
6. Prove the two-tool public vertical slice before adding the remaining three tools.
7. Do not enable production traffic; first produce local and no-traffic deployment evidence.
