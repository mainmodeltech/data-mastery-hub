import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { hasAnyRole } from "@/lib/roles";
import { statsService } from "@/services/api/statsService";

/** Seuls SUPER_ADMIN et ADMIN accèdent aux statistiques (les montants sont sensibles). */
export const STATS_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export function useCanSeeStats(): boolean {
  const { user } = useAuth();
  return hasAnyRole(user?.roles, STATS_ROLES);
}

export const STATS_KEYS = {
  actions: ["admin", "stats", "actions"] as const,
  overview: (from: string, to: string) => ["admin", "stats", "overview", from, to] as const,
};

/**
 * Pastilles du menu : interrogées toutes les 60 s. React Query met l'intervalle en pause quand
 * l'onglet est masqué (refetchIntervalInBackground: false) et rafraîchit au retour sur l'onglet.
 */
export function useAdminActions() {
  const enabled = useCanSeeStats();
  return useQuery({
    queryKey: STATS_KEYS.actions,
    queryFn: statsService.actions,
    enabled,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useStatsOverview(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: STATS_KEYS.overview(from, to),
    queryFn: () => statsService.overview(from, to),
    enabled,
    staleTime: 60 * 1000,
    retry: false,
  });
}
