# TECHNICS DUE 1.9.496 — manutenzione incrementale

Pubblicazione parziale esplicitamente ordinata dall’utente il 26 ottobre 2026. Non conclude l’audit 1.10.0.

## Correzioni

- Anteprime: il rinnovo della verifica di lettura ha una propria finestra monotona di 15 secondi. La generazione già trascorsa non fa scadere immediatamente il rinnovo; non viene ripetuto il POST dell’anteprima. Identità, destinazione, traccia, esiti incerti e divieti d’invio restano verificati.
- Dati nel browser: cache limitata a 32 voci, durata massima 30 secondi, rimozione delle voci scadute e protezione contro il rientro di risposte dopo invalidazione. Non è un limite complessivo della RAM e non riguarda la RAM di Codex.

## Verifica

30/30 test permanenti delle due correzioni; nessun test prima passato è perso nel confronto tra 495 e 496. Avvio dell’intera pagina a 390px con Chrome headless e consegna dei tre moduli modificati verificati, senza errori JavaScript. Ripristino isolato verificato per tutti i 132 file della base Git. Test e dati simulati non provano l’uscita fisica dei fogli né un telefono Android reale.

Sono ancora aperti gli errori già presenti di Scadenziario e Formule, il collaudo generale delle stampe, il ripristino della riserva e l’audit completo. La revisione non installa un backend o gateway, non attiva nuove autorizzazioni di stampa e non invia fogli o mail di prova.

## Test riproducibili

    node tools/technics-audit/data-client-bounded-cache.test.mjs
    node --experimental-vm-modules tools/technics-audit/print-preview-refresh.test.mjs

## Ripristino

Revert del commit di questa revisione e pubblicazione con la normale pipeline. La base precedente è 067ed2ef1652f763895a18338a3fa022836aeca3 (1.9.495); copie inverse e verifica isolata sono conservate nel registro locale TECHNICS.
