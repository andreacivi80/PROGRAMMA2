import type { Choice } from "./curriculum";
import type { ThemePack } from "./themePacks";

const q = (prompt: string, options: string[], answer: number, explanationIt: string): Choice => ({ prompt, options, answer, explanationIt });

export const languageFocusPacks: ThemePack[] = [
  {
    id: "language-a1-verbs-friends", category: "language", level: "A1", title: "Verbi essenziali e primi false friends", minutes: 22, introducedIn: "3.1",
    summary: "Scegliere be, have e do e non farsi ingannare dalle parole simili all’italiano.",
    guide: [
      "Be descrive identità e stato: I am tired. Have indica possesso: I have a car.",
      "Do è un verbo autonomo in I do my homework, ma aiuta anche a formare domande: Do you work?",
      "Parents significa genitori, non parenti. I parenti sono relatives.",
      "Library significa biblioteca. La libreria dove si comprano libri è bookshop o bookstore."
    ],
    vocabulary: [
      { en: "be", it: "essere", example: "I am ready." }, { en: "have", it: "avere", example: "We have two tickets." },
      { en: "do", it: "fare/ausiliare", example: "Do you work here?" }, { en: "parents", it: "genitori", example: "My parents live in Turin." },
      { en: "relatives", it: "parenti", example: "We visit our relatives." }, { en: "library", it: "biblioteca", example: "I study at the library." },
      { en: "bookshop", it: "libreria/negozio", example: "I bought it at the bookshop." }, { en: "actually", it: "in realtà", example: "Actually, I am from Bari." }
    ],
    scenario: { title: "Meeting a new colleague", text: "Anna: Are your parents in Milan? Tom: No, actually they live in Turin. Anna: Do they work there? Tom: Yes. My mother works in a library, and my father has a small bookshop.", translation: "Tom distingue genitori, biblioteca e libreria e usa be, do e have con funzioni diverse." },
    questions: [
      q("Where does Tom’s mother work?", ["In a library", "In a bookshop", "At home"], 0, "Library significa biblioteca."),
      q("What does actually introduce?", ["A correction or clarification", "A future plan", "A possession"], 0, "Actually significa in realtà, non attualmente.")
    ]
  },
  {
    id: "language-a2-past-participle", category: "language", level: "A2", title: "Past Simple, participio e false friends", minutes: 28, introducedIn: "3.1",
    summary: "Distinguere il passato concluso dalla forma del participio e scegliere il verbo corretto.",
    guide: [
      "Past Simple racconta un fatto concluso: I went yesterday. Went è il passato di go.",
      "Il Past Participle non è un tempo autonomo: si usa con have, come in I have gone. Il participio di go è gone.",
      "Con un momento passato concluso — yesterday, last week, in 2024 — usa normalmente il Past Simple.",
      "Attend significa partecipare/frequentare; assistere qualcuno è help. Assist esiste, ma significa aiutare."
    ],
    vocabulary: [
      { en: "went", it: "andò/è andato (Past Simple)", example: "We went there yesterday." }, { en: "gone", it: "andato (participio)", example: "She has gone home." },
      { en: "saw", it: "vide/ha visto (Past Simple)", example: "I saw him last night." }, { en: "seen", it: "visto (participio)", example: "I have seen that film." },
      { en: "attend", it: "partecipare/frequentare", example: "I attended the meeting." }, { en: "assist", it: "aiutare", example: "A nurse assisted the doctor." },
      { en: "eventually", it: "alla fine", example: "Eventually, the bus arrived." }, { en: "currently", it: "attualmente", example: "I currently work in Rome." }
    ],
    scenario: { title: "After a training course", text: "Sara: Did you attend the course yesterday? Mark: Yes, I went with Luca. I have never seen that trainer before. Sara: Was it useful? Mark: Yes. Eventually, we understood the new procedure.", translation: "Il dialogo usa Past Simple con yesterday e il participio seen dopo have." },
    questions: [
      q("Why is went used?", ["The action happened yesterday", "It follows have", "It is a future plan"], 0, "Yesterday colloca l’azione in un passato concluso."),
      q("Which form follows have in the dialogue?", ["Seen", "Saw", "See"], 0, "Dopo have serve il participio seen.")
    ]
  },
  {
    id: "language-b1-perfect-continuous", category: "language", level: "B1", title: "Past, Perfect e Continuous senza confusione", minutes: 32, introducedIn: "3.1",
    summary: "Usare tempo e aspetto in base al rapporto fra azione, durata e risultato presente.",
    guide: [
      "Past Simple risponde a quando? con un tempo concluso: I finished at six.",
      "Present Perfect collega passato e presente senza indicare un momento concluso: I have finished, so I can leave.",
      "Present Perfect Continuous insiste sulla durata o sull’attività: I have been working for three hours.",
      "Sensible significa ragionevole; sensitive significa sensibile. Argument spesso significa litigio, non argomento."
    ],
    vocabulary: [
      { en: "finished", it: "finito in un momento concluso", example: "I finished at six." }, { en: "have finished", it: "ho finito, risultato attuale", example: "I have finished the report." },
      { en: "have been working", it: "lavoro da/ho lavorato continuativamente", example: "I have been working since nine." }, { en: "since", it: "da un momento iniziale", example: "She has lived here since May." },
      { en: "for", it: "da una durata", example: "She has lived here for a year." }, { en: "sensible", it: "ragionevole", example: "That is a sensible plan." },
      { en: "sensitive", it: "sensibile/delicato", example: "This is sensitive information." }, { en: "argument", it: "litigio/argomentazione", example: "They had an argument." }
    ],
    scenario: { title: "A delayed report", text: "Nina: Have you finished the report? Paul: Not yet. I have been checking the figures since nine. Nina: Did you find the error yesterday? Paul: Yes, but I have discovered another problem today. We need a sensible solution.", translation: "Le forme cambiano secondo risultato presente, durata e momento passato concluso." },
    questions: [
      q("Which form emphasises duration?", ["Have been checking", "Did find", "Finished at six"], 0, "Il Perfect Continuous mette in primo piano l’attività durata da un momento iniziale."),
      q("Why is did used with yesterday?", ["Yesterday is a finished past time", "The action is still continuing", "It is a passive"], 0, "Yesterday richiede normalmente il Past Simple.")
    ]
  },
  {
    id: "language-b2-narrative-verbs", category: "language", level: "B2", title: "Tempi narrativi e false friends professionali", minutes: 36, introducedIn: "3.1",
    summary: "Ordinare gli eventi con Past Simple, Past Continuous e Past Perfect e usare lessico preciso.",
    guide: [
      "Past Continuous costruisce lo sfondo: We were testing the device when the alarm sounded.",
      "Past Simple indica l’evento principale: the alarm sounded.",
      "Past Perfect segnala l’azione già conclusa prima di un altro momento passato: the sensor had failed.",
      "Comprehensive significa completo; comprensivo nel senso di tollerante è understanding. Eventually significa alla fine."
    ],
    vocabulary: [
      { en: "was testing", it: "stava testando", example: "She was testing the sample." }, { en: "failed", it: "si guastò/fallì", example: "The sensor failed at noon." },
      { en: "had failed", it: "si era già guastato", example: "The sensor had failed before the test." }, { en: "eventually", it: "alla fine", example: "They eventually found the cause." },
      { en: "comprehensive", it: "completo/esauriente", example: "We need a comprehensive review." }, { en: "understanding", it: "comprensivo/tollerante", example: "The client was understanding." },
      { en: "fabric", it: "tessuto", example: "The fabric was damaged." }, { en: "factory", it: "fabbrica", example: "The factory closed temporarily." }
    ],
    scenario: { title: "Reconstructing an incident", text: "The team was testing a new device when the warning light appeared. The main sensor had failed before the operator started the final sequence, but nobody had noticed the earlier signal. The team stopped the test and eventually identified the cause in a comprehensive review.", translation: "Lo sfondo usa il Continuous; gli eventi principali il Past Simple; ciò che era avvenuto prima usa il Past Perfect." },
    questions: [
      q("What had happened before the final sequence?", ["The sensor had failed", "The review started", "The factory closed"], 0, "Had failed colloca il guasto prima dell’avvio della sequenza."),
      q("What does comprehensive mean here?", ["Complete and detailed", "Patient and kind", "Temporary"], 0, "Comprehensive è completo/esauriente.")
    ]
  },
  {
    id: "language-c1-aspect-nuance", category: "language", level: "C1", title: "Aspetto verbale, distanza temporale e precisione", minutes: 40, introducedIn: "3.1",
    summary: "Interpretare le scelte verbali avanzate e neutralizzare false friends formali.",
    guide: [
      "Il tempo localizza l’evento; l’aspetto mostra come il parlante lo osserva: completo, in corso, anteriore o rilevante ora.",
      "Present Perfect Continuous può suggerire durata e conseguenza visibile: The team has been revising the protocol.",
      "Past Perfect è utile quando l’anteriorità non è già ovvia; usarlo in ogni frase rende la narrazione pesante.",
      "Eventually è alla fine; possibly è forse. Pretend significa fingere, mentre intend significa avere intenzione."
    ],
    vocabulary: [
      { en: "has been revising", it: "sta revisionando da tempo", example: "The team has been revising the protocol." }, { en: "had overlooked", it: "aveva trascurato", example: "The audit found what we had overlooked." },
      { en: "eventually", it: "alla fine", example: "The board eventually approved it." }, { en: "possibly", it: "forse/possibilmente", example: "This could possibly change." },
      { en: "pretend", it: "fingere", example: "We cannot pretend the risk is zero." }, { en: "intend", it: "avere intenzione", example: "We intend to repeat the study." },
      { en: "consistent", it: "coerente/costante", example: "The findings are consistent." }, { en: "eventual", it: "finale/futuro", example: "The eventual outcome remains uncertain." }
    ],
    scenario: { title: "Explaining a revised conclusion", text: "The researchers have been revising the report because the first analysis had overlooked a small but consistent pattern. They do not intend to exaggerate its importance, nor can they pretend that it is irrelevant. The eventual conclusion will depend on data that the team is currently collecting.", translation: "La scelta dell’aspetto distingue attività in corso, anteriorità, intenzione e risultato futuro." },
    questions: [
      q("Why is had overlooked used?", ["The omission happened before the revision", "It is happening now", "It is a future intention"], 0, "Il Past Perfect segnala un fatto precedente alla revisione."),
      q("What does eventual conclusion mean?", ["The final conclusion", "A possible conclusion", "An accidental conclusion"], 0, "Eventual significa finale/futuro, non eventuale nel senso italiano.")
    ]
  }
];
