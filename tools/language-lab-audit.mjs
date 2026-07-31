import { createServer } from "vite";
import { readFileSync } from "node:fs";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { analyzeLocalWriting } = await server.ssrLoadModule("/src/languageAnalysis.ts");
  const cases = [
    ["i am agree", "I agree."],
    ["She dont work here", "She doesn't work here."],
    ["He doesnt likes coffee", "He doesn't like coffee."],
    ["I did went home", "I did go home."],
    ["This is more better", "This is better."],
    ["There is apples", "There are apples."],
    ["I need a apple", "I need an apple."],
    ["It depend of much people", "It depends on many people."],
  ];
  const writingCases = cases.map(([input, expected]) => {
    const result = analyzeLocalWriting(input, "audit formula");
    return { input, expected, received: result.corrected, explained: result.notes.length > 0, ok: result.corrected === expected && result.notes.length > 0 };
  });
  const clean = analyzeLocalWriting("I work from home.", "subject + verb");
  const app = readFileSync("src/App.tsx", "utf8").replace(/\s+/g, " ");
  const css = readFileSync("src/appEnhancements.css", "utf8").replace(/\s+/g, " ");
  const checks = {
    writingCases: writingCases.every(test => test.ok),
    honestCleanResult: clean.corrected === "I work from home." && clean.notes[0]?.includes("controllabili offline"),
    applySuggestion: app.includes("Applica le correzioni") && app.includes("setWriting(writingSuggestion)"),
    listenSuggestion: app.includes('<AudioButton text={writingSuggestion} label="Ascolta la versione"'),
    retryWithoutJump: app.includes("focus({ preventScroll: true })"),
    dictationDiff: app.includes("dictationParts") && app.includes("wordBad wordAudio") && app.includes("Confronta con l’audio"),
    wordReplayNormalAndSlow: app.includes("playWord(x.expected!, 0.6)") && app.includes("▶ normale"),
    pronunciationScopeIsHonest: app.includes("non è un’analisi dei fonemi") && app.includes("parole e ordine riconosciuti"),
    ownVoicePlayback: app.includes("LA TUA REGISTRAZIONE") && app.includes("Riascolta ritmo, pause e chiarezza"),
    recordingIsVisible: app.includes('role="status" aria-live="assertive"') && app.includes("Registrazione in corso"),
    actionsReflowOnPhone: css.includes(".writingReviewActions { grid-template-columns: 1fr; }"),
  };
  const failed = [...writingCases.filter(test => !test.ok).map(test => `writing:${test.input}`), ...Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name)];
  console.log(JSON.stringify({ writingCases, clean, checks, failed }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await server.close();
}
