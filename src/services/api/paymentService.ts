/**
 * paymentService.ts — parcours candidature → paiement (admin) et lien de paiement (public).
 * Toutes les réponses sont enveloppées dans ApiResponse<T> : on renvoie `data`.
 */
import { httpClient } from "@/services/httpClient";
import type { Registration } from "@/types";
import type {
  AcceptRegistrationPayload,
  AdminEnrollment,
  AdminPayment,
  DeclarePaymentPayload,
  ManualPaymentPayload,
  PaymentStatus,
  PublicPayment,
} from "@/types/payment.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; size: number; totalElements: number; totalPages: number };
}

const PAYMENTS_PAGE_SIZE = 200;
const PAYMENTS_MAX_PAGES = 25;

/** Candidature saisie par l'équipe (appel, visite, entreprise) — mêmes champs que le formulaire public, sans reCAPTCHA. */
export interface ManualRegistrationPayload {
  bootcampId?: string;
  sessionId?: string;
  bootcampTitle?: string;
  promoCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  profile: "STUDENT" | "PROFESSIONAL" | "ENTREPRENEUR";
  school?: string;
  company?: string;
  position?: string;
  message?: string;
}

export const paymentAdminService = {
  createManual: async (payload: ManualRegistrationPayload): Promise<Registration> =>
    (await httpClient.post<ApiResponse<Registration>>("/admin/registrations", payload)).data,

  /** Annule une inscription (échéances ouvertes annulées, place libérée si elle était confirmée). */
  cancel: async (registrationId: string, reason: string): Promise<Registration> =>
    (await httpClient.post<ApiResponse<Registration>>(`/admin/registrations/${registrationId}/cancel`, { reason })).data,

  accept: async (registrationId: string, payload: AcceptRegistrationPayload): Promise<Registration> =>
    (await httpClient.post<ApiResponse<Registration>>(`/admin/registrations/${registrationId}/accept`, payload)).data,

  reject: async (registrationId: string, reason: string): Promise<Registration> =>
    (await httpClient.post<ApiResponse<Registration>>(`/admin/registrations/${registrationId}/reject`, { reason })).data,

  recordPayment: async (registrationId: string, payload: ManualPaymentPayload): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/registrations/${registrationId}/payments`, payload)).data,

  listPayments: async (params: { status?: PaymentStatus; registrationId?: string; page?: number; size?: number } = {}): Promise<AdminPayment[]> =>
    (await httpClient.get<ApiResponse<AdminPayment[]>>("/admin/payments", { params: { size: 200, ...params } })).data ?? [],

  /** Tous les paiements (toutes pages, 5 000 au plus), du plus récent au plus ancien. */
  listAllPayments: async (): Promise<AdminPayment[]> => {
    const all: AdminPayment[] = [];
    for (let page = 0; page < PAYMENTS_MAX_PAGES; page++) {
      const res = await httpClient.get<ApiResponse<AdminPayment[]>>("/admin/payments", {
        params: { page, size: PAYMENTS_PAGE_SIZE, sort: "createdAt,desc" },
      });
      all.push(...(res.data ?? []));
      if (!res.pagination || page >= res.pagination.totalPages - 1) break;
    }
    return all;
  },

  confirm: async (paymentId: string): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/payments/${paymentId}/confirm`)).data,

  rejectPayment: async (paymentId: string, reason: string): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/payments/${paymentId}/reject`, { reason })).data,

  refund: async (paymentId: string, reason: string): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/payments/${paymentId}/refund`, { reason })).data,

  remind: async (paymentId: string): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/payments/${paymentId}/remind`)).data,

  listEnrollments: async (): Promise<AdminEnrollment[]> =>
    (await httpClient.get<ApiResponse<AdminEnrollment[]>>("/admin/enrollments", { params: { size: 200 } })).data ?? [],
};

export const paymentLinkService = {
  get: async (token: string): Promise<PublicPayment> =>
    (await httpClient.get<ApiResponse<PublicPayment>>(`/payments/${encodeURIComponent(token)}`, { skipAuth: true })).data,

  declare: async (token: string, payload: DeclarePaymentPayload): Promise<PublicPayment> =>
    (await httpClient.post<ApiResponse<PublicPayment>>(`/payments/${encodeURIComponent(token)}/declaration`, payload, { skipAuth: true })).data,

  /** Facture de l'inscription (PDF) ; 404 si aucune facture en vigueur */
  downloadInvoice: (token: string): Promise<Blob> =>
    httpClient.getBlob(`/payments/${encodeURIComponent(token)}/invoice`, { skipAuth: true }),

  uploadProof: async (token: string, file: File): Promise<PublicPayment> => {
    const body = new FormData();
    body.append("file", file);
    return (await httpClient.post<ApiResponse<PublicPayment>>(`/payments/${encodeURIComponent(token)}/proof`, body, { skipAuth: true })).data;
  },
};
