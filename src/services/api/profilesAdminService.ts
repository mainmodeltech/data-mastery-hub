/**
 * profilesAdminService.ts — profils et droits du back-office (/admin/profiles).
 * Lecture : droit « Profils et droits » ou « Comptes et accès » (pour attribuer un profil) ; écriture : « Profils et droits ».
 */
import { httpClient } from "@/services/httpClient";
import type { PermissionDef, ProfilePayload, StaffProfile } from "@/types/profiles.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE = "/admin/profiles";

export const profilesAdminService = {
  list: async (): Promise<StaffProfile[]> => (await httpClient.get<ApiResponse<StaffProfile[]>>(BASE)).data ?? [],
  catalogue: async (): Promise<PermissionDef[]> => (await httpClient.get<ApiResponse<PermissionDef[]>>(`${BASE}/permissions`)).data ?? [],
  create: async (payload: ProfilePayload): Promise<StaffProfile> => (await httpClient.post<ApiResponse<StaffProfile>>(BASE, payload)).data,
  update: async (id: string, payload: ProfilePayload): Promise<StaffProfile> =>
    (await httpClient.put<ApiResponse<StaffProfile>>(`${BASE}/${id}`, payload)).data,
  /** Rétablit les droits par défaut d'un profil livré. */
  reset: async (id: string): Promise<StaffProfile> => (await httpClient.post<ApiResponse<StaffProfile>>(`${BASE}/${id}/reset`, {})).data,
  remove: async (id: string): Promise<void> => { await httpClient.delete<ApiResponse<unknown>>(`${BASE}/${id}`); },
};
