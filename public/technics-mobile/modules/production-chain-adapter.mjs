// Source-only, read-only raw schema1 adapter. No network, ERP assignment or print dispatch.
import {qualifyChainRelations} from './chain-link-verification.mjs';
import {hasQualifiedFifoOrigin} from './fifo-initial-carico.browser.mjs';
const id=v=>String(v??'').trim(),lot=v=>String(v??'').trim().toUpperCase(),unit=v=>String(v??'').trim().toUpperCase();
const number=v=>{if(v===null||v===undefined||v==='')throw Error('MISSING_QUANTITY');const n=Number(v);if(!Number.isFinite(n)||n<0)throw Error('INVALID_NONNEGATIVE_QUANTITY');return n;};
const validDate=v=>{if(!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v||''))return false;const day=v.slice(0,10),d=new Date(day+'T00:00:00Z');return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===day;};
const index=(rows,name)=>{const map=new Map();for(const row of rows||[]){const key=id(row.id);if(!key||map.has(key))throw Error('INVALID_OR_DUPLICATE_'+name+'_ID');map.set(key,row);}return map;};
const same=(a,b)=>id(a)===id(b),qtyEqual=(a,b)=>Math.abs(a-b)<1e-6;
import {planningSnapshotSelectionLimit} from './PlanningPeriod433.browser.mjs';
export function buildProductionChain(snapshot){
 const selections=snapshot?.selections||[snapshot?.selection];if(snapshot?.schema!==1||snapshot.dataAuthority!=='Technics'||!selections.length||selections.length>planningSnapshotSelectionLimit(snapshot)||selections.some(s=>s?.verified!==true||!s.headerId||!s.year))throw Error('UNVERIFIED_OV_SELECTION');if(new Set(selections.map(s=>id(s.headerId))).size!==selections.length)throw Error('DUPLICATE_OV_SELECTION');
 for(const name of['salesRows','orders','materials','stocks','productionMovements'])if(!Array.isArray(snapshot[name])||snapshot[name].length>5000)throw Error('MISSING_OR_OVERSIZE_'+name);
 const sales=index(snapshot.salesRows,'SALES_ROW'),orders=index(snapshot.orders,'OP'),materials=index(snapshot.materials,'MATERIAL'),stocks=index(snapshot.stocks,'STOCK'),nodes=new Map(),edges=[],missing=[],expanded=new Set();if(snapshot.truncated===true)missing.push({kind:'SOURCE_TRUNCATED'});
 const selection=selections[0],ovKeys=selections.map(s=>'OV:'+id(s.headerId)),roots=[];for(const s of selections)nodes.set('OV:'+id(s.headerId),{key:'OV:'+id(s.headerId),kind:'OV',...s});
 for(const row of sales.values())if(!selections.some(s=>same(row.headerId,s.headerId)))throw Error('FOREIGN_OV_ROW_IN_SELECTION');
 const opNode=op=>{const key='OP:'+id(op.id);if(!nodes.has(key))nodes.set(key,{key,kind:'OP',id:op.id,number:op.number,year:op.year,articleId:op.articleId,code:op.code,description:op.description,articleRole:op.articleRole||'unclassified',quantity:op.quantity,unit:op.unit,lot:op.lot||'',status:op.status,linkedOvRowId:op.linkedOvRowId});return key;};
 for(const row of sales.values()){
  const linked=[...orders.values()].filter(op=>same(op.linkedOvRowId,row.id)),ovKey='OV:'+id(row.headerId);const shipped=(snapshot.shipmentLinks||[]).filter(link=>link.verified===true&&same(link.salesRowId,row.id));
  if(!linked.length&&!shipped.length)missing.push({kind:'OP_LINK_TO_VERIFY',salesRowId:row.id,articleId:row.articleId,code:row.code});
  for(const op of linked){const key=opNode(op);roots.push(key);edges.push({from:ovKey,to:key,kind:'DIRECT_OV_ROW_OP',salesRowId:row.id,provenance:{table:'prodt_ordini',column:'id_r_preventivi',value:row.id},quantity:op.quantity,unit:op.unit});}
  for(const link of shipped){const op=orders.get(id(link.producerOpId)),stock=stocks.get(id(link.stockId));if(!op||!stock||!same(op.articleId,link.articleId)||!same(stock.articleId,link.articleId)||!lot(link.lot)||lot(stock.lot)!==lot(link.lot)||lot(op.lot)!==lot(link.lot)||!unit(link.unit)||unit(stock.unit)!==unit(link.unit)||unit(op.unit)!==unit(link.unit)||!link.documentRowId||!link.movementId){missing.push({kind:'SHIPPED_ORIGIN_NOT_VERIFIED',salesRowId:row.id});continue;}const to=opNode(op);roots.push(to);edges.push({from:ovKey,to,kind:'SHIPPED_LOT_ORIGIN',salesRowId:row.id,quantity:link.quantity,unit:link.unit,provenance:{documentRowId:link.documentRowId,documentHeaderId:link.documentHeaderId,documentNumber:link.documentNumber,documentYear:link.documentYear,movementId:link.movementId,stockId:link.stockId,producerOpId:op.id}});}
 }
 const queue=[...new Set(roots)];
 for(let cursor=0;cursor<queue.length;cursor++){
  const key=queue[cursor];if(expanded.has(key))continue;expanded.add(key);const opId=key.slice(3);
  for(const material of materials.values())if(same(material.opId,opId)){
   const materialKey='MATERIAL:'+id(material.id);nodes.set(materialKey,{key:materialKey,kind:'MATERIAL',id:material.id,opId:material.opId,articleId:material.articleId,code:material.code,description:material.description,quantity:material.requiredQuantity,unit:material.unit,assignedLot:material.assignedLot||'',assignedStockId:material.assignedStockId||null});edges.push({from:key,to:materialKey,kind:'OP_MATERIAL_REQUIREMENT',materialRowId:material.id,quantity:material.requiredQuantity,unit:material.unit});
   const stock=stocks.get(id(material.assignedStockId));
   const unresolved=reason=>missing.push({kind:reason,opId:material.opId,materialRowId:material.id,code:material.code});
   if(!lot(material.assignedLot)){unresolved('MATERIAL_LOT_NOT_ASSIGNED');continue;}
   if(!stock||!unit(material.unit)||!same(stock.articleId,material.articleId)||lot(stock.lot)!==lot(material.assignedLot)||unit(stock.unit)!==unit(material.unit)){unresolved('ASSIGNED_STOCK_ARTICLE_LOT_MISMATCH');continue;}
   const matches=(snapshot.productionMovements||[]).filter(m=>m.isProductLoadVerified===true&&same(m.stockId,stock.id)&&same(m.articleId,material.articleId)&&lot(m.lot)===lot(material.assignedLot)&&unit(m.unit)===unit(material.unit));
   const producerIds=new Set(matches.map(m=>id(m.producerOpId)).filter(Boolean));
   if(!producerIds.size){unresolved(material.articleRole==='purchased'?'PURCHASED_MATERIAL_NO_PRODUCTION_OP':'PRODUCER_NOT_VERIFIED');continue;}
   if(producerIds.size!==1){unresolved('MULTIPLE_PRODUCERS_AMBIGUOUS');continue;}
   const producerId=[...producerIds][0],producer=orders.get(producerId);
   if(!producer||!same(producer.articleId,material.articleId)||lot(producer.lot)!==lot(material.assignedLot)||unit(producer.unit)!==unit(material.unit)){unresolved('PRODUCER_OP_ARTICLE_LOT_UNIT_MISMATCH');continue;}
   const producerKey=opNode(producer);edges.push({from:materialKey,to:producerKey,kind:'ASSIGNED_STOCK_LOT_PRODUCTION_ORIGIN',materialRowId:material.id,stockId:stock.id,lot:material.assignedLot,quantity:material.requiredQuantity,unit:material.unit,producerQuantity:producer.quantity,producerUnit:producer.unit,provenance:{movementIds:matches.filter(m=>id(m.producerOpId)===producerId).map(m=>m.id),producerOpId:producer.id,stockId:stock.id,articleId:material.articleId,lot:material.assignedLot}});queue.push(producerKey);
  }
 }
 const adjacency=new Map();for(const e of edges)(adjacency.get(e.from)||adjacency.set(e.from,[]).get(e.from)).push(e.to);const cycles=[],visiting=new Set(),visited=new Set();
 const walk=ovKeys.map(key=>({key,trail:[],exit:false}));while(walk.length){const frame=walk.pop(),{key,trail}=frame;if(frame.exit){visiting.delete(key);visited.add(key);continue;}if(visiting.has(key)){cycles.push([...trail.slice(trail.indexOf(key)),key]);continue;}if(visited.has(key))continue;visiting.add(key);walk.push({key,trail,exit:true});for(const next of [...(adjacency.get(key)||[])].reverse())walk.push({key:next,trail:[...trail,key],exit:false});}
 return qualifyChainRelations(snapshot,{schema:1,kind:'AUTHENTIC_PRODUCTION_CHAIN',readAt:snapshot.readAt,selection,selections,nodes:[...nodes.values()],edges,missing,cycles,orderIds:[...expanded].map(k=>k.slice(3)),status:cycles.length?'CYCLE_FOUND':missing.length?'PARTIAL_LINKS_EXPLICIT':'LINKS_VERIFIED',erpWrites:0});
}

export function simulateFifo(snapshot,{orderIds}={}){
 const chain=buildProductionChain(snapshot),orders=index(snapshot.orders,'OP'),materials=index(snapshot.materials,'MATERIAL'),stocks=index(snapshot.stocks,'STOCK');
 const requested=[...new Set((orderIds||chain.orderIds).map(id))],selected=requested.filter(k=>orders.get(k)?.simulationEligible===true),issues=[],exclusions=[],allocations=[],shortages=[],residual=new Map(),demands=[],blockedMaterials=new Set(),reserved=new Map();
 const qualificationGaps=selected.flatMap(opId=>{const ownerEdges=chain.edges.filter(e=>e.relationshipRole==='OWNER_OV'&&e.to==='OP:'+opId);return ownerEdges.length&&ownerEdges.every(e=>e.verification?.ownerSecondSourceQualified===true)?[]:[{kind:'OWNER_SECOND_SOURCE_NOT_QUALIFIED',opId,authenticOwnerFkPreserved:true}];});
 const result={qualificationGaps,ownerQualified:false,coverageComplete:false,schema:1,kind:'SIMULATION_NOT_ERP_ALLOCATION',readAt:snapshot.readAt,selection:snapshot.selection,selections:snapshot.selections||[snapshot.selection],orderSequence:selected,allocations,issues,issueGroups:[],exclusions,residualStocks:[],shortages,complete:false,erpWrites:0,createsCommitments:false};
 const round=n=>Math.round(n*1e9)/1e9;
 const finish=()=>{const grouped=new Map();for(const i of issues){const m=materials.get(id(i.materialRowId)),s=stocks.get(id(i.stockId)),code=m?.code||s?.code||'',k=i.kind+'|'+code;const g=grouped.get(k)||{kind:i.kind,code,count:0,representativeStockId:i.stockId,representativeMaterialRowId:i.materialRowId};g.count++;grouped.set(k,g);}result.issueGroups=[...grouped.values()];result.residualStocks=[...residual].map(([stockId,quantity])=>({stockId,quantity,unit:stocks.get(stockId).unit,lot:stocks.get(stockId).lot}));result.coverageComplete=issues.length===0&&shortages.length===0;result.hasFutureDemand=demands.length>0;result.ownerQualified=result.hasFutureDemand&&qualificationGaps.length===0&&!chain.verification?.conflicts?.length;result.complete=result.hasFutureDemand&&result.coverageComplete&&result.ownerQualified;result.status=!demands.length?'NO_QUALIFIED_FUTURE_DEMAND':result.complete?'SIMULATION_COMPLETE':'SIMULATION_PARTIAL';return result;};
 if(chain.verification?.conflicts?.length){issues.push({kind:'OP_OWNER_CONTRADICTION',conflicts:chain.verification.conflicts});return finish();}
 if(snapshot.consistency?.verified!==true){issues.push({kind:'COHERENT_SNAPSHOT_NOT_VERIFIED'});return finish();}if(chain.cycles.length){issues.push({kind:'CHAIN_CYCLE'});return finish();}if(snapshot.truncated===true){issues.push({kind:'SOURCE_TRUNCATED'});return finish();}
 for(const opId of requested){const op=orders.get(opId);if(!op)throw Error('UNKNOWN_SELECTED_OP');if(!selected.includes(opId)){const historical=String(op.status||'').toUpperCase()==='C'||op.simulationExcludedReason==='COMPLETED_HISTORICAL_PRODUCTION';exclusions.push({kind:'OP_NOT_NEW_DEMAND',opId,status:op.status,reason:op.simulationExcludedReason});if(!historical)issues.push({kind:'OP_REMAINING_DEMAND_NOT_QUALIFIED',opId});}}
 for(const opId of selected)for(const m of materials.values())if(same(m.opId,opId)){if(m.simulationEligible!==true){if(m.simulationExcludedReason==='DISCHARGED_VERIFIED')exclusions.push({kind:'MATERIAL_ALREADY_DISCHARGED',materialRowId:m.id});else issues.push({kind:'MATERIAL_DEMAND_STATE_NOT_QUALIFIED',materialRowId:m.id});continue;}if(m.requiredQuantity==null||!Number.isFinite(Number(m.requiredQuantity))||Number(m.requiredQuantity)<0||!unit(m.unit)){issues.push({kind:'TOTAL_REQUIREMENT_OR_UNIT_NOT_QUALIFIED',materialRowId:m.id});continue;}demands.push(m);}
 const commitmentRows=new Set();
 if(Array.isArray(snapshot.realCommitments))for(const c of snapshot.realCommitments){if(!Number.isSafeInteger(c.materialRowId)||c.materialRowId<=0||commitmentRows.has(id(c.materialRowId))){issues.push({kind:'REAL_COMMITMENT_ROW_IDENTITY_NOT_VERIFIED',materialRowId:c.materialRowId});return finish();}commitmentRows.add(id(c.materialRowId));}
 const invalidCommitments=Array.isArray(snapshot.realCommitments)?snapshot.realCommitments.filter(c=>c.verified!==true):[];
 const unqualifiedArticles=new Set();
 if(!Array.isArray(snapshot.realCommitments)||(snapshot.realCommitmentsVerified!==true&&!invalidCommitments.length)){issues.push({kind:'REAL_COMMITMENTS_NOT_RECONCILED'});return finish();}
 for(const c of invalidCommitments){
  const s=stocks.get(id(c.stockId));
  if(!Number.isSafeInteger(c.articleId)||c.articleId<=0||!s||!Number.isSafeInteger(s.articleId)||s.articleId<=0){issues.push({kind:'UNBOUND_REAL_COMMITMENT',stockId:c.stockId,materialRowId:c.materialRowId});return finish();}
  unqualifiedArticles.add(id(c.articleId));unqualifiedArticles.add(id(s.articleId));
 }
 for(const articleId of unqualifiedArticles){const s=[...stocks.values()].find(s=>id(s.articleId)===articleId);issues.push({kind:'REAL_COMMITMENT_ARTICLE_NOT_RECONCILED',stockId:s?.id,articleId});}
 for(const m of demands)if(unqualifiedArticles.has(id(m.articleId)))blockedMaterials.add(id(m.id));
 const commitments=snapshot.realCommitments.filter(c=>!unqualifiedArticles.has(id(c.articleId)));
 for(const c of commitments){const s=stocks.get(id(c.stockId)),m=materials.get(id(c.materialRowId));if(!s||c.verified!==true||!same(c.articleId,s.articleId)||!lot(c.lot)||lot(c.lot)!==lot(s.lot)||!unit(c.unit)||unit(c.unit)!==unit(s.unit)||c.quantity==null||!Number.isFinite(Number(c.quantity))||Number(c.quantity)<0){issues.push({kind:'UNBOUND_REAL_COMMITMENT',stockId:c.stockId,materialRowId:c.materialRowId});return finish();}if(selected.includes(id(c.opId))&&(!m||!same(m.opId,c.opId)||!demands.some(d=>same(d.id,c.materialRowId))||!same(m.articleId,c.articleId)||unit(m.unit)!==unit(c.unit)||lot(m.assignedLot)!==lot(c.lot)||!same(m.assignedStockId,c.stockId))){issues.push({kind:'SELECTED_COMMITMENT_MATERIAL_OWNERSHIP_NOT_VERIFIED',stockId:c.stockId,materialRowId:c.materialRowId,opId:c.opId});return finish();}}
 for(const s of stocks.values()){
  if(unqualifiedArticles.has(id(s.articleId))){exclusions.push({kind:'STOCK_ARTICLE_COMMITMENT_UNQUALIFIED',stockId:s.id});continue;}
  if(s.usabilityVerified===true&&s.usable===false){exclusions.push({kind:'STOCK_EXCLUDED',stockId:s.id,reason:s.excludedReason});continue;}
  if(!unit(s.unit)||s.externalCommittedVerified!==true){issues.push({kind:!unit(s.unit)?'STOCK_UNIT_NOT_QUALIFIED':'COMMERCIAL_COMMITMENT_NOT_RECONCILED',stockId:s.id});continue;}
  if([s.quantity,s.realCommittedQuantity,s.externalCommittedQuantity].some(q=>q==null||!Number.isFinite(Number(q))||Number(q)<0)){issues.push({kind:'STOCK_QUANTITY_NOT_QUALIFIED',stockId:s.id});continue;}
  const bound=commitments.filter(c=>same(c.stockId,s.id)),sum=bound.reduce((n,c)=>n+Number(c.quantity),0);if(!qtyEqual(sum,Number(s.realCommittedQuantity))){issues.push({kind:'REAL_COMMITMENT_STOCK_MISMATCH',stockId:s.id});continue;}
  const chosen=bound.filter(c=>selected.includes(id(c.opId))).reduce((n,c)=>n+Number(c.quantity),0),free=Number(s.quantity)-sum-Number(s.externalCommittedQuantity)+chosen;if(free<0){issues.push({kind:'COMMITMENTS_EXCEED_STOCK',stockId:s.id});continue;}residual.set(id(s.id),free);
 }
 // Reconcile ALL selected ERP commitments before any reservation or simulated consumption.
 const selectedStockCommitments=new Map();
 for(const c of commitments)if(selected.includes(id(c.opId)))selectedStockCommitments.set(id(c.stockId),(selectedStockCommitments.get(id(c.stockId))||0)+Number(c.quantity));
 for(const m of demands){
  const owned=commitments.filter(c=>same(c.materialRowId,m.id)&&same(c.opId,m.opId)),total=owned.reduce((n,c)=>n+Number(c.quantity),0);
  for(const c of owned){const s=stocks.get(id(c.stockId)),available=residual.get(id(c.stockId));
   if(!s||s.usabilityVerified!==true||s.usable!==true||!residual.has(id(c.stockId))||total>Number(m.requiredQuantity)+1e-6||(selectedStockCommitments.get(id(c.stockId))||0)>(available||0)+1e-6){
    unqualifiedArticles.add(id(m.articleId));if(s)unqualifiedArticles.add(id(s.articleId));
    issues.push({kind:'SELECTED_EXISTING_ALLOCATION_INCONSISTENT',stockId:c.stockId,materialRowId:m.id,requiredQuantity:m.requiredQuantity,allocationQuantity:Number(c.quantity),qualifiedAvailable:available??null,reason:s?.usabilityVerified!==true?'USABILITY_UNKNOWN':s?.usable!==true?'UNUSABLE':total>Number(m.requiredQuantity)+1e-6?'ALLOCATION_EXCEEDS_TOTAL_DEMAND':'INSUFFICIENT_RESERVED_STOCK_OR_IDENTITY'});
   }
  }
 }
 for(const s of stocks.values())if(unqualifiedArticles.has(id(s.articleId))){residual.delete(id(s.id));exclusions.push({kind:'STOCK_ARTICLE_SELECTED_COMMITMENT_UNQUALIFIED',stockId:s.id});}
 for(const m of demands)if(unqualifiedArticles.has(id(m.articleId)))blockedMaterials.add(id(m.id));
 // FIRST reserve ALL existing selected ERP commitments. Later unassigned OPs must never steal them.
 for(const m of demands){if(blockedMaterials.has(id(m.id)))continue;let total=0;for(const c of commitments.filter(c=>same(c.materialRowId,m.id)&&same(c.opId,m.opId))){const s=stocks.get(id(c.stockId)),q=Number(c.quantity);
   if(!s||s.usabilityVerified!==true||s.usable!==true||!residual.has(id(s.id))||unit(c.unit)!==unit(m.unit)||!same(c.articleId,m.articleId)||total+q>Number(m.requiredQuantity)+1e-6||q>(residual.get(id(s.id))||0)+1e-6){issues.push({kind:'SELECTED_EXISTING_ALLOCATION_INCONSISTENT',stockId:c.stockId,materialRowId:m.id,requiredQuantity:m.requiredQuantity,allocationQuantity:q,qualifiedAvailable:residual.get(id(c.stockId))??null,reason:s?.usabilityVerified!==true?'USABILITY_UNKNOWN':s?.usable!==true?'UNUSABLE':total+q>Number(m.requiredQuantity)+1e-6?'ALLOCATION_EXCEEDS_TOTAL_DEMAND':'INSUFFICIENT_RESERVED_STOCK_OR_IDENTITY'});blockedMaterials.add(id(m.id));break;}
   residual.set(id(s.id),round(residual.get(id(s.id))-q));total=round(total+q);allocations.push({opId:m.opId,materialRowId:m.id,code:m.code,articleId:m.articleId,stockId:s.id,lot:s.lot,quantity:q,unit:m.unit,kind:'EXISTING_REAL_ALLOCATION_PRESERVED',verified:true});
  }reserved.set(id(m.id),total);
 }
 for(const m of demands){if(blockedMaterials.has(id(m.id)))continue;let need=round(Number(m.requiredQuantity)-(reserved.get(id(m.id))||0));if(need<=1e-6)continue;
  const candidates=[...stocks.values()].filter(s=>same(s.articleId,m.articleId)&&unit(s.unit)===unit(m.unit)&&residual.has(id(s.id))&&(residual.get(id(s.id))||0)>0),eligible=[];
  for(const s of candidates){if(s.usabilityVerified!==true){issues.push({kind:'STOCK_USABILITY_NOT_QUALIFIED',stockId:s.id,materialRowId:m.id});continue;}if(s.usable!==true){exclusions.push({kind:'STOCK_EXCLUDED',stockId:s.id,materialRowId:m.id,reason:s.excludedReason});continue;}if(!hasQualifiedFifoOrigin(s)){issues.push({kind:'FIFO_ORIGIN_DATE_NOT_VERIFIED',stockId:s.id,materialRowId:m.id});continue;}eligible.push(s);}
  eligible.sort((a,b)=>a.fifoDate.localeCompare(b.fifoDate)||id(a.id).localeCompare(id(b.id),'en',{numeric:true}));
  for(const s of eligible){if(need<=1e-6)break;const q=Math.min(need,residual.get(id(s.id)));residual.set(id(s.id),round(residual.get(id(s.id))-q));need=round(need-q);allocations.push({opId:m.opId,materialRowId:m.id,code:m.code,articleId:m.articleId,stockId:s.id,lot:s.lot,quantity:q,unit:m.unit,kind:'FIFO_SIMULATION',fifoDate:s.fifoDate,fifoSourceMovementId:s.fifoSourceMovementId,...(s.fifoSourceReference?{fifoSourceReference:s.fifoSourceReference}:{}),verified:false});}
  if(need>1e-6)shortages.push({opId:m.opId,materialRowId:m.id,code:m.code,quantity:need,unit:m.unit,kind:'UNCOVERED_BY_QUALIFIED_AVAILABLE_STOCK'});
 }
 return finish();
}
