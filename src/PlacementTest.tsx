import { useMemo, useState } from "react";
import type { Cefr } from "./curriculum";

type Item = {
  level: Cefr;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const items: Item[] = [
  { level: "A1", prompt: "I ___ from Italy.", options: ["am", "is", "are"], answer: 0, explanation: "Con I si usa am." },
  { level: "A1", prompt: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking"], answer: 1, explanation: "Alla terza persona il Present Simple richiede -s." },
  { level: "A1", prompt: "___ you speak English?", options: ["Do", "Are", "Does"], answer: 0, explanation: "Con you la domanda al Present Simple usa do." },
  { level: "A2", prompt: "We ___ to London last year.", options: ["go", "went", "have gone"], answer: 1, explanation: "Last year è un tempo passato concluso: Past Simple." },
  { level: "A2", prompt: "This restaurant is ___ than the other one.", options: ["cheap", "cheaper", "cheapest"], answer: 1, explanation: "Il confronto tra due elementi usa il comparativo." },
  { level: "A2", prompt: "If it rains, we ___ at home.", options: ["stay", "will stay", "stayed"], answer: 1, explanation: "Nel First Conditional: if + presente, will + verbo base." },
  { level: "B1", prompt: "I ___ here since 2022.", options: ["work", "worked", "have worked"], answer: 2, explanation: "Since collega l'inizio passato alla situazione presente." },
  { level: "B1", prompt: "The report ___ yesterday.", options: ["completed", "was completed", "has completing"], answer: 1, explanation: "La forma passiva richiede be + participio passato." },
  { level: "B1", prompt: "If I had more time, I ___ another course.", options: ["take", "would take", "will take"], answer: 1, explanation: "Il Second Conditional usa would + verbo base." },
  { level: "B2", prompt: "She denied ___ the confidential file.", options: ["to share", "sharing", "share"], answer: 1, explanation: "Deny è seguito dalla forma in -ing." },
  { level: "B2", prompt: "The delay ___ by a technical failure.", options: ["may cause", "may have been caused", "must causing"], answer: 1, explanation: "Deduzione passata passiva: may have been + participio." },
  { level: "B2", prompt: "Had we known earlier, we ___ differently.", options: ["would act", "would have acted", "acted"], answer: 1, explanation: "Inversione del Third Conditional." },
  { level: "C1", prompt: "Rarely ___ such a convincing argument.", options: ["I heard", "have I heard", "I have hear"], answer: 1, explanation: "Dopo un avverbio negativo iniziale si usa l'inversione." },
  { level: "C1", prompt: "The proposal is feasible, ___ several reservations.", options: ["notwithstanding", "although", "whereas of"], answer: 0, explanation: "Notwithstanding introduce una concessione formale davanti a un nome." },
  { level: "C1", prompt: "Choose the most cautious claim.", options: ["This proves the policy works.", "The findings may lend support to the policy.", "The policy definitely succeeds."], answer: 1, explanation: "May lend support evita di presentare un risultato come prova definitiva." },
];

const levels: Cefr[] = ["A1", "A2", "B1", "B2", "C1"];

export default function PlacementTest({
  onClose,
  onChoose,
}: {
  onClose: () => void;
  onChoose: (level: Cefr) => void;
}) {
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Record<number, number>>({}),
    [selected, setSelected] = useState<number | null>(null),
    [finished, setFinished] = useState(false);
  const score = Object.entries(answers).reduce(
      (sum, [key, value]) => sum + (items[Number(key)].answer === value ? 1 : 0),
      0,
    ),
    suggested = useMemo<Cefr>(
      () => (score >= 13 ? "C1" : score >= 10 ? "B2" : score >= 7 ? "B1" : score >= 4 ? "A2" : "A1"),
      [score],
    ),
    item = items[index];
  const next = () => {
    if (index + 1 < items.length) {
      setIndex((value) => value + 1);
      setSelected(answers[index + 1] ?? null);
    } else setFinished(true);
    scrollTo(0, 0);
  };
  if (finished)
    return (
      <main className="placementView">
        <article className="placementResult">
          <span className="eyebrow">Valutazione orientativa</span>
          <h1>Il punto di partenza consigliato è {suggested}</h1>
          <strong>{Math.round((score / items.length) * 100)}%</strong>
          <p>
            Hai risposto correttamente a {score} domande su {items.length}. Non è
            un esame: puoi accettare il consiglio oppure scegliere liberamente.
          </p>
          <button className="continue" onClick={() => onChoose(suggested)}>
            Inizia da {suggested} <b>→</b>
          </button>
          <div className="placementLevelChoices">
            {levels.map((level) => (
              <button key={level} onClick={() => onChoose(level)}>{level}</button>
            ))}
          </div>
          <button className="showSolution" onClick={onClose}>Torna senza cambiare livello</button>
        </article>
      </main>
    );
  return (
    <main className="placementView">
      <div className="lessonTop">
        <button type="button" aria-label="Chiudi il test" onClick={onClose}>×</button>
        <div><i style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div>
        <b>{index + 1}/{items.length}</b>
      </div>
      <article className="placementPanel">
        <span className="eyebrow">Test iniziale · difficoltà progressiva</span>
        <h1>{item.prompt}</h1>
        <div className="answers">
          {item.options.map((option, optionIndex) => {
            const revealed = selected !== null;
            return (
              <button
                key={option}
                disabled={revealed}
                className={revealed ? optionIndex === item.answer ? "right" : optionIndex === selected ? "wrong" : "dim" : ""}
                onClick={() => {
                  setSelected(optionIndex);
                  setAnswers((current) => ({ ...current, [index]: optionIndex }));
                }}
              >
                <b>{String.fromCharCode(65 + optionIndex)}</b><span>{option}</span>
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <section className={`feedback ${selected === item.answer ? "good" : "bad"}`}>
            <strong>{selected === item.answer ? "✓ Risposta corretta" : "↗ Punto da rivedere"}</strong>
            <p>{item.explanation}</p>
          </section>
        )}
        <div className="placementActions">
          {selected === null ? (
            <button className="showSolution" onClick={() => { setSelected(-1); setAnswers((current) => ({ ...current, [index]: -1 })); }}>Non lo so · salta</button>
          ) : (
            <button className="continue" onClick={next}>{index + 1 < items.length ? "Prossima domanda" : "Vedi il livello"}<b>→</b></button>
          )}
        </div>
      </article>
    </main>
  );
}
