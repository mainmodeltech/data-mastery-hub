import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EVALUATION_KEYS } from "@/hooks/useEvaluations";
import { sessionOpsService, type ProjectDecision } from "@/services/api/sessionOpsService";

const KEYS = {
  messages: (sessionId: string) => ["admin", "session", sessionId, "messages"] as const,
  questions: (sessionId: string) => ["admin", "session", sessionId, "questions"] as const,
  projectFiles: (sessionId: string, learnerId: string) => ["admin", "session", sessionId, "project", learnerId] as const,
  trainers: ["admin", "trainers"] as const,
};

export function useSessionMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: KEYS.messages(sessionId ?? ""),
    queryFn: () => sessionOpsService.messageHistory(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useSendSessionMessage(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { subject: string; body: string; learnerIds?: string[] }) => sessionOpsService.sendMessage(sessionId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.messages(sessionId) }),
  });
}

export function useSessionQuestions(sessionId: string | undefined) {
  return useQuery({
    queryKey: KEYS.questions(sessionId ?? ""),
    queryFn: () => sessionOpsService.questions(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useAnswerQuestion(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) => sessionOpsService.answer(sessionId, questionId, answer),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.questions(sessionId) }),
  });
}

export function useLearnerQuizzes(sessionId: string, learnerId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "session-learner-quizzes", sessionId, learnerId ?? ""],
    queryFn: () => sessionOpsService.learnerQuizzes(sessionId, learnerId as string),
    enabled: !!learnerId,
    staleTime: 0,
  });
}

export function useGrantAttempts(sessionId: string, learnerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, extraAttempts, reason }: { quizId: string; extraAttempts: number; reason: string }) =>
      sessionOpsService.grantAttempts(sessionId, learnerId, quizId, extraAttempts, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "session-learner-quizzes", sessionId, learnerId] });
      qc.invalidateQueries({ queryKey: ["admin", "session-tracking", sessionId] });
    },
  });
}

export function useProjectFiles(sessionId: string, learnerId: string | undefined) {
  return useQuery({
    queryKey: KEYS.projectFiles(sessionId, learnerId ?? ""),
    queryFn: () => sessionOpsService.projectFiles(sessionId, learnerId as string),
    enabled: !!learnerId,
    staleTime: 0,
  });
}

export function useReviewProject(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ learnerId, status, message }: { learnerId: string; status: ProjectDecision; message?: string }) =>
      sessionOpsService.reviewProject(sessionId, learnerId, { status, message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVALUATION_KEYS.tracking(sessionId) }),
  });
}

export function useTrainers(enabled = true) {
  return useQuery({ queryKey: KEYS.trainers, queryFn: sessionOpsService.trainers, enabled, staleTime: 5 * 60 * 1000 });
}

export function useAssignTrainer(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trainerId: string | null) => sessionOpsService.assignTrainer(sessionId, trainerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVALUATION_KEYS.tracking(sessionId) }),
  });
}
