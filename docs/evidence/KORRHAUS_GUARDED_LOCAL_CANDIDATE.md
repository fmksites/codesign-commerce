# KORRHAUS guarded local candidate evidence

Date: 27 August 2026
Snapshot captured: 27 August 2026, 12:05 CEST

Status: `PASS_LOCAL_ONLY`

This record covers the replacement integration candidate inside the existing
private KORRHAUS Shopify Sock Designer. It is not a second Sock Designer and it
does not authorize or claim a deployment, production activation, traffic
change, quote/order automation, public hosting, or live-Shopify verification.

## Intended production topology

- The existing KORRHAUS Shopify Sock Designer is the only live sock-configurator
  surface.
- Its ordinary human experience remains unchanged when WebMCP is unavailable or
  disabled.
- The CoDesign runtime loads only for the supported fully-custom route after
  WebMCP activation.
- Agent proposals update the existing visible preview but remain temporary.
- Revert performs no persistence write. Keep is an explicit human action and
  commits through one normal Designer save boundary.
- The public studio tote remains the sole standalone runnable example.

## Exact local snapshot hashes

These hashes identify the inspected private working-tree bytes. The private
application has no committed HEAD, so they are not yet an immutable source or
container-image identity. The fresh no-traffic deployment must create and
record that immutable image boundary.

| Private candidate file | SHA-256 |
|---|---|
| Embedded public core `codesign-commerce.js` | `e3f95e6e51bb6b6044654fa846d1d902e1b921b89979394625be418a2f9db324` |
| Embedded public core source map | `de627487e16297310a3499a6ab3020361a28fbee6a33af033f7c2f4e4deece1a` |
| Designer source JavaScript | `e54835c9c05a9c6500d03d25b31c93ee0f62b8065716e36f628bd4b0776036de` |
| Designer minified JavaScript | `13ffa7d5f239126b1dc8b884d068f4430e272fce752f2c15e669c89d862fee74` |
| Designer source CSS | `21b065639f4db6e79e4615763a98da2d5db3ba7740f2d93eff3b29a554d46944` |
| Designer minified CSS | `6a458c71bea09465e4963a3ec62e7567c4324a87bbffd597ed3788587cf49bf8` |
| Designer page server | `de4e92aaaa8a1e227003892bf85cb7fc5ae667647d1e5303e47485ed547accb2` |
| Designer page unit test | `bb919d26b4f3b3ee92a2c518eb8f8d74d72a01673348e97b68386f0a0097a8b9` |
| Designer browser specification | `163951f346d171d5ed526f41f0118e9e7d95cd272126139d3b8f8e990e3a7984` |
| Private integration guide `docs/custom-socks-webmcp-proposal-mode.md` | `f0acb9b0b39eb948876ba9418a5fe3e8add3f5d69eae802bd8c00ff06aa00973` |

The private Designer JavaScript and CSS references use cache key
`v=20260827-3`, preventing the older pre-hardening asset from being reused.

## Verification results

| Gate | Result |
|---|---|
| JavaScript syntax | `PASS` — `node --check` |
| Private production build | `PASS` |
| Private strict typecheck | `PASS` |
| Private deterministic suite | `PASS` — 40 files, 192 tests |
| Focused artwork/security browser suite | `PASS` — 6/6 desktop and mobile |
| Complete private Designer browser suite | `PASS` — 128 total, 127 passed, 1 intentional desktop skip, 0 failures |

Commands were run from the private application root with Node.js `v24.9.0`,
Vitest `v4.1.10`, and Playwright using its configured Desktop Chrome and iPhone
13 projects with one worker. The full run completed in 3.8 minutes. The sole
skip is `mobile build view keeps proof and active choices visible without
overflow` in the desktop project because that assertion is mobile-only.

The complete browser run includes ordinary rendering, Route 01, Route 02,
mobile layout, localization, autosave with WebMCP both off and on, logo upload,
login return, draft recovery, quote and proof flows, production-spec retention,
and the guarded CoDesign paths.

The CoDesign coverage proves:

- an ordinary browser never loads or mounts the runtime;
- the supported Route 02 registers exactly five bounded tools;
- exact/custom colour editing removes tools until catalog state is restored;
- partial or delayed registration fails closed without locking normal editing;
- production-catalog tool output excludes raw yarn and producer codes;
- Revert causes no local or server persistence writes;
- Keep commits only allowlisted proposal fields through one normal save;
- hidden private Designer fields survive name-only Keep;
- coupled auto-accent changes require an explicit coordinated choice;
- durable artwork is required for production readiness;
- custom grip remains a human-reviewed draft;
- teardown cannot revive a stale proposal or falsely report an authorized Keep;
- the two-colourway North Form flow works through all five tools; and
- executable or externally referenced SVG markup never reaches the rendered
  preview mask, while the original production source remains separately stored.

## External boundary

Not yet proven by this local snapshot:

- no new Cloud Run image or immutable digest exists for these bytes;
- no fresh tagged QA or fixtures-off zero-traffic revisions exist;
- the latest private host bytes have not completed an in-app WebMCP run on a
  deployed revision;
- the real Shopify route has not been live-verified with this candidate; and
- no production-traffic approval or change has occurred.

The earlier `codesign-prod1` zero-traffic candidate is superseded and must never
receive production traffic. A release may proceed only by creating a fresh
tagged QA revision and a fresh fixtures-off zero-traffic revision from the same
new immutable image, verifying both, and confirming ordinary production traffic
is still on the rollback baseline. Production promotion remains a later,
explicit owner approval gate.
