import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const failures = [];
const forbidden = /^(come si dice|scegli l['’]inglese corretto|traduci\b)/i;
const trivialGloss = /^(che cosa significa|what does .+ mean)/i;
const obviousMalformed = /\b(said me|told that|would called|would sent|had see|had wait|have went|have saw|suggest to postpone|whose meet|where meet|is produce\b|was delay\b|must signed\b|must be sign\b|did you ever been)\b/i;
const identity = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/\s+/g, " ").trim();

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { advancedNuanceQuestions } = await server.ssrLoadModule("/src/advancedNuanceQuestions.ts");
  const { finalQuizFor } = await server.ssrLoadModule("/src/App.tsx");
  const advanced = mobileCurriculum.filter(unit => ["B1", "B2", "C1"].includes(unit.cefr));
  let questions = 0;
  for (const unit of advanced) {
    const nuance = advancedNuanceQuestions[unit.id] ?? [];
    if (!nuance.length) failures.push(`${unit.id}: manca una domanda che verifichi sfumatura, funzione o implicazione`);
    for (const [index, question] of nuance.entries()) {
      questions += 1;
      if (forbidden.test(question.prompt) || trivialGloss.test(question.prompt)) failures.push(`${unit.id}:${index + 1}: traduzione lessicale isolata`);
      if (question.options.length < (unit.cefr === "C1" ? 5 : 4)) failures.push(`${unit.id}:${index + 1}: alternative insufficienti per ${unit.cefr}`);
      if (new Set(question.options.map(identity)).size !== question.options.length) failures.push(`${unit.id}:${index + 1}: alternative duplicate`);
      question.options.forEach((option, optionIndex) => {
        if (obviousMalformed.test(option)) failures.push(`${unit.id}:${index + 1}:${optionIndex + 1}: alternativa grammaticalmente artificiale: ${option}`);
      });
      if (!question.options[question.answer]) failures.push(`${unit.id}:${index + 1}: soluzione non valida`);
      if (!question.explanationIt?.includes(question.options[question.answer])) failures.push(`${unit.id}:${index + 1}: spiegazione senza soluzione esplicita`);
    }
    const finalQuiz = finalQuizFor(unit);
    const signatures = new Set(nuance.map(question => `${question.prompt}|${question.options[question.answer]}`));
    if (!finalQuiz.some(question => signatures.has(`${question.prompt}|${question.options[question.answer]}`)))
      failures.push(`${unit.id}: il quiz finale non include alcuna verifica di sfumatura`);
  }
  console.log(JSON.stringify({ advancedUnits: advanced.length, nuanceQuestions: questions, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await server.close();
}
