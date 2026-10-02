import { mkdtemp, mkdir, writeFile, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);

async function runCheck(mutator) {
  const dir = await mkdtemp(join(tmpdir(), "skill-boundary-package-check-"));
  try {
    const pkg = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("package.json", root), "utf8"));
    await writeFile(join(dir, "package.json"), JSON.stringify(mutator(pkg)));
    for (const path of ["README.md", "SKILL.md", "docs/PRD.md", "docs/TASKS.md", "docs/ORCHESTRATION.md"]) {
      await mkdir(join(dir, path, ".."), { recursive: true });
      await writeFile(join(dir, path), "fixture");
    }
    const result = spawnSync(process.execPath, [new URL("../scripts/check-package.js", import.meta.url).pathname], { cwd: dir, encoding: "utf8" });
    return result;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("package check accepts complete metadata and required docs", async () => {
  const result = await runCheck(pkg => pkg);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /package metadata and docs ok/);
});

test("package check rejects missing required metadata", async () => {
  const result = await runCheck(pkg => { delete pkg.license; return pkg; });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /package.json missing license/);
});
