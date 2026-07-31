import type { Cefr } from "./curriculum";

export type PlacementKind = "grammar" | "vocabulary" | "reading" | "listening";
export type PlacementItem = {
  id: string;
  level: Cefr;
  kind: PlacementKind;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  passage?: string;
  audioText?: string;
  voiceLang?: string;
  speechRate?: number;
};

export const placementLevels: Cefr[] = ["A1", "A2", "B1", "B2", "C1"];

export const placementItems: PlacementItem[] = [
  { id: "a1-1", level: "A1", kind: "grammar", prompt: "I ___ from Italy.", options: ["am", "is", "are"], answer: 0, explanation: "Con I si usa am." },
  { id: "a1-2", level: "A1", kind: "grammar", prompt: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking"], answer: 1, explanation: "Alla terza persona il Present Simple richiede -s." },
  { id: "a1-3", level: "A1", kind: "vocabulary", prompt: "Which word names a place where you buy medicine?", options: ["Bakery", "Pharmacy", "Station"], answer: 1, explanation: "Pharmacy significa farmacia." },
  { id: "a1-4", level: "A1", kind: "reading", passage: "Mia lives in Rome. She works in a small hotel and starts at eight every morning.", prompt: "Where does Mia work?", options: ["In a hotel", "In a school", "At a station"], answer: 0, explanation: "Il testo dice: She works in a small hotel." },
  { id: "a1-5", level: "A1", kind: "listening", audioText: "Tom would like two tickets for the afternoon train.", prompt: "What does Tom want?", options: ["Two train tickets", "An afternoon coffee", "Two hotel rooms"], answer: 0, explanation: "Tom asks for two tickets." },
  { id: "a1-6", level: "A1", kind: "vocabulary", prompt: "Choose the correct everyday reply: ‘How are you?’", options: ["I'm fine, thanks.", "I'm twenty euros.", "At five o'clock."], answer: 0, explanation: "I'm fine, thanks è una risposta naturale a How are you?" },

  { id: "a2-1", level: "A2", kind: "grammar", prompt: "We ___ to London last year.", options: ["go", "went", "have gone"], answer: 1, explanation: "Last year indica un passato concluso: Past Simple." },
  { id: "a2-2", level: "A2", kind: "grammar", prompt: "This restaurant is ___ than the other one.", options: ["cheap", "cheaper", "cheapest"], answer: 1, explanation: "Il confronto tra due elementi usa il comparativo." },
  { id: "a2-3", level: "A2", kind: "vocabulary", prompt: "If a shop is 'crowded', it is…", options: ["full of people", "very expensive", "already closed"], answer: 0, explanation: "Crowded significa affollato." },
  { id: "a2-4", level: "A2", kind: "reading", passage: "The museum normally closes at six, but on Fridays it stays open until nine. Entry is free after seven.", prompt: "When can you enter without paying?", options: ["Every day after six", "On Friday after seven", "Only before seven"], answer: 1, explanation: "Il venerdì resta aperto e l'ingresso è gratuito dopo le sette." },
  { id: "a2-5", level: "A2", kind: "listening", audioText: "The meeting has moved from Tuesday morning to Wednesday afternoon.", prompt: "When is the meeting now?", options: ["Tuesday afternoon", "Wednesday morning", "Wednesday afternoon"], answer: 2, explanation: "La nuova data è Wednesday afternoon." },
  { id: "a2-6", level: "A2", kind: "vocabulary", prompt: "In English, ‘actually’ normally means…", options: ["attualmente", "in realtà", "eventualmente"], answer: 1, explanation: "Actually è un false friend: significa in realtà, non attualmente." },

  { id: "b1-1", level: "B1", kind: "grammar", prompt: "I ___ here since 2022.", options: ["work", "worked", "have worked"], answer: 2, explanation: "Since collega l'inizio passato alla situazione presente." },
  { id: "b1-2", level: "B1", kind: "grammar", prompt: "If I had more time, I ___ another course.", options: ["take", "would take", "will take"], answer: 1, explanation: "Il Second Conditional usa would + verbo base." },
  { id: "b1-3", level: "B1", kind: "vocabulary", prompt: "The project was 'put off'. What happened?", options: ["It was postponed", "It was cancelled forever", "It was completed early"], answer: 0, explanation: "Put off significa rimandare." },
  { id: "b1-4", level: "B1", kind: "reading", passage: "Although Lina had prepared carefully, her train was cancelled. She joined the interview from a quiet café instead, explained the situation, and was offered a second in-person meeting.", prompt: "Why did Lina attend the interview online?", options: ["She had forgotten the address", "Her train was cancelled", "The company had closed"], answer: 1, explanation: "Il collegamento causale è tra la cancellazione del treno e il colloquio online." },
  { id: "b1-5", level: "B1", kind: "listening", audioText: "I expected the course to focus on grammar, whereas most lessons were actually based on conversation.", prompt: "What surprised the speaker?", options: ["The price of the course", "The emphasis on conversation", "The lack of any lessons"], answer: 1, explanation: "Il contrasto è tra grammatica attesa e conversazione effettiva." },
  { id: "b1-6", level: "B1", kind: "vocabulary", prompt: "Which sentence uses ‘eventually’ correctly?", options: ["Eventually, I might call you.", "We eventually reached an agreement after three hours.", "I work eventually from home."], answer: 1, explanation: "Eventually significa alla fine/dopo un certo tempo, non eventualmente." },

  { id: "b2-1", level: "B2", kind: "grammar", prompt: "The delay ___ by a technical failure.", options: ["may cause", "may have been caused", "must causing"], answer: 1, explanation: "Deduzione passata passiva: may have been + participio." },
  { id: "b2-2", level: "B2", kind: "grammar", prompt: "Had we known earlier, we ___ differently.", options: ["would act", "would have acted", "acted"], answer: 1, explanation: "È l'inversione del Third Conditional." },
  { id: "b2-3", level: "B2", kind: "vocabulary", prompt: "A 'feasible' proposal is one that is…", options: ["practical and achievable", "deliberately misleading", "legally compulsory"], answer: 0, explanation: "Feasible indica qualcosa di realizzabile." },
  { id: "b2-4", level: "B2", kind: "reading", passage: "The council's cycling scheme reduced traffic in the centre, yet critics note that the survey covered only summer months. The findings are promising, but they cannot establish whether the improvement will persist throughout the year.", prompt: "What is the writer's main reservation?", options: ["Cycling increased traffic", "The evidence covers a limited period", "The council ignored every survey"], answer: 1, explanation: "Il limite è la raccolta dei dati nei soli mesi estivi." },
  { id: "b2-5", level: "B2", kind: "listening", audioText: "While the figures appear encouraging at first glance, they should be treated with caution, since two regional offices failed to submit complete data.", voiceLang: "en-US", speechRate: 1.05, prompt: "Why should the figures be treated cautiously?", options: ["They are too old", "Some data is incomplete", "Every office reported a loss"], answer: 1, explanation: "Due uffici non hanno fornito dati completi." },
  { id: "b2-6", level: "B2", kind: "vocabulary", prompt: "The manager said she would ‘look into’ the complaint. What will she do?", options: ["Ignore it", "Investigate it", "Write it down without reading it"], answer: 1, explanation: "Look into è un phrasal verb che significa indagare/esaminare." },

  { id: "c1-1", level: "C1", kind: "grammar", prompt: "Rarely ___ such a convincing argument.", options: ["I heard", "have I heard", "I have hear"], answer: 1, explanation: "Dopo un avverbio negativo iniziale si usa l'inversione." },
  { id: "c1-2", level: "C1", kind: "grammar", prompt: "The proposal is feasible, ___ several reservations.", options: ["notwithstanding", "although", "whereas of"], answer: 0, explanation: "Notwithstanding introduce una concessione davanti a un nome." },
  { id: "c1-3", level: "C1", kind: "vocabulary", prompt: "Choose the most appropriately cautious academic claim.", options: ["This proves the policy works.", "The findings may lend support to the policy.", "The policy definitely succeeds."], answer: 1, explanation: "May lend support evita di trasformare un indizio in prova definitiva." },
  { id: "c1-4", level: "C1", kind: "reading", passage: "Far from rejecting automation outright, the author questions the assumption that efficiency gains are distributed evenly. Her concern is not technological change itself, but the absence of policies addressing those who bear its short-term costs.", prompt: "Which interpretation best reflects the author's position?", options: ["She opposes all automation", "She supports change without conditions", "She questions how its benefits and costs are distributed"], answer: 2, explanation: "La critica riguarda la distribuzione di benefici e costi, non la tecnologia in sé." },
  { id: "c1-5", level: "C1", kind: "listening", audioText: "The chair's remarks were ostensibly conciliatory; nevertheless, the conditions she attached made a swift compromise rather unlikely.", voiceLang: "en-AU", speechRate: 1.12, prompt: "What is implied?", options: ["Her tone and practical position differed", "A compromise had already been signed", "She openly refused to negotiate"], answer: 0, explanation: "Il tono sembrava conciliante, ma le condizioni ostacolavano l'accordo." },
  { id: "c1-6", level: "C1", kind: "vocabulary", prompt: "If someone says a plan is ‘a long shot’, they mean it is…", options: ["unlikely to succeed but worth trying", "unnecessarily detailed", "certain to succeed eventually"], answer: 0, explanation: "A long shot indica un tentativo con poche probabilità di successo." },
];

export type ProductionEvidence = { writing: string; mediation: string; oral: string };
export type PlacementResult = {
  suggested: Cefr;
  bandScores: Record<Cefr, number>;
  totalPercent: number;
  confidence: "alta" | "media" | "da approfondire";
  boundary?: Cefr;
};

const productionBonus = ({ writing, mediation, oral }: ProductionEvidence) => {
  const words = writing.trim().split(/\s+/).filter(Boolean);
  const structures = [/[.!?]/, /\b(because|although|however|while|if|when)\b/i, /\b(have|has|had|would|could|should)\b/i];
  const writingPoints = (words.length >= 35 ? 1 : 0) + (structures.filter((rule) => rule.test(writing)).length >= 2 ? 1 : 0);
  const mediationPoints = /\b(yesterday|last)\b/i.test(mediation) && /\b(went|had|was|were|did|bought|met|saw)\b/i.test(mediation) ? 1 : 0;
  const oralWords = oral.trim().split(/\s+/).filter(Boolean);
  const oralPoints = oralWords.length >= 20 && /\b(because|but|so|although|however)\b/i.test(oral) ? 1 : 0;
  return Math.min(4, writingPoints + mediationPoints + oralPoints);
};

export function evaluatePlacement(answers: Record<string, number>, evidence: ProductionEvidence): PlacementResult {
  const bandScores = Object.fromEntries(placementLevels.map((level) => {
    const band = placementItems.filter((item) => item.level === level);
    const right = band.filter((item) => answers[item.id] === item.answer).length;
    return [level, Math.round((right / band.length) * 100)];
  })) as Record<Cefr, number>;
  const bonus = productionBonus(evidence);
  const gates: Record<Cefr, boolean> = {
    A1: bandScores.A1 >= 40,
    A2: bandScores.A1 >= 60 && bandScores.A2 >= 60,
    B1: bandScores.A1 >= 60 && bandScores.A2 >= 60 && bandScores.B1 >= 60,
    B2: bandScores.A2 >= 60 && bandScores.B1 >= 60 && bandScores.B2 >= 60 && bonus >= 2,
    C1: bandScores.B1 >= 60 && bandScores.B2 >= 60 && bandScores.C1 >= 60 && bonus >= 3,
  };
  let suggested: Cefr = "A1";
  for (const level of placementLevels) if (gates[level]) suggested = level;
  const currentIndex = placementLevels.indexOf(suggested);
  const next = placementLevels[currentIndex + 1];
  if (next && bonus >= 3 && bandScores[next] >= 50) suggested = next;
  const correct = placementItems.filter((item) => answers[item.id] === item.answer).length;
  const answered = Object.keys(answers).length;
  const nextBand = placementLevels[placementLevels.indexOf(suggested) + 1];
  const boundary = nextBand && bandScores[nextBand] >= 40 ? nextBand : undefined;
  return {
    suggested,
    bandScores,
    totalPercent: Math.round((correct / placementItems.length) * 100),
    confidence: answered < placementItems.length ? "da approfondire" : boundary ? "media" : "alta",
    boundary,
  };
}
