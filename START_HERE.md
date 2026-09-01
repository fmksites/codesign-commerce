# Start here

Choose the path that matches why you opened this repository.

## Judge or reviewer: see the product first

CoDesign WebMCP makes an existing custom-product designer agent-readable and
agent-operable without replacing its normal visual interface:

> Agent designs. Human approves. Shopify completes the sale.

### Scored temporary-design flow

1. Open the [studio-tote demo](https://codesign-webmcp.pages.dev/tote/?reset=true)
   in a supported WebMCP client.
2. Give the agent this ordinary shopper brief—there is no tool name or WebMCP
   incantation:

   > I need 100 premium branded studio totes for North Form. Give me a natural customer version and a darker staff version, show me both options, check whether they are ready to make, and do not save anything yet.

3. Watch the real page-tool activity appear only as it happens: inspecting the
   design, reading choices, updating the temporary proposal, capturing previews,
   and checking production readiness.
4. Confirm that the merchant-declared darker-staff direction first renders
   Charcoal at 95% in the upper-left position while Natural stays centered.
   Two temporary 50-tote variants appear and every result still reports
   `persisted: false`.
5. Watch Constraint X-Ray flag that first Charcoal preview as
   production-not-ready, identify its source as **Merchant production rule**,
   localize the safe-zone conflict, and offer only the merchant-declared 78%
   repair.
6. Confirm the agent applies that repair without a second shopper instruction,
   marks the old Charcoal preview outdated, replaces it with a current preview
   bound to the repaired revision, revalidates production-ready, and leaves
   Natural untouched.
7. Choose **Revert**. The baseline must return with zero persistence writes.

The collapsed **Agent tools active in this tab** disclosure is generated from
the six tools that actually registered. It reports `4 inspect · 2 temporary
design · 0 save/order/payment`; access belongs to this tab and ends when the
page closes.

### Separate Keep and Configuration Passport flow

Reset, run the primary brief again, inspect both current previews, and then use
the webpage's visible **Keep** control once. A successful page-owned Keep—not a
WebMCP save tool—must create exactly one committed revision and one **Verified
configuration** receipt. The receipt binds the committed revision, readiness,
preview integrity, and an opaque Shopify-safe reference. It does not place an
order or expose artwork, customer, price, prompt, or private merchant data.

The complete expected behavior and recovery checks are in
[docs/JUDGE_GUIDE.md](./docs/JUDGE_GUIDE.md).

### Release-verification gate

The improved flow is not deployed evidence until the exact commit has been
deployed and repeated in the clients named in
[docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md). At the time of this edit,
the local candidate passes 28 test files / 235 tests plus desktop and 390 px
browser QA, but exact-current final-client verification is still pending. Do
not infer it from local tests or older dated evidence.

## Merchant or integrator: understand the reusable layer

Read [docs/INTEGRATION_QUICKSTART.md](./docs/INTEGRATION_QUICKSTART.md). CoDesign
keeps your existing customer interface, renderer, and production rules. You
supply a public-safe manifest and a narrow adapter to existing state, render,
validation, and confirmation functions. It is not a universal renderer or a
zero-code installation.

## Developer: reproduce everything locally

```bash
git clone https://github.com/fmksites/codesign-webmcp.git
cd codesign-webmcp
npm ci
npm run verify
npm run dev --workspace @codesign-webmcp/studio-tote
```

Requirements: Node.js 22.12 or newer and npm. The tote remains a complete normal
human configurator when `document.modelContext` is unavailable.

## Evidence and project history

- Current browser claims: [docs/BROWSER_SUPPORT.md](./docs/BROWSER_SUPPORT.md)
- Current verification map: [docs/evidence/README.md](./docs/evidence/README.md)
- Pre-challenge attribution: [docs/evidence/PRE_CHALLENGE_BASELINE.md](./docs/evidence/PRE_CHALLENGE_BASELINE.md)
- Historical planning and superseded evidence: [docs/archive/README.md](./docs/archive/README.md)

Historical files may mention the former CoDesign Commerce name, earlier
five-tool prototypes, old URLs, or old test counts. They are retained only as
timestamped development evidence and are not current product instructions.
