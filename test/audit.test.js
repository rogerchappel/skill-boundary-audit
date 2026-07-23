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

test("fenced examples do not provide sections, tools, or action findings", async () => {
  const markdown = await readFile("fixtures/skill-fenced-example.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "fenced" });

  assert.deepEqual(audit.sections.present, []);
  assert.deepEqual(audit.sections.missing, [
    "safety", "validation", "examples", "inputs", "tools", "approvals"
  ]);
  assert.deepEqual(audit.tools, []);
  assert.equal(audit.findings.some(({ id }) => id === "external-action"), false);
  assert.deepEqual(audit.headings, [{ depth: 1, title: "Fenced Example", line: 1 }]);
});

test("explicit safety prohibitions do not become high action findings", async () => {
  const markdown = await readFile("fixtures/skill-prohibitive.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "prohibitive" });

  assert.equal(audit.summary.high, 0);
  assert.equal(hasSeverityAtLeast(audit, "high"), false);
});

test("affirmative risky wording still produces high findings and line evidence", async () => {
  const markdown = await readFile("fixtures/skill-affirmative-risk.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "affirmative" });
  const externalAction = audit.findings.find(({ id }) => id === "external-action");

  assert.equal(externalAction.line, 13);
  assert.match(externalAction.excerpt, /^Publish the report/);
  assert.ok(audit.findings.some(({ id }) => id === "credential-language"));
  assert.equal(hasSeverityAtLeast(audit, "high"), true);
});

test("formatters preserve source line numbers after fenced examples", async () => {
  const markdown = [
    "# Skill", "", "```md", "Publish a token.", "```", "",
    "## Safety", "Publish the report."
  ].join("\n");
  const result = auditMany([{ source: "line-numbers", markdown }]);

  assert.match(formatMarkdown(result), /\| high \| External action language \| 8 \| Publish the report\. \|/);
  assert.equal(JSON.parse(formatJson(result)).audits[0].findings[0].line, 8);
});
