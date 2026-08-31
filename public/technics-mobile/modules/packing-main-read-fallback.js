(()=>{
  'use strict';
  const EXPECTED=Object.freeze({nodeId:'technics-utente38-secondary',nodeRole:'secondary',version:'1.9.31'});
  const forbidden=/IDENTITY|SCHEMA|PARSE|JSON|REVISION|MINIMUM|PERSISTENCE|AUTH|FORBIDDEN|CONFIG|SOURCE_INVALID|CANCEL/i;
  const transientCodes=new Set(['','PACKING_READER_UNAVAILABLE','PACKING_READER_BUSY','READER_BUSY','READER_UNAVAILABLE','READER_TIMEOUT','READER_NETWORK_FAILURE','GATEWAY_TIMEOUT','TECHNICS_TRANSPORT_CIRCUIT_OPEN']);
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const fail=(code,message)=>Object.assign(new Error(message),{code});
  const validKey=k=>typeof k==='string'&&k.trim().length>0&&k.length<=128&&!/[\u0000-\u001f\u007f]/.test(k)&&!['__proto__','prototype','constructor'].includes(k.toLowerCase());
  const validRevision=n=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=2147483647;
  function canFallback(error,signal){
    if(signal?.aborted||error?.cancelled===true)return false;
    const status=error?.status??error?.httpStatus,code=String(error?.code||error?.errorCode||'');
    if([401,403,409].includes(status)||forbidden.test(code)||!transientCodes.has(code))return false;
    if([429,502,503,504].includes(status))return true;
    return (status===undefined||status===null||status===0)&&error?.networkFailure===true;
  }
  function minima(value={}){
    if(!value||typeof value!=='object'||Array.isArray(value)||Object.prototype.toString.call(value)!=='[object Object]')throw fail('PACKING_MAIN_MINIMUM_INVALID','Revisioni richieste non valide.');
    const entries=Object.entries(value);if(entries.length>32||new TextEncoder().encode(JSON.stringify(value)).length>4096||entries.some(([k,v])=>!validKey(k)||!validRevision(v)))throw fail('PACKING_MAIN_MINIMUM_INVALID','Revisioni richieste non valide.');
    return Object.fromEntries(entries);
  }
  function validate(payload,responseHeaders,{minimumRevisions={},expectedIdentity=EXPECTED,now=Date.now()}={}){
    const required=minima(minimumRevisions),meta=payload?.meta,headers=new Headers(responseHeaders);
    if(payload?.ok!==true||!meta||!Array.isArray(payload.sessions)||!Array.isArray(payload.closedSessions))throw fail('PACKING_MAIN_SCHEMA_INVALID','Elenco del ponte principale incompleto.');
    if(!expectedIdentity||!['nodeId','nodeRole','version'].every(k=>typeof expectedIdentity[k]==='string'&&expectedIdentity[k].length>0&&meta[k]===expectedIdentity[k])||meta.source!=='TechnicsBridge'||meta.dataAuthority!=='Technics'||meta.readOnly!==true)throw fail('PACKING_MAIN_IDENTITY_INVALID','Identità del ponte principale non verificata.');
    const fields=[['X-Technics-Request-Id','requestId'],['X-Technics-Version','version'],['X-Technics-Node','nodeId'],['X-Technics-Node-Role','nodeRole'],['X-Technics-Lease-Epoch','leaseEpoch'],['X-Technics-Server-Time','serverTime']];
    if(fields.some(([h,k])=>typeof meta[k]!=='string'||!meta[k]||headers.get(h)!==meta[k])||!/^[A-Za-z0-9-]{1,128}$/.test(meta.requestId)||!/^\d{1,20}$/.test(meta.leaseEpoch))throw fail('PACKING_MAIN_IDENTITY_INVALID','Metadati e intestazioni del ponte non corrispondono.');
    const serverAt=Date.parse(meta.serverTime);
    if(!/^\d{4}-\d{2}-\d{2}T.*Z$/.test(meta.serverTime)||!Number.isFinite(serverAt)||!Number.isFinite(now)||serverAt>now+30000||now-serverAt>30000||payload.stale===true||payload.offline===true||/stale|offline/i.test(headers.get('X-Technics-Cache')||''))throw fail('PACKING_MAIN_FRESHNESS_UNVERIFIED','Risposta precedente o data del ponte non verificabile; elenco non dichiarato aggiornato.');
    if(!/application\/json/i.test(headers.get('Content-Type')||''))throw fail('PACKING_MAIN_SCHEMA_INVALID','Formato elenco non verificabile.');
    if(payload.store?.available!==true||payload.store.authoritative!==true||payload.store.source!=='server')throw fail('PACKING_MAIN_STORE_UNAVAILABLE','Archivio comune non confermato dal ponte.');
    const rows=[...payload.sessions,...payload.closedSessions],seen=new Map();
    for(const row of rows){
      if(!row||typeof row!=='object'||!validKey(row.opBarcode)||!validRevision(row.revision)||seen.has(row.opBarcode))throw fail('PACKING_MAIN_SCHEMA_INVALID','OP o revisione non valide nell’elenco.');
      for(const key of ['number','ovNumber','articleCode','articleName','customer','lot'])if(own(row,key)&&typeof row[key]!=='string')throw fail('PACKING_MAIN_SCHEMA_INVALID','Campi elenco non validi.');
      seen.set(row.opBarcode,row.revision);
    }
    // Both open and closed rows provide explicit revision evidence. Missing rows
    // cannot be inferred deleted/closed, even if the response claims other proofs.
    for(const [op,revision] of Object.entries(required))if(!seen.has(op)||seen.get(op)<revision)throw fail('PACKING_MAIN_REVISION_NOT_VISIBLE','Elenco principale non ancora allineato al salvataggio confermato.');
    return {payload,via:'main-bridge',minimumRevisions:required,identity:{...expectedIdentity,requestId:meta.requestId,serverTime:meta.serverTime,leaseEpoch:meta.leaseEpoch}};
  }
  function origin(value){try{const u=new URL(value);return typeof value==='string'&&u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'&&u.origin===value?u.origin:null}catch{return null}}
  function create({getBridges,bridgeUrl,expectedIdentity=EXPECTED,fetch:transportFetch,now=Date.now,clock=()=>performance.now(),timeoutMs=8000}={}){
    if(typeof getBridges!=='function'||typeof transportFetch!=='function'||!origin(bridgeUrl)||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw fail('PACKING_MAIN_CONFIGURATION_INVALID','Ponte principale non configurato.');
    const allowed=()=>{const bridges=getBridges();if(!Array.isArray(bridges)||!bridges.includes(bridgeUrl)||bridges.some(x=>!origin(x)))throw fail('PACKING_MAIN_SOURCE_INVALID','Indirizzo principale non presente nella configurazione autorizzata.');};
    allowed();
    async function fetchOnce({readerFailure,minimumRevisions={},getMinimumRevisions,signal}={}){
      allowed();if(!canFallback(readerFailure,signal))throw fail('PACKING_MAIN_FALLBACK_NOT_ALLOWED','Questo errore del lettore richiede verifica; nessun passaggio automatico.');
      const required=minima(minimumRevisions),controller=new AbortController();let timer,listener;
      const timeout=fail('PACKING_MAIN_TIMEOUT','Il ponte principale non ha completato l’elenco entro il limite.');
      const deadline=clock()+timeoutMs;
      const checkDeadline=()=>{if(clock()>=deadline){controller.abort(timeout);throw timeout}if(controller.signal.aborted)throw controller.signal.reason;};
      const cancelled=()=>Object.assign(fail('PACKING_MAIN_CANCELLED','Richiesta elenco annullata.'),{cancelled:true});
      const boundary=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort(timeout);reject(timeout)},timeoutMs);listener=()=>{const error=cancelled();controller.abort(error);reject(error)};signal?.addEventListener('abort',listener,{once:true});});
      try{
        if(signal?.aborted){listener();return await boundary}
        const operation=(async()=>{
          const response=await transportFetch(bridgeUrl+'/api/packing/open?fresh='+encodeURIComponent(String(now())),{method:'GET',cache:'no-store',redirect:'error',credentials:'omit',headers:{'Cache-Control':'no-store','ngrok-skip-browser-warning':'1'},signal:controller.signal},{attempts:1});
          checkDeadline();
          if(!response?.ok||response.status!==200)throw Object.assign(fail('PACKING_MAIN_UNAVAILABLE','Elenco del ponte principale non disponibile.'),{status:response?.status});
          let payload;try{payload=await response.json()}catch(error){if(error?.name==="SyntaxError")throw fail("PACKING_MAIN_SCHEMA_INVALID","Risposta del ponte principale non leggibile.");throw error}checkDeadline();
          if(getMinimumRevisions!==undefined){if(typeof getMinimumRevisions!=='function')throw fail('PACKING_MAIN_MINIMUM_INVALID','Verifica revisioni correnti non valida.');for(const [op,revision]of Object.entries(minima(getMinimumRevisions())))required[op]=Math.max(required[op]??0,revision);}
          allowed();const verified=validate(payload,response.headers,{minimumRevisions:required,expectedIdentity,now:now()});
          return {...verified,response};
        })();
        return await Promise.race([operation,boundary]);
      }finally{clearTimeout(timer);signal?.removeEventListener('abort',listener);}
    }
    return Object.freeze({fetchOnce});
  }
  globalThis.TechnicsPackingMainReadFallback=Object.freeze({canFallback,validate,create,expectedIdentity:EXPECTED});
})();
