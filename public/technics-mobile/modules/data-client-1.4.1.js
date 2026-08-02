(()=>{
  const incompleteMessage="Il collegamento dati ha risposto in modo incompleto. Riprova tra pochi secondi.";
  const parseText=(text,response,message=incompleteMessage)=>{
    let payload;
    try{payload=JSON.parse(String(text||""))}catch{
      const error=new Error(message);error.status=Number(response?.status||0);error.incompleteResponse=true;throw error;
    }
    if(!payload||typeof payload!=="object"||Array.isArray(payload)){
      const error=new Error(message);error.status=Number(response?.status||0);error.incompleteResponse=true;throw error;
    }
    return payload;
  };
  const read=async(response,message)=>parseText(await response.text(),response,message);
  const state={requests:0,retries:0,recovered:0,failures:0,lastFailure:"",lastSuccessAt:""};
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const fetchJson=async(url,options={},settings={})=>{
    const attempts=Math.max(1,Number(settings.attempts||3));let lastError;
    for(let attempt=0;attempt<attempts;attempt++){
      state.requests++;
      try{
        const response=await fetch(url,options),payload=await read(response,settings.message);
        state.lastSuccessAt=new Date().toISOString();
        if(attempt){state.recovered++;document.dispatchEvent(new CustomEvent("technics:data-recovered",{detail:{url,attempt:attempt+1}}))}
        return {response,payload,attempt:attempt+1};
      }catch(error){
        lastError=error;state.lastFailure=String(error?.message||error);
        if(attempt<attempts-1){state.retries++;await pause(250+(attempt*400));continue}
      }
    }
    state.failures++;document.dispatchEvent(new CustomEvent("technics:data-failure",{detail:{url,message:state.lastFailure}}));
    throw lastError||new Error("Collegamento dati non disponibile.");
  };
  const diagnostics=()=>Object.freeze({...state});
  window.TechnicsDataClient=Object.freeze({parseText,read,fetchJson,diagnostics,incompleteMessage,version:"1.4.1"});
  document.documentElement.dataset.dataClient="1.4.1";
})();
