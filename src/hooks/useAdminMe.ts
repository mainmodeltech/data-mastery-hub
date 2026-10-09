import { useQuery } from "@tanstack/react-query";

import { adminMeService } from "@/services/api/adminMeService";

export const ADMIN_ME_KEYS = {
  sessions: ["admin", "me", "sessions"] as const,
  formations: ["admin", "me", "formations"] as const,
};

export function useMySessions() {
  return useQuery({ queryKey: ADMIN_ME_KEYS.sessions, queryFn: adminMeService.sessions, staleTime: 60 * 1000 });
}

export function useMyFormations() {
  return useQuery({ queryKey: ADMIN_ME_KEYS.formations, queryFn: adminMeService.formations, staleTime: 60 * 1000 });
}
