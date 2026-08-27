# Public repository release evidence

## Guarded flagship evidence update — active companion evidence

Commit `3c14a005ff126399a875873928a378ee22085384` publishes the final guarded
private-snapshot hashes, immutable-image and zero-traffic proof, corrected live
rollback baseline, service-template safety hold, and the explicit distinction
between on-page WebMCP capability and traffic acquisition. It does not publish
private application source or a second KORRHAUS Designer.

The commit passed hosted CI in
<https://github.com/fmksites/codesign-commerce/actions/runs/33073677187>.
That exact run installed dependencies, passed 95 tests, strict typecheck,
production build, exact browser-bundle verification, judge-site verification,
the 110-candidate public-boundary scan, the 43-file documentation-link scan,
and eval-corpus/scorer checks.

Fresh unauthenticated checks confirmed that the exact commit is reachable, its
README, guarded zero-traffic evidence, and discovery/distribution document
return `200`, and `examples/korrhaus-reference/` returns `404`. This update
does not prove or authorize production traffic, live-Shopify WebMCP,
judge-site hosting, video publication, or Devpost submission.

## Corrected topology release — active evidence

The corrected public topology is published at
<https://github.com/fmksites/codesign-commerce>. Commit
`485060654fb9c209df6f7614006875b55d375947` is publicly reachable as `main` and
passed hosted CI in
<https://github.com/fmksites/codesign-commerce/actions/runs/33062478946>.

Fresh unauthenticated checks confirmed:

- repository visibility is public, the default branch is `main`, and GitHub
  detects `Apache-2.0`;
- the remote `main` ref resolves to the exact commit above;
- the raw README and five-tool WebMCP source are accessible;
- the exact public tree contains `examples/studio-tote/`, the judge landing,
  and `packages/codesign-commerce/src/webmcp.ts`;
- the retired `examples/korrhaus-reference/` tree is absent; and
- the source contains exactly the intended read, list-options, propose,
  create-design, and validate tool registrations.

The exact final commit was also cloned without local-object shortcuts into
`/private/tmp/codesign-final-topology.AelRWu/repo`. From an empty dependency and
build state it installed 128 packages and passed 95 tests, strict typecheck,
build, exact bundle verification, judge-site, public-boundary, docs, and eval
checks, `git diff --check`, and an empty final Git status. The generated
non-release metadata names commit `485060654fb9c209df6f7614006875b55d375947`,
withholds both release URLs, and marks both release flags `false`.

This proves the corrected public source release and reproducibility. It does
not prove or authorize KORRHAUS production traffic, judge-site hosting, video
publication, or Devpost submission.

## Superseded initial public release

The remainder records the earlier successful public-source release that still
included the synthetic KORRHAUS reference. It is historical and must not be
used as final submission-release evidence.

Date: 27 August 2026

## Published surface

- Repository: <https://github.com/fmksites/codesign-commerce>
- Owner: `fmksites`
- Visibility: `PUBLIC`
- Default branch: `main`
- Published commit: `1c58b37bcd4cbc764ac4b0c436aaa8d649cccb0f`
- License detected by GitHub: `Apache License 2.0` (`apache-2.0`)
- Hosted CI run: <https://github.com/fmksites/codesign-commerce/actions/runs/33047195545>
- CI result: `success` on the published commit above

## Pre-publication gate

Immediately before publication, the local release candidate passed:

- 95 deterministic tests across 8 files;
- strict workspace and test typechecking;
- all workspace builds and judge-site assembly;
- the 113-file public-boundary check;
- the 38-file documentation-link check;
- judge-site artifact verification;
- the 24-case, 6-category eval-corpus/scorer self-test; and
- exact browser-bundle verification at
  `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`.

The worktree was clean at the published commit.

## Public-access verification

Unauthenticated HTTPS requests returned `200` for:

- the repository page;
- the raw `README.md`; and
- the raw root `LICENSE`.

The raw public source at
`packages/codesign-commerce/src/webmcp.ts` exposes the five intended tool names
and contains the real `document.modelContext.registerTool(...)` registration
path. GitHub's public contents API exposes the adapter, manifest, proposal,
review, and WebMCP source files.

## Boundary

This evidence proves public source publication, license detection, reproducible
CI, and unauthenticated source availability. It does not prove or authorize a
hosted judge site, KORRHAUS Cloud Run deployment, production traffic, video
publication, or Devpost submission.
