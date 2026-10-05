const KEY='technics.planning449.dispatch-intents.v1';
const ID=/^[a-f0-9]{32}$/,HASH=/^[a-f0-9]{64}$/,UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const roles={'technics-utente73-primary':'primary','technics-utente38-secondary':'secondary'};
const fields=['documentType','previewId','snapshotHash','printerTarget','operationId','backendVersion','nodeId','nodeRole','backendInstanceId'];
const fail=()=>{throw Error('PLANNING_INTENT_UNCERTAIN_NO_RESEND');};
export function validatePlanningIntent449(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||fields.some(k=>typeof x[k]!=='string')||Object.keys(x).some(k=>![...fields,'state','createdAt'].includes(k))||!['PRODUCTION_CHAIN','FIFO_SIMULATION'].includes(x.documentType)||!ID.test(x.previewId||'')||!HASH.test(x.snapshotHash||'')||!UUID.test(x.operationId||'')||!UUID.test(x.backendInstanceId||'')||!['1.9.433','1.9.434','1.9.435','1.9.436'].includes(x.backendVersion)||roles[x.nodeId]!==x.nodeRole||!roles[x.nodeId]||!['corridor','warehouse'].includes(x.printerTarget)||!['pending','uncertain','accepted'].includes(x.state)||typeof x.createdAt!=='string'||!Number.isFinite(Date.parse(x.createdAt))||new Date(x.createdAt).toISOString()!==x.createdAt)fail();
 return x;
}
export function createPlanningIntentRegistry449(storage,{now=Date.now,uuid=()=>globalThis.crypto.randomUUID()}={}){
 if(typeof storage?.getItem!=='function'||typeof storage?.setItem!=='function')fail();
 const load=()=>{let value;try{const raw=storage.getItem(KEY);value=raw===null?{schema:1,entries:[]}:JSON.parse(raw);}catch{fail();}
  if(!value||value.schema!==1||!Array.isArray(value.entries)||value.entries.length>128||Object.keys(value).some(k=>!['schema','entries'].includes(k)))fail();
  const ops=new Set(),owners=new Set();for(const e of value.entries){validatePlanningIntent449(e);const k=[e.documentType,e.previewId,e.backendInstanceId].join(':');if(ops.has(e.operationId)||owners.has(k))fail();ops.add(e.operationId);owners.add(k);}return value;};
 const save=x=>{const bytes=JSON.stringify(x);storage.setItem(KEY,bytes);if(storage.getItem(KEY)!==bytes)fail();};
 const same=(a,b)=>fields.every(k=>a[k]===b[k]);
 return Object.freeze({
  pending:()=>load().entries.filter(x=>x.state!=='accepted').map(x=>({...x})),
  hasSnapshot:owner=>load().entries.some(x=>x.documentType===owner.documentType&&x.previewId===owner.previewId&&x.backendInstanceId===owner.backendInstanceId),
  reserve(owner){const ledger=load();if(ledger.entries.some(x=>x.state!=='accepted')||ledger.entries.length>=128||ledger.entries.some(x=>x.documentType===owner.documentType&&x.previewId===owner.previewId&&x.backendInstanceId===owner.backendInstanceId))fail();const e=validatePlanningIntent449({...Object.fromEntries(fields.filter(k=>k!=='operationId').map(k=>[k,owner[k]])),operationId:uuid(),createdAt:new Date(now()).toISOString(),state:'pending'});ledger.entries.push(e);save(ledger);return {...e};},
  settle(intent,state){if(!['accepted','uncertain'].includes(state))fail();const ledger=load(),i=ledger.entries.findIndex(x=>x.operationId===intent.operationId);if(i<0||!same(ledger.entries[i],intent)||ledger.entries[i].state==='accepted'&&state!=='accepted')fail();ledger.entries[i]={...ledger.entries[i],state};save(ledger);return {...ledger.entries[i]};}
 });
}
