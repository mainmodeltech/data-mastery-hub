/**
 * Hooks React Query pour les Messages de contact.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/api';
import type { CreateContactMessageDTO, ContactMessageStatus } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';
import { useToast } from '@/hooks/use-toast';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const CONTACT_KEYS = {
  all: ['contact-messages'] as const,
  list: (page: number, size: number) => ['contact-messages', 'list', { page, size }] as const,
  detail: (id: string) => ['contact-messages', id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Envoyer un message de contact (public) */
export function useSendContactMessage() {
  return useMutation({
    mutationFn: (data: CreateContactMessageDTO) => contactService.send(data),
  });
}

/**
 * Liste paginée des messages (admin).
 * Retourne { data: ContactMessage[], pagination, isLoading, ... }
 */
export function useContactMessages(page = 0, size = 50) {
  return useQuery({
    queryKey: CONTACT_KEYS.list(page, size),
    queryFn: () => contactService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Mettre à jour le statut d'un message */
export function useUpdateContactStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
        contactService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
      toast({ title: 'Statut mis à jour' });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    },
  });
}

/** Supprimer un message */
export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => contactService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
      toast({ title: 'Message supprimé' });
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' });
    },
  });
}
