import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/config/constants";
import { profilesAdminService } from "@/services/api/profilesAdminService";
import type { ProfilePayload } from "@/types/profiles.type";

export const PROFILE_KEYS = {
  all: ["admin", "profiles"] as const,
  catalogue: ["admin", "profiles", "permissions"] as const,
};

export function useProfiles(enabled = true) {
  return useQuery({ queryKey: PROFILE_KEYS.all, queryFn: profilesAdminService.list, staleTime: QUERY_CONFIG.staleTime, enabled });
}

export function usePermissionCatalogue(enabled = true) {
  return useQuery({ queryKey: PROFILE_KEYS.catalogue, queryFn: profilesAdminService.catalogue, staleTime: QUERY_CONFIG.staleTime, enabled });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => profilesAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEYS.all }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProfilePayload }) => profilesAdminService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEYS.all }),
  });
}

export function useResetProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profilesAdminService.reset(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEYS.all }),
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profilesAdminService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEYS.all }),
  });
}
