// src/services/adminBootcampService.ts
import { httpClient } from "./httpClient";
import type {
    Bootcamp,
    BootcampSession,
    CreateBootcampPayload,
    UpdateBootcampPayload,
    CreateSessionPayload,
    UpdateSessionPayload,
} from "@/types/bootcamp.type";

const BASE = "/admin/bootcamps";

// ── Bootcamps ─────────────────────────────────────────────────────

export const adminBootcampService = {
    // Liste tous les bootcamps (admin)
    list: () => httpClient.get<Bootcamp[]>(BASE),

    // Détail avec toutes les sessions
    get: (id: string) => httpClient.get<Bootcamp>(`${BASE}/${id}`),

    // Créer
    create: (payload: CreateBootcampPayload) =>
        httpClient.post<Bootcamp>(BASE, payload),

    // Mettre à jour
    update: (id: string, payload: UpdateBootcampPayload) =>
        httpClient.put<Bootcamp>(`${BASE}/${id}`, payload),

    // Supprimer (soft delete)
    delete: (id: string) => httpClient.delete<void>(`${BASE}/${id}`),

    // Toggle publié
    togglePublished: (id: string) =>
        httpClient.patch<Bootcamp>(`${BASE}/${id}/toggle-published`, {}),

    // ── Sessions ──────────────────────────────────────────────────────

    // Liste des sessions d'un bootcamp
    listSessions: (bootcampId: string) =>
        httpClient.get<BootcampSession[]>(`${BASE}/${bootcampId}/sessions`),

    // Détail d'une session
    getSession: (sessionId: string) =>
        httpClient.get<BootcampSession>(`${BASE}/sessions/${sessionId}`),

    // Créer une session
    createSession: (bootcampId: string, payload: CreateSessionPayload) =>
        httpClient.post<BootcampSession>(`${BASE}/${bootcampId}/sessions`, payload),

    // Mettre à jour une session
    updateSession: (sessionId: string, payload: UpdateSessionPayload) =>
        httpClient.put<BootcampSession>(`${BASE}/sessions/${sessionId}`, payload),

    // Supprimer une session
    deleteSession: (sessionId: string) =>
        httpClient.delete<void>(`${BASE}/sessions/${sessionId}`),

    // Toggle "mise en avant"
    toggleSessionFeatured: (sessionId: string) =>
        httpClient.patch<BootcampSession>(
            `${BASE}/sessions/${sessionId}/toggle-featured`,
            {}
        ),
};
