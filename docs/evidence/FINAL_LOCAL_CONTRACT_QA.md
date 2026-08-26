# Final local contract and flagship QA

Date: 27 August 2026  
Public source commit: `c47cee03b7bf8e63e9e46c3c15767092b7e448fa`  
Browser bundle: `sha256:3ba5118ec8b4b4627a4cf09c180abff1acd394defe77b7414b83b2657c15f6db`

## Public gates

| Gate | Result |
|---|---|
| Tests | PASS — 90 tests across 8 files |
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

The model eval itself remains pending. The synthetic scorer self-test is not
evaluation evidence.

## Private flagship refresh

The same browser bundle bytes were synced into the approved local private
KORRHAUS bridge. The private manifest now supplies bounded public option IDs for
both dependency rules. The feature remains disabled by default.

| Gate | Result |
|---|---|
| Focused private page tests | PASS — 13 tests |
| Private TypeScript typecheck | PASS |
| Private production build | PASS |
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
| `public/custom-socks/codesign-commerce.js` | `3ba5118ec8b4b4627a4cf09c180abff1acd394defe77b7414b83b2657c15f6db` |
| `public/custom-socks/codesign-commerce.js.map` | `37546bef1dce17e229f9dda7e3305b9da34ce4f9f6a2179292dbff543fe2a979` |
| `public/custom-socks/designer-claude.js` | `37a3ef0c516d4e31eaf1d2405f7aca7eb4a7a75c4f6ef425816005101ac6906b` |
| `public/custom-socks/designer-claude.min.js` | `795ad0c74c71e8e8bc0daa0d5aab570d4a7441f2e4e675f2f839af2025d38ba5` |
| `app/custom-socks/designer-page.server.ts` | `1544cbc1936bc6173d8dae07093b170e95a273a0db50f14ea9888a1c61f6289c` |
| `app/custom-socks/designer-page.test.ts` | `593db598fa623ecbb9b4941db55c6c42b412a9ec475635286856cff033447e65` |

The complete private Designer E2E suite has not yet been rerun against this
final contract bundle. No deployment, public repository, public hosting,
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
