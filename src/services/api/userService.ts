import { httpClient } from '@/services/httpClient';
import type { AdminUser, CreateUserDTO, UpdateUserDTO, ApiResponse } from '@/types';

const ADMIN_PATH = '/admin/users';

/** Structure retournee par ApiResponse.page() cote backend */
interface PagedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const userService = {
  getAll: (page?: number, size?: number) =>
    httpClient.get<PagedApiResponse<AdminUser>>(ADMIN_PATH, {
      params: { page, size },
    }),

  getById: (id: string) =>
    httpClient.get<ApiResponse<AdminUser>>(`${ADMIN_PATH}/${id}`),

  create: (data: CreateUserDTO) =>
    httpClient.post<ApiResponse<AdminUser>>(ADMIN_PATH, data),

  update: (id: string, data: UpdateUserDTO) =>
    httpClient.put<ApiResponse<AdminUser>>(`${ADMIN_PATH}/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<void>(`${ADMIN_PATH}/${id}`),

  regenerateCredentials: (id: string) =>
    httpClient.post<ApiResponse<void>>(`${ADMIN_PATH}/${id}/regenerate-credentials`),
};
