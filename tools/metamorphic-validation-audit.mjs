import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const failures = [];
const checks = [];
const normal = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const questionFingerprint = question => `${normal(question.prompt)}|${question.options.map(normal).join("|")}|${question.answer}`;
const record = (name, ok, detail = "") => {
  checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
};

async function sourceFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const target = path.join(folder, entry.name);
    return entry.isDirectory() ? sourceFiles(target) : /\.(?:ts|tsx)$/.test(entry.name) ? [target] : [];
  }));
  return nested.flat();
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

async function withRandom(random, action) {
  const original = Math.random;
  Math.random = random;
  try { return await action(); }
  finally { Math.random = original; }
}

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
let inspectedQuestions = 0;
let rotatedVariants = 0;
const answersByPrompt = new Map();

function inspect(question, scope) {
  inspectedQuestions += 1;
  const options = question.options ?? [];
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= options.length) {
    failures.push(`${scope}: indice della risposta non valido`);
    return;
  }
  const correct = normal(options[question.answer]);
  const key = `${scope.split(":").slice(0, 2).join(":")}|${normal(question.prompt)}`;
  const previous = answersByPrompt.get(key);
  if (previous && previous !== correct) failures.push(`${scope}: lo stesso prompt cambia soluzione (${previous} / ${correct})`);
  else answersByPrompt.set(key, correct);

  for (let shift = 0; shift < options.length; shift += 1) {
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];
    const newAnswer = (question.answer - shift + options.length) % options.length;
    rotatedVariants += 1;
    if (normal(rotated[newAnswer]) !== correct) failures.push(`${scope}: la soluzione cambia ruotando le opzioni di ${shift}`);
    if (rotated.filter(option => normal(option) === correct).length !== 1) failures.push(`${scope}: la soluzione non è univoca dopo la rotazione`);
  }
}

try {
  const files = await sourceFiles(path.join(process.cwd(), "src"));
  const biased = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (/\.sort\s*\(\s*\(\s*\)\s*=>\s*Math\.random\s*\(\s*\)\s*-\s*0?\.5\s*\)/.test(text)) biased.push(path.relative(process.cwd(), file));
  }
  record("no-random-sort-shuffle", biased.length === 0, biased.join(", "));

  const { shuffled } = await server.ssrLoadModule("/src/random.ts");
  const original = ["a", "b", "c", "d"];
  const copy = [...original];
  shuffled(original, seeded(1));
  record("shuffle-does-not-mutate-source", JSON.stringify(original) === JSON.stringify(copy));

  const counts = [0, 0, 0, 0];
  const permutations = new Set();
  const random = seeded(0x9e3779b9);
  for (let run = 0; run < 24000; run += 1) {
    const result = shuffled(original, random);
    counts[result.indexOf("a")] += 1;
    permutations.add(result.join(""));
  }
  const expected = 6000;
  const maxDeviation = Math.max(...counts.map(count => Math.abs(count - expected) / expected));
  record("shuffle-reaches-all-permutations", permutations.size === 24, `${permutations.size}/24`);
  record("shuffle-position-distribution", maxDeviation < 0.035, `conteggi ${counts.join(", ")}; scarto ${(maxDeviation * 100).toFixed(2)}%`);

  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { placementItems } = await server.ssrLoadModule("/src/placementModel.ts");
  const { semanticPrecision } = await server.ssrLoadModule("/src/semanticPrecision.ts");
  const { naturalReplies } = await server.ssrLoadModule("/src/naturalReplies.ts");
  const { questionPool } = await server.ssrLoadModule("/src/WordGamesHub.tsx");
  const { finalQuizFor, listeningQuizFor } = await server.ssrLoadModule("/src/App.tsx");
  const { supplementaryBankFor, optionsFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const snapshots = {
    curriculum: JSON.stringify(mobileCurriculum),
    reading: JSON.stringify(readingPassages),
    themes: JSON.stringify(themePacks),
    placement: JSON.stringify(placementItems),
  };

  for (const unit of mobileCurriculum) {
    unit.quickCheck.forEach((question, index) => inspect(question, `lezione:${unit.id}:${index + 1}`));
    unit.listening.questions.forEach((question, index) => inspect(question, `ascolto-base:${unit.id}:${index + 1}`));
    supplementaryBankFor(unit).forEach((question, index) => inspect(question, `extra:${unit.id}:${index + 1}`));
    for (let run = 0; run < 80; run += 1) {
      finalQuizFor(unit).forEach((question, index) => inspect(question, `finale:${unit.id}:${run + 1}:${index + 1}`));
      listeningQuizFor(unit).forEach((question, index) => inspect(question, `ascolto:${unit.id}:${run + 1}:${index + 1}`));
    }
    const first = await withRandom(seeded(918273), () => finalQuizFor(unit).map(questionFingerprint));
    const repeated = await withRandom(seeded(918273), () => finalQuizFor(unit).map(questionFingerprint));
    record(`repeatable-seed-${unit.id}`, JSON.stringify(first) === JSON.stringify(repeated));
  }
  readingPassages.forEach(passage => passage.questions.forEach((question, index) => inspect(question, `lettura:${passage.id}:${index + 1}`)));
  themePacks.forEach(pack => pack.questions.forEach((question, index) => inspect(question, `tema:${pack.id}:${index + 1}`)));
  placementItems.forEach(item => inspect(item, `ingresso:${item.level}:${item.id}`));
  for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
    semanticPrecision[level].forEach((question, index) => inspect(question, `precisione:${level}:${index + 1}`));
    naturalReplies[level].forEach((question, index) => inspect(question, `dialogo:${level}:${index + 1}`));
    questionPool(level).forEach((question, index) => inspect(question, `gioco:${level}:${index + 1}`));
  }

  const start = await withRandom(() => 0, () => optionsFor("correct", ["first", "second", "third", "fourth"], 4));
  const end = await withRandom(() => 0.999999999, () => optionsFor("correct", ["first", "second", "third", "fourth"], 4));
  record("random-lower-bound-keeps-answer", start.answer === 0 && start.options[start.answer] === "correct", JSON.stringify(start));
  record("random-upper-bound-keeps-answer", end.answer === 3 && end.options[end.answer] === "correct", JSON.stringify(end));
  record("generators-do-not-mutate-curriculum", snapshots.curriculum === JSON.stringify(mobileCurriculum));
  record("generators-do-not-mutate-reading", snapshots.reading === JSON.stringify(readingPassages));
  record("generators-do-not-mutate-themes", snapshots.themes === JSON.stringify(themePacks));
  record("generators-do-not-mutate-placement", snapshots.placement === JSON.stringify(placementItems));
} finally {
  await server.close();
}

const uniqueFailures = [...new Set(failures)];
console.log(JSON.stringify({
  method: "metamorphic and deterministic boundary validation",
  checks: checks.length,
  inspectedQuestions,
  rotatedVariants,
  stablePromptAnswers: answersByPrompt.size,
  failureCount: uniqueFailures.length,
  failures: uniqueFailures.slice(0, 200),
}, null, 2));
if (uniqueFailures.length) process.exitCode = 1;
