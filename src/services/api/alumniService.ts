/**
 * Service API pour les Alumni.
 * Alumni = apprenants ayant termine un bootcamp.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Alumni,
  CreateAlumniDTO,
  UpdateAlumniDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/alumni';

export const alumniService = {
  /** Recuperer les alumni publies (site public) */
  getPublished: () =>
    httpClient.get<Alumni[]>(`${BASE_PATH}/published`),

  /** Recuperer tous les alumni (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Alumni>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Recuperer un alumni par ID */
  getById: (id: string) =>
    httpClient.get<Alumni>(`${BASE_PATH}/${id}`),

  /** Creer un alumni (admin) */
  create: (data: CreateAlumniDTO) =>
    httpClient.post<Alumni>(BASE_PATH, data),

  /** Mettre a jour un alumni (admin) */
  update: (id: string, data: UpdateAlumniDTO) =>
    httpClient.put<Alumni>(`${BASE_PATH}/${id}`, data),

  /** Supprimer un alumni (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
