# Merchant integration quick start

This is the shortest credible path for adding CoDesign WebMCP to an existing
custom-product configurator. It is intentionally an adapter integration, not a
zero-code Shopify app and not a replacement renderer.

## Before writing code

Freeze one version of the customer-facing customizer and list every control a
shopper can operate. For each surface, record one of:

- the matching Manifest 2 control;
- a supported variant operation;
- the asset slot it uses; or
- a public-safe exclusion reason, such as navigation or the human-only Keep
  boundary.

Run the parity check against that inventory whenever the customizer changes.
The public tote inventory in
[`examples/studio-tote/src/control-inventory.ts`](../examples/studio-tote/src/control-inventory.ts)
is the complete reference.

## 1. Pin the core

The challenge release is distributed as source and a standalone browser
bundle; it is not published to npm. Choose one versioned route:

- add `packages/codesign-webmcp` to the merchant's npm workspace; or
- build it once and self-host `dist/browser/codesign-webmcp.js` with the
  merchant application.

Do not hotlink an unversioned third-party bundle in production. Pin the source
commit or the browser-bundle SHA-256 and update it deliberately.

From a clean clone, the reusable package is built with:

```sh
npm ci
npm run build --workspace @codesign-webmcp/core
```

## 2. Declare the public manifest

Create one `ConfiguratorManifest` containing only shopper-safe semantics:

```ts
import type { ConfiguratorManifest } from "@codesign-webmcp/core";

export const manifest: ConfiguratorManifest = {
  schemaVersion: "2.0",
  id: "merchant.custom-product",
  version: "1.0.0",
  displayName: "Merchant custom product",
  productType: "custom-product",
  controls: [/* every mapped customer control */],
  assetSlots: [/* bounded public artwork slots */],
  variantPolicy: {/* only operations the human UI supports */},
  previewSurfaces: [/* raster outputs from the existing renderer */],
  dependencyDescriptions: [/* public, non-secret rules */],
  approval: {
    mode: "explicit-human",
    persistencePath: "page-keep-controller",
  },
};
```

Use semantic IDs such as `product.colour` or `design.quantity`; never expose
private object paths, selectors, customer IDs, storage keys, pricing formulas,
or backend endpoints. `validateManifest()` fails closed before any tools are
registered.

## 3. Implement the narrow adapter

Connect the core to existing application functions through
`WorkspaceAdapter<Snapshot, PrivateAsset>`. The adapter must:

1. return a detached, allowlisted `WorkspaceState`;
2. pause or isolate ordinary autosave before taking a private snapshot;
3. validate a complete candidate with the merchant's real rules;
4. render that candidate through the existing preview with zero writes;
5. restore the exact snapshot on Revert with zero writes;
6. compare the committed revision again immediately before Keep;
7. commit idempotently by proposal ID; and
8. report newer human/backend revisions through
   `subscribeToExternalChanges()`.

If the customizer supports artwork and visual previews, the same adapter object
also implements `AssetStagingAdapter<PrivateAsset>` and
`PreviewCaptureAdapter<PrivateAsset>`. Temporary assets stay session-bound;
only Keep may import the reviewed asset through the merchant's existing private
path.

Validation issues may optionally localize a problem with a stable `issueId`,
affected control/variant/element IDs, a declared preview `surfaceId`, and a
normalized preview region. Set `repairable: true` only when the adapter also
returns one or more bounded `merchantApprovedRepairs`, each containing the
exact `set-control` batch the merchant authorizes. A refinement touching that
issue must equal one complete returned batch; the agent cannot invent or mix a
repair. Existing issues without these fields receive a deterministic legacy ID
and default to `repairable: false`.

The complete, runnable implementation is
[`examples/studio-tote/src/configurator.ts`](../examples/studio-tote/src/configurator.ts).
The KORRHAUS integration follows the same interface while its raw state,
renderer, persistence, artwork processing, and operational logic remain in the
private merchant repository.

## 4. Wire the transaction, preview, and review controllers

```ts
import {
  AssetSandbox,
  mountProposalReview,
  PreviewBridge,
  ProposalEngine,
  ProposalReviewController,
  registerCoDesignTools,
} from "@codesign-webmcp/core";

const assetSandbox = new AssetSandbox(manifest, adapter);
const previewBridge = new PreviewBridge(manifest, adapter);
const engine = new ProposalEngine(manifest, adapter, {
  assetSandbox,
  previewBridge,
});
const review = new ProposalReviewController(manifest, engine);

mountProposalReview(document.querySelector("#proposal-review")!, review);

const registration = registerCoDesignTools(document, {
  engine,
  enabled: merchantFeatureFlag,
  onInvocation(event) {
    // Render or aggregate only these privacy-safe fields. Do not enrich this
    // event with arguments, results, values, shopper copy, artwork, or URLs.
    renderAgentActivity(event);
  },
});

await registration.ready;
renderRegisteredToolDisclosure(registration.toolDisclosures);
window.addEventListener("pagehide", () => registration.unregister(), {
  once: true,
});
```

Use `reviewLocksHumanControls(review.state)` to disable ordinary controls only
while a temporary proposal is active. Direct human clicks and agent-directed
activation must enter the same visible page Keep/Revert controller. Do not add
a save, order, checkout, quote, payment, customer, pricing, supplier, or admin
WebMCP tool.

The observer receives only `toolName`, `phase`, `effect`, `timestamp`, and
`duration`; callback failure cannot change a tool result, and registered
observer delivery ends on `unregister()`. Build any customer-facing progress
from these actual events. Build the collapsed capability disclosure from
`registration.toolDisclosures` only after `registration.ready` succeeds, so it
cannot drift from the exact six registrations or claim activity on an
unsupported page.

Every successful tool result adds fixed canonical `message` guidance and one
bounded `nextAction` value while preserving its full structured result.
Consumers should use the structured revisions, issues, preview receipts, and
`persisted` value as authority. Do not interpolate merchant or shopper text
into those trusted guidance fields.

## 4a. Optionally issue a post-Keep Configuration Passport

Configuration Passport v0.1 is useful when the merchant wants a public-safe
reference that can later accompany Shopify commerce. It is not required for
WebMCP registration and must not be created before Keep succeeds.

Immediately before the page controller crosses the Keep boundary, retain only
the exact review identity, readiness, and transport-free current preview
receipts. After the controller confirms the new committed revision:

1. reread/project the committed configuration through a manifest-aware public
   allowlist;
2. rerun merchant validation against that exact committed state and project
   only its public-safe structured readiness (never adapter prose);
3. strip asset-kind controls, opaque handles, raw artwork, temporary transport,
   prices, customer/supplier data, prompts, tokens, and private endpoints;
4. remove all query and fragment data from the public same-origin edit URL,
   then call `createConfigurationPassport()` with the committed revision,
   exact previews, versions, bounded safe summary, and authoritative readiness;
5. call `verifyConfigurationPassport()` with an explicit expected merchant
   origin, configurator ID, manifest version, renderer version, and the freshly
   recomputed `authoritativeReadiness`; and
6. optionally call `toShopifyLineMetadata()` only on the returned runtime-verified,
   production-ready object.

Discard pending evidence on Revert, stale state, unavailable previews, failed
commit, or uncertain commit. The Passport hashes are unsigned integrity
receipts—not signatures or merchant-authentication tokens. The Shopify helper
is pure: it returns an opaque configuration ID, digest, canonical safe summary,
and edit URL but never writes a cart, checkout, or order.

## 5. Verify the integration before enabling it

At minimum, prove all of the following on the exact build:

- every visible customer control passes inventory parity;
- the exact six tools register only when WebMCP and the feature flag are both
  available;
- the supported-only disclosure exactly reports four inspect and two temporary
  design tools, and invocation events contain no inputs/results/private data;
- one multi-control proposal changes the existing renderer without a write;
- supplied artwork remains temporary and is released on Revert;
- one current preview exists for every requested variant;
- invalid batches leave the prior visible state byte-equivalent;
- a localized production issue highlights both the intended preview region and
  an accessible text equivalent;
- only an exact merchant-approved repair batch is accepted, after which old
  previews are stale and must be recaptured;
- another-tab or backend change makes the proposal stale;
- Revert restores the baseline with zero persistence;
- visible Keep writes once and a duplicate activation remains idempotent;
- no Passport is issued before successful Keep; a successful Keep receipt
  fails closed when its digest or expected origin/configurator/manifest/
  renderer policy changes; and
- the Shopify reference mapper causes no storage, network, or cart write;
- ordinary desktop and mobile use still works with WebMCP absent; and
- tool results contain no private or commercial data.

Run the public reference checks with:

```sh
npm test
npm run typecheck
npm run build
npm run check:parity
npm run check:public-boundary
```

Then verify the actual supported browser/agent host. Source inspection and unit
tests do not prove that a host discovers the tools or displays returned visual
artifacts.

Use ordinary shopper prompts for this host check. Do not tell the model to use
WebMCP or call a named CoDesign tool: a successful integration must route
“make me two branded tote options and show them” through the registered tools
from their metadata alone. Test direct, subjective, underspecified, refinement,
artwork, validation, and unrelated commerce intents. The page must already be
open because WebMCP clients cannot discover tools from an unvisited origin.

## Public versus merchant-owned code

| CoDesign WebMCP supplies | The merchant keeps |
| --- | --- |
| Manifest and inventory validators | Product-specific option vocabulary |
| Canonical public workspace | Raw application/customer state |
| Atomic proposal engine | Existing renderer and UI |
| Temporary asset and preview contracts | Artwork conversion and storage |
| Six bounded WebMCP tools | Production and validation internals |
| Review/Keep/Revert coordination | Final persistence implementation |
| Optional unsigned Passport and pure Shopify reference mapper | Cart, checkout, order, and payment actions |

For the full contracts and failure semantics, continue with
[`MANIFEST_AND_ADAPTER.md`](./MANIFEST_AND_ADAPTER.md),
[`WORKSPACE_AND_OPERATIONS.md`](./WORKSPACE_AND_OPERATIONS.md), and
[`PROPOSAL_ENGINE.md`](./PROPOSAL_ENGINE.md).
