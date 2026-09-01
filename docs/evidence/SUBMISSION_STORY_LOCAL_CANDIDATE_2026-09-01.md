# Submission story local candidate

**Date:** 1 September 2026  
**Scope:** public CoDesign WebMCP repository and editable Devpost project only  
**Release status:** locally verified; not pushed or deployed

## Purpose

The submission previously made the working tote configurator more prominent
than the reusable product being submitted. This candidate makes the hierarchy
explicit and consistent:

1. **CoDesign WebMCP** is the submitted open-source integration protocol and
   runtime layer for existing custom-product configurators.
2. **Studio Tote** is the anonymous, reproducible public reference
   implementation used for judging and local installation.
3. **KORRHAUS** is the live Shopify merchant proof that the same public core is
   actively integrated into an existing production configurator. Its private
   adapter is not part of the public repository.

The short version used across the submission is:

> The protocol is the submission. Studio Tote demonstrates it publicly.
> KORRHAUS proves it on Shopify.

## Changed surfaces

- direct deployment-root redirect to the Studio Tote reference;
- repository README and `START_HERE.md`;
- judge guide and video script;
- canonical Devpost submission copy;
- editable Devpost project description; and
- static-release regression assertions.

The separate judge homepage was removed after review because it added an
unnecessary explanation step before the working product. The deployment root
now redirects directly to `/tote/?reset=true`. The video script keeps
persistent context labels on screen so the tote reference and KORRHAUS
implementation cannot be mistaken for two submitted products.

## Verification

- complete `npm run verify`: passed;
- 28 test files / 235 tests: passed;
- strict typecheck: passed;
- production, Shopify-overlay and browser builds: passed;
- judge-site, public-boundary and documentation checks: passed;
- 27 evaluation cases and 25/25 tote parity checks: passed;
- root redirect target and fallback link: passed;
- obsolete landing assets absent from the release artifact: passed.

The editable Devpost project was updated with the same hierarchy. Its video URL
and submission timestamp remain empty. No Git push, Cloudflare deployment,
Shopify change, video publication or final Devpost submission was performed as
part of this candidate.
