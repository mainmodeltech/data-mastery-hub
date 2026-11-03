/**
 * legalService.ts — textes légaux : lecture publique, acceptation de l'apprenant, publication par la Direction.
 */
import { httpClient } from "@/services/httpClient";
import type {
  LegalAcceptanceView, LegalAdminDocument, LegalAdminOverview, LegalCode, LegalContext, LegalDocumentRef, LegalPublicDocument, LegalPublish,
  LegalRequirements, LegalSaveDraft,
} from "@/types/legal.type";

interface ApiResponse<T> { success: boolean; message: string; data: T; pagination?: { page: number; size: number; totalElements: number; totalPages: number } }

export const legalPublicService = {
  published: async (): Promise<LegalDocumentRef[]> => (await httpClient.get<ApiResponse<LegalDocumentRef[]>>("/legal/documents", { skipAuth: true })).data ?? [],

  document: async (code: LegalCode): Promise<LegalPublicDocument> =>
    (await httpClient.get<ApiResponse<LegalPublicDocument>>(`/legal/documents/${code}`, { skipAuth: true })).data,

  requirements: async (context: LegalContext): Promise<LegalRequirements> =>
    (await httpClient.get<ApiResponse<LegalRequirements>>("/legal/requirements", { params: { context }, skipAuth: true })).data,
};

export const legalLearnerService = {
  pending: async (): Promise<LegalDocumentRef[]> => (await httpClient.get<ApiResponse<LegalDocumentRef[]>>("/learner/legal/pending")).data ?? [],

  accept: async (documents: string[]): Promise<LegalDocumentRef[]> =>
    (await httpClient.post<ApiResponse<LegalDocumentRef[]>>("/learner/legal/accept", { documents })).data ?? [],
};

const base = "/admin/legal";

export const legalAdminService = {
  overview: async (): Promise<LegalAdminOverview[]> => (await httpClient.get<ApiResponse<LegalAdminOverview[]>>(base)).data ?? [],

  saveDraft: async (code: LegalCode, body: LegalSaveDraft): Promise<LegalAdminDocument> =>
    (await httpClient.put<ApiResponse<LegalAdminDocument>>(`${base}/${code}/draft`, body)).data,

  discardDraft: async (code: LegalCode): Promise<void> => { await httpClient.delete<ApiResponse<void>>(`${base}/${code}/draft`); },

  publish: async (code: LegalCode, body: LegalPublish): Promise<LegalAdminDocument> =>
    (await httpClient.post<ApiResponse<LegalAdminDocument>>(`${base}/${code}/publish`, body)).data,

  acceptances: async (email: string | undefined, code: LegalCode | undefined, page: number, size = 20): Promise<{ items: LegalAcceptanceView[]; totalElements: number; totalPages: number }> => {
    const res = await httpClient.get<ApiResponse<LegalAcceptanceView[]>>(`${base}/acceptances`, { params: { email: email || undefined, code, page, size } });
    return { items: res.data ?? [], totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0, totalPages: res.pagination?.totalPages ?? 1 };
  },
};
