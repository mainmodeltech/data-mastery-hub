/**
 * evaluation.type.ts — Lot 6 (docs/design/README.md §3 : Quiz, Question, Choice, QuizAttempt,
 * ProjectSubmission, LiveSession + Attendance). Contrat proposé côté front pour
 * `feature/quiz-project-live` (backend) :
 *
 *   Apprenant
 *     GET    /learner/formations/{formationId}/evaluations          -> EvaluationsOverview
 *     POST   /learner/quizzes/{quizId}/attempts                     -> QuizAttemptStart
 *     POST   /learner/quiz-attempts/{attemptId}/submit              body QuizSubmission -> QuizAttemptResult
 *     POST   /learner/formations/{formationId}/project/files        multipart `file`  -> ProjectOverview
 *     DELETE /learner/formations/{formationId}/project/files/{id}   -> ProjectOverview
 *   Admin (ADMIN / TRAINER)
 *     GET    /admin/sessions/{sessionId}/tracking                   -> SessionTracking
 *     PUT    /admin/sessions/{sessionId}/lives/{liveId}/attendance  body AttendanceUpdate -> SessionLive
 *
 * Règles que le backend doit garantir (le front ne les décide pas) :
 *  - les bonnes réponses ne sont JAMAIS envoyées avant la soumission (`QuizAttemptStart` n'en contient pas) ;
 *  - le score, le seuil, le nombre de tentatives et le chrono sont validés côté serveur ;
 *  - une tentative réussie marque la leçon de type QUIZ comme terminée (LessonProgress.completed),
 *    ce qui débloque le module suivant (cf. src/lib/course.ts) ;
 *  - un fichier de projet est borné en taille/extension côté serveur (stockage MinIO).
 *
 * Tant que ces endpoints n'existent pas (404/501), les services basculent sur
 * src/config/demoEvaluations.ts et l'UI affiche un bandeau « données de démonstration ».
 */

export type QuizStatus = "PASSED" | "TO_DO" | "AVAILABLE" | "LOCKED" | "FAILED";

export interface QuizSummary {
  id: string;
  /** Leçon QUIZ correspondante dans le programme (Lot 5) */
  lessonId: string | null;
  title: string;
  questionCount: number;
  timeLimitMinutes: number | null;
  passThreshold: number;
  /** null = tentatives illimitées */
  maxAttempts: number | null;
  attemptsUsed: number;
  bestScore: number | null;
  status: QuizStatus;
  /** Ex. « Avant ven. » quand le quiz est à rendre avant une échéance */
  dueLabel?: string | null;
  optional: boolean;
}

export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  choices: QuizChoice[];
}

export interface QuizAttemptStart {
  attemptId: string;
  quizId: string;
  title: string;
  attemptNumber: number;
  maxAttempts: number | null;
  passThreshold: number;
  timeLimitMinutes: number | null;
  startedAt: string;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  /** questionId -> choiceId (absent = sans réponse) */
  answers: Record<string, string>;
}

export interface QuizReviewItem {
  questionId: string;
  chosenChoiceId: string | null;
  correctChoiceId: string;
  explanation?: string | null;
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  score: number;
  passed: boolean;
  correctCount: number;
  questionCount: number;
  attemptNumber: number;
  /** null = illimité */
  attemptsRemaining: number | null;
  /** Correction détaillée ; null si la formation ne l'autorise pas */
  review: QuizReviewItem[] | null;
}

export type ProjectStatus = "NOT_STARTED" | "SUBMITTED" | "CHANGES_REQUESTED" | "VALIDATED";

export interface ProjectFile {
  id: string;
  name: string;
  sizeLabel: string;
  uploadedAt: string;
}

export interface ProjectFeedback {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface ProjectOverview {
  status: ProjectStatus;
  brief: string;
  deadlineLabel: string | null;
  acceptedExtensions: string[];
  maxSizeMb: number;
  files: ProjectFile[];
  feedback: ProjectFeedback[];
}

export interface CertificateCondition {
  key: "LESSONS" | "QUIZZES" | "LIVES" | "PROJECT";
  label: string;
  valueLabel: string;
  percent: number;
  met: boolean;
}

export interface EvaluationsOverview {
  formationId: string;
  formationTitle: string;
  cohortLabel: string | null;
  passThreshold: number;
  quizzes: QuizSummary[];
  project: ProjectOverview | null;
  conditions: CertificateCondition[];
}

// ─── Suivi de session (admin) ────────────────────────────────────────────────

export type CertificateTrackingStatus = "READY" | "PENDING" | "AT_RISK" | "ISSUED";

export interface TrackedLearner {
  learnerId: string;
  name: string;
  /** Poste · entreprise */
  subtitle: string | null;
  progressPercent: number;
  quizPassed: number;
  quizTotal: number;
  project: ProjectStatus;
  certificate: CertificateTrackingStatus;
}

export interface SessionLive {
  id: string;
  title: string;
  startsAt: string | null;
  status: "DONE" | "UPCOMING";
  /** null tant que l'appel n'a pas été fait */
  presentLearnerIds: string[] | null;
}

export interface SessionTracking {
  sessionId: string;
  formationId: string | null;
  formationTitle: string;
  sessionName: string;
  deliveredBy: string;
  trainerName: string | null;
  startDate: string | null;
  endDate: string | null;
  formatLabel: string;
  statusLabel: string;
  capacity: number;
  learners: TrackedLearner[];
  lives: SessionLive[];
}

export interface AttendanceUpdate {
  presentLearnerIds: string[];
}

// ─── Libellés ────────────────────────────────────────────────────────────────

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  NOT_STARTED: "Non rendu",
  SUBMITTED: "À corriger",
  CHANGES_REQUESTED: "Corrections demandées",
  VALIDATED: "Validé",
};

export const CERTIFICATE_STATUS_LABELS: Record<CertificateTrackingStatus, string> = {
  READY: "Prêt",
  PENDING: "En attente",
  AT_RISK: "À risque",
  ISSUED: "Délivré",
};

export function attemptsLabel(used: number, max: number | null): string {
  return `${used} / ${max ?? "∞"}`;
}

export function quizFormatLabel(q: Pick<QuizSummary, "questionCount" | "timeLimitMinutes">): string {
  const base = `${q.questionCount} questions`;
  return q.timeLimitMinutes ? `${base} · ${q.timeLimitMinutes} min` : base;
}

export function attemptsRemaining(q: Pick<QuizSummary, "attemptsUsed" | "maxAttempts">): number | null {
  return q.maxAttempts == null ? null : Math.max(0, q.maxAttempts - q.attemptsUsed);
}
