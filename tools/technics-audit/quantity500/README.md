# Regressioni quantità TECHNICS

Dalla radice del repository, con Node:

```text
node tools/technics-audit/quantity500/check-picking-quantity-validation.cjs public/technics-mobile/index.html quantity-cases.json
node tools/technics-audit/quantity500/check-picking-disposition-queue.cjs public/technics-mobile/index.html exclusion-cases.json
```

I file di output devono essere nuovi. I30casi quantità e8casi esclusioni eseguono le funzioni e gli handler originali in VM, con trasporto isolato. Non verificano SQL, archivi o stampa. Il collaudo della pagina completa verifica inoltre gli editor1280/390 dopo scansione desktop1280, con richieste operative acquisite e negate. Nessun dispositivo Android fisico viene simulato come collaudato.
