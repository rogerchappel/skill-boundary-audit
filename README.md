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
Unknown options and inputs that cannot be read as files are reported on stderr and exit with status 2 before any audit output is written. A matched `--fail-on` threshold exits with status 1.

## Limitations

Findings are heuristic. Treat the report as review support, not a formal security verdict.

External-action and local-write detection recognizes common verb inflections while using
whole-word matches to avoid treating unrelated words as actions.

Action detection treats a leading prohibition as applying across a coordinated verb list
separated by commas, `and`, or `or` (for example, “Never send, post, or publish”).
An explicit prohibition lead-in ending in a colon also governs its immediately following
Markdown list. That scope ends before later prose or a separate list.
Explicit `no <action>` boundaries such as “No writes” are also recognized. A prohibition
must precede the action it suppresses, so earlier affirmative actions remain reportable.
Contrast and sequence boundaries such as `but`, `however`, `instead`, `then`, or sentence
punctuation start a new clause, so affirmative actions after those boundaries are still reported.

## Development

Use the checked-in package scripts as the public smoke surface:

```sh
git clone https://github.com/rogerchappel/skill-boundary-audit.git
cd skill-boundary-audit
npm install
npm run check
npm run test
npm run smoke
npm run build
npm run package:smoke
```

The CI workflow runs the same commands so local verification matches the pull-request gate.
