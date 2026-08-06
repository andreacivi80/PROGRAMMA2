(()=>{
  "use strict";
  const state={dataTime:"",serverTime:"",source:"",latencyMs:0,cached:false,lastReceivedAt:"",healthVerifiedAt:0,level:"waiting",nodeId:"",nodeRole:""};
  let badge=null,timer=0;
  const ensureStyle=()=>{if(document.getElementById("technics-data-freshness-layout"))return;const style=document.createElement("style");style.id="technics-data-freshness-layout";style.textContent="#dataFreshness{box-sizing:border-box;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px;width:auto;min-width:132px;max-width:160px;height:30px;min-height:30px;max-height:30px;padding:0 8px!important;line-height:1!important;white-space:nowrap;vertical-align:middle}#dataFreshness i{display:block;flex:0 0 auto;margin:0!important}#dataFreshness span{display:block;min-width:0;margin:0!important;padding:0!important;overflow:hidden;text-overflow:ellipsis;line-height:1!important;white-space:nowrap;text-align:center;transform:none!important}@media(max-width:370px){#dataFreshness{min-width:118px;max-width:142px;padding:0 6px!important}}";document.head.appendChild(style)};
  const parse=value=>{const n=Date.parse(String(value||""));return Number.isFinite(n)?n:0};
  const labelSource=value=>({server:"Server condiviso",mirror:"Copia di continuità",TechnicsBridge:"Gestionale Technics","scadenziario-ov.sql":"Scadenziario OV"}[value]||value||"Gestionale Technics");
  const ensure=()=>{
    ensureStyle();if(badge?.isConnected)return badge;
    const top=document.querySelector("header.top");if(!top)return null;
    badge=document.createElement("button");badge.type="button";badge.id="dataFreshness";badge.className="datafreshness waiting";badge.innerHTML="<i></i><span>Dati in verifica</span>";
    badge.addEventListener("click",()=>document.getElementById("net")?.click());top.insertBefore(badge,document.getElementById("net")||null);return badge;
  };
  const paint=()=>{
    const target=ensure();if(!target)return;
    const stamp=parse(state.dataTime)||parse(state.serverTime),age=stamp?Math.max(0,Math.round((Date.now()-stamp)/1000)):Infinity;
    const verified=Number(state.healthVerifiedAt||0)>0&&Date.now()-Number(state.healthVerifiedAt)<60000;
    const continuity=/mirror|copia/i.test(String(state.source||""));
    state.level=continuity?"aging":verified?"fresh":!stamp?"waiting":age<=90?"aging":"stale";
    const pc=/utente73/i.test(state.nodeId)?"PC73":/utente38/i.test(state.nodeId)?"PC38":"",backup=pc==="PC38"&&verified;target.className=`datafreshness ${backup?"backup":state.level}`;
    target.querySelector("span").textContent=continuity?(pc?`${pc} · CONTINUITÀ`:"Dati di continuità"):verified?(pc?`${pc} · DATI VERIFICATI`:"Dati verificati"):Number.isFinite(age)?`${pc?pc+" · ":""}Dati ${age}s`:(pc?`${pc} · CONTROLLO`:"Dati in verifica");
    const detail=`Fonte: ${labelSource(state.source)} · lettura: ${stamp?new Date(stamp).toLocaleString("it-IT"):"in verifica"} · risposta: ${state.latencyMs} ms${state.cached?" · cache breve verificata":""}`;
    target.title=detail;target.setAttribute("aria-label",detail);
  };
  document.addEventListener("technics:data-success",event=>{Object.assign(state,event.detail||{}, {lastReceivedAt:new Date().toISOString()});paint()});
  document.addEventListener("technics:health-ready",event=>{state.healthVerifiedAt=Date.now();if(event.detail?.nodeId)state.nodeId=String(event.detail.nodeId);paint()});
  const start=()=>{ensure();paint();clearInterval(timer);timer=setInterval(paint,1000)};
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
  window.TechnicsDataFreshness=Object.freeze({diagnostics:()=>Object.freeze({...state}),version:"1.8.55"});
  document.documentElement.dataset.dataFreshness="1.8.55";
})();
