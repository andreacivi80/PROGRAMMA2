import { useMemo, useState } from "react";
import type { Choice, MobileUnit } from "./curriculum";
import { readingPassages } from "./readingLab";
import ConceptText from "./ConceptText";
import { getAudioAccent } from "./preferences";

type ReviewArea =
  | "Grammatica"
  | "Vocabolario"
  | "Uso nel contesto"
  | "Lettura"
  | "Ascolto"
  | "Scrittura"
  | "Interazione"
  | "Mediazione";
type ReviewQuestion = Choice & {
  unitId: string;
  unitTitle: string;
  area: ReviewArea;
  context?: string;
  audioText?: string;
};
type AreaScore = { yes: number; all: number };
type Props = {
  level: string;
  units: MobileUnit[];
  final: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
  onOpenUnit: (unit: MobileUnit) => void;
  previousScore?: number;
};
const allAreas: ReviewArea[] = [
  "Grammatica",
  "Vocabolario",
  "Uso nel contesto",
  "Lettura",
  "Ascolto",
  "Scrittura",
  "Interazione",
  "Mediazione",
];
const blankAreas = () =>
  Object.fromEntries(allAreas.map((area) => [area, { yes: 0, all: 0 }])) as Record<ReviewArea, AreaScore>;
const shuffle = <T,>(values: T[]) => [...values].sort(() => Math.random() - 0.5);
const words = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
function textSimilarity(expected: string, received: string) {
  const a = words(expected), b = words(received), pool = [...b];
  const hits = a.reduce((total, word) => {
    const index = pool.indexOf(word);
    if (index < 0) return total;
    pool.splice(index, 1);
    return total + 1;
  }, 0);
  return Math.round((hits / Math.max(1, Math.max(a.length, b.length))) * 100);
}
function optionsFor(correct: string, pool: string[]) {
  const wrong = shuffle([...new Set(pool.filter((value) => value && value !== correct))]).slice(0, 2),
    answer = Math.floor(Math.random() * 3), options = [...wrong];
  while (options.length < 2) options.push(options.length ? "Un’altra forma" : "Nessuna delle precedenti");
  options.splice(answer, 0, correct);
  return { options, answer };
}
function randomChoice(choice: Choice, unit: MobileUnit, area: ReviewArea, extra: Partial<ReviewQuestion> = {}): ReviewQuestion {
  const entries = shuffle(choice.options.map((value, index) => ({ value, ok: index === choice.answer })));
  return {
    ...choice,
    options: entries.map((entry) => entry.value),
    answer: entries.findIndex((entry) => entry.ok),
    unitId: unit.id,
    unitTitle: unit.title,
    area,
    ...extra,
  };
}
function buildBank(units: MobileUnit[], target: number, final: boolean): ReviewQuestion[] {
  const vocab = units.flatMap((unit) => unit.vocabulary),
    examples = units.flatMap((unit) => unit.grammar.examples),
    clozeAnswers = units.flatMap((unit) => unit.writing.cloze.flatMap((item) => item.answers)),
    bank: ReviewQuestion[] = [];
  units.forEach((unit) => {
    unit.quickCheck.forEach((choice) => bank.push(randomChoice(choice, unit, "Uso nel contesto")));
    unit.vocabulary.forEach((word) => {
      const built = optionsFor(word.en, vocab.map((item) => item.en));
      bank.push({ prompt: `Come si dice «${word.it}»?`, ...built, explanationIt: `${word.en} significa «${word.it}». Esempio: ${word.example}`, unitId: unit.id, unitTitle: unit.title, area: "Vocabolario" });
    });
    unit.grammar.examples.forEach((example) => {
      const built = optionsFor(example.en, examples.map((item) => item.en));
      bank.push({ prompt: `Scegli l’inglese corretto per «${example.it}».`, ...built, explanationIt: example.noteIt, unitId: unit.id, unitTitle: unit.title, area: "Grammatica" });
    });
    unit.writing.cloze.forEach((item) => {
      const correct = item.answers[0], built = optionsFor(correct, clozeAnswers);
      bank.push({ prompt: item.prompt, ...built, explanationIt: item.hintIt, unitId: unit.id, unitTitle: unit.title, area: "Uso nel contesto" });
    });
    if (final)
      unit.listening.questions.forEach((choice) =>
        bank.push(randomChoice(choice, unit, "Ascolto", { audioText: unit.listening.transcript })),
      );
  });
  if (final) {
    readingPassages
      .filter((passage) => passage.level === units[0]?.cefr)
      .forEach((passage) =>
        passage.questions.forEach((choice) => {
          const unit = units[0];
          if (!unit) return;
          bank.push(randomChoice(choice, unit, "Lettura", {
            unitId: passage.id,
            unitTitle: passage.title,
            context: passage.paragraphs.join("\n\n"),
          }));
        }),
      );
  }
  const unique = [...new Map(bank.map((question) => [`${question.prompt}|${question.options[question.answer]}`, question])).values()];
  return shuffle(unique).slice(0, Math.min(target, unique.length));
}
function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getAudioAccent();
  utterance.rate = 0.92;
  speechSynthesis.speak(utterance);
}

export default function ReviewLab({ level, units, final, onClose, onComplete, onOpenUnit, previousScore }: Props) {
  const [run, setRun] = useState(0), [index, setIndex] = useState(0),
    [pick, setPick] = useState<number | null>(null), [correct, setCorrect] = useState(0),
    [weak, setWeak] = useState<Record<string, number>>({}),
    [areas, setAreas] = useState<Record<ReviewArea, AreaScore>>(blankAreas),
    [stage, setStage] = useState<"quiz" | "writing" | "mediation" | "speaking" | "result">("quiz"),
    [writing, setWriting] = useState(""), [mediation, setMediation] = useState(""),
    [spoken, setSpoken] = useState(""), [recording, setRecording] = useState(false),
    [finalPercent, setFinalPercent] = useState(0);
  const target = final ? 24 : 20;
  const questions = useMemo(() => buildBank(units, target, final), [units, target, final, run]),
    question = questions[index],
    quizPercent = Math.round((correct / Math.max(1, questions.length)) * 100),
    weakUnit = units.find((unit) => unit.id === Object.entries(weak).sort((a, b) => b[1] - a[1])[0]?.[0]),
    taskUnit = units[Math.min(units.length - 1, Math.floor(run % Math.max(1, units.length)))] ?? units[0],
    mediationExpected = taskUnit?.grammar.examples[0]?.en ?? "I would like more information.",
    mediationPrompt = taskUnit?.grammar.examples[0]?.it ?? "Vorrei maggiori informazioni.",
    speakingTarget = taskUnit?.speaking.target ?? mediationExpected,
    minWords = level === "A1" || level === "A2" ? 25 : 45,
    writingScore = Math.min(100,
      Math.round(Math.min(1, words(writing).length / minWords) * 65) +
      (/^[A-Z]/.test(writing.trim()) ? 15 : 0) + (/[.!?]$/.test(writing.trim()) ? 10 : 0) +
      (taskUnit?.vocabulary.some((word) => writing.toLowerCase().includes(word.en.toLowerCase())) ? 10 : 0)),
    mediationScore = textSimilarity(mediationExpected, mediation),
    speakingScore = textSimilarity(speakingTarget, spoken),
    displayPercent = stage === "result" ? finalPercent : quizPercent;
  const answer = (option: number) => {
    if (pick !== null) return;
    setPick(option);
    setAreas((values) => ({ ...values, [question.area]: { yes: values[question.area].yes + (option === question.answer ? 1 : 0), all: values[question.area].all + 1 } }));
    if (option === question.answer) setCorrect((value) => value + 1);
    else setWeak((values) => ({ ...values, [question.unitId]: (values[question.unitId] ?? 0) + 1 }));
  };
  const next = () => {
    if (index + 1 < questions.length) { setIndex((value) => value + 1); setPick(null); scrollTo(0, 0); return; }
    if (final) setStage("writing");
    else { setStage("result"); setFinalPercent(quizPercent); onComplete(quizPercent); }
    scrollTo(0, 0);
  };
  const finishExam = () => {
    const completed = {
      ...areas,
      Scrittura: { yes: writingScore, all: 100 },
      Interazione: { yes: speakingScore, all: 100 },
      Mediazione: { yes: mediationScore, all: 100 },
    };
    const active = Object.values(completed).filter((value) => value.all > 0),
      score = Math.round(active.reduce((sum, value) => sum + (value.yes / value.all) * 100, 0) / Math.max(1, active.length));
    setAreas(completed); setFinalPercent(score); setStage("result"); onComplete(score); scrollTo(0, 0);
  };
  const record = () => {
    const Ctor = (window as typeof window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition ??
      (window as typeof window & { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!Ctor) { setSpoken("Riconoscimento vocale non disponibile in questo browser."); return; }
    const recognition = new Ctor(); recognition.lang = getAudioAccent(); recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event: any) => setSpoken(event.results?.[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => { setSpoken("Voce non riconosciuta. Puoi riprovare o saltare."); setRecording(false); };
    recognition.onend = () => setRecording(false); setRecording(true); recognition.start();
  };
  const restart = () => {
    setRun((value) => value + 1); setIndex(0); setPick(null); setCorrect(0); setWeak({}); setAreas(blankAreas());
    setWriting(""); setMediation(""); setSpoken(""); setFinalPercent(0); setStage("quiz"); scrollTo(0, 0);
  };

  if (stage === "result")
    return <div className="reviewView"><div className="reviewTop"><button aria-label="Chiudi il riepilogo" onClick={onClose}>×</button><b>{level}</b></div>
      <section className="reviewResult"><span>{final ? "ESAME DI FINE LIVELLO" : "RIEPILOGO COMPLETATO"}</span><strong>{displayPercent}%</strong>
        <h1>{displayPercent >= 85 ? "Ottimo consolidamento" : displayPercent >= 65 ? "Stai costruendo basi solide" : "Hai individuato cosa rinforzare"}</h1>
        <p>Questo risultato serve a scegliere il prossimo passo, non è un giudizio.</p>
        {final && <><div className="examBreakdown">{allAreas.map((area) => {
          const value = areas[area]; if (!value.all) return null;
          return <article key={area}><small>{area}</small><strong>{Math.round((value.yes / value.all) * 100)}%</strong></article>;
        })}</div><section className="examDecision"><h2>Indicazione per il prossimo passo</h2><p>{displayPercent >= 80 ? "Le competenze osservate sono solide. Il livello non cambia automaticamente: consolida eventuali aree sotto il 70% prima di proseguire." : "Consolida la sessione consigliata e ripeti l’esame: troverai testi e domande differenti."}</p>
          {previousScore !== undefined && <b>Rispetto al tentativo precedente: {displayPercent - previousScore >= 0 ? "+" : ""}{displayPercent - previousScore} punti.</b>}</section>
          <button className="printReport" onClick={() => window.print()}>Stampa o salva il rapporto in PDF</button></>}
        {weakUnit && <article><small>SESSIONE CONSIGLIATA</small><h2>{weakUnit.title}</h2><button onClick={() => onOpenUnit(weakUnit)}>Ripassa questa sessione →</button></article>}
        <button className="continue" onClick={restart}>Nuovo tentativo con attività diverse <b>↻</b></button><button className="showSolution" onClick={onClose}>Torna al percorso</button>
      </section></div>;

  if (stage !== "quiz") {
    const step = stage === "writing" ? 1 : stage === "mediation" ? 2 : 3;
    return <div className="reviewView"><div className="reviewTop"><button aria-label="Chiudi l’esame" onClick={onClose}>×</button><div><i style={{ width: `${75 + step * 8.33}%` }} /></div><b>{level}</b></div>
      <section className="reviewPanel openExam"><span className="eyebrow">Esame finale · prova {step} di 3</span>
        {stage === "writing" && <><h1>Scrittura</h1><p>{taskUnit?.writing.productionPromptIt}</p><small>Valutazione locale: completezza, maiuscola, punteggiatura e lessico della sessione.</small><textarea lang="en" rows={9} value={writing} onChange={(event) => setWriting(event.target.value)} placeholder={`Scrivi almeno ${minWords} parole…`} /><b>{words(writing).length}/{minWords} parole · stima {writingScore}%</b><button className="continue" disabled={words(writing).length < 5} onClick={() => { setStage("mediation"); scrollTo(0, 0); }}>Continua con la mediazione →</button></>}
        {stage === "mediation" && <><h1>Mediazione italiano → inglese</h1><p>Comunica in inglese questa informazione, senza tradurre parola per parola:</p><blockquote>{mediationPrompt}</blockquote><textarea lang="en" rows={5} value={mediation} onChange={(event) => setMediation(event.target.value)} placeholder="Write the essential meaning in English…" />{mediation && <b>Contenuto riconosciuto: {mediationScore}%</b>}<button className="continue" disabled={!mediation.trim()} onClick={() => { setStage("speaking"); scrollTo(0, 0); }}>Continua con la risposta orale →</button></>}
        {stage === "speaking" && <><h1>Interazione e parole riconosciute</h1><p>{taskUnit?.speaking.promptIt}</p><blockquote lang="en">{speakingTarget}</blockquote><button className={recording ? "recording" : "continue"} disabled={recording} onClick={record}>{recording ? "● Sto ascoltando…" : "Parla in inglese"}</button>{spoken && <><p lang="en">{spoken}</p><b>{speakingScore}% di parole e ordine riconosciuti</b></>}<div className="reviewNav"><button className="showSolution" onClick={finishExam}>Salta prova orale</button><button className="continue" disabled={!spoken || spoken.startsWith("Riconoscimento") || spoken.startsWith("Voce non")} onClick={finishExam}>Concludi l’esame →</button></div></>}
      </section></div>;
  }

  return <div className="reviewView"><div className="reviewTop"><button aria-label="Chiudi il riepilogo" onClick={onClose}>×</button><div><i style={{ width: `${((index + 1) / questions.length) * (final ? 75 : 100)}%` }} /></div><b>{level}</b></div>
    <section className="reviewPanel"><span className="eyebrow">{final ? "Esame finale · conoscenze, lettura e ascolto" : "Riepilogo intermedio · 20 esercizi"}</span><h1>{final ? `Verifica completa del livello ${level}` : "Ripassa le sessioni precedenti"}</h1><p className="reviewCounter">Esercizio {index + 1} di {questions.length} · le domande cambiano a ogni tentativo</p>
      <article className="reviewQuestion"><small>DA · {question.unitTitle}</small><em className="questionArea">{question.area}</em>
        {question.context && <details className="examReading"><summary>Leggi il testo</summary>{question.context.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</details>}
        {question.audioText && <button type="button" className="examListen" onClick={() => speak(question.audioText!)}>▶ Ascolta il brano</button>}
        <h2>{question.prompt}</h2><div>{question.options.map((option, optionIndex) => {
          const state = pick === null ? "" : optionIndex === question.answer ? "right" : optionIndex === pick ? "wrong" : "dim";
          return <button key={`${option}-${optionIndex}`} className={state} disabled={pick !== null} onClick={() => answer(optionIndex)}><b>{String.fromCharCode(65 + optionIndex)}</b><span>{option}</span></button>;
        })}</div>{pick !== null && <aside className={pick === question.answer ? "good" : "bad"}><strong>{pick === question.answer ? "Ben fatto: consolidiamo il motivo." : "Questa è un’ottima occasione per fissare il concetto."}</strong><ConceptText text={question.explanationIt} terms={question.options} /></aside>}</article>
      <div className="reviewNav"><button type="button" className="showSolution" onClick={next}>Salta domanda</button><button className="continue" disabled={pick === null} onClick={next}>{index + 1 < questions.length ? "Prossimo esercizio" : final ? "Passa alle prove aperte" : "Vedi il riepilogo"}<b>→</b></button></div>
    </section></div>;
}
