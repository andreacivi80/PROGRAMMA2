// Additive planning client only. Never calls a printer or the existing print intent registries.
const roots=Object.freeze({PRODUCTION_CHAIN:'/api/planning/production-chain/',FIFO_SIMULATION:'/api/planning/fifo-simulation/'});
const roles=Object.freeze({'technics-utente73-primary':'primary','technics-utente38-secondary':'secondary'});
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const hex=/^[a-f0-9]{64}$/;
const fail=()=>{throw Error('PLANNING_FROZEN_IDENTITY_NOT_QUALIFIED_NO_FALLBACK');};
export function createPlanningTypedTransport(approvedTransport,{baseHref=globalThis.location?.href,expectedVersion='1.9.432'}={}){
 if(typeof approvedTransport?.fetch!=='function'||expectedVersion!=='1.9.432')throw Error('PLANNING_CONFIG_NOT_BOUND');
 const owners=new Map();
 const check=(response,payload,requestId,owner)=>{const m=payload?.meta;if(!m||m.version!==expectedVersion||roles[m.nodeId]!==m.nodeRole||!roles[m.nodeId]||m.source!=='TechnicsNativeBridge'||m.dataAuthority!=='Technics'||m.readOnly!==true||!uuid.test(m.backendInstanceId||'')||m.requestId!==requestId||!Number.isFinite(Date.parse(m.serverTime||''))||!m.leaseEpoch)fail();for(const [h,v]of [['X-Technics-Version',m.version],['X-Technics-Node',m.nodeId],['X-Technics-Node-Role',m.nodeRole],['X-Technics-Backend-Instance-Id',m.backendInstanceId],['X-Technics-Request-Id',requestId],['X-Technics-Server-Time',m.serverTime],['X-Technics-Lease-Epoch',String(m.leaseEpoch)]])if(response.headers.get(h)!==v)fail();if(owner&&['nodeId','nodeRole','backendInstanceId'].some(k=>m[k]!==owner[k]))fail();return m;};
 return Object.freeze({async fetch(input,options={}){
  const url=new URL(input,baseHref),old=url.pathname,method=String(options.method||'GET').toUpperCase();
  if(old==='/api/planning/print'||Object.values(roots).some(r=>old===r+'print'))throw Error('PLANNING_PHYSICAL_DISPATCH_DISABLED');
  const requestId=globalThis.crypto.randomUUID(),headers=new Headers(options.headers);headers.set('X-Technics-Request-Id',requestId);let opts={...options,method,headers,cache:'no-store'},owner=null,creation=null;
  if(old==='/api/planning/print-preview'){
   if(method!=='POST')throw Error('PLANNING_PREVIEW_POST_REQUIRED');const body=JSON.parse(options.body),root=roots[body.documentType];if(!root)throw Error('PLANNING_DOCUMENT_TYPE_INVALID');
   creation={documentType:body.documentType,target:body.target,root};url.pathname=root+'print-preview';opts.body=JSON.stringify({selections:body.selections,documentType:body.documentType,printerTarget:body.target});
  }
  const image=/^\/api\/planning\/print-preview\/([a-f0-9]{32})\/page\/([1-9]\d?)$/.exec(old);
  if(image){if(method!=='GET')fail();owner=owners.get(image[1]);if(!owner)fail();url.pathname=owner.root+'print-preview-image';url.search=new URLSearchParams({id:image[1],page:image[2],documentType:owner.documentType}).toString();}
  const status=/^\/api\/planning\/print-preview\/([a-f0-9]{32})\/(status|print-status)$/.exec(old);
  if(status){if(method!=='GET'||url.search)fail();owner=owners.get(status[1]);if(!owner)fail();url.pathname=owner.root+(status[2]==='status'?'print-preview-status':'print-status');url.search=new URLSearchParams({id:status[1],documentType:owner.documentType}).toString();}
  if(!creation&&!image&&!status&&!(method==='GET'&&old==='/api/planning/production-chain'))throw Error('PLANNING_CLIENT_ROUTE_NOT_ALLOWED');
  // Exactly one attempt, including failures and uncertain responses.
  const response=await approvedTransport.fetch(url.href,opts);
  if(image){if(!response.ok)return response;for(const [h,v]of [['X-Technics-Version',expectedVersion],['X-Technics-Node',owner.nodeId],['X-Technics-Node-Role',owner.nodeRole],['X-Technics-Backend-Instance-Id',owner.backendInstanceId],['X-Technics-Request-Id',requestId]])if(response.headers.get(h)!==v)fail();if(!response.headers.get('X-Technics-Lease-Epoch')||!Number.isFinite(Date.parse(response.headers.get('X-Technics-Server-Time')||''))||!response.headers.get('Content-Type')?.startsWith('image/svg+xml'))fail();const bytes=await response.clone().arrayBuffer(),actual=[...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');if(actual!==owner.pageSha256[Number(image[2])-1])fail();return response;}
  const payload=await response.clone().json();if(!response.ok)return response;const meta=check(response,payload,requestId,owner);
  if(status){if(response.status!==200||payload.ok!==true||payload.previewId!==status[1]||payload.documentType!==owner.documentType||payload.printerTarget!==owner.target||payload.dispatchEnabled!==false||payload.printed!==false||payload.physicalOutputConfirmed!==false||!Number.isSafeInteger(payload.attempts)||payload.attempts<0||payload.attempts>1||typeof payload.state!=='string'||!payload.state.length||payload.state.length>80||(payload.documentSha256!=null&&!hex.test(payload.documentSha256)))fail();}
  if(creation){if(response.status!==202||payload.ok!==true||payload.documentType!==creation.documentType||payload.printerTarget!==creation.target||!(/^[a-f0-9]{32}$/).test(payload.previewId||'')||!hex.test(payload.snapshotHash||'')||payload.snapshotHash!==payload.payloadSha256||payload.dispatchEnabled!==false||payload.physicalOutputConfirmed!==false||!Number.isInteger(payload.pageCount)||payload.pageCount<1||payload.pageCount>64||!Array.isArray(payload.pageSha256)||payload.pageSha256.length!==payload.pageCount||payload.pageSha256.some(h=>!hex.test(h)))fail();if(owners.has(payload.previewId))fail();owners.set(payload.previewId,{...creation,nodeId:meta.nodeId,nodeRole:meta.nodeRole,backendInstanceId:meta.backendInstanceId,snapshotHash:payload.snapshotHash,pageSha256:payload.pageSha256});}
  return response;
 }});
}
