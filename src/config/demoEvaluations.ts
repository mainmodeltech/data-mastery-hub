/**
 * demoEvaluations.ts — données de démonstration du Lot 6 (quiz, projet final, suivi de session).
 * Utilisées UNIQUEMENT quand le backend n'expose pas encore les endpoints (voir
 * src/types/evaluation.type.ts) ; l'UI affiche alors un bandeau « données de démonstration ».
 * L'état (tentatives, fichiers déposés, appel) est gardé dans localStorage pour que la
 * démonstration reste cohérente d'un écran à l'autre ; aucun fichier n'est réellement envoyé.
 */
import type { LearnerCourse } from "@/types/course.type";
import type {
  AttendanceUpdate,
  CertificateCondition,
  EvaluationsOverview,
  ProjectFile,
  ProjectOverview,
  QuizAttemptResult,
  QuizAttemptStart,
  QuizQuestion,
  QuizSubmission,
  QuizSummary,
  SessionLive,
  SessionTracking,
} from "@/types/evaluation.type";
import { buildDemoContent, DEMO_FORMATION_ID } from "@/config/demoCourse";
import { flattenLessons } from "@/types/course.type";

// ─── Banque de questions (quiz du module 3 — DAX) ─────────────────────────────

interface DemoQuestion extends QuizQuestion {
  correctChoiceId: string;
  explanation: string;
}

const q = (
  id: string,
  text: string,
  choices: [string, string, string, string],
  correct: "a" | "b" | "c" | "d",
  explanation: string
): DemoQuestion => ({
  id,
  text,
  choices: choices.map((label, i) => ({ id: "abcd"[i], label })),
  correctChoiceId: correct,
  explanation,
});

const DAX_BANK: DemoQuestion[] = [
  q("q1", "Quelle est la différence principale entre une mesure et une colonne calculée ?",
    ["La mesure est stockée ligne par ligne dans le modèle", "La mesure est évaluée à la volée selon le contexte du visuel", "La colonne calculée ne peut pas utiliser de fonctions DAX", "Il n'y a aucune différence"],
    "b", "Une mesure est calculée à l'affichage, dans le contexte de filtre du visuel ; une colonne calculée est matérialisée dans la table."),
  q("q2", "Quelle fonction renvoie le nombre de lignes d'une table ?",
    ["COUNTROWS", "SUMROWS", "TOTALROWS", "ROWCOUNT"],
    "a", "COUNTROWS(Table) compte les lignes de la table dans le contexte de filtre courant."),
  q("q3", "Que fait la fonction CALCULATE dans une mesure DAX ?",
    ["Il remplace le contexte de filtre existant sur la colonne indiquée", "Il ajoute toujours un filtre sans rien modifier", "Il modifie le contexte de filtre avant d'évaluer l'expression", "Il ne fonctionne que dans une colonne calculée"],
    "c", "CALCULATE évalue une expression dans un contexte de filtre modifié par ses arguments de filtre."),
  q("q4", "Quelle fonction permet de comparer avec la même période l'an dernier ?",
    ["PREVIOUSYEAR seulement", "SAMEPERIODLASTYEAR", "DATEADD uniquement avec des heures", "LASTDATE"],
    "b", "SAMEPERIODLASTYEAR décale la période courante d'un an en arrière sur une table calendrier."),
  q("q5", "Pour que les fonctions de temps DAX fonctionnent bien, il faut :",
    ["Une table calendrier avec des dates continues, marquée comme table de dates", "Uniquement une colonne texte pour le mois", "Aucune table calendrier", "Une relation plusieurs-à-plusieurs"],
    "a", "Une table de dates continue, marquée comme telle, est la base de toute l'intelligence temporelle."),
  q("q6", "Quelle expression calcule le total des ventes sans tenir compte du filtre sur la région ?",
    ["CALCULATE(SUM(Ventes[Montant]), REMOVEFILTERS(Regions[Region]))", "SUM(Ventes[Montant])", "COUNTROWS(Ventes)", "VALUES(Regions[Region])"],
    "a", "REMOVEFILTERS dans CALCULATE supprime le filtre existant sur la colonne indiquée."),
  q("q7", "Que signifie « contexte de ligne » ?",
    ["L'ensemble des filtres appliqués par les segments", "La ligne courante lors de l'évaluation d'une colonne calculée ou d'un itérateur", "Le nombre de lignes du visuel", "Un type de relation"],
    "b", "Le contexte de ligne désigne la ligne en cours d'itération (colonne calculée, SUMX, etc.)."),
  q("q8", "Quelle fonction est un itérateur ?",
    ["SUM", "SUMX", "MAX", "COUNT"],
    "b", "Les fonctions suffixées par X (SUMX, AVERAGEX…) évaluent une expression ligne par ligne."),
  q("q9", "Quel opérateur DAX réalise une division sans erreur si le dénominateur est nul ?",
    ["/", "DIVIDE", "SAFEDIV", "IFERROR uniquement"],
    "b", "DIVIDE(numérateur, dénominateur [, alternative]) gère proprement la division par zéro."),
  q("q10", "Dans quel ordre est-il recommandé de construire un modèle avant d'écrire du DAX ?",
    ["DAX, puis relations, puis données", "Données propres, modèle en étoile, puis mesures DAX", "Visuels, puis données", "Peu importe l'ordre"],
    "b", "Un modèle en étoile propre simplifie le DAX et améliore les performances."),
];

// ─── État de démonstration persisté ───────────────────────────────────────────

interface DemoQuizState {
  attemptsUsed: number;
  bestScore: number | null;
  passed: boolean;
}

interface DemoState {
  quizzes: Record<string, DemoQuizState>;
  projectFiles: ProjectFile[];
  attendance: Record<string, string[]>;
  attempts: Record<string, { quizId: string; startedAt: string }>;
}

const STORAGE_KEY = "demo-evaluations-v1";
let memory: DemoState = { quizzes: {}, projectFiles: [], attendance: {}, attempts: {} };

function read(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) memory = { ...memory, ...(JSON.parse(raw) as DemoState) };
  } catch {
    /* stockage indisponible : on garde l'état en mémoire */
  }
  return memory;
}

function write(next: DemoState) {
  memory = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignoré */
  }
}

// ─── Aperçu des évaluations (apprenant) ───────────────────────────────────────

export const DEMO_QUIZ_M3_ID = "demo-quiz-m3";
const QUIZ_MAX_ATTEMPTS = 3;
const PASS_THRESHOLD = 70;

function quizLessonId(moduleIndex: number): string | null {
  const content = buildDemoContent();
  return content.modules[moduleIndex]?.lessons.find((l) => l.type === "QUIZ")?.id ?? null;
}

export function buildDemoOverview(formationId: string = DEMO_FORMATION_ID): EvaluationsOverview {
  const state = read();
  const m3 = state.quizzes[DEMO_QUIZ_M3_ID];
  const m3Passed = !!m3?.passed;
  const m3Used = m3?.attemptsUsed ?? 0;

  const quizzes: QuizSummary[] = [
    { id: "demo-quiz-m1", lessonId: quizLessonId(0), title: "Quiz Module 1 — Power Query", questionCount: 10, timeLimitMinutes: null, passThreshold: PASS_THRESHOLD, maxAttempts: QUIZ_MAX_ATTEMPTS, attemptsUsed: 1, bestScore: 90, status: "PASSED", optional: false },
    { id: "demo-quiz-m2", lessonId: quizLessonId(1), title: "Quiz Module 2 — Modélisation", questionCount: 8, timeLimitMinutes: null, passThreshold: PASS_THRESHOLD, maxAttempts: QUIZ_MAX_ATTEMPTS, attemptsUsed: 2, bestScore: 75, status: "PASSED", optional: false },
    {
      id: DEMO_QUIZ_M3_ID,
      lessonId: quizLessonId(2),
      title: "Quiz Module 3 — DAX",
      questionCount: DAX_BANK.length,
      timeLimitMinutes: 10,
      passThreshold: PASS_THRESHOLD,
      maxAttempts: QUIZ_MAX_ATTEMPTS,
      attemptsUsed: m3Used,
      bestScore: m3?.bestScore ?? null,
      status: m3Passed ? "PASSED" : m3Used >= QUIZ_MAX_ATTEMPTS ? "FAILED" : "TO_DO",
      dueLabel: m3Passed ? null : "Avant ven.",
      optional: false,
    },
    { id: "demo-quiz-m4", lessonId: quizLessonId(3), title: "Quiz Module 4 — Visualisation", questionCount: 10, timeLimitMinutes: null, passThreshold: PASS_THRESHOLD, maxAttempts: QUIZ_MAX_ATTEMPTS, attemptsUsed: 0, bestScore: null, status: m3Passed ? "AVAILABLE" : "LOCKED", optional: false },
    { id: "demo-quiz-exam", lessonId: null, title: "Examen blanc PL-300 (optionnel)", questionCount: 40, timeLimitMinutes: 60, passThreshold: PASS_THRESHOLD, maxAttempts: null, attemptsUsed: 0, bestScore: null, status: "AVAILABLE", optional: true },
  ];

  const required = quizzes.filter((x) => !x.optional);
  const passedCount = required.filter((x) => x.status === "PASSED").length;
  const lessonsTotal = flattenLessons(buildDemoContent()).length;
  const lessonsDone = 23 + (m3Passed ? 1 : 0);
  const lessonsPercent = Math.round((lessonsDone / lessonsTotal) * 100);
  const quizPercent = Math.round((passedCount / required.length) * 100);

  const conditions: CertificateCondition[] = [
    { key: "LESSONS", label: "Leçons terminées (80 % requis)", valueLabel: `${lessonsPercent} %`, percent: lessonsPercent, met: lessonsPercent >= 80 },
    { key: "QUIZZES", label: "Quiz réussis (tous les modules)", valueLabel: `${passedCount} / ${required.length}`, percent: quizPercent, met: passedCount === required.length },
    { key: "LIVES", label: "Présence aux lives (75 % requis)", valueLabel: "80 %", percent: 100, met: true },
    { key: "PROJECT", label: "Projet final validé par le formateur", valueLabel: "En attente", percent: 0, met: false },
  ];

  const project: ProjectOverview = {
    status: state.projectFiles.length > 0 ? "SUBMITTED" : "NOT_STARTED",
    brief:
      "Construisez un tableau de bord de pilotage sur un cas de votre métier. Livrables : fichier .pbix, capture d'écran et note de 1 page.",
    deadlineLabel: "Brouillon attendu avant le 15",
    acceptedExtensions: ["pbix", "xlsx", "pdf", "png"],
    maxSizeMb: 100,
    files: state.projectFiles,
    feedback: [
      {
        id: "fb1",
        authorName: "[Formateur]",
        authorRole: "Formateur",
        message: "Bon choix de cas. Pensez à ajouter une mesure de variation mois sur mois.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  };

  return {
    formationId,
    formationTitle: "Power BI",
    cohortLabel: "Cohorte octobre 2026",
    passThreshold: PASS_THRESHOLD,
    quizzes,
    project,
    conditions,
  };
}

// ─── Tentatives de quiz ───────────────────────────────────────────────────────

export class DemoUnavailableError extends Error {}

export function startDemoAttempt(quizId: string): QuizAttemptStart {
  if (quizId !== DEMO_QUIZ_M3_ID) {
    throw new DemoUnavailableError("Ce quiz n'est pas disponible dans la démonstration (seul le quiz du Module 3 est jouable).");
  }
  const state = read();
  const used = state.quizzes[quizId]?.attemptsUsed ?? 0;
  if (used >= QUIZ_MAX_ATTEMPTS) throw new DemoUnavailableError("Nombre maximal de tentatives atteint.");

  const attemptId = `demo-attempt-${Date.now()}`;
  const startedAt = new Date().toISOString();
  write({ ...state, attempts: { ...state.attempts, [attemptId]: { quizId, startedAt } } });

  return {
    attemptId,
    quizId,
    title: "Quiz Module 3 — DAX",
    attemptNumber: used + 1,
    maxAttempts: QUIZ_MAX_ATTEMPTS,
    passThreshold: PASS_THRESHOLD,
    timeLimitMinutes: 10,
    startedAt,
    questions: DAX_BANK.map(({ id, text, choices }) => ({ id, text, choices })),
  };
}

export function submitDemoAttempt(attemptId: string, submission: QuizSubmission): QuizAttemptResult {
  const state = read();
  const attempt = state.attempts[attemptId];
  if (!attempt) throw new DemoUnavailableError("Tentative introuvable.");

  const review = DAX_BANK.map((qq) => ({
    questionId: qq.id,
    chosenChoiceId: submission.answers[qq.id] ?? null,
    correctChoiceId: qq.correctChoiceId,
    explanation: qq.explanation,
  }));
  const correctCount = review.filter((r) => r.chosenChoiceId === r.correctChoiceId).length;
  const score = Math.round((correctCount / DAX_BANK.length) * 100);
  const passed = score >= PASS_THRESHOLD;

  const prev = state.quizzes[attempt.quizId] ?? { attemptsUsed: 0, bestScore: null, passed: false };
  const next: DemoQuizState = {
    attemptsUsed: prev.attemptsUsed + 1,
    bestScore: Math.max(prev.bestScore ?? 0, score),
    passed: prev.passed || passed,
  };
  const { [attemptId]: _done, ...remaining } = state.attempts;
  write({ ...state, attempts: remaining, quizzes: { ...state.quizzes, [attempt.quizId]: next } });

  return {
    attemptId,
    quizId: attempt.quizId,
    score,
    passed,
    correctCount,
    questionCount: DAX_BANK.length,
    attemptNumber: next.attemptsUsed,
    attemptsRemaining: Math.max(0, QUIZ_MAX_ATTEMPTS - next.attemptsUsed),
    review,
  };
}

// ─── Projet final (noms de fichiers uniquement) ───────────────────────────────

function sizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function addDemoProjectFile(file: { name: string; size: number }): ProjectFile {
  const state = read();
  const entry: ProjectFile = {
    id: `demo-file-${Date.now()}-${state.projectFiles.length}`,
    name: file.name,
    sizeLabel: sizeLabel(file.size),
    uploadedAt: new Date().toISOString(),
  };
  write({ ...state, projectFiles: [...state.projectFiles, entry] });
  return entry;
}

export function removeDemoProjectFile(fileId: string): void {
  const state = read();
  write({ ...state, projectFiles: state.projectFiles.filter((f) => f.id !== fileId) });
}

// ─── Suivi de session (admin) ─────────────────────────────────────────────────

const DEMO_LEARNERS = [
  { learnerId: "demo-ln1", name: "Awa Ndiaye", subtitle: "Banque · CBAO", progressPercent: 100, quizPassed: 4, quizTotal: 4, project: "VALIDATED", certificate: "READY" },
  { learnerId: "demo-ln2", name: "Moussa Sarr", subtitle: "Audit", progressPercent: 92, quizPassed: 4, quizTotal: 4, project: "SUBMITTED", certificate: "PENDING" },
  { learnerId: "demo-ln3", name: "Fatou Kane", subtitle: "RH", progressPercent: 88, quizPassed: 3, quizTotal: 4, project: "SUBMITTED", certificate: "PENDING" },
  { learnerId: "demo-ln4", name: "Ibrahima Ba", subtitle: "Finance", progressPercent: 71, quizPassed: 3, quizTotal: 4, project: "NOT_STARTED", certificate: "PENDING" },
  { learnerId: "demo-ln5", name: "Aminata Diallo", subtitle: "Commercial", progressPercent: 45, quizPassed: 2, quizTotal: 4, project: "NOT_STARTED", certificate: "AT_RISK" },
  { learnerId: "demo-ln6", name: "Oumar Seck", subtitle: "Comptabilité", progressPercent: 100, quizPassed: 4, quizTotal: 4, project: "VALIDATED", certificate: "ISSUED" },
] as const;

const ALL_IDS = DEMO_LEARNERS.map((l) => l.learnerId);

const DEMO_LIVE_DEFS: { id: string; title: string; status: SessionLive["status"]; present: string[] | null; daysAgo: number }[] = [
  { id: "demo-lv1", title: "Séance 1 — Macros", status: "DONE", present: [...ALL_IDS], daysAgo: 21 },
  { id: "demo-lv2", title: "Séance 2 — Procédures", status: "DONE", present: ALL_IDS.slice(0, 5), daysAgo: 14 },
  { id: "demo-lv3", title: "Séance 3 — Formulaires", status: "DONE", present: ALL_IDS.slice(0, 4), daysAgo: 7 },
  { id: "demo-lv4", title: "Séance 4 — Projets", status: "UPCOMING", present: null, daysAgo: -3 },
];

export function buildDemoTracking(sessionId: string): SessionTracking {
  const state = read();
  const lives: SessionLive[] = DEMO_LIVE_DEFS.map((l) => ({
    id: l.id,
    title: l.title,
    status: l.status,
    startsAt: new Date(Date.now() - l.daysAgo * 86400000).toISOString(),
    presentLearnerIds: state.attendance[l.id] ?? l.present,
  }));

  return {
    sessionId,
    formationId: null,
    formationTitle: "Excel VBA",
    sessionName: "Excel VBA — septembre 2026",
    deliveredBy: "Model Technologie",
    trainerName: "[Formateur VBA]",
    startDate: null,
    endDate: null,
    formatLabel: "Présentiel Dakar",
    statusLabel: "Clôture en cours",
    capacity: 15,
    learners: DEMO_LEARNERS.map((l) => ({ ...l })),
    lives,
  };
}

export function updateDemoAttendance(liveId: string, update: AttendanceUpdate): void {
  const state = read();
  write({ ...state, attendance: { ...state.attendance, [liveId]: update.presentLearnerIds } });
}

/** Reporte la réussite du quiz de démonstration dans la progression du cours (leçon QUIZ terminée). */
export function applyDemoQuizProgress(course: LearnerCourse): LearnerCourse {
  if (!read().quizzes[DEMO_QUIZ_M3_ID]?.passed) return course;
  const quizLesson = course.content.modules[2]?.lessons.find((l) => l.type === "QUIZ");
  if (!quizLesson || course.progress.some((p) => p.lessonId === quizLesson.id && p.completed)) return course;
  return {
    ...course,
    progress: [
      ...course.progress.filter((p) => p.lessonId !== quizLesson.id),
      { lessonId: quizLesson.id, completed: true, positionSeconds: 0 },
    ],
  };
}
