import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.env.ENGLISH_COACH_URL ?? "http://127.0.0.1:4174/PROGRAMMA2/";
// Keep the browser used by this audit isolated from other local UI tests.
const port = Number(process.env.ENGLISH_COACH_DEBUG_PORT ?? 19000 + (process.pid % 10000));
const profile = await mkdtemp(join(tmpdir(), "english-coach-visual-"));
const shots = await mkdtemp(join(tmpdir(), "english-coach-shots-"));
const child = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-allow-origins=*", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, base], { stdio: "ignore" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let sequence = 0;
let socket;
const pending = new Map();
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => (await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.result.value;
const connect = async () => {
  let target;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
      target = list.find(item => item.type === "page");
      if (target) break;
    } catch {}
    await wait(200);
  }
  if (!target) throw new Error("Chrome debugging target unavailable");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const task = pending.get(message.id); pending.delete(message.id);
    message.error ? task.reject(new Error(message.error.message)) : task.resolve(message);
  };
  await call("Runtime.enable"); await call("Page.enable");
  await call("Page.navigate", { url: base });
  await wait(1500);
};
const seed = async (view, checkpoint = null, selection = { level: "A1", lessonId: "a1-be-introductions", theme: "food" }) => {
  const now = new Date().toISOString();
  const progress = { schemaVersion: 14, deviceId: "visual-audit", currentDay: 3, streak: 2, weeklyGoal: 3, days: { 1: { score: 82, attempts: 1, minutes: 18, writing: "I am learning English every day.", completedAt: now } }, activity: {}, reading: {}, reviews: {}, themePacks: {}, wordGames: {}, lessonFeedback: {}, smartReview: {}, learningGoal: "Conversazione quotidiana", savedPhrases: [], weeklyChallenges: {}, monthlyChecks: {} };
  await evaluate(`localStorage.clear(); sessionStorage.clear(); localStorage.setItem("english-coach-onboarding-v1","done"); localStorage.setItem("english-coach-view-v1",${JSON.stringify(view)}); localStorage.setItem("english-coach-selection-v1",${JSON.stringify(JSON.stringify(selection))}); localStorage.setItem("english-coach-progress-v2",${JSON.stringify(JSON.stringify(progress))}); ${checkpoint ? `localStorage.setItem("english-coach-checkpoints-v1",${JSON.stringify(JSON.stringify({ [checkpoint.unitId]: checkpoint }))});` : ""} location.reload();`);
  await wait(1800);
};
const setViewport = async (width, height, mobile) => {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await wait(250);
};
const inspect = async label => evaluate(`(() => {
  const visible = element => { const style=getComputedStyle(element), rect=element.getBoundingClientRect(), closed=element.closest("details:not([open])"), label=(element.innerText||element.getAttribute("aria-label")||"").trim(); return Boolean(label)&&(!closed||element===closed.querySelector(":scope>summary"))&&style.display!=="none"&&style.visibility!=="hidden"&&style.opacity!=="0"&&rect.width>0&&rect.height>0; };
  const nodes=[...document.querySelectorAll("button,input,select,textarea,summary,a")].filter(visible);
  const rects=nodes.map((element,index)=>{const rect=element.getBoundingClientRect(), style=getComputedStyle(element); return {element,index,text:(element.innerText||element.getAttribute("aria-label")||element.tagName).trim().slice(0,70),x:rect.x,y:rect.y,w:rect.width,h:rect.height,font:parseFloat(style.fontSize),position:style.position,contrast:[style.color,style.backgroundColor]};});
  const overlaps=[];
  for(let i=0;i<rects.length;i++) for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j],fixedA=a.element.closest("nav")||a.position==="fixed",fixedB=b.element.closest("nav")||b.position==="fixed"; if(a.element.contains(b.element)||b.element.contains(a.element)||fixedA||fixedB)continue; if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>3&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>3) overlaps.push([a.text,b.text]);}
  const tiny=[...document.querySelectorAll("small,p,span,label,button")].filter(visible).filter(el=>parseFloat(getComputedStyle(el).fontSize)<11).map(el=>(el.innerText||"").trim().slice(0,60)).filter(Boolean);
  const controls=rects.filter(item=>item.h<40||item.w<40).map(item=>({text:item.text,w:Math.round(item.w),h:Math.round(item.h)}));
  return {label:${JSON.stringify(label)}, viewport:[innerWidth,innerHeight], scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight], horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1, overlaps:overlaps.slice(0,30), tiny:tiny.slice(0,30), undersized:controls.slice(0,40), controls:rects.length};
})()`);
const buttonRects = () => evaluate(`Object.fromEntries([...document.querySelectorAll("button")].filter(b=>b.offsetParent!==null).map(b=>{const r=b.getBoundingClientRect();return [(b.innerText||b.ariaLabel||"").trim(),[Math.round(r.width),Math.round(r.height)]]}))`);
const clickText = text => evaluate(`(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||x.ariaLabel||"").includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`);
const waitForSelector = async selector => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return true;
    await wait(200);
  }
  return false;
};
const screenshot = async name => {
  const result = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const path = join(shots, `${name}.png`); await writeFile(path, Buffer.from(result.result.data, "base64")); return path;
};

const results = [];
try {
  await connect();
  for (const viewport of [{ name: "phone", width: 390, height: 844, mobile: true }, { name: "desktop", width: 1440, height: 900, mobile: false }]) {
    await setViewport(viewport.width, viewport.height, viewport.mobile);
    await evaluate(`localStorage.clear(); sessionStorage.clear(); location.reload()`);
    await waitForSelector(".firstStepsScreen");
    results.push(await inspect(`${viewport.name}-first-steps`));
    const onboardingGate = await evaluate(`({firstSteps:Boolean(document.querySelector(".firstStepsScreen")),firstAccessActive:Boolean([...document.querySelectorAll("nav button")].find(button=>button.textContent.includes("Primo accesso"))?.getAttribute("aria-current")==="page"),navButtons:document.querySelectorAll("nav button").length,todayVisible:[...document.querySelectorAll("nav button")].some(button=>button.textContent.includes("Oggi")),reviewVisible:document.body.innerText.includes("Ripasso pronto")})`);
    results.push({ label: `${viewport.name}-onboarding-gate`, ...onboardingGate });
    if (viewport.name === "phone") await screenshot("phone-first-steps");
    await seed("home");
    await setViewport(viewport.width, viewport.height, viewport.mobile);
    await wait(500);
    results.push(await inspect(`${viewport.name}-home`));
    const studyBadge = await evaluate(`(()=>{const node=document.querySelector(".smartStudyHome>summary>b"),title=document.querySelector(".smartStudyHome>summary>span");if(!node||!title)return null;const original=node.textContent;node.textContent="Vocabolario";const style=getComputedStyle(node),titleStyle=getComputedStyle(title),result={text:node.textContent?.trim(),whiteSpace:style.whiteSpace,overflowing:node.scrollWidth>node.clientWidth,title:title.textContent?.trim(),titleWhiteSpace:titleStyle.whiteSpace,titleOverflowing:title.scrollWidth>title.clientWidth,titleLines:Math.round(title.getBoundingClientRect().height/parseFloat(titleStyle.lineHeight))};node.textContent=original;return result})()`);
    results.push({ label: `${viewport.name}-study-badge`, ...studyBadge });
    if (viewport.name === "phone") await screenshot("phone-home");
    await evaluate(`localStorage.setItem("english-coach-view-v1","path");location.reload()`);
    await waitForSelector(".units button");
    results.push(await inspect(`${viewport.name}-path`));
    await evaluate(`localStorage.setItem("english-coach-view-v1","progress");location.reload()`); await waitForSelector(".metrics");
    results.push(await inspect(`${viewport.name}-progress`));
    if (viewport.name === "phone") await screenshot("phone-progress");
    const checkpoint = { unitId: "a1-be-introductions", phase: "examples", item: 0, writing: "", points: { yes: 0, all: 0 }, updatedAt: new Date().toISOString() };
    await seed("lesson", checkpoint);
    await wait(800);
    results.push(await inspect(`${viewport.name}-lesson-example-before-play`));
    const before = await buttonRects();
    await clickText("Ascolta"); await wait(900);
    const during = await buttonRects();
    results.push({ label: `${viewport.name}-audio-control-stability`, changed: Object.keys(before).filter(key => during[key] && (Math.abs(before[key][0]-during[key][0])>2 || Math.abs(before[key][1]-during[key][1])>2)).map(key=>({button:key,before:before[key],during:during[key]})) });
    results.push(await inspect(`${viewport.name}-lesson-example-playing`));
    await clickText("Pausa"); await wait(200); results.push(await inspect(`${viewport.name}-lesson-example-paused`));
    await clickText("Stop"); await wait(200);
    if (viewport.name === "phone") await screenshot("phone-lesson-audio");
    await seed("lesson", { ...checkpoint, phase: "listening" }); await wait(900);
    results.push(await inspect(`${viewport.name}-listening`));
    if (viewport.name === "phone") await screenshot("phone-listening");
    const b1Checkpoint = { unitId: "b1-present-perfect", phase: "grammar", item: 0, writing: "", points: { yes: 0, all: 0 }, updatedAt: new Date().toISOString() };
    await seed("lesson", b1Checkpoint, { level: "B1", lessonId: "b1-present-perfect", theme: "language" }); await wait(900);
    const b1Highlights = await evaluate(`(()=>{const forbidden=new Set(["ancora in corso","rapporto tra i parlanti","rileggi la frase in tre passaggi","corso","rapporto","parlanti"]);const highlights=[...document.querySelectorAll(".inlineEnglish")].map(node=>({term:(node.textContent||"").trim(),context:(node.closest("p")?.textContent||node.parentElement?.textContent||"").replace(/\\s+/g," ").trim()}));return{highlights,falseHighlights:highlights.filter(item=>forbidden.has(item.term.toLocaleLowerCase("it")))}})()`);
    results.push({ label: `${viewport.name}-b1-highlight-context`, ...b1Highlights });
    results.push(await inspect(`${viewport.name}-b1-grammar-layout`));
    if (viewport.name === "phone") await screenshot("phone-b1-grammar");
    const b2Checkpoint = { unitId: "b2-inference-compromise", phase: "grammar", item: 0, writing: "", points: { yes: 0, all: 0 }, updatedAt: new Date().toISOString() };
    await seed("lesson", b2Checkpoint, { level: "B2", lessonId: "b2-inference-compromise", theme: "language" }); await wait(900);
    const repeatedGrammarBlocks = await evaluate(`(()=>{const texts=[...document.querySelectorAll(".deepOverview p,.deepGuide article p")].map(node=>node.textContent.trim().toLocaleLowerCase("it").replace(/\\s+/g," ")).filter(text=>text.length>40);return [...new Set(texts.filter((text,index)=>texts.indexOf(text)!==index))]})()`);
    results.push({ label: `${viewport.name}-b2-grammar-content`, repeatedBlocks: repeatedGrammarBlocks });
    results.push(await inspect(`${viewport.name}-b2-grammar-layout`));
    if (viewport.name === "phone") await screenshot("phone-b2-grammar");
    const mixedCheckpoint = { unitId: "b2-mixed-conditionals", phase: "grammar", item: 0, writing: "", points: { yes: 0, all: 0 }, updatedAt: new Date().toISOString() };
    await seed("lesson", mixedCheckpoint, { level: "B2", lessonId: "b2-mixed-conditionals", theme: "language" });
    const mixedReady = await waitForSelector(".deepGuide");
    results.push({ label: `${viewport.name}-b2-mixed-ready`, ready: mixedReady });
    results.push(await inspect(`${viewport.name}-b2-mixed-layout`));
    await evaluate(`localStorage.setItem("english-coach-view-v1","topics");localStorage.setItem("english-coach-selection-v1",${JSON.stringify(JSON.stringify({ level: "B2", lessonId: "b2-uk-us-english", theme: "varieties" }))});location.reload()`); await wait(1500);
    results.push(await inspect(`${viewport.name}-topics`));
    const varietyLabel = await evaluate(`(()=>{const node=[...document.querySelectorAll(".themeGrid>button>b")].find(item=>item.textContent?.includes("UK"));if(!node)return null;const style=getComputedStyle(node);return{text:node.textContent?.trim(),whiteSpace:style.whiteSpace,wordBreak:style.wordBreak,overflowing:node.scrollWidth>node.clientWidth}})()`);
    results.push({ label: `${viewport.name}-uk-us-label`, ...varietyLabel });
    await evaluate(`(()=>{const input=document.querySelector(".themeSearch input");const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;setter.call(input,"britannico");input.dispatchEvent(new Event("input",{bubbles:true}))})()`); await wait(250);
    const filteredThemes = await evaluate(`document.querySelectorAll(".themeGrid>button").length`);
    results.push({ label: `${viewport.name}-theme-search`, resultCount: filteredThemes });
    await evaluate(`(()=>{const input=document.querySelector(".themeSearch input");const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;setter.call(input,"");input.dispatchEvent(new Event("input",{bubbles:true}))})()`); await wait(250);
    await evaluate(`(()=>{const buttons=[...document.querySelectorAll(".themeGrid>button")];for(let round=0;round<4;round+=1)for(const button of buttons)button.click()})()`); await wait(600);
    results.push(await inspect(`${viewport.name}-rapid-theme-navigation`));
    if (viewport.name === "phone") { await evaluate(`([...document.querySelectorAll(".themeGrid>button>b")].find(item=>item.textContent?.includes("UK")))?.scrollIntoView({block:"center"})`); await wait(200); await screenshot("phone-topics"); }
  }
  const failures = results.flatMap(result => [result.horizontalOverflow ? `${result.label}: horizontal overflow` : null, result.overlaps?.length ? `${result.label}: ${result.overlaps.length} control overlaps` : null, result.changed?.length ? `${result.label}: ${result.changed.length} controls resized` : null, typeof result.controls === "number" && result.controls === 0 ? `${result.label}: expected interactive screen is empty` : null, result.label?.endsWith("onboarding-gate") && (!result.firstSteps || !result.firstAccessActive || result.navButtons !== 5 || !result.todayVisible || result.reviewVisible) ? `${result.label}: first-access navigation is incorrect` : null, result.label?.endsWith("study-badge") && (result.whiteSpace !== "nowrap" || result.overflowing || result.title !== "Studio intelligente" || result.titleWhiteSpace !== "nowrap" || result.titleOverflowing || result.titleLines !== 1) ? `${result.label}: study title or skill label wrapped/overflowed` : null, result.label?.endsWith("b1-highlight-context") && (!result.highlights?.length || result.falseHighlights?.length) ? `${result.label}: English highlights missing or Italian text highlighted` : null, result.label?.endsWith("b2-grammar-content") && result.repeatedBlocks?.length ? `${result.label}: repeated grammar blocks` : null, result.label?.endsWith("b2-mixed-ready") && !result.ready ? `${result.label}: grammar did not render` : null, result.label?.endsWith("uk-us-label") && (result.text !== "UK US" || result.whiteSpace !== "nowrap" || result.overflowing) ? `${result.label}: label wrapped or overflowed` : null, result.label?.endsWith("theme-search") && result.resultCount !== 1 ? `${result.label}: unexpected filter result` : null].filter(Boolean));
  console.log(JSON.stringify({ simulatedMinutes: 60, screenshots: shots, results, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  socket?.close(); child.kill(); await wait(800); await rm(profile, { recursive: true, force: true }).catch(() => undefined);
}
