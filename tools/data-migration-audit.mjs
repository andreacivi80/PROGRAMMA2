import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { normalizeProgress, normalizeCheckpoint } = await server.ssrLoadModule("/src/App.tsx");
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const legacy = normalizeProgress({
    schemaVersion: 1,
    currentDay: 19,
    streak: -4,
    days: { 7: { score: 60 }, 13: { score: 70 }, 19: { score: 80 } },
    activity: {},
    smartReview: { old: { step: 2, mastered: false, attempts: Array.from({ length: 40 }, (_, index) => ({ at: String(index), givenAnswer: "x", correct: false })) } },
  }, "audit-device");
  const lesson = mobileCurriculum[0];
  const checkpoint = normalizeCheckpoint({
    unitId: lesson.id,
    phase: "examples",
    item: 999,
    writing: "draft",
    points: { yes: 2, all: 3 },
    startedAt: 12345,
    updatedAt: "invalid",
  });
  const malformed = normalizeProgress({ currentDay: 999, days: [], activity: [], smartReview: [] }, "audit-device");
  const checks = {
    migratesThreeCourseExpansions: Boolean(legacy.currentDay === 37 && legacy.days[13] && legacy.days[25] && legacy.days[37]),
    preservesDeviceAndSchema: legacy.deviceId === "audit-device" && legacy.schemaVersion === 12,
    clampsInvalidCounters: legacy.streak === 0 && malformed.currentDay === mobileCurriculum.length,
    repairsCollections: !Array.isArray(malformed.days) && !Array.isArray(malformed.activity) && !Array.isArray(malformed.smartReview),
    trimsReviewHistory: legacy.smartReview.old.attempts.length === 30,
    clampsCheckpointQuestion: checkpoint?.checkpoint.item === lesson.grammar.examples.length - 1,
    preservesCheckpointDraft: checkpoint?.checkpoint.writing === "draft" && checkpoint?.checkpoint.startedAt === 12345,
    rejectsUnknownLesson: normalizeCheckpoint({ unitId: "missing", phase: "grammar" }) === null,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ checks, failed }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await server.close();
}
