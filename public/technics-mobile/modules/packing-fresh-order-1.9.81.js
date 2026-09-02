/* Refresh the authoritative production order and shared Packing session before
   every material match. GET-only: mutations remain in the existing confirmed
   Add/Remove handlers. */
(()=>{
  let installed=false,activeCheck=null,lastResult=null;
  const fingerprint=order=>JSON.stringify({
    barcode:String(order?.barcode||""),lot:String(order?.lot||""),
    requirements:(order?.requirements||[]).map(row=>({code:String(row?.code||"").trim().toUpperCase(),lot:String(row?.lot||"").trim().toUpperCase(),location:String(row?.location||"").trim().toUpperCase(),quantity:Number(row?.allocatedQuantity||0)})).sort((a,b)=>`${a.code}|${a.lot}|${a.location}`.localeCompare(`${b.code}|${b.lot}|${b.location}`))
  });
  function install(){
    if(installed)return true;
    const hooks=window.__technicsPackingHooks;
    if(!hooks||typeof hooks.wrapResolveMaterialScan!=="function"||typeof hooks.readFreshJson!=="function"||typeof hooks.applyFreshOrder!=="function")return false;
    async function refreshCurrentPackingOrder(){
      const snapshot=hooks.orderSnapshot?.(),requestedOp=String(snapshot?.barcode||"").trim();
      if(!requestedOp)throw new Error("Apri prima una Packing list.");
      const before=fingerprint(snapshot),fresh=Date.now();
      const [orderResult,sessionResult]=await Promise.all([
        hooks.readFreshJson(`/api/production/order?barcode=${encodeURIComponent(requestedOp)}&fresh=${fresh}`),
        hooks.readFreshJson(`/api/packing/session?op=${encodeURIComponent(requestedOp)}&fresh=${fresh}`)
      ]);
      const orderPayload=orderResult.payload,sessionPayload=sessionResult.payload;
      if(!orderResult.ok||!orderPayload?.ok)throw new Error(orderPayload?.error||`Lettura distinta non riuscita (${orderResult.status}).`);
      if(!sessionResult.ok||!sessionPayload?.ok)throw new Error(sessionPayload?.error||`Lettura sessione non riuscita (${sessionResult.status}).`);
      if(String(hooks.currentOp?.()||"")!==requestedOp||String(orderPayload?.order?.barcode||"")!==requestedOp)throw new Error("La Packing list aperta è cambiata durante il controllo: ripeti la scansione.");
      if(!orderPayload?.meta?.readOnly||!sessionPayload?.meta?.readOnly)throw new Error("La lettura fresca non è attestata come sola lettura.");
      const changed=before!==fingerprint(orderPayload.order);
      hooks.applyFreshOrder(requestedOp,orderPayload.order,sessionPayload.session||null);
      lastResult={checkedAt:new Date().toISOString(),opBarcode:requestedOp,changed,orderNode:orderPayload.meta.nodeId||null,sessionNode:sessionPayload.meta.nodeId||null,revision:Number(sessionPayload.session?.revision||0),readOnly:true};
      document.documentElement.dataset.packingFreshCheck=changed?"updated":"reloaded";
      document.documentElement.dataset.packingFreshNode=String(orderPayload.meta.nodeId||"");
      if(changed)hooks.reportFreshUpdated?.("Packing list aggiornata dal gestionale prima della scansione.");
      return lastResult;
    }
    hooks.wrapResolveMaterialScan(async(previous,barcode)=>{
      try{activeCheck=activeCheck||refreshCurrentPackingOrder();await activeCheck}
      catch(error){hooks.reportFreshError?.(`Packing list non aggiornata: ${error.message||"riprova la scansione."} Nessun collo è stato modificato.`);return}
      finally{activeCheck=null}
      return previous(barcode);
    });
    installed=true;
    window.__technicsPackingFreshOrder={refresh:refreshCurrentPackingOrder,last:()=>lastResult,fingerprint,version:"1.9.81"};
    return true;
  }
  if(install())return;
  let attempts=0;const timer=setInterval(()=>{attempts++;if(install()||attempts>=400)clearInterval(timer)},25);
})();
