import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const normal = value => String(value ?? "").toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/[^a-z0-9à-ÿ' ]+/g, " ").replace(/\s+/g, " ").trim();
const tokenSet = value => new Set(normal(value).split(" ").filter(token => token.length > 2));
const similarity = (left, right) => {
  const a = tokenSet(left), b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  const shared = [...a].filter(token => b.has(token)).length;
  return shared / Math.max(a.size, b.size);
};
const rows = [];
const add = (source, level, prompt, correct = "") => {
  const normalizedPrompt = normal(prompt);
  if (normalizedPrompt) rows.push({ source, level, prompt: String(prompt).trim(), correct: String(correct).trim(), normalizedPrompt });
};
const addChoice = (source, level, choice) => add(source, level, choice.prompt, choice.options?.[choice.answer] ?? "");

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { supplementaryBankFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { placementItems } = await server.ssrLoadModule("/src/placementModel.ts");
  const { semanticPrecision } = await server.ssrLoadModule("/src/semanticPrecision.ts");
  const { naturalReplies } = await server.ssrLoadModule("/src/naturalReplies.ts");
  const { storyEpisodes } = await server.ssrLoadModule("/src/storyData.ts");
  const { wordGameSets } = await server.ssrLoadModule("/src/wordGames.ts");
  const { finalQuizFor, listeningQuizFor } = await server.ssrLoadModule("/src/App.tsx");
  const { buildReviewBank } = await server.ssrLoadModule("/src/ReviewLab.tsx");
  const { buildSupplementaryQuiz } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const { questionPool } = await server.ssrLoadModule("/src/WordGamesHub.tsx");

  for (const unit of mobileCurriculum) {
    unit.quickCheck.forEach((choice, index) => addChoice(`lezione:${unit.id}:verifica:${index + 1}`, unit.cefr, choice));
    unit.listening.questions.forEach((choice, index) => addChoice(`lezione:${unit.id}:ascolto:${index + 1}`, unit.cefr, choice));
    supplementaryBankFor(unit).forEach((choice, index) => addChoice(`lezione:${unit.id}:extra:${index + 1}`, unit.cefr, choice));
    unit.writing.cloze.forEach((item, index) => add(`lezione:${unit.id}:completamento:${index + 1}`, unit.cefr, item.prompt, item.answers?.[0] ?? ""));
  }
  themePacks.forEach(pack => pack.questions.forEach((choice, index) => addChoice(`tema:${pack.id}:${index + 1}`, pack.level, choice)));
  readingPassages.forEach(passage => passage.questions.forEach((choice, index) => addChoice(`lettura:${passage.id}:${index + 1}`, passage.level, choice)));
  placementItems.forEach(item => add(`ingresso:${item.id}`, item.level, item.prompt, item.options[item.answer]));
  Object.entries(semanticPrecision).forEach(([level, questions]) => questions.forEach((choice, index) => addChoice(`precisione:${level}:${index + 1}`, level, choice)));
  Object.entries(naturalReplies).forEach(([level, questions]) => questions.forEach((choice, index) => addChoice(`risposta-naturale:${level}:${index + 1}`, level, choice)));
  storyEpisodes.forEach((episode, index) => add(`storia:${episode.id}:${index + 1}`, episode.level, episode.prompt, episode.choices?.[episode.answer]?.text ?? ""));
  Object.entries(wordGameSets).forEach(([level, set]) => {
    set.crossword.forEach((entry, index) => add(`gioco:${level}:definizione:${index + 1}`, level, entry.clue, entry.answer));
    set.hangman.forEach((entry, index) => add(`gioco:${level}:frase:${index + 1}`, level, entry.hint, entry.phrase));
  });

  const byQuestion = new Map();
  rows.forEach(row => {
    const key = `${row.normalizedPrompt}|${normal(row.correct)}`;
    byQuestion.set(key, [...(byQuestion.get(key) ?? []), row]);
  });
  const duplicates = [...byQuestion.values()].filter(group => group.length > 1);
  const nearDuplicates = [];
  for (let left = 0; left < rows.length; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1) {
      if (rows[left].normalizedPrompt === rows[right].normalizedPrompt) continue;
      if (normal(rows[left].correct) !== normal(rows[right].correct)) continue;
      const score = similarity(rows[left].prompt, rows[right].prompt);
      if (score >= 0.9) nearDuplicates.push({ score: Number(score.toFixed(2)), left: rows[left], right: rows[right] });
    }
  }
  const generatedFailures = [];
  let generatedSessions = 0;
  let generatedQuestions = 0;
  const checkSession = (label, questions) => {
    generatedSessions += 1;
    generatedQuestions += questions.length;
    const keys = questions.map(question => `${normal(question.prompt)}|${normal(question.options?.[question.answer] ?? question.correct ?? "")}`);
    const repeated = [...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))];
    if (repeated.length) generatedFailures.push({ label, repeated });
  };
  for (const unit of mobileCurriculum) {
    for (let run = 0; run < 20; run += 1) {
      checkSession(`finale:${unit.id}:${run + 1}`, finalQuizFor(unit));
      checkSession(`ascolto:${unit.id}:${run + 1}`, listeningQuizFor(unit));
      checkSession(`supplementare:${unit.id}:${run + 1}`, buildSupplementaryQuiz(unit, 15));
    }
  }
  for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
    const units = mobileCurriculum.filter(unit => unit.cefr === level);
    for (const [groupIndex, group] of [units.slice(0, 4), units.slice(4, 8), units.slice(8, 12), units].entries()) {
      for (let run = 0; run < 20; run += 1) checkSession(`riepilogo:${level}:${groupIndex + 1}:${run + 1}`, buildReviewBank(group, groupIndex === 3 ? 24 : 20, groupIndex === 3));
    }
    for (let run = 0; run < 100; run += 1) checkSession(`giochi:${level}:${run + 1}`, questionPool(level));
  }
  console.log(JSON.stringify({ checked: rows.length, duplicateGroups: duplicates.length, duplicateRows: duplicates.reduce((sum, group) => sum + group.length, 0), duplicates, nearDuplicateWarnings: nearDuplicates.length, nearDuplicates: nearDuplicates.slice(0, 30), generatedSessions, generatedQuestions, generatedDuplicateSessions: generatedFailures.length, generatedFailures: generatedFailures.slice(0, 30) }, null, 2));
  if (duplicates.length || nearDuplicates.length || generatedFailures.length) process.exitCode = 1;
} finally {
  await server.close();
}
