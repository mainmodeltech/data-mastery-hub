import { useQuery } from "@tanstack/react-query";
import { formationService } from "@/services/formationService";
import { QUERY_CONFIG } from "@/config/constants";

export const FORMATION_KEYS = {
  all: ["formations"] as const,
  detail: (slug: string) => ["formations", slug] as const,
  sessions: ["formations", "sessions"] as const,
  domains: ["formations", "domains"] as const,
  partners: ["formations", "partners"] as const,
};

export function useFormations() {
  return useQuery({
    queryKey: FORMATION_KEYS.all,
    queryFn: formationService.list,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useFormationBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: FORMATION_KEYS.detail(slug ?? ""),
    queryFn: () => formationService.getBySlug(slug as string),
    enabled: !!slug,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useAllFormationSessions() {
  return useQuery({
    queryKey: FORMATION_KEYS.sessions,
    queryFn: formationService.listAllSessions,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useDomains() {
  return useQuery({
    queryKey: FORMATION_KEYS.domains,
    queryFn: formationService.listDomains,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function usePartners() {
  return useQuery({
    queryKey: FORMATION_KEYS.partners,
    queryFn: formationService.listPartners,
    staleTime: QUERY_CONFIG.staleTime,
  });
}
