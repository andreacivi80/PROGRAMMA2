# English Coach 5.3 — stato verificato

Legenda: **IMPLEMENTATO**, **VERIFICATO**, **NON APPLICABILE**, **RINVIATO CON MOTIVAZIONE**.

## 1. Versione e consegna

- **VERIFICATO** — sorgenti, versione web e pubblicazione usano la stessa build 5.2, con data e identificativo visibili.
- **NON APPLICABILE** — non esistono più una versione Electron e uno ZIP separati: il prodotto corrente è una PWA web unica sul link permanente.
- **IMPLEMENTATO** — cache aggiornata senza cancellare i progressi locali.

## 2–4. Percorso, ripresa e livello

- **IMPLEMENTATO** — primo accesso, test facoltativo, livello manuale, obiettivo, durata e prima attività.
- **VERIFICATO** — pagina, livello, tema, scroll, lezione, fase, domanda e testi in corso vengono conservati.
- **IMPLEMENTATO** — home con continuazione, ripasso e scelta libera; allenamento su misura chiuso e percorso libero aperto.
- **IMPLEMENTATO** — cinque livelli CEFR A1–C1 con 12 lezioni ciascuno; nessun livello numerico 1–50 ambiguo.
- **IMPLEMENTATO** — tutti i livelli sono accessibili senza lucchetti e non avanzano dopo una singola risposta.

## 5–6. Ripasso e quaderno degli errori

- **IMPLEMENTATO** — elementi con tipo, livello, domanda, risposta, soluzione, tentativi, date, stato e prossimo ripasso.
- **IMPLEMENTATO** — intervalli progressivi, riduzione dopo errore, consolidamento dopo risposte corrette e varianti dello stesso concetto.
- **IMPLEMENTATO** — conteggio in home, ripasso odierno, ricerca e filtri per tipo, livello, data e stato.
- **IMPLEMENTATO** — regola collegata, spiegazione, esempio nuovo, audio, riprova, “Ho capito” e storico.

## 7–8. Contenuti e formattazione

- **VERIFICATO** — 60 lezioni, durata 18–45 minuti e almeno 22 elementi nella banca di ogni unità.
- **VERIFICATO** — nessun duplicato esatto o ad alta similarità rilevato; risposte, spiegazioni, audio e identificativi controllati.
- **IMPLEMENTATO** — grammatica, lessico, ascolto, lettura, scrittura, parlato, interazione, mediazione e verifiche.
- **IMPLEMENTATO** — inglese evidenziato, concetti separati, feedback con testo e icona oltre al colore.

## 9. Missioni reali

- **IMPLEMENTATO** — 26 percorsi tematici con obiettivo, guida, lessico, scenario, comprensione, risposta libera, ripetizione orale e risultato.
- **IMPLEMENTATO** — ristorante, cucina, social, lavoro, IRA, cosmetica, medical device, packaging, lingua e accenti.
- **IMPLEMENTATO** — gli errori delle missioni entrano nel quaderno personale.

## 10. Giochi didattici

- **IMPLEMENTATO** — abbinamenti, costruisci la frase, trova l’errore, dettato, parola mancante e minimal pairs.
- **IMPLEMENTATO** — shadowing, dialogo a bivi, definizione in inglese, mediazione, famiglie di parole e sfida quotidiana.
- **IMPLEMENTATO** — cruciverba, impiccato, Milionario e Trivia con livello selezionabile.

## 11–12. Listening e pronuncia

- **IMPLEMENTATO** — audio locale prioritario, sintesi vocale come alternativa, velocità, pausa, ripresa, stop e arresto al cambio attività.
- **IMPLEMENTATO** — trascrizione contenuta e sincronizzata, segmenti riascoltabili, dettato e domande generali/dettagliate.
- **IMPLEMENTATO** — scelta britannica/americana applicata anche al riconoscimento vocale.
- **IMPLEMENTATO** — registrazione visibile, nuovo tentativo, riascolto della propria voce e parole non riconosciute riascoltabili.
- **VERIFICATO** — l’interfaccia parla correttamente di “parole riconosciute”, non di analisi fonetica completa.
- **RINVIATO CON MOTIVAZIONE** — fonemi, accento e ritmo specialistici richiedono un motore fonetico dedicato non disponibile offline.
- **RINVIATO CON MOTIVAZIONE** — accenti regionali autentici e rumore ambientale richiedono registrazioni umane con licenze verificate; non vengono simulati falsamente.

## 13. Writing Lab

- **IMPLEMENTATO** — frase, testo libero, mail, reclamo, sintesi, opinione, confronto, mediazione e risposte professionali nei laboratori e nelle lezioni.
- **IMPLEMENTATO** — controlli locali dichiarati esplicitamente come controlli di base.
- **RINVIATO CON MOTIVAZIONE** — correzione completa di naturalezza e coerenza richiede un correttore linguistico/AI esterno; le verifiche locali non vengono presentate come equivalenti.

## 14–15. Tempo ed esami

- **IMPLEMENTATO** — scelte 5, 15, 30 minuti e sessione completa con composizione diversa e salvataggio del punto raggiunto.
- **IMPLEMENTATO** — tempo realmente trascorso calcolato dall’inizio alla conclusione, non attribuito con valore fisso.
- **IMPLEMENTATO** — esame per livello con grammatica, vocabolario, contesto, lettura, ascolto, scrittura, parlato e mediazione.
- **IMPLEMENTATO** — rapporto 0–100%, confronto precedente, aree forti/deboli, consiglio e stampa/PDF.

## 16–17. Dashboard e motivazione

- **IMPLEMENTATO** — CEFR, sottolivello, tempo, giorni, attività, parole, ripassi, errori, competenze, settimana, mese ed ultimo esame.
- **IMPLEMENTATO** — date locali, obiettivo settimanale, riepilogo, messaggi sobri e sospensione della serie.
- **VERIFICATO** — nessuna classifica obbligatoria o penalizzazione aggressiva.

## 18–20. Grafica, accessibilità e dati

- **IMPLEMENTATO** — layout compatto, modalità chiara/scura, testo regolabile, focus visibile, riduzione animazioni e controlli tattili.
- **VERIFICATO** — nessun pulsante privo di gestore; quiz visivi contenuti e nessun comando basato soltanto sul trascinamento.
- **IMPLEMENTATO** — esportazione, importazione validata, migrazioni, azzeramento con conferma e salvataggio automatico.
- **RINVIATO CON MOTIVAZIONE** — una certificazione formale WCAG 2.2 AA richiede audit manuale con tecnologie assistive e dispositivi esterni.

## 21–22. Prestazioni e controllo

- **IMPLEMENTATO** — sezioni pesanti caricate soltanto all’apertura; build locale esclusa dalla cartella sorgente finale.
- **VERIFICATO** — 221 pulsanti, audio, stop, velocità, salti, ripassi, giochi, missioni e persistenza coperti dagli audit statici.
- **VERIFICATO** — test automatici per 60 lezioni, 30 prove d’ingresso, profili CEFR, duplicati, banche esercizi e struttura UI.
- **RINVIATO CON MOTIVAZIONE** — prove fisiche complete su ogni combinazione di microfono, screen reader e zoom richiedono la relativa matrice di dispositivi.

## 23–24. Vincoli finali

- **VERIFICATO** — nessun progresso viene azzerato e lo schema dati conserva le migrazioni precedenti.
- **VERIFICATO** — nessun pulsante dimostrativo e nessun commento tecnico di servizio nell’interfaccia.
- **VERIFICATO** — una sola versione pubblica, stesso link e versione sempre visibile nell’intestazione.
