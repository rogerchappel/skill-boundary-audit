# Detector Reference

## High Severity

- external action language: send, post, publish, delete, merge, deploy, approve, purchase,
  email, message, write to, and update
- credential language: secret, token, API key, credential, password, OAuth (singular or plural)
- missing safety section

## Medium Severity

- network or remote-service language
- local write or mutation language: write, edit, modify, patch, create file, delete file,
  commit, and push
- approval language
- missing validation, examples, inputs, tools, or approvals sections

## Review Guidance

High severity means a human should inspect the skill before use. Medium severity usually means the skill needs clearer boundaries or documentation.

Fenced and four-space- or tab-indented code examples are excluded from section, tool,
and finding detection. Normal prose after an indented code block remains visible. CommonMark
backtick fences are opened only when their info string contains no backtick; tilde fence
info strings may contain backticks. Valid fences may close with a longer run of the same
marker. A leading
prohibition is treated as applying across a coordinated action list separated by commas,
`and`, or `or`, such as “Never send, post, or publish content.” Lead-ins
as `Do not:` and `Never perform these actions:` suppress action findings in the immediately
following ordered or unordered Markdown list. Later prose and separate lists start a new scope.
Explicit boundaries such as “No writes” are also recognized. A prohibition suppresses only actions that follow it;
affirmative actions earlier in the same clause remain findings. Contrast and sequence
words (`but`, `however`, `instead`, and `then`) and sentence punctuation start a new
clause. Affirmative action language after one of those boundaries remains reportable;
repeat the prohibition after the boundary when it should apply to that clause too.
Prohibition suppression applies only to external-action and local-write findings. Other
evidence on the same line, including credential, network, and approval language, remains
reportable with its original line evidence.

External-action and local-write verbs recognize their common English inflections (for
example, `publishes`, `published`, and `publishing`). Matching uses whole words and
explicit verb forms so unrelated words that merely contain a verb stem are not findings.
