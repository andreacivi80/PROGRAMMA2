import type {Cefr} from "./curriculum";

export type CrosswordEntry={answer:string;clue:string};
export type HangmanEntry={phrase:string;hint:string};
export type WordGameSet={crossword:CrosswordEntry[];hangman:HangmanEntry[]};

export const wordGameSets:Record<Cefr,WordGameSet>={
 A1:{
  crossword:[
   {answer:"FAMILY",clue:"The people you live with or are related to."},
   {answer:"WATER",clue:"You drink this when you are thirsty."},
   {answer:"TABLE",clue:"You put plates and glasses on it."},
   {answer:"HOUSE",clue:"A building where people live."},
   {answer:"SCHOOL",clue:"A place where students learn."},
   {answer:"FRIEND",clue:"A person you like and know well."},
   {answer:"WINDOW",clue:"You can look outside through it."},
   {answer:"APPLE",clue:"A round fruit that can be red or green."}
  ],
  hangman:[
   {phrase:"GOOD MORNING",hint:"A greeting used before midday."},
   {phrase:"I LIKE COFFEE",hint:"A simple sentence about a drink you enjoy."},
   {phrase:"WHERE ARE YOU",hint:"A question about someone's location."},
   {phrase:"THIS IS MY FRIEND",hint:"Use this sentence to introduce someone."},
   {phrase:"CAN I HELP YOU",hint:"A common offer of assistance."}
  ]
 },
 A2:{
  crossword:[
   {answer:"JOURNEY",clue:"The act of travelling from one place to another."},
   {answer:"TICKET",clue:"You often need this to travel by train."},
   {answer:"WEATHER",clue:"Sun, rain, wind and temperature."},
   {answer:"MARKET",clue:"A place where people buy and sell things."},
   {answer:"RECIPE",clue:"Instructions for preparing a dish."},
   {answer:"HOLIDAY",clue:"Time away from work or school."},
   {answer:"NEIGHBOUR",clue:"A person who lives near you."},
   {answer:"APPOINTMENT",clue:"An arranged time to meet someone."}
  ],
  hangman:[
   {phrase:"I HAVE NEVER BEEN THERE",hint:"A Present Perfect sentence about experience."},
   {phrase:"COULD I HAVE THE BILL",hint:"A polite request at a restaurant."},
   {phrase:"SHE IS WAITING FOR THE BUS",hint:"An action happening now."},
   {phrase:"WE WENT TO THE MARKET",hint:"A completed action in the past."},
   {phrase:"YOU SHOULD TAKE AN UMBRELLA",hint:"Advice for a rainy day."}
  ]
 },
 B1:{
  crossword:[
   {answer:"DEADLINE",clue:"The latest time by which work must be finished."},
   {answer:"FEEDBACK",clue:"Comments intended to help someone improve."},
   {answer:"COMMUTE",clue:"Travel regularly between home and work."},
   {answer:"NEGOTIATE",clue:"Discuss in order to reach an agreement."},
   {answer:"CONFIDENT",clue:"Feeling sure about your abilities."},
   {answer:"EXPERIENCE",clue:"Knowledge gained by doing something."},
   {answer:"RECOMMEND",clue:"Suggest that something is suitable or good."},
   {answer:"CHALLENGE",clue:"A difficult task that tests your ability."}
  ],
  hangman:[
   {phrase:"I USED TO WORK FROM HOME",hint:"A past habit that is no longer true."},
   {phrase:"THE MEETING HAS BEEN POSTPONED",hint:"A passive sentence about a changed schedule."},
   {phrase:"IF I HAD MORE TIME I WOULD TRAVEL",hint:"An imaginary present situation."},
   {phrase:"SHE ASKED ME TO CALL BACK",hint:"Reported speech with an infinitive."},
   {phrase:"WE RAN OUT OF MILK",hint:"A phrasal verb meaning that none was left."}
  ]
 },
 B2:{
  crossword:[
   {answer:"SUSTAINABLE",clue:"Able to continue without harming future resources."},
   {answer:"PERSPECTIVE",clue:"A particular way of viewing a situation."},
   {answer:"MISLEADING",clue:"Giving an incorrect idea or impression."},
   {answer:"COMPROMISE",clue:"An agreement in which both sides make concessions."},
   {answer:"INEVITABLE",clue:"Certain to happen and impossible to avoid."},
   {answer:"AWARENESS",clue:"Knowledge or understanding of a situation."},
   {answer:"OUTCOME",clue:"The final result of a process or event."},
   {answer:"RELIABLE",clue:"Consistently good and able to be trusted."}
  ],
  hangman:[
   {phrase:"HAD I KNOWN I WOULD HAVE CALLED",hint:"An inverted third conditional."},
   {phrase:"THE PROPOSAL FELL SHORT OF EXPECTATIONS",hint:"It was not as good as people hoped."},
   {phrase:"DESPITE THE DELAY WE MET THE DEADLINE",hint:"A contrast followed by a noun phrase."},
   {phrase:"THE ISSUE NEEDS TO BE LOOKED INTO",hint:"A passive form with a phrasal verb."},
   {phrase:"SHE MAY HAVE MISUNDERSTOOD THE MESSAGE",hint:"A modal deduction about the past."}
  ]
 },
 C1:{
  crossword:[
   {answer:"AMBIGUOUS",clue:"Open to more than one interpretation."},
   {answer:"SCRUTINY",clue:"Very careful and detailed examination."},
   {answer:"UNDERMINE",clue:"Gradually weaken confidence or authority."},
   {answer:"PLAUSIBLE",clue:"Seeming reasonable or likely to be true."},
   {answer:"ACCOUNTABILITY",clue:"Responsibility for decisions and their consequences."},
   {answer:"CONCESSION",clue:"Something accepted or given up to reach agreement."},
   {answer:"COHERENT",clue:"Logical, consistent and easy to understand."},
   {answer:"NUANCE",clue:"A subtle difference in meaning or expression."}
  ],
  hangman:[
   {phrase:"BE THAT AS IT MAY THE EVIDENCE REMAINS INCONCLUSIVE",hint:"A formal concession followed by a cautious judgement."},
   {phrase:"THE CLAIM DOES NOT WITHSTAND CLOSE SCRUTINY",hint:"Careful examination exposes weaknesses in the claim."},
   {phrase:"LITTLE DID THEY REALISE WHAT WAS AT STAKE",hint:"Negative inversion used for dramatic emphasis."},
   {phrase:"HER REMARKS WERE OPEN TO INTERPRETATION",hint:"The meaning was not completely unambiguous."},
   {phrase:"THE POLICY MAY INADVERTENTLY UNDERMINE PUBLIC TRUST",hint:"An unintended consequence expressed cautiously."}
  ]
 }
};
