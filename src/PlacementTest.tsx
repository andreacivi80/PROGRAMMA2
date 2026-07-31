import { useMemo, useState } from "react";
import type { Cefr } from "./curriculum";
import { evaluatePlacement, placementItems, placementLevels, type ProductionEvidence } from "./placementModel";

const kindLabel = { grammar: "Grammatica", vocabulary: "Lessico", reading: "Comprensione scritta", listening: "Comprensione orale" };

function speak(text: string, lang = "en-GB", rate = 0.9) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ?? voices.find((voice) => /^en-GB/i.test(voice.lang)) ?? voices.find((voice) => /^en/i.test(voice.lang)) ?? null;
  speechSynthesis.speak(utterance);
}

export default function PlacementTest({ onClose, onChoose }: { onClose: () => void; onChoose: (level: Cefr) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"questions" | "production" | "result">("questions");
  const [evidence, setEvidence] = useState<ProductionEvidence>({ writing: "", mediation: "", oral: "" });
  const item = placementItems[index];
  const result = useMemo(() => evaluatePlacement(answers, evidence), [answers, evidence]);
  const next = () => {
    speechSynthesis.cancel();
    if (index + 1 < placementItems.length) {
      setIndex((value) => value + 1);
      setSelected(null);
    } else setPhase("production");
    scrollTo({ top: 0, behavior: "smooth" });
  };

  if (phase === "result") return (
    <main className="placementView">
      <article className="placementResult">
        <span className="eyebrow">Valutazione orientativa · attendibilità {result.confidence}</span>
        <h1>Il punto di partenza consigliato è {result.suggested}</h1>
        <strong>{result.totalPercent}% nelle prove oggettive</strong>
        <div className="placementBands" aria-label="Risultati per livello">
          {placementLevels.map((level) => <div key={level}><b>{level}</b><span>{result.bandScores[level]}%</span></div>)}
        </div>
        <p>
          La stima considera separatamente prerequisiti, grammatica, lessico, lettura, ascolto e produzione.
          {result.boundary ? ` Sei vicino anche al livello ${result.boundary}: puoi provarlo liberamente.` : " Il livello può sempre essere cambiato."}
        </p>
        <button className="continue" onClick={() => onChoose(result.suggested)}>Inizia da {result.suggested} <b>→</b></button>
        <div className="placementLevelChoices">
          {placementLevels.map((level) => <button key={level} onClick={() => onChoose(level)}>{level}</button>)}
        </div>
        <button className="showSolution" onClick={onClose}>Torna senza cambiare livello</button>
      </article>
    </main>
  );

  if (phase === "production") return (
    <main className="placementView">
      <div className="lessonTop"><button type="button" aria-label="Chiudi il test" onClick={onClose}>×</button><div><i style={{ width: "100%" }} /></div><b>Produzione</b></div>
      <article className="placementPanel placementProduction">
        <span className="eyebrow">Ultima parte · scrivi con parole tue</span>
        <h1>Due brevi risposte per rendere più precisa la stima</h1>
        <label>
          <b>Presentati e racconta un’esperienza o un progetto. Spiega anche perché è stato importante. (circa 40–80 parole)</b>
          <textarea value={evidence.writing} onChange={(event) => setEvidence((current) => ({ ...current, writing: event.target.value }))} placeholder="Write in English…" />
        </label>
        <label>
          <b>Produzione orale: parla per circa 30 secondi di un problema che hai risolto. Poi incolla o scrivi qui ciò che hai detto.</b>
          <textarea value={evidence.oral} onChange={(event) => setEvidence((current) => ({ ...current, oral: event.target.value }))} placeholder="What I said…" />
        </label>
        <label>
          <b>Traduci il senso, senza seguire parola per parola: “Ieri sono andato a una riunione, ma sono arrivato tardi perché il treno era stato cancellato.”</b>
          <textarea value={evidence.mediation} onChange={(event) => setEvidence((current) => ({ ...current, mediation: event.target.value }))} placeholder="Write in English…" />
        </label>
        <p className="placementNote">La valutazione locale controlla completezza e strutture riconoscibili; non sostituisce il giudizio di un insegnante.</p>
        <button className="continue" disabled={!evidence.writing.trim() || !evidence.mediation.trim()} onClick={() => setPhase("result")}>Calcola il livello <b>→</b></button>
        <button className="showSolution" onClick={() => setPhase("result")}>Non so rispondere · completa comunque</button>
      </article>
    </main>
  );

  return (
    <main className="placementView">
      <div className="lessonTop">
        <button type="button" aria-label="Chiudi il test" onClick={() => { speechSynthesis.cancel(); onClose(); }}>×</button>
        <div><i style={{ width: `${((index + 1) / placementItems.length) * 100}%` }} /></div>
        <b>{index + 1}/{placementItems.length}</b>
      </div>
      <article className="placementPanel">
        <span className="eyebrow">{kindLabel[item.kind]} · livello crescente</span>
        {item.passage && <section className="placementPassage"><b>Leggi il testo</b><p>{item.passage}</p></section>}
        {item.audioText && <section className="placementListening"><button type="button" onClick={() => speak(item.audioText!, item.voiceLang, item.speechRate)}>▶ Ascolta in inglese</button><small>Ascolta il significato complessivo prima di rispondere.</small></section>}
        <h1>{item.prompt}</h1>
        <div className="answers">
          {item.options.map((option, optionIndex) => {
            const revealed = selected !== null;
            return <button key={option} disabled={revealed} className={revealed ? optionIndex === item.answer ? "right" : optionIndex === selected ? "wrong" : "dim" : ""} onClick={() => { setSelected(optionIndex); setAnswers((current) => ({ ...current, [item.id]: optionIndex })); }}><b>{String.fromCharCode(65 + optionIndex)}</b><span>{option}</span></button>;
          })}
        </div>
        {selected !== null && <section className={`feedback ${selected === item.answer ? "good" : "bad"}`}><strong>{selected === item.answer ? "✓ Bene: competenza confermata" : "↗ Punto da consolidare"}</strong><p>{item.explanation}</p></section>}
        <div className="placementActions">
          {selected === null ? <button className="showSolution" onClick={() => { setSelected(-1); setAnswers((current) => ({ ...current, [item.id]: -1 })); }}>Non lo so · salta</button> : <button className="continue" onClick={next}>{index + 1 < placementItems.length ? "Prossima prova" : "Passa alla produzione"}<b>→</b></button>}
        </div>
      </article>
    </main>
  );
}
