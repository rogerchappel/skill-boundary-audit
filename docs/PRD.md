# Product Requirements

## Goal

`skill-boundary-audit` gives agent builders a local, repeatable way to inspect `SKILL.md` files before installation or sharing.

## Users

- maintainers reviewing community skills
- agents preparing an approval summary for a proposed skill
- CI jobs that need a fixture-backed safety check

## MVP Requirements

- Accept one or more Markdown skill files.
- Detect likely side effects, approval requirements, tool references, input requirements, and safety language.
- Report missing sections for safety, validation, and examples.
- Emit Markdown by default and JSON on request.
- Support `--fail-on medium|high` for CI gates.
- Avoid network access and only read explicit input paths.

## Non-Goals

- Proving a skill is safe.
- Executing a skill.
- Calling external scanners or LLMs.

## Success Criteria

- A reviewer can run one command against a skill and understand its main operational boundaries.
- Fixture tests cover risky and quiet skills.
- CLI and library APIs return the same deterministic audit model.
