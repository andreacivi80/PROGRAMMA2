/* Planning phase by OP unit; production subtype by article code. No requests or writes. */
(() => {
  'use strict';
  const stages=Object.freeze([
    Object.freeze({value:'',label:'Tutte le fasi'}),
    Object.freeze({value:'packing',label:'Confezionamento'}),
    Object.freeze({value:'production',label:'Produzione'}),
    Object.freeze({value:'unverified',label:'Da verificare'})
  ]);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalizeStage=value=>stages.some(stage=>stage.value===value)?value:'';
  function classify(rowOrUnit) {
    const input=rowOrUnit&&typeof rowOrUnit==='object'?rowOrUnit.unit:rowOrUnit;
    const unit=typeof input==='string'?input.trim():'';
    const normalizedUnit=unit.toUpperCase();
    const stage=normalizedUnit==='PZ'?'packing':normalizedUnit==='KG'?'production':'unverified';
    const label=stages.find(entry=>entry.value===stage).label;
    return {stage,label,unit,normalizedUnit,verified:stage!=='unverified',basis:'OP.unit',
      reason:stage==='unverified'?(unit?`UM OP ${unit}: fase da verificare.`:'UM OP mancante: fase da verificare.'):`UM OP ${unit}: ${label.toLowerCase()}.`};
  }
  function filterRows(rows,stage='') {
    const source=Array.isArray(rows)?rows:[],selected=normalizeStage(stage);
    return selected?source.filter(row=>classify(row).stage===selected):source.slice();
  }
  function groupRows(rows) {
    const groups=stages.filter(entry=>entry.value).map(entry=>({stage:entry.value,label:entry.label,rows:[]}));
    for(const row of Array.isArray(rows)?rows:[])groups.find(group=>group.stage===classify(row).stage).rows.push(row);
    return groups.filter(group=>group.rows.length);
  }
  const productionTypes=Object.freeze([
    Object.freeze({type:'medical-device',label:'Medical device · Dispositivi medici'}),
    Object.freeze({type:'cosmetics',label:'Cosmetici'}),
    Object.freeze({type:'active-ingredients',label:'Principi attivi'}),
    Object.freeze({type:'other',label:'Altre produzioni'}),
    Object.freeze({type:'unverified',label:'Tipologia da verificare'})
  ]);
  function classifyProductionType(rowOrCode) {
    const input=rowOrCode&&typeof rowOrCode==='object'?rowOrCode.articleCode:rowOrCode;
    const code=typeof input==='string'?input.trim():typeof input==='number'&&Number.isFinite(input)?String(input):'';
    const numeric=/^\d+$/.test(code)||/^\d{2}\.\d{3}$/.test(code)?Number(code.replace('.','')):NaN;
    const family=String(rowOrCode&&typeof rowOrCode==='object'?rowOrCode.family||'':'').trim().toUpperCase();
    const type=!code?'unverified':numeric>=40000&&numeric<=49999?'medical-device':family.includes('COSMETIC')?'cosmetics':/\bPRINCIP(?:I|IO)\s+ATTIV[IO]\b/.test(family)?'active-ingredients':'other';
    return {...productionTypes.find(entry=>entry.type===type),code};
  }
  function groupProductionRows(rows) {
    const groups=productionTypes.map(entry=>({...entry,rows:[]}));
    for(const row of Array.isArray(rows)?rows:[])groups.find(group=>group.type===classifyProductionType(row).type).rows.push(row);
    return groups.filter(group=>group.rows.length);
  }
  function renderGroups(rows,renderRow) {
    const renderTable=items=>`<div class="scheduletable">${items.map(renderRow).join('')}</div>`;
    return groupRows(rows).map(group=>`<section class="schedulestagegroup schedulestagegroup-${group.stage}" data-schedule-stage="${group.stage}"><header class="schedulestageheading"><h4>${esc(group.label)}</h4><span>${group.rows.length} OP</span></header>${group.stage==='production'?groupProductionRows(group.rows).map(type=>`<section class="scheduleproductiontype scheduleproductiontype-${type.type}" data-production-type="${type.type}"><header class="scheduleproductiontypeheading"><h5>${esc(type.label)}</h5><span>${type.rows.length} OP</span></header>${renderTable(type.rows)}</section>`).join(''):renderTable(group.rows)}</section>`).join('');
  }
  function summarize(rows) {
    const counts={all:0,packing:0,production:0,unverified:0};
    for(const row of Array.isArray(rows)?rows:[]){counts.all++;counts[classify(row).stage]++}
    return counts;
  }
  function renderBadge(rowOrUnit) {
    const result=classify(rowOrUnit);
    return `<span class="schedulephase schedulephase-${result.stage}" data-production-stage="${result.stage}" title="${esc(result.reason)}">${esc(result.label)}</span>`;
  }
  function installStyles(doc) {
    if(doc.getElementById('production-stage-style-1932'))return;
    const style=doc.createElement('style');style.id='production-stage-style-1932';
    style.textContent=`
.schedulestagegroup{margin:9px;border:1px solid #b4cddd;border-radius:9px;overflow:hidden;background:#fff}
.schedulestageheading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;background:#edf4fb;color:#254e72;border-bottom:1px solid #b4cddd}
.schedulestageheading h4{margin:0;font-size:13px;font-weight:900;line-height:1.3}
.schedulestageheading>span{font-size:11px;font-weight:850;white-space:nowrap}
.schedulestagegroup-production{border-color:#cebfdf}.schedulestagegroup-production>.schedulestageheading{background:#f1eafa;color:#614783;border-color:#cebfdf}
.schedulestagegroup-unverified{border-color:#dfcfa5}.schedulestagegroup-unverified>.schedulestageheading{background:#fff8e8;color:#795e23;border-color:#dfcfa5}
.scheduleproductiontype{margin:8px;border:1px solid #d5c6e2;border-radius:7px;overflow:hidden;background:#fff}
.scheduleproductiontypeheading{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px;background:#eee7f6;color:#563b76;border-bottom:1px solid #d5c6e2}
.scheduleproductiontypeheading h5{margin:0;min-width:0;font-size:12px;line-height:1.35;font-weight:900;overflow-wrap:anywhere}
.scheduleproductiontypeheading>span{font-size:11px;font-weight:850;white-space:nowrap}
.scheduleproductiontype-cosmetics>.scheduleproductiontypeheading{background:#f8edf5;color:#74436a}
.scheduleproductiontype-active-ingredients>.scheduleproductiontypeheading{background:#e9f3ee;color:#315d49}
.scheduleproductiontype-other>.scheduleproductiontypeheading{background:#edf0f3;color:#4a5765}
.scheduleproductiontype-unverified>.scheduleproductiontypeheading{background:#fff8e8;color:#795e23}
@media(max-width:600px){.scheduleproductiontype{margin:6px}.scheduleproductiontypeheading h5{font-size:13px}.scheduleproductiontypeheading>span{font-size:12px}}
@media(max-width:600px){.schedulestagegroup{margin:7px}.schedulestageheading{padding:9px 8px}.schedulestageheading h4{font-size:14px}.schedulestageheading>span{font-size:12px}}
.schedulephase{display:inline-block;margin-top:3px;padding:3px 5px;border:1px solid #c3d6d0;border-radius:5px;font-size:10px;font-weight:850;line-height:1.2;white-space:normal}
.schedulephase-packing{background:#edf4fb;color:#315d78;border-color:#b4cddd}
.schedulephase-production{background:#f4effb;color:#614783;border-color:#cebfdf}
.schedulephase-unverified{background:#fff8e8;color:#795e23;border-color:#dfcfa5}
.schedulestagecontrol{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:8px;margin-top:4px;color:#657970;font-size:10px;font-weight:900}
.schedulestagecontrol select{min-width:0;width:100%;height:36px;padding:0 8px;border:1px solid #cbb6d4;border-radius:8px;background:#fff;color:#173e35;font-size:11px}
.shell[data-workspace="schedule"] #planningLookup .schedulerow>strong,.shell[data-workspace="schedule"] #planningLookup .schedulerow>.schedulename,.shell[data-workspace="schedule"] #planningLookup .schedulerow>.schedulename small,.shell[data-workspace="schedule"] #planningLookup .schedulerow>em,.shell[data-workspace="schedule"] #planningLookup .schedulerow .jumpref,.shell[data-workspace="schedule"] #planningLookup .scheduleprint,.shell[data-workspace="schedule"] #planningLookup .schedulefilters label,.shell[data-workspace="schedule"] #planningLookup .scheduledirectresult>p{font-size:10px!important;line-height:1.3!important}
.shell[data-workspace="schedule"] #planningLookup .schedulename{overflow-wrap:anywhere}
@media(max-width:600px){
.shell[data-workspace="schedule"] #planningLookup .schedulerow{grid-template-columns:minmax(0,1fr) auto 20px!important;gap:6px!important}
.shell[data-workspace="schedule"] #planningLookup .schedulerow .scheduleids{grid-column:1/-1!important;grid-row:1;min-width:0}
.shell[data-workspace="schedule"] #planningLookup .schedulerow>strong{grid-column:1!important;grid-row:2;margin-left:0;min-width:0;overflow-wrap:anywhere;font-size:11px!important}
.shell[data-workspace="schedule"] #planningLookup .schedulerow>em{grid-column:2!important;grid-row:2;font-size:11px!important}
.shell[data-workspace="schedule"] #planningLookup .schedulerow>i{grid-column:3!important;grid-row:2}
.shell[data-workspace="schedule"] #planningLookup .schedulerow>.schedulename{grid-column:1/-1!important;grid-row:3;font-size:11px!important}
.shell[data-workspace="schedule"] #planningLookup .schedulerow>.scheduleprint{grid-column:1/-1!important;grid-row:4}
.shell[data-workspace="schedule"] #planningLookup .schedulephase{font-size:11px;max-width:100%;box-sizing:border-box}
}
`;
    doc.head.appendChild(style);
  }
  const attached=new WeakMap();
  function attachFilter(section,onChange=()=>{}) {
    if(!section||!section.ownerDocument)throw new TypeError('Planning section is required.');
    if(attached.has(section))return attached.get(section);
    const doc=section.ownerDocument,existing=section.querySelector('.schedulefilters');
    if(!existing)throw new Error('Existing planning filters are required.');
    installStyles(doc);
    const label=doc.createElement('label');label.id='scheduleStageControl';label.className='schedulestagecontrol';label.textContent='Fase OP';
    const select=doc.createElement('select');select.id='scheduleStageFilter';select.setAttribute('aria-label','Fase del programma di produzione');
    for(const entry of stages){const option=doc.createElement('option');option.value=entry.value;option.textContent=entry.label;select.appendChild(option)}
    label.appendChild(select);existing.insertAdjacentElement('afterend',label);
    const api=Object.freeze({get:()=>normalizeStage(select.value),set:value=>{select.value=normalizeStage(value)},reset:()=>{select.value=''},element:select});
    select.addEventListener('change',()=>onChange(api.get()));
    attached.set(section,api);return api;
  }
  globalThis.TechnicsProductionStage=Object.freeze({classify,filterRows,groupRows,renderGroups,classifyProductionType,groupProductionRows,summarize,renderBadge,normalizeStage,attachFilter,stages});
})();
