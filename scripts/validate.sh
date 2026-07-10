#!/usr/bin/env bash
set -euo pipefail

npm test
npm run check
npm run build
if npm run smoke; then
  echo "expected smoke to fail on high findings" >&2
  exit 1
fi
node bin/skill-boundary-audit.js fixtures/skill-safe.md --format markdown --fail-on high
echo "validation ok"
