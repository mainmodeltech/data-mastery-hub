/**
 * Service API pour les Services proposes par Model Technologie.
 * Routes publiques : /services (lecture seule, published + not deleted)
 * Routes admin : /admin/services (CRUD complet)
 */

import { httpClient } from '@/services/httpClient';
import type {
  Service,
  CreateServiceDTO,
  UpdateServiceDTO,
  PaginatedResponse, CreateContactMessageDTO, ContactMessage,
} from '@/types';

const PUBLIC_PATH = '/services';
const ADMIN_PATH = '/admin/services';

export const serviceService = {
  /** Recuperer les services publies (liste plate triee par displayOrder) */
  getPublished: () =>
    httpClient.get<Service[]>(PUBLIC_PATH, { skipAuth: true }),

  /** Recuperer un service publie par ID (site public) */
  getPublishedById: (id: string) =>
    httpClient.get<Service>(`${PUBLIC_PATH}/${id}`, { skipAuth: true }),

  /** Recuperer tous les services non supprimes (admin, pagine) */
  getAll: (page = 0, size = 20) =>
    httpClient.get<PaginatedResponse<Service>>(ADMIN_PATH, {
      params: { page, size },
    }),

  /** Recuperer un service par ID (admin) */
  getById: (id: string) =>
    httpClient.get<Service>(`${ADMIN_PATH}/${id}`),

  /** Creer un service (admin) */
  create: (data: CreateServiceDTO) =>
    httpClient.post<Service>(ADMIN_PATH, data),

  /** Mettre a jour un service (admin) */
  update: (id: string, data: UpdateServiceDTO) =>
    httpClient.put<Service>(`${ADMIN_PATH}/${id}`, data),

  /** Supprimer un service - soft delete (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/${id}`),

};
