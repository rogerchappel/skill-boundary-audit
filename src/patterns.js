export const SECTION_ALIASES = {
  safety: [/^safety\b/i, /^side-effect/i, /^side effect/i, /^boundar/i],
  validation: [/^validation\b/i, /^verification\b/i, /^testing\b/i],
  examples: [/^examples?\b/i, /^usage\b/i],
  inputs: [/^required inputs?\b/i, /^inputs?\b/i],
  tools: [/^required tools?\b/i, /^tools?\b/i],
  approvals: [/^approval/i, /^permission/i]
};

export const FINDING_PATTERNS = [
  {
    id: "external-action",
    severity: "high",
    label: "External action language",
    regex: /\b(send|post|publish|delete|merge|deploy|approve|purchase|email|message|write to|update)\b/i
  },
  {
    id: "network-access",
    severity: "medium",
    label: "Network or remote-service language",
    regex: /\b(network|api|http|https|remote|webhook|github|slack|gmail|salesforce|hubspot)\b/i
  },
  {
    id: "approval-language",
    severity: "medium",
    label: "Approval or permission language",
    regex: /\b(approval|required approval|ask the user|permission|consent|authorize)\b/i
  },
  {
    id: "credential-language",
    severity: "high",
    label: "Credential or secret language",
    regex: /\b(secrets?|tokens?|api keys?|credentials?|passwords?|oauth)\b/i
  },
  {
    id: "local-write",
    severity: "medium",
    label: "Local write or mutation language",
    regex: /\b(write|edit|modify|patch|create file|delete file|commit|push)\b/i
  }
];

export const TOOL_PATTERN = /\b([a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)?)\b/g;

export const KNOWN_TOOL_WORDS = new Set([
  "apply_patch",
  "browser",
  "canvas",
  "exec",
  "ffmpeg",
  "gh",
  "git",
  "image",
  "message",
  "node",
  "npm",
  "python",
  "slack",
  "web_search"
]);
