// src/services/api/promoCodeService.ts
import { httpClient } from '@/services/httpClient';
import {PaginatedResponse} from "@/types";
import {CreatePromoCodeDTO, PromoCode, UpdatePromoCodeDTO} from "@/types/promo-code.type.ts";

const ADMIN_PATH = '/admin/promo-codes'; // ou '/admin/promo-codes' selon votre backend
const BASE_PATH = '/promo-codes'; // ou '/admin/promo-codes' selon votre backend

export const promoCodeService = {
    /** Admin: liste paginée */
    getAll: (page?: number, size?: number) =>
        httpClient.get<PaginatedResponse<PromoCode>>(ADMIN_PATH, { params: { page, size } }),

    /** Admin: détail par ID */
    getById: (id: string) =>
        httpClient.get<PromoCode>(`${ADMIN_PATH}/${id}`),

    /** Admin: création */
    create: (data: CreatePromoCodeDTO) =>
        httpClient.post<PromoCode>(ADMIN_PATH, data),

    /** Admin: mise à jour */
    update: (id: string, data: UpdatePromoCodeDTO) =>
        httpClient.put<PromoCode>(`${ADMIN_PATH}/${id}`, data),

    /** Admin: suppression (soft delete) */
    delete: (id: string) =>
        httpClient.delete<void>(`${ADMIN_PATH}/${id}`),

    /** Admin: activer/désactiver */
    toggleActive: (id: string) =>
        httpClient.patch<PromoCode>(`${ADMIN_PATH}/${id}/toggle`, {}),

    /** Public: vérifier un code */
    validate: (code: string, options?: { signal?: AbortSignal }) =>
        httpClient.get<{ valid: boolean; discountPercent: number; message?: string }>(
            `${ADMIN_PATH}/validate/${code}`,
            { skipAuth: true, ...options }
        ),

    /** Public: vérifier un code */
    check: (code: string, options?: { signal?: AbortSignal }) =>
        httpClient.get<{ valid: boolean; discountPercent: number; message?: string }>(
            `${BASE_PATH}/validate?code=${code}`,
            { skipAuth: true, ...options }
        ),
};
