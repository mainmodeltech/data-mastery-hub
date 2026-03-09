// src/hooks/usePromoCodes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promoCodeService } from '@/services/api';
import { QUERY_CONFIG } from '@/config/constants';
import {CreatePromoCodeDTO, UpdatePromoCodeDTO} from "@/types/promo-code.type.ts";

export const PROMO_CODE_KEYS = {
    all: ['promoCodes'] as const,
    lists: () => [...PROMO_CODE_KEYS.all, 'list'] as const,
    list: (filters: { page?: number; size?: number }) =>
        [...PROMO_CODE_KEYS.lists(), filters] as const,
    details: () => [...PROMO_CODE_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PROMO_CODE_KEYS.details(), id] as const,
};

/** Admin: liste paginée */
export function usePromoCodes(page = 0, size = 20) {
    return useQuery({
        queryKey: PROMO_CODE_KEYS.list({ page, size }),
        queryFn: () => promoCodeService.getAll(page, size),
        staleTime: QUERY_CONFIG.staleTime,
    });
}

/** Admin: détail par ID */
export function usePromoCodeDetail(id: string) {
    return useQuery({
        queryKey: PROMO_CODE_KEYS.detail(id),
        queryFn: () => promoCodeService.getById(id),
        enabled: !!id,
    });
}

/** Mutation: créer */
export function useCreatePromoCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePromoCodeDTO) => promoCodeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROMO_CODE_KEYS.lists() });
        },
    });
}

/** Mutation: mettre à jour */
export function useUpdatePromoCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePromoCodeDTO }) =>
            promoCodeService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: PROMO_CODE_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: PROMO_CODE_KEYS.detail(id) });
        },
    });
}

/** Mutation: supprimer */
export function useDeletePromoCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => promoCodeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROMO_CODE_KEYS.lists() });
        },
    });
}

/** Mutation: activer/désactiver */
export function useTogglePromoCodeActive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => promoCodeService.toggleActive(id),
        onSuccess: (updatedCode) => {
            queryClient.invalidateQueries({ queryKey: PROMO_CODE_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: PROMO_CODE_KEYS.detail(updatedCode.id) });
        },
    });
}


