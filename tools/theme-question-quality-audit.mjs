import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const normal = value => String(value ?? "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
const tokens = value => new Set(normal(value).split(" ").filter(Boolean));
const overlap = (left, right) => {
  const a = tokens(left), b = tokens(right);
  if (!a.size || !b.size) return 0;
  return [...a].filter(token => b.has(token)).length / Math.max(a.size, b.size);
};
const failures = [];
let sessions = 0;
let questions = 0;
let generatedUsage = 0;

try {
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { buildQuiz } = await server.ssrLoadModule("/src/ThemePackLab.tsx");
  for (const pack of themePacks) for (let run = 0; run < 50; run += 1) {
    const quiz = buildQuiz(pack);
    sessions += 1;
    questions += quiz.length;
    const fingerprints = quiz.map(item => `${normal(item.prompt)}|${normal(item.options[item.answer])}`);
    if (new Set(fingerprints).size !== fingerprints.length) failures.push(`${pack.id}: domande duplicate nella stessa sessione`);
    for (const item of quiz) {
      const correct = item.options[item.answer];
      if (!correct || item.answer < 0 || new Set(item.options.map(normal)).size !== item.options.length) failures.push(`${pack.id}: risposta o opzioni non valide in «${item.prompt}»`);
      if (item.id.startsWith("word-")) {
        generatedUsage += 1;
        if (!item.prompt.startsWith("Quale frase usa")) failures.push(`${pack.id}: vecchio generatore di significati ancora attivo`);
        item.options.forEach(option => {
          if (option !== correct && overlap(correct, option) < 0.5) failures.push(`${pack.id}: alternativa estranea «${correct}» / «${option}»`);
        });
      }
    }
  }
  const focus = themePacks.find(pack => pack.id === "language-b1-perfect-continuous");
  const sample = focus ? buildQuiz(focus).map(item => ({ prompt: item.prompt, options: item.options, correct: item.options[item.answer] })) : [];
  console.log(JSON.stringify({ packs: themePacks.length, sessions, questions, generatedUsage, failureCount: failures.length, failures: [...new Set(failures)].slice(0, 100), focusSample: sample }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await server.close();
}
