import { createServer } from "vite";
const normalize=value=>value.toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi," ").replace(/\s+/g," ").trim();
const words=value=>new Set(normalize(value).split(" ").filter(word=>word.length>2));
const similarity=(left,right)=>{const a=words(left),b=words(right),shared=[...a].filter(word=>b.has(word)).length,union=new Set([...a,...b]).size;return union?shared/union:0};
const server=await createServer({server:{middlewareMode:true},appType:"custom",logLevel:"silent"});
try{
 const {mobileCurriculum}=await server.ssrLoadModule("/src/curriculum.ts");
 const {buildSupplementaryQuiz,supplementaryBankFor,supplementaryFamily,supplementaryFingerprint}=await server.ssrLoadModule("/src/supplementaryQuiz.ts");
 const rows=mobileCurriculum.map(unit=>{
  const bank=supplementaryBankFor(unit);
  const base=[...unit.writing.cloze.map(item=>item.prompt),...unit.listening.questions.map(item=>item.prompt),...unit.quickCheck.map(item=>item.prompt),...unit.vocabulary.flatMap(word=>["Come si dice "+word.it+"?","Quale frase significa "+word.it+"?","Scegli l inglese corretto per "+word.it+"."])];
  const baseSet=new Set(base.map(normalize)),promptCounts=new Map(),fingerprintCounts=new Map();
  for(const question of bank){const prompt=normalize(question.prompt),fingerprint=supplementaryFingerprint(question);promptCounts.set(prompt,(promptCounts.get(prompt)||0)+1);fingerprintCounts.set(fingerprint,(fingerprintCounts.get(fingerprint)||0)+1)}
  const exactOverlap=bank.filter(question=>baseSet.has(normalize(question.prompt))).length;
  const duplicatePrompts=[...promptCounts.values()].filter(count=>count>1).length;
  const duplicateFingerprints=[...fingerprintCounts.values()].filter(count=>count>1).length;
  const highSimilarity=bank.filter(question=>base.some(prompt=>similarity(question.prompt,prompt)>=.82)).length;
  const generated=Array.from({length:5},()=>buildSupplementaryQuiz(unit,15));
  const weakGenerations=generated.filter(session=>new Set(session.map(supplementaryFamily)).size<Math.min(6,session.length)||session.some((question,index)=>index>0&&supplementaryFamily(question)===supplementaryFamily(session[index-1]))).length;
  return{id:unit.id,level:unit.cefr,bank:bank.length,exactOverlap,duplicatePrompts,duplicateFingerprints,highSimilarity,weakGenerations};
 });
 const levelSummary=Object.fromEntries(["A1","A2","B1","B2","C1"].map(level=>{const subset=rows.filter(row=>row.level===level);return[level,{units:subset.length,minBank:Math.min(...subset.map(row=>row.bank)),averageBank:Math.round(subset.reduce((sum,row)=>sum+row.bank,0)/subset.length*10)/10,maxBank:Math.max(...subset.map(row=>row.bank)),exactOverlap:subset.reduce((sum,row)=>sum+row.exactOverlap,0),duplicatePrompts:subset.reduce((sum,row)=>sum+row.duplicatePrompts,0),highSimilarity:subset.reduce((sum,row)=>sum+row.highSimilarity,0)}]}));
 const failures=rows.filter(row=>row.bank<15||row.exactOverlap||row.duplicatePrompts||row.duplicateFingerprints||row.highSimilarity||row.weakGenerations);
 console.log(JSON.stringify({units:rows.length,minimumBank:Math.min(...rows.map(row=>row.bank)),averageBank:Math.round(rows.reduce((sum,row)=>sum+row.bank,0)/rows.length*10)/10,maximumBank:Math.max(...rows.map(row=>row.bank)),levelSummary,failures},null,2));
 if(failures.length||rows.length!==60)process.exitCode=1;
}finally{await server.close()}
