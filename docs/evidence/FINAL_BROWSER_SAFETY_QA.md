# Final browser safety and fallback QA

Date: 27 August 2026
Public source commit: `6fc792644a568d2dee318ad2457639911873cbfd`
Browser bundle: `sha256:e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324`

## Why this pass was added

An actual-browser negative call found that a URL-shaped string could be staged
as a text option value even though the documented tool boundary disallows
external references. The proposal remained temporary and did not fetch, save,
or expose data, but the runtime and documentation did not agree.

The shared text-option validator now rejects HTTP, HTTPS, FTP, file, data,
JavaScript, blob, protocol-relative, and `www.` external-reference forms. The
transaction engine performs this value preflight before it quiesces persistence
or asks an adapter to read or preview state. Existing pending-proposal and
operation-ID precedence remains unchanged.

## Deterministic result

| Gate | Result |
|---|---|
| Tests | PASS — 95 tests across 8 files |
| Strict typecheck | PASS |
| Core and both example builds | PASS |
| Browser-bundle verification | PASS — exact digest above |
| Public-boundary check | PASS — 103 public candidates including this evidence file |
| Documentation links | PASS — 37 Markdown files including this evidence file |
| Eval corpus and scorer self-test | PASS — 24 cases across 6 categories; no synthetic result saved |

Five regression cases cover HTTPS, `www.`, data, JavaScript, and file-shaped
values. Each returns `INVALID_VALUE` with zero quiesce, preview, local-write, or
server-write calls.

The rebuilt bytes were synced into the approved local, disabled-by-default
KORRHAUS bridge as `codesign-commerce.js?v=e3f95e6e`. The private focused page
suite passed 13 tests, followed by private typecheck and production build. The
complete private Designer Playwright suite then passed 95 tests with one
intentional desktop skip of a mobile-only overflow case.

## Final actual-browser results

The production-built KORRHAUS public reference exposed exactly five tools. On
its canonical `reference-revision-1` baseline:

- an HTTPS value returned `INVALID_VALUE` and `persisted: false`;
- a stale committed revision returned `STALE_REVISION` with the current
  revision;
- a valid proposal returned `persisted: false` and opened the human review;
- an unrelated proposal returned `PROPOSAL_PENDING`;
- conflicting reuse of the operation ID returned `OPERATION_ID_CONFLICT`;
- extension with proposal revision `99` returned
  `STALE_PROPOSAL_REVISION`;
- human Revert removed the pending proposal and restored
  `reference-revision-1`;
- the browser console remained empty.

The production-built studio-tote reference also exposed exactly five tools,
rejected the HTTPS value, accepted a normal temporary proposal, Reverted to
`tote-revision-1`, and produced no console errors or warnings.

A separate page-lifecycle check discovered five tools on the KORRHAUS
configurator, navigated the same tab to `about:blank`, and then could no longer
obtain a page origin or WebMCP tool context. This proves the registrations do
not survive navigation outside the configurator document.

## Feature-enabled private flagship

The local private KORRHAUS production build was also started with synthetic
acceptance fixtures and the feature flag explicitly enabled. The exact current
`e3f95e6e…db324` bundle:

- exposed exactly five tools and no review UI before a successful proposal;
- listed only public allowed values and public dependency option IDs;
- staged `North Form Cream`, created `North Form Rose`, and kept both at 60
  pairs with `persisted: false`;
- validated the 120-pair configuration as coherent but not production-ready
  because final logo artwork was missing;
- exposed human Keep/Revert only after proposal success; and
- human-Reverted to exact committed revision `korrhaus-8bbd9b55`, one design,
  and no pending proposal.

There were no proposal, creation, validation, or Revert server requests after
the normal human baseline, and the browser console remained empty. The visible
post-Revert outcome explicitly states that nothing was saved.

Five consecutive operator-driven rehearsals of the same North Form flow also
passed against the frozen public build, each ending at exact baseline
`reference-revision-1` with no pending proposal and an empty console. These are
runtime repeatability checks, not model-evaluation results.

## Feature-disabled fallback

The private KORRHAUS production build was started locally with synthetic
acceptance fixtures and
`CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED=false`. The ordinary Designer route
returned HTTP 200 and retained its eight normal route controls. The rendered
document contained:

- zero CoDesign browser scripts;
- zero proposal-review hosts;
- zero WebMCP tools; and
- zero browser-console entries.

This is local browser evidence only. It does not authorize or imply a private
deployment, production enablement, public release, optional independent
model-eval pass, video publication, or Devpost submission.

## Connected native Chrome fallback

The frozen public KORRHAUS artifact also loaded in the connected native Chrome
profile from its deterministic reset URL. That profile did not expose
`document.modelContext`, so this was deliberately recorded as a normal-browser
fallback check rather than a WebMCP tool-discovery pass. The page showed the
single baseline design, loaded all images, kept Keep/Revert hidden, and produced
no console warnings or errors. Feature-enabled WebMCP discovery remains proven
in the supported in-app browser; it must be repeated on the deployed URL and
may additionally be repeated in Chrome 149+ with its testing flag enabled.
