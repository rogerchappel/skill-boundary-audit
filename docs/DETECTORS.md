# Detector Reference

## High Severity

- external action language: publish, send, delete, merge, deploy, approve, message, update
- credential language: secret, token, API key, credential, password, OAuth (singular or plural)
- missing safety section

## Medium Severity

- network or remote-service language
- local write or mutation language
- approval language
- missing validation, examples, inputs, tools, or approvals sections

## Review Guidance

High severity means a human should inspect the skill before use. Medium severity usually means the skill needs clearer boundaries or documentation.

Fenced code examples are excluded from section, tool, and finding detection. Explicit
prohibitions such as “Never publish secrets or send credentials” are treated as safety
boundaries rather than instructions. A conjunction (`and`, `but`, `however`, `instead`,
or `then`) or punctuation starts a new clause, so later affirmative action language on
the same source line remains reportable. Repeat the prohibition in each clause when the
boundary should apply to multiple actions.
