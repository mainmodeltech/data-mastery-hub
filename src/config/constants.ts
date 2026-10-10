/**
 * Constantes techniques de l'application.
 *
 * Aucun contenu éditorial ici : coordonnées de l'entreprise, textes, statistiques et listes affichées sur le
 * site viennent du backend (contenus `site.company`, `site.nav`, `page.*` — voir hooks/useSiteContent.ts),
 * modifiables depuis l'administration (« Pages du site »).
 */

// ============================================================
// Configuration React Query
// ============================================================

export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,       // 5 minutes
  gcTime: 10 * 60 * 1000,         // 10 minutes (anciennement cacheTime)
  retryCount: 2,
  refetchOnWindowFocus: false,
} as const;
