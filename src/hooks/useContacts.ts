/**
 * Hooks React Query pour les Messages de contact.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/api';
import type {CreateContactMessageDTO, ContactMessageStatus, ContactMessage} from '@/types';
import { QUERY_CONFIG } from '@/config/constants';
import {useToast} from "@/hooks/use-toast.ts";


export const CONTACT_KEYS = {
  all: ['contact-messages'] as const,
  detail: (id: string) => ['contact-messages', id] as const,
};

/** Hook pour envoyer un message de contact (public) */
export function useSendContactMessage() {
  return useMutation({
    mutationFn: (data: CreateContactMessageDTO) => contactService.send(data),
  });
}

/** Hook pour recuperer tous les messages (admin) */
// export function useContactMessages(page?: number, size?: number, status?: ContactMessageStatus) {
//   return useQuery({
//     queryKey: [...CONTACT_KEYS.all, { page, size, status }],
//     queryFn: () => contactService.getAll(page, size, status),
//     staleTime: QUERY_CONFIG.staleTime,
//   });
// }

export function useContactMessages() {
  return useQuery({
    queryKey: MESSAGE_KEYS.all,
    queryFn: async () => {
      const response = await contactService.getAll();
      // Si ton backend renvoie un Page<T>, on déballe ici
      return Array.isArray(response) ? response : response.content;
    },
  });
}

/** Hook pour mettre a jour le statut d'un message */
export function useUpdateContactStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ContactMessageStatus; notes?: string }) =>
      contactService.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
    },
  });
}

export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
        contactService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  });
}

/** Hook pour supprimer un message */
export function useDeleteContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.all });
    },
  });
}

export const MESSAGE_KEYS = {
  all: ['contact-messages'] as const,
};
