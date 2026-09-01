# Deployment and release runbook

This runbook is preparation only. It does not authorize a public remote,
hosting deployment, KORRHAUS deployment, production traffic, DNS, or submission.

## 1. Freeze the public release candidate

1. Confirm a clean working tree and immutable commit SHA.
2. Run `npm ci` and `npm run verify` from a clean clone.
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

## 4. Deploy the public judge app — approval and provider choice required

This is the binding challenge release. It does not depend on KORRHAUS
production promotion.

1. Push the exact verified public commit after publication approval and confirm
   anonymous clone plus hosted CI.
2. Build the single release artifact with the verified public repository URL:

   ```bash
   CODESIGN_PUBLIC_REPOSITORY_URL=https://github.com/fmksites/codesign-webmcp \
   npm run build:release
   ```

   The builder fails if the working tree is dirty or the repository URL is not
   the expected HTTPS origin. It withholds the KORRHAUS link and does not claim
   a live flagship.
3. Deploy `dist/judge-site/` over HTTPS. Its root redirects directly to the
   deterministic working demo at `/tote/?reset=true`; there is no separate
   marketing or judge landing page.
4. Do not add secrets, authentication, analytics, customer data or private APIs.
5. Verify exact commit metadata, browser bundle and asset hashes, logged-out
   access, cache/security headers, subpath assets, responsive layout, normal
   human fallback and every public link.
6. Run the final journey in each client named as supported on this exact build;
   record unavailable clients as limitations instead of substituting scripted
   calls. The Codex page-scoped host is verified on the current release;
   historical native Chrome proof must be repeated on the final deployment.
   The consumer ChatGPT website path is not supported in the tested session.
7. Retain the provider URL as a fallback even if a branded domain is added.

## 5. Optional no-traffic KORRHAUS deployment — separate approval required

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

## 6. Optional KORRHAUS production promotion — explicit approval required

1. Promote only the verified revision and only after written approval.
2. Verify the actual anonymous English KORRHAUS route in the in-app browser and
   supported Chrome.
3. Confirm no regression in normal human editing, autosave, project restore,
   quote/application/upload flows, or browsers without WebMCP.
4. Keep an immediate rollback revision and document the rollback trigger.

After the actual public English KORRHAUS route passes the separately approved
production verification, rebuild the same public site with the optional
flagship link:

```bash
CODESIGN_PUBLIC_REPOSITORY_URL=https://github.com/fmksites/codesign-webmcp \
CODESIGN_FLAGSHIP_URL=https://korrhaus.nl/en/apps/wholesale/sock-designer \
CODESIGN_FLAGSHIP_VERIFIED=true \
npm run build:release
```

Verify the exact KORRHAUS URL in release metadata and the new artifact hash
before replacing the public artifact. Never set this attestation from local or
zero-traffic evidence.

## 7. Availability window

Keep the submitted repository, the public tote demo, and the live flagship URL
free and accessible through the end of judging: 21 September 2026 at 5:00 PM
PT. Monitor without silently changing the judged build.
