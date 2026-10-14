/**
 * Texte enrichi des échanges : blocs de code, formats en ligne, liens sûrs, coloration.
 *   npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { parseInline, parseRichText, plainText, safeHref } from "../../src/lib/richText.ts";
import { highlight } from "../../src/lib/highlight.ts";

test("un bloc de code garde sa langue et son indentation", () => {
  const blocks = parseRichText("Voici ma requête :\n\n```sql\nSELECT *\n  FROM ventes\n```\n\nMerci !");
  assert.equal(blocks.length, 3);
  assert.deepEqual(blocks[1], { t: "code", lang: "sql", text: "SELECT *\n  FROM ventes" });
  assert.equal(blocks[0].t, "p");
  assert.equal(blocks[2].t, "p");
});

test("un bloc de code non fermé court jusqu'à la fin du message", () => {
  const blocks = parseRichText("```python\nprint('a')\nprint('b')");
  assert.deepEqual(blocks, [{ t: "code", lang: "python", text: "print('a')\nprint('b')" }]);
});

test("le contenu d'un bloc de code n'est jamais interprété", () => {
  const blocks = parseRichText("```\n**pas gras** <script>alert(1)</script> [x](javascript:alert(1))\n```");
  assert.deepEqual(blocks, [{ t: "code", lang: "", text: "**pas gras** <script>alert(1)</script> [x](javascript:alert(1))" }]);
});

test("formats en ligne : gras, italique, code", () => {
  const inl = parseInline("un **mot gras**, un *mot penché* et `x = 1`");
  assert.deepEqual(inl.map((i) => i.t), ["text", "b", "text", "i", "text", "code"]);
  assert.deepEqual(inl[5], { t: "code", v: "x = 1" });
});

test("liens : seuls http(s) et mailto sont acceptés", () => {
  assert.equal(safeHref("https://exemple.com/a?b=1"), "https://exemple.com/a?b=1");
  assert.equal(safeHref("mailto:contact@exemple.com"), "mailto:contact@exemple.com");
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("data:text/html;base64,AAAA"), null);
  assert.equal(safeHref("//exemple.com"), null);

  const ok = parseInline("[site](https://exemple.com)");
  assert.deepEqual(ok[0], { t: "a", href: "https://exemple.com", c: [{ t: "text", v: "site" }] });
  const bad = parseInline("[piège](javascript:alert(1))");
  assert.ok(bad.every((i) => i.t !== "a"), "un lien dangereux reste du texte");
});

test("listes à puces et numérotées", () => {
  const blocks = parseRichText("Étapes :\n- ouvrir Power BI\n- charger le fichier\n\n1. filtrer\n2. publier");
  assert.deepEqual(blocks.map((b) => b.t), ["p", "ul", "ol"]);
  assert.equal((blocks[1] as { items: unknown[] }).items.length, 2);
  assert.equal((blocks[2] as { items: unknown[] }).items.length, 2);
});

test("plainText retire la mise en forme", () => {
  assert.equal(plainText("**Bonjour** `x`\n\n```sql\nSELECT 1\n```"), "Bonjour x SELECT 1");
});

test("coloration SQL : mots-clés, chaînes, commentaires, nombres", () => {
  const tokens = highlight("SELECT nom, 42 FROM t WHERE x = 'a' -- fin", "sql");
  const kinds = (k: string) => tokens.filter((t) => t.kind === k).map((t) => t.v);
  assert.deepEqual(kinds("kw"), ["SELECT", "FROM", "WHERE"]);
  assert.deepEqual(kinds("str"), ["'a'"]);
  assert.deepEqual(kinds("num"), ["42"]);
  assert.deepEqual(kinds("com"), ["-- fin"]);
  assert.equal(tokens.map((t) => t.v).join(""), "SELECT nom, 42 FROM t WHERE x = 'a' -- fin", "aucun caractère perdu");
});

test("coloration : langue inconnue ou absente = texte brut ; alias reconnus", () => {
  assert.deepEqual(highlight("rien de spécial", ""), [{ kind: "plain", v: "rien de spécial" }]);
  assert.deepEqual(highlight("x", "klingon"), [{ kind: "plain", v: "x" }]);
  assert.ok(highlight("def f(): return None", "py").some((t) => t.kind === "kw"));
  assert.ok(highlight("CALCULATE(SUM(Ventes[Montant]))", "dax").some((t) => t.kind === "kw" && t.v === "CALCULATE"));
});
