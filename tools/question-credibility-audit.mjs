import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const normal = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const words = value => normal(value).split(" ").filter(Boolean);
const overlap = (left, right) => {
  const a = new Set(words(left)), b = new Set(words(right));
  if (!a.size || !b.size) return 0;
  return [...a].filter(word => b.has(word)).length / Math.max(a.size, b.size);
};
const generic = /^(un'altra forma|nessuna delle precedenti|none of these|all of the above|una forma diversa)$/i;
const forbiddenPrompt = /^(come si dice|scegli l['’]inglese corretto)/i;
const issues = [];
const warnings = [];
let checked = 0;
const safeQuestions = (factory, label) => {
  try { return factory(); }
  catch (error) { issues.push(`${label}: generazione fallita: ${error instanceof Error ? error.message : String(error)}`); return []; }
};

function validate(question, level, label, strictCount = false) {
  checked += 1;
  const expected = level === "C1" ? 5 : level === "B1" || level === "B2" ? 4 : 3;
  const correct = question.options?.[question.answer];
  if (!correct) { issues.push(`${label}: risposta corretta assente`); return; }
  if (question.options.length < 3) issues.push(`${label}: meno di tre opzioni`);
  if (strictCount && question.options.length !== expected) warnings.push(`${label}: ${question.options.length} opzioni invece dell'obiettivo ${expected}`);
  if (forbiddenPrompt.test(question.prompt)) issues.push(`${label}: traduzione lessicale isolata vietata: ${question.prompt}`);
  if (question.options.some(option => generic.test(normal(option)))) issues.push(`${label}: distrattore riempitivo`);
  if (new Set(question.options.map(normal)).size !== question.options.length) issues.push(`${label}: opzioni duplicate`);
  if (words(correct).length >= 4 && /versione|sequenza|frase|battuta/i.test(question.prompt)) {
    question.options.forEach((option, index) => {
      if (index !== question.answer && overlap(correct, option) < 0.45)
        issues.push(`${label}: alternativa estranea alla frase (${JSON.stringify(correct)} / ${JSON.stringify(option)})`);
    });
  }
  if (!String(question.explanationIt ?? "").includes(correct) && !normal(question.explanationIt).includes(normal(correct)))
    issues.push(`${label}: la spiegazione non mostra la soluzione “${correct}”`);
}

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { supplementaryBankFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const { buildReviewBank } = await server.ssrLoadModule("/src/ReviewLab.tsx");
  const { finalQuizFor, listeningQuizFor } = await server.ssrLoadModule("/src/App.tsx");
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  for (const unit of mobileCurriculum) {
    for (let run = 0; run < 5; run += 1) {
      safeQuestions(() => finalQuizFor(unit), `finale:${unit.id}`).forEach((question, index) => validate(question, unit.cefr, `finale:${unit.id}:${run + 1}:${index + 1}`));
      safeQuestions(() => listeningQuizFor(unit), `ascolto:${unit.id}`).forEach((question, index) => validate(question, unit.cefr, `ascolto:${unit.id}:${run + 1}:${index + 1}`));
      safeQuestions(() => supplementaryBankFor(unit), `extra:${unit.id}`).forEach((question, index) => validate(question, unit.cefr, `extra:${unit.id}:${run + 1}:${index + 1}`, true));
    }
  }
  const reviewSamples = {};
  for (const level of levels) {
    const units = mobileCurriculum.filter(unit => unit.cefr === level);
    const groups = [units.slice(0, 4), units.slice(4, 8), units.slice(8, 12), units];
    groups.forEach((group, groupIndex) => {
      for (let run = 0; run < 20; run += 1) {
        const questions = safeQuestions(() => buildReviewBank(group, groupIndex === 3 ? 24 : 20, groupIndex === 3), `riepilogo:${level}:${groupIndex + 1}`);
        questions.forEach((question, index) => validate(question, level, `riepilogo:${level}:${groupIndex + 1}:${run + 1}:${index + 1}`, true));
        if (level === "B1" && groupIndex === 0 && run === 0) reviewSamples.B1_lezioni_1_4 = questions.slice(0, 8).map(question => ({ prompt: question.prompt, options: question.options, correct: question.options[question.answer] }));
      }
    });
  }
  console.log(JSON.stringify({ checked, issueCount: issues.length, warningCount: warnings.length, issues: issues.slice(0, 200), warnings: warnings.slice(0, 40), reviewSamples }, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  await server.close();
}
