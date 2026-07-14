#!/usr/bin/env bash
set -euo pipefail

npm test
npm run check
npm run build
if ! npm run smoke; then
  echo "expected smoke to pass for the safe fixture" >&2
  exit 1
fi
if node bin/skill-boundary-audit.js fixtures/skill-risky.md --format markdown --fail-on high; then
  echo "expected high-risk fixture to fail on high findings" >&2
  exit 1
fi
echo "validation ok"
