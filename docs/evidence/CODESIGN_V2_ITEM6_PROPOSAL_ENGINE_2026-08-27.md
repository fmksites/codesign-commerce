# CoDesign Commerce Item 6 — guarded adapter and proposal transaction engine

Date: 27 August 2026

Branch: `codex/codesign-commerce-v2`

Starting commit: `3ce0696309bbebdc3639434dc2b9c91cd9dc8d3d`

## Result

Item 6 passed locally. The public core now contains the Manifest 2.0 guarded workspace adapter and the replacement proposal transaction engine. The new engine is persistence-capable only through the merchant-supplied adapter and is not yet wired into the tote's transitional WebMCP surface; that migration belongs to Items 7–9.

## Transaction boundary

The implementation now provides:

- Field-by-field guards for merchant workspace, availability, validation, and commit output.
- Opaque private snapshot capture and exact restore.
- Explicit proposal-mode begin/end hooks around temporary work.
- Detached reducer candidates followed by merchant validation and zero-write preview.
- One active proposal, monotonically increasing proposal revisions, and one mutating operation in flight.
- External committed-revision subscription and stale-proposal resynchronization.
- Page-owned `keep()` / `revert()` transaction methods; no WebMCP save tool.
- Pre-write compare-and-swap metadata and proposal-ID commit idempotency contract.
- Distinct retryable server-save and unknown-outcome states.
- Cancellation and teardown paths that never save temporary work.

Public errors use bounded generic messages and do not echo rejected identifiers or private adapter exceptions.

## Defects found during verification

Review exposed three transaction defects before the item was accepted:

1. The operation ledger initially recorded a candidate before merchant validation/rendering. A cancelled or invalid refinement could therefore consume its operation ID. The engine now applies each candidate on a fork and promotes that ledger only after validation and preview succeed.
2. A partially failing `beginProposalMode()` hook could have left merchant proposal mode open without an exact restore. The engine now stores the private snapshot and active transaction before calling that hook, so failure closes safely.
3. A pre-commit revision-read failure was initially classified as an unknown commit outcome even though no write had started. It now stays reviewable and returns a retryable adapter failure; only failures after `commitWorkspace()` begins enter `commit-uncertain`.

A failed exact restore now quarantines the session as stale instead of clearing it and pretending the page returned safely to idle.

## Deterministic coverage

Focused workspace-adapter, proposal-engine, and operation coverage passed 3 files / 37 tests. It covers:

- Output reconstruction and private-field stripping.
- Malformed nested output and impossible commit-result rejection.
- First proposal, refinement, Revert, teardown, and successful Keep.
- Invalid-first exact restore and invalid-refinement preservation.
- External changes after quiesce, read, snapshot, begin, validation, and preview boundaries.
- Cancellation at the same six boundaries.
- Cancellation during refinement followed by a successful exact operation-ID retry.
- One mutation in flight and concurrent duplicate Keep exclusion.
- Public error non-disclosure.
- Expected server failure with one local write across retry.
- Unknown commit outcome with no automatic or manual second commit attempt.
- Failed pre-commit read with safe deliberate retry.
- Failed restore quarantine and committed-state resynchronization.

## Full verification

- Full Vitest suite: 17 files / 148 tests passed.
- Strict workspace typecheck: passed.
- Production core, studio-tote, and judge-site builds: passed.
- Browser-bundle verification: passed.
- Public-boundary scan: passed for 147 candidates.
- Tote control parity: 16/16 inventory entries accounted for.
- Documentation link check: passed for 58 files.
- Judge-site hash check: passed.
- Eval corpus and scorer self-test: passed for 24 cases.
- `git diff --check`: passed.

Artifact hash before the Item 6 commit:

- Core browser bundle: `sha256:aa7da80bd5b612bc49cead624f25d33ce15438b28065dfb7b1e952fe887c2e40`
- Tote JavaScript bundle: `sha256:7894b2f7bb24c099a5ec4580f091e2ca48e81d00bc072ab4934e8526435992b8`

The actual in-app browser reloaded the ordinary local tote after the build: its title and visual configurator remained intact, 20 interactive controls were present, no proposal panel appeared without an agent proposal, and the 1280-pixel viewport had no horizontal overflow. This is a regression check only because the new engine is intentionally not connected to the tote until Items 7–9.

No private KORRHAUS file was inspected or modified. Nothing was deployed, published, promoted, or submitted.
