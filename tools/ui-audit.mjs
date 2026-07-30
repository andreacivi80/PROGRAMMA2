import ts from "typescript";
import {readFileSync} from "node:fs";

const files=["src/App.tsx","src/GrammarLesson.tsx","src/ReviewLab.tsx","src/ThemePackHub.tsx","src/ThemePackLab.tsx"];
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
const css=readFileSync("src/styles.css","utf8")+readFileSync("src/themePacks.css","utf8");
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
 themeAudio:{
  listen:pack.includes("speak(pack.scenario.text)"),
  pause:pack.includes("speechSynthesis.pause()"),
  resume:pack.includes("speechSynthesis.resume()"),
  stop:pack.includes("speechSynthesis.cancel()"),
  stopsBeforeQuiz:pack.includes("startQuiz=()=>{speechSynthesis?.cancel()")
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
 ...Object.entries(checks.themeAudio).filter(([,value])=>!value).map(([name])=>`theme-audio:${name}`),
 ...Object.entries(checks.responsive).filter(([,value])=>!value).map(([name])=>`responsive:${name}`)
];
console.log(JSON.stringify({...checks,failed},null,2));
if(failed.length)process.exitCode=1;
