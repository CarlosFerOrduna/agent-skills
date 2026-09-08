import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = mkdtempSync(path.join(os.tmpdir(), "smoke-commitlint-"));
const configSrc = path.join(root, "enforcement", "commitlint.config.cjs");

const pm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command) {
  // INIT_CWD must be pinned to the scratch: under `npm run check` npm exports
  // it as the hosting repository, and child npm processes would otherwise walk
  // up to it and pollute the repo with a lockfile or node_modules.
  const result = spawnSync(command, {
    cwd: scratch,
    shell: true,
    env: { ...process.env, INIT_CWD: scratch },
  });
  return result.status;
}

let failures = 0;

try {
  // The scratch gets its own package root so npm never walks up to the hosting
  // repository (which would pollute it with a lockfile or node_modules). npm is
  // used deliberately: `npm run check` already requires the npm toolchain, so
  // the smoke works on any machine that can run the gate.
  writeFileSync(
    path.join(scratch, "package.json"),
    '{"name":"smoke-commitlint","private":true}\n',
    "utf8",
  );
  copyFileSync(configSrc, path.join(scratch, "commitlint.config.cjs"));
  run("git init -q");

  const setup = run(
    `${pm} add -D @commitlint/cli @commitlint/config-conventional`,
  );
  if (setup !== 0) {
    console.error(
      `setup failed installing @commitlint in the scratch dir (${pm} add exit=${setup})`,
    );
    process.exit(2);
  }

  function runCase(name, want, header) {
    writeFileSync(path.join(scratch, "msg.txt"), `${header}\n`, "utf8");
    // The `--` separator is required under npm: without it npm swallows the
    // commitlint `--edit` flag (expanding it to npm's own `--editor`).
    const got = run(`${pm} exec -- commitlint --edit msg.txt`);
    if (got === want) {
      console.log(`PASS ${name} (exit=${got})`);
    } else {
      console.log(`FAIL ${name} (want exit=${want}, got ${got})`);
      failures += 1;
    }
  }

  const long = `✨ feat(auth): ${"x".repeat(95)}`;
  runCase(
    "valid gitmoji header",
    0,
    "✨ feat(auth): add JWT refresh-token rotation",
  );
  runCase("missing gitmoji", 1, "feat(auth): add JWT refresh-token rotation");
  runCase("invalid type", 1, "✨ banana(auth): add thing");
  runCase("header over 72 (no emoji)", 1, long);
  runCase("breaking change", 0, "✨ feat!: drop the old api");
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

process.exit(failures);
