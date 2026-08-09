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

test("CLI fail-on high retains credential evidence in prohibited actions", () => {
  const prohibited = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-prohibitive.md", "--format", "json", "--fail-on", "high"],
    { encoding: "utf8" }
  );
  const affirmative = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-affirmative-risk.md", "--fail-on", "high"],
    { encoding: "utf8" }
  );

  const findings = JSON.parse(prohibited.stdout).audits[0].findings;

  assert.equal(prohibited.status, 1);
  assert.equal(findings.some(({ id }) => id === "external-action"), false);
  assert.equal(findings.some(({ id }) => id === "credential-language"), true);
  assert.equal(affirmative.status, 1);
});

test("CLI fail-on high accepts coordinated prohibitions and rejects later affirmative clauses", () => {
  const coordinated = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-coordinated-prohibition.md", "--format", "json", "--fail-on", "high"],
    { encoding: "utf8" }
  );
  const mixed = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-mixed-prohibition.md", "--format", "json", "--fail-on", "high"],
    { encoding: "utf8" }
  );

  assert.equal(coordinated.status, 0);
  assert.equal(JSON.parse(coordinated.stdout).audits[0].summary.high, 0);
  assert.equal(mixed.status, 1);
  assert.deepEqual(
    JSON.parse(mixed.stdout).audits[0].findings
      .filter(({ id }) => id === "external-action")
      .map(({ line }) => line),
    [6, 7]
  );
});

test("CLI rejects unknown options before file access", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "missing.md", "--bogus"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "skill-boundary-audit: unknown option: --bogus\n");
  assert.doesNotMatch(result.stderr, /ENOENT|node:fs|at async/);
});

test("CLI fail-on high catches inflected external actions", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/skill-boundary-audit.js", "fixtures/skill-inflected-risk.md", "--format", "json", "--fail-on", "high"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.ok(JSON.parse(result.stdout).audits[0].findings.some(({ id }) => id === "external-action"));
});
