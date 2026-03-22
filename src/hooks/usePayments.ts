/**
 * Hooks React Query pour les Paiements.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/api';
import type { CreatePaymentDTO } from '@/types';
import { REGISTRATION_KEYS } from './useRegistrations';

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  byRegistration: (registrationId: string) => ['payments', 'registration', registrationId] as const,
  financialSummary: (sessionId: string) => ['payments', 'financial-summary', sessionId] as const,
};

/** Lister les paiements d'une inscription */
export function usePayments(registrationId: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.byRegistration(registrationId),
    queryFn: () => paymentService.getByRegistration(registrationId),
    enabled: !!registrationId,
  });
}

/** Ajouter un paiement */
export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, data }: { registrationId: string; data: CreatePaymentDTO }) =>
      paymentService.addPayment(registrationId, data),
    onSuccess: (_, { registrationId }) => {
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.byRegistration(registrationId) });
      qc.invalidateQueries({ queryKey: REGISTRATION_KEYS.all });
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
    },
  });
}

/** Supprimer un paiement */
export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentService.delete(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      qc.invalidateQueries({ queryKey: REGISTRATION_KEYS.all });
    },
  });
}

/** Resume financier d'une session */
export function useFinancialSummary(sessionId: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.financialSummary(sessionId),
    queryFn: () => paymentService.getFinancialSummary(sessionId),
    enabled: !!sessionId,
  });
}
