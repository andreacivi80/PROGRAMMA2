// Isolated read-only candidate. Draft and side-effect paths are absent.
(() => {
  'use strict';
  const packing=document.querySelector('.departmentnav [data-workspace="packing"]');
  if(!packing)return;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fmt=value=>Number(value||0).toLocaleString('it-IT',{maximumFractionDigits:3});
  const day=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?`${value.slice(8)}/${value.slice(5,7)}/${value.slice(0,4)}`:'—';
  const nav=document.createElement('button');nav.type='button';nav.className='promoitalia-nav';
  nav.innerHTML='<img src="modules/promitalia-logo.png" alt="">Packaging Promoitalia';
  packing.insertAdjacentElement('afterend',nav);
  const style=document.createElement('style');style.textContent=`
    .departmentnav .promoitalia-nav{display:flex;align-items:center;justify-content:center;gap:5px;min-width:0;overflow-wrap:anywhere;background:#fff8eb;color:#533821;border-color:#dbc8a7}
    .promoitalia-nav img{width:21px;height:21px;object-fit:cover;border-radius:3px;background:#000}
    .promoitalia-shade{position:fixed;z-index:2147482480;inset:0;display:none;padding:8px;background:#0d211ddd}.promoitalia-shade.open{display:block}
    .promoitalia-panel{box-sizing:border-box;display:flex;flex-direction:column;width:min(1500px,100%);height:100%;margin:auto;overflow:hidden;border-radius:13px;background:#f5f7f6;color:#173e35}
    .promoitalia-panel>header{display:flex;align-items:center;gap:12px;padding:9px 12px;background:#fff;border-bottom:1px solid #cbdad4}
    .promoitalia-panel>header img{width:46px;height:46px;object-fit:cover;border-radius:5px;background:#000}
    .promoitalia-panel h2{margin:0;font-size:18px}.promoitalia-panel header p{margin:2px 0 0;font-size:11px;color:#60756e}
    .promoitalia-panel [data-close]{margin-left:auto;flex:0 0 36px;width:36px;height:36px;border:0;border-radius:50%;background:#e4ede8;color:#174d40;font-size:23px}
    .promoitalia-tools{display:flex;align-items:center;gap:9px;padding:9px 12px;background:#fff;border-bottom:1px solid #dce5e0}
    .promoitalia-tools input{box-sizing:border-box;min-width:0;width:min(360px,100%);min-height:39px;padding:7px 9px;border:1px solid #b8cec2;border-radius:7px;font:inherit;font-size:13px}
    .promoitalia-tools small{font-size:11px;color:#587168}.promoitalia-body{min-height:0;overflow:auto;padding:11px}
    .promoitalia-status{margin:0 0 9px;padding:8px 10px;border:1px solid #d9dfce;border-radius:7px;background:#fffbea;font-size:11px}
    .promoitalia-table{width:100%;border-collapse:collapse;background:#fff;font-size:11px}.promoitalia-table th,.promoitalia-table td{padding:7px 5px;border:1px solid #dde5df;text-align:left;vertical-align:top}
    .promoitalia-table th{position:sticky;top:0;background:#e8f0eb;z-index:1}.promoitalia-table td small{display:block;margin-top:3px;color:#60756e}
    .promoitalia-table .short{color:#a82426;font-weight:800}.promoitalia-table details{margin-top:5px}.promoitalia-table summary{cursor:pointer;color:#315d78;font-weight:700}
    .promoitalia-panel>footer{padding:8px 12px;background:#fff;border-top:1px solid #dce5e0;font-size:10px;color:#587168}
    @media(max-width:1100px){.promoitalia-table,.promoitalia-table tbody{display:block}.promoitalia-table thead{display:none}.promoitalia-table tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:0 0 9px;padding:7px;border:1px solid #cbdad4;border-radius:8px;background:white}.promoitalia-table td{display:block;min-width:0;padding:5px;border:0;overflow-wrap:anywhere}.promoitalia-table td::before{content:attr(data-label);display:block;margin-bottom:3px;font-size:10px;font-weight:800;color:#63756f}}
    @media(max-width:600px){.promoitalia-shade{padding:0}.promoitalia-panel{border-radius:0}.promoitalia-panel h2{font-size:15px}.promoitalia-panel>header img{width:36px;height:36px}.promoitalia-tools{display:block}.promoitalia-tools input{width:100%}.promoitalia-tools small{display:block;margin-top:5px}.promoitalia-table tr{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  style.textContent+=`
    .promoitalia-shade.open{display:grid;place-items:center}
    .promoitalia-panel{height:auto;max-height:calc(100svh - 16px)}
    .promoitalia-panel>header{padding:8px 10px}
    .promoitalia-panel>header img{width:32px;height:32px}
    .promoitalia-panel [data-close],.promoitalia-preview [data-preview-close]{box-sizing:border-box;flex:0 0 32px;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:#dce8e2;color:#174d40;font:700 20px/1 Arial,sans-serif;display:grid;place-items:center}
    .promoitalia-tools{gap:7px;padding:7px 10px}.promoitalia-tools button{min-height:36px;padding:0 9px;border:1px solid #c4d8cf;border-radius:8px;background:#fff;color:#174d40;font-weight:850}.promoitalia-readonly{padding:4px 6px;border-radius:6px;background:#eaf5ee;color:#17624d;font-size:9px;font-weight:900;white-space:nowrap}
    .promoitalia-body{flex:0 1 auto;max-height:calc(100svh - 134px);padding:8px;overscroll-behavior:contain}
    .promoitalia-status[hidden]{display:none}
    .promoitalia-preview{position:fixed;z-index:2147482490;inset:0;display:none;place-items:center;padding:9px;background:#10251fe8}.promoitalia-preview.open{display:grid}
    .promoitalia-previewcard{box-sizing:border-box;width:min(1160px,100%);max-height:94svh;display:flex;flex-direction:column;overflow:hidden;border-radius:14px;background:#f0f3f1;color:#173e35;box-shadow:0 18px 70px #0007}
    .promoitalia-previewcard>header{display:flex;align-items:center;gap:8px;padding:9px 10px;background:#edf5f1}.promoitalia-previewcard>header strong{flex:1;font-size:14px}
    .promoitalia-previewbody{overflow:auto;padding:14px}.promoitalia-sheet{box-sizing:border-box;width:1122px;min-height:794px;margin:0 auto;padding:34px;background:#fff;box-shadow:0 4px 18px #0002}.promoitalia-sheethead{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:16px;border-bottom:2px solid #173e35;padding-bottom:10px}.promoitalia-sheethead h3{margin:0;font-size:17px}.promoitalia-sheethead time{font-size:11px;font-weight:700}.promoitalia-previewbody .promoitalia-table th{position:static}.promoitalia-previewcard [data-preview-zoom],.promoitalia-previewcard [data-print]{min-height:32px;border:1px solid #c4d8cf;border-radius:7px;background:#fff;color:#174d40;font-weight:800}
    .promoitalia-table{table-layout:fixed;min-width:780px}.promoitalia-table th,.promoitalia-table td{overflow-wrap:anywhere;text-align:center;vertical-align:top}.promoitalia-table th:nth-child(-n+2),.promoitalia-table td:nth-child(-n+2){text-align:left}.promoitalia-table th:nth-child(1){width:10%}.promoitalia-table th:nth-child(2){width:24%}.promoitalia-table th:nth-child(3){width:14%}.promoitalia-table th:nth-child(4){width:12%}.promoitalia-table th:nth-child(5){width:14%}.promoitalia-table th:nth-child(6){width:12%}.promoitalia-table th:nth-child(7){width:14%}
    .promoitalia-previewcard>header{flex-wrap:wrap}.promoitalia-previewdate{font-size:11px;font-weight:700;color:#567069}
    @media(max-width:1100px){.promoitalia-table{display:table}.promoitalia-table tbody{display:table-row-group}.promoitalia-table thead{display:table-header-group}.promoitalia-table tr{display:table-row;margin:0;padding:0;border:0;border-radius:0;background:transparent}.promoitalia-table td{display:table-cell;min-width:0;padding:7px 5px;border:1px solid #dde5df}.promoitalia-table td::before{display:none}}
    @media(max-width:600px){.promoitalia-shade{padding:0}.promoitalia-panel{max-height:100svh;border-radius:0}.promoitalia-tools{display:flex;flex-wrap:wrap}.promoitalia-tools input{flex:1 1 100%;width:100%}.promoitalia-tools small{flex:1}.promoitalia-preview{padding:0}.promoitalia-previewcard{max-height:100svh;border-radius:0}.promoitalia-previewcard>header{align-items:center}.promoitalia-previewbody{padding:6px}}
    @page{size:A4 landscape;margin:9mm}
    @media print{body>*:not(.promoitalia-preview){display:none!important}html body>.promoitalia-preview.open{position:static!important;inset:auto!important;display:block!important;padding:0!important;background:#fff!important}.promoitalia-previewcard{width:100%!important;max-height:none!important;overflow:visible!important;border-radius:0!important;box-shadow:none!important;background:#fff!important}.promoitalia-previewcard>header{display:none!important}.promoitalia-previewbody{overflow:visible!important;padding:0!important}.promoitalia-sheet{width:auto!important;min-height:0!important;margin:0!important;padding:0!important;box-shadow:none!important;zoom:1!important}.promoitalia-table{min-width:0!important;width:100%!important;font-size:9px!important}.promoitalia-table thead{display:table-header-group!important}.promoitalia-table tr{break-inside:avoid!important}.promoitalia-table th,.promoitalia-table td{padding:4px 3px!important}}
  `;document.head.appendChild(style);
  const shade=document.createElement('div');shade.className='promoitalia-shade';
  shade.innerHTML='<section class="promoitalia-panel" role="dialog" aria-modal="true" aria-label="Packaging Promoitalia"><header><img src="modules/promitalia-logo.png" alt="Logo Promoitalia"><h2>Packaging Promoitalia</h2><button type="button" data-close aria-label="Chiudi">×</button></header><div class="promoitalia-tools"><input type="search" aria-label="Cerca articolo o OV" placeholder="Cerca articolo o OV"><small data-count></small><span class="promoitalia-readonly">Sola lettura</span><button type="button" data-preview disabled>Anteprima di stampa</button></div><div class="promoitalia-body"><p class="promoitalia-status" role="status">Lettura Technics in corso…</p><table class="promoitalia-table"><thead><tr><th>Codice</th><th>Articolo · OV</th><th>Prima consegna richiesta</th><th>Necessari</th><th>Giacenza</th><th>Mancanti</th><th>Proposta calcolata</th></tr></thead><tbody></tbody></table></div></section>';
  document.body.appendChild(shade);
  const preview=document.createElement('div');preview.className='promoitalia-preview';preview.innerHTML='<section class="promoitalia-previewcard" role="dialog" aria-modal="true" aria-label="Anteprima Packaging Promoitalia"><header><strong>Anteprima A4 · Packaging Promoitalia</strong><span class="promoitalia-previewdate"></span><button type="button" data-preview-zoom>Ingrandisci</button><button type="button" data-print>Stampa…</button><button type="button" data-preview-close aria-label="Chiudi">×</button></header><div class="promoitalia-previewbody"><div class="promoitalia-sheet"><div class="promoitalia-sheethead"><h3>Packaging Promoitalia</h3><time></time></div><div data-sheet-table></div></div></div></section>';document.body.appendChild(preview);
  const status=shade.querySelector('.promoitalia-status'),tbody=shade.querySelector('tbody'),search=shade.querySelector('input[type=search]'),count=shade.querySelector('[data-count]');
  let items=[];
  function render(){
    const term=search.value.trim().toLocaleLowerCase('it-IT');
    const visible=items.filter(item=>[item.baseCode,...item.descriptions,...item.ovNumbers].join(' ').toLocaleLowerCase('it-IT').includes(term));
    count.textContent=`${visible.length} articoli`;
    tbody.innerHTML=visible.map(item=>{
      const schedule=`<details><summary>${item.schedule.length} date di consegna richieste</summary>${item.schedule.map(due=>`<p>${day(due.requestedDate)} · necessari ${fmt(due.requiredQuantity)} ${esc(item.unit)} · mancanti ${fmt(due.shortage)} · OV ${esc(due.ovNumbers.join(', '))}</p>`).join('')}</details>`;
      const stocks=item.stockRows.length?`<details><summary>${item.stockRows.length} giacenze positive e alternative</summary>${item.stockRows.map(row=>`<p>${esc(row.code)} · lotto ${esc(row.lot)} · ${esc(row.location)} · ${fmt(row.quantity)} ${esc(item.unit)}</p>`).join('')}</details>`:'';
      return `<tr><td data-label="Codice"><b>${esc(item.baseCode)}</b>${item.needle?'<small>AGHI</small>':''}</td><td data-label="Articolo · OV">${esc(item.descriptions[0])}<small>OV ${esc(item.ovNumbers.join(', '))}</small>${schedule}</td><td data-label="Prima consegna richiesta">${day(item.earliestRequestedDate)}</td><td data-label="Necessari">${fmt(item.requiredQuantity)} ${esc(item.unit)}</td><td data-label="Giacenza">${fmt(item.onHandQuantity)} ${esc(item.unit)}${stocks}</td><td data-label="Mancanti" class="${item.shortage>0?'short':''}">${fmt(item.shortage)} ${esc(item.unit)}</td><td data-label="Proposta calcolata">${item.proposedRequest==null?'—':`${fmt(item.proposedRequest)} ${esc(item.unit)}`}</td></tr>`;
    }).join('');
  }
  async function load(){
    status.hidden=false;status.textContent='Lettura Technics in corso…';tbody.innerHTML='';count.textContent='';shade.querySelector('[data-preview]').disabled=true;
    try{
      const base=String(window.__technicsBridgeUrl||window.TECHNICS_BRIDGE_URL||'').replace(/\/$/,'');
      if(!base||!window.TechnicsDataClient?.fetchJson)throw Error('Servizio dati non configurato.');
      const response=await window.TechnicsDataClient.fetchJson(`${base}/api/packaging/promoitalia/plan`,{cache:'no-store'},{cacheMs:0,message:'Lettura Promoitalia non disponibile.'});
      const plan=response.payload?.plan;
      if(!response.response.ok||response.payload?.ok!==true||plan?.dataAuthority!=='Technics'||plan.readOnly!==true||plan.client?.id!==8785||!Array.isArray(plan.items))throw Error('Fonte Technics non verificata.');
      items=plan.items;status.hidden=true;render();shade.querySelector('[data-preview]').disabled=!items.length;
    }catch(error){items=[];status.textContent=error.message||'Lettura non riuscita.';render()}
  }
  nav.addEventListener('click',()=>{shade.classList.add('open');load()});
  shade.addEventListener('click',event=>{if(event.target===shade||event.target.closest('[data-close]'))shade.classList.remove('open')});
  const sheet=preview.querySelector('.promoitalia-sheet'),zoomButton=preview.querySelector('[data-preview-zoom]');let zoomed=false;
  function fitPreview(){if(!preview.classList.contains('open'))return;const available=preview.querySelector('.promoitalia-previewbody').clientWidth-28;sheet.style.zoom=zoomed?'1':String(Math.min(1,Math.max(.2,available/1122)));zoomButton.textContent=zoomed?'Adatta pagina':'Ingrandisci'}
  shade.querySelector('[data-preview]').addEventListener('click',()=>{if(!items.length)return;const table=shade.querySelector('.promoitalia-table').cloneNode(true);table.querySelectorAll('details').forEach(detail=>{detail.open=true});const when=`Anteprima generata ${new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'2-digit',month:'long',year:'numeric',timeZone:'Europe/Rome'}).format(new Date())}`;preview.querySelector('[data-sheet-table]').replaceChildren(table);preview.querySelector('.promoitalia-previewdate').textContent=when;preview.querySelector('.promoitalia-sheethead time').textContent=when;zoomed=false;preview.classList.add('open');fitPreview()});
  zoomButton.addEventListener('click',()=>{zoomed=!zoomed;fitPreview()});window.addEventListener('resize',fitPreview);
  preview.querySelector('[data-print]').addEventListener('click',()=>{if(preview.classList.contains('open'))window.print()});
  preview.addEventListener('click',event=>{if(event.target===preview||event.target.closest('[data-preview-close]'))preview.classList.remove('open')});
  search.addEventListener('input',render);
})();
