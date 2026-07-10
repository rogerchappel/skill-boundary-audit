import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { auditMany, auditSkillMarkdown, formatJson, formatMarkdown, hasSeverityAtLeast } from "../src/index.js";

test("safe skill reports expected sections and no high findings", async () => {
  const markdown = await readFile("fixtures/skill-safe.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "safe" });

  assert.equal(audit.summary.high, 0);
  assert.deepEqual(audit.sections.missing, []);
  assert.deepEqual(audit.tools, ["node"]);
});

test("risky skill surfaces side effects, credentials, and missing safety", async () => {
  const markdown = await readFile("fixtures/skill-risky.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "risky" });

  assert.ok(audit.findings.some((finding) => finding.id === "credential-language"));
  assert.ok(audit.findings.some((finding) => finding.id === "external-action"));
  assert.ok(audit.findings.some((finding) => finding.id === "missing-safety"));
  assert.equal(hasSeverityAtLeast(audit, "high"), true);
});

test("formatters produce deterministic report shapes", async () => {
  const markdown = await readFile("fixtures/skill-risky.md", "utf8");
  const result = auditMany([{ source: "risky", markdown }]);

  assert.match(formatMarkdown(result), /# Skill Boundary Audit/);
  assert.equal(JSON.parse(formatJson(result)).audits[0].source, "risky");
  assert.equal(result.generatedAt, "1970-01-01T00:00:00.000Z");
});
