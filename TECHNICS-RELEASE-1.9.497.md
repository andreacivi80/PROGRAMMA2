# TECHNICS DUE 1.9.497

Correzione incrementale del ciclo dei suggerimenti in Formule. Alla chiusura o con query troppo corta viene invalidata la richiesta precedente; un errore arrivato in ritardo non cancella i suggerimenti della ricerca successiva. Un errore corrente resta visibile e una nuova ricerca recupera.

## Verifica

Nove regressioni mirate: base 1.9.496 con cinque fallimenti riprodotti; candidato con nove PASS. Nessun PASS perso nel confronto più ampio: gli otto fallimenti già presenti restano aperti. Cinquanta sequenze Chrome sulle dieci larghezze mobili e cinque desktop1280 PASS, con risposte reali del gateway e input trusted. Questi test non qualificano telefoni Samsung/Doogee fisici.

Verificatore canonico prepublish PASS sul pacchetto esatto di 132 file; rollback isolato a 1.9.496 verificato per tutti i 132 file. Dopo il deploy vengono ripetuti controllo dei 132 asset, prova Chrome pubblica e verificatore postpublish. Gli esiti locali con hash sono conservati nel registro TECHNICS.

## Test riproducibile

    node tools/technics-audit/formula-suggestion-liveness-497.test.mjs

La revisione comprende soltanto due blocchi Formule e i metadati di versione/cache. Backend, gateway e permessi di stampa non cambiano. Restano aperti il collaudo generale di Corridoio/Magazzino, i problemi PDF e gli altri arretrati dell’audit 1.10.0.

## Rollback

Revert del commit della revisione e deploy con la pipeline ordinaria. Base precedente: bf502aa062159a8202993786fb3f5d63eb748df4 (1.9.496). Copia integrale e inversione già provate in ambiente isolato. Nessun dato operativo è stato modificato.
