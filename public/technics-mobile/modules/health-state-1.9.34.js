(() => {
  'use strict';
  const tokens={PC73:'utente73',PC38:'utente38'};
  const roleOf=pc=>pc==='PC73'?'primario':'secondario';
  // loadNodes: 60s polling + 8s timeout + 7s scheduling margin.
  const NODE_OBSERVATION_TTL_MS=75000;
  // Direct health: 45s polling + 12s abort + 18s scheduling margin. No freshness across clock rollback.
  const DIRECT_OBSERVATION_TTL_MS=75000;
  function directObservation(state,now=Date.now()) {
    const value=state?.lastSuccessAt,at=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)?Date.parse(value):NaN,age=now-at;
    const coherent=Boolean(state?.ok===true&&state?.failures===0&&Object.values(tokens).filter(token=>String(state?.nodeId||'').toLowerCase().includes(token)).length===1);
    return Object.freeze({fresh:Boolean(coherent&&Number.isFinite(at)&&at>0&&Number.isFinite(age)&&age>=0&&age<DIRECT_OBSERVATION_TTL_MS),at:Number.isFinite(at)?at:null,age:Number.isFinite(age)?age:null});
  }
  function nodeStatus(state,pc,now=Date.now()) {
    const token=tokens[pc];
    if(!token)throw new Error(`Nodo non supportato: ${pc}`);
    const nodes=Array.isArray(state?.nodes)?state.nodes:[];
    const entry=nodes.find(node=>String(node?.nodeId||'').toLowerCase().includes(token));
    const direct=directObservation(state,now),observedHere=String(state?.nodeId||'').toLowerCase().includes(token),active=Boolean(direct.fresh&&observedHere);
    const nodesFresh=Boolean(state?.nodesCheckOk&&Number.isFinite(Number(state?.nodesCheckedAt))&&now-Number(state.nodesCheckedAt)>=0&&now-Number(state.nodesCheckedAt)<NODE_OBSERVATION_TTL_MS);
    const explicitOnline=Boolean(nodesFresh&&entry?.online===true);
    const explicitReady=Boolean(explicitOnline&&entry?.ok===true);
    const explicitDegraded=Boolean(explicitOnline&&entry?.ok!==true);
    const explicitOffline=Boolean(nodesFresh&&(!entry||entry.online===false));
    const level=active||explicitReady?'ok':explicitDegraded?'warn':explicitOffline?'bad':'warn';
    const text=active?`${pc} attivo`:explicitReady?`${pc} pronto`:explicitDegraded?`${pc} collegato ma non pronto`:explicitOffline?`${pc} non collegato al gateway`:`${pc} in verifica`;
    const evidence=active?'risposta pubblica diretta recente':explicitReady?'elenco nodi recente · readiness verificata':explicitDegraded?'elenco nodi recente · readiness non superata':explicitOffline?'non collegato al gateway nell’ultimo elenco; stato fisico del PC non verificato':observedHere&&direct.at!==null?'ultima osservazione diretta non recente o orologio non coerente · nuova verifica necessaria':'nessuna verifica recente conclusiva';
    return Object.freeze({pc,role:roleOf(pc),level,text,active,explicitOnline,explicitReady,explicitDegraded,explicitOffline,evidence,entry:entry||null,title:`${pc}: ${roleOf(pc)} · ${evidence}`});
  }
  function functionTransition(previous={},result={},now=Date.now()) {
    if(result.ok)return Object.freeze({value:true,level:result.level==='warn'?'warn':'ok',failures:0,checkedAt:now,source:result.source||'lettura verificata',confirmedFailure:false});
    if(result.transient)return Object.freeze({value:previous.value??null,level:'warn',failures:Number(previous.failures||0),checkedAt:now,source:`${result.source||'verifica incompleta'} · stato non cambiato`,confirmedFailure:false});
    const failures=Number(previous.failures||0)+1,confirmed=failures>=2;
    return Object.freeze({value:confirmed?false:(previous.value??null),level:confirmed?'bad':'warn',failures,checkedAt:now,source:confirmed?`${result.source||'errore'} confermato`:`${result.source||'errore'} · nuova verifica`,confirmedFailure:confirmed});
  }
  function systemSummary(state,now=Date.now()) {
    const pc73=nodeStatus(state,'PC73',now),pc38=nodeStatus(state,'PC38',now);
    const serving=pc73.active?'PC73':pc38.active?'PC38':'';
    const message=serving?`Il collegamento pubblico sta rispondendo tramite ${serving}. ${serving==='PC73'?pc38.text:pc73.text}.`:`Percorso pubblico in verifica: nessuna risposta diretta recente. ${pc73.text}; ${pc38.text}.`;
    return Object.freeze({serving,pc73,pc38,message});
  }
  function packingListStatus(evidence,minimumSatisfied,now=Date.now()) {
    const age=now-Number(evidence?.receivedAt);
    if(evidence?.scope!=='packing-open-list'||evidence.validated!==true||evidence.cached!==false||evidence.minimumSatisfied!==true||minimumSatisfied!==true||!Number.isSafeInteger(evidence.receivedAt)||evidence.receivedAt<=0||!['reader','main'].includes(evidence.via)||!Number.isFinite(age)||age<0||age>=75000)return null;
    return Object.freeze({level:'warn',source:'Elenco disponibile · salvataggi non verificati'+(evidence.freshnessUnverified===true?' · aggiornamento file non attestato':''),checkedAt:Number(evidence.receivedAt)});
  }
  globalThis.TechnicsHealthState=Object.freeze({version:'1.9.107',nodeStatus,functionTransition,systemSummary,packingListStatus,directObservation,DIRECT_OBSERVATION_TTL_MS,NODE_OBSERVATION_TTL_MS});
})();
