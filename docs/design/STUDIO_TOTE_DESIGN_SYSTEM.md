# Studio tote product design system

This file records the visual contract used for checklist Item 9. The generated
reference images are design specifications only; the shipped interface remains
semantic HTML, CSS, TypeScript, real form controls, and the existing tote
renderer.

## Reference views

- Desktop: [`studio-tote-desktop-reference.png`](./studio-tote-desktop-reference.png)
- Mobile: [`studio-tote-mobile-reference.png`](./studio-tote-mobile-reference.png)
- Verified desktop implementation:
  [`../evidence/screenshots/item9-studio-tote-desktop.png`](../evidence/screenshots/item9-studio-tote-desktop.png)
- Verified native 390 by 844 mobile canvas:
  [`../evidence/screenshots/item9-studio-tote-mobile-390.png`](../evidence/screenshots/item9-studio-tote-mobile-390.png)
- Verified mobile proposal and Keep/Revert controls:
  [`../evidence/screenshots/item9-studio-tote-mobile-390-review.png`](../evidence/screenshots/item9-studio-tote-mobile-390-review.png)

## Design intent

The product is an existing-merchant customizer enhanced by an agent, not a chat
mockup or marketing page. The tote canvas is the visual focus. All human controls
remain present, proposal changes appear in the same renderer, and a compact
review surface makes the temporary/not-saved state plus Keep/Revert boundary
unmistakable.

## Tokens and component rules

- Background: true white; product canvas: pale neutral stone `#f6f6f4`.
- Text: deep ink `#161b24`; muted text `#68707d`.
- Interaction: cobalt `#1d56d8`; selected surface `#eef3ff`.
- Borders: crisp neutral gray, normally one pixel; radii 4 to 8 pixels.
- Shadows: limited to product depth and evidence framing, never decorative UI.
- Content type: compact Inter/system sans; wordmark: restrained Georgia serif.
- Desktop shell: 326-pixel inspector, fluid live canvas, 294-pixel review rail.
- Mobile shell: named variant tabs, canvas, proposal/review, then full controls.
- Controls: real buttons, inputs, selects, ranges, checkbox, and file input with
  deliberate 44-pixel mobile targets.
- Product imagery: existing transparent tote raster assets; branding is a live
  typography or supplied-raster layer with placement, scale, rotation, and
  print-colour behavior.
- Motion: only renderer/lock-state transitions, disabled for reduced motion.
- No gradients, glass, marketing badges, fake metrics, chat panel, prices,
  checkout, order, payment, private data, or KORRHAUS branding.

## Allowed first-viewport copy

- `CoDesign WebMCP`
- `Studio tote reference`
- `Design your collection`
- `Every choice stays in the merchant's real visual workspace.`
- `Collection`, `Materials`, `Branding`, `Variants`
- `Live product canvas`
- The active customer-supplied variant name and material summary
- `Human editing` or `Agent proposal · not saved`
- `Proposal progress`, `Foundation`, `Branding`, `Variants`
- `Temporary · Not saved`, `Agent proposal`, `Revert`, `Keep proposal`
- `Variant previews`, `Production readiness`

## Fidelity ledger

| Point | Reference requirement | Implemented result |
|---|---|---|
| Canvas hierarchy | Tote dominates the workspace | Central live canvas occupies the majority of desktop and mobile first viewport |
| Three-part desktop | Inspector, canvas, review rail | Fixed-height three-column shell with independent inspector/review scrolling |
| Full creative controls | Materials, typography, artwork, placement, scale, rotation, variants, quantities | All are real human controls and have manifest, asset-slot, or variant-operation inventory mappings |
| Proposal clarity | Visible staged progress and explicit Keep/Revert | Three-pass progress plus compact page-owned proposal controller; no WebMCP save tool |
| Variant visibility | Two materially different named previews | Natural and charcoal cards plus mobile named tabs share the live renderer state |
| Mobile | 390-pixel visual-first composition without horizontal overflow | Native 390 by 844 viewport verified at zero horizontal overflow with named tabs and canvas-first ordering; a second viewport capture verifies the responsive review and 44-pixel Keep/Revert controls |
| Palette/type | True white, stone, ink, restrained cobalt, deliberate UI type | Exact token family implemented without gradients or browser-default control typography |
| Artwork | Actual supplied asset, not a text-only placeholder | Real PNG is staged, alpha-tinted as selected one-colour ink, rendered, and captured into revision-bound previews |

Intentional differences from the generated concept are product-driven: the
reference's illustrative tote asset and fictional nine-point placement grid are
replaced by the repository's real tote raster renderer and the merchant-defined
front-center/upper-left placement choices. The implementation uses the actual
generic review controller instead of drawing a decorative approximation.
