import { test } from "node:test";
import assert from "node:assert/strict";

import { parseInline, parseLegalText, placeholderCount } from "../../src/lib/legalText.ts";

test("titres, paragraphes et listes sont reconnus", () => {
  const blocks = parseLegalText("## 1. Objet\n\nPremière ligne\nsuite du même paragraphe.\n\n### Détail\n\n- un\n- deux\n\nFin.");
  assert.deepEqual(blocks.map((b) => b.t), ["h2", "p", "h3", "ul", "p"]);
  assert.equal((blocks[0] as { text: string }).text, "1. Objet");
  assert.deepEqual((blocks[1] as { parts: { v: string }[] }).parts.map((p) => p.v), ["Première ligne suite du même paragraphe."]);
  assert.equal((blocks[3] as { items: unknown[] }).items.length, 2);
});

test("le gras et l'italique sont séparés du texte, un marqueur non refermé reste du texte", () => {
  assert.deepEqual(parseInline("a **b** c *d* e"), [
    { t: "text", v: "a " }, { t: "b", v: "b" }, { t: "text", v: " c " }, { t: "i", v: "d" }, { t: "text", v: " e" },
  ]);
  assert.deepEqual(parseInline("5 * 3 et **ouvert"), [{ t: "text", v: "5 * 3 et **ouvert" }]);
});

test("aucun HTML n'est interprété : les balises restent du texte", () => {
  const blocks = parseLegalText("<script>alert(1)</script> et **gras**");
  assert.equal(blocks.length, 1);
  const parts = (blocks[0] as { parts: { t: string; v: string }[] }).parts;
  assert.equal(parts[0].t, "text");
  assert.ok(parts[0].v.includes("<script>"));
});

test("les fins de ligne Windows et les lignes vides multiples sont acceptées", () => {
  const blocks = parseLegalText("## A\r\n\r\n\r\ntexte\r\n- x\r\n");
  assert.deepEqual(blocks.map((b) => b.t), ["h2", "p", "ul"]);
});

test("les champs à compléter sont comptés", () => {
  assert.equal(placeholderCount("rien"), 0);
  assert.equal(placeholderCount("[À COMPLÉTER : a] et [À COMPLÉTER : b]"), 2);
});
