import { spawnSync } from "node:child_process";

const controls = [
  ["versione, cache e conservazione dati", "tools/release-audit.mjs"],
  ["confini e rami raggiungibili", "tools/project-boundary-audit.mjs"],
  ["rendering Chrome, Edge e Firefox", "tools/browser-compatibility-audit.mjs"],
];
const results = controls.map(([name, script]) => {
  const run = spawnSync(process.execPath, [script], { cwd: process.cwd(), encoding: "utf8", timeout: 240_000, maxBuffer: 25 * 1024 * 1024 });
  return { name, script, passed: run.status === 0, exitCode: run.status, output: run.status === 0 ? "verificato" : (run.stderr || run.stdout).slice(-1200) };
});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ engine: "C · build, offline e browser", isolatedServer: "Vite Preview", results, failed }, null, 2));
if (failed.length) process.exitCode = 1;
