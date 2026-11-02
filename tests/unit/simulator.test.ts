import assert from "node:assert/strict";
import { test } from "node:test";

import {
  clearOption, clockOffsetMs, formatAnswer, formatClock, isAnswered, percentTone, placeOption, remainingSeconds, toggleChoice,
} from "../../src/lib/simulator.ts";

test("le chronomètre suit l'horloge du serveur, pas celle du navigateur", () => {
  const localNow = 1_000_000;
  // le navigateur a 5 minutes de retard sur le serveur
  const offset = clockOffsetMs(new Date(localNow + 300_000).toISOString(), localNow);
  assert.equal(offset, 300_000);
  const deadline = new Date(localNow + 300_000 + 100 * 60_000).toISOString();
  assert.equal(remainingSeconds(deadline, offset, localNow), 6000);
  assert.equal(remainingSeconds(deadline, offset, localNow + 10_000), 5990);
});

test("le temps restant ne devient jamais négatif et le mode étude n'a pas d'échéance", () => {
  const past = new Date(1_000).toISOString();
  assert.equal(remainingSeconds(past, 0, 1_000_000), 0);
  assert.equal(remainingSeconds(null, 0, 1_000_000), null);
});

test("formatClock", () => {
  assert.equal(formatClock(6000), "1:40:00");
  assert.equal(formatClock(125), "2:05");
  assert.equal(formatClock(59), "0:59");
  assert.equal(formatClock(-3), "0:00");
});

test("isAnswered ignore les réponses vides", () => {
  assert.equal(isAnswered(null), false);
  assert.equal(isAnswered({ selected: [] }), false);
  assert.equal(isAnswered({ selected: ["A"] }), true);
  assert.equal(isAnswered({ answers: {} }), false);
  assert.equal(isAnswered({ answers: { S1: false } }), true);
});

test("toggleChoice remplace en choix unique et cumule en choix multiples", () => {
  assert.deepEqual(toggleChoice(["A"], "B", 1), ["B"]);
  assert.deepEqual(toggleChoice(["A"], "B", 2), ["A", "B"]);
  assert.deepEqual(toggleChoice(["A", "B"], "A", 2), ["B"]);
});

test("percentTone", () => {
  assert.equal(percentTone(80), "success");
  assert.equal(percentTone(65), "warning");
  assert.equal(percentTone(40), "error");
});

test("isAnswered reconnaît une correspondance et une réponse libre", () => {
  assert.equal(isAnswered({ pairs: {} }), false);
  assert.equal(isAnswered({ pairs: { P1: "O1" } }), true);
  assert.equal(isAnswered({ text: "   " }), false);
  assert.equal(isAnswered({ text: "a measure" }), true);
});

test("placeOption déplace une option déjà placée, sauf si la réutilisation est permise", () => {
  assert.deepEqual(placeOption({ P1: "O1" }, "P2", "O1", false), { P2: "O1" });
  assert.deepEqual(placeOption({ P1: "O1" }, "P2", "O1", true), { P1: "O1", P2: "O1" });
  assert.deepEqual(placeOption({ P1: "O1" }, "P1", "O2", false), { P1: "O2" });
  assert.deepEqual(clearOption({ P1: "O1", P2: "O2" }, "P1"), { P2: "O2" });
});

test("formatAnswer met les réponses en clair", () => {
  const payload = { prompts: [{ id: "P1", text: "SUM" }], options: [{ id: "O1", text: "Adds values" }] };
  assert.equal(formatAnswer(payload, { pairs: { P1: "O1" } }), "SUM → Adds values");
  assert.equal(formatAnswer(payload, { text: "  my answer " }), "my answer");
  assert.equal(formatAnswer(payload, { keywords: [{ id: "K1", accept: ["measure", "mesure"] }, { id: "K2", accept: ["filter context"] }] }),
    "measure / mesure · filter context");
  assert.equal(formatAnswer(payload, null), "Aucune réponse");
  assert.equal(formatAnswer(payload, { selected: ["A", "C"] }), "A, C");
});
