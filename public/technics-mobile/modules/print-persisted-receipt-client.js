(()=>{
"use strict";
// Source-only proposal. Historical receipts never acquire fresh backend metadata.
const GUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRINT_ID=/^[a-f0-9]{32}$/;
const HASH=/^[a-f0-9]{64}$/;
const NODE='technics-utente38-secondary';
const PRINT_ROUTES=new Set(['/api/inventory/committed/print','/api/inventory/item-optimization/print']);
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
 const expected=Object.freeze({...approved});
 if(terminal){if(!PRINT_ID.test(expected.printId||'')||url.searchParams.get('id')!==expected.printId)fail();}
 else{
  if(method!=='POST'||url.pathname!==expected.printRoute)fail();
  const body=parse(options.body||'');
  for(const key of ['operationId','printerTarget','previewId','snapshotHash'])if(body[key]!==expected[key])fail();
 }
 return {expected,method,terminal};
}
function createPrintReceiptClient({transport,origin,backendVersions=['1.9.419','1.9.420'],newRequestId=()=>crypto.randomUUID()}){
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
   trace(wire,response.headers,backendVersions,requestId);
   if(!PRINT_ID.test(wire.printId||'')||(terminal&&wire.printId!==expected.printId)||(!terminal&&response.status!==202)||(!terminal&&wire.printerTarget!==expected.printerTarget))fail();
   return {response,payload:wire,historical:false};
  }
  const r=wire.gatewayPrintReceipt,c=r?.current,i=r?.intent,o=r?.original;
  if(response.headers.get('X-Technics-Gateway')!=='stable-worker-print-receipt'||response.headers.get('X-Technics-Gateway-Version')!=='1.9.215'||response.headers.get('X-Technics-Gateway-Request-Id')!==requestId||response.headers.get('X-Technics-Node')!==NODE||wire.gateway!==true||r?.schema!==1||r.gatewayVersion!=='1.9.215'||r.kind!==(terminal?'terminal':'accepted')||c?.requestId!==requestId||c.origin!==endpointOrigin||c.path!==url.pathname||c.method!==method||i?.nodeId!==NODE||i.printRoute!==expected.printRoute||!PRINT_ID.test(i.printId||'')||(terminal&&i.printId!==expected.printId))fail();
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

globalThis.TechnicsPrintReceiptClient=Object.freeze({version:'historical-print-receipt-schema1-source',async fetchJson(url,options,approved){const client=createPrintReceiptClient({transport:globalThis.TechnicsTransport,origin:globalThis.__technicsBridgeUrl});return client.fetchJson(url,options,approved);}});
})();
