import { useQuery } from "@tanstack/react-query";

import { authService } from "@/services/api/authService";

/**
 * Modes de connexion actifs côté serveur (GET /auth/options). Pas de nouvelle tentative en cas
 * d'échec : la page retombe alors sur le seul mode « mot de passe », toujours disponible.
 */
export function useAuthOptions() {
  return useQuery({
    queryKey: ["auth", "options"],
    queryFn: authService.getOptions,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
