export type StoryBranchSupport = {
  consequences: string[];
  speakingPrompt: string;
  keywords: string[];
};

export const storyBranchSupport: Record<string, StoryBranchSupport> = {
  "story-a1-1": {
    consequences: ["Quello è l'appartamento di Tom: rileggi chi pronuncia ciascun numero.", "Esatto: Maya abita al dodici e Tom al dieci.", "Nessuno dei due vive in hotel: la scena si svolge nel loro palazzo."],
    speakingPrompt: "Presentati a Tom: dì il tuo nome, la tua città e concludi in modo cortese.",
    keywords: ["i'm", "from", "nice to meet you"],
  },
  "story-a1-2": {
    consequences: ["Esatto: Maya porta via un caffè e un panino.", "Nel dialogo ordina un solo caffè.", "Non ordina né insalata né acqua."],
    speakingPrompt: "Ordina una bevanda e qualcosa da mangiare, poi specifica che è da asporto.",
    keywords: ["i'd like", "please", "to go"],
  },
  "story-a1-3": {
    consequences: ["La banca è un punto di riferimento, non la posizione finale.", "Esatto: la biblioteca è accanto alla farmacia.", "La stazione non compare nelle indicazioni."],
    speakingPrompt: "Dai due indicazioni e spiega su quale lato si trova la destinazione.",
    keywords: ["go straight", "turn", "on your"],
  },
  "story-a2-1": {
    consequences: ["Esatto: Maya preferisce partire più tardi, anche pagando di più.", "Il biglietto più economico non è la sua priorità.", "L'autobus non viene proposto nella scena."],
    speakingPrompt: "Proponi una destinazione e spiega a che ora preferiresti partire.",
    keywords: ["why don't we", "i'd rather", "leave"],
  },
  "story-a2-2": {
    consequences: ["Non arrivano in anticipo: il treno è in ritardo.", "Esatto: Tom ha telefonato all'hotel.", "Maya compra del cibo, non paga di nuovo la camera."],
    speakingPrompt: "Spiega il ritardo e dì quale soluzione avete già trovato.",
    keywords: ["has been delayed", "already", "called"],
  },
  "story-a2-3": {
    consequences: ["Maya non se ne va: segnala il problema con calma.", "Esatto: il cameriere sostituisce il piatto.", "Tom non mangia entrambi i piatti."],
    speakingPrompt: "Fai un reclamo gentile, specifica cosa avevi ordinato e chiedi la sostituzione.",
    keywords: ["i ordered", "but", "could you"],
  },
  "story-b1-1": {
    consequences: ["Il materiale può essere riutilizzato: non è questo il limite.", "Esatto: mancano dati finanziari abbastanza chiari.", "Maya è presente e sta illustrando la proposta.", "Il risparmio è possibile, non ancora garantito."],
    speakingPrompt: "Presenta un vantaggio della proposta, poi riconosci un limite ancora da verificare.",
    keywords: ["more expensive", "but", "save money"],
  },
  "story-b1-2": {
    consequences: ["Esatto: manca il rapporto di un fornitore.", "Il manager non ha chiesto un confronto diverso.", "Non si parla di un test fallito.", "È il team, non il fornitore, a rinviare la presentazione."],
    speakingPrompt: "Dai un aggiornamento professionale: spiega cosa manca e fino a quando è rinviata la presentazione.",
    keywords: ["put off", "because", "waiting for"],
  },
  "story-b1-3": {
    consequences: ["Non rifiutano il materiale: scelgono una prova limitata.", "Non cambiano tutti i prodotti.", "Esatto: avviano prima un test su un solo prodotto.", "L'approvazione definitiva arriverà soltanto dopo il test."],
    speakingPrompt: "Esprimi accordo con una condizione e indica quando rivalutare i risultati.",
    keywords: ["i agree", "provided that", "review"],
  },
  "story-b2-1": {
    consequences: ["Esatto: la prova può essere pertinente, ma campione e verifica ne limitano la solidità.", "Maya non dice che la prova è robusta.", "Il campione è piccolo, non grande; il costo del laboratorio non è citato.", "La verifica indipendente è proprio ciò che Maya sta chiedendo."],
    speakingPrompt: "Chiedi come è stato selezionato il campione e se i risultati sono stati verificati indipendentemente.",
    keywords: ["could you clarify", "sample", "independently verified"],
  },
  "story-b2-2": {
    consequences: ["Esatto: gli aumenti futuri possono annullare il vantaggio iniziale.", "L'impegno è lungo e il prezzo può aumentare.", "Il testo parla di aumenti annuali, non di riduzioni.", "La consegna non è indicata come causa del prezzo."],
    speakingPrompt: "Spiega il rischio del prezzo variabile e proponi una condizione contrattuale più sicura.",
    keywords: ["initial price", "annual increase", "fixed price"],
  },
  "story-b2-3": {
    consequences: ["Il rischio non ricade soltanto sul compratore.", "Esatto: entrambe le parti assumono obblighi misurabili.", "Il fornitore non garantisce il successo e accetta una riduzione di prezzo.", "Gli obblighi valgono durante e alla fine del progetto pilota."],
    speakingPrompt: "Riassumi durata, obiettivi misurabili e conseguenza economica dell'accordo.",
    keywords: ["one-year pilot", "measurable targets", "adjusted"],
  },
  "story-c1-1": {
    consequences: ["Esatto: il linguaggio inclusivo contrasta con uno spazio negoziale molto ristretto.", "È la presidente a volere l'attuazione immediata.", "I partecipanti dubitano che la consultazione sia sostanziale.", "Il calendario è rigido, non flessibile.", "I partecipanti contestano anche la possibilità di incidere sull'esito."],
    speakingPrompt: "Valuta la consultazione concedendo il tono inclusivo ma mettendo in dubbio la possibilità di influenzare l'esito.",
    keywords: ["although", "inclusive", "influence the outcome"],
  },
  "story-c1-2": {
    consequences: ["La dimensione del calo non è il problema centrale indicato.", "Esatto: il nuovo sistema di segnalazione è una spiegazione alternativa plausibile.", "Il testo non afferma che il progetto pilota abbia causato il calo.", "Il cambiamento può aver ridotto i casi registrati senza migliorare il servizio.", "L'affidabilità stessa del numero registrato è in discussione."],
    speakingPrompt: "Distingui correlazione e causalità e cita il cambiamento concomitante nella segnalazione.",
    keywords: ["does not establish causality", "since", "reporting"],
  },
  "story-c1-3": {
    consequences: ["Maya non pretende di eliminare ogni incertezza.", "Esatto: vuole rendere le conclusioni future metodologicamente più difendibili.", "Il nuovo test introduce trasparenza e un gruppo di confronto.", "La rendicontazione trasparente viene rafforzata, non sostituita.", "Un gruppo di confronto riduce l'incertezza, ma non la elimina del tutto."],
    speakingPrompt: "Formula una raccomandazione equilibrata con una condizione sulla trasparenza e sul gruppo di controllo.",
    keywords: ["further trial", "provided that", "control group"],
  },
};

const normalise = (value: string) => value.toLocaleLowerCase("en").replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

export const evaluateStorySpeech = (transcript: string, keywords: string[]) => {
  const heard = normalise(transcript);
  const matched = keywords.filter(keyword => heard.includes(normalise(keyword)));
  return { matched, percent: Math.round((matched.length / Math.max(1, keywords.length)) * 100) };
};
