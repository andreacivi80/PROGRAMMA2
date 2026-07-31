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

          {guide.sections.map((section, index) => (
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

          <article className="commentedExamples">
            <small>ESEMPI COMMENTATI</small>
            {unit.grammar.examples.map((example) => (
              <div key={example.en}>
                <strong lang="en">{example.en}</strong>
                <span>{example.it}</span>
                <ConceptText text={example.noteIt} terms={lessonTerms} />
              </div>
            ))}
          </article>

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
