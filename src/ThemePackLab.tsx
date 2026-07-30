import {useEffect,useMemo,useRef,useState} from "react";
import type {Choice} from "./curriculum";
import type {ThemePack} from "./themePacks";
import AuthenticAudio from "./AuthenticAudio";
import {accentComprehension} from "./accentComprehension";

type Props={pack:ThemePack;badge:string;previous?:{score:number;attempts:number};onClose:()=>void;onComplete:(score:number)=>void};
type QuizItem=Choice&{id:string};
const shuffle=<T,>(items:T[])=>[...items].sort(()=>Math.random()-.5);

function buildQuiz(pack:ThemePack):QuizItem[]{
 const authoredSource=[...pack.questions,...(accentComprehension[pack.id]??[])].slice(0,8);
 const meanings=shuffle(pack.vocabulary).slice(0,Math.max(0,10-authoredSource.length)).map((word,index)=>{
  const wrong=shuffle(pack.vocabulary.filter(item=>item.en!==word.en).map(item=>item.it)).slice(0,3);
  const options=shuffle([word.it,...wrong]),answer=options.indexOf(word.it);
  return{id:`word-${index}`,prompt:`Che cosa significa “${word.en}” in questo contesto?`,options,answer,explanationIt:`${word.en} significa ${word.it}. Esempio: ${word.example}`};
 });
 const authored=authoredSource.map((question,index)=>{
  const correct=question.options[question.answer],options=shuffle(question.options);
  return{...question,id:`scenario-${index}`,options,answer:options.indexOf(correct)};
 });
 return shuffle([...meanings,...authored]);
}

type DialogueTurn={speaker?:string;text:string;words:string[];start:number};
function parseDialogue(text:string):DialogueTurn[]{
 const marker=/\b([A-Za-z][A-Za-z ]{0,18}):\s*/g,matches=[...text.matchAll(marker)];
 if(matches.length<2)return[{text,words:text.split(/\s+/),start:0}];
 let offset=0;return matches.map((match,index)=>{const from=(match.index??0)+match[0].length,to=index+1?(matches[index+1]?.index??text.length):text.length,part=text.slice(from,to).trim(),words=part.split(/\s+/).filter(Boolean),turn={speaker:match[1],text:part,words,start:offset};offset+=words.length;return turn});
}
type ScenarioPlayback={timer:number|null;index:number;wordCount:number;paused:boolean;onWord?:(index:number)=>void};
let scenarioPlayback:ScenarioPlayback|null=null;
function finishScenarioSpeech(){if(scenarioPlayback?.timer!=null)window.clearInterval(scenarioPlayback.timer);scenarioPlayback?.onWord?.(-1);scenarioPlayback=null}
function stopScenarioSpeech(){if(typeof speechSynthesis!=="undefined")speechSynthesis.cancel();finishScenarioSpeech()}
function pauseScenarioSpeech(){if(typeof speechSynthesis!=="undefined")speechSynthesis.pause();if(scenarioPlayback)scenarioPlayback.paused=true}
function resumeScenarioSpeech(){if(typeof speechSynthesis!=="undefined")speechSynthesis.resume();if(scenarioPlayback)scenarioPlayback.paused=false}
function speak(text:string,onWord?:(index:number)=>void){
 if(!("speechSynthesis" in window))return;stopScenarioSpeech();
 const turns=parseDialogue(text),englishVoices=speechSynthesis.getVoices().filter(voice=>voice.lang.startsWith("en")),british=englishVoices.filter(voice=>voice.lang.startsWith("en-GB")),primary=british[0]??englishVoices[0]??null,secondary=british.find(voice=>voice.name!==primary?.name)??englishVoices.find(voice=>voice.name!==primary?.name)??primary;
 const playback:ScenarioPlayback={timer:null,index:0,wordCount:turns.reduce((sum,turn)=>sum+turn.words.length,0),paused:false,onWord};scenarioPlayback=playback;let turnIndex=0;
 const playTurn=()=>{if(scenarioPlayback!==playback)return;const turn=turns[turnIndex],utterance=new SpeechSynthesisUtterance(turn.text),voice=turnIndex%2?secondary:primary;utterance.voice=voice;utterance.lang=voice?.lang||"en-GB";utterance.rate=.92;let localIndex=0;
  utterance.onstart=()=>{onWord?.(turn.start);playback.index=turn.start;if(!onWord)return;playback.timer=window.setInterval(()=>{if(playback.paused||scenarioPlayback!==playback)return;localIndex=Math.min(turn.words.length-1,localIndex+1);playback.index=turn.start+localIndex;onWord(playback.index)},430)};
  utterance.onboundary=event=>{if(event.name!=="word"||scenarioPlayback!==playback)return;localIndex=turn.text.slice(0,event.charIndex).trim().split(/\s+/).filter(Boolean).length;playback.index=turn.start+localIndex;onWord?.(playback.index)};
  utterance.onerror=()=>{if(scenarioPlayback===playback)finishScenarioSpeech()};utterance.onend=()=>{if(playback.timer!=null)window.clearInterval(playback.timer);playback.timer=null;if(scenarioPlayback!==playback)return;turnIndex++;if(turnIndex<turns.length)playTurn();else finishScenarioSpeech()};speechSynthesis.speak(utterance)
 };playTurn();
}

export default function ThemePackLab({pack,badge,previous,onClose,onComplete}:Props){
 const[phase,setPhase]=useState<"learn"|"scenario"|"quiz"|"result">("learn");
 const[quiz,setQuiz]=useState(()=>buildQuiz(pack)),[index,setIndex]=useState(0),[selected,setSelected]=useState<number|null>(null),[correct,setCorrect]=useState(0),[scenarioWord,setScenarioWord]=useState(-1);
 const reported=useRef(false),scenarioRef=useRef<HTMLDivElement|null>(null),item=quiz[index],score=Math.round(correct/quiz.length*100);
 const levelTone=useMemo(()=>`level-${pack.level.toLowerCase()}`,[pack.level]),scenarioTurns=useMemo(()=>parseDialogue(pack.scenario.text),[pack.scenario.text]); useEffect(()=>{const box=scenarioRef.current,active=box?.querySelector<HTMLElement>(".active");if(box&&active)box.scrollTo({top:Math.max(0,active.offsetTop-box.clientHeight/2),behavior:"smooth"})},[scenarioWord]);
 const startQuiz=()=>{stopScenarioSpeech();setScenarioWord(-1);setQuiz(buildQuiz(pack));setIndex(0);setSelected(null);setCorrect(0);reported.current=false;setPhase("quiz");scrollTo(0,0)};
 const next=()=>{if(index+1<quiz.length){setIndex(value=>value+1);setSelected(null);window.scrollTo({top:0,behavior:"smooth"})}else{const finalScore=Math.round(correct/quiz.length*100);if(!reported.current){reported.current=true;onComplete(finalScore)}setPhase("result");scrollTo(0,0)}};
 const choose=(choice:number)=>{if(selected!==null)return;setSelected(choice);if(choice===item.answer)setCorrect(value=>value+1)};
 const shownScore=phase==="result"?Math.round(correct/quiz.length*100):score;
 return <main className={`themePackView ${levelTone}`}>
  <header className="themePackTop"><button type="button" onClick={()=>{stopScenarioSpeech();onClose()}} aria-label="Chiudi">×</button><div><i style={{width:phase==="learn"?"25%":phase==="scenario"?"50%":phase==="quiz"?`${50+(index+1)/quiz.length*45}%`:"100%"}}/></div><b>{pack.level}</b></header>
  <article className="themePackPanel">
   {phase==="learn"&&<><div className="themePackHero"><span className="versionBadge current">{badge}</span>{pack.flagUrl?<img className="themeHeroFlagImage" src={pack.flagUrl} alt={pack.flagLabel??"Bandiera"}/>:pack.flag&&<span className="themeHeroFlag" aria-hidden="true">{pack.flag}</span>}<small>{pack.level} · {pack.minutes} min · 10 quiz variabili</small><h1>{pack.title}</h1><p>{pack.summary}</p>{previous&&<em>Già svolta {previous.attempts} {previous.attempts===1?"volta":"volte"} · miglior risultato recente {previous.score}%</em>}{pack.sourceUrl&&<a className="themePackSource" href={pack.sourceUrl} target="_blank" rel="noreferrer">Fonte del contesto: {pack.sourceLabel??"sito ufficiale"} ↗</a>}</div><section className="themeGuide"><span className="eyebrow">Prima capisci, poi usa</span><h2>Guida pratica</h2>{pack.guide.map((line,index)=><p key={line}><b>{index+1}</b><span>{line}</span></p>)}</section><section><div className="themeSectionTitle"><span><small>VOCABOLARIO ATTIVO</small><h2>Ascolta l’inglese e leggi l’esempio</h2></span><b>{pack.vocabulary.length} parole</b></div><div className="themeWordGrid">{pack.vocabulary.map(word=><article className="themeWordCard" key={word.en}><button type="button" onClick={()=>speak(`${word.en}. ${word.example}`)} aria-label={`Ascolta ${word.en}`}>▶</button><div><strong lang="en">{word.en}</strong><span>{word.it}</span><p lang="en">{word.example}</p></div></article>)}</div></section><button className="continue" onClick={()=>{setPhase("scenario");scrollTo(0,0)}}>Vai alla situazione reale <b>→</b></button></>}
   {phase==="scenario"&&<><span className="eyebrow">Ascolto e comprensione</span><h1>{pack.scenario.title}</h1><p className="intro">Prima ascolta senza aiuti. Puoi mettere in pausa, riprendere o fermare la voce.</p>{pack.authenticAudio?<AuthenticAudio {...pack.authenticAudio}/>:<div className="themeAudioBar"><button type="button" onClick={()=>speak(pack.scenario.text,setScenarioWord)}>▶ <span>Ascolta</span></button><button type="button" onClick={pauseScenarioSpeech}>Ⅱ <span>Pausa</span></button><button type="button" onClick={resumeScenarioSpeech}>↻ <span>Riprendi</span></button><button type="button" onClick={()=>{stopScenarioSpeech();setScenarioWord(-1)}}>■ <span>Stop</span></button></div>}<section className="themeScenario"><small>{pack.authenticAudio?"GUIDA ALL’ASCOLTO":"TESTO IN INGLESE · SEGUE LA VOCE"}</small>{pack.authenticAudio?<p>{pack.scenario.text}</p>:<div ref={scenarioRef} lang="en" className={`scenarioFollow ${scenarioTurns.length>1?"dialogueScript":""}`}>{scenarioTurns.map((turn,turnIndex)=><p key={`${turn.speaker??"text"}-${turnIndex}`}>{turn.speaker&&<b>{turn.speaker}</b>}{turn.words.map((word,wordIndex)=>{const absolute=turn.start+wordIndex;return <span key={`${word}-${absolute}`} className={absolute===scenarioWord?"active":""}>{word} </span>})}</p>)}</div>}<details><summary>Mostra il significato in italiano</summary><p>{pack.scenario.translation}</p></details></section><button className="continue" onClick={startQuiz}>Inizia i 10 quiz <b>→</b></button></>}
   {phase==="quiz"&&item&&<><div className="themeQuizMeta"><span>Domanda {index+1} di {quiz.length}</span><b>{pack.level}</b></div><h1>{item.prompt}</h1><div className="themeQuizOptions">{item.options.map((option,choice)=>{const state=selected===null?"":choice===item.answer?"correct":choice===selected?"wrong":"";return <button type="button" key={option} className={state} onClick={()=>choose(choice)} disabled={selected!==null}><b>{String.fromCharCode(65+choice)}</b><span>{option}</span></button>})}</div>{selected!==null&&<div className={`themeQuizFeedback ${selected===item.answer?"good":"review"}`}><strong>{selected===item.answer?["Ottimo, hai colto la sfumatura.","Ben fatto: collegamento preciso.","Risposta solida, continua così."][index%3]:"È un punto utile da rinforzare."}</strong><p>{item.explanationIt}</p><small>{selected===item.answer?"La spiegazione consolida anche le risposte corrette.":"Rileggi la regola o l’esempio, poi incontrerai di nuovo il concetto in una forma diversa."}</small></div>}<div className="themeQuizNav"><button type="button" className="showSolution" onClick={next}>Salta domanda</button><button className="continue" disabled={selected===null} onClick={next}>{index+1<quiz.length?"Prossima domanda":"Vedi il risultato"} <b>→</b></button></div></>}
   {phase==="result"&&<div className="themePackResult"><span>{shownScore>=80?"✓":"↗"}</span><small>SESSIONE COMPLETATA</small><strong>{shownScore}%</strong><h1>{shownScore>=85?"Ottima padronanza":shownScore>=65?"Base solida: continuiamo":"Hai individuato cosa allenare"}</h1><p>{shownScore>=85?"Sai riconoscere e usare il lessico della sessione.":shownScore>=65?"Rileggi gli esempi meno immediati e prova un nuovo ordine di domande.":"Nessun problema: ripeti ascolto e vocaboli, poi il quiz cambierà ordine e alternative."}</p><div><button type="button" className="continue" onClick={startQuiz}>Riprova con quiz diversi <b>↻</b></button><button type="button" className="showSolution" onClick={onClose}>Torna ai temi</button></div></div>}
  </article>
 </main>
}
