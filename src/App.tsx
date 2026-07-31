"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  curriculumIndex,
  mobileCurriculum,
  type Cefr,
  type Choice,
  type MobileUnit,
} from "./curriculum";
import GrammarLesson from "./GrammarLesson";
import ReviewLab from "./ReviewLab";
import { readingPassages, type ReadingPassage } from "./readingLab";
import {
  actionVisualSets,
  jobVisualSets,
  kitchenVisualSets,
  phrasalVisualSets,
  type VisualSet,
} from "./visualQuiz";
import ThemePackLab from "./ThemePackLab";
import ThemePackHub from "./ThemePackHub";
import ConceptText from "./ConceptText";
import {
  getAudioAccent,
  getAudioRate,
  saveAudioAccent,
  saveAudioRate,
  type AudioAccent,
  type AudioRate,
} from "./preferences";
import { themePacks, type ThemePack } from "./themePacks";
import WordGamesHub from "./WordGamesHub";
import PlacementTest from "./PlacementTest";
import SkillsLab from "./SkillsLab";
import {
  applyDialogueVoice,
  dialogueRole,
  dialogueVoicePair,
} from "./speechVoices";
import {
  buildSupplementaryQuiz,
  supplementaryBankFor,
  supplementaryFingerprint,
} from "./supplementaryQuiz";
import "./themePacks.css";
import "./version29.css";
import "./wordGames.css";
import "./version33.css";

const APP_VERSION = "4.5";
const BUILD_DATE = "31 luglio 2026";
const BUILD_ID = "EC-4.5-0731";
type View =
  | "home"
  | "path"
  | "topics"
  | "lesson"
  | "progress"
  | "reading"
  | "review"
  | "smartReview"
  | "recoveryDrill"
  | "errors"
  | "placement"
  | "themePack";
type Phase =
  | "grammar"
  | "examples"
  | "vocabulary"
  | "cloze"
  | "writing"
  | "listening"
  | "speaking"
  | "quiz"
  | "bonus"
  | "complete";
type Result = {
  score: number;
  attempts: number;
  minutes: number;
  completedAt?: string;
  writing?: string;
};
type ReviewKind =
  | "Grammatica"
  | "Vocabolario"
  | "Phrasal verbs"
  | "Ascolto"
  | "Pronuncia"
  | "Lettura"
  | "Scrittura";
type ReviewAttempt = {
  at: string;
  givenAnswer: string;
  correct: boolean;
  hintUsed?: boolean;
  confidence?: "Bassa" | "Media" | "Alta";
};
type SmartReviewItem = {
  id: string;
  unitId: string;
  unitTitle: string;
  level: Cefr;
  kind: ReviewKind;
  prompt: string;
  answer: string;
  explanation: string;
  dueAt: string;
  step: number;
  mastered?: boolean;
  givenAnswer?: string;
  wrongCount?: number;
  correctStreak?: number;
  lastAttemptAt?: string;
  status?: "Nuovo" | "Da ripassare" | "In consolidamento" | "Acquisito";
  attempts?: ReviewAttempt[];
  hintUsed?: boolean;
  confidence?: "Bassa" | "Media" | "Alta";
};
type RecoveryQuestion = {
  review: SmartReviewItem;
  options: string[];
  answer: number;
};
type Progress = {
  schemaVersion: number;
  deviceId: string;
  currentDay: number;
  streak: number;
  lastStudyDate?: string;
  weeklyGoal?: number;
  days: Record<string, Result>;
  activity: Record<
    string,
    { minutes: number; score: number; completed: number }
  >;
  reading?: Record<
    string,
    { score: number; attempts: number; completedAt: string }
  >;
  reviews?: Record<
    string,
    { score: number; attempts: number; completedAt: string }
  >;
  themePacks?: Record<
    string,
    { score: number; attempts: number; completedAt: string }
  >;
  wordGames?: Record<
    string,
    { score: number; attempts: number; completedAt: string }
  >;
  smartReview?: Record<string, SmartReviewItem>;
};
type SessionCheckpoint = {
  unitId: string;
  phase: Phase;
  item: number;
  writing: string;
  points: { yes: number; all: number };
  input?: string;
  dictation?: string;
  sessionMinutes?: 5 | 15 | 30 | null;
  updatedAt: string;
};
type RecAlternative = { transcript: string; confidence: number };
type RecResult = {
  isFinal: boolean;
  length: number;
  [index: number]: RecAlternative;
};
type RecEvent = { results: ArrayLike<RecResult> };
type RecError = { error: string };
type RecCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: RecError) => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
  onnomatch: (() => void) | null;
};
declare global {
  interface Window {
    SpeechRecognition?: RecCtor;
    webkitSpeechRecognition?: RecCtor;
  }
}
const stages: Phase[] = [
  "grammar",
  "examples",
  "vocabulary",
  "cloze",
  "writing",
  "listening",
  "speaking",
  "quiz",
];
const labels: Record<Phase, string> = {
  grammar: "Grammatica",
  examples: "Esempi",
  vocabulary: "Vocaboli",
  cloze: "Completa",
  writing: "Scrivi",
  listening: "Ascolta",
  speaking: "Ripeti",
  quiz: "Quiz",
  bonus: "Extra",
  complete: "Completata",
};
const themes = [
  {
    id: "food",
    icon: "🍽",
    title: "Ristorante e cucina",
    description: "Ordina, chiedi modifiche e segui ricette.",
    matches: ["restaurant", "cooking", "food"],
  },
  {
    id: "social",
    icon: "@",
    title: "Social English",
    description: "DM, post, slang, tono e sicurezza online.",
    matches: [],
  },
  {
    id: "ira",
    icon: "IRA",
    title: "IRA · Inglese professionale",
    description: "Cosmetica, medical device, packaging e R&D.",
    matches: [],
  },
  {
    id: "accents",
    icon: "AU",
    title: "Accenti dal mondo",
    description: "Australia, Scozia e Galles con voci autentiche.",
    matches: [],
  },
  {
    id: "work",
    icon: "▣",
    title: "Lavoro e negoziazione",
    description: "Riunioni, richieste, problemi e accordi.",
    matches: ["work", "meeting", "negotiation", "professional"],
  },
  {
    id: "language",
    icon: "V/F",
    title: "Verbi e false friends",
    description: "Tempi verbali, participi e falsi amici da A1 a C1.",
    matches: [],
  },
  {
    id: "irregular",
    icon: "↶",
    title: "Verbi irregolari",
    description: "Past Simple e forme da fissare nel contesto.",
    matches: ["irregular", "past-simple", "past-vs-perfect"],
  },
  {
    id: "phrasal",
    icon: "◆",
    title: "Phrasal verbs e slang",
    description: "Inglese comune, idiomi e registro naturale.",
    matches: ["phrasal", "slang", "idiom", "spoken-nuance"],
  },
  {
    id: "varieties",
    icon: "UK/US",
    title: "Inglese britannico e americano",
    description: "Lessico, convenzioni e pronuncia delle due varietà.",
    matches: ["uk-us", "spoken-nuance", "idiom-register"],
  },
  {
    id: "long",
    icon: "▶",
    title: "Ascolti più lunghi",
    description: "Sessioni avanzate da 35–45 minuti.",
    matches: [],
  },
  {
    id: "visual",
    icon: "◉",
    title: "Quiz visivi separati",
    description: "Sessioni autonome: cucina, lavori e azioni.",
    matches: [],
  },
  {
    id: "reading",
    icon: "▤",
    title: "Reading Lab",
    description: "Testi completi con 6 domande e valutazione.",
    matches: [],
  },
  {
    id: "games",
    icon: "ABC",
    title: "Giochi di parole",
    description: "Cruciverba e impiccato calibrati per livello.",
    matches: [],
  },
  {
    id: "skills",
    icon: "✦",
    title: "Laboratori pratici",
    description: "Errori, suoni, mediazione, famiglie e dialoghi.",
    matches: [],
  },
  {
    id: "video",
    icon: "▻",
    title: "Video Lab",
    description: "Video ufficiali con transcript ed esercizi.",
    matches: [],
  },
] as const;
const videoResources = [
  {
    level: "A1",
    title: "Meeting new people",
    topic: "Presentarsi e accogliere una persona",
    url: "https://learnenglish.britishcouncil.org/free-resources/speaking/a1/meeting-new-people",
  },
  {
    level: "A1–A2",
    title: "Starting Out",
    topic: "Storia a episodi e situazioni quotidiane",
    url: "https://learnenglish.britishcouncil.org/free-resources/general/video-series/starting-out",
  },
  {
    level: "A2",
    title: "Talking about personal interests",
    topic: "Hobby, frequenza e conversazione naturale",
    url: "https://learnenglish.britishcouncil.org/free-resources/speaking/a2/talking-about-personal-interests",
  },
  {
    level: "B1",
    title: "Keeping a conversation going",
    topic: "Mantenere viva una conversazione",
    url: "https://learnenglish.britishcouncil.org/free-resources/speaking/b1/keeping-conversation-going",
  },
  {
    level: "B1–B2",
    title: "Word on the Street",
    topic: "Cultura britannica, dialoghi e grammatica",
    url: "https://learnenglish.britishcouncil.org/free-resources/general/video-series/word-street",
  },
  {
    level: "B2–C1",
    title: "Britain is GREAT",
    topic: "Documentari su cultura e vita britannica",
    url: "https://learnenglish.britishcouncil.org/free-resources/general/video-series/britain-great",
  },
] as const;
type ThemeId = (typeof themes)[number]["id"];
function themeSupportsLevel(id: ThemeId, level: Cefr) {
  if (id === "games" || id === "visual" || id === "skills") return true;
  if (id === "reading")
    return readingPassages.some((item) => item.level === level);
  if (id === "video")
    return videoResources.some((item) => item.level.includes(level));
  if (
    id === "social" ||
    id === "ira" ||
    id === "accents" ||
    id === "language" ||
    id === "food"
  ) {
    const category = id === "food" ? "dining" : id;
    return themePacks.some(
      (pack) => pack.category === category && pack.level === level,
    );
  }
  return unitsForTheme(id).some((unit) => unit.cefr === level);
}
function unitsForTheme(id: ThemeId) {
  const theme = themes.find((x) => x.id === id)!;
  return mobileCurriculum.filter((unit) =>
    id === "video"
      ? false
      : id === "long"
        ? unit.minutes >= 35
        : theme.matches.some((key) =>
            `${unit.id} ${unit.title}`.toLowerCase().includes(key),
          ),
  );
}
type TrainingMenuItem =
  | { kind: "lesson"; id: string; unit: MobileUnit; position: number }
  | {
      kind: "review";
      id: string;
      level: Cefr;
      end: number;
      final: boolean;
      minutes: number;
    };
function trainingMenu(level: Cefr): TrainingMenuItem[] {
  const lessons = mobileCurriculum.filter((unit) => unit.cefr === level),
    items: TrainingMenuItem[] = [];
  lessons.forEach((unit, index) => {
    const position = index + 1;
    items.push({ kind: "lesson", id: unit.id, unit, position });
    if (position === 4 || position === 8 || position === 12)
      items.push({
        kind: "review",
        id: `review:${level}:${position}`,
        level,
        end: position,
        final: position === 12,
        minutes: position === 12 ? 40 : 25,
      });
  });
  return items;
}
const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const futureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
};
const reviewKey = (unitId: string, kind: ReviewKind, prompt: string) =>
  `${unitId}:${kind}:${prompt
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .slice(0, 80)}`;
const fresh = (id: string): Progress => ({
  schemaVersion: 11,
  deviceId: id,
  currentDay: 1,
  streak: 0,
  weeklyGoal: 3,
  days: {},
  activity: {},
  reading: {},
  reviews: {},
  themePacks: {},
  wordGames: {},
  smartReview: {},
});
const validCode = (v: string) => /^[A-Za-z0-9+/=]{20,200000}$/.test(v.trim());
function deviceId() {
  const k = "english-coach-device-id",
    old = localStorage.getItem(k);
  if (old) return old;
  const id =
    crypto.randomUUID?.() ??
    `coach-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(k, id);
  return id;
}
function encodeProgress(value: Progress) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}
function decodeProgress(value: string): Progress {
  const binary = atob(value.trim()),
    bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0)),
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof parsed.days !== "object" ||
    typeof parsed.activity !== "object"
  )
    throw new Error("invalid");
  return parsed as Progress;
}
function similarity(a: string, b: string) {
  const words = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s']/gu, "")
        .split(/\s+/)
        .filter(Boolean),
    x = words(a),
    y = words(b);
  return x.length
    ? Math.round((x.filter((w) => y.includes(w)).length / x.length) * 100)
    : 0;
}
type PronunciationPart = { expected?: string; heard?: string; ok: boolean };
function pronunciationDiff(
  expected: string,
  heard: string,
): PronunciationPart[] {
  const clean = (v: string) =>
      v
        .toLowerCase()
        .replace(/[^\p{L}\p{N}'\s]/gu, "")
        .split(/\s+/)
        .filter(Boolean),
    a = clean(expected),
    b = clean(heard),
    rows = a.length + 1,
    cols = b.length + 1,
    dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++)
    for (let j = 1; j < cols; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  const out: PronunciationPart[] = [];
  let i = a.length,
    j = b.length;
  while (i || j) {
    if (i && j && a[i - 1] === b[j - 1]) {
      out.unshift({ expected: a[--i], heard: b[--j], ok: true });
    } else if (i && j && dp[i][j] === dp[i - 1][j - 1] + 1) {
      out.unshift({ expected: a[--i], heard: b[--j], ok: false });
    } else if (i && dp[i][j] === dp[i - 1][j] + 1) {
      out.unshift({ expected: a[--i], ok: false });
    } else {
      out.unshift({ heard: b[--j], ok: false });
    }
  }
  return out;
}
const audioSlug = (word: string) =>
  word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
let stopActiveAudio: (() => void) | null = null;
function AudioButton({
  text,
  src,
  label = "Ascolta",
}: {
  text: string;
  src?: string;
  label?: string;
}) {
  const [status, setStatus] = useState<
      "idle" | "waiting" | "playing" | "paused"
    >("idle"),
    [rate, setRate] = useState<AudioRate>(getAudioRate);
  const audioRef = useRef<HTMLAudioElement | null>(null),
    delayRef = useRef<number | null>(null);
  const stop = () => {
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.cancel();
    }
    setStatus("idle");
    if (stopActiveAudio === stop) stopActiveAudio = null;
  };
  useEffect(() => () => stop(), []);
  const speak = () => {
    if (typeof speechSynthesis === "undefined") {
      stop();
      return;
    }
    const voices = speechSynthesis
        .getVoices()
        .filter((v) => /^en(?:-|$)/i.test(v.lang)),
      preferredAccent = getAudioAccent(),
      voice =
        voices.find((v) => v.lang.startsWith(preferredAccent)) ??
        voices.find((v) => /^en-GB/i.test(v.lang)) ??
        voices.find((v) => /^en-US/i.test(v.lang)) ??
        voices[0];
    if (!voice) {
      stop();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = rate;
    utterance.onstart = () => setStatus("playing");
    utterance.onend = utterance.onerror = () => stop();
    speechSynthesis.speak(utterance);
  };
  const begin = () => {
    delayRef.current = null;
    if (!src) {
      speak();
      return;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.onplay = () => setStatus("playing");
    audio.onended = () => stop();
    audio.onerror = () => {
      audioRef.current = null;
      speak();
    };
    void audio.play().catch(() => {
      audioRef.current = null;
      speak();
    });
  };
  const start = () => {
    stopActiveAudio?.();
    stopActiveAudio = stop;
    setStatus("waiting");
    delayRef.current = window.setTimeout(begin, 1000);
  };
  const pause = () => {
    if (status === "waiting") {
      if (delayRef.current !== null) window.clearTimeout(delayRef.current);
      delayRef.current = null;
      setStatus("paused");
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    else if (typeof speechSynthesis !== "undefined") speechSynthesis.pause();
    setStatus("paused");
  };
  const resume = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      void audioRef.current.play();
    } else if (
      typeof speechSynthesis !== "undefined" &&
      speechSynthesis.paused
    ) {
      speechSynthesis.resume();
      setStatus("playing");
    } else {
      setStatus("waiting");
      delayRef.current = window.setTimeout(begin, 1000);
    }
  };
  const primary = () =>
    status === "idle" ? start() : status === "paused" ? resume() : pause();
  const primaryLabel =
    status === "waiting"
      ? "Avvio tra 1s…"
      : status === "playing"
        ? "Pausa"
        : status === "paused"
          ? "Riprendi"
          : label;
  return (
    <div className="audioControl">
      <div className="audioActions">
        <button className="audio" onClick={primary}>
          <b>{status === "playing" ? "Ⅱ" : "▶"}</b>
          {primaryLabel}
        </button>
        <button
          className="audioStop"
          disabled={status === "idle"}
          onClick={stop}
        >
          ■ Stop
        </button>
      </div>
      {src && (
        <div className="speed" aria-label="Velocità audio">
          {([0.8, 1, 1.2] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={rate === value}
              title={`Velocità ${value.toFixed(value === 1 ? 0 : 1)} per`}
              className={rate === value ? "active" : ""}
              onClick={() => {
                setRate(value);
                saveAudioRate(value);
                if (audioRef.current) audioRef.current.playbackRate = value;
              }}
            >
              {value.toFixed(value === 1 ? 0 : 1)}×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function AudioDuration({ src }: { src: string }) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    const probe = new Audio(src);
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration))
        setSeconds(Math.max(0, Math.round(probe.duration)));
    };
    return () => {
      probe.onloadedmetadata = null;
      probe.src = "";
    };
  }, [src]);
  const formatted =
    seconds === null
      ? "calcolo…"
      : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return <small className="audioLength">◷ Durata audio · {formatted}</small>;
}
const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
type VisualTile = {
  id: string;
  set: VisualSet;
  item: VisualSet["items"][number];
  itemIndex: number;
};
function visualTiles(sets: VisualSet[]): VisualTile[] {
  return sets.flatMap((set) =>
    set.items.map((item, itemIndex) => ({
      id: `${set.id}:${item.en}`,
      set,
      item,
      itemIndex,
    })),
  );
}
function playVisualAudio(word: string, browserOnly = false) {
  const fallback = () => {
    if (typeof speechSynthesis === "undefined") return;
    const voices = speechSynthesis
        .getVoices()
        .filter((v) => /^en(?:-|$)/i.test(v.lang)),
      voice =
        voices.find((v) => /^en-US/i.test(v.lang)) ??
        voices.find((v) => /^en-GB/i.test(v.lang)) ??
        voices[0];
    if (!voice) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.82;
    utterance.onend = utterance.onerror = () => {
      if (stopActiveAudio === stop) stopActiveAudio = null;
    };
    const stop = () => {
      speechSynthesis.cancel();
      if (stopActiveAudio === stop) stopActiveAudio = null;
    };
    stopActiveAudio?.();
    stopActiveAudio = stop;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };
  if (browserOnly) {
    fallback();
    return;
  }
  const audio = new Audio(
    `${import.meta.env.BASE_URL}audio/words/${audioSlug(word)}.wav`,
  );
  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
    if (stopActiveAudio === stop) stopActiveAudio = null;
  };
  stopActiveAudio?.();
  stopActiveAudio = stop;
  audio.onended = stop;
  audio.onerror = () => {
    stop();
    fallback();
  };
  void audio.play().catch(() => {
    stop();
    fallback();
  });
}
function VisualPictureLab({ sets }: { sets: VisualSet[] }) {
  const bank = useMemo(() => visualTiles(sets), [sets]),
    makeTargets = () => shuffled(bank).slice(0, Math.min(9, bank.length));
  const [targets, setTargets] = useState<VisualTile[]>(() => makeTargets()),
    [round, setRound] = useState(0),
    [chosen, setChosen] = useState<string | null>(null),
    [revealed, setRevealed] = useState<string[]>([]),
    [score, setScore] = useState(0);
  const done = round >= targets.length,
    target = done ? null : targets[round],
    mosaic = useMemo(
      () =>
        target
          ? shuffled([
              target,
              ...shuffled(bank.filter((tile) => tile.id !== target.id)).slice(
                0,
                8,
              ),
            ])
          : [],
      [bank, target, round],
    );
  const reveal = (id: string) =>
    setRevealed((current) =>
      current.includes(id) ? current : [...current, id],
    );
  const choose = (tile: VisualTile) => {
    if (chosen !== null) {
      reveal(tile.id);
      playVisualAudio(tile.item.en, tile.set.audioMode === "browser");
      return;
    }
    if (!target) return;
    setChosen(tile.id);
    setRevealed([...new Set([tile.id, target.id])]);
    if (tile.id === target.id) setScore((value) => value + 1);
  };
  const next = () => {
    stopActiveAudio?.();
    setChosen(null);
    setRevealed([]);
    setRound((value) => value + 1);
  };
  const newGame = () => {
    setTargets(makeTargets());
    setRound(0);
    setChosen(null);
    setRevealed([]);
    setScore(0);
    stopActiveAudio?.();
  };
  if (done)
    return (
      <section className="kitchenLab completeKitchen">
        <span>✓</span>
        <h2>
          {score}/{targets.length} immagini riconosciute
        </h2>
        <p>Ottimo lavoro. Puoi ripetere il gioco per allenarti ancora.</p>
        <button type="button" onClick={newGame}>
          Gioca ancora
        </button>
      </section>
    );
  return (
    <section className="kitchenLab">
      <div className="kitchenLabTitle">
        <span>
          <small>
            DOMANDA {round + 1} DI {targets.length}
          </small>
          <h2>Ascolta e scegli</h2>
        </span>
        <b>
          {score}/{round} corrette
        </b>
      </div>
      <p className="kitchenExploreHint">
        Ascolta la parola e tocca l’immagine corretta.
      </p>
      <div className="kitchenPrompt">
        <AudioButton
          key={target!.id}
          text={target!.item.en}
          src={
            target!.set.audioMode === "browser"
              ? undefined
              : `${import.meta.env.BASE_URL}audio/words/${audioSlug(target!.item.en)}.wav`
          }
          label="Ascolta"
        />
        <strong lang="en">{target!.item.en}</strong>
      </div>
      <div className={`utensilGrid ${chosen !== null ? "explore" : ""}`}>
        {mosaic.map((tile, position) => {
          const correct = chosen !== null && tile.id === target!.id,
            wrong = chosen === tile.id && !correct,
            row = Math.floor(tile.itemIndex / 3),
            col = tile.itemIndex % 3,
            showLabel = revealed.includes(tile.id);
          return (
            <button
              type="button"
              key={`${round}-${tile.id}`}
              className={correct ? "correct" : wrong ? "wrong" : ""}
              aria-label={
                chosen === null
                  ? `Scegli immagine ${position + 1}`
                  : `Ascolta ${tile.item.en}`
              }
              title={
                chosen === null
                  ? "Scegli questa immagine"
                  : `Ascolta ${tile.item.en}`
              }
              onClick={() => choose(tile)}
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}${tile.set.image})`,
                backgroundSize: "300% 300%",
                backgroundPosition: `${col * 50}% ${row * 50}%`,
              }}
            >
              {showLabel && (
                <span>
                  <b lang="en">{tile.item.en}</b>
                  <small>{tile.item.it} · ascolta</small>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <div
          className={`kitchenFeedback ${chosen === target!.id ? "good" : "bad"}`}
        >
          <b>
            {chosen === target!.id
              ? "Esatto!"
              : "La risposta corretta è in verde."}
          </b>
          <span>
            <strong lang="en">{target!.item.en}</strong> = {target!.item.it} ·{" "}
            <em lang="en">{target!.item.verb}</em>
          </span>
          <button type="button" onClick={next}>
            {round + 1 < targets.length
              ? "Prossima domanda →"
              : "Vedi il risultato →"}
          </button>
        </div>
      )}
    </section>
  );
}
function KitchenUtensilLab() {
  return <VisualPictureLab sets={kitchenVisualSets} />;
}
type ListeningTurn = {
  speaker?: string;
  text: string;
  words: string[];
  start: number;
};
function listeningTurns(text: string): ListeningTurn[] {
  const marker = /\b([A-Za-z][A-Za-z ]{0,18}):\s*/g,
    matches = [...text.matchAll(marker)];
  if (matches.length < 2)
    return [{ text, words: text.trim().split(/\s+/), start: 0 }];
  let start = 0;
  return matches.map((match, index) => {
    const from = (match.index ?? 0) + match[0].length,
      to = matches[index + 1]?.index ?? text.length,
      part = text.slice(from, to).trim(),
      words = part.split(/\s+/).filter(Boolean),
      turn = { speaker: match[1], text: part, words, start };
    start += words.length;
    return turn;
  });
}
function GuidedListening({ unit, src }: { unit: MobileUnit; src: string }) {
  const [status, setStatus] = useState<
      "idle" | "waiting" | "playing" | "paused"
    >("idle"),
    [rate, setRate] = useState<AudioRate>(getAudioRate),
    [current, setCurrent] = useState(0),
    [duration, setDuration] = useState(0),
    [transcriptOpen, setTranscriptOpen] = useState(
      unit.cefr === "A1" || unit.cefr === "A2",
    );
  const audioRef = useRef<HTMLAudioElement | null>(null),
    delayRef = useRef<number | null>(null),
    wordTimerRef = useRef<number | null>(null),
    cancelledRef = useRef(false),
    pausedRef = useRef(false),
    transcriptRef = useRef<HTMLDivElement | null>(null),
    turns = useMemo(
      () => listeningTurns(unit.listening.transcript),
      [unit.listening.transcript],
    ),
    isDialogue = turns.length > 1,
    words = useMemo(() => turns.flatMap((turn) => turn.words), [turns]),
    active = Math.min(
      words.length - 1,
      Math.max(
        0,
        isDialogue
          ? Math.floor(current)
          : duration
            ? Math.floor((current / duration) * words.length)
            : 0,
      ),
    );
  const clearTimers = () => {
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (wordTimerRef.current !== null) {
      window.clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  };
  const stop = () => {
    cancelledRef.current = true;
    pausedRef.current = false;
    clearTimers();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    setCurrent(0);
    setStatus("idle");
    if (stopActiveAudio === stop) stopActiveAudio = null;
  };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (status !== "playing") return;
    const box = transcriptRef.current,
      word = box?.querySelector<HTMLElement>(`[data-word="${active}"]`);
    if (box && word) {
      const boxRect = box.getBoundingClientRect(),
        wordRect = word.getBoundingClientRect(),
        wordTop = wordRect.top - boxRect.top + box.scrollTop,
        maxScroll = Math.max(0, box.scrollHeight - box.clientHeight),
        target = Math.min(
          maxScroll,
          Math.max(0, wordTop - box.clientHeight * 0.42),
        );
      box.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [active, status]);
  useEffect(() => {
    if (status === "idle")
      transcriptRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [status, unit.id]);
  const playDialogue = () => {
    cancelledRef.current = false;
    const pair = dialogueVoicePair(speechSynthesis.getVoices(), unit.id);
    let turnIndex = 0;
    const nextTurn = () => {
      if (cancelledRef.current) return;
      const turn = turns[turnIndex],
        utterance = new SpeechSynthesisUtterance(turn.text);
      applyDialogueVoice(
        utterance,
        pair,
        dialogueRole(turn.speaker, turnIndex),
      );
      utterance.rate = rate;
      let local = 0;
      utterance.onstart = () => {
        setStatus("playing");
        setCurrent(turn.start);
        wordTimerRef.current = window.setInterval(
          () => {
            if (pausedRef.current || cancelledRef.current) return;
            local = Math.min(turn.words.length - 1, local + 1);
            setCurrent(turn.start + local);
          },
          Math.round(430 / rate),
        );
      };
      utterance.onboundary = (event) => {
        if (event.name !== "word") return;
        local = turn.text
          .slice(0, event.charIndex)
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        setCurrent(turn.start + local);
      };
      utterance.onerror = stop;
      utterance.onend = () => {
        if (wordTimerRef.current !== null)
          window.clearInterval(wordTimerRef.current);
        wordTimerRef.current = null;
        if (cancelledRef.current) return;
        turnIndex++;
        if (turnIndex < turns.length) nextTurn();
        else stop();
      };
      speechSynthesis.speak(utterance);
    };
    nextTurn();
  };
  const begin = () => {
    delayRef.current = null;
    if (isDialogue) {
      playDialogue();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    void audio
      .play()
      .then(() => setStatus("playing"))
      .catch(() => setStatus("idle"));
  };
  const play = () => {
      stopActiveAudio?.();
      cancelledRef.current = false;
      stopActiveAudio = stop;
      setStatus("waiting");
      delayRef.current = window.setTimeout(begin, 1000);
    },
    pause = () => {
      if (delayRef.current !== null) {
        window.clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      if (isDialogue) {
        speechSynthesis.pause();
        pausedRef.current = true;
      } else audioRef.current?.pause();
      setStatus("paused");
    },
    resume = () => {
      stopActiveAudio?.();
      stopActiveAudio = stop;
      if (isDialogue) {
        speechSynthesis.resume();
        pausedRef.current = false;
      } else {
        const audio = audioRef.current;
        if (!audio) return;
        audio.playbackRate = rate;
        void audio.play();
      }
      setStatus("playing");
    },
    primary = () =>
      status === "idle"
        ? play()
        : status === "playing" || status === "waiting"
          ? pause()
          : resume(),
    estimated = isDialogue
      ? Math.max(1, Math.round(words.length / (2.4 * rate)))
      : duration;
  return (
    <div className="player guidedPlayer">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onTimeUpdate={(event) =>
          !isDialogue && setCurrent(event.currentTarget.currentTime)
        }
        onEnded={stop}
      />
      <small className="audioLength">
        ◷ Durata audio ·{" "}
        {estimated
          ? `${Math.floor(estimated / 60)}:${String(Math.round(estimated) % 60).padStart(2, "0")}`
          : "calcolo…"}
      </small>
      <div className="audioControl">
        <div className="audioActions">
          <button type="button" className="audio" onClick={primary}>
            <b>{status === "playing" ? "Ⅱ" : "▶"}</b>
            {status === "waiting"
              ? "Avvio tra 1s…"
              : status === "playing"
                ? "Pausa"
                : status === "paused"
                  ? "Riprendi"
                  : "Riproduci dialogo"}
          </button>
          <button
            type="button"
            className="audioStop"
            disabled={status === "idle"}
            onClick={stop}
          >
            ■ Stop
          </button>
        </div>
        <div className="speed" aria-label="Velocità audio">
          {([0.8, 1, 1.2] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={rate === value}
              className={rate === value ? "active" : ""}
              onClick={() => {
                setRate(value);
                saveAudioRate(value);
                if (audioRef.current) audioRef.current.playbackRate = value;
              }}
            >
              {value.toFixed(value === 1 ? 0 : 1)}×
            </button>
          ))}
        </div>
      </div>
      <details
        className="guidedTranscript"
        open={transcriptOpen}
        onToggle={(event) => setTranscriptOpen(event.currentTarget.open)}
      >
        <summary>
          Testo sincronizzato{" "}
          {unit.cefr === "A1" || unit.cefr === "A2"
            ? "· aperto per aiutarti"
            : "· mostra se ti serve"}
        </summary>
        <div
          ref={transcriptRef}
          lang="en"
          className={isDialogue ? "guidedDialogue" : ""}
        >
          {turns.map((turn, turnIndex) => (
            <p key={`${turn.speaker ?? "text"}-${turnIndex}`}>
              {turn.speaker && <b>{turn.speaker}</b>}
              {turn.words.map((word, index) => {
                const absolute = turn.start + index;
                return (
                  <span
                    data-word={absolute}
                    key={`${word}-${absolute}`}
                    className={
                      status === "playing" && absolute === active
                        ? "active"
                        : ""
                    }
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </details>
    </div>
  );
}
function Question({
  data,
  done,
  rule,
}: {
  data: Choice;
  done: (ok: boolean, data: Choice, givenAnswer: string) => void;
  rule?: string;
}) {
  const [pick, setPick] = useState<number | null>(null),
    correct = pick === data.answer;
  return (
    <div className="question">
      <h3>{data.prompt}</h3>
      <div className="answers">
        {data.options.map((x, i) => (
          <button
            key={x + i}
            disabled={pick !== null}
            className={
              pick === null
                ? ""
                : i === data.answer
                  ? "right"
                  : i === pick
                    ? "wrong"
                    : "dim"
            }
            onClick={() => {
              setPick(i);
              done(i === data.answer, data, x);
            }}
          >
            <b>{String.fromCharCode(65 + i)}</b>
            {x}
          </button>
        ))}
      </div>
      {pick !== null && (
        <div
          role="status"
          aria-live="polite"
          className={`feedback ${correct ? "good" : "bad"}`}
        >
          <strong>
            {correct ? "Esatto! Vediamo perché." : "Rivediamola insieme."}
          </strong>
          <ConceptText text={data.explanationIt} />
          {rule && (
            <aside className="ruleRecall">
              <small>
                {correct ? "PERCHÉ È CORRETTA" : "REGOLA DA RIPASSARE"}
              </small>
              <b>{rule}</b>
              <span>
                {correct
                  ? "La risposta rispetta questa struttura: rileggila per fissarla."
                  : "Rileggi la struttura e prova a costruire un nuovo esempio prima di continuare."}
              </span>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
function makeChoice(
  prompt: string,
  correct: string,
  pool: string[],
  explanationIt: string,
  seed = 0,
): Choice {
  const wrong = [
    ...new Set(pool.filter((value) => value && value !== correct)),
  ].slice(0, 2);
  while (wrong.length < 2)
    wrong.push(wrong.length ? "Un’altra forma" : "Nessuna delle precedenti");
  const answer = Math.abs(seed) % 3,
    options = [...wrong];
  options.splice(answer, 0, correct);
  return { prompt, options, answer, explanationIt };
}
function finalQuizFor(unit: MobileUnit): Choice[] {
  const words = unit.vocabulary,
    examples = unit.grammar.examples;
  return [
    ...unit.quickCheck.slice(0, 2),
    makeChoice(
      `Come si dice «${words[0].it}»?`,
      words[0].en,
      words.map((x) => x.en),
      `La parola corretta è ${words[0].en}.`,
      unit.day,
    ),
    makeChoice(
      `Come si dice «${words[1].it}»?`,
      words[1].en,
      words.map((x) => x.en),
      `La parola corretta è ${words[1].en}.`,
      unit.day + 1,
    ),
    makeChoice(
      `Quale frase significa «${examples[0].it}»?`,
      examples[0].en,
      examples.map((x) => x.en),
      examples[0].noteIt,
      unit.day + 2,
    ),
    unit.listening.questions[0],
  ].slice(0, 6);
}
function listeningQuizFor(unit: MobileUnit): Choice[] {
  const heard = unit.listening.transcript
      .split(/(?<=[.!?])\s+/)
      .filter((x) => x.trim().length > 8),
    other = [...unit.grammar.examples.map((x) => x.en), unit.speaking.target];
  const recognition = heard
    .slice(0, 2)
    .map((sentence, index) =>
      makeChoice(
        "Quale frase hai sentito nel dialogo?",
        sentence,
        [...other, ...heard.filter((x) => x !== sentence)],
        `Nel dialogo viene detto: “${sentence}”`,
        unit.day + index,
      ),
    );
  return [
    ...unit.listening.questions,
    ...recognition,
    ...unit.quickCheck,
  ].slice(0, Math.max(5, Math.min(6, unit.listening.questions.length + 2)));
}
function practiceFor(unit: MobileUnit): MobileUnit["writing"]["cloze"] {
  const generated = unit.vocabulary.map((word) => ({
    prompt: word.example.replace(word.en, "___"),
    answers: [word.en],
    hintIt: `${word.en} significa «${word.it}». Nella frase completa: ${word.example}`,
  }));
  return [...unit.writing.cloze, ...generated].slice(0, 6);
}
function Gauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <section className="gaugeCard">
      <div className="gauge">
        <i />
        <em style={{ transform: `rotate(${-90 + v * 1.8}deg)` }} />
        <b />
      </div>
      <strong>{v}</strong>
      <span>Indice di apprendimento</span>
      <small>
        {v >= 80
          ? "Ottimo ritmo"
          : v >= 55
            ? "Stai crescendo"
            : "Ogni passo conta"}
        . Non è un voto.
      </small>
    </section>
  );
}
function initialMainView(): View {
  if (typeof window === "undefined") return "home";
  const saved = localStorage.getItem("english-coach-view-v1");
  return saved === "path" || saved === "topics" || saved === "progress"
    ? saved
    : "home";
}
export default function Home() {
  const [view, setView] = useState<View>(initialMainView),
    [progress, setProgress] = useState<Progress | null>(null),
    [unit, setUnit] = useState<MobileUnit>(mobileCurriculum[0]),
    [phase, setPhase] = useState<Phase>("grammar"),
    [item, setItem] = useState(0),
    [input, setInput] = useState(""),
    [checked, setChecked] = useState<boolean | null>(null),
    [writing, setWriting] = useState(""),
    [answered, setAnswered] = useState<boolean | null>(null),
    [points, setPoints] = useState({ yes: 0, all: 0 }),
    [spoken, setSpoken] = useState(""),
    [recording, setRecording] = useState(false),
    [recordingSeconds, setRecordingSeconds] = useState(0),
    [bonusMinutes, setBonusMinutes] = useState(0),
    [bonusQuiz, setBonusQuiz] = useState<Choice[]>([]),
    [bonusDone, setBonusDone] = useState(false),
    [sync, setSync] = useState<"saved" | "saving" | "offline">("saved"),
    [recover, setRecover] = useState(""),
    [recoverMsg, setRecoverMsg] = useState(""),
    [resumePrompt, setResumePrompt] = useState<{
      unit: MobileUnit;
      checkpoint: SessionCheckpoint;
    } | null>(null),
    [resetConfirm, setResetConfirm] = useState(false),
    [reading, setReading] = useState<ReadingPassage>(readingPassages[0]),
    [readingStep, setReadingStep] = useState<"text" | "questions" | "result">(
      "text",
    ),
    [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({}),
    [readingQuestionIndex, setReadingQuestionIndex] = useState(0),
    [visualCategory, setVisualCategory] = useState<
      "kitchen" | "jobs" | "actions" | "phrasal"
    >("kitchen"),
    [reviewSpec, setReviewSpec] = useState<{ level: Cefr; end: number } | null>(
      null,
    ),
    [selectedPack, setSelectedPack] = useState<ThemePack | null>(null),
    [smartReviewIndex, setSmartReviewIndex] = useState(0),
    [smartReviewRevealed, setSmartReviewRevealed] = useState(false),
    [recoveryQuiz, setRecoveryQuiz] = useState<RecoveryQuestion[]>([]),
    [recoveryIndex, setRecoveryIndex] = useState(0),
    [recoveryPick, setRecoveryPick] = useState<number | null>(null),
    [recoveryCorrect, setRecoveryCorrect] = useState(0),
    [recoveryFinished, setRecoveryFinished] = useState(false);
  const started = useRef(Date.now());
  const [selectedLevel, setSelectedLevel] = useState<Cefr>("A1"),
    [selectedLessonId, setSelectedLessonId] = useState(mobileCurriculum[0].id),
    [selectedTheme, setSelectedTheme] = useState<ThemeId>("food"),
    [audioAccent, setAudioAccent] = useState<AudioAccent>(getAudioAccent),
    [audioRate, setAudioRate] = useState<AudioRate>(getAudioRate),
    [errorSearch, setErrorSearch] = useState(""),
    [errorKind, setErrorKind] = useState<ReviewKind | "Tutti">("Tutti"),
    [errorLevel, setErrorLevel] = useState<Cefr | "Tutti">("Tutti"),
    [errorStatus, setErrorStatus] = useState<
      SmartReviewItem["status"] | "Tutti"
    >("Tutti"),
    [sessionMinutes, setSessionMinutes] = useState<5 | 15 | 30 | null>(null),
    [welcomeOpen, setWelcomeOpen] = useState(
      () =>
        typeof window !== "undefined" &&
        !localStorage.getItem("english-coach-onboarding-v1") &&
        !localStorage.getItem("english-coach-selection-v1"),
    ),
    [learningGoal, setLearningGoal] = useState("Conversazione quotidiana"),
    [writingNotes, setWritingNotes] = useState<string[] | null>(null),
    [writingSuggestion, setWritingSuggestion] = useState(""),
    [dictation, setDictation] = useState(""),
    [dictationChecked, setDictationChecked] = useState(false);
  const themeResultsRef = useRef<HTMLElement | null>(null);
  const save = async (p: Progress) => {
    setSync("saving");
    localStorage.setItem("english-coach-progress-v2", JSON.stringify(p));
    setSync("offline");
  };

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const id = deviceId();
    let p = fresh(id);
    try {
      const raw = JSON.parse(
        localStorage.getItem("english-coach-progress-v2") || "{}",
      );
      const shiftAfter = (threshold: number, amount: number) => {
        const shifted: Record<string, Result> = {};
        Object.entries(raw.days ?? {}).forEach(([day, result]) => {
          const oldDay = Number(day);
          shifted[String(oldDay > threshold ? oldDay + amount : oldDay)] =
            result as Result;
        });
        raw.days = shifted;
        raw.currentDay =
          Number(raw.currentDay ?? 1) > threshold
            ? Number(raw.currentDay) + amount
            : Number(raw.currentDay ?? 1);
      };
      if ((raw.schemaVersion ?? 1) < 2) {
        shiftAfter(6, 6);
        raw.schemaVersion = 2;
      }
      if ((raw.schemaVersion ?? 1) < 3) {
        shiftAfter(18, 6);
        raw.schemaVersion = 3;
      }
      if ((raw.schemaVersion ?? 1) < 4) {
        shiftAfter(30, 6);
        raw.schemaVersion = 4;
      }
      if ((raw.schemaVersion ?? 1) < 5) {
        raw.reviews = raw.reviews ?? {};
        raw.schemaVersion = 5;
      }
      if ((raw.schemaVersion ?? 1) < 6) {
        raw.themePacks = raw.themePacks ?? {};
        raw.schemaVersion = 6;
      }
      if ((raw.schemaVersion ?? 1) < 7) {
        raw.wordGames = raw.wordGames ?? {};
        raw.schemaVersion = 7;
      }
      if ((raw.schemaVersion ?? 1) < 8) {
        raw.smartReview = raw.smartReview ?? {};
        raw.schemaVersion = 8;
      }
      if ((raw.schemaVersion ?? 1) < 9) {
        raw.weeklyGoal = raw.weeklyGoal ?? 3;
        raw.schemaVersion = 9;
      }
      if ((raw.schemaVersion ?? 1) < 10) {
        raw.smartReview = Object.fromEntries(
          Object.entries(raw.smartReview ?? {}).map(([id, item]) => {
            const review = item as SmartReviewItem;
            return [
              id,
              {
                ...review,
                wrongCount: review.wrongCount ?? 1,
                correctStreak: review.correctStreak ?? review.step ?? 0,
                status:
                  review.status ??
                  (review.mastered
                    ? "Acquisito"
                    : review.step
                      ? "In consolidamento"
                      : "Da ripassare"),
              },
            ];
          }),
        );
        raw.schemaVersion = 10;
      }
      if ((raw.schemaVersion ?? 1) < 11) {
        raw.smartReview = Object.fromEntries(
          Object.entries(raw.smartReview ?? {}).map(([id, item]) => {
            const review = item as SmartReviewItem;
            return [id, { ...review, attempts: review.attempts ?? [] }];
          }),
        );
        raw.schemaVersion = 11;
      }
      p = { ...p, ...raw, deviceId: id };
    } catch {}
    setProgress(p);
    let savedLevel: Cefr | undefined,
      savedChoiceId: string | undefined,
      savedTheme: ThemeId | undefined;
    try {
      const saved = JSON.parse(
          localStorage.getItem("english-coach-selection-v1") || "{}",
        ),
        level = (["A1", "A2", "B1", "B2", "C1"] as const).find(
          (value) => value === saved.level,
        );
      if (
        level &&
        trainingMenu(level).some((choice) => choice.id === saved.lessonId)
      ) {
        savedLevel = level;
        savedChoiceId = saved.lessonId;
      }
      if (themes.some((theme) => theme.id === saved.theme))
        savedTheme = saved.theme;
    } catch {}
    const selected =
      mobileCurriculum.find((x) => x.day === p.currentDay) ??
      mobileCurriculum[0];
    setSelectedLevel(savedLevel ?? selected.cefr);
    setSelectedLessonId(savedChoiceId ?? selected.id);
    if (savedTheme) setSelectedTheme(savedTheme);
    try {
      const checkpoints = Object.values(
          JSON.parse(
            localStorage.getItem("english-coach-checkpoints-v1") || "{}",
          ) as Record<string, SessionCheckpoint>,
        ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
        latest = checkpoints[0],
        savedUnit = latest
          ? mobileCurriculum.find((candidate) => candidate.id === latest.unitId)
          : undefined;
      if (latest && savedUnit) setResumePrompt({ unit: savedUnit, checkpoint: latest });
    } catch {}
    setSync("offline");
  }, []);
  useEffect(() => {
    if (!progress) return;
    localStorage.setItem(
      "english-coach-selection-v1",
      JSON.stringify({
        level: selectedLevel,
        lessonId: selectedLessonId,
        theme: selectedTheme,
      }),
    );
  }, [progress, selectedLevel, selectedLessonId, selectedTheme]);
  useEffect(() => {
    if (
      view === "home" ||
      view === "path" ||
      view === "topics" ||
      view === "progress"
    )
      localStorage.setItem("english-coach-view-v1", view);
  }, [view]);
  useEffect(() => {
    if (view !== "topics" || themeSupportsLevel(selectedTheme, selectedLevel))
      return;
    const first = themes.find((theme) =>
      themeSupportsLevel(theme.id, selectedLevel),
    );
    if (first) setSelectedTheme(first.id);
  }, [view, selectedLevel, selectedTheme]);
  useEffect(() => {
    if (
      view !== "lesson" ||
      phase === "complete" ||
      phase === "bonus"
    )
      return;
    let all: Record<string, SessionCheckpoint> = {};
    try {
      all = JSON.parse(
        localStorage.getItem("english-coach-checkpoints-v1") || "{}",
      );
    } catch {}
    all[unit.id] = {
      unitId: unit.id,
      phase,
      item,
      writing,
      points,
      input,
      dictation,
      sessionMinutes,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify(all));
  }, [view, unit.id, phase, item, writing, points, input, dictation, sessionMinutes]);
  useEffect(() => {
    if (!recording) {
      setRecordingSeconds(0);
      return;
    }
    const timer = window.setInterval(
      () => setRecordingSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [recording]);
  useEffect(() => () => stopActiveAudio?.(), [view, phase, unit.id]);
  const completed = progress ? Object.keys(progress.days).length : 0,
    average = useMemo(
      () =>
        !progress || !completed
          ? 0
          : Math.round(
              Object.values(progress.days).reduce((s, d) => s + d.score, 0) /
                completed,
            ),
      [progress, completed],
    ),
    performance = completed
      ? Math.round(
          average * 0.75 +
            Math.min(completed, mobileCurriculum.length) *
              (25 / mobileCurriculum.length),
        )
      : 0;
  const finalQuiz = useMemo(() => finalQuizFor(unit), [unit]),
    listeningQuiz = useMemo(() => listeningQuizFor(unit), [unit]),
    activeBonus = bonusQuiz.slice(0, bonusMinutes);
  const activeStages: Phase[] =
    sessionMinutes === 5
      ? ["examples", "cloze", "speaking", "quiz"]
      : sessionMinutes === 15
        ? ["grammar", "vocabulary", "cloze", "listening", "speaking", "quiz"]
        : stages;
  const practiceCloze = useMemo(() => practiceFor(unit), [unit]);
  const speechIsError =
      /^(Il riconoscimento|Permesso|Non ho|Ho sentito|Microfono|Il servizio)/.test(
        spoken,
      ),
    speechParts =
      spoken && !speechIsError
        ? pronunciationDiff(unit.speaking.target, spoken)
        : [],
    speechScore = speechParts.length
      ? Math.round(
          (speechParts.filter((x) => x.ok && x.expected).length /
            Math.max(1, speechParts.filter((x) => x.expected).length)) *
            100,
        )
      : 0;
  const dictationParts = dictationChecked
      ? pronunciationDiff(unit.listening.transcript, dictation)
      : [],
    dictationScore = dictationChecked
      ? similarity(unit.listening.transcript, dictation)
      : 0,
    writingParts = writingSuggestion
      ? pronunciationDiff(writingSuggestion, writing)
      : [];
  const playWord = (word: string) => {
    const fallback = () => {
      if (typeof speechSynthesis === "undefined") return;
      const voices = speechSynthesis
          .getVoices()
          .filter((v) => /^en(?:-|$)/i.test(v.lang)),
        voice =
          voices.find((v) => /^en-US/i.test(v.lang)) ??
          voices.find((v) => /^en-GB/i.test(v.lang)) ??
          voices[0];
      if (!voice) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    };
    const audio = new Audio(
      `${import.meta.env.BASE_URL}audio/words/${audioSlug(word)}.wav`,
    );
    audio.onerror = fallback;
    void audio.play().catch(fallback);
  };
  const clear = () => {
    stopActiveAudio?.();
    setItem(0);
    setInput("");
    setChecked(null);
    setAnswered(null);
    setSpoken("");
    setDictation("");
    setDictationChecked(false);
  };
  const beginUnit = (
    u: MobileUnit,
    checkpoint?: SessionCheckpoint,
    target: 5 | 15 | 30 | null = sessionMinutes,
  ) => {
    const firstPhase: Phase = target === 5 ? "examples" : "grammar";
    stopActiveAudio?.();
    setSessionMinutes(target);
    setUnit(u);
    setPhase(checkpoint?.phase ?? firstPhase);
    setItem(checkpoint?.item ?? 0);
    setInput(checkpoint?.input ?? "");
    setChecked(null);
    setAnswered(null);
    setSpoken("");
    setDictation(checkpoint?.dictation ?? "");
    setDictationChecked(false);
    setWriting(checkpoint?.writing ?? progress?.days[u.day]?.writing ?? "");
    setPoints(checkpoint?.points ?? { yes: 0, all: 0 });
    setBonusQuiz([]);
    setBonusMinutes(0);
    started.current = Date.now();
    setResumePrompt(null);
    setView("lesson");
    scrollTo(0, 0);
  };
  const removeCheckpoint = (unitId: string) => {
    let all: Record<string, SessionCheckpoint> = {};
    try {
      all = JSON.parse(
        localStorage.getItem("english-coach-checkpoints-v1") || "{}",
      );
    } catch {}
    delete all[unitId];
    localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify(all));
  };
  const open = (u: MobileUnit, target: 5 | 15 | 30 | null = null) => {
    setSessionMinutes(target);
    let checkpoint: SessionCheckpoint | undefined;
    try {
      checkpoint = JSON.parse(
        localStorage.getItem("english-coach-checkpoints-v1") || "{}",
      )[u.id];
    } catch {}
    if (
      checkpoint &&
      (checkpoint.phase !== "grammar" ||
        checkpoint.item > 0 ||
        checkpoint.points.all > 0 ||
        checkpoint.writing.trim())
    ) {
      setResumePrompt({ unit: u, checkpoint });
      return;
    }
    if (checkpoint) removeCheckpoint(u.id);
    beginUnit(u, undefined, target);
  };
  const chooseLevel = (level: Cefr) => {
    setSelectedLevel(level);
    setSelectedLessonId(mobileCurriculum.find((x) => x.cefr === level)!.id);
  };
  const completeOnboarding = (level?: Cefr) => {
    if (level) chooseLevel(level);
    localStorage.setItem(
      "english-coach-onboarding-v1",
      JSON.stringify({ completedAt: new Date().toISOString(), learningGoal }),
    );
    setWelcomeOpen(false);
    setView("home");
    scrollTo(0, 0);
  };
  const chooseTheme = (id: ThemeId) => {
    setSelectedTheme(id);
    window.setTimeout(
      () =>
        themeResultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      80,
    );
  };
  const nextPhase = () => {
    setPhase(activeStages[activeStages.indexOf(phase) + 1] ?? "complete");
    clear();
    scrollTo(0, 0);
  };
  const previousPhase = () => {
    stopActiveAudio?.();
    if (phase === "bonus") {
      setPhase("complete");
      scrollTo(0, 0);
      return;
    }
    const index = activeStages.indexOf(phase);
    if (index <= 0) {
      setView("home");
      scrollTo(0, 0);
      return;
    }
    setPhase(activeStages[index - 1]);
    clear();
    scrollTo(0, 0);
  };
  const queueReview = (
    kind: ReviewKind,
    prompt: string,
    answer: string,
    explanation: string,
    givenAnswer = "Domanda saltata o risposta non corretta",
  ) => {
    setProgress((current) => {
      if (!current) return current;
      const id = reviewKey(unit.id, kind, prompt),
        previous = current.smartReview?.[id],
        now = new Date().toISOString(),
        entry: SmartReviewItem = {
          id,
          unitId: unit.id,
          unitTitle: unit.title,
          level: unit.cefr,
          kind,
          prompt,
          answer,
          explanation,
          dueAt: dateKey(),
          step: previous?.step ?? 0,
          mastered: false,
          givenAnswer,
          wrongCount: (previous?.wrongCount ?? 0) + 1,
          correctStreak: 0,
          lastAttemptAt: now,
          status: previous ? "Da ripassare" : "Nuovo",
          attempts: [
            ...(previous?.attempts ?? []),
            { at: now, givenAnswer, correct: false },
          ].slice(-30),
        },
        updated = {
          ...current,
          smartReview: { ...(current.smartReview ?? {}), [id]: entry },
        };
      void save(updated);
      return updated;
    });
  };
  const score = (ok: boolean, data: Choice, givenAnswer: string) => {
    if (answered !== null) return;
    setAnswered(ok);
    setPoints((p) => ({ yes: p.yes + (ok ? 1 : 0), all: p.all + 1 }));
    if (!ok)
      queueReview(
        phase === "listening"
          ? "Ascolto"
          : /phrasal/i.test(unit.title)
            ? "Phrasal verbs"
          : phase === "bonus"
            ? "Vocabolario"
            : "Grammatica",
        data.prompt,
        data.options[data.answer],
        data.explanationIt,
        givenAnswer,
      );
  };
  const advance = (n: number) =>
    item + 1 < n
      ? (setItem((i) => i + 1),
        setInput(""),
        setChecked(null),
        setAnswered(null),
        window.scrollTo({ top: 0, behavior: "smooth" }))
      : nextPhase();
  const check = () => {
    const exercise = practiceCloze[item],
      ok = exercise.answers.some(
        (x) => x.trim().toLowerCase() === input.trim().toLowerCase(),
      );
    setChecked(ok);
    setPoints((p) => ({ yes: p.yes + (ok ? 1 : 0), all: p.all + 1 }));
    if (!ok)
      queueReview(
        "Vocabolario",
        exercise.prompt,
        exercise.answers[0],
        exercise.hintIt,
        input || "Campo lasciato vuoto",
      );
  };
  const finish = async () => {
    if (!progress) return;
    const score = points.all ? Math.round((points.yes / points.all) * 100) : 0,
      today = dateKey(),
      y = new Date();
    y.setDate(y.getDate() - 1);
    const streak =
        progress.lastStudyDate === today
          ? progress.streak
          : progress.lastStudyDate === y.toISOString().slice(0, 10)
            ? progress.streak + 1
            : 1,
      minutes = Math.max(1, Math.round((Date.now() - started.current) / 60000)),
      old = progress.activity[today] ?? { minutes: 0, score: 0, completed: 0 };
    const p: Progress = {
      ...progress,
      currentDay: Math.min(
        mobileCurriculum.length,
        Math.max(progress.currentDay, unit.day + 1),
      ),
      streak,
      lastStudyDate: today,
      days: {
        ...progress.days,
        [unit.day]: {
          score,
          attempts: (progress.days[unit.day]?.attempts || 0) + 1,
          minutes,
          writing,
          completedAt: new Date().toISOString(),
        },
      },
      activity: {
        ...progress.activity,
        [today]: {
          minutes: old.minutes + minutes,
          score: old.completed ? Math.round((old.score + score) / 2) : score,
          completed: old.completed + 1,
        },
      },
    };
    removeCheckpoint(unit.id);
    setProgress(p);
    await save(p);
    setPhase("complete");
  };
  const startBonus = (minutes: number) => {
    stopActiveAudio?.();
    let history: Record<string, string[]> = {};
    try {
      history = JSON.parse(
        localStorage.getItem("english-coach-supplementary-seen-v1") || "{}",
      );
    } catch {}
    const bankSize = supplementaryBankFor(unit).length,
      seen = (history[unit.id] ?? []).slice(-bankSize),
      cycle = seen.length >= bankSize ? [] : seen,
      questions = buildSupplementaryQuiz(unit, minutes, cycle);
    history[unit.id] = [
      ...new Set([...cycle, ...questions.map(supplementaryFingerprint)]),
    ].slice(-bankSize);
    localStorage.setItem(
      "english-coach-supplementary-seen-v1",
      JSON.stringify(history),
    );
    setBonusQuiz(questions);
    setBonusMinutes(minutes);
    setBonusDone(false);
    setItem(0);
    setAnswered(null);
    setPhase("bonus");
    scrollTo(0, 0);
  };
  const finishBonus = () => {
    setBonusDone(true);
    setPhase("complete");
    setItem(0);
    setAnswered(null);
    scrollTo(0, 0);
  };
  const skipBonusQuestion = () => {
    const question = activeBonus[item];
    if (question)
      queueReview(
        "Vocabolario",
        question.prompt,
        question.options[question.answer],
        question.explanationIt,
      );
    if (item + 1 < activeBonus.length) {
      setItem((value) => value + 1);
      setAnswered(null);
      scrollTo(0, 0);
    } else finishBonus();
  };
  const skipCurrentQuestion = (total: number, last: () => void) => {
    if (item + 1 < total) {
      setItem((value) => value + 1);
      setInput("");
      setChecked(null);
      setAnswered(null);
      scrollTo(0, 0);
    } else last();
  };
  const skipStage = () => {
    if (phase === "cloze") {
      const exercise = practiceCloze[item];
      queueReview(
        "Vocabolario",
        exercise.prompt,
        exercise.answers[0],
        exercise.hintIt,
      );
      skipCurrentQuestion(practiceCloze.length, nextPhase);
      return;
    }
    if (phase === "listening") {
      const question = listeningQuiz[item];
      queueReview(
        "Ascolto",
        question.prompt,
        question.options[question.answer],
        question.explanationIt,
      );
      skipCurrentQuestion(listeningQuiz.length, nextPhase);
      return;
    }
    if (phase === "quiz") {
      const question = finalQuiz[item];
      queueReview(
        "Grammatica",
        question.prompt,
        question.options[question.answer],
        question.explanationIt,
      );
      skipCurrentQuestion(finalQuiz.length, finish);
      return;
    }
    if (phase === "bonus") {
      skipBonusQuestion();
      return;
    }
    nextPhase();
  };
  const analyzeWriting = () => {
    const t = writing.trim(),
      notes: string[] = [];
    let corrected = t;
    const fix = (pattern: RegExp, replacement: string, note: string) => {
      if (pattern.test(corrected)) {
        corrected = corrected.replace(pattern, replacement);
        notes.push(note);
      }
    };
    if (t && !/^[A-Z]/.test(t)) {
      corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      notes.push("La frase inglese inizia con la maiuscola.");
    }
    if (t && !/[.!?]$/.test(t)) {
      corrected += ".";
      notes.push("Ho aggiunto la punteggiatura finale.");
    }
    fix(
      /\bI am agree\b/gi,
      "I agree",
      "Agree è un verbo: si dice I agree, senza am.",
    );
    fix(/\bpeople is\b/gi, "people are", "People è plurale e richiede are.");
    fix(
      /\bI have (\d+) years(?: old)?\b/gi,
      "I am $1 years old",
      "Per l'età l'inglese usa be: I am ... years old.",
    );
    fix(
      /\binformations\b/gi,
      "information",
      "Information è non numerabile e non prende -s.",
    );
    fix(
      /\bdepend of\b/gi,
      "depend on",
      "La collocazione corretta è depend on.",
    );
    fix(
      /\bmarried with\b/gi,
      "married to",
      "La collocazione corretta è married to.",
    );
    fix(
      /\bsince (\d+) years\b/gi,
      "for $1 years",
      "Usa for con una durata; since introduce il punto iniziale.",
    );
    fix(
      /\ba ([aeiou]\w*)\b/gi,
      "an $1",
      "Davanti a un suono vocalico usa normalmente an.",
    );
    const third =
      /\b(he|she|it)\s+(work|live|speak|need|want|like|start|finish)\b/gi;
    if (third.test(corrected)) {
      corrected = corrected.replace(
        third,
        (_, subject, verb) =>
          `${subject} ${verb}${verb.endsWith("s") ? "" : "s"}`,
      );
      notes.push("Con he, she o it il Present Simple richiede normalmente -s.");
    }
    const past: Record<string, string> = {
      went: "go",
      saw: "see",
      took: "take",
      came: "come",
      had: "have",
      did: "do",
    };
    const didPast = /\bdid\s+(went|saw|took|came|had|did)\b/gi;
    if (didPast.test(corrected)) {
      corrected = corrected.replace(
        didPast,
        (_, verb) => `did ${past[String(verb).toLowerCase()]}`,
      );
      notes.push("Dopo did usa il verbo base, non la forma passata.");
    }
    const target = unit.grammar.formulas[0]?.trim();
    if (target && !notes.length)
      notes.push(
        `Non vedo errori tra quelli controllabili offline. Struttura da confrontare: ${target}`,
      );
    if (corrected !== t)
      queueReview(
        "Scrittura",
        unit.writing.productionPromptIt,
        corrected,
        notes.join(" "),
        t,
      );
    setWritingSuggestion(corrected);
    setWritingNotes(notes);
  };
  const record = async () => {
    const R = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!R) {
      setSpoken(
        "Il riconoscimento vocale non è supportato qui. Apri il link con Chrome o Edge.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setSpoken(
        "Permesso microfono negato. Abilitalo nelle impostazioni del browser.",
      );
      return;
    }
    const r = new R();
    r.lang = audioAccent;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 3;
    let heard = false;
    const timeout = window.setTimeout(() => {
      try {
        r.stop();
      } catch {}
    }, 12000);
    r.onresult = (e) => {
      const candidates: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        for (let j = 0; j < result.length; j++)
          if (result[j]?.transcript) candidates.push(result[j].transcript);
      }
      if (candidates.length) {
        heard = true;
        const best = candidates.sort(
          (a, b) =>
            similarity(unit.speaking.target, b) -
            similarity(unit.speaking.target, a),
        )[0];
        setSpoken(best);
      }
    };
    r.onerror = (e) => {
      window.clearTimeout(timeout);
      heard = true;
      const messages: Record<string, string> = {
        "not-allowed": "Permesso microfono negato.",
        "no-speech":
          "Non ho sentito la voce. Avvicinati al microfono e riprova.",
        "audio-capture": "Microfono non disponibile.",
        network: "Il servizio vocale del browser non è raggiungibile.",
      };
      setSpoken(
        messages[e.error] ??
          "Non ho riconosciuto bene la frase. Riprova più lentamente.",
      );
      setRecording(false);
    };
    r.onnomatch = () => {
      heard = true;
      setSpoken(
        "Ho sentito la voce, ma non ho riconosciuto le parole. Riprova lentamente.",
      );
    };
    r.onspeechend = () => {
      try {
        r.stop();
      } catch {}
    };
    r.onend = () => {
      window.clearTimeout(timeout);
      setRecording(false);
      if (!heard)
        setSpoken(
          "Non ho ricevuto una trascrizione. Riprova con Chrome o Edge e parla dopo il segnale.",
        );
    };
    setSpoken("");
    setRecording(true);
    r.start();
  };
  const reviewId = (level: Cefr, end: number) =>
    `${level.toLowerCase()}-review-${end}-v1`;
  const openReview = (level: Cefr, end: number) => {
    stopActiveAudio?.();
    setReviewSpec({ level, end });
    setView("review");
    scrollTo(0, 0);
  };
  const finishReview = async (score: number) => {
    if (!progress || !reviewSpec) return;
    const id = reviewId(reviewSpec.level, reviewSpec.end),
      previous = progress.reviews?.[id],
      updated: Progress = {
        ...progress,
        reviews: {
          ...(progress.reviews ?? {}),
          [id]: {
            score,
            attempts: (previous?.attempts ?? 0) + 1,
            completedAt: new Date().toISOString(),
          },
        },
      };
    setProgress(updated);
    await save(updated);
  };
  const openReading = (passage: ReadingPassage) => {
    stopActiveAudio?.();
    setReading(passage);
    setReadingAnswers({});
    setReadingQuestionIndex(0);
    setReadingStep("text");
    setView("reading");
    scrollTo(0, 0);
  };
  const openThemePack = (pack: ThemePack) => {
    stopActiveAudio?.();
    setSelectedPack(pack);
    setView("themePack");
    scrollTo(0, 0);
  };
  const finishThemePack = async (score: number) => {
    if (!progress || !selectedPack) return;
    const previous = progress.themePacks?.[selectedPack.id],
      updated: Progress = {
        ...progress,
        themePacks: {
          ...(progress.themePacks ?? {}),
          [selectedPack.id]: {
            score,
            attempts: (previous?.attempts ?? 0) + 1,
            completedAt: new Date().toISOString(),
          },
        },
      };
    setProgress(updated);
    await save(updated);
  };
  const finishWordGame = async (id: string, score: number) => {
    if (!progress) return;
    const previous = progress.wordGames?.[id],
      best = Math.max(previous?.score ?? 0, score),
      updated: Progress = {
        ...progress,
        wordGames: {
          ...(progress.wordGames ?? {}),
          [id]: {
            score: best,
            attempts: (previous?.attempts ?? 0) + 1,
            completedAt: new Date().toISOString(),
          },
        },
      };
    setProgress(updated);
    await save(updated);
  };
  const finishReading = async () => {
    if (!progress) return;
    const correct = reading.questions.reduce(
        (total, question, index) =>
          total + (readingAnswers[index] === question.answer ? 1 : 0),
        0,
      ),
      score = Math.round((correct / reading.questions.length) * 100),
      previous = progress.reading?.[reading.id],
      now = new Date().toISOString(),
      readingReviews = { ...(progress.smartReview ?? {}) };
    reading.questions.forEach((question, index) => {
      const selected = readingAnswers[index];
      if (selected === question.answer) return;
      const id = reviewKey(reading.id, "Lettura", question.prompt),
        old = readingReviews[id],
        givenAnswer =
          selected === -1 || selected === undefined
            ? "Domanda saltata"
            : question.options[selected];
      readingReviews[id] = {
        id,
        unitId: reading.id,
        unitTitle: reading.title,
        level: reading.level,
        kind: "Lettura",
        prompt: question.prompt,
        answer: question.options[question.answer],
        explanation: question.explanationIt,
        dueAt: dateKey(),
        step: 0,
        mastered: false,
        givenAnswer,
        wrongCount: (old?.wrongCount ?? 0) + 1,
        correctStreak: 0,
        lastAttemptAt: now,
        status: old ? "Da ripassare" : "Nuovo",
        attempts: [
          ...(old?.attempts ?? []),
          { at: now, givenAnswer, correct: false },
        ].slice(-30),
      };
    });
    const updated: Progress = {
      ...progress,
      smartReview: readingReviews,
      reading: {
        ...(progress.reading ?? {}),
        [reading.id]: {
          score,
          attempts: (previous?.attempts ?? 0) + 1,
          completedAt: new Date().toISOString(),
        },
      },
    };
    setProgress(updated);
    await save(updated);
    setReadingStep("result");
    scrollTo(0, 0);
  };
  const resetAllProgress = async () => {
    const clean = fresh(deviceId());
    localStorage.removeItem("english-coach-checkpoints-v1");
    localStorage.removeItem("english-coach-selection-v1");
    localStorage.removeItem("english-coach-onboarding-v1");
    setSelectedLevel("A1");
    setSelectedLessonId(mobileCurriculum[0].id);
    setProgress(clean);
    await save(clean);
    setResetConfirm(false);
    setView("home");
    scrollTo(0, 0);
  };
  const recoverProgress = async () => {
    if (!validCode(recover)) {
      setRecoverMsg(
        "Il codice non sembra completo. Copialo nuovamente senza spazi.",
      );
      return;
    }
    try {
      const imported = decodeProgress(recover),
        restored = {
          ...fresh(deviceId()),
          ...imported,
          deviceId: deviceId(),
          schemaVersion: 11,
          smartReview: imported.smartReview ?? {},
          weeklyGoal: imported.weeklyGoal ?? 3,
        };
      setProgress(restored);
      await save(restored);
      setRecover("");
      setRecoverMsg("Backup ripristinato correttamente su questo dispositivo.");
    } catch {
      setRecoverMsg(
        "Non riesco a leggere questo backup. Verifica di aver copiato tutto il codice.",
      );
    }
  };
  if (!progress)
    return (
      <main className="loading">
        <span className="logo">EC</span>
        <p>Preparo il percorso…</p>
      </main>
    );
  const smartReviews = Object.values(progress.smartReview ?? {}),
    dueSmartReviews = smartReviews
      .filter((review) => !review.mastered && review.dueAt <= dateKey())
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    nextSmartReview = smartReviews
      .filter((review) => !review.mastered && review.dueAt > dateKey())
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0],
    activeSmartReview = dueSmartReviews[smartReviewIndex];
  const filteredErrors = smartReviews
    .filter((review) => errorKind === "Tutti" || review.kind === errorKind)
    .filter((review) => errorLevel === "Tutti" || review.level === errorLevel)
    .filter(
      (review) =>
        errorStatus === "Tutti" ||
        (review.status ?? (review.mastered ? "Acquisito" : "Da ripassare")) ===
          errorStatus,
    )
    .filter((review) =>
      `${review.prompt} ${review.answer} ${review.explanation} ${review.unitTitle}`
        .toLowerCase()
        .includes(errorSearch.trim().toLowerCase()),
    )
    .sort((a, b) =>
      (b.lastAttemptAt ?? b.dueAt).localeCompare(a.lastAttemptAt ?? a.dueAt),
    );
  const masteryAreas = (
      ["Grammatica", "Vocabolario", "Ascolto", "Pronuncia"] as ReviewKind[]
    ).map((kind) => {
      const entries = smartReviews.filter((review) => review.kind === kind),
        mastered = entries.filter((review) => review.mastered).length,
        open = entries.length - mastered;
      return {
        kind,
        open,
        mastered,
        percent: entries.length
          ? Math.round((mastered / entries.length) * 100)
          : null,
      };
    }),
    reviewFocus = [...masteryAreas].sort((a, b) => b.open - a.open)[0];
  const lessonForTime = (minutes: number) => {
      const lessons = mobileCurriculum.filter(
          (candidate) =>
            candidate.cefr === selectedLevel && !progress.days[candidate.day],
        ),
        available = lessons
          .filter((candidate) => candidate.minutes <= minutes)
          .sort((a, b) => b.minutes - a.minutes);
      return (
        available[0] ??
        lessons.sort(
          (a, b) =>
            Math.abs(a.minutes - minutes) - Math.abs(b.minutes - minutes),
        )[0] ??
        mobileCurriculum.find((candidate) => candidate.cefr === selectedLevel)!
      );
    },
    adaptiveOptions = ([5, 15, 30] as const).map((minutes) => ({
      minutes,
      lesson: lessonForTime(minutes),
      detail:
        minutes === 5
          ? "Ripasso, frase e pronuncia"
          : minutes === 15
            ? "Regola, pratica, ascolto e voce"
            : "Percorso completo con scrittura",
    }));
  const weekKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().slice(0, 10);
    }),
    weeklyActive = weekKeys.filter((key) => progress.activity[key]).length,
    setWeeklyGoal = (goal: number) => {
      const updated = { ...progress, weeklyGoal: goal };
      setProgress(updated);
      void save(updated);
    };
  const startRecovery = () => {
    const open = shuffled(
        smartReviews.filter((review) => !review.mastered),
      ).slice(0, 10),
      pool = [
        ...new Set([
          ...smartReviews.map((review) => review.answer),
          ...mobileCurriculum.flatMap((candidate) =>
            candidate.vocabulary.map((word) => word.en),
          ),
          ...mobileCurriculum.flatMap((candidate) =>
            candidate.grammar.examples.map((example) => example.en),
          ),
        ]),
      ],
      quiz = open.map((review) => {
        const alternatives = shuffled(
            pool.filter((answer) => answer !== review.answer),
          ).slice(0, 2),
          options = shuffled([review.answer, ...alternatives]),
          answer = options.indexOf(review.answer);
        return { review, options, answer };
      });
    setRecoveryQuiz(quiz);
    setRecoveryIndex(0);
    setRecoveryPick(null);
    setRecoveryCorrect(0);
    setRecoveryFinished(false);
    setView("recoveryDrill");
    scrollTo(0, 0);
  };
  const answerRecovery = (choice: number) => {
    if (recoveryPick !== null) return;
    const question = recoveryQuiz[recoveryIndex],
      remembered = choice === question.answer;
    setRecoveryPick(choice);
    if (remembered) setRecoveryCorrect((value) => value + 1);
    setProgress((current) => {
      if (!current) return current;
      const previous =
          current.smartReview?.[question.review.id] ?? question.review,
        delays = [1, 3, 7, 14],
        step = remembered ? previous.step + 1 : 0,
        mastered = remembered && previous.step >= delays.length,
        item = {
          ...previous,
          step,
          mastered,
          dueAt: mastered
            ? futureDate(3650)
            : futureDate(remembered ? delays[previous.step] : 1),
        },
        updated = {
          ...current,
          smartReview: {
            ...(current.smartReview ?? {}),
            [question.review.id]: item,
          },
        };
      void save(updated);
      return updated;
    });
  };
  const nextRecovery = () => {
    if (recoveryIndex + 1 < recoveryQuiz.length) {
      setRecoveryIndex((index) => index + 1);
      setRecoveryPick(null);
      scrollTo(0, 0);
    } else setRecoveryFinished(true);
  };
  const openSmartReview = () => {
    setSmartReviewIndex(0);
    setSmartReviewRevealed(false);
    setView("smartReview");
    scrollTo(0, 0);
  };
  const answerSmartReview = async (remembered: boolean) => {
    if (!activeSmartReview) return;
    const delays = [1, 3, 7, 14, 30],
      nextStep = remembered ? activeSmartReview.step + 1 : 0,
      nextStreak = remembered
        ? (activeSmartReview.correctStreak ?? 0) + 1
        : 0,
      mastered = remembered && nextStreak > delays.length,
      now = new Date().toISOString(),
      updatedItem: SmartReviewItem = {
        ...activeSmartReview,
        step: nextStep,
        mastered,
        correctStreak: nextStreak,
        wrongCount: (activeSmartReview.wrongCount ?? 0) + (remembered ? 0 : 1),
        lastAttemptAt: now,
        attempts: [
          ...(activeSmartReview.attempts ?? []),
          {
            at: now,
            givenAnswer: remembered ? "Ricordato" : "Da rivedere",
            correct: remembered,
          },
        ].slice(-30),
        status: mastered
          ? "Acquisito"
          : remembered
            ? "In consolidamento"
            : "Da ripassare",
        dueAt: mastered
          ? futureDate(3650)
          : futureDate(
              remembered
                ? delays[Math.min(activeSmartReview.step, delays.length - 1)]
                : 1,
            ),
      },
      updated: Progress = {
        ...progress,
        smartReview: {
          ...(progress.smartReview ?? {}),
          [activeSmartReview.id]: updatedItem,
        },
      },
      remaining = dueSmartReviews.filter(
        (review) => review.id !== activeSmartReview.id,
      );
    setProgress(updated);
    await save(updated);
    setSmartReviewRevealed(false);
    setSmartReviewIndex(0);
    if (!remaining.length) {
      setView("home");
      scrollTo(0, 0);
    }
  };
  const openErrors = () => {
    setErrorSearch("");
    setErrorKind("Tutti");
    setErrorLevel("Tutti");
    setErrorStatus("Tutti");
    setView("errors");
    scrollTo(0, 0);
  };
  const retryError = async (review: SmartReviewItem) => {
    const updated: Progress = {
      ...progress,
      smartReview: {
        ...(progress.smartReview ?? {}),
        [review.id]: {
          ...review,
          dueAt: dateKey(),
          mastered: false,
          status: "Da ripassare",
        },
      },
    };
    setProgress(updated);
    await save(updated);
    const due = Object.values(updated.smartReview ?? {})
      .filter((item) => !item.mastered && item.dueAt <= dateKey())
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    setSmartReviewIndex(
      Math.max(
        0,
        due.findIndex((item) => item.id === review.id),
      ),
    );
    setSmartReviewRevealed(false);
    setView("smartReview");
    scrollTo(0, 0);
  };
  const understandError = async (review: SmartReviewItem) => {
    const updated: Progress = {
        ...progress,
        smartReview: {
          ...(progress.smartReview ?? {}),
          [review.id]: {
            ...review,
            mastered: false,
            status: "In consolidamento",
            dueAt: futureDate(1),
            lastAttemptAt: new Date().toISOString(),
          },
        },
      };
    setProgress(updated);
    await save(updated);
  };
  const current =
    mobileCurriculum.find((x) => x.day === progress.currentDay) ??
    mobileCurriculum.at(-1)!;
  const selectedChoice =
      trainingMenu(selectedLevel).find(
        (choice) => choice.id === selectedLessonId,
      ) ?? trainingMenu(selectedLevel)[0],
    selectedStarter =
      selectedChoice.kind === "lesson" ? selectedChoice.unit : current;
  const readingCorrect = reading.questions.reduce(
      (total, question, index) =>
        total + (readingAnswers[index] === question.answer ? 1 : 0),
      0,
    ),
    readingPercent = Math.round(
      (readingCorrect / reading.questions.length) * 100,
    );
  return (
    <main className="app">
      <header>
        <button className="brand" onClick={() => setView("home")}>
          <span className="logo">EC</span>
          <span>
            <strong>English Coach</strong>
            <small>Versione {APP_VERSION} · Un passo al giorno</small>
          </span>
        </button>
        <span className={`sync ${sync}`}>
          {sync === "saving" ? "Salvataggio…" : "Salvato qui"}
        </span>
      </header>
      {welcomeOpen && (
        <div className="confirmBackdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <section className="confirmSheet welcomeSheet">
            <span className="eyebrow">Benvenuto in English Coach</span>
            <h2 id="welcome-title">Da dove vuoi partire?</h2>
            <p>Scegli il tuo obiettivo. Potrai modificarlo senza perdere i progressi.</p>
            <label className="welcomeGoal">
              Obiettivo principale
              <select value={learningGoal} onChange={(event) => setLearningGoal(event.target.value)}>
                <option>Conversazione quotidiana</option>
                <option>Viaggi e situazioni reali</option>
                <option>Inglese per il lavoro</option>
                <option>Grammatica e certificazioni</option>
              </select>
            </label>
            <div className="confirmActions">
              <button className="primary" onClick={() => { setWelcomeOpen(false); setView("placement"); }}>
                Fai il test iniziale
              </button>
              <button onClick={() => completeOnboarding()}>
                Conosco già il mio livello
              </button>
            </div>
          </section>
        </div>
      )}
      {resumePrompt && (
        <div
          className="confirmBackdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-title"
        >
          <section className="confirmSheet">
            <span className="eyebrow">Sessione già iniziata</span>
            <h2 id="resume-title">Vuoi continuare?</h2>
            <p>
              <strong>{resumePrompt.unit.title}</strong>
              <br />
              Eri arrivato a <b>{labels[resumePrompt.checkpoint.phase]}</b>,
              esercizio {resumePrompt.checkpoint.item + 1}.
            </p>
            <div className="confirmActions">
              <button
                className="primary"
                onClick={() => {
                  setSessionMinutes(resumePrompt.checkpoint.sessionMinutes ?? null);
                  beginUnit(
                    resumePrompt.unit,
                    resumePrompt.checkpoint,
                    resumePrompt.checkpoint.sessionMinutes ?? null,
                  );
                }}
              >
                Riprendi dal punto interrotto
              </button>
              <button
                onClick={() => {
                  removeCheckpoint(resumePrompt.unit.id);
                  beginUnit(resumePrompt.unit);
                }}
              >
                Ricomincia da zero
              </button>
              <button className="quiet" onClick={() => setResumePrompt(null)}>
                Annulla
              </button>
            </div>
          </section>
        </div>
      )}
      {resetConfirm && (
        <div
          className="confirmBackdrop"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reset-title"
        >
          <section className="confirmSheet dangerSheet">
            <span className="eyebrow">Azione irreversibile</span>
            <h2 id="reset-title">Cancellare tutti i progressi?</h2>
            <p>
              Verranno eliminati risultati, sessioni interrotte, serie e
              attività salvate su questo dispositivo.
            </p>
            <div className="confirmActions">
              <button className="danger" onClick={resetAllProgress}>
                Sì, cancella tutto
              </button>
              <button
                className="primary"
                onClick={() => setResetConfirm(false)}
              >
                No, conserva i dati
              </button>
            </div>
          </section>
        </div>
      )}
      {view === "home" && (
        <details className="homeChoice adaptiveChoice">
          <summary>
            <span>Allenamento su misura</span>
            <b>{selectedLevel}</b>
          </summary>
          <section className="adaptiveHome">
            <details className="compactLevelPicker">
              <summary>
                Livello <b>{selectedLevel}</b>
                <span>Cambia</span>
              </summary>
              <div>
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={selectedLevel === level ? "active" : ""}
                    onClick={(event) => {
                      chooseLevel(level);
                      event.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </details>
            <h3 className="adaptiveTimeTitle">Quanto tempo hai oggi?</h3>
            {dueSmartReviews.length > 0 && (
              <button
                type="button"
                className="adaptiveReview"
                onClick={openSmartReview}
              >
                <span>
                  <strong>10 min · Ripasso mirato</strong>
                  <small>
                    {dueSmartReviews.length}{" "}
                    {dueSmartReviews.length === 1
                      ? "punto da rinforzare"
                      : "punti da rinforzare"}
                  </small>
                </span>
                <b>→</b>
              </button>
            )}
            <div className="adaptiveTimes">
              {adaptiveOptions.map((option) => (
                <button
                  type="button"
                  key={option.minutes}
                  onClick={() => open(option.lesson, option.minutes)}
                >
                  <b>
                    {option.minutes}
                    <small>min</small>
                  </b>
                  <span>
                    <strong>{option.lesson.title}</strong>
                    <small>{option.detail}</small>
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="fullSessionChoice"
                onClick={() => open(lessonForTime(40))}
              >
                <b>∞</b>
                <span>
                  <strong>Sessione completa</strong>
                  <small>Tutte le attività · {lessonForTime(40).minutes} min</small>
                </span>
              </button>
            </div>
          </section>
        </details>
      )}
      {view === "home" && (
        <button type="button" className="placementEntry" onClick={() => setView("placement")}>
          <span><small>NON SAI DA DOVE PARTIRE?</small><strong>Valuta o aggiorna il tuo livello</strong></span>
          <b>15 domande →</b>
        </button>
      )}
      {view === "home" &&
        smartReviews.some((review) => !review.mastered) &&
        dueSmartReviews.length === 0 && (
          <section
            className={`smartReviewHome ${dueSmartReviews.length ? "due" : ""}`}
          >
            <div>
              <span className="eyebrow">Ripasso intelligente</span>
              <h2>
                {dueSmartReviews.length
                  ? "Da ripassare oggi"
                  : smartReviews.some((review) => !review.mastered)
                    ? "Ripasso programmato"
                    : "Il tuo ripasso personale"}
              </h2>
              <p>
                {dueSmartReviews.length
                  ? dueSmartReviews.length === 1
                    ? "1 punto è pronto per essere rinforzato."
                    : `${dueSmartReviews.length} punti sono pronti per essere rinforzati.`
                  : nextSmartReview
                    ? `Prossimo ripasso il ${new Date(`${nextSmartReview.dueAt}T12:00:00`).toLocaleDateString("it-IT", { day: "numeric", month: "long" })}.`
                    : "Gli esercizi da rinforzare compariranno qui automaticamente."}
              </p>
            </div>
            {dueSmartReviews.length > 0 && (
              <button type="button" onClick={openSmartReview}>
                Inizia il ripasso <b>→</b>
              </button>
            )}
          </section>
        )}
      {view === "home" && (
        <div className="screen">
          <details className="homeChoice freeChoice" open>
            <summary>
              <span>Percorso libero</span>
              <b>{selectedLevel}</b>
            </summary>
            <section className="hero compactHero">
              <div>
                <span className="eyebrow">Percorso libero</span>
                <h1>Da dove vuoi iniziare?</h1>
                <p>
                  Scegli un livello, una lezione o il riepilogo collocato nel
                  punto giusto del percorso.
                </p>
              </div>
              <aside>
                <b>
                  {completed}/{mobileCurriculum.length}
                </b>
                <small>completati</small>
              </aside>
            </section>
            <section
              className="trainingChooser"
              aria-label="Scegli il tuo allenamento"
            >
              <div className="choiceStep">
                <b>1</b>
                <span>
                  <strong>Scegli il livello</strong>
                  <small>Puoi cambiarlo in qualsiasi momento</small>
                </span>
              </div>
              <div className="levelButtons">
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={selectedLevel === level ? "active" : ""}
                    onClick={() => chooseLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="choiceStep">
                <b>2</b>
                <span>
                  <strong>Scegli la sessione</strong>
                  <small>
                    I riepiloghi compaiono subito dopo le sessioni 4, 8 e 12
                  </small>
                </span>
              </div>
              <select
                aria-label="Numero della sessione"
                value={selectedChoice.id}
                onChange={(e) => setSelectedLessonId(e.target.value)}
              >
                {trainingMenu(selectedLevel).map((choice) =>
                  choice.kind === "lesson" ? (
                    <option key={choice.id} value={choice.id}>
                      Sessione {choice.position} · {choice.unit.minutes} min
                    </option>
                  ) : (
                    <option key={choice.id} value={choice.id}>
                      {choice.final
                        ? `Prova finale ${selectedLevel}`
                        : `Riepilogo sessioni ${choice.end - 3}–${choice.end}`}{" "}
                      · {choice.minutes} min
                    </option>
                  ),
                )}
              </select>
              {selectedChoice.kind === "lesson" ? (
                <article className="selectedLesson">
                  <div>
                    <span>
                      {selectedStarter.cefr} · SESSIONE{" "}
                      {selectedChoice.position}
                    </span>
                    <b>{selectedStarter.minutes} min</b>
                  </div>
                  <h2>{selectedStarter.title}</h2>
                  <p>{selectedStarter.grammar.explanationIt[0]}</p>
                  <div className="exerciseMix">
                    <span>
                      <b>
                        {practiceFor(selectedStarter).length +
                          listeningQuizFor(selectedStarter).length +
                          finalQuizFor(selectedStarter).length}
                      </b>{" "}
                      verifiche
                    </span>
                    <span>✎ scrittura</span>
                    <span>◉ pronuncia</span>
                  </div>
                </article>
              ) : (
                <article className="selectedLesson selectedReview">
                  <div>
                    <span>
                      {selectedChoice.level} ·{" "}
                      {selectedChoice.final ? "PROVA FINALE" : "RIEPILOGO"}
                    </span>
                    <b>{selectedChoice.minutes} min</b>
                  </div>
                  <h2>
                    {selectedChoice.final
                      ? `Prova finale ${selectedChoice.level}`
                      : `Riepilogo sessioni ${selectedChoice.end - 3}–${selectedChoice.end}`}
                  </h2>
                  <p>
                    {selectedChoice.final
                      ? "30 esercizi casuali da tutte le 12 sessioni. Ogni tentativo propone una combinazione diversa."
                      : "20 esercizi casuali sulle quattro sessioni appena concluse, senza nuova teoria."}
                  </p>
                  <div className="exerciseMix">
                    <span>
                      <b>{selectedChoice.final ? 30 : 20}</b> verifiche
                    </span>
                    <span>↻ ordine casuale</span>
                    <span>
                      {progress.reviews?.[
                        reviewId(selectedChoice.level, selectedChoice.end)
                      ]
                        ? "✓ già svolto"
                        : "NEW da integrare"}
                    </span>
                  </div>
                </article>
              )}
              <button
                className="start chooserStart"
                onClick={() =>
                  selectedChoice.kind === "lesson"
                    ? open(selectedChoice.unit)
                    : openReview(selectedChoice.level, selectedChoice.end)
                }
              >
                <span>
                  <strong>
                    {selectedChoice.kind === "lesson"
                      ? "Inizia questa sessione"
                      : selectedChoice.final
                        ? "Inizia la prova finale"
                        : "Inizia il riepilogo"}
                  </strong>
                  <small>
                    {selectedChoice.kind === "lesson"
                      ? selectedChoice.unit.title
                      : `Dopo la sessione ${selectedChoice.end}`}
                  </small>
                </span>
                <b>→</b>
              </button>
            </section>
          </details>
          <div className="stats">
            <article>
              <span>🔥</span>
              <b>{progress.streak}</b>
              <small>giorni di ritmo</small>
            </article>
            <article>
              <span>◎</span>
              <b>{average ? `${average}%` : "—"}</b>
              <small>precisione media</small>
            </article>
            <article>
              <span>✓</span>
              <b>{completed}</b>
              <small>unità concluse</small>
            </article>
          </div>
        </div>
      )}
      {view === "path" && (
        <div className="screen">
          <div className="pageTitle">
            <span className="eyebrow">Da A1 ai livelli avanzati</span>
            <h1>Il tuo percorso</h1>
            <p>
              60 lezioni e 15 revisioni collocate nella sequenza corretta. Tutto
              rimane accessibile liberamente.
            </p>
          </div>
          <details className="compactLevelPicker">
            <summary>
              Livello <b>{selectedLevel}</b>
              <span>Cambia</span>
            </summary>
            <div>
              {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  className={selectedLevel === level ? "active" : ""}
                  onClick={(event) => {
                    chooseLevel(level);
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open");
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </details>
          {([selectedLevel] as Cefr[]).map((level) => {
            const choices = readingPassages.filter(
                (item) => item.level === level,
              ),
              passage =
                choices.find((item) => !progress.reading?.[item.id]) ??
                choices[new Date().getDate() % Math.max(1, choices.length)],
              readingSaved = passage
                ? progress.reading?.[passage.id]
                : undefined;
            return (
              <section className="level" key={level}>
                <div className="levelTitle">
                  <b>{level}</b>
                  <span>
                    <h2>
                      {level === "A1"
                        ? "Fondamenta"
                        : level === "A2"
                          ? "Autonomia"
                          : level === "B1"
                            ? "Situazioni reali"
                            : level === "B2"
                              ? "Padronanza"
                              : "Eccellenza"}
                    </h2>
                    <p>{curriculumIndex.levels[level].goalIt}</p>
                  </span>
                </div>
                <div className="units pathSequence">
                  {trainingMenu(level).map((choice) => {
                    if (choice.kind === "lesson") {
                      const done = progress.days[choice.unit.day];
                      return (
                        <button
                          key={choice.id}
                          className={
                            done
                              ? "done"
                              : choice.unit.day === progress.currentDay
                                ? "current"
                                : ""
                          }
                          onClick={() => open(choice.unit)}
                        >
                          <b>{done ? "✓" : choice.position}</b>
                          <span>
                            <strong>{choice.unit.title}</strong>
                            <small>
                              Sessione {choice.position} · {choice.unit.minutes}{" "}
                              min{done ? ` · ${done.score}%` : ""}
                            </small>
                          </span>
                          <i>›</i>
                        </button>
                      );
                    }
                    const id = reviewId(level, choice.end),
                      saved = progress.reviews?.[id];
                    return (
                      <button
                        type="button"
                        key={choice.id}
                        className={`pathReview ${saved ? "done" : "new"}`}
                        onClick={() => openReview(level, choice.end)}
                      >
                        <b>{saved ? "✓" : "NEW"}</b>
                        <span>
                          <strong>
                            {choice.final
                              ? `Prova finale ${level}`
                              : `Riepilogo sessioni ${choice.end - 3}–${choice.end}`}
                          </strong>
                          <small>
                            {choice.final
                              ? "30 esercizi casuali da tutte le 12 sessioni"
                              : "20 esercizi casuali sulle quattro sessioni precedenti"}
                            {saved
                              ? ` · ultimo ${saved.score}%`
                              : " · nuova attività"}
                          </small>
                        </span>
                        <i>›</i>
                      </button>
                    );
                  })}
                </div>
                {passage && (
                  <div className="reviewRail readingOnly">
                    <div className="reviewRailTitle">
                      <span>
                        <b>Comprensione scritta del livello</b>
                        <small>
                          Viene proposto prima un testo che non hai ancora
                          svolto.
                        </small>
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`reviewCard readingUpdate ${readingSaved ? "done" : "new"}`}
                      onClick={() => openReading(passage)}
                    >
                      <b>{readingSaved ? "✓" : "NEW"}</b>
                      <span>
                        <strong>{passage.title}</strong>
                        <small>
                          {passage.minutes} min · 6 domande
                          {readingSaved
                            ? ` · ultimo ${readingSaved.score}%`
                            : " · nuova attività da integrare"}
                        </small>
                      </span>
                      <i>›</i>
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      {view === "topics" && (
        <div className="screen">
          <div className="pageTitle compactTopicTitle">
            <span className="eyebrow">Allenamenti mirati</span>
            <h1>Temi</h1>
            <p>Attività adatte al livello che hai scelto.</p>
          </div>
          <details className="compactLevelPicker">
            <summary>
              Livello <b>{selectedLevel}</b>
              <span>Cambia</span>
            </summary>
            <div>
              {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  className={selectedLevel === level ? "active" : ""}
                  onClick={(event) => {
                    chooseLevel(level);
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open");
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </details>
          <div className="themeGrid">
            {themes
              .filter((theme) => themeSupportsLevel(theme.id, selectedLevel))
              .map((theme) => (
                <button
                  key={theme.id}
                  className={selectedTheme === theme.id ? "active" : ""}
                  onClick={() => chooseTheme(theme.id)}
                >
                  <b>{theme.icon}</b>
                  <span>
                    <strong>{theme.title}</strong>
                    <small>{theme.description}</small>
                  </span>
                </button>
              ))}
          </div>
          {selectedTheme === "social" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="Social English"
                intro="Dal primo profilo al linguaggio degli algoritmi: spiegazioni, ascolto, scenario realistico e 10 quiz variabili."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "social" && pack.level === selectedLevel,
                )}
                currentVersion={APP_VERSION}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
            </div>
          ) : selectedTheme === "ira" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="IRA · Istituto Ricerche Applicate"
                intro="Inglese professionale verificato sul contesto aziendale: produzione conto terzi, cosmetica, medical device, packaging e ricerca e sviluppo."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "ira" && pack.level === selectedLevel,
                )}
                currentVersion={APP_VERSION}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
            </div>
          ) : selectedTheme === "language" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="Verbi e false friends"
                intro="Un percorso progressivo da A1 a C1: scegli il tempo corretto, distingui Past Simple e participio e neutralizza i falsi amici più frequenti."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "language" &&
                    pack.level === selectedLevel,
                )}
                currentVersion={APP_VERSION}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
            </div>
          ) : selectedTheme === "accents" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="English around the world · accenti autentici"
                intro="Voci reali da Australia, Scozia, Galles, Stati Uniti e India. Ogni campione rappresenta una persona e una zona precisa, mai un accento inventato."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "accents" && pack.level === selectedLevel,
                )}
                currentVersion={APP_VERSION}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
            </div>
          ) : selectedTheme === "food" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="Ristorante: dalla caffetteria alla recensione"
                intro="Quattro situazioni progressive per ordinare, chiedere modifiche, gestire allergie e scrivere recensioni professionali."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "dining" && pack.level === selectedLevel,
                )}
                currentVersion={APP_VERSION}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
              <section className="themeResults linkedLessons">
                <div className="themeHeading">
                  <span>
                    <small>LEZIONI COLLEGATE</small>
                    <h2>Cucina nel percorso principale</h2>
                  </span>
                  <b>
                    {
                      unitsForTheme("food").filter(
                        (unit) => unit.cefr === selectedLevel,
                      ).length
                    }{" "}
                    sessioni
                  </b>
                </div>
                <div className="units">
                  {unitsForTheme("food")
                    .filter((unit) => unit.cefr === selectedLevel)
                    .map((u) => {
                      const done = progress.days[u.day];
                      return (
                        <button
                          key={u.id}
                          className={done ? "done" : ""}
                          onClick={() => open(u)}
                        >
                          <b>{done ? "✓" : u.cefr}</b>
                          <span>
                            <strong>{u.title}</strong>
                            <small>
                              {u.cefr} · {u.minutes} min
                              {done ? ` · ${done.score}%` : ""}
                            </small>
                          </span>
                          <i>›</i>
                        </button>
                      );
                    })}
                </div>
              </section>
            </div>
          ) : selectedTheme === "video" ? (
            <section
              className="videoHub"
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <div className="videoMethod">
                <span className="eyebrow">Metodo in 3 passaggi</span>
                <ol>
                  <li>
                    <b>1</b> Guarda senza leggere il transcript.
                  </li>
                  <li>
                    <b>2</b> Riguarda con il transcript aperto.
                  </li>
                  <li>
                    <b>3</b> Completa gli esercizi e ripeti le frasi.
                  </li>
                </ol>
                <small>
                  Fonte didattica ufficiale: British Council LearnEnglish.
                </small>
              </div>
              <div className="videoCards">
                {videoResources
                  .filter((video) => video.level.includes(selectedLevel))
                  .map((video) => (
                    <a
                      key={video.url}
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        <b>{video.level}</b>
                        <small>15–30 min</small>
                      </span>
                      <strong>{video.title}</strong>
                      <p>{video.topic}</p>
                      <em>Video · transcript · esercizi ↗</em>
                    </a>
                  ))}
              </div>
            </section>
          ) : selectedTheme === "visual" ? (
            <section
              className="visualQuizHub"
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <div className="themeHeading">
                <span>
                  <small>QUIZ VISIVO</small>
                  <h2>Scegli un argomento</h2>
                </span>
              </div>
              <div className="visualCategories">
                <button
                  type="button"
                  className={visualCategory === "kitchen" ? "active" : ""}
                  onClick={() => setVisualCategory("kitchen")}
                >
                  <b>🍳</b>
                  <span>
                    Cucina<small>utensili e verbi</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={visualCategory === "jobs" ? "active" : ""}
                  onClick={() => setVisualCategory("jobs")}
                >
                  <b>💼</b>
                  <span>
                    Lavori<small>professioni</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={visualCategory === "actions" ? "active" : ""}
                  onClick={() => setVisualCategory("actions")}
                >
                  <b>↕</b>
                  <span>
                    Azioni<small>sit down, stand up…</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={visualCategory === "phrasal" ? "active" : ""}
                  onClick={() => setVisualCategory("phrasal")}
                >
                  <b>→</b>
                  <span>
                    Phrasal verbs<small>take off, get on…</small>
                  </span>
                </button>
              </div>
              <VisualPictureLab
                key={visualCategory}
                sets={
                  visualCategory === "kitchen"
                    ? kitchenVisualSets
                    : visualCategory === "jobs"
                      ? jobVisualSets
                      : visualCategory === "actions"
                        ? actionVisualSets
                        : phrasalVisualSets
                }
              />
            </section>
          ) : selectedTheme === "games" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <WordGamesHub
                key={selectedLevel}
                level={selectedLevel}
                saved={progress.wordGames ?? {}}
                onComplete={finishWordGame}
              />
            </div>
          ) : selectedTheme === "skills" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <SkillsLab
                key={selectedLevel}
                level={selectedLevel}
                onComplete={finishWordGame}
              />
            </div>
          ) : selectedTheme === "reading" ? (
            <section
              className="readingHub"
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <div className="themeHeading">
                <span>
                  <small>COMPRENSIONE SCRITTA</small>
                  <h2>Reading Lab</h2>
                </span>
                <b>2 testi · 6 domande</b>
              </div>
              <p className="readingHubIntro">
                Due testi per ogni livello, con argomenti diversi. Leggi e
                verifica comprensione generale, dettagli e inferenze.
              </p>
              <div className="readingCards">
                {readingPassages
                  .filter((passage) => passage.level === selectedLevel)
                  .map((passage) => {
                    const saved = progress.reading?.[passage.id];
                    return (
                      <button
                        type="button"
                        key={passage.id}
                        className={saved ? "done" : ""}
                        onClick={() => openReading(passage)}
                      >
                        <b>{passage.level}</b>
                        <span>
                          <strong>{passage.title}</strong>
                          <small>{passage.topic}</small>
                          <em>
                            {passage.minutes} min · 6 domande
                            {saved ? ` · ultimo ${saved.score}%` : ""}
                          </em>
                        </span>
                        <i>›</i>
                      </button>
                    );
                  })}
              </div>
            </section>
          ) : (
            <section
              className="themeResults"
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <div className="themeHeading">
                <span>
                  <small>PERCORSO TEMATICO</small>
                  <h2>{themes.find((x) => x.id === selectedTheme)!.title}</h2>
                </span>
                <b>
                  {
                    unitsForTheme(selectedTheme).filter(
                      (unit) => unit.cefr === selectedLevel,
                    ).length
                  }{" "}
                  sessioni
                </b>
              </div>
              <div className="units">
                {unitsForTheme(selectedTheme)
                  .filter((unit) => unit.cefr === selectedLevel)
                  .map((u) => {
                    const done = progress.days[u.day];
                    return (
                      <button
                        key={u.id}
                        className={done ? "done" : ""}
                        onClick={() => open(u)}
                      >
                        <b>{done ? "✓" : u.cefr}</b>
                        <span>
                          <strong>{u.title}</strong>
                          <small>
                            {u.cefr} · {u.minutes} min
                            {done ? ` · ${done.score}%` : ""}
                          </small>
                        </span>
                        <i>›</i>
                      </button>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      )}{" "}
      {view === "progress" && (
        <div className="screen">
          <div className="pageTitle">
            <span className="eyebrow">La tua crescita</span>
            <h1>Progressi</h1>
            <p>Uno sguardo sereno alla costanza, non una classifica.</p>
          </div>
          <Gauge value={performance} />
          <div className="metrics">
            <article>
              <span>Media</span>
              <b>{average ? `${average}%` : "—"}</b>
              <small>attività completate</small>
            </article>
            <article>
              <span>Ritmo</span>
              <b>{progress.streak} gg</b>
              <small>continuità attuale</small>
            </article>
            <article>
              <span>Letture</span>
              <b>{Object.keys(progress.reading ?? {}).length}</b>
              <small>testi completati</small>
            </article>
          </div>
          <section className="card">
            <div className="title">
              <div>
                <span className="eyebrow">Ultimi 7 giorni</span>
                <h2>La tua presenza</h2>
              </div>
            </div>
            <div className="week">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const k = d.toISOString().slice(0, 10),
                  a = progress.activity[k];
                return (
                  <div key={k}>
                    <i
                      className={a ? "active" : ""}
                      style={{
                        height: `${a ? Math.max(20, Math.min(100, a.minutes * 5)) : 8}%`,
                      }}
                    />
                    <small>
                      {d.toLocaleDateString("it-IT", { weekday: "narrow" })}
                    </small>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="weeklyGoalPanel">
            <div>
              <span className="eyebrow">Il tuo ritmo</span>
              <h2>Obiettivo settimanale</h2>
              <p>
                {weeklyActive >= (progress.weeklyGoal ?? 3)
                  ? "Obiettivo raggiunto: continua soltanto se ne hai voglia."
                  : `${weeklyActive} giorni su ${progress.weeklyGoal ?? 3}. Anche una sessione breve conta.`}
              </p>
            </div>
            <div className="weeklyGoalButtons">
              {([3, 5, 7] as const).map((goal) => (
                <button
                  type="button"
                  key={goal}
                  className={
                    (progress.weeklyGoal ?? 3) === goal ? "active" : ""
                  }
                  onClick={() => setWeeklyGoal(goal)}
                >
                  {goal}
                  <small>giorni</small>
                </button>
              ))}
            </div>
          </section>
          <section className="audioPreferencePanel">
            <div>
              <span className="eyebrow">Ascolto e riconoscimento</span>
              <h2>Voce e velocità</h2>
              <p>
                La scelta vale anche per il riconoscimento quando parli in
                inglese.
              </p>
            </div>
            <div className="audioPreferenceRow">
              <strong>Variante</strong>
              <div>
                {(
                  [
                    ["en-GB", "Britannico"],
                    ["en-US", "Americano"],
                  ] as const
                ).map(([accent, label]) => (
                  <button
                    type="button"
                    key={accent}
                    className={audioAccent === accent ? "active" : ""}
                    aria-pressed={audioAccent === accent}
                    onClick={() => {
                      setAudioAccent(accent);
                      saveAudioAccent(accent);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="audioPreferenceRow">
              <strong>Velocità</strong>
              <div>
                {([0.8, 1, 1.2] as const).map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    className={audioRate === rate ? "active" : ""}
                    aria-pressed={audioRate === rate}
                    onClick={() => {
                      setAudioRate(rate);
                      saveAudioRate(rate);
                    }}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="masteryPanel">
            <div className="masteryHeading">
              <span>
                <small>PADRONANZA PER AREA</small>
                <h2>Dove stai crescendo</h2>
              </span>
              {reviewFocus?.open > 0 && (
                <b>Concentrati su {reviewFocus.kind.toLowerCase()}</b>
              )}
            </div>
            <div className="masteryGrid">
              {masteryAreas.map((area) => (
                <article key={area.kind}>
                  <div>
                    <strong>{area.kind}</strong>
                    <b>{area.percent === null ? "—" : `${area.percent}%`}</b>
                  </div>
                  <i>
                    <span style={{ width: `${area.percent ?? 0}%` }} />
                  </i>
                  <small>
                    {area.open
                      ? `${area.open} ${area.open === 1 ? "punto da rinforzare" : "punti da rinforzare"}`
                      : area.mastered
                        ? "Ben consolidata"
                        : "Si attiverà con la pratica"}
                  </small>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="errorNotebookStart"
              onClick={openErrors}
            >
              I miei errori
              <span>
                {smartReviews.filter((review) => !review.mastered).length}
              </span>
              <b>→</b>
            </button>
            {dueSmartReviews.length > 0 && (
              <button type="button" onClick={openSmartReview}>
                Ripassa ora ciò che serve <b>→</b>
              </button>
            )}
            {smartReviews.some((review) => !review.mastered) && (
              <button
                type="button"
                className="recoveryStart"
                onClick={startRecovery}
              >
                Allenamento di recupero <b>→</b>
              </button>
            )}
          </section>
          <section className="card recovery">
            <span className="eyebrow">Backup reale</span>
            <h2>I progressi restano salvati</h2>
            <p>
              Il programma salva automaticamente in questo browser. Per passare
              a un altro telefono, copia il backup e incollalo lì.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(encodeProgress(progress));
                setRecoverMsg(
                  "Backup copiato. Puoi inviarlo a te stesso via e-mail o WhatsApp.",
                );
              }}
            >
              Copia backup progressi
            </button>
            <label>
              Ripristina su questo dispositivo
              <textarea
                rows={4}
                value={recover}
                onChange={(e) => setRecover(e.target.value)}
                placeholder="Incolla qui il backup completo"
              />
            </label>
            <button
              className="outline"
              disabled={!recover.trim()}
              onClick={recoverProgress}
            >
              Ripristina backup
            </button>
            {recoverMsg && <small role="status">{recoverMsg}</small>}
            <em>✓ Nessun account richiesto · dati conservati localmente.</em>
            <div className="dangerZone">
              <b>Vuoi ripartire completamente?</b>
              <small>L’azzeramento richiede sempre una conferma.</small>
              <button type="button" onClick={() => setResetConfirm(true)}>
                Cancella tutti i progressi
              </button>
            </div>
          </section>
          <details className="buildInfo">
            <summary>Versione e aggiornamenti</summary>
            <div>
              <strong>English Coach {APP_VERSION}</strong>
              <small>{BUILD_DATE} · {BUILD_ID}</small>
              <p>
                Test iniziale progressivo, ripresa completa delle sessioni,
                calendario locale e quaderno errori con filtri e storico. I
                progressi precedenti sono conservati automaticamente.
              </p>
            </div>
          </details>
        </div>
      )}
      {view === "errors" && (
        <div className="errorNotebookView">
          <div className="lessonTop">
            <button
              type="button"
              aria-label="Chiudi il quaderno degli errori"
              onClick={() => {
                setView("progress");
                scrollTo(0, 0);
              }}
            >
              ×
            </button>
            <div>
              <i style={{ width: "100%" }} />
            </div>
            <b>{filteredErrors.length}</b>
          </div>
          <article className="errorNotebookPanel">
            <span className="eyebrow">Ripasso personale</span>
            <h1>I miei errori</h1>
            <p className="intro">
              Cerca una parola o una regola. Un concetto diventa acquisito
              soltanto dopo più conferme distanziate nel tempo.
            </p>
            <label className="errorSearch">
              Cerca nel quaderno
              <input
                type="search"
                value={errorSearch}
                onChange={(event) => setErrorSearch(event.target.value)}
                placeholder="Parola, regola o argomento"
              />
            </label>
            <div className="errorFilters" aria-label="Filtra gli errori">
              {(
                [
                  "Tutti",
                  "Grammatica",
                  "Vocabolario",
                  "Phrasal verbs",
                  "Ascolto",
                  "Pronuncia",
                  "Lettura",
                  "Scrittura",
                ] as const
              ).map((kind) => (
                <button
                  type="button"
                  key={kind}
                  className={errorKind === kind ? "active" : ""}
                  aria-pressed={errorKind === kind}
                  onClick={() => setErrorKind(kind)}
                >
                  {kind}
                </button>
              ))}
            </div>
            <div className="errorAdvancedFilters">
              <label>
                Livello
                <select
                  value={errorLevel}
                  onChange={(event) =>
                    setErrorLevel(event.target.value as Cefr | "Tutti")
                  }
                >
                  <option>Tutti</option>
                  {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </label>
              <label>
                Stato
                <select
                  value={errorStatus}
                  onChange={(event) =>
                    setErrorStatus(
                      event.target.value as SmartReviewItem["status"] | "Tutti",
                    )
                  }
                >
                  {[
                    "Tutti",
                    "Nuovo",
                    "Da ripassare",
                    "In consolidamento",
                    "Acquisito",
                  ].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
            {filteredErrors.length ? (
              <div className="errorCards">
                {filteredErrors.map((review) => {
                  const source = mobileCurriculum.find(
                    (candidate) => candidate.id === review.unitId,
                  );
                  return (
                    <section
                      key={review.id}
                      className={review.mastered ? "mastered" : ""}
                    >
                      <header>
                        <span>
                          {review.kind} · {review.level}
                        </span>
                        <b>
                          {review.status ??
                            (review.mastered ? "Acquisito" : "Da ripassare")}
                        </b>
                      </header>
                      <small>{review.unitTitle}</small>
                      <h2>{review.prompt}</h2>
                      <dl>
                        <div>
                          <dt>Hai risposto</dt>
                          <dd>
                            {review.givenAnswer ?? "Risposta non registrata"}
                          </dd>
                        </div>
                        <div>
                          <dt>Risposta corretta</dt>
                          <dd lang="en">{review.answer}</dd>
                        </div>
                      </dl>
                      <ConceptText text={review.explanation} />
                      {source?.grammar.formulas[0] && (
                        <aside className="ruleRecall">
                          <small>REGOLA COLLEGATA</small>
                          <b>{source.grammar.formulas[0]}</b>
                        </aside>
                      )}
                      {!!review.attempts?.length && (
                        <details className="attemptHistory">
                          <summary>
                            Storico tentativi ({review.attempts.length})
                          </summary>
                          <ol>
                            {[...review.attempts].reverse().slice(0, 10).map((attempt) => (
                              <li key={`${attempt.at}-${attempt.givenAnswer}`}>
                                <span>{attempt.correct ? "✓" : "↗"}</span>
                                <b>{attempt.givenAnswer}</b>
                                <small>
                                  {new Date(attempt.at).toLocaleString("it-IT")}
                                </small>
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}
                      <footer>
                        <small>
                          {review.wrongCount ?? 1} errori ·{" "}
                          {review.correctStreak ?? 0} conferme · prossimo
                          ripasso{" "}
                          {new Date(
                            `${review.dueAt}T12:00:00`,
                          ).toLocaleDateString("it-IT")}
                        </small>
                        <div>
                          <button
                            type="button"
                            className="showSolution"
                            onClick={() => understandError(review)}
                          >
                            Ho capito · riproponi domani
                          </button>
                          <button
                            type="button"
                            className="continue"
                            onClick={() => retryError(review)}
                          >
                            Riprova <b>→</b>
                          </button>
                        </div>
                      </footer>
                    </section>
                  );
                })}
              </div>
            ) : (
              <section className="emptyErrors">
                <b>✓</b>
                <h2>Nessun elemento con questi filtri</h2>
                <p>
                  Gli errori e le domande saltate compariranno qui
                  automaticamente.
                </p>
              </section>
            )}
          </article>
        </div>
      )}
      {view === "placement" && (
        <PlacementTest
          onClose={() => { setView("home"); scrollTo(0, 0); }}
          onChoose={(level) => completeOnboarding(level)}
        />
      )}
      {view === "recoveryDrill" && (
        <div className="recoveryScreen">
          <div className="lessonTop">
            <button
              type="button"
              aria-label="Chiudi il recupero"
              onClick={() => {
                setView("progress");
                setRecoveryPick(null);
                scrollTo(0, 0);
              }}
            >
              ×
            </button>
            <div>
              <i
                style={{
                  width: `${recoveryFinished ? 100 : Math.round(((recoveryIndex + 1) / Math.max(1, recoveryQuiz.length)) * 100)}%`,
                }}
              />
            </div>
            <b>↗</b>
          </div>
          {recoveryFinished ? (
            <article className="recoveryPanel recoveryResult">
              <div>✓</div>
              <h1>Recupero completato</h1>
              <strong>
                {Math.round(
                  (recoveryCorrect / Math.max(1, recoveryQuiz.length)) * 100,
                )}
                %
              </strong>
              <p>
                {recoveryCorrect === recoveryQuiz.length
                  ? "Hai consolidato tutti i punti di questa sessione."
                  : "Le risposte meno sicure torneranno nel prossimo ripasso."}
              </p>
              <button
                type="button"
                className="continue"
                onClick={() => {
                  setView("progress");
                  scrollTo(0, 0);
                }}
              >
                Vedi i progressi <b>→</b>
              </button>
            </article>
          ) : (
            recoveryQuiz[recoveryIndex] &&
            (() => {
              const question = recoveryQuiz[recoveryIndex],
                correct = recoveryPick === question.answer;
              return (
                <article className="recoveryPanel">
                  <span className="eyebrow">
                    {question.review.kind} · {recoveryIndex + 1} di{" "}
                    {recoveryQuiz.length}
                  </span>
                  <h1>{question.review.prompt}</h1>
                  <small>{question.review.unitTitle}</small>
                  <div className="recoveryOptions">
                    {question.options.map((option, index) => (
                      <button
                        type="button"
                        key={`${option}-${index}`}
                        disabled={recoveryPick !== null}
                        className={
                          recoveryPick === null
                            ? ""
                            : index === question.answer
                              ? "correct"
                              : index === recoveryPick
                                ? "wrong"
                                : "dim"
                        }
                        onClick={() => answerRecovery(index)}
                      >
                        <b>{String.fromCharCode(65 + index)}</b>
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>
                  {recoveryPick === null ? (
                    <button
                      type="button"
                      className="recoverySkip"
                      onClick={() => answerRecovery(-1)}
                    >
                      Salta domanda
                    </button>
                  ) : (
                    <>
                      <section
                        className={`recoveryFeedback ${correct ? "good" : "review"}`}
                      >
                        <strong>
                          {correct
                            ? "Ben fatto: risposta consolidata."
                            : "Rivediamola subito."}
                        </strong>
                        <p>
                          Risposta: <b lang="en">{question.review.answer}</b>
                        </p>
                        <ConceptText text={question.review.explanation} />
                      </section>
                      <button
                        type="button"
                        className="continue"
                        onClick={nextRecovery}
                      >
                        {recoveryIndex + 1 < recoveryQuiz.length
                          ? "Prossima domanda"
                          : "Vedi il risultato"}{" "}
                        <b>→</b>
                      </button>
                    </>
                  )}
                </article>
              );
            })()
          )}
        </div>
      )}
      {view === "smartReview" && (
        <div className="smartReviewScreen">
          <div className="lessonTop">
            <button
              type="button"
              aria-label="Chiudi il ripasso"
              onClick={() => {
                setView("home");
                setSmartReviewRevealed(false);
                scrollTo(0, 0);
              }}
            >
              ×
            </button>
            <div>
              <i
                style={{
                  width: `${Math.round(((smartReviewIndex + 1) / Math.max(1, dueSmartReviews.length)) * 100)}%`,
                }}
              />
            </div>
            <b>{activeSmartReview?.level ?? "✓"}</b>
          </div>
          {activeSmartReview ? (
            <article className="smartReviewCard">
              <span className="eyebrow">
                {activeSmartReview.kind} · {smartReviewIndex + 1} di{" "}
                {dueSmartReviews.length}
              </span>
              <h1>{activeSmartReview.prompt}</h1>
              <small>{activeSmartReview.unitTitle}</small>
              {!smartReviewRevealed ? (
                <button
                  type="button"
                  className="continue"
                  onClick={() => setSmartReviewRevealed(true)}
                >
                  Mostra la risposta <b>→</b>
                </button>
              ) : (
                <>
                  <section className="smartReviewAnswer">
                    <small>RISPOSTA</small>
                    <strong lang="en">{activeSmartReview.answer}</strong>
                    <p>{activeSmartReview.explanation}</p>
                  </section>
                  <div className="smartReviewChoices">
                    <button
                      type="button"
                      className="reviewAgain"
                      onClick={() => answerSmartReview(false)}
                    >
                      Da ripassare
                    </button>
                    <button
                      type="button"
                      className="reviewRemembered"
                      onClick={() => answerSmartReview(true)}
                    >
                      Ricordavo ✓
                    </button>
                  </div>
                </>
              )}
            </article>
          ) : (
            <article className="smartReviewCard complete">
              <div>✓</div>
              <h1>Ripasso completato</h1>
              <p>Hai rinforzato tutti i punti previsti per oggi.</p>
              <button
                type="button"
                className="continue"
                onClick={() => setView("home")}
              >
                Torna alla home <b>→</b>
              </button>
            </article>
          )}
        </div>
      )}
      {view === "themePack" && selectedPack && (
        <ThemePackLab
          key={selectedPack.id}
          pack={selectedPack}
          badge={
            selectedPack.introducedIn === APP_VERSION
              ? `NEW ${selectedPack.introducedIn}`
              : `V ${selectedPack.introducedIn}`
          }
          previous={progress.themePacks?.[selectedPack.id]}
          onClose={() => {
            speechSynthesis?.cancel();
            setSelectedPack(null);
            setView("topics");
            scrollTo(0, 0);
          }}
          onComplete={finishThemePack}
        />
      )}
      {view === "review" &&
        reviewSpec &&
        (() => {
          const levelUnits = mobileCurriculum.filter(
              (item) => item.cefr === reviewSpec.level,
            ),
            reviewUnits =
              reviewSpec.end === 12
                ? levelUnits
                : levelUnits.slice(reviewSpec.end - 4, reviewSpec.end);
          return (
            <ReviewLab
              key={`${reviewSpec.level}-${reviewSpec.end}`}
              level={reviewSpec.level}
              units={reviewUnits}
              final={reviewSpec.end === 12}
              onClose={() => {
                setView("path");
                setReviewSpec(null);
                scrollTo(0, 0);
              }}
              onComplete={finishReview}
              onOpenUnit={(lesson) => {
                setReviewSpec(null);
                beginUnit(lesson);
              }}
            />
          );
        })()}{" "}
      {view === "reading" && (
        <div className="readingView">
          <div className="readingProgress">
            <button
              type="button"
              aria-label="Chiudi la lettura"
              onClick={() => {
                setView("topics");
                setSelectedTheme("reading");
                scrollTo(0, 0);
              }}
            >
              ×
            </button>
            <div>
              <i
                style={{
                  width:
                    readingStep === "text"
                      ? "33%"
                      : readingStep === "questions"
                        ? "66%"
                        : "100%",
                }}
              />
            </div>
            <b>{reading.level}</b>
          </div>
          <article className="readingPanel">
            {readingStep === "text" && (
              <>
                <span className="eyebrow">
                  Reading Lab · {reading.minutes} minuti
                </span>
                <h1>{reading.title}</h1>
                <p className="readingTopic">{reading.topic}</p>
                {reading.sourceUrl && (
                  <a
                    className="readingSource"
                    href={reading.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Testo didattico originale ispirato a{" "}
                    {reading.sourceLabel ?? "una fonte pubblica"} ↗
                  </a>
                )}
                <div className="readingPaper" lang="en">
                  {reading.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <section className="readingGlossary">
                  <h2>Parole utili</h2>
                  <div>
                    {reading.glossary.map(([en, it]) => (
                      <span key={en}>
                        <b lang="en">{en}</b>
                        <small>{it}</small>
                      </span>
                    ))}
                  </div>
                </section>
                <button
                  className="continue"
                  onClick={() => {
                    setReadingQuestionIndex(0);
                    setReadingStep("questions");
                    scrollTo(0, 0);
                  }}
                >
                  Ho letto · vai alle 6 domande <b>→</b>
                </button>
              </>
            )}
            {readingStep === "questions" && (
              <>
                <span className="eyebrow">Verifica di comprensione</span>
                <h1>Che cosa hai capito?</h1>
                <p className="intro">
                  Una domanda alla volta, con lo spazio necessario per
                  ragionare. Puoi riaprire il testo senza perdere la risposta.
                </p>
                <details className="readingReference">
                  <summary>▤ Rileggi il testo completo</summary>
                  <div lang="en">
                    {reading.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </details>
                <div className="readingQuestions">
                  {reading.questions
                    .slice(readingQuestionIndex, readingQuestionIndex + 1)
                    .map((question) => {
                      const index = readingQuestionIndex;
                      return (
                        <section key={question.prompt}>
                          <small>
                            DOMANDA {index + 1} DI {reading.questions.length}
                          </small>
                          <h2>{question.prompt}</h2>
                          <div>
                            {question.options.map((option, optionIndex) => (
                              <button
                                type="button"
                                key={option}
                                className={
                                  readingAnswers[index] === optionIndex
                                    ? "selected"
                                    : ""
                                }
                                onClick={() =>
                                  setReadingAnswers((answers) => ({
                                    ...answers,
                                    [index]: optionIndex,
                                  }))
                                }
                              >
                                <b>{String.fromCharCode(65 + optionIndex)}</b>
                                <span>{option}</span>
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className={`readingSkip ${readingAnswers[index] === -1 ? "selected" : ""}`}
                            onClick={() =>
                              setReadingAnswers((answers) => ({
                                ...answers,
                                [index]: -1,
                              }))
                            }
                          >
                            Salta domanda
                          </button>
                        </section>
                      );
                    })}
                </div>
                <button
                  className="continue"
                  disabled={readingAnswers[readingQuestionIndex] === undefined}
                  onClick={() => {
                    if (readingQuestionIndex + 1 < reading.questions.length) {
                      setReadingQuestionIndex((value) => value + 1);
                      scrollTo(0, 0);
                    } else finishReading();
                  }}
                >
                  {readingQuestionIndex + 1 < reading.questions.length
                    ? "Prossima domanda"
                    : "Valuta la comprensione"}{" "}
                  <b>→</b>
                </button>
              </>
            )}
            {readingStep === "result" && (
              <>
                <div className="readingResultHero">
                  <span>Risultato</span>
                  <strong>{readingPercent}%</strong>
                  <h1>
                    {readingPercent >= 85
                      ? "Comprensione molto buona"
                      : readingPercent >= 65
                        ? "Hai colto il contenuto principale"
                        : "Rileggiamo i punti importanti"}
                  </h1>
                  <p>
                    {readingCorrect} risposte corrette su{" "}
                    {reading.questions.length}.
                  </p>
                </div>
                <div className="readingAnalysis">
                  {reading.questions.map((question, index) => {
                    const ok = readingAnswers[index] === question.answer;
                    return (
                      <section
                        key={question.prompt}
                        className={ok ? "good" : "bad"}
                      >
                        <small>{ok ? "✓ CORRETTA" : "DA RIVEDERE"}</small>
                        <h2>{question.prompt}</h2>
                        <p>
                          La tua risposta:{" "}
                          <b>
                            {readingAnswers[index] === -1
                              ? "Domanda saltata"
                              : question.options[readingAnswers[index]]}
                          </b>
                        </p>
                        {!ok && (
                          <p>
                            Risposta corretta:{" "}
                            <strong>{question.options[question.answer]}</strong>
                          </p>
                        )}
                        <ConceptText text={question.explanationIt} />
                      </section>
                    );
                  })}
                </div>
                <div className="readingResultActions">
                  <button
                    className="continue"
                    onClick={() => {
                      setReadingAnswers({});
                      setReadingQuestionIndex(0);
                      setReadingStep("text");
                      scrollTo(0, 0);
                    }}
                  >
                    Rileggi e riprova <b>↻</b>
                  </button>
                  <button
                    type="button"
                    className="showSolution"
                    onClick={() => {
                      setView("topics");
                      setSelectedTheme("reading");
                      scrollTo(0, 0);
                    }}
                  >
                    Torna al Reading Lab
                  </button>
                </div>
              </>
            )}
          </article>
        </div>
      )}{" "}
      {view === "lesson" && (
        <div className="lesson">
          <div className="lessonTop">
            <button
              type="button"
              aria-label="Chiudi la lezione"
              onClick={() => {
                stopActiveAudio?.();
                setView("home");
                scrollTo(0, 0);
              }}
            >
              ×
            </button>
            <div>
              <i
                style={{
                  width: `${phase === "complete" || phase === "bonus" ? 100 : ((activeStages.indexOf(phase) + 1) / activeStages.length) * 100}%`,
                }}
              />
            </div>
            <b>{unit.cefr}</b>
          </div>
          <article className="lessonCard">
            <span className="eyebrow">
              {phase === "complete" ? "Sessione conclusa" : labels[phase]}
            </span>
            {phase !== "complete" && (
              <div className="lessonActions">
                <button className="backStage" onClick={previousPhase}>
                  ← Indietro
                </button>
                {!["cloze", "listening", "quiz", "bonus"].includes(phase) && (
                  <button className="skipStage" onClick={skipStage}>
                    Salta questa parte →
                  </button>
                )}
              </div>
            )}
            {phase === "grammar" && (
              <GrammarLesson unit={unit} onContinue={nextPhase} />
            )}
            {phase === "examples" && (
              <>
                <h1>La regola in azione</h1>
                <p className="intro">
                  Ascolta l’inglese, poi confronta il significato.
                </p>
                <div className="examples">
                  {unit.grammar.examples.map((x, i) => (
                    <div key={x.en}>
                      <AudioButton
                        text={x.en}
                        src={`${import.meta.env.BASE_URL}audio/${unit.id}-example-${i + 1}.wav`}
                      />
                      <strong lang="en">{x.en}</strong>
                      <span>{x.it}</span>
                      <p>{x.noteIt}</p>
                    </div>
                  ))}
                </div>
                <button className="continue" onClick={nextPhase}>
                  Prova tu <b>→</b>
                </button>
              </>
            )}
            {phase === "vocabulary" && (
              <>
                <h1>Vocaboli della lezione</h1>
                <p className="intro">
                  Ascolta ogni parola nel suo esempio reale e leggi la
                  traduzione italiana.
                </p>
                <div className="vocabularyList">
                  {unit.vocabulary.map((x, i) => (
                    <article key={x.en}>
                      <AudioButton
                        text={x.example}
                        src={`${import.meta.env.BASE_URL}audio/${unit.id}-vocab-${i + 1}.wav`}
                      />
                      <div>
                        <strong lang="en">{x.en}</strong>
                        <span>{x.it}</span>
                        <p lang="en">{x.example}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <button className="continue" onClick={nextPhase}>
                  Fai pratica <b>→</b>
                </button>
              </>
            )}
            {phase === "cloze" && (
              <>
                <small className="count">
                  Domanda {item + 1} di {practiceCloze.length}
                </small>
                <h1>Completa la frase</h1>
                <p className="prompt" lang="en">
                  {practiceCloze[item].prompt}
                </p>
                <label className="field">
                  La parola mancante
                  <input
                    value={input}
                    disabled={checked !== null}
                    onChange={(e) => setInput(e.target.value)}
                    autoCapitalize="none"
                  />
                </label>
                {checked !== null && (
                  <div className={`feedback ${checked ? "good" : "bad"}`}>
                    <b>{checked ? "Perfetto!" : "Rivediamola insieme."}</b>
                    <ConceptText text={practiceCloze[item].hintIt} />
                    {!checked && (
                      <p>
                        Risposta:{" "}
                        <strong>{practiceCloze[item].answers[0]}</strong>.
                      </p>
                    )}
                    <aside className="ruleRecall">
                      <small>
                        {checked ? "PERCHÉ È CORRETTA" : "REGOLA DA RIPASSARE"}
                      </small>
                      <b>
                        {
                          unit.grammar.formulas[
                            item % unit.grammar.formulas.length
                          ]
                        }
                      </b>
                      <span>{practiceCloze[item].hintIt}</span>
                    </aside>
                  </div>
                )}
                <div className="clozeActions">
                  {checked === null && (
                    <button
                      type="button"
                      className="showSolution"
                      onClick={() => {
                        const exercise = practiceCloze[item];
                        setInput(exercise.answers[0]);
                        setChecked(false);
                        setPoints((p) => ({ yes: p.yes, all: p.all + 1 }));
                        queueReview(
                          "Vocabolario",
                          exercise.prompt,
                          exercise.answers[0],
                          exercise.hintIt,
                        );
                      }}
                    >
                      Vedi soluzione
                    </button>
                  )}
                  <button
                    className="continue"
                    disabled={!input.trim()}
                    onClick={() =>
                      checked === null ? check() : advance(practiceCloze.length)
                    }
                  >
                    {checked === null
                      ? "Verifica"
                      : item + 1 < practiceCloze.length
                        ? "Prossima"
                        : "Continua"}
                    <b>→</b>
                  </button>
                </div>
              </>
            )}
            {phase === "writing" && (
              <>
                <h1>Scrivi con parole tue</h1>
                <p className="intro">{unit.writing.productionPromptIt}</p>
                <label className="field">
                  La tua risposta in inglese
                  <textarea
                    rows={7}
                    lang="en"
                    spellCheck
                    value={writing}
                    onChange={(e) => {
                      setWriting(e.target.value);
                      setWritingNotes(null);
                      setWritingSuggestion("");
                    }}
                    placeholder="Scrivi qui…"
                  />
                  <small>
                    {writing.trim() ? writing.trim().split(/\s+/).length : 0}{" "}
                    parole
                  </small>
                </label>
                <button
                  className="writingCheck"
                  disabled={
                    writing.trim().split(/\s+/).filter(Boolean).length < 4
                  }
                  onClick={analyzeWriting}
                >
                  Controlla grammatica e ortografia
                </button>
                {writingNotes && (
                  <div className="writingReview">
                    <div className="checklist">
                      <b>Perché correggere</b>
                      {writingNotes.map((x) => (
                        <span key={x}>✓ {x}</span>
                      ))}
                    </div>
                    <article>
                      <small>VERSIONE SUGGERITA</small>
                      <p lang="en">
                        {writingParts
                          .filter((x) => x.expected)
                          .map((x, i) => (
                            <span
                              key={`${x.expected}-${i}`}
                              className={x.ok ? "wordOk" : "wordBad"}
                            >
                              {x.expected}{" "}
                            </span>
                          ))}
                      </p>
                      <em>
                        Le parole evidenziate sono state corrette. Controlla
                        sempre che il significato resti quello che volevi
                        esprimere.
                      </em>
                    </article>
                  </div>
                )}
                <button
                  className="continue"
                  disabled={!writingNotes}
                  onClick={nextPhase}
                >
                  Vai all’ascolto <b>→</b>
                </button>
              </>
            )}
            {phase === "listening" && (
              <>
                <small className="count">
                  Domanda {item + 1} di {listeningQuiz.length}
                </small>
                <h1>Ascolta e comprendi</h1>
                <p className="intro">{unit.listening.guideIt}</p>
                <GuidedListening
                  unit={unit}
                  src={`${import.meta.env.BASE_URL}audio/${unit.id}-listening.wav`}
                />
                <details className="dictationLab">
                  <summary>
                    ✎ Dettato facoltativo · scrivi ciò che capisci
                  </summary>
                  <p>
                    Puoi scrivere tutto o soltanto una parte. Non blocca le
                    domande.
                  </p>
                  <textarea
                    lang="en"
                    spellCheck={false}
                    value={dictation}
                    onChange={(e) => {
                      setDictation(e.target.value);
                      setDictationChecked(false);
                    }}
                    placeholder="I heard…"
                  />
                  <button
                    disabled={!dictation.trim()}
                    onClick={() => setDictationChecked(true)}
                  >
                    Confronta con l’audio
                  </button>
                  {dictationChecked && (
                    <div className="dictationResult">
                      <strong>{dictationScore}% riconosciuto</strong>
                      <small>TRASCRIZIONE CORRETTA</small>
                      <p lang="en">
                        {dictationParts
                          .filter((x) => x.expected)
                          .map((x, i) =>
                            x.ok ? (
                              <span
                                key={`${x.expected}-${i}`}
                                className="wordOk"
                              >
                                {x.expected}{" "}
                              </span>
                            ) : (
                              <button
                                type="button"
                                key={`${x.expected}-${i}`}
                                className="wordBad wordAudio"
                                onClick={() => playWord(x.expected!)}
                              >
                                {x.expected} <i>🔊</i>
                              </button>
                            ),
                          )}
                      </p>
                      <em>
                        Le parole rosse mancano o sono diverse: toccale per
                        ascoltarle.
                      </em>
                    </div>
                  )}
                </details>
                <Question
                  key={`l${item}`}
                  data={listeningQuiz[item]}
                  done={score}
                  rule={
                    unit.grammar.formulas[item % unit.grammar.formulas.length]
                  }
                />
                <button
                  className="continue"
                  disabled={answered === null}
                  onClick={() => advance(listeningQuiz.length)}
                >
                  {item + 1 < listeningQuiz.length ? "Prossima" : "Continua"}
                  <b>→</b>
                </button>
              </>
            )}
            {phase === "speaking" && (
              <>
                <h1>Listen and repeat</h1>
                <p className="intro">{unit.speaking.promptIt}</p>
                <div className="repeat">
                  <AudioButton
                    text={unit.speaking.target}
                    src={`${import.meta.env.BASE_URL}audio/${unit.id}-speaking.wav`}
                    label="Ascolta la frase"
                  />
                  <blockquote lang="en">{unit.speaking.target}</blockquote>
                  <div>
                    {unit.speaking.focus.map((x) => (
                      <small key={x}>{x}</small>
                    ))}
                  </div>
                </div>
                <button
                  className={`record ${recording ? "on" : ""}`}
                  disabled={recording}
                  onClick={record}
                >
                  ● {recording ? "Ti ascolto…" : "Parla in inglese"}
                </button>
                {recording && (
                  <div className="micLive" role="status" aria-live="assertive">
                    <i />
                    <span>
                      <b>Registrazione in corso</b>
                      <small>Parla ora in inglese · {recordingSeconds}s</small>
                    </span>
                  </div>
                )}
                {spoken && (
                  <div className="speech">
                    <small>HO CAPITO</small>
                    <p lang="en">“{spoken}”</p>
                    {!speechIsError && (
                      <>
                        <b>{speechScore}% di parole riconosciute</b>
                        <div className="pronunciationCompare">
                          <small>FRASE CORRETTA</small>
                          <p lang="en">
                            {speechParts
                              .filter((x) => x.expected)
                              .map((x, i) =>
                                x.ok ? (
                                  <span
                                    key={`${x.expected}-${i}`}
                                    className="wordOk"
                                  >
                                    {x.expected}{" "}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    key={`${x.expected}-${i}`}
                                    className="wordBad wordAudio"
                                    onClick={() => playWord(x.expected!)}
                                    title={`Ascolta ${x.expected}`}
                                  >
                                    {x.expected} <i>🔊</i>
                                  </button>
                                ),
                              )}
                          </p>
                          <small>LA TUA PRONUNCIA INTERPRETATA</small>
                          <p lang="en">
                            {speechParts
                              .filter((x) => x.heard)
                              .map((x, i) => (
                                <span
                                  key={`${x.heard}-${i}`}
                                  className={x.ok ? "wordOk" : "wordBad"}
                                >
                                  {x.heard}{" "}
                                </span>
                              ))}
                          </p>
                        </div>
                        {speechParts.some((x) => !x.ok && x.expected) && (
                          <div className="retryWords">
                            <small>DA RIPETERE</small>
                            <b>
                              {speechParts
                                .filter((x) => !x.ok && x.expected)
                                .map((x) => x.expected)
                                .join(" · ")}
                            </b>
                          </div>
                        )}
                        <button className="retrySpeech" onClick={record}>
                          Riprova subito
                        </button>
                      </>
                    )}
                  </div>
                )}
                <button
                  className="continue"
                  onClick={() => {
                    if (spoken && !speechIsError && speechScore < 75)
                      queueReview(
                        "Pronuncia",
                        unit.speaking.promptIt,
                        unit.speaking.target,
                        "Ascolta la frase, ripetila lentamente e concentrati sulle parole evidenziate.",
                      );
                    nextPhase();
                  }}
                >
                  Vai al quiz <b>→</b>
                </button>
              </>
            )}
            {phase === "quiz" && (
              <>
                <small className="count">
                  Domanda {item + 1} di {finalQuiz.length}
                </small>
                <h1>Controllo finale</h1>
                <p className="intro">
                  Se sbagli, leggi il motivo: anche la spiegazione fa parte
                  della pratica.
                </p>
                <Question
                  key={`q${item}`}
                  data={finalQuiz[item]}
                  done={score}
                  rule={
                    unit.grammar.formulas[item % unit.grammar.formulas.length]
                  }
                />
                <button
                  className="continue"
                  disabled={answered === null}
                  onClick={() =>
                    item + 1 < finalQuiz.length
                      ? advance(finalQuiz.length)
                      : finish()
                  }
                >
                  {item + 1 < finalQuiz.length ? "Prossima" : "Concludi"}
                  <b>→</b>
                </button>
              </>
            )}
            {phase === "bonus" && (
              <>
                <small className="count">
                  Esercizio extra {item + 1} di {activeBonus.length}
                </small>
                <h1>Pratica supplementare</h1>
                <p className="intro">
                  {bonusMinutes} minuti scelti · puoi fermarti o saltare in
                  qualsiasi momento.
                </p>
                <Question
                  key={`b${item}`}
                  data={activeBonus[item]}
                  done={score}
                  rule={
                    unit.grammar.formulas[item % unit.grammar.formulas.length]
                  }
                />
                <button
                  className="continue"
                  disabled={answered === null}
                  onClick={() => {
                    if (item + 1 < activeBonus.length) {
                      setItem((value) => value + 1);
                      setAnswered(null);
                    } else finishBonus();
                  }}
                >
                  {item + 1 < activeBonus.length
                    ? "Prossimo extra"
                    : "Termina extra"}
                  <b>→</b>
                </button>
              </>
            )}{" "}
            {phase === "complete" && (
              <div className="complete">
                <div>✓</div>
                <h1>
                  {bonusDone ? "Extra completato!" : "Allenamento completato!"}
                </h1>
                <p>
                  {bonusDone
                    ? "Hai rinforzato la lezione con altra pratica mirata."
                    : "Hai studiato, scritto, ascoltato e parlato. Ora scegli liberamente se fermarti o continuare."}
                </p>
                <strong>
                  {points.all ? Math.round((points.yes / points.all) * 100) : 0}
                  %
                </strong>
                <small>precisione di oggi</small>
                {!bonusDone && (
                  <section className="bonusOffer">
                    <h2>Hai ancora tempo?</h2>
                    <p>
                      Scegli quanti minuti aggiungere. Sono esercizi
                      supplementari, non obbligatori.
                    </p>
                    <div>
                      <button onClick={() => startBonus(5)}>+5 min</button>
                      <button onClick={() => startBonus(10)}>+10 min</button>
                      <button onClick={() => startBonus(15)}>+15 min</button>
                    </div>
                  </section>
                )}
                <button
                  className="continue"
                  onClick={() => {
                    stopActiveAudio?.();
                    setView("home");
                  }}
                >
                  {bonusDone ? "Torna alla home" : "Mi fermo qui per oggi"}
                  <b>→</b>
                </button>
              </div>
            )}
            {["cloze", "listening", "quiz", "bonus"].includes(phase) && (
              <button type="button" className="bottomSkip" onClick={skipStage}>
                Salta domanda →
              </button>
            )}{" "}
          </article>
        </div>
      )}
      {view !== "lesson" &&
        view !== "reading" &&
        view !== "review" &&
        view !== "smartReview" &&
        view !== "recoveryDrill" &&
        view !== "errors" &&
        view !== "placement" &&
        view !== "themePack" && (
          <nav>
            <button
              className={view === "home" ? "active" : ""}
              onClick={() => setView("home")}
            >
              <b>⌂</b>Oggi
            </button>
            <button
              className={view === "path" ? "active" : ""}
              onClick={() => setView("path")}
            >
              <b>◇</b>Percorso
            </button>
            <button
              className={view === "topics" ? "active" : ""}
              onClick={() => setView("topics")}
            >
              <b>✦</b>Temi
            </button>
            <button
              className={view === "progress" ? "active" : ""}
              onClick={() => setView("progress")}
            >
              <b>↗</b>Progressi
            </button>
          </nav>
        )}
    </main>
  );
}
