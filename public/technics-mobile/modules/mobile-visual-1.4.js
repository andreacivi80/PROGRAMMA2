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
  document.documentElement.dataset.uxModule="1.4";
})();
