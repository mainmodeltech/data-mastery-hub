import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { evaluationService } from "@/services/evaluationService";
import { COURSE_KEYS } from "@/hooks/useCourse";
import { QUERY_CONFIG } from "@/config/constants";
import type { AttendanceUpdate, QuizSubmission } from "@/types/evaluation.type";

export const EVALUATION_KEYS = {
  overview: (formationId: string) => ["learner", "evaluations", formationId] as const,
  tracking: (sessionId: string) => ["admin", "session-tracking", sessionId] as const,
};

export function useEvaluationsOverview(formationId: string | undefined) {
  return useQuery({
    queryKey: EVALUATION_KEYS.overview(formationId ?? ""),
    queryFn: () => evaluationService.getOverview(formationId as string),
    enabled: !!formationId,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useStartQuizAttempt() {
  return useMutation({ mutationFn: (quizId: string) => evaluationService.startAttempt(quizId) });
}

/** Une tentative soumise change score, déverrouillage de module et conditions du certificat. */
export function useSubmitQuizAttempt(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, submission }: { attemptId: string; submission: QuizSubmission }) =>
      evaluationService.submitAttempt(attemptId, submission),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EVALUATION_KEYS.overview(formationId) });
      qc.invalidateQueries({ queryKey: COURSE_KEYS.course(formationId) });
      qc.invalidateQueries({ queryKey: COURSE_KEYS.dashboard });
    },
  });
}

export function useUploadProjectFile(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => evaluationService.uploadProjectFile(formationId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVALUATION_KEYS.overview(formationId) }),
  });
}

export function useDeleteProjectFile(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => evaluationService.deleteProjectFile(formationId, fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVALUATION_KEYS.overview(formationId) }),
  });
}

export function useSessionTracking(sessionId: string | undefined) {
  return useQuery({
    queryKey: EVALUATION_KEYS.tracking(sessionId ?? ""),
    queryFn: () => evaluationService.getSessionTracking(sessionId as string),
    enabled: !!sessionId,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useSaveAttendance(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ liveId, update }: { liveId: string; update: AttendanceUpdate }) =>
      evaluationService.saveAttendance(sessionId, liveId, update),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVALUATION_KEYS.tracking(sessionId) }),
  });
}
