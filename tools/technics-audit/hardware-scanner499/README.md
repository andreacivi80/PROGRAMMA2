# Regressione lettore hardware TECHNICS

Eseguire `node tools/technics-audit/hardware-scanner499/run-scanner-regression.cjs` dalla copia Git del repository. Il runner legge il vero handler corrente, il core scanner e la baseline pubblicata 498 dagli oggetti Git; esegue i 13 casi originali in VM. Non contatta API o stampanti e non modifica archivi. Le fixture e i log restano nella cartella temporanea indicata.

La prova VM comprende la regressione `acceptScan` non definita, il checksum EAN, le letture incomplete e i percorsi Packing/Inventario. Non sostituisce il collaudo Chrome della pagina completa. Quest’ultimo usa l’app originale con API isolate: due scansioni valide, chiusura/riapertura, due EAN non validi e controllo del percorso telefono; nessuna scrittura operativa o stampa.
