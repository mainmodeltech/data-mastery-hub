/**
 * Hooks React Query pour les References.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referenceService } from '@/services/api';
import type { CreateReferenceDTO, UpdateReferenceDTO, ReferenceCategory } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const REFERENCE_KEYS = {
  all: ['references'] as const,
  published: (category?: ReferenceCategory) => ['references', 'published', category] as const,
  detail: (id: string) => ['references', id] as const,
};

/** Hook pour recuperer les references publiees (site public) */
export function usePublishedReferences(category?: ReferenceCategory) {
  return useQuery({
    queryKey: REFERENCE_KEYS.published(category),
    queryFn: () => referenceService.getPublished(category),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer toutes les references (admin) */
export function useAllReferences(page?: number, size?: number) {
  return useQuery({
    queryKey: [...REFERENCE_KEYS.all, { page, size }],
    queryFn: () => referenceService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour creer une reference */
export function useCreateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReferenceDTO) => referenceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERENCE_KEYS.all });
    },
  });
}

/** Hook pour mettre a jour une reference */
export function useUpdateReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReferenceDTO }) =>
      referenceService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: REFERENCE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REFERENCE_KEYS.detail(id) });
    },
  });
}

/** Hook pour supprimer une reference */
export function useDeleteReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => referenceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERENCE_KEYS.all });
    },
  });
}
