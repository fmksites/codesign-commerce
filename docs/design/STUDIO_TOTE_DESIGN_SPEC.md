# Studio tote design specification

Status: superseded historical reference, 26 August 2026
Accepted at the time: `studio-tote-concept.png`

The complete Item 9 product direction is now defined by
[`STUDIO_TOTE_DESIGN_SYSTEM.md`](./STUDIO_TOTE_DESIGN_SYSTEM.md), including the
desktop/mobile references, implementation screenshots, full creative controls,
and fidelity ledger. The remainder of this file is retained as design history.

## Purpose and boundary

The studio-tote example proves that CoDesign Commerce can connect to a second,
materially different made-to-order configurator without changing the core. It
is a fictional public reference, not a claimed live merchant implementation and
not a universal renderer.

## Exact first-screen copy

- `Studio Tote reference · powered by CoDesign Commerce`
- `STUDIO TOTE`
- `Public portability example`
- `Build a tote for your studio`
- `Configure canvas, handles and print placement. Agent proposals stay temporary until you Keep or Revert them.`
- `Selected product`
- `Canvas studio tote`
- Steps: `Canvas`, `Colour`, `Handles`, `Print`, `Quantity`
- Product placeholder: `STUDIO MARK`
- Production note: `Final print artwork is still required.`

The shared review component owns the exact proposal, readiness, Keep, and
Revert copy. No price, upload, quote, cart, checkout, order, customer, or private
merchant copy may be added.

## Design system

- Background: true white `#ffffff`.
- Secondary surface: cool gray `#f6f7f5`.
- Text: ink `#171a18`.
- Muted text: `#626862`.
- Border: `#d8ddd8`.
- Primary action/selection: forest `#0e4b36`.
- Secondary material accent: clay `#a87968`.
- Display type: Georgia italic only for `for your studio`.
- UI type: Inter/Helvetica/Arial with deliberate 12–16px control typography.
- Corners: 4–10px; avoid pills except compact circular step numbers.
- Container model: open two-column configurator with ruled controls, one product
  stage, one shared review surface, and no nested marketing-card grid.

## Component inventory

- Announcement and simple brand header.
- Intro and selected-product row.
- Variant tabs plus one add-variant control.
- Five-step navigation.
- Shared CoDesign proposal review.
- Canvas-weight, bag-colour, and handle controls.
- Real tote product cutout with code-native dynamic placeholder mark.
- Print-position, print-method, quantity, and production-note fields.
- Responsive single-column layout that keeps the product proof ahead of the
  controls on narrow screens.

## Product assets

- `tote-natural-long.png`: natural canvas with shoulder handles, true alpha.
- `tote-charcoal-long.png`: charcoal canvas with shoulder handles, true alpha.
- `tote-natural-short.png`: natural canvas with short handles, true alpha.
- Charcoal short-handle presentation uses the genuine short-handle raster with
  a controlled neutral darkening filter; it is not CSS-drawn product art.

The dynamic `STUDIO MARK` remains code-native because it represents an editable
configuration layer, not branding baked into the source product photograph.

## Interaction contract

- Human controls update the same visible adapter state while no proposal is
  open.
- Agent proposals update the same renderer but do not persist.
- Variant tabs remain available for inspecting proposed variants.
- Human editing and add-variant controls lock during an open proposal.
- Keep persists once; Revert restores the exact snapshot with no write.
- The review surface is absent until a proposal succeeds.

## Responsive contract

- Desktop target: 1440 × 1100.
- Mobile target: 393 × 852.
- No horizontal overflow at 320px.
- On mobile the product preview precedes control groups, variant tabs scroll
  horizontally, and shared review actions remain fully visible.
