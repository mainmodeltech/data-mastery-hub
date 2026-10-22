import { test } from "node:test";
import assert from "node:assert/strict";

import { applyProgramImport, parseLiveDate, parseProgramRows } from "../../src/lib/import/programImport.ts";
import type { CourseModule } from "../../src/types/course.type.ts";

const H = ["Module", "Leçon", "Type", "Durée (min)", "Description", "Lien vidéo", "Date du live", "Lien du live", "Ressource (nom)", "Ressource (lien)"];
const row = (o: Partial<Record<number, string>>) => H.map((_, i) => o[i] ?? "");

test("programme : lignes valides", () => {
  const p = parseProgramRows([H, row({ 0: "M1", 1: "L1", 2: "Vidéo", 3: "8", 5: "https://v.com/1", 8: "Support", 9: "https://x.com/a.pdf" }), row({ 0: "M1", 1: "Live 1", 2: "live", 6: "25/12/2026 18:30" })]);
  assert.deepEqual(p.errors, []);
  assert.equal(p.lessons.length, 2);
  assert.equal(p.lessons[0].lesson.durationSeconds, 480);
  assert.equal(p.lessons[0].lesson.resources[0].fileType, "PDF");
  assert.equal(p.lessons[1].lesson.liveAt, "2026-12-25T18:30");
});

test("programme : erreurs ligne par ligne", () => {
  const p = parseProgramRows([H, row({ 0: "M1", 1: "L1", 2: "Vidéos" }), row({ 1: "L2", 2: "Quiz" }), row({ 0: "M", 1: "L3", 2: "Live", 6: "31/02/2026", 5: "ftp://x" })]);
  assert.equal(p.lessons.length, 0);
  assert.deepEqual(p.errors.map((e) => e.line), [2, 3, 4, 4]);
  assert.match(p.errors[0].message, /type inconnu "Vidéos"/);
});

test("programme : colonne obligatoire manquante, fichier vide", () => {
  assert.equal(parseProgramRows([["Module", "Type"], ["a", "Quiz"]]).errors[0].line, 1);
  assert.equal(parseProgramRows([]).errors.length, 1);
});

test("programme : date du live", () => {
  assert.equal(parseLiveDate("1/2/2027 9:05"), "2027-02-01T09:05");
  assert.equal(parseLiveDate("2027-02-01"), null);
});

test("programme : ajout seul, module de même titre, brouillons avec clientKey", () => {
  const content: CourseModule[] = [{ id: "m1", order: 1, title: "Module 1", lessons: [{ id: "l1", order: 1, title: "Existante", type: "VIDEO", status: "PUBLISHED", resources: [] }] }];
  const p = parseProgramRows([H, row({ 0: "  module 1 ", 1: "A", 2: "Vidéo" }), row({ 0: "Nouveau", 1: "B", 2: "Quiz" })]);
  const out = applyProgramImport(content, p);
  assert.equal(content[0].lessons.length, 1);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0].lessons.map((l) => l.title), ["Existante", "A"]);
  assert.equal(out[0].lessons[1].order, 2);
  assert.equal(out[0].lessons[1].status, "DRAFT");
  assert.ok(out[0].lessons[1].clientKey);
  assert.equal(out[1].lessons[0].quiz?.passThreshold, 70);
  assert.equal(out[0].lessons[0].status, "PUBLISHED");
});
