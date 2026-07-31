import type { Cefr, MobileUnit } from "./curriculum";

export type LearningSkill = "Grammatica" | "Vocabolario" | "Ascolto" | "Pronuncia" | "Lettura" | "Scrittura";
export type SkillEstimate = { skill: LearningSkill; score: number; evidence: string };
export type ErrorCluster = { id: string; label: string; count: number; direction: "better" | "stable" | "attention" };

type ReviewLike = { kind?: string; prompt?: string; answer?: string; explanation?: string; mastered?: boolean; wrongCount?: number; attempts?: { at: string; correct: boolean }[] };
type ProgressLike = {
  days?: Record<string, { score?: number; writing?: string }>;
  reading?: Record<string, { score?: number }>;
  smartReview?: Record<string, ReviewLike>;
};

const clamp = (value: number) => Math.max(18, Math.min(98, Math.round(value)));
const average = (values: number[], fallback: number) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

export function buildSkillProfile(progress: ProgressLike, level: Cefr, units: MobileUnit[]): SkillEstimate[] {
  const levelUnits = units.filter(unit => unit.cefr === level);
  const completed = levelUnits.map(unit => progress.days?.[unit.day]).filter(Boolean);
  const lessonAverage = average(completed.map(result => Number(result?.score ?? 0)), 42);
  const reviews = Object.values(progress.smartReview ?? {});
  const open = (kind: string) => reviews.filter(review => !review.mastered && review.kind === kind).reduce((sum, review) => sum + Math.max(0.25, Number(review.wrongCount ?? 1) - Number((review as ReviewLike & { correctStreak?: number }).correctStreak ?? 0) * 0.8), 0);
  const readingResults = Object.values(progress.reading ?? {}).map(result => Number(result.score ?? 0));
  const writtenWords = completed.reduce((sum, result) => sum + (result?.writing?.trim().split(/\s+/).filter(Boolean).length ?? 0), 0);
  const completedLabel = completed.length ? `${completed.length} sessioni considerate` : "Inizierà a stimarsi con la pratica";
  return [
    { skill: "Grammatica", score: clamp(lessonAverage - open("Grammatica") * 3), evidence: completedLabel },
    { skill: "Vocabolario", score: clamp(lessonAverage - open("Vocabolario") * 3), evidence: completedLabel },
    { skill: "Ascolto", score: clamp(lessonAverage - open("Ascolto") * 4), evidence: open("Ascolto") ? `${Math.ceil(open("Ascolto"))} punti da riascoltare` : completedLabel },
    { skill: "Pronuncia", score: clamp(lessonAverage - open("Pronuncia") * 4), evidence: open("Pronuncia") ? `${Math.ceil(open("Pronuncia"))} frasi da ripetere` : completedLabel },
    { skill: "Lettura", score: clamp(average(readingResults, lessonAverage - 4) - open("Lettura") * 3), evidence: readingResults.length ? `${readingResults.length} letture considerate` : "Completa un Reading Lab" },
    { skill: "Scrittura", score: clamp(lessonAverage - open("Scrittura") * 4 + Math.min(8, writtenWords / 45)), evidence: writtenWords ? `${writtenWords} parole prodotte` : "Completa il primo testo libero" },
  ];
}

export function buildErrorClusters(progress: ProgressLike): ErrorCluster[] {
  const reviews = Object.values(progress.smartReview ?? {}).filter(review => !review.mastered);
  const rules: [string, string, RegExp][] = [
    ["articles", "Articoli a, an, the", /\b(a|an|the|article)\b/i],
    ["verb-tenses", "Tempi e forme verbali", /\b(past|present|perfect|continuous|partic|did|does|have|has|am|is|are|would|verb)\b/i],
    ["prepositions", "Preposizioni", /\b(preposition|in|on|at|for|since|to)\b/i],
    ["word-order", "Ordine delle parole", /\b(order|position|question|inversion|sequence)\b/i],
    ["false-friends", "False friends e significato", /\b(false friend|actually|eventually|sensible|library|argument)\b/i],
    ["listening", "Comprensione dell’ascolto", /ascolto|dialog|heard|audio/i],
    ["pronunciation", "Pronuncia e riconoscimento", /pronuncia|recognized|repeat|sound/i],
  ];
  return rules.map(([id, label, pattern]) => {
    const matches = reviews.filter(review => pattern.test(`${review.kind} ${review.prompt} ${review.answer} ${review.explanation}`));
    const recent = matches.flatMap(review => review.attempts ?? []).slice(-6);
    const correct = recent.filter(attempt => attempt.correct).length;
    return { id, label, count: matches.length, direction: !matches.length ? "better" : correct >= Math.ceil(recent.length / 2) ? "stable" : "attention" } as ErrorCluster;
  }).filter(cluster => cluster.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
}
