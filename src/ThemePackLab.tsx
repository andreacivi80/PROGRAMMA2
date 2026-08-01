import { useEffect, useMemo, useRef, useState } from "react";
import type { Choice } from "./curriculum";
import type { ThemePack } from "./themePacks";
import AuthenticAudio from "./AuthenticAudio";
import MixedText from "./MixedText";
import ConceptText from "./ConceptText";
import { accentComprehension } from "./accentComprehension";
import { getAudioAccent } from "./preferences";
import {
  applyDialogueVoice,
  dialogueRole,
  dialogueVoicePair,
} from "./speechVoices";

type Props = {
  pack: ThemePack;
  previous?: { score: number; attempts: number };
  onClose: () => void;
  onComplete: (score: number) => void;
  onMistake?: (item: Choice, givenAnswer: string) => void;
};
type QuizItem = Choice & { id: string };
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function buildQuiz(pack: ThemePack): QuizItem[] {
  const authoredSource = [
    ...pack.questions,
    ...(accentComprehension[pack.id] ?? []),
  ].slice(0, 8);
  const meanings = shuffle(pack.vocabulary)
    .slice(0, Math.max(0, 10 - authoredSource.length))
    .map((word, index) => {
      const wrong = shuffle(
        pack.vocabulary
          .filter((item) => item.en !== word.en)
          .map((item) => item.it),
      ).slice(0, 3);
      const options = shuffle([word.it, ...wrong]),
        answer = options.indexOf(word.it);
      return {
        id: `word-${index}`,
        prompt: `Che cosa significa “${word.en}” in questo contesto?`,
        options,
        answer,
        explanationIt: `${word.en} significa ${word.it}. Esempio: ${word.example}`,
      };
    });
  const authored = authoredSource.map((question, index) => {
    const correct = question.options[question.answer],
      options = shuffle(question.options);
    return {
      ...question,
      id: `scenario-${index}`,
      options,
      answer: options.indexOf(correct),
    };
  });
  return shuffle([...meanings, ...authored]);
}

type DialogueTurn = {
  speaker?: string;
  text: string;
  words: string[];
  start: number;
};
function parseDialogue(text: string): DialogueTurn[] {
  const marker = /\b([A-Za-z][A-Za-z ]{0,18}):\s*/g,
    matches = [...text.matchAll(marker)];
  if (matches.length < 2) return [{ text, words: text.split(/\s+/), start: 0 }];
  let offset = 0;
  return matches.map((match, index) => {
    const from = (match.index ?? 0) + match[0].length,
      to = index + 1 ? (matches[index + 1]?.index ?? text.length) : text.length,
      part = text.slice(from, to).trim(),
      words = part.split(/\s+/).filter(Boolean),
      turn = { speaker: match[1], text: part, words, start: offset };
    offset += words.length;
    return turn;
  });
}
type ScenarioPlayback = {
  timer: number | null;
  index: number;
  wordCount: number;
  paused: boolean;
  onWord?: (index: number) => void;
};
let scenarioPlayback: ScenarioPlayback | null = null;
function finishScenarioSpeech() {
  if (scenarioPlayback?.timer != null)
    window.clearInterval(scenarioPlayback.timer);
  scenarioPlayback?.onWord?.(-1);
  scenarioPlayback = null;
}
function stopScenarioSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  finishScenarioSpeech();
}
function pauseScenarioSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.pause();
  if (scenarioPlayback) scenarioPlayback.paused = true;
}
function resumeScenarioSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.resume();
  if (scenarioPlayback) scenarioPlayback.paused = false;
}
function speak(text: string, onWord?: (index: number) => void) {
  if (!("speechSynthesis" in window)) return;
  stopScenarioSpeech();
  const turns = parseDialogue(text),
    pair = dialogueVoicePair(speechSynthesis.getVoices(), text);
  const playback: ScenarioPlayback = {
    timer: null,
    index: 0,
    wordCount: turns.reduce((sum, turn) => sum + turn.words.length, 0),
    paused: false,
    onWord,
  };
  scenarioPlayback = playback;
  let turnIndex = 0;
  const playTurn = () => {
    if (scenarioPlayback !== playback) return;
    const turn = turns[turnIndex],
      utterance = new SpeechSynthesisUtterance(turn.text);
    applyDialogueVoice(utterance, pair, dialogueRole(turn.speaker, turnIndex));
    utterance.rate = 0.92;
    let localIndex = 0;
    utterance.onstart = () => {
      onWord?.(turn.start);
      playback.index = turn.start;
      if (!onWord) return;
      playback.timer = window.setInterval(() => {
        if (playback.paused || scenarioPlayback !== playback) return;
        localIndex = Math.min(turn.words.length - 1, localIndex + 1);
        playback.index = turn.start + localIndex;
        onWord(playback.index);
      }, 430);
    };
    utterance.onboundary = (event) => {
      if (event.name !== "word" || scenarioPlayback !== playback) return;
      localIndex = turn.text
        .slice(0, event.charIndex)
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      playback.index = turn.start + localIndex;
      onWord?.(playback.index);
    };
    utterance.onerror = () => {
      if (scenarioPlayback === playback) finishScenarioSpeech();
    };
    utterance.onend = () => {
      if (playback.timer != null) window.clearInterval(playback.timer);
      playback.timer = null;
      if (scenarioPlayback !== playback) return;
      turnIndex++;
      if (turnIndex < turns.length) playTurn();
      else finishScenarioSpeech();
    };
    speechSynthesis.speak(utterance);
  };
  playTurn();
}

export default function ThemePackLab({
  pack,
  previous,
  onClose,
  onComplete,
  onMistake,
}: Props) {
  const [phase, setPhase] = useState<"learn" | "scenario" | "quiz" | "response" | "repeat" | "result">(
    "learn",
  );
  const [quiz, setQuiz] = useState(() => buildQuiz(pack)),
    [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null),
    [correct, setCorrect] = useState(0),
    [scenarioWord, setScenarioWord] = useState(-1),
    [freeResponse, setFreeResponse] = useState(""),
    [spoken, setSpoken] = useState(""),
    [recording, setRecording] = useState(false);
  const reported = useRef(false),
    scenarioRef = useRef<HTMLDivElement | null>(null),
    item = quiz[index],
    score = Math.round((correct / quiz.length) * 100),
    responseWords = freeResponse.trim().split(/\s+/).filter(Boolean).length,
    responseScore = Math.min(100, Math.round((responseWords / (pack.level === "A1" ? 15 : 30)) * 80) + (pack.vocabulary.some((word) => freeResponse.toLowerCase().includes(word.en.toLowerCase())) ? 20 : 0)),
    target = pack.vocabulary[0]?.example ?? pack.scenario.text.split(/[.!?]/)[0],
    targetWords = target.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean),
    spokenWords = spoken.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean),
    speechScore = spoken ? Math.round((targetWords.filter((word) => spokenWords.includes(word)).length / Math.max(1, targetWords.length)) * 100) : 0,
    finalScore = Math.round(score * 0.7 + responseScore * 0.15 + speechScore * 0.15);
  const levelTone = useMemo(
      () => `level-${pack.level.toLowerCase()}`,
      [pack.level],
    ),
    scenarioTurns = useMemo(
      () => parseDialogue(pack.scenario.text),
      [pack.scenario.text],
    );
  useEffect(() => {
    const box = scenarioRef.current;
    if (!box) return;
    if (scenarioWord < 0) {
      box.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const active = box.querySelector<HTMLElement>(".active");
    if (!active) return;
    const boxRect = box.getBoundingClientRect(),
      activeRect = active.getBoundingClientRect(),
      insideTop = activeRect.top - boxRect.top + box.scrollTop,
      target = Math.max(
        0,
        Math.min(
          box.scrollHeight - box.clientHeight,
          insideTop - (box.clientHeight - activeRect.height) / 2,
        ),
      );
    box.scrollTo({ top: target, behavior: "smooth" });
  }, [scenarioWord]);
  const startQuiz = () => {
    stopScenarioSpeech();
    setScenarioWord(-1);
    setQuiz(buildQuiz(pack));
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setFreeResponse("");
    setSpoken("");
    reported.current = false;
    setPhase("quiz");
    scrollTo(0, 0);
  };
  const next = () => {
    if (index + 1 < quiz.length) {
      setIndex((value) => value + 1);
      setSelected(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("response");
      scrollTo(0, 0);
    }
  };
  const choose = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === item.answer) setCorrect((value) => value + 1);
    else onMistake?.(item, item.options[choice]);
  };
  const finishMission = () => {
    if (!reported.current) {
      reported.current = true;
      onComplete(finalScore);
    }
    setPhase("result");
    scrollTo(0, 0);
  };
  const recordResponse = () => {
    const Ctor = (window as typeof window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition ??
      (window as typeof window & { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!Ctor) { setSpoken("Riconoscimento vocale non disponibile."); return; }
    const recognition = new Ctor();
    recognition.lang = getAudioAccent(); recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event: any) => setSpoken(event.results?.[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => { setSpoken("Voce non riconosciuta. Riprova o salta."); setRecording(false); };
    recognition.onend = () => setRecording(false); setRecording(true); recognition.start();
  };
  const shownScore = phase === "result" ? finalScore : score;
  return (
    <main className={`themePackView ${levelTone}`}>
      <header className="themePackTop">
        <button
          type="button"
          onClick={() => {
            stopScenarioSpeech();
            onClose();
          }}
          aria-label="Chiudi"
        >
          ×
        </button>
        <div>
          <i
            style={{
              width:
                phase === "learn"
                  ? "25%"
                  : phase === "scenario"
                    ? "50%"
                    : phase === "quiz"
                      ? `${50 + ((index + 1) / quiz.length) * 45}%`
                      : phase === "response"
                        ? "88%"
                        : phase === "repeat"
                          ? "95%"
                      : "100%",
            }}
          />
        </div>
        <b>{pack.level}</b>
      </header>
      <article className="themePackPanel">
        {phase === "learn" && (
          <>
            <div className="themePackHero">
              {pack.flagUrl ? (
                <img
                  className="themeHeroFlagImage"
                  src={pack.flagUrl}
                  alt={pack.flagLabel ?? "Bandiera"}
                />
              ) : (
                pack.flag && (
                  <span className="themeHeroFlag" aria-hidden="true">
                    {pack.flag}
                  </span>
                )
              )}
              <small>
                {pack.level} · {pack.minutes} min · 10 quiz variabili
              </small>
              <h1>{pack.title}</h1>
              <p>{pack.summary}</p>
              {previous && (
                <em>
                  Già svolta {previous.attempts}{" "}
                  {previous.attempts === 1 ? "volta" : "volte"} · miglior
                  risultato recente {previous.score}%
                </em>
              )}
              {pack.sourceUrl && (
                <a
                  className="themePackSource"
                  href={pack.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Fonte del contesto: {pack.sourceLabel ?? "sito ufficiale"} ↗
                </a>
              )}
            </div>
            <section className="themeGuide">
              <span className="eyebrow">Prima capisci, poi usa</span>
              <h2>Guida pratica</h2>
              {pack.guide.map((line, index) => (
                <p key={line}>
                  <b>{index + 1}</b>
                  <span>
                    <MixedText
                      text={line}
                      terms={[
                        ...pack.vocabulary.flatMap((word) => [
                          word.en,
                          word.example,
                        ]),
                        "I’d like",
                        "I'd like",
                        "Could I have",
                        "Could we have",
                        "Can I",
                        "Would you like",
                      ]}
                    />
                  </span>
                </p>
              ))}
            </section>
            <section>
              <div className="themeSectionTitle">
                <span>
                  <small>VOCABOLARIO ATTIVO</small>
                  <h2>Ascolta l’inglese e leggi l’esempio</h2>
                </span>
                <b>{pack.vocabulary.length} parole</b>
              </div>
              <div className="themeWordGrid">
                {pack.vocabulary.map((word) => (
                  <article className="themeWordCard" key={word.en}>
                    <button
                      type="button"
                      onClick={() => speak(`${word.en}. ${word.example}`)}
                      aria-label={`Ascolta ${word.en}`}
                    >
                      ▶
                    </button>
                    <div>
                      <strong lang="en">{word.en}</strong>
                      <span>{word.it}</span>
                      <p lang="en">{word.example}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <button
              className="continue"
              onClick={() => {
                setPhase("scenario");
                scrollTo(0, 0);
              }}
            >
              Vai alla situazione reale <b>→</b>
            </button>
          </>
        )}
        {phase === "scenario" && (
          <>
            <span className="eyebrow">Ascolto e comprensione</span>
            <h1>{pack.scenario.title}</h1>
            <p className="intro">
              Prima ascolta senza aiuti. Puoi mettere in pausa, riprendere o
              fermare la voce.
            </p>
            {pack.authenticAudio ? (
              <AuthenticAudio {...pack.authenticAudio} />
            ) : (
              <div className="themeAudioBar">
                <button
                  type="button"
                  onClick={() => speak(pack.scenario.text, setScenarioWord)}
                >
                  ▶ <span>Ascolta</span>
                </button>
                <button type="button" onClick={pauseScenarioSpeech}>
                  Ⅱ <span>Pausa</span>
                </button>
                <button type="button" onClick={resumeScenarioSpeech}>
                  ↻ <span>Riprendi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopScenarioSpeech();
                    setScenarioWord(-1);
                  }}
                >
                  ■ <span>Stop</span>
                </button>
              </div>
            )}
            <section className="themeScenario">
              <small>
                {pack.authenticAudio
                  ? "GUIDA ALL’ASCOLTO"
                  : "TESTO IN INGLESE · SEGUE LA VOCE"}
              </small>
              {pack.authenticAudio ? (
                <p>{pack.scenario.text}</p>
              ) : (
                <div
                  ref={scenarioRef}
                  lang="en"
                  className={`scenarioFollow ${scenarioTurns.length > 1 ? "dialogueScript" : ""}`}
                >
                  {scenarioTurns.map((turn, turnIndex) => (
                    <p key={`${turn.speaker ?? "text"}-${turnIndex}`}>
                      {turn.speaker && <b>{turn.speaker}</b>}
                      {turn.words.map((word, wordIndex) => {
                        const absolute = turn.start + wordIndex;
                        return (
                          <span
                            key={`${word}-${absolute}`}
                            className={
                              absolute === scenarioWord ? "active" : ""
                            }
                          >
                            {word}{" "}
                          </span>
                        );
                      })}
                    </p>
                  ))}
                </div>
              )}
              <details>
                <summary>Mostra il significato in italiano</summary>
                <p>{pack.scenario.translation}</p>
              </details>
            </section>
            <button className="continue" onClick={startQuiz}>
              Inizia i 10 quiz <b>→</b>
            </button>
          </>
        )}
        {phase === "quiz" && item && (
          <>
            <div className="themeQuizMeta">
              <span>
                Domanda {index + 1} di {quiz.length}
              </span>
              <b>{pack.level}</b>
            </div>
            <h1>{item.prompt}</h1>
            <div className="themeQuizOptions">
              {item.options.map((option, choice) => {
                const state =
                  selected === null
                    ? ""
                    : choice === item.answer
                      ? "correct"
                      : choice === selected
                        ? "wrong"
                        : "";
                return (
                  <button
                    type="button"
                    key={option}
                    className={state}
                    onClick={() => choose(choice)}
                    disabled={selected !== null}
                  >
                    <b>{String.fromCharCode(65 + choice)}</b>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div
                className={`themeQuizFeedback ${selected === item.answer ? "good" : "review"}`}
              >
                <strong>
                  {selected === item.answer
                    ? [
                        "Ottimo, hai colto la sfumatura.",
                        "Ben fatto: collegamento preciso.",
                        "Risposta solida, continua così.",
                      ][index % 3]
                    : "È un punto utile da rinforzare."}
                </strong>
                <ConceptText text={item.explanationIt} terms={item.options} />
                <small>
                  {selected === item.answer
                    ? "La spiegazione consolida anche le risposte corrette."
                    : "Rileggi la regola o l’esempio, poi incontrerai di nuovo il concetto in una forma diversa."}
                </small>
              </div>
            )}
            <div className="themeQuizNav">
              <button type="button" className="showSolution" onClick={next}>
                Salta domanda
              </button>
              <button
                className="continue"
                disabled={selected === null}
                onClick={next}
              >
                {index + 1 < quiz.length
                  ? "Prossima domanda"
                  : "Vedi il risultato"}{" "}
                <b>→</b>
              </button>
            </div>
          </>
        )}
        {phase === "response" && (
          <section className="missionOpenTask">
            <span className="eyebrow">Usa ciò che hai imparato</span>
            <h1>Risposta libera</h1>
            <p>
              Riassumi in inglese la situazione e spiega che cosa diresti o
              faresti. Non tradurre parola per parola.
            </p>
            <textarea
              lang="en"
              rows={8}
              value={freeResponse}
              onChange={(event) => setFreeResponse(event.target.value)}
              placeholder="Scrivi la risposta in inglese…"
            />
            <div className="missionScoreLine">
              <b>{responseWords} parole</b>
              <span>Completezza stimata: {responseScore}%</span>
            </div>
            <button
              type="button"
              className="continue"
              disabled={responseWords < 5}
              onClick={() => { setPhase("repeat"); scrollTo(0, 0); }}
            >
              Continua con la risposta orale <b>→</b>
            </button>
          </section>
        )}
        {phase === "repeat" && (
          <section className="missionOpenTask">
            <span className="eyebrow">Ascolta e rispondi</span>
            <h1>Ripetizione e interazione</h1>
            <p>Ascolta il modello, poi pronuncialo con la tua voce.</p>
            <blockquote lang="en">{target}</blockquote>
            <div className="missionAudioActions">
              <button type="button" onClick={() => speak(target)}>▶ Ascolta il modello</button>
              <button type="button" className={recording ? "recording" : ""} disabled={recording} onClick={recordResponse}>
                {recording ? "● Sto ascoltando…" : "Parla in inglese"}
              </button>
            </div>
            {spoken && (
              <div className="missionSpeechResult">
                <small>PAROLE RICONOSCIUTE</small>
                <p lang="en">{spoken}</p>
                <b>{speechScore}%</b>
              </div>
            )}
            <div className="themeQuizNav">
              <button type="button" className="showSolution" onClick={finishMission}>Salta prova orale</button>
              <button type="button" className="continue" disabled={!spoken || spoken.startsWith("Riconoscimento") || spoken.startsWith("Voce non")} onClick={finishMission}>
                Concludi la missione <b>→</b>
              </button>
            </div>
          </section>
        )}
        {phase === "result" && (
          <div className="themePackResult">
            <span>{shownScore >= 80 ? "✓" : "↗"}</span>
            <small>SESSIONE COMPLETATA</small>
            <strong>{shownScore}%</strong>
            <h1>
              {shownScore >= 85
                ? "Ottima padronanza"
                : shownScore >= 65
                  ? "Base solida: continuiamo"
                  : "Hai individuato cosa allenare"}
            </h1>
            <p>
              {shownScore >= 85
                ? "Sai riconoscere e usare il lessico della sessione."
                : shownScore >= 65
                  ? "Rileggi gli esempi meno immediati e prova un nuovo ordine di domande."
                  : "Nessun problema: ripeti ascolto e vocaboli, poi il quiz cambierà ordine e alternative."}
            </p>
            <div className="missionBreakdown">
              <span><small>Comprensione e lessico</small><b>{score}%</b></span>
              <span><small>Risposta libera</small><b>{responseScore}%</b></span>
              <span><small>Parole riconosciute</small><b>{speechScore}%</b></span>
            </div>
            <div>
              <button type="button" className="continue" onClick={startQuiz}>
                Riprova con quiz diversi <b>↻</b>
              </button>
              <button type="button" className="showSolution" onClick={onClose}>
                Torna ai temi
              </button>
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
