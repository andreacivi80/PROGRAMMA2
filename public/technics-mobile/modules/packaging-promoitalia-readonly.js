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
  `;document.head.appendChild(style);
  const shade=document.createElement('div');shade.className='promoitalia-shade';
  shade.innerHTML='<section class="promoitalia-panel" role="dialog" aria-modal="true" aria-label="Packaging Promoitalia"><header><img src="modules/promitalia-logo.png" alt="Logo Promoitalia"><div><h2>Packaging Promoitalia</h2><p>Materiali degli OP collegati agli OV Promoitalia</p></div><button type="button" data-close aria-label="Chiudi">×</button></header><div class="promoitalia-tools"><input type="search" aria-label="Cerca articolo, OV o OP" placeholder="Cerca articolo, OV o OP"><small data-count></small></div><div class="promoitalia-body"><p class="promoitalia-status" role="status">Apri per leggere il piano aggiornato.</p><table class="promoitalia-table"><thead><tr><th>Codice</th><th>Articolo · OV / OP</th><th>Prima consegna richiesta</th><th>Necessari</th><th>Giacenza positiva</th><th>Mancanti</th><th>Proposta calcolata</th></tr></thead><tbody></tbody></table></div><footer>Sola lettura. Le modifiche alla proposta e la risposta del cliente non sono ancora abilitate. Nessuna mail o stampa.</footer></section>';
  document.body.appendChild(shade);
  const status=shade.querySelector('.promoitalia-status'),tbody=shade.querySelector('tbody'),search=shade.querySelector('input[type=search]'),count=shade.querySelector('[data-count]');
  let items=[];
  function render(){
    const term=search.value.trim().toLocaleLowerCase('it-IT');
    const visible=items.filter(item=>[item.baseCode,...item.descriptions,...item.ovNumbers,...item.opNumbers].join(' ').toLocaleLowerCase('it-IT').includes(term));
    count.textContent=`${visible.length} articoli · ${items.length} totali`;
    tbody.innerHTML=visible.map(item=>{
      const schedule=`<details><summary>${item.schedule.length} date di consegna richieste</summary>${item.schedule.map(due=>`<p>${day(due.requestedDate)} · necessari ${fmt(due.requiredQuantity)} ${esc(item.unit)} · mancanti ${fmt(due.shortage)} · OV ${esc(due.ovNumbers.join(', '))} · OP ${esc(due.opNumbers.join(', '))}</p>`).join('')}</details>`;
      const stocks=item.stockRows.length?`<details><summary>${item.stockRows.length} giacenze positive e alternative</summary>${item.stockRows.map(row=>`<p>${esc(row.code)} · lotto ${esc(row.lot)} · ${esc(row.location)} · ${fmt(row.quantity)} ${esc(item.unit)}</p>`).join('')}</details>`:'';
      return `<tr><td data-label="Codice"><b>${esc(item.baseCode)}</b>${item.needle?'<small>AGHI</small>':''}</td><td data-label="Articolo · OV / OP">${esc(item.descriptions[0])}<small>OV ${esc(item.ovNumbers.join(', '))} · OP ${esc(item.opNumbers.join(', '))}</small>${schedule}</td><td data-label="Prima consegna richiesta">${day(item.earliestRequestedDate)}</td><td data-label="Necessari">${fmt(item.requiredQuantity)} ${esc(item.unit)}</td><td data-label="Giacenza positiva">${fmt(item.onHandQuantity)} ${esc(item.unit)}${stocks}</td><td data-label="Mancanti" class="${item.shortage>0?'short':''}">${fmt(item.shortage)} ${esc(item.unit)}</td><td data-label="Proposta calcolata">${item.proposedRequest==null?'—':`${fmt(item.proposedRequest)} ${esc(item.unit)}`}</td></tr>`;
    }).join('');
  }
  async function load(){
    status.textContent='Lettura Technics in corso…';tbody.innerHTML='';count.textContent='';
    try{
      const base=String(window.__technicsBridgeUrl||window.TECHNICS_BRIDGE_URL||'').replace(/\/$/,'');
      if(!base||!window.TechnicsDataClient?.fetchJson)throw Error('Servizio dati non configurato.');
      const response=await window.TechnicsDataClient.fetchJson(`${base}/api/packaging/promoitalia/plan`,{cache:'no-store'},{cacheMs:0,message:'Lettura Promoitalia non disponibile.'});
      const plan=response.payload?.plan;
      if(!response.response.ok||response.payload?.ok!==true||plan?.dataAuthority!=='Technics'||plan.readOnly!==true||plan.client?.id!==8785||!Array.isArray(plan.items))throw Error('Fonte Technics non verificata.');
      items=plan.items;status.textContent=`${plan.client.name} · ${items.length} articoli · date OV e giacenza positiva. Proposta calcolata: mancanti + 2.000 Pz, aghi + 3.000 Pz.`;
      render();
    }catch(error){items=[];status.textContent=error.message||'Lettura non riuscita.';render()}
  }
  nav.addEventListener('click',()=>{shade.classList.add('open');load()});
  shade.addEventListener('click',event=>{if(event.target===shade||event.target.closest('[data-close]'))shade.classList.remove('open')});
  search.addEventListener('input',render);
})();
