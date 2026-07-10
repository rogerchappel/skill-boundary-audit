import { auditSkillMarkdown } from "../src/index.js";

if (typeof auditSkillMarkdown !== "function") {
  throw new Error("library export missing");
}

console.log("build smoke ok");
