/**
 * Service API pour les Projets.
 * Projets = realisations des alumni lors du Demo Day.
 * Chaque projet inclut : description, captures, technologies, membres, temoignages, lien public.
 */

import { httpClient } from '@/services/httpClient';
import type {
  Project,
  ProjectMember,
  ProjectScreenshot,
  CreateProjectDTO,
  UpdateProjectDTO,
  PaginatedResponse,
} from '@/types';

const BASE_PATH = '/projects';

export const projectService = {
  // ============================================================
  // Projets
  // ============================================================

  /** Recuperer les projets publies avec membres et screenshots (site public) */
  getPublished: () =>
    httpClient.get<Project[]>(`${BASE_PATH}/published`),

  /** Recuperer tous les projets (admin) */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Project>>(BASE_PATH, {
      params: { page, size },
    }),

  /** Recuperer un projet par ID avec ses relations */
  getById: (id: string) =>
    httpClient.get<Project>(`${BASE_PATH}/${id}`),

  /** Creer un projet (admin) */
  create: (data: CreateProjectDTO) =>
    httpClient.post<Project>(BASE_PATH, data),

  /** Mettre a jour un projet (admin) */
  update: (id: string, data: UpdateProjectDTO) =>
    httpClient.put<Project>(`${BASE_PATH}/${id}`, data),

  /** Supprimer un projet (admin) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),

  // ============================================================
  // Membres du projet
  // ============================================================

  /** Ajouter un membre au projet */
  addMember: (projectId: string, alumniId: string, role?: string) =>
    httpClient.post<ProjectMember>(`${BASE_PATH}/${projectId}/members`, {
      alumniId,
      role,
    }),

  /** Retirer un membre du projet */
  removeMember: (projectId: string, memberId: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${projectId}/members/${memberId}`),

  // ============================================================
  // Captures d'ecran du projet
  // ============================================================

  /** Ajouter une capture d'ecran */
  addScreenshot: (projectId: string, photoUrl: string, caption?: string) =>
    httpClient.post<ProjectScreenshot>(`${BASE_PATH}/${projectId}/screenshots`, {
      photoUrl,
      caption,
    }),

  /** Supprimer une capture d'ecran */
  removeScreenshot: (projectId: string, screenshotId: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${projectId}/screenshots/${screenshotId}`),
};
