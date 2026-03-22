/**
 * Service API pour les Paiements.
 * Gestion des paiements lies aux inscriptions bootcamp.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Payment,
  CreatePaymentDTO,
  SessionFinancialSummary,
  ApiResponse,
} from '@/types';

const ADMIN_PATH = '/admin';

export const paymentService = {
  /** Ajouter un paiement sur une inscription (admin) */
  addPayment: (registrationId: string, data: CreatePaymentDTO) =>
    httpClient.post<ApiResponse<Payment>>(`${ADMIN_PATH}/registrations/${registrationId}/payments`, data),

  /** Lister les paiements d'une inscription (admin) */
  getByRegistration: (registrationId: string) =>
    httpClient.get<ApiResponse<Payment[]>>(`${ADMIN_PATH}/registrations/${registrationId}/payments`),

  /** Supprimer un paiement (admin) */
  delete: (paymentId: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/payments/${paymentId}`),

  /** Resume financier d'une session (admin) */
  getFinancialSummary: (sessionId: string) =>
    httpClient.get<ApiResponse<SessionFinancialSummary>>(`${ADMIN_PATH}/sessions/${sessionId}/financial-summary`),
};
