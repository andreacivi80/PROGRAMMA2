import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../src/placementModel.ts", import.meta.url), "utf8")
  .replace('import type { Cefr } from "./curriculum";\n', "");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(`(function(exports,module){${compiled}\n})(module.exports,module);`, { module, console });
const { placementItems, evaluatePlacement } = module.exports;
const b2Evidence = { writing: "I worked on a difficult project because we had a short deadline. However, I organised the work and we completed it successfully. It was important because I learned how to communicate clearly with my colleagues.", mediation: "Yesterday I went to a meeting, but I was late because the train was cancelled.", oral: "I had a problem at work but I solved it because I asked my team for help and then we agreed on a practical solution." };
const c1Evidence = { writing: "Although the evidence appears encouraging, the limited sample undermines the strength of the conclusion. However, the broader implication is still relevant because the outcome may justify a further trial. Arguably, a transparent comparison group would make the recommendation more substantive and would reveal the extent to which the policy itself produced the improvement rather than merely coinciding with it.", mediation: "Yesterday I went to a meeting, but I was late because the train was cancelled.", oral: "Although the initial outcome appears feasible, I would remain cautious because the evidence comes from one region. Nevertheless, a larger trial is warranted, provided that its methods are transparent and the results are compared with an appropriate control group before any definitive recommendation is made." };
const blank = { writing: "", mediation: "", oral: "" };
const through = (level) => Object.fromEntries(placementItems.map((item) => [item.id, ["A1", "A2", "B1", "B2", "C1"].indexOf(item.level) <= ["A1", "A2", "B1", "B2", "C1"].indexOf(level) ? item.answer : -1]));
const expected = { A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1" };
for (const [profile, wanted] of Object.entries(expected)) {
  const got = evaluatePlacement(through(profile), profile === "C1" ? c1Evidence : profile === "B2" ? b2Evidence : blank).suggested;
  if (got !== wanted) throw new Error(`Profilo ${profile}: atteso ${wanted}, ottenuto ${got}`);
}
const lucky = Object.fromEntries(placementItems.map((item) => [item.id, item.level === "B2" || item.level === "C1" ? item.answer : -1]));
if (evaluatePlacement(lucky, blank).suggested !== "A1") throw new Error("Risposte alte casuali hanno superato i prerequisiti");
if (evaluatePlacement(through("B2"), blank).suggested !== "B1") throw new Error("B2 assegnato senza produzione scritta e orale");
if (evaluatePlacement(through("C1"), blank).suggested !== "B1") throw new Error("C1 assegnato senza produzione scritta e orale");
if (evaluatePlacement(through("C1"), b2Evidence).suggested === "C1") throw new Error("C1 assegnato con una produzione soltanto B2");
const noComprehension = Object.fromEntries(placementItems.map((item) => [item.id, item.kind === "reading" || item.kind === "listening" ? -1 : item.answer]));
if (["B2", "C1"].includes(evaluatePlacement(noComprehension, c1Evidence).suggested)) throw new Error("Livello alto assegnato senza prove di lettura e ascolto");
const boundary = through("B1");
placementItems.filter((item) => item.level === "B2").slice(0, 3).forEach((item) => { boundary[item.id] = item.answer; });
if (evaluatePlacement(boundary, c1Evidence).suggested !== "B1") throw new Error("Tre risposte B2 su sei hanno promosso un profilo di confine");
if (placementItems.length < 30) throw new Error("Il test deve avere almeno 30 prove oggettive");
for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
  const kinds = new Set(placementItems.filter((item) => item.level === level).map((item) => item.kind));
  if (!["grammar", "vocabulary", "reading", "listening"].every((kind) => kinds.has(kind))) throw new Error(`${level}: tipologie incomplete`);
}
let seed = 9137;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
for (let run = 0; run < 500; run++) {
  const guesses = Object.fromEntries(placementItems.map((item) => [item.id, Math.floor(random() * item.options.length)]));
  if (["B2", "C1"].includes(evaluatePlacement(guesses, blank).suggested)) throw new Error(`Tentativo casuale ${run} collocato troppo in alto`);
}
console.log(`Placement audit OK: ${placementItems.length} prove, 5 profili CEFR, confini, abilità sbilanciate e 500 tentativi casuali verificati.`);
