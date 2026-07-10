# skill-boundary-audit

Audit agent skill Markdown for side effects, approvals, required inputs, required tools, and missing safety boundaries.

## Quickstart

```bash
npm test
npm run smoke
node bin/skill-boundary-audit.js fixtures/skill-safe.md --format json
```

## Examples

```bash
skill-boundary-audit ./SKILL.md
skill-boundary-audit ./skills/*/SKILL.md --format markdown --fail-on high
```

## Library

```js
import { auditSkillMarkdown } from "skill-boundary-audit";

const audit = auditSkillMarkdown(markdown, { source: "SKILL.md" });
```

## Safety Notes

The CLI reads only explicit file paths. It does not execute skills, call network services, mutate repositories, or approve actions.

## Limitations

Findings are heuristic. Treat the report as review support, not a formal security verdict.
