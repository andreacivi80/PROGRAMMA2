# Technics Mobile: compatibilità dello scorrimento

Protocollo permanente proposto per `public/technics-mobile/`, riferimento pubblico 1.9.493. Questo pacchetto è SOURCE: nessun test è eseguito da questo autore e nessuna correzione o pubblicazione è attestata qui; la sezione seguente riferisce prove reali eseguite da ROOT. Conservare i risultati negativi originali. Il ripristino/native450 non è un requisito di questa hotfix UI.

## Evidenza causale ROOT del 19 ottobre 2026

La riproduzione reale su Chrome 155.0.8059.80 headless, con emulazione Android/touch CDP, ha fallito sul pubblico 1.9.493 a tutte le dieci larghezze: il contenuto superava la viewport ma il gesto non spostava né window né scrollingElement. Lo stesso metodo sul controllo positivo ha spostato la pagina di 385 px. Non è una prova su Note 56X Pro fisico.

Il confronto A/B a **432×800** ha mantenuto identica la geometria: html scrollHeight 917/clientHeight 800, body scrollHeight e clientHeight entrambi 917, overflow-x hidden e overflow-y auto. Baseline: delta 0. Impostare soltanto html overscroll-behavior-y:auto: delta 0. Impostare soltanto body overscroll-behavior-y:auto: delta **117 px**, cioè tutta l'eccedenza 917−800. Anche entrambi auto, body overflow visible o body overflow-x clip/overflow-y visible hanno prodotto 117 px. Nessuna modifica ai dati o a funzioni gestionali è stata necessaria nel confronto.

Il fatto causale osservato è che la politica `overscroll-behavior-y:none` sul **body**, nel suo stato di contenitore senza escursione verticale propria, impediva al gesto di raggiungere lo scroll della radice html. La spiegazione tramite soppressione del concatenamento body→radice è un'inferenza coerente con la geometria e con gli interventi isolati; il comportamento è riprodotto nell'engine provato. La sola politica html non è stata sufficiente a sbloccarlo.

La regola sorgente è in `index.html`, stile `op-ov-compact-v1710`, riga 246 dell'asset 493 autenticato: `html,body{overscroll-behavior-y:none}`. Lo stile `android-honor-scroll-v19197`, riga 2785, imposta `overflow-x:hidden` a tutte le larghezze e `overflow-y:auto!important` entro 430 px. Il blocco è riprodotto anche a 432 px e oltre: la soglia 430 non è la causa sufficiente dimostrata e non va ampliata alla cieca. Il body risulta effettivamente overflow-y auto nel confronto A/B.

**Correzione proposta ancora da qualificare:** cambiare soltanto la politica Y del body in auto, lasciando invariati layout, html, eventi, dati e contratti. L'autore SOURCE separato prepara il delta 493 e ROOT deve provarne gli asset esatti nelle dieci larghezze e nei percorsi richiesti. Il confronto diagnostico A/B non è una pubblicazione e non equivale alla matrice completa della patch.

I difetti separati già osservati — inline hidden che perde contro auto!important nei popup e calendario che eccede il landscape corto — richiedono verifiche proprie e non sostituiscono questa diagnosi del blocco dal caricamento. R1 rimane immutato come protocollo precedente alla diagnosi. Le prove sul dispositivo fisico e su altro browser restano distinte e non ancora attestate qui.

## Diagnosi prima della modifica

Riprodurre il primo caricamento prima di click, riaperture o modifiche allo storage. Salvare versione/identità degli asset, URL, user agent, touch points, DPR, viewport e visualViewport, errori JS e richieste fallite. Non cancellare cache, sessioni, IndexedDB o service worker per ottenere un risultato favorevole. Usare profili di prova separati, distinguendo freddo, sessione ripristinata e aggiornamento.

Misurare `innerWidth`, `innerHeight`, `scrollX/Y`, `document.scrollingElement`, `scrollHeight/clientHeight/clientWidth/scrollWidth` di html e body e dell'elemento scorrevole effettivo. Acquisire stile calcolato e inline con priorità per html, body, `.shell`, `.rawmaterialworkspace`, `.rawmaterialrows`, `#result`, antenati del punto toccato e overlay visibili. Proprietà: overflow e assi, height/min/max-height, touch-action, overscroll-behavior, position, pointer-events, visibility, display, z-index.

Usare `elementsFromPoint` al punto iniziale del gesto e agli angoli/centro: un overlay nascosto nel modello non è necessariamente nascosto nel rendering. Annotare eventi touch cancellati e relativi target, senza sostituire il comportamento degli handler. Cercare listener globali, preventDefault e classi/inline style rimasti dopo errori. Le ipotesi media query 430 px, compatibilità viewport e finestre movimenti restano ipotesi finché la stessa pagina non mostra una catena causale ripetibile.

Separare sempre: documento radice, lista/widget interno, tabella orizzontale, contenuto di un popup, blocco intenzionale della pagina dietro il popup. Un gesto consumato da una lista non dimostra lo scroll della pagina. L'assenza di overflow su una pagina corta non dimostra un blocco; per quel caso registrare geometria insufficiente e ripetere con dati di prova realistici lunghi, senza inserire riempitivi nel DOM applicativo per falsificare il risultato.

## Regole CSS e viewport

Consentire il naturale flusso verticale della pagina e dimensioni minime coerenti. Dimensionare solo contenitori che possiedono davvero il proprio scroll. Per dialoghi contenuti nella viewport usare un fallback `vh` seguito da `dvh`, con box-sizing/padding verificati sul browser; permettere lo scroll del contenuto del dialogo.

Non applicare indiscriminatamente `overflow:hidden`, altezza fissa 100vh, `position:fixed` o `touch-action:none` a html/body/shell. Non ampliare una media query come rimedio senza riproduzione comparativa. Non usare una regola globale `overflow:auto!important` per annullare tutti i blocchi: distruggerebbe i blocchi intenzionali dei dialoghi. Non nascondere overflow orizzontale necessario a tabelle/listati; evitare invece l'allargamento accidentale dell'intera pagina.

## Touch ed eventi

I listener osservativi devono essere passivi. `preventDefault()` deve riguardare soltanto il gesto specifico controllato dal widget, non l'intera pagina. Testare i punti iniziali sia fuori sia dentro il widget, i bordi e l'esaurimento dello scroll interno. Non disabilitare gesti Android per aggirare un conflitto di layout. La gestione di focus/tastiera non deve spostare o bloccare permanentemente la pagina.

## Overlay e ripristino

Ogni lock deve avere un owner e una pulizia simmetrica su chiusura, Escape, annullamento, errore, navigazione, dispose e riapertura. Conservare i valori inline precedenti e le loro priorità CSS di entrambi html/body, inclusi gli assi; non ripristinare semplicemente `auto`. Verificare la cascata reale: un inline `hidden` senza priorità può perdere contro una regola `!important`.

Durante un modal con lock previsto: il gesto sullo sfondo non sposta la radice, il contenuto interno lungo rimane scorrevole e i pulsanti sono raggiungibili. Dopo la chiusura: stile/priorità originali e gesto sulla radice tornano al comportamento precedente. Nessuna riapertura, risposta tardiva o cambio modulo deve riapplicare il lock di un owner chiuso. Testare anche popup privi di lock previsto, senza imporre loro nuovi comportamenti.

## Matrice obbligatoria

Larghezze CSS: **320, 360, 375, 390, 412, 430, 432, 480, 600, 768**. Includere portrait e rotazione, almeno 800×360 per landscape corto. Registrare le dimensioni effettive lette dal browser; un ridimensionamento desktop senza `isMobile`, touch e UA dichiarati non è un test Android.

Per ogni larghezza registrare separatamente questi quattordici percorsi: apertura; caricamento iniziale; gesto verticale; gesto orizzontale previsto; rotazione; cambio modulo; apertura/chiusura finestre; Inventario; giacenze; Packing List; ritorno; refresh; ripristino sessione; uso dopo aggiornamento. Le righe mancanti o non esercitate sono HOLD, non PASS. Un percorso senza geometria di overflow può essere non applicabile soltanto con misura esplicita; l'inventario lungo deve comunque provare un vero gesto sulla radice.

Usare `MOBILE-SCROLL-CASES.json` come inventario, non come evidenza. I test di alto livello devono passare attraverso i veri handler applicativi con dati realistici di sola lettura. Conservare i test già esistenti: inventario/calcoli/packing/prelievi/produzione/programmazione/barcode/camera/preview/email/stampa/sincronizzazione/API non cambiano per questa hotfix. Le funzioni con effetti si verificano con confini di prova che ne impediscono l'invio reale; non premere conferme di stampa, email, salvataggio, archivio o gestione ERP.

## Prova automatica del gesto

`mobile-scroll-probe.INERT-SOURCE.mjs` riceve una pagina e una sessione CDP già create da ROOT. Non avvia browser o processi. Il probe usa `Input.dispatchTouchEvent` per un dito in movimento, attende frame reali e misura separatamente delta radice e delta widget. Non usa `window.scrollTo()` come prova. Un eventuale scroll programmatico diagnostico deve essere etichettato e non può far superare il criterio touch.

Salvare prima/dopo, coordinate, stack dei target, assi/overflow, touch cancellati, delta e stabilità. Non considerare PASS una pagina non lunga, un elemento non raggiungibile o un gesto applicato fuori dalla viewport. Gli overlay devono essere verificati con il probe in modalità `root-locked` e con un secondo probe del contenuto interno. Il test di sessione/aggiornamento non deve creare sessioni operative vere: usare profili di prova e fixture già autorizzate, conservando hash e presenza delle chiavi senza pubblicarne i contenuti.

## Integrazione additiva nelle release

ROOT conserva gli attuali verificatori e aggiunge il report mobile dopo i test esistenti e prima della pubblicazione. `mobile-scroll-release-check.INERT-SOURCE.mjs` controlla che le dieci larghezze e i quattordici percorsi abbiano risultati reali, identità del candidato e prove touch. Non distribuisce né autorizza da solo la release. Non modificare il canonical installer esistente in questo pacchetto.

Qualunque modifica futura a CSS/layout/viewport/overlay/eventi JS deve rieseguire la matrice. Un FAIL, HOLD, prova mancante, asset diverso da quello recensito, eccezione JS nuova o gesto non riuscito impedisce la pubblicazione. L'aggiornamento deve provare che un client con sessione della versione precedente rilevi e carichi coerentemente tutti gli asset nuovi senza cancellare dati, senza ciclo di reload e senza perdere lavoro attivo. Usare i meccanismi storici di aggiornamento/cache, con identificativi coerenti soltanto quando necessari.

## Accettazione e limiti

Richiedere causa riprodotta con file/righe e misure prima/dopo, delta minimo, matrice completa, regressioni esistenti e owner dei lock verificati. Dichiarare espressamente Chromium/Chrome Android emulato, browser/versione, sistema, viewport e gesture CDP. L'emulazione non equivale al Note 56X Pro reale: la conferma sul dispositivo e su un altro browser mobile resta un esito distinto. Non dichiarare definitivamente risolto il caso dispositivo quando tale prova manca.

Il rapporto conclusivo deve indicare causa, file modificati, test positivi/negativi e conservati, funzioni preservate, protocollo, versione proposta, stato reale di pubblicazione e limiti. Nessun risultato SOURCE o CPU è un PASS pubblico o fisico.

## Ripristino di regressione

Prima della pubblicazione conservare hash/inversi dell'intero delta e asset/versione pubblica di partenza. Se un controllo fallisce, fermare la nuova pubblicazione e conservare il fallimento; correggere soltanto la causa dimostrata e ripetere i controlli. Se la regressione è già pubblica, ROOT prepara un ripristino tramite la pipeline storica con CAS/owner/versione corrente e verifica degli asset: niente sovrascritture alla cieca, retry dopo esito incerto, rollback a vecchie ricevute consumate o cancellazione di dati/cache/sessioni.

## Esecuzione senza UI

Solo ROOT esegue le prove. Browser headless reale con profilo effimero posseduto; processi e discendenti Windows invisibili (`windowsHide`/CreateNoWindow, shell false), nessun PowerShell, focus o interazione con il profilo utente. Vietati bypass TLS, installazioni automatiche e `--no-sandbox`. Se una dipendenza o un dispositivo reale manca, registrare il limite senza inventare un risultato.
