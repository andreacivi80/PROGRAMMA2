import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

const reservePort = () => new Promise((resolve, reject) => {
  const server = createNetServer();
  server.unref();
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const appPort = await reservePort();
const vite = await createServer({ server: { host: "127.0.0.1", port: appPort, strictPort: true }, logLevel: "silent" });
await vite.listen();
const { mobileCurriculum } = await vite.ssrLoadModule("/src/curriculum.ts");
const base = `http://127.0.0.1:${appPort}/PROGRAMMA2/`;
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const debugPort = await reservePort();
const profile = await mkdtemp(join(tmpdir(), "english-coach-multimedia-"));
const child = spawn(chrome, ["--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-features=ServiceWorker", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-allow-origins=*", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, base], { stdio: "ignore" });
let sequence = 0;
let socket;
const pending = new Map();
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const response = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.text);
  return response.result.result.value;
};
const connect = async () => {
  let target;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      target = (await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json())).find(item => item.type === "page");
      if (target) break;
    } catch {}
    await wait(200);
  }
  if (!target) throw new Error("Chrome target unavailable");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const task = pending.get(message.id);
    pending.delete(message.id);
    message.error ? task.reject(new Error(message.error.message)) : task.resolve(message);
  };
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Page.addScriptToEvaluateOnNewDocument", { source: `
    (() => {
      const state = window.__multimediaAudit = { playCalls: 0, pauseCalls: 0, resets: 0, rates: [], speech: { speak: 0, pause: 0, resume: 0, cancel: 0 }, recognitionStarts: 0, microphoneRequests: 0, trackStops: 0, recorderStarts: 0, recorderStops: 0 };
      const mediaPlay = HTMLMediaElement.prototype.play;
      const mediaPause = HTMLMediaElement.prototype.pause;
      HTMLMediaElement.prototype.play = function () { state.playCalls += 1; state.rates.push(this.playbackRate); this.dispatchEvent(new Event("play")); return Promise.resolve(); };
      HTMLMediaElement.prototype.pause = function () { state.pauseCalls += 1; if (this.currentTime === 0) state.resets += 1; try { mediaPause.call(this); } catch {} };
      const synth = window.speechSynthesis;
      if (synth) {
        for (const name of ["speak", "pause", "resume", "cancel"]) {
          const original = synth[name].bind(synth);
          synth[name] = value => { state.speech[name] += 1; if (name === "speak") setTimeout(() => value?.onstart?.(), 0); try { return original(value); } catch {} };
        }
      }
      Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => { state.microphoneRequests += 1; return { getTracks: () => [{ stop: () => { state.trackStops += 1; } }] }; } } });
      class FakeRecorder {
        constructor() { this.state = "inactive"; this.mimeType = "audio/webm"; }
        start() { this.state = "recording"; state.recorderStarts += 1; }
        stop() { this.state = "inactive"; state.recorderStops += 1; this.ondataavailable?.({ data: new Blob(["voice"], { type: this.mimeType }) }); this.onstop?.(); }
      }
      class FakeRecognition {
        start() {
          state.recognitionStarts += 1;
          setTimeout(() => {
            const transcript = window.__recognitionTranscript || "";
            const alternative = { transcript };
            const result = [alternative];
            this.onresult?.({ results: [result] });
            this.onend?.();
          }, 60);
        }
        stop() { this.onend?.(); }
      }
      window.MediaRecorder = FakeRecorder;
      window.SpeechRecognition = FakeRecognition;
      window.webkitSpeechRecognition = FakeRecognition;
      const create = URL.createObjectURL.bind(URL);
      URL.createObjectURL = value => { try { return create(value); } catch { return "blob:multimedia-audit"; } };
    })();
  ` });
  await call("Page.navigate", { url: base });
  await wait(1300);
};
const progress = { schemaVersion: 14, deviceId: "multimedia-stress", currentDay: 1, streak: 0, weeklyGoal: 3, days: {}, activity: {}, reading: {}, reviews: {}, themePacks: {}, wordGames: {}, lessonFeedback: {}, smartReview: {}, learningGoal: "Conversazione quotidiana", savedPhrases: [], weeklyChallenges: {}, monthlyChecks: {} };
const seed = async (unit, phase, view = "lesson", theme = "food") => {
  const checkpoint = { unitId: unit.id, phase, item: 0, writing: "", points: { yes: 0, all: 0 }, updatedAt: new Date().toISOString() };
  await evaluate(`(()=>{localStorage.clear();sessionStorage.clear();localStorage.setItem("english-coach-onboarding-v1","done");localStorage.setItem("english-coach-progress-v2",${JSON.stringify(JSON.stringify(progress))});localStorage.setItem("english-coach-view-v1",${JSON.stringify(view)});localStorage.setItem("english-coach-selection-v1",${JSON.stringify(JSON.stringify({ level: unit.cefr, lessonId: unit.id, theme }))});localStorage.setItem("english-coach-checkpoints-v1",${JSON.stringify(JSON.stringify({ [unit.id]: checkpoint }))});location.reload()})()`);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await wait(200);
    try {
      if (await evaluate(`Boolean(document.querySelector(".app"))`)) return;
    } catch {}
  }
  await call("Page.navigate", { url: base });
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await wait(200);
    try {
      if (await evaluate(`Boolean(document.querySelector(".app"))`)) return;
    } catch {}
  }
  throw new Error(`Application did not render: ${view}/${unit.cefr}/${phase}`);
};
const click = async selector => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = await evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)return false;node.click();return true})()`);
    if (result) return;
    await wait(200);
  }
  throw new Error(`Control not found: ${selector}`);
};
const snapshot = () => evaluate(`({audit:window.__multimediaAudit,level:document.querySelector(".app")?.dataset.learningLevel,background:getComputedStyle(document.querySelector(".app")).backgroundImage,horizontal:document.documentElement.scrollWidth>innerWidth+1})`);
const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), detail });
const marker = /\b([A-Za-z][A-Za-z ]{0,18}):\s*/g;
const exampleUnit = mobileCurriculum.find(unit => unit.cefr === "A1");
const monologueUnit = mobileCurriculum.find(unit => [...unit.listening.transcript.matchAll(marker)].length < 2) ?? exampleUnit;

try {
  await connect();
  await seed(exampleUnit, "examples");
  const initial = await snapshot();
  await click(".examples .audio");
  await wait(1150);
  const playing = await evaluate(`({label:document.querySelector(".examples .audio")?.textContent.trim(),stopDisabled:document.querySelector(".examples .audioStop")?.disabled,audit:window.__multimediaAudit})`);
  check("audio-starts-after-delay", playing.label?.includes("Pausa") && playing.audit.playCalls > initial.audit.playCalls && playing.stopDisabled === false, playing);
  await click(".examples .audio");
  const paused = await evaluate(`({label:document.querySelector(".examples .audio")?.textContent.trim(),audit:window.__multimediaAudit})`);
  check("audio-pause", paused.label?.includes("Riprendi") && paused.audit.pauseCalls > playing.audit.pauseCalls, paused);
  await click(".examples .audio");
  const resumed = await evaluate(`({label:document.querySelector(".examples .audio")?.textContent.trim(),audit:window.__multimediaAudit})`);
  check("audio-resume", resumed.label?.includes("Pausa") && resumed.audit.playCalls > paused.audit.playCalls, resumed);
  await click(".examples .audioStop");
  const stopped = await evaluate(`({label:document.querySelector(".examples .audio")?.textContent.trim(),stopDisabled:document.querySelector(".examples .audioStop")?.disabled,audit:window.__multimediaAudit})`);
  check("audio-stop-resets-ui", stopped.label?.includes("Ascolta") && stopped.stopDisabled === true && stopped.audit.pauseCalls > resumed.audit.pauseCalls, stopped);
  await click(".examples .audio");
  await wait(80);
  await click(".examples .audio");
  const rapid = await evaluate(`({label:document.querySelector(".examples .audio")?.textContent.trim(),audit:window.__multimediaAudit})`);
  check("rapid-double-click-cancels-delay", rapid.label?.includes("Riprendi") && rapid.audit.playCalls === stopped.audit.playCalls, rapid);
  await click(".examples .audioStop");

  await seed(monologueUnit, "listening");
  await click('.listeningHelpSteps button:nth-child(3)');
  await click(".guidedPlayer .audio");
  await wait(1150);
  await evaluate(`(()=>{const audio=document.querySelector(".guidedPlayer audio");Object.defineProperty(audio,"currentTime",{configurable:true,writable:true,value:1.5});audio.dispatchEvent(new Event("timeupdate",{bubbles:true}))})()`);
  await wait(80);
  const listening = await evaluate(`({playing:document.querySelector(".guidedPlayer .audio")?.textContent.includes("Pausa"),transcriptOpen:document.querySelector(".guidedTranscript")?.open,activeWords:document.querySelectorAll(".guidedTranscript [data-word].active").length,visibleTranscript:document.querySelector(".guidedTranscript>div")?.clientHeight>0,audit:window.__multimediaAudit})`);
  check("listening-transcript-synchronised", listening.playing && listening.transcriptOpen && listening.visibleTranscript && listening.activeWords === 1, listening);
  await click('.guidedPlayer .speed button:nth-child(3)');
  const speed = await evaluate(`({rate:document.querySelector(".guidedPlayer audio")?.playbackRate,pressed:document.querySelector(".guidedPlayer .speed button:nth-child(3)")?.getAttribute("aria-pressed")})`);
  check("listening-speed-1-2", speed.rate === 1.2 && speed.pressed === "true", speed);
  await click(".guidedPlayer .audio");
  const listeningPaused = await evaluate(`document.querySelector(".guidedPlayer .audio")?.textContent.trim()`);
  check("listening-pause", listeningPaused?.includes("Riprendi"), listeningPaused);
  const stopBefore = await evaluate(`({disabled:document.querySelector(".guidedPlayer .audioStop")?.disabled,label:document.querySelector(".guidedPlayer .audioStop")?.textContent.trim(),audit:window.__multimediaAudit})`);
  await click(".guidedPlayer .audioStop");
  await wait(80);
  const listeningStopped = await evaluate(`({label:document.querySelector(".guidedPlayer .audio")?.textContent.trim(),stopDisabled:document.querySelector(".guidedPlayer .audioStop")?.disabled,active:document.querySelectorAll(".guidedTranscript [data-word].active").length,stopBefore:${JSON.stringify(stopBefore)},audit:window.__multimediaAudit})`);
  check("listening-stop", listeningStopped.stopDisabled === true && listeningStopped.active === 0, listeningStopped);

  await seed(exampleUnit, "speaking");
  await evaluate(`window.__recognitionTranscript=${JSON.stringify(exampleUnit.speaking.target)}`);
  await click(".record");
  await wait(250);
  const speechRight = await evaluate(`({text:document.querySelector(".speech p")?.textContent,score:document.querySelector(".speech b")?.textContent,playback:Boolean(document.querySelector(".ownVoicePlayback audio")),recording:document.querySelector(".record")?.classList.contains("on"),audit:window.__multimediaAudit})`);
  check("speech-correct-transcript", speechRight.text?.includes(exampleUnit.speaking.target) && speechRight.score?.includes("100%") && speechRight.recording === false, speechRight);
  check("microphone-recording-lifecycle", speechRight.audit.microphoneRequests === 1 && speechRight.audit.recognitionStarts === 1 && speechRight.audit.recorderStarts === 1 && speechRight.audit.recorderStops === 1 && speechRight.audit.trackStops >= 1 && speechRight.playback, speechRight.audit);

  await seed(exampleUnit, "speaking");
  await evaluate(`window.__recognitionTranscript="completely different words"`);
  await click(".record");
  await wait(250);
  const speechWrong = await evaluate(`({score:document.querySelector(".speech b")?.textContent,badWords:document.querySelectorAll(".pronunciationCompare .wordBad").length,text:document.querySelector(".speech p")?.textContent})`);
  check("speech-wrong-transcript", !speechWrong.score?.includes("100%") && speechWrong.badWords > 0 && speechWrong.text?.includes("completely different words"), speechWrong);

  await seed(exampleUnit, "grammar", "topics", "video");
  const video = await evaluate(`(()=>{const links=[...document.querySelectorAll(".videoCards a")];return{count:links.length,official:links.every(link=>link.href.startsWith("https://learnenglish.britishcouncil.org/")),safe:links.every(link=>link.target==="_blank"&&link.rel.includes("noreferrer")),horizontal:document.documentElement.scrollWidth>innerWidth+1}})()`);
  check("video-resources-visible-and-official", video.count > 0 && video.official && video.safe && !video.horizontal, video);

  const levelBackgrounds = [];
  for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
    const unit = mobileCurriculum.find(candidate => candidate.cefr === level);
    await seed(unit, "grammar", "home");
    for (const viewport of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 900, mobile: false }]) {
      await call("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
      await wait(80);
      const state = await snapshot();
      check(`${level}-responsive-${viewport.width}`, state.level === level && !state.horizontal, state);
      if (viewport.width === 390) levelBackgrounds.push(state.background);
    }
  }
  check("five-distinct-level-backgrounds", new Set(levelBackgrounds).size === 5, levelBackgrounds);

  const sampledAudio = mobileCurriculum.flatMap(unit => [`audio/${unit.id}-listening.wav`, `audio/${unit.id}-speaking.wav`]).filter((_, index) => index % 12 === 0).slice(0, 10);
  const mediaResponses = await Promise.all(Array.from({ length: 5 }, () => sampledAudio).flat().map(async path => {
    const response = await fetch(new URL(path, base));
    const bytes = new Uint8Array(await response.arrayBuffer());
    return response.ok && bytes.length > 1000 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF";
  }));
  check("concurrent-media-delivery", mediaResponses.length >= 25 && mediaResponses.every(Boolean), { requests: mediaResponses.length, passed: mediaResponses.filter(Boolean).length });

  const failures = checks.filter(result => !result.passed);
  console.log(JSON.stringify({ system: "multimedia stress gate", browser: "Chrome headless", exerciseFlows: 5, responsiveStates: 10, concurrentMediaRequests: mediaResponses.length, checks, failureCount: failures.length }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  socket?.close();
  child.kill();
  await wait(500);
  await rm(profile, { recursive: true, force: true }).catch(() => undefined);
  await vite.close();
}
