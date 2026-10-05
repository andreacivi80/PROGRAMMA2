// SOURCE only. The caller cannot supply dateAuthority. The existing reader
// supplies run() inside its one protected rollback-only transaction.
export const PLANNING_PERIOD_LIMITS=Object.freeze({maxDays:62,maxOV:256,maxRows:5000,maxQueryIds:256,maxOP:1024,readBudgetMs:15000,maxPages:64});
// Genuine ROOT current432 calendar GET pins DataConsegna/r.DataConferma.
// This is NOT shipping semantics or new bulk-reader runtime qualification.
export const CURRENT_SCHEDULE_DATE_AUTHORITY=Object.freeze({verified:true,field:'r.DataConferma',meaning:'current-schedule',rootProofSha256:'1a3780f16de45e27f10b48781ff9e7cddfa60afbee9522784bcda01694bc7d70'});
const fail=(code,status=400)=>Object.assign(Error(code),{code,status});
// Observed columns only, not a claim that any one is the user's shipping date.
// Installed frmPlanningSpedizioni evidence6d416 lists the two header fields;
// its token presence is NOT a qualified control-flow/business mapping.
const fields=Object.freeze({'r.DataRichiesta':'r.DataRichiesta','r.DataConferma':'r.DataConferma','h.DataPreparaDoc':'h.DataPreparaDoc','h.DataConsegnaT':'h.DataConsegnaT'});
const strict=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
const day=v=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw fail('PLANNING_PERIOD_DATE_INVALID');const d=new Date(v+'T00:00:00.000Z');if(!Number.isFinite(d.valueOf())||d.toISOString().slice(0,10)!==v)throw fail('PLANNING_PERIOD_DATE_INVALID');return d;};
export function normalizePlanningPeriod(value){
 if(!strict(value,['from','to','dateBasis'])||!['shipment','schedule-current'].includes(value.dateBasis))throw fail('PLANNING_PERIOD_INVALID');
 const from=day(value.from),to=day(value.to),days=(to-from)/86400000;
 if(days<0||days>PLANNING_PERIOD_LIMITS.maxDays)throw fail('PLANNING_PERIOD_RANGE_EXCEEDED');
 return Object.freeze({from:value.from,to:value.to,dateBasis:value.dateBasis});
}
export function qualifyShipmentDateAuthority(value,basis='shipment'){
 if(!strict(value,['verified','field','meaning','rootProofSha256'])||value.verified!==true||!Object.hasOwn(fields,value.field)||value.meaning!==(basis==='schedule-current'?'current-schedule':'programmed-shipment')||!/^[a-f0-9]{64}$/.test(value.rootProofSha256||'')||basis==='schedule-current'&&(value.field!=='r.DataConferma'||value.rootProofSha256!==CURRENT_SCHEDULE_DATE_AUTHORITY.rootProofSha256))throw fail('PLANNING_SHIPMENT_DATE_AUTHORITY_UNKNOWN',503);
 return Object.freeze({...value});
}
export function planningSnapshotSelectionLimit(snapshot){
 if(snapshot?.periodSelection==null)return 12;
 const p=snapshot.periodSelection,normalized=normalizePlanningPeriod({from:p.from,to:p.to,dateBasis:p.dateBasis}),authority=qualifyShipmentDateAuthority(p.dateAuthority,p.dateBasis),s=snapshot.selections;
 if(p.complete!==true||p.order!==(p.dateBasis==='schedule-current'?'schedule-asc':'shipment-asc')||p.count!==s?.length||p.count<1||p.count>256||p.sourceScope!=='SCADENZIARIO_ORDINI_OV_WITH_NON_SERVICE_ROWS_IN_PERIOD')throw fail('PLANNING_PERIOD_SNAPSHOT_NOT_COMPLETE',409);
 let previous=null;for(const selection of s){const date=selection.shipmentDate;day(date);if(date<normalized.from||date>normalized.to||previous&&(date<previous.shipmentDate||date===previous.shipmentDate&&selection.headerId<=previous.headerId))throw fail('PLANNING_PERIOD_ORDER_NOT_VERIFIED',409);previous=selection;}
 return 256;
}
