export type WritingCategory = "Grammatica" | "Ortografia" | "Chiarezza" | "Lessico";
export type WritingIssue = {
  category: WritingCategory;
  severity: "alta" | "media" | "bassa";
  original: string;
  replacement: string;
  explanation: string;
};

export type WritingAnalysis = {
  corrected: string;
  notes: string[];
  issues: WritingIssue[];
  suggestions: string[];
  scores: Record<WritingCategory | "Totale", number>;
  wordCount: number;
};

export function analyzeLocalWriting(text: string, target = ""): WritingAnalysis {
  const original = text.trim();
  let corrected = original;
  const issues: WritingIssue[] = [], suggestions: string[] = [];
  const addIssue = (category: WritingCategory, severity: WritingIssue["severity"], before: string, after: string, explanation: string) => {
    issues.push({ category, severity, original: before, replacement: after, explanation });
  };
  const fix = (
    pattern: RegExp,
    replacement: string | ((substring: string, ...args: string[]) => string),
    category: WritingCategory,
    severity: WritingIssue["severity"],
    explanation: string,
  ) => {
    pattern.lastIndex = 0;
    const match = pattern.exec(corrected);
    pattern.lastIndex = 0;
    if (!match) return;
    const before = match[0], next = corrected.replace(pattern, replacement as string);
    const afterSlice = next.slice(match.index, match.index + Math.max(1, before.length + 12)).split(/(?<=[.!?])\s|,/)[0].trim();
    corrected = next;
    addIssue(category, severity, before, afterSlice || "forma corretta", explanation);
  };

  if (original && !/^[A-Z]/.test(original)) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    addIssue("Ortografia", "bassa", original.charAt(0), corrected.charAt(0), "La frase inglese inizia con la maiuscola.");
  }
  if (original && !/[.!?]$/.test(original)) {
    corrected += ".";
    addIssue("Chiarezza", "bassa", "fine senza segno", ".", "Ho aggiunto la punteggiatura finale.");
  }

  const spellings: Record<string, string> = { becouse: "because", wich: "which", recieve: "receive", recieved: "received", seperate: "separate", thier: "their", freind: "friend", adress: "address", enviroment: "environment", goverment: "government", definately: "definitely" };
  fix(/\b(becouse|wich|recieve|recieved|seperate|thier|freind|adress|enviroment|goverment|definately)\b/gi, match => spellings[match.toLowerCase()] ?? match, "Ortografia", "media", "Correggi l’ortografia della parola evidenziata.");
  fix(/\bI am agree\b/gi, "I agree", "Grammatica", "alta", "Agree è un verbo: si dice I agree, senza am.");
  fix(/\bpeople is\b/gi, match => `${match[0] === "P" ? "People" : "people"} are`, "Grammatica", "alta", "People è plurale e richiede are.");
  fix(/\bI have (\d+) years(?: old)?\b/gi, "I am $1 years old", "Grammatica", "alta", "Per l’età l’inglese usa be: I am ... years old.");
  fix(/\binformations\b/gi, "information", "Lessico", "media", "Information è non numerabile e non prende -s.");
  fix(/\b(advices|equipments|furnitures|knowledges)\b/gi, match => ({ advices: "advice", equipments: "equipment", furnitures: "furniture", knowledges: "knowledge" })[match.toLowerCase()] ?? match, "Lessico", "media", "Questo nome è normalmente non numerabile in inglese.");
  fix(/\bdepends? of\b/gi, match => /^depends/i.test(match) ? "depends on" : "depend on", "Lessico", "media", "La collocazione corretta è depend on.");
  fix(/\bmarried with\b/gi, "married to", "Lessico", "media", "La collocazione corretta è married to.");
  fix(/\binterested on\b/gi, "interested in", "Lessico", "media", "La collocazione corretta è interested in.");
  fix(/\bgood in\b/gi, "good at", "Lessico", "media", "Per indicare abilità si usa good at.");
  fix(/\bsince (\d+) years\b/gi, "for $1 years", "Grammatica", "alta", "Usa for con una durata; since introduce il punto iniziale.");
  fix(/\ba (hour|honest|honour|honor|heir)\b/gi, "an $1", "Grammatica", "media", "Davanti a un suono vocalico usa an.");
  fix(/\ba ((?!(?:university|user|useful|usual|unit|uniform|unique|european|one|once)\b)[aeiou]\w*)\b/gi, "an $1", "Grammatica", "media", "Davanti a un suono vocalico usa normalmente an.");
  fix(/\ban (university|user|useful|usual|unit|uniform|unique|european|one|once)\b/gi, "a $1", "Grammatica", "media", "Qui la parola inizia con un suono consonantico: usa a.");
  fix(/\bi\b/g, "I", "Ortografia", "media", "Il pronome personale I si scrive sempre con la maiuscola.");
  fix(/\b(dont|doesnt|didnt|cant|wont|isnt|arent|havent|hasnt)\b/gi, match => ({ dont: "don't", doesnt: "doesn't", didnt: "didn't", cant: "can't", wont: "won't", isnt: "isn't", arent: "aren't", havent: "haven't", hasnt: "hasn't" })[match.toLowerCase()] ?? match, "Ortografia", "media", "Nelle forme contratte serve l’apostrofo.");
  fix(/\b(he|she|it) don't\b/gi, "$1 doesn't", "Grammatica", "alta", "Con he, she e it la negativa del Present Simple usa doesn't.");
  fix(/\b(I)\s+(is|are)\b/g, "$1 am", "Grammatica", "alta", "Con I il presente di be è am.");
  fix(/\b(you|we|they)\s+is\b/gi, "$1 are", "Grammatica", "alta", "Con you, we e they il presente di be è are.");
  fix(/\b(he|she|it)\s+are\b/gi, "$1 is", "Grammatica", "alta", "Con he, she e it il presente di be è is.");
  fix(/\b(I|you|we|they)\s+has\b/gi, "$1 have", "Grammatica", "alta", "Con I, you, we e they usa have.");
  fix(/\b(he|she|it)\s+have\b/gi, "$1 has", "Grammatica", "alta", "Con he, she e it usa has.");
  const afterDoes: Record<string, string> = { works: "work", lives: "live", speaks: "speak", needs: "need", wants: "want", likes: "like", starts: "start", finishes: "finish", depends: "depend", goes: "go", does: "do", has: "have", studies: "study", tries: "try", watches: "watch" };
  fix(/\bdoesn't\s+(works|lives|speaks|needs|wants|likes|starts|finishes|depends|goes|does|has|studies|tries|watches)\b/gi, (_, verb) => `doesn't ${afterDoes[String(verb).toLowerCase()]}`, "Grammatica", "alta", "Dopo doesn't il verbo torna alla forma base.");
  fix(/\b(can|could|should|would|must|may|might)\s+(goes|works|lives|speaks|needs|wants|likes|starts|finishes|does|has)\b/gi, (_, modal, verb) => `${modal} ${afterDoes[String(verb).toLowerCase()] ?? String(verb).replace(/s$/i, "")}`, "Grammatica", "alta", "Dopo un verbo modale usa la forma base.");
  fix(/\b(I)\s+(working|studying|going|doing|speaking|writing|reading)\b/g, "$1 am $2", "Grammatica", "alta", "Il Present Continuous richiede be prima della forma in -ing.");
  fix(/\b(he|she|it)\s+(working|studying|going|doing|speaking|writing|reading)\b/gi, "$1 is $2", "Grammatica", "alta", "Il Present Continuous richiede be prima della forma in -ing.");
  fix(/\b(you|we|they)\s+(working|studying|going|doing|speaking|writing|reading)\b/gi, "$1 are $2", "Grammatica", "alta", "Il Present Continuous richiede be prima della forma in -ing.");
  fix(/\bmore better\b/gi, "better", "Grammatica", "media", "Better è già un comparativo: non aggiungere more.");
  fix(/\bmuch people\b/gi, "many people", "Grammatica", "media", "People è numerabile plurale: usa many, non much.");
  fix(/\bthere is\s+(people|children|men|women|apples|bananas|oranges|books|cars|students|problems|questions|reasons|options|chairs|tables|keys|documents|results)\b/gi, (match, noun) => `${match[0] === "T" ? "There" : "there"} are ${noun}`, "Grammatica", "alta", "Con un nome plurale usa there are.");
  const third = /\b(he|she|it)\s+(work|live|speak|need|want|like|start|finish|depend|go|do|have|study|try|watch)\b/gi;
  third.lastIndex = 0;
  const thirdMatch = third.exec(corrected);
  third.lastIndex = 0;
  if (thirdMatch) {
    corrected = corrected.replace(third, (_, subject, rawVerb) => {
      const verb = String(rawVerb).toLowerCase(), form = verb === "have" ? "has" : /[^aeiou]y$/.test(verb) ? `${verb.slice(0, -1)}ies` : /(s|sh|ch|x|o)$/.test(verb) ? `${verb}es` : `${verb}s`;
      return `${subject} ${form}`;
    });
    addIssue("Grammatica", "alta", thirdMatch[0], "terza persona corretta", "Con he, she o it il Present Simple richiede normalmente -s.");
  }
  const past: Record<string, string> = { went: "go", saw: "see", took: "take", came: "come", had: "have", did: "do" };
  fix(/\bdid\s+(?:(I|you|he|she|it|we|they)\s+)?(went|saw|took|came|had|did)\b/gi, (match, subject, verb) => `${match[0] === "D" ? "Did" : "did"} ${subject ? `${subject} ` : ""}${past[String(verb).toLowerCase()]}`, "Grammatica", "alta", "Dopo did usa il verbo base, non la forma passata.");
  fix(/\bthere is many people\b/gi, match => match[0] === "T" ? "There are many people" : "there are many people", "Grammatica", "alta", "People è plurale: usa there are many people.");
  fix(/\b(\w+)\s+\1\b/gi, "$1", "Chiarezza", "bassa", "Ho eliminato una parola ripetuta consecutivamente.");
  if (/\s{2,}/.test(corrected)) {
    corrected = corrected.replace(/\s{2,}/g, " ");
    addIssue("Chiarezza", "bassa", "spazi doppi", "spazio singolo", "Ho eliminato gli spazi doppi.");
  }

  const sentences = original.split(/[.!?]+/).map(sentence => sentence.trim()).filter(Boolean);
  if (sentences.some(sentence => sentence.split(/\s+/).length > 28)) suggestions.push("Una frase supera 28 parole: valuta di dividerla in due per renderla più chiara.");
  const contentWords = original.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? [];
  const repeated = [...new Set(contentWords)].find(word => contentWords.filter(candidate => candidate === word).length >= 4);
  if (repeated) suggestions.push(`La parola “${repeated}” ricorre spesso: prova un sinonimo quando il significato lo permette.`);
  void target;

  const penalty = { alta: 10, media: 6, bassa: 2 } as const;
  const categoryScore = (category: WritingCategory) => Math.max(20, 100 - issues.filter(issue => issue.category === category).reduce((sum, issue) => sum + penalty[issue.severity], 0));
  const scores = {
    Grammatica: categoryScore("Grammatica"),
    Ortografia: categoryScore("Ortografia"),
    Chiarezza: Math.max(20, categoryScore("Chiarezza") - suggestions.length * 3),
    Lessico: categoryScore("Lessico"),
    Totale: 0,
  };
  scores.Totale = Math.floor((scores.Grammatica + scores.Ortografia + scores.Chiarezza + scores.Lessico) / 4);
  return { corrected, notes: issues.map(issue => issue.explanation).concat(suggestions), issues, suggestions, scores, wordCount: original ? original.split(/\s+/).filter(Boolean).length : 0 };
}
