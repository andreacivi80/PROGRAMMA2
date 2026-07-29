import type { Choice, MobileUnit } from "./curriculum";

type Spec = {
  id: string;
  title: string;
  explanation: string[];
  formulas: string[];
  examples: [string, string, string][];
  vocabulary: [string, string, string][];
  cloze: [string, string[], string][];
  writing: string;
  transcript: string;
  listening: Choice[];
  speaking: string;
  speakingHelp: string;
  focus: string[];
  check: Choice[];
};

const unit = (spec: Spec): MobileUnit => ({
  id: spec.id,
  day: 0,
  cefr: "A1",
  title: spec.title,
  minutes: 18,
  grammar: {
    explanationIt: spec.explanation,
    formulas: spec.formulas,
    examples: spec.examples.map(([en, it, noteIt]) => ({ en, it, noteIt })),
  },
  vocabulary: spec.vocabulary.map(([en, it, example]) => ({
    en,
    it,
    example,
  })),
  writing: {
    cloze: spec.cloze.map(([prompt, answers, hintIt]) => ({
      prompt,
      answers,
      hintIt,
    })),
    productionPromptIt: spec.writing,
  },
  listening: {
    transcript: spec.transcript,
    guideIt: "Primo ascolto a 0,8× con testo nascosto; secondo ascolto a 1×. Poi rispondi.",
    questions: spec.listening,
  },
  speaking: {
    target: spec.speaking,
    promptIt: spec.speakingHelp,
    focus: spec.focus,
  },
  quickCheck: spec.check,
  repetition: {
    retryMode: "new-order",
    masteryTarget: 80,
    reviewAfterDays: [1, 3, 7, 14],
  },
});

export const a1Expansion: MobileUnit[] = [
  unit({
    id: "a1-pronouns-possessives",
    title: "Pronomi e possessivi",
    explanation: [
      "I pronomi soggetto indicano chi compie l’azione: I, you, he, she, it, we, they.",
      "Gli aggettivi possessivi indicano a chi appartiene qualcosa: my, your, his, her, its, our, their.",
      "In inglese il soggetto è quasi sempre espresso: non dire Is tired, ma She is tired.",
    ],
    formulas: ["soggetto + verbo", "possessivo + nome", "I → my; he → his; she → her"],
    examples: [
      ["She is Anna. Her office is here.", "Lei è Anna. Il suo ufficio è qui.", "Her dipende dalla proprietaria, Anna."],
      ["They live in Rome. Their house is small.", "Vivono a Roma. La loro casa è piccola.", "Their appartiene a they."],
      ["I have a brother. His name is Leo.", "Ho un fratello. Si chiama Leo.", "His si riferisce al fratello."],
    ],
    vocabulary: [
      ["family", "famiglia", "My family is in Italy."],
      ["parents", "genitori", "Their parents are kind."],
      ["office", "ufficio", "Her office is near here."],
      ["name", "nome", "His name is Leo."],
      ["friend", "amico", "Our friend is English."],
    ],
    cloze: [
      ["Maria is here. ___ bag is blue.", ["Her"], "Il possessore è Maria: usa her."],
      ["We live in Milan. ___ flat is small.", ["Our"], "Il possessore è we: usa our."],
      ["Tom and Ben are brothers. ___ mother is a doctor.", ["Their"], "Il possessore è they: usa their."],
    ],
    writing: "Presenta tre persone e indica almeno un oggetto o luogo che appartiene a ciascuna.",
    transcript: "My name is Julia. I live with my brother. His name is Sam. Our flat is near the station, and our parents live nearby.",
    listening: [
      { prompt: "Who is Sam?", options: ["Julia’s brother", "Julia’s father", "Julia’s friend"], answer: 0, explanationIt: "Julia dice: my brother. His name is Sam." },
      { prompt: "Where is their flat?", options: ["Near the station", "Near the school", "In London"], answer: 0, explanationIt: "Our flat is near the station." },
    ],
    speaking: "My name is Julia, and this is my brother. His name is Sam.",
    speakingHelp: "Distingui chiaramente my e his. Tocca le parole rosse per riascoltarle.",
    focus: ["my", "his", "brother"],
    check: [
      { prompt: "Possessivo di she:", options: ["his", "her", "their"], answer: 1, explanationIt: "She corrisponde a her." },
      { prompt: "Completa: We love ___ home.", options: ["our", "its", "his"], answer: 0, explanationIt: "Il possessore è we." },
    ],
  }),
  unit({
    id: "a1-there-is-are",
    title: "There is e there are",
    explanation: [
      "There is e there are servono per dire che una persona o una cosa esiste o si trova in un luogo.",
      "Usa there is con un nome singolare o non numerabile; there are con un plurale.",
      "Per la domanda sposta is/are davanti a there. Per negare aggiungi not.",
    ],
    formulas: ["There is + singolare", "There are + plurale", "Is/Are there ...?"],
    examples: [
      ["There is a café near the station.", "C’è un bar vicino alla stazione.", "In italiano usiamo c’è; non tradurre con have."],
      ["There are two windows in the room.", "Ci sono due finestre nella stanza.", "Il plurale richiede are."],
      ["Is there a pharmacy here?", "C’è una farmacia qui?", "Nella domanda is precede there."],
    ],
    vocabulary: [
      ["room", "stanza", "There are two windows in the room."],
      ["street", "strada", "There is a shop in this street."],
      ["near", "vicino", "The café is near the station."],
      ["opposite", "di fronte", "The bank is opposite the park."],
      ["between", "tra", "The hotel is between two shops."],
    ],
    cloze: [
      ["There ___ a bank near here.", ["is"], "Bank è singolare."],
      ["There ___ three chairs.", ["are"], "Three chairs è plurale."],
      ["___ there a bus stop?", ["Is"], "Domanda singolare."],
    ],
    writing: "Descrivi una stanza o una strada usando almeno due volte there is e due volte there are.",
    transcript: "There is a small hotel opposite the park. There are two cafés next to it, but there is not a pharmacy in this street.",
    listening: [
      { prompt: "What is opposite the park?", options: ["A hotel", "A pharmacy", "A station"], answer: 0, explanationIt: "The hotel is opposite the park." },
      { prompt: "How many cafés are there?", options: ["One", "Two", "Three"], answer: 1, explanationIt: "There are two cafés." },
    ],
    speaking: "There is a small hotel opposite the park, and there are two cafés next to it.",
    speakingHelp: "Fai sentire la differenza tra is e are.",
    focus: ["there is", "there are", "opposite"],
    check: [
      { prompt: "Completa: There ___ some water.", options: ["is", "are", "be"], answer: 0, explanationIt: "Water è non numerabile." },
      { prompt: "Domanda corretta:", options: ["There is a bank?", "Is there a bank?", "Does there a bank?"], answer: 1, explanationIt: "Is precede there." },
    ],
  }),
  unit({
    id: "a1-have-got",
    title: "Have got e possesso",
    explanation: [
      "Have got esprime possesso, relazioni e caratteristiche. È molto comune nell’inglese britannico.",
      "Usa have got con I, you, we, they e has got con he, she, it.",
      "Nella domanda sposta have/has prima del soggetto; nella negativa usa haven’t/hasn’t got.",
    ],
    formulas: ["I/you/we/they have got", "he/she/it has got", "Have/Has + soggetto + got?"],
    examples: [
      ["I have got a new phone.", "Ho un telefono nuovo.", "Non tradurre parola per parola ho con am."],
      ["She has got blue eyes.", "Ha gli occhi azzurri.", "Con she usa has."],
      ["Have you got any brothers?", "Hai fratelli?", "Have precede il soggetto."],
    ],
    vocabulary: [
      ["phone", "telefono", "I have got a new phone."],
      ["eyes", "occhi", "She has got blue eyes."],
      ["brother", "fratello", "Have you got a brother?"],
      ["sister", "sorella", "He has got one sister."],
      ["pet", "animale domestico", "We have got a small pet."],
    ],
    cloze: [
      ["She ___ got a bicycle.", ["has"], "Con she usa has."],
      ["They ___ got two children.", ["have"], "Con they usa have."],
      ["___ he got a car?", ["Has"], "Domanda con he."],
    ],
    writing: "Scrivi cinque frasi su ciò che tu e la tua famiglia avete o non avete.",
    transcript: "Ben has got a sister and two brothers. They have got a dog, but they have not got a cat.",
    listening: [
      { prompt: "How many brothers has Ben got?", options: ["One", "Two", "Three"], answer: 1, explanationIt: "He has got two brothers." },
      { prompt: "Have they got a cat?", options: ["Yes", "No", "The text does not say"], answer: 1, explanationIt: "They have not got a cat." },
    ],
    speaking: "I have got one sister, and we have got a small dog.",
    speakingHelp: "Pronuncia have got come un unico blocco naturale.",
    focus: ["have got", "sister", "small dog"],
    check: [
      { prompt: "Con he:", options: ["have got", "has got", "is got"], answer: 1, explanationIt: "He has got." },
      { prompt: "Domanda corretta:", options: ["Has she got a car?", "Does she has got a car?", "She has got a car?"], answer: 0, explanationIt: "Has va prima del soggetto." },
    ],
  }),
  unit({
    id: "a1-some-any",
    title: "Some, any e quantità",
    explanation: [
      "Some e any indicano una quantità non precisa con plurali e nomi non numerabili.",
      "Usa normalmente some nelle frasi affermative e any nelle domande e negative.",
      "Nelle offerte e richieste cortesi si può usare some quando ci aspettiamo una risposta positiva.",
    ],
    formulas: ["some + plurale/non numerabile", "any nelle domande e negative", "Would you like some ...?"],
    examples: [
      ["There is some milk in the fridge.", "C’è del latte nel frigorifero.", "Milk non si conta singolarmente."],
      ["We haven’t got any eggs.", "Non abbiamo uova.", "La negativa usa any."],
      ["Would you like some coffee?", "Vuoi del caffè?", "Offerta cortese: some."],
    ],
    vocabulary: [
      ["milk", "latte", "There is some milk."],
      ["bread", "pane", "We need some bread."],
      ["eggs", "uova", "Have we got any eggs?"],
      ["rice", "riso", "There is not any rice."],
      ["bottle", "bottiglia", "Buy a bottle of water."],
    ],
    cloze: [
      ["I need ___ bread.", ["some"], "Frase affermativa."],
      ["Have you got ___ water?", ["any"], "Domanda neutra."],
      ["We don’t have ___ eggs.", ["any"], "Frase negativa."],
    ],
    writing: "Prepara una lista della spesa e scrivi cosa hai già e cosa non hai.",
    transcript: "We have got some bread and some cheese. We have not got any milk, and we need some eggs for breakfast.",
    listening: [
      { prompt: "What do they have?", options: ["Bread and cheese", "Milk and eggs", "Rice and water"], answer: 0, explanationIt: "They have bread and cheese." },
      { prompt: "What do they need?", options: ["Cheese", "Eggs", "Bread"], answer: 1, explanationIt: "They need eggs." },
    ],
    speaking: "We have got some bread, but we have not got any milk.",
    speakingHelp: "Distingui some da any senza accelerare.",
    focus: ["some bread", "not got", "any milk"],
    check: [
      { prompt: "Negativa:", options: ["some", "any", "a"], answer: 1, explanationIt: "Nelle negative usa normalmente any." },
      { prompt: "Offerta corretta:", options: ["Would you like some tea?", "Would you like any tea?", "Do you like a tea now?"], answer: 0, explanationIt: "Nelle offerte cortesi usiamo spesso some." },
    ],
  }),
  unit({
    id: "a1-prepositions-time-place",
    title: "Preposizioni di tempo e luogo",
    explanation: [
      "At indica un punto preciso; on una superficie, un giorno o una data; in uno spazio, un mese, un anno o una parte del giorno.",
      "Le preposizioni inglesi non corrispondono sempre a una singola preposizione italiana.",
      "Impara le combinazioni come blocchi: at home, on Monday, in July.",
    ],
    formulas: ["at + ora/punto", "on + giorno/superficie", "in + mese/anno/spazio"],
    examples: [
      ["The lesson starts at nine.", "La lezione inizia alle nove.", "Con l’ora usa at."],
      ["I work on Monday.", "Lavoro lunedì.", "Con i giorni usa on."],
      ["We travel in August.", "Viaggiamo ad agosto.", "Con i mesi usa in."],
    ],
    vocabulary: [
      ["morning", "mattina", "I work in the morning."],
      ["weekend", "fine settimana", "See you at the weekend."],
      ["corner", "angolo", "The shop is on the corner."],
      ["inside", "dentro", "The keys are inside the bag."],
      ["under", "sotto", "The shoes are under the bed."],
    ],
    cloze: [
      ["The train leaves ___ seven.", ["at"], "Ora precisa."],
      ["My birthday is ___ May.", ["in"], "Mese."],
      ["We meet ___ Friday.", ["on"], "Giorno."],
    ],
    writing: "Descrivi la tua settimana indicando tre orari, due giorni e tre luoghi.",
    transcript: "The class is on Tuesday at six. It is in room four, on the first floor. Please arrive at the school at five fifty.",
    listening: [
      { prompt: "When is the class?", options: ["Tuesday at six", "Thursday at five", "Monday at four"], answer: 0, explanationIt: "On Tuesday at six." },
      { prompt: "Where is it?", options: ["Room four", "Room five", "At home"], answer: 0, explanationIt: "It is in room four." },
    ],
    speaking: "The class is on Tuesday at six, in room four.",
    speakingHelp: "Metti in evidenza on, at e in.",
    focus: ["on Tuesday", "at six", "in room four"],
    check: [
      { prompt: "___ 2026:", options: ["at", "on", "in"], answer: 2, explanationIt: "Con gli anni usa in." },
      { prompt: "___ Monday:", options: ["on", "in", "at"], answer: 0, explanationIt: "Con i giorni usa on." },
    ],
  }),
  unit({
    id: "a1-was-were-past",
    title: "Was, were e primo passato",
    explanation: [
      "Was e were sono il passato di be e descrivono stato, luogo, età e situazione nel passato.",
      "Usa was con I, he, she, it; were con you, we, they.",
      "Be al passato non usa did: Was she tired? e non Did she was tired?",
    ],
    formulas: ["I/he/she/it was", "you/we/they were", "Was/Were + soggetto?"],
    examples: [
      ["I was at home yesterday.", "Ero a casa ieri.", "Il tempo è concluso: yesterday."],
      ["They were very tired.", "Erano molto stanchi.", "They richiede were."],
      ["Were you at work?", "Eri al lavoro?", "Were precede you."],
    ],
    vocabulary: [
      ["yesterday", "ieri", "I was busy yesterday."],
      ["last night", "ieri sera", "We were home last night."],
      ["busy", "impegnato", "She was busy."],
      ["tired", "stanco", "They were tired."],
      ["late", "in ritardo", "The bus was late."],
    ],
    cloze: [
      ["I ___ at home yesterday.", ["was"], "Con I usa was."],
      ["They ___ not ready.", ["were"], "Con they usa were."],
      ["___ she at school?", ["Was"], "Domanda con she."],
    ],
    writing: "Scrivi sei frasi su dove eri e come stavi ieri, includendo due negative.",
    transcript: "Yesterday I was at work until six. My colleagues were tired, but I was not tired. The buses were late, so I was home at eight.",
    listening: [
      { prompt: "Where was the speaker?", options: ["At work", "At school", "At the station"], answer: 0, explanationIt: "The speaker was at work." },
      { prompt: "Were the buses on time?", options: ["Yes", "No", "Not mentioned"], answer: 1, explanationIt: "The buses were late." },
    ],
    speaking: "Yesterday I was at work, and the buses were late.",
    speakingHelp: "Pronuncia was in modo breve e were in modo distinto.",
    focus: ["yesterday", "was at work", "were late"],
    check: [
      { prompt: "Con they:", options: ["was", "were", "did be"], answer: 1, explanationIt: "They were." },
      { prompt: "Domanda corretta:", options: ["Did you were tired?", "Were you tired?", "You were tired?"], answer: 1, explanationIt: "Were precede il soggetto." },
    ],
  }),
];
