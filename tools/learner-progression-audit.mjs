import { readFileSync } from "node:fs";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const { placementItems } = await server.ssrLoadModule("/src/placementModel.ts");
  const { buildSkillProfile, buildErrorClusters } = await server.ssrLoadModule("/src/learningIntelligence.ts");
  const { supplementaryBankFor, buildSupplementaryQuiz, supplementaryFingerprint } = await server.ssrLoadModule("/src/supplementaryQuiz.ts");
  const first = mobileCurriculum[0];
  const base = { reading: {}, activity: {}, days: {}, smartReview: {} };
  const successful = { ...base, days: { 1: { score: 94, writing: "I can introduce myself clearly because I practise every day." }, 2: { score: 91, writing: "I bought a book and the book is useful." } } };
  const repeatedError = { id: "grammar-repeat", kind: "Grammatica", prompt: "I ___ ready.", answer: "am", explanation: "Con I usa am.", mastered: false, wrongCount: 5, correctStreak: 0, attempts: Array.from({ length: 5 }, (_, index) => ({ at: new Date(Date.now() - index * 86400000).toISOString(), correct: false })) };
  const struggling = { ...base, days: { 1: { score: 35, writing: "I is ready" }, 2: { score: 31, writing: "She have book" } }, smartReview: { [repeatedError.id]: repeatedError } };
  const improving = { ...struggling, days: { ...struggling.days, 2: { score: 68, writing: "She has a book and the book is useful." } }, smartReview: { [repeatedError.id]: { ...repeatedError, correctStreak: 4, attempts: [...repeatedError.attempts, ...Array.from({ length: 4 }, (_, index) => ({ at: new Date(Date.now() + index * 1000).toISOString(), correct: true }))] } } };
  const goodSkills = buildSkillProfile(successful, "A1", mobileCurriculum);
  const poorSkills = buildSkillProfile(struggling, "A1", mobileCurriculum);
  const improvedSkills = buildSkillProfile(improving, "A1", mobileCurriculum);
  const score = (profile, skill) => profile.find(item => item.skill === skill).score;
  const bank = supplementaryBankFor(first);
  const firstExtra = buildSupplementaryQuiz(first, 10, []);
  const secondExtra = buildSupplementaryQuiz(first, 10, firstExtra.map(supplementaryFingerprint));
  const overlap = firstExtra.filter(question => secondExtra.some(other => supplementaryFingerprint(other) === supplementaryFingerprint(question))).length;
  const app = readFileSync("src/App.tsx", "utf8"), coach = readFileSync("src/LearningCoach.tsx", "utf8");
  const checks = {
    successfulLearnerHasNoCriticalSkill: goodSkills.every(item => item.score >= 45),
    repeatedErrorsCreateCriticalGrammar: score(poorSkills, "Grammatica") < 45,
    correctRetriesProduceVisibleImprovement: score(improvedSkills, "Grammatica") > score(poorSkills, "Grammatica"),
    strugglingLearnerGetsDiagnosedCluster: buildErrorClusters(struggling).some(cluster => cluster.id === "verb-tenses" || cluster.id === "word-order"),
    nextLessonFollowsNumericPrerequisite: mobileCurriculum.filter(unit => unit.cefr === "A1").every((unit, index, list) => index === 0 || unit.day === list[index - 1].day + 1),
    extraPracticeRotatesBeforeRepeating: bank.length >= 20 && overlap === 0,
    monthlyCheckIsStableAtSixItems: ["A1", "A2", "B1", "B2", "C1"].every(level => placementItems.filter(item => item.level === level).length === 6),
    fiveMinuteModeUsesRecoveryWhenNeeded: app.includes("if (openReviews.length) startRecovery(Math.min(4, openReviews.length))"),
    explicitPrerequisiteRouteExists: coach.includes("ORDINE CONSIGLIATO") && coach.includes("Rinforza prima questo"),
    nonImprovementReceivesFourSupports: app.includes("relatedExample") && app.includes("Ascolta l’esempio") && app.includes("Riprova") && app.includes("0.8"),
    listeningHasThreeProgressiveModes: ["1 · Con aiuto", "2 · Naturale", "3 · Riassumi"].every(label => app.includes(label)),
    phraseBookAndGoalsPersist: app.includes("savedPhrases") && app.includes("learningGoal") && coach.includes("Il mio quaderno di frasi"),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ successful: goodSkills, struggling: poorSkills, improving: improvedSkills, rotatingBank: { size: bank.length, overlap }, checks, failed }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await server.close();
}
