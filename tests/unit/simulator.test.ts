import assert from "node:assert/strict";
import { test } from "node:test";

import { clockOffsetMs, formatClock, isAnswered, percentTone, remainingSeconds, toggleChoice } from "../../src/lib/simulator.ts";

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
