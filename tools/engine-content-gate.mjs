import { spawnSync } from "node:child_process";

const controls = [
  ["coerenza CEFR", "tools/cefr-boundary-audit.mjs"],
  ["credibilità delle domande", "tools/independent-validation-audit.mjs"],
  ["scrittura e falsi positivi", "tools/writing-analysis-audit.mjs"],
];
const results = controls.map(([name, script]) => {
  const run = spawnSync(process.execPath, [script], { cwd: process.cwd(), encoding: "utf8", timeout: 180_000, maxBuffer: 20 * 1024 * 1024 });
  return { name, script, passed: run.status === 0, exitCode: run.status, output: run.status === 0 ? "verificato" : (run.stderr || run.stdout).slice(-1200) };
});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ engine: "A · contenuti e logica didattica", isolatedServer: "Vite SSR", results, failed }, null, 2));
if (failed.length) process.exitCode = 1;
