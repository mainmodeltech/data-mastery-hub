/**
 * course.type.ts — Lot 5 (docs/design/README.md §3 : Module, Lesson, LessonProgress,
 * Enrollment). Contrat proposé côté front pour `feature/course-content` (backend) :
 *
 *   Apprenant
 *     GET  /learner/dashboard                              -> DashboardData
 *     GET  /learner/formations/{formationId}/course        -> LearnerCourse
 *     PUT  /learner/lessons/{lessonId}/progress            body LessonProgress (sans lessonId)
 *   Admin (rôles personnel / formateur)
 *     GET  /admin/formations/{formationId}/content         -> CourseContent
 *     PUT  /admin/formations/{formationId}/content         body CourseContent (arbre complet)
 *
 * Tant que ces endpoints n'existent pas (404), src/services/courseService.ts bascule sur
 * src/config/demoCourse.ts et l'UI affiche un bandeau « données de démonstration ».
 */

export type LessonType = "VIDEO" | "RESOURCE" | "LIVE" | "QUIZ";
export type LessonStatus = "PUBLISHED" | "SCHEDULED" | "DRAFT";

export interface LessonResource {
  id: string;
  name: string;
  /** Extension affichée dans la pastille : PDF, XLSX, PBIX… */
  fileType: string;
  sizeLabel?: string | null;
  note?: string | null;
  url: string | null;
  /** true = débloqué seulement après réussite du quiz du module */
  lockedUntilQuiz?: boolean;
}

export interface QuizSettings {
  questionCount: number;
  passThreshold: number;
  maxAttempts: number;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  subtitle?: string | null;
  type: LessonType;
  status: LessonStatus;
  durationSeconds?: number | null;
  /** Identifiant chez l'hébergeur vidéo (HLS + URL signée) — jamais MinIO brut, cf. README §3 */
  videoProviderId?: string | null;
  videoUrl?: string | null;
  description?: string | null;
  liveAt?: string | null;
  liveUrl?: string | null;
  quiz?: QuizSettings | null;
  resources: LessonResource[];
}

export interface CourseModule {
  id: string;
  order: number;
  title: string;
  lessons: Lesson[];
}

export interface CourseSettings {
  sequentialUnlock: boolean;
  accessDuration: "12_MONTHS" | "LIFETIME";
}

export interface CertificateRules {
  lessonsCompletedPercent: number;
  quizPassPercent: number;
  livePresencePercent: number;
  finalProjectValidated: boolean;
  template: string;
}

export interface CourseContent {
  formationId: string;
  title: string;
  updatedAt: string | null;
  settings: CourseSettings;
  certificateRules: CertificateRules;
  modules: CourseModule[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  positionSeconds: number;
}

export interface LearnerCourse {
  content: CourseContent;
  cohortLabel: string | null;
  trainerName: string | null;
  progress: LessonProgress[];
}

export type EnrollmentStatus = "IN_PROGRESS" | "CERTIFIED" | "UPCOMING";

export interface EnrollmentSummary {
  formationId: string;
  title: string;
  providerLabel: string;
  progressPercent: number;
  statusNote: string;
  status: EnrollmentStatus;
}

export type TodoTone = "warning" | "info";

export interface TodoItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: TodoTone;
}

export interface LiveItem {
  id: string;
  startsAt: string;
  title: string;
  timeLabel: string;
  place: string;
  joinUrl: string | null;
}

export interface ResumeInfo {
  formationId: string;
  lessonId: string;
  courseTitle: string;
  moduleIndex: number;
  moduleCount: number;
  lessonTitle: string;
  lessonLabel: string;
  durationSeconds: number;
  positionSeconds: number;
  percent: number;
}

export interface DashboardData {
  firstName: string;
  streakDays: number | null;
  stats: {
    hoursWatched: number;
    lessonsDone: number;
    lessonsTotal: number;
    averageQuizScore: number | null;
    certificates: number;
  };
  resume: ResumeInfo | null;
  courses: EnrollmentSummary[];
  todos: TodoItem[];
  certificateReady: { title: string } | null;
  lives: LiveItem[];
}

/** Réponse de service : `demo` vaut true quand l'API n'expose pas encore l'endpoint. */
export interface WithDemo<T> {
  data: T;
  demo: boolean;
}

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: "Vidéo",
  RESOURCE: "Ressource",
  LIVE: "Live",
  QUIZ: "Quiz",
};

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  PUBLISHED: "Publié",
  SCHEDULED: "Programmé",
  DRAFT: "Brouillon",
};

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function flattenLessons(content: CourseContent): Lesson[] {
  return content.modules.flatMap((m) => m.lessons);
}
