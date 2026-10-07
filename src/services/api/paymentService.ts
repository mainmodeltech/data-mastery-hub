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
}

export const paymentAdminService = {
  accept: async (registrationId: string, payload: AcceptRegistrationPayload): Promise<Registration> =>
    (await httpClient.post<ApiResponse<Registration>>(`/admin/registrations/${registrationId}/accept`, payload)).data,

  reject: async (registrationId: string, reason: string): Promise<Registration> =>
    (await httpClient.post<ApiResponse<Registration>>(`/admin/registrations/${registrationId}/reject`, { reason })).data,

  recordPayment: async (registrationId: string, payload: ManualPaymentPayload): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/registrations/${registrationId}/payments`, payload)).data,

  listPayments: async (params: { status?: PaymentStatus; registrationId?: string; page?: number; size?: number } = {}): Promise<AdminPayment[]> =>
    (await httpClient.get<ApiResponse<AdminPayment[]>>("/admin/payments", { params: { size: 200, ...params } })).data ?? [],

  confirm: async (paymentId: string): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/payments/${paymentId}/confirm`)).data,

  rejectPayment: async (paymentId: string, reason: string): Promise<AdminPayment> =>
    (await httpClient.post<ApiResponse<AdminPayment>>(`/admin/payments/${paymentId}/reject`, { reason })).data,

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

  uploadProof: async (token: string, file: File): Promise<PublicPayment> => {
    const body = new FormData();
    body.append("file", file);
    return (await httpClient.post<ApiResponse<PublicPayment>>(`/payments/${encodeURIComponent(token)}/proof`, body, { skipAuth: true })).data;
  },
};
