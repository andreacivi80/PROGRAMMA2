(()=>{
  "use strict";
  const NODE_ID="technics-utente38-packing-reader",CAPABILITY="packing-open:get:v1",MAX_ENTRIES=32,MAX_BYTES=4096,TTL_MS=30*60*1000;
  const unsafeKeys=new Set(["__proto__","prototype","constructor"]);
  const validKey=key=>typeof key==="string"&&key.trim().length>0&&key.length<=128&&!/[\u0000-\u001f\u007f]/.test(key)&&!unsafeKeys.has(key.toLowerCase());
  const validRevision=value=>typeof value==="number"&&Number.isInteger(value)&&value>=0&&value<=2147483647;
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const validGuid=value=>typeof value==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)&&value!=="00000000-0000-0000-0000-000000000000";
  const problem=(code,message)=>Object.assign(new Error(message),{code});
  const stale=()=>problem("PACKING_READER_REVISION_NOT_YET_VISIBLE","Elenco non ancora allineato al salvataggio confermato. Premi Aggiorna elenco per riprovare; nessuna scrittura è stata reinviata.");
  function exactOrigin(value){
    if(typeof value!=="string"||!value)return null;
    try{const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname==="/"&&value===url.origin?url.origin:null}catch{return null}
  }
  function create({bridgeUrl,getConfig,fetch:transportFetch,now=Date.now,storage=()=>globalThis.localStorage,subscribeStorage=handler=>globalThis.addEventListener?.("storage",handler),onPersistenceWarning=()=>{}}={}){
    const bridgeOrigin=new URL(bridgeUrl).origin,minimums=new Map(),registryKey=`technics-packing-confirmed-minima-v1:${encodeURIComponent(bridgeOrigin)}:${NODE_ID}`;let hooksInstalled=false,readError="",writeError="",lastWarning="";
    function prune(){const time=now();for(const [key,value] of minimums)if(time-value.at>=TTL_MS||time<value.at)minimums.delete(key)}
    function trim(){prune();const ordered=[...minimums].sort((a,b)=>a[1].at-b[1].at||a[0].localeCompare(b[0]));minimums.clear();for(const [key,value] of ordered.slice(-MAX_ENTRIES))minimums.set(key,value)}
    function persistenceNotice(){return readError||writeError?"Salvataggio confermato, ma memoria delle revisioni non disponibile o non valida: l'elenco del lettore non può essere certificato. Non chiudere questa pagina; le scritture e la coda restano invariate.":""}
    function warn(){const message=persistenceNotice();if(message&&message!==lastWarning){lastWarning=message;try{onPersistenceWarning(message)}catch{}}if(!message)lastWarning=""}
    function mergeRegistry(raw){
      if(raw===null)return;
      if(typeof raw!=="string"||raw.length>32768)throw Error("registry-size");
      const value=JSON.parse(raw);
      if(value?.schema!==1||value.bridgeOrigin!==bridgeOrigin||value.readerNodeId!==NODE_ID||!Array.isArray(value.entries)||value.entries.length>MAX_ENTRIES)throw Error("registry-scope");
      const keys=new Set();
      for(const entry of value.entries){if(!validKey(entry?.opBarcode)||!validRevision(entry.revision)||!Number.isSafeInteger(entry.at)||entry.at<0||keys.has(entry.opBarcode))throw Error("registry-entry");keys.add(entry.opBarcode)}
      for(const entry of value.entries){if(now()<entry.at||now()-entry.at>=TTL_MS)continue;const prior=minimums.get(entry.opBarcode);minimums.set(entry.opBarcode,{revision:Math.max(prior?.revision??0,entry.revision),at:Math.max(prior?.at??0,entry.at)})}
      trim();
    }
    function readRegistry(){try{const raw=storage().getItem(registryKey);mergeRegistry(raw);readError="";return raw}catch(error){readError="registry-read";warn();return undefined}}
    function persistRegistry(){
      const raw=readRegistry();if(readError)return false;trim();
      const serialized=JSON.stringify({schema:1,bridgeOrigin,readerNodeId:NODE_ID,entries:[...minimums].map(([opBarcode,value])=>({opBarcode,...value}))});
      try{if(raw!==serialized)storage().setItem(registryKey,serialized);writeError="";warn();return true}catch(error){writeError="registry-write";warn();return false}
    }
    function rememberConfirmed(session,expectedOp=session?.opBarcode){
      const key=session?.opBarcode,revision=session?.revision;
      if(!validKey(key)||key!==expectedOp||!validRevision(revision))return false;
      readRegistry();prune();const previous=minimums.get(key);
      minimums.set(key,{revision:Math.max(previous?.revision??0,revision),at:now()});trim();
      return persistRegistry();
    }
    function minimumRevisions(){readRegistry();prune();const result=Object.create(null);for(const [key,value] of minimums)result[key]=value.revision;return result}
    function installHooks(hooks){
      if(hooksInstalled)return true;
      if(typeof hooks?.wrapApplySharedSession!=="function"||typeof hooks?.revision!=="function")return false;
      hooks.wrapApplySharedSession((previous,session,quiet)=>{
        const before=hooks.revision(),blocked=hooks.hasPendingSessionApply?.()===true,result=previous(session,quiet),after=hooks.revision();
        // Local drafts bypass this server-session hook. A refused/deferred apply
        // does not advance the revision and must never count as a commit.
        if(!blocked&&validRevision(session?.revision)&&after===session.revision&&(after>before||hooks.currentOp?.()===session.opBarcode))rememberConfirmed(session);
        return result;
      });
      hooksInstalled=true;return true;
    }
    function isEnabled(){return getConfig?.()?.enabled===true}
    function readerConfig(){
      const config=getConfig?.(),origin=exactOrigin(config?.origin),authorized=exactOrigin(config?.authorizedOrigin),identity=config?.expectedIdentity;
      if(!origin||origin!==authorized||!identity||identity.nodeId!==NODE_ID||!["releaseId","contractVersion"].every(key=>typeof identity[key]==="string"&&identity[key].trim().length>0)||!validGuid(identity.coordinatorId)||typeof identity.buildHash!=="string"||!/^[a-fA-F0-9]{64}$/.test(identity.buildHash))throw problem("PACKING_READER_CONFIGURATION_INVALID","Lettore elenco non configurato o identità non autorizzata. Nessun passaggio automatico al ponte principale.");
      return {origin,identity};
    }
    function covers(required,rows,proven){
      for(const [key,revision] of Object.entries(required)){
        const matching=rows.filter(row=>row?.opBarcode===key);
        if(matching.length){if(matching.every(row=>validRevision(row.revision)&&row.revision>=revision))continue;return false}
        const proof=proven&&own(proven,key)?proven[key]:null;
        if(validRevision(proof)&&proof>=revision)continue;
        return false;
      }
      return true;
    }
    function cacheUsable(cache){const minimum=minimumRevisions();return Boolean(!(isEnabled()&&(readError||writeError))&&cache&&Array.isArray(cache.open)&&Array.isArray(cache.closed)&&covers(minimum,[...cache.open,...cache.closed],cache.minimumRevisions))}
    function failure(response,payload){
      const code=String(payload?.errorCode||payload?.code||"");
      const error=response.status===409||code==="PACKING_READER_REVISION_NOT_YET_VISIBLE"?stale():code==="PACKING_READER_IDENTITY_INVALID"?problem(code,"Identità del lettore elenco non verificata. Premi Ripristina elenco per riprovare."):code==="PACKING_READER_INVALID_MINIMUM_REVISION"?problem(code,"Verifica delle revisioni non accettata dal lettore. Nessun elenco precedente è stato presentato come aggiornato."):problem(code||"PACKING_READER_UNAVAILABLE","Elenco non disponibile dal lettore. Premi Ripristina elenco per riprovare; la ricerca OP e le scritture restano sul ponte attuale.");
      if(code)error.code=code;
      return Object.assign(error,{status:response.status,httpStatus:response.status});
    }
    async function request(sourceUrl,options={}){
      const method=String(options.method||"GET").toUpperCase(),source=new URL(sourceUrl,bridgeUrl);
      const listRequest=method==="GET"&&source.pathname==="/api/packing/open",readerUsed=isEnabled()&&listRequest;
      let target=sourceUrl,requestOptions=options,config=null,sent=Object.create(null);
      if(readerUsed){
        if(source.origin!==bridgeOrigin||source.username||source.password||source.hash)throw problem("PACKING_READER_SOURCE_INVALID","Origine della richiesta elenco non autorizzata.");
        config=readerConfig();sent=minimumRevisions();if(readError||writeError){persistRegistry();if(readError||writeError)throw problem("PACKING_READER_ACK_PERSISTENCE_UNAVAILABLE",persistenceNotice())}const serialized=JSON.stringify(sent);
        if(new TextEncoder().encode(serialized).length>MAX_BYTES)throw problem("PACKING_READER_MINIMUM_TOO_LARGE","Troppe revisioni da verificare in un solo elenco. Nessun elenco precedente è stato presentato come aggiornato.");
        const headers=new Headers(options.headers||{});headers.set("X-Technics-Minimum-Revisions",serialized);
        target=config.origin+source.pathname+source.search;requestOptions={...options,method:"GET",headers,redirect:"error",credentials:"omit"};
      }
      let response,payload,readerDeadlineError=null;
      try{
        if(!readerUsed){response=await transportFetch(target,requestOptions,listRequest?{attempts:1}:undefined);payload=await response.json()}
        else{
          const controller=new AbortController(),deadline=performance.now()+8000,timeout=Object.assign(problem("READER_TIMEOUT","Il lettore non ha completato l'elenco entro 8 secondi."),{status:0,httpStatus:0,networkFailure:true});
          let timer,listener,finished=false;
          const cancellation=()=>Object.assign(problem("PACKING_READER_CANCELLED","Lettura elenco annullata."),{cancelled:true});
          const expire=()=>{readerDeadlineError=timeout;controller.abort(timeout);return timeout};
          const check=()=>{if(options.signal?.aborted)throw cancellation();if(finished||performance.now()>=deadline)throw expire();if(controller.signal.aborted)throw controller.signal.reason};
          const boundary=new Promise((_,reject)=>{timer=setTimeout(()=>reject(expire()),8000);listener=()=>{const error=cancellation();controller.abort(error);reject(error)};options.signal?.addEventListener("abort",listener,{once:true})});
          try{
            if(options.signal?.aborted){listener();await boundary}
            const operation=(async()=>{
              const received=await transportFetch(target,{...requestOptions,signal:controller.signal},{attempts:1});response=received;check();
              const decoded=await response.json();check();return decoded;
            })();
            payload=await Promise.race([operation,boundary]);
          }finally{finished=true;clearTimeout(timer);options.signal?.removeEventListener("abort",listener)}
        }
      }
      catch(error){
        if(!readerUsed||error?.cancelled||options.signal?.aborted)throw error;
        if(response&&!response.ok)throw failure(response,null);
        if(readerDeadlineError)throw readerDeadlineError;
        const status=Number(error?.status??error?.httpStatus??response?.status??0),networkFailure=!response&&(error==="timeout"||error?.code==="TECHNICS_TRANSPORT_CIRCUIT_OPEN"||["TypeError","AbortError","TimeoutError"].includes(error?.name)||/^(ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|UND_ERR_[A-Z_]+)$/.test(String(error?.code||"")));
        throw Object.assign(problem(error?.code||(response?"PACKING_READER_INVALID_RESPONSE":"PACKING_READER_UNAVAILABLE"),response?"Risposta elenco non leggibile. Nessun elenco sostitutivo è stato caricato.":"Lettore elenco non raggiungibile. Premi Ripristina elenco per riprovare; nessun ripiego automatico sul ponte principale."),{status,httpStatus:status,networkFailure});
      }
      if(!response.ok||payload?.ok!==true){if(readerUsed)throw failure(response,payload);throw new Error(payload?.error||"Elenco non disponibile.")}
      if(!listRequest)return {response,payload,readerUsed:false};
      if(readerUsed){
        const meta=payload.meta,reader=payload.reader;
        const matchingHeaders=meta&&[["X-Technics-Node","nodeId"],["X-Technics-Version","version"],["X-Technics-Node-Role","nodeRole"],["X-Technics-Lease-Epoch","leaseEpoch"],["X-Technics-Request-Id","requestId"],["X-Technics-Server-Time","serverTime"]].every(([header,key])=>typeof meta[key]==="string"&&meta[key].trim().length>0&&response.headers?.get?.(header)===meta[key]);
        if(!meta||!matchingHeaders||!["nodeId","releaseId","contractVersion","buildHash","coordinatorId"].every(key=>meta[key]===config.identity[key])||meta.nodeRole!=="reader"||!validGuid(meta.bootId)||meta.source!=="TechnicsPackingListReader"||meta.dataAuthority!=="Technics"||!Number.isFinite(Date.parse(meta.serverTime))||Date.parse(meta.serverTime)>now()+300000||meta.readOnly!==true||meta.databaseVerified!==false||!Array.isArray(meta.capabilities)||meta.capabilities.length!==1||meta.capabilities[0]!==CAPABILITY||payload.store?.available!==true||reader?.readOnly!==true||reader?.sqlAccess!==false||typeof reader?.metadataComplete!=="boolean"||reader.minimumRevisionsChecked!==Object.keys(sent).length)throw problem("PACKING_READER_IDENTITY_INVALID","Risposta del lettore non conforme all'identità o al contratto autorizzato. Nessun elenco sostitutivo è stato caricato.");
      }
      if(!Array.isArray(payload.sessions)||!Array.isArray(payload.closedSessions))throw problem("PACKING_READER_INVALID_RESPONSE","Risposta elenco incompleta. Premi Aggiorna elenco per riprovare.");
      // A save may have completed while this list request was in flight.
      const current=minimumRevisions(),rows=[...payload.sessions,...payload.closedSessions];
      if(!covers(current,rows,readerUsed?sent:null))throw stale();
      const proven=Object.create(null);for(const [key,revision] of Object.entries(current))proven[key]=revision;
      return {response,payload,readerUsed,minimumRevisions:proven,metadataIncomplete:readerUsed&&payload.reader.metadataComplete===false,notice:readerUsed&&payload.reader.metadataComplete===false?"Elenco letto dagli archivi: alcuni metadati OP/OV, articolo o cliente non sono disponibili. Non è una verifica del gestionale.":""};
    }
    async function requestMainFallback(readerFailure,{signal}={}){
      if(!isEnabled())throw problem("PACKING_MAIN_CONFIGURATION_INVALID","Lettore dedicato non abilitato.");
      readerConfig();
      const checkedMinimums=()=>{const value=minimumRevisions();if(readError||writeError)throw problem("PACKING_READER_ACK_PERSISTENCE_UNAVAILABLE",persistenceNotice());return value};
      const helper=globalThis.TechnicsPackingMainReadFallback;
      if(!helper)throw problem("PACKING_MAIN_CONFIGURATION_INVALID","Modulo di recupero elenco non disponibile.");
      const fallback=helper.create({bridgeUrl:bridgeOrigin,getBridges:()=>globalThis.TECHNICS_BRIDGES,fetch:transportFetch});
      const result=await fallback.fetchOnce({readerFailure,minimumRevisions:checkedMinimums(),getMinimumRevisions:checkedMinimums,signal});
      if(signal?.aborted)throw Object.assign(problem("PACKING_MAIN_CANCELLED","Lettura annullata."),{cancelled:true});
      const current=checkedMinimums();
      if(!result.degradedReadOnly&&!covers(current,[...result.payload.sessions,...result.payload.closedSessions],null))throw stale();
      return {response:result.response,payload:result.payload,readerUsed:false,via:result.via,minimumRevisions:{...current},metadataIncomplete:false,freshnessUnverified:true,degradedReadOnly:result.degradedReadOnly===true,lastSyncAt:result.lastSyncAt||null,notice:result.degradedReadOnly?"COPIA NON AGGIORNATA · SOLA CONSULTAZIONE":"Elenco ricevuto tramite PC38 · aggiornamento dei file non attestato"};
    }
    readRegistry();
    try{subscribeStorage(event=>{if(event.key!==registryKey&&event.key!==null)return;try{mergeRegistry(event.newValue??null);persistRegistry()}catch{readError="registry-event";warn()}})}catch{readError="registry-subscription";warn()}
    return Object.freeze({request,requestMainFallback,installHooks,minimumRevisions,cacheUsable,isEnabled,rememberConfirmed,recordAcknowledged:rememberConfirmed,persistenceNotice,diagnostics:()=>({registryKey,persistenceAvailable:!readError&&!writeError,readError,writeError,entries:minimums.size}),limits:Object.freeze({entries:MAX_ENTRIES,bytes:MAX_BYTES,ttlMs:TTL_MS})});
  }
  globalThis.TechnicsPackingReaderPolicy=Object.freeze({create,version:"1.9.59"});
})();
