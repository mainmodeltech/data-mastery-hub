/**
 * Différences programme en ligne / proposition.
 *   npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { diffProposal, hasNewLessons, summarizeDiff } from "../../src/lib/proposalDiff.ts";

const lesson = (id: string, over: Record<string, unknown> = {}) => ({
  id, order: 1, title: `Leçon ${id}`, type: "VIDEO", status: "PUBLISHED", resources: [], ...over,
});
const body = (modules: unknown[], quizBanks: unknown[] = []) =>
  ({ content: { formationId: "f", title: "F", updatedAt: null, settings: {}, certificateRules: {}, modules }, quizBanks }) as never;

const liveModules = () => [
  { id: "m1", order: 1, title: "Module 1", lessons: [lesson("l1"), lesson("l2", { type: "QUIZ", quiz: { questionCount: 5, passThreshold: 70, maxAttempts: 3 } })] },
];
const liveBanks = () => [{ lessonRef: "l2", questions: [{ id: "q1", text: "Q1 ?", choices: [{ id: "c1", label: "Oui", correct: true }, { id: "c2", label: "Non", correct: false }] }] }];

test("aucune différence quand la proposition est identique", () => {
  assert.deepEqual(diffProposal(body(liveModules(), liveBanks()), body(liveModules(), liveBanks())), []);
});

test("une leçon modifiée liste les champs avant / après", () => {
  const mods = liveModules();
  mods[0].lessons[0] = lesson("l1", { title: "Nouveau titre", durationSeconds: 600 });
  const d = diffProposal(body(liveModules(), liveBanks()), body(mods, liveBanks()));
  assert.equal(d.length, 1);
  assert.equal(d[0].kind, "modified");
  assert.equal(d[0].scope, "lesson");
  assert.deepEqual(d[0].changes.map((c) => c.label), ["Titre", "Durée"]);
  assert.deepEqual(d[0].changes[0], { label: "Titre", before: "Leçon l1", after: "Nouveau titre" });
});

test("passer une leçon en ligne en brouillon est signalé à part", () => {
  const mods = liveModules();
  mods[0].lessons[0] = lesson("l1", { status: "DRAFT" });
  const d = diffProposal(body(liveModules(), liveBanks()), body(mods, liveBanks()));
  assert.equal(d.length, 1);
  assert.equal(d[0].kind, "draft");
  assert.deepEqual(d[0].changes, [{ label: "Statut", before: "Publié", after: "Brouillon" }]);
});

test("un module et des leçons nouveaux sont ajoutés", () => {
  const mods = [
    ...liveModules(),
    { id: "new-m", order: 2, title: "Module 2", lessons: [lesson("new-l", { clientKey: "ck1", status: "DRAFT", resources: [{ id: "new-r", name: "Support", fileType: "PDF", url: null }] })] },
  ];
  const d = diffProposal(body(liveModules(), liveBanks()), body(mods, liveBanks()));
  assert.deepEqual(d.map((e) => `${e.kind}:${e.scope}`), ["added:module", "added:lesson"]);
  assert.equal(d[1].changes.find((c) => c.label === "Ressources")?.after, "1");
  assert.equal(hasNewLessons(d), true);
  assert.deepEqual(summarizeDiff(d), { added: 2, modified: 0, draft: 0 });
});

test("une ressource ajoutée ou modifiée sur une leçon existante", () => {
  const live = liveModules();
  live[0].lessons[0] = lesson("l1", { resources: [{ id: "r1", name: "Slides", fileType: "PDF", url: "https://a.fr" }] });
  const mods = liveModules();
  mods[0].lessons[0] = lesson("l1", {
    resources: [{ id: "r1", name: "Slides", fileType: "PDF", url: "https://b.fr" }, { id: "new-r", name: "Annexe", fileType: "PDF", url: null }],
  });
  const d = diffProposal(body(live, liveBanks()), body(mods, liveBanks()));
  assert.deepEqual(d.map((e) => `${e.kind}:${e.scope}:${e.title}`), ["modified:resource:Slides", "added:resource:Annexe"]);
  assert.equal(d[0].changes[0].after, "https://b.fr");
});

test("questions : modifiée et ajoutée ; nouvelle leçon quiz résumée par son nombre de questions", () => {
  const banks = [{
    lessonRef: "l2",
    questions: [
      { id: "q1", text: "Q1 reformulée ?", choices: [{ id: "c1", label: "Oui", correct: true }, { id: "c2", label: "Non", correct: false }] },
      { text: "Q2 ?", choices: [{ label: "A", correct: false }, { label: "B", correct: true }] },
    ],
  }, {
    lessonRef: "ck9", questions: [{ text: "N1", choices: [{ label: "A", correct: true }, { label: "B", correct: false }] }],
  }];
  const mods = liveModules();
  mods[0].lessons.push(lesson("new-q", { clientKey: "ck9", type: "QUIZ", status: "DRAFT", quiz: { questionCount: 1, passThreshold: 50, maxAttempts: null } }));
  const d = diffProposal(body(liveModules(), liveBanks()), body(mods, banks));
  assert.deepEqual(d.map((e) => `${e.kind}:${e.scope}`), ["added:lesson", "modified:question", "added:question"]);
  assert.equal(d[0].changes.find((c) => c.label === "Questions")?.after, "1");
  assert.equal(d[1].changes[0].after, "Q1 reformulée ?");
});
