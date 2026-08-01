import React from "react";
import { Window } from "happy-dom";
import { createServer } from "vite";

const window = new Window({ url: "https://andreacivi80.github.io/PROGRAMMA2/", width: 390, height: 844 });
for (const [name, value] of Object.entries({ window, document: window.document, navigator: window.navigator, history: window.history, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage, HTMLElement: window.HTMLElement, HTMLMediaElement: window.HTMLMediaElement, Node: window.Node, Event: window.Event, MouseEvent: window.MouseEvent, KeyboardEvent: window.KeyboardEvent, getComputedStyle: window.getComputedStyle.bind(window), scrollTo: () => undefined, requestAnimationFrame: callback => setTimeout(callback, 0), cancelAnimationFrame: clearTimeout })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
window.scrollTo = () => undefined;
window.HTMLElement.prototype.scrollIntoView = () => undefined;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.URL.createObjectURL = () => "blob:audit";
window.URL.revokeObjectURL = () => undefined;
let pauseCalls = 0, resumeCalls = 0, cancelCalls = 0, spoken = "";
Object.defineProperty(window, "speechSynthesis", { value: { speaking: false, paused: false, getVoices: () => [], speak: utterance => { spoken = utterance.text; utterance.onstart?.(); }, cancel() { cancelCalls++; }, pause() { this.paused = true; pauseCalls++; }, resume() { this.paused = false; resumeCalls++; } } });
globalThis.speechSynthesis = window.speechSynthesis;
globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; this.rate = 1; this.lang = ""; } };
globalThis.Audio = class { constructor(src) { this.src = src; this.currentTime = 0; this.playbackRate = 1; } play() { return Promise.resolve(); } pause() {} load() {} };

const { render, fireEvent, screen, cleanup, within, waitFor } = await import("@testing-library/react");
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const checks = {};
const check = (name, ok, detail = "") => { checks[name] = { ok: Boolean(ok), detail }; };

try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  localStorage.clear(); sessionStorage.clear();
  let mounted = render(React.createElement(App)); await wait(40);
  fireEvent.click(screen.getByRole("button", { name: /Inizia dal livello A1/ })); await wait(20);
  const adaptiveButtons = [...document.querySelectorAll(".adaptiveTimes button")];
  check("new-a1-user-never-jumps-to-later-lesson", adaptiveButtons.length === 4 && adaptiveButtons.every(button => button.textContent.includes(mobileCurriculum[0].title)), adaptiveButtons.map(button => button.textContent).join(" | "));
  check("time-changes-depth-not-curriculum-order", adaptiveButtons.slice(0, 3).map(button => button.textContent).join(" ").includes("5min") && adaptiveButtons.slice(0, 3).map(button => button.textContent).join(" ").includes("30min"));

  mounted.unmount();
  const first = mobileCurriculum[0], now = new Date().toISOString();
  localStorage.setItem("english-coach-onboarding-v1", "done");
  localStorage.setItem("english-coach-view-v1", "lesson");
  localStorage.setItem("english-coach-selection-v1", JSON.stringify({ level: "A1", lessonId: first.id, theme: "food" }));
  localStorage.setItem("english-coach-progress-v2", JSON.stringify({ schemaVersion: 13, deviceId: "adversarial", currentDay: 2, streak: 1, weeklyGoal: 3, days: { 1: { score: 80, attempts: 1, minutes: 18, completedAt: now } }, activity: {}, reading: {}, reviews: {}, themePacks: {}, wordGames: {}, lessonFeedback: {}, smartReview: {} }));
  localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify({ [first.id]: { unitId: first.id, phase: "complete", item: 0, writing: "", points: { yes: 8, all: 10 }, updatedAt: now } }));
  mounted = render(React.createElement(App)); await wait(40);
  check("completed-session-offers-three-clear-ratings", ["Troppo facile", "Giusta", "Troppo difficile"].every(label => Boolean(screen.getByRole("button", { name: label }))));
  fireEvent.click(screen.getByRole("button", { name: "Troppo difficile" })); await wait(20);
  let stored = JSON.parse(localStorage.getItem("english-coach-progress-v2") || "{}");
  check("hard-rating-is-persisted", stored.lessonFeedback?.[first.id]?.rating === "hard");
  check("hard-rating-explains-next-action", Boolean(screen.getByText(/proposte brevi riprenderanno questa lezione/i)));
  fireEvent.click(screen.getByRole("button", { name: /Mi fermo qui/ })); await wait(30);
  const shortButtons = [...document.querySelectorAll(".adaptiveTimes button")].slice(0, 2);
  check("hard-rating-recommends-same-lesson-for-short-reinforcement", shortButtons.every(button => button.textContent.includes(first.title)));
  check("hard-rating-does-not-block-progress-on-full-session", [...document.querySelectorAll(".adaptiveTimes button")].slice(2).every(button => button.textContent.includes(mobileCurriculum[1].title)));

  mounted.unmount();
  localStorage.setItem("english-coach-view-v1", "lesson");
  localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify({ [first.id]: { unitId: first.id, phase: "complete", item: 0, writing: "", points: { yes: 10, all: 10 }, updatedAt: new Date().toISOString() } }));
  mounted = render(React.createElement(App)); await wait(40);
  fireEvent.click(screen.getByRole("button", { name: "Troppo facile" })); await wait(20);
  fireEvent.click(screen.getByRole("button", { name: /Mi fermo qui/ })); await wait(30);
  check("easy-rating-advances-to-first-incomplete-lesson", [...document.querySelectorAll(".adaptiveTimes button")].every(button => button.textContent.includes(mobileCurriculum[1].title)));

  fireEvent.click(within(screen.getByRole("navigation", { name: "Navigazione principale" })).getByRole("button", { name: "Temi" })); await wait(20);
  const topicLevel = document.querySelector(".screen .compactLevelPicker");
  fireEvent.click(within(topicLevel).getByRole("button", { name: "C1" })); await wait(30);
  fireEvent.click(screen.getByRole("button", { name: /Storia a episodi/ }));
  await waitFor(() => screen.getByText(/Segui la storia, comprendi e rispondi/), { timeout: 4000 });
  check("c1-story-shows-three-connected-episodes", document.querySelectorAll(".storyEpisodes button").length === 3);
  check("c1-story-uses-five-close-choice-slots", document.querySelectorAll(".storyChoices button").length === 5);
  fireEvent.click(screen.getByRole("button", { name: /Ascolta/ })); await wait(5);
  check("story-audio-reads-english-scene", spoken.includes("ostensibly conciliatory"));
  fireEvent.click(screen.getByRole("button", { name: /Pausa/ }));
  fireEvent.click(screen.getByRole("button", { name: /Riprendi/ }));
  fireEvent.click(screen.getByRole("button", { name: /Stop/ }));
  check("story-audio-supports-pause-resume-stop", pauseCalls === 1 && resumeCalls === 1 && cancelCalls >= 2);
  fireEvent.click(document.querySelectorAll(".storyChoices button")[0]); await wait(25);
  stored = JSON.parse(localStorage.getItem("english-coach-progress-v2") || "{}");
  check("story-result-is-saved-locally", stored.wordGames?.["story-c1-1"]?.score === 100);
  check("story-choice-explains-why", Boolean(document.querySelector(".storyFeedback")));
  fireEvent.change(document.querySelector(".storyWriting textarea"), { target: { value: "Although the process appears open, the fixed timetable may undermine its credibility." } }); await wait(10);
  check("story-writing-unlocks-model-only-after-real-attempt", Boolean(screen.getByText("Confronta con un esempio")));

  mounted.unmount(); mounted = render(React.createElement(App)); await wait(60);
  check("refresh-preserves-topic-view-and-c1-level", localStorage.getItem("english-coach-view-v1") === "topics" && JSON.parse(localStorage.getItem("english-coach-selection-v1") || "{}").level === "C1");
  check("refresh-preserves-selected-story-theme", JSON.parse(localStorage.getItem("english-coach-selection-v1") || "{}").theme === "story" && Boolean(screen.getByText(/Segui la storia, comprendi e rispondi/)));
  check("refresh-does-not-open-resume-dialog", !screen.queryByText("Vuoi continuare?"));
  check("mobile-layout-has-no-forced-wide-inline-element", ![...document.querySelectorAll("*")].some(element => /width:\s*(?:[5-9]\d\d|\d{4,})px/i.test(element.getAttribute("style") || "")));
  cleanup();
} finally {
  await server.close();
}

const failed = Object.entries(checks).filter(([, result]) => !result.ok).map(([name]) => name);
console.log(JSON.stringify({ simulatedMinutes: 60, cycle: 2, scenarios: Object.keys(checks).length, checks, failed }, null, 2));
if (failed.length) process.exitCode = 1;
