# Proposal review UI specification

## Approved activation boundary

The review surface is not part of normal configurator browsing. Its host remains hidden until `ProposalReviewController` publishes a successful temporary agent proposal. It may remain visible for the related busy, recovery, committed, or reverted outcome, but opening the page or using the configurator manually must not reveal it.

## Visual targets

- Desktop concept: `exec-669f4fbf-407d-4b5e-a7cd-7aa994850c70.png`, 1586 × 992.
- Mobile concept: `exec-1d92627b-a8b2-4cbd-93c2-7dbba597b94b.png`, 851 × 1847.

The component is an in-flow panel inserted directly after the configurator step navigation. It is never a modal, drawer, floating toolbar, or sticky overlay. The merchant chooses the insertion point, so the existing preview and navigation remain available.

## Design system

### Tokens

| Role | Token | Default |
|---|---|---|
| Background | `--codesign-review-surface` | `#fffdfb` |
| Text | `--codesign-review-text` | `#191817` |
| Muted text | `--codesign-review-muted` | `#716b67` |
| Border | `--codesign-review-border` | `#b9afa8` |
| Divider | `--codesign-review-divider` | `#ddd6d0` |
| Accent | `--codesign-review-accent` | `#9c3b5b` |
| Primary button | `--codesign-review-action` | `#171717` |
| Radius | `--codesign-review-radius` | `8px` |
| UI font | `--codesign-review-font` | merchant sans-serif stack |
| Transition | `--codesign-review-motion` | `160ms ease` |

The public component uses CSS custom properties so a merchant can match an existing configurator without forking the component. There is no external font, icon, image, or framework dependency.

### Component anatomy

1. A text-and-dot status line: “Temporary · Not saved.” The words carry the meaning; colour is secondary.
2. “Agent proposal” heading and a merchant-formatted design/quantity summary.
3. Changed-field rows with label, before value, arrow, and after value.
4. Separate assumptions, missing decisions, warnings, and blocking-error groups.
5. Explicit draft-safety and production-readiness text.
6. Revert and Keep proposal buttons.
7. Dedicated busy, invalidated, retry, uncertain, committed, and reverted states.

### Desktop layout

At 900 px and wider the panel uses four aligned regions: proposal identity, changes, validation/decisions, and actions. It is approximately 118 px tall for the common two-change state and follows the full content width.

### Mobile layout

Below 760 px the same content becomes one column. Changes and validation are separated by dividers and actions form a two-column row. At very narrow widths the panel padding reduces, but the two explicit actions remain side by side as approved. The panel has no fixed height and cannot cover the preview or page navigation.

## Typography and copy lock

- Status: uppercase, 12 px, semibold, tracking `0.08em`.
- Heading: 22 px desktop, 24 px mobile, medium weight.
- Summary and body: 14–16 px with at least 1.45 line height.
- Controls: 15–16 px, medium weight.
- Allowed primary labels: `Temporary · Not saved`, `Agent proposal`, `Revert`, `Keep proposal`, `Restore latest`, and `Retry save`.

No marketing copy, decorative badges, or unrelated navigation may be added to the component.

## Interaction and accessibility

- Native buttons provide keyboard activation and focus behavior.
- Focus moves to the region once for each newly ready proposal revision.
- A persistent polite live region announces temporary, busy, committed, reverted, and recovery states.
- Errors and missing decisions use text headings rather than colour-only encoding.
- Buttons become unavailable during in-flight operations.
- All user/agent-derived strings are assigned through `textContent`; the view does not accept HTML.
- Shadow DOM contains styles and prevents the host page from accidentally restyling the confirmation boundary. Named parts and CSS variables permit intentional merchant theming.

## Intentional implementation constraint

The desktop concept includes small informational glyphs. The reusable component omits those decorative glyphs because it is dependency-free and the text labels already express the meaning. This does not remove information or interaction, and avoids shipping mismatched icon art into every merchant configurator.
