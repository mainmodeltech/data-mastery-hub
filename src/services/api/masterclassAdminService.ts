// src/services/api/masterclassAdminService.ts

import { httpClient } from "@/services/httpClient";
import { ApiResponse, MasterclassRegistration, MasterclassRegistrationsPage } from "@/types";

const ADMIN_PATH = "/admin/masterclass";

export const masterclassAdminService = {
    getRegistrations: async (
        masterclassId: string,
        page = 0,
        size = 10,
    ): Promise<MasterclassRegistrationsPage> => {
        // ✅ Paramètres injectés directement dans l'URL — fetch natif ne supporte pas "params"
        const res = await httpClient.get<ApiResponse<MasterclassRegistration[]>>(
            `${ADMIN_PATH}/${masterclassId}/registrations?page=${page}&size=${size}`,
        );
        return {
            items: res.data ?? [],
            pagination: res.pagination ?? {
                page,
                size,
                totalElements: res.data?.length ?? 0,
                totalPages: 1,
            },
        };
    },

    getCount: async (masterclassId: string): Promise<number> => {
        const res = await httpClient.get<ApiResponse<number>>(
            `${ADMIN_PATH}/${masterclassId}/count`,
        );
        return res.data ?? 0;
    },
};
