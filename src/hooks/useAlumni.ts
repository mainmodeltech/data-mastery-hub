/**
 * Hooks React Query pour les Alumni.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alumniService } from '@/services/api';
import type { CreateAlumniDTO, UpdateAlumniDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const ALUMNI_KEYS = {
  all: ['alumni'] as const,
  published: ['alumni', 'published'] as const,
  detail: (id: string) => ['alumni', id] as const,
};

/** Hook pour recuperer les alumni publies (site public) */
export function usePublishedAlumni() {
  return useQuery({
    queryKey: ALUMNI_KEYS.published,
    queryFn: () => alumniService.getPublished(),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer tous les alumni (admin) */
export function useAllAlumni(page?: number, size?: number) {
  return useQuery({
    queryKey: [...ALUMNI_KEYS.all, { page, size }],
    queryFn: () => alumniService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour creer un alumni */
export function useCreateAlumni() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlumniDTO) => alumniService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUMNI_KEYS.all });
    },
  });
}

/** Hook pour mettre a jour un alumni */
export function useUpdateAlumni() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlumniDTO }) =>
      alumniService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALUMNI_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ALUMNI_KEYS.detail(id) });
    },
  });
}

/** Hook pour supprimer un alumni */
export function useDeleteAlumni() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alumniService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUMNI_KEYS.all });
    },
  });
}
