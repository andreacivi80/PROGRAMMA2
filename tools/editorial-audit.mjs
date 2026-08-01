import { readFileSync } from "node:fs";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const normalize = value => String(value ?? "").toLocaleLowerCase("it").replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
const sentences = value => String(value ?? "").split(/(?<=[.!?])\s+/).map(normalize).filter(item => item.length >= 45);
const failures = [];

try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { grammarGuideFor } = await server.ssrLoadModule("/src/grammarGuides.ts");
  const { mixedTextChunks, italianContextWords } = await server.ssrLoadModule("/src/MixedText.tsx");
  const { supplementaryBankFor } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  let reviewedSentences = 0;
  let reviewedPrompts = 0;
  let reviewedHighlights = 0;

  for (const unit of mobileCurriculum) {
    const guide = grammarGuideFor(unit);
    const lessonSentences = [
      ...guide.sections.flatMap(section => sentences(section.text)),
      ...sentences(guide.overview),
    ];
    reviewedSentences += lessonSentences.length;
    const lessonTerms = [
      ...unit.grammar.examples.map(example => example.en),
      ...unit.vocabulary.flatMap(word => [word.en, word.example]),
      unit.listening.transcript,
      unit.speaking.target,
    ];
    for (const [location, text] of [["panoramica", guide.overview], ...guide.sections.map((section, index) => [`sezione ${index + 1}`, section.text])]) {
      const highlights = mixedTextChunks(text, lessonTerms).filter(chunk => chunk.english);
      reviewedHighlights += highlights.length;
      highlights.filter(chunk => italianContextWords.has(normalize(chunk.value))).forEach(chunk => failures.push(`${unit.id}, ${location}: italiano evidenziato come inglese «${chunk.value}» nel testo «${text}»`));
    }
    const repeated = [...new Set(lessonSentences.filter((sentence, index) => lessonSentences.indexOf(sentence) !== index))];
    repeated.forEach(sentence => failures.push(`${unit.id}: concetto ripetuto «${sentence.slice(0, 90)}»`));

    unit.grammar.explanationIt.forEach((text, index) => {
      if (!/[.!?]$/.test(text.trim())) failures.push(`${unit.id}: spiegazione ${index + 1} senza chiusura`);
    });
    unit.grammar.examples.forEach((example, index) => {
      if (!example.en.trim() || !example.it.trim() || !/[.!?]$/.test(example.noteIt.trim())) failures.push(`${unit.id}: esempio ${index + 1} incompleto`);
    });

    const prompts = [...unit.quickCheck, ...unit.listening.questions, ...supplementaryBankFor(unit)].map(item => normalize(item.prompt));
    reviewedPrompts += prompts.length;
    const duplicatePrompts = [...new Set(prompts.filter((prompt, index) => prompt && prompts.indexOf(prompt) !== index))];
    duplicatePrompts.forEach(prompt => failures.push(`${unit.id}: domanda ripetuta «${prompt.slice(0, 90)}»`));
  }

  const interfaceSources = ["src/App.tsx", "src/PlacementTest.tsx", "src/ReviewLab.tsx", "src/SkillsLab.tsx", "src/ThemePackLab.tsx", "src/WordGamesHub.tsx"]
    .map(file => readFileSync(file, "utf8"))
    .join("\n");
  const obsoleteInterfaceText = [
    "Write in English…", "What I said…", "I heard…", "← Games", "Previous best:",
    "Reveal one letter", "Check crossword", "Skip puzzle", "tries left", "Finish session",
    "Skip this question", "Next question", "Play with English", "Six autonomous games",
  ];
  obsoleteInterfaceText.filter(text => interfaceSources.includes(text)).forEach(text => failures.push(`interfaccia non tradotta: ${text}`));
  const themeInterface = ["src/App.tsx", "src/ThemePackHub.tsx", "src/ThemePackLab.tsx"].map(file => readFileSync(file, "utf8")).join("\n");
  if (/versionBadge|introducedIn/.test(themeInterface)) failures.push("i percorsi tematici mostrano ancora etichette tecniche di vecchie revisioni");

  console.log(JSON.stringify({ lessons: mobileCurriculum.length, reviewedSentences, reviewedPrompts, reviewedHighlights, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await server.close();
}
