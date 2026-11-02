import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addKeyword, addMatchOption, addMatchPrompt, blankMatching, blankShortAnswer, parseAccept, removeKeyword, removeMatchOption,
  removeMatchPrompt, setMatchPair,
} from "../../src/lib/simulatorEditor.ts";

test("parseAccept découpe sur virgule, point-virgule et retour à la ligne, sans doublon", () => {
  assert.deepEqual(parseAccept("measure, mesure ; Measure\nmétrique"), ["measure", "mesure", "métrique"]);
  assert.deepEqual(parseAccept("  ,, ;  "), []);
  assert.deepEqual(parseAccept("filter context"), ["filter context"]);
});

test("retirer un élément renumérote les identifiants et conserve les bonnes associations", () => {
  const p = {
    prompts: [{ id: "P1", text: "a" }, { id: "P2", text: "b" }, { id: "P3", text: "c" }],
    options: [{ id: "O1", text: "x" }, { id: "O2", text: "y" }, { id: "O3", text: "z" }, { id: "O4", text: "w" }],
    pairs: { P1: "O1", P2: "O2", P3: "O3" },
  };
  const noB = removeMatchPrompt(p, 1);
  assert.deepEqual(noB.prompts, [{ id: "P1", text: "a" }, { id: "P2", text: "c" }]);
  assert.deepEqual(noB.pairs, { P1: "O1", P2: "O3" });

  const noY = removeMatchOption(p, 1);                       // l'option « y » disparaît : son association aussi
  assert.deepEqual(noY.options?.map((o) => o.id), ["O1", "O2", "O3"]);
  assert.deepEqual(noY.pairs, { P1: "O1", P3: "O2" });
  assert.deepEqual(noY.options?.map((o) => o.text), ["x", "z", "w"]);
});

test("les ajouts respectent les plafonds du serveur", () => {
  let p = blankMatching();
  for (let i = 0; i < 10; i++) p = addMatchPrompt(p);
  assert.equal(p.prompts?.length, 6);
  for (let i = 0; i < 10; i++) p = addMatchOption(p);
  assert.equal(p.options?.length, 8);
  let s = blankShortAnswer();
  for (let i = 0; i < 12; i++) s = addKeyword(s);
  assert.equal(s.keywords?.length, 8);
  assert.deepEqual(removeKeyword(s, 0).keywords?.map((k) => k.id), ["K1", "K2", "K3", "K4", "K5", "K6", "K7"]);
});

test("setMatchPair pose ou retire une association", () => {
  const p = setMatchPair(blankMatching(), "P2", "O3");
  assert.equal(p.pairs?.P2, "O3");
  assert.equal("P2" in setMatchPair(p, "P2", "").pairs!, false);
});
