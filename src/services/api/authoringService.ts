import { httpClient } from "@/services/httpClient";
import type { ProjectConfig, QuizBank } from "@/types/authoring.type";

export const authoringService = {
  getQuiz: (lessonId: string): Promise<QuizBank> =>
    httpClient.get<QuizBank>(`/admin/lessons/${lessonId}/quiz`),

  saveQuiz: (lessonId: string, bank: QuizBank): Promise<QuizBank> =>
    httpClient.put<QuizBank>(`/admin/lessons/${lessonId}/quiz`, bank),

  getProject: (formationId: string): Promise<ProjectConfig> =>
    httpClient.get<ProjectConfig>(`/admin/formations/${formationId}/project`),

  saveProject: (formationId: string, config: ProjectConfig): Promise<ProjectConfig> =>
    httpClient.put<ProjectConfig>(`/admin/formations/${formationId}/project`, config),

  deleteProject: (formationId: string): Promise<void> =>
    httpClient.delete<void>(`/admin/formations/${formationId}/project`),
};
