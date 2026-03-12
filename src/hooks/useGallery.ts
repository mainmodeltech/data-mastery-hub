/**
 * Hooks React Query pour la Galerie de photos.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService } from '@/services/api';
import type { CreateGalleryPhotoDTO, UpdateGalleryPhotoDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const GALLERY_KEYS = {
  all: ['gallery'] as const,
  published: ['gallery', 'published'] as const,
};

/** Hook pour recuperer les photos publiees (site public) */
export function usePublishedGallery() {
  return useQuery({
    queryKey: GALLERY_KEYS.published,
    queryFn: () => galleryService.getPublished(),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer toutes les photos (admin) */
export function useAllGallery(page?: number, size?: number) {
  return useQuery({
    queryKey: [...GALLERY_KEYS.all, { page, size }],
    queryFn: () => galleryService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour creer une photo */
export function useCreateGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGalleryPhotoDTO) => galleryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.all });
    },
  });
}

/** Hook pour mettre a jour une photo */
export function useUpdateGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGalleryPhotoDTO }) =>
      galleryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.all });
    },
  });
}

/** Hook pour supprimer une photo */
export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => galleryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.all });
    },
  });
}
