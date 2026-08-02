export type AnswerVisualState=""|"right"|"correct"|"wrong"|"correctReveal"|"dim";
export function answerVisualState(index:number|string,selected:number|string|null,answer:number|string,correctClass:"right"|"correct"="right"):AnswerVisualState{
 if(selected===null)return "";
 if(index===selected)return index===answer?correctClass:"wrong";
 if(index===answer)return "correctReveal";
 return "dim";
}
export function answerWasCorrect(selected:number|null,answer:number){return selected!==null&&selected===answer}
export function lockedScore(score:number,alreadySelected:boolean,choice:number,answer:number){return alreadySelected?score:score+(choice===answer?1:0)}
