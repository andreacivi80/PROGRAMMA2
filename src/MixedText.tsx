import { Fragment } from "react";

const englishTerms = [
  "Present Continuous",
  "Present Simple",
  "Past Continuous",
  "Past Simple",
  "Present Perfect",
  "Past Perfect",
  "there is",
  "there are",
  "have got",
  "has got",
  "some",
  "any",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "be going to",
  "be",
  "I'm afraid",
  "I’m afraid",
  "I am afraid",
  "I'm sorry",
  "I’m sorry",
  "I am sorry",
  "I'd like",
  "I’d like",
  "I would like",
  "Could I have",
  "Could we have",
  "Could you",
  "Would you",
  "Would you like",
  "Can I have",
  "Can we have",
  "Can you",
  "May I",
  "There seems to be",
  "There is a problem",
  "Excuse me",
  "For here",
  "To go",
  "take away",
  "right away",
  "as soon as possible",
  "look into",
  "sort out",
  "deal with",
  "make sure",
  "find out",
  "get back to",
  "actually",
  "eventually",
  "currently",
  "sensible",
  "sensitive",
  "argument",
  "discussion",
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
];

export const italianContextWords = new Set([
  "a", "e", "i", "o", "in", "di", "da", "la", "le", "lo", "un", "una", "che", "come", "per", "con", "tra", "fra", "su", "se", "ma", "non", "più", "si", "è", "era", "sono", "corso", "rapporto", "parlanti",
  "agenda", "aria", "bar", "camera", "caso", "data", "estate", "fine", "media", "mobile", "modo", "nota", "radio", "sale", "solo", "studio", "via",
]);

export function mixedTextChunks(text: string, terms: string[] = []) {
  const safeTerms = [...new Set([...terms, ...englishTerms])]
    .map(term => term.trim())
    .filter(term => term.length > 1 && !italianContextWords.has(term.toLocaleLowerCase("it")));
  if (!safeTerms.length) return [{ value: text, english: false }];
  const localTerms = safeTerms
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const localMatcher = new RegExp(`(^|[\\s,;:()“”«»])(${localTerms.join("|")})(?=$|[\\s,;:.!?()“”«»])`, "gi");
  const chunks: Array<{ value: string; english: boolean }> = [];
  let cursor = 0;

  for (const match of text.matchAll(localMatcher)) {
    const start = match.index ?? 0;
    const prefix = match[1] ?? "";
    const term = match[2];
    const termStart = start + prefix.length;
    if (termStart > cursor) chunks.push({ value: text.slice(cursor, termStart), english: false });
    chunks.push({ value: term, english: true });
    cursor = termStart + term.length;
  }
  if (cursor < text.length) chunks.push({ value: text.slice(cursor), english: false });
  return chunks;
}

export default function MixedText({ text, terms = [] }: { text: string; terms?: string[] }) {
  const chunks = mixedTextChunks(text, terms);

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
