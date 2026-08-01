import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const norm = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’']/g, "'").replace(/[^a-z0-9à-ÿ' ]+/g, " ").replace(/\s+/g, " ").trim();
const stop = new Set("the a an and or of to in on at for from with by is are was were be been being do does did have has had it this that these those what which who where when why how yes no not mentioned true false correct incorrect i you he she we they my your his her our their il lo la i gli le un una e o di a da con per che è sono era erano questo questa non sì no".split(" "));
const tokens = value => [...new Set(norm(value).split(" ").filter(token => token.length > 2 && !stop.has(token)))];
const issues = [];
const countWarnings = [];
const reviewed = [];
let checked = 0;
const distributions = {};
const check = ({ group, id, level, prompt, options, answer, explanationIt, evidence = "" }) => {
  checked += 1;
  const label = `${group}:${id}`;
  if (!Array.isArray(options) || options.length < 3) issues.push(`${label}: meno di tre risposte`);
  const expectedOptions = level === "C1" ? 5 : level === "B1" || level === "B2" ? 4 : 3;
  if (options.length < expectedOptions) countWarnings.push(`${label}: ${options.length} opzioni; obiettivo avanzato ${expectedOptions}`);
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) { issues.push(`${label}: indice risposta non valido`); return; }
  const bucket = distributions[`${level}:${group}`] ??= { total: 0, positions: {}, optionCounts: {} };
  bucket.total += 1;
  bucket.positions[answer + 1] = (bucket.positions[answer + 1] ?? 0) + 1;
  bucket.optionCounts[options.length] = (bucket.optionCounts[options.length] ?? 0) + 1;
  const normalOptions = options.map(norm);
  if (new Set(normalOptions).size !== normalOptions.length) issues.push(`${label}: risposte duplicate ${JSON.stringify(options)}`);
  if (normalOptions.some(option => !option)) issues.push(`${label}: risposta vuota`);
  if (normalOptions.some(option => ["none of these", "a different structure", "all of the above"].includes(option))) issues.push(`${label}: distrattore generico o facilmente eliminabile`);
  if ((level === "B2" || level === "C1") && options[answer]?.length >= 12) {
    const correctLength = options[answer].length;
    const extreme = options.filter((_, index) => index !== answer).filter(option => option.length < correctLength * 0.25 || option.length > correctLength * 4);
    if (extreme.length > 1) issues.push(`${label}: distrattori avanzati troppo diversi per lunghezza ${JSON.stringify(options)}`);
  }
  const correct = options[answer], support = `${prompt} ${explanationIt} ${evidence}`;
  const meaningful = tokens(correct);
  const supported = meaningful.length === 0 || meaningful.some(token => norm(support).includes(token));
  if (!supported) reviewed.push({ label, prompt, correct, explanationIt, reason: "nessun termine della risposta compare nella domanda, spiegazione o fonte" });
  const grammarSamples = [prompt, correct, explanationIt].map(norm);
  const badPatterns = [
    /\bi am agree\b/,
    /\bdid\s+\w+\s+(went|saw|made|took|came|gave|wrote|spoke)\b/,
    /\bdoes\s+(he|she|it)\s+has\b/,
  ];
  const suspectGrammar = grammarSamples.find(sample => badPatterns.some(pattern => pattern.test(sample)));
  if (suspectGrammar) issues.push(`${label}: possibile errore grammaticale in «${suspectGrammar.slice(0, 120)}»`);
  if (!String(prompt).trim() || !String(explanationIt).trim()) issues.push(`${label}: domanda o spiegazione vuota`);
};

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { supplementaryBankFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  for (const unit of mobileCurriculum) {
    unit.listening.questions.forEach((question, index) => check({ group: "listening", id: `${unit.id}-${index + 1}`, level: unit.cefr, ...question, evidence: unit.listening.transcript }));
    unit.quickCheck.forEach((question, index) => check({ group: "lesson", id: `${unit.id}-${index + 1}`, level: unit.cefr, ...question, evidence: `${unit.grammar.explanationIt.join(" ")} ${unit.grammar.formulas.join(" ")} ${unit.grammar.examples.map(example => `${example.en} ${example.it}`).join(" ")}` }));
    supplementaryBankFor(unit).forEach((question, index) => check({ group: "extra", id: `${unit.id}-${index + 1}`, level: unit.cefr, ...question, evidence: `${unit.grammar.explanationIt.join(" ")} ${unit.grammar.examples.map(example => `${example.en} ${example.it} ${example.noteIt}`).join(" ")} ${unit.vocabulary.map(word => `${word.en} ${word.it} ${word.example}`).join(" ")} ${unit.listening.transcript} ${unit.speaking.target}` }));
  }
  for (const passage of readingPassages) passage.questions.forEach((question, index) => check({ group: "reading", id: `${passage.id}-${index + 1}`, level: passage.level, ...question, evidence: passage.paragraphs.join(" ") }));
  for (const pack of themePacks) pack.questions.forEach((question, index) => check({ group: "theme", id: `${pack.id}-${index + 1}`, level: pack.level, ...question, evidence: `${pack.scenario.text} ${pack.scenario.translation}` }));
  const skewed = Object.entries(distributions).flatMap(([key, value]) => {
    if (value.total < 12) return [];
    const shares = Object.values(value.positions).map(count => count / value.total);
    return Math.max(...shares) > 0.55 ? [`${key}: risposte corrette troppo concentrate`] : [];
  });
  issues.push(...skewed);
  const summary = { checked, hardIssues: issues, optionCountWarnings: countWarnings.slice(0, 80), optionCountWarningTotal: countWarnings.length, manualReview: reviewed.slice(0, 80), manualReviewCount: reviewed.length, distributions };
  console.log(JSON.stringify(summary, null, 2));
  if (issues.length) process.exitCode = 1;
} finally {
  await server.close();
}
