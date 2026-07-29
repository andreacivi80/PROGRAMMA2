import { Fragment } from "react";

const englishTerms = [
  "Present Continuous",
  "Present Simple",
  "Past Continuous",
  "Past Simple",
  "Present Perfect",
  "Past Perfect",
  "be going to",
  "don't have to",
  "doesn't",
  "shouldn't",
  "mustn't",
  "wasn't",
  "weren't",
  "cannot",
  "can't",
  "am not",
  "is not",
  "are not",
  "have to",
  "had to",
  "going to",
  "he",
  "she",
  "it",
  "you",
  "we",
  "they",
  "I",
  "am",
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "must",
  "can",
  "could",
  "who",
  "which",
  "when",
  "while",
  "than",
  "the",
  "a",
  "an",
];

const escaped = englishTerms
  .sort((a, b) => b.length - a.length)
  .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const matcher = new RegExp(
  `(^|[\\s,;:()“”«»])(${escaped.join("|")})(?=$|[\\s,;:.!?()“”«»])`,
  "gi",
);

export default function MixedText({ text }: { text: string }) {
  const chunks: Array<{ value: string; english: boolean }> = [];
  let cursor = 0;

  for (const match of text.matchAll(matcher)) {
    const start = match.index ?? 0;
    const prefix = match[1] ?? "";
    const term = match[2];
    const termStart = start + prefix.length;

    if (termStart > cursor) {
      chunks.push({ value: text.slice(cursor, termStart), english: false });
    }
    chunks.push({ value: term, english: true });
    cursor = termStart + term.length;
  }

  if (cursor < text.length) {
    chunks.push({ value: text.slice(cursor), english: false });
  }

  return (
    <>
      {chunks.map((chunk, index) => (
        <Fragment key={`${chunk.value}-${index}`}>
          {chunk.english ? (
            <strong className="inlineEnglish" lang="en">
              <i>{chunk.value}</i>
            </strong>
          ) : (
            chunk.value
          )}
        </Fragment>
      ))}
    </>
  );
}
