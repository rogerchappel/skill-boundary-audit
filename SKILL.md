# Skill Boundary Audit

Use this skill when reviewing an agent skill before installation, publication, CI admission, or handoff to another agent.

## Required Inputs

- One or more local `SKILL.md` or skill-like Markdown files.
- Optional severity threshold for CI with `--fail-on medium|high`.

## Required Tools

- Node.js 20 or newer.
- Local filesystem read access to the files being audited.

## Side-Effect Boundaries

This skill only reads explicit local input files and prints a report. It must not execute the target skill, call network services, approve actions, or modify repositories.

## Approval Requirements

No approval is required for local read-only audits. Ask the user before scanning directories broadly or before publishing audit results.

## Examples

```bash
skill-boundary-audit ./skills/example/SKILL.md
skill-boundary-audit ./skills/*/SKILL.md --format json --fail-on high
```

## Validation Workflow

Run `npm test`, `npm run check`, and `npm run smoke` before relying on a changed detector set.
