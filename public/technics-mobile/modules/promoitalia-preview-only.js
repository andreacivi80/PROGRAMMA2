// Candidate 426: same public plan selection; server SVG bound to explicit native printer.
(() => {
  'use strict';
  const packing = document.querySelector('.departmentnav [data-workspace="packing"]');
  const snapshotter = window.PromoitaliaWordClient;
  const directPrint = window.TechnicsDirectPrint;
  if (!packing || !snapshotter || !directPrint) return;
  const session = directPrint.createSession();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = item => `${String(item.baseCode).trim()}\u0000${String(item.unit).trim().toUpperCase()}`;
  const qty = value => Number(value).toLocaleString('it-IT', {maximumFractionDigits:3});
  const amount = (value,unit) => `<span class="promo-qty-value">${qty(value)}</span><span class="promo-qty-unit">${esc(unit)}</span>`;
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value.slice(8)}/${value.slice(5,7)}/${value.slice(0,4)}` : '—';
  const compactDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value.slice(8)}.${value.slice(5,7)}.${value.slice(2,4)}` : '—';
  const fullDay = value => new Intl.DateTimeFormat('it-IT', {timeZone:'Europe/Rome',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00Z`));
  const xml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const label = (value,x,y,w,size=25,bold=false,fill='#173e35') => `<text x="${x+w/2}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="${bold?700:400}" fill="${fill}">${xml(value)}</text>`;
  function wrap(value,width,size){
    const limit=Math.max(4,Math.floor((width-14)/(size*0.53))),words=String(value??'').split(/\s+/),lines=[];let line='';
    for(let word of words){if(!word)continue;while(word.length>limit){if(line){lines.push(line);line=''}lines.push(word.slice(0,limit));word=word.slice(limit)}if(!word)continue;if(line&&`${line} ${word}`.length>limit){lines.push(line);line=word}else line=line?`${line} ${word}`:word}
    if(line||!lines.length)lines.push(line);return lines;
  }
  function rowLabel(value,x,top,w,height,size,bold=false,fill='#173e35'){const lines=wrap(value,w,size),step=size*1.16,start=top+height/2-(lines.length-1)*step/2+size*.34;return `<text x="${x+w/2}" y="${start}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="${bold?700:400}" fill="${fill}">${lines.map((line,index)=>`<tspan x="${x+w/2}" dy="${index?step:0}">${xml(line)}</tspan>`).join('')}</text>`}
  const svgPages=(()=>{
const formatStockRows429=(()=>{
const qty=value=>Number(value).toLocaleString('it-IT',{maximumFractionDigits:3});
// One detail line per physical material lot, not one per warehouse position.
// 'prev.' is a document projection, never a write or an ERP assignment.
function formatStockRows429(item){
 const lines=(item.StockRows||[]).map(stock=>{
  const uses=stock.ProductUses||[];
  if(uses.length===1){
   const use=uses[0];
   return `${use.ProductCode} · lotto ${stock.Lot||'—'} · ${qty(use.Pieces)} ${item.Unit}${use.ProjectedPieces>0?' (prev.)':''}${stock.FreePieces>0?` · ${qty(stock.FreePieces)} ${item.Unit} liberi`:''}`;
  }
  if(uses.length>1){
   const products=uses.map(use=>`${use.ProductCode} ${qty(use.Pieces)}`).join(' / ');
   return `${products} · lotto ${stock.Lot||'—'}${uses.some(use=>use.ProjectedPieces>0)?' (prev.)':''}${stock.FreePieces>0?` · ${qty(stock.FreePieces)} liberi`:''}`;
  }
  return `Lotto ${stock.Lot||'—'} · ${qty(stock.Quantity)} ${item.Unit} liberi`;
 });
 if(item.UnidentifiedDemandPieces>0)lines.push(`Prodotto da verificare: ${qty(item.UnidentifiedDemandPieces)} ${item.Unit} richiesti`);
 return lines;
}

return formatStockRows429;
})();

// Seven-column compact sheet; destination evidence never invents a stock-lot link.
const xml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const qty=v=>Number(v).toLocaleString('it-IT',{maximumFractionDigits:3});
const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?`${v.slice(8)}/${v.slice(5,7)}/${v.slice(0,4)}`:'—';
const widths=[230,720,240,1040,240,430,388],left=110,width=3288;
const titles=['Codice','Articolo / OV','Necessari','Giacenza','Mancanti','Pezzi mancanti già per la consegna del','Pz minimi da inviare ad IRA'];
function wrap(value,available,size=25){
 const limit=Math.max(8,Math.floor(available/(size*.57))),words=String(value).split(/\s+/),lines=[];let line='';
 for(const word of words){if(word.length>limit){if(line){lines.push(line);line=''}for(let i=0;i<word.length;i+=limit)lines.push(word.slice(i,i+limit));continue}if((line+' '+word).trim().length>limit){lines.push(line);line=word}else line=(line+' '+word).trim()}
 if(line)lines.push(line);return lines.length?lines:[''];
}
function cells(item){
 const deliveries=item.Deliveries.map(d=>`${date(d.Date)} · ${qty(d.Required)} ${item.Unit} · OV ${d.OV.join(', ')}`);
 const stocks=formatStockRows429(item);
 return [
 [{value:item.Code,bold:true,noWrap:true}],
 [{value:item.Description},...deliveries.map(value=>({value,size:23,fill:'#315d78'}))],
 [{value:`${qty(item.Required)} ${item.Unit}`,noWrap:true}],
 [{value:`${qty(item.Stock)} ${item.Unit}`,noWrap:true},...stocks.map(value=>({value,size:23,fill:'#315d78'}))],
 [{value:`${qty(item.Missing)} ${item.Unit}`,noWrap:true,bold:true,fill:item.Missing>0?'#a82426':'#173e35'}],
 [{value:date(item.FirstShortageDate),noWrap:true,bold:item.Missing>0}],
 [{value:`${qty(item.FinalQuantity)} ${item.Unit}`,noWrap:true,bold:true}]
 ].map((entries,col)=>entries.flatMap(entry=>{const size=entry.size||25;return entry.noWrap?[{...entry,size:Math.min(size,(widths[col]-30)/Math.max(1,String(entry.value).length)/.6)}]:wrap(entry.value,widths[col]-30,size).map(value=>({...entry,value,size}))}));
}
function svgPages(payload){
 if(payload?.documentType!=='PACKAGING_PROMOITALIA'||!Array.isArray(payload.rows)||!payload.rows.length)throw Error('INVALID_DOCUMENT');
 const rows=payload.rows.map(item=>{const content=cells(item),height=Math.max(90,24+Math.max(...content.map(c=>c.reduce((n,e)=>n+e.size*1.35+7,0))));if(height>1950)throw Error('ARTICLE_PAGE_OVERFLOW');return{item,content,height}});
 const pages=[];let page=[],used=0;for(const row of rows){if(used+row.height>1980){pages.push(page);page=[];used=0}page.push(row);used+=row.height}if(page.length)pages.push(page);if(pages.length>64)throw Error('PAGE_LIMIT');
 const text=(value,x,y,size=25,bold=false,fill='#173e35',anchor='start')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${bold?700:400}" fill="${fill}" text-anchor="${anchor}">${xml(value)}</text>`;
 const fullDay=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(payload.documentDate+'T12:00:00Z'));
 return pages.map((rows,index)=>{
  const out=['<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 3508 2480">','<rect width="3508" height="2480" fill="white"/>',text('Pack list Promoitalia',left,140,50,true),text(fullDay,left+width,140,30,true,'#173e35','end'),`<line x1="${left}" y1="185" x2="${left+width}" y2="185" stroke="#173e35" stroke-width="6"/>`];
  let x=left,y=240;titles.forEach((title,i)=>{out.push(`<rect x="${x}" y="${y}" width="${widths[i]}" height="72" fill="#e8f0eb" stroke="#dde5df" stroke-width="3"/>`);const lines=wrap(title,widths[i]-18,21);lines.forEach((line,j)=>out.push(text(line,i<2?x+12:x+widths[i]/2,y+30+j*24,21,true,'#173e35',i<2?'start':'middle')));x+=widths[i]});y+=72;
  for(const row of rows){x=left;for(let col=0;col<7;col++){out.push(`<rect data-code="${xml(row.item.Code)}" data-column="${col}" x="${x}" y="${y}" width="${widths[col]}" height="${row.height}" fill="white" stroke="#dde5df" stroke-width="3"/>`);let baseline=y+36;for(const entry of row.content[col]){out.push(text(entry.value,col<2?x+12:x+widths[col]/2,baseline,entry.size,entry.bold,entry.fill||'#173e35',col<2?'start':'middle'));baseline+=entry.size*1.35+7}x+=widths[col]}y+=row.height}
  out.push(text('Pezzi per prodotto: utilizzo previsto. prev. = lotto materiale da confermare.',left,2355,23,false,'#315d78'),text(`Pagina ${index+1} di ${pages.length}`,left+width,2390,23,false,'#173e35','end'),'</svg>');return out.join('');
 });
}

function renderPromoitaliaPreviewSvgPages({payload}={},{maxPages=64}={}){const svg=svgPages(payload);if(svg.length>maxPages)throw new Error("PAGE_LIMIT");return{pages:svg.map(body=>({body:Buffer.from(body),contentType:"image/svg+xml; charset=utf-8",width:3508,height:2480,vector:true}))}}

return svgPages;
})();
  const style=document.createElement('style');style.textContent=`
    .promo-preview-nav{background:#fff8eb!important;color:#533821!important;border-color:#dbc8a7!important}
    .promo-sim-shade{position:fixed;z-index:2147482480;inset:0;display:none;background:#0d211ddd;padding:8px}.promo-sim-shade.open{display:flex}
    .promo-sim-panel{box-sizing:border-box;display:flex;flex-direction:column;width:min(1400px,100%);height:100%;margin:auto;overflow:hidden;border-radius:13px;background:#f5f7f6;color:#173e35}
    .promo-sim-panel header{display:flex;align-items:center;gap:8px;padding:9px 12px;background:#fff}.promo-sim-panel h2{margin:0;font-size:17px;flex:1}
    .promo-sim-panel button{min-height:35px;border:1px solid #bad1c5;border-radius:7px;background:#fff;color:#174d40;font-weight:800}.promo-sim-panel [data-close],.promo-sim-viewcard [data-view-close]{box-sizing:border-box;flex:0 0 36px;width:36px;min-width:36px;max-width:36px;height:36px;min-height:36px;max-height:36px;padding:0;border-radius:50%;font-size:20px;line-height:1}
    .promo-sim-tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:9px 12px;background:#fff}.promo-sim-tools input{min-width:0;flex:1 1 220px;min-height:37px;border:1px solid #bad1c5;border-radius:7px;padding:5px 8px}
    .promo-sim-tools [data-count]{font-size:11px;color:#486c60}.promo-sim-body{flex:1;overflow:auto;padding:9px}.promo-sim-body table{width:100%;table-layout:fixed;border-collapse:collapse;background:#fff;font-size:12px}.promo-sim-body th,.promo-sim-body td{padding:6px;border:1px solid #dde5df;text-align:center;overflow-wrap:anywhere}.promo-sim-body th:nth-child(2),.promo-sim-body td:nth-child(2){text-align:left}
    .promo-sim-status{font-size:11px;color:#496b5e}.promo-sim-sheetview{display:none;position:fixed;z-index:2147482490;inset:0;background:#10251fe8;padding:8px}.promo-sim-sheetview.open{display:flex}.promo-sim-viewcard{box-sizing:border-box;display:flex;flex-direction:column;width:min(1300px,100%);height:100%;margin:auto;background:#edf3ef;border-radius:12px;overflow:hidden}.promo-sim-viewcard header{display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:8px;background:#fff}.promo-sim-viewcard strong{flex:1}.promo-sim-viewcard button{min-height:33px;border:1px solid #bad1c5;border-radius:7px;background:#fff;color:#174d40;font-weight:800}.promo-sim-pages{overflow:auto;flex:1;padding:12px}.promo-sim-pages img{display:block;width:100%;height:auto;margin:0 auto 12px;background:#fff;box-shadow:0 4px 18px #0003}.promo-sim-pagewrap{margin:0 auto;max-width:1122px}.promo-sim-viewcard small{display:block;padding:7px 10px;background:#fff;color:#496b5e}
    @media(max-width:600px){.promo-sim-shade,.promo-sim-sheetview{padding:0}.promo-sim-panel,.promo-sim-viewcard{border-radius:0}.promo-sim-body table{font-size:9px}.promo-sim-body th,.promo-sim-body td{padding:2px}.promo-sim-body th:nth-child(2){width:25%}.promo-sim-pages{padding:5px}}
  `;document.head.appendChild(style);
  const directStyle=document.createElement('style');directStyle.textContent=`
    .promo-preview-nav{display:flex;align-items:center;justify-content:center;gap:5px;min-width:0}
    .promo-preview-nav img{width:21px;height:21px;object-fit:cover;border-radius:3px;background:#000}
    .promo-sim-panel header img{width:32px;height:32px;object-fit:cover;border-radius:5px;background:#000}
    .promo-printer-targets{display:flex;gap:5px;flex-wrap:wrap}.promo-printer-targets button{min-height:38px;padding:5px 9px;border:1px solid #9abaaa;border-radius:7px;background:#f5faf7;color:#174d40;font-weight:700;white-space:nowrap}.promo-printer-targets button[aria-pressed="true"]{background:#17624d;color:#fff}.promo-zero-toggle{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;white-space:nowrap}.promo-zero-toggle input{width:17px;height:17px;flex:0 0 17px;accent-color:#17624d}
    .promo-sim-tools [data-select-all],.promo-sim-tools [data-select-none]{white-space:nowrap}
    .promo-sim-body table{width:100%;table-layout:fixed;font-size:clamp(9px,2.4vw,12px)}
    .promo-sim-body th,.promo-sim-body td{padding:3px 2px;line-height:1.15}
    .promo-sim-body th:nth-child(1){width:17%}.promo-sim-body th:nth-child(2){width:25%}.promo-sim-body th:nth-child(3){width:17%}
    .promo-sim-body th:nth-child(n+4){width:10.25%}
    .promo-sim-body td:first-child label{display:grid;justify-items:center;gap:1px;min-width:0}
    .promo-sim-body td:first-child label span{display:block;white-space:nowrap;overflow-wrap:normal;word-break:normal;letter-spacing:-.15px}
    .promo-sim-body td:nth-child(3){white-space:nowrap;overflow-wrap:normal;word-break:normal;letter-spacing:-.3px}
    .promo-sim-body .promo-qty-value{display:block;white-space:nowrap;overflow-wrap:normal;word-break:normal;font-family:Arial,sans-serif;letter-spacing:-.45px}
    .promo-sim-body .promo-qty-unit{display:block;white-space:nowrap}
    .promo-sim-body .promo-shortage{color:#b42318;font-weight:800}
    .promo-sim-body .promo-shortage-date{display:block;white-space:nowrap;overflow-wrap:normal;word-break:normal;font-family:Arial,sans-serif;font-size:clamp(7.5px,2.5vw,11px);letter-spacing:-.55px}
    .promo-sim-body th{overflow-wrap:normal;word-break:normal}.promo-sim-body th [data-short]{display:none}
    @media(max-width:600px){.promo-sim-body th:nth-child(n+4){white-space:normal;overflow-wrap:anywhere}.promo-sim-body th [data-full]{display:none}.promo-sim-body th [data-short]{display:inline}}
    .promo-sim-viewcard footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px;background:#fff;color:#173e35}
    .promo-sim-viewcard footer [data-print-status]{flex:1 1 180px;font-size:12px}
  `;document.head.appendChild(directStyle);
  const nav=document.createElement('button');nav.type='button';nav.className='promo-preview-nav';nav.innerHTML='<img src="modules/promitalia-logo.png" alt="">Pack list Promoitalia';packing.insertAdjacentElement('afterend',nav);
  const shade=document.createElement('div');shade.className='promo-sim-shade';shade.innerHTML='<section class="promo-sim-panel" role="dialog" aria-modal="true" aria-label="Pack list Promoitalia"><header><img src="modules/promitalia-logo.png" alt="Logo Promoitalia"><h2>Pack list Promoitalia</h2><button type="button" data-close aria-label="Chiudi">×</button></header><div class="promo-sim-tools"><input type="search" placeholder="Cerca articolo o OV" aria-label="Cerca articolo o OV"><span data-count></span><button type="button" data-select-all>Seleziona tutto</button><button type="button" data-select-none>Deseleziona tutto</button><label class="promo-zero-toggle"><input type="checkbox" data-exclude-zero checked>Escludi quantità finale zero</label><div class="promo-printer-targets" role="group" aria-label="Destinazione stampante"><button type="button" data-printer-target="corridor" aria-pressed="false">🖨 Corridoio</button><button type="button" data-printer-target="warehouse" aria-pressed="false">🖨 Magazzino</button></div><button type="button" data-preview disabled>Anteprima di stampa</button></div><div class="promo-sim-body"><p class="promo-sim-status" role="status"></p><table><thead><tr><th>Includi · codice</th><th>Articolo · OV</th><th aria-label="Necessari"><span data-full>Necessari</span><span data-short>Nec.</span></th><th aria-label="Giacenza"><span data-full>Giacenza</span><span data-short>Giac.</span></th><th aria-label="Mancanti"><span data-full>Mancanti</span><span data-short>Manc.</span></th><th aria-label="Pezzi mancanti già per la consegna del"><span data-full>Pezzi mancanti già per la consegna del</span><span data-short>Data<br>manc.</span></th><th aria-label="Pz minimi da inviare ad IRA"><span data-full>Pz minimi da inviare ad IRA</span><span data-short>Pz IRA</span></th></tr></thead><tbody></tbody></table></div></section>';document.body.append(shade);
  const view=document.createElement('div');view.className='promo-sim-sheetview';view.innerHTML='<section class="promo-sim-viewcard" role="dialog" aria-modal="true" aria-label="Anteprima server Promoitalia"><header><strong>Anteprima · Pack list Promoitalia</strong><span data-pages-count></span><button type="button" data-zoom-out>−</button><button type="button" data-fit>Adatta</button><button type="button" data-zoom-in>+</button><button type="button" data-view-close aria-label="Chiudi">×</button></header><div class="promo-sim-pages"></div><footer><span data-print-target></span><button type="button" data-print-confirm>Conferma e invia alla stampante</button><span data-print-status role="status"></span></footer><small>Invio diretto aziendale: la conferma del server non prova l’uscita fisica del foglio.</small></section>';document.body.append(view);
  const status=shade.querySelector('.promo-sim-status'),tbody=shade.querySelector('tbody'),search=shade.querySelector('input'),count=shade.querySelector('[data-count]');
  let items=[],selected=new Set(),urls=[],zoom=1,requestId=0,loadedDay='',previewRows=new Map(),printerTarget='';
  function clearPages(){urls.forEach(url=>URL.revokeObjectURL(url));urls=[];view.querySelector('.promo-sim-pages').replaceChildren()}
  function fit(){zoom=1;const viewport=view.querySelector('.promo-sim-pages');const width=Math.min(1122,Math.max(280,viewport.clientWidth-24));view.querySelectorAll('.promo-sim-pagewrap').forEach(el=>el.style.width=`${width*zoom}px`)}
  const effectiveKeys=()=>[...selected].filter(itemKey=>{const row=previewRows.get(itemKey);return row&&(!shade.querySelector('[data-exclude-zero]').checked||Number(row.FinalQuantity)!==0)});
  function render(){const term=search.value.trim().toLocaleLowerCase('it-IT');const visible=items.filter(item=>[item.baseCode,...item.descriptions,...item.ovNumbers].join(' ').toLocaleLowerCase('it-IT').includes(term));count.textContent=`${visible.length} articoli · ${selected.size} selezionati · ${effectiveKeys().length} in anteprima`;
    tbody.innerHTML=visible.map(item=>{const row=previewRows.get(key(item));if(!row)return `<tr><td>${esc(item.baseCode)}</td><td>${esc(item.descriptions?.[0]||'')}</td><td colspan="5">Nessuna consegna da oggi in poi · nessuna quantità proposta</td></tr>`;return `<tr><td><label><input type="checkbox" data-index="${items.indexOf(item)}" ${selected.has(key(item))?'checked':''}><span>${esc(item.baseCode)}</span></label></td><td>${esc(row.Description)}<br><small>OV ${esc(row.Deliveries.flatMap(d=>d.OV).filter((ov,i,a)=>a.indexOf(ov)===i).join(', '))}</small></td><td>${amount(row.Required,row.Unit)}</td><td>${amount(row.Stock,row.Unit)}</td><td class="${row.Missing>0?'promo-shortage':''}">${amount(row.Missing,row.Unit)}</td><td>${row.FirstShortageDate?`<span class="promo-shortage-date" aria-label="${date(row.FirstShortageDate)}">${compactDate(row.FirstShortageDate)}</span>`:'—'}</td><td>${amount(row.FinalQuantity,row.Unit)}</td></tr>`}).join('');shade.querySelectorAll('[data-printer-target]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.printerTarget===printerTarget)));shade.querySelector('[data-preview]').disabled=!effectiveKeys().length||!printerTarget}
  async function load(){const current=++requestId;session.invalidate();status.textContent='Lettura Technics in corso…';items=[];selected.clear();previewRows.clear();clearPages();render();try{const base=String(window.__technicsBridgeUrl||window.TECHNICS_BRIDGE_URL||'').replace(/\/$/,'');if(!base||!window.TechnicsDataClient?.fetchJson)throw Error('Servizio dati non configurato.');const response=await window.TechnicsDataClient.fetchJson(`${base}/api/packaging/promoitalia/plan`,{cache:'no-store'},{cacheMs:0,message:'Lettura Promoitalia non disponibile.'});if(current!==requestId)return;const plan=response.payload?.plan;if(!response.response.ok||response.payload?.ok!==true||plan?.dataAuthority!=='Technics'||plan.readOnly!==true||plan.client?.id!==8785||!Array.isArray(plan.items))throw Error('Fonte Technics non verificata.');loadedDay=snapshotter.romeDay();items=plan.items;for(const item of items){try{const row=snapshotter.buildSnapshot(items,new Set([key(item)]),loadedDay).rows[0];previewRows.set(key(item),row)}catch{}}selected=new Set(previewRows.keys());status.textContent=`${previewRows.size} articoli con consegne da oggi · ${items.length-previewRows.size} senza consegne future. Tutti selezionati; gli articoli con quantità finale zero sono esclusi dall’anteprima finché il filtro è attivo.`;render()}catch(error){if(current===requestId){status.textContent=error.message||'Lettura non riuscita.';render()}}}
  nav.addEventListener('click',()=>{shade.classList.add('open');load()});
  shade.addEventListener('click',event=>{if(event.target===shade||event.target.closest('[data-close]')){requestId++;session.invalidate();shade.classList.remove('open');view.classList.remove('open');clearPages()}});
  search.addEventListener('input',render);
  const clearSelectionPreview=()=>{session.invalidate();clearPages();view.classList.remove('open');render()};
  shade.querySelector('[data-select-all]').addEventListener('click',()=>{selected=new Set(previewRows.keys());clearSelectionPreview()});
  shade.querySelector('[data-select-none]').addEventListener('click',()=>{selected.clear();clearSelectionPreview()});
  tbody.addEventListener('change',event=>{const input=event.target.closest('[data-index]');if(!input)return;const item=items[Number(input.dataset.index)];if(!item)return;const itemKey=key(item);input.checked?selected.add(itemKey):selected.delete(itemKey);clearSelectionPreview()});
  shade.querySelector('[data-exclude-zero]').addEventListener('change',clearSelectionPreview);
  shade.querySelectorAll('[data-printer-target]').forEach(button=>button.addEventListener('click',()=>{printerTarget=button.dataset.printerTarget;clearSelectionPreview()}));
  shade.querySelector('[data-preview]').addEventListener('click',async()=>{const button=shade.querySelector('[data-preview]');button.disabled=true;try{if(snapshotter.romeDay()!==loadedDay)throw Error('È cambiato il giorno: ricaricare i dati.');const target=printerTarget;const active=new Set(effectiveKeys());if(!active.size)throw Error('Nessun articolo con quantità finale positiva selezionato.');const selection=items.filter(item=>active.has(key(item))).map(item=>({baseCode:item.baseCode,unit:item.unit}));status.textContent='Generazione anteprima server…';const preview=await session.preview(selection,target);clearPages();const container=view.querySelector('.promo-sim-pages');for(const [index,svg] of preview.pages.entries()){const blob=new Blob([svg],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);urls.push(url);const wrap=document.createElement('div');wrap.className='promo-sim-pagewrap';const img=document.createElement('img');img.src=url;img.alt=`Pagina ${index+1} di ${preview.pages.length}`;wrap.append(img);container.append(wrap)}view.querySelector('[data-pages-count]').textContent=`${preview.pages.length} pagine`;view.querySelector('[data-print-target]').textContent=target==='warehouse'?'Destinazione: Magazzino':'Destinazione: Corridoio';view.querySelector('[data-print-status]').textContent='Controlla il foglio e la destinazione, poi conferma un solo invio.';view.querySelector('[data-print-confirm]').disabled=false;view.classList.add('open');fit();status.textContent='Anteprima server pronta.'}catch(error){status.textContent=error.message||'Anteprima non disponibile.'}finally{render()}});
  view.querySelector('[data-print-confirm]').addEventListener('click',async()=>{const button=view.querySelector('[data-print-confirm]'),message=view.querySelector('[data-print-status]');if(button.disabled)return;button.disabled=true;try{const target=session.snapshot?.printerTarget;if(!target||target!==printerTarget)throw Error('Anteprima non disponibile o destinazione cambiata.');const label=target==='warehouse'?'Magazzino':'Corridoio';session.confirm(target);message.textContent=`Invio alla stampante ${label}…`;const result=await session.print(target);message.textContent=result.state==='accepted'?`Richiesta accettata da ${label}; uscita fisica non confermata.`:result.state==='uncertain'?`Esito incerto su ${label}. Verifica il lavoro prima di qualsiasi nuovo invio.`:`Invio a ${label} non riuscito. Verifica lo stato.`}catch(error){message.textContent=`${error.message||'Esito non verificabile.'} Nessun reinvio automatico.`}});
  view.querySelector('[data-view-close]').addEventListener('click',()=>{view.classList.remove('open');clearPages()});
  view.querySelector('[data-fit]').addEventListener('click',fit);
  for(const [selector,multiplier] of [['[data-zoom-in]',1.2],['[data-zoom-out]',1/1.2]])view.querySelector(selector).addEventListener('click',()=>{zoom=Math.max(0.5,Math.min(2.5,zoom*multiplier));const width=Math.min(1122,Math.max(280,view.querySelector('.promo-sim-pages').clientWidth-24));view.querySelectorAll('.promo-sim-pagewrap').forEach(el=>el.style.width=`${width*zoom}px`)});
  window.PromoitaliaSimulation=Object.freeze({svgPages});
})();
