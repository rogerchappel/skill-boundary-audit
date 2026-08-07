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
    regex: /\b(?:send(?:s|ing)?|sent|post(?:s|ed|ing)?|publish(?:es|ed|ing)?|delet(?:e|es|ed|ing)|merg(?:e|es|ed|ing)|deploy(?:s|ed|ing)?|approv(?:e|es|ed|ing)|purchas(?:e|es|ed|ing)|email(?:s|ed|ing)?|messag(?:e|es|ed|ing)|(?:write|writes|wrote|written|writing) to|updat(?:e|es|ed|ing))\b/i
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
    regex: /\b(?:write|writes|wrote|written|writing|edit(?:s|ed|ing)?|modif(?:y|ies|ied|ying)|patch(?:es|ed|ing)?|creat(?:e|es|ed|ing) files?|delet(?:e|es|ed|ing) files?|commit(?:s|ted|ting)?|push(?:es|ed|ing)?)\b/i
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
