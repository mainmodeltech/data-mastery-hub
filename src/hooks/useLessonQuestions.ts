import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerQuestionService } from "@/services/api/learnerQuestionService";

export const QUESTION_KEYS = {
  lesson: (lessonId: string) => ["learner", "questions", lessonId] as const,
};

export function useLessonQuestions(lessonId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: QUESTION_KEYS.lesson(lessonId ?? ""),
    queryFn: () => learnerQuestionService.list(lessonId as string),
    enabled: !!lessonId && enabled,
    staleTime: 30 * 1000,
  });
}

export function useAskQuestion(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (question: string) => learnerQuestionService.ask(lessonId, question),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUESTION_KEYS.lesson(lessonId) }),
  });
}
