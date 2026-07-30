import type {ThemePack} from "./themePacks";

type Saved={score:number;attempts:number;completedAt:string};
export default function ThemePackHub({title,intro,packs,currentVersion,saved,onOpen}:{title:string;intro:string;packs:ThemePack[];currentVersion:string;saved:Record<string,Saved>;onOpen:(pack:ThemePack)=>void}){
 return <section className="themePackHub">
  <div className="themeHeading"><span><small>MINI-PERCORSI INTERATTIVI</small><h2>{title}</h2></span><b>{packs.length} sessioni</b></div>
  <p className="readingHubIntro">{intro}</p>
  <div className="themePackCards">{packs.map(pack=>{const result=saved[pack.id],isCurrent=pack.introducedIn===currentVersion;return <button type="button" className={result?"done":""} key={pack.id} onClick={()=>onOpen(pack)}>
   <span className={`versionBadge ${isCurrent?"current":""}`}>{isCurrent?`NEW ${pack.introducedIn}`:`Aggiunto in ${pack.introducedIn}`}</span>
   <div><b>{pack.level}</b><small>{pack.minutes} min</small></div>
   <strong>{pack.title}</strong><p>{pack.summary}</p>
   <footer><span>▶ ascolto</span><span>8 vocaboli</span><span>10 quiz</span>{result&&<em>✓ ultimo {result.score}%</em>}</footer>
  </button>})}</div>
 </section>
}
