import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { simulatorAdminService } from "@/services/api/simulatorAdminService";
import type { ItemFilters, ItemRequest } from "@/types/simulator.type";

export const SIM_KEYS = {
  all: ["admin", "simulator"] as const,
  blueprint: ["admin", "simulator", "blueprint"] as const,
  coverage: ["admin", "simulator", "coverage"] as const,
  items: ["admin", "simulator", "items"] as const,
  item: (code: string, version?: number) => ["admin", "simulator", "item", code, version ?? "latest"] as const,
};

export function useSimBlueprint() {
  return useQuery({ queryKey: SIM_KEYS.blueprint, queryFn: simulatorAdminService.blueprint, staleTime: 5 * 60 * 1000 });
}

export function useSimCoverage() {
  return useQuery({ queryKey: SIM_KEYS.coverage, queryFn: simulatorAdminService.coverage });
}

export function useSimItems(filters: ItemFilters, page: number) {
  return useQuery({
    queryKey: [...SIM_KEYS.items, filters, page],
    queryFn: () => simulatorAdminService.search(filters, page),
    placeholderData: (prev) => prev,
    staleTime: 0,
  });
}

export function useSimItem(code: string | null, version?: number) {
  return useQuery({
    queryKey: SIM_KEYS.item(code ?? "", version),
    queryFn: () => simulatorAdminService.get(code as string, version),
    enabled: !!code,
    staleTime: 0,
  });
}

/** Toute écriture rafraîchit la liste, la couverture et les fiches ouvertes. */
function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: SIM_KEYS.all });
}

export function useCreateSimItem() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (body: ItemRequest) => simulatorAdminService.create(body), onSuccess: refresh });
}

export function useUpdateSimItem() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (a: { code: string; version: number; body: ItemRequest }) => simulatorAdminService.update(a.code, a.version, a.body),
    onSuccess: refresh,
  });
}

export function useSimWorkflow() {
  const refresh = useRefresh();
  const onSuccess = refresh;
  return {
    newVersion: useMutation({ mutationFn: (code: string) => simulatorAdminService.newVersion(code), onSuccess }),
    submit: useMutation({ mutationFn: (a: { code: string; version: number }) => simulatorAdminService.submit(a.code, a.version), onSuccess }),
    review: useMutation({
      mutationFn: (a: { code: string; version: number; approve: boolean; verified: boolean; note?: string }) =>
        simulatorAdminService.review(a.code, a.version, { approve: a.approve, verified: a.verified, note: a.note }),
      onSuccess,
    }),
    publish: useMutation({ mutationFn: (a: { code: string; version: number }) => simulatorAdminService.publish(a.code, a.version), onSuccess }),
    retire: useMutation({
      mutationFn: (a: { code: string; version: number; reason: string }) => simulatorAdminService.retire(a.code, a.version, a.reason),
      onSuccess,
    }),
    deleteDraft: useMutation({ mutationFn: (a: { code: string; version: number }) => simulatorAdminService.deleteDraft(a.code, a.version), onSuccess }),
    importItems: useMutation({ mutationFn: (items: ItemRequest[]) => simulatorAdminService.importItems(items), onSuccess }),
  };
}
