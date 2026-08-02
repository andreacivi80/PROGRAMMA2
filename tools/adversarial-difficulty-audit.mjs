import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const levels = new Set(["B1", "B2", "C1"]);
const normal = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const identity = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const stop = new Set("the a an and or of to in on at for from with by is are was were be been being do does did have has had it this that these those i you he she we they my your his her our their if before after when so but because although than che cosa quale frase risposta corretta".split(" "));
const content = value => new Set(normal(value).split(" ").filter(word => word.length > 2 && !stop.has(word)));
const shared = (left, right) => {
  const a = content(left), b = content(right);
  return [...a].filter(word => b.has(word)).length;
};
const forbiddenPrompt = /^(come si dice|scegli l['’]inglese corretto|traduci\b|what does [a-z'-]+ mean\??$)/i;
const giveaway = /\b(physically long|moved to a lower floor|floor (?:means|significa) ceiling|apartment (?:means|significa) hotel|before yesterday|full stop|label themselves|samples store them|where designed|which project won|every delay|no other explanation is possible)\b/i;
const malformed = /\b(if [^,.]+ will [^,.]+, [^,.]+ yesterday|had delayed the figures|has approved [^,.]+ before it reviewed [^,.]+ yesterday|was approving the evidence before the change reviews|it was the proposal that the delay rejected|what rejected the delay was them|it is them who the cost was rejected)\b/i;
const nuanceMarker = /^(Aspetto|Risultato|Tempo concluso|Esperienza|Grado di realtà|Scelta del focus|Collocazione|Problema|Condizione|Responsabilità|Aggiornamento|Distanza|Sequenza|Cambio di prospettiva|Informazione essenziale|Possesso|Comprensione globale|Controfattuale|Prospettiva|Reporting verb|Gerundio|Relativa|Implicatura|Compromesso|Inferenza|Priorità|Causa passata|Grado di certezza|Concessione|Registro|Esito|Coerenza|Piani|Varietà|Enfasi|Prudenza|Focus contrastivo|Nominalizzazione|Coesione|Relazione logica|Inquadramento|Accordo|Ambiguità|Struttura argomentativa|Forza della prova|Limite metodologico|Sintesi|Divergenza|Conclusione integrata)/i;
const failures = [];
const review = [];
const positions = {};
let sessions = 0;
let questions = 0;
let advancedQuestions = 0;

function validate(question, level, label, strictOptions) {
  questions += 1;
  const correct = question.options?.[question.answer];
  const expected = level === "C1" ? 5 : levels.has(level) ? 4 : 3;
  if (!correct) { failures.push(`${label}: risposta mancante`); return; }
  if (strictOptions && question.options.length < expected) failures.push(`${label}: ${question.options.length} opzioni, minimo ${expected}`);
  if (new Set(question.options.map(identity)).size !== question.options.length) failures.push(`${label}: opzioni duplicate`);
  if (forbiddenPrompt.test(question.prompt)) failures.push(`${label}: domanda lessicale isolata troppo facile`);
  if (question.options.some(option => giveaway.test(option))) failures.push(`${label}: distrattore-regalo estraneo al concetto`);
  if (question.options.some(option => malformed.test(option))) failures.push(`${label}: distrattore grammaticalmente artificiale`);
  if (!normal(question.explanationIt).includes(normal(correct))) failures.push(`${label}: spiegazione senza soluzione esplicita`);
  if (levels.has(level)) {
    advancedQuestions += 1;
    const wordCounts = question.options.map(option => normal(option).split(" ").filter(Boolean).length);
    const min = Math.min(...wordCounts), max = Math.max(...wordCounts);
    if (max >= 6 && min / max < 0.35) failures.push(`${label}: forma delle alternative troppo diversa`);
    if (normal(correct).split(" ").length >= 6) {
      const unrelated = question.options.filter((option, index) => index !== question.answer && shared(correct, option) === 0);
      if (unrelated.length > 1) review.push(`${question.prompt} → ${correct}`);
    }
  }
}

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { finalQuizFor, listeningQuizFor } = await server.ssrLoadModule("/src/App.tsx");
  const advanced = mobileCurriculum.filter(unit => levels.has(unit.cefr));
  for (let run = 0; run < 120; run += 1) {
    for (const unit of advanced) {
      const finalQuiz = finalQuizFor(unit);
      const listening = listeningQuizFor(unit);
      sessions += 2;
      if (finalQuiz.length < 5) failures.push(`${unit.id}:${run}: quiz finale troppo corto`);
      if (!finalQuiz.some(question => nuanceMarker.test(question.prompt))) failures.push(`${unit.id}:${run}: manca una verifica di sfumatura o funzione`);
      const fingerprints = finalQuiz.map(question => normal(question.prompt));
      if (new Set(fingerprints).size !== fingerprints.length) failures.push(`${unit.id}:${run}: domanda duplicata nella sessione`);
      finalQuiz.forEach((question, index) => {
        validate(question, unit.cefr, `finale:${unit.id}:${run + 1}:${index + 1}`, true);
        const key = `${unit.cefr}:${question.options.length}`;
        const bucket = positions[key] ??= { total: 0, counts: {} };
        bucket.total += 1;
        bucket.counts[question.answer] = (bucket.counts[question.answer] ?? 0) + 1;
      });
      listening.forEach((question, index) => validate(question, unit.cefr, `ascolto:${unit.id}:${run + 1}:${index + 1}`, false));
    }
  }
  for (const [key, bucket] of Object.entries(positions)) {
    const optionCount = Number(key.split(":")[1]);
    const expectedShare = 1 / optionCount;
    for (let index = 0; index < optionCount; index += 1) {
      const share = (bucket.counts[index] ?? 0) / bucket.total;
      if (Math.abs(share - expectedShare) > 0.07) failures.push(`${key}: posizione ${index + 1} sbilanciata (${(share * 100).toFixed(1)}%)`);
    }
  }
  const uniqueFailures = [...new Set(failures)];
  const semanticReview = [...new Set(review)];
  console.log(JSON.stringify({ runsPerUnit: 120, advancedUnits: advanced.length, sessions, questions, advancedQuestions, correctPositionDistribution: positions, semanticReviewCount: semanticReview.length, semanticReview, failureCount: uniqueFailures.length, failures: uniqueFailures.slice(0, 200) }, null, 2));
  if (uniqueFailures.length) process.exitCode = 1;
} finally {
  await server.close();
}
