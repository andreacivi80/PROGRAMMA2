(()=>{
  "use strict";
  const testBridge=location.hostname==="127.0.0.1"?new URLSearchParams(location.search).get("testBridge"):"";
  const bridge=/^dev\d+$/.test(testBridge||"")?`http://127.0.0.1:${testBridge.slice(3)}`:"https://student-tarot-occultist.ngrok-free.dev";
  const state={ok:false,database:null,databaseLatencyMs:null,failures:0,lastCheck:"",lastSuccessAt:"",latencyMs:0,version:"",nodeId:"",nodeRole:"",nodes:[],message:"Avvio controllo",errorCode:"CHECK-IN-CORSO"};
  let cycle=0;
  const classify=error=>{
    if(!navigator.onLine)return "BROWSER-OFFLINE";
    if(error?.name==="AbortError")return "BRIDGE-TIMEOUT";
    if(/json/i.test(String(error?.message||"")))return "JSON-INVALIDO";
    return "BRIDGE-OFFLINE";
  };
  const diagnosticText=()=>[`Technics Mobile ${state.version||"—"}`,`Codice: ${state.errorCode}`,`Ponte HTTPS: ${state.ok?"online":"non disponibile"}`,`Database: ${state.database===true?"online":state.database===false?"non disponibile":"in verifica"}`,`Latenza ponte: ${state.latencyMs} ms`,`Latenza database: ${state.databaseLatencyMs??"—"} ms`,`Ultimo controllo: ${state.lastCheck||"—"}`,`Ultimo successo: ${state.lastSuccessAt?new Date(state.lastSuccessAt).toLocaleString("it-IT"):"—"}`,`Nodo attivo: ${state.nodeId|| (state.ok?"rilevato dal link pubblico":"non rilevato")}`,`Ruolo nodo: ${state.nodeRole||"—"}`,...state.nodes.map(x=>`Nodo ${x.nodeId}: ${x.online?"online":"non disponibile"} · ${x.role} · v${x.version} · ${x.ageSeconds}s`)].join("\n");
  const paintPanel=()=>{const body=document.getElementById("systemDiagnosticsBody");if(!body)return;body.innerHTML=`<div><small>CODICE STATO</small><strong class="diagnosticcode">${state.errorCode}</strong></div><div><small>PONTE HTTPS</small><strong>${state.ok?"Online":"Non disponibile"}</strong></div><div><small>GESTIONALE</small><strong>${state.database===true?"Online":state.database===false?"Non disponibile":"In verifica"}</strong></div><div><small>VERSIONE</small><strong>${state.version||"—"}</strong></div><div><small>ULTIMO CONTROLLO</small><strong>${state.lastCheck||"—"}</strong></div><div><small>LATENZA</small><strong>${state.latencyMs} ms${state.databaseLatencyMs!=null?` · DB ${state.databaseLatencyMs} ms`:""}</strong></div><p><b>Nodo attivo:</b> ${state.nodeId||(state.ok?"rilevato dal link pubblico":"non rilevato")}<br><b>Ruolo:</b> ${state.nodeRole||"—"}</p>${state.nodes.map(x=>`<p><b>${x.nodeId}</b><br>${x.online?"Online":"Non disponibile"} · ${x.role} · v${x.version}<br>Ultimo contatto ${x.ageSeconds}s fa</p>`).join("")}`};
  const loadNodes=async()=>{try{const response=await fetch(`${bridge}/health/nodes?fresh=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-store","ngrok-skip-browser-warning":"1"}});const payload=await response.json();if(response.ok&&payload?.ok){state.nodes=payload.nodes||[];paintPanel()}}catch{}};
  const ensurePanel=()=>{
    if(document.getElementById("systemDiagnostics"))return;
    const panel=document.createElement("div");panel.id="systemDiagnostics";panel.className="systemdiagnostics hidden";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-labelledby","systemDiagnosticsTitle");
    panel.innerHTML=`<div class="systemdiagnosticscard"><header><div><small>STATO TECHNICS</small><strong id="systemDiagnosticsTitle">Diagnostica collegamento</strong></div><button id="closeSystemDiagnostics" type="button" aria-label="Chiudi">×</button></header><div id="systemDiagnosticsBody" class="systemdiagnosticsbody"></div><div class="systemdiagnosticsactions"><button id="retrySystemDiagnostics" type="button">↻ Verifica ora</button><button id="copySystemDiagnostics" type="button">Copia diagnostica</button></div><p id="systemDiagnosticsCopy" class="systemdiagnosticscopy"></p></div>`;
    document.body.appendChild(panel);
    panel.addEventListener("click",event=>{if(event.target===panel||event.target.closest("#closeSystemDiagnostics"))panel.classList.add("hidden")});
    panel.querySelector("#retrySystemDiagnostics").addEventListener("click",()=>{check();loadNodes()});
    panel.querySelector("#copySystemDiagnostics").addEventListener("click",async()=>{const value=diagnosticText();try{await navigator.clipboard.writeText(value);panel.querySelector("#systemDiagnosticsCopy").textContent="Diagnostica copiata."}catch{panel.querySelector("#systemDiagnosticsCopy").textContent=value}});
  };
  const paint=()=>{
    const node=document.getElementById("net");if(!node)return;
    const healthy=state.ok&&state.database===true;
    node.classList.toggle("off",!healthy);
    node.innerHTML=healthy?`<i></i>Sola lettura · Online`:`<i></i>${state.failures<2?"Verifica dati…":state.database===false?"Gestionale non raggiungibile":"Collegamento in ripristino"}`;
    node.title=`Ponte ${state.version||"—"} · controllo ${state.lastCheck||"in corso"}`;
    node.setAttribute("role","button");node.setAttribute("tabindex","0");node.setAttribute("aria-label","Apri diagnostica collegamento Technics");paintPanel();
  };
  const check=async()=>{
    cycle++;const deep=cycle===1||cycle%3===0,started=performance.now(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch(`${bridge}/health?deep=${deep?1:0}&fresh=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-store","ngrok-skip-browser-warning":"1"},signal:controller.signal});
      const payload=await response.json();
      if(!response.ok||!payload?.ok||!payload?.version)throw new Error("Controllo ponte non valido");
      state.ok=true;state.failures=0;state.version=String(payload.version);state.nodeId=String(payload.node?.nodeId||"");state.nodeRole=String(payload.node?.role||"");state.database=deep?Boolean(payload.database?.ok):state.database;state.databaseLatencyMs=deep&&payload.database?.latencyMs!=null?Number(payload.database.latencyMs):state.databaseLatencyMs;state.lastSuccessAt=new Date().toISOString();state.message="Sistema operativo";state.errorCode=state.database===false?"DB-OFFLINE":"OK";
    }catch(error){state.ok=false;state.failures++;state.message=String(error?.message||error);state.errorCode=classify(error)}
    finally{clearTimeout(timer);state.latencyMs=Math.round(performance.now()-started);state.lastCheck=new Date().toLocaleTimeString("it-IT");paint();document.dispatchEvent(new CustomEvent("technics:health",{detail:{...state}}))}
  };
  const start=()=>{
    ensurePanel();paint();const node=document.getElementById("net");node?.addEventListener("click",()=>{document.getElementById("systemDiagnostics")?.classList.remove("hidden");loadNodes()});node?.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();node.click()}});
    if(window.TechnicsLiveSync)TechnicsLiveSync.create({interval:20000,maxDelay:60000,immediate:true,active:()=>navigator.onLine,task:check}).start();
    else{check();setInterval(check,20000)}
  };
  window.TechnicsSystemHealth=Object.freeze({check,diagnostics:()=>Object.freeze({...state}),version:"1.7.34"});
  document.documentElement.dataset.systemHealth="1.7.34";
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
