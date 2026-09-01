(()=>{
  'use strict';
  const MESSAGE='Elenco dalla copia mirror: copia non aggiornata / sola consultazione. Le operazioni Packing sono bloccate finché torna il server autorevole.';
  let state=Object.freeze({active:false,lastSyncAt:null,source:null});
  const validTimestamp=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&Number.isFinite(Date.parse(value));
  function set(value={}){
    if(value.active===true){
      if(value.source!=='mirror'||!validTimestamp(value.lastSyncAt))throw Object.assign(new Error('Metadati copia mirror non validi.'),{code:'PACKING_MIRROR_METADATA_INVALID'});
      state=Object.freeze({active:true,lastSyncAt:value.lastSyncAt,source:'mirror'});
    }else state=Object.freeze({active:false,lastSyncAt:null,source:null});
    if(globalThis.document?.documentElement){
      globalThis.document.documentElement.dataset.packingMirrorReadonly=state.active?'true':'false';
      if(state.active)globalThis.document.documentElement.dataset.packingMirrorLastSyncAt=state.lastSyncAt;
      else delete globalThis.document.documentElement.dataset.packingMirrorLastSyncAt;
    }
    return state;
  }
  const current=()=>state;
  const isActive=()=>state.active;
  function assertWritable(){
    if(!state.active)return true;
    throw Object.assign(new Error(MESSAGE),{code:'PACKING_MIRROR_READONLY',packingMirrorReadonly:true,lastSyncAt:state.lastSyncAt});
  }
  function notice(locale='it-IT'){
    if(!state.active)return '';
    const stamp=new Date(state.lastSyncAt).toLocaleString(locale,{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
    return `COPIA NON AGGIORNATA · SOLA CONSULTAZIONE · ultimo allineamento mirror ${stamp}. Nessuna modifica o stampa è consentita.`;
  }
  globalThis.TechnicsPackingMirrorReadonly=Object.freeze({set,current,isActive,assertWritable,notice,message:MESSAGE,validTimestamp});
})();
