// Executable definitions only. ROOT owns the real, already started headless Chrome and its isolated GET/fixture boundary.
import assert from 'node:assert/strict';
export const MOBILE_WIDTHS=Object.freeze([320,360,375,390,412,430,432,480,600,768]);
export const MOBILE_SCENARIOS=Object.freeze(['open','initial-load','vertical-touch','horizontal-widget','rotation','module-switch','modal-cycle','inventory','stock','packing-list','back','refresh','session-restore','version-update']);

export async function installMobileScrollObserversROOT(page){
 await page.addInitScript(()=>{
  if(window.__technicsScrollProbeR1)return;
  const data={events:[],errors:[],startedAt:performance.now()};
  Object.defineProperty(window,'__technicsScrollProbeR1',{value:data,configurable:true});
  const target=e=>({tag:e.target?.tagName||null,id:e.target?.id||null,classes:String(e.target?.className||'').slice(0,160)});
  for(const type of ['touchstart','touchmove','touchend','touchcancel'])window.addEventListener(type,e=>{
   const entry={type,cancelable:e.cancelable,target:target(e),at:performance.now(),defaultPrevented:false};
   data.events.push(entry);if(data.events.length>300)data.events.shift();
   queueMicrotask(()=>{entry.defaultPrevented=e.defaultPrevented;});
  },{passive:true,capture:true});
  window.addEventListener('error',e=>data.errors.push({kind:'error',message:String(e.message).slice(0,400)}));
  window.addEventListener('unhandledrejection',e=>data.errors.push({kind:'unhandledrejection',message:String(e.reason?.message||e.reason).slice(0,400)}));
 });
}

export async function captureMobileScrollDiagnosticsROOT(page,{x=null,y=null,scrollSelector=null}={}){
 return page.evaluate(({x,y,scrollSelector})=>{
  const point={x:x??innerWidth*.5,y:y??innerHeight*.7};
  const names=['overflow','overflow-x','overflow-y','height','min-height','max-height','touch-action','overscroll-behavior','position','pointer-events','display','visibility','z-index'];
  const identity=e=>e?{tag:e.tagName,id:e.id,classes:String(e.className||'').slice(0,160)}:null;
  const describe=e=>{if(!e)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();return{identity:identity(e),scrollTop:e.scrollTop,scrollLeft:e.scrollLeft,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,rect:{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,bottom:r.bottom,left:r.left,right:r.right},computed:Object.fromEntries(names.map(k=>[k,s.getPropertyValue(k)])),inline:Object.fromEntries(names.map(k=>[k,{value:e.style.getPropertyValue(k),priority:e.style.getPropertyPriority(k)}]))};};
  const hit=document.elementFromPoint(point.x,point.y),ancestors=[];for(let e=hit;e&&ancestors.length<16;e=e.parentElement)ancestors.push(describe(e));
  const nodes=Object.fromEntries(['html','body','.shell','.rawmaterialworkspace','.rawmaterialrows','#result'].map(k=>[k,describe(document.querySelector(k))]));
  const pseudo=(e,name)=>{if(!e)return null;const s=getComputedStyle(e,name);return Object.fromEntries(['content','display','position','inset','width','height','z-index','pointer-events','visibility','opacity'].map(k=>[k,s.getPropertyValue(k)]));};
  const bootLayers={htmlClass:document.documentElement?.className||'',bodyClass:document.body?.className||'',formulaDetailOpen:document.body?.classList.contains('formula-detail-open')||false,resumeProduction:document.documentElement?.classList.contains('resume-production')||false,htmlBefore:pseudo(document.documentElement,'::before'),htmlAfter:pseudo(document.documentElement,'::after'),bodyBefore:pseudo(document.body,'::before'),bodyAfter:pseudo(document.body,'::after')};
  const overlays=[...document.querySelectorAll('[role="dialog"], [aria-modal="true"], .overlay, .choiceoverlay, .pickmovementoverlay, .planningprintfifopopup')].map(describe);
  const probe=window.__technicsScrollProbeR1;
  return{at:new Date().toISOString(),userAgent:navigator.userAgent,maxTouchPoints:navigator.maxTouchPoints,devicePixelRatio,innerWidth,innerHeight,scrollX,scrollY,readyState:document.readyState,version:document.querySelector('meta[name="technics-build-version"]')?.content||null,visualViewport:visualViewport?{width:visualViewport.width,height:visualViewport.height,offsetTop:visualViewport.offsetTop,offsetLeft:visualViewport.offsetLeft,scale:visualViewport.scale}:null,scrollingElement:describe(document.scrollingElement),nodes,bootLayers,point,hit:identity(hit),hitStack:document.elementsFromPoint(point.x,point.y).slice(0,16).map(identity),ancestors,widget:scrollSelector?describe(document.querySelector(scrollSelector)):null,overlays,events:probe?.events.slice()||[],errors:probe?.errors.slice()||[],observerInstalled:!!probe};
 },{x,y,scrollSelector});
}

const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
export async function captureColdLoadMilestonesROOT(page,url){
 // ROOT installs observers and the read-only boundary before this call. No click, storage clear or forced scroll.
 await page.goto(url,{waitUntil:'commit'});const committed=await captureMobileScrollDiagnosticsROOT(page);
 await page.waitForLoadState('domcontentloaded');const domContentLoaded=await captureMobileScrollDiagnosticsROOT(page);
 await page.waitForLoadState('load');await frames(page);const loaded=await captureMobileScrollDiagnosticsROOT(page);
 return{state:'ACTUAL_COLD_LOAD_DIAGNOSTICS_NOT_CAUSE_OR_RELEASE_QUALIFICATION',beforeAnyOperatorInteraction:true,committed,domContentLoaded,loaded};
}
export async function probeActualTouchScrollROOT({page,cdp,axis='y',expectation='root-scroll',scrollSelector=null,point=null,distance=180,minDelta=12}){
 assert(['x','y'].includes(axis));assert(['root-scroll','widget-scroll','root-locked'].includes(expectation));
 assert(distance>=60&&distance<=400&&minDelta>=4);assert.equal(typeof cdp.send,'function');
 const initial=await captureMobileScrollDiagnosticsROOT(page,{...(point||{}),scrollSelector});
 assert(initial.observerInstalled,'INSTALL_OBSERVER_BEFORE_NAVIGATION');assert(initial.maxTouchPoints>0,'REAL_TOUCH_EMULATION_REQUIRED');
 let x=point?.x??initial.innerWidth*.5,y=point?.y??initial.innerHeight*.75;
 if(scrollSelector&&!point){const r=initial.widget?.rect;assert(r,'SCROLL_WIDGET_MISSING');const left=Math.max(1,r.left),right=Math.min(initial.innerWidth-1,r.right),top=Math.max(1,r.top),bottom=Math.min(initial.innerHeight-1,r.bottom);assert(right-left>30&&bottom-top>60,'WIDGET_NOT_IN_VIEWPORT');x=(left+right)/2;y=top+(bottom-top)*.8;}
 const actualDistance=Math.min(distance,axis==='y'?y-24:x-12);assert(actualDistance>=40,'NO_USABLE_TOUCH_PATH');
 const before=await captureMobileScrollDiagnosticsROOT(page,{x,y,scrollSelector});
 const owner=expectation==='widget-scroll'?before.widget:before.scrollingElement;assert(owner,'SCROLL_OWNER_REQUIRED');
 const remaining=axis==='y'?owner.scrollHeight-owner.clientHeight-owner.scrollTop:owner.scrollWidth-owner.clientWidth-owner.scrollLeft;
 if(expectation!=='root-locked')assert(remaining>=minDelta*2,'NO_OVERFLOW_OR_ALREADY_AT_END_NOT_A_TOUCH_PASS');
 let began=false;
 try{
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1,radiusX:3,radiusY:3,force:1}]});began=true;
  for(let step=1;step<=12;step++){
   const delta=actualDistance*step/12;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-(axis==='x'?delta:0),y:y-(axis==='y'?delta:0),id:1,radiusX:3,radiusY:3,force:1}]});
   await frames(page);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});began=false;
 }finally{if(began)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});}
 await frames(page);const after=await captureMobileScrollDiagnosticsROOT(page,{x,y,scrollSelector});
 const key=axis==='y'?'scrollTop':'scrollLeft',rootDelta=after.scrollingElement[key]-before.scrollingElement[key],widgetDelta=before.widget&&after.widget?after.widget[key]-before.widget[key]:null;
 try{
 if(expectation==='root-scroll')assert(rootDelta>=minDelta,'TOUCH_DID_NOT_MOVE_DOCUMENT_ROOT');
 if(expectation==='widget-scroll'){assert(widgetDelta>=minDelta,'TOUCH_DID_NOT_MOVE_EXPECTED_WIDGET');assert(Math.abs(rootDelta)<=2,'WIDGET_GESTURE_UNEXPECTEDLY_MOVED_ROOT');}
 if(expectation==='root-locked')assert(Math.abs(rootDelta)<=2,'MODAL_BACKGROUND_ROOT_NOT_LOCKED');
 assert.equal(after.errors.length,before.errors.length,'NEW_SCRIPT_ERROR_DURING_GESTURE');
 }catch(error){error.scrollDiagnostics={axis,expectation,gesture:{source:'Input.dispatchTouchEvent',steps:12,x,y,distance:actualDistance,programmaticScrollUsed:false},rootDelta,widgetDelta,before,after};throw error;}
 return{status:'PASS',evidenceKind:'ACTUAL_HEADLESS_CHROME_CDP_TOUCH_NOT_PHYSICAL_ANDROID',axis,expectation,gesture:{source:'Input.dispatchTouchEvent',steps:12,x,y,distance:actualDistance,programmaticScrollUsed:false},rootDelta,widgetDelta,before,after,physicalPrints:0,erpWrites:0,archiveWrites:0,realEmails:0};
}

export async function assertExactInlineOverflowRestoredROOT(page,before){
 const after=await captureMobileScrollDiagnosticsROOT(page);for(const selector of ['html','body'])for(const key of ['overflow','overflow-x','overflow-y'])assert.deepEqual(after.nodes[selector].inline[key],before.nodes[selector].inline[key]);
 return{status:'PASS',evidenceKind:'ACTUAL_BROWSER_INLINE_VALUES_AND_PRIORITIES',before,after};
}

export async function installReadOnlyScrollNetworkBoundaryROOT(context,{allowedReadOrigins,fixtureResponses={}}){
 const allowed=new Set(allowedReadOrigins);assert(allowed.size>0);const blocked=[],servedFixtures=[];
 await context.route('**/*',async route=>{
  const request=route.request(),u=new URL(request.url()),method=request.method(),key=method+' '+u.href;
  if(Object.hasOwn(fixtureResponses,key)){
   assert(['GET','POST'].includes(method));if(method==='POST')assert(/\/print-preview$/.test(u.pathname),'ONLY_SYNTHETIC_PREVIEW_POST_ALLOWED');
   servedFixtures.push({method,path:u.pathname});await route.fulfill(fixtureResponses[key]);return;
  }
  if(method==='GET'&&allowed.has(u.origin)){await route.continue();return;}
  blocked.push({method,origin:u.origin,path:u.pathname});await route.abort('blockedbyclient');
 });
 // HTTP-route counters are not proof against channels outside route(), including service workers/WebSocket.
 // ROOT must use an owned context with serviceWorkers:'block' for this fixture, deny WebSocket traffic,
 // and record that scope separately. Existing user service workers or persistent storage must not be mutated.
 return{blocked,servedFixtures,httpRouteForwardedMutations:0,allBrowserChannelsQualified:false};
}

export async function runReadOnlyStartupWidthMatrixROOT({browser,url,allowedReadOrigins,fixtureResponses={},userAgent,height=800}){
 // Partial diagnostic runner, not the full 140-case suite and never an installer approval.
 assert.equal(typeof browser.newContext,'function');assert.equal(typeof userAgent,'string');assert(userAgent.includes('Android'));assert(height>=360);
 const runs=[];
 for(const width of MOBILE_WIDTHS){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,userAgent,serviceWorkers:'block'});
  try{
   assert.equal(typeof context.routeWebSocket,'function','WEBSOCKET_BOUNDARY_UNAVAILABLE_HOLD');
   const sockets=[];await context.routeWebSocket('**/*',socket=>{sockets.push(socket.url());socket.close();});
   const boundary=await installReadOnlyScrollNetworkBoundaryROOT(context,{allowedReadOrigins,fixtureResponses});
   const page=await context.newPage();await installMobileScrollObserversROOT(page);const cdp=await context.newCDPSession(page);
   const milestones=await captureColdLoadMilestonesROOT(page,url),row={viewportWidth:width,actualInnerWidth:milestones.loaded.innerWidth,milestones,boundary,blockedWebSockets:sockets};
   try{row.touch=await probeActualTouchScrollROOT({page,cdp,expectation:'root-scroll'});row.status='PASS_STARTUP_TOUCH_ONLY';}
   catch(error){row.status='HOLD_STARTUP_DIAGNOSTIC_NOT_RELEASE';row.error={name:error.name,message:error.message};row.afterFailure=await captureMobileScrollDiagnosticsROOT(page);}
   runs.push(row);await cdp.detach();
  }finally{await context.close();}
 }
 return{issuer:'ROOT',state:'ACTUAL_STARTUP_WIDTH_DIAGNOSTICS_PARTIAL_NOT_FULL_MATRIX',runs,physicalAndroidConfirmed:false,full140CasesExecuted:false,authorExecutionClaimed:false,runtimeGo:false,releaseGo:false,dispatchGo:false,publicationGo:false};
}
