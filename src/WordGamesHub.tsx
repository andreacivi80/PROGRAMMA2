import {useMemo,useRef,useState} from "react";
import type {Cefr} from "./curriculum";
import {wordGameSets,type CrosswordEntry,type HangmanEntry} from "./wordGames";

type GameKind="crossword"|"hangman"|"wordorder"|"matching";
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
  <header><button type="button" onClick={onBack}>← Games</button><b>{level}</b></header>
  <span className="eyebrow">MINI CROSSWORD · ALL CLUES IN ENGLISH</span><h1>Read, connect and complete</h1>
  <p className="gameIntro">Tap a square and enter one letter. You may reveal a letter or skip the entire puzzle at any time.</p>
  {saved&&<small className="gamePrevious">Previous best: {saved.score}% · {saved.attempts} attempts</small>}
  <div className="crosswordScroller"><div className="crosswordGrid" style={{gridTemplateColumns:`repeat(${data.cols}, minmax(25px,34px))`,gridTemplateRows:`repeat(${data.rows}, minmax(25px,34px))`}}>
   {data.cells.map(cell=><label key={cell.key} style={{gridRow:cell.row+1,gridColumn:cell.col+1}} className={checked?(letters[cell.key]===cell.answer?"right":"needsWork"):""}>{cell.number&&<small>{cell.number}</small>}<input ref={node=>{inputs.current[cell.key]=node}} aria-label={`Crossword square ${cell.row+1}, ${cell.col+1}`} maxLength={1} value={letters[cell.key]??""} onChange={event=>update(cell,event.target.value)}/></label>)}
  </div></div>
  <div className="crosswordClues"><section><h2>Across</h2>{data.placed.filter(item=>item.direction==="across").map(item=><p key={item.number}><b>{item.number}</b>{item.clue}</p>)}</section><section><h2>Down</h2>{data.placed.filter(item=>item.direction==="down").map(item=><p key={item.number}><b>{item.number}</b>{item.clue}</p>)}</section></div>
  {checked&&<div className={`gameFeedback ${score===100?"perfect":""}`}><strong>{score===100?"Excellent — crossword complete!":"Good practice — review the highlighted squares."}</strong><span>{score}% correct · {correct} of {data.cells.length} letters</span></div>}
  <div className="gameActions"><button type="button" className="gameQuiet" onClick={()=>{const missing=data.cells.find(cell=>letters[cell.key]!==cell.answer);if(missing)setLetters(current=>({...current,[missing.key]:missing.answer}));setChecked(false)}}>Reveal one letter</button><button type="button" className="gamePrimary" onClick={verify}>Check crossword</button><button type="button" className="gameSkip" onClick={()=>{onDone(0);onBack()}}>Skip puzzle</button></div>
 </section>
}

function Hangman({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=wordGameSets[level].hangman,[round,setRound]=useState(0),[guessed,setGuessed]=useState<string[]>([]),[finished,setFinished]=useState(0),[won,setWon]=useState(0);
 const entry:HangmanEntry=entries[round],letters=[...new Set(normal(entry.phrase).split(""))],wrong=guessed.filter(letter=>!letters.includes(letter)).length,lives=7-wrong,complete=letters.every(letter=>guessed.includes(letter));
 const masked=[...entry.phrase].map((letter,index)=>/[A-Z]/i.test(letter)?<span key={index} className={guessed.includes(letter.toUpperCase())?"known":""}>{guessed.includes(letter.toUpperCase())?letter:"_"}</span>:<i key={index}>{letter}</i>);
 const choose=(letter:string)=>{if(guessed.includes(letter)||complete||lives<=0)return;const next=[...guessed,letter];setGuessed(next)};
 const next=()=>{const success=complete,done=finished+1,newWon=won+(success?1:0);setFinished(done);setWon(newWon);if(round+1<entries.length){setRound(value=>value+1);setGuessed([])}else onDone(Math.round(newWon/entries.length*100))};
 return <section className="gameSession">
  <header><button type="button" onClick={onBack}>← Games</button><b>{level}</b></header>
  <span className="eyebrow">HANGMAN · COMPLETE THE ENGLISH PHRASE</span><h1>Choose the letters</h1>
  <p className="gameIntro">Use the English clue. Complete five level-appropriate phrases; you can skip one without leaving the session.</p>
  {saved&&<small className="gamePrevious">Previous best: {saved.score}% · {saved.attempts} attempts</small>}
  <div className="hangmanStatus"><span>{Math.min(round+1,entries.length)} / {entries.length}</span><div>{Array.from({length:7},(_,index)=><i key={index} className={index<lives?"live":""}/>)}</div><b>{Math.max(0,lives)} tries left</b></div>
  <div className="hangmanPhrase" lang="en">{masked}</div><p className="hangmanHint"><b>Clue</b>{entry.hint}</p>
  <div className="letterKeyboard">{alphabet.map(letter=><button type="button" key={letter} disabled={guessed.includes(letter)||complete||lives<=0} className={guessed.includes(letter)?(letters.includes(letter)?"right":"wrong"):""} onClick={()=>choose(letter)}>{letter}</button>)}</div>
  {(complete||lives<=0)&&<div className={`gameFeedback ${complete?"perfect":""}`}><strong>{complete?"Excellent — phrase completed!":"Useful attempt — here is the complete phrase."}</strong><span lang="en">{entry.phrase}</span></div>}
  <div className="gameActions"><button type="button" className="gameSkip" onClick={next}>{complete||lives<=0?(round+1<entries.length?"Next phrase":"Finish session"):"Skip this phrase"}</button></div>
 </section>
}

function WordOrder({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=wordGameSets[level].hangman,[round,setRound]=useState(0),[chosen,setChosen]=useState<number[]>([]),[checked,setChecked]=useState(false),[correct,setCorrect]=useState(0);
 const entry=entries[round],tokens=useMemo(()=>shuffle(entry.phrase.split(" ").map((word,index)=>({word,index}))),[entry.phrase]),built=chosen.map(index=>tokens[index].word).join(" "),isCorrect=built===entry.phrase;
 const check=()=>{if(!built||checked)return;setChecked(true);if(isCorrect)setCorrect(value=>value+1)};
 const next=()=>{if(round+1<entries.length){setRound(value=>value+1);setChosen([]);setChecked(false)}else onDone(Math.round(correct/entries.length*100))};
 return <section className="gameSession"><header><button type="button" onClick={onBack}>← Games</button><b>{level}</b></header><span className="eyebrow">WORD ORDER · BUILD THE SENTENCE</span><h1>Put the words in order</h1><p className="gameIntro">Tap the words to build a natural English sentence. Tap a word in your answer to move it back.</p>{saved&&<small className="gamePrevious">Previous best: {saved.score}% · {saved.attempts} attempts</small>}<div className="gameRound">Sentence {round+1} / {entries.length}</div><p className="hangmanHint"><b>Clue</b>{entry.hint}</p><div className="sentenceBuilder"><div className="sentenceAnswer">{chosen.length?chosen.map((tokenIndex,position)=><button type="button" key={`${tokenIndex}-${position}`} onClick={()=>!checked&&setChosen(values=>values.filter((_,index)=>index!==position))}>{tokens[tokenIndex].word}</button>):<small>Your sentence appears here…</small>}</div><div className="sentenceTokens">{tokens.map((token,index)=><button type="button" key={`${token.word}-${token.index}`} disabled={chosen.includes(index)||checked} onClick={()=>setChosen(values=>[...values,index])}>{token.word}</button>)}</div></div>{checked&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Excellent word order!":"Review the natural word order."}</strong><span lang="en">{entry.phrase}</span></div>}<div className="gameActions">{checked?<button type="button" className="gamePrimary" onClick={next}>{round+1<entries.length?"Next sentence":"Finish session"}</button>:<><button type="button" className="gameSkip" onClick={()=>setChecked(true)}>Skip this sentence</button><button type="button" className="gamePrimary" disabled={!chosen.length} onClick={check}>Check sentence</button></>}</div></section>
}

function MatchingGame({level,saved,onDone,onBack}:{level:Cefr;saved?:Result;onDone:(score:number)=>void;onBack:()=>void}){
 const entries=wordGameSets[level].crossword,[round,setRound]=useState(0),[selected,setSelected]=useState<string|null>(null),[correct,setCorrect]=useState(0);
 const entry=entries[round],options=useMemo(()=>shuffle([entry.answer,...shuffle(entries.filter(item=>item.answer!==entry.answer).map(item=>item.answer)).slice(0,3)]),[entry,entries]),isCorrect=selected===entry.answer;
 const choose=(answer:string)=>{if(selected!==null)return;setSelected(answer);if(answer===entry.answer)setCorrect(value=>value+1)};
 const next=()=>{if(round+1<entries.length){setRound(value=>value+1);setSelected(null)}else onDone(Math.round(correct/entries.length*100))};
 return <section className="gameSession"><header><button type="button" onClick={onBack}>← Games</button><b>{level}</b></header><span className="eyebrow">MATCH · WORD AND DEFINITION</span><h1>Find the English word</h1><p className="gameIntro">Read the English definition and choose the word that matches it.</p>{saved&&<small className="gamePrevious">Previous best: {saved.score}% · {saved.attempts} attempts</small>}<div className="gameRound">Match {round+1} / {entries.length}</div><div className="matchingClue" lang="en">{entry.clue}</div><div className="matchingOptions">{options.map(option=><button type="button" key={option} disabled={selected!==null} className={selected===null?"":option===entry.answer?"right":option===selected?"wrong":""} onClick={()=>choose(option)}>{option}</button>)}</div>{selected!==null&&<div className={`gameFeedback ${isCorrect?"perfect":""}`}><strong>{isCorrect?"Correct match!":"Useful attempt — connect the clue to this word."}</strong><span lang="en">{entry.answer}: {entry.clue}</span></div>}<div className="gameActions">{selected===null?<button type="button" className="gameSkip" onClick={()=>setSelected("")}>Skip this match</button>:<button type="button" className="gamePrimary" onClick={next}>{round+1<entries.length?"Next match":"Finish session"}</button>}</div></section>
}
export default function WordGamesHub({level,saved,onComplete}:Props){
 const[game,setGame]=useState<GameKind|null>(null),id=(kind:GameKind)=>`${kind}-${level.toLowerCase()}`;
 if(game==="crossword")return <Crossword level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="hangman")return <Hangman level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="wordorder")return <WordOrder level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 if(game==="matching")return <MatchingGame level={level} saved={saved[id(game)]} onDone={score=>onComplete(id(game),score)} onBack={()=>setGame(null)}/>;
 return <section className="wordGamesHub">
  <div className="themeHeading"><span><small>WORD GAMES · {level}</small><h2>Play with English</h2></span><b>4 sessions</b></div>
  <p className="readingHubIntro">Four autonomous games with vocabulary and sentence structures calibrated for {level}. Instructions, clues and answers are in English.</p>
  <div className="gameCards">
   <button type="button" onClick={()=>setGame("crossword")}><span>NEW 3.0</span><b>▦</b><strong>Mini Crossword</strong><p>Read English definitions and connect the words in the grid.</p><small>10–15 min · {wordGameSets[level].crossword.length} clues{saved[id("crossword")]?` · best ${saved[id("crossword")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("hangman")}><span>NEW 3.0</span><b>_?</b><strong>Hangman Phrases</strong><p>Choose letters and complete five phrases appropriate for your level.</p><small>8–12 min · {wordGameSets[level].hangman.length} phrases{saved[id("hangman")]?` · best ${saved[id("hangman")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("wordorder")}><span>NEW 3.0</span><b>1·2</b><strong>Word Order</strong><p>Rebuild complete English sentences by tapping the words in order.</p><small>8–12 min · 5 sentences{saved[id("wordorder")]?` · best ${saved[id("wordorder")].score}%`:""}</small></button>
   <button type="button" onClick={()=>setGame("matching")}><span>NEW 3.0</span><b>↔</b><strong>Match the Meaning</strong><p>Match each English definition to the correct English word.</p><small>8–12 min · 8 matches{saved[id("matching")]?` · best ${saved[id("matching")].score}%`:""}</small></button>
  </div>
 </section>
}
