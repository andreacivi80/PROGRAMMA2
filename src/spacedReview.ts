export type ReviewPattern = "Occasionale" | "Ricorrente" | "Stabile";
export type ReviewPlan = { delayDays:number; step:number; correctStreak:number; mastered:boolean; pattern:ReviewPattern; status:"Da ripassare"|"In consolidamento"|"Acquisito" };

export function planSpacedReview(remembered:boolean, wrongCount:number, correctStreak:number, step:number):ReviewPlan {
  const nextWrong = wrongCount + (remembered ? 0 : 1);
  if (!remembered) {
    const recurring = nextWrong >= 3;
    return { delayDays: recurring ? 0 : 1, step:0, correctStreak:0, mastered:false, pattern:recurring?"Ricorrente":"Occasionale", status:"Da ripassare" };
  }
  const nextStreak=correctStreak+1, recurring=wrongCount>=3, delays=recurring?[1,2,4,7,14]:[1,3,7,14,30], nextStep=Math.min(step+1,delays.length);
  const mastered=nextStreak>=5;
  return { delayDays:mastered?3650:delays[Math.min(step,delays.length-1)], step:nextStep, correctStreak:nextStreak, mastered, pattern:mastered?"Stabile":recurring?"Ricorrente":"Occasionale", status:mastered?"Acquisito":"In consolidamento" };
}
