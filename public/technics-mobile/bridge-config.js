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
    "releaseId": "technics-packing-reader-1.9.59-20260830T230938Z",
    "contractVersion": "packing-open-readonly-v1",
    "buildHash": "83aac7adfe89810dd3407ddbe2f9d24710f7dc29725b9cd886903a5dab5fde01",
    "coordinatorId": "001a1650-f0f3-404e-a296-bc9e7f0c9fd2"
  }
});
