import React from "react";
import { Window } from "happy-dom";
import { createServer } from "vite";

const window = new Window({ url: "https://andreacivi80.github.io/PROGRAMMA2/", width: 390, height: 844 });
for (const [name, value] of Object.entries({ window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, Node: window.Node, Event: window.Event, MouseEvent: window.MouseEvent, getComputedStyle: window.getComputedStyle.bind(window), requestAnimationFrame: callback => setTimeout(callback, 0), cancelAnimationFrame: clearTimeout })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
window.HTMLElement.prototype.scrollIntoView = () => undefined;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const { render, fireEvent, screen, cleanup } = await import("@testing-library/react");
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });

try {
  const { default: WordGamesHub } = await server.ssrLoadModule("/src/WordGamesHub.tsx");
  const { semanticPrecision, precisionIsCorrect } = await server.ssrLoadModule("/src/semanticPrecision.ts");
  const { naturalReplies, naturalReplyIsCorrect } = await server.ssrLoadModule("/src/naturalReplies.ts");
  let precisionAnswerChecks = 0;
  const precisionAnswerFailures = [];
  for (const [level, questions] of Object.entries(semanticPrecision)) for (const question of questions) for (let choice = 0; choice < question.options.length; choice++) {
    precisionAnswerChecks++;
    if (precisionIsCorrect(question, choice) !== (choice === question.answer)) precisionAnswerFailures.push({level,prompt:question.prompt,choice});
  }
  check("all-precision-correct-and-wrong-paths", !precisionAnswerFailures.length && precisionAnswerChecks === 285, `${precisionAnswerChecks} risposte controllate`);
  let naturalAnswerChecks = 0;
  const naturalAnswerFailures = [];
  for (const [level, questions] of Object.entries(naturalReplies)) for (const question of questions) for (let choice = 0; choice < question.options.length; choice++) {
    naturalAnswerChecks++;
    if (naturalReplyIsCorrect(question, choice) !== (choice === question.answer)) naturalAnswerFailures.push({level,prompt:question.prompt,choice});
  }
  const naturalPrompts = Object.values(naturalReplies).flat().map(question => question.prompt);
  check("all-natural-reply-correct-and-wrong-paths", !naturalAnswerFailures.length && naturalAnswerChecks === 190 && new Set(naturalPrompts).size === naturalPrompts.length, `${naturalAnswerChecks} risposte controllate`);
  const mount = async label => {
    cleanup(); results.length = 0;
    render(React.createElement(WordGamesHub, { level: "B1", saved: {}, onComplete: (id, score) => results.push({ id, score }) }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(label, "i") })); await wait(10);
  };

  await mount("Mini cruciverba");
  const cell = screen.getAllByRole("textbox", { name: /Casella/ })[0];
  fireEvent.change(cell, { target: { value: "Z" } });
  fireEvent.click(screen.getByRole("button", { name: /Verifica il cruciverba/ })); await wait(5);
  check("crossword-input-and-wrong-feedback", Boolean(document.querySelector(".crosswordGrid .needsWork")) && Boolean(document.querySelector(".gameFeedback")));
  fireEvent.click(screen.getByRole("button", { name: /Salta il cruciverba/ })); await wait(5);
  check("crossword-skip-saves-and-returns", results.some(item => item.id === "crossword-b1") && Boolean(screen.getByText("Impara giocando")));

  await mount("Frasi dell’impiccato");
  for (let i = 0; i < 7; i++) { fireEvent.click(screen.getByRole("button", { name: i < 6 ? /Salta questa frase|Prossima frase/ : /Salta questa frase|Concludi la sessione/ })); await wait(3); }
  check("hangman-seven-rounds-complete", results.some(item => item.id === "hangman-b1"), JSON.stringify(results));

  await mount("Ordine delle parole");
  for (let i = 0; i < 7; i++) { fireEvent.click(screen.getByRole("button", { name: /Salta questa frase/ })); await wait(2); fireEvent.click(screen.getByRole("button", { name: i < 6 ? /Prossima frase/ : /Concludi la sessione/ })); await wait(3); }
  check("word-order-seven-rounds-complete", results.some(item => item.id === "wordorder-b1"));

  await mount("Abbina il significato");
  for (let i = 0; i < 8; i++) { fireEvent.click(screen.getByRole("button", { name: /Salta questo abbinamento/ })); await wait(2); fireEvent.click(screen.getByRole("button", { name: i < 7 ? /Prossimo abbinamento/ : /Concludi la sessione/ })); await wait(3); }
  check("matching-eight-rounds-complete", results.some(item => item.id === "matching-b1"));

  await mount("Memory inglese");
  let guard = 0;
  while (!results.some(item => item.id === "memory-b1") && guard++ < 120) {
    const enabled = [...document.querySelectorAll(".memoryGrid button:not(:disabled)")];
    if (enabled.length < 2) break;
    let matched = false;
    for (let candidate = 1; candidate < enabled.length && !matched; candidate++) {
      const current = [...document.querySelectorAll(".memoryGrid button:not(:disabled)")];
      if (current.length < 2) break;
      fireEvent.click(current[0]);
      fireEvent.click(current[Math.min(candidate, current.length - 1)]);
      await wait(2);
      matched = Boolean(document.querySelector(".gameFeedback.perfect"));
      const go = document.querySelector(".memoryContinue");
      if (go) { fireEvent.click(go); await wait(2); }
      if (results.some(item => item.id === "memory-b1")) break;
    }
  }
  check("memory-can-be-completed-and-saved", results.some(item => item.id === "memory-b1"), `azioni ${guard}`);

  await mount("Memory degli opposti");
  guard = 0;
  while (!results.some(item => item.id === "opposites-b1") && guard++ < 160) {
    const enabled = [...document.querySelectorAll(".oppositeGrid button:not(:disabled)")];
    if (enabled.length < 2) break;
    let matched = false;
    for (let candidate = 1; candidate < enabled.length && !matched; candidate++) {
      const current = [...document.querySelectorAll(".oppositeGrid button:not(:disabled)")];
      if (current.length < 2) break;
      fireEvent.click(current[0]);
      fireEvent.click(current[Math.min(candidate, current.length - 1)]);
      await wait(2);
      matched = Boolean(document.querySelector(".gameFeedback.perfect"));
      const go = document.querySelector(".memoryContinue");
      if (go) { fireEvent.click(go); await wait(2); }
      if (results.some(item => item.id === "opposites-b1")) break;
    }
  }
  check("opposites-memory-can-be-completed-and-saved", results.some(item => item.id === "opposites-b1"), `azioni ${guard}`);

  await mount("La parola precisa");
  let precisionPrompt = document.querySelector(".precisionSession .matchingClue")?.textContent?.trim();
  let precisionQuestion = semanticPrecision.B1.find(item => item.prompt === precisionPrompt);
  check("precision-question-comes-from-reviewed-level-bank", Boolean(precisionQuestion), precisionPrompt);
  if (precisionQuestion) {
    const wrong = precisionQuestion.options.find((_, index) => index !== precisionQuestion.answer);
    fireEvent.click(screen.getByRole("button", { name: wrong })); await wait(3);
    check("precision-wrong-answer-is-marked-and-explained", Boolean(document.querySelector(".precisionOptions .wrong")) && Boolean(document.querySelector(".gameFeedback:not(.perfect)")));
    fireEvent.click(screen.getByRole("button", { name: /Prossima frase/ })); await wait(3);
    precisionPrompt = document.querySelector(".precisionSession .matchingClue")?.textContent?.trim();
    precisionQuestion = semanticPrecision.B1.find(item => item.prompt === precisionPrompt);
    if (precisionQuestion) {
      fireEvent.click(screen.getByRole("button", { name: precisionQuestion.options[precisionQuestion.answer] })); await wait(3);
      check("precision-correct-answer-is-recognised", Boolean(document.querySelector(".precisionOptions .right")) && Boolean(document.querySelector(".gameFeedback.perfect")));
      fireEvent.click(screen.getByRole("button", { name: /Prossima frase/ })); await wait(3);
      for (let i = 0; i < 6; i++) { fireEvent.click(screen.getByRole("button", { name: /Salta questa domanda/ })); await wait(2); fireEvent.click(screen.getByRole("button", { name: i < 5 ? /Prossima frase/ : /Vedi il risultato finale/ })); await wait(3); }
    }
  }
  check("precision-eight-rounds-complete-and-save", results.some(item => item.id === "precision-b1"), JSON.stringify(results));

  await mount("La risposta naturale");
  let naturalPrompt = document.querySelector(".dialoguePrompt strong")?.textContent?.trim();
  let naturalQuestion = naturalReplies.B1.find(item => item.prompt === naturalPrompt);
  check("natural-reply-comes-from-reviewed-level-bank", Boolean(naturalQuestion), naturalPrompt);
  if (naturalQuestion) {
    const wrong = naturalQuestion.options.find((_, optionIndex) => optionIndex !== naturalQuestion.answer);
    fireEvent.click(screen.getByRole("button", { name: wrong })); await wait(3);
    check("natural-reply-wrong-choice-is-explained", Boolean(document.querySelector(".naturalReplyOptions .wrong")) && Boolean(document.querySelector(".gameFeedback:not(.perfect)")));
    fireEvent.click(screen.getByRole("button", { name: /Prossimo dialogo/ })); await wait(3);
    naturalPrompt = document.querySelector(".dialoguePrompt strong")?.textContent?.trim();
    naturalQuestion = naturalReplies.B1.find(item => item.prompt === naturalPrompt);
    if (naturalQuestion) {
      fireEvent.click(screen.getByRole("button", { name: naturalQuestion.options[naturalQuestion.answer] })); await wait(3);
      check("natural-reply-correct-choice-is-recognised", Boolean(document.querySelector(".naturalReplyOptions .right")) && Boolean(document.querySelector(".gameFeedback.perfect")));
      fireEvent.click(screen.getByRole("button", { name: /Prossimo dialogo/ })); await wait(3);
      for (let i = 0; i < 6; i++) { fireEvent.click(screen.getByRole("button", { name: /Salta questo dialogo/ })); await wait(2); fireEvent.click(screen.getByRole("button", { name: i < 5 ? /Prossimo dialogo/ : /Vedi il risultato finale/ })); await wait(3); }
    }
  }
  check("natural-reply-eight-rounds-complete-and-save", results.some(item => item.id === "natural-b1"), JSON.stringify(results));

  await mount("Parola misteriosa");
  const mystery = screen.getByPlaceholderText(/Scrivi la parola inglese/);
  fireEvent.change(mystery, { target: { value: "certainlywrong" } });
  fireEvent.click(screen.getByRole("button", { name: /Verifica la parola/ })); await wait(4);
  check("word-guess-wrong-answer-is-explained", Boolean(document.querySelector(".gameFeedback:not(.perfect)")));
  for (let i = 0; i < 6; i++) {
    if (i > 0) { fireEvent.click(screen.getByRole("button", { name: /Mostra la soluzione/ })); await wait(2); }
    fireEvent.click(screen.getByRole("button", { name: i < 5 ? /Prossima parola/ : /Concludi la sessione/ })); await wait(3);
  }
  check("word-guess-six-rounds-complete", results.some(item => item.id === "wordguess-b1"));

  await mount("Milionario in inglese");
  fireEvent.click(screen.getByRole("button", { name: "50:50" })); await wait(3);
  check("millionaire-fifty-fifty-hides-two", document.querySelectorAll(".millionaireOptions button[hidden]").length === 2);
  for (let i = 0; i < 10; i++) { fireEvent.click(screen.getByRole("button", { name: /Salta questa domanda/ })); await wait(2); fireEvent.click(screen.getByRole("button", { name: i < 9 ? /Prossima domanda/ : /Vedi il risultato finale/ })); await wait(3); }
  check("millionaire-ten-rounds-complete", results.some(item => item.id === "millionaire-b1"));

  await mount("Sfida a categorie");
  for (let i = 0; i < 12; i++) { fireEvent.click(screen.getByRole("button", { name: /Salta questa domanda/ })); await wait(2); fireEvent.click(screen.getByRole("button", { name: i < 11 ? /Prossima categoria/ : /Vedi il risultato finale/ })); await wait(3); }
  check("trivia-twelve-rounds-complete", results.some(item => item.id === "trivia-b1"));
} finally {
  cleanup(); await server.close();
}
const failed = checks.filter(item => !item.ok);
console.log(JSON.stringify({ exerciseType: "all-word-games", totalChecks: checks.length, checks, failed }, null, 2));
if (failed.length) process.exitCode = 1;
