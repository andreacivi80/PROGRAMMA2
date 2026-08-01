"use client";
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  curriculumIndex,
  mobileCurriculum,
  optionCountForLevel,
  type Cefr,
  type Choice,
  type MobileUnit,
} from "./curriculum";
import { readingPassages, type ReadingPassage } from "./readingLab";
import {
  actionVisualSets,
  jobVisualSets,
  kitchenVisualSets,
  phrasalVisualSets,
  type VisualSet,
} from "./visualQuiz";
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
import {
  applyDialogueVoice,
  dialogueRole,
  dialogueVoicePair,
} from "./speechVoices";
import {
  buildSupplementaryQuiz,
  meaningMistakes,
  plausibleClozeDistractors,
  tryOptionsFor,
  supplementaryBankFor,
  supplementaryFingerprint,
} from "./supplementaryQuiz";
import { analyzeLocalWriting } from "./languageAnalysis";
import { buildErrorClusters, buildSkillProfile } from "./learningIntelligence";
import "./themePacks.css";
import "./lessonEnhancements.css";
import "./wordGames.css";
import "./appEnhancements.css";

const GrammarLesson = lazy(() => import("./GrammarLesson"));
const ReviewLab = lazy(() => import("./ReviewLab"));
const ThemePackLab = lazy(() => import("./ThemePackLab"));
const WordGamesHub = lazy(() => import("./WordGamesHub"));
const PlacementTest = lazy(() => import("./PlacementTest"));
const SkillsLab = lazy(() => import("./SkillsLab"));
const StoryPath = lazy(() => import("./StoryPath"));
const LearningCoach = lazy(() => import("./LearningCoach"));
const Deferred = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="loading">Caricamento…</div>}>{children}</Suspense>
);

const APP_VERSION = "7.9";
const BUILD_DATE = "1 agosto 2026";
const BUILD_ID = "EC-7.9-0801";
type View =
  | "start"
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
  options?: string[];
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
  options?: string[];
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
  streakPausedUntil?: string;
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
  lessonFeedback?: Record<
    string,
    { rating: "easy" | "right" | "hard"; at: string; score: number }
  >;
  learningGoal?: string;
  savedPhrases?: { id: string; en: string; it?: string; source: string; savedAt: string }[];
  weeklyChallenges?: Record<string, { response: string; completedAt: string }>;
  monthlyChecks?: Record<string, { score: number; completedAt: string }>;
  smartReview?: Record<string, SmartReviewItem>;
};
type SessionCheckpoint = {
  unitId: string;
  phase: Phase;
  item: number;
  writing: string;
  points: { yes: number; all: number };
  input?: string;
  checked?: boolean | null;
  answered?: boolean | null;
  dictation?: string;
  dictationChecked?: boolean;
  spoken?: string;
  writingNotes?: string[] | null;
  writingSuggestion?: string;
  sessionMinutes?: 5 | 15 | 30 | null;
  bonusMinutes?: number;
  bonusQuiz?: Choice[];
  bonusDone?: boolean;
  startedAt?: number;
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
    id: "real-life",
    icon: "↗",
    title: "Inglese nella vita reale",
    description: "Viaggi, hotel, assistenza e decisioni di lavoro.",
    matches: [],
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
    title: "Inglese professionale",
    description: "Email, riunioni, problemi, accordi e negoziazione.",
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
    icon: "UK US",
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
    id: "story",
    icon: "∞",
    title: "Storia a episodi",
    description: "Una storia progressiva con scelte, ascolto e scrittura.",
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
  if (id === "games" || id === "visual" || id === "skills" || id === "story") return true;
  if (id === "reading")
    return readingPassages.some((item) => item.level === level);
  if (id === "video")
    return videoResources.some((item) => item.level.includes(level));
  if (
    id === "social" ||
    id === "real-life" ||
    id === "ira" ||
    id === "accents" ||
    id === "language" ||
    id === "work" ||
    id === "food"
  ) {
    const category = id === "food" ? "dining" : id === "work" ? "professional" : id;
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
const reviewPriority = (review: SmartReviewItem) => {
  const overdueDays = Math.max(0, Math.floor((Date.now() - new Date(`${review.dueAt}T12:00:00`).getTime()) / 86400000));
  return overdueDays * 4 + (review.wrongCount ?? 1) * 3 - (review.correctStreak ?? 0) * 2 + (review.step === 0 ? 4 : 0);
};
const weekKey = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 1),
    day = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(day).padStart(2, "0")}`;
};
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
  schemaVersion: 14,
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
  lessonFeedback: {},
  learningGoal: "Conversazione quotidiana",
  savedPhrases: [],
  weeklyChallenges: {},
  monthlyChecks: {},
  smartReview: {},
});
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
export function normalizeProgress(value: unknown, id: string): Progress {
  const raw: Record<string, any> = isRecord(value)
    ? JSON.parse(JSON.stringify(value))
    : {};
  const shiftAfter = (threshold: number, amount: number) => {
    const shifted: Record<string, Result> = {};
    Object.entries(isRecord(raw.days) ? raw.days : {}).forEach(
      ([day, result]) => {
        const oldDay = Number(day);
        if (Number.isFinite(oldDay))
          shifted[String(oldDay > threshold ? oldDay + amount : oldDay)] =
            result as Result;
      },
    );
    raw.days = shifted;
    const current = Number(raw.currentDay ?? 1);
    raw.currentDay = current > threshold ? current + amount : current;
  };
  if ((Number(raw.schemaVersion) || 1) < 2) shiftAfter(6, 6);
  if ((Number(raw.schemaVersion) || 1) < 3) shiftAfter(18, 6);
  if ((Number(raw.schemaVersion) || 1) < 4) shiftAfter(30, 6);
  raw.days = isRecord(raw.days) ? raw.days : {};
  raw.activity = isRecord(raw.activity) ? raw.activity : {};
  raw.reading = isRecord(raw.reading) ? raw.reading : {};
  raw.reviews = isRecord(raw.reviews) ? raw.reviews : {};
  raw.themePacks = isRecord(raw.themePacks) ? raw.themePacks : {};
  raw.wordGames = isRecord(raw.wordGames) ? raw.wordGames : {};
  raw.lessonFeedback = isRecord(raw.lessonFeedback) ? raw.lessonFeedback : {};
  raw.savedPhrases = Array.isArray(raw.savedPhrases)
    ? raw.savedPhrases.filter((item: unknown) => isRecord(item) && typeof item.en === "string").slice(-200)
    : [];
  raw.weeklyChallenges = isRecord(raw.weeklyChallenges) ? raw.weeklyChallenges : {};
  raw.monthlyChecks = isRecord(raw.monthlyChecks) ? raw.monthlyChecks : {};
  raw.smartReview = isRecord(raw.smartReview) ? raw.smartReview : {};
  raw.smartReview = Object.fromEntries(
    Object.entries(raw.smartReview).map(([key, item]) => {
      const review = (isRecord(item) ? item : {}) as SmartReviewItem;
      return [
        key,
        {
          ...review,
          wrongCount: Math.max(0, Number(review.wrongCount ?? 1) || 0),
          correctStreak: Math.max(
            0,
            Number(review.correctStreak ?? review.step ?? 0) || 0,
          ),
          attempts: Array.isArray(review.attempts)
            ? review.attempts.slice(-30)
            : [],
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
  const currentDay = Number(raw.currentDay ?? 1);
  return {
    ...fresh(id),
    ...raw,
    schemaVersion: 14,
    deviceId: id,
    currentDay: Math.min(
      mobileCurriculum.length,
      Math.max(1, Number.isFinite(currentDay) ? Math.round(currentDay) : 1),
    ),
    streak: Math.max(0, Number(raw.streak ?? 0) || 0),
    weeklyGoal: Math.min(7, Math.max(1, Number(raw.weeklyGoal ?? 3) || 3)),
  } as Progress;
}
const validCode = (v: string) => /^[A-Za-z0-9+/=]{20,2000000}$/.test(v.trim());
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
function readStoredJson(key: string, fallback: unknown) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}
function encodeProgress(value: Progress) {
  const savedState = typeof window === "undefined"
    ? {}
    : {
        checkpoints: readStoredJson("english-coach-checkpoints-v1", {}),
        selection: readStoredJson("english-coach-selection-v1", {}),
        view: localStorage.getItem("english-coach-view-v1"),
        readingDraft: readStoredJson("english-coach-reading-draft-v1", null),
        supplementarySeen: readStoredJson("english-coach-supplementary-seen-v1", {}),
      };
  const bytes = new TextEncoder().encode(
    JSON.stringify({ backupVersion: 2, progress: value, state: savedState }),
  );
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}
function decodeProgress(value: string): { progress: Progress; state?: Record<string, unknown> } {
  const binary = atob(value.trim()),
    bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0)),
    parsed = JSON.parse(new TextDecoder().decode(bytes)),
    progress = isRecord(parsed) && parsed.backupVersion === 2 ? parsed.progress : parsed,
    state = isRecord(parsed) && parsed.backupVersion === 2 && isRecord(parsed.state) ? parsed.state : undefined;
  if (
    !isRecord(progress) ||
    !isRecord(progress.days) ||
    !isRecord(progress.activity)
  )
    throw new Error("invalid");
  return { progress: progress as Progress, state };
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
      preferredAccent = getAudioAccent(),
      voice =
        voices.find((v) => v.lang.startsWith(preferredAccent)) ??
        voices.find((v) => /^en-GB/i.test(v.lang)) ??
        voices.find((v) => /^en-US/i.test(v.lang)) ??
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
    [listeningMode, setListeningMode] = useState<"assist" | "natural" | "summary">(
      unit.cefr === "A1" || unit.cefr === "A2" ? "assist" : "natural",
    ),
    [summary, setSummary] = useState(""),
    [summaryChecked, setSummaryChecked] = useState(false),
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
      <div className="listeningModes" aria-label="Modalità di ascolto">
        {([
          ["assist", "1 · Con aiuto"],
          ["natural", "2 · Naturale"],
          ["summary", "3 · Riassumi"],
        ] as const).map(([mode, label]) => (
          <button
            type="button"
            key={mode}
            className={listeningMode === mode ? "active" : ""}
            aria-pressed={listeningMode === mode}
            onClick={() => {
              stop();
              setListeningMode(mode);
              setTranscriptOpen(mode === "assist");
              setRate(mode === "assist" ? 0.8 : 1);
              setSummaryChecked(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
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
                  : "Ascolta"}
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
      {listeningMode === "summary" && (
        <section className="listeningSummary">
          <label>
            Scrivi il significato generale in inglese o in italiano
            <textarea value={summary} onChange={(event) => { setSummary(event.target.value); setSummaryChecked(false); }} placeholder="Che cosa sta succedendo? Qual è il punto principale?" />
          </label>
          <button type="button" disabled={summary.trim().split(/\s+/).length < 5} onClick={() => setSummaryChecked(true)}>Controlla gli elementi riconosciuti</button>
          {summaryChecked && (() => {
            const source = [...unit.vocabulary.map((word) => word.en), ...unit.listening.transcript.toLowerCase().match(/\b[a-z]{6,}\b/g) ?? []],
              found = [...new Set(source.map((word) => word.toLowerCase()))].filter((word) => summary.toLowerCase().includes(word)).slice(0, 8);
            return <div role="status"><strong>{found.length >= 2 ? "Hai riconosciuto diversi elementi centrali." : "Hai espresso un’idea: ora confrontala con il testo."}</strong><p>{found.length ? `Parole o concetti ritrovati: ${found.join(", ")}.` : "Riapri il testo sincronizzato e cerca soggetto, azione e risultato."}</p></div>;
          })()}
        </section>
      )}
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
export function finalQuizFor(unit: MobileUnit): Choice[] {
  const optionCount = optionCountForLevel(unit.cefr),
    nearbyAnswers = unit.writing.cloze.flatMap((item) => item.answers),
    contextualCloze = unit.writing.cloze.flatMap((item) => {
      const built = tryOptionsFor(item.answers[0], plausibleClozeDistractors(item.answers[0], nearbyAnswers), optionCount);
      return built ? [{ prompt: item.prompt, ...built, explanationIt: `${item.hintIt} La risposta corretta è «${item.answers[0]}».` }] : [];
    }).slice(0, 2);
  return [
    ...unit.quickCheck.slice(0, 2),
    ...contextualCloze,
    ...unit.listening.questions.slice(0, 2),
  ].slice(0, 6);
}
export function listeningQuizFor(unit: MobileUnit): Choice[] {
  const heard = unit.listening.transcript
      .split(/(?<=[.!?])\s+/)
      .filter((x) => x.trim().length > 8),
    optionCount = optionCountForLevel(unit.cefr);
  const recognition = heard
    .slice(0, 2)
    .flatMap((sentence) => {
      const built = tryOptionsFor(sentence, meaningMistakes(sentence), optionCount);
      return built ? [{ prompt: "Quale frase hai sentito nel dialogo?", ...built, explanationIt: `Nel dialogo viene detto: “${sentence}”` }] : [];
    });
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
  if (saved === "placement" && sessionStorage.getItem("english-coach-placement-draft-v2")) return "placement";
  const hasStarted = Boolean(
    localStorage.getItem("english-coach-onboarding-v1") ||
      localStorage.getItem("english-coach-selection-v1"),
  );
  if (!hasStarted) return "start";
  if (saved === "lesson" && loadLatestCheckpoint()) return "lesson";
  if (saved === "reading" && localStorage.getItem("english-coach-reading-draft-v1")) return "reading";
  return saved === "start" || saved === "path" || saved === "topics" || saved === "progress" || saved === "errors" ? saved : "home";
}
export function normalizeCheckpoint(value: unknown): { unit: MobileUnit; checkpoint: SessionCheckpoint } | null {
  if (!isRecord(value) || typeof value.unitId !== "string") return null;
  const unit = mobileCurriculum.find((entry) => entry.id === value.unitId);
  if (!unit) return null;
  const allowedPhases: Phase[] = [...stages, "bonus", "complete"],
    phase = allowedPhases.includes(value.phase as Phase)
      ? (value.phase as Phase)
      : "grammar",
    bonusQuiz = Array.isArray(value.bonusQuiz) ? (value.bonusQuiz as Choice[]) : [],
    counts: Record<Phase, number> = {
      grammar: 1,
      examples: unit.grammar.examples.length,
      vocabulary: unit.vocabulary.length,
      cloze: practiceFor(unit).length,
      writing: 1,
      listening: listeningQuizFor(unit).length,
      speaking: 1,
      quiz: finalQuizFor(unit).length,
      bonus: Math.max(1, bonusQuiz.length),
      complete: 1,
    },
    rawItem = Number(value.item ?? 0),
    item = Math.min(
      Math.max(0, counts[phase] - 1),
      Math.max(0, Number.isFinite(rawItem) ? Math.round(rawItem) : 0),
    ),
    rawPoints = isRecord(value.points) ? value.points : {},
    sessionMinutes = value.sessionMinutes === 5 || value.sessionMinutes === 15 || value.sessionMinutes === 30 ? value.sessionMinutes : null;
  return {
    unit,
    checkpoint: {
      unitId: unit.id,
      phase,
      item,
      writing: typeof value.writing === "string" ? value.writing : "",
      points: {
        yes: Math.max(0, Number(rawPoints.yes ?? 0) || 0),
        all: Math.max(0, Number(rawPoints.all ?? 0) || 0),
      },
      input: typeof value.input === "string" ? value.input : "",
      checked: typeof value.checked === "boolean" ? value.checked : null,
      answered: typeof value.answered === "boolean" ? value.answered : null,
      dictation: typeof value.dictation === "string" ? value.dictation : "",
      dictationChecked: Boolean(value.dictationChecked),
      spoken: typeof value.spoken === "string" ? value.spoken : "",
      writingNotes: Array.isArray(value.writingNotes) ? value.writingNotes.filter(note => typeof note === "string") : null,
      writingSuggestion: typeof value.writingSuggestion === "string" ? value.writingSuggestion : "",
      sessionMinutes,
      bonusMinutes: Math.max(0, Number(value.bonusMinutes ?? 0) || 0),
      bonusQuiz,
      bonusDone: Boolean(value.bonusDone),
      startedAt: Number.isFinite(Number(value.startedAt)) ? Number(value.startedAt) : Date.now(),
      updatedAt: typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt)) ? value.updatedAt : new Date().toISOString(),
    },
  };
}
function loadLatestCheckpoint(): { unit: MobileUnit; checkpoint: SessionCheckpoint } | null {
  if (typeof window === "undefined") return null;
  try {
    const all = Object.values(JSON.parse(localStorage.getItem("english-coach-checkpoints-v1") || "{}") as Record<string, SessionCheckpoint>);
    const latest = all.map(normalizeCheckpoint).filter((entry): entry is { unit: MobileUnit; checkpoint: SessionCheckpoint } => Boolean(entry)).sort((a, b) => Date.parse(b.checkpoint.updatedAt) - Date.parse(a.checkpoint.updatedAt))[0];
    return latest ?? null;
  } catch { return null; }
}
type ReadingDraft = { id: string; step: "text" | "questions" | "result"; answers: Record<number, number>; questionIndex: number };
function loadReadingDraft(): ReadingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem("english-coach-reading-draft-v1") || "null") as ReadingDraft | null;
    return value && readingPassages.some((passage) => passage.id === value.id) ? value : null;
  } catch { return null; }
}
export default function Home() {
  const initialSession = useMemo(loadLatestCheckpoint, []),
    initialReading = useMemo(loadReadingDraft, []);
  const [view, setView] = useState<View>(initialMainView),
    [progress, setProgress] = useState<Progress | null>(null),
    [unit, setUnit] = useState<MobileUnit>(initialSession?.unit ?? mobileCurriculum[0]),
    [phase, setPhase] = useState<Phase>(initialSession?.checkpoint.phase ?? "grammar"),
    [item, setItem] = useState(initialSession?.checkpoint.item ?? 0),
    [input, setInput] = useState(initialSession?.checkpoint.input ?? ""),
    [checked, setChecked] = useState<boolean | null>(initialSession?.checkpoint.checked ?? null),
    [writing, setWriting] = useState(initialSession?.checkpoint.writing ?? ""),
    [answered, setAnswered] = useState<boolean | null>(initialSession?.checkpoint.answered ?? null),
    [points, setPoints] = useState(initialSession?.checkpoint.points ?? { yes: 0, all: 0 }),
    [spoken, setSpoken] = useState(initialSession?.checkpoint.spoken ?? ""),
    [recording, setRecording] = useState(false),
    [recordingSeconds, setRecordingSeconds] = useState(0),
    [bonusMinutes, setBonusMinutes] = useState(initialSession?.checkpoint.bonusMinutes ?? 0),
    [bonusQuiz, setBonusQuiz] = useState<Choice[]>(initialSession?.checkpoint.bonusQuiz ?? []),
    [bonusDone, setBonusDone] = useState(initialSession?.checkpoint.bonusDone ?? false),
    [sync, setSync] = useState<"saved" | "saving" | "offline">("saved"),
    [recover, setRecover] = useState(""),
    [recoverMsg, setRecoverMsg] = useState(""),
    [resumePrompt, setResumePrompt] = useState<{
      unit: MobileUnit;
      checkpoint: SessionCheckpoint;
    } | null>(null),
    [resetConfirm, setResetConfirm] = useState(false),
    [reading, setReading] = useState<ReadingPassage>(readingPassages.find((passage) => passage.id === initialReading?.id) ?? readingPassages[0]),
    [readingStep, setReadingStep] = useState<"text" | "questions" | "result">(
      initialReading?.step ?? "text",
    ),
    [readingAnswers, setReadingAnswers] = useState<Record<number, number>>(initialReading?.answers ?? {}),
    [readingQuestionIndex, setReadingQuestionIndex] = useState(initialReading?.questionIndex ?? 0),
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
  const started = useRef(initialSession?.checkpoint.startedAt ?? Date.now());
  const [selectedLevel, setSelectedLevel] = useState<Cefr>("A1"),
    [selectedLessonId, setSelectedLessonId] = useState(mobileCurriculum[0].id),
    [selectedTheme, setSelectedTheme] = useState<ThemeId>("food"),
    [themeSearch, setThemeSearch] = useState(""),
    [audioAccent, setAudioAccent] = useState<AudioAccent>(getAudioAccent),
    [audioRate, setAudioRate] = useState<AudioRate>(getAudioRate),
    [errorSearch, setErrorSearch] = useState(""),
    [errorKind, setErrorKind] = useState<ReviewKind | "Tutti">("Tutti"),
    [errorLevel, setErrorLevel] = useState<Cefr | "Tutti">("Tutti"),
    [errorStatus, setErrorStatus] = useState<
      SmartReviewItem["status"] | "Tutti"
    >("Tutti"),
    [errorPeriod, setErrorPeriod] = useState<"Tutti" | "30" | "90">("Tutti"),
    [adaptiveOpen, setAdaptiveOpen] = useState(
      () => localStorage.getItem("english-coach-adaptive-open") === "true",
    ),
    [freePathOpen, setFreePathOpen] = useState(
      () => localStorage.getItem("english-coach-free-open") !== "false",
    ),
    [onboardingComplete, setOnboardingComplete] = useState(
      () =>
        typeof window !== "undefined" &&
        Boolean(
          localStorage.getItem("english-coach-onboarding-v1") ||
            localStorage.getItem("english-coach-selection-v1"),
        ),
    ),
    [sessionMinutes, setSessionMinutes] = useState<5 | 15 | 30 | null>(initialSession?.checkpoint.sessionMinutes ?? null),
    [learningGoal, setLearningGoal] = useState("Conversazione quotidiana"),
    [colorMode, setColorMode] = useState<"light" | "dark">(
      () =>
        (localStorage.getItem("english-coach-color-mode") as "light" | "dark") ||
        "light",
    ),
    [textSize, setTextSize] = useState<"normal" | "large">(
      () =>
        (localStorage.getItem("english-coach-text-size") as "normal" | "large") ||
        "normal",
    ),
    [writingNotes, setWritingNotes] = useState<string[] | null>(initialSession?.checkpoint.writingNotes ?? null),
    [writingSuggestion, setWritingSuggestion] = useState(initialSession?.checkpoint.writingSuggestion ?? ""),
    [dictation, setDictation] = useState(initialSession?.checkpoint.dictation ?? ""),
    [dictationChecked, setDictationChecked] = useState(initialSession?.checkpoint.dictationChecked ?? false),
    [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  const themeResultsRef = useRef<HTMLElement | null>(null),
    writingRef = useRef<HTMLTextAreaElement | null>(null),
    finishingRef = useRef(false);
  const save = async (p: Progress) => {
    setSync("saving");
    localStorage.setItem("english-coach-progress-v2", JSON.stringify(p));
    setSync("offline");
  };

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const id = deviceId();
    let p = fresh(id);
    try {
      const raw = JSON.parse(
        localStorage.getItem("english-coach-progress-v2") || "{}",
      );
      p = normalizeProgress(raw, id);
    } catch {}
    setProgress(p);
    setLearningGoal(p.learningGoal ?? "Conversazione quotidiana");
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
    setSync("offline");
  }, []);
  useEffect(() => {
    if (!progress || !onboardingComplete) return;
    localStorage.setItem(
      "english-coach-selection-v1",
      JSON.stringify({
        level: selectedLevel,
        lessonId: selectedLessonId,
        theme: selectedTheme,
      }),
    );
  }, [progress, selectedLevel, selectedLessonId, selectedTheme, onboardingComplete]);
  useEffect(() => {
    if (["start", "home", "path", "topics", "progress", "errors", "lesson", "reading", "placement"].includes(view))
      localStorage.setItem("english-coach-view-v1", view);
  }, [view]);
  useEffect(() => {
    if (!progress || !["start", "home", "path", "topics", "progress"].includes(view)) return;
    const key = `english-coach-scroll-${view}`;
    const restore = window.setTimeout(() => {
      const saved = Number(localStorage.getItem(key) ?? 0);
      if (Number.isFinite(saved) && saved > 0) window.scrollTo({ top: saved, behavior: "auto" });
    }, 80);
    let timer: number | undefined;
    const remember = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(
        () => localStorage.setItem(key, String(Math.round(window.scrollY))),
        120,
      );
    };
    window.addEventListener("scroll", remember, { passive: true });
    return () => {
      window.clearTimeout(restore);
      if (timer) window.clearTimeout(timer);
      localStorage.setItem(key, String(Math.round(window.scrollY)));
      window.removeEventListener("scroll", remember);
    };
  }, [view, Boolean(progress)]);
  useEffect(() => {
    if (view !== "topics" || themeSupportsLevel(selectedTheme, selectedLevel))
      return;
    const first = themes.find((theme) =>
      themeSupportsLevel(theme.id, selectedLevel),
    );
    if (first) setSelectedTheme(first.id);
  }, [view, selectedLevel, selectedTheme]);
  useEffect(() => {
    if (view !== "lesson" || phase === "complete")
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
      checked,
      answered,
      dictation,
      dictationChecked,
      spoken,
      writingNotes,
      writingSuggestion,
      sessionMinutes,
      bonusMinutes,
      bonusQuiz,
      bonusDone,
      startedAt: started.current,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify(all));
  }, [view, unit.id, phase, item, writing, points, input, checked, answered, dictation, dictationChecked, spoken, writingNotes, writingSuggestion, sessionMinutes, bonusMinutes, bonusQuiz, bonusDone]);
  useEffect(() => {
    if (view !== "reading") return;
    localStorage.setItem("english-coach-reading-draft-v1", JSON.stringify({ id: reading.id, step: readingStep, answers: readingAnswers, questionIndex: readingQuestionIndex } satisfies ReadingDraft));
  }, [view, reading.id, readingStep, readingAnswers, readingQuestionIndex]);
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
  useEffect(() => {
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (resetConfirm) setResetConfirm(false);
      else if (resumePrompt) setResumePrompt(null);
    };
    window.addEventListener("keydown", closeOverlay);
    return () => window.removeEventListener("keydown", closeOverlay);
  }, [resetConfirm, resumePrompt]);
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
    listeningSegments = unit.listening.transcript
      .split(/(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .slice(0, 8),
    dictationScore = dictationChecked
      ? similarity(unit.listening.transcript, dictation)
      : 0,
    writingParts = writingSuggestion
      ? pronunciationDiff(writingSuggestion, writing)
      : [];
  const playWord = (word: string, rate = 0.85) => {
    const fallback = () => {
      if (typeof speechSynthesis === "undefined") return;
      const voices = speechSynthesis
          .getVoices()
          .filter((v) => /^en(?:-|$)/i.test(v.lang)),
        preferredAccent = getAudioAccent(),
        voice =
          voices.find((v) => v.lang.startsWith(preferredAccent)) ??
          voices.find((v) => /^en-GB/i.test(v.lang)) ??
          voices.find((v) => /^en-US/i.test(v.lang)) ??
          voices[0];
      if (!voice) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = rate;
      speechSynthesis.speak(utterance);
    };
    const audio = new Audio(
      `${import.meta.env.BASE_URL}audio/words/${audioSlug(word)}.wav`,
    );
    audio.onerror = fallback;
    audio.playbackRate = rate;
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
    setChecked(checkpoint?.checked ?? null);
    setAnswered(checkpoint?.answered ?? null);
    setSpoken(checkpoint?.spoken ?? "");
    setDictation(checkpoint?.dictation ?? "");
    setDictationChecked(checkpoint?.dictationChecked ?? false);
    setWriting(checkpoint?.writing ?? progress?.days[u.day]?.writing ?? "");
    setWritingNotes(checkpoint?.writingNotes ?? null);
    setWritingSuggestion(checkpoint?.writingSuggestion ?? "");
    setPoints(checkpoint?.points ?? { yes: 0, all: 0 });
    setBonusQuiz(checkpoint?.bonusQuiz ?? []);
    setBonusMinutes(checkpoint?.bonusMinutes ?? 0);
    setBonusDone(checkpoint?.bonusDone ?? false);
    finishingRef.current = false;
    started.current = checkpoint?.startedAt ?? Date.now();
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
      const saved = JSON.parse(
        localStorage.getItem("english-coach-checkpoints-v1") || "{}",
      )[u.id];
      checkpoint = normalizeCheckpoint(saved)?.checkpoint;
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
    setProgress((current) => {
      if (!current) return current;
      const updated = { ...current, learningGoal };
      void save(updated);
      return updated;
    });
    setOnboardingComplete(true);
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
    sourceOptions: string[] = [],
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
          options:
            sourceOptions.length >= 3 && sourceOptions.includes(answer)
              ? sourceOptions
              : previous?.options,
          attempts: [
            ...(previous?.attempts ?? []),
            {
              at: now,
              givenAnswer,
              correct: false,
              options:
                sourceOptions.length >= 3 && sourceOptions.includes(answer)
                  ? sourceOptions
                  : undefined,
            },
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
        data.options,
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
    if (!progress || finishingRef.current) return;
    finishingRef.current = true;
    const score = points.all ? Math.round((points.yes / points.all) * 100) : 0,
      today = dateKey(),
      y = new Date();
    y.setDate(y.getDate() - 1);
    const streak =
        progress.streakPausedUntil && progress.streakPausedUntil >= today
          ? Math.max(1, progress.streak)
          : progress.lastStudyDate === today
          ? progress.streak
          : progress.lastStudyDate === dateKey(y)
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
        "Domanda saltata o risposta non corretta",
        question.options,
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
        "Domanda saltata o risposta non corretta",
        question.options,
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
        "Domanda saltata o risposta non corretta",
        question.options,
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
      { corrected, notes } = analyzeLocalWriting(t, unit.grammar.formulas[0]?.trim());
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
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setSpoken(
        "Permesso microfono negato. Abilitalo nelle impostazioni del browser.",
      );
      return;
    }
    let recorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];
    if ("MediaRecorder" in window) {
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        if (!chunks.length) return;
        const nextUrl = URL.createObjectURL(new Blob(chunks, { type: recorder?.mimeType || "audio/webm" }));
        setRecordedAudioUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return nextUrl;
        });
      };
      recorder.start();
    }
    const finishRecording = () => {
      if (recorder?.state === "recording") recorder.stop();
      stream.getTracks().forEach((track) => track.stop());
    };
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
      finishRecording();
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
      finishRecording();
      if (!heard)
        setSpoken(
          "Non ho ricevuto una trascrizione. Riprova con Chrome o Edge e parla dopo il segnale.",
        );
    };
    setSpoken("");
    setRecordedAudioUrl("");
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
  const queueThemeMistake = (pack: ThemePack, question: Choice, givenAnswer: string) => {
    setProgress((current) => {
      if (!current) return current;
      const kind: ReviewKind = /significa|parola|verb/i.test(question.prompt)
          ? "Vocabolario"
          : "Ascolto",
        id = reviewKey(pack.id, kind, question.prompt),
        previous = current.smartReview?.[id],
        now = new Date().toISOString(),
        entry: SmartReviewItem = {
          id,
          unitId: pack.id,
          unitTitle: pack.title,
          level: pack.level,
          kind,
          prompt: question.prompt,
          answer: question.options[question.answer],
          explanation: question.explanationIt,
          dueAt: dateKey(),
          step: 0,
          mastered: false,
          givenAnswer,
          wrongCount: (previous?.wrongCount ?? 0) + 1,
          correctStreak: 0,
          lastAttemptAt: now,
          status: previous ? "Da ripassare" : "Nuovo",
          options: question.options,
          attempts: [...(previous?.attempts ?? []), { at: now, givenAnswer, correct: false, options: question.options }].slice(-30),
        },
        updated = { ...current, smartReview: { ...(current.smartReview ?? {}), [id]: entry } };
      void save(updated);
      return updated;
    });
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
        options: question.options,
        attempts: [
          ...(old?.attempts ?? []),
          { at: now, givenAnswer, correct: false, options: question.options },
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
    localStorage.removeItem("english-coach-reading-draft-v1");
    localStorage.removeItem("english-coach-view-v1");
    localStorage.removeItem("english-coach-supplementary-seen-v1");
    Object.keys(localStorage)
      .filter((key) => key.startsWith("english-coach-scroll-"))
      .forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem("english-coach-placement-draft-v2");
    setSelectedLevel("A1");
    setSelectedLessonId(mobileCurriculum[0].id);
    setOnboardingComplete(false);
    setProgress(clean);
    await save(clean);
    setResetConfirm(false);
    setView("start");
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
        restored = normalizeProgress(imported.progress, deviceId()),
        state = imported.state;
      if (state) {
        if (isRecord(state.checkpoints))
          localStorage.setItem("english-coach-checkpoints-v1", JSON.stringify(state.checkpoints));
        if (isRecord(state.selection))
          localStorage.setItem("english-coach-selection-v1", JSON.stringify(state.selection));
        if (typeof state.view === "string" && ["home", "path", "topics", "progress", "errors", "lesson", "reading"].includes(state.view))
          localStorage.setItem("english-coach-view-v1", state.view);
        if (isRecord(state.readingDraft))
          localStorage.setItem("english-coach-reading-draft-v1", JSON.stringify(state.readingDraft));
        if (isRecord(state.supplementarySeen))
          localStorage.setItem("english-coach-supplementary-seen-v1", JSON.stringify(state.supplementarySeen));
      }
      setProgress(restored);
      await save(restored);
      setRecover("");
      setRecoverMsg("Backup ripristinato: progressi e attività in corso sono disponibili su questo dispositivo.");
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
      .sort((a, b) => reviewPriority(b) - reviewPriority(a) || a.dueAt.localeCompare(b.dueAt)),
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
    .filter((review) => {
      if (errorPeriod === "Tutti") return true;
      const stamp = review.lastAttemptAt ?? `${review.dueAt}T12:00:00`;
      const age = Date.now() - new Date(stamp).getTime();
      return age <= Number(errorPeriod) * 86400000;
    })
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
      const lessons = mobileCurriculum
          .filter((candidate) => candidate.cefr === selectedLevel)
          .sort((a, b) => a.day - b.day),
        next = lessons.find((candidate) => !progress.days[candidate.day]),
        selected = lessons.find((candidate) => candidate.id === selectedLessonId),
        selectedRating = selected
          ? progress.lessonFeedback?.[selected.id]?.rating
          : undefined;
      if (minutes <= 15 && selected && selectedRating === "hard") return selected;
      return next ?? selected ?? lessons[0];
    },
    adaptiveOptions = ([5, 15, 30] as const).map((minutes) => ({
      minutes,
      lesson: lessonForTime(minutes),
      detail:
        progress.lessonFeedback?.[selectedLessonId]?.rating === "hard" &&
        minutes <= 15
          ? "Rinforzo guidato sui punti difficili"
          : progress.lessonFeedback?.[selectedLessonId]?.rating === "easy"
            ? "Passo successivo con attività nuove"
          : minutes === 5
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
    totalMinutes = Object.values(progress.activity).reduce(
      (sum, day) => sum + day.minutes,
      0,
    ),
    monthPrefix = dateKey().slice(0, 7),
    monthActivity = Object.entries(progress.activity).filter(([key]) =>
      key.startsWith(monthPrefix),
    ),
    monthlyMinutes = monthActivity.reduce((sum, [, day]) => sum + day.minutes, 0),
    monthlyActive = monthActivity.length,
    selectedLevelUnits = mobileCurriculum.filter(
      (candidate) => candidate.cefr === selectedLevel,
    ),
    completedLevelUnits = selectedLevelUnits.filter(
      (candidate) => progress.days[candidate.day],
    ),
    selectedPosition = Math.max(
      1,
      selectedLevelUnits.findIndex(
        (candidate) => candidate.id === selectedLessonId,
      ) + 1,
    ),
    sublevel = `${selectedLevel}.${Math.min(3, Math.ceil(selectedPosition / 4))}`,
    acquiredWords = new Set(
      completedLevelUnits.flatMap((candidate) =>
        candidate.vocabulary.map((word) => word.en.toLowerCase()),
      ),
    ).size,
    lastExam = Object.entries(progress.reviews ?? {})
      .filter(([id]) => id.includes("-review-12-"))
      .sort((a, b) => b[1].completedAt.localeCompare(a[1].completedAt))[0],
    nextActivity = dueSmartReviews.length
      ? `${dueSmartReviews.length} elementi nel ripasso di oggi`
      : lessonForTime(30).title,
    setWeeklyGoal = (goal: number) => {
      const updated = { ...progress, weeklyGoal: goal };
      setProgress(updated);
      void save(updated);
    },
    pauseStreak = () => {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      const updated = { ...progress, streakPausedUntil: dateKey(until) };
      setProgress(updated);
      void save(updated);
    };
  const rateLesson = (rating: "easy" | "right" | "hard") => {
    const updated: Progress = {
      ...progress,
      lessonFeedback: {
        ...(progress.lessonFeedback ?? {}),
        [unit.id]: {
          rating,
          at: new Date().toISOString(),
          score: points.all ? Math.round((points.yes / points.all) * 100) : 0,
        },
      },
    };
    setProgress(updated);
    void save(updated);
  };
  const startRecovery = (count = 10, candidates: SmartReviewItem[] = smartReviews) => {
    const open = shuffled(candidates.filter((review) => !review.mastered)),
      quiz = open.flatMap((review) => {
        const source = mobileCurriculum.find((candidate) => candidate.id === review.unitId),
          authored = source
            ? [
                ...source.quickCheck,
                ...listeningQuizFor(source),
                ...finalQuizFor(source),
                ...supplementaryBankFor(source),
              ]
            : [],
          exact = authored.find(
            (question) =>
              question.options[question.answer] === review.answer &&
              question.prompt.trim().toLocaleLowerCase("it") === review.prompt.trim().toLocaleLowerCase("it"),
          ),
          stored = review.options?.length && review.options.includes(review.answer)
            ? { options: review.options, answer: review.options.indexOf(review.answer) }
            : null,
          generated = tryOptionsFor(
            review.answer,
            [
              ...meaningMistakes(review.answer),
              ...plausibleClozeDistractors(review.answer),
              ...(review.givenAnswer && !/saltata|non registrata|non corretta/i.test(review.givenAnswer)
                ? [review.givenAnswer]
                : []),
            ],
            optionCountForLevel(review.level),
          ),
          choice = stored ?? (exact ? { options: exact.options, answer: exact.answer } : generated);
        if (!choice) return [];
        const correct = choice.options[choice.answer], options = shuffled(choice.options);
        return [{ review, options, answer: options.indexOf(correct) }];
      }).slice(0, count);
    if (!quiz.length) {
      setView("errors");
      scrollTo(0, 0);
      return;
    }
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
        delays = [1, 3, 7, 14, 30],
        step = remembered ? previous.step + 1 : 0,
        mastered = remembered && previous.step >= delays.length,
        now = new Date().toISOString(),
        nextStreak = remembered ? (previous.correctStreak ?? 0) + 1 : 0,
        item: SmartReviewItem = {
          ...previous,
          step,
          mastered,
          correctStreak: nextStreak,
          wrongCount: (previous.wrongCount ?? 0) + (remembered ? 0 : 1),
          lastAttemptAt: now,
          attempts: [
            ...(previous.attempts ?? []),
            {
              at: now,
              givenAnswer: choice < 0 ? "Domanda saltata" : question.options[choice],
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
  const learningSkills = buildSkillProfile(progress, selectedLevel, mobileCurriculum),
    learningClusters = buildErrorClusters(progress),
    weakestLearningSkill = learningSkills.slice().sort((a, b) => a.score - b.score)[0],
    nextLearningUnit = lessonForTime(30),
    levelLearningUnits = mobileCurriculum.filter((candidate) => candidate.cefr === selectedLevel),
    nextLearningIndex = Math.max(0, levelLearningUnits.findIndex((candidate) => candidate.id === nextLearningUnit.id)),
    prerequisiteUnit = levelLearningUnits[Math.max(0, nextLearningIndex - 1)] ?? nextLearningUnit,
    prerequisiteRequired = weakestLearningSkill.score < 45 && nextLearningIndex > 0,
    dailyFocus = dueSmartReviews.length > 0
      ? {
          tone: "dailyReview",
          eyebrow: "Ripasso pronto",
          title: dueSmartReviews.length === 1 ? "Rinforza un punto importante" : `Rinforza ${dueSmartReviews.length} punti importanti`,
          detail: `Focus: ${dueSmartReviews[0]?.kind ?? weakestLearningSkill.skill}. Riparti dagli errori utili senza rifare tutta la lezione.`,
          meta: "10 min",
          action: "Inizia il ripasso",
          run: openSmartReview,
        }
      : prerequisiteRequired
        ? {
            tone: "dailySupport",
            eyebrow: "Passo consigliato",
            title: `Consolida ${prerequisiteUnit.title}`,
            detail: `Focus: ${weakestLearningSkill.skill}. Una sessione breve prepara il passaggio a ${nextLearningUnit.title}.`,
            meta: "15 min",
            action: "Rinforza la base",
            run: () => open(prerequisiteUnit, 15),
          }
        : {
            tone: "dailyContinue",
            eyebrow: completed > 0 ? "Continua il percorso" : "Il tuo primo passo",
            title: nextLearningUnit.title,
            detail: `Livello ${selectedLevel}. Regola, pratica, ascolto e produzione in una sessione guidata.`,
            meta: "15 min",
            action: completed > 0 ? "Continua da qui" : "Inizia la sessione",
            run: () => open(nextLearningUnit, 15),
          },
    updateLearningGoal = (goal: string) => {
      const updated = { ...progress, learningGoal: goal };
      setLearningGoal(goal);
      setProgress(updated);
      void save(updated);
    },
    savePhrase = (en: string, it: string | undefined, source: string) => {
      const normalized = en.trim().toLowerCase(),
        existing = (progress.savedPhrases ?? []).find((phrase) => phrase.en.trim().toLowerCase() === normalized);
      if (existing) return;
      const phrase = { id: `phrase-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, en: en.trim(), it, source, savedAt: new Date().toISOString() },
        updated = { ...progress, savedPhrases: [...(progress.savedPhrases ?? []), phrase].slice(-200) };
      setProgress(updated);
      void save(updated);
    },
    removePhrase = (id: string) => {
      const updated = { ...progress, savedPhrases: (progress.savedPhrases ?? []).filter((phrase) => phrase.id !== id) };
      setProgress(updated);
      void save(updated);
    },
    completeMonthlyCheck = (score: number) => {
      const updated = { ...progress, monthlyChecks: { ...(progress.monthlyChecks ?? {}), [dateKey().slice(0, 7)]: { score, completedAt: new Date().toISOString() } } };
      setProgress(updated);
      void save(updated);
    },
    completeWeeklyChallenge = (response: string) => {
      const updated = { ...progress, weeklyChallenges: { ...(progress.weeklyChallenges ?? {}), [weekKey()]: { response, completedAt: new Date().toISOString() } } };
      setProgress(updated);
      void save(updated);
    },
    startMicroSession = () => {
      const openReviews = smartReviews.filter((review) => !review.mastered);
      if (openReviews.length) startRecovery(Math.min(4, openReviews.length));
      else open(lessonForTime(5), 5);
    },
    startLearningReview = () => {
      if (dueSmartReviews.length) openSmartReview();
      else if (smartReviews.some((review) => !review.mastered)) startRecovery(6);
      else open(lessonForTime(15), 15);
    },
    startLearningReading = () => {
      const passage = readingPassages.find((entry) => entry.level === selectedLevel && !progress.reading?.[entry.id]) ?? readingPassages.find((entry) => entry.level === selectedLevel)!;
      openReading(passage);
    },
    openLearningSimulation = () => {
      setSelectedTheme("skills");
      setView("topics");
      scrollTo(0, 0);
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
    <main className={`app mode-${colorMode} text-${textSize}`}>
      <header>
        <button className="brand" onClick={() => setView("home")}>
          <span className="logo">EC</span>
          <span>
            <strong>English Coach</strong>
            <small>Versione {APP_VERSION} · Un passo al giorno</small>
          </span>
        </button>
        <span className={`sync ${sync}`} role="status" aria-live="polite">
          {sync === "saving" ? "Salvataggio…" : "Salvato qui"}
        </span>
      </header>
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
                autoFocus
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
                autoFocus
                className="primary"
                onClick={() => setResetConfirm(false)}
              >
                No, conserva i dati
              </button>
            </div>
          </section>
        </div>
      )}
      {view === "start" && (
        <div className={`screen firstStepsScreen ${onboardingComplete ? "returning" : "newLearner"}`}>
          <section className="firstStepsHero" aria-labelledby="first-steps-title">
            <span className="eyebrow">{onboardingComplete ? "Il tuo punto di partenza" : "Primi passi"}</span>
            <h1 id="first-steps-title">{onboardingComplete ? `Continua dal livello ${selectedLevel}` : "Inizia dal livello giusto"}</h1>
            <p>
              {onboardingComplete
                ? "Il livello resta memorizzato. Cambialo soltanto se vuoi allenarti da un punto diverso."
                : "Se è la prima volta, fai la valutazione. Se conosci già il tuo livello, selezionalo e comincia subito."}
            </p>
          </section>
          <section className="firstStepsCard placementStartCard">
            <span className="stepNumber">{onboardingComplete ? "?" : "1"}</span>
            <div>
              <span className="eyebrow">{onboardingComplete ? "Facoltativo" : "Scelta consigliata"}</span>
              <h2>{onboardingComplete ? "Vuoi rivalutare il livello?" : "Valuta il tuo livello"}</h2>
              <p>
                {onboardingComplete
                  ? "Ripeti il test soltanto se pensi che il livello memorizzato non rappresenti più la tua preparazione."
                  : "30 domande progressive di grammatica, lessico, ascolto e comprensione per proporti un punto di partenza attendibile."}
              </p>
              <button type="button" className="firstStepsPrimary" onClick={() => setView("placement")}>
                <span><strong>{onboardingComplete ? "Rivaluta il livello" : "Inizia il test"}</strong><small>Circa 15 minuti</small></span>
                <b>→</b>
              </button>
            </div>
          </section>
          <section className="firstStepsCard knownLevelCard">
            <span className="stepNumber">{onboardingComplete ? "✓" : "2"}</span>
            <div>
              <span className="eyebrow">{onboardingComplete ? "Livello memorizzato" : "Partenza diretta"}</span>
              <h2>{onboardingComplete ? `Il tuo livello è ${selectedLevel}` : "Conosco già il mio livello"}</h2>
              <p>Scegli il livello che vuoi allenare. Potrai cambiarlo in ogni momento.</p>
              <div className="firstLevelButtons" aria-label="Scegli il livello iniziale">
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={selectedLevel === level ? "active" : ""}
                    aria-pressed={selectedLevel === level}
                    onClick={() => chooseLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <label className="firstGoal">
                Il tuo obiettivo
                <select value={learningGoal} onChange={(event) => setLearningGoal(event.target.value)}>
                  <option>Conversazione quotidiana</option>
                  <option>Viaggi e situazioni reali</option>
                  <option>Inglese per il lavoro</option>
                  <option>Grammatica e certificazioni</option>
                  <option>Inglese tecnico e ricerca</option>
                </select>
              </label>
              <button type="button" className="firstStepsSecondary" onClick={() => completeOnboarding(selectedLevel)}>
                {onboardingComplete ? `Continua dal livello ${selectedLevel}` : `Inizia dal livello ${selectedLevel}`} <b>→</b>
              </button>
            </div>
          </section>
        </div>
      )}
      {view === "home" && (
        <section className={`dailyFocusHome ${dailyFocus.tone}`} aria-labelledby="daily-focus-title">
          <div className="dailyFocusHeading">
            <span className="eyebrow">{dailyFocus.eyebrow}</span>
            <details className="dailyLevelPicker">
              <summary>
                Livello <b>{selectedLevel}</b><span>Cambia</span>
              </summary>
              <div>
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={selectedLevel === level ? "active" : ""}
                    onClick={(event) => {
                      chooseLevel(level);
                      event.currentTarget.closest("details")?.removeAttribute("open");
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </details>
          </div>
          <div className="dailyFocusCopy">
            <h1 id="daily-focus-title">{dailyFocus.title}</h1>
            <p>{dailyFocus.detail}</p>
          </div>
          <div className="dailyFocusActions">
            <button type="button" className="dailyFocusStart" onClick={dailyFocus.run}>
              <span><strong>{dailyFocus.action}</strong><small>{dailyFocus.meta}</small></span>
              <b>→</b>
            </button>
            <button
              type="button"
              className="dailyFocusCustom"
              aria-expanded={adaptiveOpen}
              onClick={() => {
                const open = !adaptiveOpen;
                setAdaptiveOpen(open);
                localStorage.setItem("english-coach-adaptive-open", String(open));
              }}
            >
              {adaptiveOpen ? "Chiudi durate" : "Scegli la durata"}
            </button>
          </div>
          {dueSmartReviews.length === 0 && nextSmartReview && (
            <small className="nextReviewNote">
              Prossimo ripasso: {new Date(`${nextSmartReview.dueAt}T12:00:00`).toLocaleDateString("it-IT", { day: "numeric", month: "long" })}.
            </small>
          )}
        </section>
      )}
      {view === "home" && (
        <details
          className="homeChoice adaptiveChoice"
          open={adaptiveOpen}
          onToggle={(event) => {
            const open = event.currentTarget.open;
            setAdaptiveOpen(open);
            localStorage.setItem("english-coach-adaptive-open", String(open));
          }}
        >
          <summary>
            <span>Allenamento su misura</span>
          </summary>
          <section className="adaptiveHome">
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
                  <small>{lessonForTime(40).title} · {lessonForTime(40).minutes} min</small>
                </span>
              </button>
            </div>
          </section>
        </details>
      )}
      {view === "home" && (
        <div className="homeQuickRow homeStudyRow">
          <details className="smartStudyHome">
            <summary><span>Studio intelligente</span><b>{learningSkills.slice().sort((a, b) => a.score - b.score)[0].skill}</b></summary>
            <Deferred>
              <LearningCoach
                level={selectedLevel}
                goal={progress.learningGoal ?? learningGoal}
                skills={learningSkills}
                clusters={learningClusters}
                phrases={progress.savedPhrases ?? []}
                monthly={progress.monthlyChecks ?? {}}
                weeklyDone={Boolean(progress.weeklyChallenges?.[weekKey()])}
                prerequisite={{
                  required: prerequisiteRequired,
                  first: prerequisiteUnit.title,
                  then: nextLearningUnit.title,
                  reason: `${weakestLearningSkill.skill} è al ${weakestLearningSkill.score}%: conviene consolidare la base prima di aumentare la difficoltà.`,
                }}
                onGoal={updateLearningGoal}
                onMicro={startMicroSession}
                onNew={() => open(nextLearningUnit, 30)}
                onPrerequisite={() => open(prerequisiteUnit, 15)}
                onReview={startLearningReview}
                onReading={startLearningReading}
                onSimulation={openLearningSimulation}
                onRemovePhrase={removePhrase}
                onMonthly={completeMonthlyCheck}
                onWeekly={completeWeeklyChallenge}
              />
            </Deferred>
          </details>
        </div>
      )}
      {view === "home" && (
        <div className="screen">
          <details
            className="homeChoice freeChoice"
            open={freePathOpen}
            onToggle={(event) => {
              const open = event.currentTarget.open;
              setFreePathOpen(open);
              localStorage.setItem("english-coach-free-open", String(open));
            }}
          >
            <summary>
              <span>Percorso libero</span>
            </summary>
            <section
              className="trainingChooser"
              aria-label="Scegli il tuo allenamento"
            >
              <header className="freeChoiceIntro">
                <span>
                  <strong>Scegli liberamente</strong>
                  <small>{completed}/{mobileCurriculum.length} attività completate</small>
                </span>
              </header>
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
                              : `20 esercizi casuali dalle sessioni ${choice.end - 3}–${choice.end}`}
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
          <div className="themeSearch">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Cerca nei temi"
              placeholder="Cerca un tema"
              value={themeSearch}
              onChange={(event) => setThemeSearch(event.target.value)}
            />
            {themeSearch && (
              <button type="button" aria-label="Cancella ricerca" onClick={() => setThemeSearch("")}>
                ×
              </button>
            )}
          </div>
          <div className="themeGrid">
            {themes
              .filter((theme) => themeSupportsLevel(theme.id, selectedLevel))
              .filter((theme) =>
                `${theme.title} ${theme.description}`
                  .toLocaleLowerCase("it")
                  .includes(themeSearch.trim().toLocaleLowerCase("it")),
              )
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
          {selectedTheme === "real-life" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="Inglese nella vita reale"
                intro="Situazioni complete e progressive: trova informazioni, verifica fatti, scegli il tono e prendi decisioni con alternative credibili."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "real-life" && pack.level === selectedLevel,
                )}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
            </div>
          ) : selectedTheme === "social" ? (
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
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
            </div>
          ) : selectedTheme === "work" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <ThemePackHub
                title="Inglese professionale"
                intro="Un percorso distinto da IRA, progressivo da A1 a C1: comunicazione quotidiana, email, riunioni, gestione dei problemi e negoziazione avanzata."
                packs={themePacks.filter(
                  (pack) =>
                    pack.category === "professional" && pack.level === selectedLevel,
                )}
                saved={progress.themePacks ?? {}}
                onOpen={openThemePack}
              />
              <section className="themeResults linkedLessons">
                <div className="themeHeading">
                  <span>
                    <small>ALTRE LEZIONI PROFESSIONALI</small>
                    <h2>Allenamento collegato</h2>
                  </span>
                  <b>{unitsForTheme("work").filter((unit) => unit.cefr === selectedLevel).length} sessioni</b>
                </div>
                <div className="units">
                  {unitsForTheme("work")
                    .filter((unit) => unit.cefr === selectedLevel)
                    .map((unit) => {
                      const done = progress.days[unit.day];
                      return <button key={unit.id} className={done ? "done" : ""} onClick={() => open(unit)}>
                        <b>{done ? "✓" : unit.cefr}</b>
                        <span><strong>{unit.title}</strong><small>{unit.cefr} · {unit.minutes} min{done ? ` · ${done.score}%` : ""}</small></span>
                        <i>›</i>
                      </button>;
                    })}
                </div>
              </section>
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
          ) : selectedTheme === "story" ? (
            <div ref={(node) => { themeResultsRef.current = node; }}>
              <Deferred>
                <StoryPath
                  key={selectedLevel}
                  level={selectedLevel}
                  saved={progress.wordGames ?? {}}
                  onComplete={finishWordGame}
                />
              </Deferred>
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
              <Deferred>
                <WordGamesHub
                  key={selectedLevel}
                  level={selectedLevel}
                  saved={progress.wordGames ?? {}}
                  onComplete={finishWordGame}
                />
              </Deferred>
            </div>
          ) : selectedTheme === "skills" ? (
            <div
              ref={(node) => {
                themeResultsRef.current = node;
              }}
            >
              <Deferred>
                <SkillsLab
                  key={selectedLevel}
                  level={selectedLevel}
                  onComplete={finishWordGame}
                  reviewItems={smartReviews
                    .filter((review) => review.level === selectedLevel && !review.mastered)
                    .map((review) => ({ prompt: review.prompt, answer: review.answer }))}
                />
              </Deferred>
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
              <span>Livello</span>
              <b>{selectedLevel}</b>
              <small>sottolivello {sublevel}</small>
            </article>
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
            <article>
              <span>Tempo reale</span>
              <b>{totalMinutes} min</b>
              <small>studio completato</small>
            </article>
            <article>
              <span>Parole incontrate</span>
              <b>{acquiredWords}</b>
              <small>nelle sessioni completate</small>
            </article>
            <article>
              <span>Attività</span>
              <b>{completedLevelUnits.length}/12</b>
              <small>nel livello {selectedLevel}</small>
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
          <section className="monthlyPanel">
            <div>
              <span className="eyebrow">Questo mese</span>
              <h2>{monthlyActive} giorni attivi</h2>
              <p>{monthlyMinutes} minuti di studio reale registrati.</p>
            </div>
            <div>
              <strong>{smartReviews.filter((review) => review.mastered).length}</strong>
              <small>elementi consolidati</small>
            </div>
            <div>
              <strong>{smartReviews.filter((review) => !review.mastered).length}</strong>
              <small>elementi da rinforzare</small>
            </div>
          </section>
          <section className="progressNextPanel">
            <div>
              <span className="eyebrow">Prossimo passo</span>
              <h2>{nextActivity}</h2>
              <p>
                {dueSmartReviews.length
                  ? "Prima consolida ciò che è già emerso: bastano pochi minuti."
                  : "È la prossima attività coerente con il livello che hai scelto."}
              </p>
            </div>
            <div>
              <small>Ultima prova finale</small>
              <strong>{lastExam ? `${lastExam[1].score}%` : "Non ancora svolta"}</strong>
              {lastExam && <span>{lastExam[0].slice(0, 2).toUpperCase()}</span>}
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
            <div className="weeklySummary">
              <strong>
                {weeklyActive
                  ? `Questa settimana hai studiato in ${weeklyActive} ${weeklyActive === 1 ? "giorno" : "giorni"}.`
                  : "Questa settimana può iniziare anche con cinque minuti."}
              </strong>
              <span>
                {reviewFocus?.open
                  ? `Il prossimo miglioramento utile è ${reviewFocus.kind.toLowerCase()}.`
                  : "Le competenze si aggiorneranno con i prossimi esercizi."}
              </span>
            </div>
            <button
              type="button"
              className="pauseStreak"
              onClick={pauseStreak}
              disabled={Boolean(progress.streakPausedUntil && progress.streakPausedUntil >= dateKey())}
            >
              {progress.streakPausedUntil && progress.streakPausedUntil >= dateKey()
                ? `Ritmo protetto fino al ${new Date(`${progress.streakPausedUntil}T12:00:00`).toLocaleDateString("it-IT")}`
                : "Proteggi il ritmo per 7 giorni"}
            </button>
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
          <section className="displayPreferencePanel">
            <div>
              <span className="eyebrow">Leggibilità</span>
              <h2>Aspetto del programma</h2>
              <p>Le preferenze restano salvate su questo dispositivo.</p>
            </div>
            <div className="displayPreferenceRow">
              <strong>Colori</strong>
              <button className={colorMode === "light" ? "active" : ""} onClick={() => { setColorMode("light"); localStorage.setItem("english-coach-color-mode", "light"); }}>Chiaro</button>
              <button className={colorMode === "dark" ? "active" : ""} onClick={() => { setColorMode("dark"); localStorage.setItem("english-coach-color-mode", "dark"); }}>Scuro</button>
            </div>
            <div className="displayPreferenceRow">
              <strong>Testo</strong>
              <button className={textSize === "normal" ? "active" : ""} onClick={() => { setTextSize("normal"); localStorage.setItem("english-coach-text-size", "normal"); }}>Normale</button>
              <button className={textSize === "large" ? "active" : ""} onClick={() => { setTextSize("large"); localStorage.setItem("english-coach-text-size", "large"); }}>Più grande</button>
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
                onClick={() => startRecovery()}
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
                Esame finale multidisciplinare con lettura, ascolto, scrittura,
                mediazione e risposta orale. Le missioni tematiche ora includono
                risposta libera, ripetizione e salvataggio degli errori.
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
              <label>
                Periodo
                <select
                  value={errorPeriod}
                  onChange={(event) =>
                    setErrorPeriod(event.target.value as "Tutti" | "30" | "90")
                  }
                >
                  <option value="Tutti">Tutte le date</option>
                  <option value="30">Ultimi 30 giorni</option>
                  <option value="90">Ultimi 90 giorni</option>
                </select>
              </label>
            </div>
            {filteredErrors.length ? (
              <div className="errorCards">
                {filteredErrors.map((review) => {
                  const source = mobileCurriculum.find(
                    (candidate) => candidate.id === review.unitId,
                  ),
                    relatedWord = source?.vocabulary.find(
                      (word) =>
                        review.answer.toLowerCase().includes(word.en.toLowerCase()) ||
                        review.prompt.toLowerCase().includes(word.en.toLowerCase()),
                    ),
                    relatedExample =
                      relatedWord?.example ?? source?.grammar.examples[1]?.en;
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
                      {relatedExample && (
                        <aside className="newExampleRecall">
                          <small>UN ALTRO ESEMPIO</small>
                          <b lang="en">{relatedExample}</b>
                          {relatedWord && <span>{relatedWord.it}</span>}
                          <AudioButton text={relatedExample} label="Ascolta l’esempio" />
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
        <Deferred>
          <PlacementTest
            onClose={() => { setView("start"); scrollTo(0, 0); }}
            onChoose={(level) => completeOnboarding(level)}
          />
        </Deferred>
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
                        {!correct && (
                          <div className="recoveryStrategy">
                            <strong>Un passo alla volta.</strong>
                            <span>Leggi la regola, osserva la risposta corretta e riprova subito: la domanda resterà qui.</span>
                            {(question.review.wrongCount ?? 0) >= 3 && (
                              <span>Questo punto è ricorrente: continuerà a comparire nei ripassi finché non avrai dato più conferme corrette.</span>
                            )}
                          </div>
                        )}
                      </section>
                      {!correct && (
                        <button
                          type="button"
                          className="retryRecovery"
                          onClick={() => setRecoveryPick(null)}
                        >
                          Riprova la stessa domanda
                        </button>
                      )}
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
        <Deferred>
          <ThemePackLab
            key={selectedPack.id}
            pack={selectedPack}
            previous={progress.themePacks?.[selectedPack.id]}
            onMistake={(question, givenAnswer) =>
              queueThemeMistake(selectedPack, question, givenAnswer)
            }
            onClose={() => {
              speechSynthesis?.cancel();
              setSelectedPack(null);
              setView("topics");
              scrollTo(0, 0);
            }}
            onComplete={finishThemePack}
          />
        </Deferred>
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
            <Deferred><ReviewLab
              key={`${reviewSpec.level}-${reviewSpec.end}`}
              level={reviewSpec.level}
              units={reviewUnits}
              final={reviewSpec.end === 12}
              previousScore={
                progress.reviews?.[reviewId(reviewSpec.level, reviewSpec.end)]
                  ?.score
              }
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
            /></Deferred>
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
                        <ConceptText text={question.explanationIt} terms={question.options} />
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
              <Deferred><GrammarLesson unit={unit} onContinue={nextPhase} /></Deferred>
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
                      <button type="button" className="savePhrase" onClick={() => savePhrase(x.en, x.it, unit.title)}>
                        {(progress.savedPhrases ?? []).some((phrase) => phrase.en === x.en) ? "✓ Salvata" : "+ Salva frase"}
                      </button>
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
                        <button type="button" className="savePhrase" onClick={() => savePhrase(x.example, `${x.en} · ${x.it}`, unit.title)}>
                          {(progress.savedPhrases ?? []).some((phrase) => phrase.en === x.example) ? "✓ Salvata" : "+ Salva frase"}
                        </button>
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
                    <ConceptText text={practiceCloze[item].hintIt} terms={practiceCloze[item].answers} />
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
                <aside className="writingScope">
                  <b>Controllo offline di base</b>
                  <span>
                    Verifica ortografia del browser, maiuscole, punteggiatura e
                    alcuni errori grammaticali frequenti. La naturalezza di un
                    testo complesso richiede ancora una revisione umana.
                  </span>
                </aside>
                <label className="field">
                  La tua risposta in inglese
                  <textarea
                    ref={writingRef}
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
                  Avvia i controlli di base
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
                      <AudioButton text={writingSuggestion} label="Ascolta la versione" />
                      <div className="writingReviewActions">
                        <button
                          type="button"
                          onClick={() => {
                            setWriting(writingSuggestion);
                            setWritingNotes(null);
                            setWritingSuggestion("");
                            window.requestAnimationFrame(() => writingRef.current?.focus({ preventScroll: true }));
                          }}
                        >
                          Applica le correzioni
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWritingNotes(null);
                            setWritingSuggestion("");
                            window.requestAnimationFrame(() => writingRef.current?.focus({ preventScroll: true }));
                          }}
                        >
                          Modifica e ricontrolla
                        </button>
                      </div>
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
                  <div className="dictationSegments">
                    <small>RIASCOLTA UN SOLO SEGMENTO</small>
                    {listeningSegments.map((segment, segmentIndex) => (
                      <div key={`${segment}-${segmentIndex}`}>
                        <b>Parte {segmentIndex + 1}</b>
                        <AudioButton text={segment} label="Ascolta" />
                      </div>
                    ))}
                  </div>
                  <textarea
                    lang="en"
                    spellCheck={false}
                    value={dictation}
                    onChange={(e) => {
                      setDictation(e.target.value);
                      setDictationChecked(false);
                    }}
                    placeholder="Scrivi in inglese ciò che hai sentito…"
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
                {recordedAudioUrl && !recording && (
                  <div className="ownVoicePlayback">
                    <small>LA TUA REGISTRAZIONE</small>
                    <audio controls src={recordedAudioUrl} />
                    <span>Riascolta ritmo, pause e chiarezza prima di riprovare.</span>
                  </div>
                )}
                {spoken && (
                  <div className="speech">
                    <small>HO CAPITO</small>
                    <p lang="en">“{spoken}”</p>
                    {!speechIsError && (
                      <>
                        <b>{speechScore}% di parole e ordine riconosciuti</b>
                        <em className="speechScope">
                          Questo valore non è un’analisi dei fonemi: indica
                          quanto il riconoscimento vocale ha identificato la
                          frase nell’ordine atteso.
                        </em>
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
                            <div>
                              {speechParts
                                .filter((x) => !x.ok && x.expected)
                                .map((x, wordIndex) => (
                                  <span key={`${x.expected}-${wordIndex}`}>
                                    <b lang="en">{x.expected}</b>
                                    <button type="button" onClick={() => playWord(x.expected!)}>▶ normale</button>
                                    <button type="button" onClick={() => playWord(x.expected!, 0.6)}>◷ lenta</button>
                                  </span>
                                ))}
                            </div>
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
                <section className="lessonFeedback" aria-labelledby="lesson-feedback-title">
                  <h2 id="lesson-feedback-title">Com’è stata questa sessione?</h2>
                  <div>
                    {([
                      ["easy", "Troppo facile"],
                      ["right", "Giusta"],
                      ["hard", "Troppo difficile"],
                    ] as const).map(([rating, label]) => (
                      <button
                        type="button"
                        key={rating}
                        aria-pressed={progress.lessonFeedback?.[unit.id]?.rating === rating}
                        onClick={() => rateLesson(rating)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {progress.lessonFeedback?.[unit.id]?.rating && (
                    <p role="status">
                      {progress.lessonFeedback[unit.id].rating === "hard"
                        ? "Le proposte brevi riprenderanno questa lezione e i punti da rinforzare."
                        : progress.lessonFeedback[unit.id].rating === "easy"
                          ? "La prossima proposta avanzerà con attività nuove."
                          : "Continueremo con questo ritmo."}
                    </p>
                  )}
                </section>
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
          <nav className="mainNav" aria-label="Navigazione principale">
            <button
              className={view === "start" ? "active" : ""}
              aria-current={view === "start" ? "page" : undefined}
              onClick={() => setView("start")}
            >
              <b aria-hidden="true">◎</b>Primo accesso
            </button>
            <button
              className={view === "home" ? "active" : ""}
              aria-current={view === "home" ? "page" : undefined}
              onClick={() => setView("home")}
            >
              <b aria-hidden="true">⌂</b>Oggi
            </button>
            <button
              className={view === "path" ? "active" : ""}
              aria-current={view === "path" ? "page" : undefined}
              onClick={() => setView("path")}
            >
              <b aria-hidden="true">◇</b>Percorso
            </button>
            <button
              className={view === "topics" ? "active" : ""}
              aria-current={view === "topics" ? "page" : undefined}
              onClick={() => setView("topics")}
            >
              <b aria-hidden="true">✦</b>Temi
            </button>
            <button
              className={view === "progress" ? "active" : ""}
              aria-current={view === "progress" ? "page" : undefined}
              onClick={() => setView("progress")}
            >
              <b aria-hidden="true">↗</b>Progressi
            </button>
          </nav>
        )}
    </main>
  );
}
