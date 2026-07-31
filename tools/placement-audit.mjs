import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../src/placementModel.ts", import.meta.url), "utf8")
  .replace('import type { Cefr } from "./curriculum";\n', "");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(`(function(exports,module){${compiled}\n})(module.exports,module);`, { module, console });
const { placementItems, evaluatePlacement } = module.exports;
const evidence = { writing: "I worked on a difficult project because we had a short deadline. However, I organised the work and we completed it successfully. It was important because I learned how to communicate clearly with my colleagues.", mediation: "Yesterday I went to a meeting, but I was late because the train was cancelled.", oral: "I had a problem at work but I solved it because I asked my team for help and then we agreed on a practical solution." };
const blank = { writing: "", mediation: "", oral: "" };
const through = (level) => Object.fromEntries(placementItems.map((item) => [item.id, ["A1", "A2", "B1", "B2", "C1"].indexOf(item.level) <= ["A1", "A2", "B1", "B2", "C1"].indexOf(level) ? item.answer : -1]));
const expected = { A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1" };
for (const [profile, wanted] of Object.entries(expected)) {
  const got = evaluatePlacement(through(profile), profile === "B2" || profile === "C1" ? evidence : blank).suggested;
  if (got !== wanted) throw new Error(`Profilo ${profile}: atteso ${wanted}, ottenuto ${got}`);
}
const lucky = Object.fromEntries(placementItems.map((item) => [item.id, item.level === "B2" || item.level === "C1" ? item.answer : -1]));
if (evaluatePlacement(lucky, blank).suggested !== "A1") throw new Error("Risposte alte casuali hanno superato i prerequisiti");
if (placementItems.length < 30) throw new Error("Il test deve avere almeno 30 prove oggettive");
for (const level of ["A1", "A2", "B1", "B2", "C1"]) {
  const kinds = new Set(placementItems.filter((item) => item.level === level).map((item) => item.kind));
  if (!["grammar", "vocabulary", "reading", "listening"].every((kind) => kinds.has(kind))) throw new Error(`${level}: tipologie incomplete`);
}
console.log(`Placement audit OK: ${placementItems.length} prove, 5 profili CEFR e profilo casuale verificati.`);
