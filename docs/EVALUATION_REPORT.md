# Evaluation report

Status on 27 August 2026: deterministic and actual-browser behavior are
verified locally. The owner explicitly removed the API-backed 78-run
probabilistic evaluation as a submission gate. It was not run and must not be
described as passed.

## Deterministic evidence

At public source commit `6fc792644a568d2dee318ad2457639911873cbfd`:

- 95 tests pass across eight files.
- Strict source and test typechecking passes.
- Core and both public examples build.
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

The public KORRHAUS reference, the studio-tote example, and the local private
KORRHAUS bridge have each completed their five-tool flows in ChatGPT's WebMCP-
capable in-app browser. The current private bridge is pinned to bundle:

`sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`

The feature-enabled private browser run used the exact current
`e3f95e6e…db324` bundle. It found exactly five tools, hid review controls before
a successful agent proposal, returned dependency rules with bounded option
IDs, created two temporary 60-pair colourways, reported the missing final
artwork, and restored the exact `korrhaus-8bbd9b55` one-design baseline through
human Revert with no proposal/Revert network writes and no browser console
errors. The same bytes pass 13 focused tests, typecheck, production build, the
feature-disabled actual-browser fallback, and the complete private Designer
suite with 95 passes and one intentional desktop skip of a mobile-only case.

Against the exact final public bundle, both public examples rejected an HTTPS
text value with `INVALID_VALUE`, accepted and Reverted a normal temporary
proposal, and retained clean consoles. The KORRHAUS reference also returned the
expected `STALE_REVISION`, `PROPOSAL_PENDING`, `OPERATION_ID_CONFLICT`, and
`STALE_PROPOSAL_REVISION` recovery errors. Navigation away from the
configurator removed its page-scoped WebMCP context. The private feature-off
fallback rendered the normal Designer with no CoDesign script, review host, or
tools. Full evidence is in
[`evidence/FINAL_BROWSER_SAFETY_QA.md`](./evidence/FINAL_BROWSER_SAFETY_QA.md).

This browser proof validates page registration and runtime behavior. It does
not measure whether an independent model consistently selects the right tool,
and no such claim is made.

Five consecutive operator-driven North Form rehearsals also passed on the
frozen public KORRHAUS build: each discovered five tools, staged both 60-pair
colourways with `persisted: false`, reported the missing artwork, and Reverted
to the exact `reference-revision-1` baseline with a clean console. These are
repeatability evidence for the WebMCP runtime, not model-selection results.

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
