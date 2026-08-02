import type { Cefr } from "./curriculum";
import type { WritingAnalysis } from "./languageAnalysis";
export type RubricArea = { area: "Correttezza" | "Organizzazione" | "Varietà" | "Registro" | "Sviluppo"; score: number; feedback: string };
const targets: Record<Cefr, { min: number; connectors: string[]; advanced: string[] }> = {
  A1:{min:20,connectors:["and","but","because"],advanced:[]}, A2:{min:45,connectors:["and","but","because","so","then"],advanced:["when","if"]},
  B1:{min:80,connectors:["because","however","although","while","therefore"],advanced:["which","who","since","unless"]},
  B2:{min:120,connectors:["however","although","whereas","therefore","nevertheless"],advanced:["despite","provided","consequently","furthermore"]},
  C1:{min:160,connectors:["nevertheless","whereas","moreover","consequently","nonetheless"],advanced:["insofar","notwithstanding","albeit","thereby"]},
};
export function evaluateWritingRubric(text: string, level: Cefr, analysis: WritingAnalysis) {
  const clean=text.trim(), lower=` ${clean.toLowerCase()} `, words=clean.match(/\b[A-Za-z']+\b/g)??[], sentences=clean.split(/[.!?]+/).filter(value=>value.trim()), config=targets[level];
  const connectors=config.connectors.filter(word=>lower.includes(` ${word} `)).length, advanced=config.advanced.filter(word=>lower.includes(` ${word} `)).length;
  const unique=new Set(words.map(word=>word.toLowerCase())).size, lexicalRatio=words.length?unique/words.length:0;
  const correctness=analysis.scores.Totale, organisation=Math.min(100,35+sentences.length*8+connectors*12), variety=Math.min(100,Math.round(lexicalRatio*70)+connectors*7+advanced*10), development=Math.min(100,Math.round(words.length/config.min*85)+sentences.length*2);
  const informal=/\b(gonna|wanna|kinda|ain't|lol|omg)\b/i.test(clean), register=Math.max(35,100-(informal&&["B2","C1"].includes(level)?35:0));
  const areas:RubricArea[]=[
    {area:"Correttezza",score:correctness,feedback:correctness>=85?"Le forme controllate sono solide.":"Correggi prima gli errori segnalati sopra."},
    {area:"Organizzazione",score:organisation,feedback:connectors?"I collegamenti rendono visibile il percorso delle idee.":`Aggiungi almeno un collegamento adatto a ${level}.`},
    {area:"Varietà",score:variety,feedback:advanced||lexicalRatio>.7?"Il lessico mostra una buona varietà.":"Sostituisci una ripetizione e varia una struttura."},
    {area:"Registro",score:register,feedback:register>=80?"Il registro non presenta contrasti evidenti.":"Evita abbreviazioni colloquiali in un testo formale."},
    {area:"Sviluppo",score:development,feedback:words.length>=config.min?"La risposta è sufficientemente sviluppata.":`Per una prova ${level}, sviluppa almeno ${config.min} parole quando la consegna lo consente.`},
  ];
  const weakest=[...areas].sort((a,b)=>a.score-b.score)[0];
  return {level,wordTarget:config.min,areas,total:Math.round(areas.reduce((sum,item)=>sum+item.score,0)/areas.length),nextStep:`Prossimo passo: ${weakest.feedback}`};
}
