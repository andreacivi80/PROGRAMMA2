// Source contract: calendar days are inclusive; the ERP shipping-date authority is supplied by the backend, never inferred here.
const fail=code=>{throw Error(code);};
export function normalizePlanningPeriod449(period){
 if(!period||Object.keys(period).some(k=>!['from','to','dateBasis'].includes(k))||!['schedule-current','shipment'].includes(period.dateBasis))fail('PLANNING_PERIOD_INVALID');
 for(const value of [period.from,period.to])if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)fail('PLANNING_PERIOD_INVALID');
 if(period.to<period.from)fail('PLANNING_PERIOD_INVALID');return {from:period.from,to:period.to,dateBasis:period.dateBasis};
}
export function readPlanningCalendarPeriod449(document){
 const workspace=document.querySelector('main.shell')?.dataset.workspace;
 const form=document.querySelector(workspace==='sales'?'#salesRange':'#scheduleRange');
 return normalizePlanningPeriod449({from:form?.elements?.from?.value,to:form?.elements?.to?.value,dateBasis:'shipment'});
}
export function qualifyPlanningPeriodResult449(result,period){
 const requested=normalizePlanningPeriod449(period),scope=result?.periodSelection;
 if(!scope||scope.from!==requested.from||scope.to!==requested.to||scope.dateBasis!==requested.dateBasis||scope.complete!==true||scope.order!==(requested.dateBasis==='schedule-current'?'schedule-asc':'shipment-asc')||scope.dateAuthority?.verified!==true||typeof scope.dateAuthority.field!=='string'||!scope.dateAuthority.field||(requested.dateBasis==='schedule-current'&&scope.dateAuthority.field!=='r.DataConferma')||scope.dateAuthority.meaning!==(requested.dateBasis==='schedule-current'?'current-schedule':'programmed-shipment')||typeof scope.dateAuthority.rootProofSha256!=='string'||!/^([a-f0-9]{64})$/.test(scope.dateAuthority.rootProofSha256||'')||!Array.isArray(result.selections)||!Number.isSafeInteger(scope.count)||scope.count<0||scope.count>256||scope.count!==result.selections.length)fail('PLANNING_COMPLETE_SHIPMENT_PERIOD_NOT_QUALIFIED');
 const ids=new Set();for(const s of result.selections){if(!/^\d{1,6}$/.test(String(s.number||''))||!Number.isInteger(s.year)||s.year<2000||s.year>2100||!Number.isSafeInteger(s.headerId)||s.headerId<=0||ids.has(s.headerId))fail('PLANNING_PERIOD_IDENTITY_NOT_QUALIFIED');ids.add(s.headerId);}
 return result.selections.map(s=>({...s}));
}

export function extractScheduleOVs449(payload){
 const result=payload?.result;if(payload?.ok!==true||result?.documentType!=='OV'||!Array.isArray(result.rows))fail('PLANNING_SCHEDULE_RESULT_MISSING');
 const period=normalizePlanningPeriod449({from:result.from,to:result.to,dateBasis:'schedule-current'}),ids=new Map();
 for(const r of result.rows){const number=String(r.ovNumber||'').trim();const year=Number(String(r.orderDate||'').slice(0,4));const headerId=r.ovHeaderId;if(!/^\d{1,6}$/.test(number)||!Number.isSafeInteger(headerId)||headerId<=0||!Number.isInteger(year)||year<2000||year>2100)fail('PLANNING_SCHEDULE_IDENTITY_MISSING');const s={number:number.padStart(6,'0'),year,headerId};const old=ids.get(headerId);if(old&&(old.number!==s.number||old.year!==s.year))fail('PLANNING_SCHEDULE_IDENTITY_CONTRADICTION');ids.set(headerId,s);}
 return {period,selections:[...ids.values()],rowCount:result.rows.length,sourceDateAuthority:result.dateAuthority,shippingQualified:false,reason:'RAW_SCHEDULE_IDENTITIES_ONLY_NOT_SHIPMENT_DOMAIN_QUALIFICATION'};
}
