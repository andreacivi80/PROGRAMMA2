import { createServer } from "vite";
const server=await createServer({server:{middlewareMode:true},appType:"custom",logLevel:"silent"});
try{
 const [{b1Expansion,b2Expansion},{c1Curriculum}]=await Promise.all([server.ssrLoadModule("/src/advancedCurriculum.ts"),server.ssrLoadModule("/src/c1Curriculum.ts")]);
 const units=[...b1Expansion,...b2Expansion,...c1Curriculum];
 const items=units.flatMap(unit=>[...unit.grammar.examples.map((example,index)=>({file:`${unit.id}-example-${index+1}.wav`,text:example.en})),...unit.vocabulary.map((word,index)=>({file:`${unit.id}-vocab-${index+1}.wav`,text:word.example})),{file:`${unit.id}-listening.wav`,text:unit.listening.transcript},{file:`${unit.id}-speaking.wav`,text:unit.speaking.target}]);
 console.log(JSON.stringify(items));
}finally{await server.close()}