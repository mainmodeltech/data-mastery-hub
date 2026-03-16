/**
 * networkingService.ts
 * Service API pour la gestion des Alumni et des Projets.
 * Toutes les routes admin nécessitent un JWT (httpClient l'injecte automatiquement).
 */

import { httpClient } from "@/services/httpClient";
import type { PaginatedResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlumniSummary {
    id: string;
    name: string;
    currentTitle: string | null;
    currentPosition: string | null;
    linkedinUrl: string | null;
    photoUrl: string | null;
    cohort: string | null;
    bootcampTitle: string | null;
    published: boolean;
}

export interface AlumniDetail extends AlumniSummary {
    registrationId: string | null;
    email: string | null;
    phone: string | null;
    year: number | null;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMemberResponse {
    id: string;
    alumni: AlumniSummary;
    role: string | null;
    displayOrder: number;
}

export interface ProjectScreenshotResponse {
    id: string;
    photoUrl: string;
    caption: string | null;
    displayOrder: number;
}

export interface ProjectResponse {
    id: string;
    title: string;
    description: string | null;
    toolsTechnologies: string[];
    accessLink: string | null;
    coverImageUrl: string | null;
    cohort: string | null;
    year: number | null;
    published: boolean;
    displayOrder: number;
    members: ProjectMemberResponse[];
    screenshots: ProjectScreenshotResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectSummary
    extends Omit<ProjectResponse, "screenshots" | "createdAt" | "updatedAt"> {}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateAlumniPayload {
    name: string;
    email?: string | null;
    phone?: string | null;
    currentTitle?: string | null;
    currentPosition?: string | null;
    linkedinUrl?: string | null;
    cohort?: string | null;
    year?: number | null;
    photoUrl?: string | null;
    bootcampTitle?: string | null;
    registrationId?: string | null;
    published: boolean;
    displayOrder: number;
}

export type UpdateAlumniPayload = Partial<CreateAlumniPayload>;

export interface ProjectMemberPayload {
    alumniId: string;
    role?: string | null;
    displayOrder?: number;
}

export interface CreateProjectPayload {
    title: string;
    description?: string | null;
    toolsTechnologies?: string[];
    accessLink?: string | null;
    cohort?: string | null;
    year?: number | null;
    published: boolean;
    coverImageUrl?: string | null;
    displayOrder: number;
    members: ProjectMemberPayload[];   // au moins 1 requis
}

export type UpdateProjectPayload = Omit<Partial<CreateProjectPayload>, "members">;

// ─── Paths ────────────────────────────────────────────────────────────────────

const ADMIN_ALUMNI   = "/admin/alumni";
const ADMIN_PROJECTS = "/admin/projects";
const PUB_ALUMNI     = "/alumni";
const PUB_PROJECTS   = "/projects";

// ─── Alumni service ───────────────────────────────────────────────────────────

export const alumniService = {

    // Admin
    getAll: (page = 0, size = 20) =>
        httpClient.get<PaginatedResponse<AlumniDetail>>(ADMIN_ALUMNI, {
            params: { page, size, sort: "displayOrder" },
        }),

    getById: (id: string) =>
        httpClient.get<AlumniDetail>(`${ADMIN_ALUMNI}/${id}`),

    create: (data: CreateAlumniPayload) =>
        httpClient.post<AlumniDetail>(ADMIN_ALUMNI, data),

    update: (id: string, data: UpdateAlumniPayload) =>
        httpClient.put<AlumniDetail>(`${ADMIN_ALUMNI}/${id}`, data),

    uploadPhoto: (id: string, file: File) => {
        const form = new FormData();
        form.append("file", file);
        return httpClient.post<AlumniDetail>(`${ADMIN_ALUMNI}/${id}/photo`, form);
    },

    delete: (id: string) =>
        httpClient.delete<void>(`${ADMIN_ALUMNI}/${id}`),

    // Public (pour les sélecteurs dans ProjectForm)
    getAllPublished: () =>
        httpClient.get<AlumniSummary[]>(PUB_ALUMNI, { skipAuth: true }),
};

// ─── Projects service ─────────────────────────────────────────────────────────

export const projectService = {

    // Admin
    getAll: (page = 0, size = 10) =>
        httpClient.get<PaginatedResponse<ProjectResponse>>(ADMIN_PROJECTS, {
            params: { page, size, sort: "displayOrder" },
        }),

    getById: (id: string) =>
        httpClient.get<ProjectResponse>(`${ADMIN_PROJECTS}/${id}`),

    create: (data: CreateProjectPayload) =>
        httpClient.post<ProjectResponse>(ADMIN_PROJECTS, data),

    update: (id: string, data: UpdateProjectPayload) =>
        httpClient.put<ProjectResponse>(`${ADMIN_PROJECTS}/${id}`, data),

    delete: (id: string) =>
        httpClient.delete<void>(`${ADMIN_PROJECTS}/${id}`),

    // Membres
    addMember: (projectId: string, data: ProjectMemberPayload) =>
        httpClient.post<ProjectResponse>(`${ADMIN_PROJECTS}/${projectId}/members`, data),

    removeMember: (projectId: string, alumniId: string) =>
        httpClient.delete<ProjectResponse>(
            `${ADMIN_PROJECTS}/${projectId}/members/${alumniId}`
        ),

    // Cover image
    uploadCover: (id: string, file: File) => {
        const form = new FormData();
        form.append("file", file);
        return httpClient.post<ProjectResponse>(`${ADMIN_PROJECTS}/${id}/cover`, form);
    },

    // Screenshots
    addScreenshot: (id: string, file: File, caption?: string, displayOrder = 0) => {
        const form = new FormData();
        form.append("file", file);
        if (caption) form.append("caption", caption);
        form.append("displayOrder", String(displayOrder));
        return httpClient.post<ProjectScreenshotResponse>(
            `${ADMIN_PROJECTS}/${id}/screenshots`,
            form
        );
    },

    deleteScreenshot: (projectId: string, screenshotId: string) =>
        httpClient.delete<void>(
            `${ADMIN_PROJECTS}/${projectId}/screenshots/${screenshotId}`
        ),

    // Public
    getAllPublished: () =>
        httpClient.get<ProjectSummary[]>(PUB_PROJECTS, { skipAuth: true }),

    getPublishedById: (id: string) =>
        httpClient.get<ProjectResponse>(`${PUB_PROJECTS}/${id}`, { skipAuth: true }),
};
