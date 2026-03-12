// src/services/bootcampService.ts
// Service PUBLIC — pas d'authentification requise
import { httpClient } from "./httpClient";
import type { Bootcamp, BootcampSession } from "@/types/bootcamp.type";

const BASE = "/bootcamps";

export const bootcampService = {
    // Liste tous les bootcamps publiés avec leur prochaine session
    list: () => httpClient.get<Bootcamp[]>(BASE),

    // Détail d'un bootcamp avec toutes ses sessions
    findById: (id: string) => httpClient.get<Bootcamp>(`${BASE}/${id}`),

    // Sessions publiques d'un bootcamp
    findSessions: (id: string) => httpClient.get<BootcampSession[]>(`${BASE}/${id}/sessions`),
};
