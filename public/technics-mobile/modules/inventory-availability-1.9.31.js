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
  function markup(value, summary = false, committedInteractive = false) {
    return [['total','Totale',value.total],['free','Libero',value.free],['committed','Impegnato',value.committed]].map(([key,label,quantity]) => {
      const interactive=summary&&key==='committed'&&committedInteractive;
      const negative=key==='free'&&finite(quantity)&&quantity<0;
      return `<span${interactive?' role="button" tabindex="0" aria-label="Apri dettaglio quantità impegnata" data-inventory-commitments="open"':''}${negative?' aria-label="Attenzione: quantità libera negativa" data-inventory-negative-free="true"':''} class="inventorybalance-${key}${interactive?' inventorycommitmenttrigger':''}${negative?' inventorynegativefree':''}"><small${summary && key === 'total' ? ' id="totallabel"' : ''}>${label}${negative?' <i class="inventorynegativealert" aria-hidden="true">!</i>':''}${interactive?' <i class="inventorycommitmentinfo" aria-hidden="true">i</i>':''}</small><b${summary && key === 'total' ? ' id="total"' : ''}>${esc(format(quantity,value.unit))}</b></span>`;
    }).join('');
  }
  const date=value=>{if(!value)return '—';const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'—':parsed.toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'})};
  const deliveryOverdue=(value,now=new Date())=>{if(!value)return false;const parsed=new Date(value);if(Number.isNaN(parsed.getTime()))return false;const due=new Date(parsed.getFullYear(),parsed.getMonth(),parsed.getDate()),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return due<today};
  function commitmentDialog(){
    let overlay=document.getElementById('inventoryCommitmentOverlay');if(overlay)return overlay;
    overlay=document.createElement('div');overlay.id='inventoryCommitmentOverlay';overlay.className='inventorycommitmentoverlay hidden';overlay.innerHTML='<section class="inventorycommitmentdialog" role="dialog" aria-modal="true" aria-labelledby="inventoryCommitmentTitle"><header><div><small>DETTAGLIO IMPEGNATO</small><h3 id="inventoryCommitmentTitle"></h3></div><button type="button" data-inventory-commitments-close aria-label="Chiudi">×</button></header><label class="inventorycommitmentfilter"><input type="checkbox" data-inventory-overdue-only> Data consegna trascorsa</label><div class="inventorycommitmentscroll"><table><thead><tr><th>OP</th><th>OV</th><th>Data di consegna</th><th>Impegnato</th></tr></thead><tbody></tbody><tfoot><tr class="inventorycommitmentoverduetotal"><th colspan="3">Totale con data di consegna trascorsa</th><th data-inventory-commitments-overdue-total></th></tr><tr><th colspan="3" data-inventory-commitments-total-label>Totale impegnato</th><th data-inventory-commitments-total></th></tr></tfoot></table></div><p data-inventory-commitments-check></p><footer><button type="button" class="inventorycommitmentpreview" data-inventory-commitments-preview>Anteprima / stampa</button></footer></section>';
    const close=()=>overlay.classList.add('hidden');overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('[data-inventory-commitments-close]'))close()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.classList.contains('hidden'))close()});document.body.append(overlay);return overlay;
  }
  const committedPrintJson=async(url,options={})=>{const {response,payload}=await TechnicsDataClient.fetchJson(url,options,{attempts:3,cacheMs:0,message:'Motore stampa materiale impegnato temporaneamente non disponibile.'});if(!response.ok||!payload?.ok)throw Error(payload?.error||'Operazione non disponibile.');return payload};
  const waitCommittedPreview=async id=>{for(let i=0;i<180;i++){const p=await committedPrintJson(globalThis.__technicsBridgeUrl+'/api/packing/print-preview-status?id='+encodeURIComponent(id)+'&fresh='+Date.now(),{cache:'no-store'});if(p.ready)return p;await new Promise(resolve=>setTimeout(resolve,250))}throw Error('Tempo di generazione anteprima superato.')};
  const committedPreviewXml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
  function committedPreviewUrls(item){const detail=item?.commitmentDetail||{},source=Array.isArray(detail.rows)?detail.rows:[];if(!source.length)throw Error('Nessun materiale impegnato da visualizzare.');const perPage=18,pageCount=Math.ceil(source.length/perPage),urls=[];for(let page=0;page<pageCount;page++){const rows=source.slice(page*perPage,(page+1)*perPage),W=2480,H=3508,left=130,width=2220,columns=[300,270,360,570,720];let y=430;const text=(value,x,top,w,size=25,weight=400,fill='#163e35')=>`<text x="${x+w/2}" y="${top}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="middle">${committedPreviewXml(value)}</text>`,out=[`<?xml version="1.0" encoding="UTF-8"?>`,`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>`,text('I.R.A. ISTITUTO RICERCHE APPLICATE S.p.A.',left,130,width,42,700),text('MATERIALE IMPEGNATO',left,235,width,62,700),`<rect x="${left}" y="285" width="${width}" height="100" rx="8" fill="#e7f1ec"/>`,text(`${item.code||''} · ${item.name||item.description||''}`,left+10,350,width-20,31,700)];let x=left;['OP','OV','LOTTO','DATA DI CONSEGNA','IMPEGNATO'].forEach((label,index)=>{out.push(`<rect x="${x}" y="${y}" width="${columns[index]}" height="75" fill="#174f45"/>`,text(label,x,y+48,columns[index],20,700,'#fff'));x+=columns[index]});y+=75;rows.forEach((row,index)=>{const overdue=deliveryOverdue(row.deliveryDate)&&Number(row.quantity)>0,values=[row.op||'—',row.ov||'—',row.lot||'—',date(row.deliveryDate),format(Number(row.quantity),row.unit||detail.unit||item.unit)];x=left;out.push(`<rect x="${left}" y="${y}" width="${width}" height="105" fill="${index%2?'#f7faf8':'#fff'}" stroke="#c7d7cf" stroke-width="2"/>`);values.forEach((value,column)=>{out.push(text(value,x+3,y+65,columns[column]-6,24,column<3?700:400,overdue?'#b42318':'#516e65'));x+=columns[column];if(column<4)out.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+105}" stroke="#c7d7cf" stroke-width="2"/>`)});y+=105});if(page===pageCount-1){const totalY=Math.min(y+30,3200);out.push(`<rect x="${left}" y="${totalY}" width="${width}" height="85" fill="#e7f1ec"/>`,text(`TOTALE IMPEGNATO  ${format(Number(detail.totalQuantity),detail.unit||item.unit)}`,left,totalY+54,width,28,700))}out.push(text(`Pagina ${page+1} di ${pageCount}`,left,3400,width,20,400,'#516e65'),'</svg>');urls.push(URL.createObjectURL(new Blob([out.join('')],{type:'image/svg+xml;charset=utf-8'})))}return urls}
  function committedPrintOverlay(){let overlay=document.getElementById('inventoryCommittedPrintOverlay');if(overlay)return overlay;overlay=document.createElement('div');overlay.id='inventoryCommittedPrintOverlay';overlay.className='inventorycommittedprintoverlay hidden';overlay.innerHTML='<section class="inventorycommittedprintdialog" role="dialog" aria-modal="true"><header><strong>MATERIALE IMPEGNATO</strong><button type="button" data-committed-print-close aria-label="Chiudi">×</button></header><div class="inventorycommittedprintpages"><p>Preparazione anteprima…</p></div><footer><button type="button" data-committed-print-close>Annulla</button><button type="button" data-committed-print-target="corridor">Stampa su Corridoio</button><button type="button" data-committed-print-target="warehouse">Stampa in Magazzino</button></footer></section>';document.body.append(overlay);const close=()=>{overlay.classList.add('hidden');for(const url of overlay._urls||[])URL.revokeObjectURL(url);overlay._urls=[]};overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('[data-committed-print-close]'))close()});return overlay}
  async function openCommittedPrint(item){const overlay=committedPrintOverlay(),pages=overlay.querySelector('.inventorycommittedprintpages'),code=String(item.code||'').trim();overlay.classList.remove('hidden');pages.innerHTML='<p>Preparazione anteprima…</p>';for(const url of overlay._urls||[])URL.revokeObjectURL(url);overlay._urls=[];try{overlay._urls=committedPreviewUrls(item);pages.innerHTML='';overlay._urls.forEach((url,index)=>{const image=document.createElement('img');image.alt='Pagina '+(index+1)+' materiale impegnato '+code;image.src=url;pages.append(image)})}catch(error){pages.innerHTML='<div class="inventorycommittedprinterror">'+esc(error.message)+'</div>'}overlay.querySelectorAll('[data-committed-print-target]').forEach(button=>button.onclick=async()=>{const target=button.dataset.committedPrintTarget,label=target==='warehouse'?'Magazzino':'Corridoio';if(!globalThis.confirm('Inviare il materiale impegnato alla stampante aziendale '+label+'?'))return;for(const sibling of overlay.querySelectorAll('[data-committed-print-target]'))sibling.disabled=true;try{await committedPrintJson(globalThis.__technicsBridgeUrl+'/api/inventory/committed/print',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({code,printerTarget:target,operationId:crypto.randomUUID?.()||String(Date.now())})});pages.innerHTML='<p class="inventorycommittedprintok">STAMPA COMPLETATA ✓ · inviata alla stampante aziendale '+esc(label)+'.</p>'}catch(error){pages.innerHTML='<div class="inventorycommittedprinterror">'+esc(error.message)+'</div>'}finally{for(const sibling of overlay.querySelectorAll('[data-committed-print-target]'))sibling.disabled=false}})}
  function openCommitments(item,summary){
    const detail=item.commitmentDetail||{},rows=Array.isArray(detail.rows)?detail.rows:[],overlay=commitmentDialog();
    overlay.querySelector('h3').textContent=`${item.code||''} · ${item.name||item.description||''}`;
    const overdueRows=rows.filter(row=>deliveryOverdue(row.deliveryDate)&&Number(row.quantity)>0),flag=overlay.querySelector('[data-inventory-overdue-only]'),tbody=overlay.querySelector('tbody');
    const render=()=>{const visible=flag.checked?overdueRows:rows;tbody.innerHTML=visible.map(row=>`<tr${deliveryOverdue(row.deliveryDate)&&Number(row.quantity)>0?' class="inventorycommitmentoverdue" data-delivery-overdue="true"':''}><td>${esc(row.op||'—')}</td><td>${esc(row.ov||'—')}</td><td>${esc(date(row.deliveryDate))}</td><td>${esc(format(Number(row.quantity),row.unit||summary.unit))}</td></tr>`).join('')};
    flag.checked=false;flag.onchange=render;render();
    const overdueTotal=overdueRows.reduce((sum,row)=>sum+Number(row.quantity||0),0);overlay.querySelector('[data-inventory-commitments-overdue-total]').textContent=format(overdueTotal,detail.unit||summary.unit);
    overlay.querySelector('[data-inventory-commitments-total]').textContent=format(Number(detail.totalQuantity),detail.unit||summary.unit);
    const totalLabel=overlay.querySelector('[data-inventory-commitments-total-label]');totalLabel.innerHTML=detail.matchesInventory?'Totale impegnato <span class="inventorycommitmentverified">✓ Somma verificata</span>':'Totale impegnato <span class="inventorycommitmentunverified">⚠ Da verificare</span>';const check=overlay.querySelector('[data-inventory-commitments-check]');check.hidden=true;check.textContent='';
    const preview=overlay.querySelector('[data-inventory-commitments-preview]');if(preview)preview.onclick=()=>openCommittedPrint(item);overlay.classList.remove('hidden');overlay.querySelector('[data-inventory-commitments-close]').focus({preventScroll:true});
  }
  function installStyles() {
    if(document.getElementById('inventory-availability-style'))return;
    const style=document.createElement('style');style.id='inventory-availability-style';
    style.textContent=`
#result .total.inventoryavailability{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:0;background:none;border:0;box-shadow:none}
#result .inventoryavailability>span{display:grid;grid-template-rows:minmax(2.4em,auto) auto;align-content:center;align-items:center;gap:3px;min-width:0;padding:7px 5px;border-radius:8px;text-align:center;color:#fff;background:#164f42;font-size:10px}
#result .inventoryavailability>.inventorybalance-free{background:#287257}
#result .inventoryavailability>.inventorybalance-committed{background:#416b40}
#result .inventoryavailability>.inventorynegativefree,#result .inventoryrowbalance>.inventorynegativefree{background:#b42318!important;color:#fff;box-shadow:inset 0 0 0 2px #7a150d}
#result .inventorynegativefree b{color:#fff;font-weight:950}
#result .inventorynegativealert{display:inline-grid;place-items:center;width:13px;height:13px;margin-left:3px;border-radius:50%;background:#fff;color:#b42318;font:950 10px/13px Arial,sans-serif;font-style:normal;vertical-align:middle}
#result .inventorycommitmenttrigger{cursor:pointer}
#result .inventorycommitmenttrigger:focus-visible{outline:2px solid #fff;outline-offset:-3px}
#result .inventorycommitmenttrigger:active{transform:scale(.98)}
#result .inventorycommitmentinfo{display:inline-grid;place-items:center;width:14px;height:14px;min-width:14px;min-height:14px;margin-left:4px;border:1.5px solid currentColor;border-radius:50%;box-sizing:border-box;font:800 9px/1 Arial,sans-serif;font-style:normal;vertical-align:middle}
.inventorycommitmentoverlay{position:fixed;inset:0;z-index:2147483000;background:rgba(4,25,20,.62);display:grid;place-items:center;padding:14px}
.inventorycommitmentoverlay.hidden{display:none!important}.inventorycommitmentdialog{width:min(720px,100%);max-height:min(82vh,760px);display:flex;flex-direction:column;background:#fff;border-radius:14px;box-shadow:0 18px 54px rgba(0,0,0,.3);overflow:hidden;color:#173c32}
.inventorycommitmentdialog header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:#164f42;color:#fff}.inventorycommitmentdialog header small{font-size:10px;font-weight:800}.inventorycommitmentdialog h3{margin:2px 0 0;font-size:15px;line-height:1.25}.inventorycommitmentdialog header button{display:grid;place-items:center;width:34px;height:34px;min-width:34px;min-height:34px;max-width:34px;max-height:34px;aspect-ratio:1/1;padding:0;border:0;border-radius:999px;box-sizing:border-box;background:#fff;color:#164f42;font:700 23px/1 Arial,sans-serif;flex:0 0 34px}
.inventorycommitmentscroll{overflow:auto;overscroll-behavior:contain}.inventorycommitmentdialog table{width:100%;border-collapse:collapse;font-size:12px}.inventorycommitmentdialog th,.inventorycommitmentdialog td{padding:9px 7px;border-bottom:1px solid #d9e5df;text-align:left;vertical-align:middle;white-space:nowrap}.inventorycommitmentdialog th:nth-child(3),.inventorycommitmentdialog td:nth-child(3){text-align:center;vertical-align:middle}.inventorycommitmentdialog th:last-child,.inventorycommitmentdialog td:last-child{text-align:right;font-variant-numeric:tabular-nums;padding-right:16px}.inventorycommitmentfilter{display:flex;align-items:center;gap:5px;margin:0;padding:5px 14px;background:#f4f7f6;font-size:10px;font-weight:750;line-height:1.2}.inventorycommitmentfilter input{width:14px;height:14px;margin:0;accent-color:#b42318}.inventorycommitmentdialog tr.inventorycommitmentoverdue td{font-style:italic;color:#b42318;font-weight:750}.inventorycommitmentdialog tr.inventorycommitmentoverduetotal th{color:#b42318;font-style:italic}.inventorycommitmentverified{display:inline-block;margin-left:4px;color:#177245;font-size:9px}.inventorycommitmentunverified{display:inline-block;margin-left:4px;color:#b42318;font-size:9px}.inventorycommitmentdialog thead{position:sticky;top:0;background:#eaf3ef}.inventorycommitmentdialog tfoot{position:sticky;bottom:0;background:#dcece5}.inventorycommitmentdialog>p{margin:0;padding:7px 14px;font-size:10px;line-height:1.25;font-weight:750}.inventorycommitmentok{background:#e2f3e9;color:#17613f}.inventorycommitmenterror{background:#fee9e7;color:#9c2019}
.inventorycommitmentdialog>footer{display:flex;justify-content:flex-end;padding:8px 12px;background:#f3f7f5}.inventorycommitmentpreview{min-height:32px;padding:6px 12px;border:0;border-radius:8px;background:#164f42;color:#fff;font:800 11px Arial,sans-serif}.inventorycommittedprintoverlay{position:fixed;inset:0;z-index:2147483200;display:grid;place-items:center;padding:12px;background:rgba(4,25,20,.68)}.inventorycommittedprintoverlay.hidden{display:none!important}.inventorycommittedprintdialog{display:flex;flex-direction:column;width:min(920px,100%);height:min(94vh,920px);overflow:hidden;border-radius:14px;background:#fff;color:#173c32}.inventorycommittedprintdialog header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#164f42;color:#fff}.inventorycommittedprintdialog header button{display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:#fff;color:#164f42;font:700 22px/1 Arial}.inventorycommittedprintpages{flex:1;overflow:auto;padding:10px;background:#dfe8e4}.inventorycommittedprintpages img{display:block;width:min(100%,760px);height:auto;margin:0 auto 10px;background:#fff;box-shadow:0 2px 10px #87968f}.inventorycommittedprintdialog footer{display:flex;justify-content:flex-end;gap:6px;padding:9px;background:#fff}.inventorycommittedprintdialog footer button{min-height:34px;padding:7px 10px;border:1px solid #164f42;border-radius:8px;background:#fff;color:#164f42;font:800 11px Arial}.inventorycommittedprintdialog footer [data-committed-print-target]{background:#164f42;color:#fff}.inventorycommittedprinterror{padding:12px;border-radius:8px;background:#fee9e7;color:#9c2019;font-weight:800}.inventorycommittedprintok{padding:14px;border-radius:8px;background:#e2f3e9;color:#17613f;font-weight:800}@media(max-width:480px){.inventorycommittedprintoverlay{padding:4px}.inventorycommittedprintdialog{height:97vh}.inventorycommittedprintdialog footer{display:grid;grid-template-columns:1fr 1fr}.inventorycommittedprintdialog footer button:first-child{grid-column:1/-1}}
@media(max-width:420px){.inventorycommitmentoverlay{padding:7px}.inventorycommitmentdialog{max-height:88vh}.inventorycommitmentdialog th,.inventorycommitmentdialog td{padding:8px 5px;font-size:11px}}
#result .inventoryavailability small{font-size:10px;font-weight:750;line-height:1.2;color:inherit;text-align:center;overflow-wrap:anywhere}
#result .inventoryavailability b{font-size:14px;line-height:1.25;overflow-wrap:anywhere;color:inherit;text-align:center;font-variant-numeric:tabular-nums}
#result .stockhead{display:grid;grid-template-columns:minmax(84px,.85fr) minmax(0,2fr);gap:6px;align-items:start}
#result .stockidentity,#result .stockqty{min-width:0}
#result .stockidentity strong{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;max-width:none}
#result .locationbox strong,#result .stock dl dd{display:block;max-width:100%;white-space:nowrap!important;overflow:visible;text-overflow:clip;overflow-wrap:normal!important;word-break:normal!important}
#result .stock dl dd.inventorylonglot{font-size:7px!important;line-height:1.15;letter-spacing:-.055em;white-space:nowrap!important;overflow:visible;word-break:normal!important}
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
    host.classList.add('inventoryavailability');host.classList.remove('zerototal');const commitmentReady=Array.isArray(item.commitmentDetail?.rows)&&item.commitmentDetail.rows.length>0&&finite(summary.committed)&&summary.committed>0;host.innerHTML=markup(summary,true,commitmentReady);host.removeAttribute('title');const commitmentButton=host.querySelector('[data-inventory-commitments="open"]');if(commitmentButton){const open=()=>openCommitments(item,summary);commitmentButton.addEventListener('click',open);commitmentButton.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}})}
    let note=document.getElementById('inventoryAvailabilityNote');
    if(!note){note=document.createElement('p');note.id='inventoryAvailabilityNote';note.className='inventoryavailabilitynote';host.insertAdjacentElement('afterend',note)}
    note.textContent='';
    const roundedMismatch=value=>finite(value.total)&&finite(value.free)&&finite(value.committed)&&Math.round(value.total*100)!==Math.round(value.free*100)+Math.round(value.committed*100);
    if(roundedMismatch(summary)||visibleRows.some(row=>roundedMismatch(model(row.availability,row.quantity,row.unit||item.unit||''))))note.textContent+=' Valori arrotondati a 2 decimali.';
    if(finite(item.availability?.unassignedProductionCommittedQuantity)&&item.availability.unassignedProductionCommittedQuantity!==0){note.textContent+=`Impegni produzione senza layout: ${format(item.availability.unassignedProductionCommittedQuantity,summary.unit)}; non ripartiti.`}note.hidden=!note.textContent.trim()
    document.querySelectorAll('#stocks > .stock').forEach((card,index)=>{
      const row=visibleRows[index];if(!row)return;
      const value=model(row.availability,row.quantity,row.unit||item.unit||'');
      const quantity=card.querySelector('.stockqty');if(!quantity)return;
      quantity.classList.add('inventoryrowbalance');quantity.innerHTML=markup(value);
      quantity.removeAttribute('title');
      card.querySelectorAll('dl dd').forEach(cell=>cell.classList.toggle('inventorylonglot',cell.textContent.trim().length>12));
    });
  }
  const api={model,format,markup,apply,adaptLegacy,installLegacyAdapter,fallbackTotal};globalThis.TechnicsInventoryAvailability=api;
  if(typeof document==='undefined')return;
  installLegacyAdapter();
  installStyles();
  // The application invokes apply(item, rows) from its module-scoped renderStocks.
  // Do not depend on global lexical bindings: classic scripts cannot see them.
})();
