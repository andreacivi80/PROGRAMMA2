(()=>{
  "use strict";
  const origin="https://stephanie-witness-theatre-near.trycloudflare.com",samples=[];let warmPromise=null,lastWarmAt=0;
  for(const rel of ["preconnect","dns-prefetch"]){const link=document.createElement("link");link.rel=rel;link.href=origin;if(rel==="preconnect")link.crossOrigin="anonymous";document.head.append(link)}
  if("PerformanceObserver" in window){try{new PerformanceObserver(list=>{for(const entry of list.getEntries()){if(!entry.name.startsWith(origin))continue;samples.push({path:new URL(entry.name).pathname,duration:Math.round(entry.duration),at:Date.now()});if(samples.length>60)samples.shift()}}).observe({type:"resource",buffered:true})}catch{}}
  const warm=()=>{const recent=Date.parse(window.TechnicsDataClient?.diagnostics?.().lastSuccessAt||0);if(!navigator.onLine||document.hidden||Date.now()-recent<10000)return Promise.resolve(false);if(warmPromise)return warmPromise;if(Date.now()-lastWarmAt<15000)return Promise.resolve(false);lastWarmAt=Date.now();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3500);warmPromise=fetch(`${origin}/health?deep=0&warm=${Date.now()}`,{cache:"no-store",headers:{"ngrok-skip-browser-warning":"1"},signal:controller.signal,priority:"low"}).then(()=>true).catch(()=>false).finally(()=>{clearTimeout(timer);warmPromise=null});return warmPromise};
  if("requestIdleCallback" in window)requestIdleCallback(warm,{timeout:3000});else setTimeout(warm,1200);
  window.TechnicsPerformance=Object.freeze({samples:()=>samples.slice(),routes:()=>window.TechnicsDataClient?.diagnostics?.().routes||[],warm,version:"1.7.43"});
  document.documentElement.dataset.performanceAdapter="1.7.43";
})();
