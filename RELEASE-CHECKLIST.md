# English Coach 9.7 — stato verificato

Legenda: **IMPLEMENTATO**, **VERIFICATO**, **NON APPLICABILE**, **RINVIATO CON MOTIVAZIONE**.

## 1. Versione e consegna

- **VERIFICATO** — sorgenti e versione web usano la stessa build 9.7, con data e identificativo visibili; la pubblicazione viene aggiornata soltanto dopo il collaudo completo.
- **IMPLEMENTATO** — tre controllori permanenti e indipendenti verificano contenuti didattici, interazioni reali e build/browser; ogni futura revisione esegue automaticamente tutti e tre.
- **NON APPLICABILE** — non esistono più una versione Electron e uno ZIP separati: il prodotto corrente è una PWA web unica sul link permanente.
- **IMPLEMENTATO** — cache aggiornata senza cancellare i progressi locali.
- **VERIFICATO** — i nomi dell’archivio locale restano stabili tra le revisioni: una nuova pubblicazione sostituisce l’interfaccia, non i dati dell’utente.
- **VERIFICATO** — l’attivazione di una nuova versione non ricarica forzatamente una sessione aperta: l’utente può terminare l’attività e riceve la nuova interfaccia alla successiva apertura o al refresh volontario.

## 2–4. Percorso, ripresa e livello

- **IMPLEMENTATO** — il primo accesso mostra soltanto “Primi passi”, con test da 30 domande oppure scelta manuale di livello e obiettivo; non propone ripassi prima dell’avvio.
- **VERIFICATO** — “Primo accesso” si apre automaticamente al primo utilizzo e resta sempre disponibile nella barra per rifare il test o controllare la scelta iniziale.
- **VERIFICATO** — nella schermata Oggi esiste un solo selettore del livello; la scelta aggiorna insieme allenamento su misura, percorso libero e contenuti proposti.
- **VERIFICATO** — pagina, livello, tema, scroll, lezione, fase, domanda e testi in corso vengono conservati.
- **IMPLEMENTATO** — home con continuazione, ripasso e scelta libera; allenamento su misura chiuso e percorso libero aperto.
- **IMPLEMENTATO** — la home propone una sola azione prioritaria: ripasso dovuto, prerequisito da consolidare oppure prima lezione incompleta del livello salvato.
- **VERIFICATO** — il livello si modifica prima della durata; la scelta viene salvata e il pannello 5/15/30 minuti si apre e si chiude senza cambiare pagina.
- **VERIFICATO** — dopo un errore registrato la proposta principale diventa immediatamente un ripasso mirato; la home mobile misura 1.088 px contro i 1.116 px della V6.8.
- **IMPLEMENTATO** — cinque livelli CEFR A1–C1 con 12 lezioni ciascuno; nessun livello numerico 1–50 ambiguo.
- **IMPLEMENTATO** — tutti i livelli sono accessibili senza lucchetti e non avanzano dopo una singola risposta.

## 5–6. Ripasso e quaderno degli errori

- **IMPLEMENTATO** — elementi con tipo, livello, domanda, risposta, soluzione, tentativi, date, stato e prossimo ripasso.
- **IMPLEMENTATO** — intervalli progressivi, riduzione dopo errore, consolidamento dopo risposte corrette e varianti dello stesso concetto.
- **IMPLEMENTATO** — conteggio in home, ripasso odierno, ricerca e filtri per tipo, livello, data e stato.
- **IMPLEMENTATO** — regola collegata, spiegazione, esempio nuovo, audio, riprova, “Ho capito” e storico.
- **VERIFICATO** — il recupero conserva le opzioni della domanda originale e non costruisce più alternative pescando casualmente dall’intero corso; se non esiste una variante credibile, non inventa una domanda.

## 7–8. Contenuti e formattazione

- **VERIFICATO** — 60 lezioni, durata 18–45 minuti e almeno 15 esercizi supplementari credibili nella banca di ogni unità.
- **VERIFICATO** — nessun duplicato esatto o ad alta similarità rilevato; risposte, spiegazioni, audio e identificativi controllati.
- **IMPLEMENTATO** — grammatica, lessico, ascolto, lettura, scrittura, parlato, interazione, mediazione e verifiche.
- **IMPLEMENTATO** — inglese evidenziato, concetti separati, feedback con testo e icona oltre al colore.
- **VERIFICATO** — 1.005 frasi grammaticali sono analizzate nel loro contesto completo; i suggerimenti italiani e le formule ibride non vengono più trattati come parole inglesi.
- **VERIFICATO** — la schermata B1 del Present Perfect controlla esplicitamente che “ancora in corso”, “rapporto tra i parlanti” e “rileggi la frase in tre passaggi” restino testo italiano normale.
- **IMPLEMENTATO** — le formule non sono ripetute nella spiegazione: compaiono una sola volta nello schema rapido dedicato.
- **VERIFICATO** — tutte le 60 lezioni hanno una guida grammaticale di almeno cinque sezioni con uso, costruzione, confronto con l’italiano, errori frequenti e applicazione nel contesto.
- **VERIFICATO** — 1.415 domande tra percorso, letture, temi ed extra hanno indice, opzioni e spiegazione coerenti; le verifiche avanzate provano fino a 15.460 generazioni casuali senza alternative estranee o riempitive.
- **VERIFICATO** — un secondo motore indipendente controlla 1.302 famiglie uniche con matrice CEFR, indizi involontari nella risposta, lunghezza anomala, assoluti-spia e mutazioni artificiali; rileva 4 difetti seminati su 4 e non lascia anomalie bloccanti.
- **VERIFICATO** — il terzo motore metamorfico controlla 53.882 domande e 200.402 rotazioni: soluzione, spiegazione e riconoscimento restano coerenti con qualsiasi posizione. La casualizzazione unica Fisher–Yates copre tutte le 24 permutazioni senza modificare le banche originali.

## 9. Missioni reali

- **IMPLEMENTATO** — 26 percorsi tematici con obiettivo, guida, lessico, scenario, comprensione, risposta libera, ripetizione orale e risultato.
- **IMPLEMENTATO** — ristorante, cucina, social, lavoro, IRA, cosmetica, medical device, packaging, lingua e accenti.
- **IMPLEMENTATO** — gli errori delle missioni entrano nel quaderno personale.

## 10. Giochi didattici

- **IMPLEMENTATO** — abbinamenti, costruisci la frase, trova l’errore, dettato, parola mancante e minimal pairs.
- **IMPLEMENTATO** — shadowing, dialogo a bivi, definizione in inglese, mediazione, famiglie di parole e sfida quotidiana.
- **IMPLEMENTATO** — cruciverba, impiccato, Milionario e Trivia con livello selezionabile.
- **IMPLEMENTATO** — “La risposta naturale” propone 50 dialoghi distinti per livello, con registro quotidiano, professionale e formale e alternative progressivamente più vicine.
- **IMPLEMENTATO** — le 15 storie a episodi mostrano conseguenze specifiche per ogni scelta e permettono una risposta orale facoltativa con trascrizione e riscontro sugli elementi essenziali riconosciuti.

## 11–12. Listening e pronuncia

- **IMPLEMENTATO** — audio locale prioritario, sintesi vocale come alternativa, velocità, pausa, ripresa, stop e arresto al cambio attività.
- **IMPLEMENTATO** — trascrizione contenuta e sincronizzata, segmenti riascoltabili, dettato e domande generali/dettagliate.
- **IMPLEMENTATO** — scelta britannica/americana applicata anche al riconoscimento vocale.
- **VERIFICATO** — 1.744 file WAV controllati automaticamente: intestazione valida, dimensione utile e nessun audio richiesto mancante.
- **VERIFICATO** — gli ascolti lunghi locali B1 e C1 durano rispettivamente almeno 60 e 45 secondi; i campioni regionali più lunghi usano soltanto registrazioni umane attribuite.
- **IMPLEMENTATO** — registrazione visibile, nuovo tentativo, riascolto della propria voce e parole non riconosciute riascoltabili.
- **VERIFICATO** — l’interfaccia parla correttamente di “parole riconosciute”, non di analisi fonetica completa.
- **RINVIATO CON MOTIVAZIONE** — fonemi, accento e ritmo specialistici richiedono un motore fonetico dedicato non disponibile offline.
- **RINVIATO CON MOTIVAZIONE** — accenti regionali autentici e rumore ambientale richiedono registrazioni umane con licenze verificate; non vengono simulati falsamente.

## 13. Writing Lab

- **IMPLEMENTATO** — frase, testo libero, mail, reclamo, sintesi, opinione, confronto, mediazione e risposte professionali nei laboratori e nelle lezioni.
- **IMPLEMENTATO** — analisi locale distinta per grammatica, ortografia, chiarezza e lessico, con punteggio trasparente per ciascuna area.
- **VERIFICATO** — il controllo intercetta gli errori frequenti, classifica e spiega ogni rilievo e permette di applicare, ascoltare, modificare e ricontrollare la proposta senza spostare la pagina.
- **VERIFICATO** — corpus positivo/negativo, 3.000 mutazioni, controllo di idempotenza e prova reale dell’interfaccia proteggono da falsi positivi e correzioni incoerenti.
- **RINVIATO CON MOTIVAZIONE** — correzione completa di naturalezza e coerenza richiede un correttore linguistico/AI esterno; le verifiche locali non vengono presentate come equivalenti.

## 14–15. Tempo ed esami

- **IMPLEMENTATO** — scelte 5, 15, 30 minuti e sessione completa con composizione diversa e salvataggio del punto raggiunto.
- **IMPLEMENTATO** — la durata non può più far saltare lezioni: viene proposta la prima attività non completata; una difficoltà segnalata riapre invece un rinforzo breve mirato.
- **IMPLEMENTATO** — al termine si può indicare “troppo facile”, “giusta” o “troppo difficile”; la scelta resta locale e adatta la proposta successiva.
- **IMPLEMENTATO** — tempo realmente trascorso calcolato dall’inizio alla conclusione, non attribuito con valore fisso.
- **IMPLEMENTATO** — esame per livello con grammatica, vocabolario, contesto, lettura, ascolto, scrittura, parlato e mediazione.
- **IMPLEMENTATO** — rapporto 0–100%, confronto precedente, aree forti/deboli, consiglio e stampa/PDF.

## 16–17. Dashboard e motivazione

- **IMPLEMENTATO** — CEFR, sottolivello, tempo, giorni, attività, parole, ripassi, errori, competenze, settimana, mese ed ultimo esame.
- **IMPLEMENTATO** — date locali, obiettivo settimanale, riepilogo, messaggi sobri e sospensione della serie.

## 18. Studio adattivo e simulazione studenti

- **IMPLEMENTATO** — profilo separato per grammatica, vocabolario, ascolto, pronuncia, lettura e scrittura; l’andamento non dipende da un solo voto complessivo.
- **IMPLEMENTATO** — ordine dei prerequisiti esplicito: chi possiede le basi prosegue, chi ha una lacuna critica viene indirizzato alla lezione precedente pertinente.
- **IMPLEMENTATO** — gli errori ricorrenti sono raggruppati per causa e restano nei ripassi finché più conferme corrette non mostrano un consolidamento reale.
- **IMPLEMENTATO** — dopo una risposta errata sono disponibili regola, soluzione, strategia e ripetizione immediata della stessa domanda; errore e successiva conferma vengono registrati separatamente.
- **IMPLEMENTATO** — piano quotidiano 40/30/20/10, modalità intelligente da 5 minuti, obiettivo personale, quaderno delle frasi, sfida settimanale e controllo mensile comparabile.
- **VERIFICATO** — simulazione mobile di 60 minuti con studente forte e studente in difficoltà: avanzamento, ritorno al prerequisito, ripetizione, conteggio degli errori e miglioramento risultano coerenti.

## 19. Verifica grafica prolungata

- **VERIFICATO** — simulazione Chrome di 60 minuti a 390×844 e 1440×900 su Oggi, Percorso, Progressi, esempi, Listening e Temi.
- **VERIFICATO** — nessun overflow orizzontale, nessuna sovrapposizione tra controlli e nessuna variazione di misura passando da play a pausa o stop.
- **VERIFICATO** — nessuna parola visibile può spezzarsi tra due righe; “Studio intelligente”, “Vocabolario” e “UK US” hanno controlli bloccanti dedicati su telefono e desktop.
- **IMPLEMENTATO** — play, stop e velocità degli esempi e del Listening occupano una barra unica; Stop non lascia più una riga vuota quando è inattivo.
- **IMPLEMENTATO** — Studio intelligente e test di livello sono affiancati nella home, riducendo lo scorrimento iniziale senza nascondere le funzioni.
- **IMPLEMENTATO** — descrizioni dei temi, modalità di ascolto, dettato, salvataggio frase e navigazione della lezione hanno dimensioni più leggibili e coerenti.
- **VERIFICATO** — nessuna classifica obbligatoria o penalizzazione aggressiva.

## 18–20. Grafica, accessibilità e dati

- **IMPLEMENTATO** — layout compatto, modalità chiara/scura, testo regolabile, focus visibile, riduzione animazioni e controlli tattili.
- **VERIFICATO** — lo zoom del browser non è bloccato; testo grande, griglie, audio e navigazione rifluiscono sugli schermi stretti.
- **VERIFICATO** — navigazione, stato del salvataggio e finestre di conferma hanno ruoli, etichette e gestione del focus; i comandi annullabili rispondono anche a Esc.
- **VERIFICATO** — testi lunghi, quiz e pulsanti di salto restano contenuti nei rispettivi riquadri senza scorrimento orizzontale.
- **VERIFICATO** — nessun pulsante privo di gestore; quiz visivi contenuti e nessun comando basato soltanto sul trascinamento.
- **IMPLEMENTATO** — esportazione, importazione validata, migrazioni, azzeramento con conferma e salvataggio automatico.
- **VERIFICATO** — il backup include anche sessione, selezione, lettura ed esercizi supplementari in corso; continua ad accettare i vecchi backup.
- **VERIFICATO** — le migrazioni riparano dati incompleti, mantengono i progressi delle espansioni precedenti e adattano la domanda corrente alle banche aggiornate.
- **VERIFICATO** — risposta, feedback, dettato, parlato, scrittura ed extra aperti sopravvivono al refresh e all’attivazione di una nuova versione.
- **VERIFICATO** — simulazione completa di backup, annullamento azzeramento, azzeramento confermato, rifiuto di un backup errato e ripristino di cronologia ed errori.
- **RINVIATO CON MOTIVAZIONE** — una certificazione formale WCAG 2.2 AA richiede audit manuale con tecnologie assistive e dispositivi esterni.

## 21–22. Prestazioni e controllo

- **IMPLEMENTATO** — sezioni pesanti caricate soltanto all’apertura; build locale esclusa dalla cartella sorgente finale.
- **VERIFICATO** — strumenti di compilazione aggiornati alla versione corretta e controllo di sicurezza senza vulnerabilità note.
- **VERIFICATO** — 296 pulsanti, audio, stop, velocità, salti, ripassi, giochi, missioni e persistenza coperti dagli audit statici.
- **VERIFICATO** — test automatici per 60 lezioni, 30 prove d’ingresso, profili CEFR, duplicati, banche esercizi e struttura UI.
- **VERIFICATO** — 1.415 risposte controllate per indice corretto, coerenza con spiegazione o testo sorgente, alternative duplicate e distribuzione della posizione corretta.
- **VERIFICATO** — il generatore non crea più domande di traduzione con parole casuali: cloze, riconoscimento e correzione usano alternative grammaticali o semantiche riferite alla stessa frase; se non esistono almeno tre alternative valide, la domanda non viene generata.
- **VERIFICATO** — scansione integrale di 542 schermate reali: otto fasi di ciascuna delle 60 lezioni, tutte le viste principali e tutti i 42 percorsi tematici, senza sovrapposizioni, parole spezzate o contenuti fuori bordo. Il motore avvia una copia isolata dei sorgenti correnti e non può certificare per errore un vecchio server locale.
- **VERIFICATO** — 8.640 sessioni avanzate e 47.520 quesiti effettivi controllano alternative plausibili, quiz finali da almeno cinque domande, distribuzione casuale della soluzione e assenza di risposte riempitive.
- **VERIFICATO** — il test d’ingresso usa 3 alternative in A1–A2, 4 in B1–B2 e 5 in C1, con soglie separate di lettura/ascolto e produzione avanzata obbligatoria per B2/C1.
- **VERIFICATO** — profili di confine, abilità sbilanciate e 500 compilazioni casuali non ottengono un livello alto senza i prerequisiti.
- **VERIFICATO** — 41 scenari di utilizzo concatenati simulano un’ora di percorso: primo accesso, livelli, viste, errori volontari, salti, indietro, refresh, chiusura, ripresa, preferenze, test d’ingresso, backup e quiz visivo.
- **VERIFICATO** — un secondo ciclo avversariale separato simula un’altra ora: progressione adattiva, giudizio di difficoltà, riapertura, persistenza, percorso narrativo C1, audio con pausa/ripresa/stop e layout mobile.
- **VERIFICATO** — cinque profili A1–C1 controllano crescita di durata, listening, lessico e lettura; nessuna domanda identica, opzione duplicata o risposta fuori intervallo.
- **IMPLEMENTATO** — storia progressiva in tre episodi per ogni livello, con ascolto, comprensione, scrittura ed alternative che crescono da tre a cinque.
- **RINVIATO CON MOTIVAZIONE** — prove fisiche complete su ogni combinazione di microfono, screen reader e zoom richiedono la relativa matrice di dispositivi.

## 23–24. Vincoli finali

- **VERIFICATO** — nessun progresso viene azzerato e lo schema dati conserva le migrazioni precedenti.
- **VERIFICATO** — nessun pulsante dimostrativo e nessun commento tecnico di servizio nell’interfaccia.
- **VERIFICATO** — le schede tematiche non mostrano più la revisione storica in cui sono state introdotte; rimane soltanto la versione corrente generale nell’intestazione.
- **VERIFICATO** — una sola versione pubblica, stesso link e versione sempre visibile nell’intestazione.
- **IMPLEMENTATO** — modalità aereo per lezioni, esercizi, lettura, scrittura e progressi; download facoltativo dei 1.744 audio locali, circa 204 MB, con avanzamento visibile.
- **VERIFICATO** — il riconoscimento vocale viene dichiarato correttamente come funzione dipendente dal browser e potenzialmente dalla connessione.
- **VERIFICATO** — gli spin-off `gambe-leggere` e `technics-mobile` sono protetti: restano intatti, non vengono importati da English Coach e non entrano nel pacchetto audio offline.
