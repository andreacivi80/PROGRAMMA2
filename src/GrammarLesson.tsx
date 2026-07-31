import type { MobileUnit } from "./curriculum";
import { grammarGuideFor } from "./grammarGuides";
import GrammarVisual from "./GrammarVisual";
import ConceptText from "./ConceptText";

export default function GrammarLesson({
  unit,
  onContinue,
}: {
  unit: MobileUnit;
  onContinue: () => void;
}) {
  const guide = grammarGuideFor(unit);
  const englishSources = [
    ...unit.grammar.examples.map((example) => example.en),
    ...unit.vocabulary.flatMap((word) => [word.en, word.example]),
    unit.listening.transcript,
    unit.speaking.target,
    ...unit.speaking.focus,
  ],
    sourceWords = englishSources.flatMap((text) =>
      text.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) ?? [],
    ),
    lessonTerms = [
    ...unit.grammar.formulas,
    ...englishSources,
    ...sourceWords,
  ];
  const seenExamples = new Set<string>(),
    exampleKey = (en: string, it: string) => `${en} ${it}`.toLocaleLowerCase().replace(/\s+/g, " ").trim(),
    guideSections = guide.sections.map((section) => ({
      ...section,
      examples: section.examples?.filter((example) => {
        const key = exampleKey(example.en, example.it);
        if (seenExamples.has(key)) return false;
        seenExamples.add(key);
        return true;
      }),
    })),
    commentedExamples = unit.grammar.examples.filter((example) => {
      const key = exampleKey(example.en, example.it);
      if (seenExamples.has(key)) return false;
      seenExamples.add(key);
      return true;
    });

  return (
    <>
      <h1>{unit.title}</h1>
      <p className="intro">
        Una spiegazione completa: uso reale, costruzione, confronto con
        l’italiano, errori frequenti ed esempi tradotti.
      </p>

      {(
        <section className="deepGuide primaryGuide">
          <div className="deepOverview">
            <ConceptText text={guide.overview} terms={lessonTerms} />
          </div>

          {guideSections.map((section, index) => (
            <article key={section.title}>
              <small>{index + 1} · APPROFONDIMENTO</small>
              <h3>{section.title}</h3>
              <ConceptText text={section.text} terms={lessonTerms} />
              {section.examples?.map((example) => (
                <div className="deepExample" key={example.en}>
                  <strong lang="en">{example.en}</strong>
                  <span>{example.it}</span>
                </div>
              ))}
            </article>
          ))}

          <article>
            <small>SCHEMA RAPIDO</small>
            <div className="formula">
              {unit.grammar.formulas.map((formula) => (
                <code key={formula}>{formula}</code>
              ))}
            </div>
          </article>

          {commentedExamples.length > 0 && (
            <article className="commentedExamples">
              <small>ESEMPI COMMENTATI</small>
              {commentedExamples.map((example) => (
                <div key={example.en}>
                  <strong lang="en">{example.en}</strong>
                  <span>{example.it}</span>
                  <ConceptText text={example.noteIt} terms={lessonTerms} />
                </div>
              ))}
            </article>
          )}

          <aside className="translationWarning">
            <b>Non tradurre parola per parola</b>
            <p>
              Prima scegli il significato e il tempo corretto in inglese. La
              struttura italiana può essere diversa anche quando il messaggio è
              lo stesso.
            </p>
          </aside>
        </section>
      )}

      <GrammarVisual unit={unit} />

      <button className="continue" onClick={onContinue}>
        Ascolta gli esempi <b>→</b>
      </button>
    </>
  );
}
