import type { MobileUnit } from "./curriculum";
import { grammarGuides } from "./grammarGuides";
import GrammarVisual from "./GrammarVisual";
import ConceptText from "./ConceptText";

export default function GrammarLesson({
  unit,
  onContinue,
}: {
  unit: MobileUnit;
  onContinue: () => void;
}) {
  const guide = grammarGuides[unit.id];
  const lessonTerms = [
    ...unit.grammar.formulas,
    ...unit.grammar.examples.map((example) => example.en),
    ...unit.vocabulary.flatMap((word) => [word.en, word.example]),
  ];

  return (
    <>
      <h1>{unit.title}</h1>
      <p className="intro">
        Una spiegazione completa: uso reale, costruzione, confronto con
        l’italiano, errori frequenti ed esempi tradotti.
      </p>

      {guide ? (
        <section className="deepGuide primaryGuide">
          <div className="deepOverview"><ConceptText text={guide.overview} terms={lessonTerms} /></div>

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
      ) : (
        <section className="grammarGuide">
          <div>
            <small>1 · QUANDO SI USA</small>
            <div className="explain">
              {unit.grammar.explanationIt.map((text, index) => (
                <div key={text}>
                  <b>{index + 1}</b>
                  <ConceptText text={text} terms={lessonTerms} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <small>2 · COME SI COSTRUISCE</small>
            <div className="formula">
              {unit.grammar.formulas.map((formula) => (
                <code key={formula}>{formula}</code>
              ))}
            </div>
          </div>
          <div className="grammarWarnings">
            <small>3 · ESEMPI COMMENTATI</small>
            {unit.grammar.examples.map((example) => (
              <div className="grammarExampleRule" key={example.en}>
                <b lang="en">{example.en}</b>
                <span>{example.it}.</span>
                <ConceptText text={example.noteIt} terms={lessonTerms} />
              </div>
            ))}
          </div>
        </section>
      )}

      <GrammarVisual unit={unit} />

      <button className="continue" onClick={onContinue}>
        Ascolta gli esempi <b>→</b>
      </button>
    </>
  );
}
