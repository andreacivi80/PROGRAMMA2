(()=>{
  let queued=false;
  const updateScrollState=()=>{queued=false;document.body.classList.toggle("uxscrolled",window.scrollY>18)};
  addEventListener("scroll",()=>{if(!queued){queued=true;requestAnimationFrame(updateScrollState)}},{passive:true});
  updateScrollState();
  document.addEventListener("pointerdown",event=>{const button=event.target.closest("button");if(!button||button.disabled)return;button.classList.add("uipressed");setTimeout(()=>button.classList.remove("uipressed"),180)},{passive:true});
  const message=document.getElementById("message"),title=document.getElementById("msgtitle");
  const updateLoading=()=>message?.classList.toggle("uxloading",Boolean(title?.textContent.trim().toLocaleLowerCase("it").startsWith("sto "))&&!message.classList.contains("hidden"));
  if(message&&title)new MutationObserver(updateLoading).observe(message,{attributes:true,childList:true,subtree:true});
  updateLoading();
  message?.setAttribute("aria-live","polite");
  document.getElementById("packingMsg")?.setAttribute("aria-live","polite");
  document.getElementById("planningResult")?.setAttribute("aria-live","polite");
  const compact=document.createElement("style");compact.id="technics-mobile-density-v1749";compact.textContent="@media(max-width:720px){.shell{padding-bottom:max(68px,env(safe-area-inset-bottom))}.stock strong,.stock b,.pickrow strong,.packrow strong{overflow-wrap:normal;word-break:normal}.stock .location,.stock [class*=location]{white-space:nowrap;font-size:clamp(10px,2.8vw,14px)}button,input,select{touch-action:manipulation}.modules{scroll-snap-type:x proximity}.modules button{scroll-snap-align:start}}";document.head.appendChild(compact);
  document.documentElement.dataset.uxModule="1.7.49";
})();
