import { useEffect, useMemo, useRef, useState } from "react";
import type { Cefr } from "./curriculum";
import { storyEpisodes } from "./storyData";
import { evaluateStorySpeech, storyBranchSupport } from "./storyBranches";
import { getAudioAccent } from "./preferences";

export default function StoryPath({ level, saved, onComplete }: {
  level: Cefr;
  saved: Record<string, { score: number; attempts: number; completedAt: string }>;
  onComplete: (id: string, score: number) => void;
}) {
  const episodes = useMemo(() => storyEpisodes.filter((entry) => entry.level === level), [level]);
  const [episodeId, setEpisodeId] = useState(episodes[0].id);
  const [choice, setChoice] = useState<number | null>(null);
  const [writing, setWriting] = useState("");
  const [paused, setPaused] = useState(false);
  const [recording, setRecording] = useState(false);
  const [spoken, setSpoken] = useState("");
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<{ stop?: () => void } | null>(null);
  const current = episodes.find((entry) => entry.id === episodeId) ?? episodes[0];
  const branch = storyBranchSupport[current.id];
  const evaluated = choice !== null;
  const speechResult = useMemo(() => evaluateStorySpeech(spoken, branch.keywords), [spoken, branch.keywords]);
  const listen = () => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = "en-GB";
    utterance.rate = level === "A1" ? 0.86 : level === "A2" ? 0.92 : level === "B1" ? 1 : 1.06;
    speechSynthesis.speak(utterance);
    setPaused(false);
  };
  useEffect(() => () => { speechSynthesis.cancel(); recognitionRef.current?.stop?.(); }, []);
  const recordAnswer = () => {
    recognitionRef.current?.stop?.();
    const speechWindow = window as typeof window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechError("Il riconoscimento vocale non è disponibile in questo browser. Puoi svolgere la risposta scritta.");
      setRecording(false);
      return;
    }
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = getAudioAccent();
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      setSpoken(event.results?.[0]?.[0]?.transcript?.trim() ?? "");
      setSpeechError("");
    };
    recognition.onerror = () => {
      setSpeechError("Non ho riconosciuto una frase completa. Puoi riprovare subito o continuare per iscritto.");
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    setSpoken("");
    setSpeechError("");
    setRecording(true);
    recognition.start();
  };
  const selectEpisode = (id: string) => {
    speechSynthesis.cancel();
    recognitionRef.current?.stop?.();
    setEpisodeId(id);
    setChoice(null);
    setWriting("");
    setPaused(false);
    setRecording(false);
    setSpoken("");
    setSpeechError("");
  };
  return (
    <section className="storyPath">
      <header>
        <span className="eyebrow">STORIA A EPISODI · {level}</span>
        <h2>Segui la storia, comprendi e rispondi</h2>
        <p>Le situazioni continuano da un episodio al successivo e diventano progressivamente più impegnative.</p>
      </header>
      <div className="storyEpisodes" aria-label="Episodi disponibili">
        {episodes.map((entry) => (
          <button key={entry.id} className={entry.id === current.id ? "active" : ""} onClick={() => selectEpisode(entry.id)}>
            <b>{saved[entry.id] ? "✓" : entry.number}</b><span><strong>{entry.title}</strong><small>{entry.setting}</small></span>
          </button>
        ))}
      </div>
      <article className="storyScene">
        <div className="storySceneTitle"><span><small>EPISODIO {current.number}</small><h3>{current.title}</h3></span><small>{current.setting}</small></div>
        <p lang="en">{current.text}</p>
        <div className="storyAudio"><button type="button" onClick={listen}>▶ Ascolta</button><button type="button" onClick={() => { if (paused) speechSynthesis.resume(); else speechSynthesis.pause(); setPaused(!paused); }}>{paused ? "▶ Riprendi" : "Ⅱ Pausa"}</button><button type="button" onClick={() => { speechSynthesis.cancel(); setPaused(false); }}>■ Stop</button></div>
        <h4>{current.question}</h4>
        <div className="storyChoices">
          {current.choices.map((answer, index) => <button type="button" key={answer} disabled={evaluated} className={evaluated ? index === current.answer ? "correct" : index === choice ? "wrong" : "" : ""} onClick={() => { setChoice(index); onComplete(current.id, index === current.answer ? 100 : 50); }}>{answer}</button>)}
        </div>
        {evaluated && <section className="storyFeedback"><strong>{choice === current.answer ? "Hai colto il punto centrale." : "Rileggiamolo con attenzione."}</strong><p>{current.explanation}</p><div className={choice === current.answer ? "storyConsequence good" : "storyConsequence"}><small>CONSEGUENZA DELLA SCELTA</small><span>{branch.consequences[choice]}</span></div></section>}
        {evaluated && <section className={`storySpeaking ${recording ? "recording" : ""}`}>
          <div><small>RISPOSTA PARLATA · FACOLTATIVA</small><strong>{branch.speakingPrompt}</strong></div>
          <button type="button" onClick={recordAnswer} disabled={recording}>{recording ? "● Sto ascoltando…" : spoken ? "↻ Registra di nuovo" : "● Parla in inglese"}</button>
          {speechError && <p className="storySpeechError">{speechError}</p>}
          {spoken && <div className="storySpeechResult"><small>TRASCRIZIONE RICONOSCIUTA</small><p lang="en">{spoken}</p><strong>{speechResult.percent}% degli elementi essenziali riconosciuti</strong><span>{speechResult.matched.length ? `Riconosciuti: ${speechResult.matched.join(" · ")}` : "Nessun elemento essenziale ancora riconosciuto: confronta il modello e riprova."}</span></div>}
        </section>}
        <label className="storyWriting"><strong>Ora scrivi con parole tue</strong><span>{current.writingPrompt}</span><textarea value={writing} onChange={(event) => setWriting(event.target.value)} placeholder="Scrivi qui in inglese…" /></label>
        {writing.trim().length >= 12 && <details className="storyModel"><summary>Confronta con un esempio</summary><p lang="en">{current.model}</p></details>}
      </article>
    </section>
  );
}
