# Evaluation report

**Current evidence date:** 28 August 2026

This report separates deterministic verification, actual browser/runtime
evidence, and the optional model-evaluation corpus. None substitutes for the
others.

## Current release candidate

The current local candidate passes:

- `npm ci` with zero reported dependency vulnerabilities;
- 22 Vitest files / 189 tests;
- strict TypeScript checks for the core, tests, and studio tote;
- standalone and Shopify-overlay builds;
- browser-bundle and judge-site verification;
- public-boundary and documentation-link checks;
- 26-case eval-corpus validation and scorer self-test; and
- 25/25 tote surface parity: 14 controls, four variant operations, one asset
  slot, and six intentional human/non-configuration exclusions.

The current local build produces:

- core browser bundle SHA-256:
  `c0fc462e099c380432d6d28971dba686d0f5f258ab7d5d368b1a6cd3110d1b56`;
- tote application bundle SHA-256:
  `4058d70e3b7250c11edd51931ba21bc23d698d8cd58000a046915a07bc1d582e`.

Recheck both hashes after any application-code change and record the final
deployed commit and immutable URL after the last release.

## What deterministic tests establish

Coverage includes Manifest 2 validation, public-state reconstruction,
prototype/unknown-field rejection, atomic typed operations, operation-ID
binding and idempotency, committed/proposal revisions, cancellation,
external-change staleness, temporary asset policy, preview integrity, zero-write
Revert, exactly-once Keep, retry/uncertain outcomes, exact-six WebMCP schemas,
forbidden-action absence, tote controls, artwork, variants, coupled production
rules, review accessibility, reload recovery, and ordinary-browser fallback.

These tests establish deterministic contracts. They do not prove that a named
external agent client discovers or selects the tools on a deployed URL.

The current local candidate passed both a direct page-scoped journey and an
independent natural-language selection run. A separate Codex task received only
the local page URL and an ordinary subjective shopper brief containing no
protocol name, tool name, option ID, or tool-call instruction. It independently
selected read, capabilities, apply, previews, validate, and final reread;
created two named 50-tote variants; received two genuine 640 by 640 WebP
renderer previews; reported configuration-valid output with the truthful
missing-final-artwork decision; and left the proposal unpersisted with no
errors. Direct desktop/mobile inspection additionally passed with no overflow,
console warnings, or Revert writes.

The same implementation is now deployed from commit
`ae5e93a28dc735b0f8bb08596fb3ab8c22f7a2f5`. A separate Codex task repeated
the implementation-blind brief against both the stable public tote and the
Shopify development-store page. Both origins independently selected the same
six-call sequence, displayed two genuine 640 by 640 renderer previews, reported
the honest missing-final-artwork decision, and saved nothing. This is current
supported-agent evidence for those two page origins, not a universal-client or
consumer-ChatGPT-website claim. Current native Chrome remains unclaimed because
the connected Chrome exposed no `document.modelContext`.

## Actual page and browser evidence

The deployed public tote has completed page-scoped exact-six flows with:

- public PNG artwork staged temporarily;
- two coherent proposal passes and two named variants;
- two distinct revision-bound 640 x 640 previews;
- valid and production-ready output;
- targeted one-variant refinement;
- atomic invalid-value rejection;
- zero-write Revert;
- page-owned Keep/reload and idempotency; and
- responsive ordinary-browser fallback.

The Shopify development-store page has run the same six CoDesign tools on a
Shopify origin while Shopify's native catalog and cart tools remained present.
Read-only Shopify catalog/cart calls and the temporary CoDesign proposal worked
together.

Current client claims are authoritative only in
[`BROWSER_SUPPORT.md`](./BROWSER_SUPPORT.md). In particular, historical native
Chrome 151 exact-six evidence must not be relabeled as a final-release repeat.
After the repository cleanup is deployed, repeat native Chrome with WebMCP
enabled or ChatGPT's in-app browser before freezing the submission claim.

## Private KORRHAUS integration

The pre-existing KORRHAUS Custom Sock Designer has a private exact-six Manifest
2 adapter covering more than 50 customer-editable controls and up to four
colourways. Local unit, build, Playwright, visual, artwork, stale-state,
autosave-isolation, mobile, Keep, and Revert evidence passed.

The feature remains disabled by default and is not claimed as a live production
WebMCP release. The public tote submission does not depend on KORRHAUS traffic
or feature activation.

## Optional model-evaluation tooling

`evals/cases.json` defines 26 selection, end-to-end, ambiguity, safety,
adversarial-data, and recovery cases. `evals/run-policy.json` defines thresholds
and `evals/RESULTS_FORMAT.md` defines evidence-bearing output.

Every shopper prompt in the corpus is implementation-blind: validation rejects
`WebMCP`, CoDesign tool names, and explicit tool-call wording. One core tote
case intentionally supplies only subjective intent—natural customer version,
darker staff version, studio-name branding, previews, and readiness—so routing
cannot depend on copied option IDs or a protocol incantation.

`npm run check:evals` validates the corpus and scorer with synthetic fixtures.
It does **not** execute a model and is not reported as model-selection evidence.
No paid model run or API key is required for the challenge submission.

## Remaining final-release gates

1. Repeat release verification after any later runtime change; the current
   deployed commit, immutable URL, hashes, clean-clone run, hosted CI, and
   supported-agent judge flow have passed.
2. Record and upload the required public video with audio, under three minutes.
3. Complete participant, eligibility, IP, and Devpost submission fields.

See [the evidence index](./evidence/README.md) for dated supporting records.
