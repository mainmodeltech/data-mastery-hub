/**
 * auditService.ts — journal d'audit (lecture seule). Enveloppe ApiResponse<T> : liste dans `data`, pagination à côté.
 */
import { httpClient } from "@/services/httpClient";
import type { AuditCatalogue, AuditEntry, AuditFilters } from "@/types/audit.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; size: number; totalElements: number; totalPages: number };
}

export interface AuditPage {
  entries: AuditEntry[];
  totalElements: number;
  totalPages: number;
}

export const auditService = {
  search: async (filters: AuditFilters, page: number, size = 30): Promise<AuditPage> => {
    const res = await httpClient.get<ApiResponse<AuditEntry[]>>("/admin/audit", {
      params: { ...filters, page, size },
    });
    return {
      entries: res.data ?? [],
      totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0,
      totalPages: res.pagination?.totalPages ?? 1,
    };
  },

  catalogue: async (): Promise<AuditCatalogue> =>
    (await httpClient.get<ApiResponse<AuditCatalogue>>("/admin/audit/catalogue")).data,
};
