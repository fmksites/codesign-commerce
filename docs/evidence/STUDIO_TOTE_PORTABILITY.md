# Studio-tote portability evidence

Date: 26 August 2026  
Implementation base: `cdbbdb7` (`docs: record private five-tool flagship evidence`)  
Accepted design reference: `../design/studio-tote-concept.png`

## What this proves

The studio-tote reference is a second, materially different made-to-order
configurator using the same CoDesign Commerce package and shared review UI.
All tote-specific work is confined to `examples/studio-tote/`; the working-tree
diff for `packages/codesign-commerce/` was exactly empty after implementation.

The example is intentionally fictional. It proves adapter portability, not a
second live merchant deployment and not a universal renderer.

## Different product contract

The tote manifest exposes ten public options:

- Canvas weight.
- Bag colour.
- Handle length.
- Print method.
- Print placement.
- Reinforced construction.
- Variant name and quantity.
- Order total.
- Read-only print-artwork status.

Its adapter owns five product dependencies:

- Variant quantities equal the order total.
- Embroidery requires 12 oz or 16 oz canvas.
- 16 oz canvas requires reinforced handle construction.
- Two-colour screen print requires at least 50 totes per variant.
- Final print artwork is required for production readiness.

None of these option IDs, product rules, assets, or renderer behaviors were
added to the core.

## Actual WebMCP-capable browser flow

The Codex in-app browser opened the anonymous `?reset=true` baseline and
independently discovered exactly the same five CoDesign tools as the KORRHAUS
reference. Before a successful proposal, the review panel, Keep, and Revert
were not visible.

The browser then called:

1. `codesign_read_configuration`.
2. `codesign_list_options` for the relevant tote choices.
3. `codesign_propose_configuration` for the first variant.
4. `codesign_create_design` for the second variant.
5. `codesign_validate_configuration` for the open proposal.

The result created:

| Variant | Quantity | Canvas | Colour | Handles | Print position |
|---|---:|---|---|---|---|
| Natural long-handle | 50 | 12 oz | Natural | Long shoulder | Front center |
| Charcoal short-handle | 50 | 12 oz | Charcoal | Short tote | Upper left |

Observed transaction state:

- `ok: true`.
- `persisted: false`.
- Proposal revision `2`.
- Both variant tabs visible in the ordinary configurator.
- `configurationValid: true`.
- `productionReady: false`.
- `FINAL_PRINT_ARTWORK_REQUIRED` returned as a `decision-required` issue for
  both variants.
- The committed read remained one `Canvas tote`, 100 units, revision
  `tote-revision-1` while the temporary two-variant preview was visible.
- The page said `Temporary proposal not saved` and provided visible human
  Keep/Revert controls.

Revert returned exactly to the one-variant 100-unit baseline. Instrumentation
reported:

```json
{
  "quiesceCalls": 1,
  "previewCalls": 2,
  "restoreCalls": 1,
  "localWrites": 0,
  "serverWrites": 0,
  "commitCalls": 0,
  "createDesignDraftCalls": 1
}
```

## Coupled-rule negative case

Against a fresh baseline, the browser proposed a two-colour screen print at 25
totes and kept the order total consistent at 25. The adapter rejected the
complete batch with:

- `ok: false`.
- `persisted: false`.
- `INVALID_VALUE`.
- Affected options `print.method`, `design.quantity`, and the still-missing
  artwork status.

The review panel remained hidden, the committed revision stayed
`tote-revision-1`, and local/server/commit counters stayed at zero. This proves
the tote adapter contributes coupled production behavior rather than only a
different visual skin.

## Ordinary human UI

With no agent proposal open, the visible Charcoal and Short tote controls were
selected normally. The preview switched to the short-handle product asset and
its charcoal treatment. Navigation without `?reset=true` reloaded those saved
human choices with the review panel still hidden. The demo was then returned to
the anonymous reset baseline.

## Visual and asset verification

The accepted desktop concept and both current mobile screenshots were opened
together with `view_image` and inspected directly.

| Comparison point | Concept evidence | Render evidence | Outcome |
|---|---|---|---|
| Copy and hierarchy | Studio Tote announcement, brand, heading, product row | Exact first-screen strings and order | PASS |
| Palette and typography | True white, ink, forest action, serif italic accent | Same restrained responsive system; no KORRHAUS styling | PASS |
| Container model | Open configurator, one review surface, one product stage | No nested marketing-card grid or fake dashboard chrome | PASS |
| Proposal state | Two real variants and green temporary review | Mobile proposal shows both tabs and shared review | PASS |
| Product rendering | Tactile natural tote with dynamic mark | Real raster assets show natural/charcoal and long/short states | PASS |
| Production fields | Print position/method and artwork note | Working selects, quantity input, and missing-artwork note | PASS |
| Responsive behavior | Desktop two-column source composition | 393 × 852 collapses cleanly with product proof before controls | PASS |

The in-app browser viewport was fixed at 393 × 852 and did not expose a resize
control in this session. Therefore the accepted 1440 × 1100 concept is retained
as the desktop design reference, while actual-browser visual evidence in this
pass is mobile. The desktop source build passed, but that build result is not
misrepresented as desktop visual verification. A native-size desktop browser
capture remains part of final immutable-build QA.

No browser console error or warning was recorded for the tote origin. No added,
removed, or reordered first-screen copy was found against
`docs/design/STUDIO_TOTE_DESIGN_SPEC.md`. The generated concept included extra
colour swatches that were deliberately excluded from the accepted written spec
because no matching public product assets existed; the shipped interface
offers only the two honest, fully rendered public fixture colours.

Screenshots:

- `screenshots/studio-tote-five-tool-mobile.png` — 393 × 852,
  `sha256:5325066e1d8af63a1fd28db94ea47d9cb4daa3633d52f7e62ecc42e465fa76bd`.
- `screenshots/studio-tote-proof-mobile.png` — 393 × 852,
  `sha256:f094c1c294b45034021e7431289b39cf645a48baf5e307954d50a4ae20d763c8`.

Product assets all have true alpha transparency:

| Asset | SHA-256 |
|---|---|
| `tote-natural-long.png` | `6d928ff285f9f27b3d1a093fec4fb4691939ed27b6971801b59a7a32c0dd020f` |
| `tote-charcoal-long.png` | `6306e5d336921bed1a017cc4eb251820a57e98a9597af1fb670de4bfcda464e3` |
| `tote-natural-short.png` | `04192e19971be06633887a5d1b73d9a1de2d9b88af4f9901e694cca5cc2977f3` |

One first validation attempt was interrupted by expected Vite hot reload while
the source was still being corrected. After the local server settled, the
complete five-tool sequence above passed without a reload. No interrupted run
is counted as evidence.

## Remaining gate

This evidence proves local portability, browser behavior, and responsive mobile
quality. The implementation still needs the complete root gate, commit, and
clean-clone run before the Phase 5 portability milestone may be marked PASS.

