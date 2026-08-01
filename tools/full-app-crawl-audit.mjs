import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const { mobileCurriculum } = await vite.ssrLoadModule("/src/curriculum.ts");
const { themePacks } = await vite.ssrLoadModule("/src/themePacks.ts");
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.env.ENGLISH_COACH_URL ?? "http://127.0.0.1:4174/PROGRAMMA2/";
const port = 9336;
const profile = await mkdtemp(join(tmpdir(), "english-coach-crawl-"));
const child = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-allow-origins=*", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, base], { stdio: "ignore" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let sequence = 0, socket;
const pending = new Map();
const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => (await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.result.value;
const connect = async () => {
  let target;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { target = (await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json())).find(item => item.type === "page"); if (target) break; } catch {}
    await wait(200);
  }
  if (!target) throw new Error("Chrome target unavailable");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = event => { const message = JSON.parse(event.data); if (!message.id || !pending.has(message.id)) return; const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(new Error(message.error.message)) : task.resolve(message); };
  await call("Runtime.enable"); await call("Page.enable"); await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await call("Page.navigate", { url: base }); await wait(1200);
};
const now = new Date().toISOString();
const progress = { schemaVersion: 14, deviceId: "full-crawl", currentDay: 1, streak: 0, weeklyGoal: 3, days: {}, activity: {}, reading: {}, reviews: {}, themePacks: {}, wordGames: {}, lessonFeedback: {}, smartReview: {}, learningGoal: "Conversazione quotidiana", savedPhrases: [], weeklyChallenges: {}, monthlyChecks: {} };
const setPage = async ({ view, level, lessonId, theme = "food", checkpoint = null }) => {
  await evaluate(`(()=>{localStorage.setItem("english-coach-onboarding-v1","done");localStorage.setItem("english-coach-progress-v2",${JSON.stringify(JSON.stringify(progress))});localStorage.setItem("english-coach-view-v1",${JSON.stringify(view)});localStorage.setItem("english-coach-selection-v1",${JSON.stringify(JSON.stringify({ level, lessonId, theme }))});${checkpoint ? `localStorage.setItem("english-coach-checkpoints-v1",${JSON.stringify(JSON.stringify({ [checkpoint.unitId]: checkpoint }))});` : "localStorage.removeItem('english-coach-checkpoints-v1');"}location.reload()})()`);
  await wait(checkpoint?.phase === "grammar" ? 1200 : 450);
};
const inspect = async label => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await evaluate(`(()=>{
  const shown=node=>{const style=getComputedStyle(node),rect=node.getBoundingClientRect();return style.display!=="none"&&style.visibility!=="hidden"&&style.opacity!=="0"&&rect.width>0&&rect.height>0&&!node.closest("details:not([open])");};
  const selector="h1,h2,h3,h4,p,small,strong,b,label,summary,li,code,blockquote,button";
  const elements=[...document.querySelectorAll(selector)].filter(shown);
  const leaves=elements.filter(node=>![...node.children].some(child=>child.matches(selector)));
  const texts=leaves.map(node=>(node.textContent||"").replace(/\\s+/g," ").trim()).filter(text=>text.length>=40);
  const duplicates=[...new Set(texts.filter((text,index)=>texts.indexOf(text)!==index))];
  const ambiguousItalian=new Set(["a","e","i","o","in","di","da","la","le","lo","un","una","che","come","per","con","tra","fra","su","se","ma","non","più","si","è","era","sono","corso","rapporto","parlanti","agenda","aria","bar","camera","caso","data","estate","fine","media","mobile","modo","nota","radio","sale","solo","studio","via"]);
  const highlights=[...document.querySelectorAll(".inlineEnglish")].filter(shown).map(node=>({term:(node.textContent||"").trim(),context:(node.closest("p")?.textContent||node.parentElement?.textContent||"").replace(/\s+/g," ").trim()}));
  const falseHighlights=highlights.filter(item=>ambiguousItalian.has(item.term.toLocaleLowerCase("it")));
  const overflow=elements.filter(node=>node.scrollWidth>node.clientWidth+2&&getComputedStyle(node).overflowX==="visible").map(node=>(node.textContent||"").trim().slice(0,90));
  const brokenWords=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()&&brokenWords.length<20){const textNode=walker.currentNode,parent=textNode.parentElement;if(!parent||!shown(parent)||parent.closest("script,style,input,textarea"))continue;const text=textNode.data;for(const match of text.matchAll(/[A-Za-zÀ-ÿ]{5,}/g)){const range=document.createRange();range.setStart(textNode,match.index);range.setEnd(textNode,match.index+match[0].length);const lines=[...range.getClientRects()].map(rect=>Math.round(rect.y));if(new Set(lines).size>1)brokenWords.push(match[0]);}}
  const controls=[...document.querySelectorAll("button,input,select,textarea,summary,a")].filter(shown).map(node=>{const rect=node.getBoundingClientRect();return{node,text:(node.textContent||node.getAttribute("aria-label")||"").trim().slice(0,70),x:rect.x,y:rect.y,w:rect.width,h:rect.height,position:getComputedStyle(node).position}});
  const overlaps=[];for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const a=controls[i],b=controls[j];if(a.node.contains(b.node)||b.node.contains(a.node)||a.position==="fixed"||b.position==="fixed"||a.node.closest("nav")||b.node.closest("nav"))continue;if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>3&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>3)overlaps.push([a.text,b.text]);}
  return{label:${JSON.stringify(label)},title:document.querySelector("h1")?.textContent?.trim()||"",grammarReady:Boolean(document.querySelector(".deepGuide")),horizontal:document.documentElement.scrollWidth>innerWidth+1,duplicates:duplicates.slice(0,20),overflow:[...new Set(overflow)].slice(0,20),brokenWords:[...new Set(brokenWords)],overlaps:overlaps.slice(0,20),falseHighlights:falseHighlights.slice(0,20),highlightCount:highlights.length,textBlocks:texts.length};
})()`);
    const grammarScreen = label.endsWith(":grammar");
    if (result && (!grammarScreen || result.grammarReady)) return result;
    await wait(300);
  }
  return { label, title: "", horizontal: true, duplicates: [], overflow: [], brokenWords: [], overlaps: [], falseHighlights: [], highlightCount: 0, textBlocks: 0, grammarReady: false };
};

const results = [], phases = ["grammar", "examples", "vocabulary", "cloze", "writing", "listening", "speaking", "quiz"];
try {
  await connect();
  for (const unit of mobileCurriculum) {
    for (const phase of phases) {
      const checkpoint = { unitId: unit.id, phase, item: 0, writing: "", points: { yes: 0, all: 0 }, updatedAt: now };
      await setPage({ view: "lesson", level: unit.cefr, lessonId: unit.id, checkpoint });
      let result = await inspect(`${unit.id}:${phase}`);
      if (phase === "grammar" && !result.grammarReady) {
        await setPage({ view: "lesson", level: unit.cefr, lessonId: unit.id, checkpoint });
        result = await inspect(`${unit.id}:${phase}`);
      }
      results.push(result);
    }
  }
  for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
    const lessonId = mobileCurriculum.find(unit => unit.cefr === level).id;
    for (const view of ["home", "path", "progress", "topics"]) { await setPage({ view, level, lessonId }); results.push(await inspect(`${view}:${level}`)); }
  }
  for (const pack of themePacks) { const lessonId = mobileCurriculum.find(unit => unit.cefr === pack.level).id; const theme = pack.category === "dining" ? "food" : pack.category; await setPage({ view: "topics", level: pack.level, lessonId, theme }); results.push(await inspect(`theme:${pack.id}`)); }
  const failures = results.flatMap(result => [result.horizontal ? `${result.label}: horizontal overflow` : null, result.label.endsWith(":grammar") && (!result.grammarReady || result.highlightCount === 0) ? `${result.label}: grammar/highlight content not rendered` : null, result.duplicates.length ? `${result.label}: duplicate ${result.duplicates.join(" | ")}` : null, result.overflow.length ? `${result.label}: text overflow ${result.overflow.join(" | ")}` : null, result.brokenWords.length ? `${result.label}: broken words ${result.brokenWords.join(", ")}` : null, result.overlaps.length ? `${result.label}: overlaps` : null, result.falseHighlights.length ? `${result.label}: false English emphasis ${result.falseHighlights.map(item=>`«${item.term}» in ${item.context}`).join(" | ")}` : null].filter(Boolean));
  console.log(JSON.stringify({ renderedScreens: results.length, lessonScreens: mobileCurriculum.length * phases.length, themeScreens: themePacks.length, highlightedSegments: results.reduce((sum,result)=>sum+result.highlightCount,0), failures: failures.slice(0,250), failureCount: failures.length }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  socket?.close(); child.kill(); await wait(500); await rm(profile, { recursive: true, force: true }).catch(() => undefined); await vite.close();
}
