/**
 * Service API pour les Temoignages.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Testimonial,
  CreateTestimonialDTO,
  UpdateTestimonialDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/testimonials';

export const testimonialService = {
  /** Recuperer les temoignages publies (site public) */
  getPublished: () =>
    httpClient.get<Testimonial[]>(`${BASE_PATH}/published`),

  /** Recuperer tous les temoignages (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Testimonial>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Recuperer un temoignage par ID */
  getById: (id: string) =>
    httpClient.get<Testimonial>(`${BASE_PATH}/${id}`),

  /** Creer un temoignage (admin) */
  create: (data: CreateTestimonialDTO) =>
    httpClient.post<Testimonial>(BASE_PATH, data),

  /** Mettre a jour un temoignage (admin) */
  update: (id: string, data: UpdateTestimonialDTO) =>
    httpClient.put<Testimonial>(`${BASE_PATH}/${id}`, data),

  /** Supprimer un temoignage (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
