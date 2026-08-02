type UnitRef={day:number;id:string;title:string;cefr:string};
type DayResult={score:number;minutes:number;completedAt?:string;writing?:string};
type PortfolioInput={days:Record<string,DayResult>;savedPhrases?:{en:string;it?:string;source:string;savedAt:string}[];weeklyChallenges?:Record<string,{response:string;completedAt:string}>};
export type PortfolioWriting={title:string;level:string;text:string;score:number;date?:string};
export function buildLocalPortfolio(progress:PortfolioInput,units:UnitRef[]){
 const writings=Object.entries(progress.days).flatMap(([day,result])=>{const unit=units.find(candidate=>String(candidate.day)===day);return result.writing?.trim()?[{title:unit?.title??`Sessione ${day}`,level:unit?.cefr??"",text:result.writing.trim(),score:result.score,date:result.completedAt}]:[]}).sort((a,b)=>(a.date??"").localeCompare(b.date??""));
 const challenges=Object.values(progress.weeklyChallenges??{}).filter(item=>item.response.trim()).sort((a,b)=>a.completedAt.localeCompare(b.completedAt));
 return {writings,challenges,phrases:[...(progress.savedPhrases??[])].sort((a,b)=>a.savedAt.localeCompare(b.savedAt)),firstWriting:writings[0],latestWriting:writings.at(-1)};
}
