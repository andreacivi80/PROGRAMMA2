import { createServer } from "vite";
import { readFileSync } from "node:fs";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
try {
  const { pronunciationDrills, pronunciationWordRecognised } = await server.ssrLoadModule("/src/SkillsLab.tsx");
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  for (const level of levels) for (const drill of pronunciationDrills[level] ?? []) {
    check(drill.word !== drill.contrast, `${level}: contrasto uguale a ${drill.word}`);
    check(/[A-Z]{2}/.test(drill.stress), `${level}: accento non visibile per ${drill.word}`);
    check(drill.instruction.length >= 45, `${level}: guida troppo breve per ${drill.word}`);
    check(drill.example.toLowerCase().includes(drill.word.toLowerCase()), `${level}: esempio senza ${drill.word}`);
    check(pronunciationWordRecognised(drill.word, drill.word), `${level}: parola esatta rifiutata`);
    check(pronunciationWordRecognised(`I said ${drill.word}!`, drill.word), `${level}: parola nel contesto rifiutata`);
    const lexicalContrast = drill.contrast.toLowerCase().replace(/[^a-z]/g, "") !== drill.word.toLowerCase().replace(/[^a-z]/g, "");
    if (lexicalContrast) check(!pronunciationWordRecognised(drill.contrast, drill.word), `${level}: contrasto lessicale accettato per ${drill.word}`);
  }
  levels.forEach(level => check(pronunciationDrills[level]?.length >= 4, `${level}: meno di quattro esercizi`));
  const source = readFileSync("src/SkillsLab.tsx", "utf8");
  check(source.includes("non misura scientificamente i singoli fonemi"), "Limite tecnico non dichiarato");
  check(source.includes("playWord(drill.word,0.65)") && source.includes("playWord(drill.word,0.95)"), "Doppia velocità assente");
  check(source.includes("Riprova subito") && source.includes("Registrazione in corso"), "Nuovo tentativo o registrazione assenti");
  console.log(JSON.stringify({ engine: "pronuncia guidata", levels: levels.length, drills: levels.reduce((sum, level) => sum + pronunciationDrills[level].length, 0), failures }, null, 2));
} finally { await server.close(); }
if (failures.length) process.exitCode = 1;
