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
suite passed 13 tests, followed by private typecheck and production build.

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
model-eval pass, or completed final private Playwright suite.
