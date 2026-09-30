// Candidate 426: same bridge transport as Item, server SVG preview, explicit native target.
(() => {
  'use strict';
  const allowed=new Set(['corridor','warehouse']);
  const clean=value=>String(value??'').trim();
  const identifier=/^[A-Za-z0-9_-]{8,160}$/;
  const hash=/^[a-f0-9]{64}$/;
  const operation=/^[A-Za-z0-9_-]{16,120}$/;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const defaultUuid=()=>globalThis.crypto?.randomUUID?.().replaceAll('-','')||'';
  function createSession({baseUrl=clean(globalThis.__technicsBridgeUrl||globalThis.TECHNICS_BRIDGE_URL).replace(/\/$/,''),transport=globalThis.TechnicsTransport?.fetch?.bind(globalThis.TechnicsTransport),wait=sleep,now=()=>Date.now(),uuid=defaultUuid}={}){
    if(!baseUrl||typeof transport!=='function')throw Error('Servizio di stampa non configurato.');
    let snapshot=null,generation=0,confirmation=null,submitted=false;
    const api=async(method,route,body,kind='json')=>{
      const response=await transport(`${baseUrl}${route}`,{method,cache:'no-store',headers:{'Cache-Control':'no-store','ngrok-skip-browser-warning':'1',...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});
      if(!response?.ok){let payload;try{payload=await response.json()}catch{}throw Error(clean(payload?.error)||`Servizio stampa non disponibile (HTTP ${response?.status||0}).`)}
      if(kind==='svg'){
        const contentType=clean(response.headers?.get?.('content-type')).toLowerCase();
        if(!contentType.includes('svg'))throw Error('Formato anteprima server non valido.');
        const svg=await response.text();
        if(!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(svg))throw Error('Pagina SVG non valida.');
        return svg;
      }
      const payload=await response.json();
      if(payload?.ok===false)throw Error(clean(payload.error)||'Servizio stampa non disponibile.');
      return payload;
    };
    function invalidate(){generation++;snapshot=null;confirmation=null;submitted=false}
    async function preview(selection,target){
      invalidate();const current=generation;
      if(!allowed.has(target))throw Error('Destinazione stampa non consentita.');
      if(!Array.isArray(selection)||!selection.length||selection.some(item=>!clean(item?.baseCode)||!clean(item?.unit)))throw Error('Seleziona almeno un articolo valido.');
      const started=await api('POST','/api/packaging/promoitalia/print-preview',{selection:selection.map(item=>({baseCode:clean(item.baseCode),unit:clean(item.unit)})),printerTarget:target});
      if(current!==generation)throw Error('Selezione cambiata: aggiornare l’anteprima.');
      if(!identifier.test(clean(started.snapshotId))||!hash.test(clean(started.snapshotHash))||!identifier.test(clean(started.previewId))||started.printerTarget!==target)throw Error('Snapshot server non valido.');
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
      snapshot={snapshotId:started.snapshotId,snapshotHash:started.snapshotHash,previewId:started.previewId,printerTarget:target,pageCount:state.pageCount,createdAt:now(),pages};
      return {...snapshot,pages:[...pages]};
    }
    const ready=()=>Boolean(snapshot&&now()-snapshot.createdAt<29*60*1000&&!submitted);
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
      const payload=await api('POST','/api/packaging/promoitalia/print',{snapshotId:snapshot.snapshotId,snapshotHash:snapshot.snapshotHash,printerTarget:target,operationId});
      if(!identifier.test(clean(payload.printId))||payload.printerTarget!==target||!['accepted','uncertain','failed'].includes(payload.state))throw Error('Esito stampa non verificabile: controllare lo stato, non reinviare.');
      return {...payload,operationId,physicalOutputConfirmed:false};
    }
    return Object.freeze({preview,confirm,print,invalidate,ready,get snapshot(){return snapshot&&{...snapshot,pages:[...snapshot.pages]}}});
  }
  globalThis.TechnicsDirectPrint=Object.freeze({createSession});
})();
