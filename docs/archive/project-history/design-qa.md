# Proposal review design QA

> Historical development evidence. This review used the synthetic KORRHAUS
> harness that was retired from the active package and judge artifact on
> 27 August 2026. It proves review-component design work, not a submitted or
> hosted KORRHAUS demo.

Date: 26 August 2026

Surface: reusable CoDesign WebMCP proposal review mounted in the public KORRHAUS reference configurator

## Sources compared

- Approved desktop concept: `exec-669f4fbf-407d-4b5e-a7cd-7aa994850c70.png` (1586 × 992).
- Approved mobile concept: `exec-1d92627b-a8b2-4cbd-93c2-7dbba597b94b.png` (851 × 1847).
- Final desktop browser capture: `docs/evidence/screenshots/korrhaus-reference-chrome-desktop-final-v7.png` (1586 × 992).
- Final mobile full-view capture: `docs/evidence/screenshots/korrhaus-reference-chrome-851x1847-v6.png` (851 × 1847).
- Final phone-width focused capture: `docs/evidence/screenshots/korrhaus-reference-chrome-mobile-panel-v5.png` (393 × 852 screenshot at a 392 × 852 CSS viewport).
- Side-by-side inspections: `docs/evidence/screenshots/review-panel-desktop-comparison-final.png` and `docs/evidence/screenshots/review-panel-mobile-comparison-final.png`.

The source concepts and final browser screenshots were inspected at original detail and together in the side-by-side comparison images.

## Fidelity review

### Desktop

The final implementation preserves the approved in-flow placement, restrained warm surface, fine border, four-region hierarchy, temporary-state label, readable change summary, validation copy, and paired actions. It sits immediately below the existing configurator step navigation and does not cover the preview or navigation.

The implementation intentionally shows four changed fields because the agent changes two colourways. The concept compressed that information into two representative chips. Showing the complete diff is required for meaningful human confirmation and is treated as functional content, not visual drift.

### Mobile

The final implementation preserves the approved single-column hierarchy, separators, large readable labels, complete diff, decision summary, and side-by-side Revert/Keep actions. The panel is in normal document flow and the visible preview remains available below it. At the 392 px CSS phone width the content does not overflow horizontally and both actions retain usable hit areas.

The implementation includes explicit draft-safety and production-readiness copy required by the approved product contract. It also shows the second colourway's changes rather than hiding them.

## Interaction and browser checks

- Normal page load: review host hidden; no empty gap or visible agent controls.
- Actual in-app browser WebMCP discovery: exactly the two implemented tools were found for this slice, `codesign_read_configuration` and `codesign_propose_configuration`.
- Actual WebMCP proposal: same-page preview changed, review region appeared, focus moved to it, controls locked, and proposal counters showed one preview with zero local or server writes.
- Revert: restored the original preview and canonical state with zero local writes, zero server writes, and zero commits.
- Keep: performed exactly one local write, one server write, and one commit.
- Native Chrome keyboard activation: focusing Revert and pressing Enter restored the original state with zero persistence.
- Console review: zero warnings and zero errors in the verified proposal state.

The Chrome extension browser did not expose page WebMCP discovery in this environment. It was therefore used only for visual and native-keyboard checks through the development-only `?agent-preview=1` entry point. That branch is removed from the production build. Actual tool discovery and invocation were verified independently in the in-app browser.

## Iterations closed

1. Mobile actions stacked below 420 px, conflicting with the selected concept. Fixed by retaining the two-column action row and reducing only panel padding.
2. Missing logo artwork appeared once per colourway. Fixed by consolidating the public reference validation into one project-level missing decision while retaining both affected design IDs in machine state.
3. Narrow in-app-browser screenshot scaling produced misleading clipped captures. Rechecked in native Chrome with normalized CSS viewports; no product overflow defect remained.

## Residual differences

- Decorative information glyphs from the desktop concept are omitted. Text labels communicate the same meaning and keep the public component dependency-free.
- The browser focus ring is visible in the captured temporary state because focus correctly moves to the review region. This is intentional accessibility behavior.
- The public reference page is a reproducible approximation of the existing KORRHAUS Designer, not a copied universal renderer.

No unresolved P0, P1, or P2 visual or interaction defects remain for this slice.

Final result: **passed**.
