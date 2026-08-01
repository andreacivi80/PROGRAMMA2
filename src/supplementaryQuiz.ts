import { detailedChoice, optionCountForLevel, type Choice, type MobileUnit } from "./curriculum";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const clean = (value: string) => value.trim().replace(/\s+/g, " ");

function optionsFor(correct: string, alternatives: string[], size: number) {
  const optionKey = (value: string) => clean(value).toLocaleLowerCase("en").replace(/[^a-z0-9à-ÿ' ]+/g, " ").replace(/\s+/g, " ").trim();
  const normalizedCorrect = optionKey(correct);
  const unique = new Map<string, string>();
  alternatives.map(clean).filter(Boolean).forEach(value => {
    const key = optionKey(value);
    if (key !== normalizedCorrect && !unique.has(key)) unique.set(key, value);
  });
  const closest = [...unique.values()]
    .sort((left, right) => Math.abs(left.length - correct.length) - Math.abs(right.length - correct.length))
    .slice(0, size - 1);
  const wrong = shuffle(closest);
  const answer = Math.floor(Math.random() * Math.min(size, wrong.length + 1));
  const options = [...wrong];
  options.splice(answer, 0, clean(correct));
  return { options, answer };
}

function rotatedSentences(sentence: string) {
  const words = clean(sentence).split(" ");
  if (words.length < 3) return [`${sentence} now`, `Now ${sentence}`, `${sentence} already`, `Usually ${sentence}`];
  const first = [words[1], words[0], ...words.slice(2)].join(" ");
  const pivot = Math.max(1, Math.floor(words.length / 2));
  const second = [...words.slice(pivot), ...words.slice(0, pivot)].join(" ");
  const third = [words.at(-1), ...words.slice(0, -1)].join(" ");
  const fourth = [...words.slice(0, -2), words.at(-1), words.at(-2)].join(" ");
  return [first, second, third, fourth];
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
  return [...new Set([...variants, ...rotatedSentences(sentence)])].filter(value => value !== sentence).slice(0, 6);
}

function meaningMistakes(sentence: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bcan\b/i, "cannot"], [/\bcannot\b/i, "can"], [/\bwill\b/i, "will not"],
    [/\bmore\b/i, "less"], [/\bless\b/i, "more"], [/\bfirst\b/i, "last"],
    [/\bsupport\b/i, "oppose"], [/\bimproved\b/i, "declined"], [/\bavailable\b/i, "unavailable"],
    [/\bsame\b/i, "different"], [/\bincreased\b/i, "decreased"], [/\baccept\b/i, "reject"],
  ];
  const variants = replacements.filter(([pattern]) => pattern.test(sentence)).map(([pattern, replacement]) => sentence.replace(pattern, replacement));
  return [...new Set([...variants, ...grammarMistakes(sentence)])];
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

export function supplementaryFamily(question: Choice) {
  return clean(question.prompt).split("·")[0].trim().toLocaleLowerCase("it");
}

function diversifyFamilies(questions: Choice[]) {
  const buckets = new Map<string, Choice[]>();
  questions.forEach(question => {
    const family = supplementaryFamily(question), bucket = buckets.get(family) ?? [];
    bucket.push(question);
    buckets.set(family, bucket);
  });
  buckets.forEach((bucket, family) => buckets.set(family, shuffle(bucket)));
  const result: Choice[] = [];
  let previous = "";
  while ([...buckets.values()].some(bucket => bucket.length)) {
    const families = shuffle([...buckets.keys()].filter(family => buckets.get(family)?.length));
    if (families.length > 1 && families[0] === previous) families.push(families.shift()!);
    for (const family of families) {
      const question = buckets.get(family)?.shift();
      if (question) { result.push(question); previous = family; }
    }
  }
  return result;
}

export function supplementaryBankFor(unit: MobileUnit): Choice[] {
  const bank: Choice[] = [];
  const optionCount = optionCountForLevel(unit.cefr);
  const vocabularyExamples = unit.vocabulary.map(word => word.example);
  const vocabularyMeanings = unit.vocabulary.map(word => word.it);
  const grammarExamples = unit.grammar.examples.map(example => example.en);

  unit.vocabulary.forEach(word => {
    bank.push({
      prompt: `Uso nel contesto · In quale frase “${word.en}” è usato in modo naturale?`,
      ...optionsFor(word.example, vocabularyExamples, optionCount),
      explanationIt: `Nel contesto della lezione: ${word.example} “${word.en}” significa «${word.it}».`,
    });
    bank.push({
      prompt: `Collegamento rapido · Quale significato appartiene a “${word.en}”?`,
      ...optionsFor(word.it, vocabularyMeanings, optionCount),
      explanationIt: `Il collegamento corretto è ${word.en} = ${word.it}. Ora prova a riutilizzarlo in una frase tua.`,
    });
  });

  unit.grammar.examples.forEach((example, index) => {
    bank.push({
      prompt: `Ricostruzione ${index + 1} · Quale sequenza esprime correttamente «${example.it}»?`,
      ...optionsFor(example.en, [...grammarMistakes(example.en), ...grammarExamples], optionCount),
      explanationIt: `${example.en} ${example.noteIt}`,
    });
    bank.push({
      prompt: `Controllo qualità ${index + 1} · Quale versione mantiene grammatica e ordine corretti?`,
      ...optionsFor(example.en, [...grammarMistakes(example.en), ...grammarExamples], optionCount),
      explanationIt: `${example.en} ${example.noteIt}`,
    });
    bank.push({
      prompt: `Dalla frase alla spiegazione · Quale osservazione descrive meglio “${example.en}”?`,
      ...optionsFor(example.noteIt, [...unit.grammar.examples.map(item => item.noteIt), ...unit.grammar.explanationIt, ...unit.grammar.formulas], optionCount),
      explanationIt: `${example.noteIt} La frase corretta è: ${example.en}`,
    });
  });

  const listeningLines = dialogueLines(unit.listening.transcript);
  listeningLines.slice(0, 5).forEach((line, index) => {
    bank.push({
      prompt: `Riconoscimento attivo ${index + 1} · Quale battuta appartiene davvero al dialogo della lezione?`,
      ...optionsFor(line, [...meaningMistakes(line), ...listeningLines, ...grammarExamples, ...vocabularyExamples], optionCount),
      explanationIt: `La battuta presente nel dialogo è: “${line}”.`,
    });
  });

  bank.push({
    prompt: `Produzione orale · Quale versione conserva l’ordine naturale della frase da ripetere?`,
    ...optionsFor(unit.speaking.target, [...rotatedSentences(unit.speaking.target), ...grammarExamples], optionCount),
    explanationIt: `La sequenza naturale è: ${unit.speaking.target}`,
  });
  bank.push({
    prompt: `Pronuncia e struttura · Quale frase useresti come modello completo?`,
    ...optionsFor(unit.speaking.target, [...grammarExamples, ...vocabularyExamples], optionCount),
    explanationIt: `Il modello previsto per questa lezione è: ${unit.speaking.target}`,
  });

  return [...new Map(bank.map(question => [supplementaryFingerprint(question), detailedChoice(question)])).values()];
}

export function buildSupplementaryQuiz(unit: MobileUnit, count: number, excluded: string[] = []) {
  const bank = supplementaryBankFor(unit);
  const excludedSet = new Set(excluded);
  const unseen = shuffle(bank.filter(question => !excludedSet.has(supplementaryFingerprint(question))));
  const fallback = shuffle(bank.filter(question => excludedSet.has(supplementaryFingerprint(question))));
  return [...diversifyFamilies(unseen), ...diversifyFamilies(fallback)].slice(0, Math.min(count, bank.length));
}
