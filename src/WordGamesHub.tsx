import {useMemo,useRef,useState} from "react";
import type {Cefr} from "./curriculum";
import {wordGameSets,type CrosswordEntry,type HangmanEntry} from "./wordGames";

type GameKind="crossword"|"hangman"|"wordorder"|"matching"|"memory"|"wordguess"|"millionaire"|"trivia";
type Result={score:number;attempts:number};
type Props={level:Cefr;saved:Record<string,Result>;onComplete:(id:string,score:number)=>void};
type Placed=CrosswordEntry&{row:number;col:number;direction:"across"|"down";number:number};
type Cell={key:string;row:number;col:number;answer:string;number?:number};
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const normal=(value:string)=>value.toUpperCase().replace(/[^A-Z]/g,"");
const shuffle=<T,>(items:T[])=>[...items].sort(()=>Math.random()-.5);

export function buildCrossword(entries:CrosswordEntry[]){
 const size=17,grid=new Map<string,string>(),placed:Placed[]=[];
 const key=(row:number,col:number)=>`${row}:${col}`;
 const canPlace=(answer:string,row:number,col:number,direction:"across"|"down")=>{
  const endRow=row+(direction==="down"?answer.length-1:0),endCol=col+(direction==="across"?answer.length-1:0);
  if(row<1||col<1||endRow>=size-1||endCol>=size-1)return false;
  for(let index=0;index<answer.length;index++){
   const r=row+(direction==="down"?index:0),c=col+(direction==="across"?index:0),existing=grid.get(key(r,c));
   if(existing&&existing!==answer[index])return false;
   if(!existing){
    const neighbours=direction==="across"?[key(r-1,c),key(r+1,c)]:[key(r,c-1),key(r,c+1)];
    if(neighbours.some(item=>grid.has(item)))return false;
   }
  }
  const before=direction==="across"?key(row,col-1):key(row-1,col),after=direction==="across"?key(row,endCol+1):key(endRow+1,col);
  return !grid.has(before)&&!grid.has(after);
 };
 const add=(entry:CrosswordEntry,row:number,col:number,direction:"across"|"down")=>{
  const number=placed.length+1;placed.push({...entry,row,col,direction,number});
  [...entry.answer].forEach((letter,index)=>grid.set(key(row+(direction==="down"?index:0),col+(direction==="across"?index:0)),letter));
 };
 const first=entries[0];add(first,Math.floor(size/2),Math.max(1,Math.floor((size-first.answer.length)/2)),"across");
 for(const entry of entries.slice(1)){
  let found=false;
  for(const existing of placed){
   for(let ownIndex=0;ownIndex<entry.answer.length&&!found;ownIndex++)for(let otherIndex=0;otherIndex<existing.answer.length&&!found;otherIndex++){
    if(entry.answer[ownIndex]!==existing.answer[otherIndex])continue;
    const direction=existing.direction==="across"?"down":"across";
    const crossRow=existing.row+(existing.direction==="down"?otherIndex:0),crossCol=existing.col+(existing.direction==="across"?otherIndex:0);
    const row=crossRow-(direction==="down"?ownIndex:0),col=crossCol-(direction==="across"?ownIndex:0);
    if(canPlace(entry.answer,row,col,direction)){add(entry,row,col,direction);found=true}
   }
  }
 }
 const minRow=Math.min(...placed.map(item=>item.row)),minCol=Math.min(...placed.map(item=>item.col));
 const shifted=placed.map(item=>({...item,row:item.row-minRow,col:item.col-minCol}));
 const cells=new Map<string,Cell>();
 shifted.forEach(entry=>[...entry.answer].forEach((letter,index)=>{
  const row=entry.row+(entry.direction==="down"?index:0),col=entry.col+(entry.direction==="across"?index:0),cellKey=key(row,col),old=cells.get(cellKey);
  cells.set(cellKey,{key:cellKey,row,col,answer:letter,number:index===0?entry.number:old?.number});
 }));
 return{placed:shifted,cells:[...cells.values()],rows:Math.max(...[...cells.values()].map(cell=>cell.row))+1,cols:Math.max(...[...cells.values()].map(cell=>cell.col))+1};
}

function Crossword({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const data=useMemo(()=>buildCrossword(wordGameSets[level].crossword),[level]);
 const[letters,setLetters]=useState<Record<string,string>>({}),[checked,setChecked]=useState(false);
 const inputs=useRef<Record<string,HTMLInputElement|null>>({});
 const correct=data.cells.filter(cell=>letters[cell.key]===cell.answer).length,score=Math.round(correct/data.cells.length*100);
 const update=(cell:Cell,value:string)=>{const letter=normal(value).slice(-1);setLetters(current=>({...current,[cell.key]:letter}));setChecked(false);if(letter){const index=data.cells.findIndex(item=>item.key===cell.key),next=data.cells.slice(index+1).find(item=>!letters[item.key]);if(next)inputs.current[next.key]?.focus()}};
 const verify=()=>{setChecked(true);onDone(score)};
 return <section className="gameSession">
  <header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header>
  <span className="eyebrow">MINI CRUCIVERBA · DEFINIZIONI IN INGLESE</span><h1>Leggi, collega e completa</h1>
  <p className="gameIntro">Tocca una casella e inserisci una lettera. Puoi mostrare una lettera o saltare l’intero cruciverba in qualsiasi momento.</p>
  {saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}
  <div className="crosswordScroller"><div className="crosswordGrid" style={{gridTemplateColumns:`repeat(${data.cols}, minmax(25px,34px))`,gridTemplateRows:`repeat(${data.rows}, minmax(25px,34px))`}}>
   {data.cells.map(cell=><label key={cell.key} style={{gridRow:cell.row+1,gridColumn:cell.col+1}} className={checked?(letters[cell.key]===cell.answer?"right":"needsWork"):""}>{cell.number&&<small>{cell.number}</small>}<input ref={node=>{inputs.current[cell.key]=node}} aria-label={`Casella ${cell.row+1}, ${cell.col+1} del cruciverba`} maxLength={1} value={letters[cell.key]??""} onChange={event=>update(cell,event.target.value)}/></label>)}
  </div></div>
  <div className="crosswordClues"><section><h2>Orizzontali</h2>{data.placed.filter(item=>item.direction==="across").map(item=><p key={item.number}><b>{item.number}</b>{item.clue}</p>)}</section><section><h2>Verticali</h2>{data.placed.filter(item=>item.direction==="down").map(item=><p key={item.number}><b>{item.number}</b>{item.clue}</p>)}</section></div>
  {checked&&<div className={`gameFeedback ${score===100?"perfect":""}`}><strong>{score===100?"Ottimo: cruciverba completato!":"Buon allenamento: rivedi le caselle evidenziate."}</strong><span>{score}% corretto · {correct} lettere su {data.cells.length}</span></div>}
  <div className="gameActions"><button type="button" className="gameQuiet" onClick={()=>{const missing=data.cells.find(cell=>letters[cell.key]!==cell.answer);if(missing)setLetters(current=>({...current,[missing.key]:missing.answer}));setChecked(false)}}>Mostra una lettera</button><button type="button" className="gamePrimary" onClick={verify}>Verifica il cruciverba</button><button type="button" className="gameSkip" onClick={()=>{onDone(0);onBack()}}>Salta il cruciverba</button></div>
 </section>
}

function Hangman({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=useMemo(()=>shuffle(wordGameSets[level].hangman).slice(0,7),[level]),[round,setRound]=useState(0),[guessed,setGuessed]=useState<string[]>([]),[finished,setFinished]=useState(0),[won,setWon]=useState(0);
 const entry:HangmanEntry=entries[round],letters=[...new Set(normal(entry.phrase).split(""))],wrong=guessed.filter(letter=>!letters.includes(letter)).length,lives=7-wrong,complete=letters.every(letter=>guessed.includes(letter));
 const masked=[...entry.phrase].map((letter,index)=>/[A-Z]/i.test(letter)?<span key={index} className={guessed.includes(letter.toUpperCase())?"known":""}>{guessed.includes(letter.toUpperCase())?letter:"_"}</span>:<i key={index}>{letter}</i>);
 const choose=(letter:string)=>{if(guessed.includes(letter)||complete||lives<=0)return;const next=[...guessed,letter];setGuessed(next)};
 const next=()=>{const success=complete,done=finished+1,newWon=won+(success?1:0);setFinished(done);setWon(newWon);if(round+1<entries.length){setRound(value=>value+1);setGuessed([])}else onDone(Math.round(newWon/entries.length*100))};
 return <section className="gameSession">
  <header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header>
  <span className="eyebrow">IMPICCATO · COMPLETA LA FRASE INGLESE</span><h1>Scegli le lettere</h1>
  <p className="gameIntro">Usa l’indizio in inglese. Ogni partita propone sette frasi scelte casualmente da una raccolta di quindici; puoi saltarne una senza uscire dalla sessione.</p>
  {saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}
  <div className="hangmanStatus"><span>{Math.min(round+1,entries.length)} / {entries.length}</span><div>{Array.from({length:7},(_,index)=><i key={index} className={index<lives?"live":""}/>)}</div><b>{Math.max(0,lives)} tentativi rimasti</b></div>
  <div className="hangmanPhrase" lang="en">{masked}</div><p className="hangmanHint"><b>Indizio</b>{entry.hint}</p>
  <div className="letterKeyboard">{alphabet.map(letter=><button type="button" key={letter} disabled={guessed.includes(letter)||complete||lives<=0} className={guessed.includes(letter)?(letters.includes(letter)?"right":"wrong"):""} onClick={()=>choose(letter)}>{letter}</button>)}</div>
  {(complete||lives<=0)&&<div className={`gameFeedback ${complete?"perfect":""}`}><strong>{complete?"Ottimo: frase completata!":"Tentativo utile: ecco la frase completa."}</strong><span lang="en">{entry.phrase}</span></div>}
  <div className="gameActions"><button type="button" className="gameSkip" onClick={next}>{complete||lives<=0?(round+1<entries.length?"Prossima frase":"Concludi la sessione"):"Salta questa frase"}</button></div>
 </section>
}

function WordOrder({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=useMemo(()=>shuffle(wordGameSets[level].hangman).slice(0,7),[level]),[round,setRound]=useState(0),[chosen,setChosen]=useState<number[]>([]),[checked,setChecked]=useState(false),[correct,setCorrect]=useState(0);
 const entry=entries[round],tokens=useMemo(()=>shuffle(entry.phrase.split(" ").map((word,index)=>({word,index}))),[entry.phrase]),built=chosen.map(index=>tokens[index].word).join(" "),isCorrect=built===entry.phrase;
 const check=()=>{if(!built||checked)return;setChecked(true);if(isCorrect)setCorrect(value=>value+1)};
 const next=()=>{if(round+1<entries.length){setRound(value=>value+1);setChosen([]);setChecked(false)}else onDone(Math.round(correct/entries.length*100))};
 return <section className="gameSession"><header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header><span className="eyebrow">ORDINE DELLE PAROLE · COSTRUISCI LA FRASE</span><h1>Metti le parole in ordine</h1><p className="gameIntro">Tocca le parole per costruire una frase inglese naturale. Tocca una parola nella risposta per riportarla tra quelle disponibili.</p>{saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}<div className="gameRound">Frase {round+1} / {entries.length}</div><p className="hangmanHint"><b>Indizio</b>{entry.hint}</p><div className="sentenceBuilder"><div className="sentenceAnswer">{chosen.length?chosen.map((tokenIndex,position)=><button type="button" key={`${tokenIndex}-${position}`} onClick={()=>!checked&&setChosen(values=>values.filter((_,index)=>index!==position))}>{tokens[tokenIndex].word}</button>):<small>La frase comparirà qui…</small>}</div><div className="sentenceTokens">{tokens.map((token,index)=><button type="button" key={`${token.word}-${token.index}`} disabled={chosen.includes(index)||checked} onClick={()=>setChosen(values=>[...values,index])}>{token.word}</button>)}</div></div>{checked&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Ottimo ordine delle parole!":"Rivedi l’ordine naturale della frase."}</strong><span lang="en">{entry.phrase}</span></div>}<div className="gameActions">{checked?<button type="button" className="gamePrimary" onClick={next}>{round+1<entries.length?"Prossima frase":"Concludi la sessione"}</button>:<><button type="button" className="gameSkip" onClick={()=>setChecked(true)}>Salta questa frase</button><button type="button" className="gamePrimary" disabled={!chosen.length} onClick={check}>Verifica la frase</button></>}</div></section>
}

function MatchingGame({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=wordGameSets[level].crossword,[round,setRound]=useState(0),[selected,setSelected]=useState<string|null>(null),[correct,setCorrect]=useState(0);
 const entry=entries[round],options=useMemo(()=>shuffle([entry.answer,...shuffle(entries.filter(item=>item.answer!==entry.answer).map(item=>item.answer)).slice(0,3)]),[entry,entries]),isCorrect=selected===entry.answer;
 const choose=(answer:string)=>{if(selected!==null)return;setSelected(answer);if(answer===entry.answer)setCorrect(value=>value+1)};
 const next=()=>{if(round+1<entries.length){setRound(value=>value+1);setSelected(null)}else onDone(Math.round(correct/entries.length*100))};
 return <section className="gameSession"><header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header><span className="eyebrow">ABBINAMENTO · PAROLA E DEFINIZIONE</span><h1>Trova la parola inglese</h1><p className="gameIntro">Leggi la definizione in inglese e scegli la parola corrispondente.</p>{saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}<div className="gameRound">Abbinamento {round+1} / {entries.length}</div><div className="matchingClue" lang="en">{entry.clue}</div><div className="matchingOptions">{options.map(option=><button type="button" key={option} disabled={selected!==null} className={selected===null?"":option===entry.answer?"right":option===selected?"wrong":""} onClick={()=>choose(option)}>{option}</button>)}</div>{selected!==null&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Abbinamento corretto!":"Tentativo utile: collega l’indizio alla parola corretta."}</strong><span lang="en">{entry.answer}: {entry.clue}</span></div>}<div className="gameActions">{selected===null?<button type="button" className="gameSkip" onClick={()=>setSelected("")}>Salta questo abbinamento</button>:<button type="button" className="gamePrimary" onClick={next}>{round+1<entries.length?"Prossimo abbinamento":"Concludi la sessione"}</button>}</div></section>
}

type MemoryCard={id:string;pair:string;kind:"word"|"clue";text:string};
function MemoryGame({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const pairs=useMemo(()=>shuffle(wordGameSets[level].crossword).slice(0,6),[level]);
 const cards=useMemo<MemoryCard[]>(()=>shuffle(pairs.flatMap(item=>[
  {id:`${item.answer}-word`,pair:item.answer,kind:"word",text:item.answer},
  {id:`${item.answer}-clue`,pair:item.answer,kind:"clue",text:item.clue}
 ])),[pairs]);
 const[open,setOpen]=useState<string[]>([]),[matched,setMatched]=useState<string[]>([]),[moves,setMoves]=useState(0);
 const choose=(card:MemoryCard)=>{if(open.length>=2||open.includes(card.id)||matched.includes(card.pair))return;if(open.length===0){setOpen([card.id]);return}const first=cards.find(item=>item.id===open[0])!;setOpen([open[0],card.id]);setMoves(value=>value+1);if(first.pair===card.pair)setMatched(values=>[...values,card.pair])};
 const continueGame=()=>{if(matched.length===pairs.length){onDone(Math.min(100,Math.round((pairs.length/Math.max(1,moves))*100)));return}setOpen([])};
 return <section className="gameSession memorySession"><header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header><span className="eyebrow">MEMORY · PAROLA E DEFINIZIONE</span><h1>Trova le coppie</h1><p className="gameIntro">Abbina sei parole alle rispettive definizioni inglesi. Le carte cambiano posizione a ogni partita.</p>{saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}<div className="memoryStatus"><b>{matched.length} / {pairs.length} coppie</b><span>{moves} tentativi</span></div><div className="memoryGrid">{cards.map(card=>{const visible=open.includes(card.id)||matched.includes(card.pair);return <button type="button" key={card.id} disabled={open.length>=2||matched.includes(card.pair)} className={`${visible?"open":""} ${matched.includes(card.pair)?"matched":""} ${card.kind}`} onClick={()=>choose(card)}>{visible?<><small>{card.kind==="word"?"PAROLA":"DEFINIZIONE"}</small><span lang="en">{card.text}</span></>:<b>?</b>}</button>})}</div>{open.length===2&&<><div className={`gameFeedback ${cards.find(item=>item.id===open[0])?.pair===cards.find(item=>item.id===open[1])?.pair?"perfect":""}`}><strong>{cards.find(item=>item.id===open[0])?.pair===cards.find(item=>item.id===open[1])?.pair?"Coppia corretta!":"Non è questa la coppia: confronta significato e parola."}</strong></div><button type="button" className="gamePrimary memoryContinue" onClick={continueGame}>{matched.length===pairs.length?"Concludi la sessione":"Continua"}</button></>}</section>
}

function WordGuessGame({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=useMemo(()=>shuffle(wordGameSets[level].crossword).slice(0,6),[level]);
 const[index,setIndex]=useState(0),[answer,setAnswer]=useState(""),[checked,setChecked]=useState(false),[correct,setCorrect]=useState(0),[revealed,setRevealed]=useState(0),entry=entries[index],expected=normal(entry.answer),received=normal(answer),isCorrect=received===expected;
 const revealOrder=[0,expected.length-1,...Array.from({length:Math.max(0,expected.length-2)},(_,position)=>position+1)];
 const mask=[...expected].map((letter,position)=>revealOrder.slice(0,revealed).includes(position)?letter:"_").join(" ");
 const check=()=>{if(!received||checked)return;setChecked(true);if(isCorrect)setCorrect(value=>value+1)};
 const next=()=>{if(index+1<entries.length){setIndex(value=>value+1);setAnswer("");setChecked(false);setRevealed(0)}else onDone(Math.round(correct/entries.length*100))};
 return <section className="gameSession wordGuessSession"><header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header><span className="eyebrow">PAROLA MISTERIOSA · RICHIAMO ATTIVO</span><h1>Scrivi la parola</h1><p className="gameIntro">Leggi la definizione inglese e recupera la parola senza opzioni tra cui scegliere. Se serve, scopri una lettera.</p>{saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}<div className="gameRound">Parola {index+1} / {entries.length}</div><div className="matchingClue" lang="en">{entry.clue}</div><div className="mysteryPattern" aria-label={`${expected.length} lettere`}>{mask}</div><label className="mysteryInput">La tua risposta<input lang="en" autoComplete="off" value={answer} disabled={checked} onChange={event=>setAnswer(event.target.value)} placeholder="Scrivi la parola inglese" /></label>{checked&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Esatto: l’hai recuperata senza riconoscerla tra opzioni.":"Confronta la tua risposta con la soluzione."}</strong><span lang="en">{entry.answer}: {entry.clue}</span></div>}<div className="gameActions">{checked?<button type="button" className="gamePrimary" onClick={next}>{index+1<entries.length?"Prossima parola":"Concludi la sessione"}</button>:<><button type="button" className="gameQuiet" disabled={revealed>=expected.length} onClick={()=>setRevealed(value=>Math.min(expected.length,value+1))}>Mostra una lettera</button><button type="button" className="gamePrimary" disabled={!received} onClick={check}>Verifica la parola</button><button type="button" className="gameSkip" onClick={()=>setChecked(true)}>Mostra la soluzione</button></>}</div></section>
}
type GameQuestion={category:"Words"|"Definitions"|"Sentences"|"Everyday";prompt:string;options:string[];answer:number;explanation:string};
const categoryIt:Record<GameQuestion["category"],string>={Words:"Parole",Definitions:"Definizioni",Sentences:"Frasi",Everyday:"Uso quotidiano"};
function questionPool(level:Cefr):GameQuestion[]{
 const set=wordGameSets[level],answers=set.crossword.map(item=>item.answer),phrases=set.hangman.map(item=>item.phrase),allPhraseWords=[...new Set(phrases.flatMap(phrase=>phrase.split(" ")).filter(word=>word.length>2))];
 const words=set.crossword.map((item,index)=>{const options=shuffle([item.answer,...shuffle(answers.filter(answer=>answer!==item.answer)).slice(0,3)]);return{category:"Definitions" as const,prompt:item.clue,options,answer:options.indexOf(item.answer),explanation:`${item.answer}: ${item.clue}`}});
 const reverse=set.crossword.slice(0,5).map(item=>{const clues=shuffle([item.clue,...shuffle(set.crossword.filter(other=>other.answer!==item.answer).map(other=>other.clue)).slice(0,3)]);return{category:"Words" as const,prompt:`Which definition matches “${item.answer}”?`,options:clues,answer:clues.indexOf(item.clue),explanation:`${item.answer}: ${item.clue}`}});
 const sentences=set.hangman.map(item=>{const words=item.phrase.split(" "),targetIndex=Math.max(1,words.findIndex(word=>word.length===Math.max(...words.map(value=>value.length)))),target=words[targetIndex],prompt=words.map((word,index)=>index===targetIndex?"_____":word).join(" "),options=shuffle([target,...shuffle(allPhraseWords.filter(word=>word!==target)).slice(0,3)]);return{category:"Sentences" as const,prompt:`Complete: ${prompt}`,options,answer:options.indexOf(target),explanation:item.phrase}});
 const everyday=set.hangman.map(item=>{const options=shuffle([item.phrase,...shuffle(phrases.filter(phrase=>phrase!==item.phrase)).slice(0,3)]);return{category:"Everyday" as const,prompt:item.hint,options,answer:options.indexOf(item.phrase),explanation:item.phrase}});
 return shuffle([...words,...reverse,...sentences,...everyday]);
}
const moneySteps=["€100","€200","€300","€500","€1,000","€2,000","€4,000","€8,000","€16,000","€32,000"];
function MillionaireGame({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const questions=useMemo(()=>questionPool(level).slice(0,10),[level]),[index,setIndex]=useState(0),[selected,setSelected]=useState<number|null>(null),[correct,setCorrect]=useState(0),[hidden,setHidden]=useState<number[]>([]),[fiftyUsed,setFiftyUsed]=useState(false),question=questions[index],isCorrect=selected===question.answer;
 const choose=(choice:number)=>{if(selected!==null)return;setSelected(choice);if(choice===question.answer)setCorrect(value=>value+1)};
 const next=()=>{if(index+1<questions.length){setIndex(value=>value+1);setSelected(null);setHidden([])}else onDone(Math.round(correct/questions.length*100))};
 const fifty=()=>{if(fiftyUsed||selected!==null)return;setFiftyUsed(true);setHidden(shuffle(question.options.map((_,choice)=>choice).filter(choice=>choice!==question.answer)).slice(0,2))};
 return <section className="gameSession millionaireSession"><header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header><span className="eyebrow">MILIONARIO IN INGLESE · {level}</span><h1>È la tua risposta definitiva?</h1><p className="gameIntro">Dieci domande di valore crescente. Usa una volta l’aiuto 50:50 oppure salta una domanda e continua.</p>{saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}<div className="millionaireTop"><strong>{moneySteps[index]}</strong><span>Domanda {index+1} / {questions.length}</span><button type="button" disabled={fiftyUsed||selected!==null} onClick={fifty}>50:50</button></div><div className="triviaCategory">{question.category}</div><div className="millionaireQuestion">{question.prompt}</div><div className="matchingOptions millionaireOptions">{question.options.map((option,choice)=><button type="button" key={option} hidden={hidden.includes(choice)} disabled={selected!==null} className={selected===null?"":choice===question.answer?"right":choice===selected?"wrong":""} onClick={()=>choose(choice)}><b>{String.fromCharCode(65+choice)}</b>{option}</button>)}</div>{selected!==null&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Corretto: sali di livello!":"Buon tentativo: fissa la spiegazione prima di continuare."}</strong><span>{question.explanation}</span></div>}<div className="gameActions">{selected===null?<button type="button" className="gameSkip" onClick={()=>setSelected(-1)}>Salta questa domanda</button>:<button type="button" className="gamePrimary" onClick={next}>{index+1<questions.length?"Prossima domanda":"Vedi il risultato finale"}</button>}</div><ol className="moneyLadder">{[...moneySteps].reverse().map((step,reverseIndex)=>{const position=moneySteps.length-1-reverseIndex;return <li key={step} className={position===index?"active":position<index?"passed":""}><b>{position+1}</b><span>{step}</span></li>})}</ol></section>
}

function TriviaGame({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const questions=useMemo(()=>questionPool(level).slice(0,12),[level]),[index,setIndex]=useState(0),[selected,setSelected]=useState<number|null>(null),[correct,setCorrect]=useState(0),question=questions[index],isCorrect=selected===question.answer;
 const choose=(choice:number)=>{if(selected!==null)return;setSelected(choice);if(choice===question.answer)setCorrect(value=>value+1)};const next=()=>{if(index+1<questions.length){setIndex(value=>value+1);setSelected(null)}else onDone(Math.round(correct/questions.length*100))};
 const categoryCounts=questions.slice(0,index).reduce<Record<string,number>>((counts,item)=>({...counts,[item.category]:(counts[item.category]??0)+1}),{});
 return <section className="gameSession triviaSession"><header><button type="button" onClick={onBack}>← Giochi</button><b>{level}</b></header><span className="eyebrow">TRIVIA · QUATTRO CATEGORIE</span><h1>Completa le quattro categorie</h1><p className="gameIntro">Vocabolario, definizioni, ordine delle parole e inglese quotidiano. Puoi saltare qualsiasi domanda.</p>{saved&&<small className="gamePrevious">Migliore risultato: {saved.score}% · {saved.attempts} tentativi</small>}<div className="triviaWheel">{(["Words","Definitions","Sentences","Everyday"] as const).map(category=><span key={category} className={`${category.toLowerCase()} ${categoryCounts[category]?"earned":""}`} title={categoryIt[category]}>{categoryCounts[category]??0}</span>)}</div><div className={`triviaCategory ${question.category.toLowerCase()}`}>{categoryIt[question.category]}</div><div className="matchingClue">{question.prompt}</div><div className="matchingOptions">{question.options.map((option,choice)=><button type="button" key={option} disabled={selected!==null} className={selected===null?"":choice===question.answer?"right":choice===selected?"wrong":""} onClick={()=>choose(choice)}>{option}</button>)}</div>{selected!==null&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Corretto: categoria completata!":"Tentativo utile: rivedi questo collegamento."}</strong><span>{question.explanation}</span></div>}<div className="gameActions">{selected===null?<button type="button" className="gameSkip" onClick={()=>setSelected(-1)}>Salta questa domanda</button>:<button type="button" className="gamePrimary" onClick={next}>{index+1<questions.length?"Prossima categoria":"Vedi il risultato finale"}</button>}</div></section>
}
export default function WordGamesHub({level,saved,onComplete}:Props){
 const[game,setGame]=useState<GameKind|null>(null),id=(kind:GameKind)=>`${kind}-${level.toLowerCase()}`;
 if(game==="crossword")return <Crossword level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="hangman")return <Hangman level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="wordorder")return <WordOrder level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="matching")return <MatchingGame level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="memory")return <MemoryGame level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="wordguess")return <WordGuessGame level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="millionaire")return <MillionaireGame level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="trivia")return <TriviaGame level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 return <section className="wordGamesHub">
  <div className="themeHeading"><span><small>GIOCHI IN INGLESE · {level}</small><h2>Impara giocando</h2></span><b>8 sessioni</b></div>
  <p className="readingHubIntro">Otto giochi autonomi con vocabolario e strutture calibrati per il livello {level}. Le istruzioni sono in italiano; indizi e contenuti da risolvere restano in inglese.</p>
  <div className="gameCards">
   <button type="button" onClick={()=>setGame("crossword")}><b>▦</b><strong>Mini cruciverba</strong><p>Leggi le definizioni inglesi e collega le parole nella griglia.</p><small>10–15 min · {wordGameSets[level].crossword.length} definizioni{saved[id("crossword")]?` · record ${saved[id("crossword")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("hangman")}><b>_?</b><strong>Frasi dell’impiccato</strong><p>Completa sette frasi casuali da una raccolta più ampia e progressiva.</p><small>12–18 min · 7 su {wordGameSets[level].hangman.length} frasi{saved[id("hangman")]?` · record ${saved[id("hangman")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("wordorder")}><b>1·2</b><strong>Ordine delle parole</strong><p>Ricostruisci sette frasi casuali toccando le parole nell’ordine corretto.</p><small>10–15 min · 7 su {wordGameSets[level].hangman.length} frasi{saved[id("wordorder")]?` · record ${saved[id("wordorder")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("matching")}><b>↔</b><strong>Abbina il significato</strong><p>Abbina ogni definizione inglese alla parola corretta.</p><small>8–12 min · 8 abbinamenti{saved[id("matching")]?` · record ${saved[id("matching")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("memory")}><b>▦</b><strong>Memory inglese</strong><p>Trova le coppie tra parole e definizioni senza affidarti alla posizione.</p><small>10–15 min · 6 coppie{saved[id("memory")]?` · record ${saved[id("memory")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("wordguess")}><b>?</b><strong>Parola misteriosa</strong><p>Recupera e scrivi la parola dalla sola definizione inglese.</p><small>10–15 min · 6 parole{saved[id("wordguess")]?` · record ${saved[id("wordguess")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("millionaire")}><b>€?</b><strong>Milionario in inglese</strong><p>Scala i livelli con dieci domande e l’aiuto 50:50.</p><small>12–18 min · 10 domande{saved[id("millionaire")]?` · record ${saved[id("millionaire")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("trivia")}><b>●</b><strong>Sfida a categorie</strong><p>Completa quattro categorie: parole, definizioni, frasi e inglese quotidiano.</p><small>12–18 min · 12 domande{saved[id("trivia")]?` · record ${saved[id("trivia")].score}%`:""}</small></button>
  </div>
 </section>
}
