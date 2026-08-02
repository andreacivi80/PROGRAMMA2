(()=>{
  "use strict";
  const incompleteMessage="Il collegamento dati ha risposto in modo incompleto. Riprova tra pochi secondi.";
  const state={requests:0,retries:0,recovered:0,failures:0,timeouts:0,deduplicated:0,cached:0,discarded:0,lastFailure:"",lastSuccessAt:"",lastLatencyMs:0,lastRequestId:""};
  const inFlight=new Map(),latestSequence=new Map(),responseCache=new Map();
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const requestId=()=>globalThis.crypto?.randomUUID?.()||`tm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clone=value=>globalThis.structuredClone?structuredClone(value):JSON.parse(JSON.stringify(value));
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
  const validateMeta=(payload,expectedId)=>{
    if(!payload.meta)return payload;
    const meta=payload.meta;
    if(!meta.requestId||!meta.serverTime||!meta.version)throw new Error(incompleteMessage);
    if(expectedId&&String(meta.requestId)!==String(expectedId)){
      state.discarded++;const error=new Error("Risposta dati non coerente: identificativo richiesta differente.");error.staleResponse=true;throw error;
    }
    const serverTime=Date.parse(meta.serverTime);
    if(!Number.isFinite(serverTime)||serverTime>Date.now()+300000)throw new Error("Risposta dati con data non valida.");
    return payload;
  };
  const runFetch=async(url,options,settings,key,sequence)=>{
    const attempts=Math.max(1,Number(settings.attempts||3)),timeoutMs=Math.max(3000,Number(settings.timeoutMs||15000));let lastError;
    for(let attempt=0;attempt<attempts;attempt++){
      const id=requestId(),controller=new AbortController(),timer=setTimeout(()=>controller.abort("timeout"),timeoutMs),started=performance.now();state.requests++;state.lastRequestId=id;
      try{
        const headers=new Headers(options.headers||{});headers.set("X-Technics-Request-Id",id);
        const response=await fetch(url,{...options,headers,signal:controller.signal}),payload=validateMeta(await read(response,settings.message),id);
        if(key&&latestSequence.get(key)!==sequence){state.discarded++;const error=new Error("Risposta superata da una richiesta più recente.");error.staleResponse=true;throw error}
        state.lastLatencyMs=Math.round(performance.now()-started);state.lastSuccessAt=new Date().toISOString();
        if(attempt){state.recovered++;document.dispatchEvent(new CustomEvent("technics:data-recovered",{detail:{url,attempt:attempt+1}}))}
        return {response,payload,attempt:attempt+1,requestId:id,latencyMs:state.lastLatencyMs};
      }catch(error){
        lastError=error;state.lastFailure=String(error?.message||error);if(error?.name==="AbortError"||error==="timeout")state.timeouts++;
        if(error?.staleResponse)throw error;
        if(attempt<attempts-1){state.retries++;await pause(300*Math.pow(2,attempt));continue}
      }finally{clearTimeout(timer)}
    }
    state.failures++;document.dispatchEvent(new CustomEvent("technics:data-failure",{detail:{url,message:state.lastFailure}}));throw lastError||new Error("Collegamento dati non disponibile.");
  };
  const fetchJson=(url,options={},settings={})=>{
    const method=String(options.method||"GET").toUpperCase(),dedupe=settings.dedupe!==false&&method==="GET",key=dedupe?`${method}:${url}`:"",cacheMs=method==="GET"?Math.max(0,Number(settings.cacheMs||0)):0;
    if(method!=="GET")responseCache.clear();
    if(key&&cacheMs){const cached=responseCache.get(key);if(cached&&Date.now()-cached.savedAt<=cacheMs){state.cached++;return Promise.resolve({...cached.result,payload:clone(cached.result.payload),cached:true})}if(cached)responseCache.delete(key)}
    if(key&&inFlight.has(key)){state.deduplicated++;return inFlight.get(key)}
    const sequence=(latestSequence.get(key)||0)+1;if(key)latestSequence.set(key,sequence);
    const promise=runFetch(url,options,settings,key,sequence).then(result=>{if(key&&cacheMs)responseCache.set(key,{savedAt:Date.now(),result:{...result,payload:clone(result.payload)}});return result}).finally(()=>{if(key&&inFlight.get(key)===promise)inFlight.delete(key)});
    if(key)inFlight.set(key,promise);return promise;
  };
  const invalidate=()=>responseCache.clear();
  const diagnostics=()=>Object.freeze({...state,inFlight:inFlight.size,cacheEntries:responseCache.size});
  window.TechnicsDataClient=Object.freeze({parseText,read,fetchJson,invalidate,diagnostics,incompleteMessage,version:"1.5.4"});
  document.documentElement.dataset.dataClient="1.5.1";
})();
