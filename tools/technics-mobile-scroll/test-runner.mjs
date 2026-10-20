// SOURCE definitions only. No autorun, browser launch or network on import.
// ROOT supplies the installed browser runtime and authenticated external fixture refs; no private payloads live in this file.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import{pathToFileURL}from'node:url';
import{MOBILE_WIDTHS,MOBILE_SCENARIOS,installMobileScrollObserversROOT,captureMobileScrollDiagnosticsROOT,captureColdLoadMilestonesROOT,probeActualTouchScrollROOT,assertExactInlineOverflowRestoredROOT}from'./probe.mjs';
import{validateMobileScrollReleaseReportSOURCE,validateMobileScrollVersionBindingSOURCE}from'./release-check.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export function canonicalFixtureJSON(value){
 if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
 if(typeof value==='number'){assert(Number.isFinite(value));return JSON.stringify(value);}
 if(Array.isArray(value))return '['+value.map(canonicalFixtureJSON).join(',')+']';
 assert.equal(Object.getPrototypeOf(value),Object.prototype,'JSON_FIXTURE_OBJECT_ONLY');
 return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalFixtureJSON(value[k])).join(',')+'}';
}
export function fixtureBusinessHashes(value){
 const business=Object.fromEntries(Object.entries(value).filter(([k])=>k!=='meta'));
 return{businessSha256:sha(canonicalFixtureJSON(business)),itemSha256:value.item===undefined?null:sha(canonicalFixtureJSON(value.item)),stocksSha256:value.item?.stocks===undefined?null:sha(canonicalFixtureJSON(value.item.stocks)),sessionsSha256:value.sessions===undefined?null:sha(canonicalFixtureJSON(value.sessions)),closedSessionsSha256:value.closedSessions===undefined?null:sha(canonicalFixtureJSON(value.closedSessions))};
}
export function makeCorrelatedReadonlyFixtureEnvelope({originalBytes,expectedRawSha256,requestId,fixtureOrigin,status=200}){
 assert(Buffer.isBuffer(originalBytes));assert.equal(sha(originalBytes),expectedRawSha256);assert.equal(status,200);
 assert.equal(fixtureOrigin,'https://andreacivi80.github.io','EXACT_OWNED_UI_FIXTURE_ORIGIN_REQUIRED');
 assert.match(requestId,/^[a-zA-Z0-9_.:-]{1,200}$/,'REAL_OUTGOING_REQUEST_ID_REQUIRED');
 const original=JSON.parse(originalBytes),m=original.meta;assert(m);assert.equal(m.dataAuthority,'Technics');assert.equal(m.readOnly,true);assert.equal(m.version,'1.9.447');assert.equal(m.nodeId,'technics-utente73-primary');assert.equal(m.nodeRole,'primary');assert(Number.isFinite(Date.parse(m.serverTime)));
 const before=fixtureBusinessHashes(original),rebound={...original,meta:{...m,requestId}},after=fixtureBusinessHashes(rebound);
 assert.deepEqual(after,before,'BUSINESS_FIXTURE_BYTES_VALUES_OR_ORDER_CHANGED');
 assert.deepEqual({...rebound.meta,requestId:m.requestId},m,'ONLY_META_REQUEST_ID_CAN_CHANGE');
 const headers={'Content-Type':'application/json','X-Technics-Request-Id':requestId,'X-Technics-Node':m.nodeId,'X-Technics-Node-Role':m.nodeRole,'X-Technics-Version':m.version,'X-Technics-Lease-Epoch':m.leaseEpoch,'X-Technics-Server-Time':m.serverTime,'Access-Control-Allow-Origin':fixtureOrigin,'Access-Control-Expose-Headers':'X-Technics-Request-Id, X-Technics-Node, X-Technics-Node-Role, X-Technics-Version, X-Technics-Lease-Epoch, X-Technics-Server-Time'};
 for(const k of ['nodeId','nodeRole','version','leaseEpoch','serverTime'])assert.equal(typeof m[k],'string');
 return{status,headers,body:JSON.stringify(rebound),provenance:{scope:'SYNTHETIC_CORRELATION_ENVELOPE_FOR_AUTHENTIC_READONLY_BUSINESS_FIXTURE_NOT_LIVE_OWNER_PROOF',originalRawSha256:expectedRawSha256,emittedBodySha256:sha(JSON.stringify(rebound)),originalRequestId:m.requestId,emittedRequestId:requestId,serverTimePreserved:true,ownerIdentityPreserved:true,onlyMetaRequestIdRebound:true,businessHashes:before}};
}

const raw=r=>{assert(path.win32.isAbsolute(r?.path||''));const s=fs.lstatSync(r.path);assert(s.isFile()&&!s.isSymbolicLink());const b=fs.readFileSync(r.path);assert.equal(sha(b),r.sha256);assert.equal(b.length,r.bytes);return b;},json=r=>JSON.parse(raw(r));
const setHash=c=>sha(Buffer.from([...c.components].sort((a,b)=>a.path.localeCompare(b.path)).map(r=>r.path+'\0'+r.sha256+'\0'+r.bytes+'\n').join('')));
function inventory(ref,version){const c=json(ref);assert.equal(c.revision,version);assert.equal(c.components.length,132);assert.equal(new Set(c.components.map(r=>r.path)).size,132);const map=new Map();for(const r of c.components){const b=raw({path:r.sourcePath,sha256:r.sha256,bytes:r.bytes});map.set(r.path,{row:r,bytes:b});}return{candidate:c,map,hash:setHash(c)};}
const published=b=>{const s=b.toString('utf8');return !b.includes(0)&&Buffer.from(s).equals(b)?Buffer.from(s.replace(/\r\n/g,'\n')):b;};
const mime=p=>p.endsWith('.html')?'text/html':/\.m?js$/.test(p)?'text/javascript':p.endsWith('.json')?'application/json':p.endsWith('.css')?'text/css':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.png')?'image/png':'application/octet-stream';
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

async function finger(page,cdp,{reverse=false,x=null,y=null,distance=250}={}){
 const v=page.viewportSize(),sx=x??v.width*.5,sy=y??(reverse?80:v.height*.8);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy,id:1}]});
 try{for(let n=1;n<=12;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx,y:sy+(reverse?1:-1)*Math.min(distance,v.height*.65)*n/12,id:1}]});await settle(page);}}
 finally{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}await settle(page);
}
async function top(page,cdp){for(let n=0;n<80;n++){const y=await page.evaluate(()=>document.scrollingElement.scrollTop);if(y<=1)return;await finger(page,cdp,{reverse:true});}assert.fail('ROOT_TOP_NOT_REACHED_BY_REAL_REVERSE_TOUCH');}
async function rootTouch(page,cdp){await top(page,cdp);return probeActualTouchScrollROOT({page,cdp,expectation:'root-scroll',distance:220});}
async function clickNav(page,cdp,workspace){await top(page,cdp);await page.locator('.departmentnav [data-workspace="'+workspace+'"]').click();await settle(page);}
async function lookup(page,cdp){await clickNav(page,cdp,'inventory');await page.locator('#code').fill('19017-20');await page.locator('#searchbutton').click();await page.locator('#result:not(.hidden) .stock').first().waitFor();await page.locator('#showZero').check();await settle(page);assert.equal(await page.locator('#result .stock').count(),110,'GENUINE_INVENTORY_110_STOCK_ROWS_REQUIRED');}
async function waitForRestoredInventoryROOT(page){await page.waitForLoadState('load');await page.locator('#result:not(.hidden) .stock').first().waitFor();await page.waitForFunction(()=>{const navigation=performance.getEntriesByType('navigation')[0];return navigation&&navigation.loadEventEnd>0&&performance.now()-navigation.loadEventEnd>=1500;});await settle(page);return page.evaluate(()=>{const navigation=performance.getEntriesByType('navigation')[0];return{navigationElapsedMs:performance.now(),loadEventEnd:navigation.loadEventEnd,afterLoadMs:performance.now()-navigation.loadEventEnd,visibleStockCount:document.querySelectorAll('#result:not(.hidden) .stock').length,resultVisible:!!document.querySelector('#result:not(.hidden)'),workspace:document.querySelector('main.shell')?.dataset.workspace||null};});}
async function packing(page,cdp){await clickNav(page,cdp,'packing');await page.locator('#refreshOpenPacks').click();await page.waitForFunction(()=>document.querySelectorAll('#openPackList .openpack').length===5);assert.equal(await page.locator('#openPackList .openpack').count(),5);}

export async function runMobile494Full140ROOT(i){
 const {candidateVersion,baselineFrontendVersion,legacy}=validateMobileScrollVersionBindingSOURCE({candidateVersion:i.candidateVersion,baselineFrontendVersion:i.baselineFrontendVersion,candidateRef:i.candidateRef,baselineRef:i.baselineRef,baselinePublicationRef:i.baselinePublicationRef});
 assert.equal(i.authority,'PARENT_ROOT');assert.equal(i.explicitRun,true);assert(['candidate','public'].includes(i.phase));assert.match(i.testRunId,/^[a-f0-9]{24}$/);
 assert.equal(path.resolve(path.dirname(i.outputDirectory)),path.resolve(i.workspaceRoot,'verification'));assert.equal(path.basename(i.outputDirectory),'ROOT-mobile'+candidateVersion.split('.').at(-1)+'-full140-'+i.testRunId);assert(!fs.existsSync(i.outputDirectory));
 const candidate=inventory(i.candidateRef,candidateVersion),baseline=inventory(i.baselineRef,baselineFrontendVersion),invBytes=raw(i.inventoryRef),packBytes=raw(i.packingRef),inv=JSON.parse(invBytes),packs=JSON.parse(packBytes);
 if(!legacy){const publication=json(i.baselinePublicationRef);assert.equal(publication.published,true);assert.equal(publication.revision,baselineFrontendVersion);assert.equal(publication.commit,'7ee0387308cbb74451a7cf8de85fd62672d302b4');assert.equal(publication.httpVerified,132);assert.deepEqual(publication.candidate,i.baselineRef);assert.equal(candidate.candidate.base,publication.commit);assert.equal(candidate.candidate.frontendVersion,candidateVersion);assert.equal(baseline.candidate.frontendVersion,baselineFrontendVersion);assert.equal(candidate.candidate.candidateAssetSetSha256,candidate.hash);assert.equal(candidate.candidate.baselineAssetSetSha256,baseline.hash);assert.equal(baseline.hash,'da6c4f6fcbb1a1026bea1d7d8c24aad051d752a6139c556ae64b71074c4d3401');}
 assert.equal(sha(invBytes),'21686f41520f4f81ed3171ad81e8eb69df724e9e7b61f4b6c2d2e2aec6125503');assert.equal(inv.item.stocks.length,110);assert.equal(sha(packBytes),'7fb0b397f96e5e54e51796d2e33fcc98b224afd487a4103f2084e73cab061475');assert.equal(packs.sessions.length,5);
 assert.equal(i.svgPageRefs.length,2);const svg=i.svgPageRefs.map(raw);assert.deepEqual(svg.map(sha),['169b4c2df651ba44f9cc3366b278de2ac5fa85fef40ccc474c7899e3da90ce33','1776bce5cbdc6b96587bb7e7b69babb6c3184749f771f776524da4da020dc08b']);
 const runtime=raw(i.playwrightEntryRef);assert(runtime.length>0);raw(i.hiddenPreloadRef);await import(pathToFileURL(i.hiddenPreloadRef.path));const{chromium}=await import(pathToFileURL(i.playwrightEntryRef.path));
 const base=new URL(i.baseURL);assert.equal(base.protocol,'https:');assert(base.pathname.endsWith('/technics-mobile/'));const prefix=base.pathname;
 fs.mkdirSync(i.outputDirectory);const save=()=>fs.writeFileSync(i.outputDirectory+'/REPORT.json',JSON.stringify(report,null,2)+'\n');
 const report={issuer:'ROOT',state:'RUNNING',phase:i.phase,candidateRef:i.candidateRef,candidateVersion,baselineFrontendVersion,...(!legacy?{baselineRef:i.baselineRef,baselinePublicationRef:i.baselinePublicationRef}:{}),startedAt:new Date().toISOString(),testRunId:i.testRunId,authorExecutedSourceOnly:false,evidenceKind:'ACTUAL_HEADLESS_CHROME_CDP_TOUCH_NOT_PHYSICAL_ANDROID',candidateAssetSetSha256:candidate.hash,baselineAssetSetSha256:baseline.hash,actualMutationsForwarded:0,unobservedBrowserNetworkChannels:false,physicalPrints:0,erpWrites:0,archiveWrites:0,realEmails:0,operationalSessionWrites:0,userCacheOrSessionCleared:false,programmaticScrollUsedForTouchQualification:false,runs:[],sourceFixtureRefs:{inventory:i.inventoryRef,packing:i.packingRef,SVG:i.svgPageRefs},physicalAndroid:{confirmed:false,limitation:'EMULATED_ANDROID_NOT_NOTE56XPRO_PHYSICAL_DEVICE'},fixtureCacheMode:'PLAYWRIGHT_ROUTING_DISABLES_HTTP_CACHE_NO_USER_CACHE_DELETION',publicCacheQualified:false,runtimeGo:false,releaseGo:false,dispatchGo:false,publicationGo:false};
 const fixtureEnvelopes=report.fixtureEnvelopes=[];const fulfillFixture=async(route,originalBytes,expectedRawSha256)=>{const requestId=route.request().headers()['x-technics-request-id'],e=makeCorrelatedReadonlyFixtureEnvelope({originalBytes,expectedRawSha256,requestId,fixtureOrigin:base.origin});fixtureEnvelopes.push({path:new URL(route.request().url()).pathname,...e.provenance});return route.fulfill({status:e.status,headers:e.headers,body:e.body});};
 let context;
 try{
  if(i.phase==='public'){report.publicAssetReadback=[];for(const[p,a]of candidate.map){const r=await fetch(new URL(p,base),{method:'GET',redirect:'error',cache:'no-store'});assert.equal(r.status,200);const b=Buffer.from(await r.arrayBuffer()),expected=published(a.bytes);assert.equal(sha(b),sha(expected),'PUBLIC_ASSET_NOT_EXACT_'+p);report.publicAssetReadback.push({path:p,sourceSha256:a.row.sha256,actualPublishedSha256:sha(b),bytes:b.length});}assert.equal(report.publicAssetReadback.length,132);}
  context=await chromium.launchPersistentContext(i.outputDirectory+'/profile',{headless:true,chromiumSandbox:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',viewport:{width:360,height:640},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (Linux; Android 13; ScrollCompatibility) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36',locale:'it-IT',timezoneId:'Europe/Rome',serviceWorkers:'block',permissions:[],acceptDownloads:false});
  report.engineVersion=context.browser().version();assert.equal(typeof context.routeWebSocket,'function');await context.routeWebSocket('**/*',socket=>socket.close());
  let page,cdp,stage='candidate',oldIndexServed=false,promoteMetadata=false;const served=[],blocked=[],allErrors=[];
  await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url()),method=req.method();
   if(method!=='GET'){blocked.push({method,path:u.pathname});return route.abort('blockedbyclient');}
   if(u.origin===base.origin&&u.pathname.startsWith(prefix)){
    let p=decodeURIComponent(u.pathname.slice(prefix.length))||'index.html';if(p==='version.json'){const set=stage==='old'&&!promoteMetadata?baseline:candidate,a=set.map.get(p);served.push({path:p,sourceSha256:a.row.sha256,assetSetSha256:set.hash,stage:set===baseline?'old':'candidate'});return route.fulfill({status:200,contentType:'application/json',body:a.bytes});}
    if(p==='index.html'&&stage==='old'&&oldIndexServed){stage='candidate';}
    if(p==='index.html'&&stage==='old')oldIndexServed=true;
    const set=stage==='old'?baseline:candidate,a=set.map.get(p);if(!a){blocked.push({method,path:u.pathname});return route.abort('blockedbyclient');}
    served.push({path:p,sourceSha256:a.row.sha256,assetSetSha256:set.hash,stage});
    if(i.phase==='public'&&stage!=='old')return route.continue();return route.fulfill({status:200,contentType:mime(p),body:published(a.bytes)});
   }
   if(u.origin==='https://technics-mobile-gateway.andreacivi80.workers.dev'&&u.pathname==='/api/items/lookup'&&u.searchParams.get('code')==='19017-20')return fulfillFixture(route,invBytes,'21686f41520f4f81ed3171ad81e8eb69df724e9e7b61f4b6c2d2e2aec6125503');
   if(u.origin==='https://technics-mobile-gateway.andreacivi80.workers.dev'&&u.pathname==='/api/packing/open')return fulfillFixture(route,packBytes,'7fb0b397f96e5e54e51796d2e33fcc98b224afd487a4103f2084e73cab061475');
   if(u.origin==='https://cdn.jsdelivr.net'&&/^\/npm\/(?:@zxing\/|ts-custom-error@)/.test(u.pathname))return route.continue();
   blocked.push({method,path:u.pathname});return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,code:'READONLY_UI_FIXTURE_NOT_AVAILABLE'})});
  });
  await context.addInitScript(()=>{window.print=()=>{throw Error('PHYSICAL_PRINT_PROHIBITED')};window.open=()=>null;navigator.sendBeacon=()=>false;});
  // Independent positive control belongs to a blank page, never injected into the application as filler.
  const control=await context.newPage(),controlCDP=await context.newCDPSession(control);await installMobileScrollObserversROOT(control);await control.goto('about:blank');await control.setContent('<!doctype html><html><body style="margin:0"><div style="height:2400px">Independent gesture control</div></body></html>');await control.reload();
  // reload of about:blank discards setContent: create the control again, after the observer is installed in that document.
  await control.setContent('<!doctype html><html><body style="margin:0"><div style="height:2400px">Independent gesture control</div></body></html>');report.touchPositiveControl=await probeActualTouchScrollROOT({page:control,cdp:controlCDP,expectation:'root-scroll'});await control.close();
  for(const width of MOBILE_WIDTHS){
   page=await context.newPage();page.setDefaultTimeout(15000);await page.setViewportSize({width,height:640});await installMobileScrollObserversROOT(page);cdp=await context.newCDPSession(page);const pageErrors=[];page.on('pageerror',e=>{pageErrors.push(e.message);allErrors.push(e.message);});
   const run={viewportWidth:width,actualInnerWidth:width,mobileEmulation:true,hasTouch:true,headless:true,loadedAssetSetSha256:candidate.hash,scenarios:[]};report.runs.push(run);
   const perform=async(id,fn)=>{const errorOffset=pageErrors.length,start=served.length,s={id,status:'RUNNING',actualBrowserExecuted:true,startedAt:new Date().toISOString()};run.scenarios.push(s);save();try{Object.assign(s,await fn());s.newJavaScriptErrors=pageErrors.slice(errorOffset);assert.equal(s.newJavaScriptErrors.length,0);s.loadedAssets=served.slice(start);assert(s.loadedAssets.filter(a=>a.stage!=='old').every(a=>a.assetSetSha256===candidate.hash));s.status='PASS';}catch(e){s.status='HOLD';s.newJavaScriptErrors=pageErrors.slice(errorOffset);s.error={name:e.name,message:e.message};if(e.scrollDiagnostics)s.scrollDiagnostics=e.scrollDiagnostics;throw e;}finally{s.completedAt=new Date().toISOString();save();}};
   const fresh=async()=>{stage='candidate';await page.goto(base.href,{waitUntil:'domcontentloaded'});await page.locator('.departmentnav').waitFor();await settle(page);};
   await perform('open',async()=>{const m=await captureColdLoadMilestonesROOT(page,base.href);assert.equal(m.loaded.version,candidateVersion);assert.equal(m.loaded.innerWidth,width);return{milestones:m};});
   await perform('initial-load',async()=>({beforeAnyOperatorInteraction:true,diagnostics:await captureMobileScrollDiagnosticsROOT(page)}));
   await perform('vertical-touch',async()=>({touch:await rootTouch(page,cdp)}));
   await perform('horizontal-widget',async()=>{await lookup(page,cdp);const l=page.locator('#result .locationbox').first();const g=await l.evaluate(e=>({scrollWidth:e.scrollWidth,clientWidth:e.clientWidth}));if(g.scrollWidth<=g.clientWidth+1)return{applicable:false,reason:'NO_INTENDED_HORIZONTAL_OVERFLOW_IN_THIS_STATE',geometry:g};return{applicable:true,intendedHorizontalWidget:true,touch:await probeActualTouchScrollROOT({page,cdp,axis:'x',expectation:'widget-scroll',scrollSelector:'#result .locationbox'})};});
   await perform('rotation',async()=>{await fresh();await page.setViewportSize({width:800,height:360});const touch=await rootTouch(page,cdp);await clickNav(page,cdp,'schedule');await page.locator('#scheduleRange [name=from]').click();const calendar=page.locator('.rangepickeroverlay:not(.hidden) .rangepickercard');const bounds=await calendar.evaluate(e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight,overflowY:getComputedStyle(e).overflowY};});assert(bounds.top>=13&&bounds.bottom<=347&&bounds.height<=333);assert.equal(bounds.overflowY,'auto');await page.locator('.rangepickeroverlay:not(.hidden) [data-range-cancel]').click();await page.setViewportSize({width,height:640});return{orientationChanged:true,touch,calendarLandscape:bounds};});
   await perform('module-switch',async()=>{await fresh();const steps=[];for(const name of ['inventory','packing','schedule','inventory']){await clickNav(page,cdp,name);steps.push({workspace:name,diagnostics:await captureMobileScrollDiagnosticsROOT(page)});}return{steps,touch:await rootTouch(page,cdp)};});
   await perform('modal-cycle',async()=>{
    await lookup(page,cdp);const cycles=[];
    for(const family of ['FIFO_SIMULATION','PRODUCTION_CHAIN'])for(const target of ['corridor','warehouse']){
     const preModalRootTouch=await rootTouch(page,cdp);await top(page,cdp);const before=await captureMobileScrollDiagnosticsROOT(page);assert(before.scrollingElement.scrollHeight-before.scrollingElement.clientHeight>=24);const images=svg.map(b=>b.toString('base64'));
     await page.evaluate(async({family,target,images})=>{
      const mod=await import('./modules/planning-print-ui.js');const host=document.getElementById('result');const calls={preview:0,page:0,status:0,submit:0};
      const transport={pendingIntents:()=>[],recoverIntent:()=>{throw Error('NO_RECOVERY_SEND_ALLOWED')},qualifyDispatch:async()=>true,submitPreview:()=>{calls.submit++;throw Error('NO_SUBMIT_ALLOWED')},fetch:async(url,options={})=>{if(options.method==='POST'){if(!url.endsWith('/print-preview'))throw Error('NO_MUTATION');calls.preview++;return new Response(JSON.stringify({ok:true,previewId:'ROOT_READONLY_UI_FIXTURE',pageCount:2}),{status:200});}if(/\/page\/[12]$/.test(url)){calls.page++;const n=Number(url.at(-1))-1;return new Response(Uint8Array.from(atob(images[n]),c=>c.charCodeAt(0)),{status:200,headers:{'Content-Type':'image/svg+xml'}});}if(url.endsWith('/status')){calls.status++;return new Response(JSON.stringify({ok:true}),{status:200});}throw Error('UNEXPECTED_UI_TRANSPORT');}};
      window.__rootScrollModal={calls,dispose:mod.attachPlanningPrintControls({container:host,selections:()=>[],documentType:family,transport,baseUrl:'https://ui-fixture.invalid'})};await window.__rootScrollModal.dispose.openPreview(target);
     },{family,target,images});
     await page.locator('.planningprintfifopopup img').nth(1).waitFor();assert.equal(await page.locator('.planningprintfifopopup img').count(),2);
     const backdropPoint=await page.locator('.planningprintmeta').evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.right-12,y:r.bottom-6};});assert(backdropPoint.y>=65);const backgroundTouch=await probeActualTouchScrollROOT({page,cdp,expectation:'root-locked',point:backdropPoint});assert(backgroundTouch.before.ancestors.every(a=>!a.identity.classes.split(/\s+/).includes('planningprintstage')),'BACKGROUND_GESTURE_MUST_NOT_HIT_SCROLLING_WIDGET');for(const s of ['html','body'])assert.equal(backgroundTouch.before.nodes[s].computed['overflow-y'],'hidden');const contentTouch=await probeActualTouchScrollROOT({page,cdp,expectation:'widget-scroll',scrollSelector:'.planningprintstage'});
     await page.locator('[data-planning-preview-close]').click();await assertExactInlineOverflowRestoredROOT(page,before);const afterCloseRootTouch=await rootTouch(page,cdp);
     await page.evaluate(async target=>window.__rootScrollModal.dispose.openPreview(target),target);await page.locator('[data-planning-preview-close]').click();await assertExactInlineOverflowRestoredROOT(page,before);const calls=await page.evaluate(()=>{const x=window.__rootScrollModal.calls;window.__rootScrollModal.dispose();return x;});assert.equal(calls.submit,0);assert.equal(calls.preview,2);assert.equal(calls.page,4);
     cycles.push({family,target,actualApplicationHandler:true,source:'ACTUAL_UNCHANGED_MODULE_EXPORT_WITH_CONTROLLED_READONLY_TRANSPORT_AND_REAL_SVG',preModalRootTouch,backgroundLockExpected:true,backgroundTouch,contentOverflows:true,contentTouch,exactInlineValuesAndPrioritiesRestored:true,afterCloseRootTouch,reopenClosePassed:true,calls});
    }
    await clickNav(page,cdp,'schedule');const calendarBefore=await captureMobileScrollDiagnosticsROOT(page);await page.locator('#scheduleRange [name=from]').click();await page.locator('.rangepickeroverlay:not(.hidden) .rangepickercard').waitFor();await page.locator('.rangepickeroverlay:not(.hidden) [data-range-cancel]').click();await assertExactInlineOverflowRestoredROOT(page,calendarBefore);await page.locator('#scheduleRange [name=from]').click();await page.locator('.rangepickeroverlay:not(.hidden) [data-range-cancel]').click();await assertExactInlineOverflowRestoredROOT(page,calendarBefore);await lookup(page,cdp);cycles.push({family:'CALENDAR',actualApplicationHandler:true,backgroundLockExpected:false,contentOverflows:false,exactInlineValuesAndPrioritiesRestored:true,afterCloseRootTouch:await rootTouch(page,cdp),reopenClosePassed:true});return{cycles};
   });
   await perform('inventory',async()=>{await lookup(page,cdp);return{actualApplicationHandler:true,fixtureDataIsRealisticReadonly:true,injectedFillerDOM:false,touch:await rootTouch(page,cdp)};});
   await perform('stock',async()=>{await lookup(page,cdp);assert.equal(await page.locator('#result .stock').count(),110);return{actualApplicationHandler:true,fixtureDataIsRealisticReadonly:true,injectedFillerDOM:false,touch:await rootTouch(page,cdp)};});
   await perform('packing-list',async()=>{await fresh();await packing(page,cdp);return{actualApplicationHandler:true,fixtureDataIsRealisticReadonly:true,injectedFillerDOM:false,touch:await rootTouch(page,cdp),genuineCards:5};});
   await perform('back',async()=>{await clickNav(page,cdp,'inventory');await lookup(page,cdp);return{actualExistingNavigationHandler:true,touch:await rootTouch(page,cdp)};});
   await perform('refresh',async()=>{await page.reload({waitUntil:'domcontentloaded'});await page.locator('.departmentnav').waitFor();const refreshRestoreBarrier=await waitForRestoredInventoryROOT(page);return{noCacheOrStorageClear:true,refreshRestoreBarrier,touch:await rootTouch(page,cdp)};});
   const sentinelKey='technics-scroll-test-'+i.testRunId,sentinel='OWNED_SYNTHETIC_SESSION_SENTINEL';
   await perform('session-restore',async()=>{await lookup(page,cdp);await page.evaluate(({key,value})=>{localStorage.setItem(key,value);sessionStorage.setItem(key,value);},{key:sentinelKey,value:sentinel});const saved=await page.evaluate(()=>sessionStorage.getItem('technics-refresh-context-v1323'));assert(saved);await page.reload({waitUntil:'domcontentloaded'});const refreshRestoreBarrier=await waitForRestoredInventoryROOT(page);assert.deepEqual(await page.evaluate(key=>[localStorage.getItem(key),sessionStorage.getItem(key)],sentinelKey),[sentinel,sentinel]);return{operationalStoragePreserved:true,cacheOrSessionDeletionUsed:false,syntheticProfileOnly:true,reloadLoopObserved:false,actualApplicationSessionRestore:true,refreshRestoreBarrier,touch:await rootTouch(page,cdp)};});
   await perform('version-update',async()=>{
    stage='old';oldIndexServed=false;promoteMetadata=false;
    const navs=[],mainDocumentRequests=[],servedOffset=served.length;
    const observation={width,startedAt:new Date().toISOString(),frameEvents:navs,mainDocumentRequests,indexAssets:[]};
    (report.versionUpdateDiagnostics??=[]).push(observation);
    const onnav=frame=>{if(frame===page.mainFrame())navs.push({url:frame.url(),at:new Date().toISOString(),kind:'MAIN_FRAME_EVENT_MAY_BE_SAME_DOCUMENT_HISTORY'});};
    const onrequest=req=>{if(req.isNavigationRequest()&&req.resourceType()==='document'&&req.frame()===page.mainFrame())mainDocumentRequests.push({url:req.url(),method:req.method(),at:new Date().toISOString(),isNavigationRequest:true,resourceType:'document'});};
    page.on('framenavigated',onnav);page.on('request',onrequest);
    try{
     await page.goto(base.href,{waitUntil:'domcontentloaded'});
     await page.waitForFunction(()=>!document.documentElement.classList.contains('version-gate-pending'));
     assert.equal(await page.locator('meta[name="technics-build-version"]').getAttribute('content'),baselineFrontendVersion);
     await page.locator('#code').focus();promoteMetadata=true;
     await page.waitForFunction(version=>document.documentElement.dataset.updatePending===version,candidateVersion);
     assert.equal(await page.locator('meta[name="technics-build-version"]').getAttribute('content'),baselineFrontendVersion);
     await page.locator('#technics-update-now').click();
     await page.waitForFunction(version=>document.querySelector('meta[name="technics-build-version"]')?.content===version,candidateVersion);
     await settle(page);
     observation.indexAssets=served.slice(servedOffset).filter(a=>a.path==='index.html');observation.observedCandidateVersion=await page.locator('meta[name="technics-build-version"]').getAttribute('content');
     observation.observationCompletedAt=new Date().toISOString();
     // Persist real frame events AND actual main-document requests before checking the bounded update.
     save();
     assert(mainDocumentRequests.length<=3,'UPDATE_RELOAD_LOOP');
     assert.deepEqual(await page.evaluate(key=>[localStorage.getItem(key),sessionStorage.getItem(key)],sentinelKey),[sentinel,sentinel]);
     assert.equal(stage,'candidate');
     return{operationalStoragePreserved:true,cacheOrSessionDeletionUsed:false,syntheticProfileOnly:true,reloadLoopObserved:false,allLoadedAssetsFromSameReviewedCandidate:true,originalExplicitUpdateBannerHandler:true,originalTimedUpdateCheck:true,navigations:navs,mainDocumentRequests,indexAssets:observation.indexAssets,httpCacheQualificationClaimed:false,touch:await rootTouch(page,cdp)};
    }finally{page.off('framenavigated',onnav);page.off('request',onrequest);observation.finishedAt=new Date().toISOString();save();}
   });
   assert.deepEqual(run.scenarios.map(s=>s.id),[...MOBILE_SCENARIOS]);await page.close();save();
  }
  report.blocked=blocked;report.errors=allErrors;assert.equal(allErrors.length,0,'UNHANDLED_PAGE_SCRIPT_ERRORS');report.actualCaseCount=report.runs.reduce((n,r)=>n+r.scenarios.filter(s=>s.status==='PASS').length,0);assert.equal(report.actualCaseCount,140);report.state='ACTUAL_MOBILE_SCROLL_MATRIX_COMPLETED';report.completedAt=new Date().toISOString();report.additiveCheck=validateMobileScrollReleaseReportSOURCE(report,{candidateAssetSetSha256:candidate.hash,baselineAssetSetSha256:baseline.hash,expectedTestRunId:i.testRunId,expectedCandidateVersion:candidateVersion,expectedBaselineFrontendVersion:baselineFrontendVersion,expectedCandidateRef:i.candidateRef,expectedBaselineRef:i.baselineRef,expectedBaselinePublicationRef:i.baselinePublicationRef});save();return{reportRef:{path:i.outputDirectory+'/REPORT.json',sha256:sha(fs.readFileSync(i.outputDirectory+'/REPORT.json')),bytes:fs.statSync(i.outputDirectory+'/REPORT.json').size},state:report.state};
 }catch(e){report.state='ACTUAL_MOBILE_SCROLL_MATRIX_HOLD';report.error={name:e.name,message:e.message};report.completedAt=new Date().toISOString();save();throw Object.assign(e,{reportPath:i.outputDirectory+'/REPORT.json'});}finally{if(context)await context.close();}
}
