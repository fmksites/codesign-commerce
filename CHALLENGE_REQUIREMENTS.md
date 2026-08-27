# Challenge Requirements

Snapshot rechecked against the official Devpost rules, Devpost overview,
OpenAI challenge page, Chrome guidance, OpenAI site-tools guide, and Shopify
WebMCP documentation on 27 August 2026. Recheck again immediately before final
submission because the standard and challenge pages can change.

## Deadline

- 3 September 2026 at 1:00 PM PDT.
- Equivalent local target: 3 September 2026 at 22:00 CEST.
- Internal target should be 1 September to preserve a two-day buffer.
- The OpenAI marketing page currently shows a later 5:00 PM PT deadline. The
  Devpost overview and binding official rules both show 1:00 PM PT, so this
  project uses the earlier deadline.

## Required Submission Materials

- A working live URL accessible through ChatGPT's in-app browser or Chrome 149+ with WebMCP enabled.
- An English text description explaining:
  - why the use case fits WebMCP;
  - how the user experience improves;
  - what people and agents can do together that was previously difficult or impossible;
  - how WebMCP was implemented.
- A public YouTube demo with audio, under three minutes.
- A public GitHub, GitLab or Bitbucket repository.
- All source code, assets and instructions required for the submitted project to function.
- A visible open-source license at repository level.
- The license must be detectable by the repository host and visible in the
  repository page's About area.
- Visible `document.modelContext.registerTool(...)` implementation.
- English final submission materials.
- No unlicensed third-party trademarks, music, or copyrighted video material.

## Existing Product Eligibility

An existing application may be entered when it is meaningfully extended with WebMCP after the challenge start. The submission must clearly distinguish pre-existing work from the new challenge work and provide timestamped evidence.

## Judging Criteria

- WebMCP Leverage: non-trivial and skillful protocol use.
- Execution: a complete, coherent and runnable product experience.
- Potential Impact: a credible solution for a real audience.
- Creativity and Ambition: novelty and meaningful differentiation.

## Testing Requirements

- Verify that the live URL is accessible to judges.
- Verify that WebMCP tools are discoverable in the supported browser.
- Prefer an anonymous judge path; provide credentials only if authentication is unavoidable.
- Keep the submission available throughout judging.
- Keep access free and unrestricted through 21 September 2026 at 5:00 PM PT.
- An entrant may submit only one entry.

## Important Interpretation

The challenge is about WebMCP tools registered in the live webpage. A remote MCP server alone does not satisfy this requirement.

## Current implementation guidance applied

- Keep tool inputs narrow, declare side effects, validate again at runtime, and
  return enough structured information to verify the result.
- Preserve the normal interface for browsers without WebMCP.
- Mark read-only tools with `readOnlyHint` and outputs containing user or
  external content with `untrustedContentHint`.
- Do not opt into cross-origin exposure; no `exposedTo` origins are configured.
- Keep tool descriptions and outputs concise enough for current agent budgets.
- Keep deterministic tool/runtime evidence and an optional model-evaluation
  corpus, but do not represent scripted calls or synthetic scorer fixtures as
  an independent model result. The owner removed the API-backed run as a local
  submission gate; the official rules do not require one.

Primary source URLs are listed in `SOURCE_LINKS.md`.
