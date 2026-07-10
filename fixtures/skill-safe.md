# Local Notes Skill

Use this skill when turning local notes into a draft checklist.

## Required Inputs

- A local Markdown notes file.

## Required Tools

- node

## Side-Effect Boundaries

Read the explicit input file only. Do not call network services or write files.

## Approval Requirements

No approval is required for local read-only analysis.

## Examples

```bash
notes-skill notes.md
```

## Validation Workflow

Run the fixture smoke command before sharing changes.
