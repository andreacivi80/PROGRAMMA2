import { spawnSync } from "node:child_process";

const controls = [
  ["risposte scritte, ascolto e parlato", "tools/response-interaction-audit.mjs"],
  ["giochi e casualizzazione", "tools/game-interaction-audit.mjs"],
  ["stress corretto, errato, salto e doppio click", "tools/answer-state-stress-audit.mjs"],
  ["copertura di ogni famiglia di esercizi", "tools/exercise-contract-matrix-audit.mjs"],
  ["utente rapido, fragile e discontinuo", "tools/adversarial-journey-2-audit.mjs"],
];
const results = controls.map(([name, script]) => {
  const run = spawnSync(process.execPath, [script], { cwd: process.cwd(), encoding: "utf8", timeout: 240_000, maxBuffer: 25 * 1024 * 1024 });
  return { name, script, passed: run.status === 0, exitCode: run.status, output: run.status === 0 ? "verificato" : (run.stderr || run.stdout).slice(-1200) };
});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ engine: "B · interazione e percorsi utente", isolatedServer: "DOM applicativo", results, failed }, null, 2));
if (failed.length) process.exitCode = 1;
