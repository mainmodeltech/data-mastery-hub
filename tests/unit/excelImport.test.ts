import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { readSheet } from "read-excel-file/node";

import { cellToText } from "../../src/lib/import/sheet.ts";
import { parseProgramRows } from "../../src/lib/import/programImport.ts";
import { parseQuizRows } from "../../src/lib/import/quizImport.ts";

// Même chemin que le navigateur : cellules du classeur -> texte -> analyse commune avec le CSV.
const readModel = async (name: string) =>
  (await readSheet(readFileSync(new URL(`../../public/modeles/${name}`, import.meta.url)))).map((r) => r.map(cellToText));

test("excel : conversion des cellules", () => {
  assert.equal(cellToText(null), "");
  assert.equal(cellToText(8), "8");
  assert.equal(cellToText(1.5), "1.5");
  assert.equal(cellToText(true), "oui");
  assert.equal(cellToText("  Live "), "Live");
  assert.equal(cellToText(new Date(Date.UTC(2026, 11, 15, 18, 30))), "15/12/2026 18:30");
  assert.equal(cellToText(new Date(Date.UTC(2026, 11, 15))), "15/12/2026");
});

test("excel : le modèle de programme .xlsx s'importe comme le CSV", async () => {
  const p = parseProgramRows(await readModel("modele-programme.xlsx"));
  assert.deepEqual(p.errors, []);
  assert.equal(p.lessons.length, 3);
  assert.equal(p.lessons[0].lesson.durationSeconds, 480);
  assert.equal(p.lessons[1].lesson.liveAt, "2026-12-15T18:30");
});

test("excel : le modèle de quiz .xlsx s'importe comme le CSV", async () => {
  const q = parseQuizRows(await readModel("modele-quiz.xlsx"));
  assert.deepEqual(q.errors, []);
  assert.equal(q.questions.length, 3);
});
