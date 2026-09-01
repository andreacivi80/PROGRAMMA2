/* Technics availability: unknown never becomes zero; no packing/local deductions. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const format = (value, unit = '') => finite(value) ? `${value.toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}${unit ? ` ${unit}` : ''}` : 'Non disponibile';
  function adaptLegacy(payload,response,url) {
    const item=payload?.item,meta=payload?.meta;
    if(payload?.ok!==true||!item||item.availability||!['article','inventoryLot'].includes(item.lookupType)||!Array.isArray(item.stocks)||!item.stocks.length)return payload;
    let path;try{path=new URL(String(url),'http://localhost').pathname}catch{return payload}
    if(path!=='/api/items/lookup'||meta?.version!=='1.9.28'||meta.source!=='TechnicsBridge'||meta.dataAuthority!=='Technics'||meta.readOnly!==true)return payload;
    const headers=[['requestId','X-Technics-Request-Id'],['nodeId','X-Technics-Node'],['nodeRole','X-Technics-Node-Role'],['version','X-Technics-Version'],['leaseEpoch','X-Technics-Lease-Epoch'],['serverTime','X-Technics-Server-Time']];
    if(!response?.ok||headers.some(([field,header])=>!meta[field]||response.headers?.get?.(header)!==String(meta[field]))||!Number.isFinite(Date.parse(meta.serverTime)))return payload;
    const rows=item.stocks;
    // Legacy Read-Item does not carry each row's unit. Mixed articles cannot be summed safely.
    if(rows.some(row=>row.availability||!finite(row.quantity)||!finite(row.availableQuantity)||!finite(row.committedQuantity)||String(row.itemCode||'').trim()!==String(item.code||'').trim()))return payload;
    const total=rows.reduce((sum,row)=>sum+row.quantity,0);
    if(!finite(item.totalQuantity)||Math.abs(item.totalQuantity-total)>0.000001)return payload;
    const project=row=>({dataAuthority:'Technics',source:'magaubicazioni_articolo',status:'production-only',
      totalQuantity:row.quantity,freeQuantity:row.availableQuantity,committedQuantity:row.quantity-row.availableQuantity,
      productionCommittedQuantity:row.quantity-row.availableQuantity,otherCommittedQuantity:row.committedQuantity,
      unit:item.unit||'',scope:'stock',locationAssigned:!!String(row.location||'').trim(),
      formula:'QtaGiac - QtaImpP',formulaAuthority:'existing-bridge-production-rule',legacyBridgeVersion:'1.9.28',
      sourceFields:{total:'quantity',free:'availableQuantity',production:'quantity - availableQuantity',other:'committedQuantity'},
      reason:'Regola produzione del ponte 1.9.28: disponibilità generale ERP non verificata; QtaImp esclusa e distinta.'});
    const stocks=rows.map(row=>({...row,availability:project(row)}));
    const free=rows.reduce((sum,row)=>sum+row.availableQuantity,0),committed=total-free;
    const summary={...project(rows[0]),scope:'query-result',totalQuantity:total,freeQuantity:free,committedQuantity:committed,productionCommittedQuantity:committed,
      otherCommittedQuantity:rows.reduce((sum,row)=>sum+row.committedQuantity,0),includesZeroAndNegativeStock:true,
      unassignedProductionCommittedQuantity:stocks.filter(row=>!row.availability.locationAssigned).reduce((sum,row)=>sum+row.availability.productionCommittedQuantity,0),
      unassignedOtherCommittedQuantity:stocks.filter(row=>!row.availability.locationAssigned).reduce((sum,row)=>sum+row.availability.otherCommittedQuantity,0)};
    return {...payload,item:{...item,stocks,availability:summary}};
  }
  function installLegacyAdapter() {
    const client=globalThis.TechnicsDataClient;
    if(!client?.fetchJson||client.inventoryLegacyAdapter)return;
    const fetchJson=client.fetchJson;
    globalThis.TechnicsDataClient=Object.freeze({...client,inventoryLegacyAdapter:'1.9.28-production-only',async fetchJson(...args){
      const result=await fetchJson.apply(client,args),payload=adaptLegacy(result?.payload,result?.response,args[0]);
      return payload===result?.payload?result:{...result,payload};
    }});
  }
  function model(source, fallbackTotal, unit = '') {
    const trusted = source?.dataAuthority === 'Technics' && source?.source === 'magaubicazioni_articolo';
    const total = trusted ? source.totalQuantity : fallbackTotal;
    // A historical production rule is not presented as general ERP availability.
    const productionOnly=trusted && source.status==='production-only' && source.formula==='QtaGiac - QtaImpP' && source.formulaAuthority==='existing-bridge-production-rule';
    const split = (productionOnly || trusted && source.status === 'verified') && finite(total) && finite(source.freeQuantity) && finite(source.committedQuantity) && Math.abs(total - source.freeQuantity - source.committedQuantity) < 0.000001;
    return {total, free:split ? source.freeQuantity : null, committed:split ? source.committedQuantity : null,
      productionOnly, unit:trusted ? source.unit ?? unit : unit, reason:source?.reason || (split?'':'Ripartizione libero/impegnato Technics non verificata.'),
      production:trusted ? source.productionCommittedQuantity : null, other:trusted ? source.otherCommittedQuantity : null};
  }
  function fallbackTotal(rows, unit = '') {
    const units=new Set(rows.map(row=>row.unit||unit));
    return units.size>1||rows.some(row=>!finite(row.quantity))?null:rows.reduce((sum,row)=>sum+row.quantity,0);
  }
  function markup(value, summary = false) {
    return [['total','Totale',value.total],['free','Libero',value.free],['committed','Impegnato',value.committed]].map(([key,label,quantity]) =>
      `<span class="inventorybalance-${key}"><small${summary && key === 'total' ? ' id="totallabel"' : ''}>${label}</small><b${summary && key === 'total' ? ' id="total"' : ''}>${esc(format(quantity,value.unit))}</b></span>`).join('');
  }
  function installStyles() {
    if(document.getElementById('inventory-availability-style'))return;
    const style=document.createElement('style');style.id='inventory-availability-style';
    style.textContent=`
#result .total.inventoryavailability{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:0;background:none;border:0;box-shadow:none}
#result .inventoryavailability>span{display:grid;grid-template-rows:minmax(2.4em,auto) auto;align-content:center;align-items:center;gap:3px;min-width:0;padding:7px 5px;border-radius:8px;text-align:center;color:#fff;background:#164f42;font-size:10px}
#result .inventoryavailability>.inventorybalance-free{background:#287257}
#result .inventoryavailability>.inventorybalance-committed{background:#416b40}
#result .inventoryavailability small{font-size:10px;font-weight:750;line-height:1.2;color:inherit;text-align:center;overflow-wrap:anywhere}
#result .inventoryavailability b{font-size:14px;line-height:1.25;overflow-wrap:anywhere;color:inherit;text-align:center;font-variant-numeric:tabular-nums}
#result .stockhead{display:grid;grid-template-columns:minmax(84px,.85fr) minmax(0,2fr);gap:6px;align-items:start}
#result .stockidentity,#result .stockqty{min-width:0}
#result .stockidentity strong,#result .stock dl dd{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;max-width:none}
#result .stock dl dd.inventorylonglot{font-size:8px;line-height:9px;word-break:break-all}
#result .stock dl div:has(.inventorylonglot){padding:4px}
#result .stockqty.inventoryrowbalance{display:grid;grid-column:1/-1;width:100%;box-sizing:border-box;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;text-align:center;max-width:none}
#result .inventoryrowbalance>span{display:grid;grid-template-rows:minmax(2.4em,auto) auto;align-items:center;align-content:center;gap:2px;min-width:0;padding:6px 4px;border-radius:7px;background:#164f42;color:#fff;font-size:10px}
#result .inventoryrowbalance>.inventorybalance-free{background:#287257}
#result .inventoryrowbalance>.inventorybalance-committed{background:#416b40}
#result .inventoryrowbalance small{font-size:10px;line-height:1.2;letter-spacing:0;text-transform:none;text-align:center;overflow-wrap:anywhere;color:inherit}
#result .inventoryrowbalance b{font-size:14px;line-height:1.25;white-space:normal;overflow-wrap:anywhere;text-align:center;font-variant-numeric:tabular-nums;color:inherit}
@media(max-width:420px){#result .inventoryavailability>span{grid-template-rows:minmax(3.6em,auto) auto}}
@media(max-width:360px){#result .inventoryavailability b,#result .inventoryrowbalance b{font-size:12px}}
#result .inventoryavailabilitynote{margin:3px 0 6px;font-size:10px;line-height:1.4;color:#456357}
`;document.head.append(style);
  }
  function apply(item, visibleRows) {
    const host=document.querySelector('#result .total');if(!host||!item)return;
    const all=item.stocks||[],fallback=fallbackTotal(all,item.unit||'');
    const summary=model(item.availability,fallback,item.unit||'');
    host.classList.add('inventoryavailability');host.classList.remove('zerototal');host.innerHTML=markup(summary,true);host.title=summary.reason;
    let note=document.getElementById('inventoryAvailabilityNote');
    if(!note){note=document.createElement('p');note.id='inventoryAvailabilityNote';note.className='inventoryavailabilitynote';host.insertAdjacentElement('afterend',note)}
    note.textContent=summary.reason;
    const roundedMismatch=value=>finite(value.total)&&finite(value.free)&&finite(value.committed)&&Math.round(value.total*100)!==Math.round(value.free*100)+Math.round(value.committed*100);
    if(roundedMismatch(summary)||visibleRows.some(row=>roundedMismatch(model(row.availability,row.quantity,row.unit||item.unit||''))))note.textContent+=' Valori arrotondati a 2 decimali.';
    if(finite(item.availability?.unassignedProductionCommittedQuantity)&&item.availability.unassignedProductionCommittedQuantity!==0){note.textContent+=` Impegni produzione senza layout: ${format(item.availability.unassignedProductionCommittedQuantity,summary.unit)}; non ripartiti.`}
    document.querySelectorAll('#stocks > .stock').forEach((card,index)=>{
      const row=visibleRows[index];if(!row)return;
      const value=model(row.availability,row.quantity,row.unit||item.unit||'');
      const quantity=card.querySelector('.stockqty');if(!quantity)return;
      quantity.classList.add('inventoryrowbalance');quantity.innerHTML=markup(value);
      quantity.title=[value.reason,finite(value.production)?`QtaImpP (produzione): ${format(value.production,value.unit)}`:'',finite(value.other)?`QtaImp: ${format(value.other,value.unit)}`:''].filter(Boolean).join(' · ');
      card.querySelectorAll('dl dd').forEach(cell=>cell.classList.toggle('inventorylonglot',cell.textContent.trim().length>16));
    });
  }
  const api={model,format,markup,apply,adaptLegacy,installLegacyAdapter,fallbackTotal};globalThis.TechnicsInventoryAvailability=api;
  if(typeof document==='undefined')return;
  installLegacyAdapter();
  installStyles();
  // The application invokes apply(item, rows) from its module-scoped renderStocks.
  // Do not depend on global lexical bindings: classic scripts cannot see them.
})();
