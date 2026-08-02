import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

try {
  const { analyzeLocalWriting } = await server.ssrLoadModule("/src/languageAnalysis.ts");
  const corrections = [
    ["i am agree", "I agree."], ["People is friendly", "People are friendly."],
    ["I have 28 years old", "I am 28 years old."], ["This depends of the weather", "This depends on the weather."],
    ["She don't work here", "She doesn't work here."], ["She doesn't works here", "She doesn't work here."],
    ["He go to work", "He goes to work."], ["Did you went home", "Did you go home."],
    ["I working today", "I am working today."], ["They is ready", "They are ready."],
    ["I can goes tomorrow", "I can go tomorrow."], ["This is more better", "This is better."],
    ["I need an university", "I need a university."], ["It is a honest answer", "It is an honest answer."],
    ["I recieved thier adress", "I received their address."], ["There is many people", "There are many people."],
  ];
  for (const [input, expected] of corrections) {
    const result = analyzeLocalWriting(input);
    check(result.corrected === expected, `Correzione errata: ${input} => ${result.corrected}; atteso ${expected}`);
    check(result.issues.length > 0, `Errore non spiegato: ${input}`);
    const second = analyzeLocalWriting(result.corrected);
    check(second.corrected === result.corrected, `Correzione non idempotente: ${result.corrected} => ${second.corrected}`);
    check(second.scores.Totale >= result.scores.Totale, `Il testo corretto peggiora il punteggio: ${input}`);
  }

  const valid = [
    "I agree with your proposal.", "People are waiting outside.", "She doesn't work here.",
    "He goes to work by train.", "Did you go home early?", "I am working today.",
    "There is news about the project.", "There is progress to report.", "I need a university course.",
    "It is an honest answer.", "The information is useful.", "She can speak clearly.",
  ];
  for (const text of valid) {
    const result = analyzeLocalWriting(text);
    check(result.corrected === text, `Falso positivo: ${text} => ${result.corrected}`);
    check(result.scores.Totale >= 95, `Punteggio troppo basso per frase corretta: ${text}`);
  }

  const fragments = ["I work today", "She works here", "They are ready", "We have time", "This is useful"];
  for (let attempt = 0; attempt < 3000; attempt += 1) {
    const input = `${fragments[attempt % fragments.length]}${attempt % 3 === 0 ? "." : ""}${attempt % 5 === 0 ? "  " : ""}`;
    const result = analyzeLocalWriting(input);
    check(result.wordCount >= 3, `Conteggio parole anomalo al tentativo ${attempt}`);
    check(Object.values(result.scores).every(score => Number.isInteger(score) && score >= 20 && score <= 100), `Punteggio fuori intervallo al tentativo ${attempt}`);
    check(typeof result.corrected === "string" && result.corrected.length > 0, `Risultato vuoto al tentativo ${attempt}`);
  }
  console.log(JSON.stringify({ engine: "corpus linguistico, falsi positivi e test metamorfici", corrections: corrections.length, valid: valid.length, fuzzed: 3000, failures }, null, 2));
} finally {
  await server.close();
}
if (failures.length) process.exitCode = 1;
