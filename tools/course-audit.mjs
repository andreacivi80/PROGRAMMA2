import { createServer } from "vite";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
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
    const bonus = Math.min(15, unit.writing.cloze.length + unit.vocabulary.length + unit.grammar.examples.length + unit.listening.questions.length + unit.quickCheck.length);
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
  console.log(JSON.stringify({ total: mobileCurriculum.length, levels, minMinutes: Math.min(...mobileCurriculum.map(unit => unit.minutes)), maxMinutes: Math.max(...mobileCurriculum.map(unit => unit.minutes)), exerciseMinimums, invalid, missing }, null, 2));
  if (missing.length || invalid.length || mobileCurriculum.length !== 60) process.exitCode = 1;
} finally {
  await server.close();
}