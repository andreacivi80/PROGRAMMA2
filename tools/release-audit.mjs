import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const app = readFileSync("src/App.tsx", "utf8");
const sw = readFileSync("public/sw.js", "utf8");
const checklist = readFileSync("RELEASE-CHECKLIST.md", "utf8");
const workflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
const version = pkg.version.replace(/\.0$/, "");
const stableKeys = [
  "english-coach-progress-v2",
  "english-coach-checkpoints-v1",
  "english-coach-selection-v1",
  "english-coach-view-v1",
  "english-coach-reading-draft-v1",
  "english-coach-supplementary-seen-v1",
];
const checks = {
  packageAndLockAgree: lock.version === pkg.version && lock.packages?.[""]?.version === pkg.version,
  visibleVersionAgrees: app.includes(`const APP_VERSION = "${version}"`),
  buildIdAgrees: app.includes(`const BUILD_ID = "EC-${version}-0731"`),
  cacheAgrees: sw.includes(`english-coach-v${version.replace(".", "")}`),
  checklistAgrees: checklist.includes(`# English Coach ${version} — stato verificato`),
  progressKeysRemainStable: stableKeys.every(key => app.includes(key)),
  updateDoesNotClearStorage: !sw.includes("localStorage") && !sw.includes("indexedDB.deleteDatabase"),
  updateDoesNotInterruptActiveExercise: !main.includes('addEventListener("controllerchange"') && !main.includes("location.replace(target)"),
  deployBuildsFreshArtifact: workflow.includes("npm ci") && workflow.includes("npm run build") && workflow.includes("path: dist"),
  onePublicSource: !tracked.some(path => /(^|\/)(dist|node_modules)(\/|$)/.test(path)),
  noTrackedBuildArchives: !tracked.some(path => /\.(zip|7z|rar)$/i.test(path)),
  secureToolchain: pkg.dependencies?.vite === "8.2.0",
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ version, trackedFiles: tracked.length, stableProgressKeys: stableKeys.length, checks, failed }, null, 2));
if (failed.length) process.exitCode = 1;
