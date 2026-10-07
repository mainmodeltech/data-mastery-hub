/**
 * courseService.ts — contenu de cours, progression et tableau de bord apprenant (Lot 5).
 * Endpoints proposés : voir src/types/course.type.ts.
 *
 * Données de démonstration : uniquement si l'endpoint est absent (404/501) ET que
 * l'environnement l'autorise (build dev ou VITE_ENABLE_DEMO_DATA=true). Une panne
 * réseau ou une 5xx n'affiche jamais de données fictives de progression.
 */
import { httpClient, ApiError } from "./httpClient";
import type {
  CourseContent,
  DashboardData,
  LearnerCourse,
  LessonProgress,
  WithDemo,
} from "@/types/course.type";
import { buildDemoContent, buildDemoCourse, buildDemoDashboard } from "@/config/demoCourse";

const DEMO_ALLOWED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_DATA === "true";

function endpointMissing(e: unknown): boolean {
  return e instanceof ApiError && (e.status === 404 || e.status === 501);
}

async function withDemo<T>(real: () => Promise<T>, demo: () => T): Promise<WithDemo<T>> {
  try {
    return { data: await real(), demo: false };
  } catch (e) {
    if (DEMO_ALLOWED && endpointMissing(e)) return { data: demo(), demo: true };
    throw e;
  }
}

export const courseService = {
  getDashboard: () =>
    withDemo(() => httpClient.get<DashboardData>("/learner/dashboard"), buildDemoDashboard),

  getLearnerCourse: (formationId: string) =>
    withDemo(
      () => httpClient.get<LearnerCourse>(`/learner/formations/${formationId}/course`),
      () => buildDemoCourse(formationId)
    ),

  setLessonProgress: (lessonId: string, progress: Omit<LessonProgress, "lessonId">) =>
    httpClient.put<void>(`/learner/lessons/${lessonId}/progress`, progress),

  getAdminContent: (formationId: string, title?: string) =>
    withDemo(
      () => httpClient.get<CourseContent>(`/admin/formations/${formationId}/content`),
      () => buildDemoContent(formationId, title)
    ),

  saveAdminContent: (formationId: string, content: CourseContent) =>
    httpClient.put<CourseContent>(`/admin/formations/${formationId}/content`, content),
};
