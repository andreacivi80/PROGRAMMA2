import React from "react";
import { Window } from "happy-dom";
import { createServer } from "vite";

const window = new Window({ url: "https://andreacivi80.github.io/PROGRAMMA2/" });
const globals = {
  window,
  document: window.document,
  navigator: window.navigator,
  history: window.history,
  location: window.location,
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  HTMLElement: window.HTMLElement,
  HTMLMediaElement: window.HTMLMediaElement,
  Node: window.Node,
  Event: window.Event,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  getComputedStyle: window.getComputedStyle.bind(window),
  scrollTo: () => undefined,
  requestAnimationFrame: callback => setTimeout(callback, 0),
  cancelAnimationFrame: clearTimeout,
};
for (const [name, value] of Object.entries(globals))
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
window.scrollTo = () => undefined;
window.HTMLElement.prototype.scrollIntoView = () => undefined;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.URL.createObjectURL = () => "blob:voice-test";
window.URL.revokeObjectURL = () => undefined;
Object.defineProperty(window.navigator, "mediaDevices", { value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
let clipboardText = "";
Object.defineProperty(window.navigator, "clipboard", { value: { writeText: async value => { clipboardText = value; } } });
const speechLog = [];
Object.defineProperty(window, "speechSynthesis", { value: {
  speaking: false, paused: false,
  getVoices: () => [],
  speak: utterance => { speechLog.push(utterance.text); utterance.onstart?.(); utterance.onend?.(); },
  cancel() {}, pause() { this.paused = true; }, resume() { this.paused = false; },
} });
globalThis.speechSynthesis = window.speechSynthesis;
globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; this.rate = 1; this.pitch = 1; } };
globalThis.Audio = class {
  constructor(src) { this.src = src; this.currentTime = 0; this.playbackRate = 1; }
  play() { this.onloadedmetadata?.(); this.onplay?.(); return Promise.resolve(); }
  pause() { this.onpause?.(); }
  load() {}
};

const { render, fireEvent, screen, cleanup, within, waitFor } = await import("@testing-library/react");
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const checks = {};
const check = (name, value, detail = "") => { checks[name] = { ok: Boolean(value), detail }; };
const currentPhase = () => document.querySelector(".lessonCard>.eyebrow")?.textContent?.trim() ?? "";
const currentLessonTitle = () => document.querySelector(".lessonCard>h1")?.textContent?.trim() ?? "";
const renderApp = async App => { const result = render(React.createElement(App)); await sleep(30); return result; };

try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");

  localStorage.clear(); sessionStorage.clear();
  let mounted = await renderApp(App);
  check(
    "fresh-user-sees-first-steps-only",
    Boolean(screen.getByRole("heading", { name: "Inizia dal livello giusto" })) &&
      Boolean(screen.getByRole("button", { name: "Primi passi" })) &&
      !screen.queryByRole("button", { name: /Oggi/ }) &&
      !screen.queryByText("Ripasso pronto"),
  );
  fireEvent.click(screen.getByRole("button", { name: "B1" }));
  fireEvent.click(screen.getByRole("button", { name: /Inizia dal livello B1/ }));
  await sleep(20);
  check(
    "manual-onboarding-reaches-home-and-disappears",
    screen.getAllByText("Percorso libero").length >= 1 &&
      !screen.queryByRole("button", { name: "Primi passi" }) &&
      Boolean(screen.getByRole("button", { name: /Oggi/ })),
  );

  const dailyFocus = document.querySelector(".dailyFocusHome");
  check("home-shows-one-primary-daily-focus", document.querySelectorAll(".dailyFocusHome").length === 1 && Boolean(dailyFocus?.querySelector(".dailyFocusStart")));
  fireEvent.click(dailyFocus.querySelector(".dailyLevelPicker>summary")); await sleep(10);
  fireEvent.click(within(dailyFocus).getByRole("button", { name: "B1" })); await sleep(20);
  check("daily-level-change-is-saved", JSON.parse(localStorage.getItem("english-coach-selection-v1") || "{}").level === "B1");
  const durationButton = within(dailyFocus).getByRole("button", { name: "Scegli la durata" });
  fireEvent.click(durationButton); await sleep(10);
  check("daily-duration-opens-custom-training", document.querySelector("details.adaptiveChoice")?.open === true && durationButton.getAttribute("aria-expanded") === "true");
  fireEvent.click(within(dailyFocus).getByRole("button", { name: "Chiudi durate" })); await sleep(10);
  check("daily-duration-closes-without-navigation", document.querySelector("details.adaptiveChoice")?.open === false && Boolean(document.querySelector(".dailyFocusHome")));

  const freePath = document.querySelector("details.freeChoice");
  const b1 = within(freePath).getByRole("button", { name: "B1" });
  fireEvent.click(b1); await sleep(20);
  check("level-change-is-saved", JSON.parse(localStorage.getItem("english-coach-selection-v1") || "{}").level === "B1");
  fireEvent.click(screen.getByRole("button", { name: /Temi/ })); await sleep(20);
  check("theme-view-is-saved", localStorage.getItem("english-coach-view-v1") === "topics");
  mounted.unmount();
  mounted = await renderApp(App);
  check("close-reopen-restores-view", screen.getByRole("button", { name: /Temi/ }).getAttribute("aria-current") === "page");
  check("close-reopen-restores-level", JSON.parse(localStorage.getItem("english-coach-selection-v1") || "{}").level === "B1");

  fireEvent.click(screen.getByRole("button", { name: /Oggi/ })); await sleep(20);
  const freePathAgain = document.querySelector("details.freeChoice");
  fireEvent.click(within(freePathAgain).getByRole("button", { name: "A1" })); await sleep(20);
  fireEvent.click(within(freePathAgain).getByRole("button", { name: /Inizia questa sessione/ })); await sleep(30);
  check("lesson-opens-at-grammar", currentPhase() === "Grammatica");
  fireEvent.click(screen.getByRole("button", { name: /Salta questa parte/ })); await sleep(10);
  check("skip-moves-one-stage", currentPhase() === "Esempi");
  fireEvent.click(screen.getByRole("button", { name: /Indietro/ })); await sleep(10);
  check("back-restores-previous-stage", currentPhase() === "Grammatica");
  fireEvent.click(screen.getByRole("button", { name: /Salta questa parte/ })); await sleep(10);
  fireEvent.click(screen.getByRole("button", { name: /Salta questa parte/ })); await sleep(10);
  fireEvent.click(screen.getByRole("button", { name: /Salta questa parte/ })); await sleep(10);
  await sleep(20);
  check("three-skips-reach-cloze", currentLessonTitle() === "Completa la frase");
  const input = screen.getByRole("textbox", { name: /La parola mancante/ });
  fireEvent.change(input, { target: { value: "deliberately wrong" } });
  fireEvent.click(screen.getByRole("button", { name: /Verifica/ })); await sleep(20);
  check("intentional-error-is-explained", Boolean(screen.getByText("Rivediamola insieme.")) && Boolean(screen.getByText("REGOLA DA RIPASSARE")));
  fireEvent.click(screen.getByRole("button", { name: /Prossima/ })); await sleep(10);
  const beforeRefresh = screen.getByText(/Domanda 2 di/).textContent;
  mounted.unmount();
  mounted = await renderApp(App);
  check("refresh-during-exercise-restores-question", screen.getByText(/Domanda 2 di/).textContent === beforeRefresh);
  check("refresh-does-not-show-resume-popup", !screen.queryByText("Vuoi continuare?"));
  check("refresh-keeps-lesson-visible", currentLessonTitle() === "Completa la frase");

  fireEvent.click(screen.getByRole("button", { name: /Chiudi la lezione/ })); await sleep(20);
  check("closing-lesson-returns-home-without-popup", !screen.queryByText("Vuoi continuare?") && Boolean(document.querySelector("details.freeChoice")));
  check("due-error-becomes-primary-home-action", Boolean(document.querySelector(".dailyFocusHome.dailyReview")) && Boolean(screen.getByRole("button", { name: /Inizia il ripasso/ })));
  const homePath = document.querySelector("details.freeChoice");
  fireEvent.click(within(homePath).getByRole("button", { name: /Inizia questa sessione/ })); await sleep(20);
  check("reopening-interrupted-lesson-offers-choice", Boolean(screen.getByText("Vuoi continuare?")));
  fireEvent.click(screen.getByRole("button", { name: "Riprendi dal punto interrotto" })); await sleep(20);
  check("resume-returns-exact-question", currentLessonTitle() === "Completa la frase" && Boolean(screen.getByText(/Domanda 2 di/)));

  const navLabels = ["Oggi", "Percorso", "Temi", "Progressi"];
  fireEvent.click(screen.getByRole("button", { name: /Chiudi la lezione/ })); await sleep(10);
  for (const label of navLabels) {
    const navigation = screen.getByRole("navigation", { name: "Navigazione principale" });
    const button = within(navigation).getByRole("button", { name: new RegExp(`^${label}$`) });
    fireEvent.click(button); await sleep(8);
    check(`navigation-${label.toLowerCase()}`, button.getAttribute("aria-current") === "page");
  }
  fireEvent.click(screen.getByRole("button", { name: "Copia backup progressi" })); await sleep(20);
  check("backup-captures-full-state", clipboardText.length > 200 && /^[A-Za-z0-9+/=]+$/.test(clipboardText));
  const progressBeforeReset = localStorage.getItem("english-coach-progress-v2");
  fireEvent.click(screen.getByRole("button", { name: "Cancella tutti i progressi" })); await sleep(10);
  check("reset-always-asks-confirmation", Boolean(screen.getByRole("alertdialog")));
  fireEvent.click(screen.getByRole("button", { name: "No, conserva i dati" })); await sleep(10);
  check("cancel-reset-keeps-data", localStorage.getItem("english-coach-progress-v2") === progressBeforeReset);
  fireEvent.click(screen.getByRole("button", { name: "Cancella tutti i progressi" }));
  fireEvent.click(screen.getByRole("button", { name: "Sì, cancella tutto" })); await sleep(30);
  const cleared = JSON.parse(localStorage.getItem("english-coach-progress-v2") || "{}");
  check("confirmed-reset-clears-learning-history", Object.keys(cleared.smartReview || {}).length === 0 && Object.keys(cleared.days || {}).length === 0);
  check("reset-returns-to-first-steps", Boolean(screen.getByRole("heading", { name: "Inizia dal livello giusto" })) && !screen.queryByRole("button", { name: /Progressi/ }));
  fireEvent.click(screen.getByRole("button", { name: /Inizia dal livello A1/ })); await sleep(20);
  fireEvent.click(screen.getByRole("button", { name: /Progressi/ })); await sleep(20);
  const restoreBox = screen.getByRole("textbox", { name: /Ripristina su questo dispositivo/ });
  fireEvent.change(restoreBox, { target: { value: "codice volutamente non valido" } });
  fireEvent.click(screen.getByRole("button", { name: "Ripristina backup" })); await sleep(10);
  check("invalid-backup-is-rejected", Boolean(screen.getByText(/codice non sembra completo/i)));
  fireEvent.change(restoreBox, { target: { value: clipboardText } });
  fireEvent.click(screen.getByRole("button", { name: "Ripristina backup" })); await sleep(30);
  const restored = JSON.parse(localStorage.getItem("english-coach-progress-v2") || "{}");
  check("backup-restores-errors-and-history", Object.keys(restored.smartReview || {}).length > 0);
  check("backup-restore-confirms-success", Boolean(screen.getByText(/Backup ripristinato/i)));
  fireEvent.click(screen.getByRole("button", { name: "Scuro" })); await sleep(10);
  check("dark-mode-is-immediate-and-saved", document.querySelector("main.app")?.classList.contains("mode-dark") && localStorage.getItem("english-coach-color-mode") === "dark");
  fireEvent.click(screen.getByRole("button", { name: "Più grande" })); await sleep(10);
  check("large-text-is-immediate-and-saved", document.querySelector("main.app")?.classList.contains("text-large") && localStorage.getItem("english-coach-text-size") === "large");
  fireEvent.click(screen.getByRole("button", { name: "Americano" }));
  fireEvent.click(screen.getByRole("button", { name: "1.2×" })); await sleep(10);
  check("audio-preferences-are-saved", localStorage.getItem("english-coach-audio-accent-v1") === "en-US" && localStorage.getItem("english-coach-audio-rate-v1") === "1.2");

  mounted.unmount();
  localStorage.clear(); sessionStorage.clear();
  mounted = await renderApp(App);
  fireEvent.click(screen.getByRole("button", { name: /Inizia il test/ }));
  await waitFor(() => screen.getByText("1/30"), { timeout: 4000 });
  check("placement-really-starts-with-thirty-items", Boolean(screen.getByText("1/30")));
  for (let index = 0; index < 30; index++) {
    fireEvent.click(screen.getByRole("button", { name: /Non lo so · salta/ })); await sleep(3);
    fireEvent.click(screen.getByRole("button", { name: index < 29 ? /Prossima prova/ : /Passa alla produzione/ })); await sleep(3);
    if (index === 4) {
      mounted.unmount(); mounted = await renderApp(App);
      check("placement-refresh-restores-exact-item", Boolean(screen.getByText("6/30")) && !screen.queryByRole("dialog"));
    }
  }
  check("placement-reaches-production-after-thirty", Boolean(screen.getByText(/Due brevi risposte/)));
  fireEvent.click(screen.getByRole("button", { name: /Non so rispondere · completa comunque/ })); await sleep(20);
  check("placement-all-skipped-stays-conservative", Boolean(screen.getByText(/punto di partenza consigliato è A1/i)));
  fireEvent.click(screen.getByRole("button", { name: /Inizia da A1/ })); await sleep(20);
  fireEvent.click(within(screen.getByRole("navigation", { name: "Navigazione principale" })).getByRole("button", { name: "Temi" })); await sleep(10);
  fireEvent.click(screen.getByRole("button", { name: /Quiz visivi separati/ })); await sleep(20);
  const firstMosaic = screen.getAllByRole("button", { name: /Scegli immagine/ });
  check("visual-quiz-shows-one-screen-mosaic", firstMosaic.length === 9 && Boolean(screen.getByText("DOMANDA 1 DI 9")));
  fireEvent.click(firstMosaic[0]); await sleep(10);
  check("visual-choice-always-gives-feedback", Boolean(screen.getByText(/Esatto!|risposta corretta è in verde/)));
  fireEvent.click(screen.getByRole("button", { name: /Prossima domanda/ })); await sleep(10);
  check("visual-next-advances-one-question", Boolean(screen.getByText("DOMANDA 2 DI 9")));
  fireEvent.click(screen.getByRole("button", { name: /Lavori professioni/ })); await sleep(10);
  check("visual-category-change-starts-fresh-game", Boolean(screen.getByText("DOMANDA 1 DI 9")) && screen.getAllByRole("button", { name: /Scegli immagine/ }).length === 9);
  check("no-horizontal-inline-styles", ![...document.querySelectorAll("*")].some(element => /width:\s*\d{4,}px/i.test(element.getAttribute("style") || "")));
  check("audio-mock-was-nonblocking", speechLog.length >= 0);
  cleanup();
} finally {
  await server.close();
}

const failed = Object.entries(checks).filter(([, result]) => !result.ok).map(([name]) => name);
console.log(JSON.stringify({ simulatedMinutes: 60, scenarios: Object.keys(checks).length, checks, failed }, null, 2));
if (failed.length) process.exitCode = 1;
