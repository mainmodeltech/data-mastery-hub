/**
 * adminOpsService.ts — opérations du back-office : factures, certificats, journal d'e-mails.
 * Contrats : modeltech-backend AdminInvoiceController, AdminCertificateController, AdminEmailLogController.
 * Les réponses sont enveloppées dans ApiResponse<T> (listes paginées : `pagination`).
 */
import { httpClient } from "@/services/httpClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination { page: number; size: number; totalElements: number; totalPages: number }
export interface Paged<T> { items: T[]; pagination: Pagination }

const paged = <T,>(res: ApiResponse<T[]>, page: number, size: number): Paged<T> => ({
  items: res.data ?? [],
  pagination: res.pagination ?? { page, size, totalElements: res.data?.length ?? 0, totalPages: 1 },
});

// ─── Factures ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = "ISSUED" | "CANCELLED" | string;

export interface Invoice {
  id: string;
  number: string;
  registrationId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  buyerName: string;
  buyerContact: string | null;
  buyerEmail: string | null;
  purchaseOrderRef: string | null;
  description: string | null;
  unitAmount: number;
  discountAmount: number | null;
  totalExclVat: number;
  vatAmount: number;
  total: number;
  currency: string;
  cancelledAt: string | null;
  cancelledReason: string | null;
  pdfPath: string;
}

export interface CreateInvoicePayload {
  buyerName?: string;
  buyerContact?: string;
  buyerEmail?: string;
  buyerAddress?: string;
  purchaseOrderRef?: string;
  dueDate?: string;
  notes?: string;
}

export const invoiceAdminService = {
  list: async (page = 0, size = 20, status?: string): Promise<Paged<Invoice>> =>
    paged(await httpClient.get<ApiResponse<Invoice[]>>("/admin/invoices", { params: { page, size, status } }), page, size),

  byRegistration: async (registrationId: string): Promise<Invoice[]> =>
    (await httpClient.get<ApiResponse<Invoice[]>>(`/admin/registrations/${registrationId}/invoices`)).data ?? [],

  create: async (registrationId: string, payload: CreateInvoicePayload): Promise<Invoice> =>
    (await httpClient.post<ApiResponse<Invoice>>(`/admin/registrations/${registrationId}/invoice`, payload)).data,

  cancel: async (number: string, reason: string): Promise<Invoice> =>
    (await httpClient.post<ApiResponse<Invoice>>(`/admin/invoices/${encodeURIComponent(number)}/cancel`, { reason })).data,

  send: async (number: string, to?: string): Promise<void> => {
    await httpClient.post<ApiResponse<null>>(`/admin/invoices/${encodeURIComponent(number)}/send`, to ? { to } : undefined);
  },

  pdf: (number: string): Promise<Blob> => httpClient.getBlob(`/admin/invoices/${encodeURIComponent(number)}/pdf`),
};

// ─── Certificats ──────────────────────────────────────────────────────────────

export interface AdminCertificate {
  id: string;
  publicId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  formationId: string;
  formationTitle: string;
  sessionId: string;
  sessionName: string | null;
  issuedAt: string;
  issuedBy: string | null;
  forced: boolean;
  forceReason: string | null;
  status: "VALID" | "REVOKED" | string;
  revokedAt: string | null;
  revokedReason: string | null;
  verifyUrl: string;
}

export const certificateAdminService = {
  list: async (page = 0, size = 20, status?: string): Promise<Paged<AdminCertificate>> =>
    paged(await httpClient.get<ApiResponse<AdminCertificate[]>>("/admin/certificates", { params: { page, size, status } }), page, size),

  /** Délivre le certificat d'un apprenant ; `force` + motif pour déroger aux conditions (ADMIN / SUPER_ADMIN). */
  issue: async (sessionId: string, learnerId: string, options: { force?: boolean; reason?: string } = {}): Promise<AdminCertificate> =>
    (await httpClient.post<ApiResponse<AdminCertificate>>(`/admin/sessions/${sessionId}/learners/${learnerId}/certificate`, options)).data,

  revoke: async (publicId: string, reason: string): Promise<AdminCertificate> =>
    (await httpClient.post<ApiResponse<AdminCertificate>>(`/admin/certificates/${encodeURIComponent(publicId)}/revoke`, { reason })).data,

  resend: async (publicId: string): Promise<void> => {
    await httpClient.post<ApiResponse<null>>(`/admin/certificates/${encodeURIComponent(publicId)}/resend`);
  },
};

// ─── Journal d'e-mails ────────────────────────────────────────────────────────

export interface EmailLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: "SENT" | "FAILED" | "SKIPPED" | string;
  attempts: number | null;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface MailStatus {
  configured: boolean;
  host: string;
  port: number;
  from: string;
  redirectTo: string | null;
  maxAttempts: number;
  lastSentAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
}

export const emailLogAdminService = {
  list: async (page = 0, size = 20, status?: string, type?: string): Promise<Paged<EmailLog>> =>
    paged(await httpClient.get<ApiResponse<EmailLog[]>>("/admin/email-logs", { params: { page, size, status, type } }), page, size),

  status: async (): Promise<MailStatus> =>
    (await httpClient.get<ApiResponse<MailStatus>>("/admin/email-logs/status")).data,

  /** Envoie un e-mail de test (SUPER_ADMIN). */
  sendTest: async (to: string): Promise<{ sent: boolean; deliveredTo: string; message: string }> =>
    (await httpClient.post<ApiResponse<{ sent: boolean; deliveredTo: string; message: string }>>("/admin/email-logs/test", { to })).data,
};
