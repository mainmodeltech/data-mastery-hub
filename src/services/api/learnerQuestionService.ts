import { httpClient } from "@/services/httpClient";
import type { LearnerQuestion } from "@/types/question.type";

export const learnerQuestionService = {
  list: async (lessonId: string): Promise<LearnerQuestion[]> =>
    (await httpClient.get<LearnerQuestion[]>(`/learner/lessons/${lessonId}/questions`)) ?? [],

  ask: (lessonId: string, question: string): Promise<LearnerQuestion> =>
    httpClient.post<LearnerQuestion>(`/learner/lessons/${lessonId}/questions`, { question }),
};
