# TECHNICS DUE 1.9.499 — lettore da tastiera nella Lista prelievo

Ripristina la scansione hardware su PC nella Lista prelievo: il listener classico chiamava una funzione interna al modulo, causando `ReferenceError: acceptScan is not defined`. Ora usa il core scanner esistente e passa soltanto il barcode verificato al gestore originale dell’OP.

Restano i controlli EAN, codice, lotto e appartenenza all’OP. La modifica applicativa comprende un solo collegamento nel lettore, oltre alle etichette di revisione; gli altri 130 asset, Formule497, impaginazione498 e comportamento delle quantità restano identici.

Collaudo: 13 casi permanenti; Chrome completo con due scansioni valide, chiusura e riapertura, due EAN non validi e controllo del percorso telefono a 390px. Le API della prova UI sono isolate: le richieste valide sono acquisite senza scrivere negli archivi. Nessuna stampa fisica o mail inviata. I test di Chrome a larghezza telefono non qualificano dispositivi Android fisici.

Versioni collegate: frontend1.9.499, gateway1.9.245, PC73 1.9.447 principale, PC38 1.9.421 riserva. Questa revisione non dichiara completati il ripristino delle stampe, la correzione delle quantità o l’audit finale1.10.0.

Ripristino: index.html e version.json della revisione498, commit4c71b8418e29f573f619ac338fa0a7b67fa027e1. La ricostruzione isolata dei132 asset è stata verificata prima della pubblicazione.
