import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/api';
import type { CreateRoleDTO, UpdateRoleDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const ROLE_KEYS = {
  all: ['roles'] as const,
  detail: (id: string) => ['roles', id] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: ROLE_KEYS.all,
    queryFn: roleService.getAll,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDTO) => roleService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDTO }) =>
      roleService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}
