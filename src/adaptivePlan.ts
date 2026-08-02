import type { Cefr } from "./curriculum";
import type { LearningSkill, SkillEstimate } from "./learningIntelligence";

export type AdaptiveAction = "recovery" | "new" | "spaced" | "reading" | "simulation";
export type AdaptivePlanItem = { action: AdaptiveAction; percent: number; title: string; detail: string };
export type AdaptivePlan = {
  mode: "starting" | "support" | "balanced" | "advancing";
  headline: string;
  reason: string;
  weakest: LearningSkill;
  consolidation: number;
  newContent: number;
  context: number;
  items: AdaptivePlanItem[];
};

type AdaptivePlanInput = {
  level: Cefr;
  skills: SkillEstimate[];
  completedLessons: number;
  dueReviews: number;
  openReviews: number;
};

export function buildAdaptivePlan({ level, skills, completedLessons, dueReviews, openReviews }: AdaptivePlanInput): AdaptivePlan {
  const ordered = [...skills].sort((a, b) => a.score - b.score || a.skill.localeCompare(b.skill));
  const weakest = ordered[0] ?? { skill: "Grammatica" as const, score: 42, evidence: "Nessun dato" };
  const average = skills.length ? Math.round(skills.reduce((sum, item) => sum + item.score, 0) / skills.length) : 42;
  const mode: AdaptivePlan["mode"] = dueReviews > 0
    ? "support"
    : completedLessons === 0
      ? "starting"
      : weakest.score < 45
      ? "support"
      : average >= 75 && openReviews === 0
        ? "advancing"
        : "balanced";
  const ratios = mode === "support"
    ? { recovery: 45, fresh: 25, spaced: 15, context: 15 }
    : mode === "advancing" || mode === "starting"
      ? { recovery: 20, fresh: 50, spaced: 15, context: 15 }
      : { recovery: 30, fresh: 40, spaced: 15, context: 15 };
  const contextAction: AdaptiveAction = ["Ascolto", "Pronuncia"].includes(weakest.skill) ? "simulation" : "reading";
  const headline = mode === "support"
    ? `Prima consolida ${weakest.skill.toLowerCase()}`
    : mode === "advancing"
      ? `Puoi aumentare la difficoltà in ${level}`
      : mode === "starting"
        ? `Costruiamo il primo profilo ${level}`
        : "Alterna avanzamento e consolidamento";
  const reason = mode === "starting"
    ? "Non ci sono ancora risultati sufficienti: il piano parte equilibrato e si correggerà dopo ogni attività."
    : dueReviews > 0
      ? `${dueReviews} ${dueReviews === 1 ? "elemento è pronto" : "elementi sono pronti"} per il ripasso; ${weakest.skill.toLowerCase()} è attualmente l’area più fragile (${weakest.score}%).`
      : mode === "advancing"
        ? `La media delle sei competenze è ${average}% e non risultano lacune aperte: puoi dedicare più tempo a contenuti nuovi.`
        : `${weakest.skill} è l’area meno stabile (${weakest.score}%): la rinforzi senza fermare il percorso.`;
  return {
    mode,
    headline,
    reason,
    weakest: weakest.skill,
    consolidation: ratios.recovery + ratios.spaced,
    newContent: ratios.fresh,
    context: ratios.context,
    items: [
      { action: "recovery", percent: ratios.recovery, title: "Consolidamento mirato", detail: openReviews ? `${openReviews} punti ancora aperti` : `Base di ${weakest.skill.toLowerCase()}` },
      { action: "new", percent: ratios.fresh, title: "Argomento nuovo", detail: `Avanza nel livello ${level}` },
      { action: "spaced", percent: ratios.spaced, title: "Ripasso programmato", detail: dueReviews ? `${dueReviews} pronti oggi` : "Mantieni ciò che hai imparato" },
      { action: contextAction, percent: ratios.context, title: contextAction === "simulation" ? "Ascolto e situazione reale" : "Uso nel contesto", detail: contextAction === "simulation" ? "Comprensione e risposta" : "Lettura e comprensione" },
    ],
  };
}
