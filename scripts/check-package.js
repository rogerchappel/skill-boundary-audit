import { access, readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const required = ["name", "version", "description", "bin", "exports", "license"];
for (const field of required) {
  if (!pkg[field]) throw new Error(`package.json missing ${field}`);
}

for (const path of ["README.md", "SKILL.md", "docs/PRD.md", "docs/TASKS.md", "docs/ORCHESTRATION.md"]) {
  await access(path);
}

console.log("package metadata and docs ok");
