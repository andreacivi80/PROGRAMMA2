/* Read-only child: no application bootstrap, persistent storage or direct HTTP. */
(()=>{
  'use strict';
  const guard=globalThis.TechnicsPackingDetailGuard?.state,status=document.getElementById('detailStatus'),root=document.getElementById('detailRoot');
  const fail=error=>{status.hidden=false;status.textContent=error.message||'Dettaglio non disponibile.';root.hidden=true;if(guard?.ok)guard.notifyError(status.textContent)};
  if(!guard?.active||!guard.ok){fail(new Error('Consultazione isolata non disponibile. Torna alla Packing list.'));return}
  const script=src=>new Promise((resolve,reject)=>{const node=document.createElement('script');node.src=src;node.onload=resolve;node.onerror=()=>reject(Error('Impossibile caricare il visualizzatore.'));document.head.appendChild(node)});
  let loading=false;
  async function render(){
    if(loading)return;loading=true;document.getElementById('detailRefresh').disabled=true;
    try{
      const payload=await guard.requestData({fresh:true});
      if(payload?.ok!==true)throw Error('Dati non confermati dal gestionale.');
      if(guard.target.kind==='inventory'){
        const item=payload.item;
        if(!item||!Array.isArray(item.stocks)||String(item.code).trim().toUpperCase()!==guard.target.value.trim().toUpperCase())throw Error('Il codice restituito non corrisponde al materiale richiesto.');
        globalThis.TechnicsPackingInventoryRenderer.render(item);
      }else{
        if(!payload.result?.verified||payload.result?.ambiguous)throw Error('Dettaglio documento non ancora verificato.');
        const template=document.createElement('template');template.innerHTML=globalThis.TechnicsPackingPlanningRenderer.render(guard.target.kind,payload.result);
        template.content.querySelectorAll('.pickinglifecycle').forEach(node=>node.remove());
        const allowedTags=new Set(['ARTICLE','SECTION','DIV','HEADER','NAV','SPAN','B','STRONG','P','UL','LI','EM','I','SMALL','TIME','BUTTON','LABEL','H3','BR']);
        template.content.querySelectorAll('*').forEach(node=>{
          if(!allowedTags.has(node.tagName)){node.remove();return}
          const width=node.tagName==='I'&&/^\d+(\.\d+)?%$/.test(node.style.width)?node.style.width:'';
          for(const attr of [...node.attributes])if(!['class','title','datetime','aria-label','data-op-state','data-ov-filter'].includes(attr.name))node.removeAttribute(attr.name);
          if(width)node.style.width=width;
          if(node.tagName==='BUTTON'){node.type='button';node.disabled=!['all','open','closed'].includes(node.dataset.ovFilter)}
        });
        document.getElementById('planningResult').replaceChildren(template.content);document.getElementById('planningLookup').hidden=false;document.getElementById('result').hidden=true;
      }
      status.hidden=true;root.hidden=false;guard.notifyReady();
    }catch(error){fail(error)}finally{loading=false;document.getElementById('detailRefresh').disabled=false}
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();guard.notifyClose()}});
  document.getElementById('detailRefresh').addEventListener('click',render);
  document.getElementById('planningResult').addEventListener('click',event=>{
    const button=event.target.closest('[data-ov-filter]');if(!button||button.disabled)return;
    const filter=button.dataset.ovFilter;
    document.querySelectorAll('#planningResult [data-op-state]').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&card.dataset.opState!==filter));
    document.querySelectorAll('#planningResult [data-ov-filter]').forEach(item=>item.classList.toggle('active',item===button));
  });
  document.getElementById('showZero').addEventListener('change',()=>globalThis.TechnicsPackingInventoryRenderer?.refresh());
  document.getElementById('sortStocks').addEventListener('change',()=>globalThis.TechnicsPackingInventoryRenderer?.refresh());
  void(async()=>{try{if(guard.target.kind==='inventory'){await script('modules/inventory-availability-1.9.30.js');await script('modules/packing-inventory-renderer-1.9.32.js')}else{document.querySelector('#detailControls label').hidden=true;await script('modules/packing-planning-renderer-1.9.32.js')}await render()}catch(error){fail(error)}})();
})();
