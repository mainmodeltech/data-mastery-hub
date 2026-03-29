import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api';
import type { CreateUserDTO, UpdateUserDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const USER_KEYS = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
};

export function useUsers(page = 0, size = 20) {
  return useQuery({
    queryKey: [...USER_KEYS.all, { page, size }],
    queryFn: () => userService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDTO) => userService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      userService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useRegenerateCredentials() {
  return useMutation({
    mutationFn: (id: string) => userService.regenerateCredentials(id),
  });
}
