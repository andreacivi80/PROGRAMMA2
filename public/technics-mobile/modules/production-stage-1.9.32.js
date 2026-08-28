/* Production planning classification by OP unit only. No requests or writes. */
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
  globalThis.TechnicsProductionStage=Object.freeze({classify,filterRows,summarize,renderBadge,normalizeStage,attachFilter,stages});
})();
