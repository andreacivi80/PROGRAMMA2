export type ExpansionGrammarGuide = {
  overview: string;
  sections: { title: string; text: string; examples?: { en: string; it: string }[] }[];
};

export const a1ExpansionGuides: Record<string, ExpansionGrammarGuide> = {
  "a1-pronouns-possessives": {
    overview: "I pronomi soggetto indicano chi compie l’azione; gli aggettivi possessivi indicano a chi appartiene qualcosa. In inglese il soggetto va quasi sempre espresso, anche quando in italiano può essere sottinteso.",
    sections: [
      { title: "Pronomi soggetto", text: "Usa I, you, he, she, it, we, they prima del verbo. I significa io ed è sempre maiuscolo. It si usa per cose, animali quando il sesso non è importante e situazioni impersonali.", examples: [{ en: "She works in a bank.", it: "Lei lavora in banca." }, { en: "It is cold today.", it: "Oggi fa freddo." }] },
      { title: "Aggettivi possessivi", text: "My, your, his, her, its, our, their vengono prima di un nome e non cambiano al plurale. La scelta dipende dal possessore, non dalla cosa posseduta: Marco and his sister; Anna and her brother.", examples: [{ en: "Their house is small.", it: "La loro casa è piccola." }, { en: "My friends are here.", it: "I miei amici sono qui." }] },
      { title: "Confronto con l’italiano", text: "In italiano il soggetto può sparire: «sono stanco». In inglese serve I am tired. L’articolo normalmente non si usa tra possessivo e nome: my car, non the my car." },
      { title: "Errori da evitare", text: "Non confondere he con his, she con her e they con their. He e she sostituiscono una persona; his, her e their accompagnano un nome." }
    ]
  },
  "a1-there-is-are": {
    overview: "There is e there are servono per dire che una persona o una cosa esiste o si trova in un luogo. Non significano letteralmente «lì è»: introducono qualcosa di nuovo nel discorso.",
    sections: [
      { title: "Singolare e plurale", text: "Usa there is davanti a un nome singolare o non numerabile e there are davanti a un plurale. Nel parlato there is diventa spesso there’s.", examples: [{ en: "There is a pharmacy near here.", it: "C’è una farmacia qui vicino." }, { en: "There are two windows.", it: "Ci sono due finestre." }] },
      { title: "Negativa", text: "Aggiungi not dopo is o are: there isn’t e there aren’t. Con quantità indefinite userai spesso any nella negativa.", examples: [{ en: "There isn’t any milk.", it: "Non c’è latte." }, { en: "There aren’t any buses.", it: "Non ci sono autobus." }] },
      { title: "Domanda", text: "Porta is o are davanti a there: Is there...? Are there...? Nelle risposte brevi ripeti la struttura: Yes, there is; No, there aren’t." },
      { title: "Errore tipico italiano", text: "Non usare have per tradurre automaticamente «c’è» o «ci sono». Have indica possesso; there is/are indica esistenza o presenza." }
    ]
  },
  "a1-have-got": {
    overview: "Have got esprime soprattutto possesso, relazioni, caratteristiche e alcuni disturbi. È molto comune nell’inglese britannico; have senza got è frequente anche nell’inglese americano.",
    sections: [
      { title: "Forma affermativa", text: "Usa have got con I, you, we, they e has got con he, she, it. Le contrazioni sono I’ve got e she’s got.", examples: [{ en: "I have got a new phone.", it: "Ho un telefono nuovo." }, { en: "She has got blue eyes.", it: "Ha gli occhi azzurri." }] },
      { title: "Negativa e domanda", text: "Con la struttura con got usa haven’t got o hasn’t got. Nella domanda porta have/has davanti al soggetto: Have you got...? Has he got...?" },
      { title: "Have got e have", text: "I’ve got a car e I have a car hanno lo stesso significato di possesso. Con have senza got, soprattutto in americano, domanda e negativa usano do/does: Do you have a car?" },
      { title: "Errori da evitare", text: "Non dire he have got: con he/she/it serve has got. Non aggiungere do alla domanda con got: Have you got?, non Do you have got?" }
    ]
  },
  "a1-some-any": {
    overview: "Some e any indicano una quantità non precisa. Si usano con plurali numerabili e nomi non numerabili, ma la scelta dipende normalmente dal tipo di frase e dall’intenzione.",
    sections: [
      { title: "Some nelle affermative", text: "Usa normalmente some nelle frasi affermative: some apples, some water. Non tradurlo sempre: spesso in italiano non diciamo «del» o «alcuni».", examples: [{ en: "We need some bread.", it: "Ci serve del pane." }] },
      { title: "Any in domande e negative", text: "Usa normalmente any nelle domande e nelle negative: Do you have any questions? We don’t have any sugar.", examples: [{ en: "Are there any seats?", it: "Ci sono posti?" }] },
      { title: "Offerte e richieste", text: "Nelle offerte e nelle richieste in cui pensi che la risposta possa essere sì, usa spesso some: Would you like some coffee? Can I have some water?" },
      { title: "Errore tipico", text: "Non usare some automaticamente perché l’italiano dice «del». Prima controlla se la frase inglese è affermativa, interrogativa, negativa oppure un’offerta." }
    ]
  },
  "a1-prepositions-time-place": {
    overview: "In, on e at collegano un evento a un tempo o a un luogo. Le preposizioni inglesi non corrispondono parola per parola a quelle italiane: vanno imparate come schemi ed esempi completi.",
    sections: [
      { title: "Tempo: at, on, in", text: "At indica un’ora o un punto preciso; on giorni e date; in mesi, anni, stagioni e parti del giorno. Dici at 8, on Monday, in July, in the morning, ma at night." },
      { title: "Luogo: at, on, in", text: "At indica un punto o un’attività; on una superficie; in uno spazio chiuso o un’area. Dici at work, on the table, in the room, in Italy." },
      { title: "Espressioni senza preposizione", text: "Con this, next, last ed every normalmente non usare in/on/at: this morning, next week, last year, every Monday." },
      { title: "Metodo pratico", text: "Non memorizzare soltanto la traduzione della preposizione. Impara blocchi: at home, on time, in bed, at the weekend/in the weekend secondo la varietà inglese." }
    ]
  },
  "a1-was-were-past": {
    overview: "Was e were sono il passato di am, is e are. Descrivono identità, stato, età, luogo e situazione in un momento passato; non richiedono did.",
    sections: [
      { title: "Scelta della forma", text: "Usa was con I, he, she, it; usa were con you, we, they. La forma non dipende dal tempo della frase italiana ma dal soggetto inglese.", examples: [{ en: "I was tired yesterday.", it: "Ieri ero stanco." }, { en: "They were at home.", it: "Erano a casa." }] },
      { title: "Negativa", text: "Aggiungi not: was not/wasn’t e were not/weren’t. Mantieni la stessa scelta del soggetto: she wasn’t; we weren’t." },
      { title: "Domande e risposte", text: "Porta was o were prima del soggetto: Was she ready? Were they late? Rispondi Yes, she was oppure No, they weren’t." },
      { title: "Non usare did", text: "Be costruisce da solo domanda e negativa. Did you were tired? è errato; la forma corretta è Were you tired? Questo è diverso dagli altri verbi al Past Simple." }
    ]
  }
};