// src/hooks/useMasterclassRegistrations.ts

import { useQuery } from "@tanstack/react-query";
import { masterclassAdminService } from "@/services/api/masterclassAdminService";
import { QUERY_CONFIG } from "@/config/constants";

export const MASTERCLASS_KEYS = {
    registrations: (id: string, page: number, size: number) =>
        ["masterclass", "admin", id, "registrations", { page, size }] as const,
};

export function useMasterclassRegistrations(
    masterclassId: string,
    page: number,
    size: number,
) {
    return useQuery({
        queryKey: MASTERCLASS_KEYS.registrations(masterclassId, page, size),
        queryFn: () =>
            masterclassAdminService.getRegistrations(masterclassId, page, size),
        staleTime: QUERY_CONFIG.staleTime,
        placeholderData: (prev) => prev, // garde les données précédentes pendant le chargement de la nouvelle page
    });
}
