# Orchestration

## Agent Flow

1. Gather explicit `SKILL.md` paths from the user or repository.
2. Run `skill-boundary-audit <paths> --format markdown`.
3. Review high-severity findings before installing or applying a skill.
4. Use `--format json` when handing results to another agent or CI gate.

## Side-Effect Boundary

The tool reads only the paths provided on the command line. It does not inspect home directories, call remote services, execute skill instructions, or modify files unless a future output flag is added.

## Failure Handling

- Missing files are input errors.
- Parser findings are report data, not crashes.
- `--fail-on` converts medium or high findings into a non-zero exit for CI.
