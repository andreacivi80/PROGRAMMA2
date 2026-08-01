import { createServer } from "vite";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum, optionCountForLevel } = await server.ssrLoadModule("/src/curriculum.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { wordGameSets } = await server.ssrLoadModule("/src/wordGames.ts");
  const { antonymSets } = await server.ssrLoadModule("/src/gameExpansion.ts");
  const { semanticPrecision } = await server.ssrLoadModule("/src/semanticPrecision.ts");
  const { buildCrossword } = await server.ssrLoadModule("/src/WordGamesHub.tsx");
  const { supplementaryBankFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const { kitchenVisualSets, jobVisualSets, actionVisualSets, phrasalVisualSets, visualSetsForLevel } = await server.ssrLoadModule("/src/visualQuiz.ts");
  const levels = Object.fromEntries(["A1", "A2", "B1", "B2", "C1"].map(level => [level, mobileCurriculum.filter(unit => unit.cefr === level).length]));
  const missing = [];
  const invalid = [];
  const exerciseAudit = [];
  for (const unit of mobileCurriculum) {
    const heard = unit.listening.transcript.split(/(?<=[.!?])\s+/).filter(text => text.trim().length > 8);
    const cloze = Math.min(6, unit.writing.cloze.length + unit.vocabulary.length);
    const listeningAvailable = unit.listening.questions.length + Math.min(2, heard.length) + unit.quickCheck.length;
    const listeningTarget = Math.max(5, Math.min(6, unit.listening.questions.length + 2));
    const listening = Math.min(listeningAvailable, listeningTarget);
    const quiz = Math.min(6, unit.quickCheck.slice(0, 2).length + 2 + 1 + Math.min(1, unit.listening.questions.length));
    const bonus = Math.min(15, supplementaryBankFor(unit).length);
    const scored = cloze + listening + quiz;
    exerciseAudit.push({ id: unit.id, scored, cloze, listening, quiz, bonus, modalities: 7 });
    if (unit.grammar.explanationIt.length < 3 || unit.grammar.examples.length < 3 || unit.vocabulary.length < 5 || unit.listening.questions.length < 2 || unit.quickCheck.length < 2 || cloze < 6 || listening < 5 || quiz < 6 || bonus < 15) invalid.push(unit.id);
    const files = [...unit.grammar.examples.map((_, i) => `${unit.id}-example-${i + 1}.wav`), ...unit.vocabulary.map((_, i) => `${unit.id}-vocab-${i + 1}.wav`), `${unit.id}-listening.wav`, `${unit.id}-speaking.wav`];
    for (const file of files) {
      const path = resolve("public/audio", file);
      if (!existsSync(path) || statSync(path).size < 1000) missing.push(file);
    }
  }
  const exerciseMinimums = {
    scored: Math.min(...exerciseAudit.map(row => row.scored)),
    cloze: Math.min(...exerciseAudit.map(row => row.cloze)),
    listening: Math.min(...exerciseAudit.map(row => row.listening)),
    quiz: Math.min(...exerciseAudit.map(row => row.quiz)),
    bonus: Math.min(...exerciseAudit.map(row => row.bonus)),
    modalities: Math.min(...exerciseAudit.map(row => row.modalities))
  };
  const readingInvalid = readingPassages.filter(passage => passage.paragraphs.join(" ").split(/\s+/).length < 180 || passage.questions.length !== 6 || passage.glossary.length < 6 || passage.questions.some(question => question.options.length !== optionCountForLevel(passage.level) || question.answer < 0 || question.answer >= question.options.length || !question.explanationIt));
  const reading = { total: readingPassages.length, levels: Object.fromEntries(["A1", "A2", "B1", "B2", "C1"].map(level => [level, readingPassages.filter(passage => passage.level === level).length])), minWords: Math.min(...readingPassages.map(passage => passage.paragraphs.join(" ").split(/\s+/).length)), questionsPerText: Math.min(...readingPassages.map(passage => passage.questions.length)), invalid: readingInvalid.map(passage => passage.id) };
  const visualSets = [...kitchenVisualSets, ...jobVisualSets, ...actionVisualSets, ...phrasalVisualSets];
  const visualItems = visualSets.flatMap(set => set.items);
  const visualMissing = visualSets.flatMap(set => set.audioMode === "browser" ? [] : set.items).filter(item => { const slug = item.en.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); const path = resolve("public/audio/words", `${slug}.wav`); return !existsSync(path) || statSync(path).size < 1000; }).map(item => item.en);
  const visualQuiz = { sets: visualSets.length, items: visualItems.length, missingAudio: visualMissing };
  const visualLevelAudit = Object.fromEntries(["A1","A2","B1","B2","C1"].map(level => [level, Object.fromEntries(Object.entries({kitchen:kitchenVisualSets,jobs:jobVisualSets,actions:actionVisualSets,phrasal:phrasalVisualSets}).map(([category,sets]) => {
    const selected = visualSetsForLevel(sets,level), items = selected.flatMap(set => set.items);
    return [category,{sets:selected.map(set=>set.id),items:items.length,advancedClues:["B1","B2","C1"].includes(level)?items.filter(item=>item.clue).length:items.length}];
  }))]));
  const precisionAudit = Object.fromEntries(Object.entries(semanticPrecision).map(([level,questions]) => [level,{questions:questions.length,invalid:questions.filter(question => question.options.length !== optionCountForLevel(level) || question.answer < 0 || question.answer >= question.options.length || new Set(question.options.map(option=>option.toLowerCase().trim())).size !== question.options.length || !question.explanationIt.trim()).length}]));
  const themePackInvalid = themePacks.filter(pack => !["2.7", "2.8", "2.9", "3.0", "3.1", "7.3", "7.5", "7.7", "7.8"].includes(pack.introducedIn) || pack.guide.length < 4 || pack.vocabulary.length !== 8 || pack.questions.length < 2 || pack.scenario.text.split(/\s+/).length < 20 || pack.questions.some(question => question.options.length < 3 || question.answer < 0 || question.answer >= question.options.length) || (["real-life","professional"].includes(pack.category) && ["B1","B2","C1"].includes(pack.level) && pack.questions.some(question => question.options.length < (pack.level === "C1" ? 5 : 4))));
  const wordGames = Object.fromEntries(Object.entries(wordGameSets).map(([level,set]) => {
    const opposites = antonymSets[level];
    const groups = Object.groupBy(opposites, item => item.group);
    const terms = opposites.flatMap(item => [item.left.toLowerCase(), item.right.toLowerCase()]);
    return [level, {
      crosswordWords:set.crossword.length,
      placedWords:buildCrossword(set.crossword).placed.length,
      hangmanPhrases:set.hangman.length,
      oppositePairs:opposites.length,
      oppositeGroups:Object.keys(groups).length,
      invalidOpposites:opposites.filter(item => !item.left.trim() || !item.right.trim() || item.left.toLowerCase() === item.right.toLowerCase()).length,
      repeatedOppositeTerms:terms.length - new Set(terms).size,
      invalidGroupSizes:Object.values(groups).filter(group => group.length !== 5).length
    }];
  }));
  const themePackAudit = { total: themePacks.length, social: themePacks.filter(pack => pack.category === "social").length, dining: themePacks.filter(pack => pack.category === "dining").length, ira: themePacks.filter(pack => pack.category === "ira").length, accents: themePacks.filter(pack => pack.category === "accents").length, language: themePacks.filter(pack => pack.category === "language").length, realLife: themePacks.filter(pack => pack.category === "real-life").length, professional: themePacks.filter(pack => pack.category === "professional").length, levels: Object.fromEntries(["A1", "A2", "B1", "B2", "C1"].map(level => [level, themePacks.filter(pack => pack.level === level).length])), invalid: themePackInvalid.map(pack => pack.id) };
  console.log(JSON.stringify({ total: mobileCurriculum.length, levels, minMinutes: Math.min(...mobileCurriculum.map(unit => unit.minutes)), maxMinutes: Math.max(...mobileCurriculum.map(unit => unit.minutes)), exerciseMinimums, reading, visualQuiz, visualLevelAudit, precisionAudit, themePackAudit, wordGames, invalid, missing }, null, 2));
  const visualLevelInvalid = Object.values(visualLevelAudit).some(categories => Object.values(categories).some(row => row.items < 9 || row.advancedClues !== row.items));
  const a1B2VisualOverlap = Object.keys(visualLevelAudit.A1).some(category => visualLevelAudit.A1[category].sets.some(id => visualLevelAudit.B2[category].sets.includes(id)));
  if (missing.length || invalid.length || readingInvalid.length || visualMissing.length || readingPassages.length !== 10 || visualItems.length < 135 || visualLevelInvalid || a1B2VisualOverlap || Object.values(precisionAudit).some(row => row.questions !== 15 || row.invalid) || themePackInvalid.length || themePacks.length !== 42 || themePackAudit.social !== 5 || themePackAudit.dining !== 4 || themePackAudit.ira !== 4 || themePackAudit.accents !== 8 || themePackAudit.language !== 5 || themePackAudit.realLife !== 11 || themePackAudit.professional !== 5 || themePacks.filter(pack => pack.category === "accents").some(pack => !pack.authenticAudio?.url || !pack.sourceUrl) || Object.values(wordGames).some(game => game.crosswordWords < 8 || game.placedWords < 5 || game.hangmanPhrases < 25 || game.oppositePairs !== 15 || game.oppositeGroups !== 3 || game.invalidOpposites || game.repeatedOppositeTerms || game.invalidGroupSizes) || mobileCurriculum.length !== 60) process.exitCode = 1;
} finally {
  await server.close();
}
