import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const advanced = new Set(["B1", "B2", "C1"]);
const clean = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const identity = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const words = value => clean(value).split(" ").filter(Boolean);
const stop = new Set("the a an and or to of in on at for from with by is are was were be been being have has had do does did it this that these those i you he she we they my your his her our their which what who where when why how che quale cosa frase risposta".split(" "));
const content = value => new Set(words(value).filter(word => word.length > 2 && !stop.has(word)));
const jaccard = (left, right) => {
  const a = content(left), b = content(right), union = new Set([...a, ...b]);
  return union.size ? [...a].filter(word => b.has(word)).length / union.size : 0;
};
const absolute = /\b(always|never|only|completely|entirely|guarantees?|conclusively|automatically|necessarily|every|no possible|cannot ever)\b/i;
const filler = /^(all of the above|none of the above|none of these|something else|a different answer|un['’]altra forma|nessuna delle precedenti)$/i;
const giveaway = /\b(physically long|floor means ceiling|apartment means hotel|sensitive and delicate|forever and imagine|full stop|before yesterday)\b/i;
const failures = [];
const reviews = [];
const seen = new Set();
let checked = 0;

function inspect(question, level, label) {
  const correctIdentity = question.options?.[question.answer] === undefined ? "<missing>" : identity(question.options[question.answer]);
  const fingerprint = `${clean(question.prompt)}|${question.options?.map(identity).sort().join("|")}|${correctIdentity}`;
  if (seen.has(fingerprint)) return;
  seen.add(fingerprint);
  checked += 1;
  const options = question.options ?? [];
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= options.length) {
    failures.push(`${label}: indice della soluzione fuori intervallo`);
    return;
  }
  const correct = options[question.answer];
  const wrong = options.filter((_, index) => index !== question.answer);
  const context = () => ` | ${question.prompt} | ${options.map((option, index) => `${index === question.answer ? "✓" : "×"} ${option}`).join(" ↔ ")}`;
  if (options.length < 3) failures.push(`${label}: meno di tre opzioni`);
  if (new Set(options.map(identity)).size !== options.length) failures.push(`${label}: opzioni duplicate`);
  if (!clean(question.prompt) || options.some(option => !clean(option))) failures.push(`${label}: prompt o opzione vuota`);
  if (options.some(option => filler.test(identity(option)))) failures.push(`${label}: risposta riempitiva`);
  if (options.some(option => giveaway.test(option))) failures.push(`${label}: alternativa palesemente estranea`);

  const prompt = clean(question.prompt), correctKey = clean(correct);
  if (correctKey.length >= 4 && (` ${prompt} `).includes(` ${correctKey} `) && !/which (definition|meaning)|what does|in .+context/i.test(question.prompt))
    reviews.push(`${label}: la soluzione compare letteralmente nel prompt → ${correct}`);

  if (advanced.has(level)) {
    const lengths = options.map(option => words(option).length);
    const wrongLengths = wrong.map(option => words(option).length).sort((a, b) => a - b);
    const median = wrongLengths[Math.floor(wrongLengths.length / 2)] || 1;
    const correctLength = words(correct).length;
    if (correctLength >= 5 && (correctLength > median * 1.9 || correctLength < median * 0.5))
      failures.push(`${label}: la lunghezza rende riconoscibile la soluzione (${correctLength} contro mediana ${median})${context()}`);
    const absoluteWrong = wrong.filter(option => absolute.test(option)).length;
    const absoluteWrongOptions = wrong.filter(option => absolute.test(option));
    const inversionStarters = options.filter(option => /^\s*(only|not only|no sooner|hardly|scarcely|little|were|had)\b/i.test(option)).length;
    const isInversionContrastSet = inversionStarters >= 2;
    const absoluteDistractorsAreUnrelated = absoluteWrongOptions.every(option => jaccard(correct, option) < 0.12);
    if (!isInversionContrastSet && absoluteDistractorsAreUnrelated && !absolute.test(correct) && absoluteWrong >= Math.max(2, Math.ceil(wrong.length * 0.6)))
      failures.push(`${label}: quasi tutti i distrattori usano assoluti-spia${context()}`);
    if (correctLength >= 6 && Math.max(...wrong.map(option => jaccard(correct, option)), 0) < 0.08)
      reviews.push(`${label}: nessun distrattore condivide il nucleo lessicale della soluzione → ${correct}`);
  }
}

const planted = [
  { name: "indice non valido", q: { prompt: "Choose.", options: ["a", "b", "c"], answer: 4, explanationIt: "" }, expected: "indice" },
  { name: "duplicato", q: { prompt: "Choose.", options: ["same", "same", "other"], answer: 0, explanationIt: "" }, expected: "duplicate" },
  { name: "riempitivo", q: { prompt: "Choose.", options: ["correct", "None of the above", "wrong"], answer: 0, explanationIt: "" }, expected: "riempitiva" },
  { name: "alternativa estranea", q: { prompt: "Choose.", options: ["correct", "floor means ceiling", "wrong"], answer: 0, explanationIt: "" }, expected: "estranea" },
];
const mutationFailures = [];
for (const test of planted) {
  const before = failures.length;
  inspect(test.q, "B1", `mutazione:${test.name}`);
  const detected = failures.slice(before).some(message => message.includes(test.expected));
  if (!detected) mutationFailures.push(`${test.name}: difetto seminato non rilevato`);
}
failures.length = 0;
seen.clear();

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { semanticPrecision } = await server.ssrLoadModule("/src/semanticPrecision.ts");
  const { naturalReplies } = await server.ssrLoadModule("/src/naturalReplies.ts");
  const { questionPool } = await server.ssrLoadModule("/src/WordGamesHub.tsx");
  const { placementItems } = await server.ssrLoadModule("/src/placementModel.ts");
  const { finalQuizFor, listeningQuizFor } = await server.ssrLoadModule("/src/App.tsx");

  for (const unit of mobileCurriculum) {
    unit.quickCheck.forEach((question, index) => inspect(question, unit.cefr, `lezione:${unit.id}:${index + 1}`));
    unit.listening.questions.forEach((question, index) => inspect(question, unit.cefr, `ascolto-base:${unit.id}:${index + 1}`));
    for (let run = 0; run < 40; run += 1) {
      finalQuizFor(unit).forEach((question, index) => inspect(question, unit.cefr, `finale:${unit.id}:${run + 1}:${index + 1}`));
      listeningQuizFor(unit).forEach((question, index) => inspect(question, unit.cefr, `ascolto:${unit.id}:${run + 1}:${index + 1}`));
    }
  }
  readingPassages.forEach(passage => passage.questions.forEach((question, index) => inspect(question, passage.level, `lettura:${passage.id}:${index + 1}`)));
  themePacks.forEach(pack => pack.questions.forEach((question, index) => inspect(question, pack.level, `tema:${pack.id}:${index + 1}`)));
  placementItems.forEach(item => inspect(item, item.level, `ingresso:${item.id}`));
  for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
    semanticPrecision[level].forEach((question, index) => inspect(question, level, `precisione:${level}:${index + 1}`));
    naturalReplies[level].forEach((question, index) => inspect(question, level, `dialogo:${level}:${index + 1}`));
    questionPool(level).forEach((question, index) => inspect(question, level, `gioco:${level}:${index + 1}`));
  }
  const uniqueFailures = [...new Set([...mutationFailures, ...failures])];
  const uniqueReviews = [...new Set(reviews)];
  console.log(JSON.stringify({
    standard: "CEFR action-oriented matrix: reception, production, interaction and mediation",
    plantedDefects: planted.length,
    plantedDefectsDetected: planted.length - mutationFailures.length,
    checked,
    failureCount: uniqueFailures.length,
    failures: uniqueFailures.slice(0, 200),
    manualReviewCount: uniqueReviews.length,
    manualReview: uniqueReviews.slice(0, 120),
  }, null, 2));
  if (uniqueFailures.length) process.exitCode = 1;
} finally {
  await server.close();
}
