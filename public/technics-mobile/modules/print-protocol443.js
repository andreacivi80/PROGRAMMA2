(()=>{
'use strict';
const roles=Object.freeze({'technics-utente73-primary':'primary','technics-utente38-secondary':'secondary'});
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const fail=()=>{throw Object.assign(Error('Contratto di anteprima non qualificato: nessun invio.'),{code:'PREVIEW_PROTOCOL_UNQUALIFIED'})};
const pending=new Set();
function beginIntent(intent){pending.add(intent.operationId)}
function endIntent(intent){pending.delete(intent.operationId)}
function hasPending(){if(pending.size)return true;try{for(let i=0;i<globalThis.localStorage?.length;i++)if(globalThis.localStorage.key(i)?.startsWith('technics-standard-frozen-intent:'))return true}catch{return true}return false}
function identify(payload){
 const m=payload?.meta;
 if(!m||m.dataAuthority!=='Technics'||m.readOnly!==true||!roles[m.nodeId]||roles[m.nodeId]!==m.nodeRole||!uuid.test(m.requestId||'')||!m.leaseEpoch||!Number.isFinite(Date.parse(m.serverTime||'')))fail();
 if(m.version==='1.9.421'){
  if(m.backendInstanceId!==undefined||payload.frozenPreviewRequired===true||payload.frozenStandardContract!==undefined)fail();
  return Object.freeze({protocol:'legacy421',backendVersion:m.version,nodeId:m.nodeId,nodeRole:m.nodeRole});
 }
 if(m.version==='1.9.425'&&uuid.test(m.backendInstanceId||''))return Object.freeze({protocol:'frozen425',backendVersion:m.version,nodeId:m.nodeId,nodeRole:m.nodeRole,backendInstanceId:m.backendInstanceId});
 fail();
}
function freezePreview(payload,selection,documentType,{operator=false}={}){
 const identity=identify(payload);
 if(!/^[A-Za-z0-9_-]{8,160}$/.test(payload?.previewId||''))fail();
 if(identity.protocol==='frozen425'&&(!/^[a-f0-9]{64}$/.test(payload.snapshotHash||'')||payload.documentType!==documentType||!['corridor','warehouse'].includes(payload.printerTarget)||operator&&payload.frozenPreviewRequired!==true))fail();
 if(identity.protocol==='legacy421'&&!operator&&(!/^[a-f0-9]{64}$/.test(payload.snapshotHash||'')||payload.documentType!==undefined&&payload.documentType!==documentType||!['corridor','warehouse'].includes(payload.printerTarget)))fail();
 if(identity.protocol==='legacy421'&&operator&&payload.documentType!==undefined&&payload.documentType!==documentType)fail();
 return Object.freeze({...selection,...identity,previewId:payload.previewId,...(payload.snapshotHash===undefined?{}:{snapshotHash:payload.snapshotHash}),...(payload.printerTarget===undefined?{}:{printerTarget:payload.printerTarget}),documentType});
}
async function requireGateway(protocol){
 const base=new URL(globalThis.__technicsBridgeUrl),response=await globalThis.TechnicsTransport.fetch(new URL('/__gateway/status?printProtocol='+Date.now(),base).href,{cache:'no-store'});
 if(!response.ok||response.redirected||response.url&&new URL(response.url).origin!==base.origin)fail();
 const body=await response.json(),allowed=protocol==='legacy421'?['1.9.216','1.9.222']:protocol==='frozen425'||protocol==='standardFrozen425'?['1.9.222']:[];
 if(body.ok!==true||body.gateway!=='technics-mobile-gateway'||!allowed.includes(body.version))throw Object.assign(Error('Il gateway non ammette questo contratto di stampa: nessun invio.'),{code:'PRINT_GATEWAY_PROTOCOL_UNQUALIFIED'});
 return body.version;
}
function legacyBody(intent){
 if(intent?.protocol!=='legacy421'||intent.backendVersion!=='1.9.421')fail();
 if(intent.documentType==='PACKING'||intent.documentType==='PACKING_PICKING')return {opBarcode:intent.opBarcode,...(intent.printerTarget?{printerTarget:intent.printerTarget}:{}),operationId:intent.operationId};
 if(intent.documentType==='PICKING')return {...(intent.groupId?{groupId:intent.groupId}:{opNumber:intent.opNumber,year:intent.year}),...(intent.printerTarget?{printerTarget:intent.printerTarget}:{}),operationId:intent.operationId};
 fail();
}
async function operatorCall(url,options,intent){
 if(intent?.protocol==='frozen425')return globalThis.TechnicsPrintReceiptClient.fetchJson(url,options,intent);
 if(intent?.protocol!=='legacy421'||intent.backendVersion!=='1.9.421'||!['PICKING','PACKING','PACKING_PICKING'].includes(intent.documentType))fail();
 const method=String(options.method||'GET').toUpperCase(),u=new URL(url);
 if(u.origin!==new URL(globalThis.__technicsBridgeUrl).origin)fail();
 if(method==='POST'){
  if(u.pathname!==intent.printRoute)fail();
  await requireGateway(intent.protocol);
  options={...options,body:JSON.stringify(legacyBody(intent))};
  beginIntent(intent);
 }else if(method!=='GET'||u.pathname!=='/api/packing/print-status'||u.searchParams.get('id')!==intent.printId)fail();
 const response=await globalThis.TechnicsTransport.fetch(url,options);
 const payload=await globalThis.TechnicsDataClient.read(response,'Esito stampa non verificabile.');
 if(!response.ok||payload?.ok!==true)throw Object.assign(Error(payload?.error||'Stampa non disponibile.'),{code:payload?.code});
 const actual=identify(payload);
 if(actual.protocol!==intent.protocol||actual.nodeId!==intent.nodeId||!(/^[a-f0-9]{32}$/).test(payload.printId||'')||method==='GET'&&payload.printId!==intent.printId)fail();
 if(method==='GET'&&payload.ready===true&&payload.printed===true)endIntent(intent);
 return {response,payload};
}
globalThis.TechnicsPrintProtocols443=Object.freeze({identify,freezePreview,requireGateway,legacyBody,operatorCall,beginIntent,endIntent,hasPending});
})();
