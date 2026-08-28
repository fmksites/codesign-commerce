# Temporary assets and revision-bound previews

CoDesign Commerce lets an agent work with supplied artwork without turning a proposal into a normal merchant upload. The public core validates the transport and owns opaque, expiring handles. The merchant adapter owns the decoded temporary resource, product-specific sanitization, rendering, and the exact import that may occur only inside a shopper-confirmed page Keep.

This is a lifecycle and safety contract, not an image editor, universal product renderer, vectorizer, or print-preparation service.

## Boundary at a glance

```text
bounded data URL or approved HTTPS URL
  -> core source and byte policy
  -> merchant stageAsset(bytes)
  -> opaque temporary handle
  -> proposal-bound AssetResolver
  -> merchant validate/preview/capture
  -> revision-bound preview receipt
  -> visible page Keep or Revert

Keep   -> merchant imports the exact resolved temporary asset once
Revert -> merchant releases it without an upload or save
```

Tool-facing results contain only the opaque handle, declared slot, sanitized filename and alt text, media metadata, byte length, SHA-256 integrity, expiry, and `persisted: false`. Raw source strings, bytes, merchant objects, file paths, private storage URLs, and adapter exceptions are never returned.

## Manifest policy

Every asset control names one manifest `assetSlotId`. The slot declares:

- Whether `data-url`, `https-url`, or both are accepted.
- The exact accepted image media types.
- Maximum source characters and decoded bytes.
- The workspace, variant, or element scope that may reference the handle.

The core also caps one browser session at 20 temporary assets and 5 MB in total. A handle expires after 30 minutes by default; integrations may choose a shorter duration, but never more than 24 hours.

## Staging contract

`AssetSandbox.stage()` performs these steps before a proposal is changed:

1. Runtime-validates every input field and rejects unknown fields.
2. Confirms the requested slot and source kind exist in the manifest.
3. Bounds the source before decoding or fetching it.
4. Checks the declared media type and raster magic bytes. SVG input receives a conservative active-content precheck.
5. Computes SHA-256 over the supplied bytes.
6. Passes a copy of the bytes and bounded metadata to `AssetStagingAdapter.stageAsset()`.
7. Reconstructs the adapter response into an opaque receipt and stores the private adapter asset only inside the sandbox.

The adapter must fully decode and sanitize the product-specific asset before returning it. SVG allowlisting, rasterization, vectorization, metadata stripping, color conversion, background removal, resolution rules, and print preparation belong there. The core's SVG precheck rejects obvious active content but is not a complete SVG sanitizer.

If the adapter returns malformed metadata or staging fails after it created a private resource, the core calls `releaseAsset()` and returns a generic failure.

## Remote-source policy

HTTPS sources are disabled unless the manifest permits them and the host supplies `validateRemoteUrl`. This is deliberate: syntax checks alone cannot prevent DNS rebinding or a public hostname resolving to a private address.

The core always rejects credentials, fragments, HTTP, localhost-style names, literal private/link-local IPv4, literal private/link-local IPv6, and redirects. It fetches with credentials omitted, no referrer, no cache, and manual redirects. The host callback must additionally enforce its own allowlist or resolve the hostname and reject every non-public address immediately before the request. Callback failures are sanitized.

A browser-hosted integration must also satisfy CORS. Merchants that do not have a DNS-aware policy should expose only bounded data URLs or use a separately reviewed same-origin ingestion path; they must not enable arbitrary HTTPS URLs.

## Handle binding and cleanup

A newly staged handle belongs to one committed `baseRevision`. When an `attach-asset` operation succeeds, the handle is bound to the generated proposal ID and proposal revision. A deliberate refinement advances that binding. A resolver returns the private asset only for the exact base/proposal/revision tuple.

The engine releases private resources on:

- Revert.
- Successful Keep, after the adapter's idempotent commit resolves the exact asset.
- A stale or externally changed workspace.
- Cancelled or invalid first proposals.
- Page/session teardown.
- Explicit expiry sweeping.

Revert and teardown never call the commit adapter. Failed cleanup is reported generically and cannot expose the resource.

The merchant `commitWorkspace()` implementation is responsible for importing or converting each resolved temporary asset at most once per proposal ID, replacing the temporary handle with its normal saved reference, and preserving its own compare-and-swap boundary.

## Preview bridge

The core does not render products. `PreviewCaptureAdapter.capturePreviews()` captures the merchant's existing visible renderer for requested manifest surfaces and variants. The bridge then:

- Requires the exact proposal ID, proposal revision, and committed base revision.
- Builds the complete expected variant/surface matrix and rejects missing, extra, or duplicate candidates.
- Reconstructs each candidate and strips undeclared adapter fields.
- Bounds media type, decoded bytes, dimensions, alt text, and transport.
- Checks raster magic bytes and computes SHA-256 for inline data URLs.
- Requires a valid integrity receipt for URL artifacts.
- Stores one current receipt per proposal/revision/variant/surface.

Starting a replacement capture invalidates older receipts first. A failed capture therefore cannot leave an earlier image available to Keep. A successful proposal refinement also removes the preceding revision's artifacts.

The selected transport is static-first: a bounded renderer-generated `data:image/...;base64` artifact. The bridge can validate a same-origin URL containing only opaque, bounded path/query references and an optional short expiry, but this project has not added a preview endpoint because the inline renderer export passed actual-browser testing. Adding an endpoint later requires a separate access-control and retention review.

## Failure and recovery behavior

| Condition | Proposal effect | Persistence effect | Recovery |
|---|---|---|---|
| Invalid, oversized, unsupported, or private-network source | Existing proposal is unchanged | None | Supply a valid source or use merchant-approved text fallback |
| Asset expires or is bound to another revision | Attachment fails closed | None | Restage against the current committed revision |
| Merchant sanitizer/staging failure | Existing proposal is unchanged | None | Correct the asset or retry if the merchant reports the path available |
| Preview capture fails | Same proposal becomes `preview-unavailable` | None; Keep is blocked | Retry capture for that exact proposal revision |
| Preview integrity or target mismatch | Candidate is discarded | None; Keep is blocked | Recapture through the current renderer |
| Proposal refinement | Old preview receipts are discarded | None | Capture the new proposal revision |
| External committed revision during capture | Proposal becomes stale and resources are released | None | Reread and recreate from the new committed workspace |

`ProposalEngine.keep()` requires current preview receipts whenever a preview bridge is configured. The receipts' IDs and integrity values enter commit metadata, while the page-owned Keep controller remains the only route to persistence. There is no WebMCP save, upload, order, or checkout tool.

## Shipped integration proof

The public tote routes its real North Form PNG through `AssetSandbox`, renders
only the opaque handle, and captures the exact merchant renderer through
`PreviewBridge`. Its complete Manifest 2.0 adapter supports artwork, typography,
placement, scale, rotation, multiple variants and page-owned Keep/Revert.

The private KORRHAUS adapter uses the same public runtime with the existing sock,
grip and packaging proof board. It prepares supplied artwork temporarily through
the existing client pipeline, returns only an opaque handle, captures bounded
WebP previews per colourway, and imports the asset only after visible page Keep.
That adapter remains private; only the generic lifecycle and sanitized evidence
belong in this repository. See the current local integration evidence in
[`evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md`](./evidence/CODESIGN_V2_ITEM10_KORRHAUS_PRIVATE_INTEGRATION_2026-08-28.md).
