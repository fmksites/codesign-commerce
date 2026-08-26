# Final local contract and flagship QA

Date: 27 August 2026
Public source commit: `6fc792644a568d2dee318ad2457639911873cbfd`
Browser bundle: `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`

## Public gates

| Gate | Result |
|---|---|
| Tests | PASS — 95 tests across 8 files |
| Strict typecheck | PASS |
| Core and both example builds | PASS |
| Public-boundary scan | PASS — 96 candidates before this evidence file |
| Documentation links | PASS — 30 Markdown files before submission drafts |
| Eval corpus/policy/template/scorer check | PASS — 24 cases, 6 categories, synthetic scorer self-test only |
| Git diff whitespace check | PASS |

New coverage closes manifest collection bounds, kind-specific bounds,
dependency references, combined adapter/agent assumption limits, cancellation
before adapter access, concurrent duplicate Keep, hostile/private change fields,
oversized tool inputs, arbitrary artwork URLs, sanitized adapter exceptions,
and read-only validation of committed and proposed state.

The final browser safety pass additionally rejects URL-like text values before
adapter access and preserves the state-machine precedence for pending,
conflicting, and stale proposal operations. See
[`FINAL_BROWSER_SAFETY_QA.md`](./FINAL_BROWSER_SAFETY_QA.md).

The model eval itself remains pending. The synthetic scorer self-test is not
evaluation evidence.

## Clean-clone reproducibility

Evidence commit `25e24a35dc324c4f53c3c6f99dd2f0e8426824fa` was cloned with
`git clone --no-local` into `/private/tmp/codesign-final-clean.HDp0ka/repo`.
From an empty dependency/build state the clone installed 129 packages and
passed 90 tests, strict typecheck, all three builds, browser-bundle verification,
the 102-file public-boundary check, 36-file documentation check, and the
24-case eval policy/scorer check. The rebuilt bundle matched
`sha256:3ba5118ec8b4b4627a4cf09c180abff1acd394defe77b7414b83b2657c15f6db`,
and the final clean-clone Git status was empty.

## Private flagship refresh

The same `e3f95e6e…db324` browser-bundle bytes were synced into the approved
local private KORRHAUS bridge. The private manifest supplies bounded public
option IDs for both dependency rules. The feature remains disabled by default.

Current byte-exact private gates are:

| Gate | Result |
|---|---|
| Focused private page tests | PASS — 13 tests |
| Private TypeScript typecheck | PASS |
| Private production build | PASS |
| Feature-off actual-browser fallback | PASS — normal UI, no CoDesign script, review host, tools, or console errors |

The latest feature-enabled private actual-browser run used the immediately
preceding `3ba5118e…f6db` bundle and recorded:

| Gate | Result |
|---|---|
| In-app-browser tools | PASS — exactly 5 |
| Review before successful proposal | PASS — hidden |
| Public dependency references | PASS — quantities and artwork option IDs only |
| Two-colourway proposal | PASS — two 60-pair designs, `persisted: false` |
| Validation | PASS — coherent, not production-ready, final artwork missing |
| Human Revert | PASS — exact `korrhaus-8a39d439` one-design/20-pair baseline |
| Proposal and Revert network trace | PASS — no new server requests after the normal human baseline save |
| Browser console | PASS — no errors or warnings |

The first attempted sequence deliberately demonstrated atomic rule enforcement:
setting the order total to 120 before creating the second 60-pair design failed
closed with `INVALID_VALUE` and no proposal. The valid sequence stages a 60-pair
single design first, then atomically creates the second design while changing
the total to 120.

## Current private hashes

| File | SHA-256 |
|---|---|
| `public/custom-socks/codesign-commerce.js` | `e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324` |
| `public/custom-socks/codesign-commerce.js.map` | `de627487e16297310a3499a6ab3020361a28fbee6a33af033f7c2f4e4deece1a` |
| `public/custom-socks/designer-claude.js` | `37a3ef0c516d4e31eaf1d2405f7aca7eb4a7a75c4f6ef425816005101ac6906b` |
| `public/custom-socks/designer-claude.min.js` | `795ad0c74c71e8e8bc0daa0d5aab570d4a7441f2e4e675f2f839af2025d38ba5` |
| `app/custom-socks/designer-page.server.ts` | `3fa88662ce0e1479a3d20c0ff7ee38d8e78a1f39096839483bb1363af1826859` |
| `app/custom-socks/designer-page.test.ts` | `f6837c8f12ee6b1ae150b121e4d697d00db8b61173f37a9c85e9ebc9983dc857` |

The complete private Designer E2E suite and feature-enabled private browser
flow have not yet been rerun against the current `e3f95e6e…db324` contract
bundle. No deployment, public repository, public hosting,
production activation, traffic change, DNS change, video upload, or Devpost
submission occurred.

The fresh-origin check intentionally separated the normal human Route 02
baseline save from the agent transaction. The server recorded the normal
pre-proposal save, then recorded no request during the complete five-tool
proposal and no request during Revert.

## Final built public examples

Both Vite production outputs were served locally as immutable build artifacts,
not through hot reload. The in-app browser independently discovered exactly
five tools on each origin.

- The KORRHAUS reference created `North Form Cream` and `North Form Rose` at 60
  pairs each, returned `persisted: false`, reported final logo artwork missing,
  showed human Keep/Revert, and Reverted to `reference-revision-1`.
- The studio tote created `Natural long-handle` and `Charcoal short-handle` at
  50 each, returned `persisted: false`, reported final print artwork missing,
  showed human Keep/Revert, and Reverted to `tote-revision-1`.
- Both consoles remained free of errors and warnings.
