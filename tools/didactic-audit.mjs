import { createServer } from "vite";
import { readFileSync } from "node:fs";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { grammarGuideFor } = await server.ssrLoadModule("/src/grammarGuides.ts");
  const { readingPassages } = await server.ssrLoadModule("/src/readingLab.ts");
  const { themePacks } = await server.ssrLoadModule("/src/themePacks.ts");
  const { supplementaryBankFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const choiceGroups = {
    course: mobileCurriculum.flatMap(unit => [...unit.listening.questions, ...unit.quickCheck]),
    reading: readingPassages.flatMap(passage => passage.questions),
    themes: themePacks.flatMap(pack => pack.questions),
    supplementary: mobileCurriculum.flatMap(supplementaryBankFor),
  };
  const invalidChoices = Object.entries(choiceGroups).flatMap(([group, choices]) => choices.flatMap((choice, index) => {
    const unique = new Set(choice.options.map(option => option.trim().toLowerCase()));
    const invalid = choice.options.length < 3 || unique.size !== choice.options.length || choice.answer < 0 || choice.answer >= choice.options.length || choice.explanationIt.length < 100;
    return invalid ? [`${group}:${index}`] : [];
  }));
  const guides = mobileCurriculum.map(unit => ({ unit, guide: grammarGuideFor(unit) }));
  const duplicateGuideConcepts = guides.flatMap(({ unit, guide }) => {
    const sentences = [guide.overview, ...guide.sections.map(section => section.text)]
      .flatMap(text => text.split(/(?<=[.!?])\s+/))
      .map(text => text.toLocaleLowerCase("it").replace(/\s+/g, " ").trim())
      .filter(text => text.length >= 45);
    const repeated = [...new Set(sentences.filter((sentence, index) => sentences.indexOf(sentence) !== index))];
    return repeated.map(sentence => `${unit.id}:${sentence.slice(0, 70)}`);
  });
  const invalidGuides = guides.filter(({ guide }) => guide.sections.length < 5 || guide.overview.length < 100 || guide.sections.some(section => section.text.length < 65) || guide.overview.length + guide.sections.reduce((sum, section) => sum + section.text.length, 0) < 800).map(({ unit }) => unit.id);
  const invalidCourse = mobileCurriculum.filter(unit =>
    unit.grammar.explanationIt.length < 3 ||
    unit.grammar.formulas.length < 3 ||
    unit.grammar.examples.length < 3 ||
    unit.grammar.explanationIt.some(text => !/[.!?]$/.test(text)) ||
    unit.grammar.examples.some(example => !example.en || !example.it || example.noteIt.length < 4 || !/[.!?]$/.test(example.noteIt)) ||
    unit.writing.cloze.some(exercise => exercise.answers.length < 1 || exercise.hintIt.length < 80)
  ).map(unit => unit.id);
  const grammarLesson = readFileSync("src/GrammarLesson.tsx", "utf8");
  const mixedText = readFileSync("src/MixedText.tsx", "utf8");
  const conceptText = readFileSync("src/ConceptText.tsx", "utf8");
  const interfaceChecks = {
    allLessonsUseDeepGuide: grammarLesson.includes("grammarGuideFor(unit)"),
    englishSourcesBecomeTerms: grammarLesson.includes("englishSources") && grammarLesson.includes("lessonTerms") && !grammarLesson.includes("sourceWords"),
    englishIsSemanticallyMarked: mixedText.includes('className="inlineEnglish"') && mixedText.includes('lang="en"'),
    conceptsAreSeparated: conceptText.includes("splitConcepts(text).map") && conceptText.includes("<p key="),
    repeatedExamplesAreHidden: grammarLesson.includes("seenExamples.has(key)") && grammarLesson.includes("commentedExamples.length > 0"),
    correctAndWrongUseExplanation: readFileSync("src/ReviewLab.tsx", "utf8").includes("consolidiamo il motivo") && readFileSync("src/ThemePackLab.tsx", "utf8").includes("item.explanationIt"),
  };
  const summary = Object.fromEntries(Object.entries(choiceGroups).map(([name, choices]) => [name, { questions: choices.length, minimumExplanation: Math.min(...choices.map(choice => choice.explanationIt.length)) }]));
  const failed = [...invalidGuides, ...invalidCourse, ...invalidChoices, ...duplicateGuideConcepts, ...Object.entries(interfaceChecks).filter(([, ok]) => !ok).map(([name]) => name)];
  console.log(JSON.stringify({ lessons: mobileCurriculum.length, guides: guides.length, summary, invalidGuides, invalidCourse, invalidChoices: invalidChoices.slice(0, 20), duplicateGuideConcepts, interfaceChecks, failed: failed.slice(0, 40) }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await server.close();
}
