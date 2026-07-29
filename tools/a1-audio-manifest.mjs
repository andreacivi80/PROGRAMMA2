import { a1Expansion } from "../src/a1Expansion.ts";
const items = a1Expansion.flatMap(unit => [
  ...unit.grammar.examples.map((example, index) => ({ file: `${unit.id}-example-${index + 1}.wav`, text: example.en })),
  ...unit.vocabulary.map((word, index) => ({ file: `${unit.id}-vocab-${index + 1}.wav`, text: word.example })),
  { file: `${unit.id}-listening.wav`, text: unit.listening.transcript },
  { file: `${unit.id}-speaking.wav`, text: unit.speaking.target },
]);
console.log(JSON.stringify(items));