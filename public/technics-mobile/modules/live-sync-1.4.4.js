(function(global){
  "use strict";
  const controllers=new Set();
  const channel="BroadcastChannel" in global?new BroadcastChannel("technics-live-sync-v1747"):null;
  const wakeAll=()=>controllers.forEach(controller=>controller.wake());
  const stopAll=()=>[...controllers].forEach(controller=>controller.stop());
  global.addEventListener("online",wakeAll);
  global.addEventListener("focus",wakeAll);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)wakeAll()});
  document.addEventListener("technics:data-mutated",event=>{wakeAll();try{channel?.postMessage({type:"mutation",at:Date.now(),url:event.detail?.url||""})}catch{}});
  channel?.addEventListener("message",event=>{if(event.data?.type==="mutation")wakeAll()});

  function create(options={}){
    const interval=Math.max(500,Number(options.interval)||5000);
    const maxDelay=Math.max(interval,Number(options.maxDelay)||30000);
    let timer=0,inFlight=false,running=false,failures=0,lastStartedAt=0,lastCompletedAt=0;
    const active=()=>typeof options.active!=="function"||options.active();
    const schedule=delay=>{clearTimeout(timer);if(running)timer=setTimeout(run,Math.max(0,delay))};
    const run=async(force=false)=>{
      if(!running||inFlight)return;
      if(!active()||(document.hidden&&!force)){schedule(interval);return}
      inFlight=true;lastStartedAt=Date.now();
      try{await options.task();failures=0;lastCompletedAt=Date.now()}
      catch(error){failures++;options.onError?.(error,failures)}
      finally{inFlight=false;schedule(failures?Math.min(maxDelay,interval*Math.pow(2,Math.min(failures,3))):interval)}
    };
    const controller={
      start(){if(!running){running=true;controllers.add(controller)}if(options.immediate)run(true);else schedule(interval);return controller},
      stop(){running=false;clearTimeout(timer);controllers.delete(controller);return controller},
      wake(){if(running&&!inFlight){clearTimeout(timer);run(true)}return controller},
      stats(){return {running,inFlight,failures,lastStartedAt,lastCompletedAt}}
    };
    return controller;
  }
  global.TechnicsLiveSync={version:"1.7.47",create,wakeAll,stopAll,notify:detail=>document.dispatchEvent(new CustomEvent("technics:data-mutated",{detail}))};
  document.documentElement.dataset.liveSync="1.7.47";
  if(location.hostname==="127.0.0.1"&&new URLSearchParams(location.search).has("gateLiveSync")){
    let activeRuns=0,maxConcurrent=0,totalRuns=0;
    const probe=create({interval:500,maxDelay:2000,task:async()=>{activeRuns++;totalRuns++;maxConcurrent=Math.max(maxConcurrent,activeRuns);await new Promise(resolve=>setTimeout(resolve,850));activeRuns--}}).start();
    setTimeout(()=>{probe.stop();document.documentElement.dataset.liveSyncNoOverlap=String(maxConcurrent===1);document.documentElement.dataset.liveSyncRuns=String(totalRuns)},3200);
  }
})(window);
