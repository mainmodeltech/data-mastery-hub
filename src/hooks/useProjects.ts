/**
 * Hooks React Query pour les Projets.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/api';
import type { CreateProjectDTO, UpdateProjectDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const PROJECT_KEYS = {
  all: ['projects'] as const,
  published: ['projects', 'published'] as const,
  detail: (id: string) => ['projects', id] as const,
};

/** Hook pour recuperer les projets publies avec membres et screenshots (site public) */
export function usePublishedProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.published,
    queryFn: () => projectService.getPublished(),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });
}

/** Hook pour recuperer tous les projets (admin) */
export function useProjects(page?: number, size?: number) {
  return useQuery({
    queryKey: [...PROJECT_KEYS.all, { page, size }],
    queryFn: () => projectService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Hook pour recuperer un projet par ID */
export function useProject(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

/** Hook pour creer un projet */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
}

/** Hook pour mettre a jour un projet */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDTO }) =>
      projectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
    },
  });
}

/** Hook pour supprimer un projet */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
}

/** Hook pour ajouter un membre a un projet */
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, alumniId, role }: { projectId: string; alumniId: string; role?: string }) =>
      projectService.addMember(projectId, alumniId, role),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
}

/** Hook pour retirer un membre d'un projet */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      projectService.removeMember(projectId, memberId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
}

/** Hook pour ajouter une capture d'ecran */
export function useAddProjectScreenshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, photoUrl, caption }: { projectId: string; photoUrl: string; caption?: string }) =>
      projectService.addScreenshot(projectId, photoUrl, caption),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
    },
  });
}

/** Hook pour supprimer une capture d'ecran */
export function useRemoveProjectScreenshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, screenshotId }: { projectId: string; screenshotId: string }) =>
      projectService.removeScreenshot(projectId, screenshotId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
    },
  });
}
