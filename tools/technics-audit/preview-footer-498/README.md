# Collaudo riproducibile dei footer di anteprima 1.9.498

Questi tre worker sono gli stessi byte eseguiti nel collaudo Chrome candidato. Esportano una funzione asincrona run(input) che restituisce {report,screens}. Il chiamante salva report e PNG; HOLD o error indicano un fallimento. Usano un proprio Chrome headless e profilo temporaneo, richiedono almeno 900 MiB e utilizzano le configurazioni Technics esistenti.

- probe-main.cjs: 390/1280 px, comandi reali della selezione clienti, zero POST.
- probe-promo.cjs: 390/1280 px e Corridoio/Magazzino; quattro POST di generazione anteprima in sola lettura, nessun invio stampa.
- probe-customer-pending.cjs: stesse quattro combinazioni, numero esatto di immagini dal 202 corrente (1..64), A4 e SVG reali. Usa soltanto intenti incerti sintetici nel localStorage del profilo esclusivo; li conserva identici e vieta il reinvio.

Input: nonce casuale di 24 caratteri esadecimali; assets con 132 righe path/sha256/bytes; indexBrotliBase64 e indexSha256; exactAssetBrotliBase64 per i file candidati necessari. Promo richiede expectedModalFooterPosition:"static". I contenuti consegnati al browser devono corrispondere ai relativi hash. Input mancante o modificato non produce una qualifica. L’ambiente atteso è quello già configurato nel programma; non si modificano credenziali, rete, VPN o privilegi.

Pacchetto candidato SHA256: 8fbb0fc6d2a7a021d95e4b4047e3a172d013bf1f4473168f85c0587f6341072c. Asset set: 30599e6227e4841fdb8b143c517da638c1c7f9c6f97fd2d530c920b32dacc1b4. Le campagne invisibili riproducibili con INPUT/LAUNCH/READ/CLEANUP sono conservate nella cartella verification del workspace Technics, nei pacchetti ROOT-EO-CHROME498-FOOTER-SOURCE-R2, ROOT-EO-PENDING498-DYNAMIC-202-SOURCE-R3 e ROOT-EO-MODAL-FOOTER498-PROBE-SOURCE.

Queste prove non certificano la stampa fisica o il rilascio completo 1.10. L’abilitazione dell’invio pubblico richiede separatamente gateway, nodo corrente, lease, journal e consenso verificati.
