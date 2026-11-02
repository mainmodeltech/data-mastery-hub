import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { simulatorLearnerService } from "@/services/api/simulatorLearnerService";
import type { AnswerRequest, StartRequest } from "@/types/simulatorLearner.type";

export const SIM_LEARNER_KEYS = {
  all: ["learner", "simulator"] as const,
  catalog: ["learner", "simulator", "catalog"] as const,
  attempts: ["learner", "simulator", "attempts"] as const,
  attempt: (id: string) => ["learner", "simulator", "attempt", id] as const,
  report: (id: string) => ["learner", "simulator", "report", id] as const,
};

export function useSimCatalog() {
  return useQuery({ queryKey: SIM_LEARNER_KEYS.catalog, queryFn: simulatorLearnerService.catalog, staleTime: 0 });
}

export function useSimAttempts() {
  return useQuery({ queryKey: SIM_LEARNER_KEYS.attempts, queryFn: simulatorLearnerService.attempts, staleTime: 0 });
}

/** La tentative n'est jamais mise en cache : l'état (temps, réponses) vient toujours du serveur. */
export function useSimAttempt(id: string | undefined) {
  return useQuery({
    queryKey: SIM_LEARNER_KEYS.attempt(id ?? ""),
    queryFn: () => simulatorLearnerService.attempt(id as string),
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useSimReport(id: string | undefined) {
  return useQuery({
    queryKey: SIM_LEARNER_KEYS.report(id ?? ""),
    queryFn: () => simulatorLearnerService.report(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function useStartAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StartRequest) => simulatorLearnerService.start(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIM_LEARNER_KEYS.catalog });
      qc.invalidateQueries({ queryKey: SIM_LEARNER_KEYS.attempts });
    },
  });
}

export function useSaveAnswer(attemptId: string) {
  return useMutation({
    mutationFn: ({ ref, body }: { ref: string; body: AnswerRequest }) => simulatorLearnerService.answer(attemptId, ref, body),
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => simulatorLearnerService.submit(id),
    onSuccess: (report, id) => {
      qc.setQueryData(SIM_LEARNER_KEYS.report(id), report);
      qc.invalidateQueries({ queryKey: SIM_LEARNER_KEYS.catalog });
      qc.invalidateQueries({ queryKey: SIM_LEARNER_KEYS.attempts });
    },
  });
}
