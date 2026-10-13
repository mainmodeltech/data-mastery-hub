/**
 * accountsAdminService.ts — comptes apprenants (/admin/learners) et back-office (/admin/users).
 * Réponses enveloppées dans ApiResponse<T> : on renvoie `data`.
 */
import { httpClient } from "@/services/httpClient";
import type {
  AdminLearner, AdminUserAccount, LearnerPayload, UserCreatePayload, UserUpdatePayload,
} from "@/types/accounts.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const PAGE = { page: 0, size: 200 };

export const learnerAdminService = {
  list: async (): Promise<AdminLearner[]> =>
    (await httpClient.get<ApiResponse<AdminLearner[]>>("/admin/learners", { params: PAGE })).data ?? [],
  create: async (payload: LearnerPayload): Promise<AdminLearner> =>
    (await httpClient.post<ApiResponse<AdminLearner>>("/admin/learners", payload)).data,
  setActive: async (id: string, active: boolean): Promise<AdminLearner> =>
    (await httpClient.patch<ApiResponse<AdminLearner>>(`/admin/learners/${id}/${active ? "activate" : "deactivate"}`, {})).data,
  resendInvitation: (id: string) => httpClient.post<ApiResponse<unknown>>(`/admin/learners/${id}/resend-invitation`),
};

export const userAdminService = {
  list: async (): Promise<AdminUserAccount[]> =>
    (await httpClient.get<ApiResponse<AdminUserAccount[]>>("/admin/users", { params: PAGE })).data ?? [],
  create: async (payload: UserCreatePayload): Promise<AdminUserAccount> =>
    (await httpClient.post<ApiResponse<AdminUserAccount>>("/admin/users", payload)).data,
  update: async (id: string, payload: UserUpdatePayload): Promise<AdminUserAccount> =>
    (await httpClient.put<ApiResponse<AdminUserAccount>>(`/admin/users/${id}`, payload)).data,
  /** Retire la double authentification d'un compte (téléphone perdu) ; le titulaire est prévenu et devra la reconfigurer. */
  resetMfa: async (id: string): Promise<AdminUserAccount> =>
    (await httpClient.post<ApiResponse<AdminUserAccount>>(`/admin/users/${id}/mfa/reset`, {})).data,
};
