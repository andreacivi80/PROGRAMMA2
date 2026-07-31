import { detailedChoice, type Choice, type MobileUnit } from "./curriculum";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const clean = (value: string) => value.trim().replace(/\s+/g, " ");

function optionsFor(correct: string, alternatives: string[]) {
  const wrong = shuffle([...new Set(alternatives.map(clean).filter(value => value && value !== clean(correct)))]).slice(0, 2);
  while (wrong.length < 2) wrong.push(wrong.length ? "A different structure" : "None of these");
  const answer = Math.floor(Math.random() * 3);
  const options = [...wrong];
  options.splice(answer, 0, clean(correct));
  return { options, answer };
}

function rotatedSentences(sentence: string) {
  const words = clean(sentence).split(" ");
  if (words.length < 3) return [`${sentence} now`, `Now ${sentence}`];
  const first = [words[1], words[0], ...words.slice(2)].join(" ");
  const pivot = Math.max(1, Math.floor(words.length / 2));
  const second = [...words.slice(pivot), ...words.slice(0, pivot)].join(" ");
  return [first, second];
}

function grammarMistakes(sentence: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bam\b/i, "is"],
    [/\bis\b/i, "are"],
    [/\bare\b/i, "is"],
    [/\bwas\b/i, "were"],
    [/\bwere\b/i, "was"],
    [/\bhas\b/i, "have"],
    [/\bhave\b/i, "has"],
    [/\bdoes\b/i, "do"],
    [/\bdo\b/i, "does"],
    [/\bdid\b/i, "does"],
    [/\bcan\b/i, "cans"],
    [/\bwill\b/i, "will to"],
    [/\bwould\b/i, "would to"],
    [/\ba\b/i, "an"],
    [/\ban\b/i, "a"],
  ];
  const variants = replacements
    .filter(([pattern]) => pattern.test(sentence))
    .map(([pattern, replacement]) => sentence.replace(pattern, replacement));
  return [...new Set([...variants, ...rotatedSentences(sentence)])].filter(value => value !== sentence).slice(0, 3);
}

function dialogueLines(transcript: string) {
  const speakerParts = transcript
    .split(/\b[A-Za-z][A-Za-z ]{0,18}:\s*/)
    .map(clean)
    .filter(value => value.split(" ").length >= 3);
  if (speakerParts.length >= 2) return speakerParts;
  return transcript.split(/(?<=[.!?])\s+/).map(clean).filter(value => value.split(" ").length >= 3);
}

export function supplementaryFingerprint(question: Choice) {
  return `${clean(question.prompt).toLowerCase()}|${clean(question.options[question.answer]).toLowerCase()}`;
}

export function supplementaryBankFor(unit: MobileUnit): Choice[] {
  const bank: Choice[] = [];
  const vocabularyExamples = unit.vocabulary.map(word => word.example);
  const vocabularyMeanings = unit.vocabulary.map(word => word.it);
  const grammarExamples = unit.grammar.examples.map(example => example.en);

  unit.vocabulary.forEach(word => {
    bank.push({
      prompt: `Uso nel contesto · In quale frase “${word.en}” è usato in modo naturale?`,
      ...optionsFor(word.example, vocabularyExamples),
      explanationIt: `Nel contesto della lezione: ${word.example} “${word.en}” significa «${word.it}».`,
    });
    bank.push({
      prompt: `Collegamento rapido · Quale significato appartiene a “${word.en}”?`,
      ...optionsFor(word.it, vocabularyMeanings),
      explanationIt: `Il collegamento corretto è ${word.en} = ${word.it}. Ora prova a riutilizzarlo in una frase tua.`,
    });
  });

  unit.grammar.examples.forEach((example, index) => {
    bank.push({
      prompt: `Ricostruzione ${index + 1} · Quale sequenza esprime correttamente «${example.it}»?`,
      ...optionsFor(example.en, rotatedSentences(example.en)),
      explanationIt: `${example.en} ${example.noteIt}`,
    });
    bank.push({
      prompt: `Controllo qualità ${index + 1} · Quale versione mantiene grammatica e ordine corretti?`,
      ...optionsFor(example.en, grammarMistakes(example.en)),
      explanationIt: `${example.en} ${example.noteIt}`,
    });
    bank.push({
      prompt: `Dalla frase alla spiegazione · Quale osservazione descrive meglio “${example.en}”?`,
      ...optionsFor(example.noteIt, unit.grammar.examples.map(item => item.noteIt)),
      explanationIt: `${example.noteIt} La frase corretta è: ${example.en}`,
    });
  });

  const listeningLines = dialogueLines(unit.listening.transcript);
  listeningLines.slice(0, 5).forEach((line, index) => {
    bank.push({
      prompt: `Riconoscimento attivo ${index + 1} · Quale battuta appartiene davvero al dialogo della lezione?`,
      ...optionsFor(line, [...grammarExamples, ...vocabularyExamples]),
      explanationIt: `La battuta presente nel dialogo è: “${line}”.`,
    });
  });

  bank.push({
    prompt: `Produzione orale · Quale versione conserva l’ordine naturale della frase da ripetere?`,
    ...optionsFor(unit.speaking.target, rotatedSentences(unit.speaking.target)),
    explanationIt: `La sequenza naturale è: ${unit.speaking.target}`,
  });
  bank.push({
    prompt: `Pronuncia e struttura · Quale frase useresti come modello completo?`,
    ...optionsFor(unit.speaking.target, [...grammarExamples, ...vocabularyExamples]),
    explanationIt: `Il modello previsto per questa lezione è: ${unit.speaking.target}`,
  });

  return [...new Map(bank.map(question => [supplementaryFingerprint(question), detailedChoice(question)])).values()];
}

export function buildSupplementaryQuiz(unit: MobileUnit, count: number, excluded: string[] = []) {
  const bank = supplementaryBankFor(unit);
  const excludedSet = new Set(excluded);
  const unseen = shuffle(bank.filter(question => !excludedSet.has(supplementaryFingerprint(question))));
  const fallback = shuffle(bank.filter(question => excludedSet.has(supplementaryFingerprint(question))));
  return [...unseen, ...fallback].slice(0, Math.min(count, bank.length));
}
