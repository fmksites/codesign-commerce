# Security hardening evidence

> Topology note: build references to both examples describe the repository at
> the time of this dated scan. The synthetic KORRHAUS UI was later retired; the
> core security findings and remediations remain applicable.

Date: 26 August 2026  
Reviewed source: `37b7dbc83e12e8b3d0b1518e7b08845eb335a004`  
Remediation commit: `2f7235b8f9b03f7033ffbe75ca6f9653667b9622`  
Security scan ID: `bca919ab-edcb-4964-a7bb-0a0c61b479fe`

## Outcome

The complete public repository scan reported two high-confidence,
low-severity findings. Both are fixed in the remediation commit. The work also
closed adjacent proposal-boundary abuse cases found while reviewing bypasses.
No public deployment, private production activation, or traffic change was
part of this evidence.

## Runtime output boundary

Finding `csf_4f93835e717d8975a5a8dd55` identified that TypeScript alone did not
remove undeclared merchant-adapter fields before a result reached WebMCP.

`GuardedConfiguratorAdapter` now reconstructs these adapter outputs into fresh,
bounded public objects:

- configuration state and nested designs, selections, and assets;
- option availability and manifest-owned public value metadata;
- validation issues, references, messages, and assumptions;
- cloned design state; and
- commit results.

Unknown values, invalid references, oversized output, and malformed canonical
fields fail closed. WebMCP read and list handlers return a generic
`ADAPTER_FAILURE`; the offending value and adapter stack are not returned.
The tool factory uses only the session's detached, validated manifest and
guarded adapter, so a second poisoned dependency object cannot bypass the
boundary.

Regression tests place `supplierCost`, `margin`, tokens, raw URLs, and nested
secret fields into otherwise structurally compatible adapter output. The
public result contains none of them. Malformed output produces only the
sanitized error.

## Stale proposal and Keep boundary

Finding `csf_eb661c338af72042051bec47` identified a race in which an external
revision could arrive during asynchronous proposal work and remain eligible
for Keep.

The proposal engine now:

1. checks the observed external revision after every relevant asynchronous
   adapter boundary;
2. re-reads committed state immediately before the first Keep;
3. passes the original `baseRevision` to `commitState()`; and
4. requires an adapter compare-and-swap before its first local write.

A mismatch returns a zero-write `STALE_REVISION`, discards the temporary
proposal, and restores the latest committed state. Tests cover a revision
arriving while validation is paused and a revision injected immediately before
the adapter commit boundary.

## Adjacent controls

- A successful operation ID is bound to the exact operation kind and payload.
  Reuse with a different payload returns `OPERATION_ID_CONFLICT` without
  another preview or write.
- One pending proposal is capped at 20 successful operations and 20 unique
  assumptions.
- Exact same-ID/same-payload retries remain idempotent.
- A failed server save can still be retried by a human without repeating the
  local write.

## Clean-clone verification

A `git clone --no-local` of remediation commit `2f7235b` in a fresh temporary
directory passed from an empty build state:

| Gate | Result |
|---|---|
| `npm ci` | PASS — 129 packages installed from the committed lockfile |
| `npm test -- --reporter=dot` | PASS — 8 files, 73 tests |
| `npm run typecheck` | PASS — all workspaces and strict core tests |
| `npm run build` | PASS — core module/browser bundles and both examples |
| `npm run check:public-boundary` | PASS — 91 tracked public candidates |
| `npm run check:docs` | PASS — 28 Markdown files |
| `npm run check:evals` | PASS — corpus structure only, 24 cases in 6 categories |
| `npm run verify:browser-bundle` | PASS — `sha256:dc8d6180ba6bcdd426d735abe7dc73a8854559b05950b91936f57ee10d33ee1b` |
| Final `git status --short` | PASS — empty |

The browser source map is
`sha256:05a189e528bf4c80067c53d8e45543cac5ddfe0f373c50dea5b6a9a02314e08f`.

## Local private flagship verification

The exact public browser bundle was copied into the approved local,
disabled-by-default KORRHAUS bridge. The private bundle hash matches the clean
public build byte for byte.

The private focused page suite passed 13 tests. Private strict typecheck and
the production build passed. In the actual WebMCP-capable in-app browser, the
local flagged page then proved:

- the pinned script URL ends in `codesign-commerce.js?v=dc8d6180`;
- exactly five CoDesign tools were discovered;
- the review surface was hidden before a successful proposal;
- a valid proposal visibly changed the design name, body, and accent while
  returning `persisted: false`;
- conflicting reuse of `security-hardening-browser-2` returned
  `OPERATION_ID_CONFLICT` without changing the proposal;
- human Revert restored `Design 1`, 20 pairs, and revision
  `korrhaus-e7beb274`; and
- the final browser console contained no errors or warnings.

The review surface intentionally remains visible with a short “Proposal
reverted. Nothing was saved.” outcome after Revert. It appeared only because an
agent had first created a successful proposal, preserving the normal
human-only Designer surface.

## Residual boundary

Runtime shape reconstruction prevents accidental extra-field leakage. It
cannot determine whether a merchant deliberately encodes confidential content
inside a declared public text field such as a design name, validation message,
or revision identifier. The integration contract therefore still requires a
narrow, reviewed private mapping that never supplies such data to the public
canonical model.

This is local source and actual-browser evidence. Hosted deployment and live
production verification remain separate approval-gated phases.
