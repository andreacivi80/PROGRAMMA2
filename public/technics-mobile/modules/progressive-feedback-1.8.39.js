(()=>{
  "use strict";
  const style=document.createElement("style");
  style.textContent=`#technicsProgress{position:fixed;z-index:16000;top:0;left:0;width:100%;height:3px;pointer-events:none;opacity:0;transition:opacity .16s;background:linear-gradient(90deg,#17624d 0 36%,#70bba2 55%,transparent 80%);background-size:220% 100%;animation:technicsProgress 1.05s linear infinite}html[data-technics-busy="1"] #technicsProgress{opacity:1}@keyframes technicsProgress{to{background-position:-220% 0}}@media(prefers-reduced-motion:reduce){#technicsProgress{animation:none}}`;
  document.head.append(style);
  const bar=document.createElement("div");bar.id="technicsProgress";bar.setAttribute("role","progressbar");bar.setAttribute("aria-label","Lettura dati Technics in corso");document.body.prepend(bar);
  let active=0,hideTimer=0;
  const begin=()=>{clearTimeout(hideTimer);active++;document.documentElement.dataset.technicsBusy="1";document.querySelector("main.shell")?.setAttribute("aria-busy","true")};
  const end=()=>{active=Math.max(0,active-1);if(active)return;hideTimer=setTimeout(()=>{document.documentElement.dataset.technicsBusy="0";document.querySelector("main.shell")?.setAttribute("aria-busy","false")},140)};
  const original=window.TechnicsDataClient;
  if(original?.fetchJson){const wrapped=Object.freeze({...original,fetchJson:(...args)=>{begin();return original.fetchJson(...args).finally(end)},version:"1.8.39"});window.TechnicsDataClient=wrapped}
  document.addEventListener("technics:data-mutated",()=>{clearTimeout(hideTimer);document.documentElement.dataset.lastMutationAt=new Date().toISOString()});
  document.documentElement.dataset.progressiveFeedback="1.8.39";
})();
