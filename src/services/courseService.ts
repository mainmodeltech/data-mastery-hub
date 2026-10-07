/**
 * courseService.ts — contenu de cours, progression et tableau de bord apprenant (Lot 5).
 * Endpoints proposés : voir src/types/course.type.ts.
 *
 * Données de démonstration : uniquement si l'endpoint est absent (404/501) ET que
 * l'environnement l'autorise (build dev ou VITE_ENABLE_DEMO_DATA=true). Une panne
 * réseau ou une 5xx n'affiche jamais de données fictives de progression.
 */
import { httpClient } from "./httpClient";
import { withDemo } from "./demoFallback";
import type {
  CourseContent,
  DashboardData,
  LearnerCourse,
  LessonProgress,
} from "@/types/course.type";
import { applyDemoQuizProgress } from "@/config/demoEvaluations";
import { buildDemoContent, buildDemoCourse, buildDemoDashboard } from "@/config/demoCourse";

export const courseService = {
  getDashboard: () =>
    withDemo(() => httpClient.get<DashboardData>("/learner/dashboard"), buildDemoDashboard),

  getLearnerCourse: (formationId: string) =>
    withDemo(
      () => httpClient.get<LearnerCourse>(`/learner/formations/${formationId}/course`),
      () => applyDemoQuizProgress(buildDemoCourse(formationId))
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
