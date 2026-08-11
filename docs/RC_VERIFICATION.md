# Release Candidate Verification

Recorded for `release-candidate/skill-boundary-audit`.

| Command | Result |
| --- | --- |
| `npm test` | pass, 21 tests |
| `npm run check` | pass |
| `npm run smoke` | pass |
| `npm run build` | pass |
| `npm run validate` | pass |
| `npm run package:smoke` | pass |

The risky fixture intentionally exits non-zero under `--fail-on high`; `npm run validate` treats that as the expected gate behavior and then verifies the safe fixture passes.
