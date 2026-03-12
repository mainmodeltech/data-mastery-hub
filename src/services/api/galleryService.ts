/**
 * Service API pour la Galerie de photos.
 */

import { httpClient } from '@/services/httpClient';
import type {
  GalleryPhoto,
  CreateGalleryPhotoDTO,
  UpdateGalleryPhotoDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/gallery';

export const galleryService = {
  /** Recuperer les photos publiees (site public) */
  getPublished: () =>
    httpClient.get<GalleryPhoto[]>(`${BASE_PATH}/published`),

  /** Recuperer toutes les photos (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<GalleryPhoto>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Creer une photo (admin) */
  create: (data: CreateGalleryPhotoDTO) =>
    httpClient.post<GalleryPhoto>(BASE_PATH, data),

  /** Mettre a jour une photo (admin) */
  update: (id: string, data: UpdateGalleryPhotoDTO) =>
    httpClient.put<GalleryPhoto>(`${BASE_PATH}/${id}`, data),

  /** Supprimer une photo (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
