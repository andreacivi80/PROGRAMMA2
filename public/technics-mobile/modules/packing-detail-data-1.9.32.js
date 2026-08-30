/* Parent-only fixed read paths. No HTTP client, storage, mutation or year fallback. */
(()=>{
  'use strict';
  const fail=message=>{throw new Error(message)};
  const code=value=>{
    if(typeof value!=='string'&&typeof value!=='number')return fail('Codice dettaglio mancante.');
    const text=String(value).trim();
    if(!text||text.length>128||/[\u0000-\u001f\u007f]/.test(text))return fail('Codice dettaglio non valido.');
    return text;
  };
  const positive=value=>{
    if(!['number','string'].includes(typeof value)||!/^\d+$/.test(String(value).trim()))return fail('Identità documento mancante o non valida.');
    const number=Number(value);if(!Number.isSafeInteger(number)||number<=0)return fail('Identità documento non valida.');return number;
  };
  const number=value=>String(positive(value));
  const year=value=>{const result=positive(value);if(result<1900||result>2100)return fail('Anno documento mancante o non valido.');return result};
  const sameCode=(left,right)=>code(left).toUpperCase()===code(right).toUpperCase();
  function normalize(input){
    if(!input||!['inventory','op','ov'].includes(input.kind))return fail('Tipo di dettaglio non consentito.');
    const target={kind:input.kind,value:code(input.value),year:input.kind==='inventory'?null:year(input.year)};
    if(input.kind!=='inventory')number(target.value);
    if(input.kind==='ov')target.headerId=positive(input.headerId);
    else if(input.headerId!==null&&input.headerId!==undefined)return fail('Testata OV non consentita per questo dettaglio.');
    return Object.freeze(target);
  }
  function createReader({getOrder,getMaterialCodes,readJson}={}){
    if(typeof getOrder!=='function'||typeof getMaterialCodes!=='function'||typeof readJson!=='function')throw new TypeError('getOrder, getMaterialCodes e readJson sono obbligatori.');
    function boundOrder(target){
      const order=getOrder();if(!order)return fail('Nessuna packing list aperta.');
      const identity={id:positive(order.id),barcode:code(order.barcode)};
      if(target.kind==='inventory'){
        const materials=getMaterialCodes();if(!Array.isArray(materials))return fail('Codici packing non disponibili.');
        if(!materials.some(value=>sameCode(value,target.value))&&(!order.articleCode||!sameCode(order.articleCode,target.value)))return fail('Articolo non presente nella packing list corrente.');
      }else if(target.kind==='op'){
        if(number(target.value)!==number(order.number)||target.year!==year(order.planningYear))return fail('Numero o anno OP non corrispondono alla packing list corrente.');
      }else{
        if(number(target.value)!==number(order.ovNumber)||target.year!==year(order.ovYear)||target.headerId!==positive(order.ovHeaderId))return fail('Numero, anno o testata OV non corrispondono alla packing list corrente.');
      }
      return identity;
    }
    return async function readDetail(input){
      const target=normalize(input),identity=boundOrder(target),query=new URLSearchParams();let path;
      if(target.kind==='inventory'){
        query.set('code',target.value);query.set('fresh',String(Date.now()));path='/api/items/lookup';
      }else{
        query.set('number',target.value);query.set('year',String(target.year));
        if(target.kind==='ov')query.set('headerId',String(target.headerId));
        path=target.kind==='op'?'/api/planning/op':'/api/planning/ov';
      }
      // The hook receives one fixed relative path, never child URL/method/body/options.
      const payload=await readJson(path+'?'+query);
      const current=boundOrder(target);
      if(current.id!==identity.id||current.barcode!==identity.barcode)return fail('La packing list è cambiata durante la lettura.');
      if(payload?.ok!==true||payload.meta?.readOnly!==true||payload.meta?.source!=='TechnicsBridge'||payload.meta?.dataAuthority!=='Technics')return fail('Risposta gestionale priva di metadati verificati in sola lettura.');
      if(target.kind==='inventory'){
        if(!payload.item||!Array.isArray(payload.item.stocks)||!sameCode(payload.item.code,target.value))return fail('Il codice restituito non corrisponde al materiale richiesto.');
      }else{
        const result=payload.result;
        if(result?.verified!==true||result.ambiguous!==false)return fail('Documento ambiguo o non verificato.');
        if(number(result.number)!==number(target.value)||year(result.year)!==target.year)return fail('Numero o anno del documento restituito non corrispondono.');
        if(target.kind==='op'){
          if(positive(result.order?.id)!==identity.id)return fail('La OP restituita non è quella della packing list corrente.');
        }else{
          // Read-PlanningOv exposes the authoritative header on every row (ovHeaderId).
          if(result.headerId!==undefined&&positive(result.headerId)!==target.headerId)return fail('Testata OV restituita non corrispondente.');
          if(!Array.isArray(result.rows)||!result.rows.length||result.rows.some(row=>positive(row.ovHeaderId)!==target.headerId||number(row.ovNumber)!==number(target.value)))return fail('Righe OV prive della testata o del numero richiesti.');
        }
      }
      return payload;
    };
  }
  globalThis.TechnicsPackingDetailData=Object.freeze({createReader});
})();
