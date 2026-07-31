export function analyzeLocalWriting(text: string, target = "") {
  const original = text.trim(), notes: string[] = [];
  let corrected = original;
  const fix = (pattern: RegExp, replacement: string | ((substring: string, ...args: string[]) => string), note: string) => {
    if (!pattern.test(corrected)) return;
    corrected = corrected.replace(pattern, replacement as string);
    notes.push(note);
  };
  if (original && !/^[A-Z]/.test(original)) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    notes.push("La frase inglese inizia con la maiuscola.");
  }
  if (original && !/[.!?]$/.test(original)) {
    corrected += ".";
    notes.push("Ho aggiunto la punteggiatura finale.");
  }
  fix(/\bI am agree\b/gi, "I agree", "Agree è un verbo: si dice I agree, senza am.");
  fix(/\bpeople is\b/gi, "people are", "People è plurale e richiede are.");
  fix(/\bI have (\d+) years(?: old)?\b/gi, "I am $1 years old", "Per l'età l'inglese usa be: I am ... years old.");
  fix(/\binformations\b/gi, "information", "Information è non numerabile e non prende -s.");
  fix(/\bdepend of\b/gi, "depend on", "La collocazione corretta è depend on.");
  fix(/\bmarried with\b/gi, "married to", "La collocazione corretta è married to.");
  fix(/\bsince (\d+) years\b/gi, "for $1 years", "Usa for con una durata; since introduce il punto iniziale.");
  fix(/\ba (hour|honest|honour|honor|heir)\b/gi, "an $1", "Hour, honest, honour e heir iniziano con un suono vocalico: usa an.");
  fix(/\ba ((?!(?:university|user|useful|usual|unit|uniform|unique|european|one|once)\b)[aeiou]\w*)\b/gi, "an $1", "Davanti a un suono vocalico usa normalmente an.");
  fix(/\ban (university|user|useful|usual|unit|uniform|unique|european|one|once)\b/gi, "a $1", "Qui la parola inizia con un suono consonantico: usa a.");
  fix(/\bi\b/g, "I", "Il pronome personale I si scrive sempre con la maiuscola.");
  fix(/\b(dont|doesnt|didnt|cant|wont|isnt|arent)\b/gi, match => ({ dont: "don't", doesnt: "doesn't", didnt: "didn't", cant: "can't", wont: "won't", isnt: "isn't", arent: "aren't" }[match.toLowerCase()] ?? match), "Nelle forme contratte serve l’apostrofo.");
  fix(/\b(he|she|it) don't\b/gi, "$1 doesn't", "Con he, she e it la negativa del Present Simple usa doesn't.");
  const afterDoes: Record<string, string> = { works: "work", lives: "live", speaks: "speak", needs: "need", wants: "want", likes: "like", starts: "start", finishes: "finish", depends: "depend", goes: "go", does: "do", has: "have", studies: "study", tries: "try", watches: "watch" };
  fix(/\bdoesn't\s+(works|lives|speaks|needs|wants|likes|starts|finishes|depends|goes|does|has|studies|tries|watches)\b/gi, (_, verb) => `doesn't ${afterDoes[String(verb).toLowerCase()]}`, "Dopo doesn't il verbo torna alla forma base.");
  fix(/\bmore better\b/gi, "better", "Better è già un comparativo: non aggiungere more.");
  fix(/\bmuch people\b/gi, "many people", "People è numerabile plurale: usa many, non much.");
  fix(/\bthere is\s+([a-z]+s)\b/gi, (match, noun) => `${match[0] === "T" ? "There" : "there"} are ${noun}`, "Con un nome plurale usa there are.");
  const third = /\b(he|she|it)\s+(work|live|speak|need|want|like|start|finish|depend|go|do|have|study|try|watch)\b/gi;
  if (third.test(corrected)) {
    corrected = corrected.replace(third, (_, subject, rawVerb) => {
      const verb = String(rawVerb).toLowerCase(), form = verb === "have" ? "has" : /[^aeiou]y$/.test(verb) ? `${verb.slice(0, -1)}ies` : /(s|sh|ch|x|o)$/.test(verb) ? `${verb}es` : `${verb}s`;
      return `${subject} ${form}`;
    });
    notes.push("Con he, she o it il Present Simple richiede normalmente -s.");
  }
  const past: Record<string, string> = { went: "go", saw: "see", took: "take", came: "come", had: "have", did: "do" },
    didPast = /\bdid\s+(went|saw|took|came|had|did)\b/gi;
  if (didPast.test(corrected)) {
    corrected = corrected.replace(didPast, (_, verb) => `did ${past[String(verb).toLowerCase()]}`);
    notes.push("Dopo did usa il verbo base, non la forma passata.");
  }
  if (/\s{2,}/.test(corrected)) {
    corrected = corrected.replace(/\s{2,}/g, " ");
    notes.push("Ho eliminato gli spazi doppi.");
  }
  if (target && !notes.length) notes.push(`Non vedo errori tra quelli controllabili offline. Struttura da confrontare: ${target}`);
  return { corrected, notes };
}
