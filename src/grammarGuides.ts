import { a1ExpansionGuides } from "./a1ExpansionGuides";
import type { MobileUnit } from "./curriculum";

export type GrammarGuide = {
  overview: string;
  sections: {
    title: string;
    text: string;
    examples?: { en: string; it: string }[];
  }[];
};

export const grammarGuides: Record<string, GrammarGuide> = {
  "a1-be-introductions": {
    overview: "Be è il verbo fondamentale per descrivere identità, stato, età, professione, provenienza e posizione. In italiano spesso diciamo «sono», «sto» o «mi trovo»: in inglese queste idee usano normalmente am, is o are.",
    sections: [
      {
        title: "Scelta della forma",
        text: "Usa am soltanto con I; is con he, she, it e con un nome singolare; are con you, we, they e con nomi plurali. You usa sempre are, sia per «tu» sia per «voi».",
        examples: [
          { en: "I am tired, but my friends are fine.", it: "Sono stanco, ma i miei amici stanno bene." },
          { en: "Laura is from Rome.", it: "Laura viene da Roma." },
        ],
      },
      {
        title: "Negativa e domanda",
        text: "Per negare aggiungi not dopo be: am not, is not, are not. Per fare una domanda sposta be prima del soggetto. Non aggiungere do o does.",
        examples: [
          { en: "She isn't at home.", it: "Lei non è a casa." },
          { en: "Are you ready?", it: "Sei pronto?" },
        ],
      },
      {
        title: "Errori tipici",
        text: "Non omettere il verbo: «I happy» è errato, serve I am happy. Per l’età usa be, non have: I am thirty, non I have thirty. Dopo be usa un aggettivo senza articolo: I am tired.",
      },
    ],
  },
  "a1-articles-plurals": {
    overview: "Gli articoli indicano se parliamo di una cosa generica, non ancora identificata, oppure di qualcosa di preciso. Il plurale permette di parlare di due o più elementi.",
    sections: [
      {
        title: "A, an e the",
        text: "Usa a davanti a un suono consonantico e an davanti a un suono vocalico. Conta il suono, non soltanto la lettera. Usa the quando chi ascolta sa già quale persona o cosa intendi.",
        examples: [
          { en: "I need a pen.", it: "Mi serve una penna, una qualsiasi." },
          { en: "The pen on the table is mine.", it: "La penna sul tavolo è mia: è specifica." },
        ],
      },
      {
        title: "Plurali regolari e irregolari",
        text: "Normalmente aggiungi -s. Dopo -s, -sh, -ch, -x e spesso -o aggiungi -es. Una consonante + y diventa -ies. Alcuni plurali vanno imparati: child/children, person/people, man/men.",
      },
      {
        title: "Quando non usare l’articolo",
        text: "Per parlare in generale di nomi plurali o non numerabili spesso non usiamo l’articolo: Dogs are friendly; Water is important. Non usare a/an con un plurale o con un nome non numerabile.",
      },
    ],
  },
  "a1-present-simple-routine": {
    overview: "Il Present Simple descrive abitudini, routine, fatti generali, preferenze e situazioni considerate stabili. Non indica normalmente un’azione che sta avvenendo proprio ora.",
    sections: [
      {
        title: "Quando si usa",
        text: "Usalo per ciò che fai regolarmente, per orari e programmi fissi, per verità generali e con verbi di stato come like, know, want e need.",
        examples: [
          { en: "I take the train every morning.", it: "Prendo il treno ogni mattina." },
          { en: "The shop opens at nine.", it: "Il negozio apre alle nove." },
        ],
      },
      {
        title: "La terza persona",
        text: "Con he, she e it il verbo affermativo prende -s o -es: works, watches, goes. Con consonante + y usa -ies: study diventa studies. Questa modifica vale soltanto nell’affermativa.",
      },
      {
        title: "Do, does e la forma base",
        text: "Nelle domande e negative usa do o does. Dopo does il verbo torna alla forma base: Does she work?, non Does she works? Usa don't e doesn't per negare.",
      },
      {
        title: "Parole-segnale",
        text: "Sono frequenti always, usually, often, sometimes, rarely, never, every day e on Mondays. Gli avverbi di frequenza vanno prima del verbo principale ma dopo be.",
      },
    ],
  },
  "a1-present-continuous": {
    overview: "Il Present Continuous mostra un’azione in corso adesso o una situazione temporanea. Fa vedere l’attività mentre si svolge.",
    sections: [
      {
        title: "Costruzione obbligatoria",
        text: "Servono due parti: am/is/are + verbo in -ing. Non eliminare be. La negativa mette not dopo be; la domanda sposta be prima del soggetto.",
        examples: [
          { en: "They are waiting outside.", it: "Stanno aspettando fuori." },
          { en: "Is Marco working today?", it: "Marco sta lavorando oggi?" },
        ],
      },
      {
        title: "Quando si usa",
        text: "Usalo per azioni che avvengono nel momento in cui parli, per situazioni temporanee e per cambiamenti in corso. Parole comuni: now, right now, at the moment, today, this week.",
      },
      {
        title: "Present Simple o Continuous?",
        text: "I work from home descrive una routine; I am working from home this week descrive una situazione temporanea. Alcuni verbi di stato, come know, like e understand, normalmente non usano -ing.",
      },
    ],
  },
  "a1-questions-can": {
    overview: "Can esprime capacità, possibilità e richieste semplici. Le parole interrogative permettono di chiedere informazioni precise invece di ottenere soltanto sì o no.",
    sections: [
      {
        title: "Can senza to",
        text: "Dopo can usa sempre il verbo base senza to e senza -s: She can drive. La forma è uguale per tutte le persone. La negativa è cannot o can't.",
        examples: [
          { en: "Can you help me?", it: "Puoi aiutarmi?" },
          { en: "He can't swim.", it: "Non sa nuotare." },
        ],
      },
      {
        title: "Domande con una parola interrogativa",
        text: "Metti what, where, when, why, who o how all’inizio. Con can segue can + soggetto + verbo. Con il Present Simple usa invece do/does.",
      },
      {
        title: "Capacità o permesso",
        text: "Can può significare «sapere essere capace» oppure «potere avere il permesso». Il contesto chiarisce il significato: I can speak English; Can I come in?",
      },
    ],
  },
  "a1-review-real-life": {
    overview: "Questa unità riunisce le strutture A1 in situazioni reali: presentarsi, descrivere una routine, parlare di ciò che accade ora e chiedere aiuto.",
    sections: [
      {
        title: "Scegliere il tempo",
        text: "Usa be per identità e stato; il Present Simple per routine e fatti; il Present Continuous per ciò che avviene ora; can per capacità e richieste.",
      },
      {
        title: "Costruire una risposta completa",
        text: "Evita risposte composte da una sola parola. Aggiungi soggetto e verbo: Yes, I can; I work in Milan; I am waiting for the bus.",
      },
      {
        title: "Controllo finale",
        text: "Verifica sempre la presenza del verbo, la -s di he/she/it, l’ausiliare nelle domande e la forma base dopo can, do e does.",
      },
    ],
  },
  "a2-past-simple": {
    overview: "Il Past Simple racconta azioni e situazioni concluse in un momento passato. Il punto essenziale è che l’evento è finito e appartiene a un tempo terminato: ieri, la settimana scorsa, nel 2024 o due ore fa.",
    sections: [
      {
        title: "Quando si usa",
        text: "Usalo per un evento singolo concluso, una sequenza di azioni in una storia, un’abitudine passata terminata o una situazione vera nel passato ma non più attuale.",
        examples: [
          { en: "I called Anna yesterday.", it: "Ho chiamato Anna ieri: l’azione è conclusa." },
          { en: "He opened the door, walked in and sat down.", it: "Aprì la porta, entrò e si sedette: sequenza narrativa." },
        ],
      },
      {
        title: "Verbi regolari e irregolari",
        text: "I regolari aggiungono -ed: work/worked. Se il verbo termina in -e aggiungi soltanto -d; consonante + y diventa -ied; alcuni verbi raddoppiano la consonante. Gli irregolari cambiano forma e vanno studiati: go/went, see/saw, take/took.",
      },
      {
        title: "Did nelle domande e negative",
        text: "Did porta già il passato, quindi il verbo successivo torna alla forma base: Did you go?, non Did you went. La negativa è did not o didn't + verbo base.",
        examples: [
          { en: "She didn't finish the report.", it: "Non ha finito la relazione." },
          { en: "Where did they stay?", it: "Dove hanno soggiornato?" },
        ],
      },
      {
        title: "Be al passato",
        text: "Be non usa did: I/he/she/it was; you/we/they were. La negativa è wasn't/weren't e la domanda inverte was/were con il soggetto.",
      },
      {
        title: "Parole-segnale ed errori",
        text: "Parole frequenti: yesterday, last night, ago, in 2020, then. Non usare il Present Perfect con un tempo passato concluso. Non mescolare did con il verbo al passato.",
      },
    ],
  },
  "a2-past-continuous": {
    overview: "Il Past Continuous descrive un’azione che era in corso in un preciso momento passato. È spesso lo sfondo su cui avviene un evento più breve.",
    sections: [
      {
        title: "Forma",
        text: "Usa was con I/he/she/it e were con you/we/they, poi il verbo in -ing. La negativa aggiunge not; la domanda mette was/were prima del soggetto.",
      },
      {
        title: "Azione lunga e interruzione",
        text: "L’azione in corso usa il Past Continuous; l’evento breve che la interrompe usa il Past Simple.",
        examples: [
          { en: "I was cooking when the phone rang.", it: "Stavo cucinando quando squillò il telefono." },
          { en: "While we were driving, it started to snow.", it: "Mentre guidavamo, iniziò a nevicare." },
        ],
      },
      {
        title: "When e while",
        text: "When introduce spesso l’evento breve; while introduce spesso l’azione in corso. Due azioni contemporanee possono entrambe usare il Past Continuous.",
      },
    ],
  },
  "a2-comparatives": {
    overview: "Comparativi e superlativi servono a confrontare persone, oggetti, luoghi ed esperienze. Il comparativo mette a confronto due elementi; il superlativo individua l’estremo in un gruppo.",
    sections: [
      {
        title: "Aggettivi brevi",
        text: "Aggiungi -er per il comparativo e -est per il superlativo: small/smaller/the smallest. Consonante + y diventa -ier/-iest; alcuni aggettivi raddoppiano la consonante: big/bigger.",
      },
      {
        title: "Aggettivi lunghi",
        text: "Usa more e the most: more interesting, the most comfortable. Non combinare le due regole: more easier è errato.",
      },
      {
        title: "Than, as...as e irregolari",
        text: "Dopo un comparativo usa than. Per uguaglianza usa as + aggettivo + as. Forme irregolari importanti: good/better/best; bad/worse/worst.",
      },
    ],
  },
  "a2-future-forms": {
    overview: "L’inglese sceglie forme future diverse secondo l’intenzione: decisione immediata, previsione, piano già deciso o appuntamento organizzato.",
    sections: [
      {
        title: "Will",
        text: "Usa will per decisioni prese mentre parli, promesse, offerte e previsioni personali. Dopo will usa il verbo base.",
        examples: [
          { en: "I'll answer the phone.", it: "Rispondo io: decisione immediata." },
          { en: "I think it will rain.", it: "Penso che pioverà: previsione." },
        ],
      },
      {
        title: "Be going to",
        text: "Usa am/is/are going to per intenzioni già decise e previsioni basate su una prova visibile. Non dimenticare il verbo be.",
      },
      {
        title: "Present Continuous futuro",
        text: "Usalo per un accordo organizzato con dettagli concreti, spesso con data, ora o luogo: We are meeting at six.",
      },
    ],
  },
  "a2-modals-advice": {
    overview: "I verbi modali modificano il significato del verbo principale: consiglio, obbligo, possibilità o divieto. Sono seguiti dalla forma base senza to.",
    sections: [
      {
        title: "Should",
        text: "Should offre un consiglio o indica ciò che è opportuno, ma non un obbligo forte. La negativa shouldn't sconsiglia un’azione.",
      },
      {
        title: "Must e have to",
        text: "Must esprime spesso un obbligo sentito da chi parla o una regola forte. Have to indica spesso una necessità esterna. Nel passato usa had to.",
      },
      {
        title: "Mustn't e don't have to",
        text: "Non sono sinonimi: mustn't significa «è vietato»; don't have to significa «non è necessario». Questa differenza cambia completamente il messaggio.",
        examples: [
          { en: "You mustn't park here.", it: "È vietato parcheggiare qui." },
          { en: "You don't have to come early.", it: "Non è necessario arrivare presto." },
        ],
      },
    ],
  },
  "a2-review-travel": {
    overview: "Il ripasso A2 applica passato, futuro, confronti e modali alle situazioni di viaggio: prenotare, descrivere un problema, raccontare un’esperienza e fare programmi.",
    sections: [
      {
        title: "Raccontare un viaggio",
        text: "Usa il Past Simple per gli eventi conclusi e il Past Continuous per lo sfondo o un’azione interrotta. Mantieni chiara la sequenza con first, then, after that e finally.",
      },
      {
        title: "Pianificare",
        text: "Usa going to per intenzioni, il Present Continuous per prenotazioni e appuntamenti, will per decisioni immediate e offerte.",
      },
      {
        title: "Risolvere problemi",
        text: "Usa should per consigli, have to per necessità e mustn't per divieti. Nei confronti controlla -er/more e la presenza di than.",
      },
    ],
  },
  ...a1ExpansionGuides,
};

function generatedGuide(unit: MobileUnit): GrammarGuide {
  const examples = unit.grammar.examples.map(({ en, it }) => ({ en, it })),
    explanation = unit.grammar.explanationIt.join(" "),
    structures = unit.grammar.formulas.join(" "),
    notes = unit.grammar.examples.map((example) => example.noteIt).join(" "),
    usefulWords = unit.vocabulary.slice(0, 5).map((word) => word.en).join(", ");
  return {
    overview: `${explanation} La regola va riconosciuta nel significato della frase prima di scegliere la forma: osserva il soggetto, il momento dell’azione e l’intenzione di chi parla.`,
    sections: [
      {
        title: "Significato e uso reale",
        text: `${explanation} Prima di costruire la frase, chiediti quale informazione vuoi comunicare e quale parte deve essere più chiara per chi ascolta.`,
        examples: examples.slice(0, 2),
      },
      {
        title: "Costruzione passo dopo passo",
        text: `Usa questi schemi come controllo: ${structures} Individua prima il soggetto, poi scegli l’ausiliare o la forma verbale e infine completa la frase. Nelle domande e nelle negative controlla con attenzione l’ordine delle parole.`,
        examples: examples.slice(1, 3),
      },
      {
        title: "Confronto con l’italiano",
        text: `La traduzione letterale può produrre un ordine o un tempo verbale innaturale. Parti dal significato complessivo, ricostruisci la frase inglese e soltanto dopo confrontala con l’italiano. ${notes}`,
        examples: examples.slice(0, 3),
      },
      {
        title: "Controllo degli errori frequenti",
        text: `Rileggi la frase in tre passaggi. Controlla la concordanza con il soggetto. Controlla se domanda e negativa richiedono un ausiliare. Controlla che il verbo successivo abbia la forma prevista dallo schema. ${notes}`,
      },
      {
        title: "Uso nel contesto e lessico utile",
        text: `${unit.listening.guideIt} Nel dialogo ascolta la funzione della frase, non soltanto le singole parole. Integra la struttura con il lessico della lezione: ${usefulWords}. Poi crea un esempio personale, perché una regola diventa stabile quando la usi per comunicare qualcosa di vero.`,
        examples: examples.slice(-2),
      },
    ],
  };
}

export function grammarGuideFor(unit: MobileUnit): GrammarGuide {
  const generated = generatedGuide(unit),
    curated = grammarGuides[unit.id];
  if (!curated) return generated;
  const extra = generated.sections.filter((section) =>
    ["Confronto con l’italiano", "Controllo degli errori frequenti", "Uso nel contesto e lessico utile"].includes(section.title),
  );
  const sections = [...curated.sections, ...extra].map((section) => ({
    ...section,
    text:
      section.text.length >= 120
        ? section.text
        : `${section.text} Verifica la regola costruendo una frase affermativa, una negativa e una domanda; poi confronta ogni forma con gli esempi della lezione.`,
  }));
  return { overview: curated.overview, sections };
}
