import { useQuery } from "@tanstack/react-query";

import { auditService } from "@/services/api/auditService";
import type { AuditFilters } from "@/types/audit.type";

export const AUDIT_KEYS = {
  all: ["admin", "audit"] as const,
  catalogue: ["admin", "audit", "catalogue"] as const,
};

export function useAuditLog(filters: AuditFilters, page: number) {
  return useQuery({
    queryKey: [...AUDIT_KEYS.all, filters, page],
    queryFn: () => auditService.search(filters, page),
    placeholderData: (prev) => prev,
    staleTime: 0,
  });
}

export function useAuditCatalogue() {
  return useQuery({ queryKey: AUDIT_KEYS.catalogue, queryFn: auditService.catalogue, staleTime: Infinity });
}
