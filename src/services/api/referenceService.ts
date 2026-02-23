/**
 * Service API pour les References clients/partenaires.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Reference,
  ReferenceCategory,
  CreateReferenceDTO,
  UpdateReferenceDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/references';

export const referenceService = {
  /** Recuperer les references publiees (site public) */
  getPublished: (category?: ReferenceCategory) =>
    httpClient.get<Reference[]>(`${BASE_PATH}/published`, {
      params: { category },
    }),

  /** Recuperer toutes les references (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Reference>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Recuperer une reference par ID */
  getById: (id: string) =>
    httpClient.get<Reference>(`${BASE_PATH}/${id}`),

  /** Creer une reference (admin) */
  create: (data: CreateReferenceDTO) =>
    httpClient.post<Reference>(BASE_PATH, data),

  /** Mettre a jour une reference (admin) */
  update: (id: string, data: UpdateReferenceDTO) =>
    httpClient.put<Reference>(`${BASE_PATH}/${id}`, data),

  /** Supprimer une reference (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
