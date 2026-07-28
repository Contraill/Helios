import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const packageBin = (packageName, ...segments) =>
  path.join(
    path.dirname(require.resolve(`${packageName}/package.json`)),
    ...segments,
  );

const commands = [
  [packageBin("prettier", "bin", "prettier.cjs"), "--check", "."],
  [packageBin("eslint", "bin", "eslint.js"), "."],
  [packageBin("typescript", "bin", "tsc"), "--noEmit"],
  ["scripts/audit-route-contracts.mjs"],
  ["scripts/audit-scene-contracts.mjs"],
  ["scripts/audit-route-boundaries.mjs"],
  ["scripts/audit-i18n-coverage.mjs"],
  ["scripts/audit-provider-contracts.mjs"],
  ["scripts/audit-source-registry.mjs"],
  ["scripts/audit-static-budgets.mjs"],
  ["scripts/audit-repository-language.mjs"],
  ["scripts/audit-editorial-surfaces.mjs"],
  ["scripts/audit-accessibility-interactions.mjs"],
  ["scripts/audit-runtime-textures.mjs"],
];

for (const args of commands) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
