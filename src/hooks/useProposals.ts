import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { proposalService } from "@/services/api/proposalService";
import type { ApproveProposalBody, ProposalBody, ProposalPayload, ProposalStatus } from "@/types/proposal.type";

export const PROPOSAL_KEYS = {
  all: ["program-proposals"] as const,
  mineFormations: ["program-proposals", "mine", "formations"] as const,
  mine: (formationId: string) => ["program-proposals", "mine", formationId] as const,
  list: (status?: ProposalStatus) => ["program-proposals", "list", { status: status ?? null }] as const,
  pending: ["program-proposals", "pending-count"] as const,
  detail: (id: string) => ["program-proposals", "detail", id] as const,
};

export function useProposableFormations(enabled = true) {
  return useQuery({ queryKey: PROPOSAL_KEYS.mineFormations, queryFn: proposalService.myFormations, enabled, staleTime: 30 * 1000 });
}

export function useMyProposal(formationId: string | undefined) {
  return useQuery({
    queryKey: PROPOSAL_KEYS.mine(formationId ?? ""),
    queryFn: () => proposalService.mine(formationId as string),
    enabled: !!formationId,
    staleTime: 0,
    retry: false,
  });
}

/** Après une action du formateur : met à jour la proposition en cache et les listes. */
function useMineMutation<V>(formationId: string, fn: (v: V) => Promise<ProposalPayload>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (saved) => {
      qc.setQueryData(PROPOSAL_KEYS.mine(formationId), saved);
      qc.invalidateQueries({ queryKey: PROPOSAL_KEYS.mineFormations });
      qc.invalidateQueries({ queryKey: PROPOSAL_KEYS.pending });
    },
  });
}

export const useSaveProposal = (formationId: string) => useMineMutation<ProposalBody>(formationId, (b) => proposalService.save(formationId, b));
export const useSubmitProposal = (formationId: string) => useMineMutation<void>(formationId, () => proposalService.submit(formationId));
export const useWithdrawProposal = (formationId: string) => useMineMutation<void>(formationId, () => proposalService.withdraw(formationId));

export function useProposals(status?: ProposalStatus) {
  return useQuery({ queryKey: PROPOSAL_KEYS.list(status), queryFn: () => proposalService.list(status), staleTime: 30 * 1000 });
}

/** Pastille du menu : uniquement pour la pédagogie. */
export function usePendingProposalCount(enabled: boolean) {
  return useQuery({
    queryKey: PROPOSAL_KEYS.pending,
    queryFn: proposalService.pendingCount,
    enabled,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useProposalDetail(id: string | undefined) {
  return useQuery({
    queryKey: PROPOSAL_KEYS.detail(id ?? ""),
    queryFn: () => proposalService.detail(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function useReviewProposal() {
  const qc = useQueryClient();
  const done = () => {
    qc.invalidateQueries({ queryKey: PROPOSAL_KEYS.all });
    qc.invalidateQueries({ queryKey: ["admin", "course-content"] });
  };
  return {
    approve: useMutation({ mutationFn: ({ id, body }: { id: string; body: ApproveProposalBody }) => proposalService.approve(id, body), onSuccess: done }),
    requestChanges: useMutation({ mutationFn: ({ id, comment }: { id: string; comment: string }) => proposalService.requestChanges(id, comment), onSuccess: done }),
    reject: useMutation({ mutationFn: ({ id, comment }: { id: string; comment: string }) => proposalService.reject(id, comment), onSuccess: done }),
  };
}
