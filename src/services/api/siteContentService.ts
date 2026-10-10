/**
 * siteContentService.ts — contenus éditoriaux du site (textes, images, FAQ, coordonnées…).
 * Contrat : modeltech-backend SiteSettingController (public) et AdminSiteSettingController (back-office).
 * Chaque clé (`site.company`, `page.home`…) porte un objet JSON libre ; les valeurs par défaut sont livrées
 * avec le backend et restaurables depuis l'administration.
 */
import { httpClient } from "@/services/httpClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SiteSettingEntry {
  key: string;
  value: unknown;
  updatedAt: string | null;
  updatedBy: string | null;
}

const PUBLIC_PATH = "/site-settings";
const ADMIN_PATH = "/admin/site-settings";

export const siteContentService = {
  /** Tous les contenus publiés, indexés par clé — endpoint public. */
  getAll: async (): Promise<Record<string, unknown>> => {
    const res = await httpClient.get<ApiResponse<Record<string, unknown>>>(PUBLIC_PATH, { skipAuth: true });
    return res.data ?? {};
  },

  listAdmin: async (): Promise<SiteSettingEntry[]> => {
    const res = await httpClient.get<ApiResponse<SiteSettingEntry[]>>(ADMIN_PATH);
    return res.data ?? [];
  },

  defaultKeys: async (): Promise<string[]> => {
    const res = await httpClient.get<ApiResponse<string[]>>(`${ADMIN_PATH}/defaults`);
    return res.data ?? [];
  },

  save: async (key: string, value: unknown): Promise<SiteSettingEntry> => {
    const res = await httpClient.put<ApiResponse<SiteSettingEntry>>(`${ADMIN_PATH}/${encodeURIComponent(key)}`, { value });
    return res.data;
  },

  reset: async (key: string): Promise<SiteSettingEntry> => {
    const res = await httpClient.post<ApiResponse<SiteSettingEntry>>(`${ADMIN_PATH}/${encodeURIComponent(key)}/reset`);
    return res.data;
  },

  remove: (key: string) => httpClient.delete<void>(`${ADMIN_PATH}/${encodeURIComponent(key)}`),
};
