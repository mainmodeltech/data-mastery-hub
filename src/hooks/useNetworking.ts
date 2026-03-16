/**
 * useNetworking.ts
 * Hooks React Query v5 pour la gestion des Alumni et Projets.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    alumniService,
    projectService,
    type CreateAlumniPayload,
    type UpdateAlumniPayload,
    type CreateProjectPayload,
    type UpdateProjectPayload,
    type ProjectMemberPayload,
} from "@/services/api/networkingService";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const ALUMNI_KEYS = {
    all:    ["alumni"] as const,
    list:   (page: number, size: number) => ["alumni", "list", { page, size }] as const,
    detail: (id: string)                 => ["alumni", id] as const,
};

export const PROJECT_KEYS = {
    all:    ["projects"] as const,
    list:   (page: number, size: number) => ["projects", "list", { page, size }] as const,
    detail: (id: string)                 => ["projects", id] as const,
};

// ─── Alumni hooks ─────────────────────────────────────────────────────────────

export function useAdminAlumni(page: number, size: number) {
    return useQuery({
        queryKey: ALUMNI_KEYS.list(page, size),
        queryFn:  () => alumniService.getAll(page, size),
    });
}

export function useAlumniDetail(id: string | null) {
    return useQuery({
        queryKey: ALUMNI_KEYS.detail(id!),
        queryFn:  () => alumniService.getById(id!),
        enabled:  !!id,
    });
}

export function useCreateAlumni() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAlumniPayload) => alumniService.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ALUMNI_KEYS.all }),
    });
}

export function useUpdateAlumni() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAlumniPayload }) =>
            alumniService.update(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ALUMNI_KEYS.all });
            qc.invalidateQueries({ queryKey: ALUMNI_KEYS.detail(id) });
        },
    });
}

export function useUploadAlumniPhoto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            alumniService.uploadPhoto(id, file),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ALUMNI_KEYS.all });
            qc.invalidateQueries({ queryKey: ALUMNI_KEYS.detail(id) });
        },
    });
}

export function useDeleteAlumni() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => alumniService.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ALUMNI_KEYS.all }),
    });
}

// ─── Projects hooks ───────────────────────────────────────────────────────────

export function useAdminProjects(page: number, size: number) {
    return useQuery({
        queryKey: PROJECT_KEYS.list(page, size),
        queryFn:  () => projectService.getAll(page, size),
    });
}

export function useProjectDetail(id: string | null) {
    return useQuery({
        queryKey: PROJECT_KEYS.detail(id!),
        queryFn:  () => projectService.getById(id!),
        enabled:  !!id,
    });
}

export function useCreateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProjectPayload) => projectService.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all }),
    });
}

export function useUpdateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
            projectService.update(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
        },
    });
}

export function useDeleteProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => projectService.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all }),
    });
}

export function useAddProjectMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: ProjectMemberPayload }) =>
            projectService.addMember(projectId, data),
        onSuccess: (_, { projectId }) => {
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
        },
    });
}

export function useRemoveProjectMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, alumniId }: { projectId: string; alumniId: string }) =>
            projectService.removeMember(projectId, alumniId),
        onSuccess: (_, { projectId }) => {
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
        },
    });
}

export function useUploadProjectCover() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            projectService.uploadCover(id, file),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
        },
    });
}

export function useAddProjectScreenshot() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
                         id,
                         file,
                         caption,
                         displayOrder,
                     }: {
            id: string;
            file: File;
            caption?: string;
            displayOrder?: number;
        }) => projectService.addScreenshot(id, file, caption, displayOrder),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
        },
    });
}

export function useDeleteProjectScreenshot() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, screenshotId }: { projectId: string; screenshotId: string }) =>
            projectService.deleteScreenshot(projectId, screenshotId),
        onSuccess: (_, { projectId }) => {
            qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
        },
    });
}
