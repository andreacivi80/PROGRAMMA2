import type { Choice } from "./curriculum";
export type DifficultyMode = "recovery" | "balanced" | "challenge";
export function difficultyMode(input: { score?: number; attempts?: number; rating?: "easy" | "right" | "hard" }): DifficultyMode {
  if (input.rating === "hard" || (input.attempts ?? 0) > 0 && (input.score ?? 0) < 55) return "recovery";
  if (input.rating === "easy" || (input.attempts ?? 0) >= 1 && (input.score ?? 0) >= 82) return "challenge";
  return "balanced";
}
const words = (value: string) => new Set(value.toLowerCase().match(/[a-z']+/g) ?? []);
export function choiceDifficulty(choice: Choice) {
  const answer = choice.options[choice.answer] ?? "", answerWords = words(answer);
  const similarities = choice.options.filter((_, index) => index !== choice.answer).map(option => {
    const optionWords = words(option), shared = [...answerWords].filter(word => optionWords.has(word)).length;
    const union = new Set([...answerWords, ...optionWords]).size || 1;
    return shared / union * .65 + (1 - Math.min(1, Math.abs(option.length - answer.length) / Math.max(1, answer.length))) * .35;
  });
  return Math.round(similarities.reduce((sum, value) => sum + value, 0) / Math.max(1, similarities.length) * 100);
}
export function adaptChoices(choices: Choice[], mode: DifficultyMode) {
  const ranked = choices.map((choice, index) => ({ choice, index, difficulty: choiceDifficulty(choice) }));
  ranked.sort((a, b) => mode === "challenge" ? b.difficulty - a.difficulty || a.index - b.index : mode === "recovery" ? a.difficulty - b.difficulty || a.index - b.index : a.index - b.index);
  return ranked.map(item => item.choice);
}
export const difficultyCopy: Record<DifficultyMode, { label: string; detail: string }> = {
  recovery: { label: "Consolidamento", detail: "Prima strutture chiare, poi una verifica più sottile." },
  balanced: { label: "Progressione equilibrata", detail: "La difficoltà cresce gradualmente durante la sessione." },
  challenge: { label: "Sfida avanzata", detail: "Le alternative più vicine arrivano per prime." },
};
