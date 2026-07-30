const femaleVoiceNames = /female|samantha|zira|susan|hazel|ava|aria|jenny|sonia|libby|natasha|karen|moira|tessa|victoria|serena|fiona|anna/i;
const maleVoiceNames = /male|daniel|george|david|mark|guy|ryan|liam|thomas|oliver|fred/i;
const femaleSpeakers = /^(anna|ana|nina|sara|sarah|mary|maria|emma|jane|julia|lucy|alice|woman|female|customer)$/i;
const maleSpeakers = /^(tom|thomas|john|james|david|mark|paul|man|male|server|waiter)$/i;

function seedIndex(seed: string, length: number) {
  const hash = [...seed].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) | 0, 7);
  return length ? Math.abs(hash) % length : 0;
}

export function dialogueVoicePair(available: SpeechSynthesisVoice[], seed = "dialogue") {
  const english = available.filter(voice => /^en(?:-|$)/i.test(voice.lang));
  const femaleCandidates = english.filter(voice => femaleVoiceNames.test(voice.name));
  const femalePool = femaleCandidates.length ? femaleCandidates : english.filter(voice => /^en-GB/i.test(voice.lang)).length ? english.filter(voice => /^en-GB/i.test(voice.lang)) : english;
  const female = femalePool[seedIndex(`${seed}-female`, femalePool.length)] ?? null;
  const different = english.filter(voice => voice.name !== female?.name);
  const maleCandidates = different.filter(voice => maleVoiceNames.test(voice.name));
  const malePool = maleCandidates.length ? maleCandidates : different.filter(voice => /^en-US/i.test(voice.lang)).length ? different.filter(voice => /^en-US/i.test(voice.lang)) : different;
  const male = malePool[seedIndex(`${seed}-male`, malePool.length)] ?? female;
  return { female, male };
}

export function dialogueRole(speaker: string | undefined, turnIndex: number) {
  const name = speaker?.trim() ?? "";
  if (femaleSpeakers.test(name)) return "female" as const;
  if (maleSpeakers.test(name)) return "male" as const;
  return turnIndex % 2 === 0 ? "female" as const : "male" as const;
}

export function applyDialogueVoice(
  utterance: SpeechSynthesisUtterance,
  pair: ReturnType<typeof dialogueVoicePair>,
  role: ReturnType<typeof dialogueRole>,
) {
  utterance.voice = role === "female" ? pair.female : pair.male;
  utterance.lang = utterance.voice?.lang || "en-GB";
  // Some devices expose only one English voice. Pitch keeps the speakers distinct.
  utterance.pitch = role === "female" ? 1.08 : 0.9;
}
