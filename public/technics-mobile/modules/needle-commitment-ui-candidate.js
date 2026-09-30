(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const show=value=>esc(value==null||String(value).trim()===''?'—':String(value).trim());
  const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)}`:'—';
  const unique=values=>[...new Set(values.filter(value=>value!=null&&String(value).trim()!==''))];
  const label=status=>status==='green'?'✓ Lotto aghi idoneo per questo OP':status==='red'?'✕ Non utilizzare questo lotto aghi per questo OP':'Da verificare';
  const valid=(detail,item,now=Date.now())=>detail?.schema===1&&detail.status==='verified'&&detail.readOnly===true&&
    detail.articleCode===item?.code&&Array.isArray(detail.groups)&&detail.groups.length<=500&&
    detail.groupCount===detail.groups.length&&Array.isArray(detail.rows)&&detail.rowCount===detail.rows.length&&
    Number.isFinite(Date.parse(detail.readAt))&&now-Date.parse(detail.readAt)<120000&&Date.parse(detail.readAt)-now<30000&&
    detail.groups.every(group=>['green','red','unknown'].includes(group.status)&&Array.isArray(group.rows)&&group.rows.length>0);

  function render(overlay,item){
    const detail=item?.needleCommitmentDetail,verified=valid(detail,item),groups=verified?detail.groups:[];
    overlay.dataset.needle412='true';
    const table=overlay.querySelector('.inventorycommitmentscroll>table'),thead=table.querySelector('thead tr'),tbody=table.querySelector('tbody');
    table.dataset.needleTable='true';
    thead.innerHTML='<th>OP / OV</th><th>Lotto fornitore · IRA · ubicazione</th><th>Scadenza prodotto OP</th><th>Scadenza aghi</th><th>Quantità</th><th>Esito</th>';
    tbody.innerHTML=groups.length?groups.map(group=>{
      const first=group.rows[0],product=unique(group.rows.map(row=>row.productExpiry)),needle=unique(group.rows.map(row=>row.needleExpiry));
      const locations=unique(group.rows.map(row=>row.linkVerified?row.location:null));
      const status=group.status;
      const reason=status==='unknown'?unique(group.rows.map(row=>row.reason)).join('; ')||'Date o esiti discordanti':'';
      const mixed=new Set(group.rows.map(row=>row.status)).size>1;
      const detailRows=group.rows.length>1?`<details class="needle412-rows" ${mixed?'open':''}><summary>Dettaglio ${group.rows.length} righe del lotto fornitore</summary><ul>${group.rows.map(row=>
        `<li data-needle-row-status="${esc(row.status)}"><strong>${label(row.status)}</strong> · IRA ${show(row.internalLot)} · ubicazione ${show(row.location)} · scad. aghi ${date(row.needleExpiry)} · OP ${show(row.op)} · ${show(row.quantity)} ${show(row.unit)}${row.reason?` · ${esc(row.reason)}`:''}</li>`
      ).join('')}</ul></details>`:'';
      return `<tr data-needle-status="${status}"><td data-label="OP / OV"><strong>${show(first.op)}</strong> / ${show(first.ov)}</td>`+
        `<td data-label="Lotto fornitore · IRA · ubicazione"><strong>${show(group.supplierLot)}</strong><small>${show(group.internalLots?.join(', '))} · ${show(locations.join(', '))}</small></td>`+
        `<td data-label="Scadenza prodotto OP">${product.length===1?date(product[0]):'—'}</td>`+
        `<td data-label="Scadenza aghi">${needle.length===1?date(needle[0]):'—'}</td>`+
        `<td data-label="Quantità">${Number.isFinite(group.quantity)?esc(group.quantity.toLocaleString('it-IT')):'—'} ${show(group.unit)}</td>`+
        `<td data-label="Esito" class="needle412-outcome"><strong>${label(status)}</strong>${reason?`<small>${esc(reason)}</small>`:''}${detailRows}</td></tr>`;
    }).join(''):`<tr data-needle-status="unknown"><td colspan="6">Da verificare: ${verified?'nessun impegno aghi collegato.':'dati per OP e lotto aghi non disponibili o non aggiornati.'}</td></tr>`;
    overlay.querySelector('[data-inventory-overdue-only]').hidden=true;
    overlay.querySelector('[data-inventory-commitments-preview]').hidden=true;
    table.querySelector('tfoot').hidden=true;
    overlay.querySelector('[data-inventory-commitments-check]').hidden=true;
    overlay.querySelector('[data-unassigned-panel]')?.remove();
    return {verified,groups:groups.length,green:groups.filter(g=>g.status==='green').length,red:groups.filter(g=>g.status==='red').length,unknown:groups.filter(g=>g.status==='unknown').length};
  }
  globalThis.TechnicsNeedleCandidate=Object.freeze({render,valid});
  if(typeof document==='undefined')return;
  const style=document.createElement('style');style.id='needle-commitment-style-412';style.textContent=`
    #inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table]{table-layout:fixed;width:100%}#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] th,#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] td{white-space:normal!important;overflow-wrap:anywhere;text-align:left!important;vertical-align:top!important;padding:7px 5px!important}
    [data-needle-table] th:nth-child(1){width:12%}[data-needle-table] th:nth-child(2){width:25%}[data-needle-table] th:nth-child(3),[data-needle-table] th:nth-child(4){width:13%}[data-needle-table] th:nth-child(5){width:11%}[data-needle-table] th:nth-child(6){width:26%}
    [data-needle-table] small{display:block;font-size:10px;line-height:1.25;margin-top:3px;color:#536775}
    [data-needle-table] .needle412-rows{margin-top:5px;font-size:10px;color:#394b54}[data-needle-table] .needle412-rows summary{cursor:pointer;font-weight:700}[data-needle-table] .needle412-rows ul{margin:4px 0 0;padding-left:14px}[data-needle-table] .needle412-rows li{margin:3px 0}[data-needle-row-status=red]{color:#af1e24}[data-needle-row-status=unknown]{color:#75520c}
    [data-needle-status=green] .needle412-outcome{color:#096b3e}[data-needle-status=red] .needle412-outcome{color:#af1e24}[data-needle-status=unknown] .needle412-outcome{color:#75520c}
    [data-needle-table] .needle412-outcome strong{font-weight:800}
    @media(max-width:600px){#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table],#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tbody{display:block!important;width:100%!important;table-layout:auto!important}#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] thead{display:none!important}#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tbody tr{display:block!important;width:100%!important;margin:0 0 7px;padding:8px;border:1px solid #d8e3e9;border-radius:8px}#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tbody td{display:block!important;box-sizing:border-box;width:100%!important;min-width:0;border:0!important;white-space:normal!important}#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tbody td:before{content:attr(data-label);display:block;font-size:10px;font-weight:700;color:#536775}#inventoryCommitmentOverlay .inventorycommitmentdialog [data-needle-table] tbody td:nth-child(6){border-top:1px solid #e5ebef!important}}
  `;document.head.append(style);
})();
