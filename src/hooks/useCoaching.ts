import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { coachingAdminService, coachingPublicService } from "@/services/api/coachingService";
import type { CoachingRequestForm, CoachingReviewUpdate, CoachingStatus, CoachingValidatePayload } from "@/types/coaching.type";
import type { DeclareRequest } from "@/types/simulatorShop.type";

// ── Public ──────────────────────────────────────────────────────────────

export function useSendCoachingRequest() {
  return useMutation({ mutationFn: (body: CoachingRequestForm) => coachingPublicService.request(body) });
}

const payKey = (token: string) => ["coaching", "pay", token] as const;

export function useCoachingPayment(token: string | undefined) {
  return useQuery({ queryKey: payKey(token ?? ""), queryFn: () => coachingPublicService.view(token as string), enabled: !!token, retry: false });
}

export function useAcceptCoachingTerms(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documents: string[]) => coachingPublicService.acceptTerms(token, documents),
    onSuccess: () => qc.invalidateQueries({ queryKey: payKey(token) }),
  });
}

export function useStartCoachingOnline(token: string) {
  return useMutation({ mutationFn: () => coachingPublicService.startOnline(token) });
}

export function useDeclareCoachingPayment(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DeclareRequest) => coachingPublicService.declare(token, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: payKey(token) }),
  });
}

export function useUploadCoachingProof(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => coachingPublicService.uploadProof(token, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: payKey(token) }),
  });
}

/** Suit une tentative de paiement en ligne : relancé toutes les 3 s tant qu'elle est en attente, puis rafraîchit la page quand elle aboutit. */
export function useCoachingCheckout(token: string, ref: string | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["coaching", "checkout", ref],
    queryFn: async () => {
      const view = await coachingPublicService.checkout(ref as string);
      if (view.status === "PAID") qc.invalidateQueries({ queryKey: payKey(token) });
      return view;
    },
    enabled: !!ref,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" && query.state.dataUpdateCount < 60 ? 3000 : false),
  });
}

// ── Administration ──────────────────────────────────────────────────────

const ADMIN_KEYS = { all: ["admin", "coaching"] as const, summary: ["admin", "coaching", "summary"] as const };

export function useCoachingRequests(status: CoachingStatus | undefined, page: number) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.all, "list", status ?? "all", page],
    queryFn: () => coachingAdminService.list(status, page),
    placeholderData: (prev) => prev,
    staleTime: 0,
  });
}

/** La fiche reste ouverte quand la demande change de statut (elle sort alors de l'onglet filtré de la liste). */
export function useCoachingRequest(id: string | null) {
  return useQuery({ queryKey: [...ADMIN_KEYS.all, "detail", id], queryFn: () => coachingAdminService.get(id as string), enabled: !!id, staleTime: 0 });
}

export function useCoachingSummary() {
  return useQuery({ queryKey: ADMIN_KEYS.summary, queryFn: coachingAdminService.summary, staleTime: 0 });
}

/** Toute action de l'équipe rafraîchit la liste, les compteurs et les pastilles du menu. */
function useAdminMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.all }) });
}

export const useTakeCoaching = () => useAdminMutation((id: string) => coachingAdminService.take(id));
export const useUpdateCoaching = () => useAdminMutation(({ id, body }: { id: string; body: CoachingReviewUpdate }) => coachingAdminService.update(id, body));
export const useValidateCoaching = () => useAdminMutation(({ id, body }: { id: string; body: CoachingValidatePayload }) => coachingAdminService.validate(id, body));
export const useDeclineCoaching = () => useAdminMutation(({ id, reason }: { id: string; reason: string }) => coachingAdminService.decline(id, reason));
export const useCancelCoaching = () => useAdminMutation(({ id, reason }: { id: string; reason: string }) => coachingAdminService.cancel(id, reason));
export const useResendCoachingLink = () => useAdminMutation((id: string) => coachingAdminService.resendLink(id));
export const useConfirmCoachingPayment = () => useAdminMutation((id: string) => coachingAdminService.confirmPayment(id));
export const useRejectCoachingPayment = () => useAdminMutation(({ id, reason }: { id: string; reason: string }) => coachingAdminService.rejectPayment(id, reason));

export function useCoachingProof() {
  return useMutation({ mutationFn: (id: string) => coachingAdminService.proof(id) });
}
