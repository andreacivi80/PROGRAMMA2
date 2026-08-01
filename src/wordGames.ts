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
   {phrase:"CAN I HELP YOU",hint:"A common offer of assistance."},
   {phrase:"I AM FROM ITALY",hint:"A simple sentence about your country."},
   {phrase:"SHE HAS A RED DRESS",hint:"Describe something a woman owns and its colour."},
   {phrase:"WE LIVE NEAR THE STATION",hint:"Say that your home is not far from the station."},
   {phrase:"DO YOU SPEAK ENGLISH",hint:"Ask someone about a language they know."},
   {phrase:"MY BROTHER IS A STUDENT",hint:"Describe a family member and his role."},
   {phrase:"THERE IS A BOOK ON THE TABLE",hint:"Say where one book is."},
   {phrase:"I GO TO WORK BY BUS",hint:"Describe how you travel to your job."},
   {phrase:"HE DOES NOT LIKE TEA",hint:"A negative sentence about a drink."},
   {phrase:"WHAT TIME IS IT",hint:"Ask for the current time."},
   {phrase:"PLEASE OPEN THE WINDOW",hint:"A polite instruction in a room."}
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
   {phrase:"YOU SHOULD TAKE AN UMBRELLA",hint:"Advice for a rainy day."},
   {phrase:"I HAVE JUST FINISHED MY HOMEWORK",hint:"A very recent completed action."},
   {phrase:"IF IT RAINS WE WILL STAY HOME",hint:"A possible future consequence of bad weather."},
   {phrase:"HOW LONG HAVE YOU LIVED HERE",hint:"Ask about the duration of someone’s home."},
   {phrase:"THE TRAIN LEAVES AT HALF PAST SIX",hint:"A timetable sentence."},
   {phrase:"I WAS COOKING WHEN YOU CALLED",hint:"A longer past action interrupted by a call."},
   {phrase:"WE ARE GOING TO VISIT LONDON",hint:"A future plan to see a city."},
   {phrase:"YOU DO NOT HAVE TO COME EARLY",hint:"Say that arriving early is not necessary."},
   {phrase:"THIS BAG IS HEAVIER THAN MINE",hint:"Compare the weight of two bags."},
   {phrase:"SHE TOLD ME ABOUT HER NEW JOB",hint:"Report information about someone’s work."},
   {phrase:"THE HOTEL IS OPPOSITE THE STATION",hint:"Describe where a hotel is located."}
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
   {phrase:"WE RAN OUT OF MILK",hint:"A phrasal verb meaning that none was left."},
   {phrase:"I HAVE BEEN WORKING HERE SINCE MAY",hint:"An activity continuing from a past starting point."},
   {phrase:"THE REPORT MUST BE FINISHED TODAY",hint:"A passive obligation with a deadline."},
   {phrase:"IF I WERE YOU I WOULD CHECK AGAIN",hint:"A common structure for giving advice."},
   {phrase:"HE SAID THAT THE TRAIN WAS LATE",hint:"Report what someone said about a delay."},
   {phrase:"WE NEED TO CUT DOWN ON WASTE",hint:"A phrasal verb meaning reduce."},
   {phrase:"THIS IS THE BEST BOOK I HAVE EVER READ",hint:"A superlative connected to life experience."},
   {phrase:"THE PERSON WHO CALLED LEFT NO MESSAGE",hint:"A defining relative clause about a caller."},
   {phrase:"BY THE TIME I ARRIVED THEY HAD LEFT",hint:"One past action happened before another."},
   {phrase:"I AM LOOKING FORWARD TO MEETING YOU",hint:"Express positive anticipation about a meeting."},
   {phrase:"ALTHOUGH IT WAS RAINING WE WENT OUT",hint:"Contrast bad weather with an unexpected decision."}
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
   {phrase:"SHE MAY HAVE MISUNDERSTOOD THE MESSAGE",hint:"A modal deduction about the past."},
   {phrase:"IF THEY HAD PLANNED AHEAD THE DELAY COULD HAVE BEEN AVOIDED",hint:"A past condition and a different possible outcome."},
   {phrase:"THE DATA APPEARS TO HAVE BEEN MISINTERPRETED",hint:"A cautious passive conclusion about earlier analysis."},
   {phrase:"NOT ONLY DID SHE APOLOGISE BUT SHE OFFERED A REFUND",hint:"Inversion adds emphasis to two positive actions."},
   {phrase:"THE PROJECT IS EXPECTED TO BE COMPLETED BY JUNE",hint:"An impersonal passive about a forecast deadline."},
   {phrase:"WE SHOULD HAVE TAKEN THE WARNING MORE SERIOUSLY",hint:"Regret about a warning in the past."},
   {phrase:"HARDLY HAD THE MEETING STARTED WHEN THE ALARM RANG",hint:"Inversion shows that one event followed another immediately."},
   {phrase:"THE COMPANY IS LIKELY TO REVISE ITS FORECAST",hint:"A cautious prediction about business figures."},
   {phrase:"WHAT CONCERNS ME MOST IS THE LACK OF EVIDENCE",hint:"A cleft structure emphasising the main concern."},
   {phrase:"THE DECISION WAS MADE ON THE ASSUMPTION THAT DEMAND WOULD RISE",hint:"A passive decision based on an uncertain expectation."},
   {phrase:"MUCH AS I UNDERSTAND THE ARGUMENT I CANNOT SUPPORT IT",hint:"A formal concession followed by disagreement."}
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
   {phrase:"THE POLICY MAY INADVERTENTLY UNDERMINE PUBLIC TRUST",hint:"An unintended consequence expressed cautiously."},
   {phrase:"HAD THE EVIDENCE BEEN DISCLOSED EARLIER THE OUTCOME MIGHT HAVE DIFFERED",hint:"An inverted conditional about withheld evidence."},
   {phrase:"THE REPORT STOPS SHORT OF ATTRIBUTING DIRECT RESPONSIBILITY",hint:"It approaches a conclusion without making the final accusation."},
   {phrase:"WHAT APPEARS PLAUSIBLE AT FIRST DOES NOT NECESSARILY SURVIVE SCRUTINY",hint:"An initial impression weakens under close examination."},
   {phrase:"NO SOONER HAD THE AGREEMENT BEEN SIGNED THAN FRESH OBJECTIONS EMERGED",hint:"Formal inversion for two events in rapid succession."},
   {phrase:"THE POLICY RESTS ON AN ASSUMPTION THAT HAS YET TO BE SUBSTANTIATED",hint:"The central premise still lacks supporting evidence."},
   {phrase:"WHILE THE PROPOSAL HAS MERIT ITS PRACTICAL IMPLICATIONS REMAIN UNCLEAR",hint:"A balanced concession followed by a reservation."},
   {phrase:"THE DISTINCTION IS CONCEPTUALLY USEFUL BUT EMPIRICALLY FRAGILE",hint:"A contrast between theoretical value and weak evidence."},
   {phrase:"WERE THE NEGOTIATIONS TO FAIL BOTH SIDES WOULD INCUR SUBSTANTIAL COSTS",hint:"A formal inverted hypothetical about negotiation failure."},
   {phrase:"THE STATEMENT WAS CAREFULLY WORDED TO PRESERVE PLAUSIBLE DENIABILITY",hint:"Deliberately ambiguous language protects the speaker’s position."},
   {phrase:"FOR ALL ITS APPARENT SIMPLICITY THE QUESTION RESISTS A DEFINITIVE ANSWER",hint:"A simple-looking issue remains difficult to settle."}
  ]
 }
};
