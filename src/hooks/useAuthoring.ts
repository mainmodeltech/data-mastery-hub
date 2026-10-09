import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authoringService } from "@/services/api/authoringService";
import type { ProjectConfig, QuizBank } from "@/types/authoring.type";

export const AUTHORING_KEYS = {
  quiz: (lessonId: string) => ["admin", "quiz-bank", lessonId] as const,
  project: (formationId: string) => ["admin", "project-config", formationId] as const,
};

export function useQuizBank(lessonId: string | undefined) {
  return useQuery({
    queryKey: AUTHORING_KEYS.quiz(lessonId ?? ""),
    queryFn: () => authoringService.getQuiz(lessonId as string),
    enabled: !!lessonId,
    retry: false,
  });
}

export function useSaveQuizBank(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bank: QuizBank) => authoringService.saveQuiz(lessonId, bank),
    onSuccess: (saved) => qc.setQueryData(AUTHORING_KEYS.quiz(lessonId), saved),
  });
}

export function useProjectConfig(formationId: string | undefined) {
  return useQuery({
    queryKey: AUTHORING_KEYS.project(formationId ?? ""),
    queryFn: () => authoringService.getProject(formationId as string),
    enabled: !!formationId,
    retry: false,
  });
}

export function useSaveProjectConfig(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: ProjectConfig) => authoringService.saveProject(formationId, config),
    onSuccess: (saved) => qc.setQueryData(AUTHORING_KEYS.project(formationId), saved),
  });
}

export function useDeleteProjectConfig(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authoringService.deleteProject(formationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUTHORING_KEYS.project(formationId) }),
  });
}
