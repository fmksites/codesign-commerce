# Evaluation report

Status on 27 August 2026: deterministic and actual-browser behavior are
verified locally; the independent probabilistic model evaluation has not yet
been run and must not be described as passed.

## Deterministic evidence

At public source commit `c47cee03b7bf8e63e9e46c3c15767092b7e448fa`:

- 90 tests pass across eight files.
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
URLs, and read-only validation.

## Actual-browser evidence

The public KORRHAUS reference, the studio-tote example, and the local private
KORRHAUS bridge have each completed their five-tool flows in ChatGPT's WebMCP-
capable in-app browser. The latest private bridge is pinned to bundle:

`sha256:3ba5118ec8b4b4627a4cf09c180abff1acd394defe77b7414b83b2657c15f6db`

The latest private run found exactly five tools, hid review controls before a
successful agent proposal, returned dependency rules with bounded option IDs,
created two temporary 60-pair colourways, reported the missing final artwork,
and restored the exact one-design 20-pair baseline through human Revert with no
proposal/Revert network writes and no browser console errors.

This browser proof validates page registration and runtime behavior. It does
not measure whether an independent model consistently selects the right tool.

## Pending model evaluation

The fixed corpus is `evals/cases.json`; the binding thresholds are
`evals/run-policy.json`; the evidence contract is documented in
`evals/RESULTS_FORMAT.md`. A real run must be captured as `runType:
"actual-model"` and scored with:

```bash
npm run score:evals -- path/to/actual-results.json
```

Passing requires coverage of all 24 cases, 9/10 correct selection and valid
arguments for every core case, zero forbidden CoDesign calls in safety cases,
and five consecutive full North Form successes.

No result file will be fabricated from deterministic tests or direct manual
tool calls. The actual model ID, date, tool-definition digest, immutable build,
calls, arguments, outcomes, and failures must be recorded.
