import ts from "typescript";
import {readFileSync} from "node:fs";

const files=["src/App.tsx","src/GrammarLesson.tsx","src/ReviewLab.tsx","src/ThemePackHub.tsx","src/ThemePackLab.tsx","src/AuthenticAudio.tsx","src/WordGamesHub.tsx"];
const missingHandlers=[];
let buttons=0;
for(const file of files){
 const source=ts.createSourceFile(file,readFileSync(file,"utf8"),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const visit=node=>{
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
   const tag=node.tagName.getText(source);
   if(tag==="button"){
    buttons++;
    const names=node.attributes.properties.filter(ts.isJsxAttribute).map(attribute=>attribute.name.getText(source));
    if(!names.includes("onClick"))missingHandlers.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line+1}`);
   }
  }
  ts.forEachChild(node,visit);
 };
 visit(source);
}

const app=readFileSync("src/App.tsx","utf8");
const pack=readFileSync("src/ThemePackLab.tsx","utf8");
const authentic=readFileSync("src/AuthenticAudio.tsx","utf8");
const review=readFileSync("src/ReviewLab.tsx","utf8");
const speechVoices=readFileSync("src/speechVoices.ts","utf8");
const css=readFileSync("src/styles.css","utf8")+readFileSync("src/themePacks.css","utf8")+readFileSync("src/version29.css","utf8")+readFileSync("src/wordGames.css","utf8");
const checks={
 buttons,
 missingHandlers,
 lessonAudio:{
  delayedStart:app.includes("window.setTimeout(begin,1000)"),
  pause:app.includes("const pause=()=>"),
  resume:app.includes("const resume=()=>"),
  stopResets:app.includes("audioRef.current.currentTime=0")&&app.includes("audio.currentTime=0"),
  speeds:[`${"[.8,1,1.2]"}`].every(value=>app.includes(value)),
  stopsOnNavigation:app.includes("useEffect(()=>()=>stopActiveAudio?.(),[view,phase,unit.id])")
 },
 games:{
  crossword:readFileSync("src/WordGamesHub.tsx","utf8").includes("Mini Crossword"),
  hangman:readFileSync("src/WordGamesHub.tsx","utf8").includes("Hangman Phrases"),
  wordOrder:readFileSync("src/WordGamesHub.tsx","utf8").includes("Word Order"),
  matching:readFileSync("src/WordGamesHub.tsx","utf8").includes("Match the Meaning"),
  millionaire:readFileSync("src/WordGamesHub.tsx","utf8").includes("English Millionaire"),
  trivia:readFileSync("src/WordGamesHub.tsx","utf8").includes("Trivia Quest"),
  levelFilter:app.includes("themeSupportsLevel")&&app.includes("topicLevelFilter")
 },
 visualQuiz:{
  fullCategoryBank:app.includes("visualTiles(sets)"),
  newMosaicEveryQuestion:app.includes("Nuovo mosaico casuale a ogni domanda"),
  selectiveLabels:app.includes("showLabel=revealed.includes(tile.id)"),
  randomizedPositions:app.includes("shuffled([target,...shuffled(bank.filter")
 }, themeAudio:{
  listen:pack.includes("speak(pack.scenario.text,setScenarioWord)"),
  pause:pack.includes("speechSynthesis.pause()"),
  resume:pack.includes("speechSynthesis.resume()"),
  stop:pack.includes("speechSynthesis.cancel()"),
  stopsBeforeQuiz:pack.includes("startQuiz=()=>{stopScenarioSpeech()"),
  alternatingDialogue:pack.includes("applyDialogueVoice(utterance,pair,dialogueRole")&&app.includes("applyDialogueVoice(utterance,pair,dialogueRole"),
  noTechnicalAudioNote:!app.includes("Due voci inglesi alternate · i nomi non vengono pronunciati"),
  genderAwareVoices:speechVoices.includes("femaleSpeakers")&&speechVoices.includes("maleSpeakers"),
  variedVoicePairs:speechVoices.includes("seedIndex")&&app.includes("speechSynthesis.getVoices(),unit.id"),
  singleVoiceFallback:speechVoices.includes("utterance.pitch = role === \"female\" ? 1.08 : 0.9"),
  authenticPause:authentic.includes("setStatus(\"paused\")"),
  authenticStop:authentic.includes("currentTime=0"),
  authenticSpeeds:authentic.includes("[.8,1,1.2]")
 },
 skipping:{
  coreQuestions:app.includes("skipCurrentQuestion(finalQuiz.length,finish)"),
  listeningQuestions:app.includes("skipCurrentQuestion(listeningQuiz.length,nextPhase)"),
  readingQuestions:app.includes("readingSkip")&&app.includes("Domanda saltata"),
  reviewQuestions:review.includes("Salta domanda"),
  themeQuestions:pack.includes("Salta domanda")
 },
 responsive:{
  phoneRules:css.includes("@media(max-width:390px)")&&css.includes("@media(max-width:370px)"),
  touchTargets:css.includes("min-height:42px")||css.includes("min-height:44px"),
  transcriptContained:css.includes("overscroll-behavior:contain"),
  audioGrid:css.includes(".guidedPlayer .audioActions")
 }
};
const failed=[
 ...(missingHandlers.length?["buttons-without-handler"]:[]),
 ...Object.entries(checks.lessonAudio).filter(([,value])=>!value).map(([name])=>`lesson-audio:${name}`),
 ...Object.entries(checks.games).filter(([,value])=>!value).map(([name])=>`games:${name}`),
 ...Object.entries(checks.visualQuiz).filter(([,value])=>!value).map(([name])=>`visual-quiz:${name}`),
 ...Object.entries(checks.themeAudio).filter(([,value])=>!value).map(([name])=>`theme-audio:${name}`),
 ...Object.entries(checks.skipping).filter(([,value])=>!value).map(([name])=>`skipping:${name}`),
 ...Object.entries(checks.responsive).filter(([,value])=>!value).map(([name])=>`responsive:${name}`)
];
console.log(JSON.stringify({...checks,failed},null,2));
if(failed.length)process.exitCode=1;
