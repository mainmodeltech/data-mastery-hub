// src/services/masterclassAdminService.ts

import { httpClient } from "@/services/httpClient";
import {ApiResponse, MasterclassRegistration, MasterclassRegistrationsPage} from "@/types";

const ADMIN_PATH = "/admin/masterclass";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Service ──────────────────────────────────────────────────────────────────

export const masterclassAdminService = {
    getRegistrations: async (
        masterclassId: string,
        page = 0,
        size = 20,
    ): Promise<MasterclassRegistrationsPage> => {
        const res = await httpClient.get<ApiResponse<MasterclassRegistration[]>>(
            `${ADMIN_PATH}/${masterclassId}/registrations`,
            { params: { page, size } },
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
