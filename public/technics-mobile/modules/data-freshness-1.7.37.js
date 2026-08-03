(()=>{
  "use strict";
  const state={dataTime:"",serverTime:"",source:"",latencyMs:0,cached:false,lastReceivedAt:"",level:"waiting"};
  let badge=null,timer=0;
  const parse=value=>{const n=Date.parse(String(value||""));return Number.isFinite(n)?n:0};
  const labelSource=value=>({server:"Server condiviso",mirror:"Copia di continuità",TechnicsBridge:"Gestionale Technics","scadenziario-ov.sql":"Scadenziario OV"}[value]||value||"Gestionale Technics");
  const ensure=()=>{
    if(badge?.isConnected)return badge;
    const top=document.querySelector("header.top");if(!top)return null;
    badge=document.createElement("button");badge.type="button";badge.id="dataFreshness";badge.className="datafreshness waiting";badge.innerHTML="<i></i><span>Dati in verifica</span>";
    badge.addEventListener("click",()=>document.getElementById("net")?.click());top.insertBefore(badge,document.getElementById("net")||null);return badge;
  };
  const paint=()=>{
    const target=ensure();if(!target)return;
    const stamp=parse(state.dataTime)||parse(state.serverTime),age=stamp?Math.max(0,Math.round((Date.now()-stamp)/1000)):Infinity;
    const continuity=/mirror|copia/i.test(String(state.source||""));state.level=continuity?"aging":age<=30?"fresh":age<=90?"aging":"stale";target.className=`datafreshness ${state.level}`;
    target.querySelector("span").textContent=continuity?"Dati di continuità":Number.isFinite(age)?`Dati ${age}s`:"Dati in verifica";
    const detail=`Fonte: ${labelSource(state.source)} · lettura: ${stamp?new Date(stamp).toLocaleString("it-IT"):"in verifica"} · risposta: ${state.latencyMs} ms${state.cached?" · cache breve verificata":""}`;
    target.title=detail;target.setAttribute("aria-label",detail);
  };
  document.addEventListener("technics:data-success",event=>{Object.assign(state,event.detail||{}, {lastReceivedAt:new Date().toISOString()});paint()});
  const start=()=>{ensure();paint();clearInterval(timer);timer=setInterval(paint,1000)};
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
  window.TechnicsDataFreshness=Object.freeze({diagnostics:()=>Object.freeze({...state}),version:"1.7.37"});
  document.documentElement.dataset.dataFreshness="1.7.37";
})();
