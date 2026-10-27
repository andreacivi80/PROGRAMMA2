# TECHNICS DUE — Revisione 1.9.498

Corretto il footer generale che interferiva con i comandi nei modali di anteprima: le due regole di posizionamento si applicano ora soltanto al footer diretto della pagina. Le anteprime Inventario clienti e Packlist Promoitalia mantengono destinazione e comandi nel proprio modale, anche a 390 px.

Delta applicativo: due selettori CSS in index.html; tre etichette di versione e version.json. La correzione Formule della 1.9.497 e gli altri 130 file sono conservati identici. Backend, gateway e permessi di invio restano quelli precedenti. Il ripristino dell’invio pubblico è ancora aperto.

Collaudo candidato: 55 casi Chrome Formule (50 mobile e 5 desktop); 4 anteprime Promoitalia e 4 Inventario su Corridoio/Magazzino, a 390/1280 px; 2 controlli dei comandi principali; 10 geometrie dei footer verificate sui report originali. Documenti SVG effettivi di Technics in sola lettura; tentativi incerti sintetici conservati senza reinvio. Nessuna stampa fisica, mail o modifica a ERP e archivi operativi.

Prove precedenti conservate: Inventario R2 attendeva 4 pagine, mentre il 202 reale ne dichiara 3. R3 lega conteggio e ogni SVG alla risposta corrente entro lo stesso limite di 35 secondi. Il rilascio richiede corrispondenza esatta dei 132 file Git e pubblici, oltre ai collaudi Chrome pubblici.

Rollback: ripristino verificato in ambiente isolato di tutti i 132 file alla 1.9.497; commit precedente 1ed9bebb4f9033955e1a8a937ee2dabbd2add125. Per tornare indietro pubblicare nuovamente quei file, conservando dati e journal.
