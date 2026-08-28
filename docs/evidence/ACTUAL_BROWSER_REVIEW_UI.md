# Actual-browser review UI evidence

> Historical development evidence. This run used the retired synthetic
> KORRHAUS harness and must not be presented as a submitted, hosted, or live
> merchant proof.

Date: 26 August 2026

Source: review implementation `4898812`, reproducibility fix `98f347c`; exact bundle digest is recorded in `LOCAL_VERIFICATION.md`

## Supported page-agent run

The public KORRHAUS reference was opened in the Codex in-app browser, which independently discovered the page's imperative WebMCP registrations:

- `codesign_read_configuration`
- `codesign_propose_configuration`

The proposal call used the committed baseline revision and changed two existing colourways:

- Design 1 body: Cream → Navy.
- Design 1 accent: Navy → Berry.
- Design 2 body: Cream → Dusty rose.
- Design 2 accent: Navy → Berry.
- Assumption: logo will be added later.

The tool returned a successful temporary proposal with `persisted: false`. The page visibly updated the same sock proof, exposed the human review panel, moved focus to the region, locked mutating controls, reported final logo artwork as the remaining decision, and stayed not production-ready.

## Persistence instrumentation

The reference adapter exposes sanitized counters to the local test harness. Observed outcomes:

| State/action | Preview | Restore | Local writes | Server writes | Commit calls |
|---|---:|---:|---:|---:|---:|
| Baseline | 0 | 0 | 0 | 0 | 0 |
| Awaiting review | 1 | 0 | 0 | 0 | 0 |
| Revert | 1 | 1 | 0 | 0 | 0 |
| Keep, from a fresh proposal | 1 | 0 | 1 | 1 | 1 |

The successful Keep produced committed revision `revision-2`. This evidence demonstrates proposal isolation for the public reference adapter; it must not be presented as proof of the private KORRHAUS bridge until that bridge passes independently.

## Native Chrome review

Chrome was used for visual fidelity and native keyboard behavior. Its page context did not expose WebMCP capability, so the development-only `?agent-preview=1` path established the same temporary UI state for those checks. Vite statically removes that branch from production builds.

- Desktop normalized CSS viewport: 1586 × 992.
- Phone functional viewport: 392 × 852 CSS; screenshot 393 × 852.
- Design-matched mobile canvas: 851 × 1847.
- `Revert` activated with Enter: PASS.
- Result: original Cream preview restored; one restore; zero local writes, server writes, or commit calls.
- Console errors and warnings during the verified proposal view: none.

## Visual evidence

- `screenshots/korrhaus-reference-chrome-desktop-final-v7.png`
- `screenshots/korrhaus-reference-chrome-mobile-panel-v5.png`
- `screenshots/korrhaus-reference-chrome-851x1847-v6.png`
- `screenshots/review-panel-desktop-comparison-final.png`
- `screenshots/review-panel-mobile-comparison-final.png`

See [`../archive/project-history/design-qa.md`](../archive/project-history/design-qa.md)
for the historical source-to-implementation comparison and resolved differences.
