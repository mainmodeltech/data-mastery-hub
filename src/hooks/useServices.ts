/**
 * Hooks React Query pour les Services.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/api';
import type { CreateServiceDTO, UpdateServiceDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const SERVICE_KEYS = {
  all: ['services'] as const,
  published: ['services', 'published'] as const,
  detail: (id: string) => ['services', id] as const,
};

/** Hook pour recuperer les services publies (liste plate, triee par displayOrder) */
export function usePublishedServices() {
  return useQuery({
    queryKey: SERVICE_KEYS.published,
    queryFn: () => serviceService.getPublished(),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer tous les services (admin, pagine) */
export function useAllServices(page = 0, size = 20) {
  return useQuery({
    queryKey: [...SERVICE_KEYS.all, { page, size }],
    queryFn: () => serviceService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour creer un service */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDTO) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.published });
    },
  });
}

/** Hook pour mettre a jour un service */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDTO }) =>
      serviceService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.published });
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.detail(id) });
    },
  });
}

/** Hook pour supprimer un service */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.published });
    },
  });
}
