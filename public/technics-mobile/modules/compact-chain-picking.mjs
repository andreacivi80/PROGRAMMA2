import {buildProductionChain,simulateFifo} from './production-chain-adapter.mjs';
const text=v=>String(v??''),id=v=>text(v).trim(),q=(n,u)=>`${n??'non disponibile'} ${u||'unità non disponibile'}`;
// Demand-OV context is not a new producer-owner assertion. Only original graph
// edges and the same immutable snapshot determine the displayed cascade.
export function compactChainPickingRows(snapshot){
 const graph=buildProductionChain(snapshot);let simulation,error=null;try{simulation=simulateFifo(snapshot);}catch(e){error=String(e.message||e);}
 const byKey=new Map(graph.nodes.map(n=>[n.key,n])),byOP=new Map(graph.nodes.filter(n=>n.kind==='OP').map(n=>[id(n.id),n])),alloc=new Map(),rows=[],seen=new Set(),shownMaterials=new Set();
 for(const a of simulation?.allocations||[]){const key=id(a.materialRowId);if(!alloc.has(key))alloc.set(key,[]);alloc.get(key).push(a);}
 for(const s of graph.selections){const ov=`OV ${s.number}`;rows.push({separator:true,cells:[ov,'',''],ovHeaderId:s.headerId});
  const visit=(key,trail=[])=>{if(trail.includes(key))return;for(const e of graph.edges.filter(e=>e.from===key)){const n=byKey.get(e.to),shared=seen.has(e.to);if(n?.kind==='OP'){rows.push({kind:'OP',cells:[`${ov} · OP ${n.number||'?'}`,`${n.code||''} · ${n.lot||'—'}`,shared?'—':q(n.quantity,n.unit)],opId:n.id,ovHeaderId:s.headerId,sourceGraphKey:n.key,quantityRepeatedReference:shared});}
   else if(n?.kind==='MATERIAL'){const op=byOP.get(id(n.opId)),label=`${ov} · OP ${op?.number||'?'}`,a=alloc.get(id(n.id))||[];shownMaterials.add(id(n.id));for(const x of a)rows.push({kind:'MATERIAL_ALLOCATION',cells:[label,`${n.code||x.code||''} · ${x.lot}`,q(x.quantity,x.unit)+(x.kind==='EXISTING_REAL_ALLOCATION_PRESERVED'?' E':' S')],opId:n.opId,materialRowId:n.id,ovHeaderId:s.headerId,sourceAllocations:[{...x}]});const taken=a.reduce((sum,x)=>sum+Number(x.quantity),0),need=Math.max(0,Number(n.quantity)-taken);if(!a.length||need>1e-6)rows.push({kind:'MATERIAL_UNCOVERED',cells:[label,`${n.code||''} · —`,q(!a.length?n.quantity:Math.round(need*1e6)/1e6,n.unit)],opId:n.opId,materialRowId:n.id,ovHeaderId:s.headerId,sourceAllocations:[],uncovered:true});}
   if(!shared){seen.add(e.to);visit(e.to,[...trail,key]);}}
  };visit('OV:'+s.headerId);
 }
 return {rows,materialRows:shownMaterials.size,partial:graph.status!=='LINKS_VERIFIED'||!simulation||simulation.status!=='SIMULATION_COMPLETE',simulationError:error,simulationDiagnostics:simulation?{allocations:simulation.allocations,shortages:simulation.shortages,issues:simulation.issues,qualificationGaps:simulation.qualificationGaps,status:simulation.status}:null,sourceGraphMissing:graph.missing,sourceGraphEdges:graph.edges,erpWrites:0,createsCommitments:false,physicalOutputConfirmed:false};
}
