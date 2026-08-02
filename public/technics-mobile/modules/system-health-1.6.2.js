(()=>{
  "use strict";
  const testBridge=location.hostname==="127.0.0.1"?new URLSearchParams(location.search).get("testBridge"):"";
  const bridge=/^dev\d+$/.test(testBridge||"")?`http://127.0.0.1:${testBridge.slice(3)}`:"https://student-tarot-occultist.ngrok-free.dev";
  const state={ok:false,database:null,failures:0,lastCheck:"",lastSuccessAt:"",latencyMs:0,version:"",message:"Avvio controllo"};
  let cycle=0;
  const paint=()=>{
    const node=document.getElementById("net");if(!node)return;
    const healthy=state.ok&&state.database===true;
    node.classList.toggle("off",!healthy);
    node.innerHTML=healthy?`<i></i>Sola lettura · Online`:`<i></i>${state.failures<2?"Verifica dati…":state.database===false?"Gestionale non raggiungibile":"Collegamento in ripristino"}`;
    node.title=`Ponte ${state.version||"—"} · controllo ${state.lastCheck||"in corso"}`;
  };
  const check=async()=>{
    cycle++;const deep=cycle===1||cycle%3===0,started=performance.now(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch(`${bridge}/health?deep=${deep?1:0}&fresh=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-store","ngrok-skip-browser-warning":"1"},signal:controller.signal});
      const payload=await response.json();
      if(!response.ok||!payload?.ok||!payload?.version)throw new Error("Controllo ponte non valido");
      state.ok=true;state.failures=0;state.version=String(payload.version);state.database=deep?Boolean(payload.database?.ok):state.database;state.lastSuccessAt=new Date().toISOString();state.message="Sistema operativo";
    }catch(error){state.ok=false;state.failures++;state.message=String(error?.message||error)}
    finally{clearTimeout(timer);state.latencyMs=Math.round(performance.now()-started);state.lastCheck=new Date().toLocaleTimeString("it-IT");paint();document.dispatchEvent(new CustomEvent("technics:health",{detail:{...state}}))}
  };
  const start=()=>{
    paint();
    if(window.TechnicsLiveSync)TechnicsLiveSync.create({interval:20000,maxDelay:60000,immediate:true,active:()=>navigator.onLine,task:check}).start();
    else{check();setInterval(check,20000)}
  };
  window.TechnicsSystemHealth=Object.freeze({check,diagnostics:()=>Object.freeze({...state}),version:"1.6.2"});
  document.documentElement.dataset.systemHealth="1.6.2";
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
