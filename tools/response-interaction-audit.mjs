import React from "react";
import { Window } from "happy-dom";
import { createServer } from "vite";

const window = new Window({ url: "https://andreacivi80.github.io/PROGRAMMA2/", width: 390, height: 844 });
for (const [name, value] of Object.entries({ window, document: window.document, navigator: window.navigator, history: window.history, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage, HTMLElement: window.HTMLElement, HTMLMediaElement: window.HTMLMediaElement, Node: window.Node, Event: window.Event, MouseEvent: window.MouseEvent, KeyboardEvent: window.KeyboardEvent, getComputedStyle: window.getComputedStyle.bind(window), scrollTo: () => undefined, requestAnimationFrame: callback => setTimeout(callback, 0), cancelAnimationFrame: clearTimeout })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
window.scrollTo = () => undefined;
window.HTMLElement.prototype.scrollIntoView = () => undefined;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.URL.createObjectURL = () => "blob:response-audit";
window.URL.revokeObjectURL = () => undefined;
Object.defineProperty(window.navigator, "mediaDevices", { value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
Object.defineProperty(window, "speechSynthesis", { value: { speaking: false, paused: false, getVoices: () => [], speak: utterance => { utterance.onstart?.(); utterance.onend?.(); }, cancel() {}, pause() {}, resume() {} } });
globalThis.speechSynthesis = window.speechSynthesis;
globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; this.rate = 1; this.lang = ""; } };
globalThis.Audio = class { constructor(src) { this.src = src; this.currentTime = 0; this.playbackRate = 1; } play() { return Promise.resolve(); } pause() {} load() {} };

let speechTranscript = "";
class SpeechRecognitionMock {
  start() {
    setTimeout(() => {
      const alternative = { transcript: speechTranscript };
      this.onresult?.({ results: Object.assign([[alternative]], { length: 1 }) });
      this.onend?.();
    }, 0);
  }
  stop() { this.onend?.(); }
}
window.SpeechRecognition = SpeechRecognitionMock;

const { render, fireEvent, screen, cleanup } = await import("@testing-library/react");
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });

try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { isAcceptedAnswer, orderedResponseScore, compareResponseWords } = await server.ssrLoadModule("/src/responseValidation.ts");
  const { analyzeLocalWriting } = await server.ssrLoadModule("/src/languageAnalysis.ts");
  const b1 = mobileCurriculum.find(unit => unit.id === "b1-present-perfect");
  if (!b1) throw new Error("Lezione B1 Present Perfect non trovata");

  let totalCloze = 0;
  for (const unit of mobileCurriculum) for (const exercise of unit.writing.cloze) {
    check(`cloze-placeholder-${unit.id}-${totalCloze}`, exercise.prompt.includes("___") && !/___(?:s|d|ed|ing)\b/i.test(exercise.prompt), exercise.prompt);
    for (const answer of exercise.answers) {
      totalCloze++;
      check(`cloze-correct-${unit.id}-${totalCloze}`, isAcceptedAnswer(answer, exercise.answers), `${exercise.prompt} => ${answer}`);
      check(`cloze-case-space-${unit.id}-${totalCloze}`, isAcceptedAnswer(`  ${answer.toUpperCase()}  `, exercise.answers), answer);
      check(`cloze-mobile-hidden-char-${unit.id}-${totalCloze}`, isAcceptedAnswer(`${answer}\u200B`, exercise.answers), answer);
      check(`cloze-wrong-${unit.id}-${totalCloze}`, !isAcceptedAnswer(`definitely-wrong-${totalCloze}`, exercise.answers), exercise.prompt);
    }
  }
  check("cloze-bank-is-not-empty", totalCloze >= 150, `${totalCloze} risposte controllate`);
  check("exact-for-is-correct", isAcceptedAnswer("for", ["for"]));
  check("exact-been-is-correct", isAcceptedAnswer("been", ["been"]));
  check("wrong-four-is-rejected-for-for", !isAcceptedAnswer("four", ["for"]));

  check("dictation-exact-is-100", orderedResponseScore(b1.listening.transcript, b1.listening.transcript) === 100);
  check("dictation-wrong-is-not-100", orderedResponseScore(b1.listening.transcript, "I heard something else") < 100);
  check("pronunciation-exact-all-green", compareResponseWords(b1.speaking.target, b1.speaking.target).every(part => part.ok));
  check("pronunciation-error-is-red", compareResponseWords(b1.speaking.target, "I worked there yesterday").some(part => !part.ok));

  const goodWriting = analyzeLocalWriting("I have worked here since 2021, and I have already finished the report.", b1.grammar.formulas[0]);
  const badWriting = analyzeLocalWriting("i has work here since 2021", b1.grammar.formulas[0]);
  check("free-writing-preserves-valid-text", goodWriting.corrected === "I have worked here since 2021, and I have already finished the report.", goodWriting.corrected);
  check("free-writing-reports-real-error", badWriting.notes.length > 0 && badWriting.corrected !== "i has work here since 2021", JSON.stringify(badWriting));

  const baseProgress = { schemaVersion: 14, deviceId: "response-audit", currentDay: b1.day, streak: 0, weeklyGoal: 3, days: {}, activity: {}, reading: {}, reviews: {}, themePacks: {}, wordGames: {}, lessonFeedback: {}, learningGoal: "Conversazione quotidiana", savedPhrases: [], weeklyChallenges: {}, monthlyChecks: {}, smartReview: {} };
  const mountAt = async (phase, item = 0) => {
    cleanup(); localStorage.clear(); sessionStorage.clear();
    localStorage.setItem("english-coach-onboarding-v1", "done");
    localStorage.setItem("english-coach-view-v1", "lesson");
    localStorage.setItem("english-coach-selection-v1", JSON.stringify({ level: "B1", lessonId: b1.id }));
    localStorage.setItem("english-coach-progress-v2", JSON.stringify(baseProgress));
    localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify({ [b1.id]: { unitId: b1.id, phase, item, input: "", checked: null, writing: "", points: { yes: 0, all: 0 }, updatedAt: new Date().toISOString() } }));
    render(React.createElement(App)); await wait(40);
  };

  for (const [item, answer] of [[0, "for"], [2, "been"]]) {
    await mountAt("cloze", item);
    const input = screen.getByRole("textbox", { name: /La parola mancante/ });
    fireEvent.change(input, { target: { value: answer } });
    fireEvent.click(screen.getByRole("button", { name: /Verifica/ })); await wait(15);
    check(`ui-${answer}-turns-green`, Boolean(document.querySelector(".feedback.good")) && Boolean(screen.getByText("Perfetto!")), document.body.textContent.slice(-500));
  }
  await mountAt("cloze", 0);
  fireEvent.change(screen.getByRole("textbox", { name: /La parola mancante/ }), { target: { value: "four" } });
  fireEvent.click(screen.getByRole("button", { name: /Verifica/ })); await wait(15);
  check("ui-wrong-answer-turns-red", Boolean(document.querySelector(".feedback.bad")) && Boolean(screen.getByText("Rivediamola insieme.")));

  await mountAt("listening", 0);
  fireEvent.click(screen.getByText(/Dettato facoltativo/));
  fireEvent.change(screen.getByPlaceholderText(/Scrivi in inglese ciò che hai sentito/), { target: { value: b1.listening.transcript } });
  fireEvent.click(screen.getByRole("button", { name: "Confronta con l’audio" })); await wait(15);
  check("ui-exact-dictation-is-100-and-green", Boolean(screen.getByText("100% riconosciuto")) && document.querySelectorAll(".dictationResult .wordBad").length === 0);

  await mountAt("speaking", 0);
  speechTranscript = b1.speaking.target;
  fireEvent.click(screen.getByRole("button", { name: /Parla in inglese/ })); await wait(150);
  check("ui-exact-speech-is-100-and-green", Boolean(screen.getByText("100% di parole e ordine riconosciuti")) && document.querySelectorAll(".pronunciationCompare .wordBad").length === 0);
  await mountAt("speaking", 0);
  speechTranscript = "I worked there yesterday";
  fireEvent.click(screen.getByRole("button", { name: /Parla in inglese/ })); await wait(150);
  check("ui-wrong-speech-shows-errors", document.querySelectorAll(".pronunciationCompare .wordBad").length > 0 && Boolean(document.querySelector(".retryWords")));
} finally {
  cleanup();
  await server.close();
}

const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ exerciseType: "written-and-spoken-responses", totalChecks: checks.length, failed }, null, 2));
if (failed.length) process.exitCode = 1;
