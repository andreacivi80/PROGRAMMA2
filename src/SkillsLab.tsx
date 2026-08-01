import { useMemo, useState } from "react";
import type { Cefr } from "./curriculum";
import { getAudioAccent } from "./preferences";

type Lab = "menu" | "errors" | "pairs" | "mediation" | "families" | "dialogue" | "shadowing" | "define" | "daily";
const errorBank = [
  ["I am agree with you.", "I agree with you.", "Agree è un verbo e non richiede am."],
  ["She don't work here.", "She doesn't work here.", "Con she usa doesn't + verbo base."],
  ["I have seen him yesterday.", "I saw him yesterday.", "Yesterday indica un tempo concluso: Past Simple."],
  ["The report must to be revised.", "The report must be revised.", "Dopo un modale usa il verbo base senza to."],
  ["Despite of the delay, we finished.", "Despite the delay, we finished.", "Despite è seguito direttamente dal nome."],
] as const;
const pairs = [["ship", "sheep"], ["live", "leave"], ["three", "tree"], ["think", "sink"], ["bat", "bet"], ["worked", "walked"]] as const;
const familyTasks = [
  { prompt: "decide", answer: "decision", options: ["decision", "description", "discussion", "selection"], family: ["decide", "decision", "decisive", "decisively"], note: "Decision è il nome formato dal verbo decide; le altre alternative sono nomi reali, ma appartengono ad altre famiglie." },
  { prompt: "succeed", answer: "successful", options: ["successful", "successive", "sufficient", "supportive"], family: ["succeed", "success", "successful", "successfully"], note: "Successful è l’aggettivo della famiglia di succeed. Successive è simile nella forma, ma significa consecutivo." },
  { prompt: "analysis", answer: "analytical", options: ["analytical", "analogous", "additional", "artificial"], family: ["analyse", "analysis", "analytical", "analytically"], note: "Analytical è l’aggettivo collegato ad analysis; analogous appartiene a una famiglia e a un significato differenti." },
  { prompt: "reliable", answer: "reliability", options: ["reliability", "reluctance", "relevance", "resilience"], family: ["rely", "reliability", "reliable", "reliably"], note: "Reliability è il nome collegato a reliable. Le altre opzioni sono nomi astratti plausibili, ma non della stessa famiglia." },
] as const;
const mediation: Record<Cefr, { it: string; keywords: string[]; model: string }> = {
  A1: { it: "Dì a un collega inglese che la riunione è domani alle dieci.", keywords: ["meeting", "tomorrow", "ten"], model: "The meeting is tomorrow at ten." },
  A2: { it: "Spiega che il treno è in ritardo e arriverai circa venti minuti dopo.", keywords: ["train", "late", "twenty"], model: "My train is late, so I will arrive about twenty minutes later." },
  B1: { it: "Comunica che il documento è quasi pronto, ma servono ancora i dati del cliente.", keywords: ["document", "ready", "client"], model: "The document is almost ready, but we still need the client's data." },
  B2: { it: "Riassumi: la proposta riduce i costi, ma richiede formazione e un periodo di prova.", keywords: ["cost", "training", "trial"], model: "The proposal reduces costs, but it requires training and a trial period." },
  C1: { it: "Spiega con cautela che i risultati sono promettenti, ma non dimostrano ancora un rapporto causale.", keywords: ["promising", "prove", "causal"], model: "The findings are promising, but they do not yet prove a causal relationship." },
};
const shadowing: Record<Cefr, string[]> = {
  A1: ["Could I have a glass of water, please?", "I usually start work at nine.", "Where is the nearest bus stop?"],
  A2: ["I was cooking when the phone rang.", "If it rains, we will stay at home.", "I have already sent the message."],
  B1: ["The meeting was postponed because two colleagues were absent.", "I would appreciate it if you could confirm the booking.", "We have been working on this project since March."],
  B2: ["Although the proposal is promising, several practical issues remain unresolved.", "The delay could have been avoided if the warning had been taken seriously.", "What concerns me most is the lack of reliable evidence."],
  C1: ["The findings should be interpreted cautiously, particularly given the limited sample size.", "Had the stakeholders been consulted earlier, the transition might have been considerably smoother.", "The argument is persuasive insofar as it distinguishes correlation from causation."],
};
const definitions: Record<Cefr, { word: string; keywords: string[]; model: string }[]> = {
  A1: [{ word: "kettle", keywords: ["water", "hot", "boil"], model: "It is a kitchen object used to boil water." }],
  A2: [{ word: "neighbour", keywords: ["person", "live", "near"], model: "A person who lives near you." }],
  B1: [{ word: "deadline", keywords: ["time", "finish", "work"], model: "The latest time by which work must be finished." }],
  B2: [{ word: "compromise", keywords: ["agreement", "both", "accept"], model: "An agreement in which both sides accept less than they originally wanted." }],
  C1: [{ word: "accountability", keywords: ["responsible", "decision", "explain"], model: "The duty to be responsible for decisions and explain their consequences." }],
};

function playWord(word: string) {
  const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    audio = new Audio(`${import.meta.env.BASE_URL}audio/words/${slug}.wav`),
    fallback = () => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = getAudioAccent();
      utterance.rate = 0.8;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    };
  audio.onerror = fallback;
  void audio.play().catch(fallback);
}

export default function SkillsLab({ level, onComplete, reviewItems = [] }: { level: Cefr; onComplete: (id: string, score: number) => void; reviewItems?: { prompt: string; answer: string }[] }) {
  const [lab, setLab] = useState<Lab>("menu"), [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null), [correct, setCorrect] = useState(0),
    [text, setText] = useState(""), [checked, setChecked] = useState(false),
    [pairTarget, setPairTarget] = useState<0 | 1>(0), [dialogueStep, setDialogueStep] = useState(0),
    [spoken, setSpoken] = useState(""), [recording, setRecording] = useState(false);
  const shuffledPairs = useMemo(() => [...pairs].sort(() => Math.random() - .5), [lab]);
  const dailyQuestions = useMemo(() => {
    const source = reviewItems.length ? reviewItems : errorBank.map((row) => ({ prompt: row[0], answer: row[1] }));
    return [...source].sort(() => Math.random() - .5).slice(0, 5);
  }, [level, lab, reviewItems]);
  const reset = (next: Lab) => { setLab(next); setIndex(0); setSelected(null); setCorrect(0); setText(""); setChecked(false); setDialogueStep(0); setSpoken(""); setRecording(false); };
  const finish = (id: string, total: number, value = correct) => { onComplete(`skills:${level}:${id}`, Math.round((value / total) * 100)); reset("menu"); };
  const recognize = () => {
    const Ctor = (window as typeof window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition ??
      (window as typeof window & { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!Ctor) { setSpoken("Riconoscimento vocale non disponibile."); return; }
    const recognition = new Ctor(); recognition.lang = getAudioAccent(); recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event: any) => setSpoken(event.results?.[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => { setSpoken("Voce non riconosciuta. Riprova."); setRecording(false); };
    recognition.onend = () => setRecording(false); setRecording(true); setSpoken(""); recognition.start();
  };
  if (lab === "menu") return <section className="skillsHub"><div className="themeHeading"><span><small>LABORATORI PRATICI · {level}</small><h2>Usa l’inglese, non soltanto riconoscerlo</h2></span><b>8 attività</b></div><div className="skillsCards">
    <button onClick={() => reset("errors")}><b>✎</b><strong>Trova l’errore</strong><small>Correggi frasi reali</small></button>
    <button onClick={() => reset("pairs")}><b>◉</b><strong>Minimal pairs</strong><small>Ascolta suoni simili</small></button>
    <button onClick={() => reset("mediation")}><b>IT→EN</b><strong>Mediazione</strong><small>Trasmetti il significato</small></button>
    <button onClick={() => reset("families")}><b>ABC</b><strong>Famiglie di parole</strong><small>Verbo, nome, aggettivo</small></button>
    <button onClick={() => reset("dialogue")}><b>↪</b><strong>Dialogo a bivi</strong><small>Scegli tono e risposta</small></button>
    <button onClick={() => reset("shadowing")}><b>◖</b><strong>Shadowing</strong><small>Ascolta e ripeti subito</small></button>
    <button onClick={() => reset("define")}><b>?</b><strong>Definisci in inglese</strong><small>Spiega senza tradurre</small></button>
    <button onClick={() => reset("daily")}><b>5</b><strong>Sfida quotidiana</strong><small>Priorità ai tuoi errori</small></button>
  </div></section>;
  if (lab === "errors") { const row = errorBank[index]; return <section className="skillSession"><button className="showSolution" onClick={() => reset("menu")}>← Laboratori</button><span className="eyebrow">TROVA L’ERRORE · {index + 1}/{errorBank.length}</span><h1 lang="en">{row[0]}</h1><p>Quale versione corregge la frase?</p><div className="answers">{[row[1], row[0]].sort((a,b)=>index%2?a.localeCompare(b):b.localeCompare(a)).map((option, i) => <button key={option} disabled={selected !== null} className={selected===null?"":option===row[1]?"right":i===selected?"wrong":"dim"} onClick={()=>{setSelected(i);if(option===row[1])setCorrect(v=>v+1)}}><b>{String.fromCharCode(65+i)}</b><span>{option}</span></button>)}</div>{selected!==null&&<><div className="feedback good"><strong>Regola</strong><p>{row[2]}</p></div><button className="continue" onClick={()=>index+1<errorBank.length?(setIndex(v=>v+1),setSelected(null)):finish("errors",errorBank.length)}>{index+1<errorBank.length?"Prossima frase":"Termina"}<b>→</b></button></>}</section> }
  if (lab === "pairs") { const pair=shuffledPairs[index]; return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">MINIMAL PAIRS · {index+1}/{shuffledPairs.length}</span><h1>Quale parola senti?</h1><button className="pairListen" onClick={()=>{const target=(Math.random()>.5?1:0) as 0|1;setPairTarget(target);setSelected(null);playWord(pair[target])}}>▶ Ascolta una nuova parola</button><div className="pairChoices">{pair.map((word,i)=><button key={word} disabled={selected!==null} className={selected===null?"":i===pairTarget?"right":i===selected?"wrong":"dim"} onClick={()=>{setSelected(i);if(i===pairTarget)setCorrect(v=>v+1);playWord(word)}}>{word}</button>)}</div>{selected!==null&&<button className="continue" onClick={()=>index+1<shuffledPairs.length?(setIndex(v=>v+1),setSelected(null)):finish("pairs",shuffledPairs.length)}>{index+1<shuffledPairs.length?"Prossima coppia":"Termina"}<b>→</b></button>}</section> }
  if (lab === "mediation") { const task=mediation[level], hits=task.keywords.filter(word=>text.toLowerCase().includes(word)).length; return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">SFIDA DI MEDIAZIONE · {level}</span><h1>Comunica l’informazione essenziale in inglese</h1><blockquote>{task.it}</blockquote><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Scrivi con parole tue in inglese…" />{!checked?<button className="continue" disabled={text.trim().split(/\s+/).length<4} onClick={()=>setChecked(true)}>Controlla il messaggio<b>→</b></button>:<><div className={`feedback ${hits>=2?"good":"bad"}`}><strong>{hits}/{task.keywords.length} idee chiave riconosciute</strong><p>Modello possibile: <b lang="en">{task.model}</b></p></div><button className="continue" onClick={()=>finish("mediation",task.keywords.length,hits)}>Concludi<b>→</b></button></>}</section> }
  if (lab === "families") { const task=familyTasks[index], options=[...task.options].sort((a,b)=>(a.length+index)%5-(b.length+index)%5); return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">FAMIGLIE DI PAROLE · {index+1}/{familyTasks.length}</span><h1>Quale parola appartiene alla stessa famiglia di <em>{task.prompt}</em>?</h1><div className="answers">{options.map((option,i)=><button key={option} disabled={selected!==null} className={selected===null?"":option===task.answer?"right":i===selected?"wrong":"dim"} onClick={()=>{setSelected(i);if(option===task.answer)setCorrect(v=>v+1)}}><b>{String.fromCharCode(65+i)}</b><span>{option}</span></button>)}</div>{selected!==null&&<><div className="feedback good"><strong>Confronto linguistico</strong><p>{task.note}</p></div><p className="familyLine">{task.family.join(" · ")}</p><button className="continue" onClick={()=>index+1<familyTasks.length?(setIndex(v=>v+1),setSelected(null)):finish("families",familyTasks.length)}>{index+1<familyTasks.length?"Prossima famiglia":"Termina"}<b>→</b></button></>}</section> }
  if (lab === "shadowing") { const target=shadowing[level][index], expected=target.toLowerCase().replace(/[^a-z' ]/g," ").split(/\s+/).filter(Boolean), heard=spoken.toLowerCase().replace(/[^a-z' ]/g," ").split(/\s+/).filter(Boolean), hits=expected.filter((word,position)=>heard[position]===word).length, score=Math.round((hits/expected.length)*100); return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">SHADOWING · {index+1}/{shadowing[level].length}</span><h1>Ascolta e ripeti subito</h1><blockquote lang="en">{target}</blockquote><button className="pairListen" onClick={()=>playWord(target)}>▶ Ascolta il modello</button><button className={recording?"recording continue":"continue"} disabled={recording} onClick={recognize}>{recording?"● Sto ascoltando…":"Ripeti adesso"}</button>{spoken&&<div className="feedback good"><strong>{score}% di parole e ordine riconosciuti</strong><p lang="en">{spoken}</p><small>Il punteggio non valuta i singoli fonemi: usa anche il tuo riascolto nella lezione.</small></div>}{spoken&&<button className="continue" onClick={()=>{const gained=score>=75?1:0; if(index+1<shadowing[level].length){setCorrect(v=>v+gained);setIndex(v=>v+1);setSpoken("")}else finish("shadowing",shadowing[level].length,correct+gained)}}>{index+1<shadowing[level].length?"Prossima frase":"Termina"}<b>→</b></button>}</section> }
  if (lab === "define") { const task=definitions[level][0], hits=task.keywords.filter(word=>text.toLowerCase().includes(word)).length; return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">DEFINISCI SENZA TRADURRE · {level}</span><h1>Spiega <em lang="en">{task.word}</em> usando soltanto l’inglese</h1><textarea lang="en" value={text} onChange={event=>{setText(event.target.value);setChecked(false)}} placeholder="Descrivi in inglese la persona, l’oggetto o l’idea…" />{!checked?<button className="continue" disabled={text.trim().split(/\s+/).length<4} onClick={()=>setChecked(true)}>Controlla la definizione<b>→</b></button>:<><div className={`feedback ${hits>=2?"good":"bad"}`}><strong>{hits}/{task.keywords.length} idee utili riconosciute</strong><p>Un modello possibile: <b lang="en">{task.model}</b></p></div><button className="continue" onClick={()=>finish("define",task.keywords.length,hits)}>Concludi<b>→</b></button></>}</section> }
  if (lab === "daily") { const task=dailyQuestions[index]; if(!task) return <section className="skillSession"><button className="continue" onClick={()=>reset("menu")}>Torna ai laboratori</button></section>; return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">RICHIAMO ATTIVO · {index+1}/{dailyQuestions.length}</span><h1>{task.prompt}</h1><p>Formula mentalmente o ad alta voce la risposta prima di scoprirla.</p>{!checked?<button className="continue" onClick={()=>setChecked(true)}>Mostra la risposta<b>→</b></button>:<><div className="feedback good"><strong>Risposta da confrontare</strong><p lang="en">{task.answer}</p></div><div className="dialogueChoices"><button onClick={()=>{setCorrect(v=>v+1);setSelected(1)}}><strong>La ricordavo correttamente</strong><small>Il punto entrerà nel ripasso dilazionato.</small></button><button onClick={()=>setSelected(0)}><strong>Devo rinforzarla</strong><small>La risposta tornerà più presto.</small></button></div>{selected!==null&&<button className="continue" onClick={()=>index+1<dailyQuestions.length?(setIndex(v=>v+1),setSelected(null),setChecked(false)):finish("daily",dailyQuestions.length,correct+(selected===1?1:0))}>{index+1<dailyQuestions.length?"Prossimo richiamo":"Termina"}<b>→</b></button>}</>}</section> }
  const dialogue = [
    { prompt:"Your colleague says: ‘I can’t finish this today.’", options:[["What is blocking you, and how can I help?",1,"Individua l’ostacolo e offre aiuto senza promettere al posto dell’altro."],["I can finish everything for you.",0,"Offre una soluzione, ma elimina responsabilità e vincoli senza prima capirli."],["Can you try to finish it somehow?",0,"Riconosce il problema, ma non cerca la causa né concorda una priorità."],["We will simply move the deadline.",0,"Decide una modifica prima di verificarne impatto e autorizzazione."]] },
    { prompt:"A customer reports that an urgent delivery is late.", options:[["I understand why the delay is a concern. Let me check the confirmed status and the available options.",1,"Riconosce l’impatto, verifica i fatti e apre a soluzioni concrete."],["I understand the concern, but delays sometimes happen.",0,"Riconosce il disagio ma lo minimizza e non propone un’azione."],["The tracking page should probably update soon.",0,"Fornisce una supposizione senza verificare lo stato reale."],["I can assure you it will arrive today.",0,"Promette un risultato non ancora verificato."]] },
    { prompt:"You see an advantage in a proposal but disagree with its current cost estimate.", options:[["I see the operational advantage; however, the current estimate may understate the implementation cost.",1,"Concede il punto valido e delimita con precisione il disaccordo."],["I agree with the advantage, although the proposal is too expensive.",0,"È comprensibile, ma too expensive è più assoluto e meno analitico."],["The estimate is wrong, despite the proposal being useful.",0,"Formula una conclusione netta senza indicare su quali costi si basa."],["I can see both sides, so either option is acceptable.",0,"Evita il disaccordo invece di affrontare il problema della stima."]] },
  ], turn=dialogue[dialogueStep]; return <section className="skillSession"><button className="showSolution" onClick={()=>reset("menu")}>← Laboratori</button><span className="eyebrow">DIALOGO A BIVI · {dialogueStep+1}/{dialogue.length}</span><h1>{turn.prompt}</h1><div className="dialogueChoices">{turn.options.map(([option,ok,note],i)=><button key={String(option)} disabled={selected!==null} className={selected===null?"":ok?"right":i===selected?"wrong":"dim"} onClick={()=>{setSelected(i);if(ok)setCorrect(v=>v+1)}}><strong>{option}</strong>{selected!==null&&<small>{note}</small>}</button>)}</div>{selected!==null&&<button className="continue" onClick={()=>dialogueStep+1<dialogue.length?(setDialogueStep(v=>v+1),setSelected(null)):finish("dialogue",dialogue.length)}>{dialogueStep+1<dialogue.length?"Continua il dialogo":"Termina"}<b>→</b></button>}</section>;
}
