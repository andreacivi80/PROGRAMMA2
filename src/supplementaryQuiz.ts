import { detailedChoice, expandChoiceForLevel, optionCountForLevel, type Choice, type MobileUnit } from "./curriculum";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const clean = (value: string) => value.trim().replace(/\s+/g, " ");

export function optionsFor(correct: string, alternatives: string[], size: number) {
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
  if (closest.length < size - 1) {
    throw new Error(`Alternative insufficienti per “${correct}”: richieste ${size - 1}, disponibili ${closest.length}.`);
  }
  const wrong = shuffle(closest);
  const answer = Math.floor(Math.random() * Math.min(size, wrong.length + 1));
  const options = [...wrong];
  options.splice(answer, 0, clean(correct));
  return { options, answer };
}

export function tryOptionsFor(correct: string, alternatives: string[], size: number) {
  for (let candidateSize = size; candidateSize >= 3; candidateSize -= 1) {
    try { return optionsFor(correct, alternatives, candidateSize); }
    catch { /* prova una forma più compatta senza introdurre riempitivi */ }
  }
  return null;
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

export function grammarMistakes(sentence: string) {
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
    [/\bcan\b/i, "can to"],
    [/\bwill\b/i, "will to"],
    [/\bwould\b/i, "would to"],
    [/\ba\b/i, "an"],
    [/\ban\b/i, "a"],
    [/\bto\b/i, "for"],
    [/\bfor\b/i, "since"],
    [/\bsince\b/i, "for"],
    [/\bshould\b/i, "should to"],
    [/\bmust\b/i, "must to"],
    [/\bcould\b/i, "could to"],
  ];
  const variants = replacements
    .filter(([pattern]) => pattern.test(sentence))
    .map(([pattern, replacement]) => sentence.replace(pattern, replacement));
  const missingArticle = sentence.replace(/\b(a|an|the)\s+/i, "");
  const missingAuxiliary = sentence.replace(/\b(am|is|are|was|were|has|have|had|do|does|did|can|will|would|should|could|must)\s+/i, "");
  const doubledAuxiliary = sentence.replace(/\b(am|is|are|was|were|has|have|had|do|does|did|can|will|would|should|could|must)\b/i, "$& $&");
  const wrongSubjectCase = sentence
    .replace(/^I\s+/, "Me ")
    .replace(/^He\s+/, "Him ")
    .replace(/^She\s+/, "Her ")
    .replace(/^We\s+/, "Us ")
    .replace(/^They\s+/, "Them ");
  const missingPreposition = sentence.replace(/\b(at|in|on|to|for|from|with|by)\s+/i, "");
  const wrongThirdPerson = sentence.replace(/\b(he|she|it)\s+([a-z]{4,})s\b/i, "$1 $2");
  const wrongPast = /\b(?:am|is|are|was|were)\b|(?:'m|'re|'s)\b/i.test(sentence) ? sentence : sentence.replace(/\b([a-z]{3,})ed\b/i, "did $1ed");
  const wrongFirstPersonAgreement = sentence.replace(/^I\s+(?!am\b|was\b|have\b|had\b|do\b|did\b|can\b|could\b|will\b|would\b|should\b|must\b)([a-z]{3,})\b/i, "I $1s");
  const wrongTimeMarker = sentence.replace(/\bevery day\b/i, "yesterday").replace(/\btoday\b/i, "last year");
  const closeLexicalStructure = [
    sentence.replace(/\bmake(s|d)?\s+(a|the)\s+decision\b/i, "do$1 $2 decision"),
    sentence.replace(/\ba turning point\b/i, "the turning point"),
    sentence.replace(/\bcall it a day\b/i, "call it the day"),
    sentence.replace(/\bcall it a day\b/i, "make it a day"),
    sentence.replace(/\ba long shot\b/i, "the long shot"),
    sentence.replace(/\ba long shot\b/i, "a far shot"),
    sentence.replace(/\bImagine you had\b/i, "Imagine you would have"),
    sentence.replace(/\bmade good progress\b/i, "did made good progress"),
    sentence.replace(/\bSend me the figures\b/i, "Send to me the figures"),
    sentence.replace(/\bcouldn’t afford\b/i, "couldn’t to afford"),
    sentence.replace(/\btold me\b/i, "said me"),
    sentence.replace(/\brecommend visiting\b/i, "recommend to visit"),
    sentence.replace(/\bAddress the concern\b/i, "Address to the concern"),
    sentence.replace(/\bregret not applying\b/i, "regret to not applying"),
    sentence.replace(/\bNo worries\b/i, "No worry"),
    sentence.replace(/\bThe evidence looks\b/i, "The evidence is look"),
    sentence.replace(/\bThe distinction requires\b/i, "The distinction is require"),
    sentence.replace(/\bThe structure emphasises\b/i, "The structure is emphasise"),
    sentence.replace(/\bThe framing influences\b/i, "The framing is influence"),
    sentence.replace(/\bThe assumption requires\b/i, "The assumption is require"),
    sentence.replace(/\bThe speaker qualifies\b/i, "The speaker is qualify"),
    sentence.replace(/\bThey diverge\b/i, "They are diverge"),
    sentence.replace(/\bIf I had more time\b/i, "If I would have more time"),
    sentence.replace(/\ba neighbourhood where\b/i, "a neighbourhood which"),
    sentence.replace(/\bcost remains a concern\b/i, "cost remain a concern"),
    sentence.replace(/\bNo worries\b/i, "Don't worries"),
    sentence.replace(/\bCosts tend to\b/i, "Costs tends to"),
    sentence.replace(/\binvolves a trade-off\b/i, "involves to a trade-off"),
  ];
  return [...new Set([...variants, missingArticle, missingAuxiliary, doubledAuxiliary, wrongSubjectCase, missingPreposition, wrongThirdPerson, wrongPast, wrongFirstPersonAgreement, wrongTimeMarker, ...closeLexicalStructure])]
    .filter(value => value && value !== sentence)
    .slice(0, 8);
}

const closeGrammarForms: Record<string, string[]> = {
  "'ll": ["will", "would", "'d", "wouldn't"],
  a: ["an", "the", "some", "any"], an: ["a", "the", "some", "any"],
  am: ["is", "are", "be", "was"], is: ["are", "was", "be", "has"], are: ["is", "were", "be", "have"],
  was: ["were", "is", "be", "has"], were: ["was", "are", "be", "had"],
  do: ["does", "did", "doing", "done"], does: ["do", "did", "doing", "done"], did: ["do", "does", "done", "doing"],
  have: ["has", "had", "having", "be"], has: ["have", "had", "having", "is"], had: ["have", "has", "having", "did"],
  be: ["been", "being", "is", "was"], been: ["be", "being", "was", "gone"],
  can: ["could", "will", "should", "must"], could: ["can", "would", "should", "must"],
  will: ["would", "can", "should", "must"], would: ["will", "could", "should", "must"],
  should: ["must", "could", "would", "will"], must: ["should", "have to", "could", "can"],
  for: ["since", "during", "from", "ago"], since: ["for", "during", "from", "ago"],
  ever: ["even", "every", "over", "never"], never: ["ever", "not ever", "no ever", "none"],
  already: ["all ready", "ready", "earlier", "yet"], yet: ["still", "already", "ever", "yesterday"],
  ago: ["since", "for", "before", "during"], just: ["yet", "ever", "never", "recently"],
};

const verifiedVerbForms: Record<string, string[]> = {
  works: ["work", "worked", "working"], drink: ["drank", "drinks", "drinking", "drunk"],
  help: ["helped", "helps", "helping"], sing: ["sang", "sings", "singing", "sung"],
  work: ["worked", "works", "working"], working: ["work", "worked", "works"],
  speak: ["spoke", "speaks", "speaking", "spoken"], went: ["go", "goes", "going", "gone"],
  receive: ["received", "receives", "receiving"], going: ["go", "went", "goes", "gone"],
  seeing: ["see", "saw", "sees", "seen"], park: ["parked", "parks", "parking"],
  took: ["take", "takes", "taking", "taken"], like: ["liked", "likes", "liking"],
  touch: ["touched", "touches", "touching"], see: ["saw", "sees", "seeing", "seen"],
  take: ["took", "takes", "taking", "taken"], get: ["got", "gets", "getting", "gotten"],
  calls: ["call", "called", "calling"], leave: ["left", "leaves", "leaving"],
  call: ["called", "calls", "calling"], eaten: ["eat", "ate", "eats", "eating"],
  visited: ["visit", "visits", "visiting"], finished: ["finish", "finishes", "finishing"],
  becomes: ["become", "became", "becoming"], sent: ["send", "sends", "sending"],
  meet: ["met", "meets", "meeting"], raises: ["raise", "raised", "raising"],
  raised: ["raise", "raises", "raising"], changed: ["change", "changes", "changing"],
  afford: ["afforded", "affords", "affording"], consider: ["considered", "considers", "considering"],
  improve: ["improved", "improves", "improving"], manufacture: ["manufactured", "manufactures", "manufacturing"],
  deliver: ["delivered", "delivers", "delivering"], approve: ["approved", "approves", "approving"],
  announce: ["announced", "announces", "announcing"], claim: ["claimed", "claims", "claiming"],
  admit: ["admitted", "admits", "admitting"], warn: ["warned", "warns", "warning"],
  promise: ["promised", "promises", "promising"], survey: ["surveyed", "surveys", "surveying"],
  concern: ["concerned", "concerns", "concerning"], passed: ["pass", "passes", "passing"],
  checked: ["check", "checks", "checking"], meeting: ["meet", "met", "meets"],
  let: ["lets", "letting", "leave", "tell"], hold: ["held", "holds", "holding"],
  increased: ["increase", "increases", "increasing"], saved: ["save", "saves", "saving"],
  regret: ["regretted", "regrets", "regretting"], assume: ["assumed", "assumes", "assuming"],
  renovate: ["renovated", "renovates", "renovating"], estimate: ["estimated", "estimates", "estimating"],
  commission: ["commissioned", "commissions", "commissioning"], compromise: ["compromised", "compromises", "compromising"],
  counteroffer: ["counteroffered", "counteroffers", "counteroffering"], emphasise: ["emphasised", "emphasises", "emphasising", "emphasis"],
  emphasises: ["emphasise", "emphasised", "emphasising", "emphasis"], focus: ["focused", "focuses", "focusing", "focal"],
  underlying: ["underlie", "underlay", "underlies", "underlain"], framing: ["frame", "framed", "frames", "framework"],
  allege: ["alleged", "alleges", "alleging", "allegation"], alleged: ["allege", "alleges", "alleging", "allegation"],
  concede: ["conceded", "concedes", "conceding", "concession"], conceded: ["concede", "concedes", "conceding", "concession"],
  portray: ["portrayed", "portrays", "portraying", "portrayal"], portrayed: ["portray", "portrays", "portraying", "portrayal"],
  endorse: ["endorsed", "endorses", "endorsing", "endorsement"], qualify: ["qualified", "qualifies", "qualifying", "qualification"],
  qualified: ["qualify", "qualifies", "qualifying", "qualification"], converge: ["converged", "converges", "converging", "convergence"],
  converges: ["converge", "converged", "converging", "convergence"], diverge: ["diverged", "diverges", "diverging", "divergence"],
  diverges: ["diverge", "diverged", "diverging", "divergence"],
};

export function plausibleClozeDistractors(correct: string, nearby: string[] = []) {
  const value = clean(correct), lower = value.toLocaleLowerCase("en"), curated = closeGrammarForms[lower];
  void nearby;
  if (curated) return curated;
  return verifiedVerbForms[lower] ?? [];
}

export function meaningMistakes(sentence: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bcan\b/i, "cannot"], [/\bcannot\b/i, "can"], [/\bwill\b/i, "will not"],
    [/\bmore\b/i, "less"], [/\bless\b/i, "more"], [/\bfirst\b/i, "last"],
    [/\bsupport\b/i, "oppose"], [/\bimproved\b/i, "declined"], [/\bavailable\b/i, "unavailable"],
    [/\bsame\b/i, "different"], [/\bincreased\b/i, "decreased"], [/\baccept\b/i, "reject"],
    [/\bof course\b/i, "of course not"], [/\bof course\b/i, "probably not"],
    [/\bof course\b/i, "I'm afraid not"], [/\bof course\b/i, "perhaps later"],
    [/\byes\b/i, "no"], [/\bno\b/i, "yes"],
    [/\bagree\b/i, "disagree"], [/\bpossible\b/i, "impossible"], [/\balways\b/i, "never"],
    [/\bone\b/i, "two"], [/\btwo\b/i, "three"], [/\bthree\b/i, "four"],
    [/\bfour\b/i, "five"], [/\bfive\b/i, "six"], [/\bsix\b/i, "seven"],
    [/\bseven\b/i, "eight"], [/\beight\b/i, "nine"], [/\bnine\b/i, "ten"],
  ];
  const variants = replacements.filter(([pattern]) => pattern.test(sentence)).map(([pattern, replacement]) => sentence.replace(pattern, replacement));
  return [...new Set([...variants, ...grammarMistakes(sentence)])];
}

function plausibleGeneratedAlternative(value: string) {
  const normalized = clean(value).toLocaleLowerCase("en").replace(/[’]/g, "'");
  if (/\b(\w+)(?:\s+\1){2,}\b/i.test(normalized)) return false;
  if (/\b(?:me|him|her|us|them)'(?:m|re|s)\b/i.test(normalized)) return false;
  if (/\b(?:wass|focu|unles|progres)\b/i.test(normalized)) return false;
  return true;
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
    const available = [...buckets.keys()].filter(family => buckets.get(family)?.length);
    const alternatives = available.filter(family => family !== previous);
    const candidates = alternatives.length ? alternatives : available;
    const largest = Math.max(...candidates.map(family => buckets.get(family)!.length));
    const family = shuffle(candidates.filter(value => buckets.get(value)!.length === largest))[0];
    const question = buckets.get(family)?.shift();
    if (question) { result.push(question); previous = family; }
  }
  return result;
}

const curatedSupplementaryByUnit: Record<string, Choice[]> = {
  "a1-be-introductions": [
    { prompt: "Presentarsi · Quale domanda chiede correttamente il nome?", options: ["What is your name?", "What are your name?", "What your name is?"], answer: 0, explanationIt: "La domanda corretta è What is your name?: parola interrogativa + is + soggetto." },
  ],
  "a1-some-any": [
    { prompt: "Scelta nel contesto · We haven't got ___ milk.", options: ["some", "any", "a"], answer: 1, explanationIt: "Nella frase negativa con un nome non numerabile si usa any: We haven't got any milk." },
    { prompt: "Scelta nel contesto · Would you like ___ coffee?", options: ["some", "any", "an"], answer: 0, explanationIt: "Nelle offerte cortesi si usa normalmente some: Would you like some coffee?" },
    { prompt: "Scelta nel contesto · Are there ___ clean glasses?", options: ["some", "any", "a"], answer: 1, explanationIt: "In una domanda neutra si usa any: Are there any clean glasses?" },
    { prompt: "Scelta nel contesto · There are ___ biscuits on the table.", options: ["some", "any", "an"], answer: 0, explanationIt: "In questa affermativa si usa some: There are some biscuits on the table." },
  ],
  "b2-spoken-nuance": [
    { prompt: "Intenzione · Quale risposta chiarisce che l'azione non era voluta?", options: ["I didn't mean to.", "I wouldn't mind.", "I don't mean it.", "I wasn't meant for it."], answer: 0, explanationIt: "I didn't mean to significa che l'azione è avvenuta, ma non era intenzionale." },
    { prompt: "Disponibilità · Quale frase significa che accetti volentieri una proposta?", options: ["I'm up for it.", "I'm over it.", "I'm out of it.", "I'm through with it."], answer: 0, explanationIt: "I'm up for it esprime disponibilità o entusiasmo verso la proposta." },
    { prompt: "Decisione · Quale frase affida la scelta all'altra persona?", options: ["It's up to you.", "It's over you.", "It's through you.", "It's by you."], answer: 0, explanationIt: "It's up to you significa che la decisione spetta all'altra persona." },
    { prompt: "Aggiornamento · Quale ordine delle parole è naturale?", options: ["I'll let you know.", "I'll let know you.", "I'll know you let.", "I'll you let know."], answer: 0, explanationIt: "L'espressione fissa è I'll let you know: let + persona + know." },
  ],
  "b2-slang-phrasal": [
    { prompt: "Phrasal verb nel contesto · The hotel booking fell through. Che cosa è successo?", options: ["The booking failed to happen.", "The booking became cheaper.", "The guests arrived early.", "The hotel changed floors."], answer: 0, explanationIt: "Fall through significa non concretizzarsi: The booking failed to happen." },
  ],
  "b2-uk-us-english": [
    { prompt: "Varietà e chiarezza · Quale coppia indica lo stesso luogo in UK e US English?", options: ["flat / apartment", "queue / vacation", "lift / sidewalk", "holiday / elevator"], answer: 0, explanationIt: "Flat in britannico e apartment in americano indicano entrambi un appartamento." },
    { prompt: "Coerenza editoriale · Quale frase mantiene interamente l'ortografia britannica?", options: ["The organisation analysed the colour samples.", "The organization analysed the color samples.", "The organisation analyzed the color samples.", "The organization analyzed the colour samples."], answer: 0, explanationIt: "Organisation, analysed e colour appartengono tutte alla convenzione ortografica britannica." },
  ],
  "c1-discourse-cohesion": [
    { prompt: "Coesione · Quale connettivo introduce un contrasto inatteso senza creare una subordinata?", options: ["nevertheless", "therefore", "moreover", "consequently", "similarly"], answer: 0, explanationIt: "Nevertheless introduce un contrasto rispetto all'idea precedente e funziona come avverbio connettivo." },
  ],
  "c1-academic-argument": [
    { prompt: "Argomentazione · Quale formulazione distingue con precisione correlazione e causalità?", options: ["The findings indicate an association but do not establish causation.", "The findings prove that one factor necessarily caused the other.", "The findings make correlation identical to causation.", "The findings exclude every possible confounding variable.", "The findings guarantee the same result in every population."], answer: 0, explanationIt: "Indicate an association but do not establish causation formula una conclusione prudente e metodologicamente corretta." },
  ],
  "c1-idiom-register": [
    { prompt: "Registro · In un rapporto formale, quale alternativa sostituisce meglio “the plan didn't cut the mustard”?", options: ["the plan proved inadequate", "the plan was gutted", "the plan was a long shot", "the plan felt sketchy", "the plan broke the ice"], answer: 0, explanationIt: "The plan proved inadequate conserva il significato in un registro formale." },
    { prompt: "Significato · Dopo il rifiuto della proposta, Maya said she was “gutted”. Come si sentiva?", options: ["deeply disappointed", "physically exhausted", "mildly amused", "completely indifferent", "cautiously optimistic"], answer: 0, explanationIt: "In inglese informale britannico gutted significa profondamente deluso." },
    { prompt: "Probabilità · Quale espressione indica un tentativo con poche possibilità di successo?", options: ["a long shot", "a done deal", "a safe bet", "a foregone conclusion", "a level playing field"], answer: 0, explanationIt: "A long shot è una possibilità remota; le altre espressioni suggeriscono certezza, equità o alta probabilità." },
    { prompt: "Uso controllato · Quale frase usa “sketchy” nel senso di poco affidabile?", options: ["The evidence looks sketchy.", "The evidence looks exhaustive.", "The evidence looks conclusive.", "The evidence looks transparent.", "The evidence looks independently verified."], answer: 0, explanationIt: "Sketchy descrive informazioni incomplete, dubbie o poco affidabili." },
  ],
  "c1-uk-us-nuance": [
    { prompt: "Data ambigua · Quale riscrittura elimina ogni dubbio su 06/07?", options: ["6 July 2026", "06/07/26", "6/7", "the sixth or seventh", "summer 2026"], answer: 0, explanationIt: "Scrivere il mese in lettere, 6 July 2026, elimina l'ambiguità tra ordine UK e US." },
    { prompt: "Edifici · Un collega americano dice “first floor”. A quale livello si riferisce normalmente?", options: ["street level", "one level above street", "the basement", "the top floor", "the mezzanine only"], answer: 0, explanationIt: "Nell'uso statunitense first floor indica normalmente il piano a livello strada." },
    { prompt: "Collettivi · Quale frase è naturale in britannico quando si pensa ai membri separatamente?", options: ["The committee are divided.", "The committee be divided.", "The committee am divided.", "The committee has divide.", "The committee are divide."], answer: 0, explanationIt: "In britannico un nome collettivo può reggere il plurale quando si considerano i membri del gruppo." },
    { prompt: "Comunicazione internazionale · Qual è la scelta più sicura?", options: ["state dates and floors explicitly", "assume everyone follows UK usage", "assume everyone follows US usage", "avoid all dates and numbers", "translate each word literally"], answer: 0, explanationIt: "Esplicitare mese, anno e livello dell'edificio previene incomprensioni tra varietà diverse." },
  ],
};

export function supplementaryBankFor(unit: MobileUnit): Choice[] {
  const bank: Choice[] = [];
  const optionCount = optionCountForLevel(unit.cefr);
  const addGenerated = (prompt: string, correct: string, alternatives: string[], explanationIt: string) => {
    const enrichedAlternatives = [...alternatives, ...grammarMistakes(correct), ...alternatives.flatMap(option => grammarMistakes(option))]
      .filter(plausibleGeneratedAlternative);
    const built = tryOptionsFor(correct, enrichedAlternatives, optionCount);
    if (built) bank.push({ prompt, ...built, explanationIt });
  };
  bank.push(...(curatedSupplementaryByUnit[unit.id] ?? []));

  unit.vocabulary.forEach((word, index) => {
    addGenerated(
      `Lessico nel contesto ${index + 1} · Quale frase usa “${word.en}” con una struttura corretta?`,
      word.example,
      grammarMistakes(word.example),
      `L'uso corretto è «${word.example}». In questo contesto “${word.en}” significa «${word.it}».`,
    );
  });

  unit.grammar.examples.forEach((example, index) => {
    addGenerated(`Ricostruzione ${index + 1} · Quale sequenza esprime correttamente «${example.it}»?`, example.en, grammarMistakes(example.en), `${example.en} ${example.noteIt}`);
    addGenerated(
      `Analisi ${index + 1} · Quale osservazione descrive meglio «${example.en}»?`,
      example.noteIt,
      [...unit.grammar.examples.map(item => item.noteIt), ...unit.grammar.formulas, ...unit.grammar.explanationIt],
      `${example.noteIt} L'esempio di riferimento è «${example.en}».`,
    );
  });

  unit.writing.cloze.forEach((item, index) => {
    const correct = item.answers[0];
    addGenerated(`Completamento ragionato ${index + 1} · ${item.prompt}`, correct, plausibleClozeDistractors(correct, unit.writing.cloze.flatMap(entry => entry.answers)), `${item.hintIt} La risposta corretta è «${correct}».`);
  });

  const listeningLines = dialogueLines(unit.listening.transcript);
  listeningLines.slice(0, 5).forEach((line, index) => {
    addGenerated(`Riconoscimento attivo ${index + 1} · Quale battuta appartiene davvero al dialogo della lezione?`, line, meaningMistakes(line), `La battuta presente nel dialogo è: “${line}”.`);
  });

  addGenerated("Produzione orale · Quale versione conserva l’ordine naturale della frase da ripetere?", unit.speaking.target, grammarMistakes(unit.speaking.target), `La sequenza naturale è: ${unit.speaking.target}`);
  addGenerated("Pronuncia e struttura · Quale frase useresti come modello completo?", unit.speaking.target, grammarMistakes(unit.speaking.target), `Il modello previsto per questa lezione è: ${unit.speaking.target}`);

  return [...new Map(bank.map((question, index) => {
    const localAlternatives = [...question.options, ...question.options.flatMap(option => grammarMistakes(option))]
      .filter(plausibleGeneratedAlternative);
    const expanded = expandChoiceForLevel(detailedChoice(question), unit.cefr, localAlternatives, index);
    return [supplementaryFingerprint(expanded), expanded];
  })).values()].filter(question => question.options.length === optionCount);
}

export function buildSupplementaryQuiz(unit: MobileUnit, count: number, excluded: string[] = []) {
  const bank = supplementaryBankFor(unit);
  const excludedSet = new Set(excluded);
  const unseen = shuffle(bank.filter(question => !excludedSet.has(supplementaryFingerprint(question))));
  if (excludedSet.size && unseen.length) return diversifyFamilies(unseen).slice(0, Math.min(count, unseen.length));
  return diversifyFamilies(shuffle(bank)).slice(0, Math.min(count, bank.length));
}
