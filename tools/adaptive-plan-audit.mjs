import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const skillNames = ["Grammatica", "Vocabolario", "Ascolto", "Pronuncia", "Lettura", "Scrittura"];
const profile = values => skillNames.map((skill, index) => ({ skill, score: values[index] ?? values[0], evidence: "profilo sintetico" }));

try {
  const { buildAdaptivePlan } = await server.ssrLoadModule("/src/adaptivePlan.ts");
  const scenarios = {
    starting: buildAdaptivePlan({ level: "A1", skills: profile([42, 42, 42, 42, 42, 42]), completedLessons: 0, dueReviews: 0, openReviews: 0 }),
    support: buildAdaptivePlan({ level: "B1", skills: profile([31, 62, 58, 55, 60, 49]), completedLessons: 4, dueReviews: 3, openReviews: 7 }),
    balanced: buildAdaptivePlan({ level: "B2", skills: profile([64, 66, 58, 61, 69, 63]), completedLessons: 6, dueReviews: 0, openReviews: 2 }),
    advancing: buildAdaptivePlan({ level: "C1", skills: profile([84, 78, 81, 79, 86, 80]), completedLessons: 10, dueReviews: 0, openReviews: 0 }),
    listening: buildAdaptivePlan({ level: "A2", skills: profile([65, 63, 28, 61, 64, 60]), completedLessons: 3, dueReviews: 0, openReviews: 2 }),
  };
  check(scenarios.starting.mode === "starting", "Un nuovo utente non riceve il piano iniziale");
  check(scenarios.support.mode === "support" && scenarios.support.consolidation === 60, "Le difficoltà non portano al 60% di consolidamento");
  check(scenarios.balanced.mode === "balanced" && scenarios.balanced.newContent === 40, "Il profilo intermedio non riceve un piano bilanciato");
  check(scenarios.advancing.mode === "advancing" && scenarios.advancing.newContent === 50, "Il profilo forte non avanza abbastanza");
  check(scenarios.listening.weakest === "Ascolto" && scenarios.listening.items.some(item => item.action === "simulation"), "Una lacuna di ascolto non conduce alla pratica reale");
  check(scenarios.support.reason.includes("3 elementi") && scenarios.support.reason.includes("31%"), "La motivazione non usa evidenze concrete");

  let fuzzed = 0;
  for (let attempt = 0; attempt < 5000; attempt += 1) {
    const scores = skillNames.map(() => 18 + Math.floor(Math.random() * 81));
    const completedLessons = Math.floor(Math.random() * 13);
    const dueReviews = Math.floor(Math.random() * 8);
    const openReviews = dueReviews + Math.floor(Math.random() * 8);
    const plan = buildAdaptivePlan({ level: ["A1", "A2", "B1", "B2", "C1"][attempt % 5], skills: profile(scores), completedLessons, dueReviews, openReviews });
    check(plan.items.reduce((sum, item) => sum + item.percent, 0) === 100, `Somma attività diversa da 100 al tentativo ${attempt}`);
    check(plan.consolidation + plan.newContent + plan.context === 100, `Sintesi diversa da 100 al tentativo ${attempt}`);
    check(new Set(plan.items.map(item => item.action)).size === 4, `Azioni duplicate al tentativo ${attempt}`);
    check(plan.items.every(item => item.percent >= 15), `Quota troppo piccola al tentativo ${attempt}`);
    if (dueReviews > 0) check(plan.mode === "support", `Ripasso dovuto ignorato al tentativo ${attempt}`);
    if (!dueReviews && completedLessons > 0 && Math.min(...scores) < 45) check(plan.mode === "support", `Lacuna critica ignorata al tentativo ${attempt}`);
    fuzzed += 1;
  }
  console.log(JSON.stringify({ engine: "deterministic scenarios plus property fuzzing", scenarios, fuzzed, failures }, null, 2));
} finally {
  await server.close();
}
if (failures.length) process.exitCode = 1;
