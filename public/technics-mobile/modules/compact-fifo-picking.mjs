// Shared pure UI/document projection. ERP and SIM quantities never merge.
export function compactFifoPickingRows(simulation){
 if(simulation?.kind!=='SIMULATION_NOT_ERP_ALLOCATION'||!Array.isArray(simulation.allocations))throw Error('INVALID_FIFO_SIMULATION');
 const rows=new Map();let erpAllocations=0,simulationAllocations=0;
 for(const a of simulation.allocations){
  if(!a.code||!a.lot||!a.unit||!Number.isFinite(a.quantity)||a.quantity<=0||!['EXISTING_REAL_ALLOCATION_PRESERVED','FIFO_SIMULATION'].includes(a.kind))throw Error('INVALID_PICK_PROPOSAL');
  const key=JSON.stringify([a.articleId,a.code,a.lot,a.unit]);let r=rows.get(key);
  if(!r){r={articleId:a.articleId,code:a.code,lot:a.lot,unit:a.unit,erpQuantity:0,simulationQuantity:0,sourceAllocations:[]};rows.set(key,r);}
  const field=a.kind==='EXISTING_REAL_ALLOCATION_PRESERVED'?'erpQuantity':'simulationQuantity';
  r[field]=Math.round((r[field]+a.quantity)*1e9)/1e9;
  if(field==='erpQuantity')erpAllocations++;else simulationAllocations++;
  r.sourceAllocations.push({...a});
 }
 return {label:'Simulazione: non impegna nuovi lotti',status:simulation.status,rows:[...rows.values()],partial:simulation.complete!==true,shortageCount:simulation.shortages?.length||0,issueGroupCount:simulation.issueGroups?.length||0,ownerGapCount:simulation.qualificationGaps?.length||0,erpAllocations,simulationAllocations,ownerQualified:simulation.ownerQualified===true,createsCommitments:false,erpWrites:0};
}
