// Candidate 426: same bridge transport as Item, server SVG preview, explicit native target.
(() => {
  'use strict';
  const allowed=new Set(['corridor','warehouse']);
  const clean=value=>String(value??'').trim();
  const identifier=/^[A-Za-z0-9_-]{8,160}$/;
  const hash=/^[a-f0-9]{64}$/;
  const operation=/^[A-Za-z0-9_-]{16,120}$/;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const defaultUuid=()=>globalThis.crypto?.randomUUID?.()||'';
  function createSession({baseUrl=clean(globalThis.__technicsBridgeUrl||globalThis.TECHNICS_BRIDGE_URL).replace(/\/$/,''),transport=globalThis.TechnicsTransport?.fetch?.bind(globalThis.TechnicsTransport),wait=sleep,now=()=>Date.now(),uuid=defaultUuid}={}){
    if(!baseUrl||typeof transport!=='function')throw Error('Servizio di stampa non configurato.');
    let snapshot=null,generation=0,confirmation=null,submitted=false;
    const documentType='PACKAGING_PROMOITALIA',printRoute='/api/packaging/promoitalia/print',pendingKey='technics-standard-frozen-intent:'+baseUrl+':'+documentType;
    const roles={'technics-utente73-primary':'primary','technics-utente38-secondary':'secondary'},instance=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
    let previewTrace=null,intent=null;
    const previewResponses=new WeakMap();
    const protocolOf=value=>value?.protocol||'standardFrozen425';
    function qualifyPreview(start,target){
      const response=previewResponses.get(start),meta=start.meta||{},version=meta.version;
      if(!roles[meta.nodeId]||meta.nodeRole!==roles[meta.nodeId]||start.printerTarget!==target||response?.headers.get('X-Technics-Node')!==meta.nodeId||response.headers.get('X-Technics-Node-Role')!==meta.nodeRole||response.headers.get('X-Technics-Version')!==version)throw Error('Identità dell’anteprima non coerente.');
      if(version==='1.9.425'||globalThis.TechnicsPrintCaller446.modernVersion(version)){
        if(start.documentType!==documentType||start.frozenStandardContract!=='standard-family-frozen-v1'||!instance.test(meta.backendInstanceId||'')||response.headers.get('X-Technics-Backend-Instance-Id')!==meta.backendInstanceId)throw Error('Anteprima425 non qualificata dal nodo effettivo.');
        previewTrace={protocol:version==='1.9.425'?'standardFrozen425':'standardFrozenModern',backendVersion:version,nodeId:meta.nodeId,nodeRole:meta.nodeRole,backendInstanceId:meta.backendInstanceId};
      }else if(version==='1.9.421'){
        if(start.frozenStandardContract!==undefined||meta.backendInstanceId!==undefined||response.headers.get('X-Technics-Backend-Instance-Id'))throw Error('Identità legacy421 e contratto425 mescolati.');
        if(start.documentType!==undefined&&start.documentType!==documentType)throw Error('Famiglia documento legacy non coerente.');
        previewTrace={protocol:'legacyStandard',backendVersion:version,nodeId:meta.nodeId,nodeRole:meta.nodeRole};
      }else throw Error('Versione dell’anteprima non supportata.');
    }
    function qualifyPage(response){
      if(!previewTrace||response.headers.get('X-Technics-Node')!==previewTrace.nodeId||response.headers.get('X-Technics-Node-Role')!==previewTrace.nodeRole||response.headers.get('X-Technics-Version')!==previewTrace.backendVersion)throw Error('Nodo o versione dell’anteprima cambiati.');
      if(previewTrace.protocol!=='legacyStandard' ? response.headers.get('X-Technics-Backend-Instance-Id')!==previewTrace.backendInstanceId : Boolean(response.headers.get('X-Technics-Backend-Instance-Id')))throw Error('Generazione dell’anteprima cambiata.');
    }
    function qualifyLegacyPrint(payload,response){
      const meta=payload?.meta||{};
      if(previewTrace?.protocol!=='legacyStandard'||meta.version!=='1.9.421'||meta.nodeId!==previewTrace.nodeId||meta.nodeRole!==previewTrace.nodeRole||response.headers.get('X-Technics-Version')!==meta.version||response.headers.get('X-Technics-Node')!==meta.nodeId||response.headers.get('X-Technics-Node-Role')!==meta.nodeRole||payload.printerTarget!==snapshot?.printerTarget||payload.frozenStandardContract!==undefined||meta.backendInstanceId!==undefined||response.headers.get('X-Technics-Backend-Instance-Id')||(payload.documentType!==undefined&&payload.documentType!==documentType))throw Error('Esito legacy421 non coerente con l’anteprima: registro conservato, nessun nuovo invio.');globalThis.TechnicsPrintCaller446.settleLegacyStandard(intent,payload,response);
    }

    try{const stored=globalThis.localStorage.getItem(pendingKey);if(stored){intent=JSON.parse(stored);const p=protocolOf(intent);if(!intent||intent.documentType!==documentType||intent.printRoute!==printRoute||!roles[intent.nodeId]||!['legacyStandard','standardFrozen425','standardFrozenModern'].includes(p)||!(/^[A-Za-z0-9_-]{16,120}$/.test(intent.operationId||''))||(p==='legacyStandard'?(intent.backendVersion!=='1.9.421'||intent.backendInstanceId!==undefined):(!instance.test(intent.backendInstanceId||'')||(p==='standardFrozen425'?(intent.backendVersion!==undefined&&intent.backendVersion!=='1.9.425'):!globalThis.TechnicsPrintCaller446.modernVersion(intent.backendVersion)))))throw Error('invalid')}}catch{throw Error('Registro esito stampa non disponibile: nessun invio.');}
    function rememberIntent(value){globalThis.localStorage.setItem(pendingKey,JSON.stringify(value));intent=Object.freeze({...value})}
    function clearIntent(){globalThis.localStorage.removeItem(pendingKey);intent=null}
    async function recoverIntent(){if(!intent)return;if(protocolOf(intent)==='legacyStandard')throw Error('Esito legacy421 da verificare: nessun nuovo invio o conversione del registro.');const {payload}=await globalThis.TechnicsPrintReceiptClient.fetchJson(baseUrl+printRoute.replace(/print$/,'print-status')+'?operationId='+encodeURIComponent(intent.operationId),{method:'GET',cache:'no-store'},intent);if(payload.accepted!==true||payload.physicalOutputConfirmed!==false)throw Error('Esito precedente da verificare: nessun nuovo invio.');clearIntent()}


    const api=async(method,route,body,kind='json')=>{if(method==='POST'&&route===printRoute)globalThis.TechnicsPrintCaller446.approve(intent);
      if(method==='POST'&&route===printRoute&&previewTrace&&previewTrace.protocol!=='legacyStandard'){const {payload}=await globalThis.TechnicsPrintReceiptClient.fetchJson(baseUrl+route,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},intent);return payload}

      const response=await transport(`${baseUrl}${route}`,{method,cache:'no-store',headers:{'Cache-Control':'no-store','ngrok-skip-browser-warning':'1',...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});
      if(!response?.ok){let payload;try{payload=await response.json()}catch{}throw Error(clean(payload?.error)||`Servizio stampa non disponibile (HTTP ${response?.status||0}).`)}
      if(kind==='svg'){
        qualifyPage(response);
        const contentType=clean(response.headers?.get?.('content-type')).toLowerCase();
        if(!contentType.includes('svg'))throw Error('Formato anteprima server non valido.');
        const svg=await response.text();
        if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(svg))throw Error('Pagina SVG non valida.');
        return svg;
      }
      const payload=await response.json();
      if(route==='/api/packaging/promoitalia/print-preview')previewResponses.set(payload,response);
      if(payload?.ok===false)throw Error(clean(payload.error)||'Servizio stampa non disponibile.');
      if(method==='POST'&&route===printRoute&&previewTrace?.protocol==='legacyStandard')qualifyLegacyPrint(payload,response);
      return payload;
    };
    function invalidate(){if(intent)return false;generation++;snapshot=null;previewTrace=null;confirmation=null;submitted=false;return true}
    async function preview(selection,target){
      await recoverIntent();invalidate();const current=generation;
      if(!allowed.has(target))throw Error('Destinazione stampa non consentita.');
      if(!Array.isArray(selection)||!selection.length||selection.some(item=>!clean(item?.baseCode)||!clean(item?.unit)))throw Error('Seleziona almeno un articolo valido.');
      const started=await api('POST','/api/packaging/promoitalia/print-preview',{selection:selection.map(item=>({baseCode:clean(item.baseCode),unit:clean(item.unit)})),printerTarget:target});
      if(current!==generation)throw Error('Selezione cambiata: aggiornare l’anteprima.');
      if(!identifier.test(clean(started.snapshotId))||!hash.test(clean(started.snapshotHash))||!identifier.test(clean(started.previewId))||started.printerTarget!==target)throw Error('Snapshot server non valido.');
      qualifyPreview(started,target);
      let state=started;
      for(let attempt=0;attempt<40&&!state.ready;attempt++){
        await wait(250);
        state=await api('GET',`/api/packaging/promoitalia/print-preview-status?id=${encodeURIComponent(started.previewId)}`);
        if(current!==generation)throw Error('Selezione cambiata: aggiornare l’anteprima.');
        if(state.failed===true||state.status==='failed')throw Error('Anteprima server non riuscita.');
      }
      if(!state.ready||!Number.isSafeInteger(state.pageCount)||state.pageCount<1||state.pageCount>100)throw Error('Anteprima server non pronta.');
      const pages=[];
      for(let page=1;page<=state.pageCount;page++){
        const svg=await api('GET',`/api/packaging/promoitalia/print-preview-image?id=${encodeURIComponent(started.previewId)}&page=${page}`,undefined,'svg');
        if(current!==generation)throw Error('Selezione cambiata: aggiornare l’anteprima.');
        pages.push(svg);
      }
      snapshot={documentType,...previewTrace,snapshotId:started.snapshotId,snapshotHash:started.snapshotHash,previewId:started.previewId,printerTarget:target,pageCount:state.pageCount,createdAt:now(),pages};
      return {...snapshot,pages:[...pages]};
    }
    const ready=()=>Boolean(snapshot&&now()-snapshot.createdAt<(snapshot.protocol==='legacyStandard'?29*60*1000:110000)&&!submitted);
    function confirm(target){
      if(!allowed.has(target)||!ready()||snapshot.printerTarget!==target)throw Error('Anteprima scaduta o destinazione diversa: rigenerarla.');
      confirmation={target,previewId:snapshot.previewId,expiresAt:now()+10000};
      return target==='warehouse'?'Magazzino':'Corridoio';
    }
    async function print(target){
      if(!ready()||!confirmation||confirmation.target!==target||snapshot.printerTarget!==target||confirmation.previewId!==snapshot.previewId||confirmation.expiresAt<now())throw Error('Conferma la destinazione mostrata nell’anteprima.');
      confirmation=null;submitted=true;
      const operationId=clean(uuid());
      if(!operation.test(operationId))throw Error('Identificativo operazione non disponibile.');
      rememberIntent({...snapshot,pages:undefined,operationId,printRoute});
      const payload=await api('POST','/api/packaging/promoitalia/print',{snapshotId:snapshot.snapshotId,snapshotHash:snapshot.snapshotHash,printerTarget:target,operationId});
      if(!identifier.test(clean(payload.printId))||payload.printerTarget!==target||!['accepted','uncertain','failed'].includes(payload.state))throw Error('Esito stampa non verificabile: controllare lo stato, non reinviare.');
      if((previewTrace.protocol==='legacyStandard'?payload.state==='accepted':payload.accepted===true)&&payload.physicalOutputConfirmed===false)clearIntent();
      return {...payload,operationId,physicalOutputConfirmed:false};
    }
    return Object.freeze({preview,confirm,print,invalidate,ready,get snapshot(){return snapshot&&{...snapshot,pages:[...snapshot.pages]}}});
  }
  globalThis.TechnicsDirectPrint=Object.freeze({createSession});
})();
