/**
 * Tests unitaires de la logique pure du front (sans navigateur ni dépendance de test) :
 *   npm run test:unit      (runner intégré de Node : node --test)
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { fill } from "../../src/lib/template.ts";
import { todoHref } from "../../src/lib/learnerLinks.ts";
import { emptyLike } from "../../src/lib/json.ts";
import { computeOrientationResult, type OrientationRule } from "../../src/lib/orientation.ts";

test("fill remplace les variables connues et laisse les inconnues", () => {
  assert.equal(fill("{count} inscrits le {date}", { count: "150+", date: "24 mars" }), "150+ inscrits le 24 mars");
  assert.equal(fill("Bonjour {nom}", {}), "Bonjour {nom}");
  assert.equal(fill("{a}{a}", { a: 2 }), "22");
  assert.equal(fill("Valeur {x}", { x: null }), "Valeur {x}");
  assert.equal(fill(undefined, { a: 1 }), "");
});

test("todoHref oriente chaque « à faire » vers la bonne page", () => {
  assert.equal(todoHref("pay-123"), "/espace/paiements");
  assert.equal(todoHref("project-abc"), "/espace/formations/abc/evaluations");
  assert.equal(todoHref("quiz-9"), "/espace/evaluations");
  assert.equal(todoHref("autre"), "/espace");
});

test("emptyLike vide tous les champs en gardant la forme", () => {
  assert.deepEqual(
    emptyLike({ title: "A", n: 3, on: true, tags: ["x"], cta: { label: "L", href: "/h" }, nothing: null }),
    { title: "", n: 0, on: false, tags: [], cta: { label: "", href: "" }, nothing: "" },
  );
});

// Mêmes règles que le contenu par défaut `page.orientation` du backend.
const RULES: OrientationRule[] = [
  { result: "b2b", anyOf: [{ availability: ["corporate"] }, { situation: ["manager"], goal: ["team"] }] },
  { result: "dataanalyst", anyOf: [{ goal: ["job"], situation: ["reorientation", "student"], tools: ["code", "tech"] }] },
  { result: "both", anyOf: [{ goal: ["job"], situation: ["reorientation", "student"] }] },
  { result: "dataanalyst", anyOf: [{ goal: ["analysis"] }, { goal: ["job"] }, { tools: ["code", "tech"] }, { situation: ["reorientation"] }] },
  { result: "powerbi", anyOf: [{ goal: ["dashboard"] }, { tools: ["excel"] }, { situation: ["employed", "manager"] }] },
];
const pick = (answers: Record<string, string>) => computeOrientationResult(answers, RULES, "both");

test("quiz : formation pour l'entreprise ou manager d'équipe → b2b", () => {
  assert.equal(pick({ availability: "corporate", goal: "dashboard" }), "b2b");
  assert.equal(pick({ situation: "manager", goal: "team", availability: "evenings" }), "b2b");
});

test("quiz : reconversion vers un poste data → data analyst (technique) ou parcours complet", () => {
  assert.equal(pick({ situation: "reorientation", goal: "job", tools: "code", availability: "evenings" }), "dataanalyst");
  assert.equal(pick({ situation: "student", goal: "job", tools: "basic", availability: "evenings" }), "both");
});

test("quiz : analyse de données → data analyst ; tableaux de bord ou Excel → Power BI", () => {
  assert.equal(pick({ situation: "employed", goal: "analysis", tools: "excel", availability: "evenings" }), "dataanalyst");
  assert.equal(pick({ situation: "employed", goal: "dashboard", tools: "basic", availability: "evenings" }), "powerbi");
  assert.equal(pick({ situation: "student", goal: "team", tools: "excel", availability: "flexible" }), "powerbi");
});

test("quiz : aucune règle satisfaite → résultat par défaut", () => {
  assert.equal(pick({ situation: "student", goal: "team", tools: "basic", availability: "flexible" }), "both");
  assert.equal(computeOrientationResult({}, [], "x"), "x");
});
