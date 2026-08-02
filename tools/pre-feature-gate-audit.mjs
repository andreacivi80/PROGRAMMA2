import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(".");
const read = file => readFileSync(resolve(root, file), "utf8");
const walk = directory => readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap(entry => {
  const relative = join(directory, entry.name);
  return entry.isDirectory() ? walk(relative) : [relative];
});
const sourceFiles = walk("src").filter(file => [".ts", ".tsx"].includes(extname(file)));
const source = sourceFiles.map(read).join("\n");
const app = read("src/App.tsx");
const sw = read("public/sw.js");
const tsconfig = JSON.parse(read("tsconfig.json"));
const html = read("dist/index.html");
const assets = walk("dist/assets").map(file => ({
  file,
  bytes: statSync(resolve(root, file)).size,
  gzip: gzipSync(readFileSync(resolve(root, file))).length,
}));
const entryPath = html.match(/<script[^>]+src="\.\/([^"]+\.js)"/)?.[1] ?? html.match(/<script[^>]+src="\/PROGRAMMA2\/([^"]+\.js)"/)?.[1];
const entry = assets.find(asset => asset.file.replaceAll("\\", "/").replace(/^dist\//, "") === entryPath);
const lazyJs = assets.filter(asset => asset.file.endsWith(".js") && asset !== entry);
const blankLinks = [...source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map(match => match[0]);
const installBlock = sw.slice(
  sw.indexOf('self.addEventListener("install"'),
  sw.indexOf('self.addEventListener("activate"'),
);

const checks = {
  productionBundleExists: Boolean(entry && assets.some(asset => asset.file.endsWith(".css"))),
  initialJavascriptWithinBudget: Boolean(entry && entry.gzip <= 250 * 1024),
  stylesheetWithinBudget: assets.filter(asset => asset.file.endsWith(".css")).every(asset => asset.gzip <= 35 * 1024),
  lazyChunksWithinBudget: lazyJs.every(asset => asset.gzip <= 35 * 1024),
  offlineAudioIsOptIn: !/manifest\.files|\/audio\//.test(installBlock) && sw.includes('event.data?.type === "CACHE_OFFLINE_AUDIO"'),
  offlineShellFallback: sw.includes("caches.match(event.request)") && sw.includes("caches.match(BASE)"),
  updatesPreserveOfflineAudio: sw.includes("key !== CACHE && key !== AUDIO_CACHE"),
  corruptProgressFallsBackSafely: app.includes('localStorage.getItem("english-coach-progress-v2") || "{}"') && /catch \{\}/.test(app),
  corruptCheckpointsFallBackSafely: app.includes('localStorage.getItem("english-coach-checkpoints-v1") || "{}"') && app.includes("function normalizeCheckpoint"),
  stableSchemaMigration: app.includes("schemaVersion: 14") && app.includes("normalizeProgress(imported.progress, deviceId())"),
  microphoneNeedsUserAction: app.includes('onClick={record}') && app.indexOf("const record = async") < app.indexOf('onClick={record}'),
  microphoneAlwaysStopsOnRecognitionFailure: app.includes("Il riconoscimento vocale non è partito") && app.includes("finishRecording();"),
  recordingUrlsAreReleased: app.includes("if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl)"),
  recordingsStayLocal: !/fetch\([^)]*(recordedAudioUrl|chunks|audio\/webm)/s.test(source) && !/localStorage\.setItem\([^)]*(recordedAudioUrl|chunks|audio\/webm)/s.test(source),
  noAnalyticsOrTrackers: !/(gtag\(|google-analytics|mixpanel|posthog|segment\.io|sentry\.io|hotjar)/i.test(source),
  noEmbeddedSecrets: !/(api[_-]?key|client[_-]?secret|private[_-]?key)\s*[:=]\s*["'][^"']{12,}/i.test(source),
  noUnsafeHtmlOrCodeExecution: !/(dangerouslySetInnerHTML|\beval\s*\(|new Function\s*\()/i.test(source),
  externalLinksAreIsolated: blankLinks.length > 0 && blankLinks.every(link => /rel="[^"]*(?:noreferrer|noopener)[^"]*"/.test(link)),
  modernCompatibleTarget: tsconfig.compilerOptions?.target === "ES2022" && tsconfig.compilerOptions?.lib?.includes("DOM"),
  chromeInstalled: existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe"),
  edgeInstalled: existsSync("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
  firefoxInstalled: existsSync("C:/Program Files/Mozilla Firefox/firefox.exe"),
};

const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({
  gate: "pre-feature consolidation",
  sourceFiles: sourceFiles.length,
  bundle: entry ? { file: entry.file, kilobytes: +(entry.bytes / 1024).toFixed(1), gzipKilobytes: +(entry.gzip / 1024).toFixed(1) } : null,
  largestLazyGzipKilobytes: lazyJs.length ? +(Math.max(...lazyJs.map(asset => asset.gzip)) / 1024).toFixed(1) : 0,
  checks,
  failed,
}, null, 2));
if (failed.length) process.exitCode = 1;
