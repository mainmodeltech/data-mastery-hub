import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  certificateAdminService,
  emailLogAdminService,
  invoiceAdminService,
  type CreateInvoicePayload,
} from "@/services/api/adminOpsService";

export const OPS_KEYS = {
  invoices: ["admin", "invoices"] as const,
  registrationInvoices: (id: string) => ["admin", "invoices", "registration", id] as const,
  certificates: ["admin", "certificates"] as const,
  emails: ["admin", "email-logs"] as const,
  mailStatus: ["admin", "email-logs", "status"] as const,
};

// ─── Factures ─────────────────────────────────────────────────────────────────

export function useInvoices(page: number, status?: string) {
  return useQuery({
    queryKey: [...OPS_KEYS.invoices, { page, status }],
    queryFn: () => invoiceAdminService.list(page, 20, status),
    placeholderData: (prev) => prev,
  });
}

export function useRegistrationInvoices(registrationId: string | undefined) {
  return useQuery({
    queryKey: OPS_KEYS.registrationInvoices(registrationId ?? ""),
    queryFn: () => invoiceAdminService.byRegistration(registrationId as string),
    enabled: !!registrationId,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, payload }: { registrationId: string; payload: CreateInvoicePayload }) =>
      invoiceAdminService.create(registrationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_KEYS.invoices }),
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ number, reason }: { number: string; reason: string }) => invoiceAdminService.cancel(number, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_KEYS.invoices }),
  });
}

export function useSendInvoice() {
  return useMutation({ mutationFn: ({ number, to }: { number: string; to?: string }) => invoiceAdminService.send(number, to) });
}

// ─── Certificats ──────────────────────────────────────────────────────────────

export function useAdminCertificates(page: number, status?: string) {
  return useQuery({
    queryKey: [...OPS_KEYS.certificates, { page, status }],
    queryFn: () => certificateAdminService.list(page, 20, status),
    placeholderData: (prev) => prev,
  });
}

export function useIssueCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, learnerId, force, reason }: { sessionId: string; learnerId: string; force?: boolean; reason?: string }) =>
      certificateAdminService.issue(sessionId, learnerId, { force, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_KEYS.certificates }),
  });
}

export function useRevokeCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, reason }: { publicId: string; reason: string }) => certificateAdminService.revoke(publicId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_KEYS.certificates }),
  });
}

export function useValidateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => certificateAdminService.validate(publicId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: OPS_KEYS.certificates }); qc.invalidateQueries({ queryKey: ["admin", "stats"] }); },
  });
}

export function useValidateCertificates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicIds: string[]) => certificateAdminService.validateMany(publicIds),
    onSuccess: () => { qc.invalidateQueries({ queryKey: OPS_KEYS.certificates }); qc.invalidateQueries({ queryKey: ["admin", "stats"] }); },
  });
}

export function useResendCertificate() {
  return useMutation({ mutationFn: (publicId: string) => certificateAdminService.resend(publicId) });
}

// ─── Journal d'e-mails ────────────────────────────────────────────────────────

export function useEmailLogs(page: number, status?: string, type?: string) {
  return useQuery({
    queryKey: [...OPS_KEYS.emails, { page, status, type }],
    queryFn: () => emailLogAdminService.list(page, 20, status, type),
    placeholderData: (prev) => prev,
  });
}

export function useMailStatus() {
  return useQuery({ queryKey: OPS_KEYS.mailStatus, queryFn: emailLogAdminService.status, staleTime: 30 * 1000 });
}

export function useSendTestEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (to: string) => emailLogAdminService.sendTest(to),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_KEYS.emails }),
  });
}
