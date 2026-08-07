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

test("leading prohibitions cover coordinated action lists", async () => {
  const markdown = await readFile("fixtures/skill-coordinated-prohibition.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "coordinated-prohibition" });

  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "external-action"),
    []
  );
  assert.equal(audit.summary.high, 0);
  assert.equal(hasSeverityAtLeast(audit, "high"), false);
});

test("affirmative clauses after prohibitions remain reportable", async () => {
  const markdown = await readFile("fixtures/skill-mixed-prohibition.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "mixed-prohibition" });
  const externalActions = audit.findings.filter(({ id }) => id === "external-action");

  assert.deepEqual(
    externalActions.map(({ line }) => line),
    [6, 7]
  );
  assert.deepEqual(
    externalActions.map(({ excerpt }) => excerpt),
    [
      "Never send Slack messages, then publish the report.",
      "Do not delete the source; update the generated index."
    ]
  );
  assert.equal(audit.summary.high, 2);
  assert.equal(hasSeverityAtLeast(audit, "high"), true);
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

test("action detectors recognize common inflections without matching unrelated words", () => {
  const external = auditSkillMarkdown([
    "The agent sends emails, posted updates, publishes reports, deleted records,",
    "merged branches, deploying releases, approves purchases, emailed users,",
    "messaged owners, wrote to GitHub, and updates issues."
  ].join("\n"));
  const local = auditSkillMarkdown([
    "The tool writes files, edited settings, modifies metadata, patched sources,",
    "created files, deletes files, committed changes, and pushes branches."
  ].join("\n"));
  const unrelated = auditSkillMarkdown("The postage writer describes current documentation.");

  assert.deepEqual(
    external.findings.filter(({ id }) => id === "external-action").map(({ line }) => line),
    [1, 2, 3]
  );
  assert.deepEqual(
    local.findings.filter(({ id }) => id === "local-write").map(({ line }) => line),
    [1, 2]
  );
  assert.equal(unrelated.findings.some(({ id }) => id === "external-action" || id === "local-write"), false);
});

test("inflected actions remain suppressed in prohibitions and fenced examples", () => {
  const audit = auditSkillMarkdown([
    "Never sends emails, posts updates, publishes reports, deletes records, or merges branches.",
    "Do not deploy releases, approve purchases, email users, message owners, write to GitHub, or update issues.",
    "Do not write files, edit settings, modify metadata, patch sources, or create files.",
    "Never delete files, commit changes, or push branches.",
    "```md",
    "The agent published reports and created files.",
    "```"
  ].join("\n"));

  assert.equal(audit.findings.some(({ id }) => id === "external-action" || id === "local-write"), false);
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
