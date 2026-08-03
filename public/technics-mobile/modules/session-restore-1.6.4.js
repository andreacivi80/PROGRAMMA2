(()=>{
  "use strict";
  const key="technics-layout-restore-v164",existingKey="technics-refresh-context-v1323";
  const save=()=>{const workspace=document.querySelector("main.shell")?.dataset.workspace||"inventory";sessionStorage.setItem(key,JSON.stringify({workspace,scrollY:Math.max(0,Math.round(scrollY)),at:Date.now()}))};
  let timer;addEventListener("scroll",()=>{clearTimeout(timer);timer=setTimeout(save,120)},{passive:true});addEventListener("pagehide",save);document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});
  const restore=()=>{const isReload=(performance.getEntriesByType("navigation")[0]?.type||"navigate")==="reload";if(!isReload){sessionStorage.removeItem(key);return}let state;try{state=JSON.parse(sessionStorage.getItem(key)||"null")}catch{};if(!state||Date.now()-Number(state.at)>600000)return;if(!sessionStorage.getItem(existingKey))document.querySelector(`.departmentnav [data-workspace="${CSS.escape(state.workspace||"inventory")}"]`)?.click();let attempts=0;const align=()=>{attempts++;scrollTo(0,Math.min(Number(state.scrollY)||0,Math.max(0,document.documentElement.scrollHeight-innerHeight)));if(attempts<12&&Math.abs(scrollY-Number(state.scrollY||0))>20)setTimeout(align,100)};requestAnimationFrame(align)};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",restore,{once:true});else restore();
  window.TechnicsSessionRestore=Object.freeze({save,version:"1.6.4"});
})();
