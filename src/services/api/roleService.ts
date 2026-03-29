import { httpClient } from '@/services/httpClient';
import type { AdminRole, CreateRoleDTO, UpdateRoleDTO, ApiResponse } from '@/types';

const ADMIN_PATH = '/admin/roles';

export const roleService = {
  getAll: () =>
    httpClient.get<ApiResponse<AdminRole[]>>(ADMIN_PATH),

  getById: (id: string) =>
    httpClient.get<ApiResponse<AdminRole>>(`${ADMIN_PATH}/${id}`),

  create: (data: CreateRoleDTO) =>
    httpClient.post<ApiResponse<AdminRole>>(ADMIN_PATH, data),

  update: (id: string, data: UpdateRoleDTO) =>
    httpClient.put<ApiResponse<AdminRole>>(`${ADMIN_PATH}/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/${id}`),
};
