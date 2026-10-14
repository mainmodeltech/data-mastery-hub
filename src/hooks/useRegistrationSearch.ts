import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { registrationService, type RegistrationQuery } from "@/services/api/registrationService";

export const SEARCH_KEYS = {
  list: (q: RegistrationQuery) => ["registrations", "search", q] as const,
  summary: (q: Pick<RegistrationQuery, "q" | "bootcampId" | "sessionId">) => ["registrations", "summary", q] as const,
};

/** Liste des candidatures filtrée côté serveur ; la page précédente reste affichée pendant le chargement de la suivante. */
export function useRegistrationSearch(query: RegistrationQuery, enabled = true) {
  return useQuery({
    queryKey: SEARCH_KEYS.list(query),
    queryFn: () => registrationService.search(query),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
    enabled,
  });
}

/** Compteurs par étape (onglets) pour la même recherche, hors étape. */
export function useRegistrationSummary(query: Pick<RegistrationQuery, "q" | "bootcampId" | "sessionId">) {
  return useQuery({
    queryKey: SEARCH_KEYS.summary(query),
    queryFn: () => registrationService.summary(query),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}
