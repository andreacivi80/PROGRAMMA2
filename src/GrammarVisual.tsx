import type { MobileUnit } from "./curriculum";

type Visual={caption:string;kind:"past"|"pastContinuous"|"present"|"presentContinuous"|"perfect"|"future"|"conditional";note:string};

function visualFor(unit:MobileUnit):Visual|null{
 const key=`${unit.id} ${unit.title}`.toLowerCase();
 if(key.includes("past-continuous"))return{caption:"Azione in corso nel passato",kind:"pastContinuous",note:"La fascia indica la durata; il punto indica l'evento breve che può interromperla."};
 if(key.includes("present-perfect")||key.includes("past-vs-perfect"))return{caption:"Passato collegato al presente",kind:"perfect",note:"Il fatto nasce prima di ora, ma esperienza o risultato sono ancora rilevanti adesso."};
 if(key.includes("present-continuous"))return{caption:"Azione attorno al momento presente",kind:"presentContinuous",note:"Non è soltanto questo secondo: può essere una situazione temporanea del periodo attuale."};
 if(key.includes("present-simple")||key.includes("routine"))return{caption:"Abitudine che si ripete",kind:"present",note:"I punti ripetuti rappresentano routine, fatti e situazioni considerate stabili."};
 if(key.includes("past-simple")||key.includes("irregular"))return{caption:"Evento concluso nel passato",kind:"past",note:"Il punto è chiuso e separato da adesso: yesterday, last week, in 2024."};
 if(key.includes("future")||key.includes("going-to"))return{caption:"Decisione, previsione o piano futuro",kind:"future",note:"La scelta tra will e going to dipende da decisione, prova presente e intenzione."};
 if(key.includes("conditional"))return{caption:"Condizione e conseguenza",kind:"conditional",note:"Leggi prima la condizione con if, poi la conseguenza possibile, ipotetica o irreale."};
 return null;
}

function comparisonFor(unit:MobileUnit){
 const key=`${unit.id} ${unit.title}`.toLowerCase();
 if(key.includes("present-perfect")||key.includes("past-vs-perfect"))return{it:"In italiano il passato prossimo può apparire anche con un tempo concluso.",en:"In inglese, con yesterday, last year o una data conclusa usa normalmente il Past Simple.",example:"I saw her yesterday — non I have seen her yesterday."};
 if(key.includes("present-continuous"))return{it:"L'italiano può usare il presente semplice: «Lavoro da casa questa settimana».",en:"L'inglese mette in evidenza la temporaneità con be + verbo-ing.",example:"I am working from home this week."};
 if(key.includes("present-simple"))return{it:"In italiano il soggetto può restare sottinteso.",en:"In inglese il soggetto va espresso e he/she/it richiede spesso -s.",example:"She works every day — non Works every day."};
 if(key.includes("past-continuous"))return{it:"L'imperfetto italiano spesso descrive lo sfondo o un'azione in corso.",en:"L'inglese usa was/were + verbo-ing e il Past Simple per l'evento breve.",example:"I was cooking when the phone rang."};
 if(key.includes("past-simple")||key.includes("irregular"))return{it:"L'italiano usa passato prossimo o remoto secondo contesto e area.",en:"L'inglese usa il Past Simple per un fatto concluso, con forma irregolare quando necessario.",example:"We went home yesterday — non We have gone home yesterday."};
 if(key.includes("future")||key.includes("conditional"))return{it:"L'italiano usa spesso il presente per un futuro già organizzato.",en:"L'inglese distingue piano, previsione e decisione con strutture diverse.",example:"I am meeting Sara tomorrow / I will call her now."};
 if(key.includes("be-introductions"))return{it:"In italiano diciamo «Ho 30 anni» e possiamo omettere il soggetto.",en:"In inglese si dice I am 30 e il soggetto I è obbligatorio.",example:"I am 30 years old — non I have 30 years."};
 if(key.includes("articles"))return{it:"Gli articoli italiani e inglesi non corrispondono sempre parola per parola.",en:"Scegli a/an per uno non specifico, the per uno identificabile e nessun articolo per generalizzazioni.",example:"I like music / I like the music in this film."};
 return{it:"La struttura italiana può suggerire una traduzione letterale che suona innaturale.",en:"Prima identifica significato, tempo e registro; poi costruisci la frase inglese.",example:unit.grammar.examples[0]?.en??unit.grammar.formulas[0]};
}

export default function GrammarVisual({unit}:{unit:MobileUnit}){
 const visual=visualFor(unit),comparison=comparisonFor(unit);
 return <section className="grammarVisual"><span className="eyebrow">Vedi la regola</span>{visual&&<article className={`tenseTimeline ${visual.kind}`}><h3>{visual.caption}</h3><div className="timelineLabels"><span>PASSATO</span><span>ORA</span><span>FUTURO</span></div><div className="timeTrack"><i className="timeSpan"/><b className="timePoint">●</b><em className="nowPoint">ORA</em>{visual.kind==="present"&&<><u/><u/><u/></>}{visual.kind==="conditional"&&<><strong>IF</strong><small>→ RISULTATO</small></>}</div><p>{visual.note}</p></article>}<article className="languageCompare"><h3>Italiano ↔ inglese</h3><div><b>In italiano</b><p>{comparison.it}</p></div><div><b>In inglese</b><p>{comparison.en}</p></div><blockquote lang="en">{comparison.example}</blockquote></article></section>;
}