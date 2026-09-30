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
  const fullDay = value => new Intl.DateTimeFormat('it-IT', {timeZone:'Europe/Rome',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00Z`));
  const xml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const label = (value,x,y,w,size=25,bold=false,fill='#173e35') => `<text x="${x+w/2}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="${bold?700:400}" fill="${fill}">${xml(value)}</text>`;
  function wrap(value,width,size){
    const limit=Math.max(4,Math.floor((width-14)/(size*0.53))),words=String(value??'').split(/\s+/),lines=[];let line='';
    for(let word of words){if(!word)continue;while(word.length>limit){if(line){lines.push(line);line=''}lines.push(word.slice(0,limit));word=word.slice(limit)}if(!word)continue;if(line&&`${line} ${word}`.length>limit){lines.push(line);line=word}else line=line?`${line} ${word}`:word}
    if(line||!lines.length)lines.push(line);return lines;
  }
  function rowLabel(value,x,top,w,height,size,bold=false){const lines=wrap(value,w,size),step=size*1.16,start=top+height/2-(lines.length-1)*step/2+size*.34;return `<text x="${x+w/2}" y="${start}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="${bold?700:400}" fill="#173e35">${lines.map((line,index)=>`<tspan x="${x+w/2}" dy="${index?step:0}">${xml(line)}</tspan>`).join('')}</text>`}
  const heads = ['CODICE','ARTICOLO','OV · CONSEGNE','NECESSARI','GIACENZA','MANCANTI','QUANTITÀ FINALE'];
  const widths = [300,880,500,340,300,300,528], left=80, tableWidth=3148, rowHeight=110;
  function svgPages(payload) {
    if (payload?.documentType !== 'PACKAGING_PROMOITALIA' || !Array.isArray(payload.rows) || !payload.rows.length) throw Error('Documento non valido.');
    const lines = payload.rows.flatMap((item,itemIndex) => {
      const n=Math.max(1,item.Deliveries.length,item.StockRows.length);
      return Array.from({length:n},(_,lineIndex)=>({item,itemIndex,lineIndex,delivery:item.Deliveries[lineIndex],stock:item.StockRows[lineIndex]}));
    });
    const valuesFor=(line,first)=>{const {item,delivery,stock}=line;return [first?item.Code:'',first?item.Description:'',delivery?`${date(delivery.Date)} · OV ${delivery.OV.join(', ')}`:'',first?`${qty(item.Required)} ${item.Unit}`:'',stock?`${stock.Lot} · ${stock.Location} · ${qty(stock.Quantity)}`:(first?`${qty(item.Stock)} ${item.Unit}`:''),first?`${qty(item.Missing)} ${item.Unit}`:'',first?`${qty(item.FinalQuantity)} ${item.Unit}`:'']};
    const prepared=lines.map(line=>{const values=valuesFor(line,true);const maxLines=Math.max(...values.map((value,i)=>wrap(value,widths[i]-6,i===1||i===4?20:24).length));return {...line,height:Math.max(rowHeight,Math.ceil(maxLines*30+26))}});
    const pageLines=[];let group=[],used=0;
    for(const line of prepared){if(group.length&&used+line.height>1980){pageLines.push(group);group=[];used=0}group.push(line);used+=line.height}
    if(group.length)pageLines.push(group);
    const count=pageLines.length;
    if (count>64) throw Error('Documento troppo lungo per l’anteprima.');
    return Array.from({length:count},(_,pageIndex) => {
      const out=['<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 3508 2480">','<rect width="3508" height="2480" fill="white"/>',label('Pack list Promoitalia',left,126,tableWidth,61,true),label(fullDay(payload.documentDate),left,189,tableWidth,33,true)];
      let y=250,x=left;
      heads.forEach((name,i)=>{out.push(`<rect x="${x}" y="${y}" width="${widths[i]}" height="72" fill="#174f45"/>`,label(name,x,y+46,widths[i],24,true,'#fff'));x+=widths[i]});
      y+=72;
      for (const [index,line] of pageLines[pageIndex].entries()) {
        const first=line.lineIndex===0 || index===0;
        out.push(`<rect x="${left}" y="${y}" width="${tableWidth}" height="${line.height}" fill="${line.itemIndex%2?'#f6faf8':'#fff'}" stroke="#c7d7cf" stroke-width="2"/>`);
        const values=valuesFor(line,first);
        x=left;
        values.forEach((value,i)=>{out.push(rowLabel(value,x+3,y,widths[i]-6,line.height,i===1||i===4?20:24,(i===0||i===6)&&first));x+=widths[i];if(i<6)out.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+line.height}" stroke="#c7d7cf" stroke-width="2"/>`)});
        y+=line.height;
      }
      out.push(label(`Pagina ${pageIndex+1} di ${count}`,left,2390,tableWidth,23),'</svg>');
      return out.join('');
    });
  }
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
    .promo-sim-tools select{min-height:37px;padding:5px;border:1px solid #bad1c5;border-radius:7px;background:#fff;color:#174d40}
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
    .promo-sim-body th{overflow-wrap:normal;word-break:normal}.promo-sim-body th [data-short]{display:none}
    @media(max-width:600px){.promo-sim-body th:nth-child(n+4){white-space:nowrap}.promo-sim-body th [data-full]{display:none}.promo-sim-body th [data-short]{display:inline}}
    .promo-sim-viewcard footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px;background:#fff;color:#173e35}
    .promo-sim-viewcard footer [data-print-status]{flex:1 1 180px;font-size:12px}
  `;document.head.appendChild(directStyle);
  const nav=document.createElement('button');nav.type='button';nav.className='promo-preview-nav';nav.innerHTML='<img src="modules/promitalia-logo.png" alt="">Pack list Promoitalia';packing.insertAdjacentElement('afterend',nav);
  const shade=document.createElement('div');shade.className='promo-sim-shade';shade.innerHTML='<section class="promo-sim-panel" role="dialog" aria-modal="true" aria-label="Pack list Promoitalia"><header><img src="modules/promitalia-logo.png" alt="Logo Promoitalia"><h2>Pack list Promoitalia</h2><button type="button" data-close aria-label="Chiudi">×</button></header><div class="promo-sim-tools"><input type="search" placeholder="Cerca articolo o OV" aria-label="Cerca articolo o OV"><span data-count></span><button type="button" data-select-all>Seleziona tutto</button><button type="button" data-select-none>Deseleziona tutto</button><label>Stampante <select data-printer-target aria-label="Destinazione stampante"><option value="">Scegli destinazione</option><option value="corridor">Corridoio</option><option value="warehouse">Magazzino</option></select></label><button type="button" data-preview disabled>Anteprima di stampa</button></div><div class="promo-sim-body"><p class="promo-sim-status" role="status"></p><table><thead><tr><th>Includi · codice</th><th>Articolo · OV</th><th>Consegna</th><th aria-label="Necessari"><span data-full>Necessari</span><span data-short>Nec.</span></th><th aria-label="Giacenza"><span data-full>Giacenza</span><span data-short>Giac.</span></th><th aria-label="Mancanti"><span data-full>Mancanti</span><span data-short>Manc.</span></th><th aria-label="Proposta"><span data-full>Proposta</span><span data-short>Prop.</span></th></tr></thead><tbody></tbody></table></div></section>';document.body.append(shade);
  const view=document.createElement('div');view.className='promo-sim-sheetview';view.innerHTML='<section class="promo-sim-viewcard" role="dialog" aria-modal="true" aria-label="Anteprima server Promoitalia"><header><strong>Anteprima · Pack list Promoitalia</strong><span data-pages-count></span><button type="button" data-zoom-out>−</button><button type="button" data-fit>Adatta</button><button type="button" data-zoom-in>+</button><button type="button" data-view-close aria-label="Chiudi">×</button></header><div class="promo-sim-pages"></div><footer><span data-print-target></span><button type="button" data-print-confirm>Conferma e invia alla stampante</button><span data-print-status role="status"></span></footer><small>Invio diretto aziendale: la conferma del server non prova l’uscita fisica del foglio.</small></section>';document.body.append(view);
  const status=shade.querySelector('.promo-sim-status'),tbody=shade.querySelector('tbody'),search=shade.querySelector('input'),count=shade.querySelector('[data-count]');
  let items=[],selected=new Set(),urls=[],zoom=1,requestId=0,loadedDay='',previewRows=new Map(),armedTarget='';
  function clearPages(){urls.forEach(url=>URL.revokeObjectURL(url));urls=[];view.querySelector('.promo-sim-pages').replaceChildren()}
  function fit(){zoom=1;const viewport=view.querySelector('.promo-sim-pages');const width=Math.min(1122,Math.max(280,viewport.clientWidth-24));view.querySelectorAll('.promo-sim-pagewrap').forEach(el=>el.style.width=`${width*zoom}px`)}
  function render(){const term=search.value.trim().toLocaleLowerCase('it-IT');const visible=items.filter(item=>[item.baseCode,...item.descriptions,...item.ovNumbers].join(' ').toLocaleLowerCase('it-IT').includes(term));count.textContent=`${visible.length} articoli · ${selected.size} selezionati`;
    tbody.innerHTML=visible.map(item=>{const row=previewRows.get(key(item));if(!row)return `<tr><td>${esc(item.baseCode)}</td><td>${esc(item.descriptions?.[0]||'')}</td><td colspan="5">Nessuna consegna da oggi in poi · nessuna quantità proposta</td></tr>`;return `<tr><td><label><input type="checkbox" data-index="${items.indexOf(item)}" ${selected.has(key(item))?'checked':''}><span>${esc(item.baseCode)}</span></label></td><td>${esc(row.Description)}<br><small>OV ${esc(row.Deliveries.flatMap(d=>d.OV).filter((ov,i,a)=>a.indexOf(ov)===i).join(', '))}</small></td><td>${date(row.Deliveries[0].Date)}</td><td>${amount(row.Required,row.Unit)}</td><td>${amount(row.Stock,row.Unit)}</td><td>${amount(row.Missing,row.Unit)}</td><td>${amount(row.FinalQuantity,row.Unit)}</td></tr>`}).join('');shade.querySelector('[data-preview]').disabled=!selected.size||!shade.querySelector('[data-printer-target]').value}
  async function load(){const current=++requestId;session.invalidate();status.textContent='Lettura Technics in corso…';items=[];selected.clear();previewRows.clear();clearPages();render();try{const base=String(window.__technicsBridgeUrl||window.TECHNICS_BRIDGE_URL||'').replace(/\/$/,'');if(!base||!window.TechnicsDataClient?.fetchJson)throw Error('Servizio dati non configurato.');const response=await window.TechnicsDataClient.fetchJson(`${base}/api/packaging/promoitalia/plan`,{cache:'no-store'},{cacheMs:0,message:'Lettura Promoitalia non disponibile.'});if(current!==requestId)return;const plan=response.payload?.plan;if(!response.response.ok||response.payload?.ok!==true||plan?.dataAuthority!=='Technics'||plan.readOnly!==true||plan.client?.id!==8785||!Array.isArray(plan.items))throw Error('Fonte Technics non verificata.');loadedDay=snapshotter.romeDay();items=plan.items;for(const item of items){try{const row=snapshotter.buildSnapshot(items,new Set([key(item)]),loadedDay).rows[0];previewRows.set(key(item),row)}catch{}}status.textContent=`${previewRows.size} articoli con consegne da oggi · ${items.length-previewRows.size} senza consegne future. Scegli i codici e la stampante, poi apri l’anteprima server.`;render()}catch(error){if(current===requestId){status.textContent=error.message||'Lettura non riuscita.';render()}}}
  nav.addEventListener('click',()=>{shade.classList.add('open');load()});
  shade.addEventListener('click',event=>{if(event.target===shade||event.target.closest('[data-close]')){requestId++;armedTarget='';session.invalidate();shade.classList.remove('open');view.classList.remove('open');clearPages()}});
  search.addEventListener('input',render);
  const clearSelectionPreview=()=>{armedTarget='';session.invalidate();clearPages();view.classList.remove('open');render()};
  shade.querySelector('[data-select-all]').addEventListener('click',()=>{selected=new Set(previewRows.keys());clearSelectionPreview()});
  shade.querySelector('[data-select-none]').addEventListener('click',()=>{selected.clear();clearSelectionPreview()});
  tbody.addEventListener('change',event=>{const input=event.target.closest('[data-index]');if(!input)return;const item=items[Number(input.dataset.index)];if(!item)return;const itemKey=key(item);input.checked?selected.add(itemKey):selected.delete(itemKey);armedTarget='';session.invalidate();clearPages();view.classList.remove('open');render()});
  shade.querySelector('[data-printer-target]').addEventListener('change',()=>{armedTarget='';session.invalidate();clearPages();view.classList.remove('open');render()});
  shade.querySelector('[data-preview]').addEventListener('click',async()=>{const button=shade.querySelector('[data-preview]');button.disabled=true;try{if(snapshotter.romeDay()!==loadedDay)throw Error('È cambiato il giorno: ricaricare i dati.');const target=shade.querySelector('[data-printer-target]').value;const selection=items.filter(item=>selected.has(key(item))).map(item=>({baseCode:item.baseCode,unit:item.unit}));status.textContent='Generazione anteprima server…';const preview=await session.preview(selection,target);armedTarget='';clearPages();const container=view.querySelector('.promo-sim-pages');for(const [index,svg] of preview.pages.entries()){const blob=new Blob([svg],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);urls.push(url);const wrap=document.createElement('div');wrap.className='promo-sim-pagewrap';const img=document.createElement('img');img.src=url;img.alt=`Pagina ${index+1} di ${preview.pages.length}`;wrap.append(img);container.append(wrap)}view.querySelector('[data-pages-count]').textContent=`${preview.pages.length} pagine`;view.querySelector('[data-print-target]').textContent=target==='warehouse'?'Destinazione: Magazzino':'Destinazione: Corridoio';view.querySelector('[data-print-status]').textContent='Controlla il foglio e conferma la destinazione prima dell’invio.';view.querySelector('[data-print-confirm]').disabled=false;view.querySelector('[data-print-confirm]').textContent='Conferma e invia alla stampante';view.classList.add('open');fit();status.textContent='Anteprima server pronta.'}catch(error){status.textContent=error.message||'Anteprima non disponibile.'}finally{render()}});
  view.querySelector('[data-print-confirm]').addEventListener('click',async()=>{const button=view.querySelector('[data-print-confirm]'),message=view.querySelector('[data-print-status]');try{const target=session.snapshot?.printerTarget;if(!target)throw Error('Anteprima non disponibile.');const label=target==='warehouse'?'Magazzino':'Corridoio';if(armedTarget!==target){session.confirm(target);armedTarget=target;button.textContent=`Invia a ${label}`;message.textContent=`Conferma ora l’invio a ${label}. La conferma scade tra 10 secondi.`;return}armedTarget='';button.disabled=true;message.textContent=`Invio alla stampante ${label}…`;const result=await session.print(target);message.textContent=result.state==='accepted'?`Richiesta accettata da ${label}; uscita fisica non confermata.`:result.state==='uncertain'?`Esito incerto su ${label}. Verifica il lavoro prima di qualsiasi nuovo invio.`:`Invio a ${label} non riuscito. Verifica lo stato.`}catch(error){armedTarget='';button.disabled=!session.ready();button.textContent='Conferma e invia alla stampante';message.textContent=`${error.message||'Esito non verificabile.'} Nessun reinvio automatico.`}});
  view.querySelector('[data-view-close]').addEventListener('click',()=>{view.classList.remove('open');clearPages()});
  view.querySelector('[data-fit]').addEventListener('click',fit);
  for(const [selector,multiplier] of [['[data-zoom-in]',1.2],['[data-zoom-out]',1/1.2]])view.querySelector(selector).addEventListener('click',()=>{zoom=Math.max(0.5,Math.min(2.5,zoom*multiplier));const width=Math.min(1122,Math.max(280,view.querySelector('.promo-sim-pages').clientWidth-24));view.querySelectorAll('.promo-sim-pagewrap').forEach(el=>el.style.width=`${width*zoom}px`)});
  window.PromoitaliaSimulation=Object.freeze({svgPages});
})();
