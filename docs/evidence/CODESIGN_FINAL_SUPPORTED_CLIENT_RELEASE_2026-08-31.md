# CoDesign WebMCP final supported-client release proof — 31 August 2026

## Outcome

**PASS.** The exact deployed public release exposed CoDesign's six page-scoped
WebMCP tools to the Codex desktop in-app browser. A temporary two-variant tote
proposal produced two genuine renderer previews, passed configuration
validation, truthfully reported the missing production-artwork decision, and
was then reverted through the visible page control without saving anything.

This is supported-client evidence for the Codex desktop in-app browser. It is
not evidence for the consumer ChatGPT website inside ordinary Chrome, a
current native-Chrome WebMCP run, Claude, or every possible WebMCP client.

## Exact release identity

- Public repository: <https://github.com/fmksites/codesign-webmcp>
- Commit: `a3b7c1fc38578b0a3a3bcb78f1c62242020b1f0b`
- Stable tote: <https://codesign-webmcp.pages.dev/tote/?reset=true>
- Immutable deployment: <https://a8e2b6b7.codesign-webmcp.pages.dev/>
- Core browser bundle SHA-256:
  `c0fc462e099c380432d6d28971dba686d0f5f258ab7d5d368b1a6cd3110d1b56`
- Tote application bundle SHA-256:
  `4058d70e3b7250c11edd51931ba21bc23d698d8cd58000a046915a07bc1d582e`
- Client: Codex desktop in-app browser with the page `webmcp` capability
- Verification date: 31 August 2026

The stable and immutable `site-metadata.json` responses both identified the
same commit and bundle hashes.

## Page and tool discovery

The stable tote opened at its deterministic baseline with one `Canvas tote`,
100 units, natural 12 oz canvas, long handles, and ordinary human controls.
The page exposed exactly these six tools:

1. `codesign_read_workspace`
2. `codesign_list_capabilities`
3. `codesign_stage_asset`
4. `codesign_apply_proposal`
5. `codesign_get_previews`
6. `codesign_validate_proposal`

The no-artwork North Form journey correctly did not call
`codesign_stage_asset`: staging is reserved for a shopper-supplied asset. The
executed sequence was read, capabilities, apply, previews, validate, and a
final reread.

## Temporary proposal result

The agent applied one atomic 16-operation proposal at committed revision
`tote-revision-1`:

- `North Form Customer`: 50 natural 16 oz reinforced totes, long handles,
  centered one-colour editorial `NORTH FORM` typography at 105 percent.
- `North Form Staff`: 50 charcoal 16 oz reinforced totes, short handles,
  upper-left one-colour mono `NORTH FORM` typography at 90 percent.

The proposal returned `persisted: false`. While it was open, the ordinary
controls were disabled, the page showed `Temporary proposal not saved`, both
variants were visible, and the review panel exposed page-owned Revert and Keep
controls. Keep was not selected.

## Preview and validation evidence

The merchant renderer returned and the client visibly displayed two distinct
640 by 640 WebP previews:

- Natural customer tote:
  `sha256:86e7ef83971a941440a867aa364e5ad4ffb9e13b9ad66aa1b66c1c0fbb7e6f03`
- Charcoal staff tote:
  `sha256:179c0a385b999ced3fe7e1ca7aa0a699393d76ea02fe667d256cbe07d80e4a30`

Both artifacts used `data-url` transport and included proposal-specific alt
text. Validation returned:

- `configurationValid: true`
- `productionReady: false`
- one decision-required `FINAL_PRINT_ARTWORK_REQUIRED` issue covering both
  variants
- `persisted: false`

That result is intentional: studio-name typography is a useful first visual
direction, but it is not silently relabeled as final production artwork.

## Human review and zero-write Revert

After previews became current, the page changed its progress state to
`Preview ready` and enabled its page-owned decision controls. The visible
Revert button was selected. The page then reported `Proposal reverted · draft
unchanged` and `Nothing was saved`.

A final workspace read confirmed:

- `pendingProposal: null`
- `persisted: false`
- committed revision remained `tote-revision-1`
- the original single `Canvas tote` remained active at quantity 100
- no Keep, save, order, quote, cart, checkout, payment, or customer-data action
  occurred

The browser captured zero warning or error console messages across the
proposal, preview, validation, and Revert sequence.

## Repository verification

After adding this dated record and synchronizing the current release docs,
`npm run verify` passed:

- 22 test files / 189 tests;
- strict TypeScript checks;
- production and Shopify-overlay builds;
- browser-bundle and judge-site verification;
- public-boundary scan across 198 candidates;
- documentation-link validation across 77 files;
- 26 evaluation cases across six categories plus scorer self-test; and
- 25/25 tote parity: 14 controls, four variant operations, one asset slot, and
  six intentional exclusions.

The rebuild reproduced the two deployed bundle hashes listed above.

## Claim boundary

This final-release run closes the supported-client repeat required before
submission work. Historical native Chrome 151 evidence remains historical;
the current release is not relabeled as a current native-Chrome run. The
consumer ChatGPT website inside ordinary Chrome is also not claimed as a site
tools host.
