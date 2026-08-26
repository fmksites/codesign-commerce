# Security policy and public data boundary

CoDesign Commerce is designed around a narrow webpage capability boundary, not broad access to a merchant application.

## In scope for WebMCP

- Allowlisted canonical configuration state.
- Public option IDs and allowed values.
- Temporary visible proposals.
- Public validation outcomes, warnings, and missing decisions.

## Never exposed through WebMCP

- Authentication tokens, API URLs, raw boot objects, or raw merchant state.
- Customer records or project enumeration.
- Exact pricing, wholesale terms, margins, suppliers, or production administration.
- Uploaded file contents.
- Quote acceptance, checkout, orders, payments, or commercial commitments.
- Keep, Revert, Save, or upload tools.

Inputs use bounded JSON schemas with `additionalProperties: false`, semantic IDs, fixed counts and lengths, and prototype-pollution guards. Outputs and error messages are sanitized. Text that may originate with a user is marked untrusted.

Temporary proposal rendering must perform zero storage or network writes. A human Keep action crosses the local commit boundary once. An ambiguous server save is never retried automatically; the page exposes a human retry state instead.

## Reporting a vulnerability

Do not include credentials, customer data, or production exploit details in a public issue. Use the repository owner's private security-reporting channel once the public repository is available.
