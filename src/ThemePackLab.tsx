import {useMemo,useRef,useState} from "react";
import type {Choice} from "./curriculum";
import type {ThemePack} from "./themePacks";

type Props={pack:ThemePack;badge:string;previous?:{score:number;attempts:number};onClose:()=>void;onComplete:(score:number)=>void};
type QuizItem=Choice&{id:string};
const shuffle=<T,>(items:T[])=>[...items].sort(()=>Math.random()-.5);

function buildQuiz(pack:ThemePack):QuizItem[]{
 const meanings=pack.vocabulary.map((word,index)=>{
  const wrong=shuffle(pack.vocabulary.filter(item=>item.en!==word.en).map(item=>item.it)).slice(0,3);
  const options=shuffle([word.it,...wrong]),answer=options.indexOf(word.it);
  return{id:`word-${index}`,prompt:`Che cosa significa “${word.en}” in questo contesto?`,options,answer,explanationIt:`${word.en} significa ${word.it}. Esempio: ${word.example}`};
 });
 const authored=pack.questions.map((question,index)=>{
  const correct=question.options[question.answer],options=shuffle(question.options);
  return{...question,id:`scenario-${index}`,options,answer:options.indexOf(correct)};
 });
 return shuffle([...meanings,...authored]);
}

function speak(text:string){
 if(!("speechSynthesis" in window))return;
 speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(text);
 const voices=speechSynthesis.getVoices();
 utterance.voice=voices.find(voice=>voice.lang==="en-GB")??voices.find(voice=>voice.lang.startsWith("en"))??null;
 utterance.lang=utterance.voice?.lang||"en-GB";utterance.rate=.92;
 speechSynthesis.speak(utterance);
}

export default function ThemePackLab({pack,badge,previous,onClose,onComplete}:Props){
 const[phase,setPhase]=useState<"learn"|"scenario"|"quiz"|"result">("learn");
 const[quiz,setQuiz]=useState(()=>buildQuiz(pack)),[index,setIndex]=useState(0),[selected,setSelected]=useState<number|null>(null),[correct,setCorrect]=useState(0);
 const reported=useRef(false),item=quiz[index],score=Math.round(correct/quiz.length*100);
 const levelTone=useMemo(()=>`level-${pack.level.toLowerCase()}`,[pack.level]);
 const startQuiz=()=>{setQuiz(buildQuiz(pack));setIndex(0);setSelected(null);setCorrect(0);reported.current=false;setPhase("quiz");scrollTo(0,0)};
 const next=()=>{if(index+1<quiz.length){setIndex(value=>value+1);setSelected(null)}else{const finalScore=Math.round(correct/quiz.length*100);if(!reported.current){reported.current=true;onComplete(finalScore)}setPhase("result");scrollTo(0,0)}};
 const choose=(choice:number)=>{if(selected!==null)return;setSelected(choice);if(choice===item.answer)setCorrect(value=>value+1)};
 const shownScore=phase==="result"?Math.round(correct/quiz.length*100):score;
 return <main className={`themePackView ${levelTone}`}>
  <header className="themePackTop"><button type="button" onClick={()=>{speechSynthesis?.cancel();onClose()}} aria-label="Chiudi">×</button><div><i style={{width:phase==="learn"?"25%":phase==="scenario"?"50%":phase==="quiz"?`${50+(index+1)/quiz.length*45}%`:"100%"}}/></div><b>{pack.level}</b></header>
  <article className="themePackPanel">
   {phase==="learn"&&<><div className="themePackHero"><span className="versionBadge current">{badge}</span><small>{pack.level} · {pack.minutes} min · 10 quiz variabili</small><h1>{pack.title}</h1><p>{pack.summary}</p>{previous&&<em>Già svolta {previous.attempts} {previous.attempts===1?"volta":"volte"} · miglior risultato recente {previous.score}%</em>}{pack.sourceUrl&&<a className="themePackSource" href={pack.sourceUrl} target="_blank" rel="noreferrer">Fonte del contesto: {pack.sourceLabel??"sito ufficiale"} ↗</a>}</div><section className="themeGuide"><span className="eyebrow">Prima capisci, poi usa</span><h2>Guida pratica</h2>{pack.guide.map((line,index)=><p key={line}><b>{index+1}</b><span>{line}</span></p>)}</section><section><div className="themeSectionTitle"><span><small>VOCABOLARIO ATTIVO</small><h2>Ascolta l’inglese e leggi l’esempio</h2></span><b>{pack.vocabulary.length} parole</b></div><div className="themeWordGrid">{pack.vocabulary.map(word=><article className="themeWordCard" key={word.en}><button type="button" onClick={()=>speak(`${word.en}. ${word.example}`)} aria-label={`Ascolta ${word.en}`}>▶</button><div><strong lang="en">{word.en}</strong><span>{word.it}</span><p lang="en">{word.example}</p></div></article>)}</div></section><button className="continue" onClick={()=>{setPhase("scenario");scrollTo(0,0)}}>Vai alla situazione reale <b>→</b></button></>}
   {phase==="scenario"&&<><span className="eyebrow">Ascolto e comprensione</span><h1>{pack.scenario.title}</h1><p className="intro">Prima ascolta senza leggere la traduzione. Puoi mettere in pausa o fermare la voce.</p><div className="themeAudioBar"><button type="button" onClick={()=>speak(pack.scenario.text)}>▶ <span>Ascolta</span></button><button type="button" onClick={()=>speechSynthesis.pause()}>Ⅱ <span>Pausa</span></button><button type="button" onClick={()=>speechSynthesis.resume()}>↻ <span>Riprendi</span></button><button type="button" onClick={()=>speechSynthesis.cancel()}>■ <span>Stop</span></button></div><section className="themeScenario"><small>TESTO IN INGLESE</small><p lang="en">{pack.scenario.text}</p><details><summary>Mostra il significato in italiano</summary><p>{pack.scenario.translation}</p></details></section><button className="continue" onClick={startQuiz}>Inizia i 10 quiz <b>→</b></button></>}
   {phase==="quiz"&&item&&<><div className="themeQuizMeta"><span>Domanda {index+1} di {quiz.length}</span><b>{pack.level}</b></div><h1>{item.prompt}</h1><div className="themeQuizOptions">{item.options.map((option,choice)=>{const state=selected===null?"":choice===item.answer?"correct":choice===selected?"wrong":"";return <button type="button" key={option} className={state} onClick={()=>choose(choice)} disabled={selected!==null}><b>{String.fromCharCode(65+choice)}</b><span>{option}</span></button>})}</div>{selected!==null&&<div className={`themeQuizFeedback ${selected===item.answer?"good":"review"}`}><strong>{selected===item.answer?["Ottimo, hai colto la sfumatura.","Ben fatto: collegamento preciso.","Risposta solida, continua così."][index%3]:"È un punto utile da rinforzare."}</strong><p>{item.explanationIt}</p><small>{selected===item.answer?"La spiegazione consolida anche le risposte corrette.":"Rileggi la regola o l’esempio, poi incontrerai di nuovo il concetto in una forma diversa."}</small></div>}<button className="continue" disabled={selected===null} onClick={next}>{index+1<quiz.length?"Prossima domanda":"Vedi il risultato"} <b>→</b></button></>}
   {phase==="result"&&<div className="themePackResult"><span>{shownScore>=80?"✓":"↗"}</span><small>SESSIONE COMPLETATA</small><strong>{shownScore}%</strong><h1>{shownScore>=85?"Ottima padronanza":shownScore>=65?"Base solida: continuiamo":"Hai individuato cosa allenare"}</h1><p>{shownScore>=85?"Sai riconoscere e usare il lessico della sessione.":shownScore>=65?"Rileggi gli esempi meno immediati e prova un nuovo ordine di domande.":"Nessun problema: ripeti ascolto e vocaboli, poi il quiz cambierà ordine e alternative."}</p><div><button type="button" className="continue" onClick={startQuiz}>Riprova con quiz diversi <b>↻</b></button><button type="button" className="showSolution" onClick={onClose}>Torna ai temi</button></div></div>}
  </article>
 </main>
}
