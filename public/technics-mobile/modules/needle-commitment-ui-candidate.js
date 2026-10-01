(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const show=value=>esc(value==null||String(value).trim()===''?'—':String(value).trim());
  const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)}`:'—';
  const tableDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?
    `<span>${value.slice(8,10)}/${value.slice(5,7)}/</span><span class="needle-date-year">${value.slice(0,4)}</span>`:'—';
  const unique=values=>[...new Set(values.filter(value=>value!=null&&String(value).trim()!==''))];
  const labels={green:'Lotto aghi verificato: idoneo per questo OP',red:'Lotto aghi verificato: non utilizzare per questo OP',unknown:'Da verificare: dati mancanti o non qualificati'};
  const symbols={green:'✓',red:'✕',unknown:'?'};
  const qualifiedRow=row=>{
    if(row?.linkVerified!==true||!Number.isSafeInteger(row.requirementId)||row.requirementId<=0||!Number.isSafeInteger(row.productionOrderId)||row.productionOrderId<=0||
      !Number.isSafeInteger(row.articleId)||row.articleId<=0||!Number.isSafeInteger(row.stockId)||row.stockId<=0||row.stockArticleId!==row.articleId||
      !row.internalLot||row.internalLot!==row.stockLot||row.location&&row.stockLocation&&row.location!==row.stockLocation||
      row.productExpirySource!=='prodt_ordini.LottoScad'||!['magaubicazioni_articolo.LottoScad','InfoLotto.LottoScad:exact-stock-link'].includes(row.needleExpirySource)||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.productExpiry||'')||!/^\d{4}-\d{2}-\d{2}$/.test(row.needleExpiry||''))return null;
    const actual=row.needleExpiry>row.productExpiry?'green':'red';
    return row.status===actual?actual:null;
  };
  const safeStatus=group=>{
    const statuses=group.rows.map(qualifiedRow);
    if(group.status==='red'&&statuses.includes('red'))return 'red';
    if(group.status==='green'&&statuses.every(s=>s==='green')&&
      new Set(group.rows.map(r=>r.productExpiry)).size===1&&new Set(group.rows.map(r=>r.needleExpiry)).size===1)return 'green';
    return 'unknown';
  };
  const valid=(detail,item,now=Date.now())=>detail?.schema===1&&detail.status==='verified'&&detail.readOnly===true&&
    detail.commitmentStatus==='verified'&&detail.articleCode===item?.code&&Array.isArray(detail.groups)&&detail.groups.length<=500&&
    detail.groupCount===detail.groups.length&&Array.isArray(detail.rows)&&detail.rowCount===detail.rows.length&&
    Number.isFinite(Date.parse(detail.readAt))&&now-Date.parse(detail.readAt)<120000&&Date.parse(detail.readAt)-now<30000&&
    detail.groups.every(group=>['green','red','unknown'].includes(group.status)&&Array.isArray(group.rows)&&group.rows.length>0&&group.rows.every(row=>['green','red','unknown'].includes(row.status)));
  const flag=(status,id)=>`<button type="button" class="needle-inline-flag" data-needle-flag="${status}" aria-label="${esc(labels[status])}. Apri dettagli" aria-controls="${id}" aria-expanded="false"><span>${symbols[status]}</span></button>`;

  function render(overlay,item){
    const detail=item?.needleCommitmentDetail,verified=valid(detail,item),groups=verified?detail.groups:[];
    const realTotal=verified?detail.rows.filter(r=>r.commitmentClass==='real').reduce((s,r)=>s+Number(r.quantity),0):null;
    const theoryTotal=verified?detail.rows.filter(r=>r.commitmentClass==='theoretical').reduce((s,r)=>s+Number(r.quantity),0):null;
    overlay.querySelector('header small').textContent='IMPEGNO REALE / FABBISOGNO TEORICO';
    overlay.dataset.needle412='true';
    const table=overlay.querySelector('.inventorycommitmentscroll>table'),thead=table.querySelector('thead tr'),tbody=table.querySelector('tbody');
    table.dataset.needleTable='true';
    thead.innerHTML='<th>OP</th><th>OV</th><th>Lotto / Ub.</th><th>Scad. OP</th><th>Scad. aghi</th><th>Quantità</th>';
    tbody.innerHTML=groups.length?groups.map((group,index)=>{
      const first=group.rows[0],theoretical=group.rows.every(row=>row.commitmentClass==='theoretical'),product=unique(group.rows.map(row=>row.productExpiry)),needle=unique(group.rows.map(row=>row.needleExpiry));
      const locations=unique(group.rows.map(row=>row.linkVerified?row.location:null));
      const status=safeStatus(group),id=`needle-inline-detail-${index}`;
      const reason=status==='unknown'?unique(group.rows.map(row=>row.reason)).join('; ')||'Collegamento, scadenze o esiti delle righe non coerenti':'';
      const lot=group.supplierLot||group.internalLots?.join(', ');
      const sub=[group.supplierLot?group.internalLots?.join(', '):null,locations.join(', ')].filter(Boolean).join(' · ');
      const details=group.rows.map(row=>`<li>${show(row.internalLot)} · ${show(row.location)} · scad. aghi ${date(row.needleExpiry)} · ${show(row.quantity)} ${show(row.unit)} · ${esc(row.reason||labels[qualifiedRow(row)||'unknown'])}</li>`).join('');
      return `<tr data-needle-status="${status}" data-needle-commitment="${theoretical?'theoretical':'real'}"><td data-label="OP">${show(first.op)}</td>`+
        `<td data-label="OV">${show(first.ov)}</td>`+
        `<td data-label="Lotto / Ub." class="inventorycommitmentlotlayout"><span>${lot?show(lot):'Lotto non <br>assegnato'}</span>${sub?`<small>${show(sub)}</small>`:''}</td>`+
        `<td data-label="Scad. OP">${product.length===1?tableDate(product[0]):'—'}</td>`+
        `<td data-label="Scad. aghi"><span class="needle-expiry-inline"><span class="needle-expiry-value">${needle.length===1?tableDate(needle[0]):'—'}</span>${flag(status,id)}</span></td>`+
        `<td data-label="${theoretical?'Fabbisogno teorico':'Impegnato reale'}"><small class="needle-quantity-kind">${theoretical?'Teorico':'Reale'}</small>${Number.isFinite(group.quantity)?esc(group.quantity.toLocaleString('it-IT')):'—'} ${show(group.unit)}</td></tr>`+
        `<tr id="${id}" class="needle-inline-detail" hidden><td colspan="6"><strong>${esc(labels[status])}</strong>${reason?`<p>${esc(reason)}</p>`:''}<ul>${details}</ul></td></tr>`;
    }).join(''):`<tr data-needle-status="unknown"><td colspan="6">${verified?'Nessun impegno aghi collegato.':'Dati per OP e lotto aghi non disponibili o non aggiornati.'}</td></tr>`;
    if(!table.dataset.needleInlineBound){table.dataset.needleInlineBound='true';table.addEventListener('click',event=>{const button=event.target.closest('[data-needle-flag]');if(!button||!table.contains(button))return;const detailRow=document.getElementById(button.getAttribute('aria-controls'));if(!detailRow)return;detailRow.hidden=!detailRow.hidden;button.setAttribute('aria-expanded',String(!detailRow.hidden))})}
    overlay.querySelector('[data-inventory-overdue-only]').hidden=true;
    overlay.querySelector('[data-inventory-commitments-preview]').hidden=true;
    table.querySelector('tfoot').hidden=true;
    const check=overlay.querySelector('[data-inventory-commitments-check]');check.hidden=false;check.className=verified?'inventorycommitmentok':'inventorycommitmenterror';check.textContent=verified?'Impegnato reale: '+realTotal.toLocaleString('it-IT')+' '+String(item.unit||'')+' · Fabbisogno teorico senza lotto: '+theoryTotal.toLocaleString('it-IT')+' '+String(item.unit||'')+'.':'Impegno reale e fabbisogno teorico non verificati.';
    overlay.querySelector('[data-unassigned-panel]')?.remove();
    return {verified,groups:groups.length,green:groups.filter(g=>safeStatus(g)==='green').length,red:groups.filter(g=>safeStatus(g)==='red').length,unknown:groups.filter(g=>safeStatus(g)==='unknown').length};
  }
  globalThis.TechnicsNeedleCandidate=Object.freeze({render,valid});
  if(typeof document==='undefined')return;
  const style=document.createElement('style');style.id='needle-commitment-inline-style';style.textContent=`
    #inventoryCommitmentOverlay[data-needle412=true] .inventorycommitmentfilter,#inventoryCommitmentOverlay[data-needle412=true] [data-needle-table] tfoot{display:none!important}
    #inventoryCommitmentOverlay[data-needle412=true] .inventorycommitmentscroll{overflow-x:hidden!important}
    #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table]{table-layout:fixed;width:100%;min-width:0}
    #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] th,#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] td{white-space:normal;overflow-wrap:anywhere;text-align:center;vertical-align:middle}
    [data-needle-table] th:nth-child(1){width:15%}[data-needle-table] th:nth-child(2){width:10%}[data-needle-table] th:nth-child(3){width:18%}[data-needle-table] th:nth-child(4){width:16%}[data-needle-table] th:nth-child(5){width:24%}[data-needle-table] th:nth-child(6){width:17%}
    [data-needle-table] .needle-quantity-kind{display:block;font-size:9px;line-height:1.1;margin-bottom:2px}
    [data-needle-table] .inventorycommitmentlotlayout>small{display:block;font-size:9px;line-height:1.2;margin-top:2px}
    [data-needle-table] .needle-expiry-inline{display:flex;align-items:center;justify-content:center;flex-wrap:nowrap;gap:0;min-width:0;white-space:nowrap}
    [data-needle-table] .needle-expiry-value{display:inline-block;min-width:0;white-space:nowrap;font-variant-numeric:tabular-nums;line-height:1.1}
    [data-needle-table] .needle-expiry-value>span{display:block}
    #inventoryCommitmentOverlay [data-needle-table] .needle-inline-flag{display:inline-flex!important;align-items:center;justify-content:center;margin:0!important;padding:0!important;flex:0 0 36px!important;min-width:36px!important;min-height:36px!important;width:36px!important;height:36px!important;border:0!important;background:transparent!important;color:inherit!important;font-size:11px!important;font-weight:800;line-height:1!important;vertical-align:middle;cursor:pointer}
    #inventoryCommitmentOverlay [data-needle-table] .needle-inline-flag>span{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%}
    [data-needle-table] .needle-inline-flag:focus-visible{outline:2px solid #123f87;outline-offset:2px}
    [data-needle-table] .needle-inline-detail td{text-align:left!important;padding:9px 14px!important;background:#f7faf8;font-size:11px;line-height:1.4;white-space:normal!important}
    [data-needle-table] .needle-inline-detail p{margin:4px 0}[data-needle-table] .needle-inline-detail ul{margin:4px 0;padding-left:15px}
    [data-needle-flag=green]>span{background:#def3e6;color:#087444}[data-needle-flag=red]>span{background:#ffe4e2;color:#ad2026}[data-needle-flag=unknown]>span{background:#fff0ce;color:#a66300}
    @media(max-width:600px){
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tr[hidden]{display:none!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table]{display:table!important;width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] thead{display:table-header-group!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tbody{display:table-row-group!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tr{display:table-row!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] th,#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] td{display:table-cell!important;box-sizing:border-box;padding:5px 2px!important;white-space:normal!important;overflow-wrap:anywhere!important;text-align:center!important;vertical-align:middle!important;font-size:10px!important;line-height:1.2!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] td:before{content:none!important}
      #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] .needle-inline-detail td{display:table-cell!important;text-align:left!important;white-space:normal!important;font-size:11px!important;padding:9px 14px!important}
      [data-needle-table] .inventorycommitmentlotlayout>small{font-size:10px!important}
    }
    @media(max-width:350px){#inventoryCommitmentOverlay [data-needle-table] .needle-date-year{display:block}}
  `;document.head.append(style);
})();
