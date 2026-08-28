# Technical Spec

**Product:** CoDesign WebMCP
**Specification date:** 27 August 2026
**Status:** Architecture candidate for checklist review; planning only
**Authority:** Implements the approved product behavior in `scope.md` and `prd.md`. It does not authorize implementation, deployment, publication, public-repository mutation, or private KORRHAUS changes.

## Overview

CoDesign WebMCP is a reusable, open-source WebMCP integration layer for existing Shopify product customizers. It lets a compatible agent translate a shopper's brief into temporary, visible, validated product-design proposals inside the merchant's existing browser renderer.

The challenge build has two deliberately separate product surfaces:

- **Studio tote:** the stable, public, fictional, clean-clone-runnable reference integration and official judge surface.
- **KORRHAUS:** the real, evolving Shopify Sock Designer and live-business proof. Its renderer, raw state, persistence, artwork pipeline, customer data, pricing, and operational logic remain private.

The shared public package is neither renderer. It supplies:

- Manifest and capability contracts.
- A sanitized canonical workspace.
- Typed proposal operations.
- Temporary asset handles.
- Atomic proposal and revision coordination.
- Preview-artifact normalization.
- Six WebMCP tools.
- Page Keep/Revert coordination.
- Fail-closed adapter and testing contracts.

The merchant continues to own:

- The normal human UI.
- Product-specific rendering.
- Allowed values and dynamic availability.
- Product and production validation.
- Raw snapshots and autosave behavior.
- Final persistence through the existing page Keep path.

### Product outcome

A shopper can select a compatible customizable product in ChatGPT, let the agent open and operate the merchant page in the background, see the design evolve, receive useful inline visual previews in chat, refine the design conversationally, and save only after explicit human confirmation.

### Non-negotiable architecture properties

1. Every customer-editable control in a claimed integration has an agent mapping in a versioned inventory.
2. Product-specific rendering and rules never move into the generic core.
3. Agent proposals never enter normal autosave or persistence before Keep.
4. Invalid batches never leave partial visible state.
5. External human changes never get overwritten silently.
6. Chat receives an actual inline visual result; text or a bare link is insufficient.
7. ChatGPT's built-in browser and Chrome's native WebMCP implementation are separate required verification targets.
8. The six WebMCP tools contain no save, order, quote, checkout, payment, application, proof-acceptance, or administrative action.
9. A confirmed save crosses one page-owned Keep controller and one idempotent adapter commit.
10. Ordinary human use remains functional without WebMCP.

## Stack

### Public core

- **Language:** TypeScript, strict mode.
- **Module format:** ECMAScript modules.
- **Workspace:** npm workspaces.
- **Library build:** TypeScript compiler for ESM/types plus esbuild for the optional browser bundle.
- **Runtime model:** browser-local library; no remote MCP server and no mandatory application backend.
- **Public schema:** hand-authored TypeScript types plus explicit runtime validation. TypeScript alone is never treated as a security boundary.

The current repository's TypeScript/npm-workspace foundation is retained. Existing proposal, revision, rollback, and adapter-boundary logic may be migrated where it satisfies this specification. The current manifest `1.0`, read-only asset model, narrow option surface, five-tool contract, and page-only preview assumptions are replaced by manifest `2.0` and this specification.

### Studio-tote application

- **Build:** Vite static application.
- **Renderer:** existing browser DOM/canvas/SVG primitives owned by the tote application.
- **Saved demo state:** local storage only after Keep.
- **Temporary state:** memory only.
- **Initial hosting:** one static public deployment containing the tote, judge explanation, and public documentation.
- **Preview escalation:** add a minimal same-origin preview endpoint only if the ChatGPT preview feasibility gate proves static artifacts insufficient.

### Tests

- **Unit and contract:** Vitest.
- **DOM-level:** happy-dom where real layout/browser behavior is not required.
- **Actual browser:** Playwright with stable Chrome/Chromium coverage for ordinary UI, proposal rendering, accessibility, and negative cases.
- **Native Chrome WebMCP:** Chrome 149+ using the official origin trial for the public origin or `chrome://flags/#enable-webmcp-testing` locally, plus the official tool inspector/evaluation path.
- **ChatGPT:** manual, captured end-to-end verification in the ChatGPT desktop app built-in browser using site tools.

### Supported-host claim matrix

| Target | Required challenge claim | Verification |
|---|---|---|
| ChatGPT desktop built-in browser | Full chat-first tote journey, site-tool use, inline previews, refinement, and chat-confirmed page Keep | Actual ChatGPT conversation and browser evidence |
| Chrome 149+ native WebMCP | Same six tools discoverable and executable, live renderer changes, asset staging, preview capture, and validation | Origin-trial/testing-flag Chrome plus inspector/eval evidence |
| Ordinary Chrome without WebMCP | Complete human customizer with no agent-only UI or regression | Playwright and manual Chrome |
| Claude or other clients | No challenge compatibility claim unless separately verified | Future/optional only |
| “ChatGPT site tools in Chrome” | Not claimed while OpenAI documents site tools as built-in-browser-only | Explicit limitation in docs |

### Distribution

The challenge finish line requires:

- Public source repository.
- Apache-2.0 license.
- Clean-clone installation.
- Reproducible build and tests.
- Stable deployed public tote/judge URL.
- Integration guide and manifest/adapter example.

Publishing to npm is not required for the challenge. It may happen after the manifest `2.0` API is stable, but the public demo and documentation must not depend on npm publication.

## Architecture

### Runtime topology

```text
Shopper in ChatGPT or Chrome-compatible agent
        │
        │ opens merchant page and discovers WebMCP tools
        ▼
document.modelContext.registerTool(...)
        │ six bounded, origin-scoped tools
        ▼
CoDesign WebMCP registry
        │ runtime input validation and sanitized output
        ▼
Proposal engine ───────── Manifest 2.0 + control inventory
        │                         │
        │ canonical public draft │ customer-safe capabilities
        ▼                         ▼
Guarded merchant adapter ─── Product-specific validation
        │
        ├── private raw snapshot
        ├── temporary asset storage
        ├── autosave isolation
        ├── zero-write preview
        ├── preview capture
        ├── exact restore
        └── idempotent Keep commit
                    │
                    ▼
Existing merchant UI, renderer, state, and persistence
```

### Public/private boundary

The public core may receive only:

- Manifest-declared IDs, labels, public descriptions, and bounds.
- Sanitized current state.
- Opaque revisions and proposal IDs.
- Public validation messages.
- Temporary public asset metadata and opaque handles.
- Sanitized preview-artifact metadata.
- Idempotent commit outcomes.

The core never receives:

- Merchant raw boot objects or raw application state.
- Authentication tokens, private endpoints, or broad services.
- Customer/project enumeration.
- Confidential prices, formulas, margins, suppliers, or production administration.
- Raw private snapshots.
- Unrelated artwork or customer files.
- Order, quote, payment, application, or proof workflows.

KORRHAUS-specific mapping, selectors, state access, persistence suppression, artwork conversion, validation, and commit behavior remain in the private production repository. The public repository may include only sanitized interface examples and dated evidence.

### PRD epic-to-component map

| PRD epic | Primary components |
|---|---|
| Epic 1 — choose product | Host-agent discovery; page compatibility state; WebMCP registry |
| Epic 2 — progress and temporary status | Host progress language; proposal engine; review controller |
| Epic 3 — complete first design | Manifest, control inventory, typed operations, proposal engine, asset sandbox |
| Epic 4 — live and chat previews | Merchant renderer, preview bridge, host verification |
| Epic 5 — conversational refinement | Read workspace, apply proposal, proposal revision protocol |
| Epic 6 — merchant-authoritative guidance | Adapter validation, manifest availability, validation tool |
| Epic 7 — protect state | Proposal isolation, snapshot/restore, stale-revision handling |
| Epic 8 — confirm and save | Chat confirmation workflow, page Keep/Revert controller, idempotent adapter commit |
| Epic 9 — preview failures | Preview bridge, `preview-unavailable` state, retry behavior |
| Epic 10 — merchant integration | Manifest 2.0, adapter contract, inventory parity harness, integration guide |
| Epic 11 — tote reference | Public tote manifest, adapter, renderer, tests, deployment |
| Epic 12 — KORRHAUS proof | Private adapter, versioned control inventory, approval-gated release evidence |
| Epic 13 — judge story | Staged proposal sequence, inline previews, two-surface documentation and evidence |

### Progressive enhancement

Tool registration feature-detects `document.modelContext`. If unavailable or disabled:

- No site tools register.
- No agent review UI appears.
- The ordinary human customizer works normally.
- The application does not polyfill WebMCP by scraping/clicking arbitrary DOM as its primary integration.

Chrome origin-trial enablement changes only API availability. It must not gate the human renderer or controls.

## File Structure

The target public structure is intentionally compact enough for challenge execution while separating security-critical responsibilities.

```text
/
  package.json                         workspace scripts and pinned toolchain
  package-lock.json                    reproducible dependency graph
  tsconfig.json                        strict shared TypeScript settings
  vitest.config.ts                     unit and contract-test configuration
  playwright.config.ts                 actual-browser projects and server setup
  LICENSE                              Apache-2.0 license
  README.md                            product, quick start, demo, boundaries
  SECURITY.md                          threat boundary and reporting policy
  PUBLIC_PRIVATE_BOUNDARY.md           public/private integration rules

  packages/codesign-webmcp/
    package.json                       core package metadata and builds
    tsconfig.build.json                library/type output
    src/
      index.ts                         supported public exports only
      types.ts                         manifest 2.0, state, operation, asset, preview types
      manifest.ts                      structural and semantic manifest validation
      inventory.ts                     control-inventory and parity validation
      adapter.ts                       adapter contract and runtime output guards
      operations.ts                    typed operation schemas and detached reducer
      proposal-engine.ts               proposal state machine, revisions, atomicity
      asset-sandbox.ts                 temporary handle lifecycle and source policy
      preview-bridge.ts                preview capture, validation, and receipts
      review-controller.ts             page Keep/Revert and cross-surface state
      webmcp.ts                        six tool definitions and registration lifecycle
      public-errors.ts                 bounded public error codes and messages
      testing.ts                       reusable adapter/inventory contract harness
    tests/
      manifest.test.ts                 manifest semantics and size/prototype guards
      inventory.test.ts                declared-control parity and exclusions
      adapter-contract.test.ts         safe output, isolation, restore, commit behavior
      operations.test.ts               operation validation and atomic reduction
      proposal-engine.test.ts          revisions, cancellation, stale state, idempotency
      asset-sandbox.test.ts             MIME/size/source/expiry and cleanup cases
      preview-bridge.test.ts            artifact integrity, staleness, and failures
      review-controller.test.ts         Keep/Revert availability and save-once behavior
      webmcp.test.ts                    schemas, tool lifecycle, sanitized results

  examples/studio-tote/
    package.json                       static reference-app build
    index.html                         public entry page
    src/
      manifest.ts                      tote capabilities and manifest 2.0
      inventory.ts                     versioned visible tote control inventory
      state.ts                         fictional initial and saved canonical state
      adapter.ts                       tote merchant-adapter implementation
      renderer.ts                      normal human and proposal visual renderer
      assets.ts                        public tote artwork staging/sanitization
      preview.ts                       per-variant preview capture
      ui.ts                            ordinary customer controls and proposal lock state
      main.ts                          app wiring and WebMCP registration
      styles.css                       responsive visual system
    tests/
      parity.test.ts                   every visible control has an agent mapping
      configurator.test.ts             tote rules, state, variants, and persistence
      browser.spec.ts                  human UI and proposal actual-browser flow
      webmcp-browser.spec.ts           native Chrome tool discovery/execution harness
    public/                            public-safe tote render assets only

  evals/
    cases.json                         deterministic and model tool-selection cases
    safety-cases.json                  forbidden-action and prompt-injection cases
    results.template.json              public result format without secrets

  scripts/
    verify-public-boundary.mjs         prevent private names/data patterns in release
    verify-control-parity.mjs          run all public integration inventories
    verify-browser-bundle.mjs          assert document.modelContext contract bundle
    assemble-judge-site.mjs            assemble static tote/judge deployment
    check-release-evidence.mjs         ensure evidence matches version/hash/date

  docs/
    ARCHITECTURE.md                    published architecture derived from this spec
    INTEGRATION_GUIDE.md               merchant installation and adapter walkthrough
    MANIFEST_2.md                      exact manifest and operation contract
    BROWSER_SUPPORT.md                 honest ChatGPT/Chrome support matrix
    TESTING.md                         deterministic, browser, and agent verification
    JUDGE_GUIDE.md                     15-second story and reproducible path
    PRE_EXISTING_BASELINE.md           before/after challenge distinction
    evidence/                          sanitized, dated, version-linked proof
    hackathon-build/                   guided planning documents

  judge-site/
    index.html                         concise judge explanation
    styles.css                         public presentation
    app.js                             public links/status only; no duplicate customizer
```

The private KORRHAUS repository will later add a private adapter and inventory in locations chosen after read-only source inspection. No private path, state name, secret, or implementation is copied into this public tree.

## Data Flow

### 1. Product selection and page opening

Product discovery belongs to the host agent, not CoDesign WebMCP. After the shopper chooses the tote or KORRHAUS:

1. The host opens the selected merchant page.
2. The page loads the ordinary human customizer.
3. The page feature-detects WebMCP.
4. If supported and enabled, the page validates manifest `2.0` and registers six tools.
5. A validation failure registers no partial tool set and leaves the human UI usable.

Implements: `prd.md > Epic 1`, `Epic 7.4`, `Epic 10.3`.

### 2. Read and plan

1. The agent calls `codesign_read_workspace`.
2. The core obtains a field-by-field sanitized committed workspace from the adapter.
3. The agent calls `codesign_list_capabilities` for relevant targets/controls.
4. The host interprets the shopper's natural-language brief into typed operations.
5. The original conversation and raw prompt are not copied into merchant state or public tool output.

Implements: `prd.md > Epic 2`, `Epic 3`, `Epic 6`, `Epic 10`.

### 3. Stage external artwork

When the brief supplies artwork:

1. The agent calls `codesign_stage_asset` with an allowed bounded source.
2. The core validates the requested slot, source shape, lengths, and declared media policy.
3. The adapter performs product-specific fetch/decode/sanitization in an isolated temporary path.
4. The adapter returns only an opaque session handle and public-safe metadata.
5. No normal upload record, customer project, autosave event, or notification is created.
6. Failure leaves the existing proposal unchanged. The agent may use the studio name only when the brief permits or the customer accepts that fallback.

Implements: `prd.md > Epic 3.2`, `Epic 5.4`, `Edge case: supplied asset cannot be used`.

### 4. Build the first proposal in visible stages

The first design is built in two or three coherent atomic passes, for example:

1. **Foundation:** material, base colors, construction, quantities.
2. **Branding:** text/artwork, typography, placement, scale, rotation.
3. **Collection:** duplicate/create variants, targeted differences, names, quantity split.

For each pass:

1. `codesign_apply_proposal` names the committed base revision and current proposal revision.
2. The core validates all operations and applies them to a detached copy.
3. The adapter validates the complete candidate.
4. Only a valid candidate enters temporary preview mode.
5. The same existing renderer updates visibly in one coherent paint.
6. The next pass builds from the new proposal revision.

The browser shows progress through visible product change; chat shows two or three concise progress messages. The host does not expose raw tool logs.

Implements: `prd.md > Epic 2`, `Epic 3`, `Epic 4.1`, `Epic 11.3`, `Epic 13.1`.

### 5. Capture and return chat previews

1. After the full first proposal or a conversational revision, the agent calls `codesign_get_previews`.
2. The adapter captures the current renderer output for the requested current proposal revision.
3. The preview bridge validates variant identity, revision, MIME type, dimensions, size, alt text, and transport.
4. The tool returns artifact receipts, never raw merchant state.
5. The host displays the renderer export or genuine browser screenshot inline in chat.
6. If inline display cannot be demonstrated, the feasibility gate fails; a text result or bare link does not pass.

Implements: `prd.md > Epic 4.2`, `Epic 4.3`, `Epic 9`, `Epic 11.3`.

### 6. Conversational refinement

1. The agent rereads the pending proposal metadata when necessary.
2. A refinement targets explicit variant/element IDs.
3. Ambiguous targets cause one focused question before mutation.
4. `codesign_apply_proposal` applies a new atomic revision.
5. Unaffected variants remain byte-equivalent in canonical public state.
6. The renderer updates and a fresh preview is returned to chat.

Implements: `prd.md > Epic 5`, `Epic 6.3`.

### 7. External or manual changes

During proposal mode, the page's ordinary controls remain visible but locked. Changes from another tab, backend, or other external source cause the adapter's committed revision to change.

1. The proposal engine marks the proposal `stale`.
2. Keep becomes unavailable.
3. The temporary preview is discarded or quarantined.
4. The adapter restores/reads the latest committed state.
5. Chat asks whether the shopper wants the new human state incorporated into a recreated proposal.

No merge occurs silently.

Implements: `prd.md > Epic 7.2`, `Edge case: manual edit during proposal`.

### 8. Chat confirmation and Keep

WebMCP currently provides no page-verifiable proof that a person confirmed inside chat. Therefore persistence remains on the page's single visible Keep controller.

1. The shopper asks to keep the exact proposal.
2. Chat identifies proposal/variant names and asks for explicit action-time confirmation.
3. After the shopper confirms, the host agent activates the page's Keep control through its browser capability.
4. Keep rechecks preview readiness, proposal revision, and committed base revision.
5. The adapter performs a compare-and-swap immediately before its first write.
6. The adapter commits locally/server-side once per proposal ID.
7. Chat rereads state, obtains the saved preview, and reports “Saved as a design.”

There is no WebMCP Keep/save tool. Page Keep and a chat-directed agent click use the same controller and commit path.

Implements: `prd.md > Epic 8.1`, `Epic 8.2`, `Epic 8.3`, `Epic 8.4`.

### 9. Revert

1. Page Revert or chat-directed page Revert names the current proposal.
2. The core instructs the adapter to restore the exact private baseline with zero persistence writes.
3. Temporary assets and preview receipts are destroyed.
4. Ordinary controls unlock.
5. Chat reports that the temporary proposal was not saved.

Implements: `prd.md > Epic 8.5`.

### 10. Browser interruption

Proposal state, temporary assets, and raw snapshots are session-local. Closing or losing the page destroys site tools and makes the proposal unavailable. Chat must say it was not saved and offer to recreate it from the conversation.

Implements: `prd.md > Epic 7.3`.

### Data residence

| Data | Owner/location | Persistence |
|---|---|---|
| Manifest and inventory | Public merchant bundle | Versioned source/build |
| Sanitized committed workspace | Core copy returned from adapter | Per read only |
| Raw committed state | Merchant application | Merchant-owned |
| Private exact snapshot | Merchant adapter memory | Proposal lifetime only |
| Open proposal | Core browser memory | Proposal lifetime only |
| Temporary artwork bytes | Adapter/session asset sandbox | Proposal lifetime only |
| Asset handle metadata | Core browser memory | Proposal lifetime only |
| Preview artifacts | Adapter/host-safe temporary transport | Current proposal revision only |
| Tote saved design | Tote local storage | Only after Keep |
| KORRHAUS saved design | Existing KORRHAUS persistence | Only after approved Keep integration |
| Natural-language brief | Host conversation | Not copied wholesale into merchant storage |

## Components And Responsibilities

### Manifest 2.0

Implements: `prd.md > Epic 3.3`, `Epic 5.4`, `Epic 6`, `Epic 10.1`, `Epic 10.2`, `Epic 11.2`, `Epic 12.2`.

The manifest describes agent-usable customer controls, not internal object paths or renderer implementation. Product-specific labels, values, and rules remain in each integration.

Required conceptual contract:

```ts
interface ConfiguratorManifestV2 {
  schemaVersion: "2.0";
  id: SafeId;
  version: SafeVersion;
  displayName: string;
  productType: string;
  controls: ControlDefinition[];
  assetSlots: AssetSlotDefinition[];
  variantPolicy: VariantPolicy;
  previewSurfaces: PreviewSurfaceDefinition[];
  dependencyDescriptions: DependencyDescription[];
  approval: {
    mode: "explicit-human";
    persistencePath: "page-keep-controller";
  };
}
```

Supported control kinds are intentionally finite:

```ts
type ControlKind =
  | "enum"
  | "color"
  | "integer"
  | "number"
  | "boolean"
  | "text"
  | "asset"
  | "position-2d"
  | "scale"
  | "rotation";

type ControlScope = "workspace" | "variant" | "element";
```

Each `ControlDefinition` contains:

- Stable semantic `id`.
- Human label.
- Short agent description.
- Scope and kind.
- Writable/read-only status.
- Required target type, where relevant.
- Enum values or numeric/text bounds.
- Public affected-preview-region label.
- Optional availability group IDs.
- Whether it is required for a valid configuration or only production readiness.

The manifest does not encode arbitrary executable rule expressions. Simple public dependencies may be described declaratively for agent understanding. Complex validation stays in `adapter.validateWorkspace()`.

The manifest validator rejects:

- Unknown fields at every contract level unless explicitly reserved for forward compatibility.
- Duplicate IDs.
- Prototype-pollution keys.
- Unsupported kinds/scopes.
- Invalid numeric/text bounds.
- Writable controls that have no supported operation mapping.
- Asset controls without a declared slot.
- Variant operations inconsistent with the stated variant policy.
- Preview surfaces without valid variant/workspace scope.
- Oversized collections or strings.
- Approval modes other than the fixed page Keep controller.

Manifest `1.0` receives a short migration guide. No runtime compatibility layer is required for the challenge.

### Versioned human-control inventory

Implements: `prd.md > Epic 3.3`, `Epic 10.2`, `Epic 11.2`, `Epic 12.2`.

Each integration maintains a separate inventory representing the actual customer-facing controls in the selected UI version:

```ts
interface HumanControlInventory {
  integrationId: SafeId;
  integrationVersion: string;
  verifiedAt: string;
  controls: Array<{
    humanControlId: SafeId;
    label: string;
    manifestControlId?: SafeId;
    status: "mapped" | "excluded";
    exclusionReason?: string;
  }>;
}
```

Rules:

- Every visible creative/configuration control is either `mapped` or deliberately `excluded` with a public-safe reason.
- Hidden administration is excluded from the inventory rather than falsely treated as a missing design control.
- Customer-visible prices are not design controls and are outside this challenge contract.
- A mapped control must exist in the manifest and be addressable through typed proposal operations.
- Adding a new visible merchant control causes the parity test to fail until mapped or explicitly excluded.
- KORRHAUS parity claims name the inventory version, application version/build, public core version, and verification date.

The tote inventory is public and automated. The KORRHAUS inventory is private; only a sanitized summary and evidence count may be published.

### Canonical workspace state

Implements: `prd.md > Epic 3`, `Epic 5`, `Epic 7`, `Epic 10`.

The core works with detached, JSON-compatible public state:

```ts
interface WorkspaceState {
  configuratorId: SafeId;
  manifestVersion: string;
  committedRevision: OpaqueRevision;
  activeVariantId: SafeId;
  workspaceControls: Record<SafeId, ControlValue>;
  variants: VariantState[];
}

interface VariantState {
  id: SafeId;
  name: string;
  controls: Record<SafeId, ControlValue>;
  elements: ElementState[];
}

interface ElementState {
  id: SafeId;
  type: SafeId;
  controls: Record<SafeId, ControlValue>;
  assetHandle?: SafeId;
}
```

`ControlValue` supports only the finite manifest value types. It does not accept arbitrary nested merchant objects.

The adapter guard reconstructs state field by field. It drops undeclared controls and rejects malformed IDs, duplicate variants/elements, unknown values, invalid asset handles, oversized arrays, and manifest/configurator mismatches. Adapter stack traces and offending raw values never cross the public boundary.

The opaque committed revision must change whenever committed public state changes. It must not encode secrets or confidential data.

### Typed proposal operations

Implements: `prd.md > Epic 3.3`, `Epic 3.4`, `Epic 5`, `Epic 6.3`.

The single proposal tool accepts a bounded discriminated union:

```ts
type ProposalOperation =
  | SetControlOperation
  | CreateVariantOperation
  | DuplicateVariantOperation
  | RemoveVariantOperation
  | ReorderVariantOperation
  | SetActiveVariantOperation
  | AttachAssetOperation
  | RemoveAssetOperation;
```

Transformations such as position, scale, rotation, typography, and color are represented as manifest controls on a variant or element. This avoids product-specific operation names while retaining strict value validation.

Conceptual request:

```ts
interface ApplyProposalInput {
  baseRevision: OpaqueRevision;
  proposalId?: SafeId;
  proposalRevision?: number;
  operationId: SafeId;
  operations: ProposalOperation[]; // 1..80
  assumptions?: string[];          // 0..20, bounded
}
```

Rules:

- A new proposal omits `proposalId` and `proposalRevision`.
- A refinement supplies both current identifiers.
- Every operation names an explicit target or declares how a new target is created.
- A create/duplicate operation may include initial controls so the new variant never appears half-configured.
- Variant removal/reorder is available only when declared by the manifest and visible in the human UI.
- The operation batch is applied to a detached copy and validated completely before preview.
- A repeated `operationId` with the same payload returns the original result.
- Reusing an `operationId` with a different payload fails closed.
- The implementation caps successful operations, assumptions, variants, elements, and text lengths per proposal.

### Guarded merchant adapter

Implements: `prd.md > Epic 4.1`, `Epic 6`, `Epic 7`, `Epic 8`, `Epic 10`, `Epic 12`.

Conceptual contract:

```ts
interface ConfiguratorAdapter<PrivateSnapshot, PrivateAsset> {
  readWorkspace(): Promise<WorkspaceState>;
  listAvailability(request: AvailabilityRequest): Promise<AvailabilityResult>;

  quiescePersistence(): Promise<void>;
  captureSnapshot(): Promise<PrivateSnapshot>;
  beginProposalMode(context: ProposalContext): Promise<void>;

  stageAsset(
    request: AdapterAssetStageRequest
  ): Promise<AdapterStagedAsset<PrivateAsset>>;
  releaseAsset(privateAsset: PrivateAsset): Promise<void>;

  validateWorkspace(
    workspace: WorkspaceState,
    assets: AssetResolver<PrivateAsset>
  ): Promise<ValidationResult>;
  previewWorkspace(
    workspace: WorkspaceState,
    assets: AssetResolver<PrivateAsset>
  ): Promise<void>;
  capturePreviews(
    request: PreviewCaptureRequest
  ): Promise<PreviewArtifactCandidate[]>;

  restoreSnapshot(snapshot: PrivateSnapshot): Promise<void>;
  commitWorkspace(
    workspace: WorkspaceState,
    assets: AssetResolver<PrivateAsset>,
    metadata: CommitMetadata
  ): Promise<CommitResult>;
  endProposalMode(reason: ProposalEndReason): Promise<void>;

  subscribeToExternalChanges(
    listener: (revision: OpaqueRevision) => void
  ): () => void;
}
```

Adapter obligations:

1. Return detached, sanitized canonical state.
2. Keep raw snapshots private.
3. Quiesce normal persistence before snapshotting.
4. Enter an explicit proposal mode that prevents normal autosave, uploads, notifications, and side effects from treating temporary state as committed.
5. Perform no storage or network writes during preview, validation, capture, restore, or revert.
6. Use the existing renderer rather than a core renderer.
7. Compare `baseRevision` with current committed state immediately before the first Keep write.
8. Make Keep idempotent by proposal ID.
9. Distinguish expected retryable save failure from unknown outcome.
10. Emit external revision changes from all committed human/backend sources.
11. Clean up temporary assets and proposal mode on Keep, Revert, cancellation, stale state, or teardown.

The core treats all adapter results as untrusted at runtime. The guarded adapter reconstructs every state, availability, validation, preview, asset, and commit result into declared public fields.

### Proposal engine

Implements: `prd.md > Epic 3`, `Epic 5`, `Epic 6.3`, `Epic 7`, `Epic 8`, `Epic 9`.

State machine:

```text
IDLE
  │ valid new operation batch
  ▼
BUILDING ── invalid/cancelled ───────────────► IDLE
  │ detached candidate complete
  ▼
VALIDATING ── invalid ──► retain prior reviewable proposal or IDLE
  │ valid
  ▼
RENDERING ── failure ───► restore prior reviewable proposal/baseline
  │ visible zero-write preview
  ▼
REVIEWABLE
  ├── refinement ───────────────────────────► BUILDING
  ├── preview capture failure ──────────────► PREVIEW_UNAVAILABLE
  ├── external committed revision ─────────► STALE
  ├── Revert ───────────────────────────────► REVERTING ─► IDLE
  └── confirmed page Keep ─────────────────► COMMITTING

PREVIEW_UNAVAILABLE
  ├── retry current capture ────────────────► REVIEWABLE
  ├── Revert ───────────────────────────────► REVERTING ─► IDLE
  └── external revision ───────────────────► STALE

STALE
  └── restore/read newest committed state ─► IDLE

COMMITTING
  ├── local + server success ──────────────► IDLE/SAVED EVENT
  ├── expected server failure ─────────────► COMMIT_RETRY
  └── unknown outcome/exception ───────────► COMMIT_UNCERTAIN
```

Invariants:

- At most one open proposal per page.
- At most one mutating proposal operation in flight.
- Proposal revisions increase monotonically.
- Every async boundary rechecks committed and proposal revisions.
- A failed refinement preserves the last successfully inspected proposal.
- A failed first proposal restores the exact baseline.
- Keep requires a current preview receipt and current committed revision.
- `COMMIT_UNCERTAIN` never automatically retries or claims success.
- Browser teardown aborts tool registration and cleans temporary resources without saving.

### Temporary asset sandbox

Implements: `prd.md > Epic 3.2`, `Epic 5.4`, `Epic 7.1`, `Edge case: supplied asset cannot be used`.

Public conceptual source:

```ts
type AssetSource =
  | { kind: "data-url"; data: string }
  | { kind: "https-url"; url: string };

interface StageAssetInput {
  slotId: SafeId;
  source: AssetSource;
  filename?: string;
  altText: string;
}
```

The manifest controls which source kinds and media types a slot permits. The challenge tote must prove a real supplied image, while studio-name typography remains the no-asset fallback.

Security and lifecycle rules:

- Source strings and decoded bytes are strictly bounded.
- Only manifest-declared raster/vector media types are accepted.
- Remote sources require HTTPS, credential omission, safe redirect behavior, and rejection of localhost/private-network targets.
- A remote image must satisfy browser fetch/CORS and declared size limits; failure is honest and side-effect free.
- Product-specific decoding, SVG sanitization/rasterization, vectorization, background removal, or print preparation belongs to the adapter.
- Metadata is stripped or normalized where the adapter supports it.
- Raw bytes never appear in read/list/validation tool output.
- A public tool receives only an opaque asset handle, media metadata, alt text, and temporary status.
- Handles are proposal/session-bound, unguessable, and expire on Keep/Revert/teardown.
- Revert performs no merchant upload.
- Keep may import the exact staged sanitized asset through the merchant's existing private path as part of the idempotent commit.

Feasibility gate: prove that an asset supplied in the supported agent conversation can reach `codesign_stage_asset` in both the ChatGPT test path and Chrome test path. If the host cannot transport an attachment as a bounded supported source, implementation pauses for an architecture decision; the product must not quietly claim arbitrary artwork support from a hard-coded logo.

### Preview bridge

Implements: `prd.md > Epic 4.2`, `Epic 4.3`, `Epic 8.1`, `Epic 9`.

Conceptual artifact receipt:

```ts
interface PreviewArtifact {
  artifactId: SafeId;
  proposalId: SafeId;
  proposalRevision: number;
  variantId: SafeId;
  surfaceId: SafeId;
  mediaType: "image/png" | "image/webp" | "image/jpeg";
  width: number;
  height: number;
  altText: string;
  integrity: string;
  transport:
    | { kind: "data-url"; value: string }
    | { kind: "same-origin-url"; value: string; expiresAt?: string };
}
```

Rules:

- The adapter captures the existing renderer; the core never renders merchandise.
- One current artifact is available per requested variant/surface.
- Artifact metadata and bytes/URL are bounded.
- A same-origin URL cannot expose raw private state in its path/query.
- Artifacts are bound to proposal ID/revision and rejected when stale.
- Accessibility text identifies product, variant, and visible direction without private data.
- A capture failure changes state to `PREVIEW_UNAVAILABLE` and blocks Keep.
- Retry captures the same current proposal; it does not create a new proposal or save.
- The challenge accepts a renderer export or genuine host browser screenshot only if an actual visual is displayed inline in chat.
- A tool success object, alt text, or bare URL does not satisfy the in-chat-preview acceptance test.

Static-first strategy:

1. Attempt a bounded renderer-generated artifact usable directly by the supported host.
2. Test actual ChatGPT inline display and Chrome retrieval before broader work.
3. If the static transport fails, add the smallest same-origin, short-lived preview endpoint needed.
4. Any endpoint addition receives its own data-retention and access-control review before deployment approval.

### Six WebMCP tools

Implements: `prd.md > Epic 2` through `Epic 10`, `Epic 11.3`, `Epic 13`.

All tools use the imperative `document.modelContext.registerTool()` API, strict JSON Schema, `additionalProperties: false`, bounded strings/arrays, runtime revalidation, sanitized results, and a shared registration `AbortController`.

#### `codesign_read_workspace`

Purpose: read the current sanitized committed workspace and pending-proposal metadata.

Input:

```json
{}
```

Success includes:

- Manifest/configurator IDs and versions.
- Sanitized `WorkspaceState`.
- Variant and active-target identities.
- Current committed revision.
- Pending proposal ID/revision/status or `null`.
- Supported high-level variant/asset/preview capabilities.

It never returns raw assets, private snapshots, pricing, customer lists, or persistence internals.

Annotations: `readOnlyHint: true`; `untrustedContentHint: true` when merchant/user text is included.

#### `codesign_list_capabilities`

Purpose: list declared controls, current availability, allowed values/bounds, variant operations, asset slots, preview surfaces, and public dependency descriptions.

Input may filter by:

- Variant ID.
- Element ID.
- Control IDs.
- Capability categories.

Unknown filters fail rather than producing broad raw output. Dynamic availability uses adapter results and current proposal context.

Annotations: `readOnlyHint: true`; `untrustedContentHint: true`.

#### `codesign_stage_asset`

Purpose: stage a real temporary asset for one declared slot without normal upload/persistence.

Input: `StageAssetInput` plus current base/proposal revision where a proposal already exists.

Success includes:

- Opaque temporary handle.
- Slot ID.
- Sanitized media type and dimensions when available.
- Alt text.
- `persisted: false`.
- Expiry/lifecycle statement.

It never returns raw bytes or private storage locations.

Annotations: `readOnlyHint: false`; `untrustedContentHint: true`.

#### `codesign_apply_proposal`

Purpose: atomically create or refine a temporary visible proposal using typed operations.

Input: `ApplyProposalInput`.

Success includes:

- Proposal ID and monotonically increasing proposal revision.
- Base committed revision.
- Normalized public diff.
- Created/removed/reordered variant summaries.
- Validation status and public issues.
- `persisted: false`.
- `previewStatus: "ready-for-capture"`.
- Reminder that persistence requires the page Keep path after human confirmation.

No partial candidate reaches the renderer after validation failure.

Annotations: `readOnlyHint: false`; `untrustedContentHint: true`.

#### `codesign_get_previews`

Purpose: capture current visual artifacts for the exact pending proposal revision.

Input:

- Proposal ID.
- Proposal revision.
- Optional variant/surface filters.

Success includes validated `PreviewArtifact[]` and current validation summary. A stale artifact is never returned as current.

Annotations: `readOnlyHint: true`; `untrustedContentHint: true`.

#### `codesign_validate_proposal`

Purpose: validate the committed workspace or exact pending proposal using merchant-authoritative rules.

Input:

- Optional proposal ID/revision; omission means committed state.

Success distinguishes:

- `configurationValid`.
- `productionReady`.
- Blocking constraint errors.
- Decisions required.
- Warnings.
- Information.
- Visible assumptions.

It does not invent production restrictions or leak private validation logic.

Annotations: `readOnlyHint: true`; `untrustedContentHint: true`.

### Page review and confirmation controller

Implements: `prd.md > Epic 2.2`, `Epic 7`, `Epic 8`.

Responsibilities:

- Show a concise proposal status only when a proposal exists.
- Keep the product preview visually primary.
- Keep ordinary controls visible but disabled during proposal review.
- Expose accessible Keep/Revert controls on the page.
- Disable Keep while applying, stale, preview-unavailable, reverting, committing, or commit-uncertain.
- Route both direct human clicks and chat-directed browser activation through one controller.
- Expose no WebMCP save tool.
- Synchronize completion so the next workspace read reports the saved/reverted state.

The host conversation is responsible for asking the explicit confirmation question. The page cannot cryptographically inspect that conversation under the current WebMCP API. This limitation must be documented honestly. The safety design compensates by keeping persistence outside site tools, requiring the visible page Keep path, and verifying actual host behavior end to end.

Commit metadata includes:

- Proposal ID.
- Base committed revision.
- Final proposal revision.
- Successful operation IDs.
- Preview integrity receipts.
- Trigger `confirmed_page_keep`.

It contains no full natural-language prompt.

### Public errors and recovery

Implements: `prd.md > Epic 6.3`, `Epic 7`, `Epic 9`, all PRD edge cases.

Public error codes are stable, bounded, and do not embed raw values:

```text
UNSUPPORTED_HOST
INVALID_MANIFEST
INVALID_INPUT
UNKNOWN_CONTROL
UNAVAILABLE_CONTROL
INVALID_VALUE
UNKNOWN_TARGET
CAPABILITY_UNAVAILABLE
ASSET_SOURCE_REJECTED
ASSET_FETCH_FAILED
ASSET_DECODE_FAILED
ASSET_TOO_LARGE
STALE_COMMITTED_REVISION
STALE_PROPOSAL_REVISION
PROPOSAL_PENDING
OPERATION_ID_CONFLICT
OPERATION_IN_PROGRESS
VALIDATION_FAILED
PREVIEW_FAILED
PREVIEW_STALE
NO_PROPOSAL
COMMIT_IN_PROGRESS
COMMIT_RETRYABLE
COMMIT_UNCERTAIN
CANCELLED
ADAPTER_FAILURE
```

| Failure | State effect | User-facing recovery |
|---|---|---|
| Unsupported WebMCP | No tools; human UI unchanged | Use normal customizer |
| Invalid manifest | No partial registration | Developer fixes manifest |
| Invalid input/value | No state change | Agent corrects request |
| Asset fetch/decode | Asset not staged; proposal retained | Retry or use studio-name fallback |
| Validation failure | Last reviewable proposal/baseline retained | Explain invalid part; propose alternatives |
| Preview render failure | Restore last reviewable proposal/baseline | Retry coherent proposal |
| Preview capture failure | `PREVIEW_UNAVAILABLE`; Keep disabled | Retry capture or inspect supported fallback |
| Stale committed revision | Proposal discarded/quarantined | Reread; ask whether to incorporate human change |
| Stale proposal revision | No mutation | Reread pending proposal and retry |
| Browser closed | Session proposal lost, not saved | Reopen and recreate from conversation |
| Expected server save failure | `COMMIT_RETRY` | Visible human retry; no repeated local write |
| Unknown commit outcome | `COMMIT_UNCERTAIN` | Reload and verify; never automatic retry/claim |
| Cancellation | Restore stable visible state | Report cancellation honestly |

### Security boundary

Implements: `prd.md > Epic 7`, `Epic 8`, `Epic 10.4`, `Epic 12.3`.

Threats considered:

- Malformed or oversized tool inputs.
- Prototype pollution and unsafe semantic IDs.
- Prompt injection through merchant/user text returned to the agent.
- A malicious or mistaken agent attempting undeclared controls/actions.
- Private adapter data leaking through structural typing.
- Remote asset URLs probing private networks or tracking the shopper.
- SVG/script/external-reference execution.
- Temporary preview side effects reaching autosave, uploads, analytics, or notifications.
- Stale proposals overwriting newer human work.
- Duplicate or uncertain commits.
- Preview URLs exposing private configuration or artwork.
- A judge/public build accidentally containing KORRHAUS secrets or private logic.

Required controls:

1. Strict JSON Schema and repeated runtime validation.
2. `additionalProperties: false` throughout public input schemas.
3. Safe IDs and explicit prototype-key rejection.
4. Hard collection, text, operation, asset, and preview limits.
5. Field-by-field adapter output reconstruction.
6. `untrustedContentHint: true` for user/merchant-originated content.
7. No raw prompts, HTML, private URLs, tokens, file paths, stack traces, or raw asset bytes in tool results.
8. HTTPS/data-only asset sources under manifest policy; no credentials; private-host rejection.
9. Adapter-owned sanitization/rasterization before rendering supplied vector content.
10. Explicit proposal mode with zero-write preview contract.
11. Optimistic concurrency in both core and adapter immediately before Keep.
12. Proposal-ID idempotency for commit and operation-ID idempotency for tools.
13. No automatic retry after unknown commit outcome.
14. Shared abort lifecycle for all page tools.
15. Content Security Policy and dependency review for the public deployment.
16. Public-boundary scanner plus manual review before any publication.

Forbidden site tools/actions remain absent even if the merchant UI contains them:

- Save/Keep/Revert as WebMCP tools.
- Quote acceptance.
- Order submission.
- Checkout/payment.
- Application submission.
- Proof acceptance.
- Customer/project enumeration.
- Confidential price/margin/supplier/administrative access.

### Tote reference integration

Implements: `prd.md > Epic 11`, `Epic 13`.

The final tote human-control inventory must include every visible control actually shipped. Planned minimum inventory:

- Canvas/material weight.
- Body color.
- Handle length/style and exposed handle color if present.
- Reinforcement/construction control if visible.
- Decoration/print method.
- Text content.
- Exposed typography choices.
- Artwork/motif slot.
- Placement.
- Scale.
- Rotation/orientation.
- Variant name.
- Variant quantity.
- Order total.
- Create/duplicate/remove/reorder/set-active variant operations where visible.

The final renderer—not this list—determines the exact inventory. If a control is removed from the human UI, it need not remain merely to satisfy this draft. If added, parity must be updated.

The tote adapter must:

- Use the same manifest, proposal, asset, preview, validation, and review interfaces as KORRHAUS.
- Persist only to local storage after Keep.
- Count preview, restore, local-write, and commit calls in test-only/public-audit state.
- Support deterministic reset for judging without hidden backend data.
- Contain no KORRHAUS branding, copied renderer, pricing, customer data, or private services.

### KORRHAUS private integration

Implements: `prd.md > Epic 12`.

Planning sequence:

1. Read-only inventory of the real current customer controls and state transitions.
2. Identify existing renderer entry points, autosave paths, artwork paths, revision sources, and Keep-equivalent persistence.
3. Define a private adapter entirely inside the existing application boundary.
4. Import the public package; never copy KORRHAUS code into the public core.
5. Verify locally against synthetic/non-customer fixtures.
6. Deploy at zero traffic or equivalent isolated QA only after explicit implementation/deployment approval.
7. Verify normal customer UI and proposal isolation.
8. Promote only through a separate explicit production approval gate.

The private adapter must not use DOM clicking as its primary state integration. It must call narrow existing state/render/validation/persistence functions or an equally reliable internal interface.

KORRHAUS evidence must state:

- Tested application version/build.
- Tested control-inventory version.
- Public core version/hash.
- Verification date.
- Environment: local, isolated QA, zero traffic, or real production.
- Whether normal autosave/uploads/notifications were actually verified.

The live site remains supporting proof, not the only reproducible judge dependency.

## External APIs And Dependencies

### WebMCP and host documentation

- [WebMCP Community Group specification](https://webmachinelearning.github.io/webmcp/) — normative draft API shape and security model.
- [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp) — Chrome 149+ origin trial/testing flag and inspector path.
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) — `document.modelContext`, registration, execution, cancellation, and origin behavior.
- [Chrome WebMCP evaluations](https://developer.chrome.com/docs/ai/webmcp/evals) — deterministic and probabilistic tool/e2e evaluation guidance.
- [OpenAI site-tools guide](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app) — current ChatGPT desktop built-in-browser availability, live-page requirement, and safety prompts.

Current implementation rule: use `document.modelContext`; do not add new `navigator.modelContext` dependencies. Because WebMCP is experimental and changing, exact API behavior is rechecked immediately before implementation and before the final browser evidence run.

### Toolchain

- [TypeScript](https://www.typescriptlang.org/docs/) — strict types and ESM build.
- [Vite](https://vite.dev/guide/) — static tote development/build.
- [esbuild](https://esbuild.github.io/) — browser bundle.
- [Vitest](https://vitest.dev/guide/) — deterministic tests.
- [Playwright](https://playwright.dev/docs/intro) — actual-browser and responsive verification.

Dependencies are minimized. A new runtime dependency requires a documented reason, license check, bundle review, and security review. The package should prefer platform APIs for abort, blobs, canvas, structured clone, cryptographic hashes, and DOM lifecycle.

### Hosting

The public tote/judge bundle is static-host compatible. The current recommended deployment is the already planned single static public host. Hosting must provide:

- HTTPS.
- Stable versioned deployment.
- Correct MIME types.
- Content Security Policy and security headers.
- Origin-trial token/header or equivalent when required by Chrome.
- Cache control that lets evidence link to an immutable build while the main URL remains usable.

A dynamic preview service is explicitly absent from the initial architecture. It may be introduced only after the static preview gate fails and a new bounded data-lifecycle design is approved.

## AI Usage

### Runtime responsibility

CoDesign WebMCP does not run its own product-design model or remote agent. The shopper's host agent supplies the language-model reasoning.

The agent is responsible for:

- Interpreting the shopper's intent.
- Choosing merchant-declared capabilities and values.
- Translating subjective direction into typed operations.
- Sequencing the two or three coherent visual passes.
- Presenting concise progress.
- Explaining assumptions and merchant warnings.
- Asking focused clarification only when necessary.
- Showing visual previews before asking to save.
- Asking action-time confirmation before activating page Keep.

The merchant/core remain responsible for:

- Allowed capabilities and values.
- Structural validation.
- Product-specific validation.
- Rendering.
- State isolation.
- Revisions and atomicity.
- Persistence.

The agent cannot override a rejected operation by describing it differently.

### Artwork generation

CoDesign WebMCP may consume an asset created or supplied through the host agent, but it is not an image-generation model. The challenge must distinguish:

- Agent or customer creates/provides asset.
- CoDesign stages, sanitizes, positions, transforms, previews, and conditionally commits it.

No image-generation API key is required by the public tote runtime.

### Evaluation AI

Model-based tool-selection evals may use a developer-supplied API key in a local/CI secret environment. They are optional for clean-clone runtime use and must never be embedded in browser code, committed, printed, or required to run deterministic tests.

Evaluation prompts test:

- Direct configuration requests.
- Vague creative briefs.
- Subjective revisions.
- Multi-variant targeting.
- Missing artwork fallback.
- Invalid and stale states.
- Attempts to order, expose pricing, or bypass Keep.
- Prompt-injection content in names, labels, and asset metadata.

## Risks And Verification

### Deterministic verification

#### Manifest and inventory

- Accept complete valid manifests.
- Reject unknown fields, unsafe keys, duplicate IDs, bad bounds, oversized schemas, unsupported types, and invalid slot/control references.
- Fail parity when any visible customer control is unmapped.
- Verify exclusions require a reason and cannot hide a mapped customer design control silently.

#### Operations and proposal engine

- Apply mixed control/variant/asset operations atomically.
- Preserve last reviewable state on failed refinement.
- Restore exact baseline on failed first proposal.
- Enforce base/proposal revisions at every async boundary.
- Reject stale and conflicting operation IDs.
- Deduplicate identical retries.
- Abort cleanly.
- Never persist during read/list/stage/apply/preview/validate/revert.

#### Assets

- Accept allowed bounded fixtures.
- Reject disallowed MIME, oversized data, private hosts, unsafe URLs, bad redirects, decode failures, malicious SVG/external references, and stale handles.
- Verify bytes/URLs do not leak into unrelated tool output.
- Verify Revert and teardown release handles.
- Verify Keep imports each staged asset at most once.

#### Preview

- Capture correct variant/surface for current proposal revision.
- Reject stale/mismatched artifacts.
- Bound dimensions/bytes/alt text.
- Enter `PREVIEW_UNAVAILABLE` on capture failure.
- Block Keep until current preview readiness exists.
- Retry without new proposal/save.

#### Keep/Revert

- Direct page Keep and chat-directed page activation use the same controller.
- Duplicate Keep saves once.
- Stale Keep performs zero writes.
- Revert performs zero writes and restores exact baseline.
- Known server failure does not repeat local write.
- Unknown outcome does not auto-retry or claim success.

### Tool-selection and agent evals

The eval corpus includes at least:

1. Read before mutation.
2. Capability lookup before unknown/conditional fields.
3. Complete first tote collection from a vague brief.
4. Three-pass foundation/branding/variant sequence.
5. Real asset staging and attachment.
6. Named-variant subjective refinement.
7. Ambiguous variant clarification without mutation.
8. Invalid atomic batch and valid-alternative response.
9. Preview retrieval after each full proposal/revision.
10. No Keep claim before inline preview.
11. Explicit confirmation before page Keep activation.
12. Order/payment/quote refusal.
13. No customer/private-pricing enumeration.
14. Prompt-injection resistance in tool results.
15. Closed-page honest not-saved response.

Each eval records expected tool sequence, required/forbidden calls, argument invariants, and acceptable final-outcome criteria. Model pass rates supplement—not replace—deterministic and actual-browser verification.

### Actual-browser verification

#### Ordinary human browser

- Desktop and mobile layout.
- All visible controls and preview outputs.
- Local save behavior before and after agent mode.
- No proposal UI when no proposal exists.
- No console errors or horizontal overflow.
- Accessibility names, focus, disabled state, and keyboard operation.

#### Chrome native WebMCP

- Correct tool list from the real page.
- Schemas parse and tools execute through `document.modelContext`.
- Natural-language inspector selects expected tools.
- Two/three coherent passes visibly update renderer.
- Real asset stages and renders.
- Preview artifacts correspond to the current revision.
- Cancellation and stale-state behavior work.
- Human UI still works when WebMCP flag/origin support is absent.

#### ChatGPT built-in browser

- User starts in conversation and selects the tote/KORRHAUS option.
- ChatGPT opens the correct page.
- Site tools are discovered from that live page.
- Chat shows concise progress.
- Browser visibly evolves through coherent passes.
- Inline preview image/screenshot appears in chat.
- Real asset is visible.
- Refinement changes the correct variant.
- Explicit confirmation precedes page Keep activation.
- Saved result is reread and shown.
- Revert/no-save and preview-failure cases are exercised separately.

Source inspection, unit tests, simulated tool calls, Playwright screenshots, or a healthy deployment alone do not prove the ChatGPT journey.

### Visual verification

- Capture first proposal and revision for each tote variant.
- Compare browser render with inline chat preview for the same proposal revision.
- Verify text, artwork, placement, scale, rotation, color/material, and variant differences are actually visible.
- Verify proposal status supports rather than dominates the visual canvas.
- Verify desktop and mobile review controls do not obscure the product.
- Verify KORRHAUS normal-customer screenshots before and after feature-gated integration.

### Negative and safety cases

- Unsupported browser and disabled site tools.
- Malformed manifest/adapter output.
- Unknown control/variant/element.
- Invalid control type/value.
- Too many operations/variants/assets.
- Asset fetch/decode/CORS failure.
- Prompt injection in studio name, variant name, option label, validation message, or asset metadata.
- Human/external revision during each async phase.
- Abort during asset, validation, preview, capture, restore, and commit.
- Preview transport unavailable.
- Duplicate operation and duplicate Keep.
- Expected save failure and unknown outcome.
- Attempted order, checkout, quote, price, customer, supplier, or admin request.
- Page close/refresh before Keep.

### Critical feasibility gates

#### Gate 0A — inline ChatGPT preview

Pass only when an actual renderer export or genuine browser screenshot is displayed inline in the ChatGPT conversation and can be matched to the current proposal revision. Text and bare links fail.

If static transport fails, stop preview expansion and design the minimal same-origin endpoint. Do not quietly weaken the PRD.

#### Gate 0B — ChatGPT asset transport

Pass only when an actual user/agent-supplied supported image reaches the temporary asset tool, renders, reverts without persistence, and commits only through Keep.

If conversation attachments cannot become an allowed source, stop and choose an honest supported transport before claiming arbitrary artwork.

#### Gate 0C — Chrome native WebMCP

Pass only when the public page registers and executes the same six contracts in Chrome 149+ under the official testing/origin path. A generic browser automation script that bypasses `document.modelContext` fails.

#### Gate 0D — page Keep from confirmed chat

Pass only when the shopper confirms the exact proposal in chat, the agent activates the existing page Keep controller, one commit occurs, and chat rereads the saved revision. A direct site-tool save fails the boundary.

No broad manifest, tote-polish, or KORRHAUS implementation work should outrun these four gates.

### Architecture self-review

#### Finding 1 — inline images are host behavior, not guaranteed by WebMCP

WebMCP returns serializable tool results but does not standardize an MCP image-content block. The preview bridge can produce strong artifacts, but only actual ChatGPT behavior proves inline display. This is why Gate 0A precedes feature expansion.

#### Finding 2 — chat confirmation is not page-verifiable

The current WebMCP callback exposes cancellation, not a trustworthy conversation-confirmation receipt. A separate save tool would falsely imply a security guarantee the page cannot prove. The selected design keeps persistence on the visible page controller and verifies host sequencing end to end.

#### Finding 3 — arbitrary attachment transport may be the hardest technical risk

The core can define a safe asset contract, but a host may not expose conversation attachments as fetchable/data URLs acceptable to a page. The challenge must prove one real transport before claiming agent-controlled artwork. A hard-coded logo or DOM-only upload does not pass.

#### Finding 4 — manifest breadth can become a false universal renderer

The finite control kinds cover common interaction values, not product rendering. Complex semantics stay in adapter callbacks. New declarative rule languages, renderer DSLs, and automatic DOM adaptation are cut unless a demonstrated tote/KORRHAUS control cannot be represented.

## Demo And Submission Flow

### Stable tote judge flow

1. Shopper asks for 100 North Form studio totes in two variants.
2. ChatGPT presents/selects the known tote reference and opens it.
3. Chat shows short progress: opening, creating direction, checking rules.
4. Foundation pass visibly sets material, colors, handles, and quantities.
5. Branding pass stages an actual supplied mark and visibly applies text/artwork, placement, scale, and rotation.
6. Collection pass creates the second named variant and requested split.
7. Chat receives one inline preview per variant plus concise assumptions/warnings and “not yet saved.”
8. Shopper requests a subjective refinement to only the staff variant.
9. Browser updates the correct variant and chat receives its refreshed inline preview.
10. Validation reports only merchant-declared invalidity/warnings.
11. Shopper says to keep the proposal; ChatGPT asks explicit action-time confirmation.
12. After confirmation, the agent activates page Keep.
13. State is reread, one commit is proven, and chat shows the final saved preview.

### Required negative demonstration/evidence

- Invalid atomic operation leaves the current inspected design intact.
- Preview-capture failure blocks Keep and can retry.
- Another-tab/external change makes the proposal stale.
- Revert restores exact baseline with zero writes.
- No WebMCP order/quote/payment/private-data tools exist.
- Ordinary Chrome/human use works without WebMCP.

### KORRHAUS proof

After separate implementation and release approval:

1. Show the real Shopify Sock Designer—not a public copy.
2. State tested version/date and that KORRHAUS keeps evolving.
3. Use the same public six-tool/product lifecycle through the private adapter.
4. Demonstrate meaningful multi-control visual creation, actual asset/text treatment, variants, validation, and inline preview.
5. Show that normal customer autosave/uploads/notifications remain unaffected outside proposal mode.
6. Stop at saved design; do not order, quote, or expose private data.

The tote is sufficient for reproducible judging. KORRHAUS strengthens impact and credibility but is not the single point of failure.

### First-15-seconds sequence

- Begin with a normal shopper sentence, not architecture.
- Show the selected compatible tote surface.
- Show the product visibly changing while chat reports concise progress.
- Show the first inline visual result before explaining package internals.

Message: **Chat is the creation interface for customizable Shopify products.**

### Evidence package

- Immutable public repository commit/hash.
- Clean-clone install/build/test transcript.
- Stable public tote URL and build hash.
- Manifest/inventory parity report.
- Deterministic test report.
- Chrome native WebMCP tool/eval evidence.
- ChatGPT actual conversation/browser evidence.
- Inline preview and asset proof.
- Keep-once and Revert-zero-write evidence.
- Negative/security case report.
- Public/private boundary scan.
- Pre-existing KORRHAUS baseline versus challenge work.
- Dated KORRHAUS integration proof, if approved and completed.

Any video or Devpost media is prepared later only from verified evidence and official submission requirements; producing a video is not an implementation dependency in this specification.

## Build Order For Checklist

This heading is the authoritative source for `$build-checklist`. Implementation still requires explicit approval after the checklist is reviewed.

### Phase 0 — feasibility gates before expansion

1. Create the smallest manifest/tool proof necessary for the four Gate 0 checks.
2. Verify ChatGPT inline preview.
3. Verify real asset transport into temporary proposal.
4. Verify Chrome native `document.modelContext` execution.
5. Verify chat confirmation followed by page Keep/save-once.

Acceptance: all four gates have actual-host evidence, or implementation stops for a product/architecture decision.

### Phase 1 — core contract 2.0

1. Types and runtime manifest validator.
2. Inventory parity harness.
3. Canonical state guard.
4. Typed operations and detached reducer.
5. Proposal engine/state machine.
6. Asset-handle lifecycle.
7. Preview bridge.
8. Review controller.
9. Six WebMCP tools.
10. Contract/unit/negative tests.

Acceptance: deterministic suite proves atomicity, zero-write preview/revert, revisions, idempotency, sanitization, and tool boundaries.

### Phase 2 — full public tote integration

1. Finalize the tote human UI/control inventory.
2. Map every control to manifest 2.0.
3. Implement real artwork staging and transform controls.
4. Implement multi-variant operations and quantity consistency.
5. Implement visible three-pass rendering.
6. Implement per-variant preview capture.
7. Wire Keep/Revert and local-storage persistence.
8. Verify ordinary non-agent UI.

Acceptance: every visible tote control passes parity; the complete judge flow works from a clean clone without KORRHAUS services.

### Phase 3 — browser, agent, and visual verification

1. Playwright human/proposal suites.
2. Chrome origin-trial/testing-flag verification.
3. Tool-selection and safety evals.
4. ChatGPT actual end-to-end flow.
5. Inline preview/asset/revision correlation.
6. Desktop/mobile visual/accessibility review.

Acceptance: evidence proves the actual experience on each claimed host; unsupported combinations are documented rather than inferred.

### Phase 4 — documentation and public reproducibility

1. README quick start.
2. Integration guide.
3. Manifest 2.0 reference.
4. Browser support matrix.
5. Architecture/security/testing docs.
6. Public/private scanner.
7. Judge guide and pre-existing baseline.

Acceptance: a clean-clone developer can run the tote, understand the adapter, and verify the public boundary without private access.

### Phase 5 — KORRHAUS private adapter, separately approval-gated

1. Read-only control/state/autosave/artwork inventory.
2. Private adapter design review.
3. Local synthetic integration.
4. Full parity and regression tests.
5. Isolated/zero-traffic deployment verification.
6. Separate production promotion decision.

Acceptance: versioned parity and normal-customer safety are demonstrated. No live traffic promotion occurs without explicit approval.

### Phase 6 — release and submission, separately approval-gated

1. Freeze public release candidate and evidence hashes.
2. Deploy stable tote/judge site.
3. Verify public URL in actual supported hosts.
4. Publish repository only after boundary review and approval.
5. Prepare official submission fields/media from verified facts.
6. Submit only after explicit final approval.

Acceptance: deployed, public, and submitted states are independently verified and never conflated.

## Specification Acceptance Criteria

This architecture is ready for implementation approval only when the checklist preserves all of the following:

1. Manifest 2.0 and inventory parity replace the narrow control model.
2. Six tools are used exactly as bounded; no WebMCP save/commercial/private action is added.
3. Both ChatGPT built-in browser and Chrome native WebMCP have explicit evidence plans.
4. Ordinary Chrome/human UI remains independent of WebMCP.
5. Real asset staging and inline chat preview are feasibility gates, not assumed features.
6. The merchant renderer remains the visual source.
7. Every proposal batch is atomic and revision-aware.
8. Proposal preview, asset work, validation, capture, and Revert perform zero persistence writes.
9. Page Keep is the only persistence controller and commits once.
10. Autosave, uploads, drafts, and notifications remain normal outside proposal mode.
11. External changes invalidate rather than merge silently.
12. The public tote is static-first, stable, and clean-clone runnable.
13. KORRHAUS remains private, evolving, versioned proof through a narrow adapter.
14. No second Sock Designer is created.
15. Actual browser/agent evidence—not source/tests alone—controls compatibility claims.

## Approval Boundary

This specification completes architecture planning and authorizes only the next planning step: the sequenced implementation checklist.

It does not authorize:

- Editing implementation source to meet this spec.
- Modifying the private KORRHAUS project.
- Installing or registering an origin-trial token.
- Creating a preview endpoint.
- Deploying or changing traffic.
- Publishing or pushing a public repository.
- Publishing an npm package.
- Creating Devpost submission media.
- Submitting to Devpost.

Implementation begins only after the checklist is complete, this architecture and the checklist have been reconciled with `AGENTS.md`, and Felix explicitly approves implementation.
