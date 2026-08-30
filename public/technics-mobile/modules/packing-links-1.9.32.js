/* Read-only packing detail viewer. Child bootstrap must enforce embedded read-only mode. */
(() => {
  'use strict';
  const kinds=new Set(['inventory','op','ov']);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function normalizeTarget(input) {
    if(!input||!kinds.has(input.kind))throw new Error('Tipo di dettaglio non consentito.');
    const value=typeof input.value==='string'||typeof input.value==='number'?String(input.value).trim():'';
    if(!value||value.length>128||/[\u0000-\u001f\u007f]/.test(value))throw new Error('Codice dettaglio non valido.');
    if(input.kind!=='inventory'&&!/^\d{1,12}$/.test(value))throw new Error('Numero OP/OV non valido.');
    let year=null;
    if(input.kind!=='inventory'){
      year=Number(input.year);
      if(!Number.isInteger(year)||year<1900||year>2100)throw new Error('Anno OP/OV non valido.');
    }
    const target={kind:input.kind,value,year};
    if(input.headerId!==undefined&&input.headerId!==null){
      const raw=String(input.headerId).trim(),headerId=Number(raw);
      if(input.kind!=='ov'||!/^\d+$/.test(raw)||!Number.isSafeInteger(headerId)||headerId<=0)throw new Error('Identificativo testata OV non valido.');
      target.headerId=headerId;
    }
    return Object.freeze(target);
  }
  function detailUrl(baseHref,input,token) {
    const target=normalizeTarget(input),base=new URL(baseHref);
    if(!['https:','http:'].includes(base.protocol)||base.username||base.password||!/(?:\/|\/index\.html)$/i.test(base.pathname))throw new Error('Pagina dettaglio non consentita.');
    if(typeof token!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(token))throw new Error('Identificativo dettaglio non valido.');
    const url=new URL('packing-detail.html',base);
    url.searchParams.set('packingDetail',target.kind);url.searchParams.set('detailValue',target.value);url.searchParams.set('detailToken',token);
    if(target.year!==null)url.searchParams.set('detailYear',String(target.year));
    if(target.headerId!==undefined)url.searchParams.set('detailHeaderId',String(target.headerId));
    return url.href;
  }
  function renderLink(input,label) {
    try{const target=normalizeTarget(input);return `<button type="button" class="packing-detail-link" data-packing-detail-kind="${target.kind}" data-packing-detail-value="${esc(target.value)}"${target.year===null?'':` data-packing-detail-year="${target.year}"`}${target.headerId===undefined?'':` data-packing-detail-header-id="${target.headerId}"`}>${esc(label??target.value)}</button>`}
    catch{return esc(label??input?.value??'')}
  }
  function installStyles(doc) {
    if(doc.getElementById('packing-detail-style-1932'))return;
    const style=doc.createElement('style');style.id='packing-detail-style-1932';style.textContent=`
.packing-detail-link{display:inline;padding:0;border:0;background:none;color:inherit;font:inherit;font-weight:inherit;text-align:inherit;text-decoration:underline;text-decoration-style:dotted;cursor:pointer}
.packingdetaildialog{width:min(960px,calc(100vw - 16px));height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);max-width:none;padding:0;border:1px solid #b6d0c4;border-radius:14px;background:#f5f7f4;color:#17332d}
.packingdetaildialog::backdrop{background:#071914b3}.packingdetaildialog>header{display:flex;align-items:center;justify-content:space-between;gap:8px;height:58px;padding:8px 12px;border-bottom:1px solid #cdded5}
.packingdetaildialog>header strong{font-size:13px;overflow-wrap:anywhere}.packingdetaildialog>header button{flex:0 0 auto;min-height:38px;padding:5px 12px;border:1px solid #719e8d;border-radius:8px;background:#fff;color:#174d40;font-weight:800}
.packingdetaildialog iframe{display:block;width:100%;height:calc(100% - 58px);border:0;background:#fff}.packingdetaildialog iframe[hidden]{display:none}
.packingdetailstatus{padding:20px;font-size:13px;line-height:1.5}.packingdetailstatus[hidden]{display:none}
`;doc.head.appendChild(style);
  }
  function createController({window:win=globalThis.window,document:doc=win.document,hooks,root=null,timeoutMs=20000}={}) {
    if(!hooks||typeof hooks.currentOp!=='function'||typeof hooks.flushQuantities!=='function'||typeof hooks.hasPendingScan!=='function'||typeof hooks.readDetail!=='function')throw new TypeError('Packing safety and readDetail hooks are required.');
    installStyles(doc);
    let active=null,serial=0,backPending=false,destroyed=false;
    const report=error=>{hooks.reportError?.(error.message);return {ok:false,error:error.message}};
    const restore=entry=>{
      let element=entry.focus;
      if(!element?.isConnected&&root){element=[...root.querySelectorAll('[data-packing-detail-kind]')].find(node=>node.dataset.packingDetailKind===entry.target.kind&&node.dataset.packingDetailValue===entry.target.value)}
      if(element?.isConnected){element.focus?.({preventScroll:true});if(Number.isInteger(entry.selectionStart))try{element.setSelectionRange(entry.selectionStart,entry.selectionEnd)}catch{}}
      win.scrollTo({left:entry.scrollX,top:entry.scrollY,behavior:'instant'});
    };
    function close({fromHistory=false}={}) {
      const entry=active;if(!entry)return;
      active=null;serial++;win.clearTimeout(entry.timer);
      entry.frame?.remove();entry.dialog.close();entry.dialog.remove();restore(entry);
      if(!fromHistory&&entry.historyAdded&&win.history.state?.technicsPackingDetail===entry.token){backPending=true;win.history.back()}
    }
    function fail(entry,error) {
      if(active!==entry)return;
      win.clearTimeout(entry.timer);entry.phase='error';entry.status.hidden=false;entry.status.textContent=error.message||'Dettaglio non disponibile. Chiudi e riprova.';
      entry.dialog.setAttribute('aria-busy','false');if(entry.frame)entry.frame.hidden=true;
    }
    const onMessage=event=>{
      const entry=active,data=event.data;
      if(!entry?.frame||event.origin!=='null'||event.source!==entry.frame.contentWindow||!data||data.token!==entry.token||hooks.currentOp()!==entry.op)return;
      if(data.type==='technics-packing-detail-request-data'){
        const requestId=data.requestId,frame=entry.frame;
        if(typeof requestId!=='string'||!requestId||requestId.length>128||/[\u0000-\u001f\u007f]/.test(requestId)||!['loading','ready'].includes(entry.phase)||entry.readRequests.has(requestId))return;
        const current=()=>active===entry&&entry.frame===frame&&hooks.currentOp()===entry.op&&['loading','ready'].includes(entry.phase);
        entry.readRequests.add(requestId);
        // Never accept a route, method, URL or replacement target supplied by the child.
        Promise.resolve().then(async()=>{
          try{
            if(!current())return;
            const payload=await hooks.readDetail(entry.target);
            if(current())frame.contentWindow.postMessage({type:'technics-packing-detail-data',token:entry.token,requestId,ok:true,payload},'*');
          }catch(error){
            if(current())try{frame.contentWindow.postMessage({type:'technics-packing-detail-data',token:entry.token,requestId,ok:false,message:typeof error?.message==='string'?error.message.slice(0,500):'Dettaglio non disponibile.'},'*')}catch{}
          }finally{entry.readRequests.delete(requestId)}
        });
      }else if(data.type==='technics-packing-detail-ready'){
        if(entry.phase!=='loading'||data.readOnly!==true)return;
        win.clearTimeout(entry.timer);entry.phase='ready';entry.status.hidden=true;entry.frame.hidden=false;entry.dialog.setAttribute('aria-busy','false');
      }else if(data.type==='technics-packing-detail-error')fail(entry,new Error(typeof data.message==='string'?data.message.slice(0,500):'Dettaglio non disponibile.'));
      else if(data.type==='technics-packing-detail-close')close();
    };
    const onPop=()=>{backPending=false;if(active)close({fromHistory:true})};
    win.addEventListener('message',onMessage);win.addEventListener('popstate',onPop);
    async function open(input) {
      if(destroyed)return report(new Error('Visualizzatore chiuso.'));
      if(active||backPending)return {ok:false,busy:true};
      let target,op,token,url;
      try{
        target=normalizeTarget(input);op=hooks.currentOp();
        if(!op)throw new Error('Apri una packing list prima del dettaglio.');
        if(hooks.hasPendingScan())throw new Error('Conferma o annulla la scansione in corso prima di aprire il dettaglio.');
        token=win.crypto.randomUUID();url=detailUrl(win.location.href,target,token);
      }catch(error){return report(error)}
      installStyles(doc);
      const dialog=doc.createElement('dialog'),header=doc.createElement('header'),title=doc.createElement('strong'),button=doc.createElement('button'),status=doc.createElement('p');
      dialog.className='packingdetaildialog';dialog.setAttribute('aria-label','Dettaglio in sola lettura');dialog.setAttribute('aria-busy','true');
      title.textContent=`${target.kind==='inventory'?'Inventario':target.kind.toUpperCase()} ${target.value} · sola lettura`;
      button.type='button';button.textContent='Torna al packaging';button.addEventListener('click',()=>close());
      status.className='packingdetailstatus';status.setAttribute('role','status');status.textContent='Salvataggio delle quantità in corso…';
      header.appendChild(title);header.appendChild(button);dialog.appendChild(header);dialog.appendChild(status);
      const focus=doc.activeElement,entry={target,op,token,url,dialog,status,frame:null,phase:'saving',readRequests:new Set(),focus,selectionStart:focus?.selectionStart,selectionEnd:focus?.selectionEnd,scrollX:win.scrollX,scrollY:win.scrollY,timer:null,historyAdded:false,serial:++serial};
      active=entry;dialog.addEventListener('cancel',event=>{event.preventDefault();close()});doc.body.appendChild(dialog);dialog.showModal();
      try{
        const previous=win.history.state;
        win.history.pushState({...previous,technicsPackingDetail:token},'',win.location.href);entry.historyAdded=true;
        entry.timer=win.setTimeout(()=>fail(entry,new Error('Salvataggio non ancora confermato. Chiudi e riprova.')),Math.max(1000,Math.min(60000,timeoutMs)));
        // Only the existing packing save queue may write. This viewer never posts.
        await hooks.flushQuantities(op);
        if(active!==entry||serial!==entry.serial)return {ok:false,cancelled:true};
        if(entry.phase!=='saving')return {ok:false,error:entry.status.textContent};
        win.clearTimeout(entry.timer);
        if(hooks.currentOp()!==op||hooks.hasPendingScan())throw new Error('Packing list o scansione cambiata durante il salvataggio. Chiudi e riprova.');
        const frame=doc.createElement('iframe');entry.frame=frame;entry.phase='loading';frame.hidden=true;frame.title=title.textContent;
        frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');
        frame.addEventListener('error',()=>fail(entry,new Error('Impossibile caricare il dettaglio. Chiudi e riprova.')));
        frame.src=url;entry.status.textContent='Lettura del dettaglio verificato…';dialog.appendChild(frame);
        entry.timer=win.setTimeout(()=>fail(entry,new Error('Il dettaglio non ha confermato la lettura. Chiudi e riprova.')),Math.max(1000,Math.min(60000,timeoutMs)));
        return {ok:true,pending:true};
      }catch(error){fail(entry,error);return {ok:false,error:error.message}}
    }
    const onClick=event=>{
      const button=event.target.closest?.('[data-packing-detail-kind]');if(!button||!root?.contains(button))return;
      event.preventDefault();event.stopPropagation();
      void open({kind:button.dataset.packingDetailKind,value:button.dataset.packingDetailValue,year:button.dataset.packingDetailYear,headerId:button.dataset.packingDetailHeaderId});
    };
    root?.addEventListener('click',onClick);
    return Object.freeze({open,close,state:()=>({phase:active?.phase||'closed',target:active?.target||null}),destroy(){close();destroyed=true;win.removeEventListener('message',onMessage);win.removeEventListener('popstate',onPop);root?.removeEventListener('click',onClick)}});
  }
  globalThis.TechnicsPackingLinks=Object.freeze({normalizeTarget,detailUrl,renderLink,createController});
})();
