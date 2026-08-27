# CoDesign Commerce Item 4 — Manifest 2.0 and control parity

Date: 27 August 2026

Branch: `codex/codesign-commerce-v2`

Starting commit: `e1c0b5f2689d6bd95a20591571d96547758172bf`

## Result

Item 4 passed locally. The unfinished Manifest 1.0 runtime contract was replaced by strict Manifest 2.0 types and runtime validation. The public package now describes finite control kinds and scopes, bounded asset slots, variant operations, preview surfaces, public dependency descriptions, and the fixed page-owned Keep persistence path.

There is intentionally no Manifest 1.0 runtime compatibility layer.

## Public contract evidence

- Manifest schema: `2.0`
- Tote manifest version: `2.0.0`
- Control kinds are finite: enum, color, integer, number, boolean, text, asset, position-2d, scale, rotation.
- Scopes are finite: workspace, variant, element.
- Asset controls require a declared slot; slot source kinds, media types, source characters, and decoded bytes are bounded.
- Variant policy declares minimum/maximum variants and only supported operations.
- Preview surfaces declare public media types and maximum bytes.
- Approval is fixed to `explicit-human` through `page-keep-controller`.
- Unknown top-level/nested fields, duplicate/unsafe IDs, invalid/incompatible bounds, oversized collections, unknown dependency targets, undeclared asset slots, and invalid approval paths fail closed.

Generated declarations were inspected in `packages/codesign-commerce/dist/types.d.ts` and `packages/codesign-commerce/dist/inventory.d.ts` after the production build.

## Tote human-control inventory

The versioned inventory at `examples/studio-tote/src/control-inventory.ts` accounts for 16 shipped control groups:

- 8 manifest-control mappings.
- 2 variant-operation mappings.
- 6 explicit exclusions: product discovery, step navigation, human-only Keep, human-only Revert, and two development-only proof controls.
- 0 missing mappings.

The reusable parity validator rejects missing mappings, unknown controls/operations/asset slots, unsafe or duplicate IDs, unknown fields, invalid categories, and empty exclusion reasons.

`npm run check:parity` returned:

```json
{
  "ok": true,
  "report": {
    "integrationId": "codesign.studio-tote-reference.web",
    "manifestId": "codesign.studio-tote-reference",
    "mappedControls": 8,
    "mappedVariantOperations": 2,
    "mappedAssetSlots": 0,
    "excludedControls": 6,
    "totalHumanControls": 16
  }
}
```

## Actual-browser verification

The OpenAI Codex in-app browser loaded:

`http://127.0.0.1:5174/?reset=true&item4-manifest2=1`

Observed on the actual page:

- The ordinary tote UI rendered completely with its human controls usable.
- No proposal review appeared without an agent proposal.
- No horizontal overflow was present.
- WebMCP read returned manifest version `2.0.0`.
- WebMCP read returned variant policy: minimum 1, maximum 3, operations `duplicate` and `set-active`.
- Capability listing returned 11 public controls, including `branding.artwork_ref` as a variant-scoped asset control.
- Capability listing returned all five public dependency descriptions with control-ID references.

The transitional seven-tool surface remains intentionally unchanged in Item 4. Exact replacement with the approved final six-tool surface belongs to checklist Item 8; this evidence makes no final tool-surface claim.

## Verification

- Final focused Manifest 2/inventory tests: 3 files, 14 tests passed.
- Full Vitest suite: 13 files, 105 tests passed.
- Strict workspace typecheck: passed.
- Production build: passed.
- Browser bundle verification: passed.
- Control-parity script: passed.
- Public-boundary scan: passed for 134 candidates.
- Documentation link check: passed for 54 files.
- Judge-site check: passed.
- Eval corpus/scorer self-test: passed for 24 cases.
- `git diff --check`: passed.

Built artifact hashes before the Item 4 commit:

- Core browser bundle: `sha256:055d444620dff37bb15d772c677407cd4d8eb6e01a2aa96e76986133a181ac05`
- Tote JavaScript bundle: `sha256:710b16644b58506efcefc9bd9f50478e2f78cefd1fe23a3b558772fd2da48e46`

No private KORRHAUS file was inspected or modified. Nothing was deployed, published, promoted, or submitted.
