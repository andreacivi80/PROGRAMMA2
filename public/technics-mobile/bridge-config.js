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
