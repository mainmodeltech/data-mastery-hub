/**
 * Hooks React Query pour les Inscriptions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationService } from '@/services/api';
import type { CreateRegistrationDTO, RegistrationStatus } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';
import {httpClient} from "@/services/httpClient.ts";

export const REGISTRATION_KEYS = {
  all: ['registrations'] as const,
  detail: (id: string) => ['registrations', id] as const,
};

/** Hook pour creer une inscription (public) */
export function useCreateRegistration() {
  return useMutation({
    mutationFn: (data: CreateRegistrationDTO) => registrationService.create(data),
  });
}

/** Hook pour recuperer toutes les inscriptions (admin) */
export function useRegistrations(page?: number, size?: number, status?: RegistrationStatus) {
  return useQuery({
    queryKey: [...REGISTRATION_KEYS.all, { page, size, status }],
    queryFn: () => registrationService.getAll(page, size, status),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour mettre a jour le statut d'une inscription */
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      registrationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRATION_KEYS.all });
    },
  });
}

/** Hook pour supprimer une inscription */
export function useDeleteRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => registrationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGISTRATION_KEYS.all });
    },
  });
}

export function useSessionAvailability(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId, 'availability'],
    queryFn: () => httpClient.get(`/sessions/${sessionId}/availability`),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Rafraîchir toutes les minutes
  });
}
