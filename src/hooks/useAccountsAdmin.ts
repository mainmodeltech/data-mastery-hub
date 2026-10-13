import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { learnerAdminService, userAdminService } from "@/services/api/accountsAdminService";
import { QUERY_CONFIG } from "@/config/constants";
import type { LearnerPayload, UserCreatePayload, UserUpdatePayload } from "@/types/accounts.type";

export const ACCOUNT_KEYS = {
  learners: ["admin", "learners"] as const,
  users: ["admin", "users"] as const,
};

export function useAdminLearners() {
  return useQuery({ queryKey: ACCOUNT_KEYS.learners, queryFn: learnerAdminService.list, staleTime: QUERY_CONFIG.staleTime });
}

export function useCreateLearner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LearnerPayload) => learnerAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.learners }),
  });
}

export function useSetLearnerActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => learnerAdminService.setActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.learners }),
  });
}

export function useResendInvitation() {
  return useMutation({ mutationFn: (id: string) => learnerAdminService.resendInvitation(id) });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ACCOUNT_KEYS.users, queryFn: userAdminService.list, staleTime: QUERY_CONFIG.staleTime });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.users }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserUpdatePayload }) => userAdminService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.users }),
  });
}

export function useResetMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userAdminService.resetMfa(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.users }),
  });
}
