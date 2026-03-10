// src/hooks/useTestimonials.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { testimonialService } from '@/services/api/testimonialService';
import type { TestimonialRequest } from '@/types/testimonial.types';
import { QUERY_CONFIG } from '@/config/constants';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const TESTIMONIAL_KEYS = {
  all:       ['testimonials', 'admin'] as const,
  lists:     () => [...TESTIMONIAL_KEYS.all, 'list'] as const,
  published: ['testimonials', 'public', 'published'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Témoignages publiés — utilisé sur la landing page et la page Alumni (public) */
export function usePublishedTestimonials() {
  return useQuery({
    queryKey: TESTIMONIAL_KEYS.published,
    queryFn:  testimonialService.getPublished,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Liste de tous les témoignages (admin) */
export function useAdminTestimonials() {
  return useQuery({
    queryKey: TESTIMONIAL_KEYS.lists(),
    queryFn:  testimonialService.getAll,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Créer un témoignage */
export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: TestimonialRequest) => testimonialService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
      toast({ title: 'Témoignage créé avec succès' });
    },
    onError: () => toast({ title: 'Erreur lors de la création', variant: 'destructive' }),
  });
}

/** Mettre à jour un témoignage */
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TestimonialRequest }) =>
        testimonialService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
      toast({ title: 'Témoignage mis à jour' });
    },
    onError: () => toast({ title: 'Erreur lors de la mise à jour', variant: 'destructive' }),
  });
}

/** Supprimer un témoignage (soft-delete) */
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => testimonialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
      toast({ title: 'Témoignage supprimé' });
    },
    onError: () => toast({ title: 'Erreur lors de la suppression', variant: 'destructive' }),
  });
}

/** Basculer la visibilité d'un témoignage */
export function useToggleTestimonialPublished() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => testimonialService.togglePublished(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: TESTIMONIAL_KEYS.all });
      toast({
        title: updated.published ? 'Témoignage publié' : 'Témoignage masqué',
      });
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  });
}
