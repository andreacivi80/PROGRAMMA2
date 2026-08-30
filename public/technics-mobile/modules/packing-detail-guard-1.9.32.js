/* Trusted-app side-effect guard inside an opaque-origin sandbox (allow-scripts
   only). Load before every app script; bootstrap MUST stop unless state.ok. */
(() => {
  'use strict';
  const QUERY_KEYS=new Set(['packingDetail','detailValue','detailToken','detailYear','detailHeaderId']);
  function parseTarget(href) {
    const url=new URL(href),query=url.searchParams;
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.hash||!url.pathname.endsWith('/packing-detail.html'))throw Error('URL dettaglio non valida.');
    for(const key of query.keys())if(!QUERY_KEYS.has(key)||query.getAll(key).length!==1)throw Error('Parametri dettaglio non validi.');
    const kind=query.get('packingDetail'),value=query.get('detailValue'),token=query.get('detailToken'),rawYear=query.get('detailYear');
    if(!['inventory','op','ov'].includes(kind)||!value||value!==value.trim()||value.length>128||/[\u0000-\u001f\u007f]/.test(value))throw Error('Dettaglio non valido.');
    if(!/^[a-zA-Z0-9-]{8,80}$/.test(token||''))throw Error('Identificativo dettaglio non valido.');
    let year=null;
    if(kind==='inventory'){if(rawYear!==null)throw Error('Anno inatteso.');}
    else {if(!/^\d{1,12}$/.test(value)||!/^\d{4}$/.test(rawYear||'')||Number(rawYear)<1900||Number(rawYear)>2100)throw Error('Numero o anno non valido.');year=Number(rawYear);}
    const target={kind,value,token,year},rawHeader=query.get('detailHeaderId');
    if(rawHeader!==null){
      const raw=rawHeader.trim(),headerId=Number(raw);
      if(kind!=='ov'||!/^\d+$/.test(raw)||!Number.isSafeInteger(headerId)||headerId<=0)throw Error('Identificativo testata OV non valido.');
      target.headerId=headerId;
    }
    return Object.freeze(target);
  }
  function memoryStorage() {
    const values=new Map(),methods=Object.freeze({
      getItem:key=>values.has(String(key))?values.get(String(key)):null,
      setItem:(key,value)=>{values.set(String(key),String(value));},
      removeItem:key=>{values.delete(String(key));},clear:()=>values.clear(),
      key:index=>[...values.keys()][Number(index)>>>0]??null
    });
    return new Proxy(Object.create(null),{
      get:(_target,key)=>key==='length'?values.size:typeof key==='string'&&Object.hasOwn(methods,key)?methods[key]:values.get(key),
      set:(_target,key,value)=>{if(typeof key!=='string')return false;values.set(key,String(value));return true;},
      deleteProperty:(_target,key)=>{values.delete(key);return true;},
      ownKeys:()=>[...values.keys()],has:(_target,key)=>key==='length'||Object.hasOwn(methods,key)||values.has(key),
      getOwnPropertyDescriptor:(_target,key)=>values.has(key)?{value:values.get(key),enumerable:true,configurable:true,writable:true}:undefined,
      defineProperty:(_target,key,descriptor)=>{if(typeof key!=='string'||!Object.hasOwn(descriptor,'value'))return false;values.set(key,String(descriptor.value));return true;}
    });
  }
  function install(win) {
    const failures=[],counts={blocked:0};let target=null,enabled=false;
    const active=win.parent!==win||new URL(win.location.href).searchParams.has('packingDetail');
    if(!active)return Object.freeze({active:false,ok:true,target:null});
    const deny=()=>{counts.blocked++;throw Error('Vista dettaglio in sola lettura: operazione non consentita.');};
    const lock=(object,key,value)=>{
      try{Object.defineProperty(object,key,{value,writable:false,configurable:false});if(object[key]!==value)throw Error('not installed');}
      catch{failures.push(`Blocco ${key} non installato.`);}
    };
    // Never read either native storage getter, never patch Storage.prototype.
    lock(win,'localStorage',memoryStorage());lock(win,'sessionStorage',memoryStorage());
    // No Origin:null API call is permitted. The parent owns the validated GET
    // broker; the child receives only JSON through the token/source protocol.
    lock(win,'fetch',async()=>deny());
    for(const key of ['XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker'])lock(win,key,function BlockedDetailTransport(){return deny();});
    for(const key of ['open','print'])lock(win,key,deny);
    if(win.navigator)lock(win.navigator,'sendBeacon',deny);else failures.push('Navigator assente.');
    for(const key of ['indexedDB','caches'])if(key in win)lock(win,key,Object.freeze({open:deny,deleteDatabase:deny,delete:deny,match:deny,keys:deny,has:deny}));
    try{if(win.navigator?.serviceWorker)lock(win.navigator.serviceWorker,'register',deny);}catch{/* Browser opaque-origin access is already denied. */}
    if(win.HTMLFormElement?.prototype){lock(win.HTMLFormElement.prototype,'submit',deny);lock(win.HTMLFormElement.prototype,'requestSubmit',deny);}
    else failures.push('Blocco form non installato.');
    if(win.history)for(const key of ['pushState','replaceState','go','back','forward'])lock(win.history,key,deny);
    const prevent=event=>{event.preventDefault();event.stopImmediatePropagation();counts.blocked++;};
    win.document.addEventListener('submit',prevent,true);
    win.document.addEventListener('click',event=>{if(event.target?.closest?.('a[href],area[href]'))prevent(event);},true);
    win.document.addEventListener('auxclick',event=>{if(event.target?.closest?.('a[href],area[href]'))prevent(event);},true);
    try{
      target=parseTarget(win.location.href);
      // frameElement/parent.location are intentionally not read: an opaque
      // origin cannot access them. Parent must set exactly sandbox=allow-scripts.
      if(win.parent===win||win.origin!=='null')throw Error('Sandbox con origine opaca non verificato.');
    }catch(error){failures.push(error.message);}
    enabled=failures.length===0;
    const post=(type,extra={})=>{
      if(!enabled)return deny();
      win.parent.postMessage({type,token:target.token,...extra},new URL(win.location.href).origin);
    };
    let dataRequest=null,dataConfirmed=false;
    const requestData=({fresh=true}={})=>{
      if(!enabled)return Promise.reject(Error('Guard dettaglio non installato.'));
      if(dataRequest)return dataRequest;
      dataConfirmed=false;
      const pending=new Promise((resolve,reject)=>{
        const requestId=win.crypto.randomUUID(),parentOrigin=new URL(win.location.href).origin;
        let timer;
        const finish=(error,payload)=>{win.clearTimeout(timer);win.removeEventListener('message',receive);if(error)reject(error);else resolve(payload);};
        const receive=event=>{
          const data=event.data;
          if(event.source!==win.parent||event.origin!==parentOrigin||data?.type!=='technics-packing-detail-data'||data.token!==target.token||data.requestId!==requestId)return;
          if(data.ok===true&&data.payload&&typeof data.payload==='object'){dataConfirmed=true;finish(null,data.payload);}
          else finish(Error(typeof data.message==='string'?data.message.slice(0,500):'Lettura dettaglio non confermata.'));
        };
        win.addEventListener('message',receive);
        timer=win.setTimeout(()=>finish(Error('Tempo di lettura dettaglio scaduto.')),10000);
        const requestedTarget={kind:target.kind,value:target.value,year:target.year};
        if(target.headerId!==undefined)requestedTarget.headerId=target.headerId;
        try{post('technics-packing-detail-request-data',{requestId,fresh:fresh===true,target:requestedTarget});}catch(error){finish(error);}
      });
      const shared=pending.finally(()=>{if(dataRequest===shared)dataRequest=null;});
      dataRequest=shared;
      return shared;
    };
    return Object.freeze({active:true,ok:enabled,target:enabled?target:null,failures:Object.freeze(failures.slice()),get blockedCount(){return counts.blocked;},
      requestData,
      notifyReady:()=>{if(!dataConfirmed)return deny();return post('technics-packing-detail-ready',{readOnly:true});},
      notifyError:message=>post('technics-packing-detail-error',{message:String(message||'Dettaglio non disponibile.').slice(0,500)}),
      notifyClose:()=>post('technics-packing-detail-close'),
      limits:'Bootstrap must gate every later script. Parent must set sandbox=allow-scripts only and validate token, source and opaque message origin. All child HTTP is denied; data arrives via parent broker. Self-navigation cannot be patched.'});
  }
  const api={parseTarget,memoryStorage,install,state:null};
  if(typeof window!=='undefined'){
    try{api.state=install(window);}
    catch(error){api.state=Object.freeze({active:true,ok:false,target:null,failures:Object.freeze(['Installazione guard incompleta.'])});}
  }
  globalThis.TechnicsPackingDetailGuard=Object.freeze(api);
})();
