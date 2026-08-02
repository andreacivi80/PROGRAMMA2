(()=>{
  const normalize=raw=>String(raw||"").trim().replace(/^\](?:C1|E0|Q3)/,"").replace(/\s+/g,"");
  const validEan13=value=>{
    if(!/^\d{13}$/.test(value))return false;
    let sum=0;for(let i=0;i<12;i++)sum+=Number(value[i])*(i%2?3:1);
    return(10-sum%10)%10===Number(value[12]);
  };
  const createConsensus=(windowMs=1500)=>{
    let previous="",count=0,lastAt=0;
    const reset=()=>{previous="";count=0;lastAt=0};
    const evaluate=(raw,options={})=>{
      const value=normalize(raw),now=Number(options.now||Date.now());
      if(!value)return{state:"empty",value,count:0,required:0};
      if(/^\d{12}$/.test(value)){reset();return{state:"incomplete",value,count:0,required:2,message:"Lettura incompleta: manca una cifra. Inquadra anche i margini bianchi."}}
      if(/^\d{13}$/.test(value)&&!validEan13(value)){reset();return{state:"invalid",value,count:0,required:2,message:"Barcode non valido: ricontrollo automatico…"}}
      const required=/^\d{13}$/.test(value)?2:3;
      if(options.highResolution){previous=value;count=required}
      else if(value===previous&&now-lastAt<windowMs)count++;
      else{previous=value;count=1}
      lastAt=now;
      return{state:count>=required?"verified":"pending",value,count,required,message:count>=required?`${required} letture concordi: ${value}`:`Verifica ${count}/${required} · ${value}`};
    };
    return Object.freeze({evaluate,reset,snapshot:()=>({value:previous,count,lastAt})});
  };
  window.TechnicsScannerCore=Object.freeze({normalize,validEan13,createConsensus,version:"1.4.2"});
  document.documentElement.dataset.scannerCore="1.4.2";
})();
