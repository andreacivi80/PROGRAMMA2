(()=>{
  "use strict";
  const incompleteMessage="Il collegamento dati ha risposto in modo incompleto. Riprova tra pochi secondi.";
  const state={requests:0,retries:0,recovered:0,failures:0,timeouts:0,offlineWaits:0,httpRetries:0,deduplicated:0,cached:0,discarded:0,integrityFailures:0,lastFailure:"",lastSuccessAt:"",lastLatencyMs:0,lastRequestId:"",lastServerTime:"",lastDataTime:"",lastSource:"",lastNodeId:"",lastNodeRole:"",lastLeaseEpoch:"",lastBridgeVersion:""};
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
  const validateMeta=(payload,expectedId,response)=>{
    if(!payload.meta){state.integrityFailures++;const error=new Error("Risposta priva della tracciabilità Technics.");error.incompleteResponse=true;throw error}
    const meta=payload.meta;
    if(!meta.requestId||!meta.serverTime||!meta.version||!meta.nodeId||!meta.nodeRole||!meta.leaseEpoch||meta.dataAuthority!=="Technics"||meta.readOnly!==true){state.integrityFailures++;const error=new Error("Risposta con tracciabilità Technics incompleta.");error.incompleteResponse=true;throw error}
    if(expectedId&&String(meta.requestId)!==String(expectedId)){
      state.discarded++;state.integrityFailures++;const error=new Error("Risposta dati temporaneamente non allineata: recupero automatico in corso.");error.incompleteResponse=true;error.transient=true;throw error;
    }
    const headerRequestId=response?.headers?.get?.("X-Technics-Request-Id"),headerNode=response?.headers?.get?.("X-Technics-Node"),headerRole=response?.headers?.get?.("X-Technics-Node-Role"),headerVersion=response?.headers?.get?.("X-Technics-Version"),headerEpoch=response?.headers?.get?.("X-Technics-Lease-Epoch"),headerTime=response?.headers?.get?.("X-Technics-Server-Time");
    if(!headerRequestId||!headerNode||!headerRole||!headerVersion||!headerEpoch||!headerTime||headerRequestId!==String(meta.requestId)||headerNode!==String(meta.nodeId)||headerRole!==String(meta.nodeRole)||headerVersion!==String(meta.version)||headerEpoch!==String(meta.leaseEpoch)||headerTime!==String(meta.serverTime)){state.integrityFailures++;document.dispatchEvent(new CustomEvent("technics:identity-mismatch",{detail:{code:"NODE-IDENTITY-MISMATCH",nodeId:String(meta.nodeId||"")}}));const error=new Error("NODE-IDENTITY-MISMATCH: risposta Technics non coerente.");error.incompleteResponse=true;throw error}
    const serverTime=Date.parse(meta.serverTime);
    if(!Number.isFinite(serverTime)||serverTime>Date.now()+300000)throw new Error("Risposta dati con data non valida.");
    return payload;
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
    const dataTime=payload?.readAt||payload?.result?.readAt||payload?.order?.readAt||payload?.meta?.serverTime||new Date().toISOString();
    const source=payload?.result?.source||payload?.store?.source||payload?.meta?.source||"TechnicsBridge";
    const previousNode=state.lastNodeId;state.lastServerTime=String(payload?.meta?.serverTime||"");state.lastDataTime=String(dataTime||"");state.lastSource=String(source||"");state.lastNodeId=String(payload?.meta?.nodeId||"");state.lastNodeRole=String(payload?.meta?.nodeRole||"");state.lastLeaseEpoch=String(payload?.meta?.leaseEpoch||"");state.lastBridgeVersion=String(payload?.meta?.version||"");if(previousNode&&previousNode!==state.lastNodeId)document.dispatchEvent(new CustomEvent("technics:node-switch",{detail:{code:"UNEXPECTED-NODE-SWITCH",from:previousNode,to:state.lastNodeId,at:new Date().toISOString()}}));
    document.dispatchEvent(new CustomEvent("technics:data-success",{detail:{url:String(url),dataTime:state.lastDataTime,serverTime:state.lastServerTime,source:state.lastSource,nodeId:state.lastNodeId,nodeRole:state.lastNodeRole,bridgeVersion:state.lastBridgeVersion,requestId:state.lastRequestId,latencyMs:Number(latencyMs||0),cached:Boolean(cached)}}));
  };
  const runFetch=async(url,options,settings,key,sequence)=>{
    const method=String(options.method||"GET").toUpperCase(),safe=method==="GET"||method==="HEAD"||settings.retryUnsafe===true,attempts=safe?Math.max(1,Number(settings.attempts||8)):1,timeoutMs=Math.max(3000,Number(settings.timeoutMs||15000));let lastError;
    for(let attempt=0;attempt<attempts;attempt++){
      if(attempt)await waitForNetwork();
      const id=requestId(),controller=new AbortController(),scope=String(settings.scope||document.querySelector("main.shell")?.dataset.workspace||"global"),urgent=/\/api\/(items\/lookup|barcodes\/resolve)/.test(String(url)),releaseSlot=await acquireSlot(urgent),timer=setTimeout(()=>controller.abort("timeout"),timeoutMs),started=performance.now();state.requests++;state.lastRequestId=id;activeControllers.set(controller,scope);
      try{
        const headers=new Headers(options.headers||{});headers.set("X-Technics-Request-Id",id);headers.set("X-Technics-Priority",urgent?"urgent":"normal");
        const response=await fetch(url,{...options,headers,signal:controller.signal,priority:urgent?"high":"auto"}),payload=validateShape(validateMeta(await read(response,settings.message),id,response),url);
        if(!response.ok&&transientStatus(response.status)){state.httpRetries++;const error=new Error(payload?.error||`Servizio temporaneamente non disponibile (${response.status}).`);error.status=response.status;error.transient=true;throw error}
        if(key&&latestSequence.get(key)!==sequence){state.discarded++;const error=new Error("Risposta superata da una richiesta più recente.");error.staleResponse=true;throw error}
        state.lastLatencyMs=Math.round(performance.now()-started);state.lastSuccessAt=new Date().toISOString();recordTiming(url,state.lastLatencyMs);announceSuccess(url,payload,state.lastLatencyMs,false);
        if(attempt){state.recovered++;document.dispatchEvent(new CustomEvent("technics:data-recovered",{detail:{url,attempt:attempt+1}}))}
        return {response,payload,attempt:attempt+1,requestId:id,latencyMs:state.lastLatencyMs};
      }catch(error){
        if(controller.signal.aborted&&controller.signal.reason==="workspace-change"){state.discarded++;error.staleResponse=true;throw error}
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
    const promise=runFetch(url,options,settings,key,sequence).then(result=>{if(key&&cacheMs)responseCache.set(key,{savedAt:Date.now(),result:{...result,payload:clone(result.payload)}});if(method!=="GET")document.dispatchEvent(new CustomEvent("technics:data-mutated",{detail:{url:String(url),method}}));return result}).finally(()=>{if(key&&inFlight.get(key)===promise)inFlight.delete(key)});
    if(key)inFlight.set(key,promise);return promise;
  };
  const invalidate=()=>responseCache.clear();
  const cancelObsolete=workspace=>{for(const [controller,scope] of activeControllers)if(scope!=="global"&&scope!==workspace)controller.abort("workspace-change")};
  window.addEventListener("technics-workspace-change",event=>cancelObsolete(String(event.detail?.workspace||"")));
  const diagnostics=()=>Object.freeze({...state,inFlight:inFlight.size,activeControllers:activeControllers.size,normalActive,normalQueued:normalQueue.length,cacheEntries:responseCache.size,routes:[...routeTimings].map(([route,values])=>({route,samples:values.length,lastMs:values.at(-1)||0,averageMs:values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0,maxMs:values.length?Math.max(...values):0}))});
  window.TechnicsDataClient=Object.freeze({parseText,read,fetchJson,invalidate,diagnostics,incompleteMessage,version:"1.8.98"});
  document.documentElement.dataset.dataClient="1.9.14";
})();
