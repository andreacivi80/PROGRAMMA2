import { mobileCurriculum } from "../src/curriculum.ts";

const items = mobileCurriculum.flatMap(unit => [
  ...unit.grammar.examples.map((example, index) => ({
    file: `${unit.id}-example-${index + 1}.wav`,
    text: example.en,
  })),
  ...unit.vocabulary.map((word, index) => ({
    file: `${unit.id}-vocab-${index + 1}.wav`,
    text: word.example,
  })),
]);

console.log(JSON.stringify(items));
