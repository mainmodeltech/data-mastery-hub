/**
 * Service API pour les Inscriptions.
 * Gere le cycle : inscription visiteur -> relation client -> paiement -> bootcamp -> alumni
 */

import { httpClient } from '@/services/httpClient';
import type {
  Registration,
  CreateRegistrationDTO,
  RegistrationStatus,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/registrations';

export const registrationService = {
  /** Creer une inscription (public - visiteur qui s'inscrit a un bootcamp) */
  create: (data: CreateRegistrationDTO) =>
    httpClient.post<Registration>(BASE_PATH, data, { skipAuth: true }),

  /** Recuperer toutes les inscriptions (admin) */
  getAll: (page?: number, size?: number, status?: RegistrationStatus) =>
    httpClient.get<PaginatedResponse<Registration>>(BASE_PATH, {
      params: { page, size, status },
    }),

  /** Recuperer une inscription par ID (admin) */
  getById: (id: string) =>
    httpClient.get<Registration>(`${BASE_PATH}/${id}`),

  /** Mettre a jour le statut d'une inscription (admin) */
  updateStatus: (id: string, status: RegistrationStatus) =>
    httpClient.patch<Registration>(`${BASE_PATH}/${id}/status`, { status }),

  /** Supprimer une inscription (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
