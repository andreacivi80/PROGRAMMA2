/* Fresh order, session and material resolution in one parallel read phase. */
(()=>{
  let installed=false,activeCheck=null,lastResult=null;
  const text=value=>String(value??"").trim(),number=value=>Number(value||0);
  const fingerprint=order=>JSON.stringify({
    barcode:text(order?.barcode),id:number(order?.id),number:text(order?.number),articleCode:text(order?.articleCode),articleName:text(order?.articleName),customerCode:text(order?.customerCode),customer:text(order?.customer),ovNumber:text(order?.ovNumber),unit:text(order?.unit),requestedQuantity:number(order?.requestedQuantity),producedQuantity:number(order?.producedQuantity),lot:text(order?.lot),expiry:text(order?.expiry),status:text(order?.status),planningYear:number(order?.planningYear),ovYear:number(order?.ovYear),ovHeaderId:number(order?.ovHeaderId),
    requirements:(order?.requirements||[]).map(row=>({position:number(row?.position),masterPosition:number(row?.masterPosition),phaseCode:text(row?.phaseCode),phase:text(row?.phase),code:text(row?.code).toUpperCase(),description:text(row?.description),requiredPerUnit:number(row?.requiredPerUnit),allocatedQuantity:number(row?.allocatedQuantity),weighedQuantity:number(row?.weighedQuantity),unit:text(row?.unit),lot:text(row?.lot).toUpperCase(),expiry:text(row?.expiry),location:text(row?.location).toUpperCase(),picked:text(row?.picked),availableLocations:(row?.availableLocations||[]).map(stock=>({location:text(stock?.location).toUpperCase(),quantity:number(stock?.quantity),availableQuantity:number(stock?.availableQuantity),planned:Boolean(stock?.planned)})).sort((a,b)=>a.location.localeCompare(b.location))})).sort((a,b)=>`${a.position}|${a.masterPosition}|${a.code}|${a.lot}|${a.location}`.localeCompare(`${b.position}|${b.masterPosition}|${b.code}|${b.lot}|${b.location}`))
  });
  function install(){
    if(installed)return true;
    const hooks=window.__technicsPackingHooks;
    if(!hooks||typeof hooks.wrapResolveMaterialScan!=="function"||typeof hooks.readFreshJson!=="function"||typeof hooks.applyFreshOrder!=="function"||typeof hooks.applyResolvedMaterialScan!=="function")return false;
    async function refreshCurrentPackingOrder(barcode=""){
      const snapshot=hooks.orderSnapshot?.(),requestedOp=String(snapshot?.barcode||"").trim();
      if(!requestedOp)throw new Error("Apri prima una Packing list.");
      const before=fingerprint(snapshot),fresh=Date.now(),requests=[
        hooks.readFreshJson(`/api/production/order?barcode=${encodeURIComponent(requestedOp)}&fresh=${fresh}`),
        hooks.readFreshJson(`/api/packing/session?op=${encodeURIComponent(requestedOp)}&fresh=${fresh}`)
      ];
      if(barcode)requests.push(hooks.readFreshJson(`/api/barcodes/resolve?barcode=${encodeURIComponent(barcode)}&op=${encodeURIComponent(requestedOp)}&fresh=${fresh}`));
      const [orderResult,sessionResult,resolutionResult]=await Promise.all(requests);
      const orderPayload=orderResult.payload,sessionPayload=sessionResult.payload,resolutionPayload=resolutionResult?.payload;
      if(!orderResult.ok||!orderPayload?.ok)throw new Error(orderPayload?.error||`Lettura ordine distinta non riuscita (${orderResult.status}).`);
      if(!sessionResult.ok||!sessionPayload?.ok)throw new Error(sessionPayload?.error||`Lettura sessione non riuscita (${sessionResult.status}).`);
      if(String(hooks.currentOp?.()||"")!==requestedOp||String(orderPayload?.order?.barcode||"")!==requestedOp)throw new Error("La Packing list aperta è cambiata durante il controllo: ripeti la scansione.");
      if(!orderPayload?.meta?.readOnly||!sessionPayload?.meta?.readOnly||(barcode&&!resolutionPayload?.meta?.readOnly))throw new Error("La lettura fresca non è attestata come sola lettura.");
      const changed=before!==fingerprint(orderPayload.order);
      hooks.applyFreshOrder(requestedOp,orderPayload.order,sessionPayload.session||null,changed);
      lastResult={checkedAt:new Date().toISOString(),opBarcode:requestedOp,changed,orderNode:orderPayload.meta.nodeId||null,sessionNode:sessionPayload.meta.nodeId||null,resolutionNode:resolutionPayload?.meta?.nodeId||null,revision:Number(sessionPayload.session?.revision||0),readOnly:true,parallel:Boolean(barcode)};
      document.documentElement.dataset.packingFreshCheck=changed?"updated":"reloaded";
      document.documentElement.dataset.packingFreshNode=String(orderPayload.meta.nodeId||"");
      if(changed)hooks.reportFreshUpdated?.("Packing list aggiornata dal gestionale prima della scansione.");
      return {fresh:lastResult,resolution:resolutionResult||null};
    }
    hooks.wrapResolveMaterialScan(async(previous,barcode)=>{
      hooks.beginMaterialVerification?.();
      try{
        if(activeCheck)await activeCheck;
        activeCheck=refreshCurrentPackingOrder(barcode);
        const result=await activeCheck;
        return hooks.applyResolvedMaterialScan(barcode,result.resolution?.payload,result.resolution?.status);
      }catch(error){hooks.reportFreshError?.(`Packing list non aggiornata: ${error.message||"riprova la scansione."} Nessun collo è stato modificato.`)}
      finally{activeCheck=null}
    });
    installed=true;
    window.__technicsPackingFreshOrder={refresh:()=>refreshCurrentPackingOrder(""),last:()=>lastResult,fingerprint,version:"1.9.103"};
    return true;
  }
  if(install())return;
  let attempts=0;const timer=setInterval(()=>{attempts++;if(install()||attempts>=400)clearInterval(timer)},25);
})();
