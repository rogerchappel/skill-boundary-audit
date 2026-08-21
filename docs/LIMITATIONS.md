# Limitations

- Keyword findings can produce false positives.
- Remote create/open detection is limited to named issue, pull-request, release, and
  repository objects; push detection requires an explicit remote destination.
- Prohibitions suppress action and mutation findings only; credential, network, and
  approval keywords remain visible for review even when they describe prohibited use.
- List-scoped prohibitions require an explicit colon-terminated lead-in immediately before
  the ordered or unordered list; prose and separate lists terminate that scope.
- Missing section checks do not prove a section is complete.
- ATX section headings follow Markdown's zero-to-three-space indentation rule; four-space
  indented heading-like text is treated as code rather than a section.
- Fenced and four-space- or tab-indented code is excluded from section, finding, and tool
  detection. Detection resumes on the next non-indented line.
- Tool detection is intentionally narrow and only recognizes common tool names.
- The audit is static and does not evaluate dynamic instructions.

Use this project as a review assistant, not as an authority on whether a skill is safe to run.
