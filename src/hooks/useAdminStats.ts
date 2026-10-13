import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { ACCESS } from "@/lib/permissions";
import { statsService } from "@/services/api/statsService";

/** Tableau de bord : financier et/ou d'activité (les montants dépendent du droit financier, voir `financeVisible`). */
export function useCanSeeStats(): boolean {
  const { can } = useAuth();
  return can(...ACCESS.DASHBOARD);
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
  const { user } = useAuth();
  const enabled = !!user?.isStaff;   // chacun ne reçoit que les files qu'il traite
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
