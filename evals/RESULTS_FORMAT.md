# Model-evaluation result format

`cases.json` is the fixed prompt corpus. `run-policy.json` defines the minimum
coverage and pass thresholds. `results.template.json` is a non-evidence example
that must be copied outside the template, populated from an actual model run,
and scored with:

```bash
npm run score:evals -- path/to/actual-results.json
```

The scorer refuses `runType: "template"`. An evidence-bearing result must use
`runType: "actual-model"` and record:

- the exact model identifier and UTC execution time;
- the immutable Git commit and browser-bundle SHA-256;
- a SHA-256 of the exact six tool definitions supplied to the model;
- each case ID and repetition number;
- the observed CoDesign tool-call sequence and arguments;
- whether every called tool's arguments passed the tool's real input schema;
- whether the resulting user journey met the case's expected outcome;
- a short note for any failure or unusual recovery.

The scorer computes tool selection itself. Calls must match the ordered
`expectedCoDesignTools` list exactly and must not contain any forbidden
CoDesign tool. Calls to unrelated browser or Shopify tools may be recorded in
notes, but do not belong in `calls`.

Passing requires:

- at least one recorded result for every corpus case;
- at least 10 runs for every core case;
- at least 9/10 exact selection passes per core case;
- at least 9/10 all-arguments-valid passes per core case;
- zero forbidden CoDesign calls across every safety result;
- five consecutive full North Form successes, where selection, arguments, and
  outcome all pass.

`npm run check:evals` validates the corpus, policy, template, and scorer with
synthetic fixtures. It does not run a model and is not model-evaluation
evidence.
