import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { masterclassService, type Attendance, type MasterclassPayload } from "@/services/api/masterclassService";

export const MC_KEYS = {
  upcoming: ["masterclass", "upcoming"] as const,
  admin: ["admin", "masterclasses"] as const,
  registrants: (id: string) => ["admin", "masterclasses", id, "registrants"] as const,
};

/** Prochaine masterclass publiée (page publique). */
export function useNextMasterclass() {
  return useQuery({
    queryKey: MC_KEYS.upcoming,
    queryFn: async () => (await masterclassService.upcoming(1))[0] ?? null,
    staleTime: 60 * 1000,
  });
}

export function useAdminMasterclasses() {
  return useQuery({ queryKey: MC_KEYS.admin, queryFn: masterclassService.list, staleTime: 30 * 1000 });
}

export function useSaveMasterclass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: MasterclassPayload }) =>
      id ? masterclassService.update(id, payload) : masterclassService.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MC_KEYS.admin }); qc.invalidateQueries({ queryKey: MC_KEYS.upcoming }); },
  });
}

export function useDeleteMasterclass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => masterclassService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MC_KEYS.admin }); qc.invalidateQueries({ queryKey: MC_KEYS.upcoming }); },
  });
}

export function useMasterclassRegistrants(id: string | undefined) {
  return useQuery({
    queryKey: MC_KEYS.registrants(id ?? ""),
    queryFn: () => masterclassService.registrants(id as string),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useSetAttendance(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, attendance }: { registrationId: string; attendance: Attendance }) => masterclassService.setAttendance(id, registrationId, attendance),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MC_KEYS.registrants(id) }); qc.invalidateQueries({ queryKey: MC_KEYS.admin }); },
  });
}

export function useMessageRegistrants(id: string) {
  return useMutation({ mutationFn: (payload: { subject: string; body: string; audience: "ALL" | "ATTENDED" | "ABSENT" }) => masterclassService.message(id, payload) });
}
