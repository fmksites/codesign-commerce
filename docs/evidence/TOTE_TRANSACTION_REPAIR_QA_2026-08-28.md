# Studio tote transaction repair QA

**Date:** 28 August 2026

**Surface:** local public judge artifact only

**Base URL:** `http://127.0.0.1:4173/tote/?reset=true`

**Final local tote bundle:** `sha256:dd3e5cfaa87fdc272ab9b0e7512881ce4c5730118ba784f0b9e3e25bd4d40d01`

This repair round followed an independent 31-screenshot audit that found four
material defects: cross-tab changes did not invalidate another tab's proposal,
Keep was lost when the page reloaded from the deterministic reset URL, an
unkept proposal disappeared on reload behind a misleading saved message, and
the first operation could not be retried idempotently after a lost response.

## Implemented corrections

- The tote adapter now consumes external storage events and marks an open
  proposal stale before any refinement or Keep can continue.
- The `reset=true` instruction is consumed once and removed from the active
  URL, so a later reload no longer deletes a kept draft.
- An unkept proposal leaves a session marker. Reload restores the committed
  draft and visibly says that the previous proposal was not saved, with an
  instruction to ask the agent to recreate it.
- An exact retry of the first successful operation may omit proposal identity
  and returns `deduplicated: true`; the same operation ID with a different
  payload returns `OPERATION_ID_CONFLICT`.
- The review component no longer hides before/after changes, assumptions and
  readiness in the narrow desktop rail.
- Reset, colour, artwork, ink and duplicate controls now meet a 44 CSS-pixel
  target on the checked desktop build. The save indicator exposes a light-DOM
  live status and distinct saved, temporary and stale tones.

## Independent browser regression

The separate Codex browser task passed all requested black-box scenarios:

1. Exact first-operation retry and changed-payload conflict.
2. Two-tab stale invalidation, blocked Keep and explicit Restore latest.
3. Production-ready page Keep followed by immediate reload; revision 2,
   charcoal design and supplied artwork remained intact.
4. Reload before Keep; revision 1 returned, no proposal persisted, and the
   recovery message was visible.
5. Narrow desktop review with changes, assumption, readiness, preview and both
   decisions visible.
6. 390 by 844 mobile with no horizontal overflow, visible keyboard focus and
   measured 44-pixel-or-larger tested targets.
7. Empty browser console log collection.

The final fixture was reset to `tote-revision-1`, one natural `Canvas tote`,
`pendingProposal: null`, and `persisted: false`. A temporary local evidence
package contained the report, structured results, and 16 screenshots; it is not
part of the public release.

## Deterministic release gates

- 20 test files / 180 tests passed.
- Strict TypeScript passed for package source, tote source and tests.
- Core, tote and combined judge artifacts built.
- Browser-bundle verification passed.
- Judge-site metadata and assets passed.
- Fresh public clone boundary scan passed for 178 candidates.
- Fresh public clone documentation links passed for 71 files.
- The 25-case eval corpus and scorer self-test passed structural validation.
- Tote parity passed: 14 manifest controls, four variant operations, one asset
  slot, six deliberate exclusions, 25 total human/review surfaces.

## Chrome and release boundary

The final local artifact also passed ordinary connected-Chrome inspection:
full viewport use, visible human UI, 44-pixel critical controls and no console
warnings. That connected Chrome instance exposed neither
`document.modelContext` nor native tool methods, despite the prior historical
Chrome 151 proof. Native Chrome WebMCP is therefore not claimed for this new
local bundle until the testing/origin path is available and repeated.

After the final rebuild, the independent Codex browser task repeated a short
smoke on the exact bundle above: all six tools were discovered, review details
and Keep/Revert rendered, a second-tab human change advanced revision 1 to 2,
the first tab showed the red stale status and Restore latest, reset returned the
fixture to revision 1, and both console logs were empty. Its temporary local
evidence package is not part of the public release.

No source was pushed and no public deployment, KORRHAUS change, traffic change,
commerce action or Devpost action occurred in this repair round. The deployed
public site remains the previous release until a separate publication and
deployment approval is granted.
