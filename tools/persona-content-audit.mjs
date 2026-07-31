import { createServer } from "vite";

const levels = ["A1", "A2", "B1", "B2", "C1"];
const words = text => String(text ?? "").trim().split(/\s+/).filter(Boolean);
const normalize = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const average = values => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length) * 10) / 10;
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { placementItems } = await server.ssrLoadModule("/src/placementModel.ts");
  const allChoices = mobileCurriculum.flatMap(unit => [...unit.quickCheck, ...unit.listening.questions].map(question => ({ ...question, unit: unit.id, level: unit.cefr })));
  const duplicates = new Map();
  for (const question of allChoices) {
    const key = `${normalize(question.prompt)}|${question.options.map(normalize).sort().join("|")}`;
    duplicates.set(key, [...(duplicates.get(key) ?? []), `${question.unit}:${question.prompt}`]);
  }
  const exactDuplicates = [...duplicates.values()].filter(group => group.length > 1);
  const invalidChoices = allChoices.filter(question => new Set(question.options.map(normalize)).size !== question.options.length || question.answer < 0 || question.answer >= question.options.length);
  const profiles = Object.fromEntries(levels.map(level => {
    const units = mobileCurriculum.filter(unit => unit.cefr === level);
    const readings = readingPassages.filter(passage => passage.level === level);
    const themes = themePacks.filter(pack => pack.level === level);
    const placements = placementItems.filter(item => item.level === level);
    const vocabulary = units.flatMap(unit => unit.vocabulary.map(item => item.en));
    const questions = units.flatMap(unit => [...unit.quickCheck, ...unit.listening.questions]);
    return [level, {
      lessons: units.length,
      averageMinutes: average(units.map(unit => unit.minutes)),
      averageListeningWords: average(units.map(unit => words(unit.listening.transcript).length)),
      averageVocabularyLength: average(vocabulary.map(value => value.replace(/\s+/g, "").length)),
      averageQuestionWords: average(questions.map(question => words(question.prompt).length)),
      readingWords: readings.map(passage => words(passage.paragraphs.join(" ")).length),
      readingLexicalLength: average(readings.flatMap(passage => words(passage.paragraphs.join(" "))).map(word => word.replace(/[^A-Za-z]/g, "").length).filter(Boolean)),
      themes: themes.length,
      placementKinds: [...new Set(placements.map(item => item.kind))].sort(),
      placementAnswers: [...new Set(placements.map(item => item.answer))].sort(),
    }];
  }));
  const placementOrder = placementItems.map(item => item.level).join(",") === levels.flatMap(level => Array(6).fill(level)).join(",");
  const checks = {
    noExactQuestionCopies: exactDuplicates.length === 0,
    noInvalidOrDuplicateOptions: invalidChoices.length === 0,
    allPersonasHaveTwelveLessons: levels.every(level => profiles[level].lessons === 12),
    lessonTimeGrowsOverall: profiles.C1.averageMinutes > profiles.A1.averageMinutes,
    listeningGrowsOverall: profiles.C1.averageListeningWords > profiles.A1.averageListeningWords,
    vocabularyGrowsOverall: profiles.C1.averageVocabularyLength > profiles.A1.averageVocabularyLength,
    readingLanguageGrowsOverall: profiles.C1.readingLexicalLength > profiles.A1.readingLexicalLength,
    everyPersonaHasReadingAndThemes: levels.every(level => profiles[level].readingWords.length >= 2 && profiles[level].themes >= 3),
    placementHasSixOrderedItemsPerLevel: placementOrder && placementItems.length === 30,
    placementMixesSkillsAtEveryLevel: levels.every(level => profiles[level].placementKinds.length === 4),
    placementDoesNotUseOneAnswerPosition: levels.every(level => profiles[level].placementAnswers.length >= 2),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ profiles, exactDuplicates, invalidChoices: invalidChoices.map(item => `${item.unit}:${item.prompt}`), checks, failed }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await server.close();
}
