import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const placement = readFileSync("src/PlacementTest.tsx", "utf8");
const checks = {
  mainViews: ["home", "path", "topics", "progress", "errors"].every((view) => app.includes(`\"${view}\"`)),
  lessonDirectRestore: app.includes('saved === "lesson" && loadLatestCheckpoint()') && app.includes("initialSession?.checkpoint.phase"),
  lessonPosition: ["phase", "item", "writing", "points", "input", "checked", "answered", "dictation", "dictationChecked", "spoken", "writingNotes", "writingSuggestion", "sessionMinutes", "bonusMinutes", "bonusQuiz", "startedAt"].every((field) => app.includes(field)),
  elapsedTimeSurvivesRefresh: app.includes("initialSession?.checkpoint.startedAt ?? Date.now()") && app.includes("checkpoint?.startedAt ?? Date.now()"),
  readingRestore: app.includes("english-coach-reading-draft-v1") && app.includes("initialReading?.questionIndex"),
  placementRestore: app.includes('saved === "placement"') && placement.includes("english-coach-placement-draft-v2"),
  levelAndTheme: app.includes("english-coach-selection-v1") && app.includes("lessonId: selectedLessonId") && app.includes("theme: selectedTheme"),
  scrollPerView: app.includes("`english-coach-scroll-${view}`"),
  panelState: app.includes("english-coach-adaptive-open") && app.includes("english-coach-free-open"),
  forwardCompatibleMigration: app.includes("function normalizeProgress") && app.includes("schemaVersion: 12") && app.includes("normalizeProgress(imported.progress, deviceId())"),
  checkpointMigration: app.includes("function normalizeCheckpoint") && app.includes("counts[phase] - 1") && app.includes("normalizeCheckpoint(saved)?.checkpoint"),
  completeBackup: ["checkpoints", "selection", "readingDraft", "supplementarySeen"].every((field) => app.includes(field)),
  preventsDoubleCompletion: app.includes("finishingRef.current") && app.includes("if (!progress || finishingRef.current) return"),
  bonusSessionRestore: app.includes("checkpoint?.bonusQuiz") && app.includes("checkpoint?.bonusMinutes"),
  safeReset: ["english-coach-checkpoints-v1", "english-coach-reading-draft-v1", "english-coach-view-v1", "english-coach-placement-draft-v2"].every((key) => app.includes(`removeItem(\"${key}\")`)),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ checks, failed }, null, 2));
if (failed.length) process.exit(1);
