import { createServer } from "vite";
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const failures = [], check = (ok, message) => { if (!ok) failures.push(message); };
try {
  const { difficultyMode, choiceDifficulty, adaptChoices } = await server.ssrLoadModule("/src/adaptiveDifficulty.ts");
  check(difficultyMode({}) === "balanced", "Nuovo utente non bilanciato");
  check(difficultyMode({ score: 40, attempts: 2 }) === "recovery", "Errore ricorrente non consolidato");
  check(difficultyMode({ score: 94, attempts: 2 }) === "challenge", "Risultato forte non sfidato");
  check(difficultyMode({ score: 95, attempts: 2, rating: "hard" }) === "recovery", "Percezione di difficoltà ignorata");
  const easy = { prompt:"Choose.",options:["Present result","A car","Tomorrow"],answer:0,explanationIt:"" };
  const hard = { prompt:"Choose.",options:["A result relevant now","A completed result relevant now","A result that may still matter now"],answer:1,explanationIt:"" };
  check(choiceDifficulty(hard) > choiceDifficulty(easy), "Somiglianza dei distrattori non rilevata");
  check(adaptChoices([easy, hard], "challenge")[0] === hard, "Sfida non anticipa la domanda sottile");
  check(adaptChoices([easy, hard], "recovery")[0] === easy, "Consolidamento non anticipa la domanda chiara");
  for(let i=0;i<5000;i++) check(["recovery","balanced","challenge"].includes(difficultyMode({score:i%101,attempts:i%4,rating:i%11===0?"hard":i%13===0?"easy":undefined})),`Modo invalido ${i}`);
  console.log(JSON.stringify({engine:"difficoltà adattiva",propertyRuns:5000,failures},null,2));
} finally { await server.close(); }
if(failures.length) process.exitCode=1;
