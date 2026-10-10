import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerService, type UpdateLearnerProfile } from "@/services/api/learnerService";

export const LEARNER_KEYS = {
  profile: ["learner", "profile"] as const,
  payments: ["learner", "payments"] as const,
  enrollments: ["learner", "enrollments"] as const,
  calendar: ["learner", "calendar"] as const,
  resources: ["learner", "resources"] as const,
  community: (formationId: string, page: number) => ["learner", "community", formationId, page] as const,
};

export function useLearnerProfile() {
  return useQuery({ queryKey: LEARNER_KEYS.profile, queryFn: learnerService.profile, staleTime: 5 * 60 * 1000 });
}

export function useUpdateLearnerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLearnerProfile) => learnerService.updateProfile(payload),
    onSuccess: (profile) => {
      qc.setQueryData(LEARNER_KEYS.profile, profile);
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useSetFirstPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newPassword: string) => learnerService.setFirstPassword(newPassword),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEARNER_KEYS.profile }),
  });
}

export function useLearnerPayments() {
  return useQuery({ queryKey: LEARNER_KEYS.payments, queryFn: learnerService.payments, staleTime: 60 * 1000 });
}

export function useLearnerEnrollments() {
  return useQuery({ queryKey: LEARNER_KEYS.enrollments, queryFn: learnerService.enrollments, staleTime: 60 * 1000 });
}

export function useLearnerCalendar() {
  return useQuery({ queryKey: LEARNER_KEYS.calendar, queryFn: learnerService.calendar, staleTime: 60 * 1000 });
}

export function useLearnerResources() {
  return useQuery({ queryKey: LEARNER_KEYS.resources, queryFn: learnerService.resources, staleTime: 60 * 1000 });
}

// ─── Communauté ───────────────────────────────────────────────────────────────

export function useCommunity(formationId: string | undefined, page: number) {
  return useQuery({
    queryKey: LEARNER_KEYS.community(formationId ?? "", page),
    queryFn: () => learnerService.community(formationId as string, page),
    enabled: !!formationId,
    placeholderData: (prev) => prev,
  });
}

export function useCommunityPost(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) => learnerService.communityPost(formationId, content, parentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learner", "community", formationId] }),
  });
}

export function useCommunityDelete(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => learnerService.communityDelete(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learner", "community", formationId] }),
  });
}
