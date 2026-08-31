# Guarded adapter and proposal transaction engine

CoDesign WebMCP separates temporary agent design work from merchant persistence. The public core can construct, validate, and visibly preview a proposal, but only the merchant adapter can restore private state or persist a shopper-confirmed Keep.

The Manifest 2.0 transaction path is:

```text
committed merchant state
  -> quiesce pending persistence
  -> capture private snapshot
  -> enter proposal mode
  -> reduce operations on a detached public workspace
  -> merchant validation
  -> zero-write merchant preview
  -> shopper inspects Keep / Revert
```

No WebMCP save tool is created by this engine. The shipped page review controller calls `keep()` only through the visible confirmation boundary and disables it until the exact current renderer preview is available.

## Merchant adapter contract

`WorkspaceAdapter<Snapshot, PrivateAsset>` is deliberately narrow. An integration owns:

- Reading a detached public `WorkspaceState`.
- Listing public control availability.
- Settling pending normal persistence before a proposal opens.
- Capturing and restoring an opaque private snapshot.
- Enabling and ending explicit proposal mode.
- Validating and rendering through the merchant's real rules and renderer.
- Committing through one proposal-ID-idempotent compare-and-swap path.
- Emitting committed revisions from human, backend, or other-tab changes.

The private `Snapshot` is never inspected, serialized, or returned by the core.

`GuardedWorkspaceAdapter` treats merchant output as untrusted. It reconstructs workspace, availability, validation, and commit results field by field. Unknown safe fields are dropped; malformed structures, unsafe identifiers, undeclared values, invalid references, and impossible commit outcomes fail with a generic adapter-boundary error. Raw private exceptions and stack traces do not cross the public boundary.

## Proposal lifecycle

`ProposalEngine` permits one open proposal and one mutating operation at a time.

```text
idle -> building -> validating -> rendering -> reviewable
                                                |      |
                                  capture exact preview  Revert
                                                |        |
                                           reviewable   idle
                                                |
                                               Keep
                                                |
                                           committing
                                             |       |
                                    commit-retry  commit-uncertain

any open temporary state + external committed revision -> stale -> resynchronize -> idle
```

Each accepted batch increments `proposalRevision`. A refinement must supply the current proposal ID, proposal revision, and original committed revision. Old identifiers fail without mutation.

The operation reducer is forked for every candidate. Its operation-ID ledger and successful-operation budget are promoted only after merchant validation and visible rendering both succeed. A rejected, cancelled, or failed refinement therefore cannot consume an operation ID or later masquerade as a deduplicated success.

## Restore and failure rules

- Invalid first proposal: restore the exact private snapshot and end proposal mode.
- Invalid refinement: leave the last inspected proposal visible and reviewable.
- Preview failure or cancelled refinement: re-render the last inspected proposal.
- Revert: restore the snapshot, end proposal mode, and perform no commit.
- Restore failure: retain a quarantined `stale` session until committed state can be reread and rendered; never pretend the page is safe.
- External revision: block Keep, discard the proposal, and render the newest committed workspace.
- Teardown before Keep: restore and end without saving.

Every awaited step in the open/validate/render path is followed by cancellation and external-revision checks. The eventual WebMCP registry supplies the shared abort signal; the engine also rejects work after its own teardown.

## Keep semantics

Before the first write, `keep()` rereads the committed workspace and compares its opaque revision with the proposal base revision. Only then does it call `commitWorkspace()` with:

- The proposal ID.
- The base committed revision.
- Every accepted operation ID.
- The fixed trigger `confirmed_page_keep`.

A concurrent or duplicate Keep cannot cross the commit boundary twice. The adapter must also enforce proposal-ID idempotency because it owns the actual persistence system.

Commit outcomes remain explicit:

- Local and server success: close proposal mode and return the saved revision.
- Expected server failure after one local write: enter `commit-retry`; a deliberate retry reuses the same proposal ID and must not repeat the local write.
- Exception or unverifiable outcome after commit begins: enter `commit-uncertain`; never retry automatically or claim success.
- Failure while performing the pre-commit revision read: stay reviewable and retryable because no commit was attempted.

## Integration status

The complete public studio-tote product uses this engine, `AssetSandbox`,
`PreviewBridge`, the exact six-tool registry, and one shared review controller.
Native Chrome and the Codex in-app browser have executed its two-variant
actual-artwork flow with zero writes before the visible page Keep boundary.
After explicit owner approval, the private KORRHAUS Designer also integrated
the same engine and exact-six runtime through its full Route 02 control
inventory. That adapter is now live on the existing Shopify storefront. Its
production renderer, autosave, customer state, persistence, pricing, and
commerce paths remain merchant-owned and outside this repository.
