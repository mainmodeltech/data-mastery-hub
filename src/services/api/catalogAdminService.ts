/**
 * catalogAdminService.ts — domaines et partenaires du catalogue (admin).
 * Les réponses sont enveloppées dans ApiResponse<T> : on renvoie directement `data`.
 */
import { httpClient } from "@/services/httpClient";
import type { AdminDomain, AdminPartner, DomainPayload, PartnerPayload } from "@/types/catalogAdmin.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const PAGE = { page: 0, size: 100 };

export const domainAdminService = {
  list: async (): Promise<AdminDomain[]> =>
    (await httpClient.get<ApiResponse<AdminDomain[]>>("/admin/domains", { params: PAGE })).data ?? [],
  create: async (payload: DomainPayload): Promise<AdminDomain> =>
    (await httpClient.post<ApiResponse<AdminDomain>>("/admin/domains", payload)).data,
  update: async (id: string, payload: Partial<DomainPayload>): Promise<AdminDomain> =>
    (await httpClient.put<ApiResponse<AdminDomain>>(`/admin/domains/${id}`, payload)).data,
  remove: (id: string) => httpClient.delete<void>(`/admin/domains/${id}`),
};

export const partnerAdminService = {
  list: async (): Promise<AdminPartner[]> =>
    (await httpClient.get<ApiResponse<AdminPartner[]>>("/admin/partners", { params: PAGE })).data ?? [],
  create: async (payload: PartnerPayload): Promise<AdminPartner> =>
    (await httpClient.post<ApiResponse<AdminPartner>>("/admin/partners", payload)).data,
  update: async (id: string, payload: Partial<PartnerPayload>): Promise<AdminPartner> =>
    (await httpClient.put<ApiResponse<AdminPartner>>(`/admin/partners/${id}`, payload)).data,
  uploadLogo: async (id: string, file: File): Promise<AdminPartner> => {
    const body = new FormData();
    body.append("file", file);
    return (await httpClient.post<ApiResponse<AdminPartner>>(`/admin/partners/${id}/logo`, body)).data;
  },
  remove: (id: string) => httpClient.delete<void>(`/admin/partners/${id}`),
};
