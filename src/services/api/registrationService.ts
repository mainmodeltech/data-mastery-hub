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

const PUBLIC_PATH = '/registrations';
const ADMIN_PATH = '/admin/registrations';

export const registrationService = {
  /** Creer une inscription (public - visiteur qui s'inscrit a un bootcamp) */
  create: (data: CreateRegistrationDTO) =>
    httpClient.post<Registration>(PUBLIC_PATH, data, { skipAuth: true }),

  /** Recuperer toutes les inscriptions (admin) */
  getAll: (page?: number, size?: number, status?: RegistrationStatus) =>
    httpClient.get<PaginatedResponse<Registration>>(ADMIN_PATH, {
      params: { page, size, status },
    }),

  /** Recuperer une inscription par ID (admin) */
  getById: (id: string) =>
    httpClient.get<Registration>(`${ADMIN_PATH}/${id}`),

  /** Mettre a jour le statut d'une inscription (admin) */
  updateStatus: (id: string, status: RegistrationStatus) =>
    httpClient.patch<Registration>(`${ADMIN_PATH}/${id}/status`, { status }),

  /** Supprimer une inscription (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/${id}`),
};
