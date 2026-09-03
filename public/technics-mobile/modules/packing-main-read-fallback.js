(()=>{
  'use strict';
  const EXPECTED=Object.freeze([
    Object.freeze({nodeId:'technics-utente73-primary',nodeRole:'primary',version:'1.9.104'}),
    Object.freeze({nodeId:'technics-utente73-primary',nodeRole:'primary',version:'1.9.31'}),
    Object.freeze({nodeId:'technics-utente38-secondary',nodeRole:'secondary',version:'1.9.104'}),
    Object.freeze({nodeId:'technics-utente38-secondary',nodeRole:'secondary',version:'1.9.31'})
  ]);
  const forbidden=/IDENTITY|SCHEMA|PARSE|JSON|REVISION|MINIMUM|PERSISTENCE|AUTH|FORBIDDEN|CONFIG|SOURCE_INVALID|CANCEL/i;
  const transientCodes=new Set(['','PACKING_READER_UNAVAILABLE','PACKING_READER_BUSY','READER_BUSY','READER_UNAVAILABLE','READER_TIMEOUT','READER_NETWORK_FAILURE','GATEWAY_TIMEOUT','TECHNICS_TRANSPORT_CIRCUIT_OPEN']);
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const fail=(code,message)=>Object.assign(new Error(message),{code});
  const validKey=k=>typeof k==='string'&&k.trim().length>0&&k.length<=128&&!/[\u0000-\u001f\u007f]/.test(k)&&!['__proto__','prototype','constructor'].includes(k.toLowerCase());
  const validRevision=n=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=2147483647;
  const validRequestId=id=>typeof id==='string'&&/^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(id);
  function secureRequestId(){
    if(typeof globalThis.crypto?.randomUUID==='function')return globalThis.crypto.randomUUID();
    if(typeof globalThis.crypto?.getRandomValues!=='function')throw fail('PACKING_MAIN_CONFIGURATION_INVALID','Identificativo sicuro della richiesta non disponibile.');
    const bytes=new Uint8Array(16);globalThis.crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
  }
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
  function validate(payload,responseHeaders,{minimumRevisions={},expectedIdentity=EXPECTED,now=Date.now(),expectedRequestId,requestFreshnessBounded=false}={}){
    const required=minima(minimumRevisions),meta=payload?.meta,headers=new Headers(responseHeaders);
    if(payload?.ok!==true||!meta||!Array.isArray(payload.sessions)||!Array.isArray(payload.closedSessions))throw fail('PACKING_MAIN_SCHEMA_INVALID','Elenco del ponte principale incompleto.');
    const identities=Array.isArray(expectedIdentity)?expectedIdentity:[expectedIdentity],matchedIdentity=identities.find(identity=>identity&&['nodeId','nodeRole','version'].every(k=>typeof identity[k]==='string'&&identity[k].length>0&&meta[k]===identity[k]));
    if(!matchedIdentity||meta.source!=='TechnicsBridge'||meta.dataAuthority!=='Technics'||meta.readOnly!==true)throw fail('PACKING_MAIN_IDENTITY_INVALID','Identità del ponte principale non verificata.');
    const fields=[['X-Technics-Request-Id','requestId'],['X-Technics-Version','version'],['X-Technics-Node','nodeId'],['X-Technics-Node-Role','nodeRole'],['X-Technics-Lease-Epoch','leaseEpoch'],['X-Technics-Server-Time','serverTime']];
    if(fields.some(([h,k])=>typeof meta[k]!=='string'||!meta[k]||headers.get(h)!==meta[k])||!/^[A-Za-z0-9-]{1,128}$/.test(meta.requestId)||!/^\d{1,20}$/.test(meta.leaseEpoch))throw fail('PACKING_MAIN_IDENTITY_INVALID','Metadati e intestazioni del ponte non corrispondono.');
    const serverAt=Date.parse(meta.serverTime),cacheHeader=headers.get('X-Technics-Cache')||'',degradedHeader=headers.get('X-Technics-Degraded-Read-Only')||'',lastSyncHeader=headers.get('X-Technics-Last-Sync-At')||'',gatewayHeader=headers.get('X-Technics-Gateway')||'',emergencyMarked=Boolean((cacheHeader&&cacheHeader!=='NONE')||degradedHeader||lastSyncHeader||/emergency/i.test(gatewayHeader)),emergency=cacheHeader==='emergency-stale-readonly'&&degradedHeader==='true'&&gatewayHeader==='stable-worker-emergency-cache'&&payload.degradedReadOnly===true&&payload.stale===true&&payload.offline===true&&payload.cacheSource==='gateway-last-known-good'&&payload.lastSyncAt===lastSyncHeader;
    const correlated=expectedRequestId!==undefined&&!emergency;
    if(correlated&&(!validRequestId(expectedRequestId)||meta.requestId!==expectedRequestId||requestFreshnessBounded!==true))throw fail('PACKING_MAIN_IDENTITY_INVALID','Risposta non corrispondente alla richiesta elenco corrente.');
    if(!/^\d{4}-\d{2}-\d{2}T.*Z$/.test(meta.serverTime)||!Number.isFinite(serverAt))throw fail('PACKING_MAIN_FRESHNESS_UNVERIFIED','Data del ponte non verificabile.');
    if(emergencyMarked&&!emergency)throw fail('PACKING_MAIN_FRESHNESS_UNVERIFIED','Contratto della copia di emergenza incompleto.');
    let lastSyncAt=null;
    if(emergency){const syncAt=Date.parse(lastSyncHeader),age=now-syncAt;if(!Number.isFinite(now)||!Number.isFinite(syncAt)||age<0||age>5*60*1000||serverAt>syncAt+30000)throw fail('PACKING_MAIN_FRESHNESS_UNVERIFIED','Copia di emergenza scaduta o non verificabile.');lastSyncAt=new Date(syncAt).toISOString()}
    else if(payload.stale===true||payload.offline===true||payload.degradedReadOnly===true||(!correlated&&(!Number.isFinite(now)||serverAt>now+30000||now-serverAt>30000)))throw fail('PACKING_MAIN_FRESHNESS_UNVERIFIED','Risposta precedente o data del ponte non verificabile; elenco non dichiarato aggiornato.');
    if(!/application\/json/i.test(headers.get('Content-Type')||''))throw fail('PACKING_MAIN_SCHEMA_INVALID','Formato elenco non verificabile.');
    const rows=[...payload.sessions,...payload.closedSessions],seen=new Map();
    const authoritativeStore=payload.store?.available===true&&payload.store.authoritative===true&&payload.store.source==='server';
    const primaryMirror=payload.store?.available===true&&payload.store.authoritative===false&&payload.store.source==='mirror'&&!emergency&&correlated&&(!gatewayHeader||gatewayHeader==='stable-worker')&&matchedIdentity.nodeId==='technics-utente73-primary'&&matchedIdentity.nodeRole==='primary'&&Number.isSafeInteger(payload.store.fileCount)&&payload.store.fileCount>=rows.length&&payload.store.lastSyncAt==null;
    if(!authoritativeStore&&!primaryMirror)throw fail('PACKING_MAIN_STORE_UNAVAILABLE','Archivio comune non confermato dal ponte.');
    for(const row of rows){
      if(!row||typeof row!=='object'||!validKey(row.opBarcode)||!validRevision(row.revision)||seen.has(row.opBarcode))throw fail('PACKING_MAIN_SCHEMA_INVALID','OP o revisione non valide nell’elenco.');
      for(const key of ['number','ovNumber','articleCode','articleName','customer','lot'])if(own(row,key)&&typeof row[key]!=='string')throw fail('PACKING_MAIN_SCHEMA_INVALID','Campi elenco non validi.');
      seen.set(row.opBarcode,row.revision);
    }
    // Both open and closed rows provide explicit revision evidence. Missing rows
    // cannot be inferred deleted/closed, even if the response claims other proofs.
    for(const [op,revision] of Object.entries(required))if(!seen.has(op)||seen.get(op)<revision)throw fail('PACKING_MAIN_REVISION_NOT_VISIBLE','Elenco principale non ancora allineato al salvataggio confermato.');
    return {payload,via:emergency?'gateway-emergency-cache':primaryMirror?'main-primary-mirror':'main-bridge',degradedReadOnly:emergency,freshnessUnverified:primaryMirror,lastSyncAt,minimumRevisions:required,identity:{...matchedIdentity,requestId:meta.requestId,serverTime:meta.serverTime,leaseEpoch:meta.leaseEpoch}};
  }
  function origin(value){try{const u=new URL(value);return typeof value==='string'&&u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'&&u.origin===value?u.origin:null}catch{return null}}
  function create({getBridges,bridgeUrl,expectedIdentity=EXPECTED,fetch:transportFetch,now=Date.now,clock=()=>performance.now(),timeoutMs=8000}={}){
    if(typeof getBridges!=='function'||typeof transportFetch!=='function'||!origin(bridgeUrl)||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw fail('PACKING_MAIN_CONFIGURATION_INVALID','Ponte principale non configurato.');
    const allowed=()=>{const bridges=getBridges();if(!Array.isArray(bridges)||!bridges.includes(bridgeUrl)||bridges.some(x=>!origin(x)))throw fail('PACKING_MAIN_SOURCE_INVALID','Indirizzo principale non presente nella configurazione autorizzata.');};
    allowed();
    async function fetchOnce({readerFailure,minimumRevisions={},getMinimumRevisions,signal}={}){
      allowed();if(!canFallback(readerFailure,signal))throw fail('PACKING_MAIN_FALLBACK_NOT_ALLOWED','Questo errore del lettore richiede verifica; nessun passaggio automatico.');
      const requestId=secureRequestId();if(!validRequestId(requestId))throw fail('PACKING_MAIN_CONFIGURATION_INVALID','Identificativo sicuro della richiesta non valido.');
      const required=minima(minimumRevisions),controller=new AbortController();let timer,listener;
      const timeout=fail('PACKING_MAIN_TIMEOUT','Il ponte principale non ha completato l’elenco entro il limite.');
      const deadline=clock()+timeoutMs;
      const checkDeadline=()=>{if(clock()>=deadline){controller.abort(timeout);throw timeout}if(controller.signal.aborted)throw controller.signal.reason;};
      const cancelled=()=>Object.assign(fail('PACKING_MAIN_CANCELLED','Richiesta elenco annullata.'),{cancelled:true});
      const boundary=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort(timeout);reject(timeout)},timeoutMs);listener=()=>{const error=cancelled();controller.abort(error);reject(error)};signal?.addEventListener('abort',listener,{once:true});});
      try{
        if(signal?.aborted){listener();return await boundary}
        const operation=(async()=>{
          const response=await transportFetch(bridgeUrl+'/api/packing/open?fresh='+encodeURIComponent(String(now())),{method:'GET',cache:'no-store',redirect:'error',credentials:'omit',headers:{'Cache-Control':'no-store','ngrok-skip-browser-warning':'1','X-Technics-Request-Id':requestId},signal:controller.signal},{attempts:1});
          checkDeadline();
          if(!response?.ok||response.status!==200)throw Object.assign(fail('PACKING_MAIN_UNAVAILABLE','Elenco del ponte principale non disponibile.'),{status:response?.status});
          let payload;try{payload=await response.json()}catch(error){if(error?.name==="SyntaxError")throw fail("PACKING_MAIN_SCHEMA_INVALID","Risposta del ponte principale non leggibile.");throw error}checkDeadline();
          if(getMinimumRevisions!==undefined){if(typeof getMinimumRevisions!=='function')throw fail('PACKING_MAIN_MINIMUM_INVALID','Verifica revisioni correnti non valida.');for(const [op,revision]of Object.entries(minima(getMinimumRevisions())))required[op]=Math.max(required[op]??0,revision);}
          allowed();const verified=validate(payload,response.headers,{minimumRevisions:required,expectedIdentity,now:now(),expectedRequestId:requestId,requestFreshnessBounded:true});
          return {...verified,response};
        })();
        return await Promise.race([operation,boundary]);
      }finally{clearTimeout(timer);signal?.removeEventListener('abort',listener);}
    }
    return Object.freeze({fetchOnce});
  }
  globalThis.TechnicsPackingMainReadFallback=Object.freeze({canFallback,validate,create,expectedIdentity:EXPECTED});
})();
