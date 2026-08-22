import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { auditMany, auditSkillMarkdown, formatJson, formatMarkdown, hasSeverityAtLeast } from "../src/index.js";
import { getMarkdownLines } from "../src/markdown.js";

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

test("indented code does not provide sections, tools, or findings and normal prose resumes", async () => {
  const markdown = await readFile("fixtures/skill-indented-code.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "indented" });

  assert.deepEqual(audit.headings, [
    { depth: 1, title: "Indented examples", line: 1 },
    { depth: 2, title: "Safety", line: 8 }
  ]);
  assert.deepEqual(audit.tools, ["node"]);
  assert.equal(audit.findings.some(({ id }) => id === "external-action"), false);
  assert.equal(audit.sections.present.includes("safety"), true);
  assert.equal(audit.sections.present.includes("tools"), false);
});

test("CommonMark fence openers reject backticks in backtick info strings", () => {
  const invalid = ["```bad`info", "Publish the release."].join("\n");
  const validBacktick = ["```` valid-info", "Publish an example.", "`````"].join("\n");
  const validTilde = ["~~~ valid `tilde` info", "Publish another example.", "~~~~"].join("\n");
  const audit = auditSkillMarkdown(invalid);

  assert.deepEqual(getMarkdownLines(invalid).map(({ inFence }) => inFence), [false, false]);
  assert.deepEqual(getMarkdownLines(validBacktick).map(({ inFence }) => inFence), [true, true, true]);
  assert.deepEqual(getMarkdownLines(validTilde).map(({ inFence }) => inFence), [true, true, true]);
  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "external-action").map(({ line }) => line),
    [2]
  );
});

test("explicit safety prohibitions suppress actions but retain credential evidence", async () => {
  const markdown = await readFile("fixtures/skill-prohibitive.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "prohibitive" });

  assert.equal(audit.findings.some(({ id }) => id === "external-action"), false);
  assert.equal(audit.findings.some(({ id }) => id === "credential-language"), true);
  assert.equal(hasSeverityAtLeast(audit, "high"), true);
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

test("prohibition lead-ins govern only their immediately following Markdown lists", async () => {
  const markdown = await readFile("fixtures/skill-prohibited-list.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "prohibited-list" });

  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "external-action").map(({ line }) => line),
    [8, 14]
  );
  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "local-write").map(({ line }) => line),
    []
  );
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

test("prohibitions only suppress actions that follow them", () => {
  const audit = auditSkillMarkdown([
    "Send email and do not publish it.",
    "Write the summary, but no writes to disk."
  ].join("\n"));

  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "external-action").map(({ line }) => line),
    [1]
  );
  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "local-write").map(({ line }) => line),
    [2]
  );
});

test("no-action boundaries suppress their coordinated actions", () => {
  const audit = auditSkillMarkdown("No writes, edits, or pushes are allowed.");

  assert.equal(audit.findings.some(({ id }) => id === "local-write"), false);
});

test("ATX headings allow up to three leading spaces but not four", () => {
  const audit = auditSkillMarkdown([
    " # Safety", "No writes.",
    "  ## Validation", "Checked manually.",
    "   ### Examples", "None.",
    "    ## Inputs"
  ].join("\n"));

  assert.deepEqual(audit.headings, [
    { depth: 1, title: "Safety", line: 1 },
    { depth: 2, title: "Validation", line: 3 },
    { depth: 3, title: "Examples", line: 5 }
  ]);
  assert.deepEqual(audit.sections.present, ["safety", "validation", "examples"]);
  assert.equal(audit.findings.some(({ id }) => id === "local-write"), false);
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

test("remote create, open, and push mutations are high external actions", async () => {
  const markdown = await readFile("fixtures/skill-remote-mutations.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "remote-mutations" });

  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "external-action").map(({ line }) => line),
    [3, 4, 5]
  );
  assert.equal(audit.summary.high, 3);
  assert.equal(hasSeverityAtLeast(audit, "high"), true);
});

test("remote mutation detection suppresses prohibitions and code without local false positives", async () => {
  const markdown = await readFile("fixtures/skill-remote-mutations-safe.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "remote-mutations-safe" });

  assert.equal(audit.findings.some(({ id }) => id === "external-action"), false);
  assert.equal(audit.summary.high, 0);
  assert.equal(hasSeverityAtLeast(audit, "high"), false);
});

test("expanded remote mutations retain affirmative line evidence", async () => {
  const markdown = await readFile("fixtures/skill-expanded-remote-actions.md", "utf8");
  const audit = auditSkillMarkdown(markdown, { source: "expanded-remote-actions" });
  const actions = audit.findings.filter(({ id }) => id === "external-action");

  assert.deepEqual(actions.map(({ line }) => line), [3, 4, 5, 6, 7]);
  assert.deepEqual(actions.map(({ excerpt }) => excerpt), [
    "Upload the report to S3.",
    "Grant access to the workspace.",
    "Invite the user to Slack.",
    "Archive the repository on GitHub.",
    "Close the GitHub issue."
  ]);
});

test("expanded mutations support inflections and preserve suppression boundaries", async () => {
  const affirmative = auditSkillMarkdown(
    "Uploads reports, granted access, inviting users, archived repositories, and closes issues."
  );
  const unrelated = auditSkillMarkdown(
    "The uploader reviewed grantmaking, invitations, archival policy, and closure documentation."
  );
  const safe = auditSkillMarkdown(
    await readFile("fixtures/skill-expanded-remote-actions-safe.md", "utf8")
  );

  assert.equal(affirmative.findings.filter(({ id }) => id === "external-action").length, 1);
  assert.equal(unrelated.findings.some(({ id }) => id === "external-action"), false);
  assert.equal(safe.findings.some(({ id }) => id === "external-action"), false);
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

test("action prohibitions do not suppress independent evidence categories", () => {
  const audit = auditSkillMarkdown([
    "# Skill", "",
    "## Safety",
    "Do not publish using a token or remote API without approval.",
    "Never write files containing credentials or send them to GitHub without permission."
  ].join("\n"));

  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "external-action").map(({ line }) => line),
    []
  );
  assert.deepEqual(
    audit.findings.filter(({ id }) => id === "local-write").map(({ line }) => line),
    []
  );
  for (const id of ["credential-language", "network-access", "approval-language"]) {
    assert.deepEqual(
      audit.findings.filter((finding) => finding.id === id).map(({ line }) => line),
      [4, 5]
    );
  }
  assert.equal(
    audit.findings.find(({ id, line }) => id === "credential-language" && line === 4).excerpt,
    "Do not publish using a token or remote API without approval."
  );
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
