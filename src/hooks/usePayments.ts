import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { paymentAdminService, paymentLinkService } from "@/services/api/paymentService";
import { REGISTRATION_KEYS } from "@/hooks/useRegistrations";
import { QUERY_CONFIG } from "@/config/constants";
import type { AcceptRegistrationPayload, DeclarePaymentPayload, ManualPaymentPayload } from "@/types/payment.type";

export const PAYMENT_KEYS = {
  open: ["admin", "payments", "open"] as const,
  all: ["admin", "payments", "all"] as const,
  enrollments: ["admin", "enrollments"] as const,
  link: (token: string) => ["payment-link", token] as const,
};

/** Échéances en cours (à payer ou à confirmer) — alimente les colonnes de paiement du Kanban. */
export function useOpenPayments() {
  return useQuery({
    queryKey: PAYMENT_KEYS.open,
    queryFn: async () => {
      const [pending, declared] = await Promise.all([
        paymentAdminService.listPayments({ status: "PENDING" }),
        paymentAdminService.listPayments({ status: "DECLARED" }),
      ]);
      return [...pending, ...declared];
    },
    staleTime: 30 * 1000,
  });
}

/** Tous les paiements (page « Paiements » : suivi, avancement par formation). */
export function useAllPayments() {
  return useQuery({ queryKey: PAYMENT_KEYS.all, queryFn: paymentAdminService.listAllPayments, staleTime: 30 * 1000 });
}

export function useEnrollments() {
  return useQuery({ queryKey: PAYMENT_KEYS.enrollments, queryFn: paymentAdminService.listEnrollments, staleTime: QUERY_CONFIG.staleTime });
}

function useRefreshPipeline() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: REGISTRATION_KEYS.all });
    qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    qc.invalidateQueries({ queryKey: PAYMENT_KEYS.enrollments });
  };
}

export function useAcceptRegistration() {
  const refresh = useRefreshPipeline();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AcceptRegistrationPayload }) => paymentAdminService.accept(id, payload),
    onSuccess: refresh,
  });
}

export function useRejectRegistration() {
  const refresh = useRefreshPipeline();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => paymentAdminService.reject(id, reason),
    onSuccess: refresh,
  });
}

export function useRecordManualPayment() {
  const refresh = useRefreshPipeline();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ManualPaymentPayload }) => paymentAdminService.recordPayment(id, payload),
    onSuccess: refresh,
  });
}

export function useConfirmPayment() {
  const refresh = useRefreshPipeline();
  return useMutation({ mutationFn: (id: string) => paymentAdminService.confirm(id), onSuccess: refresh });
}

export function useRejectPayment() {
  const refresh = useRefreshPipeline();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => paymentAdminService.rejectPayment(id, reason),
    onSuccess: refresh,
  });
}

export function useRefundPayment() {
  const refresh = useRefreshPipeline();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => paymentAdminService.refund(id, reason),
    onSuccess: refresh,
  });
}

export function useRemindPayment() {
  const refresh = useRefreshPipeline();
  return useMutation({ mutationFn: (id: string) => paymentAdminService.remind(id), onSuccess: refresh });
}

// ─── Lien public ─────────────────────────────────────────────────────────────

export function usePaymentLink(token: string | undefined) {
  return useQuery({
    queryKey: PAYMENT_KEYS.link(token ?? ""),
    queryFn: () => paymentLinkService.get(token as string),
    enabled: !!token,
    retry: false,
  });
}

export function useDeclarePayment(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeclarePaymentPayload) => paymentLinkService.declare(token, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_KEYS.link(token) }),
  });
}

export function useUploadPaymentProof(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => paymentLinkService.uploadProof(token, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_KEYS.link(token) }),
  });
}

/** Télécharge la facture PDF du lien de paiement (le blob n'est jamais mis en cache). */
export function useDownloadInvoice(token: string) {
  return useMutation({ mutationFn: () => paymentLinkService.downloadInvoice(token) });
}
