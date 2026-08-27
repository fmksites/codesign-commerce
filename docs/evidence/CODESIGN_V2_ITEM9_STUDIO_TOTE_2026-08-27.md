# CoDesign Commerce V2 — Item 9 studio-tote evidence

Date: 27 August 2026
Scope: public repository only
Release status: local implementation evidence, not deployed or published

## Outcome

The fictional studio tote is now a complete visual product customizer rather
than a narrow text proposal. A person and an agent can address the same
merchant-owned controls and renderer, while the agent's work stays temporary
until the visible page Keep control is used.

The final North Form judge journey visibly creates two named 50-tote variants
in three coherent passes:

1. **Foundation** sets the material, colour, handles, construction, name, and
   initial quantity.
2. **Branding** stages the real 214,745-byte supplied PNG, applies it to the
   live renderer, and sets its print treatment.
3. **Variants** creates the second named colourway, preserves the 100-unit
   total, and gives each variant a distinct placement, scale, and rotation.

The resulting `North Form Natural` and `North Form Charcoal` designs remain
temporary, show one current preview each, and validate as production ready
because real artwork is attached.

## Customer-control parity

The final inventory accounts for all 25 shipped human surfaces:

| Inventory category | Count |
|---|---:|
| Manifest-control mappings | 14 |
| Variant-operation mappings | 4 |
| Asset-slot mappings | 1 |
| Explicit legitimate exclusions | 6 |
| **Total human surfaces** | **25** |

Mapped creative and configuration controls include variant name and quantity,
canvas weight, bag colour, handles, reinforcement, studio-name text,
typography, supplied artwork, artwork removal, print method, placement, ink
colour, scale, and rotation. Variant selection works from the inspector, mobile
tabs, and preview rail; duplication preserves the collection total. Reset,
navigation, the two human confirmation controls, and development-only proof
controls are explicitly inventoried but not agent-writable.

## Deterministic end-to-end behavior

The tote integration tests cover:

- every ordinary human control and actual artwork import/remove;
- a three-pass proposal using the real supplied PNG;
- two distinct named variants and one preview artifact per variant;
- a later subjective refinement that changes only the charcoal design while
  leaving the natural design byte-equivalent;
- coupled canvas/print constraints and invalid-batch atomicity;
- zero-write Revert and exactly-once state commit on Keep;
- preview revision and integrity binding.

The final full local suite passed:

| Gate | Result |
|---|---|
| Tests | PASS — 20 files, 175 tests |
| Strict typecheck | PASS |
| Production build | PASS |
| Control parity | PASS — 25/25 accounted for |
| Public-boundary scan | PASS — 164 candidates |
| Documentation links | PASS — 64 files |
| Eval corpus/scorer self-test | PASS — 25 cases across 6 categories; no synthetic evidence saved |
| Judge-site check | PASS after the final prompt/artwork-link update |
| Browser-bundle verification | PASS — `sha256:7a26da66b510b52acc4e358dd39cecabcf3fd474559adf055a2e507c6491ce27` |
| `git diff --check` | PASS |

## Actual-browser transaction evidence

The final Vite page was exercised in the Codex in-app browser through its real
page WebMCP capability. It exposed exactly:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

The live visual-QA journey showed both named variants, the real North Form
mark, three completed progress passes, two preview cards, production-ready
status, and enabled visible Revert/Keep controls. Raw temporary asset handles
did not appear in the review copy.

Revert observation:

```json
{
  "before": {
    "localWrites": 0,
    "serverWrites": 0,
    "commitCalls": 0,
    "assetImports": 0
  },
  "after": {
    "restoreCalls": 1,
    "localWrites": 0,
    "serverWrites": 0,
    "commitCalls": 0,
    "releasedAssets": 1,
    "visibleVariant": "Canvas tote"
  }
}
```

Keep observation on a fresh run:

```json
{
  "localWrites": 1,
  "serverWrites": 1,
  "commitCalls": 1,
  "assetImports": 2,
  "visibleVariants": 2
}
```

The two asset imports are the two variant-owned committed uses of one temporary
artwork handle. The persisted configuration transaction itself occurred once.
After Keep, human controls unlocked and the two saved designs remained visible.

With `disable-webmcp=true`, the same page reported unsupported registration,
hid the review panel, left the normal human controls enabled, changed the live
tote to the charcoal renderer through the ordinary colour control, and restored
that human choice after navigation. No agent-specific UI was required for
normal use.

## Desktop and mobile visual QA

The design references were generated as visual specifications; the shipped UI
is semantic TypeScript, HTML, CSS, actual form controls, and the real tote
renderer. They are recorded in
[`../design/STUDIO_TOTE_DESIGN_SYSTEM.md`](../design/STUDIO_TOTE_DESIGN_SYSTEM.md).

Actual browser captures:

- [Desktop 1280 by 720](./screenshots/item9-studio-tote-desktop.png) —
  `sha256:f8e753fee7c5c28dc4c866a604d5799673668933fbd88ff949b4f871d887a651`
- [Mobile canvas 390 by 844](./screenshots/item9-studio-tote-mobile-390.png) —
  `sha256:b92f60c55ec58f02b6a837499982054a1174c0ce3c1cc817b23d77a637e5e334`
- [Mobile review 390 by 844](./screenshots/item9-studio-tote-mobile-390-review.png) —
  `sha256:e6bc1e5e491ba6790a9f849195f42f4c19df96d2afd1180541fe0b3c772cf7ad`

The desktop page measured zero horizontal overflow. A browser-native viewport
override—not a CSS-sized desktop screenshot—verified the page at exactly 390
by 844 pixels. The first pass exposed a four-pixel overflow from the inspector
navigation margin; that defect was corrected, retested at `scrollWidth =
clientWidth = 390`, and only the corrected screenshots are retained. The mobile
canvas stays first, named variant tabs stay above it, and the later review
viewport shows both 44-pixel human confirmation actions.

Visual comparison points all passed: product-canvas dominance, three-part
desktop hierarchy, complete creative controls, explicit proposal state,
materially distinct variants, true mobile reflow, restrained token system, and
actual supplied-artwork rendering. The only deliberate differences from the
concept are documented renderer- and product-contract choices.

Both the in-app browser and the attached Chrome instance rendered the final
visual shell with no console errors or warnings and no horizontal overflow.
The current attached Chrome instance did not expose `document.modelContext`,
so this pass does not invent a native Chrome tool-execution result. The exact
six-tool native Chrome 151 transaction was already recorded for Item 8; the
final immutable-build Chrome repeat remains part of Item 11 release
verification. The owner separately deferred the literal normal-ChatGPT
conversation repeat to that same release gate.

## Judge and reproducibility surface

The judge landing now links both the deterministic `/tote/?reset=true` demo and
the exact public North Form artwork. The guide tells a judge to attach that PNG,
ask for the full two-variant brief, observe all three passes and both current
previews, then try one targeted subjective refinement before choosing Keep or
Revert. The development-only `agent-preview` query remains explicitly labeled
as visual QA rather than an agent run.

No KORRHAUS renderer, branding, customer data, private pricing, supplier data,
administrative logic, deployment, publication, or production traffic was
touched in Item 9.
