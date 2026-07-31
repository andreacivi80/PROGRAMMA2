export type AudioAccent = "en-GB" | "en-US";
export type AudioRate = 0.8 | 1 | 1.2;

const ACCENT_KEY = "english-coach-audio-accent-v1";
const RATE_KEY = "english-coach-audio-rate-v1";

export function getAudioAccent(): AudioAccent {
  if (typeof window === "undefined") return "en-GB";
  return localStorage.getItem(ACCENT_KEY) === "en-US" ? "en-US" : "en-GB";
}

export function saveAudioAccent(accent: AudioAccent) {
  localStorage.setItem(ACCENT_KEY, accent);
}

export function getAudioRate(): AudioRate {
  if (typeof window === "undefined") return 1;
  const value = Number(localStorage.getItem(RATE_KEY));
  return value === 0.8 || value === 1.2 ? value : 1;
}

export function saveAudioRate(rate: AudioRate) {
  localStorage.setItem(RATE_KEY, String(rate));
}
