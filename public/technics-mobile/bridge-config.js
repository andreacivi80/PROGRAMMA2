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
// Dedicated reader disabled after intermittent route rejection; Packing list uses the verified main gateway.
window.TECHNICS_PACKING_READER=Object.freeze({
  "enabled": false,
  "origin": "https://technics-packing-list-reader-candidate.andreacivi80.workers.dev",
  "authorizedOrigin": "https://technics-packing-list-reader-candidate.andreacivi80.workers.dev",
  "expectedIdentity": {
    "nodeId": "technics-utente38-packing-reader",
    "releaseId": "technics-packing-reader-1.9.63-candidate-20260831T104422Z",
    "contractVersion": "packing-open-readonly-v1",
    "buildHash": "b41eed6e3dcca702d79ee00afe0e73f8d4bc59638a989e926a929e07e4aa20ec",
    "coordinatorId": "c5cd28af-3f66-5c1f-a5d9-fbd6ec671744"
  }
});
