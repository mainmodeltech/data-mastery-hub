import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { domainAdminService, partnerAdminService } from "@/services/api/catalogAdminService";
import { adminBootcampService } from "@/services/Adminbootcampservice";
import { QUERY_CONFIG } from "@/config/constants";
import type { DomainPayload, PartnerPayload } from "@/types/catalogAdmin.type";
import type { CreateBootcampPayload } from "@/types/bootcamp.type";

export const CATALOG_KEYS = {
  domains: ["admin", "domains"] as const,
  partners: ["admin", "partners"] as const,
  formations: ["admin", "formations"] as const,
  formation: (id: string) => ["admin", "formations", id] as const,
};

/** Le catalogue public (cache React Query) doit se rafraîchir après chaque modification admin. */
function invalidatePublicCatalog(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["formations"] });
  qc.invalidateQueries({ queryKey: ["domains"] });
  qc.invalidateQueries({ queryKey: ["partners"] });
}

export function useAdminDomains() {
  return useQuery({ queryKey: CATALOG_KEYS.domains, queryFn: domainAdminService.list, staleTime: QUERY_CONFIG.staleTime });
}

export function useSaveDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: DomainPayload }) =>
      id ? domainAdminService.update(id, payload) : domainAdminService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOG_KEYS.domains });
      invalidatePublicCatalog(qc);
    },
  });
}

export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => domainAdminService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOG_KEYS.domains });
      invalidatePublicCatalog(qc);
    },
  });
}

export function useAdminPartners() {
  return useQuery({ queryKey: CATALOG_KEYS.partners, queryFn: partnerAdminService.list, staleTime: QUERY_CONFIG.staleTime });
}

export function useSavePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload, logo }: { id?: string; payload: PartnerPayload; logo?: File | null }) => {
      const saved = id ? await partnerAdminService.update(id, payload) : await partnerAdminService.create(payload);
      return logo ? partnerAdminService.uploadLogo(saved.id, logo) : saved;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOG_KEYS.partners });
      invalidatePublicCatalog(qc);
    },
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partnerAdminService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATALOG_KEYS.partners });
      invalidatePublicCatalog(qc);
    },
  });
}

export function useAdminFormations() {
  return useQuery({ queryKey: CATALOG_KEYS.formations, queryFn: adminBootcampService.listFormations, staleTime: QUERY_CONFIG.staleTime });
}

export function useAdminFormation(id: string | undefined) {
  return useQuery({
    queryKey: CATALOG_KEYS.formation(id ?? ""),
    queryFn: () => adminBootcampService.getFormation(id as string),
    enabled: !!id,
  });
}

export function useSaveFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CreateBootcampPayload }) =>
      id ? adminBootcampService.update(id, payload) : adminBootcampService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      invalidatePublicCatalog(qc);
    },
  });
}
