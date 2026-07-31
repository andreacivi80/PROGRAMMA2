import { createServer } from "vite";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

const audioRoot = resolve("public/audio");
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = resolve(directory, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const slug = word => word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const wavFiles = walk(audioRoot).filter(path => extname(path).toLowerCase() === ".wav");
const wavDuration = path => {
  const data = readFileSync(path);
  let offset = 12, byteRate = 0, dataSize = 0;
  while (offset + 8 <= data.length) {
    const id = data.subarray(offset, offset + 4).toString("ascii");
    const size = data.readUInt32LE(offset + 4);
    if (id === "fmt " && size >= 12) byteRate = data.readUInt32LE(offset + 16);
    if (id === "data") { dataSize = size; break; }
    offset += 8 + size + (size % 2);
  }
  return byteRate && dataSize ? dataSize / byteRate : 0;
};
const malformed = wavFiles.filter(path => {
  const data = readFileSync(path);
  return data.length < 1000 || data.subarray(0, 4).toString("ascii") !== "RIFF" || data.subarray(8, 12).toString("ascii") !== "WAVE";
});
const names = new Map();
for (const path of wavFiles) {
  const key = path.toLowerCase();
  names.set(key, (names.get(key) ?? 0) + 1);
}
const duplicatePaths = [...names].filter(([, count]) => count > 1).map(([path]) => path);

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { mobileCurriculum } = await server.ssrLoadModule("/src/curriculum.ts");
  const visual = await server.ssrLoadModule("/src/visualQuiz.ts");
  const lessonFiles = mobileCurriculum.flatMap(unit => [
    ...unit.grammar.examples.map((_, index) => `${unit.id}-example-${index + 1}.wav`),
    ...unit.vocabulary.map((_, index) => `${unit.id}-vocab-${index + 1}.wav`),
    `${unit.id}-listening.wav`,
    `${unit.id}-speaking.wav`,
  ]);
  const visualSets = [...visual.kitchenVisualSets, ...visual.jobVisualSets, ...visual.actionVisualSets, ...visual.phrasalVisualSets];
  const wordFiles = visualSets.flatMap(set => set.audioMode === "browser" ? [] : set.items.map(item => `words/${slug(item.en)}.wav`));
  const required = [...new Set([...lessonFiles, ...wordFiles])];
  const missing = required.filter(file => {
    const path = resolve(audioRoot, file);
    return !existsSync(path) || statSync(path).size < 1000;
  });
  const longListening = ["b1-long-listening-media-listening.wav", "c1-long-documentary-listening.wav"].map(file => ({
    file,
    seconds: Math.round(wavDuration(resolve(audioRoot, file))),
  }));
  const app = readFileSync("src/App.tsx", "utf8").replace(/\s+/g, "");
  const preferences = readFileSync("src/preferences.ts", "utf8");
  const review = readFileSync("src/ReviewLab.tsx", "utf8");
  const skills = readFileSync("src/SkillsLab.tsx", "utf8");
  const placement = readFileSync("src/PlacementTest.tsx", "utf8");
  const themePack = readFileSync("src/ThemePackLab.tsx", "utf8");
  const checks = {
    delayedStart: app.includes("window.setTimeout(begin,1000)"),
    localThenFallback: app.includes("audio.onerror=()=>{audioRef.current=null;speak();") && app.includes("audio.play().catch(()=>{audioRef.current=null;speak();"),
    pauseResumeStop: app.includes("speechSynthesis.pause()") && app.includes("speechSynthesis.resume()") && app.includes("speechSynthesis.cancel()"),
    stopOnNavigation: app.includes("useEffect(()=>()=>stopActiveAudio?.(),[view,phase,unit.id])"),
    preferredAccent: app.includes("preferredAccent=getAudioAccent()") && preferences.includes("english-coach-audio-accent-v1"),
    microphonePermission: app.includes("getUserMedia({audio:true})") && app.includes("Permessomicrofononegato"),
    ownVoicePlayback: app.includes("URL.createObjectURL(newBlob(chunks"),
    reviewUsesPreference: review.includes("getAudioAccent()"),
    skillsUsesPreference: skills.includes("getAudioAccent()"),
    placementUsesPreference: placement.includes("recognition.lang = getAudioAccent()"),
    themePackUsesPreference: themePack.includes("recognition.lang = getAudioAccent()"),
  };
  const longListeningValid = longListening[0].seconds >= 60 && longListening[1].seconds >= 45;
  console.log(JSON.stringify({ files: wavFiles.length, lessonFiles: lessonFiles.length, visualWordFiles: wordFiles.length, malformed: malformed.map(path => path.replace(audioRoot, "")), duplicatePaths, missing, longListening, longListeningValid, checks }, null, 2));
  if (malformed.length || duplicatePaths.length || missing.length || !longListeningValid || Object.values(checks).some(value => !value)) process.exitCode = 1;
} finally {
  await server.close();
}
