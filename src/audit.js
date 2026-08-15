import { FINDING_PATTERNS, KNOWN_TOOL_WORDS, SECTION_ALIASES, TOOL_PATTERN } from "./patterns.js";
import { findLines, getHeadings, getMarkdownLines, hasSection } from "./markdown.js";

const SEVERITY_SCORE = { low: 1, medium: 2, high: 3 };
const PROHIBITION = /\b(?:never|do not|don't|must not|must never|should not|cannot|can't|may not)\b/i;
const CLAUSE_BOUNDARY = /(?:[.;:!?]+|\b(?:but|however|instead|then)\b)/i;

export function auditSkillMarkdown(markdown, options = {}) {
  const source = options.source ?? "inline";
  const headings = getHeadings(markdown);
  const missingSections = Object.entries(SECTION_ALIASES)
    .filter(([, aliases]) => !hasSection(headings, aliases))
    .map(([name]) => name);

  const findings = [
    ...detectPatternFindings(markdown),
    ...detectMissingSectionFindings(missingSections)
  ].sort((a, b) => SEVERITY_SCORE[b.severity] - SEVERITY_SCORE[a.severity] || a.id.localeCompare(b.id));

  return {
    source,
    summary: summarize(findings),
    headings,
    sections: {
      present: Object.keys(SECTION_ALIASES).filter((name) => !missingSections.includes(name)),
      missing: missingSections
    },
    tools: detectTools(markdown),
    findings
  };
}

export function auditMany(inputs) {
  return {
    generatedAt: new Date(0).toISOString(),
    audits: inputs.map(({ markdown, source }) => auditSkillMarkdown(markdown, { source }))
  };
}

function detectPatternFindings(markdown) {
  return FINDING_PATTERNS.flatMap((pattern) =>
    findLines(markdown, pattern.regex)
      .filter((match) => !pattern.suppressWhenProhibited || !isExplicitProhibition(match.line, pattern.regex))
      .map((match) => ({
      id: pattern.id,
      severity: pattern.severity,
      title: pattern.label,
      line: match.number,
      excerpt: match.line.trim()
    }))
  );
}

function detectMissingSectionFindings(missingSections) {
  return missingSections.map((section) => ({
    id: `missing-${section}`,
    severity: section === "safety" ? "high" : "medium",
    title: `Missing ${section} section`,
    line: null,
    excerpt: `Add a ${section} section to make operational boundaries explicit.`
  }));
}

function detectTools(markdown) {
  const candidates = new Set();
  for (const { line, inFence } of getMarkdownLines(markdown)) {
    if (inFence) continue;
    for (const match of line.matchAll(TOOL_PATTERN)) {
      const word = match[1];
      if (KNOWN_TOOL_WORDS.has(word)) candidates.add(word);
    }
  }
  return [...candidates].sort();
}

function isExplicitProhibition(line, findingPattern) {
  const clauses = line.split(CLAUSE_BOUNDARY);
  return !clauses.some((clause) => {
    const action = findingPattern.exec(clause);
    if (!action) return false;

    const prohibition = PROHIBITION.exec(clause);
    const hasLeadingProhibition = prohibition && prohibition.index < action.index;
    const hasLeadingNo = /\bno\s*$/i.test(clause.slice(0, action.index));
    return !hasLeadingProhibition && !hasLeadingNo;
  });
}

function summarize(findings) {
  return findings.reduce(
    (summary, finding) => {
      summary.total += 1;
      summary[finding.severity] += 1;
      return summary;
    },
    { total: 0, high: 0, medium: 0, low: 0 }
  );
}

export function hasSeverityAtLeast(audit, threshold) {
  if (!threshold) return false;
  const thresholdScore = SEVERITY_SCORE[threshold];
  return audit.findings.some((finding) => SEVERITY_SCORE[finding.severity] >= thresholdScore);
}
