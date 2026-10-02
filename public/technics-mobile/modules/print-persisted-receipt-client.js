(()=>{'use strict';
const legacyFactory=(()=>{
"use strict";
// Source-only proposal. Historical receipts never acquire fresh backend metadata.
const GUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRINT_ID=/^[a-f0-9]{32}$/;
const HASH=/^[a-f0-9]{64}$/;
const NODE='technics-utente38-secondary';
const PRINT_ROUTES=new Set(['/api/inventory/committed/print','/api/inventory/item-optimization/print','/api/sales/schedule/print','/api/inventory/expiry/print']);
const TRACE=[['X-Technics-Request-Id','requestId'],['X-Technics-Node','nodeId'],['X-Technics-Node-Role','nodeRole'],['X-Technics-Version','version'],['X-Technics-Lease-Epoch','leaseEpoch'],['X-Technics-Server-Time','serverTime']];
const fail=()=>{throw Object.assign(new Error('Ricevuta stampa non verificabile; nessun nuovo invio automatico.'),{code:'PRINT_RECEIPT_CONTRACT_INVALID'});};
const parse=value=>{try{const p=JSON.parse(value);if(!p||typeof p!=='object'||Array.isArray(p))fail();return p;}catch{fail();}};
function trace(payload,headers,versions,expectedId=null){
 const m=payload?.meta;
 if(!m||m.dataAuthority!=='Technics'||m.readOnly!==true||m.nodeId!==NODE||m.nodeRole!=='secondary'||!versions.includes(m.version)||!GUID.test(m.requestId||'')||!Number.isFinite(Date.parse(m.serverTime||''))||!m.leaseEpoch||(expectedId&&m.requestId!==expectedId)||TRACE.some(([h,k])=>!headers.get(h)||headers.get(h)!==String(m[k]||'')))fail();
}
function contextFor(url,options,approved){
 const method=String(options.method||'GET').toUpperCase(),terminal=method==='GET'&&url.pathname==='/api/packing/print-status';
 if(!approved||!PRINT_ROUTES.has(approved.printRoute)||!GUID.test(approved.operationId||'')||!['corridor','warehouse'].includes(approved.printerTarget)||!HASH.test(approved.snapshotHash||'')||!/^[A-Za-z0-9_-]{8,160}$/.test(approved.previewId||''))fail();
 const family={'/api/sales/schedule/print':'SALES_SCHEDULE','/api/inventory/expiry/print':'EXPIRY'}[approved.printRoute];
  if(family && (approved.documentType!==family || !/^[A-Za-z0-9_-]{24}$/.test(approved.previewId)))fail();
  const expected=Object.freeze({...approved});
 if(terminal){if(!PRINT_ID.test(expected.printId||'')||url.searchParams.get('id')!==expected.printId)fail();}
 else{
  if(method!=='POST'||url.pathname!==expected.printRoute)fail();
  const body=parse(options.body||'');
  for(const key of ['operationId','printerTarget','previewId','snapshotHash'])if(body[key]!==expected[key])fail();
  if(family&&body.documentType!==family)fail();
 }
 return {expected,method,terminal};
}
function createPrintReceiptClient({transport,origin,backendVersions=['1.9.419','1.9.420','1.9.421'],newRequestId=()=>crypto.randomUUID()}){
 const endpoint=new URL(origin),endpointOrigin=endpoint.origin;
 if(endpoint.protocol!=='https:')fail();
 if(typeof transport?.fetch!=='function')throw Error('Trasporto stampa assente.');
 return Object.freeze({async fetchJson(value,options={},approved){
  const url=new URL(value,endpointOrigin),{expected,method,terminal}=contextFor(url,options,approved);
  if(url.origin!==endpointOrigin)fail();
  const requestId=newRequestId();if(!GUID.test(requestId))fail();
  const headers=new Headers(options.headers||{});headers.set('X-Technics-Request-Id',requestId);
  // TechnicsTransport owns timeout/cancellation and does not retry a POST.
  const response=await transport.fetch(url.href,{cache:'no-store',...options,headers});
  if(response.redirected||(response.url&&new URL(response.url).origin!==endpointOrigin))fail();
  const wire=parse(await response.text());
  if(!response.ok||wire.ok!==true)throw Object.assign(new Error(wire.error||'Stampa non disponibile.'),{code:wire.errorCode||'PRINT_RESPONSE_ERROR'});
  const marked=response.headers.get('X-Technics-Print-Receipt')==='persisted';
  if(!marked){
   if(wire.gatewayPrintReceipt)fail();
   trace(wire,response.headers,['1.9.421'],requestId);
   if(!PRINT_ID.test(wire.printId||'')||(terminal&&wire.printId!==expected.printId)||(!terminal&&response.status!==202)||(!terminal&&wire.printerTarget!==expected.printerTarget))fail();
   return {response,payload:wire,historical:false};
  }
  const r=wire.gatewayPrintReceipt,c=r?.current,i=r?.intent,o=r?.original;
  if(response.headers.get('X-Technics-Gateway')!=='stable-worker-print-receipt'||!['1.9.216','1.9.222'].includes(response.headers.get('X-Technics-Gateway-Version'))||response.headers.get('X-Technics-Gateway-Request-Id')!==requestId||response.headers.get('X-Technics-Node')!==NODE||wire.gateway!==true||r?.schema!==1||r.gatewayVersion!==response.headers.get('X-Technics-Gateway-Version')||r.kind!==(terminal?'terminal':'accepted')||c?.requestId!==requestId||c.origin!==endpointOrigin||c.path!==url.pathname||c.method!==method||i?.nodeId!==NODE||i.printRoute!==expected.printRoute||(expected.documentType&&i.documentType!==expected.documentType)||!PRINT_ID.test(i.printId||'')||(terminal&&i.printId!==expected.printId))fail();
  for(const key of ['operationId','printerTarget','previewId','snapshotHash'])if(i[key]!==expected[key])fail();
  if(!o||o.status!==(terminal?200:202)||response.status!==o.status||typeof o.bodyBase64!=='string'||!o.bodyBase64.length||o.bodyBase64.length>8192||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o.bodyBase64)||!o.headers||Array.isArray(o.headers))fail();
  const originalHeaders=new Headers(o.headers);
  if(Object.keys(o.headers).length!==7||Object.keys(o.headers).some(h=>!['content-type',...TRACE.map(([h])=>h.toLowerCase())].includes(h.toLowerCase()))||!/^application\/json(?:;\s*charset=utf-8)?$/i.test(originalHeaders.get('Content-Type')||''))fail();
  let text;try{const bytes=atob(o.bodyBase64);if(btoa(bytes)!==o.bodyBase64)fail();text=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bytes,c=>c.charCodeAt(0)));}catch{fail();}
  const payload=parse(text);trace(payload,originalHeaders,backendVersions);
  if(payload.ok!==true||payload.printId!==i.printId||(!terminal&&payload.printerTarget!==expected.printerTarget)||(terminal&&(payload.ready!==true||payload.printed!==true)))fail();
  Object.defineProperty(payload,'__technicsHistoricalPrintReceipt',{value:Object.freeze({schema:1,kind:r.kind,currentGatewayRequestId:requestId,originalBackendRequestId:payload.meta.requestId,originalBackendServerTime:payload.meta.serverTime,operationId:i.operationId,printId:i.printId}),enumerable:false});
  return {response,payload,historical:true};
 }});
}

return createPrintReceiptClient;
})();;
const modernFactory=(()=>{
"use strict";
// Source-only proposal. Historical receipts never acquire fresh backend metadata.
const GUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRINT_ID=/^[a-f0-9]{32}$/;
const HASH=/^[a-f0-9]{64}$/;
const INSTANCE=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NODE_ROLES=Object.freeze({'technics-utente73-primary':'primary','technics-utente38-secondary':'secondary'});
const PRINT_ROUTES=new Set(['/api/inventory/committed/print','/api/inventory/item-optimization/print','/api/sales/schedule/print','/api/inventory/expiry/print','/api/picking/print','/api/packing/print','/api/packing/picking-print']);
const TRACE=[['X-Technics-Request-Id','requestId'],['X-Technics-Node','nodeId'],['X-Technics-Node-Role','nodeRole'],['X-Technics-Version','version'],['X-Technics-Lease-Epoch','leaseEpoch'],['X-Technics-Server-Time','serverTime']];
const fail=()=>{throw Object.assign(new Error('Ricevuta stampa non verificabile; nessun nuovo invio automatico.'),{code:'PRINT_RECEIPT_CONTRACT_INVALID'});};
const parse=value=>{try{const p=JSON.parse(value);if(!p||typeof p!=='object'||Array.isArray(p))fail();return p;}catch{fail();}};
function trace(payload,headers,versions,expectedId=null,expectedNode=null,expectedGeneration=null){
 const m=payload?.meta;
  if(expectedGeneration&&m?.backendInstanceId!==expectedGeneration)fail();
  if(m?.backendInstanceId!==undefined&&(!INSTANCE.test(m.backendInstanceId)||(expectedId&&headers.get('X-Technics-Backend-Instance-Id')!==m.backendInstanceId)))fail();
 if(!m||m.dataAuthority!=='Technics'||m.readOnly!==true||!NODE_ROLES[m.nodeId]||m.nodeRole!==NODE_ROLES[m.nodeId]||(expectedNode&&m.nodeId!==expectedNode)||!versions.includes(m.version)||!GUID.test(m.requestId||'')||!Number.isFinite(Date.parse(m.serverTime||''))||!m.leaseEpoch||(expectedId&&m.requestId!==expectedId)||TRACE.some(([h,k])=>!headers.get(h)||headers.get(h)!==String(m[k]||'')))fail();
}
function contextFor(url,options,approved){
 const method=String(options.method||'GET').toUpperCase(),terminal=method==='GET'&&url.pathname==='/api/packing/print-status';
 if(!approved||!PRINT_ROUTES.has(approved.printRoute)||!GUID.test(approved.operationId||'')||!['corridor','warehouse'].includes(approved.printerTarget)||!HASH.test(approved.snapshotHash||'')||!/^[A-Za-z0-9_-]{8,160}$/.test(approved.previewId||''))fail();
 const family={'/api/sales/schedule/print':'SALES_SCHEDULE','/api/inventory/expiry/print':'EXPIRY','/api/picking/print':'PICKING','/api/packing/print':'PACKING','/api/packing/picking-print':'PACKING_PICKING'}[approved.printRoute];
  if(family && (approved.documentType!==family || !/^[A-Za-z0-9_-]{24}$/.test(approved.previewId)))fail();
  if(approved.nodeId!==undefined&&!NODE_ROLES[approved.nodeId])fail();
   if(approved.backendInstanceId!==undefined&&!INSTANCE.test(approved.backendInstanceId))fail();
   const expected=Object.freeze({...approved});
 if(terminal){if(!PRINT_ID.test(expected.printId||'')||url.searchParams.get('id')!==expected.printId)fail();}
 else{
  if(method!=='POST'||url.pathname!==expected.printRoute)fail();
  const body=parse(options.body||'');
  for(const key of ['operationId','printerTarget','previewId','snapshotHash'])if(body[key]!==expected[key])fail();
  if(family&&body.documentType!==family)fail();
 }
 return {expected,method,terminal};
}
const STANDARD_FAMILIES={'/api/inventory/clients/print':'CUSTOMER_INVENTORY','/api/packaging/promoitalia/print':'PACKAGING_PROMOITALIA'};
async function fetchStandardReceipt(url,options,approved,{endpointOrigin,transport,backendVersions,newRequestId}) {
 const family=STANDARD_FAMILIES[approved?.printRoute],method=String(options.method||'GET').toUpperCase(),terminal=method==='GET';
 if(!family||approved.documentType!==family||!NODE_ROLES[approved.nodeId]||!INSTANCE.test(approved.backendInstanceId||'')||!GUID.test(approved.operationId||'')||!HASH.test(approved.snapshotHash||'')||!['corridor','warehouse'].includes(approved.printerTarget)||!new RegExp('^'+(family==='CUSTOMER_INVENTORY'?'ci_':'ppl_')+'[a-f0-9]{32}$').test(approved.snapshotId||'')||url.origin!==endpointOrigin)fail();
 if(terminal){if(url.pathname!==approved.printRoute.replace(/print$/,'print-status'))fail();if(approved.printId){if(!/^psl_[a-f0-9]{24}$/.test(approved.printId)||url.searchParams.get('id')!==approved.printId)fail()}else if(url.searchParams.get('operationId')!==approved.operationId||url.searchParams.has('id'))fail()}else{if(method!=='POST'||url.pathname!==approved.printRoute)fail();const body=parse(options.body||'');for(const k of ['operationId','snapshotId','snapshotHash','printerTarget'])if(body[k]!==approved[k])fail()}
 const requestId=newRequestId();if(!GUID.test(requestId||''))fail();const headers=new Headers(options.headers);headers.set('X-Technics-Request-Id',requestId);
 const response=await transport.fetch(url.href,{cache:'no-store',...options,headers});if(response.redirected||response.url&&new URL(response.url).origin!==endpointOrigin)fail();
 const wire=parse(await response.text());if(!response.ok||wire.ok!==true)throw Object.assign(new Error(wire.error||'Stampa non disponibile.'),{code:wire.errorCode||'PRINT_RESPONSE_ERROR'});
 let payload=wire,historical=false;const r=wire.gatewayStandardPrintReceipt;
 if(response.headers.get('X-Technics-Standard-Print-Receipt')==='persisted'){
  const i=r?.intent,c=r?.current,o=r?.original;
  if(response.headers.get('X-Technics-Gateway-Version')!=='1.9.222'||response.headers.get('X-Technics-Gateway')!=='stable-worker-standard-receipt'||response.headers.get('X-Technics-Gateway-Request-Id')!==requestId||response.headers.get('X-Technics-Node')!==approved.nodeId||wire.gateway!==true||r?.schema!==1||r.kind!=='standard-psl-frozen-v1'||r.terminal!==terminal||c?.requestId!==requestId||c.origin!==endpointOrigin||c.path!==url.pathname||c.method!==method||o?.status!==202||response.status!==(terminal?200:202)||typeof o.bodyBase64!=='string'||o.bodyBase64.length>8192)fail();
  for(const k of ['operationId','snapshotId','snapshotHash','printerTarget','documentType','nodeId','backendInstanceId','printRoute'])if(i?.[k]!==approved[k])fail();if(terminal&&approved.printId&&i.printId!==approved.printId||!/^psl_[a-f0-9]{24}$/.test(i.printId||''))fail();
  const originalHeaders=new Headers(o.headers);if(!o.headers||Object.keys(o.headers).length!==8||Object.keys(o.headers).some(h=>!['content-type','x-technics-backend-instance-id',...TRACE.map(([h])=>h.toLowerCase())].includes(h.toLowerCase())))fail();
  try{const raw=atob(o.bodyBase64);if(btoa(raw)!==o.bodyBase64)fail();payload=parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,x=>x.charCodeAt(0))))}catch{fail()}
  trace(payload,originalHeaders,backendVersions,null,approved.nodeId,approved.backendInstanceId);if(payload.printId!==i.printId)fail();historical=true;
 }else{if(r)fail();trace(payload,response.headers,backendVersions,requestId,approved.nodeId,approved.backendInstanceId);if(response.status!==(terminal?200:202))fail()}
 if(payload.documentType!==family||payload.frozenStandardContract!=='standard-family-frozen-v1'||payload.snapshotId!==approved.snapshotId||payload.snapshotHash!==approved.snapshotHash||payload.printerTarget!==approved.printerTarget||!/^psl_[a-f0-9]{24}$/.test(payload.printId||'')||terminal&&approved.printId&&payload.printId!==approved.printId||payload.transport!=='STANDARD_LPD'||payload.state!=='accepted'||payload.accepted!==true||payload.printed!==false||payload.physicalOutputConfirmed!==false)fail();
 return{response,payload,historical};
}
function createPrintReceiptClient({transport,origin,backendVersions=['1.9.425'],newRequestId=()=>crypto.randomUUID()}){
 const endpoint=new URL(origin),endpointOrigin=endpoint.origin;
 if(endpoint.protocol!=='https:')fail();
 if(typeof transport?.fetch!=='function')throw Error('Trasporto stampa assente.');
 return Object.freeze({async fetchJson(value,options={},approved){
  const url=new URL(value,endpointOrigin);
  if(STANDARD_FAMILIES[approved?.printRoute])return fetchStandardReceipt(url,options,approved,{endpointOrigin,transport,backendVersions,newRequestId});
  const {expected,method,terminal}=contextFor(url,options,approved);
  if(url.origin!==endpointOrigin)fail();
  const requestId=newRequestId();if(!GUID.test(requestId))fail();
  const headers=new Headers(options.headers||{});headers.set('X-Technics-Request-Id',requestId);
  // TechnicsTransport owns timeout/cancellation and does not retry a POST.
  const response=await transport.fetch(url.href,{cache:'no-store',...options,headers});
  if(response.redirected||(response.url&&new URL(response.url).origin!==endpointOrigin))fail();
  const wire=parse(await response.text());
  if(!response.ok||wire.ok!==true)throw Object.assign(new Error(wire.error||'Stampa non disponibile.'),{code:wire.errorCode||'PRINT_RESPONSE_ERROR'});
  const marked=response.headers.get('X-Technics-Print-Receipt')==='persisted';
  if(!marked){
   if(wire.gatewayPrintReceipt)fail();
   trace(wire,response.headers,backendVersions,requestId,expected.nodeId||null,expected.backendInstanceId||null);
   if(!PRINT_ID.test(wire.printId||'')||(terminal&&wire.printId!==expected.printId)||(!terminal&&response.status!==202)||(!terminal&&wire.printerTarget!==expected.printerTarget))fail();
   return {response,payload:wire,historical:false};
  }
  const r=wire.gatewayPrintReceipt,c=r?.current,i=r?.intent,o=r?.original;
  if(response.headers.get('X-Technics-Gateway')!=='stable-worker-print-receipt'||!['1.9.222'].includes(response.headers.get('X-Technics-Gateway-Version'))||response.headers.get('X-Technics-Gateway-Request-Id')!==requestId||response.headers.get('X-Technics-Node')!==i?.nodeId||wire.gateway!==true||r?.schema!==1||r.gatewayVersion!==response.headers.get('X-Technics-Gateway-Version')||r.kind!==(terminal?'terminal':'accepted')||c?.requestId!==requestId||c.origin!==endpointOrigin||c.path!==url.pathname||c.method!==method||!NODE_ROLES[i?.nodeId]||(expected.nodeId&&i.nodeId!==expected.nodeId)||i.printRoute!==expected.printRoute||(expected.documentType&&i.documentType!==expected.documentType)||!PRINT_ID.test(i.printId||'')||(terminal&&i.printId!==expected.printId))fail();
  for(const key of ['operationId','printerTarget','previewId','snapshotHash'])if(i[key]!==expected[key])fail();
   if(i.backendInstanceId!==undefined&&!INSTANCE.test(i.backendInstanceId)||expected.backendInstanceId&&i.backendInstanceId!==expected.backendInstanceId)fail();
  if(!o||o.status!==(terminal?200:202)||response.status!==o.status||typeof o.bodyBase64!=='string'||!o.bodyBase64.length||o.bodyBase64.length>8192||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o.bodyBase64)||!o.headers||Array.isArray(o.headers))fail();
  const originalHeaders=new Headers(o.headers);
  if(Object.keys(o.headers).length!==7||Object.keys(o.headers).some(h=>!['content-type',...TRACE.map(([h])=>h.toLowerCase())].includes(h.toLowerCase()))||!/^application\/json(?:;\s*charset=utf-8)?$/i.test(originalHeaders.get('Content-Type')||''))fail();
  let text;try{const bytes=atob(o.bodyBase64);if(btoa(bytes)!==o.bodyBase64)fail();text=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bytes,c=>c.charCodeAt(0)));}catch{fail();}
  const payload=parse(text);trace(payload,originalHeaders,backendVersions,null,i.nodeId,i.backendInstanceId||null);
  if(payload.ok!==true||payload.printId!==i.printId||(!terminal&&payload.printerTarget!==expected.printerTarget)||(terminal&&(payload.ready!==true||!(payload.printed===true||(expected.documentType==='SALES_SCHEDULE'&&payload.documentType==='SALES_SCHEDULE'&&payload.transport==='STANDARD_LPD'&&payload.accepted===true&&payload.state==='accepted'&&payload.printed===false&&payload.physicalOutputConfirmed===false&&payload.printerTarget===expected.printerTarget)))))fail();
  Object.defineProperty(payload,'__technicsHistoricalPrintReceipt',{value:Object.freeze({schema:1,kind:r.kind,currentGatewayRequestId:requestId,originalBackendRequestId:payload.meta.requestId,originalBackendServerTime:payload.meta.serverTime,operationId:i.operationId,printId:i.printId}),enumerable:false});
  return {response,payload,historical:true};
 }});
}

return createPrintReceiptClient;
})();;
globalThis.TechnicsPrintReceiptClient=Object.freeze({version:'dual-explicit-421-425-source443',async fetchJson(url,options={},approved){
 const protocol=approved?.protocol,modern=protocol==='frozen425'||protocol==='standardFrozen425';
 if(!approved||!modern&&protocol!=='legacy421'||modern&&approved.backendVersion!=='1.9.425'||!modern&&approved.backendVersion!=='1.9.421'||modern&&!approved.backendInstanceId)throw Object.assign(Error('Contesto di stampa non qualificato: nessun invio.'),{code:'PRINT_PROTOCOL_UNQUALIFIED'});
 const method=String(options.method||'GET').toUpperCase();if(method==='POST'){await TechnicsPrintProtocols443.requireGateway(modern?'frozen425':'legacy421');if(!modern){const body=JSON.parse(options.body);for(const key of ['protocol','backendVersion','nodeId','nodeRole','backendInstanceId'])delete body[key];options={...options,body:JSON.stringify(body)};}TechnicsPrintProtocols443.beginIntent(approved);}
 const factory=modern?modernFactory:legacyFactory,result=await factory({transport:globalThis.TechnicsTransport,origin:globalThis.__technicsBridgeUrl}).fetchJson(url,options,approved);
 if(method==='GET'&&result.payload?.ready===true&&(result.payload.printed===true||modern&&result.payload.documentType==='SALES_SCHEDULE'&&result.payload.transport==='STANDARD_LPD'&&result.payload.accepted===true&&result.payload.state==='accepted'&&result.payload.printed===false&&result.payload.physicalOutputConfirmed===false)||protocol==='standardFrozen425'&&result.payload?.accepted===true&&result.payload.physicalOutputConfirmed===false)TechnicsPrintProtocols443.endIntent(approved);
 return result;
}});})();
