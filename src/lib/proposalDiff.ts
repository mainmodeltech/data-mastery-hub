/**
 * proposalDiff.ts — différences entre le programme EN LIGNE et une proposition (fonction pure, sans dépendance au DOM).
 * Les éléments se rapprochent par leur `id` en ligne ; ce qui n'existe pas en ligne est « ajouté ».
 * Une leçon qui passe d'un statut en ligne à BROUILLON est signalée à part (« passé en brouillon »).
 * Les éléments retirés ne sont pas listés : le serveur les refuse (rien ne se supprime dans une proposition).
 */
import type { CourseModule, Lesson, LessonResource } from "@/types/course.type";
import type { QuizQuestionEdit } from "@/types/authoring.type";
import type { ProposalBody, QuizBankDraft } from "@/types/proposal.type";

export type DiffKind = "added" | "modified" | "draft";
export type DiffScope = "module" | "lesson" | "resource" | "question";

export interface FieldChange {
  label: string;
  before: string;
  after: string;
}

export interface DiffEntry {
  kind: DiffKind;
  scope: DiffScope;
  /** Chemin lisible : module puis leçon, selon l'élément. */
  path: string[];
  title: string;
  changes: FieldChange[];
}

const TYPE_LABELS: Record<string, string> = { VIDEO: "Vidéo", RESOURCE: "Ressource", LIVE: "Live", QUIZ: "Quiz" };
const STATUS_LABELS: Record<string, string> = { PUBLISHED: "Publié", SCHEDULED: "Programmé", DRAFT: "Brouillon" };
const EMPTY = "—";

const text = (v: unknown): string => (v === null || v === undefined || v === "" ? EMPTY : String(v));
const minutes = (s: number | null | undefined): string => (s ? `${Math.round(s / 60)} min` : EMPTY);

function choicesSummary(q: QuizQuestionEdit): string {
  return q.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c.label}${c.correct ? " ✓" : ""}`).join(" | ");
}

type Getter<T> = [label: string, get: (x: T) => string];

function compare<T>(fields: Getter<T>[], before: T, after: T): FieldChange[] {
  const out: FieldChange[] = [];
  for (const [label, get] of fields) {
    const b = get(before);
    const a = get(after);
    if (b !== a) out.push({ label, before: b, after: a });
  }
  return out;
}

function describe<T>(fields: Getter<T>[], item: T): FieldChange[] {
  return fields.map(([label, get]) => ({ label, before: EMPTY, after: get(item) })).filter((c) => c.after !== EMPTY);
}

const MODULE_FIELDS: Getter<CourseModule>[] = [["Titre", (m) => text(m.title)]];

const LESSON_FIELDS: Getter<Lesson>[] = [
  ["Titre", (l) => text(l.title)],
  ["Sous-titre", (l) => text(l.subtitle)],
  ["Type", (l) => text(TYPE_LABELS[l.type] ?? l.type)],
  ["Statut", (l) => text(STATUS_LABELS[l.status] ?? l.status)],
  ["Durée", (l) => minutes(l.durationSeconds)],
  ["Lien de la vidéo", (l) => text(l.videoUrl)],
  ["Description", (l) => text(l.description)],
  ["Date du live", (l) => text(l.liveAt)],
  ["Lien du live", (l) => text(l.liveUrl)],
  ["Questions tirées", (l) => text(l.quiz?.questionCount)],
  ["Seuil de réussite (%)", (l) => text(l.quiz?.passThreshold)],
  ["Tentatives max", (l) => (l.type === "QUIZ" ? (l.quiz?.maxAttempts ? String(l.quiz.maxAttempts) : "Illimitées") : EMPTY)],
];

const RESOURCE_FIELDS: Getter<LessonResource>[] = [
  ["Nom", (r) => text(r.name)],
  ["Type de fichier", (r) => text(r.fileType)],
  ["Adresse", (r) => text(r.url)],
  ["Note", (r) => text(r.note)],
  ["Débloquée après le quiz", (r) => (r.lockedUntilQuiz ? "Oui" : "Non")],
];

const QUESTION_FIELDS: Getter<QuizQuestionEdit>[] = [
  ["Énoncé", (q) => text(q.text)],
  ["Explication", (q) => text(q.explanation)],
  ["Choix", (q) => choicesSummary(q)],
];

function bankRef(lesson: Lesson, existsLive: boolean): string {
  return existsLive ? lesson.id : lesson.clientKey ?? lesson.id;
}

function banksByRef(banks: QuizBankDraft[] | undefined): Map<string, QuizQuestionEdit[]> {
  return new Map((banks ?? []).map((b) => [b.lessonRef, b.questions ?? []]));
}

export function diffProposal(live: ProposalBody, proposal: ProposalBody): DiffEntry[] {
  const out: DiffEntry[] = [];
  const liveModules = new Map(live.content.modules.map((m) => [m.id, m]));
  const liveLessons = new Map<string, Lesson>();
  for (const m of live.content.modules) for (const l of m.lessons) liveLessons.set(l.id, l);
  const liveBanks = banksByRef(live.quizBanks);
  const propBanks = banksByRef(proposal.quizBanks);

  for (const m of proposal.content.modules) {
    const lm = liveModules.get(m.id);
    const mTitle = m.title || "Module sans titre";
    if (!lm) {
      out.push({ kind: "added", scope: "module", path: [], title: mTitle, changes: describe(MODULE_FIELDS, m) });
    } else {
      const changes = compare(MODULE_FIELDS, lm, m);
      if (changes.length) out.push({ kind: "modified", scope: "module", path: [], title: lm.title, changes });
    }

    for (const l of m.lessons) {
      const ll = liveLessons.get(l.id);
      const lTitle = l.title || "Leçon sans titre";
      if (!ll) {
        const changes = describe(LESSON_FIELDS, l);
        if (l.resources.length) changes.push({ label: "Ressources", before: EMPTY, after: String(l.resources.length) });
        const nq = propBanks.get(bankRef(l, false))?.length ?? 0;
        if (nq) changes.push({ label: "Questions", before: EMPTY, after: String(nq) });
        out.push({ kind: "added", scope: "lesson", path: [mTitle], title: lTitle, changes });
        continue;
      }

      const changes = compare(LESSON_FIELDS, ll, l);
      if (changes.length) {
        const toDraft = l.status === "DRAFT" && ll.status !== "DRAFT";
        out.push({ kind: toDraft ? "draft" : "modified", scope: "lesson", path: [mTitle], title: ll.title, changes });
      }

      const liveRes = new Map(ll.resources.map((r) => [r.id, r]));
      for (const r of l.resources) {
        const lr = liveRes.get(r.id);
        if (!lr) {
          out.push({ kind: "added", scope: "resource", path: [mTitle, lTitle], title: r.name || "Ressource sans nom", changes: describe(RESOURCE_FIELDS, r) });
        } else {
          const rc = compare(RESOURCE_FIELDS, lr, r);
          if (rc.length) out.push({ kind: "modified", scope: "resource", path: [mTitle, lTitle], title: lr.name, changes: rc });
        }
      }
    }

    // Questions : une banque par leçon quiz (existante : rapprochement par id de question)
    for (const l of m.lessons) {
      const existsLive = liveLessons.has(l.id);
      if (!existsLive) continue; // résumé déjà donné dans l'entrée « leçon ajoutée »
      const questions = propBanks.get(bankRef(l, true));
      if (!questions) continue;
      const liveQs = new Map((liveBanks.get(l.id) ?? []).map((q) => [q.id ?? "", q]));
      for (const q of questions) {
        const lq = q.id ? liveQs.get(q.id) : undefined;
        const path = [m.title || "Module", l.title || "Leçon"];
        if (!lq) out.push({ kind: "added", scope: "question", path, title: q.text || "Question sans énoncé", changes: describe(QUESTION_FIELDS, q) });
        else {
          const qc = compare(QUESTION_FIELDS, lq, q);
          if (qc.length) out.push({ kind: "modified", scope: "question", path, title: lq.text, changes: qc });
        }
      }
    }
  }
  return out;
}

/** Totaux par type de différence, pour l'en-tête de l'écran. */
export function summarizeDiff(entries: DiffEntry[]): { added: number; modified: number; draft: number } {
  return {
    added: entries.filter((e) => e.kind === "added").length,
    modified: entries.filter((e) => e.kind === "modified").length,
    draft: entries.filter((e) => e.kind === "draft").length,
  };
}

/** Une proposition contient-elle au moins une nouvelle leçon ? (case « publier les nouvelles leçons ») */
export function hasNewLessons(entries: DiffEntry[]): boolean {
  return entries.some((e) => e.scope === "lesson" && e.kind === "added");
}
