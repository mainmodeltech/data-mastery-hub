/**
 * Service API pour les Bootcamps.
 * Routes publiques : /bootcamps (lecture seule, published + not deleted)
 * Routes admin : /admin/bootcamps (CRUD complet)
 */

import { httpClient } from '@/services/httpClient';
import type {
  Bootcamp,
  CreateBootcampDTO,
  UpdateBootcampDTO,
  PaginatedResponse,
} from '@/types';

const PUBLIC_PATH = '/bootcamps';
const ADMIN_PATH = '/admin/bootcamps';

export const bootcampService = {
  /** Recuperer les bootcamps publies (site public) */
  getPublished: (page = 0, size = 20) =>
    httpClient.get<PaginatedResponse<Bootcamp>>(PUBLIC_PATH, {
      params: { page, size },
      skipAuth: true,
    }),

  /** Recuperer un bootcamp publie par ID (site public) */
  getPublishedById: (id: string) =>
    httpClient.get<Bootcamp>(`${PUBLIC_PATH}/${id}`, { skipAuth: true }),

  /** Recuperer tous les bootcamps non supprimes (admin) */
  getAll: (page = 0, size = 20) =>
    httpClient.get<PaginatedResponse<Bootcamp>>(ADMIN_PATH, {
      params: { page, size },
    }),

  /** Recuperer un bootcamp par ID (admin) */
  getById: (id: string) =>
    httpClient.get<Bootcamp>(`${ADMIN_PATH}/${id}`),

  /** Creer un nouveau bootcamp (admin) */
  create: (data: CreateBootcampDTO) =>
    httpClient.post<Bootcamp>(ADMIN_PATH, data),

  /** Mettre a jour un bootcamp (admin) */
  update: (id: string, data: UpdateBootcampDTO) =>
    httpClient.put<Bootcamp>(`${ADMIN_PATH}/${id}`, data),

  /** Supprimer un bootcamp - soft delete (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/${id}`),
};
