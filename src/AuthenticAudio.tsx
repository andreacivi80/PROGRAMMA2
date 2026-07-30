import {useEffect,useRef,useState} from "react";

export default function AuthenticAudio({url,label,duration}:{url:string;label:string;duration:string}){
 const audio=useRef<HTMLAudioElement|null>(null),timer=useRef<number|null>(null);
 const[status,setStatus]=useState<"idle"|"waiting"|"playing"|"paused">("idle"),[rate,setRate]=useState(1);
 const stop=()=>{if(timer.current!==null){clearTimeout(timer.current);timer.current=null}if(audio.current){audio.current.pause();audio.current.currentTime=0}setStatus("idle")};
 useEffect(()=>()=>stop(),[]);
 const primary=()=>{const player=audio.current;if(!player)return;if(status==="playing"){player.pause();setStatus("paused");return}if(status==="paused"){player.playbackRate=rate;void player.play();setStatus("playing");return}setStatus("waiting");timer.current=window.setTimeout(()=>{timer.current=null;player.playbackRate=rate;void player.play().then(()=>setStatus("playing")).catch(()=>setStatus("idle"))},1000)};
 return <section className="authenticAudio">
  <audio ref={audio} src={url} preload="metadata" onEnded={stop}/>
  <div><small>CAMPIONE AUTENTICO · VOCE REALE · {duration}</small><strong>{label}</strong></div>
  <div className="authenticAudioActions"><button type="button" onClick={primary}><b>{status==="playing"?"Ⅱ":"▶"}</b>{status==="waiting"?"Avvio tra 1s…":status==="playing"?"Pausa":status==="paused"?"Riprendi":"Ascolta"}</button><button type="button" onClick={stop} disabled={status==="idle"}>■ Stop</button></div>
  <div className="authenticSpeed" aria-label="Velocità campione">{([.8,1,1.2] as const).map(value=><button type="button" key={value} className={rate===value?"active":""} aria-pressed={rate===value} onClick={()=>{setRate(value);if(audio.current)audio.current.playbackRate=value}}>{value}×</button>)}</div>
 </section>
}
