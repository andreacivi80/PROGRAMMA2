(()=>{
  "use strict";
  const incompleteMessage="Il collegamento dati ha risposto in modo incompleto. Riprova tra pochi secondi.";
  const rawFetch=globalThis.fetch.bind(globalThis);
  const state={requests:0,retries:0,recovered:0,failures:0,timeouts:0,offlineWaits:0,httpRetries:0,deduplicated:0,cached:0,discarded:0,integrityFailures:0,lastFailure:"",lastSuccessAt:"",lastLatencyMs:0,lastRequestId:"",lastResponseRequestId:"",lastResponseCorrelated:true,emergencyReadOnly:false,lastServerTime:"",lastDataTime:"",lastSource:"",lastNodeId:"",lastNodeRole:"",lastLeaseEpoch:"",lastBridgeVersion:""};
  const inFlight=new Map(),latestSequence=new Map(),responseCache=new Map(),activeControllers=new Map(),routeTimings=new Map();
  let normalActive=0;const normalQueue=[];
  const acquireSlot=urgent=>urgent?Promise.resolve(()=>{}):new Promise(resolve=>{const enter=()=>{normalActive++;let released=false;resolve(()=>{if(released)return;released=true;normalActive--;normalQueue.shift()?.()})};if(normalActive<2)enter();else normalQueue.push(enter)});
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const waitForNetwork=async(maxMs=2500)=>{if(navigator.onLine!==false)return;state.offlineWaits++;await Promise.race([new Promise(resolve=>globalThis.addEventListener?.("online",resolve,{once:true})),pause(maxMs)])};
  const transientStatus=status=>[408,425,429,500,502,503,504].includes(Number(status));
  const requestId=()=>globalThis.crypto?.randomUUID?.()||`tm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clone=value=>globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));
  const canonicalRequestKey=(method,url)=>{
    try{const parsed=new URL(String(url),location.href);for(const name of ["fresh","perf","acceptance","healthProbe"]){parsed.searchParams.delete(name)}parsed.searchParams.sort();return `${method}:${parsed.origin}${parsed.pathname}?${parsed.searchParams.toString()}`}
    catch{return `${method}:${String(url).replace(/([?&])(fresh|perf|acceptance|healthProbe)=[^&]*/g,"$1").replace(/[?&]$/,'')}`}
  };
  const recordTiming=(url,latencyMs)=>{let route=String(url);try{route=new URL(route,location.href).pathname}catch{}const values=routeTimings.get(route)||[];values.push(Math.max(0,Math.round(Number(latencyMs||0))));if(values.length>20)values.shift();routeTimings.set(route,values)};
  const parseText=(text,response,message=incompleteMessage)=>{
    let payload;
    try{payload=JSON.parse(String(text||""))}catch{
      const error=new Error(message);error.status=Number(response?.status||0);error.incompleteResponse=true;throw error;
    }
    if(!payload||typeof payload!=="object"||Array.isArray(payload)){
      const error=new Error(message);error.status=Number(response?.status||0);error.incompleteResponse=true;throw error;
    }
    return payload;
  };
  const read=async(response,message)=>parseText(await response.text(),response,message);
  const verifiedEmergencyResponse=(payload,response,now=Date.now())=>{const cache=String(response?.headers?.get?.("X-Technics-Cache")||""),degraded=String(response?.headers?.get?.("X-Technics-Degraded-Read-Only")||""),lastSyncAt=String(response?.headers?.get?.("X-Technics-Last-Sync-At")||""),gateway=String(response?.headers?.get?.("X-Technics-Gateway")||""),at=Date.parse(lastSyncAt),age=now-at;return cache==="emergency-stale-readonly"&&degraded==="true"&&gateway==="stable-worker-emergency-cache"&&payload?.degradedReadOnly===true&&payload?.stale===true&&payload?.offline===true&&payload?.cacheSource==="gateway-last-known-good"&&payload?.lastSyncAt===lastSyncAt&&Number.isFinite(at)&&age>=0&&age<=5*60*1000};
  const validateMeta=(payload,expectedId,response)=>{
    if(!payload.meta){state.integrityFailures++;const error=new Error("Risposta priva della tracciabilità Technics.");error.incompleteResponse=true;throw error}
    const meta=payload.meta;
    if(!meta.requestId||!meta.serverTime||!meta.version||!meta.nodeId||!meta.nodeRole||!meta.leaseEpoch||meta.dataAuthority!=="Technics"||meta.readOnly!==true){state.integrityFailures++;const error=new Error("Risposta con tracciabilità Technics incompleta.");error.incompleteResponse=true;throw error}
    const emergency=verifiedEmergencyResponse(payload,response);
    if((payload.degradedReadOnly===true||payload.stale===true||payload.offline===true)&&!emergency){state.integrityFailures++;const error=new Error("Copia dati di emergenza non verificabile.");error.incompleteResponse=true;throw error}
    if(expectedId&&String(meta.requestId)!==String(expectedId)&&!emergency){
      state.discarded++;state.integrityFailures++;const error=new Error("Risposta dati temporaneamente non allineata: recupero automatico in corso.");error.incompleteResponse=true;error.transient=true;throw error;
    }
    const headerRequestId=response?.headers?.get?.("X-Technics-Request-Id"),headerNode=response?.headers?.get?.("X-Technics-Node"),headerRole=response?.headers?.get?.("X-Technics-Node-Role"),headerVersion=response?.headers?.get?.("X-Technics-Version"),headerEpoch=response?.headers?.get?.("X-Technics-Lease-Epoch"),headerTime=response?.headers?.get?.("X-Technics-Server-Time");
    if(!headerRequestId||!headerNode||!headerRole||!headerVersion||!headerEpoch||!headerTime||headerRequestId!==String(meta.requestId)||headerNode!==String(meta.nodeId)||headerRole!==String(meta.nodeRole)||headerVersion!==String(meta.version)||headerEpoch!==String(meta.leaseEpoch)||headerTime!==String(meta.serverTime)){state.integrityFailures++;document.dispatchEvent(new CustomEvent("technics:identity-mismatch",{detail:{code:"NODE-IDENTITY-MISMATCH",nodeId:String(meta.nodeId||"")}}));const error=new Error("NODE-IDENTITY-MISMATCH: risposta Technics non coerente.");error.incompleteResponse=true;throw error}
    const serverTime=Date.parse(meta.serverTime);
    if(!Number.isFinite(serverTime)||serverTime>Date.now()+300000)throw new Error("Risposta dati con data non valida.");
    Object.defineProperty(payload,"__technicsEmergencyReadOnly",{value:emergency,enumerable:false});Object.defineProperty(payload,"__technicsResponseCorrelated",{value:!expectedId||String(meta.requestId)===String(expectedId),enumerable:false});return payload;
  };
  const validateShape=(payload,url)=>{
    if(payload.ok===false)return payload;
    const path=(()=>{try{return new URL(String(url),location.href).pathname}catch{return String(url)}})();
    let valid=true;
    if(path==="/health")valid=payload.ok===true&&typeof payload.version==="string";
    else if(path==="/api/items/lookup")valid=Object.prototype.hasOwnProperty.call(payload,"item");
    else if(/^\/api\/planning\/(op|ov|schedule)$/.test(path))valid=Object.prototype.hasOwnProperty.call(payload,"result");
    else if(path==="/api/packing/open"||path==="/api/picking/open")valid=Array.isArray(payload.sessions)&&Array.isArray(payload.closedSessions);
    if(!valid){const error=new Error(incompleteMessage);error.incompleteResponse=true;error.invalidShape=true;throw error}
    return payload;
  };
  const announceSuccess=(url,payload,latencyMs,cached=false)=>{
    const dataTime=payload?.readAt||payload?.item?.readAt||payload?.result?.readAt||payload?.order?.readAt||payload?.meta?.serverTime||new Date().toISOString();
    const source=payload?.result?.source||payload?.store?.source||payload?.meta?.source||"TechnicsBridge";
    const previousNode=state.lastNodeId;state.lastResponseRequestId=String(payload?.meta?.requestId||"");state.lastResponseCorrelated=payload?.__technicsResponseCorrelated!==false;state.emergencyReadOnly=payload?.__technicsEmergencyReadOnly===true;state.lastServerTime=String(payload?.meta?.serverTime||"");state.lastDataTime=String(dataTime||"");state.lastSource=String(source||"");state.lastNodeId=String(payload?.meta?.nodeId||"");state.lastNodeRole=String(payload?.meta?.nodeRole||"");state.lastLeaseEpoch=String(payload?.meta?.leaseEpoch||"");state.lastBridgeVersion=String(payload?.meta?.version||"");setEmergencyReadOnly(state.emergencyReadOnly,state.emergencyReadOnly?String(payload?.lastSyncAt||""):"");if(previousNode&&previousNode!==state.lastNodeId)document.dispatchEvent(new CustomEvent("technics:node-switch",{detail:{code:"UNEXPECTED-NODE-SWITCH",from:previousNode,to:state.lastNodeId,at:new Date().toISOString()}}));
    document.dispatchEvent(new CustomEvent("technics:data-success",{detail:{ok:true,validated:true,url:String(url),dataTime:state.lastDataTime,serverTime:state.lastServerTime,source:state.lastSource,nodeId:state.lastNodeId,nodeRole:state.lastNodeRole,bridgeVersion:state.lastBridgeVersion,requestId:state.lastRequestId,responseRequestId:state.lastResponseRequestId,correlated:state.lastResponseCorrelated,emergencyReadOnly:state.emergencyReadOnly,latencyMs:Number(latencyMs||0),cached:Boolean(cached)}}));
  };
  const runFetch=async(url,options,settings,key,sequence)=>{
    const method=String(options.method||"GET").toUpperCase(),safe=method==="GET"||method==="HEAD",attempts=safe?Math.min(2,Math.max(1,Number(settings.attempts||2))):1,timeoutMs=Math.min(8000,Math.max(3000,Number(settings.timeoutMs||6500)));let lastError;
    for(let attempt=0;attempt<attempts;attempt++){
      if(attempt)await waitForNetwork();
      const id=requestId(),controller=new AbortController(),scope=String(settings.scope||document.querySelector("main.shell")?.dataset.workspace||"global"),urgent=/\/api\/(items\/lookup|barcodes\/resolve)/.test(String(url));activeControllers.set(controller,scope);const releaseSlot=await acquireSlot(urgent),timer=setTimeout(()=>controller.abort("timeout"),timeoutMs),started=performance.now();state.requests++;state.lastRequestId=id;
      try{
        if(controller.signal.aborted)throw controller.signal.reason;
        const headers=new Headers(options.headers||{});headers.set("X-Technics-Request-Id",id);headers.set("X-Technics-Priority",urgent?"urgent":"normal");
        const response=await rawFetch(url,{...options,headers,signal:controller.signal,priority:urgent?"high":"auto"}),payload=validateShape(validateMeta(await read(response,settings.message),id,response),url);
        if(!response.ok&&transientStatus(response.status)){state.httpRetries++;const error=new Error(payload?.error||`Servizio temporaneamente non disponibile (${response.status}).`);error.status=response.status;error.transient=true;throw error}
        if(key&&latestSequence.get(key)!==sequence){state.discarded++;const error=new Error("Risposta superata da una richiesta più recente.");error.staleResponse=true;throw error}
        state.lastLatencyMs=Math.round(performance.now()-started);recordTiming(url,state.lastLatencyMs);if(response.ok&&payload.ok===true){state.lastSuccessAt=new Date().toISOString();announceSuccess(url,payload,state.lastLatencyMs,payload.__technicsEmergencyReadOnly===true)}
        if(attempt){state.recovered++;document.dispatchEvent(new CustomEvent("technics:data-recovered",{detail:{url,attempt:attempt+1}}))}
        return {response,payload,attempt:attempt+1,requestId:id,latencyMs:state.lastLatencyMs};
      }catch(error){
        if(controller.signal.aborted&&controller.signal.reason==="workspace-change"){state.discarded++;const cancelled=cancelledRequest("workspace-change");cancelled.staleResponse=true;throw cancelled}
        lastError=error;state.lastFailure=String(error?.message||error);if(error?.name==="AbortError"||error==="timeout")state.timeouts++;
        if(error?.staleResponse)throw error;
        const retryable=error?.transient||error?.incompleteResponse||error?.name==="AbortError"||Number(error?.status||0)===0||transientStatus(error?.status);
        if(retryable&&attempt<attempts-1){state.retries++;await pause(Math.round(Math.min(550,120*(attempt+1))+Math.random()*80));continue}
      }finally{clearTimeout(timer);activeControllers.delete(controller);releaseSlot()}
    }
    state.failures++;document.dispatchEvent(new CustomEvent("technics:data-failure",{detail:{url,message:state.lastFailure}}));throw lastError||new Error("Collegamento dati non disponibile.");
  };
  const fetchJson=(url,options={},settings={})=>{
    const method=String(options.method||"GET").toUpperCase(),dedupe=settings.dedupe!==false&&method==="GET",key=dedupe?canonicalRequestKey(method,url):"",cacheMs=method==="GET"?Math.max(0,Number(settings.cacheMs||0)):0;
    if(method!=="GET")responseCache.clear();
    if(key&&cacheMs){const cached=responseCache.get(key);if(cached&&Date.now()-cached.savedAt<=cacheMs){state.cached++;const result={...cached.result,payload:clone(cached.result.payload),cached:true};announceSuccess(url,result.payload,result.latencyMs,true);return Promise.resolve(result)}if(cached)responseCache.delete(key)}
    if(key&&inFlight.has(key)){state.deduplicated++;return inFlight.get(key)}
    const sequence=(latestSequence.get(key)||0)+1;if(key)latestSequence.set(key,sequence);
    const promise=runFetch(url,options,settings,key,sequence).then(result=>{if(key&&cacheMs&&result.response.ok&&result.payload.ok===true)responseCache.set(key,{savedAt:Date.now(),result:{...result,payload:clone(result.payload)}});if(method!=="GET"&&result.response.ok&&result.payload.ok===true)document.dispatchEvent(new CustomEvent("technics:data-mutated",{detail:{url:String(url),method}}));return result}).finally(()=>{if(key&&inFlight.get(key)===promise)inFlight.delete(key)});
    if(key)inFlight.set(key,promise);return promise;
  };
  const invalidate=()=>responseCache.clear();
  const cancelledRequest=reason=>{const error=new Error(typeof reason==="string"?reason:"Richiesta annullata.");error.name="AbortError";error.cancelled=true;return error};
  const transportCircuits=new Map();let lastTransportOrigin="";
  const transportOrigin=url=>new URL(String(url),globalThis.location?.href||window.__technicsBridgeUrl).origin;
  const circuitFor=origin=>{let circuit=transportCircuits.get(origin);if(!circuit){circuit={failures:0,openedAt:0};transportCircuits.set(origin,circuit)}return circuit};
  const emergencyReadOnly={active:false,lastSyncAt:"",activatedAt:0};
  const emergencyMutationSelector="#scanMaterial,[data-scan-code],[data-choice-index],[data-remove-choice],[data-confirm-remove],#savePacking,#sharePacking,#confirmPacking,#closePackingOk,#printPacking,#packingPhotoButton,#packingPhotoConfirm,.packingarchivebutton,#packingArchiveConfirm,[data-carton-lot-save],[data-confirm-duplicate],#prepareMultiPicking,#scanPickingGroup,#closePickingGroup,#printPickingGroup,#createPickingList,#scanPickingMaterial,#closePickingList,#printPickingList,[data-delete-picking],[data-delete-picking-group],[data-confirm-delete-single],[data-confirm-delete-group],[data-pick-confirm-state],[data-pick-confirm-group],[data-confirm-create-group],[data-pick-print-confirm]";
  const emergencyFieldSelector="[data-used-code],[data-lot-used-code],[data-lot-scrap-code],[data-carton-lot-value],[data-picking-used]";
  const emergencyScoped=selector=>selector.split(",").map(value=>`.technics-emergency-readonly ${value}`).join(",");
  const ensureEmergencyUi=()=>{
    let style=document.getElementById("technics-emergency-readonly-style");if(!style){style=document.createElement("style");style.id="technics-emergency-readonly-style";style.textContent=".technics-emergency-banner{display:none;box-sizing:border-box;margin:7px 12px;padding:10px 12px;border:2px solid #c48420;border-radius:11px;background:#fff4d8;color:#684711;font-size:10px;font-weight:850;line-height:1.35}.technics-emergency-readonly .technics-emergency-banner{display:block}"+emergencyScoped(emergencyMutationSelector)+"{pointer-events:none!important;opacity:.45!important;filter:grayscale(.35)}"+emergencyScoped(emergencyFieldSelector)+"{pointer-events:none!important;opacity:.6!important}";document.head.append(style)}
    let banner=document.getElementById("technicsEmergencyReadOnlyBanner");if(!banner){banner=document.createElement("div");banner.id="technicsEmergencyReadOnlyBanner";banner.className="technics-emergency-banner";banner.setAttribute("role","status");const anchor=document.getElementById("functionHealthLights")||document.querySelector("header.top");anchor?.after(banner)}
    if(banner){const stamp=emergencyReadOnly.lastSyncAt?new Date(emergencyReadOnly.lastSyncAt).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"non disponibile";banner.textContent=`DATI DI EMERGENZA DELLE ${stamp} · SOLA CONSULTAZIONE. Salvataggi, scansioni, archiviazioni e stampe sono bloccati finché torna una lettura live.`}
  };
  const setEmergencyReadOnly=(active,lastSyncAt="")=>{const changed=emergencyReadOnly.active!==active||emergencyReadOnly.lastSyncAt!==lastSyncAt;emergencyReadOnly.active=active;emergencyReadOnly.lastSyncAt=active?lastSyncAt:"";emergencyReadOnly.activatedAt=active?(emergencyReadOnly.activatedAt||Date.now()):0;document.documentElement.classList.toggle("technics-emergency-readonly",active);document.documentElement.dataset.emergencyReadOnly=String(active);ensureEmergencyUi();if(changed)document.dispatchEvent(new CustomEvent("technics:emergency-readonly",{detail:{active,lastSyncAt:emergencyReadOnly.lastSyncAt}}))};
  const observeTransportResponse=(url,method,response)=>{if(!["GET","HEAD"].includes(method)||!response?.ok)return;const cache=String(response.headers.get("X-Technics-Cache")||""),degraded=String(response.headers.get("X-Technics-Degraded-Read-Only")||""),lastSyncAt=String(response.headers.get("X-Technics-Last-Sync-At")||""),gateway=String(response.headers.get("X-Technics-Gateway")||""),marked=Boolean((cache&&cache!=="NONE")||degraded||lastSyncAt||/emergency/i.test(gateway));if(marked){const at=Date.parse(lastSyncAt),age=Date.now()-at,valid=cache==="emergency-stale-readonly"&&degraded==="true"&&gateway==="stable-worker-emergency-cache"&&Number.isFinite(at)&&age>=0&&age<=5*60*1000;if(!valid)throw Object.assign(new Error("Copia di emergenza non verificabile; dati non caricati."),{code:"TECHNICS_EMERGENCY_CONTRACT_INVALID",incompleteResponse:true});setEmergencyReadOnly(true,new Date(at).toISOString());return}const path=new URL(String(url),globalThis.location?.href||window.__technicsBridgeUrl).pathname;if(path.startsWith("/api/")&&gateway==="stable-worker"&&response.headers.get("X-Technics-Node"))setEmergencyReadOnly(false)};
  const emergencyBlocked=()=>Object.assign(new Error("Modalità di emergenza in sola consultazione: attendi il ritorno dei dati live prima di salvare, scansionare, rimuovere o stampare."),{code:"TECHNICS_EMERGENCY_READ_ONLY",emergencyReadOnly:true});
  document.addEventListener("click",event=>{if(!emergencyReadOnly.active||!event.target?.closest?.(emergencyMutationSelector))return;event.preventDefault();event.stopImmediatePropagation();ensureEmergencyUi();document.getElementById("technicsEmergencyReadOnlyBanner")?.scrollIntoView({block:"nearest"})},true);
  document.addEventListener("beforeinput",event=>{if(!emergencyReadOnly.active||!event.target?.matches?.(emergencyFieldSelector))return;event.preventDefault();ensureEmergencyUi()},true);
  const transportFetch=async(url,options={},controls={})=>{
    const method=String(options.method||"GET").toUpperCase(),safe=method==="GET"||method==="HEAD",attempts=safe?(controls?.attempts===1?1:2):1;
    if(!safe&&emergencyReadOnly.active)throw emergencyBlocked();
    if(options.signal?.aborted)throw cancelledRequest(options.signal.reason);
    const origin=transportOrigin(url),transportCircuit=circuitFor(origin);lastTransportOrigin=origin;
    // A circuit opened by failed background reads must not reject an operator
    // mutation before it has even been sent. Mutations still get one attempt
    // only and retain their operationId; they are never replayed here.
    if(safe&&transportCircuit.openedAt&&Date.now()-transportCircuit.openedAt<10000)throw Object.assign(new Error("Collegamento temporaneamente sospeso dopo errori consecutivi."),{code:"TECHNICS_TRANSPORT_CIRCUIT_OPEN",networkFailure:true});
    if(safe&&transportCircuit.openedAt)Object.assign(transportCircuit,{failures:0,openedAt:0});
    let lastError;
    for(let attempt=0;attempt<attempts;attempt++){
      if(options.signal?.aborted)throw cancelledRequest(options.signal.reason);
      let callerListening=false,responseOwnsCaller=false;
      const requestPath=(()=>{try{return new URL(String(url),globalThis.location?.href||window.__technicsBridgeUrl).pathname}catch{return String(url)}})();
      const timeout=/\/health(?:[/?]|$)/.test(String(url))?4500:safe?8000:requestPath==="/api/packing/photo"?90000:30000;
      const controller=new AbortController(),nativeComposite=options.signal&&typeof AbortSignal!=="undefined"&&typeof AbortSignal.any==="function",detachCaller=()=>{if(callerListening){options.signal.removeEventListener("abort",callerAbort);callerListening=false}},callerAbort=()=>{controller.abort(options.signal.reason);detachCaller()},signal=nativeComposite?AbortSignal.any([controller.signal,options.signal]):controller.signal,timer=setTimeout(()=>controller.abort("timeout"),timeout);
      if(options.signal&&!nativeComposite){callerListening=true;options.signal.addEventListener("abort",callerAbort,{once:true})}
      try{
        const headers=new Headers(options.headers||{});if(!headers.has("X-Technics-Request-Id"))headers.set("X-Technics-Request-Id",requestId());
        const response=await rawFetch(url,{...options,headers,signal});observeTransportResponse(url,method,response);
        if(!response.ok&&safe&&transientStatus(response.status)&&attempt<attempts-1){await pause(180+Math.random()*120);continue}
        if(options.signal?.aborted)throw cancelledRequest(options.signal.reason);
        transportCircuit.failures=0;
        if(options.signal&&!nativeComposite&&response.body){
          const reader=response.body.getReader();responseOwnsCaller=true;
          const body=new ReadableStream({async pull(target){try{const next=await reader.read();if(next.done){detachCaller();reader.releaseLock();target.close()}else target.enqueue(next.value)}catch(error){detachCaller();reader.releaseLock();target.error(error)}},async cancel(reason){detachCaller();try{await reader.cancel(reason)}finally{reader.releaseLock()}}},{highWaterMark:0});
          const wrapped=new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
          for(const key of ["url","redirected","type"])Object.defineProperty(wrapped,key,{value:response[key]});
          return wrapped;
        }
        return response;
      }catch(error){if(options.signal?.aborted)throw cancelledRequest(options.signal.reason);lastError=error;if(attempt>=attempts-1)break;await pause(180+Math.random()*120)}finally{clearTimeout(timer);if(!responseOwnsCaller)detachCaller()}
    }
    if(safe){transportCircuit.failures++;if(transportCircuit.failures>=5)transportCircuit.openedAt=Date.now()}
    throw lastError||new Error("Collegamento dati non disponibile.");
  };
  const cancelObsolete=workspace=>{for(const [controller,scope] of activeControllers)if(scope!=="global"&&scope!==workspace)controller.abort("workspace-change")};
  window.addEventListener("technics-workspace-change",event=>cancelObsolete(String(event.detail?.workspace||"")));
  const diagnostics=()=>Object.freeze({...state,inFlight:inFlight.size,activeControllers:activeControllers.size,normalActive,normalQueued:normalQueue.length,cacheEntries:responseCache.size,routes:[...routeTimings].map(([route,values])=>({route,samples:values.length,lastMs:values.at(-1)||0,averageMs:values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0,maxMs:values.length?Math.max(...values):0}))});
  window.TechnicsTransport=Object.freeze({fetch:transportFetch,emergencyReadOnly:()=>Object.freeze({...emergencyReadOnly}),diagnostics:url=>{let origin=lastTransportOrigin;try{if(url||window.__technicsBridgeUrl)origin=transportOrigin(url||window.__technicsBridgeUrl)}catch{}const circuit=transportCircuits.get(origin)||{failures:0,openedAt:0};return {...circuit,origin,emergencyReadOnly:{...emergencyReadOnly},circuits:[...transportCircuits].map(([key,value])=>({origin:key,...value}))}}});
  window.TechnicsDataClient=Object.freeze({parseText,read,fetchJson,invalidate,diagnostics,incompleteMessage,version:"1.9.59"});
  document.documentElement.dataset.dataClient="1.9.59";
})();
