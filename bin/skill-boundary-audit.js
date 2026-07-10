#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { auditMany, formatJson, formatMarkdown, hasSeverityAtLeast } from "../src/index.js";

const args = parseArgs(process.argv.slice(2));

if (args.help || args.paths.length === 0) {
  printHelp();
  process.exit(args.help ? 0 : 2);
}

const inputs = [];
for (const path of args.paths) {
  inputs.push({ source: path, markdown: await readFile(path, "utf8") });
}

const result = auditMany(inputs);
const formatter = args.format === "json" ? formatJson : formatMarkdown;
process.stdout.write(formatter(result));

if (args.failOn && result.audits.some((audit) => hasSeverityAtLeast(audit, args.failOn))) {
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = { paths: [], format: "markdown", failOn: null, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--format") parsed.format = readChoice(argv[++index], ["markdown", "json"], "--format");
    else if (arg.startsWith("--format=")) parsed.format = readChoice(arg.slice(9), ["markdown", "json"], "--format");
    else if (arg === "--fail-on") parsed.failOn = readChoice(argv[++index], ["medium", "high"], "--fail-on");
    else if (arg.startsWith("--fail-on=")) parsed.failOn = readChoice(arg.slice(10), ["medium", "high"], "--fail-on");
    else parsed.paths.push(arg);
  }
  return parsed;
}

function readChoice(value, choices, flag) {
  if (!choices.includes(value)) {
    throw new Error(`${flag} must be one of: ${choices.join(", ")}`);
  }
  return value;
}

function printHelp() {
  process.stdout.write(`Usage: skill-boundary-audit [options] <SKILL.md...>

Options:
  --format markdown|json   Output format. Defaults to markdown.
  --fail-on medium|high    Exit 1 when any finding reaches this severity.
  -h, --help               Show this help.
`);
}
