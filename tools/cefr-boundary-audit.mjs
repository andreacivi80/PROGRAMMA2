import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { placementItems } = await server.ssrLoadModule("/src/placementModel.ts");
  const { storyEpisodes } = await server.ssrLoadModule("/src/storyData.ts");
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  const expectedOptions = { A1: 3, A2: 3, B1: 4, B2: 4, C1: 5 };
  const profile = Object.fromEntries(levels.map(level => {
    const lessons = mobileCurriculum.filter(unit => unit.cefr === level);
    const texts = lessons.flatMap(unit => [unit.listening.transcript, unit.writing.productionPromptIt, ...unit.grammar.explanationIt]);
    const words = texts.join(" ").match(/[A-Za-zÀ-ÿ’'-]+/g) ?? [];
    const sentences = texts.join(" ").split(/[.!?]+/).map(value => value.trim().split(/\s+/).filter(Boolean).length).filter(Boolean);
    return [level, {
      lessons: lessons.length,
      averageSentenceWords: Number((sentences.reduce((a, b) => a + b, 0) / Math.max(1, sentences.length)).toFixed(1)),
      averageWordLength: Number((words.reduce((a, b) => a + b.length, 0) / Math.max(1, words.length)).toFixed(2)),
      listeningWords: Math.round(lessons.reduce((sum, unit) => sum + unit.listening.transcript.split(/\s+/).length, 0) / lessons.length),
    }];
  }));
  const forbiddenLow = /third conditional|inversion|cleft|subjunctive|mixed conditional|nominalisation|hedging|fronting/i;
  const a1a2AdvancedLeak = mobileCurriculum.filter(unit => ["A1", "A2"].includes(unit.cefr) && forbiddenLow.test(`${unit.title} ${unit.grammar.formulas.join(" ")}`));
  const advancedMarkers = /inversion|conditional|passive|hedging|register|nominal|cleft|participle|discourse|subjunctive|modal deduction/i;
  const highMarkerCount = mobileCurriculum.filter(unit => ["B2", "C1"].includes(unit.cefr) && advancedMarkers.test(`${unit.title} ${unit.grammar.formulas.join(" ")}`)).length;
  const optionCountsCorrect = placementItems.every(item => item.options.length === expectedOptions[item.level]);
  const advancedPlacement = placementItems.filter(item => ["B2", "C1"].includes(item.level));
  const balancedAdvancedOptions = advancedPlacement.every(item => {
    const lengths = item.options.map(option => option.split(/\s+/).length);
    return Math.max(...lengths) <= Math.max(3, Math.min(...lengths) * 4) && new Set(item.options.map(option => option.toLowerCase())).size === item.options.length;
  });
  const storyCountsCorrect = levels.every(level => storyEpisodes.filter(item => item.level === level).length === 3);
  const storyOptionProgression = storyEpisodes.every(item => item.choices.length === (item.level === "C1" ? 5 : ["B1", "B2"].includes(item.level) ? 4 : 3));
  const increasingComplexity = profile.A1.averageWordLength <= profile.B1.averageWordLength && profile.B1.averageWordLength <= profile.C1.averageWordLength && profile.A1.listeningWords < profile.C1.listeningWords;
  const checks = {
    twelveLessonsAtEveryLevel: levels.every(level => profile[level].lessons === 12),
    noAdvancedGrammarLeakInA1A2: a1a2AdvancedLeak.length === 0,
    advancedCurriculumHasExplicitHighLevelStructures: highMarkerCount >= 6,
    placementChoicesGrowFromThreeToFive: optionCountsCorrect,
    advancedPlacementDistractorsAreDistinctAndBalanced: balancedAdvancedOptions,
    storyHasThreeEpisodesAtEveryLevel: storyCountsCorrect,
    storyChoicesGrowFromThreeToFive: storyOptionProgression,
    languageComplexityRisesAcrossBoundaries: increasingComplexity,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ profiles: profile, advancedMarkerLessons: highMarkerCount, checks, failed }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await server.close();
}
