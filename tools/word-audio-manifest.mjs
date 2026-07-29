import { mobileCurriculum } from "../src/curriculum.ts";

const slug = word =>
  word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const words = new Map();
for (const unit of mobileCurriculum) {
  const tokens = unit.speaking.target.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  for (const word of tokens) words.set(slug(word), word);
}

console.log(
  JSON.stringify(
    [...words].map(([file, text]) => ({
      file: `${file}.wav`,
      text,
    })),
  ),
);
