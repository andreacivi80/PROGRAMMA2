# TECHNICS DUE 1.9.500 — convalida quantità di prelievo

Rifiuta quantità negative o non numeriche prima della richiesta di aggiunta del materiale. In precedenza questi valori potevano essere trasformati silenziosamente in zero. Mantiene zero esplicito, decimali e quantità omessa, senza cambiare il comportamento Multi-OP.

La modifica applicativa comprende due soli punti della convalida, oltre alle etichette di revisione. Mantiene il ripristino del lettore499, Formule497, impaginazione498 e tutti gli altri130asset. Gateway1.9.245, PC73 1.9.447 e PC38 1.9.421 rimangono le versioni operative.

Prove prima del rilascio:30casi quantità,8casi coda esclusioni e pagina completa Chrome con quantità negativa e decimale negli editor1280/390px. La scansione di preparazione avviene a1280; l’editor390 viene raggiunto ridimensionando la pagina dopo apertura. Nessuna scansione da fotocamera o compatibilità Android fisica viene dichiarata. Le API sono isolate: negativo senza richiesta, positivo acquisito senza modificare archivi.

Il controllo pubblico dopo il rilascio resta obbligatorio e viene conservato nel registro prove. Nessuna stampa o mail di prova; nessuna scrittura ERP. Il ripristino delle stampe e l’audit finale1.10.0 restano attività separate aperte.

Rollback: ripristinare index.html e version.json dal commit499 b48e550b64cb795a0ec4558b67b0a3329e2322ce; verifica isolata dei132asset completata prima del rilascio.
