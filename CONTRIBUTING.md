# Contributing

Keep this project local-first and deterministic.

## Detector Changes

- Add or update fixtures for every new detector.
- Prefer clear, explainable regexes over broad keyword grabs.
- Document severity changes in `docs/DETECTORS.md`.

## Before Opening a PR

```bash
npm run validate
```

Do not add network calls, telemetry, or target-skill execution.
