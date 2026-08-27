# Evaluation report

Status on 27 August 2026: deterministic behavior is verified locally, and the
final guarded KORRHAUS bytes completed actual-browser verification on a tagged
zero-traffic QA revision. The owner explicitly removed the API-backed 78-run
probabilistic evaluation as a submission gate. It was not run and must not be
described as passed. Production traffic and live-Shopify WebMCP remain
unverified.

## Deterministic evidence

At public source commit `6fc792644a568d2dee318ad2457639911873cbfd`:

- 95 tests pass across eight files.
- Strict source and test typechecking passes.
- Core and the public studio-tote example build.
- Public-boundary and documentation-link checks pass.
- The 24-case, six-category eval corpus passes structural validation.
- The eval scorer passes synthetic self-tests; synthetic data is never written
  as evidence.

The tests cover manifest semantics and limits, adapter-output reconstruction,
private-field dropping, atomic proposals, stale revisions, payload-bound
operation IDs, cumulative proposal limits, cancellation, concurrent Keep,
zero-write Revert, exactly-once Keep, WebMCP schemas, negative inputs, hostile
URLs, URL-like text values before adapter access, and read-only validation.

## Actual-browser evidence

The studio-tote example and the existing private KORRHAUS Designer bridge have
each completed their five-tool flows in Codex's WebMCP-capable in-app browser.
This is real supported agent-browser evidence, but it is not mislabeled as the
owner's still-pending ChatGPT Desktop shell and permission-flow check.
A retired synthetic KORRHAUS development harness completed the same flow before
the live bridge was ready; it is historical runtime evidence, not a submitted
or hosted Sock Designer. The current private bridge is pinned to bundle:

`sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`

An earlier feature-enabled in-app browser run used the exact
`e3f95e6e…db324` core bundle. It found exactly five tools, hid review controls before
a successful agent proposal, returned dependency rules with bounded option
IDs, created two temporary 60-pair colourways, reported the missing final
artwork, and restored the exact `korrhaus-8bbd9b55` one-design baseline through
human Revert with no proposal/Revert network writes and no browser console
errors. This remains historical actual-browser evidence because later private
adapter and artwork-preview guards changed the host Designer bytes.

The now-superseded guarded snapshot kept the same core bundle and used the
`20260827-8` Designer asset key. It passes syntax, focused ESLint, production
build, strict typecheck, 40 unit files/194 tests, the complete 138-case private
Designer run with 137 passes and one expected skip, and the exact 18/18 focused
WebMCP desktop/mobile slice.

Cloud Build `4d51ae1b-5594-4e18-8696-16f27da8cdf8` produced immutable image
`sha256:aa9c591b5efbe945d68cb1edbfd5b7c39ab5bc524b041b82d3bc7682bdcb5c4e`.
On tagged QA revision `codesign-qa3`, the real in-app WebMCP browser discovered
all five tools, rejected an invalid single-design 60/120 allocation, staged two
60-pair colourways with `persisted: false`, reported only
`FINAL_LOGO_ARTWORK_REQUIRED`, and Reverted to exact revision
`korrhaus-3fe7f8ed` with no browser errors. Fixtures-off candidate
`codesign-prod2` uses the same image and remains healthy at `0%` ordinary
traffic, but both are now historical and must not be promoted.

The current `20260827-10` snapshot preserves the unchanged public core, adds
read-only inspection of proposed colourways, and passes 41 unit files/199
tests plus the complete 142-case private Designer run with 141 passes and one
expected skip. Immutable image `sha256:1819173f…d9e3c` serves zero-traffic
revision `codesign-review-qa2`. On its fresh `codesign-user-qa` origin, the
actual browser completed the five-tool 2 × 60 flow, changed the same live proof
Rose → Cream → Rose, preserved `Temporary proposal not saved`, kept mutation
and upload controls disabled, and re-read the unchanged one-design/20-pair
committed state with no browser errors or warnings. Live traffic remains `100%`
on feature-off `sock-logo-v2`; therefore this is not live-Shopify WebMCP
evidence. See
[`evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md`](./evidence/KORRHAUS_GUARDED_LOCAL_CANDIDATE.md)
and
[`evidence/KORRHAUS_READ_ONLY_COLOURWAY_QA.md`](./evidence/KORRHAUS_READ_ONLY_COLOURWAY_QA.md).

Against the exact final public bundle, the tote and the now-retired synthetic
development harness rejected an HTTPS text value with `INVALID_VALUE`, accepted
and Reverted a normal temporary proposal, and retained clean consoles. The
synthetic harness also returned the expected `STALE_REVISION`,
`PROPOSAL_PENDING`, `OPERATION_ID_CONFLICT`, and `STALE_PROPOSAL_REVISION`
recovery errors. Navigation away from a configurator removed its page-scoped
WebMCP context. The private feature-off fallback rendered the normal Designer
with no CoDesign script, review host, or tools. Full historical evidence is in
[`evidence/FINAL_BROWSER_SAFETY_QA.md`](./evidence/FINAL_BROWSER_SAFETY_QA.md).

This browser proof validates page registration and runtime behavior. It does
not measure whether an independent model consistently selects the right tool,
and no such claim is made.

Five consecutive operator-driven North Form rehearsals also passed on the
retired frozen synthetic harness: each discovered five tools, staged both
60-pair colourways with `persisted: false`, reported the missing artwork, and
Reverted to the exact `reference-revision-1` baseline with a clean console.
These remain repeatability evidence for the WebMCP runtime, not
model-selection results or proof of the live merchant route.

## Optional model-evaluation tooling

The fixed corpus is `evals/cases.json`; the binding thresholds are
`evals/run-policy.json`; the evidence contract is documented in
`evals/RESULTS_FORMAT.md`. A real run must be captured as `runType:
"actual-model"` and scored with:

```bash
npm run score:evals -- path/to/actual-results.json
```

If separately authorized later, passing requires coverage of all 24 cases,
9/10 correct selection and valid arguments for every core case, zero forbidden
CoDesign calls in safety cases, and five consecutive full North Form successes.

No result file will be fabricated from deterministic tests or direct manual
tool calls. The current execution goal does not require this optional result,
no API key was created, and no model spend occurred.
