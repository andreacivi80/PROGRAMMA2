import type { Cefr } from "./curriculum";

export type ListeningHelpStage = 0 | 1 | 2;
export const listeningStageLabel = (stage: ListeningHelpStage) =>
  (["Solo audio", "Parole chiave", "Trascrizione"] as const)[stage];

const common = new Set(["about","after","again","also","because","before","could","from","have","into","just","more","only","should","that","their","there","these","they","this","those","through","very","what","when","where","which","will","with","would","your"]);
export function listeningKeywords(transcript: string, level: Cefr): string[] {
  const limit = level === "A1" ? 6 : level === "A2" ? 5 : level === "B1" ? 4 : 3;
  const words = transcript.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? [];
  return [...new Set(words.filter(word => !common.has(word)))].sort((a,b)=>b.length-a.length).slice(0,limit);
}

export function nextListeningStage(stage: ListeningHelpStage): ListeningHelpStage {
  return Math.min(2, stage + 1) as ListeningHelpStage;
}
