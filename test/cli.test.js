import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

test("CLI exits non-zero when fail-on threshold is met", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-risky.md", "--format", "json", "--fail-on", "high"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).audits[0].summary.high > 0, true);
});

test("CLI exits zero for safe fixture under high threshold", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-safe.md", "--fail-on", "high"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Findings:/);
});

test("CLI fail-on high distinguishes prohibitions from affirmative actions", () => {
  const prohibited = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-prohibitive.md", "--fail-on", "high"],
    { encoding: "utf8" }
  );
  const affirmative = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-affirmative-risk.md", "--fail-on", "high"],
    { encoding: "utf8" }
  );

  assert.equal(prohibited.status, 0);
  assert.equal(affirmative.status, 1);
});
