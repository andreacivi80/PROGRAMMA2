// Browser-only SOURCE subset. Exact predicate/helpers from initial-carico5b7; no SQL/compiler import.
const clean=v=>String(v??'').trim(),norm=v=>clean(v).toUpperCase();
const integer=v=>Number.isSafeInteger(v)&&v>0;
const date=v=>{if(v instanceof Date)return Number.isFinite(v.valueOf())?v.toISOString():null;if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v))return null;const d=new Date(v);return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===v.slice(0,10)?d.toISOString():null;};
export function hasQualifiedFifoOrigin(s){
 if(s?.fifoDateVerified!==true||!date(s.fifoDate))return false;
 if(s.fifoSourceReference!=null){const r=s.fifoSourceReference;return r.table==='InfoLotto'&&r.column==='DataDoc'&&integer(r.id)&&r.articleId===s.articleId&&!!norm(s.lot)&&norm(r.lot)===norm(s.lot)&&!!norm(s.unit)&&norm(r.unit)===norm(s.unit)&&date(r.date)===date(s.fifoDate)&&s.fifoSourceMovementId==null&&s.fifoAuthority==='InfoLotto.DataDoc.earliestOriginalArticleLotUnit';}
 // Preserve genuine prior production-carico contracts exactly; never alias an InfoLotto ID.
 return!!s.fifoSourceMovementId;
}
