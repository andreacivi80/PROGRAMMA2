import { a1Expansion } from "./a1Expansion";
import { a2Expansion } from "./a2Expansion";
import { b1Expansion, b2Expansion } from "./advancedCurriculum";
import { c1Curriculum } from "./c1Curriculum";

export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1";

export type Choice = {
  prompt: string;
  options: string[];
  answer: number;
  explanationIt: string;
};

export type MobileUnit = {
  id: string;
  day: number;
  cefr: Cefr;
  title: string;
  minutes: number;
  grammar: {
    explanationIt: string[];
    formulas: string[];
    examples: { en: string; it: string; noteIt: string }[];
  };
  vocabulary: { en: string; it: string; example: string }[];
  writing: {
    cloze: { prompt: string; answers: string[]; hintIt: string }[];
    productionPromptIt: string;
  };
  listening: {
    transcript: string;
    guideIt: string;
    questions: Choice[];
  };
  speaking: {
    target: string;
    promptIt: string;
    focus: string[];
  };
  quickCheck: Choice[];
  repetition: {
    retryMode: "new-order";
    masteryTarget: number;
    reviewAfterDays: number[];
  };
};

const C = (
  prompt: string,
  options: string[],
  answer: number,
  explanationIt: string
): Choice => ({ prompt, options, answer, explanationIt });

const U = (
  id: string,
  day: number,
  cefr: Cefr,
  title: string,
  explanationIt: string[],
  formulas: string[],
  examples: [string, string, string][],
  vocabulary: [string, string, string][],
  cloze: [string, string[], string][],
  productionPromptIt: string,
  transcript: string,
  guideIt: string,
  listeningQuestions: Choice[],
  speakingTarget: string,
  speakingPromptIt: string,
  speakingFocus: string[],
  quickCheck: Choice[]
): MobileUnit => ({
  id, day, cefr, title, minutes: 18,
  grammar: {
    explanationIt,
    formulas,
    examples: examples.map(([en, it, noteIt]) => ({ en, it, noteIt }))
  },
  vocabulary: vocabulary.map(([en, it, example]) => ({ en, it, example })),
  writing: {
    cloze: cloze.map(([prompt, answers, hintIt]) => ({ prompt, answers, hintIt })),
    productionPromptIt
  },
  listening: { transcript, guideIt, questions: listeningQuestions },
  speaking: { target: speakingTarget, promptIt: speakingPromptIt, focus: speakingFocus },
  quickCheck,
  repetition: { retryMode: "new-order", masteryTarget: 80, reviewAfterDays: [1, 3, 7, 14] }
});

const coreCurriculum: MobileUnit[] = [
  U("a1-be-introductions", 1, "A1", "Presentarsi con be",
    ["Il verbo be serve per dire chi sei, come stai e da dove vieni.", "Con I usa am; con he, she, it usa is; con you, we, they usa are.", "Nelle domande am/is/are viene prima del soggetto."],
    ["Affermativa: soggetto + am/is/are.", "Negativa: soggetto + am/is/are not.", "Domanda: Am/Is/Are + soggetto?"],
    [["I am Marco.", "Sono Marco.", "I vuole am."], ["She is from Rome.", "Lei viene da Roma.", "She vuole is."], ["Are you ready?", "Sei pronto?", "Nella domanda are precede you."]],
    [["name", "nome", "My name is Luca."], ["from", "da/di", "I am from Italy."], ["ready", "pronto", "We are ready."], ["tired", "stanco", "She is tired."], ["welcome", "benvenuto", "You are welcome here."]],
    [["I ___ Italian.", ["am"], "Con I usa am."], ["___ she ready?", ["is"], "È una domanda con she."], ["They ___ not late.", ["are"], "Con they usa are."]],
    "Scrivi quattro frasi: nome, città, professione e come ti senti oggi.",
    "Anna: Hi, I am Anna. I am from Milan. Tom: Nice to meet you. Are you a student? Anna: No, I am a designer.",
    "Individua nome, provenienza e professione.",
    [C("Where is Anna from?", ["Rome", "Milan", "London"], 1, "Anna dice: I am from Milan."), C("Is Anna a student?", ["Yes", "No", "Not stated"], 1, "Risponde No e dice di essere designer.")],
    "Hi, I am Anna. I am from Milan and I am a designer.",
    "Ripeti il modello e poi sostituisci le informazioni con le tue.",
    ["am/is/are", "ritmo delle frasi brevi", "suono iniziale di Italian"],
    [C("Choose the correct sentence.", ["I is ready.", "I am ready.", "I are ready."], 1, "Con I si usa am."), C("Complete: ___ they at home?", ["Is", "Am", "Are"], 2, "They richiede are.")]
  ),

  U("a1-articles-plurals", 2, "A1", "A, an, the e plurali",
    ["A/an introduce una cosa singolare non ancora identificata.", "An precede un suono vocalico; a precede un suono consonantico.", "The indica qualcosa di specifico o già menzionato."],
    ["a book; an apple; an hour.", "Prima menzione: a dog. Seconda menzione: the dog.", "Plurale regolare: book → books; city → cities."],
    [["I need a ticket.", "Mi serve un biglietto.", "È un oggetto singolare non specifico."], ["She is an engineer.", "È un'ingegnera.", "Engineer inizia con suono vocalico."], ["The ticket is in my bag.", "Il biglietto è nella mia borsa.", "Ora il biglietto è identificato."]],
    [["ticket", "biglietto", "I need a ticket."], ["bag", "borsa", "The bag is blue."], ["apple", "mela", "She has an apple."], ["station", "stazione", "The station is near."], ["key", "chiave", "These are my keys."]],
    [["She waited for ___ hour.", ["an"], "La h di hour è muta."], ["I saw a dog. ___ dog was friendly.", ["the"], "È già stato menzionato."], ["Two ___ (city).", ["cities"], "Con consonante + y: ies."]],
    "Descrivi cinque oggetti che hai vicino usando a/an; riprendine due con the.",
    "Customer: Can I have a coffee and an apple, please? Server: Of course. The coffee is two pounds and the apple is one pound.",
    "Ascolta gli articoli e il prezzo di ciascun prodotto.",
    [C("What does the customer order?", ["Tea and cake", "Coffee and an apple", "Two coffees"], 1, "Ordina a coffee and an apple."), C("How much is the apple?", ["One pound", "Two pounds", "Three pounds"], 0, "Il dialogo dice one pound.")],
    "Can I have a coffee and an apple, please?",
    "Pronuncia la richiesta come se fossi al bar.",
    ["collegamento have_a", "a/an", "intonazione cortese"],
    [C("Choose the correct form.", ["a hour", "an hour", "the hours"], 1, "Hour comincia con suono vocalico."), C("Second mention: I bought a book. ___ book is useful.", ["A", "An", "The"], 2, "Seconda menzione: the.")]
  ),

  U("a1-present-simple-routine", 3, "A1", "Present Simple: routine",
    ["Il present simple descrive abitudini, fatti generali e orari.", "Con he/she/it il verbo affermativo prende normalmente -s.", "Domande e negative usano do/does + verbo base."],
    ["I/you/we/they work.", "He/she/it works.", "Do you work? Does she work?"],
    [["I start work at eight.", "Inizio a lavorare alle otto.", "Routine."], ["She works from home.", "Lavora da casa.", "She + works."], ["Does he drink coffee?", "Beve caffè?", "Dopo does: drink, non drinks."]],
    [["wake up", "svegliarsi", "I wake up at seven."], ["start", "iniziare", "Work starts at eight."], ["usually", "di solito", "I usually walk."], ["sometimes", "a volte", "We sometimes cook."], ["every day", "ogni giorno", "She studies every day."]],
    [["My sister ___ (work) in a bank.", ["works"], "Terza persona singolare."], ["___ your parents live nearby?", ["do"], "Soggetto plurale."], ["He does not ___ coffee.", ["drink"], "Dopo does usa la base."]],
    "Scrivi la tua routine in cinque frasi, includendo usually e sometimes.",
    "Leo wakes up at seven. He usually walks to work and starts at eight. He has lunch at one and finishes at five.",
    "Segna quattro orari o azioni della routine di Leo.",
    [C("How does Leo go to work?", ["By bus", "He walks", "By train"], 1, "He usually walks to work."), C("When does he finish?", ["At one", "At five", "At eight"], 1, "Finishes at five.")],
    "I usually wake up at seven, but I start work at eight.",
    "Ripeti, poi registra due frasi sulla tua routine.",
    ["-s di starts", "usually prima del verbo", "orari"],
    [C("Correct third person:", ["She work.", "She works.", "She working."], 1, "She prende -s."), C("Correct question:", ["Does he works?", "Do he work?", "Does he work?"], 2, "Does + soggetto + base.")]
  ),

  U("a1-present-continuous", 4, "A1", "Present Continuous: adesso",
    ["Il present continuous descrive ciò che accade ora o una situazione temporanea.", "Si forma con am/is/are + verbo in -ing.", "Verbi di stato come know e believe di solito non prendono -ing."],
    ["I am working.", "She is not sleeping.", "Are they waiting?"],
    [["I am reading now.", "Sto leggendo adesso.", "Azione in corso."], ["They are waiting outside.", "Stanno aspettando fuori.", "They + are."], ["Is she coming?", "Sta venendo?", "Is precede she."]],
    [["now", "adesso", "I am working now."], ["wait", "aspettare", "They are waiting."], ["cook", "cucinare", "He is cooking dinner."], ["talk", "parlare", "She is talking on the phone."], ["outside", "fuori", "We are waiting outside."]],
    [["The baby ___ (sleep).", ["is sleeping"], "Soggetto singolare + azione in corso."], ["We ___ not working today.", ["are"], "Con we usa are."], ["___ she coming?", ["is"], "Domanda con she."]],
    "Guarda intorno a te e scrivi quattro azioni che stanno accadendo.",
    "Mia: Where are you? Dan: I am waiting outside the station. Mia: I am coming now. I am wearing a red jacket.",
    "Individua luogo, azioni in corso e un dettaglio visivo.",
    [C("Where is Dan?", ["At home", "Outside the station", "Inside a shop"], 1, "Dice waiting outside the station."), C("What is Mia wearing?", ["A red jacket", "A blue coat", "A hat"], 0, "Dice a red jacket.")],
    "I am waiting outside the station. I am wearing a red jacket.",
    "Ripeti con ritmo naturale e cambia colore e luogo.",
    ["am/is/are", "-ing", "collegamento waiting_outside"],
    [C("Complete: They ___ talking.", ["is", "are", "do"], 1, "They usa are."), C("Choose:", ["She is sleep.", "She sleeping.", "She is sleeping."], 2, "Serve is + sleeping.")]
  ),

  U("a1-questions-can", 5, "A1", "Domande e can",
    ["Can esprime capacità, possibilità e richieste semplici.", "Dopo can usa sempre il verbo base, senza to e senza -s.", "La domanda mette can prima del soggetto."],
    ["Affermativa: I can swim.", "Negativa: I cannot/can't swim.", "Domanda: Can you help me?"],
    [["She can sing.", "Sa cantare.", "Niente -s dopo can."], ["Can I pay by card?", "Posso pagare con carta?", "Richiesta pratica."], ["I can't hear you.", "Non riesco a sentirti.", "Forma negativa contratta."]],
    [["help", "aiutare", "Can you help me?"], ["pay", "pagare", "Can I pay by card?"], ["hear", "sentire", "I cannot hear you."], ["speak", "parlare", "Can you speak English?"], ["slowly", "lentamente", "Please speak slowly."]],
    [["Can you ___ me?", ["help"], "Dopo can: verbo base."], ["She can ___ very well.", ["sing"], "Niente to e niente -s."], ["___ I pay by card?", ["can"], "Richiesta di permesso."]],
    "Scrivi tre cose che sai fare e due richieste utili in viaggio.",
    "Traveller: Excuse me, can you help me? Clerk: Yes, of course. Traveller: Can I buy a ticket here? Clerk: Yes, and you can pay by card.",
    "Ascolta due domande con can e le relative risposte.",
    [C("What does the traveller want?", ["A ticket", "Food", "A hotel"], 0, "Chiede di comprare un ticket."), C("Can the traveller pay by card?", ["No", "Yes", "Not stated"], 1, "The clerk says yes.")],
    "Excuse me, can you help me? Can I buy a ticket here?",
    "Registra le due richieste con tono cortese.",
    ["can non accentato", "help me", "intonazione ascendente"],
    [C("After can use:", ["to speak", "speaks", "speak"], 2, "Can + forma base."), C("Correct question:", ["You can help?", "Can you help?", "Do can you help?"], 1, "Can precede il soggetto.")]
  ),

  U("a1-review-real-life", 6, "A1", "Riepilogo intermedio A1: vita quotidiana",
    ["Questa unità integra be, articoli, present simple, continuous e can.", "Prima comprendi il contesto; poi scegli il tempo o la struttura.", "L'obiettivo è comunicare anche con frasi brevi ma corrette."],
    ["Routine → present simple.", "Adesso → present continuous.", "Capacità/richiesta → can + base."],
    [["I work here every day.", "Lavoro qui ogni giorno.", "Routine."], ["I am working now.", "Sto lavorando adesso.", "Azione in corso."], ["Can you repeat that?", "Puoi ripeterlo?", "Richiesta utile."]],
    [["repeat", "ripetere", "Can you repeat that?"], ["understand", "capire", "I understand the question."], ["need", "avere bisogno", "I need a ticket."], ["near", "vicino", "The café is near."], ["today", "oggi", "I am working today."]],
    [["I usually ___ at home.", ["work"], "Routine con I."], ["I am ___ now.", ["working"], "Azione in corso."], ["Can you ___ slowly?", ["speak"], "Can + base."]],
    "Scrivi un mini-dialogo di sei battute: presentazione, richiesta e risposta.",
    "Sara: Hi, I am Sara. I work at the hotel. Guest: Is the restaurant open now? Sara: Yes, it is. You can have dinner until ten.",
    "Capisci chi parla, il luogo e l'informazione pratica.",
    [C("Where does Sara work?", ["At a station", "At a hotel", "At a school"], 1, "Dice I work at the hotel."), C("Until when can the guest have dinner?", ["Eight", "Nine", "Ten"], 2, "Until ten.")],
    "Hello, I am a guest. Is the restaurant open? Can you help me?",
    "Interpreta il cliente e pronuncia le tre frasi senza leggere dopo il secondo tentativo.",
    ["chiarezza", "domande", "can"],
    [C("Routine:", ["I work every day.", "I am work every day.", "I working every day."], 0, "Present simple con I."), C("Now:", ["She cooks now.", "She is cooking now.", "She can cooking now."], 1, "Now richiede qui il continuous.")]
  ),

  U("a2-past-simple", 7, "A2", "Past Simple",
    ["Il past simple descrive eventi conclusi in un momento passato definito.", "I verbi regolari prendono -ed; molti verbi comuni sono irregolari.", "Negative e domande usano did + verbo base."],
    ["I visited London.", "I did not see it.", "Did you enjoy the trip?"],
    [["We went to London last week.", "Siamo andati a Londra la scorsa settimana.", "Go → went."], ["She didn't receive the email.", "Non ha ricevuto l'email.", "Dopo did: receive."], ["Did you call him?", "Lo hai chiamato?", "Did segnala il passato."]],
    [["yesterday", "ieri", "I called yesterday."], ["last week", "la settimana scorsa", "We travelled last week."], ["ago", "fa", "It happened two days ago."], ["went", "andò/sono andato", "They went home."], ["saw", "vide/ho visto", "I saw the message."]],
    [["We ___ (go) to London.", ["went"], "Go è irregolare."], ["She did not ___ the email.", ["receive"], "Dopo did: base."], ["___ you enjoy it?", ["did"], "Domanda al passato."]],
    "Racconta ieri in cinque frasi, con almeno due verbi irregolari.",
    "Nora visited Oxford yesterday. She took the morning train, saw the old university buildings and had lunch near the river.",
    "Individua quando, come ha viaggiato e cosa ha visto.",
    [C("How did Nora travel?", ["By car", "By train", "By bus"], 1, "She took the morning train."), C("Where did she have lunch?", ["Near the river", "At the station", "At home"], 0, "Near the river.")],
    "Yesterday I took the train, saw the city and had lunch near the river.",
    "Ripeti prestando attenzione ai verbi irregolari.",
    ["-ed", "took", "saw"],
    [C("After did:", ["went", "go", "going"], 1, "Did + base."), C("Past of see:", ["seed", "saw", "seen"], 1, "Il past simple è saw.")]
  ),

  U("a2-past-continuous", 8, "A2", "Past Continuous",
    ["Il past continuous mostra un'azione in corso in un momento passato.", "Spesso descrive lo sfondo interrotto da un evento breve al past simple.", "Was con I/he/she/it; were con you/we/they."],
    ["was/were + verbo-ing.", "I was cooking when he called.", "While they were walking, it started to rain."],
    [["It was raining when we left.", "Pioveva quando siamo usciti.", "Sfondo + evento."], ["They were eating at eight.", "Stavano mangiando alle otto.", "Azione in corso."], ["What were you doing?", "Che cosa stavi facendo?", "Were con you."]],
    [["while", "mentre", "While I was reading..."], ["when", "quando", "It rang when I arrived."], ["rain", "piovere", "It was raining."], ["drive", "guidare", "I was driving."], ["suddenly", "all'improvviso", "Suddenly, the lights went out."]],
    [["I ___ (walk) when it rained.", ["was walking"], "Azione lunga."], ["They ___ watching TV.", ["were"], "Soggetto plurale."], ["What ___ she doing?", ["was"], "She vuole was."]],
    "Scrivi tre frasi con un'azione lunga interrotta da un evento breve.",
    "I was walking home when it started to rain. People were running to the shops, and a bus suddenly stopped beside me.",
    "Distingui le azioni in corso dagli eventi improvvisi.",
    [C("What was the speaker doing?", ["Driving", "Walking home", "Shopping"], 1, "I was walking home."), C("What suddenly stopped?", ["A train", "A car", "A bus"], 2, "A bus suddenly stopped.")],
    "I was walking home when it started to rain.",
    "Pronuncia evidenziando l'azione lunga e l'evento breve.",
    ["was walking", "started", "when"],
    [C("Choose:", ["They was running.", "They were running.", "They did running."], 1, "They + were."), C("Long action:", ["I cooked when he called.", "I was cooking when he called.", "I am cooking when he called."], 1, "Past continuous per l'azione in corso.")]
  ),

  U("a2-comparatives", 9, "A2", "Comparativi e superlativi",
    ["Il comparativo confronta due elementi; il superlativo indica il grado massimo in un gruppo.", "Gli aggettivi brevi usano -er/-est, quelli lunghi more/most.", "Alcune forme sono irregolari: good, better, best."],
    ["faster than; the fastest.", "more useful than; the most useful.", "as ... as; not as ... as."],
    [["This route is faster.", "Questo percorso è più veloce.", "Aggettivo breve."], ["It is the most useful feature.", "È la funzione più utile.", "Aggettivo lungo."], ["This test is easier than that one.", "Questo test è più facile.", "Easy → easier."]],
    [["fast", "veloce", "The train is faster."], ["easy", "facile", "This task is easier."], ["useful", "utile", "The map is useful."], ["cheap", "economico", "The bus is cheaper."], ["crowded", "affollato", "The centre is more crowded."]],
    [["This test is ___ (easy).", ["easier"], "Y cambia in i."], ["It is the ___ (bad) option.", ["worst"], "Bad è irregolare."], ["My car is not as fast ___ yours.", ["as"], "as ... as."]],
    "Confronta due città o due mezzi di trasporto in cinque frasi.",
    "The train is faster than the bus, but it is more expensive. The bus is cheaper and sometimes less crowded. For me, the train is the most convenient option.",
    "Individua vantaggi, svantaggi e scelta finale.",
    [C("Which is faster?", ["The bus", "The train", "They are equal"], 1, "The train is faster."), C("Why can the bus be better?", ["It is cheaper", "It is always faster", "It is newer"], 0, "The bus is cheaper.")],
    "The train is faster, but the bus is cheaper.",
    "Pronuncia il confronto rendendo chiaro il contrasto con but.",
    ["-er", "than", "but"],
    [C("Correct:", ["more better", "better", "gooder"], 1, "Better è già comparativo."), C("Superlative:", ["the most useful", "more useful", "most useful than"], 0, "Superlativo con the most.")]
  ),

  U("a2-future-forms", 10, "A2", "Futuro: will e going to",
    ["Will si usa spesso per decisioni prese sul momento, promesse e previsioni personali.", "Going to esprime intenzioni già presenti o previsioni basate su prove.", "Il present continuous può indicare un appuntamento già organizzato."],
    ["will + base.", "am/is/are going to + base.", "am/is/are + -ing + tempo futuro."],
    [["I'll answer the phone.", "Rispondo io.", "Decisione spontanea."], ["It is going to rain.", "Sta per piovere.", "Prova visibile."], ["We are meeting tomorrow.", "Ci incontriamo domani.", "Accordo fissato."]],
    [["plan", "piano", "What is the plan?"], ["tomorrow", "domani", "We are leaving tomorrow."], ["promise", "promettere", "I promise I will call."], ["appointment", "appuntamento", "I have an appointment."], ["later", "più tardi", "I will call later."]],
    [["The phone is ringing. I ___ answer.", ["will", "'ll"], "Decisione ora."], ["It is ___ to rain.", ["going"], "Previsione con prova."], ["I am ___ the dentist tomorrow.", ["seeing"], "Appuntamento."]],
    "Scrivi tre piani già organizzati e due decisioni spontanee.",
    "Maya: Are you free on Saturday? Leo: I am meeting my brother in the morning, but I am free later. Maya: Great. We will visit the new exhibition.",
    "Distingui impegno fissato e decisione presa nel dialogo.",
    [C("When is Leo busy?", ["Morning", "Afternoon", "Evening"], 0, "He is meeting his brother in the morning."), C("What will they visit?", ["A café", "An exhibition", "A school"], 1, "They will visit the exhibition.")],
    "I am meeting my brother in the morning, but I will call you later.",
    "Ripeti evidenziando le due forme future.",
    ["meeting", "will", "later"],
    [C("Evidence-based prediction:", ["It will raining.", "It is going to rain.", "It going rain."], 1, "Be going to + base."), C("Arrangement:", ["We are meeting tomorrow.", "We meet now tomorrow.", "We will meeting tomorrow."], 0, "Continuous per accordo fissato.")]
  ),

  U("a2-modals-advice", 11, "A2", "Modali: consiglio e obbligo",
    ["Should esprime un consiglio.", "Must e have to esprimono obbligo; mustn't è divieto.", "Don't have to significa che una cosa non è necessaria."],
    ["should + base.", "must/have to + base.", "must not + base ≠ do not have to + base."],
    [["You should rest.", "Dovresti riposare.", "Consiglio."], ["You must wear a badge.", "Devi portare un badge.", "Obbligo."], ["You mustn't park here.", "Non devi parcheggiare qui.", "Divieto."]],
    [["rest", "riposare", "You should rest."], ["badge", "tesserino", "Wear your badge."], ["compulsory", "obbligatorio", "It is compulsory."], ["allowed", "permesso", "It is not allowed."], ["necessary", "necessario", "It is not necessary."]],
    [["You ___ take a break.", ["should"], "È un consiglio."], ["Employees ___ wear a badge.", ["must", "have to"], "È obbligatorio."], ["You must not ___ here.", ["park"], "Modale + base."]],
    "Dai quattro consigli a una persona stanca e indica due regole del tuo lavoro.",
    "Doctor: You should drink more water and get some rest. You do not have to stay in bed, but you must not exercise today.",
    "Separa consigli, assenza di necessità e divieto.",
    [C("What is advised?", ["More water and rest", "More work", "A long run"], 0, "Should introduce i consigli."), C("What is forbidden?", ["Drinking water", "Staying in bed", "Exercising today"], 2, "Must not exercise.")],
    "You should rest, and you must not exercise today.",
    "Pronuncia should e must senza aggiungere to.",
    ["should", "must not", "base verb"],
    [C("No necessity:", ["mustn't", "don't have to", "shouldn't always"], 1, "Don't have to = non necessario."), C("Advice:", ["You should rest.", "You must to rest.", "You should to rest."], 0, "Should + base.")]
  ),

  U("a2-review-travel", 12, "A2", "Riepilogo intermedio A2: viaggio",
    ["Integra passato, confronto, futuro e modali in un contesto di viaggio.", "Usa il passato per raccontare, i comparativi per scegliere e i modali per consigliare.", "La precisione conta, ma prima viene la comprensibilità."],
    ["Past: went/saw/took.", "Comparison: cheaper than.", "Advice: should + base."],
    [["We took the train yesterday.", "Abbiamo preso il treno ieri.", "Passato concluso."], ["The bus is cheaper.", "L'autobus è più economico.", "Confronto."], ["You should book early.", "Dovresti prenotare presto.", "Consiglio."]],
    [["book", "prenotare", "Book the ticket early."], ["platform", "binario", "The train leaves from platform four."], ["delay", "ritardo", "There is a delay."], ["return ticket", "andata e ritorno", "I need a return ticket."], ["journey", "viaggio", "The journey took two hours."]],
    [["Yesterday we ___ the train.", ["took"], "Past di take."], ["The bus is ___ (cheap).", ["cheaper"], "Comparativo."], ["You ___ book early.", ["should"], "Consiglio."]],
    "Pianifica un weekend: mezzo scelto, confronto, regole e programma.",
    "The train to Bristol is delayed by twenty minutes. It will leave from platform four. Passengers should keep their tickets ready.",
    "Individua destinazione, ritardo, binario e istruzione.",
    [C("How long is the delay?", ["12 minutes", "20 minutes", "40 minutes"], 1, "Twenty minutes."), C("Which platform?", ["Two", "Three", "Four"], 2, "Platform four.")],
    "The train is delayed by twenty minutes and will leave from platform four.",
    "Riproduci l'annuncio lentamente e poi a velocità naturale.",
    ["numeri", "delayed", "platform"],
    [C("Past of take:", ["taked", "took", "taken yesterday"], 1, "Past simple: took."), C("Advice:", ["You should booking.", "You should book.", "You should to book."], 1, "Should + base.")]
  ),

  U("b1-present-perfect", 13, "B1", "Present Perfect",
    ["Il present perfect collega passato e presente.", "Si usa per esperienze senza tempo preciso, risultati presenti e durate ancora in corso.", "Since introduce il punto iniziale; for introduce una durata."],
    ["have/has + participio.", "Have you ever ...?", "since 2021; for five years."],
    [["I have visited Scotland.", "Ho visitato la Scozia.", "Esperienza."], ["She has lost her keys.", "Ha perso le chiavi.", "Risultato presente."], ["We have lived here for years.", "Viviamo qui da anni.", "Durata ancora vera."]],
    [["ever", "mai", "Have you ever tried it?"], ["already", "già", "I have already finished."], ["yet", "ancora/già", "Have you finished yet?"], ["since", "da", "Since Monday."], ["for", "da/per", "For three days."]],
    [["I have known her ___ ten years.", ["for"], "Segue una durata."], ["She ___ already finished.", ["has"], "She + has."], ["Have you ever ___ to Ireland?", ["been"], "Participio di be."]],
    "Scrivi cinque esperienze e una situazione iniziata nel passato ancora vera.",
    "Ben has worked in Madrid since 2021. He has already learned Spanish, but he has not visited Barcelona yet.",
    "Riconosci durata, risultato e esperienza non ancora avvenuta.",
    [C("Since when has Ben worked in Madrid?", ["2019", "2021", "2024"], 1, "Since 2021."), C("What hasn't he done yet?", ["Learned Spanish", "Visited Barcelona", "Worked in Madrid"], 1, "He has not visited Barcelona yet.")],
    "I have worked here since 2021, but I have not visited Barcelona yet.",
    "Ripeti distinguendo have e has e pronunciando yet chiaramente.",
    ["have/has", "participi", "yet"],
    [C("Duration:", ["since ten years", "for ten years", "from ten years"], 1, "For + durata."), C("Experience:", ["Have you ever been?", "Did you ever been?", "Have you ever went?"], 0, "Have + been.")]
  ),

  U("b1-past-vs-perfect", 14, "B1", "Past Simple o Present Perfect",
    ["Usa il past simple con un momento concluso: yesterday, last year, two days ago.", "Usa il present perfect quando il tempo non è specificato o il risultato è presente.", "La scelta dipende dal rapporto con il presente, non dalla traduzione italiana."],
    ["I visited London last year.", "I have visited London three times.", "She has just finished."],
    [["I lost my keys yesterday.", "Ho perso le chiavi ieri.", "Tempo concluso."], ["I have lost my keys.", "Ho perso le chiavi.", "Ora non le ho."], ["Have you ever tried sushi?", "Hai mai provato il sushi?", "Esperienza senza data."]],
    [["ago", "fa", "Two days ago."], ["just", "appena", "She has just arrived."], ["recently", "recentemente", "I have recently changed jobs."], ["last", "scorso", "Last week."], ["result", "risultato", "There is a present result."]],
    [["We ___ the museum two days ago.", ["visited"], "Ago → past simple."], ["She has ___ the report.", ["finished"], "Have/has + participio."], ["___ you see it last night?", ["did"], "Tempo concluso."]],
    "Scrivi due coppie di frasi che mostrino evento datato e risultato presente.",
    "I visited Dublin last year and loved it. I have returned twice since then, but I have never travelled there in winter.",
    "Distingui il primo viaggio datato dalle esperienze successive.",
    [C("When was the first visit?", ["Last year", "This week", "Not stated"], 0, "I visited Dublin last year."), C("Has the speaker been there in winter?", ["Yes", "No", "Not stated"], 1, "I have never travelled there in winter.")],
    "I visited Dublin last year, and I have returned twice since then.",
    "Fai sentire la differenza tra visited e have returned.",
    ["visited", "have returned", "since then"],
    [C("With yesterday:", ["I have seen it.", "I saw it.", "I have saw it."], 1, "Yesterday richiede past simple."), C("Life experience:", ["I have been there.", "I was there ever.", "I have went there."], 0, "Have + participio.")]
  ),

  U("b1-conditionals", 15, "B1", "Zero, first e second conditional",
    ["Lo zero conditional descrive fatti generali.", "Il first conditional descrive una possibilità reale futura.", "Il second conditional descrive una situazione immaginaria o improbabile."],
    ["If + present, present.", "If + present, will + base.", "If + past, would + base."],
    [["If you heat ice, it melts.", "Se scaldi il ghiaccio, si scioglie.", "Fatto generale."], ["If it rains, we will stay home.", "Se piove, resteremo a casa.", "Possibilità reale."], ["If I had time, I would study.", "Se avessi tempo, studierei.", "Ipotesi."]],
    [["condition", "condizione", "There is one condition."], ["possible", "possibile", "It is possible."], ["unless", "a meno che", "I will go unless it rains."], ["choice", "scelta", "It is your choice."], ["imagine", "immaginare", "Imagine you had more time."]],
    [["If it rains, we ___ stay home.", ["will", "'ll"], "First conditional."], ["If I ___ more confident, I would speak.", ["were", "was"], "Second conditional."], ["If water freezes, it ___ solid.", ["becomes"], "Fatto generale."]],
    "Scrivi una regola generale, due possibilità reali e due desideri immaginari.",
    "If the weather is good, we will have the meeting outside. If it rains, we will use the main hall. If I were the organiser, I would prepare both spaces.",
    "Individua piano reale e opinione immaginaria.",
    [C("What happens if it rains?", ["The event is cancelled", "They use the hall", "They go home"], 1, "They will use the main hall."), C("Is the speaker the organiser?", ["Yes", "Probably not", "Certainly"], 1, "If I were segnala ipotesi.")],
    "If it rains, we will use the hall. If I were the organiser, I would prepare both spaces.",
    "Pronuncia le due strutture con una breve pausa dopo la condizione.",
    ["if-clause", "will", "would"],
    [C("First conditional:", ["If it will rain, we stay.", "If it rains, we will stay.", "If it rained, we will stay."], 1, "Dopo if usa il presente."), C("Second conditional:", ["If I had time, I would go.", "If I have time, I would go.", "If I will have time, I go."], 0, "If + past, would + base.")]
  ),

  U("b1-passive", 16, "B1", "Forma passiva",
    ["La forma passiva mette al centro azione o risultato.", "Si forma con be nel tempo corretto + participio passato.", "By introduce l'agente solo quando è informativo."],
    ["Present: is/are + participio.", "Past: was/were + participio.", "Modal: must be + participio."],
    [["English is spoken here.", "Qui si parla inglese.", "Passivo presente."], ["The bridge was built in 1998.", "Il ponte fu costruito nel 1998.", "Passivo passato."], ["The form must be signed.", "Il modulo deve essere firmato.", "Passivo con modale."]],
    [["build", "costruire", "The bridge was built."], ["send", "inviare", "The email was sent."], ["produce", "produrre", "It is produced locally."], ["sign", "firmare", "The form is signed."], ["deliver", "consegnare", "It will be delivered."]],
    [["Emails are ___ every morning.", ["sent"], "Participio di send."], ["The window ___ broken last night.", ["was"], "Passato singolare."], ["The form must ___ signed.", ["be"], "Modal + be + participio."]],
    "Trasforma cinque frasi attive in passive, mantenendo lo stesso tempo.",
    "The new library was opened last month. It was designed by a local architect and is used by hundreds of students every week.",
    "Individua tempi verbali, agente e uso attuale.",
    [C("When was the library opened?", ["Last week", "Last month", "Last year"], 1, "Was opened last month."), C("Who designed it?", ["Students", "A local architect", "The mayor"], 1, "Designed by a local architect.")],
    "The library was opened last month and is used by hundreds of students.",
    "Ripeti distinguendo was opened e is used.",
    ["participi", "was/is", "consonanti finali"],
    [C("Passive present:", ["It produces here.", "It is produced here.", "It is produce here."], 1, "Is + participio."), C("After must:", ["must signed", "must be signed", "must be sign"], 1, "Must + be + participio.")]
  ),

  U("b1-work-collocations", 17, "B1", "Lavoro: collocations e richieste",
    ["Le collocations sono combinazioni naturali di parole da imparare insieme.", "In inglese si dice meet a deadline, make progress e take notes.", "Could you...? rende una richiesta più cortese di Can you...?" ],
    ["meet a deadline.", "make progress; take notes.", "Could you + base, please?"],
    [["We need to meet the deadline.", "Dobbiamo rispettare la scadenza.", "Non respect a deadline."], ["She made good progress.", "Ha fatto buoni progressi.", "Make progress."], ["Could you send the figures?", "Potresti inviare i dati?", "Richiesta cortese."]],
    [["deadline", "scadenza", "Meet the deadline."], ["take notes", "prendere appunti", "Take notes in the meeting."], ["feedback", "riscontro", "Ask for feedback."], ["raise an issue", "sollevare un problema", "She raised an issue."], ["deal with", "affrontare", "We dealt with the delay."]],
    [["We must ___ the deadline.", ["meet"], "Collocation fissa."], ["Please ___ notes.", ["take"], "Take notes."], ["The report ___ an issue.", ["raises", "raised"], "Raise an issue."]],
    "Scrivi una breve email con una richiesta, una scadenza e un aggiornamento sui progressi.",
    "Manager: The client has moved the deadline to Thursday. Nina: I can finish the figures today, but the report will take longer. Manager: Send me the figures this afternoon.",
    "Capisci cambiamento, possibilità e richiesta finale.",
    [C("What changed?", ["The client", "The deadline", "The report topic"], 1, "The deadline moved to Thursday."), C("What can Nina finish today?", ["The figures", "The report", "Nothing"], 0, "She can finish the figures.")],
    "Could you send me the figures this afternoon? We need to meet the deadline.",
    "Registra una richiesta professionale cortese.",
    ["could you", "figures", "deadline"],
    [C("Natural collocation:", ["do progress", "make progress", "create progress"], 1, "Si dice make progress."), C("Natural request:", ["Could you send it?", "Could you to send it?", "Could send you it?"], 0, "Could + subject + base.")]
  ),

  U("b1-review-problem-solving", 18, "B1", "Riepilogo intermedio B1: risolvere un problema",
    ["Integra present perfect, condizionali, passivo e lessico di lavoro.", "Prima riassumi il problema, poi proponi una soluzione e una condizione.", "Usa il passivo quando l'autore dell'azione non è importante."],
    ["Problem: The deadline has changed.", "Condition: If we start now, we will finish.", "Passive: The report was sent."],
    [["The client has changed the date.", "Il cliente ha cambiato la data.", "Risultato presente."], ["If we share the work, we will finish.", "Se dividiamo il lavoro, finiremo.", "Piano reale."], ["The files were sent yesterday.", "I file sono stati inviati ieri.", "Passivo."]],
    [["adjust", "adattare", "Adjust the schedule."], ["solution", "soluzione", "We need a solution."], ["delay", "ritardo", "There is a delay."], ["priority", "priorità", "This is the priority."], ["review", "rivedere", "Review the report."]],
    [["The date has ___ (change).", ["changed"], "Present perfect."], ["If we start now, we ___ finish.", ["will"], "First conditional."], ["The files were ___ yesterday.", ["sent"], "Passivo."]],
    "Descrivi un problema di lavoro e proponi due soluzioni con if.",
    "The final report has been delayed because some figures were missing. If the team receives them today, the document will be completed tomorrow.",
    "Individua causa, condizione e risultato previsto.",
    [C("Why was the report delayed?", ["The client left", "Figures were missing", "The team was ill"], 1, "Some figures were missing."), C("When can it be completed?", ["Tomorrow, if figures arrive", "Next month", "Never"], 0, "Will be completed tomorrow under the condition.")],
    "The report has been delayed. If we receive the figures today, it will be completed tomorrow.",
    "Fai un aggiornamento orale chiaro e neutro.",
    ["present perfect passive", "if", "will"],
    [C("Correct condition:", ["If they arrive, we will finish.", "If they will arrive, we finish.", "If they arrived, we will finishing."], 0, "First conditional."), C("Passive:", ["The report delayed.", "The report was delayed.", "The report was delay."], 1, "Was + participio.")]
  ),

  U("b2-third-conditional", 19, "B2", "Third conditional e rimpianti",
    ["Il third conditional parla di un passato irreale: la condizione non si è verificata.", "La subordinata usa had + participio; la principale usa would have + participio.", "Serve per analizzare conseguenze, errori e alternative passate."],
    ["If + past perfect, would have + participio.", "If they had left earlier, they would have arrived.", "Could/might have indicano possibilità alternative."],
    [["If I had studied, I would have passed.", "Se avessi studiato, avrei superato.", "Passato irreale."], ["She might have noticed.", "Avrebbe potuto notarlo.", "Possibilità."], ["We should have checked.", "Avremmo dovuto controllare.", "Rimpianto/critica."]],
    [["regret", "rimpiangere", "I regret the decision."], ["miss", "perdere", "We missed the train."], ["earlier", "prima", "We should have left earlier."], ["consequence", "conseguenza", "That was the consequence."], ["avoid", "evitare", "We could have avoided it."]],
    [["If she had studied, she would have ___ the exam.", ["passed"], "Would have + participio."], ["If we ___ left earlier, we would have arrived.", ["had"], "Past perfect."], ["We should have ___ the warning.", ["checked"], "Should have + participio."]],
    "Analizza tre errori passati: cosa è successo e cosa avresti fatto diversamente.",
    "We missed the train because we left home late. If we had checked the traffic, we would have chosen another route and arrived on time.",
    "Ricostruisci causa reale e alternativa immaginaria.",
    [C("Why did they miss the train?", ["They left late", "The train was early", "They forgot tickets"], 0, "They left home late."), C("What would they have changed?", ["The destination", "The route", "The train"], 1, "They would have chosen another route.")],
    "If we had checked the traffic, we would have arrived on time.",
    "Pronuncia le forme contratte had e would in due tentativi.",
    ["had checked", "would have", "participi"],
    [C("Third conditional:", ["If I knew, I would tell.", "If I had known, I would have told.", "If I have known, I will tell."], 1, "Passato irreale completo."), C("Correct:", ["should have check", "should checked", "should have checked"], 2, "Modal + have + participio.")]
  ),

  U("b2-reported-speech", 20, "B2", "Reported speech",
    ["Il reported speech riferisce parole senza citarle direttamente.", "Quando il verbo introduttivo è al passato, il tempo spesso arretra: am/is → was, will → would.", "Say non prende direttamente la persona; tell sì: tell me."],
    ["She said (that) she was tired.", "He told me he would call.", "today → that day; tomorrow → the next day."],
    [["I am busy → She said she was busy.", "Sono occupata → disse che era occupata.", "Backshift."], ["He told me the truth.", "Mi disse la verità.", "Tell + persona."], ["She said she would call.", "Disse che avrebbe chiamato.", "Will → would."]],
    [["report", "riferire", "Report what she said."], ["mention", "menzionare", "He mentioned the delay."], ["claim", "affermare", "They claimed it was true."], ["explain", "spiegare", "She explained the problem."], ["according to", "secondo", "According to the report..."]],
    [["She said she ___ tired.", ["was"], "Is arretra a was."], ["He told ___ he would call.", ["me", "us", "her"], "Tell richiede una persona; più risposte possibili."], ["She said she ___ come later.", ["would"], "Will → would."]],
    "Ascolta una notizia breve e riferiscila in quattro frasi senza copiarla.",
    "Marta said, 'I cannot finish today, but I will send the draft tomorrow.' Her manager asked her to send the most important section first.",
    "Distingui citazione originale e richiesta del manager.",
    [C("What can't Marta finish?", ["The draft today", "The section tomorrow", "The meeting"], 0, "She cannot finish today."), C("What should she send first?", ["Everything", "The important section", "Nothing"], 1, "The manager asks for the most important section.")],
    "Marta said that she could not finish that day, but she would send the draft the next day.",
    "Trasforma oralmente la citazione in discorso indiretto.",
    ["said that", "could not", "would"],
    [C("Correct:", ["She said me she was tired.", "She told me she was tired.", "She told she was tired me."], 1, "Tell + persona."), C("Backshift of will:", ["would", "was", "had"], 0, "Will diventa spesso would.")]
  ),

  U("b2-relative-gerund", 21, "B2", "Relative clauses, gerundio e infinito",
    ["Who introduce persone; which cose; that può introdurre entrambi nelle relative restrittive.", "Dopo enjoy, avoid, suggest e le preposizioni usa normalmente -ing.", "Dopo want, decide, hope e need usa l'infinito con to."],
    ["The person who called...", "I enjoy reading.", "I want to read."],
    [["The book that you lent me is excellent.", "Il libro che mi hai prestato è eccellente.", "Relativa restrittiva."], ["She suggested taking a taxi.", "Suggerì di prendere un taxi.", "Suggest + -ing."], ["I decided to leave.", "Decisi di partire.", "Decide + to."]],
    [["suggest", "suggerire", "She suggested waiting."], ["avoid", "evitare", "Avoid making noise."], ["look forward to", "non vedere l'ora di", "I look forward to meeting you."], ["decision", "decisione", "Make a decision."], ["recommend", "consigliare", "I recommend visiting early."]],
    [["The woman ___ lives next door...", ["who", "that"], "Antecedente persona."], ["I look forward to ___ you.", ["meeting"], "To è preposizione."], ["We decided ___ early.", ["to leave"], "Decide + infinito."]],
    "Descrivi una persona e un oggetto con relative; aggiungi due attività che ami o eviti.",
    "The guide who met us recommended visiting the old market early. We decided to go before breakfast, which helped us avoid waiting in a long queue.",
    "Riconosci relative e verbi seguiti da -ing o infinito.",
    [C("What did the guide recommend?", ["Visiting early", "Sleeping late", "Taking a taxi"], 0, "Recommended visiting early."), C("What did they avoid?", ["Breakfast", "The market", "Waiting in a queue"], 2, "Avoid waiting.")],
    "The guide who met us recommended visiting early, so we decided to go before breakfast.",
    "Ripeti senza interrompere il flusso nella relativa.",
    ["who", "-ing", "to + base"],
    [C("After suggest:", ["to wait", "waiting", "waited to"], 1, "Suggest + -ing."), C("Person relative:", ["which", "who", "where"], 1, "Who per persone.")]
  ),

  U("b2-spoken-nuance", 22, "B2", "Inglese parlato e sfumature",
    ["Le espressioni fisse rendono il parlato naturale e vanno capite come blocchi.", "Fair enough segnala accettazione; It's up to you lascia la decisione all'altro.", "Not exactly e I can see why... permettono una critica o un disaccordo più morbido."],
    ["I'm up for it.", "It's up to you.", "It turns out that ..."],
    [["Fair enough.", "Va bene, capisco.", "Accettazione non necessariamente totale."], ["I didn't mean to.", "Non volevo farlo.", "Nega l'intenzione."], ["I'll let you know.", "Ti farò sapere.", "Promette un aggiornamento."]],
    [["fair enough", "va bene, capisco", "Fair enough, I see your point."], ["up to you", "decidi tu", "It is up to you."], ["let you know", "farti sapere", "I will let you know."], ["turns out", "si scopre", "It turns out we were wrong."], ["not the point", "non è questo il punto", "That is not the point."]],
    [["I'll ___ you know tomorrow.", ["let"], "Espressione fissa."], ["I'm ___ for it.", ["up"], "Significa ci sto."], ["It's up ___ you.", ["to"], "Espressione fissa."]],
    "Scrivi un dialogo con accordo parziale, decisione lasciata all'altro e aggiornamento futuro.",
    "A: We could postpone the meeting. B: Fair enough, although that is not the main issue. A: Shall we ask the team? B: It is up to you. Let me know what they say.",
    "Cogli accordo parziale, obiezione e responsabilità della decisione.",
    [C("Does B fully agree?", ["Clearly yes", "Only partly", "Not at all"], 1, "Fair enough seguito da although mostra accordo parziale."), C("Who should decide?", ["A", "B", "The client"], 0, "It is up to you, rivolto ad A.")],
    "Fair enough, but that is not the point. It is up to you.",
    "Registra la frase con tono fermo ma non aggressivo.",
    ["fair enough", "contrasto con but", "intonazione diplomatica"],
    [C("Meaning of I'm up for it:", ["I am above it.", "I agree to do it.", "I forgot it."], 1, "Espressione informale di disponibilità."), C("Promise an update:", ["I let know you.", "I'll let you know.", "I'll know you."], 1, "Blocco fisso: let you know.")]
  ),

  U("b2-inference-compromise", 23, "B2", "Inferenza e compromesso",
    ["A B2 devi capire anche ciò che è implicito.", "Not exactly transparent è una critica indiretta; short-sighted indica una scelta poco lungimirante.", "On condition that introduce una condizione formale per un compromesso."],
    ["support X on condition that Y.", "I can see why ..., but ...", "I could get behind that = potrei sostenerlo."],
    [["Rejecting it seems short-sighted.", "Respingerlo sembra poco lungimirante.", "Valutazione critica."], ["The council was not exactly transparent.", "Il comune non è stato proprio trasparente.", "Critica attenuata."], ["I could get behind that.", "Potrei sostenere questa idea.", "Accordo."]],
    [["compromise", "compromesso", "We reached a compromise."], ["transparent", "trasparente", "The process was transparent."], ["concern", "preoccupazione", "Address the concern."], ["support", "sostenere", "Support the proposal."], ["put on hold", "sospendere", "The project was put on hold."]],
    [["I could get ___ that.", ["behind"], "Significa sostenere."], ["We agree on ___ that transport improves.", ["condition"], "On condition that."], ["They put the plan on ___.", ["hold"], "Sospendere temporaneamente."]],
    "Riassumi due posizioni opposte e proponi un compromesso condizionato.",
    "Ravi: Rejecting the development altogether seems short-sighted. Elena: The council has not exactly been transparent about traffic. Ravi: What if we supported housing on condition that public transport improved first? Elena: I could get behind that.",
    "Riconosci critica indiretta, condizione e accordo finale.",
    [C("What does Elena imply?", ["The council communicated poorly", "Traffic is perfect", "Housing is cancelled"], 0, "Not exactly transparent è una critica."), C("What is the compromise?", ["Reject everything", "Support housing if transport improves", "Ignore traffic"], 1, "Supporto condizionato al trasporto.")],
    "I can see the concern. I could support the plan on condition that public transport improved first.",
    "Presenta una posizione diplomatica con pausa prima della condizione.",
    ["can see why", "on condition that", "support"],
    [C("Get behind an idea:", ["hide it", "support it", "delay it"], 1, "Significa sostenere."), C("Indirect criticism:", ["not exactly transparent", "perfectly clear", "fully approved"], 0, "Not exactly attenua la critica.")]
  ),

  U("b2-final-mission", 24, "B2", "Riepilogo intermedio B2: proposta argomentata",
    ["Integra strutture avanzate in una risposta chiara, argomentata e diplomatica.", "Presenta il contesto, riporta posizioni, valuta alternative e formula una proposta.", "La verifica premia chiarezza, accuratezza, lessico e capacità di cogliere implicazioni."],
    ["Reported: They said that ...", "Hypothesis: If we had ..., we would have ...", "Compromise: on condition that ..."],
    [["The team said that costs had increased.", "Il gruppo disse che i costi erano aumentati.", "Discorso indiretto."], ["If we had planned earlier, we would have saved time.", "Se avessimo pianificato prima, avremmo risparmiato tempo.", "Third conditional."], ["I support it on condition that we review the results.", "Lo sostengo a condizione di verificare i risultati.", "Compromesso."]],
    [["evidence", "prova", "The evidence supports the claim."], ["outcome", "risultato", "The outcome was positive."], ["trade-off", "compromesso tra vantaggi", "Every option has a trade-off."], ["recommendation", "raccomandazione", "My recommendation is clear."], ["monitor", "monitorare", "We should monitor progress."]],
    [["They said costs had ___ (increase).", ["increased"], "Past perfect."], ["If we had planned, we would have ___ time.", ["saved"], "Participio."], ["I agree on ___ that we review it.", ["condition"], "Espressione formale."]],
    "Registra e scrivi una proposta di 120 parole: problema, due opzioni, rischio, condizione e raccomandazione.",
    "The committee said that the pilot programme had improved attendance, although costs were higher than expected. They recommended extending it for three months on condition that results were reviewed every two weeks.",
    "Cogli risultato, riserva sui costi, raccomandazione e condizione.",
    [C("What improved?", ["Costs", "Attendance", "Transport"], 1, "The programme improved attendance."), C("What condition was added?", ["Weekly payment", "Review every two weeks", "Immediate closure"], 1, "Results must be reviewed every two weeks.")],
    "The evidence is encouraging. I recommend extending the programme on condition that we monitor the results.",
    "Produci una raccomandazione di 30–45 secondi senza leggere.",
    ["tono argomentativo", "recommend", "on condition that"],
    [C("Reported speech:", ["They said costs are increased.", "They said costs had increased.", "They said costs increasing."], 1, "Backshift al past perfect."), C("Formal compromise:", ["on condition that", "because maybe", "if perhaps to"], 0, "On condition that introduce una condizione formale.")]
  )
];

const orderedCurriculum: MobileUnit[] = [
  ...coreCurriculum.filter((unit) => unit.cefr === "A1"),
  ...a1Expansion,
  ...coreCurriculum.filter((unit) => unit.cefr === "A2"),
  ...a2Expansion,
  ...coreCurriculum.filter((unit) => unit.cefr === "B1"),
  ...b1Expansion,
  ...coreCurriculum.filter((unit) => unit.cefr === "B2"),
  ...b2Expansion,
  ...c1Curriculum
];
const a1Durations = [18, 18, 20, 20, 22, 22, 20, 22, 25, 25, 25, 30];
export const mobileCurriculum: MobileUnit[] = orderedCurriculum.map((unit, index) => {
  const levelIndex = orderedCurriculum.slice(0, index).filter((item) => item.cefr === unit.cefr).length;
  return { ...unit, day: index + 1, minutes: unit.cefr === "A1" ? a1Durations[levelIndex] ?? unit.minutes : unit.minutes };
});

export const curriculumIndex = {
  version: 4,
  levels: {
    A1: { days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], goalIt: "Comunicare bisogni immediati e descrivere la vita quotidiana." },
    A2: { days: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], goalIt: "Raccontare esperienze, fare programmi, confrontare e chiedere informazioni." },
    B1: { days: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], goalIt: "Gestire situazioni reali, lavoro, problemi e spiegazioni articolate." },
    B2: { days: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48], goalIt: "Argomentare, cogliere sfumature e formulare proposte precise." },
    C1: { days: [49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60], goalIt: "Padroneggiare sfumature, registro, sintesi critica e comunicazione professionale avanzata." }
  },
  sessionPlan: [
    { phase: "learn", minutes: 4, source: "grammar" },
    { phase: "words", minutes: 3, source: "vocabulary" },
    { phase: "write", minutes: 4, source: "writing" },
    { phase: "listen", minutes: 3, source: "listening" },
    { phase: "speak", minutes: 2, source: "speaking" },
    { phase: "check", minutes: 2, source: "quickCheck" }
  ],
  repeatPolicy: {
    failedItemThreshold: 0.8,
    immediateRetry: true,
    retryOrder: "shuffle",
    spacedReviewDays: [1, 3, 7, 14],
    completionRule: "Completata con almeno 80%; sotto soglia resta in ripasso."
  }
} as const;

export const getUnitByDay = (day: number) =>
  mobileCurriculum.find((unit) => unit.day === day);

export const getUnitsByLevel = (cefr: Cefr) =>
  mobileCurriculum.filter((unit) => unit.cefr === cefr);

