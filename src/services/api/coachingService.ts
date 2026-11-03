/**
 * coachingService.ts — demandes de coaching : formulaire et page de paiement publics (sans jeton d'authentification, le lien secret fait foi),
 * traitement par l'équipe (administration).
 */
import { httpClient } from "@/services/httpClient";
import type { DeclareRequest } from "@/types/simulatorShop.type";
import type {
  CoachingCheckoutView, CoachingPayView, CoachingRequestForm, CoachingRequestReceipt, CoachingRequestView, CoachingReviewUpdate,
  CoachingStartResponse, CoachingStatus, CoachingSummary, CoachingValidatePayload,
} from "@/types/coaching.type";

interface ApiResponse<T> { success: boolean; message: string; data: T; pagination?: { page: number; size: number; totalElements: number; totalPages: number } }

const enc = encodeURIComponent;

export const coachingPublicService = {
  request: async (body: CoachingRequestForm): Promise<CoachingRequestReceipt> =>
    (await httpClient.post<ApiResponse<CoachingRequestReceipt>>("/coaching-requests", body, { skipAuth: true })).data,

  view: async (token: string): Promise<CoachingPayView> =>
    (await httpClient.get<ApiResponse<CoachingPayView>>(`/coaching/payments/${enc(token)}`, { skipAuth: true })).data,

  /** Acceptation des conditions de vente en vigueur, préalable au paiement. */
  acceptTerms: async (token: string, documents: string[]): Promise<CoachingPayView> =>
    (await httpClient.post<ApiResponse<CoachingPayView>>(`/coaching/payments/${enc(token)}/accept`, { documents }, { skipAuth: true })).data,

  startOnline: async (token: string): Promise<CoachingStartResponse> =>
    (await httpClient.post<ApiResponse<CoachingStartResponse>>(`/coaching/payments/${enc(token)}/online`, undefined, { skipAuth: true })).data,

  declare: async (token: string, body: DeclareRequest): Promise<CoachingPayView> =>
    (await httpClient.post<ApiResponse<CoachingPayView>>(`/coaching/payments/${enc(token)}/declaration`, body, { skipAuth: true })).data,

  uploadProof: async (token: string, file: File): Promise<CoachingPayView> => {
    const form = new FormData();
    form.append("file", file);
    return (await httpClient.post<ApiResponse<CoachingPayView>>(`/coaching/payments/${enc(token)}/proof`, form, { skipAuth: true })).data;
  },

  checkout: async (ref: string): Promise<CoachingCheckoutView> =>
    (await httpClient.get<ApiResponse<CoachingCheckoutView>>(`/coaching/checkouts/${enc(ref)}`, { skipAuth: true })).data,
};

const base = "/admin/coaching-requests";

export const coachingAdminService = {
  list: async (status: CoachingStatus | undefined, page: number, size = 20): Promise<{ items: CoachingRequestView[]; totalElements: number; totalPages: number }> => {
    const res = await httpClient.get<ApiResponse<CoachingRequestView[]>>(base, { params: { status, page, size } });
    return { items: res.data ?? [], totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0, totalPages: res.pagination?.totalPages ?? 1 };
  },

  get: async (id: string): Promise<CoachingRequestView> => (await httpClient.get<ApiResponse<CoachingRequestView>>(`${base}/${id}`)).data,

  summary: async (): Promise<CoachingSummary> => (await httpClient.get<ApiResponse<CoachingSummary>>(`${base}/summary`)).data,

  take: async (id: string): Promise<CoachingRequestView> => (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/take`)).data,

  update: async (id: string, body: CoachingReviewUpdate): Promise<CoachingRequestView> =>
    (await httpClient.put<ApiResponse<CoachingRequestView>>(`${base}/${id}`, body)).data,

  validate: async (id: string, body: CoachingValidatePayload): Promise<CoachingRequestView> =>
    (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/validate`, body)).data,

  decline: async (id: string, reason: string): Promise<CoachingRequestView> =>
    (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/decline`, { reason })).data,

  cancel: async (id: string, reason: string): Promise<CoachingRequestView> =>
    (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/cancel`, { reason })).data,

  resendLink: async (id: string): Promise<CoachingRequestView> => (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/resend-link`)).data,

  confirmPayment: async (id: string): Promise<CoachingRequestView> => (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/payment/confirm`)).data,

  rejectPayment: async (id: string, reason: string): Promise<CoachingRequestView> =>
    (await httpClient.post<ApiResponse<CoachingRequestView>>(`${base}/${id}/payment/reject`, { reason })).data,

  /** Lien signé et temporaire vers le justificatif joint par le client. */
  proof: async (id: string): Promise<string> => (await httpClient.get<ApiResponse<{ url: string }>>(`${base}/${id}/proof`)).data.url,
};
