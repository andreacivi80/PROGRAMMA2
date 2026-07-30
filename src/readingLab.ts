import type { Cefr, Choice } from "./curriculum";

export type ReadingPassage = {
  id: string;
  level: Cefr;
  title: string;
  topic: string;
  minutes: number;
  paragraphs: string[];
  glossary: [string, string][];
  questions: Choice[];
};

const q=(prompt:string,options:string[],answer:number,explanationIt:string):Choice=>({prompt,options,answer,explanationIt});

export const readingPassages:ReadingPassage[]=[
  {
    id:"reading-a1-market",level:"A1",title:"Saturday at the community market",topic:"Vita quotidiana, orari e acquisti",minutes:12,
    paragraphs:[
      "Every Saturday morning, Emma goes to the community market near her home. The market opens at eight o’clock, but Emma usually arrives at half past eight. She takes two cloth bags and a small shopping list. She does not drive because the market is only ten minutes away on foot.",
      "First, Emma visits Mr Green’s fruit and vegetable stall. She buys six apples, four tomatoes and a bag of potatoes. Today she also buys some strawberries because they are fresh and not expensive. Mr Green tells her that the strawberries come from a farm fifteen kilometres away.",
      "Next, Emma goes to the bread stall. Her family likes brown bread, but her son Leo prefers white rolls. She buys one brown loaf and three white rolls. Then she meets her neighbour, Sofia. They have a coffee together and talk about their plans for Sunday.",
      "Before going home, Emma looks for cheese. The usual cheese seller is not at the market today, so she buys cheese from a new stall. The seller gives her a small piece to try. Emma likes it and buys two hundred grams. She leaves the market at ten o’clock. Her bags are full, but she is happy because she has everything on her list."
    ],
    glossary:[["stall","bancarella"],["cloth bag","borsa di stoffa"],["loaf","pagnotta"],["roll","panino"],["seller","venditore"],["on foot","a piedi"]],
    questions:[
      q("How does Emma travel to the market?",["By car","On foot","By bus"],1,"Il primo paragrafo dice che il mercato è a dieci minuti a piedi e che Emma non guida."),
      q("What time does Emma usually arrive?",["8:00","8:30","10:00"],1,"Arriva normalmente at half past eight, cioè alle 8:30."),
      q("Why does Emma buy strawberries today?",["They are fresh and inexpensive","Leo asked for them","They come from another country"],0,"Il testo dice fresh and not expensive."),
      q("What kind of bread does Leo prefer?",["Brown bread","White rolls","No bread"],1,"La famiglia ama il pane integrale, ma Leo preferisce i panini bianchi."),
      q("Who has coffee with Emma?",["Mr Green","Her son","Her neighbour Sofia"],2,"Emma incontra la vicina Sofia e prendono un caffè insieme."),
      q("Why does Emma use a new cheese stall?",["The usual seller is absent","The new cheese is cheaper","She forgot her list"],0,"Il venditore abituale non è presente quel giorno.")
    ]
  },
  {
    id:"reading-a2-cooking",level:"A2",title:"The cooking class that nearly went wrong",topic:"Cucina, imprevisti e collaborazione",minutes:15,
    paragraphs:[
      "Last month, Daniel joined an evening cooking course at the local college. He could already prepare simple meals, but he wanted to learn how to make fresh pasta. On the first evening, the teacher, Ms Rossi, showed the class the main utensils: a rolling pin, a large chopping board, a grater, a whisk and several sharp knives. She explained how to use each tool safely before anyone started cooking.",
      "The students worked in pairs. Daniel worked with Maya, who had never made pasta before. Their first task was to mix flour and eggs. Daniel poured too much water into the bowl, and the dough became very wet. He thought they had to throw it away, but Ms Rossi told them to add flour slowly and continue mixing. After a few minutes, the dough was smooth again.",
      "While the dough was resting, Maya prepared the sauce. She chopped an onion, grated some cheese and opened a tin of tomatoes. Unfortunately, she turned on the wrong ring on the cooker. The empty pan became very hot, but Daniel noticed it before anything burned. He switched it off and moved the pan carefully.",
      "At the end of the lesson, every pair served a small plate of pasta. Daniel and Maya’s pasta was not perfectly shaped, but it tasted excellent. Ms Rossi said that their calm teamwork was more important than making a perfect dish. Daniel went home tired and proud. The following week, he bought a rolling pin and made the recipe again for his family."
    ],
    glossary:[["utensils","utensili"],["rolling pin","mattarello"],["dough","impasto"],["smooth","liscio"],["ring","fornello/piastra"],["shaped","dalla forma"]],
    questions:[
      q("Why did Daniel join the course?",["To learn fresh pasta","To become a teacher","To buy kitchen tools"],0,"Sapeva già cucinare piatti semplici, ma voleva imparare la pasta fresca."),
      q("What did Ms Rossi do before the students cooked?",["She served dinner","She explained tool safety","She chose the best pair"],1,"Prima di iniziare mostrò gli utensili e spiegò come usarli in sicurezza."),
      q("What problem did Daniel cause?",["He used too much water","He burned the sauce","He broke the rolling pin"],0,"Daniel versò troppa acqua e l’impasto diventò molto bagnato."),
      q("How did they repair the dough?",["They added eggs","They heated it","They slowly added flour"],2,"Ms Rossi consigliò di aggiungere lentamente altra farina."),
      q("Who noticed the hot empty pan?",["Daniel","Maya","Ms Rossi"],0,"Daniel si accorse della piastra sbagliata prima che qualcosa bruciasse."),
      q("What lesson did Ms Rossi emphasize?",["Perfect shape is essential","Calm teamwork matters","Students should work alone"],1,"Disse che collaborare con calma era più importante di un piatto perfetto.")
    ]
  },
  {
    id:"reading-b1-library",level:"B1",title:"A library where you borrow things",topic:"Comunità, sostenibilità e servizi",minutes:20,
    paragraphs:[
      "When people hear the word library, they usually imagine shelves full of books. In the town of Westbridge, however, residents can borrow much more than novels. Three years ago, a group of volunteers opened a ‘Library of Things’, a service that lends useful household equipment. Members can borrow drills, sewing machines, camping equipment, gardening tools and even a machine for cleaning carpets.",
      "The idea began when local resident Priya Shah needed a power drill to put up two shelves. Buying a new one seemed wasteful because she expected to use it for less than an hour. She asked in an online neighbourhood group and discovered that many people had similar experiences. Some owned expensive tools that spent most of the year in a cupboard; others needed equipment for a single job but could not afford to buy it.",
      "Priya and six other residents collected fifty donated items and found an empty room in the community centre. At first, the service opened only on Saturday mornings. Demand grew quickly, so the council offered a larger space and a small grant. The library now has more than eight hundred members and opens four days a week. Members pay a modest annual fee, while people on low incomes can join free of charge.",
      "The project has brought benefits, but it has also faced difficulties. Volunteers must check every electrical item after it is returned, and some tools require regular repairs. A few popular items are booked weeks in advance. To reduce waiting times, the library limits loans to seven days and sends automatic reminders. It also runs short safety workshops for equipment that may be unfamiliar or dangerous.",
      "An independent study estimated that members avoided buying nearly two thousand new products last year. This reduced waste and saved households money. Yet Priya believes the social effect is equally important. People often stay to exchange advice, demonstrate a tool or offer help with a repair. What began as a practical response to unnecessary consumption has gradually become a place where neighbours share knowledge as well as objects."
    ],
    glossary:[["lend","prestare"],["household equipment","attrezzatura domestica"],["wasteful","uno spreco"],["grant","contributo"],["fee","quota"],["in advance","in anticipo"]],
    questions:[
      q("What originally inspired Priya?",["She wanted to borrow a drill","The council requested a library","She owned too many books"],0,"L’idea nacque quando le serviva un trapano per un lavoro molto breve."),
      q("How did the service begin?",["With 800 purchased tools","With 50 donated items","Inside a private shop"],1,"I fondatori raccolsero cinquanta oggetti donati."),
      q("Why did opening hours increase?",["Demand grew","Volunteers had no other work","The annual fee doubled"],0,"Il servizio si ampliò perché la domanda aumentò rapidamente."),
      q("How does the library reduce waiting times?",["It sells popular tools","It limits loans to seven days","It closes workshops"],1,"I prestiti sono limitati a sette giorni e vengono inviati promemoria."),
      q("What did the independent study measure?",["Products people avoided buying","Books read by members","Hours worked by the council"],0,"Lo studio stimò quasi duemila nuovi prodotti non acquistati."),
      q("What is the writer’s main conclusion?",["The project only saves money","Sharing objects also builds community","Electrical tools should be banned"],1,"L’ultimo paragrafo sottolinea sia il vantaggio pratico sia la condivisione di conoscenze.")
    ]
  },
  {
    id:"reading-b2-workweek",level:"B2",title:"What a four-day working week really changes",topic:"Lavoro, produttività e benessere",minutes:25,
    paragraphs:[
      "A regional marketing company recently completed a six-month trial of a four-day working week. Employees received the same salary and were expected to produce the same amount of work, but their standard week fell from thirty-eight hours to thirty-two. The company did not simply remove Friday from the calendar. Before the trial began, each team examined how it used time and identified routines that created little value.",
      "The most obvious target was meetings. Staff reported that they often attended hour-long meetings without knowing why their presence was necessary. During the trial, internal meetings were normally limited to twenty-five minutes, required a written agenda and included only people who needed to make or implement a decision. Status updates moved to a shared document. The company also introduced two daily periods during which messages were muted so that employees could concentrate on demanding tasks.",
      "At the end of six months, revenue had risen by four per cent compared with the same period the previous year, while the number of projects delivered on time had remained stable. Sick leave fell and most employees reported better sleep. These results appeared encouraging, yet they did not affect everyone equally. The customer support team found the change more difficult because clients still expected assistance five days a week. The company eventually divided that team into overlapping schedules, ensuring that some staff were available on Fridays while each individual still worked four days.",
      "Managers also noticed an unintended pressure. Because the new schedule was popular, some employees felt responsible for proving that it worked. They skipped breaks or worked rapidly to protect the extra day off. In response, the company began measuring workload and quality rather than simply counting completed tasks. Managers repeatedly reminded teams that the purpose of the trial was not to compress five exhausting days into four.",
      "The company has decided to continue the arrangement for another year, but its director refuses to describe the experiment as universal proof. A small marketing business can reorganise work more easily than a hospital, factory or transport network. Moreover, the trial took place among employees who already had considerable control over their schedules. The strongest conclusion is therefore limited: shorter working time can succeed when an organisation redesigns inefficient processes, protects service coverage and monitors hidden increases in intensity. The day off is the visible benefit, but careful management is what makes it possible."
    ],
    glossary:[["trial","sperimentazione"],["agenda","ordine del giorno"],["revenue","ricavi"],["overlapping","sovrapposti"],["workload","carico di lavoro"],["service coverage","copertura del servizio"]],
    questions:[
      q("What remained unchanged during the trial?",["Salary and expected output","Daily working hours","The meeting system"],0,"Stipendio e quantità di lavoro attesa restarono uguali."),
      q("What replaced many status meetings?",["Phone calls","A shared document","Friday workshops"],1,"Gli aggiornamenti di stato furono spostati in un documento condiviso."),
      q("Why was the change harder for customer support?",["They lacked computers","Clients expected five-day coverage","Their salaries were reduced"],1,"I clienti continuavano ad aspettarsi assistenza cinque giorni alla settimana."),
      q("What unintended behaviour did managers observe?",["Some employees skipped breaks","Teams scheduled longer meetings","Revenue reporting stopped"],0,"Alcune persone saltavano le pause per dimostrare che il modello funzionava."),
      q("Why is the director cautious about the results?",["The trial lost money","Every organisation has identical needs","The company and workforce were a specific case"],2,"Una piccola azienda con autonomia organizzativa non rappresenta automaticamente ospedali o fabbriche."),
      q("Which statement best expresses the author’s argument?",["A free Friday automatically raises productivity","Shorter weeks require process redesign and monitoring","All meetings should be eliminated"],1,"La conclusione collega il successo a riprogettazione, copertura e controllo dell’intensità.")
    ]
  },
  {
    id:"reading-c1-automation",level:"C1",title:"When efficient public services exclude the people they serve",topic:"Tecnologia, accessibilità e politiche pubbliche",minutes:30,
    paragraphs:[
      "Public authorities increasingly automate routine decisions: applications are checked, appointments allocated and eligibility assessed with limited human intervention. The attraction is understandable. Automated systems can process large volumes of information consistently, operate outside office hours and release staff from repetitive administrative work. Yet efficiency is not a neutral objective when the people most likely to need a service are also those least able to navigate its digital gateway.",
      "Consider an online housing-support system that rejects incomplete applications. From an administrative perspective, the rule appears fair because every applicant faces the same requirement. In practice, incompleteness may reflect unstable internet access, limited literacy, a disability that makes the interface difficult to use or uncertainty about documents written in unfamiliar legal language. Treating these circumstances as identical does not eliminate human judgement; it conceals a judgement within the design of the form.",
      "This problem is often described as a digital divide, but that phrase can be misleading if it suggests a simple separation between people who possess technology and people who do not. Access is layered. A person may own a smartphone but lack affordable data, a private place to upload documents or the confidence to identify a fraudulent message. Similarly, providing a public computer does not guarantee that a user can complete a complex procedure under time pressure while others wait behind them.",
      "Some administrations respond by adding telephone assistance or face-to-face centres. These channels are valuable, although they can become symbolic if they are understaffed or permitted only to explain a decision that no employee has authority to reconsider. Meaningful human support requires more than a person reading the same automated message aloud. Staff need sufficient information, discretion and time to identify exceptional circumstances and correct errors before those errors produce serious consequences.",
      "Opponents of automation sometimes imply that human decision-making is naturally compassionate and unbiased. Historical evidence does not support that assumption. Manual systems may be inconsistent, slow and influenced by prejudice. The relevant choice is therefore not between flawless people and inflexible machines. It is between different arrangements of responsibility. A well-designed automated process can make criteria visible, record how a conclusion was reached and reveal patterns that deserve investigation. A poorly designed human process can do none of these things.",
      "Accountability should consequently be treated as part of the service rather than as an external audit performed after harm occurs. Users should know when automation has influenced a decision, understand the main reasons for the outcome and have a practical route to challenge it. Decision-makers, meanwhile, should monitor not only average processing time but also abandonment rates, successful appeals and differences between demographic groups. A system that becomes faster while systematically losing particular users has not merely produced an unfortunate side effect; it has changed who the service is for.",
      "The most defensible approach combines automation with deliberately designed human intervention. Routine cases can move quickly, while uncertain or high-impact decisions receive proportionate review. Alternative channels remain available, and evidence from complaints is used to improve the main process rather than being treated as noise. Under this model, efficiency remains important, but it is assessed alongside accessibility, explainability and the possibility of correction. Public services do not succeed when a transaction is completed cheaply; they succeed when eligible people can actually obtain the support that policy promised them."
    ],
    glossary:[["eligibility","diritto/requisiti di accesso"],["gateway","punto di accesso"],["layered","composto da più livelli"],["discretion","margine decisionale"],["accountability","responsabilità verificabile"],["abandonment rate","tasso di abbandono"]],
    questions:[
      q("Why can a formally equal application rule be unfair in practice?",["It may hide unequal barriers","It always uses human judgement","It processes too few applications"],0,"Lo stesso requisito può avere effetti diversi quando accesso, alfabetizzazione o disabilità non sono uguali."),
      q("Why does the author call access ‘layered’?",["Technology ownership alone does not guarantee usable access","Every service requires several passwords","Public computers are always sufficient"],0,"Possedere un dispositivo è solo uno degli elementi necessari per accedere davvero."),
      q("When can human support become merely symbolic?",["When staff can explain but not reconsider decisions","When offices open at weekends","When users prefer telephone calls"],0,"L’assistenza è debole se il personale può soltanto leggere la decisione senza poterla correggere."),
      q("What false contrast does the author reject?",["Fast versus slow internet","Perfect humans versus rigid machines","Local versus national government"],1,"Il testo rifiuta l’idea che le persone siano naturalmente perfette e le macchine inevitabilmente rigide."),
      q("Which metric would reveal exclusion better than average processing time?",["Office electricity use","Abandonment and appeal patterns","The number of automated emails"],1,"Abbandoni, ricorsi riusciti e differenze demografiche mostrano chi viene perso dal sistema."),
      q("What is the passage’s central recommendation?",["Remove automation from every public service","Judge success only by low transaction cost","Combine automation, meaningful review and accessible alternatives"],2,"La conclusione propone automazione per i casi ordinari, revisione proporzionata e canali alternativi accessibili.")
    ]
  }
];