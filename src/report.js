export function formatJson(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatMarkdown(result) {
  const lines = ["# Skill Boundary Audit", ""];
  for (const audit of result.audits) {
    lines.push(`## ${audit.source}`, "");
    lines.push(
      `Findings: ${audit.summary.total} total, ${audit.summary.high} high, ${audit.summary.medium} medium, ${audit.summary.low} low.`,
      ""
    );
    lines.push(`Sections present: ${list(audit.sections.present)}`);
    lines.push(`Sections missing: ${list(audit.sections.missing)}`);
    lines.push(`Detected tools: ${list(audit.tools)}`, "");
    if (audit.findings.length === 0) {
      lines.push("No findings.", "");
      continue;
    }
    lines.push("| Severity | Finding | Line | Evidence |");
    lines.push("| --- | --- | ---: | --- |");
    for (const finding of audit.findings) {
      lines.push(
        `| ${finding.severity} | ${escapeCell(finding.title)} | ${finding.line ?? ""} | ${escapeCell(finding.excerpt)} |`
      );
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

function list(values) {
  return values.length ? values.join(", ") : "none";
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ");
}
