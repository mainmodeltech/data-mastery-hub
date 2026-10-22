import { test } from "node:test";
import assert from "node:assert/strict";

import { applyQuizImport, parseQuizRows } from "../../src/lib/import/quizImport.ts";

const H = ["Question", "Choix A", "Choix B", "Choix C", "Choix D", "Choix E", "Choix F", "Choix G", "Choix H", "Bonne réponse", "Explication"];
const row = (q: string, choices: string[], answer: string, expl = "") => [q, ...Array.from({ length: 8 }, (_, i) => choices[i] ?? ""), answer, expl];

test("quiz : question valide", () => {
  const p = parseQuizRows([H, row("Q1 ?", ["a", "b", "c"], "b", "parce que")]);
  assert.deepEqual(p.errors, []);
  const q = p.questions[0].question;
  assert.equal(q.choices.length, 3);
  assert.deepEqual(q.choices.map((c) => c.correct), [false, true, false]);
  assert.equal(q.explanation, "parce que");
});

test("quiz : lettre minuscule et 8 choix", () => {
  const p = parseQuizRows([H, row("Q", ["1", "2", "3", "4", "5", "6", "7", "8"], "h")]);
  assert.deepEqual(p.errors, []);
  assert.equal(p.questions[0].question.choices[7].correct, true);
});

test("quiz : erreurs ligne par ligne", () => {
  const p = parseQuizRows([
    H,
    row("", ["a", "b"], "A"),
    row("Q2", ["a"], "A"),
    row("Q3", ["a", "b"], "C"),
    row("Q4", ["a", "b"], "A, B"),
    row("Q5", ["a", "b"], "Z"),
    row("Q6", ["a", "b"], ""),
  ]);
  assert.equal(p.questions.length, 0);
  assert.deepEqual(p.errors.map((e) => e.line), [2, 3, 4, 5, 6, 7]);
  assert.match(p.errors[2].message, /pointe un choix vide/);
});

test("quiz : un trou dans les choix est compacté, la lettre reste celle du fichier", () => {
  const p = parseQuizRows([H, row("Q", ["a", "b", "", "d"], "D")]);
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.questions[0].question.choices.map((c) => c.label), ["a", "b", "d"]);
  assert.equal(p.questions[0].question.choices[2].correct, true);
});

test("quiz : colonnes manquantes", () => {
  assert.equal(parseQuizRows([["Question", "Choix A"], ["x", "y"]]).errors[0].line, 1);
});

test("quiz : ajout à la banque sans rien remplacer", () => {
  const bank = [{ id: "1", text: "Ancienne", choices: [{ label: "a", correct: true }, { label: "b", correct: false }] }];
  const out = applyQuizImport(bank, parseQuizRows([H, row("Nouvelle", ["a", "b"], "A")]));
  assert.deepEqual(out.map((q) => q.text), ["Ancienne", "Nouvelle"]);
  assert.equal(bank.length, 1);
});
