// ── Ajouts à faire dans useNetworking.ts ──────────────────────────────────────
// Ces hooks publics (skipAuth) remplacent les appels Supabase dans AlumniPage

import { useQuery } from "@tanstack/react-query";
import { alumniService, projectService } from "@/services/api/networkingService";
import type { AlumniSummary, ProjectSummary } from "@/services/api/networkingService";

/**
 * Hook public — liste tous les alumni publiés triés par display_order.
 * Remplace l'appel Supabase alumni dans AlumniPage.
 * Cache : 10 minutes (données peu volatiles).
 */
export function usePublishedAlumni() {
  return useQuery<AlumniSummary[]>({
    queryKey:  ["alumni-published"],
    queryFn:   () => alumniService.getAllPublished(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook public — liste tous les projets publiés (avec membres et screenshots).
 * Remplace les 3 appels Supabase imbriqués dans AlumniPage.
 * Cache : 10 minutes.
 */
export function usePublishedProjects() {
  return useQuery<ProjectSummary[]>({
    queryKey:  ["projects-published"],
    queryFn:   () => projectService.getAllPublished(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook public — détail d'un projet publié par ID.
 * Utilisé pour la modale de détail (screenshots inclus).
 */
export function usePublishedProjectDetail(id: string | null) {
  return useQuery({
    queryKey:  ["projects-published", id],
    queryFn:   () => projectService.getPublishedById(id!),
    enabled:   !!id,
    staleTime: 10 * 60 * 1000,
  });
}
