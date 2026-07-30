import { a2Expansion } from "../src/a2Expansion.ts";
const items=a2Expansion.flatMap(unit=>[
 ...unit.grammar.examples.map((example,index)=>({file:`${unit.id}-example-${index+1}.wav`,text:example.en})),
 ...unit.vocabulary.map((word,index)=>({file:`${unit.id}-vocab-${index+1}.wav`,text:word.example})),
 {file:`${unit.id}-listening.wav`,text:unit.listening.transcript},
 {file:`${unit.id}-speaking.wav`,text:unit.speaking.target},
]);
console.log(JSON.stringify(items));