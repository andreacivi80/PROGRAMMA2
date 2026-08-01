import ts from "typescript";
import {readFileSync} from "node:fs";

const files=["src/App.tsx","src/LearningCoach.tsx","src/GrammarLesson.tsx","src/ReviewLab.tsx","src/ThemePackHub.tsx","src/ThemePackLab.tsx","src/AuthenticAudio.tsx","src/WordGamesHub.tsx","src/PlacementTest.tsx","src/SkillsLab.tsx"];
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

const compact=value=>value.replace(/\s+/g,"");
const searchable=value=>({
 includes:needle=>value.includes(needle)||compact(value).includes(compact(needle)),
 indexOf:needle=>{const raw=value.indexOf(needle);return raw>=0?raw:compact(value).indexOf(compact(needle))},
 toLowerCase:()=>searchable(value.toLowerCase())
});
const appSource=readFileSync("src/App.tsx","utf8");
const app=searchable(appSource);
const pack=searchable(readFileSync("src/ThemePackLab.tsx","utf8"));
const authentic=searchable(readFileSync("src/AuthenticAudio.tsx","utf8"));
const review=searchable(readFileSync("src/ReviewLab.tsx","utf8"));
const speechVoices=searchable(readFileSync("src/speechVoices.ts","utf8"));
const supplementary=searchable(readFileSync("src/supplementaryQuiz.ts","utf8"));
const languageFocus=searchable(readFileSync("src/languageFocusPacks.ts","utf8"));
const mixedText=searchable(readFileSync("src/MixedText.tsx","utf8"));
const grammarLesson=searchable(readFileSync("src/GrammarLesson.tsx","utf8"));
const placement=searchable(readFileSync("src/PlacementTest.tsx","utf8"));
const skills=searchable(readFileSync("src/SkillsLab.tsx","utf8"));
const themePacks=searchable(readFileSync("src/themePacks.ts","utf8"));
const professional=searchable(readFileSync("src/professionalThemePacks.ts","utf8"));
const conceptText=searchable(readFileSync("src/ConceptText.tsx","utf8"));
const wordGames=readFileSync("src/WordGamesHub.tsx","utf8");
const css=readFileSync("src/styles.css","utf8")+readFileSync("src/themePacks.css","utf8")+readFileSync("src/lessonEnhancements.css","utf8")+readFileSync("src/appEnhancements.css","utf8")+readFileSync("src/wordGames.css","utf8");
const checks={
 buttons,
 missingHandlers,
 lessonAudio:{
  delayedStart:app.includes("window.setTimeout(begin,1000)"),
  pause:app.includes("const pause=()=>"),
  resume:app.includes("const resume=()=>"),
  stopResets:app.includes("audioRef.current.currentTime=0")&&app.includes("audio.currentTime=0"),
  speeds:app.includes("[0.8, 1, 1.2]"),
  stopsOnNavigation:app.includes("useEffect(()=>()=>stopActiveAudio?.(),[view,phase,unit.id])")
 },
 games:{
  crossword:wordGames.includes("function Crossword("),
  hangman:wordGames.includes("function Hangman("),
  wordOrder:wordGames.includes("function WordOrder("),
  matching:wordGames.includes("function MatchingGame("),
  opposites:wordGames.includes("function OppositesGame("),
  millionaire:wordGames.includes("function MillionaireGame("),
  trivia:wordGames.includes("function TriviaGame("),
  levelFilter:app.includes("themeSupportsLevel")&&app.includes("compactLevelPicker"),
  placementTest:placement.includes("Comprensione scritta")&&placement.includes("Valutazione orientativa")&&placement.includes("Produzione orale")&&app.includes("english-coach-onboarding-v1"),
  findError:skills.includes("Trova l’errore"),
  minimalPairs:skills.includes("Minimal pairs"),
  stableMinimalPairReplay:skills.includes("pairReady")&&skills.includes("Riascolta la stessa parola")&&skills.includes("disabled={!pairReady||selected!==null}"),
  mediation:skills.includes("SFIDA DI MEDIAZIONE"),
  wordFamilies:skills.includes("FAMIGLIE DI PAROLE"),
  branchingDialogue:skills.includes("DIALOGO A BIVI"),
  guidedDictation:skills.includes("DETTATO MIRATO") && skills.includes("Maiuscole e punteggiatura non riducono"),
  guidedParaphrase:skills.includes("PARAFRASI GUIDATA") && skills.includes("Il modello non è l’unica risposta possibile"),
  dialogueReconstruction:skills.includes("COERENZA DEL DIALOGO") && skills.includes("non continua correttamente")
 },
 visualQuiz:{
  fullCategoryBank:app.includes("visualTiles(sets)"),
  newMosaicEveryQuestion:app.includes("mosaic=useMemo(()=>target?shuffled([target,...shuffled(bank.filter"),
  selectiveLabels:app.includes("showLabel=revealed.includes(tile.id)"),
  randomizedPositions:app.includes("shuffled([target,...shuffled(bank.filter"),
  noServiceCopy:!["BANCA ","Nuovo mosaico casuale","posizioni cambiano continuamente","81 immagini","intera banca della categoria"].some(text=>app.includes(text)),
  compactPhoneView:css.includes(".visualQuizHub{min-height:calc(100dvh")&&css.includes("grid-template-columns:repeat(4,minmax(0,1fr))")
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
  centeredScenarioScroll:pack.includes("activeRect.top-boxRect.top+box.scrollTop"),
  stableScenarioViewport:css.includes("overflow-anchor:none")&&css.includes("scroll-padding-block:42%"),
  authenticPause:authentic.includes("setStatus(\"paused\")"),
  authenticStop:authentic.includes("currentTime=0"),
  authenticSpeeds:authentic.includes("[0.8,1,1.2]")
 },
 skipping:{
  coreQuestions:app.includes("skipCurrentQuestion(finalQuiz.length,finish)"),
  listeningQuestions:app.includes("skipCurrentQuestion(listeningQuiz.length,nextPhase)"),
  readingQuestions:app.includes("readingSkip")&&app.includes("Domanda saltata"),
  reviewQuestions:review.includes("Salta domanda"),
themeQuestions:pack.includes("Salta domanda")
 },
 supplementaryPractice:{
  autonomousBank:!app.includes("function bonusQuizFor")&&supplementary.includes("supplementaryBankFor"),
  remembersSeen:app.includes("english-coach-supplementary-seen-v1"),
  rotatesQuestions:supplementary.includes("excludedSet")&&supplementary.includes("unseen")
 },
 smartReview:{
  storesErrors:app.includes("smartReview?:Record<string,SmartReviewItem>")&&app.includes("queueReview"),
  storesSkipped:app.includes('skipStage=()=>{if(phase==="cloze")')&&app.includes('queueReview("Ascolto"'),
  pronunciation:app.includes('speechScore<75')&&app.includes('queueReview("Pronuncia"'),
  schedule:app.includes("const delays=[1,3,7,14,30]"),
  dueToday:app.includes("Ripasso pronto")&&app.includes("Inizia il ripasso")&&app.includes('view==="smartReview"'),
  savesLocally:app.includes("smartReview:{...(current.smartReview??{})"),
  resetAndBackup:app.includes("schemaVersion: 14")&&app.includes("normalizeProgress(imported.progress,deviceId())")&&app.includes("english-coach-supplementary-seen-v1")
 },
 recoveryTraining:{
  variableQuestions:app.includes("startRecovery=(count=10,candidates:SmartReviewItem[]=smartReviews)")&&app.includes("shuffled(candidates.filter"),
  focusedPool:app.includes(".filter((review) => !review.mastered)")&&app.includes("recoveryQuiz"),
  credibleOptions:app.includes("review.options?.length")&&app.includes("...source.quickCheck")&&app.includes("meaningMistakes(review.answer)")&&!app.includes("mobileCurriculum.flatMap((candidate)"),
  answerFeedback:app.includes("recoveryFeedback")&&app.includes("Rivediamola subito"),
  canSkip:app.includes('className="recoverySkip"')&&app.includes("answerRecovery(-1)"),
  updatesSchedule:app.includes("const answerRecovery=")&&app.includes("delays=[1,3,7,14,30]")
 },
 learningClarity:{
  noServiceCopy:!["banca tecnica","algoritmo interno","posizioni cambiano continuamente","dettaglio di implementazione"].some(text=>app.toLowerCase().includes(text)),
  englishEmphasis:mixedText.includes("inlineEnglish")&&mixedText.includes("I'm afraid")&&grammarLesson.includes("terms={lessonTerms}"),
  visibleEnglishStyle:css.includes(".inlineEnglish")&&css.includes("text-decoration-color:#efc85e"),
  phoneReviewLayout:css.includes("@media(max-width:430px)")&&css.includes(".smartReviewChoices{grid-template-columns:1fr}")
  ,logicalHomeFlow:app.indexOf("dailyFocusHome")<app.indexOf('className="homeChoice adaptiveChoice"')&&app.includes('className="homeChoice freeChoice"')
  ,singleDailyRecommendation:(appSource.match(/className={`dailyFocusHome/g)||[]).length===1
  ,customDurationToggle:app.includes("Scegli la durata")&&app.includes("setAdaptiveOpen(open)")&&app.includes('aria-expanded={adaptiveOpen}')
  ,scheduledReviewMerged:!app.includes('className={`smartReviewHome')&&app.includes("nextReviewNote")
  ,singleQuestionSkip:app.includes('!["cloze","listening","quiz","bonus"].includes(phase)')&&app.includes('className="skipStage"')
  ,containedSkip:css.includes(".lessonCard>.bottomSkip{position:static!important")&&css.includes(".readingSkip")&&css.includes("width:100%")
  ,levelBeforeTime:app.indexOf("dailyLevelPicker")<app.indexOf("adaptiveTimeTitle")
  ,singleHomeLevelSelector:(appSource.match(/className="dailyLevelPicker"/g)||[]).length===1&&!app.includes('className="levelButtons"')
  ,levelPersists:app.includes("english-coach-selection-v1")&&app.includes("savedLevel??selected.cefr")
  ,pathFiltersLevel:app.includes("([selectedLevel] as Cefr[]).map((level)")
  ,grammarConceptBreaks:grammarLesson.includes("<ConceptText")&&css.includes(".conceptText>p:not(:last-child)")
  ,conceptBreaksEverywhere:app.includes("<ConceptText text={data.explanationIt}")&&app.includes("<ConceptText text={question.review.explanation}")&&review.includes("<ConceptText text={question.explanationIt}")&&pack.includes("<ConceptText text={item.explanationIt}")
  ,conceptPunctuation:conceptText.includes('replace(/;$/, \".\")')&&conceptText.includes('/[.!?…]$/.test(sentence)')
  ,readingOneAtATime:app.includes("slice(readingQuestionIndex,readingQuestionIndex+1)")&&app.includes("setReadingQuestionIndex")
  ,compactLevelPicker:app.includes('className="dailyLevelPicker"')&&css.includes(".dailyLevelPicker > summary")
  ,mainViewPersists:app.includes("english-coach-view-v1")&&app.includes("initialMainView")
  ,resumeOnlyOnLessonOpen:(readFileSync("src/App.tsx","utf8").match(/setResumePrompt\(\{ unit: u, checkpoint \}\)/g)||[]).length===1
  ,themePersists:app.includes("theme: selectedTheme")&&app.includes("setSelectedTheme(savedTheme)")
  ,freePathStartsOpen:app.includes('className="homeChoice freeChoice" open')
  ,audioPreferences:app.includes("saveAudioAccent")&&app.includes("saveAudioRate")&&app.includes("r.lang = audioAccent")
  ,errorNotebook:app.includes("I miei errori")&&app.includes("filteredErrors")&&app.includes("wrongCount")&&app.includes("correctStreak")&&app.includes("Riprova")
  ,monthlyDashboard:app.includes("monthlyMinutes")&&app.includes("elementi consolidati")
  ,displayPreferences:app.includes("english-coach-color-mode")&&app.includes("english-coach-text-size")
  ,printableFinalReport:review.includes("window.print()")&&review.includes("examBreakdown")&&review.includes("previousScore")
  ,multidisciplinaryExam:["Lettura","Ascolto","Scrittura","Interazione","Mediazione"].every(area=>review.includes(`\"${area}\"`))&&review.includes("SpeechRecognition")
  ,completeThemeMission:pack.includes('phase === "response"')&&pack.includes('phase === "repeat"')&&pack.includes("onMistake")
 },
 languageFocus:{
  themeEntry:app.includes("Verbi e false friends"),
  fiveLevels:["A1","A2","B1","B2","C1"].every(level=>languageFocus.includes(`level: "${level}"`)),
  pastAndParticiple:languageFocus.includes("Past Simple")&&languageFocus.includes("Past Participle"),
  falseFriends:languageFocus.includes("false friends")&&languageFocus.includes("actually")
 },
 professionalEnglish:{
  separateFromIra:app.includes('pack.category === "professional"')&&app.includes("Un percorso distinto da IRA"),
  fiveLevels:["A1","A2","B1","B2","C1"].every(level=>professional.includes(`level: "${level}"`)),
  completePractice:professional.includes("Email e aggiornamenti chiari")&&professional.includes("Riunione: aggiornare")&&professional.includes("Negoziazione e decisioni"),
  socialAcronymsSeparated:themePacks.includes("FYI significa for your information")&&themePacks.includes("IDK significa I don’t know: non lo so")&&themePacks.includes("LMK significa let me know: fammi sapere"),
  returningLearnerFlow:app.includes('onboardingComplete ? "Facoltativo" : "Scelta consigliata"')&&app.includes("Continua dal livello")
  ,visibleAtEveryLevel:app.includes('id === "work" ? "professional"')
  ,noEmptyLinkedSection:app.includes('unitsForTheme("work").some((unit) => unit.cefr === selectedLevel)')
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
 ...Object.entries(checks.supplementaryPractice).filter(([,value])=>!value).map(([name])=>`supplementary:${name}`),
 ...Object.entries(checks.smartReview).filter(([,value])=>!value).map(([name])=>`smart-review:${name}`),
 ...Object.entries(checks.recoveryTraining).filter(([,value])=>!value).map(([name])=>`recovery-training:${name}`),
 ...Object.entries(checks.learningClarity).filter(([,value])=>!value).map(([name])=>`learning-clarity:${name}`),
 ...Object.entries(checks.languageFocus).filter(([,value])=>!value).map(([name])=>`language-focus:${name}`),
 ...Object.entries(checks.professionalEnglish).filter(([,value])=>!value).map(([name])=>`professional-english:${name}`),
 ...Object.entries(checks.responsive).filter(([,value])=>!value).map(([name])=>`responsive:${name}`)
];
console.log(JSON.stringify({...checks,failed},null,2));
if(failed.length)process.exitCode=1;
