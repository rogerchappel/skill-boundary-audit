# Release Candidate Verification

Recorded for `release-candidate/skill-boundary-audit`.

| Command | Result |
| --- | --- |
| `npm test` | pass, 5 tests |
| `npm run check` | pass |
| `npm run build` | pass |
| `npm run validate` | pass |

The risky fixture intentionally exits non-zero under `--fail-on high`; `npm run validate` treats that as the expected gate behavior and then verifies the safe fixture passes.
