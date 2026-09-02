/* Resolve immutable OP/OV document identity in the background. Packing opens
   immediately; only verified read-only responses may enable detail links. */
(()=>{
  let installed=false,sequence=0,inflight=null,cache=null;
  const digits=value=>String(value??'').trim().replace(/^0+(?=\d)/,'');
  const validYear=value=>Number.isInteger(Number(value))&&Number(value)>=1900&&Number(value)<=2100;
  const verified=payload=>payload?.ok===true&&payload?.meta?.readOnly===true&&payload.meta.source==='TechnicsBridge'&&payload.meta.dataAuthority==='Technics';
  const sameIdentity=(left,right)=>String(left?.barcode||'')===String(right?.barcode||'')&&String(left?.id||'')===String(right?.id||'')&&digits(left?.number)===digits(right?.number);
  async function resolve(snapshot,hooks){
    const opNumber=digits(snapshot?.number),ovNumber=digits(snapshot?.ovNumber);
    if(!snapshot?.barcode||!snapshot?.id||!opNumber||!ovNumber)throw Error('Identità Packing incompleta.');
    const fresh=Date.now(),opRead=await hooks.readFreshJson(`/api/planning/op?number=${encodeURIComponent(opNumber)}&fresh=${fresh}`),opPayload=opRead.payload;
    if(!opRead.ok||!verified(opPayload)||opPayload.result?.verified!==true||opPayload.result?.ambiguous!==false||!sameIdentity(snapshot,opPayload.result.order)||!validYear(opPayload.result.year))throw Error('Identità OP non verificata.');
    const ovRead=await hooks.readFreshJson(`/api/planning/ov?number=${encodeURIComponent(ovNumber)}&fresh=${fresh+1}`),ovPayload=ovRead.payload,rows=ovPayload?.result?.rows||[];
    const headers=[...new Set(rows.map(row=>Number(row.ovHeaderId)).filter(value=>Number.isSafeInteger(value)&&value>0))];
    if(!ovRead.ok||!verified(ovPayload)||ovPayload.result?.verified!==true||ovPayload.result?.ambiguous!==false||digits(ovPayload.result.number)!==ovNumber||!validYear(ovPayload.result.year)||!rows.length||rows.some(row=>digits(row.ovNumber)!==ovNumber)||headers.length!==1)throw Error('Identità OV non verificata.');
    return Object.freeze({planningYear:Number(opPayload.result.year),ovYear:Number(ovPayload.result.year),ovHeaderId:headers[0]});
  }
  function install(){
    if(installed)return true;const hooks=window.__technicsPackingHooks;
    if(!hooks||typeof hooks.wrapShowProduction!=='function'||typeof hooks.readFreshJson!=='function'||typeof hooks.applyDetailMetadata!=='function')return false;
    const refresh=async snapshot=>{
      const key=`${snapshot?.id}|${snapshot?.barcode}|${digits(snapshot?.number)}|${digits(snapshot?.ovNumber)}`,token=++sequence;
      if(cache?.key===key&&Date.now()-cache.at<60000)hooks.applyDetailMetadata(snapshot.barcode,cache.metadata);
      try{
        if(!inflight||inflight.key!==key)inflight={key,promise:resolve(snapshot,hooks)};
        const metadata=await inflight.promise;if(token!==sequence)return {ok:false,stale:true};
        cache={key,metadata,at:Date.now()};hooks.applyDetailMetadata(snapshot.barcode,metadata);document.documentElement.dataset.packingDetailIdentity='verified';return {ok:true,...metadata};
      }catch(error){if(token===sequence)document.documentElement.dataset.packingDetailIdentity='unavailable';return {ok:false,error:error.message}}
      finally{if(inflight?.key===key)inflight=null}
    };
    hooks.wrapShowProduction((previous,order)=>{previous(order);void refresh(JSON.parse(JSON.stringify(order||{})))});
    installed=true;window.__technicsPackingDetailMetadata={refresh,last:()=>cache?.metadata||null,version:'1.9.82'};return true;
  }
  if(install())return;let attempts=0;const timer=setInterval(()=>{attempts++;if(install()||attempts>=400)clearInterval(timer)},25);
})();
