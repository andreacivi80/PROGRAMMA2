// Pure presentation only; unqualified demand never becomes an allocation.
export function fifoDemandSummary(simulation,orders=[]){
 const rows=[];
 for(const d of [...(simulation.shortages||[]),...(simulation.blockedDemands||[])]){
  if(!d.code||!d.unit||!Number.isFinite(Number(d.quantity))||Number(d.quantity)<=0)continue;
  const op=orders.find(o=>String(o.id)===String(d.opId)),number=op?.number||'non identificato';
  const blocked=d.kind==='UNQUALIFIED_DEMAND_NOT_ALLOCATED';
  const reason=blocked?(d.reasons||[]).some(r=>r.kind==='REAL_COMMITMENT_ARTICLE_NOT_RECONCILED')?'Unità o impegni da verificare': 'Impegno superiore alla disponibilità verificata':'Giacenza disponibile insufficiente';
  rows.push({code:d.code,quantity:Number(d.quantity),unit:d.unit,op:'OP\u00a0'+number,reason,kind:blocked?'Da verificare':'Non coperto'});
 }
 return rows;
}
export function fifoDemandSummaryText(row){return row.code+' · '+new Intl.NumberFormat('it-IT',{maximumFractionDigits:6}).format(row.quantity)+' '+row.unit+' · '+row.op+' · '+row.kind+': '+row.reason;}
