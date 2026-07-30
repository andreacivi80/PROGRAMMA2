import type {Choice} from "./curriculum";
const q=(prompt:string,options:string[],answer:number,explanationIt:string):Choice=>({prompt,options,answer,explanationIt});

export const accentComprehension:Record<string,Choice[]>={
 "accent-b2-australia":[
  q("Where did the speaker grow up?",["In Melbourne’s eastern suburbs","In central Sydney","In rural Scotland"],0,"La parlante colloca la propria crescita nei quartieri orientali di Melbourne."),
  q("Which activity does she do near the city centre?",["Roller-skating","Horse racing","Mountain climbing"],0,"Tra gli hobby cita il pattinaggio a rotelle vicino al centro."),
  q("What makes the northern area more convenient for her social life?",["Friends and activities are easier to reach","Nobody uses public transport","All work is done from home"],0,"Collega la zona nord alla facilità di raggiungere amici e attività."),
  q("What contrast is central to the recording?",["Northern and eastern parts of Melbourne","Australia and India","School and retirement"],0,"Il confronto geografico fra due zone di Melbourne struttura il racconto."),
  q("Is this sample presented as the only Australian accent?",["No, it represents one Melbourne speaker","Yes, every Australian sounds identical","The recording never identifies a location"],0,"La guida chiarisce che è una voce individuale di Melbourne."),
  q("What should a learner focus on at the second listen?",["Places, reasons, hobbies and transport","Only isolated spelling","Imitating a stereotype"],0,"La strategia proposta è ricostruire informazioni e motivazioni.")
 ],
 "accent-c1-scotland":[
  q("How does her course structure at home differ from the new timetable?",["She usually takes one concentrated course","She never attends lessons","She studies only at night"],0,"Confronta un corso concentrato con un orario che le ricorda la scuola."),
  q("Which part of film work interests her most?",["Acting and professional practice","Selling cinema tickets","Building projectors"],0,"La parte professionale e la recitazione sono il centro del suo interesse."),
  q("What did the group originally consider doing in Hollywood?",["Camping out overnight","Hiring a private plane","Cancelling the whole trip"],0,"Il piano iniziale era passare la notte sul posto."),
  q("Why did they abandon that plan?",["A local friend raised safety concerns","The street had no cinemas","Their lecturer forbade all travel"],0,"Un conoscente locale giudicò il piano poco sicuro e non necessario."),
  q("What did they watch after arriving early?",["A hand-print ceremony","A football final","A university exam"],0,"Il racconto include una cerimonia delle impronte."),
  q("Which listening skill is especially important here?",["Following plans that change","Translating every filler word","Ignoring the sequence of events"],0,"Bisogna distinguere intenzione iniziale, consiglio e decisione finale.")
 ],
 "accent-c1-wales":[
  q("Where was the speaker born?",["Barry in South Wales","Manchester city centre","Edinburgh"],0,"La scheda identifica Barry, nel Galles meridionale."),
  q("Which city is associated with roughly ten years of her life?",["Manchester","Cardiff","Los Angeles"],0,"Nel racconto il periodo lungo viene associato a Manchester."),
  q("What was Dorothy?",["An imaginary mouse","A school teacher","A real dog"],0,"Dorothy era il topo immaginario dell’infanzia."),
  q("Which pets appear in another childhood memory?",["Two budgies","Three horses","A single cat"],0,"Il racconto passa poi a due pappagallini."),
  q("What did her father attempt after one bird died?",["Resuscitation","A telephone repair","A school lesson"],0,"L’episodio include un tentativo di rianimazione."),
  q("Why are self-corrections important in this sample?",["The final detail may replace an earlier one","They always signal a new speaker","They make every sentence false"],0,"Nel parlato spontaneo la prima formulazione può essere corretta subito dopo.")
 ],
 "accent-b1-california":[
  q("How long has the speaker lived in Orange County?",["His entire life","Only six months","Since last week"],0,"Dice di aver vissuto lì per tutta la vita."),
  q("Where was his father born?",["Chicago","Dallas","New Delhi"],0,"Il padre è nato a Chicago prima che la famiglia si stabilisse in California."),
  q("Who commented on the way he speaks?",["Teachers","Restaurant customers","Train drivers"],0,"Ricorda osservazioni fatte da insegnanti."),
  q("When do strangers sometimes recognise his origin?",["When he travels around the United States","Only when he writes an email","When he shows a flag"],0,"Durante i viaggi alcune persone lo riconoscono dal modo di parlare."),
  q("How does he describe his usual delivery?",["Rather monotone","Always shouted","Completely silent"],0,"Il racconto usa monotone parlando della sua voce abituale."),
  q("What is the main topic of the spontaneous speech?",["Awareness of his Californian speech","A recipe from India","Public transport in Melbourne"],0,"Riflette su provenienza, percezione e commenti sul suo parlato.")
 ],
 "accent-b2-new-york":[
  q("Which New York areas are connected to the speaker?",["Brooklyn and the Bronx","Dallas and Austin","Chicago and California"],0,"La scheda colloca la voce tra Brooklyn e Bronx."),
  q("What type of transport is central to the anecdote?",["The subway/train","A ferry to Australia","A private helicopter"],0,"Il racconto segue un gruppo in treno/metropolitana."),
  q("What did the group do that affected other passengers?",["They made a lot of noise","They served breakfast","They performed a silent exam"],0,"Il comportamento rumoroso provocava reazioni negli altri passeggeri."),
  q("What happened inside the carriage?",["Other passengers often moved away","Everyone began a lesson","The train became a restaurant"],0,"Le persone tendevano a liberare il vagone."),
  q("How is the delivery characterised by IDEA?",["Fast-paced and high-energy","Extremely slow and whispered","Formal and scripted only"],0,"La scheda descrive un giovane parlante rapido ed energico."),
  q("What is the best first-listen strategy?",["Follow places, actions and reactions","Pause after every individual vowel","Assume every New Yorker sounds the same"],0,"La comprensione globale viene prima dell’analisi di singole parole.")
 ],
 "accent-b2-texas":[
  q("Which two word games does the speaker mention?",["Scrabble and Boggle","Chess and tennis","Poker and golf"],0,"La parte spontanea descrive Scrabble e Boggle."),
  q("What is inside the Boggle cube?",["Dice with letters","Small restaurant menus","Train tickets"],0,"Descrive piccoli dadi con lettere."),
  q("Which personal memory follows the word-game topic?",["Her first crush","Her first flight to Wales","Her first cooking class"],0,"Dopo i giochi passa al ricordo della prima cotta."),
  q("What had happened to her car shortly before another incident?",["It had been totalled in a wreck","It had been sold in California","It had never been driven"],0,"Racconta di aver distrutto l’auto in un incidente due giorni prima."),
  q("Why does her register change?",["She adapts to her audience","She forgets English every afternoon","The audio changes country"],0,"La parlante descrive il code-switching secondo l’interlocutore."),
  q("Does the sample represent every Texas accent?",["No, it is one Dallas speaker with individual influences","Yes, Texas has only one voice","It represents New York instead"],0,"La guida evita generalizzazioni su una regione molto ampia.")
 ],
 "accent-c1-midwest":[
  q("What are the speaker’s professional fields?",["Web development and opera singing","Restaurant service and farming","Film directing and law"],0,"La scheda la presenta come web developer e cantante d’opera."),
  q("Where in Chicago is she from?",["The North Side","The far south of Texas","Orange County"],0,"La provenienza indicata è il North Side."),
  q("What has she studied extensively?",["Several languages and voice performance","Only road maps","No subjects outside computing"],0,"Parla di lingue, canto e formazione vocale."),
  q("Where did she attend graduate school?",["North Carolina","India","Australia"],0,"Ha vissuto circa tre anni in North Carolina per gli studi."),
  q("What effect may actor training have?",["It may make speech sound more neutral","It removes all vocabulary","It creates a Texas flag"],0,"Riflette sulla possibile neutralizzazione di alcuni tratti."),
  q("What makes her speech history complex?",["Training and time outside Chicago may have influenced it","She has never heard another language","The sample is synthetic"],0,"La guida invita a considerare formazione ed esperienze personali.")
 ],
 "accent-b2-india":[
  q("Where was the speaker born?",["Lucknow","Chicago","Melbourne"],0,"La scheda indica Lucknow come luogo di nascita."),
  q("Which Indian cities does she connect to her life?",["Lucknow, Hyderabad and New Delhi","Mumbai only","Edinburgh and Cardiff"],0,"Nel racconto ricostruisce gli spostamenti fra queste città."),
  q("Where was she studying at the time of the recording?",["The American University in Cairo","A school in Texas","A college in Wales"],0,"La scheda la colloca all’American University del Cairo."),
  q("What behaviour does she criticise?",["Mocking a stereotypical Indian accent","Learning more than one language","Travelling between Indian cities"],0,"Contesta le imitazioni occidentali stereotipate."),
  q("Why does she say Indian English varies?",["India has many languages and regional influences","Everyone learns from one identical recording","English is never used in India"],0,"Collega direttamente pluralità linguistica e diversità degli accenti."),
  q("How is her own English described?",["Fluent, educated and British-influenced","Synthetic and generated","Unable to communicate"],0,"IDEA la descrive come una parlante fluente con influenza britannica.")
 ]
};
