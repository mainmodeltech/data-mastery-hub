import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteContentService } from "@/services/api/siteContentService";
import type { SiteContentKey, SiteContentMap } from "@/types/siteContent";
import { QUERY_CONFIG } from "@/config/constants";

export const SITE_CONTENT_KEYS = {
  public: ["site-content", "public"] as const,
  admin: ["site-content", "admin"] as const,
  defaults: ["site-content", "defaults"] as const,
};

/** Tous les contenus publiés — une seule requête partagée par toutes les pages et le layout. */
export function useSiteSettings() {
  return useQuery({
    queryKey: SITE_CONTENT_KEYS.public,
    queryFn: siteContentService.getAll,
    staleTime: QUERY_CONFIG.staleTime,
    retry: 1,
  });
}

/**
 * Contenu d'une clé (`page.home`, `site.company`…). `content` vaut `undefined` tant que la requête charge
 * ou si la clé n'est pas publiée : aucune donnée de remplacement n'est inventée côté front.
 */
export function useSiteContent<K extends SiteContentKey>(key: K) {
  const query = useSiteSettings();
  const content = query.data?.[key] as SiteContentMap[K] | undefined;
  return {
    content,
    isLoading: query.isLoading,
    isError: query.isError || (query.isSuccess && content === undefined),
    refetch: query.refetch,
  };
}

// ─── Administration ───────────────────────────────────────────────────────────

export function useAdminSiteContent() {
  return useQuery({ queryKey: SITE_CONTENT_KEYS.admin, queryFn: siteContentService.listAdmin });
}

export function useSiteContentDefaultKeys() {
  return useQuery({ queryKey: SITE_CONTENT_KEYS.defaults, queryFn: siteContentService.defaultKeys, staleTime: Infinity });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: SITE_CONTENT_KEYS.public });
    qc.invalidateQueries({ queryKey: SITE_CONTENT_KEYS.admin });
  };
}

export function useSaveSiteContent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => siteContentService.save(key, value),
    onSuccess: invalidate,
  });
}

export function useResetSiteContent() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (key: string) => siteContentService.reset(key), onSuccess: invalidate });
}
