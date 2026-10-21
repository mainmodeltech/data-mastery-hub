import { test } from "node:test";
import assert from "node:assert/strict";

import { parseCsv } from "../../src/lib/import/csv.ts";
import { normalizeHeader, toRecords } from "../../src/lib/import/sheet.ts";

test("csv : séparateur point-virgule et virgule détectés", () => {
  assert.deepEqual(parseCsv("a;b;c\n1;2;3"), [["a", "b", "c"], ["1", "2", "3"]]);
  assert.deepEqual(parseCsv("a,b,c\n1,2,3"), [["a", "b", "c"], ["1", "2", "3"]]);
});

test("csv : BOM, CRLF et lignes vides ignorées", () => {
  assert.deepEqual(parseCsv("\uFEFFa;b\r\n\r\n1;2\r\n;\r\n"), [["a", "b"], ["1", "2"]]);
});

test("csv : guillemets, séparateur et saut de ligne dans un champ, guillemets doublés", () => {
  assert.deepEqual(parseCsv('a;b\n"x;y";"il dit ""oui""\nsuite"'), [["a", "b"], ["x;y", 'il dit "oui"\nsuite']]);
});

test("csv : keepBlank conserve la numérotation des lignes", () => {
  assert.deepEqual(parseCsv("a;b\n\n1;2", { keepBlank: true }), [["a", "b"], [], ["1", "2"]]);
});

test("sheet : en-têtes normalisés et numéros de ligne", () => {
  assert.equal(normalizeHeader(" Durée (MIN) "), "duree min");
  const { records } = toRecords([["Module", "Leçon"], [], ["M1", "L1"]]);
  assert.equal(records[0].line, 3);
  assert.equal(records[0].cells["lecon"], "L1");
});
