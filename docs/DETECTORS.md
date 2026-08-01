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

Fenced code examples are excluded from section, tool, and finding detection. A leading
prohibition is treated as applying across a coordinated action list separated by commas,
`and`, or `or`, such as “Never send, post, or publish content.” Contrast and sequence
words (`but`, `however`, `instead`, and `then`) and sentence punctuation start a new
clause. Affirmative action language after one of those boundaries remains reportable;
repeat the prohibition after the boundary when it should apply to that clause too.
