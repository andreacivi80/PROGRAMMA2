/*
 * TECHNICS CONNECTIVITY CONTRACT
 *
 * Questo e' l'unico punto autorizzato a definire il ponte pubblico.
 * I moduli applicativi devono leggere window.TECHNICS_BRIDGES e non devono
 * contenere indirizzi autonomi. Una modifica viene accettata soltanto dal
 * cancello Verify-ConnectivityContract-1.9.23.ps1.
 */
window.TECHNICS_BRIDGES=Object.freeze([
  "https://technics-mobile-gateway.andreacivi80.workers.dev"
]);
window.__technicsBridgeUrl=window.TECHNICS_BRIDGES[0];
// Dedicated GET-only packing list reader; all other requests use TECHNICS_BRIDGES.
window.TECHNICS_PACKING_READER=Object.freeze({
  "enabled": true,
  "origin": "https://technics-packing-list-reader-candidate.andreacivi80.workers.dev",
  "authorizedOrigin": "https://technics-packing-list-reader-candidate.andreacivi80.workers.dev",
  "expectedIdentity": {
    "nodeId": "technics-utente38-packing-reader",
    "releaseId": "technics-packing-reader-emergency-1.9.60-20260831T064823Z",
    "contractVersion": "packing-open-readonly-v1",
    "buildHash": "2f983f399205aa3fe35f2229f2b8bfe49bec1642de7988412c9c7e046cadb62f",
    "coordinatorId": "27928f7b-2145-4b59-b8e9-025ac39c213e"
  }
});
