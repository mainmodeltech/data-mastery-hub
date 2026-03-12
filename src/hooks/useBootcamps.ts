/**
 * Hooks React Query pour les Bootcamps.
 * Separe les concerns : les composants n'ont plus besoin de connaitre
 * la source de donnees.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bootcampService } from '@/services/api';
import type { Bootcamp, CreateBootcampDTO, UpdateBootcampDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

/** Cles de cache React Query */
export const BOOTCAMP_KEYS = {
  all: ['bootcamps'] as const,
  published: ['bootcamps', 'published'] as const,
  detail: (id: string) => ['bootcamps', id] as const,
};

/** Hook pour recuperer les bootcamps publies (site public) - renvoie Bootcamp[] */
export function usePublishedBootcamps() {
  return useQuery({
    queryKey: BOOTCAMP_KEYS.published,
    queryFn: async (): Promise<Bootcamp[]> => {
      const page = await bootcampService.getPublished();
      return page.content;
    },
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer tous les bootcamps (admin) - renvoie PaginatedResponse */
export function useBootcamps(page = 0, size = 20) {
  return useQuery({
    queryKey: [...BOOTCAMP_KEYS.all, { page, size }],
    queryFn: () => bootcampService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour recuperer un bootcamp par ID */
export function useBootcamp(id: string) {
  return useQuery({
    queryKey: BOOTCAMP_KEYS.detail(id),
    queryFn: () => bootcampService.getById(id),
    enabled: !!id,
  });
}

/** Hook pour creer un bootcamp */
export function useCreateBootcamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBootcampDTO) => bootcampService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.published });
    },
  });
}

/** Hook pour mettre a jour un bootcamp */
export function useUpdateBootcamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBootcampDTO }) =>
      bootcampService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.published });
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.detail(id) });
    },
  });
}

/** Hook pour supprimer un bootcamp */
export function useDeleteBootcamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bootcampService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOTCAMP_KEYS.published });
    },
  });
}
