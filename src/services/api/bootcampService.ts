/**
 * Service API pour les Bootcamps.
 * Abstraction entre les composants UI et le backend.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Bootcamp,
  CreateBootcampDTO,
  UpdateBootcampDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/bootcamps';

export const bootcampService = {
  /** Recuperer tous les bootcamps publies (site public) */
  getPublished: () =>
    httpClient.get<Bootcamp[]>(`${BASE_PATH}/published`),

  /** Recuperer tous les bootcamps (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Bootcamp>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Recuperer un bootcamp par ID */
  getById: (id: string) =>
    httpClient.get<Bootcamp>(`${BASE_PATH}/${id}`),

  /** Creer un nouveau bootcamp (admin) */
  create: (data: CreateBootcampDTO) =>
    httpClient.post<Bootcamp>(BASE_PATH, data),

  /** Mettre a jour un bootcamp (admin) */
  update: (id: string, data: UpdateBootcampDTO) =>
    httpClient.put<Bootcamp>(`${BASE_PATH}/${id}`, data),

  /** Supprimer un bootcamp (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
