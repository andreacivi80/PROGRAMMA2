(()=>{
  "use strict";
  const ua=navigator.userAgent||"",touches=Number(navigator.maxTouchPoints||0);
  const ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&touches>1);
  const samsung=/SamsungBrowser/i.test(ua),android=/Android/i.test(ua);
  const state={ios,samsung,android,viewportHeight:innerHeight,viewportWidth:innerWidth,keyboardOpen:false,lastChangeAt:""};
  const applyViewport=()=>{
    const viewport=window.visualViewport,height=Math.round(viewport?.height||innerHeight),width=Math.round(viewport?.width||innerWidth),keyboardOpen=height<innerHeight-120;
    Object.assign(state,{viewportHeight:height,viewportWidth:width,keyboardOpen,lastChangeAt:new Date().toISOString()});
    document.documentElement.style.setProperty("--technics-viewport-height",`${height}px`);
    document.documentElement.style.setProperty("--technics-keyboard-offset",`${Math.max(0,innerHeight-height-(viewport?.offsetTop||0))}px`);
    document.documentElement.classList.toggle("technics-keyboard-open",keyboardOpen);
  };
  const prepareVideo=()=>{const video=document.getElementById("preview");if(!video)return;video.setAttribute("playsinline","");video.setAttribute("webkit-playsinline","");video.muted=true};
  const closeCamera=()=>{const camera=document.getElementById("camera");if(camera&&!camera.classList.contains("hidden"))document.getElementById("close")?.click()};
  const start=()=>{
    document.documentElement.classList.toggle("technics-ios",ios);document.documentElement.classList.toggle("technics-samsung",samsung);document.documentElement.classList.toggle("technics-android",android);
    document.documentElement.dataset.mobileCompat="1.7.41";prepareVideo();applyViewport();
    const style=document.createElement("style");style.textContent="@media(max-width:700px){.overlay,.choiceoverlay,.materialmismatch,.printoverlay,.closedialog,.systemdiagnostics{min-height:var(--technics-viewport-height,100dvh)}.technics-keyboard-open footer{visibility:hidden}.technics-keyboard-open input:focus{scroll-margin-block:22vh}}";document.head.appendChild(style);
    visualViewport?.addEventListener("resize",applyViewport,{passive:true});visualViewport?.addEventListener("scroll",applyViewport,{passive:true});addEventListener("resize",applyViewport,{passive:true});addEventListener("orientationchange",()=>setTimeout(()=>{applyViewport();dispatchEvent(new Event("resize"))},250),{passive:true});addEventListener("pagehide",closeCamera);
  };
  window.TechnicsMobileCompatibility=Object.freeze({diagnostics:()=>Object.freeze({...state}),version:"1.7.41"});
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();
