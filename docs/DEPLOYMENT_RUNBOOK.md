# Deployment and release runbook

This runbook is preparation only. It does not authorize a public remote,
hosting deployment, KORRHAUS deployment, production traffic, DNS, or submission.

## 1. Freeze the public release candidate

1. Confirm a clean working tree and immutable commit SHA.
2. Run `npm ci`, tests, typecheck, build, bundle verification, boundary check,
   judge-site verification, documentation check, and eval-corpus/scorer check
   from a clean clone.
3. Record the core browser-bundle SHA-256 and public example asset hashes.
4. Optionally run the retained model-eval corpus only if API access and budget
   are separately authorized; it is not a release or submission gate.
5. Fix or explicitly document every failure before creating a release tag.

## 2. Publish the public repository — approval required

1. Create one public GitHub, GitLab, or Bitbucket repository from the verified
   local history.
2. Confirm no ignored or untracked private material was included.
3. Verify Apache-2.0 is detected and visible in the repository About area.
4. Verify the source visibly contains `document.modelContext.registerTool(...)`.
5. Follow the README from a fresh, logged-out clone.
6. Record the public URL and final commit.

## 3. Build the private flagship release candidate

1. Pin the exact public browser bundle and cache key into the private adapter.
2. Keep `CUSTOM_SOCK_WEBMCP_PROPOSALS_ENABLED` disabled by default.
3. Run focused tests, typecheck, build, the complete Designer regression suite,
   and actual-browser North Form/Revert/Keep checks against the exact build.
4. Record private file hashes without publishing private source.

## 4. No-traffic KORRHAUS deployment — separate approval required

1. Build one tagged QA revision with zero traffic, WebMCP enabled, and synthetic
   acceptance fixtures enabled.
2. Verify revision identity, image digest, configuration, health, HTTP behavior,
   logs, script cache key, bundle hash, tool discovery, full flagship fixture
   flow, and normal no-WebMCP fallback on the tagged revision URL.
3. Deploy the exact immutable QA image digest as a second tagged zero-traffic
   production candidate with acceptance fixtures disabled and WebMCP enabled.
4. Verify the production candidate's identity, configuration, health, logs, and
   asset hash. Confirm ordinary production traffic still targets the recorded
   rollback revision at 100%.
5. Stop and present the evidence before requesting traffic approval.

## 5. Production promotion — explicit approval required

1. Promote only the verified revision and only after written approval.
2. Verify the actual anonymous English KORRHAUS route in the in-app browser and
   supported Chrome.
3. Confirm no regression in normal human editing, autosave, project restore,
   quote/application/upload flows, or browsers without WebMCP.
4. Keep an immediate rollback revision and document the rollback trigger.

## 6. Deploy the public judge app — approval and provider choice required

Do this only after Section 5 has passed on the actual live Shopify route. The
judge landing calls KORRHAUS a live flagship, so deploying it earlier would be
an unsupported product claim.

1. Build the single release artifact with the verified public repository URL,
   the exact flagship URL
   `https://korrhaus.nl/en/apps/wholesale/sock-designer`, and
   `CODESIGN_FLAGSHIP_VERIFIED=true`. `npm run build:release` fails if the
   working tree is dirty, either URL is absent, the flagship URL differs, or
   the live-verification attestation is absent.
2. Deploy `dist/judge-site/` from that public commit over HTTPS. Its root is the
   English judge landing and `/tote/` is the deterministic portability demo.
   Every KORRHAUS call to action must open the existing real Shopify Designer.
   The artifact and repository must not expose a synthetic second Sock Designer.
3. Do not add secrets, authentication, analytics, customer data, or private APIs.
4. Show the exact commit SHA in the deployed app and `site-metadata.json`.
5. Preserve the tote's anonymous deterministic reset path and the repository's
   package, adapter, and safety-test instructions.
6. Verify logged-out access, cache headers, asset hashes, tote tools and flow,
   responsive layout, navigation, reload, browser-without-WebMCP fallback, and
   every link to the live KORRHAUS route.
7. Retain the provider URL as a fallback even if a branded domain is added.

## 7. Availability window

Keep the submitted repository, the public tote demo, the judge landing, and the
live flagship URL free and accessible through the end of judging: 21 September
2026 at 5:00 PM PT. Monitor without silently changing the judged build.
