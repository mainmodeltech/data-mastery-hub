/**
 * Hooks React Query pour les Temoignages.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialService } from '@/services/api';
import type { CreateTestimonialDTO, UpdateTestimonialDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const TESTIMONIAL_KEYS = {
  all: ['testimonials'] as const,
  published: ['testimonials', 'published'] as const,
  detail: (id: string) => ['testimonials', id] as const,
};

/** Hook pour recuperer les temoignages publies (site public) */
export function usePublishedTestimonials() {
  return useQuery({
    queryKey: TESTIMONIAL_KEYS.published,
    queryFn: () => testimonialService.getPublished(),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer tous les temoignages (admin) */
export function useAllTestimonials(page?: number, size?: number) {
  return useQuery({
    queryKey: [...TESTIMONIAL_KEYS.all, { page, size }],
    queryFn: () => testimonialService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour creer un temoignage */
export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestimonialDTO) => testimonialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
    },
  });
}

/** Hook pour mettre a jour un temoignage */
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestimonialDTO }) =>
      testimonialService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.detail(id) });
    },
  });
}

/** Hook pour supprimer un temoignage */
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testimonialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
    },
  });
}
