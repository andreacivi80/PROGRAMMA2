import {useMemo,useState} from "react";
import type {Choice,MobileUnit} from "./curriculum";
import ConceptText from "./ConceptText";

type ReviewQuestion=Choice&{unitId:string;unitTitle:string};
type Props={level:string;units:MobileUnit[];final:boolean;onClose:()=>void;onComplete:(score:number)=>void;onOpenUnit:(unit:MobileUnit)=>void};
const shuffle=<T,>(values:T[])=>[...values].sort(()=>Math.random()-.5);
function optionsFor(correct:string,pool:string[]){const wrong=shuffle([...new Set(pool.filter(value=>value&&value!==correct))]).slice(0,2),answer=Math.floor(Math.random()*3),options=[...wrong];while(options.length<2)options.push(options.length?"Un’altra forma":"Nessuna delle precedenti");options.splice(answer,0,correct);return{options,answer}}
function randomChoice(choice:Choice,unit:MobileUnit):ReviewQuestion{const entries=shuffle(choice.options.map((value,index)=>({value,ok:index===choice.answer}))),answer=entries.findIndex(entry=>entry.ok);return{...choice,options:entries.map(entry=>entry.value),answer,unitId:unit.id,unitTitle:unit.title}}
function buildBank(units:MobileUnit[],target:number):ReviewQuestion[]{
 const vocab=units.flatMap(unit=>unit.vocabulary),examples=units.flatMap(unit=>unit.grammar.examples),clozeAnswers=units.flatMap(unit=>unit.writing.cloze.flatMap(item=>item.answers));
 const bank:ReviewQuestion[]=[];
 units.forEach(unit=>{
  unit.quickCheck.forEach(choice=>bank.push(randomChoice(choice,unit)));
  unit.vocabulary.forEach(word=>{const built=optionsFor(word.en,vocab.map(item=>item.en));bank.push({prompt:`Come si dice «${word.it}»?`,...built,explanationIt:`${word.en} significa «${word.it}». Esempio: ${word.example}`,unitId:unit.id,unitTitle:unit.title})});
  unit.grammar.examples.forEach(example=>{const built=optionsFor(example.en,examples.map(item=>item.en));bank.push({prompt:`Scegli l’inglese corretto per «${example.it}».`,...built,explanationIt:example.noteIt,unitId:unit.id,unitTitle:unit.title})});
  unit.writing.cloze.forEach(item=>{const correct=item.answers[0],built=optionsFor(correct,clozeAnswers);bank.push({prompt:item.prompt,...built,explanationIt:item.hintIt,unitId:unit.id,unitTitle:unit.title})});
 });
 const unique=[...new Map(bank.map(question=>[`${question.prompt}|${question.options[question.answer]}`,question])).values()];
 return shuffle(unique).slice(0,Math.min(target,unique.length));
}
export default function ReviewLab({level,units,final,onClose,onComplete,onOpenUnit}:Props){
 const[run,setRun]=useState(0),[index,setIndex]=useState(0),[pick,setPick]=useState<number|null>(null),[correct,setCorrect]=useState(0),[weak,setWeak]=useState<Record<string,number>>({}),[finished,setFinished]=useState(false),target=final?30:20;
 const questions=useMemo(()=>buildBank(units,target),[units,target,run]),question=questions[index],percent=Math.round(correct/Math.max(1,questions.length)*100),weakUnit=units.find(unit=>unit.id===Object.entries(weak).sort((a,b)=>b[1]-a[1])[0]?.[0]);
 const answer=(option:number)=>{if(pick!==null)return;setPick(option);if(option===question.answer)setCorrect(value=>value+1);else setWeak(values=>({...values,[question.unitId]:(values[question.unitId]??0)+1}))};
 const next=()=>{if(index+1<questions.length){setIndex(value=>value+1);setPick(null);scrollTo(0,0);return}setFinished(true);onComplete(percent);scrollTo(0,0)};
 const restart=()=>{setRun(value=>value+1);setIndex(0);setPick(null);setCorrect(0);setWeak({});setFinished(false);scrollTo(0,0)};
 if(finished)return <div className="reviewView"><div className="reviewTop"><button onClick={onClose}>×</button><b>{level}</b></div><section className="reviewResult"><span>{final?"PROVA FINALE":"RIEPILOGO COMPLETATO"}</span><strong>{percent}%</strong><h1>{percent>=85?"Ottimo consolidamento":percent>=65?"Stai costruendo basi solide":"Hai individuato cosa rinforzare"}</h1><p>Questo risultato serve a scegliere il prossimo passo, non è un giudizio.</p>{weakUnit&&<article><small>SESSIONE CONSIGLIATA</small><h2>{weakUnit.title}</h2><p>Un breve ripasso qui può rendere più sicure le risposte successive.</p><button onClick={()=>onOpenUnit(weakUnit)}>Ripassa questa sessione →</button></article>}<button className="continue" onClick={restart}>Nuovo tentativo con domande diverse <b>↻</b></button><button className="showSolution" onClick={onClose}>Torna al percorso</button></section></div>;
 return <div className="reviewView"><div className="reviewTop"><button aria-label="Chiudi il riepilogo" onClick={onClose}>×</button><div><i style={{width:`${(index+1)/questions.length*100}%`}}/></div><b>{level}</b></div><section className="reviewPanel"><span className="eyebrow">{final?"Prova finale · 30 esercizi":"Riepilogo intermedio · 20 esercizi"}</span><h1>{final?`Consolida tutto il livello ${level}`:`Ripassa le sessioni ${units.length===4?"del blocco":"precedenti"}`}</h1><p className="reviewCounter">Esercizio {index+1} di {questions.length} · le domande cambiano a ogni tentativo</p><article className="reviewQuestion"><small>DA · {question.unitTitle}</small><h2>{question.prompt}</h2><div>{question.options.map((option,optionIndex)=>{const state=pick===null?"":optionIndex===question.answer?"right":optionIndex===pick?"wrong":"dim";return <button key={`${option}-${optionIndex}`} className={state} disabled={pick!==null} onClick={()=>answer(optionIndex)}><b>{String.fromCharCode(65+optionIndex)}</b><span>{option}</span></button>})}</div>{pick!==null&&<aside className={pick===question.answer?"good":"bad"}><strong>{pick===question.answer?"Ben fatto: consolidiamo il motivo.":"Questa è un’ottima occasione per fissare la regola."}</strong><ConceptText text={question.explanationIt}/></aside>}</article><div className="reviewNav"><button type="button" className="showSolution" onClick={next}>Salta domanda</button><button className="continue" disabled={pick===null} onClick={next}>{index+1<questions.length?"Prossimo esercizio":"Vedi il riepilogo"}<b>→</b></button></div></section></div>
}
