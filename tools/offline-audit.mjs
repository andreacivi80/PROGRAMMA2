import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const manifestPath = resolve("public/offline-audio.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;
const sw = readFileSync("public/sw.js", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const protectedNames = ["gambe-leggere", "technics-mobile"];
const checks = {
  manifestGeneratedBeforeBuild: pkg.scripts?.build?.startsWith("node tools/offline-manifest.mjs &&"),
  manifestPresent: Boolean(manifest && statSync(manifestPath).size > 1000),
  completeAudioInventory: manifest?.files?.length === 1744 && manifest?.bytes > 200 * 1024 * 1024,
  audioPathsOnly: manifest?.files?.every((file) => /^audio\//.test(file) && !protectedNames.some((name) => file.includes(name))),
  appShellCached: sw.includes("offline-audio.json") && sw.includes("event.request.mode === \"navigate\"") && sw.includes("caches.match(BASE)"),
  audioCachePreserved: sw.includes("AUDIO_CACHE") && sw.includes("key !== CACHE && key !== AUDIO_CACHE"),
  offlineMessagesAvailable: ["OFFLINE_STATUS", "CACHE_OFFLINE_AUDIO", "OFFLINE_PROGRESS", "OFFLINE_READY", "OFFLINE_ERROR"].every((token) => sw.includes(token)),
  userCanStartDownload: app.includes("Scarica audio offline") && app.includes("CACHE_OFFLINE_AUDIO"),
  limitationIsHonest: app.includes("riconoscimento della voce dipende dal browser e può richiedere Internet"),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ audioFiles: manifest?.files?.length ?? 0, megabytes: manifest ? Number((manifest.bytes / 1024 / 1024).toFixed(1)) : 0, checks, failed }, null, 2));
if (failed.length) process.exitCode = 1;
