import { useMemo, useState } from "react";
import type { Cefr } from "./curriculum";
import { placementItems } from "./placementModel";
import type { ErrorCluster, SkillEstimate } from "./learningIntelligence";
import { analyzeLocalWriting } from "./languageAnalysis";
import type { WritingAnalysis } from "./languageAnalysis";
import type { AdaptiveAction, AdaptivePlan } from "./adaptivePlan";

type SavedPhrase = { id: string; en: string; it?: string; source: string; savedAt: string };
type MonthlyCheck = { score: number; completedAt: string };

export default function LearningCoach({ level, goal, skills, plan, clusters, phrases, monthly, weeklyDone, prerequisite, onGoal, onMicro, onNew, onPrerequisite, onReview, onReading, onSimulation, onRemovePhrase, onMonthly, onWeekly }: {
  level: Cefr;
  goal: string;
  skills: SkillEstimate[];
  plan: AdaptivePlan;
  clusters: ErrorCluster[];
  phrases: SavedPhrase[];
  monthly: Record<string, MonthlyCheck>;
  weeklyDone: boolean;
  prerequisite: { required: boolean; first: string; then: string; reason: string };
  onGoal: (goal: string) => void;
  onMicro: () => void;
  onNew: () => void;
  onPrerequisite: () => void;
  onReview: () => void;
  onReading: () => void;
  onSimulation: () => void;
  onRemovePhrase: (id: string) => void;
  onMonthly: (score: number) => void;
  onWeekly: (response: string) => void;
}) {
  const weakest = [...skills].sort((a, b) => a.score - b.score)[0];
  const [tab, setTab] = useState<"plan" | "phrases" | "checks">("plan");
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [monthlyIndex, setMonthlyIndex] = useState(0);
  const [monthlyAnswers, setMonthlyAnswers] = useState<Record<number, number>>({});
  const [weeklyText, setWeeklyText] = useState("");
  const [weeklyReview, setWeeklyReview] = useState<WritingAnalysis | null>(null);
  const questions = useMemo(() => placementItems.filter(item => item.level === level), [level]);
  const monthKey = new Date().toISOString().slice(0, 7);
  const previous = Object.entries(monthly).filter(([key]) => key !== monthKey).sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1];
  const finishMonthly = () => {
    const correct = questions.filter((question, index) => monthlyAnswers[index] === question.answer).length;
    onMonthly(Math.round((correct / questions.length) * 100));
    setMonthlyOpen(false);
    setMonthlyIndex(0);
    setMonthlyAnswers({});
  };
  const speakPhrase = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    speechSynthesis.speak(utterance);
  };
  const runPlanAction = (action: AdaptiveAction) => {
    if (action === "new") onNew();
    else if (action === "reading") onReading();
    else if (action === "simulation") onSimulation();
    else onReview();
  };
  return (
    <section className="learningCoach">
      <header>
        <span><small>STUDIO INTELLIGENTE</small><h2>Il tuo allenamento, non uno standard</h2></span>
        <b>{level}</b>
      </header>
      <div className="coachTabs" role="tablist" aria-label="Studio intelligente">
        <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>Oggi</button>
        <button className={tab === "phrases" ? "active" : ""} onClick={() => setTab("phrases")}>Frasi salvate <b>{phrases.length}</b></button>
        <button className={tab === "checks" ? "active" : ""} onClick={() => setTab("checks")}>Verifiche</button>
      </div>
      {tab === "plan" && <>
        <label className="coachGoal">Il mio obiettivo<select value={goal} onChange={event => onGoal(event.target.value)}><option>Conversazione quotidiana</option><option>Viaggi e situazioni reali</option><option>Inglese per il lavoro</option><option>Grammatica e certificazioni</option><option>Inglese tecnico e ricerca</option></select></label>
        <section className={`prerequisiteRoute ${prerequisite.required ? "required" : "ready"}`}>
          <span><small>ORDINE CONSIGLIATO</small><h3>{prerequisite.required ? `Prima: ${prerequisite.first}` : `Puoi proseguire con ${prerequisite.then}`}</h3><p>{prerequisite.required ? `${prerequisite.reason} Dopo il rinforzo passerai a “${prerequisite.then}”.` : "Le competenze necessarie risultano sufficienti per affrontare il prossimo argomento."}</p></span>
          <button type="button" onClick={prerequisite.required ? onPrerequisite : onNew}>{prerequisite.required ? "Rinforza prima questo" : "Continua il percorso"}</button>
        </section>
        <section className={`adaptivePlanSummary ${plan.mode}`} aria-label="Piano adattivo di oggi">
          <span><small>PIANO CALCOLATO SUI TUOI RISULTATI</small><h3>{plan.headline}</h3><p>{plan.reason}</p></span>
          <div><b>{plan.consolidation}%<small>consolidamento</small></b><b>{plan.newContent}%<small>nuovo</small></b><b>{plan.context}%<small>contesto</small></b></div>
        </section>
        <div className="dailyMix">
          {plan.items.map(item => <button key={item.action} onClick={() => runPlanAction(item.action)}><b>{item.percent}%</b><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}
        </div>
        <button className="microSession" onClick={onMicro}><b>5 min</b><span><strong>Allenamento rapido intelligente</strong><small>Errore, ascolto, frase e verifica finale</small></span><i>→</i></button>
        <div className="skillProfile">
          <div><span><small>PROFILO PER COMPETENZE</small><h3>Il punto da allenare ora è {weakest.skill.toLowerCase()}</h3></span><b>{weakest.score}%</b></div>
          <section>{skills.map(item => <article key={item.skill}><span><strong>{item.skill}</strong><b>{item.score}%</b></span><i><em style={{ width: `${item.score}%` }} /></i><small>{item.evidence}</small></article>)}</section>
        </div>
        <div className="errorDiagnosis"><small>ERRORI CHE TORNANO PIÙ SPESSO</small>{clusters.length ? clusters.map(cluster => <span key={cluster.id}><b>{cluster.count}</b><strong>{cluster.label}</strong><em>{cluster.direction === "attention" ? "Da rinforzare" : "In miglioramento"}</em></span>) : <p>Nessun gruppo ricorrente: continua ad allenarti per rendere la stima più precisa.</p>}</div>
        <div className="weeklyChallenge"><span><small>SFIDA DELLA SETTIMANA</small><h3>{weeklyDone ? "Sfida completata" : goal.includes("lavoro") ? "Scrivi un aggiornamento professionale" : goal.includes("Viaggi") ? "Risolvi un imprevisto durante un viaggio" : "Racconta una decisione e spiegane il motivo"}</h3></span>{weeklyDone ? <p>Hai già completato la missione. La prossima settimana ne arriverà una nuova.</p> : <><p>Scrivi almeno 35 parole in inglese. Usa un collegamento come <b lang="en">because</b>, <b lang="en">however</b> o <b lang="en">although</b>.</p><textarea value={weeklyText} onChange={event => { setWeeklyText(event.target.value); setWeeklyReview(null); }} placeholder="Scrivi qui la tua risposta…" /><button disabled={weeklyText.trim().split(/\s+/).length < 35} onClick={() => setWeeklyReview(analyzeLocalWriting(weeklyText))}>Analizza grammatica e stile</button>{weeklyReview && <section className="weeklyCorrection"><strong>Valutazione complessiva: {weeklyReview.scores.Totale}/100</strong>{weeklyReview.notes.length ? weeklyReview.notes.map(note => <span key={note}>{note}</span>) : <span>Non ho rilevato errori frequenti.</span>}{weeklyReview.corrected !== weeklyText.trim() && <p lang="en">{weeklyReview.corrected}</p>}<button onClick={() => onWeekly(weeklyReview.corrected)}>Conferma la sfida</button></section>}</>}</div>
      </>}
      {tab === "phrases" && <div className="phraseBook"><h3>Il mio quaderno di frasi</h3><p>Riascolta le frasi che hai scelto e usale nei ripassi.</p>{phrases.length ? phrases.slice().reverse().map(phrase => <article key={phrase.id}><button aria-label={`Ascolta ${phrase.en}`} onClick={() => speakPhrase(phrase.en)}>▶</button><span><strong lang="en">{phrase.en}</strong>{phrase.it && <small>{phrase.it}</small>}<em>{phrase.source}</em></span><button aria-label={`Rimuovi ${phrase.en}`} onClick={() => onRemovePhrase(phrase.id)}>×</button></article>) : <div className="emptyPhraseBook">Durante le lezioni usa “Salva frase”: la ritroverai qui.</div>}</div>}
      {tab === "checks" && <div className="monthlyCheck"><h3>Controllo mensile {level}</h3><p>Le stesse sei competenze oggettive permettono un confronto più attendibile nel tempo.</p>{monthly[monthKey] ? <div className="monthlyResult"><strong>{monthly[monthKey].score}%</strong><span>{previous ? `${monthly[monthKey].score >= previous.score ? "+" : ""}${monthly[monthKey].score - previous.score} punti rispetto alla prova precedente` : "Prima misurazione registrata"}</span><button onClick={() => setMonthlyOpen(true)}>Rifai il controllo</button></div> : <button className="startMonthly" onClick={() => setMonthlyOpen(true)}>Inizia 6 domande</button>}{monthlyOpen && questions[monthlyIndex] && <article className="monthlyQuestion"><small>DOMANDA {monthlyIndex + 1} DI {questions.length}</small>{questions[monthlyIndex].audioText && <button onClick={() => speakPhrase(questions[monthlyIndex].audioText!)}>▶ Ascolta</button>}<h4>{questions[monthlyIndex].prompt}</h4>{questions[monthlyIndex].options.map((option, index) => <button key={option} className={monthlyAnswers[monthlyIndex] === index ? "selected" : ""} onClick={() => setMonthlyAnswers(current => ({ ...current, [monthlyIndex]: index }))}>{option}</button>)}<button className="monthlyNext" disabled={monthlyAnswers[monthlyIndex] === undefined} onClick={() => monthlyIndex + 1 < questions.length ? setMonthlyIndex(value => value + 1) : finishMonthly()}>{monthlyIndex + 1 < questions.length ? "Prossima domanda" : "Registra il risultato"}</button></article>}</div>}
    </section>
  );
}
