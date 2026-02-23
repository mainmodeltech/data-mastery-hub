/**
 * Service API pour les Services proposes par Model Technologie.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Service,
  CreateServiceDTO,
  UpdateServiceDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/services';

export const serviceService = {
  /** Recuperer les services publies (site public) */
  getPublished: () =>
    httpClient.get<Service[]>(`${BASE_PATH}/published`),

  /** Recuperer tous les services (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Service>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Recuperer un service par ID */
  getById: (id: string) =>
    httpClient.get<Service>(`${BASE_PATH}/${id}`),

  /** Creer un service (admin) */
  create: (data: CreateServiceDTO) =>
    httpClient.post<Service>(BASE_PATH, data),

  /** Mettre a jour un service (admin) */
  update: (id: string, data: UpdateServiceDTO) =>
    httpClient.put<Service>(`${BASE_PATH}/${id}`, data),

  /** Supprimer un service (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
